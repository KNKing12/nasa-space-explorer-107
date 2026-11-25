// Space facts array - NASA-themed educational content
const spaceFacts = [
  'The Sun accounts for 99.86% of all mass in our solar system.',
  'A day on Venus is longer than a year on Venus.',
  'There are more stars in the universe than grains of sand on all Earth\'s beaches.',
  'The Great Red Spot on Jupiter is a storm larger than Earth that has raged for 400 years.',
  'Saturn\'s rings are made of billions of tiny particles of ice and rock.',
  'Mars has the largest volcano in the solar system: Olympus Mons.',
  'The International Space Station orbits Earth every 90 minutes.',
  'Black holes bend space and time, making escape impossible.',
  'The Andromeda Galaxy is on a collision course with the Milky Way.',
  'An astronaut would expand if exposed to space without a suit.',
  'The Moon is slowly drifting away from Earth at 1.5 inches per year.',
  'Neptune has the strongest winds in the solar system at 2,100 km/h.',
  'The Hubble Space Telescope can see objects 13.6 billion light-years away.',
  'A year on Neptune is 165 Earth years.',
  'The Sun loses 600 million tons of mass every second.',
  'Pluto is smaller than Earth\'s Moon.',
  'The Aurora Borealis is caused by solar wind interacting with Earth\'s atmosphere.',
  'Neutron stars are so dense that a teaspoon of their material weighs 6 billion tons.',
  'The Milky Way is about 100,000 light-years across.',
  'Cosmic rays constantly bombard Earth from space.',
  'The tail of a comet always points away from the Sun.',
  'Jupiter\'s magnetic field is 14 times stronger than Earth\'s.',
  'The core of the Sun reaches 27 million degrees Fahrenheit.',
  'Supernovae are so bright they can outshine entire galaxies.',
  'The farthest human-made object is the Voyager 1 probe, over 14 billion miles away.',
];

// Function to fetch space-related jokes from the Dad Jokes API
async function fetchSpaceJoke() {
  try {
    // Fetch jokes with 'space' in the search term
    const response = await fetch('https://icanhazdadjoke.com/search?search=space');
    const data = await response.json();
    
    // If we found jokes, return a random one
    if (data.results && data.results.length > 0) {
      const randomJoke = data.results[Math.floor(Math.random() * data.results.length)];
      return randomJoke.joke;
    }
  } catch (error) {
    console.log('Could not fetch joke:', error);
  }
  
  return null;
}

// Combined array for fallback space jokes (in case API fails)
const fallbackSpaceJokes = [
  'Why did the astronaut break up with his girlfriend? He needed his space!',
  'What do you call an alien with a good sense of humor? An ET comedian!',
  'How do astronauts stay in touch? Through a space book!',
  'What\'s a constellation\'s favorite snack? A little Big Dipper!',
  'Why can\'t you hear a pterodactyl going to the bathroom? Because the "P" is silent!',
];

// Track whether we're showing a fact or joke to alternate them
let showNextAsJoke = false;

// Function to display a random fact or joke
async function displayRandomFactOrJoke() {
  const factText = document.getElementById('fact-text');
  
  // Alternate: fact, joke, fact, joke, etc.
  if (showNextAsJoke) {
    // Try to fetch a joke from the API
    const apiJoke = await fetchSpaceJoke();
    if (apiJoke) {
      factText.textContent = apiJoke;
      showNextAsJoke = false; // Next time show a fact
      return;
    }
    
    // Fall back to local jokes if API fails
    const randomJoke = fallbackSpaceJokes[Math.floor(Math.random() * fallbackSpaceJokes.length)];
    factText.textContent = randomJoke;
    showNextAsJoke = false; // Next time show a fact
  } else {
    // Show a space fact
    const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
    factText.textContent = randomFact;
    showNextAsJoke = true; // Next time show a joke
  }
}

// Initialize the cloud with a fact/joke on page load
document.addEventListener('DOMContentLoaded', () => {
  displayRandomFactOrJoke();
  
  // Add click handler to refresh icon
  const refreshIcon = document.querySelector('.refresh-icon');
  if (refreshIcon) {
    refreshIcon.addEventListener('click', displayRandomFactOrJoke);
  }
});

// Update the fact/joke when searching for images
// Wait for script.js to load, then override the button click
document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('button');
  if (button) {
    const originalClickHandler = button.onclick;
    
    button.addEventListener('click', (e) => {
      // Show new fact/joke when user starts a search
      displayRandomFactOrJoke();
    });
  }
});
