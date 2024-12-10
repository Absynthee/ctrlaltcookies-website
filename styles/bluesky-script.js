class BlueskyFeed {
    constructor(hashtag) {
        this.hashtag = hashtag;
        this.container = document.getElementById('bluesky-feed');
        this.container.className = 'feed-container';
        this.currentCursor = '';
        this.isLoading = false;
        
        // Create posts container
        this.postsContainer = document.createElement('div');
        this.postsContainer.className = 'posts-container';
        this.container.appendChild(this.postsContainer);
        
        // Create load more button
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
            const url = `/bluesky-feed.php?hashtag=${encodeURIComponent(this.hashtag)}`;
            const response = await fetch(cursor ? `${url}&cursor=${encodeURIComponent(cursor)}` : url);
            
            if (!response.ok) throw new Error('Failed to fetch posts');
            
            const data = await response.json();
            
            // Update cursor for next page
            this.currentCursor = data.cursor;
            
            // Show/hide load more button based on whether there's more data
            this.loadMoreButton.style.display = this.currentCursor ? 'block' : 'none';
            
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
            const data = await this.fetchPosts(this.currentCursor);
            this.renderPosts(data.posts, true); // true means append mode
        } catch (error) {
            console.error('Error loading more posts:', error);
        }
    }

    async refreshFeed() {
        try {
            const data = await this.fetchPosts();
            this.renderPosts(data.posts, false); // false means replace mode
        } catch (error) {
            console.error('Error refreshing feed:', error);
        }
    }

    renderPosts(posts, append = false) {
        if (!posts || posts.length === 0) {
            if (!append) {
                this.postsContainer.innerHTML = '<p>No posts found for this hashtag.</p>';
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
            
            postElement.innerHTML = `
                <div class="post-header">
                    <img class="avatar" src="${post.author.avatar || '/path/to/default-avatar.png'}" 
                         alt="${post.author.displayName}" 
                         onerror="this.src='/path/to/default-avatar.png'">
                    <div class="user-info">
                        <p class="display-name">${post.author.displayName}</p>
                        <p class="handle">@${post.author.handle}</p>
                    </div>
                </div>
                <p class="post-content">${this.formatPostContent(post.text)}</p>
                <p class="post-timestamp">${timestamp}</p>
            `;
            
            this.postsContainer.appendChild(postElement);
        });
    }

    formatPostContent(text) {
        // Basic XSS prevention
        const escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        
        // Convert URLs to links
        return escaped.replace(
            /(https?:\/\/[^\s]+)/g, 
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
    }
}

// Add some CSS for the load more button
const style = document.createElement('style');
style.textContent = `
    .load-more-button {
        display: block;
        margin: 20px auto;
        padding: 10px 20px;
        background-color: #1da1f2;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
    }

    .load-more-button:hover {
        background-color: #1991db;
    }

    .load-more-button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);