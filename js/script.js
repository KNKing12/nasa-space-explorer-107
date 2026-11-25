// NASA API Key
const NASA_API_KEY = 'pGcCCBDnKtdCfBKBQjfJDwCLDRfLgj8kMTJwwWHg';

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
      alert('Please select both a start and end date');
      return;
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

    while (hasMore) {
      const url = `https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=100&page=${page}`;
      console.log(`Fetching page ${page}...`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
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
      gallery.innerHTML = `<p style="text-align: center; padding: 2rem;">No images found for this date range. The archive may only have recent data available.</p>`;
      return;
    }

    // Display the images in the gallery
    displayImages(filteredImages, gallery);

  } catch (error) {
    // Show an error message if something went wrong
    console.error('Error:', error);
    gallery.innerHTML = `
      <p style="text-align: center; color: red; padding: 2rem;">
        ❌ Error loading images: ${error.message}
      </p>
      <p style="text-align: center; color: #666; font-size: 12px; padding: 0 2rem;">
        Check the browser console (press F12) for more details
      </p>
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

  console.log(`Displaying ${images.length} images`);

  // Create a card for each image (sorted by date, newest first)
  images.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach((image, index) => {
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
      // Add bounce animation
      card.classList.add('bouncing');
      
      // Remove animation class after it finishes (600ms matches the animation duration)
      setTimeout(() => {
        card.classList.remove('bouncing');
      }, 600);
      
      // Open modal after a short delay to let bounce play
      setTimeout(() => {
        openImageModal(image);
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
  if (image.media_type === 'image') {
    const imgUrl = image.hdurl || image.url;
    mediaHTML = `<img src="${imgUrl}" alt="${image.title}" class="modal-image" />`;
  } else if (image.media_type === 'video') {
    let videoUrl = image.url;
    
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const embedUrl = getEmbedUrl(videoUrl);
      mediaHTML = `<iframe src="${embedUrl}" title="${image.title}" class="modal-video" allowfullscreen></iframe>`;
    } else if (videoUrl.includes('.mp4')) {
      mediaHTML = `<video controls class="modal-video"><source src="${videoUrl}" type="video/mp4">Your browser does not support the video tag.</video>`;
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

  // Build modal content
  modalBody.innerHTML = `
    ${mediaHTML}
    <h2 class="modal-title">${image.title}</h2>
    <p class="modal-date">${new Date(image.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p class="modal-description">${explanation}</p>
    ${image.copyright ? `<p class="modal-credit">${image.copyright}</p>` : ''}
  `;

  // Show the modal
  modal.classList.add('active');
}
