// ===== GITHUB API INTEGRATION =====

class GitHubAPI {
    constructor() {
        this.username = 'YEGAPPAN-S';
        this.repo = 'YEGAPPAN-S.github.io';
        this.token = localStorage.getItem('github_token') || '';
        this.branch = 'main';
        this.apiBase = 'https://api.github.com';
    }

    async testConnection() {
        try {
            const response = await fetch(`${this.apiBase}/user`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }

    async getPosts() {
        try {
            const response = await fetch(
                `${this.apiBase}/repos/${this.username}/${this.repo}/contents/data/posts.json?ref=${this.branch}`,
                {
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                const content = atob(data.content);
                const postsData = JSON.parse(content);
                return postsData.posts || [];
            }
            return null;
        } catch (error) {
            console.error('Error fetching posts from GitHub:', error);
            return null;
        }
    }

    async savePosts(posts) {
        try {
            // First, get the current file SHA (needed for updating)
            const currentFile = await this.getFile('data/posts.json');
            
            const postsData = {
                posts: posts,
                lastUpdated: new Date().toISOString()
            };

            const content = btoa(unescape(encodeURIComponent(JSON.stringify(postsData, null, 2))));

            const payload = {
                message: `Update blog posts - ${new Date().toLocaleString()}`,
                content: content,
                branch: this.branch
            };

            // Add SHA if file exists
            if (currentFile && currentFile.sha) {
                payload.sha = currentFile.sha;
            }

            const response = await fetch(
                `${this.apiBase}/repos/${this.username}/${this.repo}/contents/data/posts.json`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (response.ok) {
                console.log('Posts saved to GitHub successfully');
                return true;
            } else {
                const error = await response.json();
                console.error('GitHub API error:', error);
                return false;
            }
        } catch (error) {
            console.error('Error saving posts to GitHub:', error);
            return false;
        }
    }

    async uploadImage(file) {
        try {
            // Generate unique filename
            const timestamp = Date.now();
            const extension = file.name.split('.').pop();
            const filename = `blog-${timestamp}.${extension}`;
            const path = `assets/images/blog/${filename}`;

            // Convert file to base64
            const content = await this.fileToBase64(file);

            const payload = {
                message: `Upload blog image: ${filename}`,
                content: content,
                branch: this.branch
            };

            const response = await fetch(
                `${this.apiBase}/repos/${this.username}/${this.repo}/contents/${path}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (response.ok) {
                const data = await response.json();
                // Return the raw GitHub URL for the image
                return `https://raw.githubusercontent.com/${this.username}/${this.repo}/${this.branch}/${path}`;
            } else {
                const error = await response.json();
                console.error('Image upload error:', error);
                return null;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    }

    async getFile(path) {
        try {
            const response = await fetch(
                `${this.apiBase}/repos/${this.username}/${this.repo}/contents/${path}?ref=${this.branch}`,
                {
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Error getting file:', error);
            return null;
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remove data URL prefix (data:image/png;base64,)
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    async createDataFolder() {
        try {
            // Create a placeholder file in data folder to ensure it exists
            const payload = {
                message: 'Initialize data folder',
                content: btoa('{}'),
                branch: this.branch
            };

            await fetch(
                `${this.apiBase}/repos/${this.username}/${this.repo}/contents/data/.gitkeep`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );
        } catch (error) {
            console.log('Data folder may already exist');
        }
    }

    async createAssetsFolder() {
        try {
            const payload = {
                message: 'Initialize assets/images/blog folder',
                content: btoa(''),
                branch: this.branch
            };

            await fetch(
                `${this.apiBase}/repos/${this.username}/${this.repo}/contents/assets/images/blog/.gitkeep`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );
        } catch (error) {
            console.log('Assets folder may already exist');
        }
    }

    async initialize() {
        // Check if posts.json exists, create if not
        const existingPosts = await this.getPosts();
        if (!existingPosts) {
            console.log('Creating initial posts.json...');
            await this.savePosts([]);
        } else {
            console.log('posts.json already exists');
        }
    }
}

// Initialize GitHub API
const githubAPI = new GitHubAPI();
window.githubAPI = githubAPI;

// Auto-initialize folders when admin panel loads
if (window.location.pathname.includes('admin.html')) {
    setTimeout(() => {
        githubAPI.initialize().catch(console.error);
    }, 2000);
}
