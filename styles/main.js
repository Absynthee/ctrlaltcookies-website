// gsap

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


// live server testing with .html extensions
document.querySelectorAll('a').forEach(link => {
  if (!link.href.endsWith('.html') && !link.href.includes('#')) {
      link.href = link.href + '.html';
  }
});
