// ===== BLOG PAGE FUNCTIONALITY =====

class BlogPage {
    constructor() {
        this.currentPage = 1;
        this.postsPerPage = 9;
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.init();
    }

    async init() {
        // Wait for blog manager to load
        await new Promise(resolve => {
            const checkBlogManager = setInterval(() => {
                if (window.blogManager && window.blogManager.posts.length >= 0) {
                    clearInterval(checkBlogManager);
                    resolve();
                }
            }, 100);
        });

        this.renderCategoryFilters();
        this.renderPosts();
        this.setupEventListeners();
    }

    renderCategoryFilters() {
        const container = document.getElementById('category-filters');
        if (!container) return;

        const categories = Array.from(window.blogManager.categories);
        
        container.innerHTML = categories.map(category => `
            <button class="filter__btn" data-category="${category}">
                ${category}
            </button>
        `).join('');
    }

    setupEventListeners() {
        // Category filters
        document.querySelectorAll('.filter__btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all
                document.querySelectorAll('.filter__btn').forEach(b => b.classList.remove('active'));
                // Add active to clicked
                e.target.classList.add('active');
                
                this.currentFilter = e.target.dataset.category || 'all';
                this.currentPage = 1;
                this.renderPosts();
            });
        });

        // Search
        const searchInput = document.getElementById('search-input');
        searchInput?.addEventListener('input', this.debounce((e) => {
            this.currentSearch = e.target.value.trim();
            this.currentPage = 1;
            this.renderPosts();
        }, 300));
    }

    renderPosts() {
        const container = document.getElementById('all-blog-posts');
        if (!container) return;

        let posts = [];

        // Get posts based on filter and search
        if (this.currentSearch) {
            posts = window.blogManager.searchPosts(this.currentSearch);
        } else {
            posts = window.blogManager.getPostsByCategory(this.currentFilter);
        }

        if (posts.length === 0) {
            container.innerHTML = `
                <div class="blog__empty">
                    <i class="uil uil-file-search-alt"></i>
                    <p>No posts found${this.currentSearch ? ' for "' + this.currentSearch + '"' : ''}.</p>
                </div>
            `;
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        // Pagination
        const totalPages = Math.ceil(posts.length / this.postsPerPage);
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const paginatedPosts = posts.slice(startIndex, endIndex);

        // Render posts
        container.innerHTML = paginatedPosts
            .map(post => window.blogManager.createPostCard(post))
            .join('');

        // Render pagination
        this.renderPagination(totalPages, posts.length);
    }

    renderPagination(totalPages, totalPosts) {
        const container = document.getElementById('pagination');
        if (!container || totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <button class="pagination__btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="blogPage.goToPage(${this.currentPage - 1})">
                <i class="uil uil-angle-left"></i>
            </button>
        `;

        // Page numbers
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            paginationHTML += `
                <button class="pagination__btn" onclick="blogPage.goToPage(1)">1</button>
                ${startPage > 2 ? '<span class="pagination__dots">...</span>' : ''}
            `;
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination__btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="blogPage.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        if (endPage < totalPages) {
            paginationHTML += `
                ${endPage < totalPages - 1 ? '<span class="pagination__dots">...</span>' : ''}
                <button class="pagination__btn" onclick="blogPage.goToPage(${totalPages})">
                    ${totalPages}
                </button>
            `;
        }

        // Next button
        paginationHTML += `
            <button class="pagination__btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="blogPage.goToPage(${this.currentPage + 1})">
                <i class="uil uil-angle-right"></i>
            </button>
        `;

        // Info
        const startItem = (this.currentPage - 1) * this.postsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.postsPerPage, totalPosts);
        
        paginationHTML += `
            <span class="pagination__info">
                Showing ${startItem}-${endItem} of ${totalPosts} posts
            </span>
        `;

        container.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderPosts();
        
        // Scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize blog page
const blogPage = new BlogPage();
window.blogPage = blogPage;
