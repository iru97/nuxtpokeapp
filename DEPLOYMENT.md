# 🚀 Deployment Guide

This guide covers deploying **PokéApp** to production using popular hosting platforms with zero-config deployment.

---

## 🎯 Option 1: Netlify (Auto-Detection)

Netlify auto-detects Nuxt 3 projects, no configuration files needed.

### **Quick Deploy via UI**

1. Go to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"GitHub"** and authorize
4. Select repository: `iru97/nuxtpokeapp`
5. Netlify auto-detects Nuxt 3 and configures:
   - Build command: `npm run build`
   - Publish directory: `.output/public`
6. Click **"Deploy site"**
7. Wait 2-5 minutes
8. Site live at: `https://your-site.netlify.app`

### **Continuous Deployment**

Once connected:
- Every push to `main` → auto-deploys to production
- Every PR → creates preview deployment
- One-click rollback available

### **Custom Domain** (Optional)

1. **Site settings** → **Domain management**
2. **Add custom domain**
3. Configure DNS as instructed

---

## ⚡ Option 2: Vercel (Recommended Alternative)

Vercel has excellent Nuxt 3 support with zero configuration.

### **Deploy via Vercel**

1. Go to [Vercel](https://vercel.com)
2. Click **"Add New Project"**
3. **Import Git Repository** → Select `iru97/nuxtpokeapp`
4. Vercel auto-configures everything
5. Click **"Deploy"**
6. Site live at: `https://your-app.vercel.app`

### **Advantages of Vercel:**
- ✅ Zero configuration required
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments
- ✅ Analytics included (free tier)
- ✅ Edge Functions support

---

## 🌐 Option 3: Cloudflare Pages

Cloudflare Pages offers fast global deployment.

### **Deploy via Cloudflare**

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. **Create a project** → Connect GitHub
3. Select `iru97/nuxtpokeapp`
4. Build settings (auto-detected):
   - Build command: `npm run build`
   - Output directory: `.output/public`
5. **Save and Deploy**
6. Site live on Cloudflare's global network

---

## 🔧 Local Production Preview

Test production build locally before deploying:

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Access at: `http://localhost:3000`

---

## 📋 Build Settings (All Platforms)

If auto-detection fails, use these settings:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Output directory | `.output/public` |
| Install command | `npm install` |
| Node version | 18 or higher |

---

## 🚀 Deployment Workflow

```bash
# 1. Make changes
git add .
git commit -m "feat: new feature"

# 2. Push to GitHub
git push origin main

# 3. Platform auto-deploys (2-5 min)
# ✅ Site updated automatically
```

---

## 📊 Post-Deployment Checklist

Verify these features work after deployment:

- [ ] Home page loads
- [ ] Pokémon listing (with infinite scroll)
- [ ] Pokémon detail pages (SSR)
- [ ] Dark mode toggle
- [ ] Navigation
- [ ] Search & filters
- [ ] Team Builder
- [ ] Favorites (localStorage)
- [ ] Collection Checklist
- [ ] Damage Calculator
- [ ] Pokémon Cries (audio)
- [ ] Moves Database
- [ ] Abilities Database
- [ ] Random Generators

---

## 🐛 Troubleshooting

### **Build Fails**

```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "fix: update dependencies"
git push
```

### **Site Loads but Features Don't Work**

Check browser console for errors. Common issues:

1. **API Rate Limiting**: PokeAPI has rate limits (100 requests/min)
2. **CORS Issues**: Should not occur with PokeAPI
3. **LocalStorage**: Only works client-side after hydration

### **SSR Pages Return Blank**

Run local production build to debug:

```bash
npm run build
npm run preview
```

Check browser console for hydration errors.

### **Audio Not Playing**

Pokémon Cries require:
- HTTPS (production automatically has it)
- User interaction before audio (browser security)
- PokeAPI audio URLs must be accessible

---

## 🎨 Performance Features

All platforms provide:

- ✅ **Global CDN** - Fast loading worldwide
- ✅ **Automatic Compression** - Brotli/Gzip
- ✅ **HTTP/2** - Parallel requests
- ✅ **Asset Optimization** - Minified CSS/JS
- ✅ **Image Optimization** - WebP conversion
- ✅ **Edge Caching** - Faster repeated visits

---

## 📈 Monitoring (Optional)

### **Free Analytics Options:**

1. **Vercel Analytics** (if using Vercel)
   - Built-in, no setup needed
   - Real-time visitor data

2. **Google Analytics**
   ```bash
   npm install @nuxtjs/google-analytics
   ```

3. **Plausible** or **Umami**
   - Privacy-friendly
   - GDPR compliant

---

## 💡 Platform Comparison

| Feature | Netlify | Vercel | Cloudflare Pages |
|---------|---------|--------|------------------|
| Auto-detection | ✅ | ✅ | ✅ |
| Free tier | ✅ 100GB/mo | ✅ 100GB/mo | ✅ Unlimited |
| Build minutes | 300/mo | 6000/mo | 500/mo |
| Analytics | Paid | Free | Limited |
| Edge functions | ✅ | ✅ | ✅ |
| DDoS protection | ✅ | ✅ | ✅ Strong |

**Recommendation:**
- **Vercel** - Best DX, generous free tier
- **Cloudflare Pages** - Best performance, unlimited bandwidth
- **Netlify** - Most popular, good ecosystem

---

## 🔐 Environment Variables (If Needed Later)

Currently not needed, but for future reference:

**Netlify/Vercel/Cloudflare:**
1. Go to **Project Settings**
2. **Environment Variables**
3. Add variables (e.g., `API_KEY`, `DATABASE_URL`)

Access in Nuxt:
```typescript
const config = useRuntimeConfig()
console.log(config.public.apiBase) // Already configured for PokeAPI
```

---

## 🎉 Your Site is Live!

Once deployed:

```
🌐 Live URL: https://your-app.[platform].app
📊 Dashboard: Check your platform's dashboard
🔗 GitHub: https://github.com/iru97/nuxtpokeapp
```

Share your Pokémon app with the world! 🚀

---

## 📞 Resources

- **Nuxt Deployment**: https://nuxt.com/docs/getting-started/deployment
- **Netlify Docs**: https://docs.netlify.com
- **Vercel Docs**: https://vercel.com/docs
- **Cloudflare Docs**: https://developers.cloudflare.com/pages
