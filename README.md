# Yegappan's Portfolio & Blog

Modern, Apple-inspired portfolio website with a built-in blog management system. Fully hosted on GitHub Pages with automated publishing.

## 🚀 Features

- **Modern Design**: Clean, Apple-inspired UI with smooth animations
- **Responsive**: Works perfectly on all devices
- **Dark Mode**: Built-in theme switcher
- **Blog System**: Full-featured blog with categories, tags, and search
- **Admin Panel**: WordPress-like editor for managing posts
- **GitHub Integration**: Automatic publishing to GitHub Pages
- **Rich Text Editor**: TinyMCE WYSIWYG editor
- **Image Uploads**: Direct upload to GitHub repository
- **SEO Ready**: Meta tags, semantic HTML, fast loading

## 📁 File Structure

```
├── index.html          # Homepage with portfolio & latest posts
├── blog.html           # Blog listing page
├── post.html           # Single post template
├── admin.html          # Admin panel (hidden)
├── assets/
│   ├── css/
│   │   ├── styles.css  # Main styles
│   │   ├── blog.css    # Blog styles
│   │   ├── post.css    # Post page styles
│   │   └── admin.css   # Admin panel styles
│   ├── js/
│   │   ├── main.js     # General functionality
│   │   ├── blog.js     # Blog manager
│   │   ├── blog-page.js # Blog listing
│   │   ├── post.js     # Single post
│   │   ├── admin.js    # Admin panel
│   │   └── github-api.js # GitHub integration
│   └── images/         # Image assets
├── data/
│   └── posts.json      # Blog posts data
└── packages/           # Existing assets (images, resume, etc.)
```

## 🛠️ Setup Instructions

### 1. Upload to GitHub

1. Create a new repository named `YEGAPPAN-S.github.io` (or your-username.github.io)
2. Upload all files from this folder to the repository
3. Go to Settings → Pages → Enable GitHub Pages from `main` branch

### 2. Configure GitHub Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "Portfolio Blog Admin"
4. Select scope: **repo** (full control)
5. Generate and copy the token
6. Go to `yourdomain.com/admin.html`
7. Login with credentials
8. Go to Settings → Paste your token → Save

**IMPORTANT SECURITY NOTE:**
- The token `` in the code should be deleted from GitHub after setup
- Generate a NEW token and update it in the admin settings
- Never commit tokens to public repositories

### 3. Access Admin Panel

- URL: `https://your-username.github.io/admin.html`
- Username: `Yega@342`
- Password: `*9FIl1VcaeF%yOn*`

**Change password immediately after first login!**

## 📝 Using the Admin Panel

### Creating a Post

1. Go to admin.html and login
2. Click "New Post"
3. Enter title and content using the rich text editor
4. Upload a featured image (optional)
5. Set category, tags, and meta description
6. Choose Draft or Published
7. Click "Publish"

The post will be automatically saved to GitHub and appear on your site!

### Managing Posts

- **Edit**: Click edit button on any post
- **Delete**: Click delete button (confirms before deleting)
- **Search**: Use search box to find posts
- **Filter**: Filter by status (All/Published/Draft)

### Image Uploads

- Featured images are automatically uploaded to `assets/images/blog/`
- Images are stored on GitHub and served via raw.githubusercontent.com
- Drag & drop supported

## 🎨 Customization

### Colors

Edit `assets/css/styles.css` and change the CSS variables:

```css
:root {
    --color-primary: #0071e3;  /* Main brand color */
    --color-text: #1d1d1f;     /* Text color */
    /* ... more variables */
}
```

### Content

- Update personal info in `index.html`
- Replace images in `packages/images/`
- Update resume in `packages/Yegappan's_Resume.pdf`

## 🔧 Technical Details

### Blog System

- Posts stored in `data/posts.json`
- Auto-synced to GitHub via API
- Fallback to localStorage if GitHub unavailable
- Real-time preview and editing

### GitHub Integration

- Uses GitHub Contents API
- Automatic commits on save
- Image upload to repository
- Branch: main (configurable)

### Security

- Admin authentication via session storage
- Password hashing (change in production to bcrypt)
- Token stored in localStorage (encrypted in production)
- Read-only public access

## 📱 Pages

1. **Homepage** (`index.html`)
   - Hero section
   - About
   - Skills
   - Experience
   - Portfolio
   - Latest blog posts
   - Contact form

2. **Blog** (`blog.html`)
   - All published posts
   - Category filters
   - Search functionality
   - Pagination

3. **Single Post** (`post.html`)
   - Full post content
   - Related posts
   - Social sharing
   - Reading time

4. **Admin Panel** (`admin.html`)
   - Post management
   - Rich text editor
   - Settings
   - GitHub integration

## 🚀 Deployment

The site is ready to deploy to GitHub Pages:

1. Push all files to your repository
2. Enable GitHub Pages in repository settings
3. Your site will be live at `https://username.github.io`

## 🆘 Troubleshooting

### Posts not saving to GitHub

- Check your GitHub token is valid
- Verify token has `repo` scope
- Check browser console for errors
- Ensure `data/` folder exists in repo

### Images not uploading

- Token must have `repo` scope
- Check file size (GitHub has 100MB limit)
- Verify `assets/images/blog/` folder exists

### Admin panel not accessible

- Clear browser cache
- Check admin.html is in root directory
- Verify JavaScript files are loaded

## 📄 License

© 2025 Yegappan Sekar. All rights reserved.

## 💡 Support

For issues or questions:
- Email: yegappans2910@gmail.com
- LinkedIn: [Yegappan Sekar](https://in.linkedin.com/in/yegappan-sekar-983073211)

---

**Made with ❤️ by Yegappan**
