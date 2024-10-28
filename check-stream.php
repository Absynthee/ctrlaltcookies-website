<?php

require_once '../private/keys.php';

function getStoredToken() {
    $tokenFile = '../private/twitch_token.json';
    
    if (file_exists($tokenFile)) {
        $tokenData = json_decode(file_get_contents($tokenFile), true);
        
        // Check if token is still valid (with 1-hour buffer)
        if (isset($tokenData['expires_at']) && $tokenData['expires_at'] > (time() + 3600)) {
            return $tokenData['access_token'];
        }
    }
    
    return null;
}

function storeToken($accessToken) {
    $tokenFile = '../private/twitch_token.json';
    $tokenData = [
        'access_token' => $accessToken,
        'expires_at' => time() + (60 * 24 * 60 * 60) // 60 days
    ];
    
    file_put_contents($tokenFile, json_encode($tokenData));
}

function getTwitchAccessToken() {
    // Try to get stored token first
    $storedToken = getStoredToken();
    if ($storedToken) {
        return $storedToken;
    }
    
    // If no valid stored token, get a new one
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, "https://id.twitch.tv/oauth2/token");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'client_id' => TWITCH_CLIENT_ID,
        'client_secret' => TWITCH_CLIENT_SECRET,
        'grant_type' => 'client_credentials'
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    
    if(curl_errno($ch)) {
        error_log('Curl Error: ' . curl_error($ch));
        return false;
    }
    
    curl_close($ch);
    $data = json_decode($response, true);
    
    if (!isset($data['access_token'])) {
        error_log('Failed to get Twitch access token: ' . $response);
        return false;
    }
    
    // Store the new token
    storeToken($data['access_token']);
    
    return $data['access_token'];
}

function isOffPeakHours() {
    // Get current time in UK timezone
    $uk_time = new DateTime('now', new DateTimeZone('Europe/London'));
    $current_hour = (int)$uk_time->format('G'); // 24-hour format
    
    // Off-peak is between 21:00 (9 PM) and 06:00 (6 AM)
    return ($current_hour >= 21 || $current_hour < 6);
}

function getStoredStatus() {
    $statusFile = '../private/stream_status.json';
    
    if (file_exists($statusFile)) {
        $statusData = json_decode(file_get_contents($statusFile), true);
        
        $cacheTime = isOffPeakHours() ? 300 : 120; // 5 minutes for off-peak, 2 minutes for peak
        
        // Return cached status if it's fresh enough based on time of day
        if (isset($statusData['checked_at']) && (time() - $statusData['checked_at']) < $cacheTime) {
            return $statusData;
        }
    }
    
    return null;
}
function storeStatus($status) {
    $statusFile = '../private/stream_status.json';
    $statusData = [
        'is_live' => $status,
        'checked_at' => time()
    ];
    
    file_put_contents($statusFile, json_encode($statusData));
}

function checkStreamStatus() {
    // Check cached status first
    $cachedStatus = getStoredStatus();
    if ($cachedStatus !== null) {
        header('Content-Type: application/json');
        echo json_encode([
            'is_live' => $cachedStatus['is_live'],
            'error' => false,
            'cached' => true
        ]);
        return;
    }
    
    $access_token = getTwitchAccessToken();
    
    if (!$access_token) {
        return ['error' => true, 'message' => 'Failed to get access token'];
    }
    
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, "https://api.twitch.tv/helix/streams?user_login=" . TWITCH_CHANNEL_NAME);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Client-ID: ' . TWITCH_CLIENT_ID,
        'Authorization: Bearer ' . $access_token
    ]);
    
    $response = curl_exec($ch);
    
    if(curl_errno($ch)) {
        error_log('Curl Error: ' . curl_error($ch));
        return ['error' => true, 'message' => 'Failed to check stream status'];
    }
    
    curl_close($ch);
    
    $data = json_decode($response, true);
    $isLive = !empty($data['data']);
    
    // Store the new status
    storeStatus($isLive);
    
    header('Content-Type: application/json');
    echo json_encode([
        'is_live' => $isLive,
        'error' => false,
        'cached' => false
    ]);
}

if(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
   strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    checkStreamStatus();
}
