# 🚀 Deployment Guide - Netlify

This guide covers deploying **PokéApp** to production using **Netlify** with continuous deployment from GitHub.

---

## 📋 Prerequisites

- GitHub account
- Netlify account (free tier works perfectly)
- Repository pushed to GitHub

---

## 🎯 Option 1: Deploy via Netlify UI (Recommended for first time)

### **Step 1: Connect GitHub Repository**

1. Go to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"GitHub"**
4. Authorize Netlify to access your repositories
5. Select your repository: `iru97/nuxtpokeapp`

### **Step 2: Configure Build Settings**

Netlify should auto-detect Nuxt 3, but verify these settings:

```
Build command: npm run build
Publish directory: .output/public
Functions directory: .output/server
```

### **Step 3: Environment Variables** *(Optional for now)*

No environment variables are required currently since we use the public PokeAPI.

If you need them later:
- Go to **Site settings** → **Environment variables**
- Add: `NODE_VERSION = 18`

### **Step 4: Deploy**

1. Click **"Deploy site"**
2. Wait 2-5 minutes for the build
3. Your site will be live at: `https://random-name-123456.netlify.app`

### **Step 5: Custom Domain** *(Optional)*

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow Netlify's instructions to configure DNS

---

## ⚡ Option 2: Deploy via Netlify CLI (Advanced)

### **Install Netlify CLI**

```bash
npm install -g netlify-cli
```

### **Login to Netlify**

```bash
netlify login
```

### **Initialize Netlify**

```bash
# From project root
netlify init
```

Follow the prompts:
- Create & configure a new site? **Yes**
- Team: Choose your team
- Site name: `pokeapp` (or your preferred name)
- Build command: `npm run build`
- Directory to deploy: `.output/public`
- Functions directory: `.output/server`

### **Deploy**

```bash
# Deploy to production
netlify deploy --prod

# Or deploy a preview
netlify deploy
```

---

## 🔄 Continuous Deployment

Once connected, Netlify will automatically:

1. **Deploy on every push to main branch**
2. **Create preview deployments for pull requests**
3. **Run build checks before deployment**
4. **Rollback to previous version if needed**

### **Deployment Workflow:**

```
git add .
git commit -m "feat: new feature"
git push origin main
→ Netlify detects push
→ Builds project
→ Deploys to production (2-5 min)
→ Site live at your domain
```

---

## 🔧 Build Configuration

The `netlify.toml` file in the root configures:

- **SSR Support**: Nuxt 3 server-side rendering with Nitro
- **Functions**: Serverless functions for dynamic rendering
- **Redirects**: SPA-like navigation
- **Headers**: Security headers and caching
- **Node Version**: Node 18 for compatibility

---

## 📊 Post-Deployment Checklist

After deployment, verify:

- [ ] Home page loads correctly
- [ ] Pokémon listing works
- [ ] Pokémon detail pages load (test SSR)
- [ ] Dark mode toggle works
- [ ] Navigation between pages
- [ ] Search functionality
- [ ] Team builder
- [ ] Favorites (localStorage works)
- [ ] Collection checklist
- [ ] Damage calculator
- [ ] Audio playback (Pokémon cries)

---

## 🐛 Troubleshooting

### **Build fails with "Module not found"**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
git add .
git commit -m "fix: update dependencies"
git push
```

### **SSR pages return 404**

Check `netlify.toml` redirects:
```toml
[[redirects]]
  from = "/*"
  to = "/.netlify/functions/server"
  status = 200
```

### **localStorage not working**

This is normal on first visit. LocalStorage only works client-side after hydration.

Ensure plugins check for `process.client`:
```typescript
if (process.client) {
  // localStorage code
}
```

### **Build succeeds but site is blank**

Check browser console for errors. Usually a hydration mismatch.

Run locally with production build:
```bash
npm run build
npm run preview
```

### **Fonts not loading**

Nuxt Fonts module handles Google Fonts automatically. If issues occur:
1. Check `nuxt.config.ts` fonts configuration
2. Verify network tab shows font requests
3. Check CSP headers if using strict security

---

## 🎨 Performance Optimization

Netlify automatically provides:

- ✅ **Global CDN** - Fast loading worldwide
- ✅ **Asset Optimization** - Compressed CSS/JS
- ✅ **Image Optimization** - WebP conversion (Nuxt Image)
- ✅ **Brotli Compression** - Smaller file sizes
- ✅ **HTTP/2** - Parallel requests
- ✅ **Instant Rollbacks** - One-click revert

---

## 📈 Monitoring

### **Netlify Analytics** (Optional paid feature)

- Real-time visitor data
- Popular pages
- Top sources
- Bandwidth usage

### **Free Alternatives:**

- Google Analytics (add via Nuxt module)
- Plausible Analytics
- Umami Analytics

---

## 💡 Tips

1. **Preview Deployments**: Every PR gets a unique URL for testing
2. **Deploy Previews**: Test features before merging to main
3. **Environment Branches**: Use different configs for dev/staging/prod
4. **Form Handling**: Netlify Forms work out of the box (if needed later)
5. **Serverless Functions**: Add custom API endpoints in `/server` folder

---

## 🔐 Security

Current security headers (configured in `netlify.toml`):

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Privacy

---

## 📞 Support

- **Netlify Docs**: https://docs.netlify.com
- **Nuxt 3 Docs**: https://nuxt.com/docs/getting-started/deployment#netlify
- **Community**: Netlify Community Forums

---

## 🎉 Your Site is Live!

Once deployed, share your Pokémon app:

```
🌐 Production URL: https://your-app-name.netlify.app
📊 Netlify Dashboard: https://app.netlify.com
🔗 GitHub Repo: https://github.com/iru97/nuxtpokeapp
```

Enjoy your deployed PokéApp! 🚀
