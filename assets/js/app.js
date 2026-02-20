/**
 * app.js — Shared utilities, theme, nav, animations
 */

// ── Site Configuration ─────────────────────────────────────────
// Edit this ONCE — all pages import from here
window.SITE_CONFIG = {
  apiUrl: 'https://script.google.com/macros/s/AKfycby5l4oClNYYHHxl9RM03ueaFAmCiYHhWS_z9v-SMwhAm7cKIyl-77wrHfKy97w5aIx0/exec',
  siteUrl: 'https://YEGAPPAN-S.github.io',
  siteName: 'Yegappan Sekar',
};

// ── Theme Management ───────────────────────────────────────────
const Theme = {
  init() {
    const saved = localStorage.getItem('theme') || 'light';
    this.apply(saved);
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => this.toggle());
    });
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    this.apply(current === 'light' ? 'dark' : 'light');
  },
};

// ── Navigation ─────────────────────────────────────────────────
const Nav = {
  init() {
    // Hamburger menu
    const ham = document.querySelector('.nav__hamburger');
    const links = document.querySelector('.nav__links');
    if (ham && links) {
      ham.addEventListener('click', () => links.classList.toggle('open'));
      // Close on link click
      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => links.classList.remove('open'));
      });
    }

    // Active link
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav__links a').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkPath = href.replace(/\/$/, '') || '/';
      if (currentPath === linkPath || (linkPath !== '/' && currentPath.startsWith(linkPath))) {
        link.classList.add('active');
      }
    });
  },
};

// ── Intersection Observer for fade-in ─────────────────────────
const Animations = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  },
};

// ── Back to Top ────────────────────────────────────────────────
const BackToTop = {
  init() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },
};

// ── Reading Progress ───────────────────────────────────────────
const ReadingProgress = {
  init() {
    const bar = document.querySelector('.reading-progress');
    if (!bar) return;

    const update = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = pct.toFixed(1) + '%';
    };

    window.addEventListener('scroll', update, { passive: true });
  },
};

// ── Markdown Parser (minimal, safe) ────────────────────────────
const MarkdownParser = {
  parse(md) {
    if (!md) return '';
    let html = String(md);

    // Escape HTML first to prevent XSS
    html = this.escapeHtml(html);

    // Fenced code blocks (must come before inline code)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

    // Headings
    html = html.replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Blockquotes
    html = html.replace(/^&gt;\s*(.+)$/gm, '<blockquote>$1</blockquote>');

    // Horizontal rule
    html = html.replace(/^---+$/gm, '<hr>');

    // Bold & italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');

    // Tables
    html = this.parseTables(html);

    // Unordered lists
    html = this.parseLists(html);

    // Ordered lists
    html = this.parseOrderedLists(html);

    // Paragraphs (wrap non-block-level lines)
    html = this.parseParagraphs(html);

    return html;
  },

  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  parseTables(html) {
    return html.replace(/((?:\|.+\|\n?)+)/g, (table) => {
      const rows = table.trim().split('\n').filter(r => r.trim());
      if (rows.length < 2) return table;

      let result = '<table>';
      const isHeader = (row) => /^\|[-: |]+\|$/.test(row.replace(/ /g, ''));
      let inBody = false;

      rows.forEach((row, i) => {
        if (isHeader(row)) { inBody = true; return; }
        const cells = row.split('|').slice(1, -1).map(c => c.trim());
        const tag = (!inBody) ? 'th' : 'td';
        if (!inBody && i === 0) result += '<thead><tr>';
        else if (inBody && rows[i - 1] && isHeader(rows[i - 1])) result += '<tbody><tr>';
        else result += '<tr>';
        result += cells.map(c => `<${tag}>${c}</${tag}>`).join('');
        result += '</tr>';
      });

      if (!inBody) result += '</thead>';
      else result += '</tbody>';
      result += '</table>';
      return result;
    });
  },

  parseLists(html) {
    return html.replace(/((?:^[-*+]\s.+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n').filter(l => l.trim());
      return '<ul>' + items.map(i => `<li>${i.replace(/^[-*+]\s/, '')}</li>`).join('') + '</ul>';
    });
  },

  parseOrderedLists(html) {
    return html.replace(/((?:^\d+\.\s.+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n').filter(l => l.trim());
      return '<ol>' + items.map(i => `<li>${i.replace(/^\d+\.\s/, '')}</li>`).join('') + '</ol>';
    });
  },

  parseParagraphs(html) {
    const blocks = html.split(/\n{2,}/);
    return blocks.map(block => {
      block = block.trim();
      if (!block) return '';
      const blockTags = /^<(h[1-6]|ul|ol|li|blockquote|pre|table|hr|div|p)/;
      if (blockTags.test(block)) return block;
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    }).filter(Boolean).join('\n');
  },
};

// ── Table of Contents Generator ───────────────────────────────
const TableOfContents = {
  generate(contentEl, tocEl) {
    if (!contentEl || !tocEl) return;

    const headings = contentEl.querySelectorAll('h2, h3');
    if (headings.length < 2) {
      tocEl.closest('.post-toc-sidebar')?.remove();
      return;
    }

    const items = [];
    headings.forEach((h, i) => {
      const id = h.textContent.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').slice(0, 50) + '-' + i;
      h.id = id;

      // Add anchor link
      if (h.tagName !== 'H1') {
        const anchor = document.createElement('a');
        anchor.className = 'anchor-link';
        anchor.href = '#' + id;
        anchor.textContent = '#';
        h.appendChild(anchor);
      }

      items.push({ id, text: h.textContent.replace('#', '').trim(), level: parseInt(h.tagName[1]) });
    });

    tocEl.innerHTML = items.map(item => {
      const cls = item.level === 3 ? 'post-toc__link post-toc__link--h3' : 'post-toc__link';
      return `<li><a href="#${item.id}" class="${cls}">${item.text}</a></li>`;
    }).join('');

    // Highlight active on scroll
    const links = tocEl.querySelectorAll('a');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const active = tocEl.querySelector(`a[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-80px 0px -60% 0px' });

    headings.forEach(h => observer.observe(h));
  },
};

// ── Date Formatter ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

// ── Notification Toast ─────────────────────────────────────────
function showToast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = `alert alert--${type}`;
  el.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    z-index: 999; min-width: 280px; box-shadow: var(--shadow-xl);
    animation: slideUp 0.3s ease;
  `;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; }, 3000);
  setTimeout(() => el.remove(), 3400);
}

// ── Settings cache ─────────────────────────────────────────────
let _settingsCache = null;

async function getSiteSettings() {
  if (_settingsCache) return _settingsCache;
  try {
    const res = await API.getSettings();
    _settingsCache = res.data || {};
    return _settingsCache;
  } catch (e) {
    return {};
  }
}

// ── Apply settings to page ─────────────────────────────────────
function applySettings(settings) {
  if (!settings) return;
  // Update footer social links
  const gh = document.querySelector('[data-social="github"]');
  const li = document.querySelector('[data-social="linkedin"]');
  if (gh && settings.github_url) gh.href = settings.github_url;
  if (li && settings.linkedin_url) li.href = settings.linkedin_url;
}

// ── Init all on page load ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Nav.init();
  Animations.init();
  BackToTop.init();
  ReadingProgress.init();
});

// Export
window.MarkdownParser = MarkdownParser;
window.TableOfContents = TableOfContents;
window.formatDate = formatDate;
window.timeAgo = timeAgo;
window.showToast = showToast;
window.getSiteSettings = getSiteSettings;
window.applySettings = applySettings;
