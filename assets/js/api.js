/**
 * api.js v1.3.0 — Final production version
 *
 * Uses Cloudflare Worker as proxy to bypass Apps Script's 302 redirect
 * which drops CORS headers. All requests go through the worker which
 * fetches GAS server-side and returns the result with correct CORS headers.
 *
 * Update WORKER_URL below after deploying your Cloudflare Worker.
 */

// ── UPDATE THIS after deploying the Cloudflare Worker ─────────
const API_BASE = window.SITE_CONFIG?.apiUrl
  || 'https://gas-proxy.yegappans2910.workers.dev';
// ─────────────────────────────────────────────────────────────

async function apiCall(path, params) {
  const url = new URL(API_BASE);
  url.searchParams.set('path', path);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
      }
    });
  }

  let response;
  try {
    response = await fetch(url.toString());
  } catch (err) {
    throw new Error('Network error — check your internet connection.');
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('Bad response from server. Check your Worker URL in app.js.');
  }

  if (data.error && data.code >= 400) {
    const err = new Error(data.error);
    err.code = data.code;
    throw err;
  }
  return data;
}

// ── Public API ─────────────────────────────────────────────────
const API = {
  getSettings() {
    return apiCall('public/settings');
  },

  getPosts({ page = 1, limit = 10, tag = '', category = '', q = '', featured = false } = {}) {
    return apiCall('public/posts', { page, limit, tag, category, q, featured: featured || undefined });
  },

  getPost(slug) {
    return apiCall('public/post', { slug });
  },

  submitContact({ name, email, message }) {
    return apiCall('public/contact', { name, email, message });
  },

  // ── Admin API ──────────────────────────────────────────────
  Admin: {
    _token: null,

    getToken() { return this._token || localStorage.getItem('admin_token'); },

    setToken(token, expiresAt) {
      this._token = token;
      localStorage.setItem('admin_token', token);
      if (expiresAt) localStorage.setItem('admin_token_expiry', new Date(expiresAt).getTime());
    },

    clearToken() {
      this._token = null;
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_token_expiry');
      localStorage.removeItem('admin_user');
    },

    isLoggedIn() {
      const token = this.getToken();
      if (!token) return false;
      const expiry = localStorage.getItem('admin_token_expiry');
      if (expiry && Date.now() > parseInt(expiry)) { this.clearToken(); return false; }
      return true;
    },

    requireAuth() {
      if (!this.isLoggedIn()) { window.location.href = '/admin/login.html'; return false; }
      return true;
    },

    getUser() {
      try { return JSON.parse(localStorage.getItem('admin_user') || 'null'); } catch { return null; }
    },

    async login(email, password) {
      const res = await apiCall('admin/login', { email, password });
      if (res.data?.token) {
        this.setToken(res.data.token, res.data.expiresAt);
        localStorage.setItem('admin_user', JSON.stringify(res.data.user));
      }
      return res;
    },

    logout() {
      const token = this.getToken();
      this.clearToken();
      if (token) return apiCall('admin/logout', { token }).catch(() => {});
    },

    getPosts()           { return apiCall('admin/posts',            { token: this.getToken() }); },
    getStats()           { return apiCall('admin/stats',            { token: this.getToken() }); },
    getSettings()        { return apiCall('admin/settings',         { token: this.getToken() }); },
    createPost(data)     { return apiCall('admin/posts/create',     { token: this.getToken(), ...data }); },
    updatePost(id, data) { return apiCall('admin/posts/update',     { token: this.getToken(), id, ...data }); },
    deletePost(id)       { return apiCall('admin/posts/delete',     { token: this.getToken(), id }); },
    publishPost(id)      { return apiCall('admin/posts/publish',    { token: this.getToken(), id }); },
    unpublishPost(id)    { return apiCall('admin/posts/unpublish',  { token: this.getToken(), id }); },
    updateSettings(data) { return apiCall('admin/settings/update',  { token: this.getToken(), ...data }); },
  }
};

window.API = API;
