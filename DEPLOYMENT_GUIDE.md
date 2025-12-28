# 🚀 Deployment Guide: Syncing to GitHub & Going Live

## Step 1: Install Git (if not installed)

1. Download Git from: https://git-scm.com/download/win
2. Install with default settings
3. Restart your terminal/command prompt after installation

## Step 2: Initialize Git Repository

Open PowerShell/Terminal in your project folder and run:

```bash
# Initialize git repository
git init

# Configure your identity (replace with your GitHub username/email)
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Step 3: Create Initial Commit

```bash
# Add all files
git add .

# Create your first commit
git commit -m "Initial commit: Runway DNA App"

# Optional: Check status
git status
```

## Step 4: Create GitHub Repository

1. Go to https://github.com and sign in
2. Click the **"+"** icon → **"New repository"**
3. Name it (e.g., `runway-dna-app`)
4. **DO NOT** initialize with README, .gitignore, or license (you already have these)
5. Click **"Create repository"**

## Step 5: Connect & Push to GitHub

GitHub will show you commands. Use these:

```bash
# Add GitHub as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename default branch to 'main' (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

You'll be prompted for your GitHub username and password (use a Personal Access Token, not your password - see below).

## Step 6: Create Personal Access Token (for authentication)

Since GitHub no longer accepts passwords:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **"Generate new token (classic)"**
3. Give it a name like "Runway DNA Deployment"
4. Select scopes: **`repo`** (full control)
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you won't see it again!)
7. Use this token as your password when pushing

## Step 7: Deploy to Live (Choose One Option)

### Option A: Deploy to Vercel (Recommended - Easiest)

1. Go to https://vercel.com and sign up/login with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel auto-detects Vite settings - click **"Deploy"**
5. Your app will be live at `your-app.vercel.app` in ~2 minutes!

**Auto-deploy**: Every push to `main` branch auto-deploys.

### Option B: Deploy to Netlify

1. Go to https://netlify.com and sign up/login
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select your repository
4. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **"Deploy site"**

### Option C: Deploy to GitHub Pages

1. Install GitHub Pages package:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json` scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. Add to `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/REPO_NAME/', // Replace with your repo name
     // ... rest of config
   })
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

## Step 8: Future Updates (Regular Workflow)

Every time you make changes:

```bash
# 1. Check what changed
git status

# 2. Add changed files
git add .

# 3. Commit with a message
git commit -m "Description of your changes"

# 4. Push to GitHub
git push

# 5. Your deployment platform (Vercel/Netlify) will auto-deploy!
```

## Quick Commands Reference

```bash
# See what changed
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest from GitHub
git pull

# See commit history
git log --oneline
```

## Troubleshooting

**"git: command not found"**
- Install Git from https://git-scm.com/download/win

**"Permission denied"**
- Check your Personal Access Token is correct
- Regenerate token if needed

**"Repository not found"**
- Verify repository name and that you have access
- Check remote URL: `git remote -v`

---

🎉 **Once deployed, your app will update automatically every time you push to GitHub!**


