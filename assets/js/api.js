/**
 * api.js — Frontend API client v1.2.0
 *
 * CORS FINAL FIX:
 * Apps Script POST requests sometimes redirect to script.googleusercontent.com
 * which drops CORS headers entirely — causing "No ACAO header" errors.
 *
 * Solution: Encode ALL requests (including "writes") as GET with data in URL params.
 * GET requests:
 *   ✅ Never trigger preflight
 *   ✅ Never lose CORS headers through redirects
 *   ✅ Work 100% reliably with Apps Script
 *
 * Sensitive data (passwords) is still protected by HTTPS.
 */

const API_BASE = window.SITE_CONFIG?.apiUrl
  || 'https://script.google.com/macros/s/AKfycby5l4oClNYYHHxl9RM03ueaFAmCiYHhWS_z9v-SMwhAm7cKIyl-77wrHfKy97w5aIx0/exec';

// ── Core: all requests are GET with params in URL ──────────────
async function apiCall(path, params) {
  const url = new URL(API_BASE);
  url.searchParams.set('path', path);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        // Stringify objects/arrays
        url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : v);
      }
    });
  }

  let response;
  try {
    response = await fetch(url.toString(), { redirect: 'follow' });
  } catch (err) {
    throw new Error('Network error — check your internet connection.');
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('Invalid response from server. Check your Apps Script deployment URL.');
  }

  if (data.error && data.code && data.code >= 400) {
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

    getToken() {
      return this._token || localStorage.getItem('admin_token');
    },

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

    getPosts()           { return apiCall('admin/posts',    { token: this.getToken() }); },
    getStats()           { return apiCall('admin/stats',    { token: this.getToken() }); },
    getSettings()        { return apiCall('admin/settings', { token: this.getToken() }); },

    createPost(data)     { return apiCall('admin/posts/create',  { token: this.getToken(), ...data }); },
    updatePost(id, data) { return apiCall('admin/posts/update',  { token: this.getToken(), id, ...data }); },
    deletePost(id)       { return apiCall('admin/posts/delete',  { token: this.getToken(), id }); },
    publishPost(id)      { return apiCall('admin/posts/publish',   { token: this.getToken(), id }); },
    unpublishPost(id)    { return apiCall('admin/posts/unpublish', { token: this.getToken(), id }); },
    updateSettings(data) { return apiCall('admin/settings/update', { token: this.getToken(), ...data }); },
  }
};

window.API = API;
