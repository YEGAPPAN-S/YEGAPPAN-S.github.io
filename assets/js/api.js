/**
 * api.js — Frontend API client
 * Communicates with Google Apps Script Web App
 */

// ── Configuration ─────────────────────────────────────────────
// SET THIS to your deployed Apps Script Web App URL
const API_BASE = window.SITE_CONFIG?.apiUrl || 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

// ── HTTP Client ────────────────────────────────────────────────
async function apiRequest(method, path, body, authToken) {
  const url = new URL(API_BASE);
  url.searchParams.set('path', path);

  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
  };

  if (authToken) {
    opts.headers['Authorization'] = 'Bearer ' + authToken;
  }

  // Apps Script only supports GET + POST for CORS requests
  // For PUT/DELETE we pass method override in body
  let actualMethod = method;
  if (method === 'PUT' || method === 'DELETE') {
    actualMethod = 'POST';
    opts.headers['X-HTTP-Method-Override'] = method;
    body = { ...(body || {}), _method: method };
    // Re-route path for overridden methods
  }

  opts.method = actualMethod;

  if (body && (actualMethod === 'POST')) {
    opts.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), opts);
  const data = await response.json();

  if (data.error && data.code && data.code >= 400) {
    const err = new Error(data.error);
    err.code = data.code;
    throw err;
  }

  return data;
}

// ── Public API ─────────────────────────────────────────────────
const API = {
  // Settings
  async getSettings() {
    return apiRequest('GET', 'public/settings');
  },

  // Posts list with filters
  async getPosts({ page = 1, limit = 10, tag = '', category = '', q = '', featured = false } = {}) {
    const url = new URL(API_BASE);
    url.searchParams.set('path', 'public/posts');
    url.searchParams.set('page', page);
    url.searchParams.set('limit', limit);
    if (tag) url.searchParams.set('tag', tag);
    if (category) url.searchParams.set('category', category);
    if (q) url.searchParams.set('q', q);
    if (featured) url.searchParams.set('featured', 'true');

    const response = await fetch(url.toString());
    const data = await response.json();
    if (data.error && data.code >= 400) {
      throw new Error(data.error);
    }
    return data;
  },

  // Single post by slug
  async getPost(slug) {
    const url = new URL(API_BASE);
    url.searchParams.set('path', 'public/post');
    url.searchParams.set('slug', slug);
    const response = await fetch(url.toString());
    const data = await response.json();
    if (data.error && data.code >= 400) {
      const err = new Error(data.error);
      err.code = data.code;
      throw err;
    }
    return data;
  },

  // Contact form
  async submitContact(formData) {
    return apiRequest('POST', 'public/contact', formData);
  },

  // ── Admin API ────────────────────────────────────────────────
  Admin: {
    _token: null,

    getToken() {
      if (this._token) return this._token;
      return localStorage.getItem('admin_token');
    },

    setToken(token) {
      this._token = token;
      localStorage.setItem('admin_token', token);
    },

    clearToken() {
      this._token = null;
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    },

    async login(email, password) {
      const res = await apiRequest('POST', 'admin/login', { email, password });
      if (res.data?.token) {
        this.setToken(res.data.token);
        localStorage.setItem('admin_user', JSON.stringify(res.data.user));
      }
      return res;
    },

    async logout() {
      try {
        await apiRequest('POST', 'admin/logout', {}, this.getToken());
      } catch (e) {}
      this.clearToken();
    },

    async getPosts() {
      return apiRequest('GET', 'admin/posts', null, this.getToken());
    },

    async createPost(data) {
      return apiRequest('POST', 'admin/posts', data, this.getToken());
    },

    async updatePost(id, data) {
      // POST with _method override
      const res = await apiRequest('PUT', `admin/posts/${id}`, data, this.getToken());
      return res;
    },

    async deletePost(id) {
      return apiRequest('DELETE', `admin/posts/${id}`, {}, this.getToken());
    },

    async publishPost(id) {
      return apiRequest('POST', `admin/posts/${id}/publish`, {}, this.getToken());
    },

    async unpublishPost(id) {
      return apiRequest('POST', `admin/posts/${id}/unpublish`, {}, this.getToken());
    },

    async getSettings() {
      return apiRequest('GET', 'admin/settings', null, this.getToken());
    },

    async updateSettings(data) {
      return apiRequest('PUT', 'admin/settings', data, this.getToken());
    },

    async getStats() {
      const url = new URL(API_BASE);
      url.searchParams.set('path', 'admin/stats');
      const res = await fetch(url.toString(), {
        headers: { 'Authorization': 'Bearer ' + this.getToken() }
      });
      return res.json();
    },

    isLoggedIn() {
      const token = this.getToken();
      if (!token) return false;
      const expiry = localStorage.getItem('admin_token_expiry');
      if (expiry && Date.now() > parseInt(expiry)) {
        this.clearToken();
        return false;
      }
      return true;
    },

    requireAuth() {
      if (!this.isLoggedIn()) {
        window.location.href = '/admin/login.html';
        return false;
      }
      return true;
    },

    getUser() {
      try {
        return JSON.parse(localStorage.getItem('admin_user') || 'null');
      } catch { return null; }
    },
  }
};

window.API = API;
