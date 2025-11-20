// ===== ADMIN PANEL - FIXED VERSION =====

class AdminPanel {
    constructor() {
        this.posts = [];
        this.currentPost = null;
        this.editor = null;
        this.isAuthenticated = false;
        
        // Admin credentials (hashed)
        this.credentials = {
            username: 'Yega@342',
            passwordHash: this.hashPassword('*9FIl1VcaeF%yOn*')
        };
        
        this.init();
    }

    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    checkAuth() {
        const authToken = sessionStorage.getItem('admin_auth');
        if (authToken === this.credentials.passwordHash) {
            this.isAuthenticated = true;
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        loginForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('login-error');

        if (username === this.credentials.username && 
            this.hashPassword(password) === this.credentials.passwordHash) {
            sessionStorage.setItem('admin_auth', this.credentials.passwordHash);
            this.isAuthenticated = true;
            errorEl.textContent = '';
            this.showDashboard();
        } else {
            errorEl.textContent = 'Invalid username or password';
        }
    }

    showLogin() {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('admin-dashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'grid';
        this.loadPosts();
        this.initializeDashboard();
    }

    async loadPosts() {
        try {
            // First try localStorage (instant)
            const localPosts = localStorage.getItem('blog_posts');
            if (localPosts) {
                this.posts = JSON.parse(localPosts);
                console.log('Loaded posts from localStorage:', this.posts.length);
            }

            // Then try GitHub (async)
            if (window.githubAPI) {
                const githubPosts = await window.githubAPI.getPosts();
                if (githubPosts && githubPosts.length > 0) {
                    this.posts = githubPosts;
                    localStorage.setItem('blog_posts', JSON.stringify(this.posts));
                    console.log('Loaded posts from GitHub:', this.posts.length);
                } else if (!localPosts) {
                    // No posts anywhere, initialize empty
                    this.posts = [];
                    console.log('No posts found, starting fresh');
                }
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            // Use whatever is in memory
            if (!this.posts || this.posts.length === 0) {
                const localPosts = localStorage.getItem('blog_posts');
                this.posts = localPosts ? JSON.parse(localPosts) : [];
            }
        }
        
        this.renderPostsList();
    }

    init() {
        this.checkAuth();
        this.setupLoginForm();
    }

    initializeDashboard() {
        // Navigation
        document.querySelectorAll('.nav-item[data-view]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                this.switchView(view);
                
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Post form
        document.getElementById('post-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePost();
        });

        document.getElementById('save-draft-btn')?.addEventListener('click', () => {
            this.savePost('draft');
        });

        // Image upload
        this.setupImageUpload();

        // Initialize TinyMCE with delay
        setTimeout(() => {
            this.initializeEditor();
        }, 500);

        // Category management
        document.getElementById('add-category-btn')?.addEventListener('click', () => {
            this.addCategory();
        });

        // Search and filter
        document.getElementById('posts-search')?.addEventListener('input', (e) => {
            this.filterPosts(e.target.value);
        });

        document.getElementById('filter-status')?.addEventListener('change', (e) => {
            this.filterPosts(null, e.target.value);
        });

        // Settings
        this.setupSettings();
    }

    initializeEditor() {
        if (typeof tinymce === 'undefined') {
            console.error('TinyMCE not loaded');
            return;
        }

        // Remove any existing instances
        tinymce.remove('#post-content-editor');

        tinymce.init({
            selector: '#post-content-editor',
            height: 500,
            menubar: false,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | formatselect | bold italic underline strikethrough | ' +
                     'alignleft aligncenter alignright alignjustify | ' +
                     'bullist numlist outdent indent | link image media | ' +
                     'forecolor backcolor | removeformat | code fullscreen',
            content_style: 'body { font-family: Inter, sans-serif; font-size: 16px; line-height: 1.6; }',
            branding: false,
            promotion: false,
            setup: (editor) => {
                this.editor = editor;
                editor.on('init', () => {
                    console.log('TinyMCE initialized successfully');
                });
            }
        });
    }

    switchView(view) {
        document.querySelectorAll('.admin-view').forEach(v => v.style.display = 'none');

        const titles = {
            'posts': 'All Posts',
            'new-post': 'New Post',
            'settings': 'Settings',
            'design': 'Design Settings'
        };
        document.getElementById('page-title').textContent = titles[view] || 'Dashboard';

        if (view === 'posts') {
            document.getElementById('posts-view').style.display = 'block';
            this.renderPostsList();
        } else if (view === 'new-post') {
            document.getElementById('post-editor-view').style.display = 'block';
            this.currentPost = null;
            this.clearPostForm();
        } else if (view === 'settings') {
            document.getElementById('settings-view').style.display = 'block';
        } else if (view === 'design') {
            document.getElementById('design-view')?.style.display = 'block';
        }
    }

    renderPostsList() {
        const tbody = document.getElementById('posts-list');
        if (!tbody) return;

        if (this.posts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #6e6e73;">
                        No posts yet. Create your first post!
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.posts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(post => `
                <tr>
                    <td><strong>${this.escapeHtml(post.title)}</strong></td>
                    <td>${post.category || '-'}</td>
                    <td>
                        <span class="post-status ${post.status}">
                            ${post.status}
                        </span>
                    </td>
                    <td>${new Date(post.date).toLocaleDateString()}</td>
                    <td class="post-actions">
                        <button class="action-btn edit" onclick="adminPanel.editPost('${post.id}')">
                            <i class="uil uil-edit"></i> Edit
                        </button>
                        <button class="action-btn delete" onclick="adminPanel.deletePost('${post.id}')">
                            <i class="uil uil-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    editPost(postId) {
        this.currentPost = this.posts.find(p => p.id === postId);
        if (!this.currentPost) {
            this.showToast('Post not found', 'error');
            return;
        }

        console.log('Editing post:', this.currentPost);

        // Switch to editor view
        this.switchView('new-post');
        document.querySelector('.nav-item[data-view="new-post"]').click();

        // Small delay to ensure editor is ready
        setTimeout(() => {
            // Fill form fields
            document.getElementById('post-title-input').value = this.currentPost.title || '';
            document.getElementById('post-status').value = this.currentPost.status || 'draft';
            document.getElementById('post-category').value = this.currentPost.category || '';
            document.getElementById('post-tags').value = this.currentPost.tags ? this.currentPost.tags.join(', ') : '';
            document.getElementById('post-excerpt').value = this.currentPost.excerpt || '';

            // Set editor content
            if (this.editor && this.editor.setContent) {
                this.editor.setContent(this.currentPost.content || '');
                console.log('Editor content set');
            } else {
                console.warn('Editor not ready, trying again...');
                setTimeout(() => {
                    if (this.editor && this.editor.setContent) {
                        this.editor.setContent(this.currentPost.content || '');
                    }
                }, 1000);
            }

            // Featured image
            if (this.currentPost.featuredImage) {
                const preview = document.getElementById('featured-image-preview');
                const placeholder = document.getElementById('upload-placeholder');
                const removeBtn = document.getElementById('remove-image-btn');
                
                preview.src = this.currentPost.featuredImage;
                preview.style.display = 'block';
                placeholder.style.display = 'none';
                removeBtn.style.display = 'flex';
            }
        }, 300);
    }

    async deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post?')) return;

        this.showLoading('Deleting post...');

        try {
            this.posts = this.posts.filter(p => p.id !== postId);
            
            // Save to both localStorage and GitHub
            localStorage.setItem('blog_posts', JSON.stringify(this.posts));
            
            if (window.githubAPI) {
                await window.githubAPI.savePosts(this.posts);
            }
            
            this.showToast('Post deleted successfully');
            this.renderPostsList();
        } catch (error) {
            console.error('Error deleting post:', error);
            this.showToast('Error deleting post', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async savePost(status = null) {
        const title = document.getElementById('post-title-input').value.trim();
        const postStatus = status || document.getElementById('post-status').value;
        const category = document.getElementById('post-category').value;
        const tags = document.getElementById('post-tags').value
            .split(',')
            .map(t => t.trim())
            .filter(t => t);
        const excerpt = document.getElementById('post-excerpt').value.trim();
        
        let content = '';
        if (this.editor && this.editor.getContent) {
            content = this.editor.getContent();
        }

        const featuredImageEl = document.getElementById('featured-image-preview');
        const featuredImage = featuredImageEl.src && !featuredImageEl.src.includes('blob:') ? featuredImageEl.src : '';

        if (!title || !content) {
            this.showToast('Title and content are required', 'error');
            return;
        }

        this.showLoading('Saving post...');

        try {
            const post = {
                id: this.currentPost?.id || this.generateId(),
                title,
                content,
                excerpt,
                category,
                tags,
                featuredImage,
                status: postStatus,
                date: this.currentPost?.date || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Update or add post
            const index = this.posts.findIndex(p => p.id === post.id);
            if (index !== -1) {
                this.posts[index] = post;
            } else {
                this.posts.unshift(post);
            }

            // Save to localStorage first (always works)
            localStorage.setItem('blog_posts', JSON.stringify(this.posts));
            console.log('Saved to localStorage');

            // Try to save to GitHub
            if (window.githubAPI) {
                const success = await window.githubAPI.savePosts(this.posts);
                if (success) {
                    console.log('Saved to GitHub');
                    this.showToast('Post saved successfully');
                } else {
                    console.warn('GitHub save failed, but localStorage succeeded');
                    this.showToast('Post saved locally (GitHub sync pending)');
                }
            } else {
                this.showToast('Post saved locally');
            }

            // Switch to posts view
            setTimeout(() => {
                this.switchView('posts');
                document.querySelector('.nav-item[data-view="posts"]').click();
            }, 1000);
        } catch (error) {
            console.error('Error saving post:', error);
            // Try localStorage as fallback
            localStorage.setItem('blog_posts', JSON.stringify(this.posts));
            this.showToast('Post saved locally only', 'error');
        } finally {
            this.hideLoading();
        }
    }

    clearPostForm() {
        document.getElementById('post-title-input').value = '';
        document.getElementById('post-status').value = 'draft';
        document.getElementById('post-category').value = '';
        document.getElementById('post-tags').value = '';
        document.getElementById('post-excerpt').value = '';
        
        if (this.editor && this.editor.setContent) {
            this.editor.setContent('');
        }

        // Clear featured image
        const preview = document.getElementById('featured-image-preview');
        const placeholder = document.getElementById('upload-placeholder');
        const removeBtn = document.getElementById('remove-image-btn');
        
        preview.src = '';
        preview.style.display = 'none';
        placeholder.style.display = 'flex';
        removeBtn.style.display = 'none';
    }

    setupImageUpload() {
        const uploadArea = document.getElementById('image-upload-area');
        const input = document.getElementById('featured-image-input');
        const preview = document.getElementById('featured-image-preview');
        const placeholder = document.getElementById('upload-placeholder');
        const removeBtn = document.getElementById('remove-image-btn');

        uploadArea?.addEventListener('click', () => input?.click());

        input?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                this.showToast('Please select an image file', 'error');
                return;
            }

            this.showLoading('Uploading image...');

            try {
                // Try GitHub upload if available
                if (window.githubAPI) {
                    const imageUrl = await window.githubAPI.uploadImage(file);
                    
                    if (imageUrl) {
                        preview.src = imageUrl;
                        preview.style.display = 'block';
                        placeholder.style.display = 'none';
                        removeBtn.style.display = 'flex';
                        this.showToast('Image uploaded successfully');
                    } else {
                        throw new Error('Upload failed');
                    }
                } else {
                    // Fallback: use local data URL
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        preview.src = e.target.result;
                        preview.style.display = 'block';
                        placeholder.style.display = 'none';
                        removeBtn.style.display = 'flex';
                        this.showToast('Image loaded (will upload on publish)');
                    };
                    reader.readAsDataURL(file);
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                this.showToast('Error uploading image', 'error');
            } finally {
                this.hideLoading();
            }
        });

        removeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            preview.src = '';
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
            removeBtn.style.display = 'none';
            input.value = '';
        });
    }

    addCategory() {
        const input = document.getElementById('new-category');
        const select = document.getElementById('post-category');
        const newCategory = input.value.trim();

        if (!newCategory) return;

        const exists = Array.from(select.options).some(opt => opt.value === newCategory);
        
        if (!exists) {
            const option = document.createElement('option');
            option.value = newCategory;
            option.textContent = newCategory;
            select.appendChild(option);
        }

        select.value = newCategory;
        input.value = '';
    }

    filterPosts(search = null, status = null) {
        const searchTerm = search !== null ? search : document.getElementById('posts-search').value;
        const statusFilter = status !== null ? status : document.getElementById('filter-status').value;

        let filtered = [...this.posts];

        if (searchTerm) {
            filtered = filtered.filter(post => 
                post.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(post => post.status === statusFilter);
        }

        const originalPosts = this.posts;
        this.posts = filtered;
        this.renderPostsList();
        this.posts = originalPosts;
    }

    setupSettings() {
        const token = localStorage.getItem('github_token');
        if (token) {
            document.getElementById('github-token').value = token;
        }

        document.getElementById('save-github-settings')?.addEventListener('click', () => {
            const token = document.getElementById('github-token').value.trim();
            if (token) {
                localStorage.setItem('github_token', token);
                if (window.githubAPI) {
                    window.githubAPI.token = token;
                }
                this.showToast('Settings saved successfully');
            }
        });

        document.getElementById('test-connection')?.addEventListener('click', async () => {
            this.showLoading('Testing connection...');
            const result = await window.githubAPI?.testConnection();
            this.hideLoading();
            
            if (result) {
                this.showToast('Connection successful!');
            } else {
                this.showToast('Connection failed. Check your token.', 'error');
            }
        });

        document.getElementById('change-password-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.changePassword();
        });

        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-data')?.addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file')?.addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });
    }

    changePassword() {
        const current = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;
        const confirm = document.getElementById('confirm-password').value;

        if (this.hashPassword(current) !== this.credentials.passwordHash) {
            this.showToast('Current password is incorrect', 'error');
            return;
        }

        if (newPass !== confirm) {
            this.showToast('New passwords do not match', 'error');
            return;
        }

        if (newPass.length < 8) {
            this.showToast('Password must be at least 8 characters', 'error');
            return;
        }

        this.credentials.passwordHash = this.hashPassword(newPass);
        sessionStorage.setItem('admin_auth', this.credentials.passwordHash);
        
        this.showToast('Password changed successfully');
        document.getElementById('change-password-form').reset();
    }

    exportData() {
        const data = {
            posts: this.posts,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blog-posts-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Posts exported successfully');
    }

    async importData(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.posts && Array.isArray(data.posts)) {
                this.posts = data.posts;
                localStorage.setItem('blog_posts', JSON.stringify(this.posts));
                
                if (window.githubAPI) {
                    await window.githubAPI.savePosts(this.posts);
                }
                
                this.renderPostsList();
                this.showToast('Posts imported successfully');
            } else {
                throw new Error('Invalid data format');
            }
        } catch (error) {
            console.error('Import error:', error);
            this.showToast('Error importing posts', 'error');
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    logout() {
        sessionStorage.removeItem('admin_auth');
        this.isAuthenticated = false;
        this.showLogin();
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const icon = toast.querySelector('i');
        const text = document.getElementById('toast-message');

        text.textContent = message;
        
        if (type === 'error') {
            toast.classList.add('error');
            icon.className = 'uil uil-exclamation-triangle';
        } else {
            toast.classList.remove('error');
            icon.className = 'uil uil-check-circle';
        }

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    showLoading(message = 'Processing...') {
        const overlay = document.getElementById('loading-overlay');
        const messageEl = document.getElementById('loading-message');
        messageEl.textContent = message;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }
}

// Initialize admin panel
const adminPanel = new AdminPanel();
window.adminPanel = adminPanel;
