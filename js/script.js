// NASA API Key
const NASA_API_KEY = 'pGcCCBDnKtdCfBKBQjfJDwCLDRfLgj8kMTJwwWHg';

// Global variables for modal navigation
let currentImages = [];
let currentImageIndex = 0;

// Wait for the page to load, then set everything up
document.addEventListener('DOMContentLoaded', () => {
  // Get HTML elements from the page
  const startInput = document.getElementById('startDate');
  const endInput = document.getElementById('endDate');
  const button = document.querySelector('button');
  const gallery = document.getElementById('gallery');
  const modal = document.getElementById('imageModal');
  const closeBtn = document.querySelector('.modal-close');

  console.log('Page loaded. Elements found:', { startInput, endInput, button, gallery });

  // Set up the date inputs with valid ranges
  setupDateInputs(startInput, endInput);

  // When the button is clicked, fetch and display the images
  button.addEventListener('click', () => {
    console.log('Button clicked!');
    const startDate = startInput.value;
    const endDate = endInput.value;

    // Make sure both dates are selected
    if (!startDate || !endDate) {
      gallery.innerHTML = `
        <div class="error-container">
          <p class="error-title">📅 Date Selection Required</p>
          <p class="error-message">Please select both a start date and an end date to explore the cosmos!</p>
        </div>
      `;
      return;
    }

    // Validate that start date is not after end date
    if (startDate > endDate) {
      gallery.innerHTML = `
        <div class="error-container">
          <p class="error-title">⚠️ Invalid Date Range</p>
          <p class="error-message">Your start date cannot be after your end date. Please check your dates and try again.</p>
        </div>
      `;
      return;
    }

    // Validate that end date is not in the future
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
    
    if (end > today) {
      gallery.innerHTML = `
        <div class="error-container">
          <p class="error-title">🚀 Future Dates Not Available</p>
          <p class="error-message">The date range you selected includes dates in the future.</p>
          <p class="error-subtext">💡 Tip: Keep looking ahead, we just don't have those sky images yet</p>
        </div>
      `;
      return;
    }

    const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
    
    // Warn if date range is too large (more than 1 year)
    if (daysDiff > 365) {
      console.warn('Large date range selected:', daysDiff, 'days');
    }

    console.log(`Fetching images from ${startDate} to ${endDate}`);
    // Fetch the images from NASA's API
    fetchAPODImages(startDate, endDate, gallery);
  });

  // Set up modal controls
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Close modal when clicking outside the content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal.classList.remove('active');
    }
    // Navigate with arrow keys
    if (e.key === 'ArrowLeft') {
      previousImage();
    }
    if (e.key === 'ArrowRight') {
      nextImage();
    }
  });
});

