let hasRun = false;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

function updateVideoLayout(videos) {
  if (!videos) {
    console.error("No videos received");
    return;
  }
  try {
    // Update main video (most recent)
    if (videos.length > 0) {
      const mainVideo = videos[0];
      const mainThumbnail =
        mainVideo.snippet.thumbnails.maxres?.url ||
        mainVideo.snippet.thumbnails.high?.url ||
        mainVideo.snippet.thumbnails.medium?.url;

      document.querySelector(".thumbnail-1").src = mainThumbnail;
      document.querySelector(
        ".video-link-1"
      ).href = `https://www.youtube.com/watch?v=${mainVideo.id}`;
      document.querySelector(".Latest-Video-Text h3").textContent =
        mainVideo.snippet.title;
      document.querySelector(".Latest-Video-Text p").textContent =
        mainVideo.snippet.description;
    }

    // Update videos 1-3 (indexes 1-3 in the array)
    for (let i = 1; i < 4 && i < videos.length; i++) {
      const video = videos[i];
      const thumbnail =
        video.snippet.thumbnails.maxres?.url ||
        video.snippet.thumbnails.high?.url ||
        video.snippet.thumbnails.medium?.url;

      document.querySelector(`.thumbnail-${i + 1}`).src = thumbnail;
      document.querySelector(
        `.video-link-${i + 1}`
      ).href = `https://www.youtube.com/watch?v=${video.id}`;
      document.querySelector(`.Video-${i}-Text h3`).textContent =
        video.snippet.title;
    }
  } catch (error) {
    console.error("Error updating layout:", error);
  }
}

async function fetchYouTubeVideos() {
  if (hasRun) {
    console.log("Fetch already executed");
    return;
  }
  hasRun = true;

  // Check cache first
  const cachedData = localStorage.getItem("youtubeVideos");
  const cacheTimestamp = localStorage.getItem("youtubeVideosTimestamp");

  if (cachedData && cacheTimestamp) {
    const now = new Date().getTime();
    if (now - parseInt(cacheTimestamp) < CACHE_DURATION) {
      console.log("Using cached data");
      const videos = JSON.parse(cachedData);
      updateVideoLayout(videos);
      return;
    }
  }

  try {
    const response = await fetch("config.php", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    const data = await response.json();

    if (data.error) {
      console.error("API Error:", data.message);
      handleQuotaExceeded();
      return;
    }

    if (!data.items || data.items.length === 0) {
      console.error("No videos found in response");
      return;
    }

    const container = document.querySelector(".yt-videos-container");
    if (container) {
      container.style.display = "grid";
    }

    const formattedVideos = data.items.map((item) => ({
      id: item.snippet.resourceId.videoId,
      snippet: {
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnails: item.snippet.thumbnails,
      },
    }));

    localStorage.setItem("youtubeVideos", JSON.stringify(formattedVideos));
    localStorage.setItem(
      "youtubeVideosTimestamp",
      new Date().getTime().toString()
    );

    updateVideoLayout(formattedVideos);
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    handleQuotaExceeded();
  }
}

function handleQuotaExceeded() {
  const container = document.querySelector(".yt-videos-container");
  if (container) {
    container.style.display = "none";
    const errorMessage = document.createElement("div");
    errorMessage.className = "quota-error-message";
    errorMessage.innerHTML = `
            <div style="text-align: center; padding: 20px; border-radius: 20px;">
                <h3>Unable to load videos</h3>
                <p>Please check back later.</p>
            </div>
        `;
    container.parentNode.insertBefore(errorMessage, container);
  }
}

// Initialize
const initializeLayout = () => {
  fetchYouTubeVideos();

  setTimeout(function () {
    const elements = [
      ".Latest-Video-Text h3",
      ".Latest-Video-Text p",
      ".Video-1-Text h3",
      ".Video-2-Text h3",
      ".Video-3-Text h3",
    ];

    elements.forEach((selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.classList.add("clamp-text");
      }
    });
    window.dispatchEvent(new Event("resize"));
  }, 500);
};

// Single event listener
const handler = () => {
  initializeLayout();
  document.removeEventListener("DOMContentLoaded", handler);
};

document.removeEventListener("DOMContentLoaded", handler);
document.addEventListener("DOMContentLoaded", handler);
