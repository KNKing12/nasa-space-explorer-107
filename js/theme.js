// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Check if user has a saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'night') {
    body.classList.add('night-mode');
    themeToggle.textContent = '☀️';
  } else {
    body.classList.remove('night-mode');
    themeToggle.textContent = '🌙';
  }

  // Add click event to toggle theme
  themeToggle.addEventListener('click', () => {
    if (body.classList.contains('night-mode')) {
      // Switch to day mode
      body.classList.remove('night-mode');
      themeToggle.textContent = '🌙';
      localStorage.setItem('theme', 'day');
    } else {
      // Switch to night mode
      body.classList.add('night-mode');
      themeToggle.textContent = '☀️';
      localStorage.setItem('theme', 'night');
    }
  });
});
