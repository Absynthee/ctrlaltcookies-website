document.addEventListener('DOMContentLoaded', function() {
  const navSlide = () => {
    const burger = document.querySelector(".burger");
    const nav = document.querySelector(".nav-links");
    const navLinks = document.querySelectorAll(".nav-links li");

    if (burger && nav) {
      burger.addEventListener("click", () => {
        // Toggle Nav
        nav.classList.toggle("nav-active");
        // Animate Links
        navLinks.forEach((link, index) => {
          if (link.style.animation) {
            link.style.animation = "";
          } else {
            link.style.animation = `navLinkFade 0.5s ease forwards ${
              index / 7 + 0.3
            }s`;
          }
        });
        // Burger Animation
        burger.classList.toggle("toggle");
      });

      // Close the dropdown menu when a link is clicked
      navLinks.forEach((link) => {
        link.addEventListener("click", () => {
          nav.classList.remove("nav-active");
          burger.classList.remove("toggle");
          navLinks.forEach((link) => {
            link.style.animation = "";
          });
        });
      });
    }
  };
  navSlide();
});

// emoji movements

document.addEventListener("DOMContentLoaded", () => {
  const emojis = document.querySelectorAll(
    ".emoji.wave, .emoji.smug, .emoji.cool, .emoji.heart, .emoji"
  );
  const container = document.querySelector(".hero-image-background");

  document.addEventListener("mousemove", (e) => {
    // Get mouse position relative to the container
    const containerRect = container.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;

    emojis.forEach((emoji) => {
      const rect = emoji.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2 - containerRect.left;
      const centerY = rect.top + rect.height / 2 - containerRect.top;

      // Calculate the distance between mouse and emoji
      const distanceX = mouseX - centerX;
      const distanceY = mouseY - centerY;

      // Move the emoji 1% of the distance
      gsap.to(emoji, {
        x: distanceX * 0.01,
        y: distanceY * 0.01,
        duration: 1,
        ease: "sine.out",
      });
    });
  });
});


// line clamp 

function clampText(element, maxLines) {
  const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
  const maxHeight = lineHeight * maxLines;
  
  let content = element.getAttribute('data-original-text');
  if (!content) {
      content = element.textContent;
      element.setAttribute('data-original-text', content);
  }
  
  element.textContent = content;

  while (element.scrollHeight > maxHeight) {
      content = content.slice(0, -1);
      element.textContent = content + '...';
  }
}

function applyClampToElements() {
  const containers = document.querySelectorAll('.clamp-text');
  containers.forEach(container => clampText(container, 4));
}

// Debounce function to limit how often a function is called
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
      const later = () => {
          clearTimeout(timeout);
          func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
  };
}

// Apply clamping on load
document.addEventListener('DOMContentLoaded', applyClampToElements);

// Apply clamping on resize, with debounce
window.addEventListener('resize', debounce(applyClampToElements, 250));

// theme

// const lightThemeLink = document.getElementById('theme-light');
// const darkThemeLink = document.getElementById('theme-dark');
// const html = document.documentElement;

// // Check for saved theme preference
// document.addEventListener('DOMContentLoaded', () => {
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme) {
//         setTheme(savedTheme);
//     }
// });

// // Add click event listeners
// lightThemeLink.addEventListener('click', (e) => {
//     e.preventDefault();
//     setTheme('light');
//     localStorage.setItem('theme', 'light');
// });

// darkThemeLink.addEventListener('click', (e) => {
//     e.preventDefault();
//     setTheme('dark');
//     localStorage.setItem('theme', 'dark');
// });

// function setTheme(theme) {
//     html.classList.remove('light-theme', 'dark-theme');
//     if (theme) {
//         html.classList.add(`${theme}-theme`);
//     }
// }

// theme toggle 

const html = document.documentElement;
const themeToggle = document.querySelector('.toggle-theme');

// Check for saved theme preference, otherwise default to light
const savedTheme = localStorage.getItem('theme') || 'light';
html.className = `${savedTheme}-theme`;

themeToggle.addEventListener('click', () => {
  // Toggle between themes
  const currentTheme = html.className.includes('light') ? 'dark' : 'light';
  html.className = `${currentTheme}-theme`;
  
  // Save preference
  localStorage.setItem('theme', currentTheme);
});

// smooth scrolling

document.querySelectorAll('a[href="#home"], a[href="#about"], a[href="#discord"], a[href="#contact"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const target = document.querySelector(this.getAttribute('href'));
      
      if (target) {
          const headerOffset = 0;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;
          const startPosition = window.scrollY;
          const distance = targetPosition - startPosition;
          
          const duration = 1000; // Duration in milliseconds
          let start = null;
          
          // easeInOutQuart easing function
          const easeInOutQuart = t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
          
          function animation(currentTime) {
              if (start === null) start = currentTime;
              const timeElapsed = currentTime - start;
              const progress = Math.min(timeElapsed / duration, 1);
              
              const ease = easeInOutQuart(progress);
              
              window.scrollTo(0, startPosition + (distance * ease));
              
              if (timeElapsed < duration) {
                  requestAnimationFrame(animation);
              }
          }
          
          requestAnimationFrame(animation);
      }
  });
});

// twitch check!

document.addEventListener('DOMContentLoaded', function() {
  const checkStreamStatus = async () => {
      try {
          // Make sure this path points to your PHP file correctly
          const response = await fetch('check-stream.php', {
              headers: {
                  'X-Requested-With': 'XMLHttpRequest'
              },
              // Add cache-busting to prevent browser caching
              cache: 'no-store'
          });
          
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          
          const data = await response.json();
          
          if (data.error) {
              console.error('Error checking stream status:', data.message);
              return;
          }
          
          const banner = document.querySelector('.top-banner');
          if (data.is_live) {
              banner.classList.add('is-live');
          } else {
              banner.classList.remove('is-live');
          }
      } catch (error) {
          console.error('Error:', error);
      }
  };

  // Function to determine check interval based on UK time
  const getCheckInterval = () => {
      const ukTime = new Date().toLocaleString('en-US', { timeZone: 'Europe/London' });
      const ukHour = new Date(ukTime).getHours();
      
      // Return 5 minutes (300000ms) for off-peak hours, 2 minutes (120000ms) for peak hours
      return (ukHour >= 21 || ukHour < 6) ? 300000 : 120000;
  };

  // Initial check
  checkStreamStatus();
  
  // Set up adaptive interval checking
  const updateInterval = () => {
      const interval = getCheckInterval();
      checkStreamStatus();
      setTimeout(updateInterval, interval);
  };
  
  // Start the adaptive interval
  updateInterval();
});