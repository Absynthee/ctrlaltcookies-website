// netlify/functions/youtube.js
exports.handler = async (event, context) => {
  // Security headers
  const headers = {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Access-Control-Allow-Origin": "*", // Adjust for your domain
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "X-Requested-With",
  };

  // Only allow GET requests
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: true, message: "Method not allowed" }),
    };
  }

  try {
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

    if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
      throw new Error("Missing environment variables");
    }

    const uploadsPlaylistId = YOUTUBE_CHANNEL_ID.replace("UC", "UU");
    const maxResults = 5;

    const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=${maxResults}&order=date`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("YouTube API Error:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: true,
        message: "Error fetching YouTube data",
      }),
    };
  }
};
