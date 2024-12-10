<?php
// bluesky-feed.php - can be in root or any public directory
header('Content-Type: application/json');

// Get parameters
$hashtag = $_GET['hashtag'] ?? '';
$cursor = $_GET['cursor'] ?? ''; // Cursor for pagination

if (empty($hashtag)) {
    http_response_code(400);
    echo json_encode(['error' => 'Hashtag is required']);
    exit;
}

function fetchPublicPosts($hashtag, $cursor = '') {
    $url = 'https://api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=' . urlencode('#' . $hashtag) . '&limit=10';
    if (!empty($cursor)) {
        $url .= '&cursor=' . urlencode($cursor);
    }
    
    $ch = curl_init($url);
    
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json'
        ]
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('Failed to fetch posts');
    }
    
    return json_decode($response, true);
}

try {
    $response = fetchPublicPosts($hashtag, $cursor);
    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
