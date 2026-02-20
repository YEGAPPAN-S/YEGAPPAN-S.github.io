/**
 * api.js — Frontend API client
 * Communicates with Google Apps Script Web App
 *
 * CORS FIX EXPLAINED:
 * Google Apps Script cannot respond to OPTIONS preflight requests.
 * Preflight is triggered by:
 *   - Custom headers (Authorization, X-*)
 *   - Content-Type: application/json
 *
 * Solution: Use "simple requests" that skip preflight:
 *   - POST with Content-Type: text/plain  (GAS reads body as postData.contents)
 *   - Auth token passed as URL param ?token=  (not as Authorization header)
 *   - Method override via URL param ?_method=PUT|DELETE  (no custom headers)
 */

// ── Configuration ──────────────────────────────────────────────
const API_BASE = window.SITE_CONFIG?.apiUrl || 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

// ── Core HTTP client (CORS-safe) ───────────────────────────────
async function apiRequest(method, path, body, authToken) {
  const url = new URL(API_BASE);
  url.searchParams.set('path', path);

  // Pass token as URL param (avoids Authorization header → avoids preflight)
  if (authToken) url.searchParams.set('token', authToken);

  // Normalize PUT/DELETE → POST with ?_method= in URL (stays "simple request")
  if (method === 'PUT' || method === 'DELETE') {
    url.searchParams.set('_method', method);
    method = 'POST';
  }

  const opts = { method, redirect: 'follow' };

  if (method === 'POST') {
    // text/plain does NOT trigger preflight — GAS still receives body via postData.contents
    opts.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
    opts.body = JSON.stringify(body || {});
  }

  const response = await fetch(url.toString(), opts);

  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('Invalid server response. Check your Apps Script deployment URL.');
  }

  if (data.error && data.code && data.code >= 400) {
    const err = new Error(data.error);
    err.code = data.code;
    throw err;
  }
  return data;
}

// ── Simple GET helper ──────────────────────────────────────────
async function apiGet(path, params, authToken) {
  const url = new URL(API_BASE);
  url.searchParams.set('path', path);
  if (authToken) url.searchParams.set('token', authToken);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== false) {
        url.searchParams.set(k, v);
      }
    });
  }
  const response = await fetch(url.toString(), { redirect: 'follow' });
  const data = await response.json();
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
    return apiGet('public/settings');
  },

  getPosts({ page = 1, limit = 10, tag = '', category = '', q = '', featured = false } = {}) {
    return apiGet('public/posts', { page, limit, tag, category, q, featured: featured || undefined });
  },

  getPost(slug) {
    return apiGet('public/post', { slug });
  },

  submitContact(formData) {
    return apiRequest('POST', 'public/contact', formData);
  },

  // ── Admin API ─────────────────────────────────────────────────
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
      const res = await apiRequest('POST', 'admin/login', { email, password });
      if (res.data?.token) {
        this.setToken(res.data.token, res.data.expiresAt);
        localStorage.setItem('admin_user', JSON.stringify(res.data.user));
      }
      return res;
    },

    async logout() {
      try { await apiRequest('POST', 'admin/logout', {}, this.getToken()); } catch (e) {}
      this.clearToken();
    },

    getPosts()           { return apiGet('admin/posts',    {}, this.getToken()); },
    getStats()           { return apiGet('admin/stats',    {}, this.getToken()); },
    getSettings()        { return apiGet('admin/settings', {}, this.getToken()); },
    createPost(data)     { return apiRequest('POST',   'admin/posts',             data, this.getToken()); },
    updatePost(id, data) { return apiRequest('PUT',    `admin/posts/${id}`,       data, this.getToken()); },
    deletePost(id)       { return apiRequest('DELETE', `admin/posts/${id}`,       {},   this.getToken()); },
    publishPost(id)      { return apiRequest('POST',   `admin/posts/${id}/publish`,   {}, this.getToken()); },
    unpublishPost(id)    { return apiRequest('POST',   `admin/posts/${id}/unpublish`, {}, this.getToken()); },
    updateSettings(data) { return apiRequest('PUT',    'admin/settings',          data, this.getToken()); },
  }
};

window.API = API;
