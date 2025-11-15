// ===== BLOG FUNCTIONALITY =====

class BlogManager {
    constructor() {
        this.posts = [];
        this.categories = new Set();
        this.init();
    }

    async init() {
        await this.loadPosts();
        this.displayLatestPosts();
    }

    async loadPosts() {
        try {
            // Try to load from GitHub first
            const response = await fetch('./data/posts.json');
            if (response.ok) {
                const data = await response.json();
                this.posts = data.posts || [];
            } else {
                // Fallback to localStorage
                const localPosts = localStorage.getItem('blog_posts');
                this.posts = localPosts ? JSON.parse(localPosts) : [];
            }
            
            // Extract categories
            this.posts.forEach(post => {
                if (post.category) {
                    this.categories.add(post.category);
                }
            });
            
        } catch (error) {
            console.error('Error loading posts:', error);
            // Fallback to localStorage
            const localPosts = localStorage.getItem('blog_posts');
            this.posts = localPosts ? JSON.parse(localPosts) : [];
        }
    }

    getPublishedPosts() {
        return this.posts
            .filter(post => post.status === 'published')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    displayLatestPosts(limit = 3) {
        const container = document.getElementById('blog-posts');
        if (!container) return;

        const publishedPosts = this.getPublishedPosts();
        
        if (publishedPosts.length === 0) {
            container.innerHTML = `
                <div class="blog__empty">
                    <i class="uil uil-file-edit-alt"></i>
                    <p>No posts yet. Check back soon!</p>
                </div>
            `;
            return;
        }

        const latestPosts = publishedPosts.slice(0, limit);
        container.innerHTML = latestPosts.map(post => this.createPostCard(post)).join('');
    }

    createPostCard(post) {
        const excerpt = post.excerpt || this.generateExcerpt(post.content);
        const imageUrl = post.featuredImage || './assets/images/default-blog.jpg';
        const readingTime = this.calculateReadingTime(post.content);
        
        return `
            <article class="blog__card">
                <div class="blog__card-image">
                    <img src="${imageUrl}" alt="${post.title}" onerror="this.src='./assets/images/default-blog.jpg'">
                    ${post.category ? `<span class="blog__card-category">${post.category}</span>` : ''}
                </div>
                <div class="blog__card-content">
                    <div class="blog__card-meta">
                        <span><i class="uil uil-calendar-alt"></i> ${this.formatDate(post.date)}</span>
                        <span><i class="uil uil-clock"></i> ${readingTime} min read</span>
                    </div>
                    <h3 class="blog__card-title">
                        <a href="./post.html?id=${post.id}">${post.title}</a>
                    </h3>
                    <p class="blog__card-excerpt">${excerpt}</p>
                    <a href="./post.html?id=${post.id}" class="blog__card-link">
                        Read More <i class="uil uil-arrow-right"></i>
                    </a>
                </div>
            </article>
        `;
    }

    generateExcerpt(content, length = 150) {
        // Remove HTML tags
        const text = content.replace(/<[^>]*>/g, '');
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    calculateReadingTime(content) {
        const wordsPerMinute = 200;
        const text = content.replace(/<[^>]*>/g, '');
        const wordCount = text.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    getPostById(id) {
        return this.posts.find(post => post.id === id);
    }

    getPostsByCategory(category) {
        if (category === 'all') {
            return this.getPublishedPosts();
        }
        return this.getPublishedPosts().filter(post => post.category === category);
    }

    searchPosts(query) {
        const lowerQuery = query.toLowerCase();
        return this.getPublishedPosts().filter(post => {
            return post.title.toLowerCase().includes(lowerQuery) ||
                   post.content.toLowerCase().includes(lowerQuery) ||
                   (post.excerpt && post.excerpt.toLowerCase().includes(lowerQuery)) ||
                   (post.tags && post.tags.some(tag => tag.toLowerCase().includes(lowerQuery)));
        });
    }

    getRelatedPosts(currentPost, limit = 3) {
        return this.getPublishedPosts()
            .filter(post => post.id !== currentPost.id && post.category === currentPost.category)
            .slice(0, limit);
    }
}

// Initialize blog manager
const blogManager = new BlogManager();

// Make it globally available
window.blogManager = blogManager;
