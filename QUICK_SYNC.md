# 🚀 Quick Sync to GitHub

Your repository: https://github.com/agayle8671-cmyk/lead-flow-studio-70

## Option 1: Using PowerShell Script (Easiest)

1. Make sure Git is installed: https://git-scm.com/download/win
2. Run this in PowerShell:
   ```powershell
   .\sync-to-github.ps1
   ```

## Option 2: Manual Commands (Copy & Paste)

Open PowerShell in this folder and run these commands one by one:

```powershell
# Initialize git (if not already done)
git init
git branch -M main

# Add GitHub remote
git remote add origin https://github.com/agayle8671-cmyk/lead-flow-studio-70.git

# Stage all files
git add .

# Commit changes
git commit -m "Update: Enhanced Runway DNA app with scenario comparison and interactive modals"

# Push to GitHub
git push -u origin main
```

**Note:** When prompted for credentials:
- Username: Your GitHub username
- Password: Use a Personal Access Token (not your password)
  - Create token: https://github.com/settings/tokens
  - Select scope: `repo`

## Option 3: Using GitHub Desktop (Visual)

1. Download: https://desktop.github.com/
2. File → Add Local Repository
3. Choose this folder
4. Click "Publish repository"
5. Choose "agayle8671-cmyk/lead-flow-studio-70"

## After Pushing to GitHub

Your code will be live at: https://github.com/agayle8671-cmyk/lead-flow-studio-70

To deploy to live site:
- **Vercel**: Connect repo at https://vercel.com (auto-deploys on every push)
- **Netlify**: Import project at https://netlify.com (auto-deploys on every push)

