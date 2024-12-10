class BlueskyFeed {
    constructor(hashtag) {
        this.hashtag = hashtag;
        this.container = document.getElementById('bluesky-feed');
        this.container.className = 'feed-container';
        this.currentCursor = '';
        this.isLoading = false;
        
        this.postsContainer = document.createElement('div');
        this.postsContainer.className = 'posts-grid';
        this.container.appendChild(this.postsContainer);
        
        this.loadMoreButton = document.createElement('button');
        this.loadMoreButton.className = 'load-more-button';
        this.loadMoreButton.textContent = 'Load More';
        this.loadMoreButton.style.display = 'none';
        this.loadMoreButton.onclick = () => this.loadMore();
        this.container.appendChild(this.loadMoreButton);
    }

    async initialize() {
        try {
            await this.fetchPosts();
            // Refresh feed every 5 minutes
            setInterval(() => this.refreshFeed(), 300000);
        } catch (error) {
            console.error('Failed to initialize Bluesky feed:', error);
            this.postsContainer.innerHTML = '<p>Failed to load Bluesky feed. Please try again later.</p>';
        }
    }

    async fetchPosts(cursor = '') {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.loadMoreButton.textContent = 'Loading...';
        
        try {
            const url = new URL('https://api.bsky.app/xrpc/app.bsky.feed.searchPosts');
            url.searchParams.set('q', `#${this.hashtag}`);
            url.searchParams.set('limit', '20'); // Increased limit since we're filtering
            if (cursor) {
                url.searchParams.set('cursor', cursor);
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch posts');
            
            const data = await response.json();
            
            // Filter posts to only include those with images
            const filteredPosts = data.posts.filter(post => 
                post.embed?.images && post.embed.images.length > 0
            );
            
            this.currentCursor = data.cursor;
            this.loadMoreButton.style.display = this.currentCursor ? 'block' : 'none';
            
            this.renderPosts(filteredPosts, cursor !== '');
            
            return data;
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        } finally {
            this.isLoading = false;
            this.loadMoreButton.textContent = 'Load More';
        }
    }

    async loadMore() {
        if (!this.currentCursor) return;
        try {
            await this.fetchPosts(this.currentCursor);
        } catch (error) {
            console.error('Error loading more posts:', error);
        }
    }

    async refreshFeed() {
        try {
            await this.fetchPosts();
        } catch (error) {
            console.error('Error refreshing feed:', error);
        }
    }

    renderPosts(posts, append = false) {
        if (!posts || posts.length === 0) {
            if (!append) {
                this.postsContainer.innerHTML = '<p>No posts found with images for this hashtag.</p>';
            }
            return;
        }

        if (!append) {
            this.postsContainer.innerHTML = '';
        }
        
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            
            const timestamp = new Date(post.indexedAt).toLocaleString();
            
            // Handle multiple images
            const images = post.embed?.images || [];
            const imageHtml = images.length > 0 ? 
                `<div class="post-images ${images.length > 1 ? 'image-grid' : ''}">
                    ${images.map(img => 
                        `<img class="post-image" src="${img.thumb}" alt="Post image" loading="lazy">`
                    ).join('')}
                </div>` : '';
            
            const replyContext = post.record?.reply ? this.formatReplyContext(post.record.reply) : '';
            
            postElement.innerHTML = `
                ${replyContext}
                <div class="post-header">
                    <img class="avatar" src="${post.author.avatar || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="%23ccc"><rect width="48" height="48"/></svg>'}" 
                         alt="${post.author.displayName || 'User'}" 
                         loading="lazy"
                         onerror="this.src='data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'48\' fill=\'%23ccc\'><rect width=\'48\' height=\'48\'/></svg>'">
                    <div class="user-info">
                        <p class="display-name">${post.author.displayName || 'Anonymous'}</p>
                        <p class="handle">@${post.author.handle}</p>
                    </div>
                </div>
                <div class="post-content">${this.formatPostContent(post.record.text)}</div>
                ${imageHtml}
                <p class="post-timestamp">${timestamp}</p>
            `;
            
            this.postsContainer.appendChild(postElement);
        });
    }

    formatReplyContext(reply) {
        if (!reply) return '';
        return `
            <div class="reply-context">
                <div class="reply-line"></div>
                <p class="reply-text">
                    Replying to @${reply.parent.author?.handle || 'unknown'}
                </p>
            </div>
        `;
    }

    formatPostContent(text) {
        if (!text) return '';
        
        // Basic XSS prevention
        const escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        
        // Convert URLs to links
        const withLinks = escaped.replace(
            /(https?:\/\/[^\s]+)/g, 
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        // Convert hashtags to links
        return withLinks.replace(
            /#(\w+)/g,
            '<a href="https://bsky.app/hashtag/$1" target="_blank" rel="noopener noreferrer">#$1</a>'
        );
    }
}


// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize the feed
    const feed = new BlueskyFeed('ctrlartcookie');
    feed.initialize();
});