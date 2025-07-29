// netlify/functions/check-stream.js
exports.handler = async (event, context) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
  };

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: true, message: "Method not allowed" }),
    };
  }

  try {
    const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
    const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
    const TWITCH_CHANNEL_NAME = process.env.TWITCH_CHANNEL_NAME;

    if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET || !TWITCH_CHANNEL_NAME) {
      throw new Error("Missing environment variables");
    }

    // Get OAuth token
    const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to get Twitch access token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Check stream status
    const streamResponse = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${TWITCH_CHANNEL_NAME}`,
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!streamResponse.ok) {
      throw new Error("Failed to check stream status");
    }

    const streamData = await streamResponse.json();
    const isLive = streamData.data && streamData.data.length > 0;

    // Determine cache duration based on time of day
    const isOffPeak = () => {
      const now = new Date();
      const ukTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Europe/London" })
      );
      const hour = ukTime.getHours();
      return hour >= 21 || hour < 6;
    };

    const cacheTime = isOffPeak() ? 300 : 120; // 5 minutes off-peak, 2 minutes peak

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Cache-Control": `public, max-age=${cacheTime}`,
      },
      body: JSON.stringify({
        is_live: isLive,
        error: false,
        cached: false,
      }),
    };
  } catch (error) {
    console.error("Twitch API Error:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: true,
        message: "Error checking stream status",
      }),
    };
  }
};
