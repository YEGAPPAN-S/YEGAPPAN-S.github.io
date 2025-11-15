# 🚀 Quick Start Guide

Get your portfolio + blog live in 5 minutes!

## Step 1: Upload to GitHub (2 minutes)

1. Extract the `portfolio-revamp.zip` file
2. Go to [GitHub](https://github.com) and create a new repository
3. Name it: `YEGAPPAN-S.github.io` (replace with your GitHub username)
4. Upload all extracted files to the repository
5. Your site is now live at `https://YEGAPPAN-S.github.io`!

## Step 2: Security Setup (2 minutes)

### Create a New GitHub Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Name: "Portfolio Blog Admin"
4. Select scope: ✅ **repo** (full control)
5. Click "Generate" and COPY the token

### Update Admin Settings

1. Go to `https://YEGAPPAN-S.github.io/admin.html`
2. Login:
   - Username: `Yega@342`
   - Password: `*9FIl1VcaeF%yOn*`
3. Click "Settings" in sidebar
4. Paste your NEW token
5. Click "Save Settings"
6. Click "Test Connection" to verify

### Delete Old Token

⚠️ **IMPORTANT**: Delete the old token from GitHub:
1. Go to your repository on GitHub
2. Edit `assets/js/github-api.js`
3. Find line 7: `this.token = localStorage.getItem('github_token') || 'ghp_bgzt...'`
4. Change to: `this.token = localStorage.getItem('github_token') || ''`
5. Commit the change

## Step 3: Create Your First Post (1 minute)

1. In admin panel, click "New Post"
2. Enter a title (e.g., "My First Blog Post")
3. Write content using the editor
4. Upload a featured image (optional)
5. Set category and tags
6. Click "Publish"

Your post is now live! 🎉

## 🎨 Customize Your Site

### Update Personal Info

Edit `index.html`:
- Line 112: Change "Hi, I'm Yegappan" to your name
- Line 113: Update title
- Line 114: Update description
- Line 137-142: Update about section

### Change Colors

Edit `assets/css/styles.css`:
```css
:root {
    --color-primary: #0071e3;  /* Your brand color */
}
```

### Replace Images

Upload your images to `packages/images/`:
- `Yega.png` - Hero image
- `Yega.jpg` - About image
- Portfolio images

## 📝 Admin Panel Features

### Post Management
- ✅ Create, edit, delete posts
- ✅ Rich text WYSIWYG editor (like WordPress)
- ✅ Image uploads
- ✅ Categories & tags
- ✅ Draft/publish status
- ✅ SEO meta descriptions

### Automatic Publishing
- ✅ Saves directly to GitHub
- ✅ No manual file uploads needed
- ✅ Changes go live immediately

### Settings
- ✅ GitHub token management
- ✅ Change admin password
- ✅ Export/import posts

## 🔐 Change Admin Password

1. Go to admin panel → Settings
2. Scroll to "Change Password"
3. Enter current password: `*9FIl1VcaeF%yOn*`
4. Enter new password (min 8 characters)
5. Confirm new password
6. Click "Update Password"

## 📱 Your Live Site Structure

```
Homepage: https://YEGAPPAN-S.github.io
Blog: https://YEGAPPAN-S.github.io/blog.html
Admin: https://YEGAPPAN-S.github.io/admin.html (keep this secret!)
```

## ⚡ Pro Tips

1. **Keep Admin URL Secret**: Don't share `admin.html` link
2. **Regular Backups**: Use "Export Data" in settings
3. **Test Connection**: Always test GitHub connection in settings
4. **Draft First**: Save posts as drafts, review, then publish
5. **SEO**: Always fill meta descriptions for better search rankings

## 🆘 Common Issues

### "Connection Failed" in Settings
- Check your GitHub token is correct
- Verify token has `repo` scope
- Try generating a new token

### Posts Not Saving
- Click "Test Connection" in settings
- Check browser console (F12) for errors
- Ensure you're logged in to admin panel

### Images Not Uploading
- File size must be under 100MB
- Only image files (PNG, JPG, GIF, WEBP)
- Check GitHub token has write permissions

## 🎓 Next Steps

1. ✅ Customize colors and content
2. ✅ Upload your portfolio projects
3. ✅ Write blog posts regularly
4. ✅ Share on social media
5. ✅ Add your custom domain (optional)

## 📞 Need Help?

Email: yegappans2910@gmail.com

---

**Enjoy your new portfolio! 🚀**
