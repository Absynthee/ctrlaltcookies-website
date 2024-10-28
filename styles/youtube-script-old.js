let hasRun = false;
let cachedVideos = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Define updateVideoLayout first
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

      // Note: i represents video 1,2,3 but uses thumbnail/link classes 2,3,4
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
    const API_KEY = config.YOUTUBE_API_KEY;
    const CHANNEL_ID = config.YOUTUBE_CHANNEL_ID;
    const UPLOADS_PLAYLIST_ID = CHANNEL_ID.replace("UC", "UU");
    const MAX_RESULTS = 5;

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${UPLOADS_PLAYLIST_ID}&part=snippet&maxResults=${MAX_RESULTS}&order=date`
    );
    const data = await response.json();

    // Check for quota exceeded error
    if (data.error && data.error.code === 403) {
      console.error("YouTube API quota exceeded");
      handleQuotaExceeded();
      return;
    }

    if (data.error) {
      console.error("YouTube API Error:", data.error);
      return;
    }

    if (!data.items || data.items.length === 0) {
      console.error("No videos found in response");
      return;
    }

    // Show the container if it was hidden
    const container = document.querySelector(".yt-videos-container");
    if (container) {
      container.style.display = "grid"; // or whatever display value you're using
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
    handleQuotaExceeded(); // Handle any other errors similarly
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