// Fetch APOD images from NASA's WordPress API with pagination for historical data
async function fetchAPODImages(startDate, endDate, gallery) {
  try {
    // Show a loading message with black hole animation
    gallery.innerHTML = `
      <div class="loading-container">
        <div class="galaxy-animation">
          <div class="galaxy-center"></div>
        </div>
        <p class="loading-message">🔭 Exploring the galaxies...</p>
        <p class="loading-subtext">Searching through cosmic archives for stunning images</p>
      </div>
    `;

    console.log(`Fetching APOD images from ${startDate} to ${endDate}`);

    // Fetch all available APOD images with pagination
    let allImages = [];
    let page = 1;
    let hasMore = true;
    let fetchError = null;

    while (hasMore) {
      const url = `https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=100&page=${page}`;
      console.log(`Fetching page ${page}...`);

      try {
        const response = await fetch(url);

        if (!response.ok) {
          // Handle specific HTTP errors
          if (response.status === 503) {
            fetchError = 'Service Unavailable: The NASA API is currently unavailable. Please try again later.';
          } else if (response.status === 429) {
            fetchError = 'Too Many Requests: The API rate limit has been reached. Please wait a few minutes and try again.';
          } else if (response.status === 404) {
            fetchError = 'Not Found: The NASA API endpoint could not be found.';
          } else if (response.status >= 500) {
            fetchError = `Server Error (${response.status}): The NASA servers are experiencing issues. Please try again later.`;
          } else {
            fetchError = `API Error ${response.status}: ${response.statusText}`;
          }
          throw new Error(fetchError);
        }

        const images = await response.json();

        if (!images || images.length === 0) {
          hasMore = false;
        } else {
          allImages = allImages.concat(images);
          page++;
          
          // Check if we've gone back far enough in time
          const oldestDate = new Date(images[images.length - 1].date);
          const targetStart = new Date(startDate);
          if (oldestDate < targetStart && allImages.length > 100) {
            hasMore = false; // Stop fetching if we have enough data
          }
        }
      } catch (fetchErr) {
        // Network error or parse error
        if (fetchErr instanceof TypeError && fetchErr.message.includes('fetch')) {
          fetchError = 'Network Error: Unable to connect to NASA\'s servers. Please check your internet connection.';
        } else if (fetchErr instanceof SyntaxError) {
          fetchError = 'Data Error: The server returned invalid data. Please try again.';
        } else {
          fetchError = fetchErr.message;
        }
        throw new Error(fetchError);
      }
    }

    console.log(`Fetched ${allImages.length} total images, now filtering...`);

    // Filter images by date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredImages = allImages.filter((image) => {
      const imgDate = new Date(image.date);
      return imgDate >= start && imgDate <= end;
    });

    console.log(`Found ${filteredImages.length} images in date range ${startDate} to ${endDate}`);

    if (filteredImages.length === 0) {
      gallery.innerHTML = `
        <div class="error-container">
          <p class="error-title">🔍 No Images Found</p>
          <p class="error-message">No images were found for the date range you selected (${startDate} to ${endDate}).</p>
          <p class="error-subtext">💡 Tip: Try selecting a more recent date range, or check that your start date is before your end date.</p>
        </div>
      `;
      return;
    }

    // Display the images in the gallery
    displayImages(filteredImages, gallery);

  } catch (error) {
    // Show a comprehensive error message if something went wrong
    console.error('Error:', error);
    
    let errorTitle = '❌ Error Loading Images';
    let errorDetails = error.message || 'An unknown error occurred';
    let errorTip = 'Check the browser console (press F12) for more details';

    // Provide specific guidance for common errors
    if (errorDetails.includes('Network Error')) {
      errorTip = '💡 Tip: Check your internet connection and try again.';
    } else if (errorDetails.includes('Service Unavailable') || errorDetails.includes('Server Error')) {
      errorTip = '💡 Tip: NASA\'s servers may be temporarily down. Please try again in a few minutes.';
    } else if (errorDetails.includes('Too Many Requests')) {
      errorTip = '💡 Tip: You\'ve made too many requests. Wait a few minutes before trying again.';
    } else if (errorDetails.includes('Not Found')) {
      errorTip = '💡 Tip: There may be an issue with the NASA API. Contact support if this persists.';
    }

    gallery.innerHTML = `
      <div class="error-container">
        <p class="error-title">${errorTitle}</p>
        <p class="error-message">${errorDetails}</p>
        <p class="error-subtext">${errorTip}</p>
      </div>
    `;
  }
}

// Convert YouTube URL to embeddable iframe format
function getEmbedUrl(url) {
  // Handle YouTube URLs
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';

    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }

    // Return embeddable URL
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // For other URLs, return as-is
  return url;
}

// Display the images as cards in the gallery
function displayImages(images, gallery) {
  // Clear the gallery
  gallery.innerHTML = '';

  // Check if we got any images
  if (!images || images.length === 0) {
    gallery.innerHTML = '<p style="text-align: center; padding: 2rem;">No images found for this date range.</p>';
    return;
  }

  // Store the current images and reset index for modal navigation
  currentImages = [...images].sort((a, b) => new Date(b.date) - new Date(a.date));
  currentImageIndex = 0;

  console.log(`Displaying ${images.length} images`);

  // Create a card for each image (sorted by date, newest first)
  currentImages.forEach((image, index) => {
    console.log(`Image ${index}:`, image.title, 'Media type:', image.media_type, 'URL:', image.url);

    const card = document.createElement('div');
    card.className = 'image-card';

    // Check if this is an image or a video
    let mediaHTML = '';
    if (image.media_type === 'image') {
      // Use hdurl if available (higher quality), otherwise use url
      const imgUrl = image.hdurl || image.url;
      mediaHTML = `<img src="${imgUrl}" alt="${image.title}" loading="lazy" />`;
    } else if (image.media_type === 'video') {
      // Extract video URL and convert if needed
      let videoUrl = image.url;
      
      // Check if it's a YouTube link
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const embedUrl = getEmbedUrl(videoUrl);
        mediaHTML = `<iframe src="${embedUrl}" title="${image.title}" allowfullscreen style="width:100%; height:100%; border:none;"></iframe>`;
      } else if (videoUrl.includes('.mp4')) {
        // For direct MP4 videos
        mediaHTML = `<video controls style="width:100%; height:100%;"><source src="${videoUrl}" type="video/mp4">Your browser does not support the video tag.</video>`;
      } else {
        // Fallback to thumbnail
        const imgUrl = image.hdurl || image.url;
        mediaHTML = `<img src="${imgUrl}" alt="${image.title}" loading="lazy" />`;
      }
    } else {
      // Fallback - try to display as image
      const imgUrl = image.hdurl || image.url;
      mediaHTML = `<img src="${imgUrl}" alt="${image.title}" loading="lazy" />`;
    }

    // Clean up the explanation text (remove HTML tags and truncate)
    let explanation = image.explanation;
    if (explanation.includes('<strong>')) {
      explanation = explanation.replace(/<[^>]*>/g, ''); // Remove HTML tags
    }

    // Build the card HTML
    card.innerHTML = `
      <div class="image-container">
        ${mediaHTML}
      </div>
      <h3>${image.title}</h3>
      <p class="date">${new Date(image.date).toLocaleDateString()}</p>
    `;

    // Add click event to open modal
    card.addEventListener('click', () => {
      // Store the current index for modal navigation
      currentImageIndex = index;
      
      // Add bounce animation
      card.classList.add('bouncing');
      
      // Remove animation class after it finishes (600ms matches the animation duration)
      setTimeout(() => {
        card.classList.remove('bouncing');
      }, 600);
      
      // Open modal after a short delay to let bounce play
      setTimeout(() => {
        openImageModal(currentImages[currentImageIndex]);
      }, 150);
    });

    // Add the card to the gallery
    gallery.appendChild(card);
  });
}

