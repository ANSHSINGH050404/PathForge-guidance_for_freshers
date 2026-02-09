# 🚀 Vercel Deployment Guide - Guidance for Freshers

## 📋 Pre-Deployment Checklist

Before deploying to Vercel, ensure you have:

- [x] GitHub account
- [x] Vercel account (sign up at [vercel.com](https://vercel.com))
- [x] All environment variables ready
- [x] Database accessible from internet (Neon is already cloud-based ✅)
- [x] OAuth callback URLs ready to update

---

## 🔧 Step 1: Prepare Your Project

### 1.1 Create `.env.example` File

This helps others (and Vercel) know what environment variables are needed:

```bash
# Create example env file
cp .env .env.example
```

Then edit `.env.example` and replace actual values with placeholders:

```env
# Database
DATABASE_URL=postgresql://your_neon_connection_string

# Authentication
BETTER_AUTH_SECRET=your_secret_here_use_openssl_rand_hex_32
BETTER_AUTH_URL=https://your-app.vercel.app

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# AI
GOOGLE_API_KEY=your_google_api_key

# Optional: Custom AI Models
GEMINI_MODEL_CAREER_PATH=gemini-2.0-flash
GEMINI_MODEL_CAREER=gemini-2.0-flash
GEMINI_MODEL_RESUME=gemini-1.5-flash
```

### 1.2 Update `.gitignore`

Ensure `.env` is in `.gitignore` (already done ✅):

```
.env
.env.local
.env.production
```

### 1.3 Verify Build Works Locally

```bash
npm run build
```

Expected output: ✅ Compiled successfully

---

## 📦 Step 2: Push to GitHub

### 2.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - Ready for Vercel deployment"
```

### 2.2 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name: `guidance-for-freshers`
3. Description: "AI-powered career guidance platform for fresh graduates"
4. Visibility: Public (or Private)
5. Click "Create repository"

### 2.3 Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/guidance-for-freshers.git

# Push code
git branch -M main
git push -u origin main
```

---

## 🌐 Step 3: Deploy to Vercel

### 3.1 Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `guidance-for-freshers` repository
4. Click "Import"

### 3.2 Configure Project Settings

**Framework Preset:** Next.js (auto-detected ✅)

**Root Directory:** `./` (leave as default)

**Build Command:** `npm run build` (auto-detected ✅)

**Output Directory:** `.next` (auto-detected ✅)

**Install Command:** `npm install` (auto-detected ✅)

### 3.3 Add Environment Variables

Click "Environment Variables" and add ALL variables from your `.env` file:

#### Required Variables

```
DATABASE_URL = postgresql://neondb_owner:YOUR_NEON_PASSWORD@ep-YOUR_NEON_PROJECT.neon.tech/neondb?sslmode=require

BETTER_AUTH_SECRET = YOUR_BETTER_AUTH_SECRET

BETTER_AUTH_URL = https://your-app-name.vercel.app
(⚠️ Update this after deployment!)

NEXT_PUBLIC_BETTER_AUTH_URL = https://your-app-name.vercel.app
(⚠️ MUST match BETTER_AUTH_URL!)

GOOGLE_CLIENT_ID = YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com

GOOGLE_CLIENT_SECRET = YOUR_GOOGLE_CLIENT_SECRET

GITHUB_CLIENT_ID = YOUR_GITHUB_CLIENT_ID

GITHUB_CLIENT_SECRET = YOUR_GITHUB_CLIENT_SECRET

GOOGLE_API_KEY = YOUR_GOOGLE_API_KEY
```

#### Optional Variables

```
GEMINI_MODEL_CAREER_PATH = gemini-2.0-flash
GEMINI_MODEL_CAREER = gemini-2.0-flash
GEMINI_MODEL_RESUME = gemini-1.5-flash
```

**Important:** For each variable, select environment: `Production`, `Preview`, `Development`

### 3.4 Deploy

Click **"Deploy"** button

⏳ Wait 2-3 minutes for deployment...

✅ Deployment successful!

---

## 🔐 Step 4: Update OAuth Callback URLs

After deployment, you'll get a URL like: `https://guidance-for-freshers.vercel.app`

### 4.1 Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Add to **Authorized redirect URIs:**
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
6. Click "Save"

### 4.2 Update GitHub OAuth

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "OAuth Apps"
3. Select your app
4. Update **Authorization callback URL:**
   ```
   https://your-app-name.vercel.app/api/auth/callback/github
   ```
5. Click "Update application"

### 4.3 Update BETTER_AUTH_URL in Vercel

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Find `BETTER_AUTH_URL`
4. Click "Edit"
5. Update to: `https://your-actual-app-name.vercel.app`
6. Click "Save"
7. **Redeploy:** Go to "Deployments" → Click "..." → "Redeploy"

---

## 🗄️ Step 5: Run Database Migrations

### Option 1: Run Locally (Recommended)

```bash
# Generate migration
npx drizzle-kit generate

# Push to database
npx drizzle-kit push
```

### Option 2: Run in Vercel (if needed)

Add a migration script to `package.json`:

```json
{
  "scripts": {
    "migrate": "drizzle-kit push"
  }
}
```

Then in Vercel dashboard:

1. Go to "Settings" → "General"
2. Scroll to "Build & Development Settings"
3. Add to "Install Command": `npm install && npm run migrate`

---

## ✅ Step 6: Verify Deployment

### 6.1 Check Homepage

Visit: `https://your-app-name.vercel.app`

Expected: ✅ Homepage loads with all sections

### 6.2 Test Authentication

1. Click "Sign In"
2. Try Google OAuth
3. Try GitHub OAuth
4. Verify you're redirected back and logged in

### 6.3 Test AI Features

1. **Career Path Builder:**
   - Select a career path
   - Choose tech stack
   - Generate roadmap
   - Verify AI response

2. **Resume Analyzer:**
   - Upload a PDF resume
   - Verify analysis works

3. **Career Guide:**
   - Enter skills
   - Verify recommendations

### 6.4 Test Free Trial Limits

1. Open incognito window
2. Try Career Path Builder 3 times
3. 4th attempt should show "Free trial limit exceeded"

---

## 🐛 Common Issues & Solutions

### Issue 1: "Module not found" Error

**Solution:**

```bash
# Ensure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Issue 2: OAuth Redirect Mismatch

**Error:** "redirect_uri_mismatch"

**Solution:**

- Double-check callback URLs in Google/GitHub match exactly
- Ensure no trailing slashes
- Wait 5 minutes for changes to propagate

### Issue 3: Database Connection Error

**Error:** "ECONNREFUSED" or "Connection timeout"

**Solution:**

- Verify `DATABASE_URL` is correct in Vercel
- Check Neon database is active
- Ensure connection string includes `sslmode=require`

### Issue 4: Environment Variables Not Working

**Solution:**

1. Go to Vercel → Settings → Environment Variables
2. Ensure all variables are set for "Production"
3. Redeploy the application

### Issue 5: Build Fails

**Solution:**

```bash
# Check build locally first
npm run build

# Fix any TypeScript errors
# Then push changes
git add .
git commit -m "Fix build errors"
git push
```

---

## 🔧 Advanced Configuration

### Custom Domain (Optional)

1. Go to Vercel project → "Settings" → "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Update `BETTER_AUTH_URL` to your custom domain
5. Update OAuth callback URLs

### Environment-Specific Variables

**Production only:**

```
NODE_ENV = production
```

**Preview/Development:**

```
BETTER_AUTH_URL = https://preview-branch.vercel.app
```

### Performance Optimization

Add to `next.config.ts`:

```typescript
const nextConfig = {
  // Enable compression
  compress: true,

  // Optimize images
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },

  // Enable React strict mode
  reactStrictMode: true,
};
```

---

## 📊 Monitoring & Analytics

### Enable Vercel Analytics

1. Go to your project dashboard
2. Click "Analytics" tab
3. Click "Enable Analytics"
4. Free tier: 100k events/month

### Enable Vercel Speed Insights

1. Install package:

   ```bash
   npm install @vercel/speed-insights
   ```

2. Add to `app/layout.tsx`:

   ```typescript
   import { SpeedInsights } from '@vercel/speed-insights/next';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <SpeedInsights />
         </body>
       </html>
     );
   }
   ```

### Error Monitoring (Recommended)

Install Sentry:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 🚀 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel automatically deploys! 🎉
```

