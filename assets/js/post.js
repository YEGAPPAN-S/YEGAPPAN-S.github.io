// ===== SINGLE POST PAGE =====

class PostPage {
    constructor() {
        this.postId = null;
        this.post = null;
        this.init();
    }

    async init() {
        // Get post ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.postId = urlParams.get('id');

        if (!this.postId) {
            this.showError('Post not found');
            return;
        }

        // Wait for blog manager
        await new Promise(resolve => {
            const checkBlogManager = setInterval(() => {
                if (window.blogManager) {
                    clearInterval(checkBlogManager);
                    resolve();
                }
            }, 100);
        });

        // Load post
        this.post = window.blogManager.getPostById(this.postId);

        if (!this.post || this.post.status !== 'published') {
            this.showError('Post not found or not published');
            return;
        }

        this.renderPost();
        this.renderRelatedPosts();
        this.setupShareButtons();
    }

    renderPost() {
        // Update page title
        document.title = `${this.post.title} - Yegappan Sekar`;

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && this.post.excerpt) {
            metaDesc.setAttribute('content', this.post.excerpt);
        }

        // Category
        const categoryEl = document.getElementById('post-category');
        if (categoryEl && this.post.category) {
            categoryEl.textContent = this.post.category;
        }

        // Date
        const dateEl = document.getElementById('post-date');
        if (dateEl) {
            dateEl.textContent = window.blogManager.formatDate(this.post.date);
        }

        // Reading time
        const readingTimeEl = document.getElementById('reading-time');
        if (readingTimeEl) {
            const time = window.blogManager.calculateReadingTime(this.post.content);
            readingTimeEl.textContent = `${time} min read`;
        }

        // Title
        const titleEl = document.getElementById('post-title');
        if (titleEl) {
            titleEl.textContent = this.post.title;
        }

        // Featured image
        const imageContainer = document.getElementById('featured-image-container');
        if (imageContainer && this.post.featuredImage) {
            imageContainer.innerHTML = `
                <img src="${this.post.featuredImage}" alt="${this.post.title}" 
                     onerror="this.parentElement.style.display='none'">
            `;
        } else {
            imageContainer.style.display = 'none';
        }

        // Content
        const contentEl = document.getElementById('post-content');
        if (contentEl) {
            contentEl.innerHTML = this.post.content;
        }

        // Tags
        const tagsEl = document.getElementById('post-tags');
        if (tagsEl && this.post.tags && this.post.tags.length > 0) {
            tagsEl.innerHTML = this.post.tags
                .map(tag => `<a href="./blog.html" class="post__tag">#${tag}</a>`)
                .join('');
        }
    }

    renderRelatedPosts() {
        const container = document.getElementById('related-posts');
        if (!container) return;

        const relatedPosts = window.blogManager.getRelatedPosts(this.post, 3);

        if (relatedPosts.length === 0) {
            container.parentElement.style.display = 'none';
            return;
        }

        container.innerHTML = relatedPosts
            .map(post => window.blogManager.createPostCard(post))
            .join('');
    }

    setupShareButtons() {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(this.post.title);

        // Twitter
        const twitterBtn = document.getElementById('share-twitter');
        if (twitterBtn) {
            twitterBtn.href = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        }

        // LinkedIn
        const linkedinBtn = document.getElementById('share-linkedin');
        if (linkedinBtn) {
            linkedinBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        }

        // Facebook
        const facebookBtn = document.getElementById('share-facebook');
        if (facebookBtn) {
            facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        }
    }

    showError(message) {
        const container = document.querySelector('.post-single .container-small');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <i class="uil uil-exclamation-triangle" style="font-size: 4rem; color: var(--color-error); margin-bottom: 1rem;"></i>
                    <h2 style="font-size: 2rem; margin-bottom: 1rem;">${message}</h2>
                    <a href="./blog.html" class="btn btn--primary">
                        <i class="uil uil-arrow-left"></i>
                        Back to Blog
                    </a>
                </div>
            `;
        }
    }
}

// Initialize post page
const postPage = new PostPage();