// Open the modal with full image details
function openImageModal(image) {
  const modal = document.getElementById('imageModal');
  const modalBody = document.getElementById('modalBody');

  // Build the media HTML
  let mediaHTML = '';
  let sourceLink = ''; // Link to view the media on its original source
  
  if (image.media_type === 'image') {
    const imgUrl = image.hdurl || image.url;
    mediaHTML = `<img src="${imgUrl}" alt="${image.title}" class="modal-image" />`;
  } else if (image.media_type === 'video') {
    let videoUrl = image.url;
    
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const embedUrl = getEmbedUrl(videoUrl);
      mediaHTML = `<iframe src="${embedUrl}" title="${image.title}" class="modal-video" allowfullscreen></iframe>`;
      // Create a link to watch the video on YouTube
      sourceLink = `<a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="source-link">🎬 Watch on YouTube</a>`;
    } else if (videoUrl.includes('.mp4')) {
      mediaHTML = `<video controls class="modal-video"><source src="${videoUrl}" type="video/mp4">Your browser does not support the video tag.</video>`;
      // Create a link to view the video source
      sourceLink = `<a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="source-link">📹 View Video Source</a>`;
    } else {
      const imgUrl = image.hdurl || image.url;
      mediaHTML = `<img src="${imgUrl}" alt="${image.title}" class="modal-image" />`;
    }
  }

  // Clean up explanation
  let explanation = image.explanation;
  if (explanation.includes('<strong>')) {
    explanation = explanation.replace(/<[^>]*>/g, '');
  }

  // Calculate navigation button visibility
  const showPrev = currentImageIndex > 0;
  const showNext = currentImageIndex < currentImages.length - 1;
  
  // Build navigation buttons
  const navButtons = `
    <div class="modal-nav">
      <button class="modal-nav-btn modal-prev" ${!showPrev ? 'disabled' : ''} onclick="previousImage()">← Previous</button>
      <span class="modal-counter">${currentImageIndex + 1} / ${currentImages.length}</span>
      <button class="modal-nav-btn modal-next" ${!showNext ? 'disabled' : ''} onclick="nextImage()">Next →</button>
    </div>
  `;

  // Build modal content
  modalBody.innerHTML = `
    ${mediaHTML}
    <h2 class="modal-title">${image.title}</h2>
    ${sourceLink}
    <p class="modal-date">${new Date(image.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p class="modal-description">${explanation}</p>
    ${image.copyright ? `<p class="modal-credit">${image.copyright}</p>` : ''}
    ${navButtons}
  `;

  // Show the modal
  modal.classList.add('active');
}

// Navigate to the previous image in the modal
function previousImage() {
  if (currentImageIndex > 0) {
    currentImageIndex--;
    openImageModal(currentImages[currentImageIndex]);
  }
}

// Navigate to the next image in the modal
function nextImage() {
  if (currentImageIndex < currentImages.length - 1) {
    currentImageIndex++;
    openImageModal(currentImages[currentImageIndex]);
  }
}