**Preview Deployments:**

- Every branch gets a preview URL
- Perfect for testing before merging to main

---

## 📝 Post-Deployment Checklist

- [ ] Homepage loads correctly
- [ ] Google OAuth works
- [ ] GitHub OAuth works
- [ ] Career Path Builder generates roadmaps
- [ ] Resume Analyzer processes PDFs
- [ ] Career Guide provides recommendations
- [ ] Free trial limits work correctly
- [ ] Rate limiting is functional
- [ ] Mobile responsive design works
- [ ] All environment variables are set
- [ ] Database migrations are applied
- [ ] Custom domain configured (if applicable)
- [ ] Analytics enabled
- [ ] Error monitoring set up

---

## 🎉 Success!

Your app is now live at: `https://your-app-name.vercel.app`

### Share Your Project

**GitHub README Badge:**

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/guidance-for-freshers)
```

**Social Media:**

```
🚀 Just deployed my AI-powered career guidance platform!

✨ Features:
- Personalized learning roadmaps
- AI resume analysis
- Career recommendations

Built with Next.js, TypeScript, and Google Gemini AI

🔗 Live: https://your-app-name.vercel.app
💻 Code: https://github.com/YOUR_USERNAME/guidance-for-freshers

#NextJS #AI #WebDev #CareerGuidance
```

---

## 📞 Support

### Vercel Documentation

- [Next.js Deployment](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)

### Need Help?

- Vercel Discord: [vercel.com/discord](https://vercel.com/discord)
- Vercel Support: [vercel.com/support](https://vercel.com/support)

---

**Deployment Guide Version:** 1.0  
**Last Updated:** February 9, 2026  
**Estimated Deployment Time:** 15-20 minutes
