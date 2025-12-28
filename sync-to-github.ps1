# Sync to GitHub Script for lead-flow-studio-70
# Run this script after Git is installed

Write-Host "🚀 Syncing Runway DNA App to GitHub..." -ForegroundColor Cyan
Write-Host ""

# Check if git is available
try {
    git --version | Out-Null
    Write-Host "✅ Git is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Initialize git repository if it doesn't exist
if (-not (Test-Path .git)) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Cyan
    git init
    git branch -M main
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

# Check if remote already exists
$remoteExists = git remote | Select-String -Pattern "origin" -Quiet
if (-not $remoteExists) {
    Write-Host "🔗 Adding GitHub remote..." -ForegroundColor Cyan
    git remote add origin https://github.com/agayle8671-cmyk/lead-flow-studio-70.git
    Write-Host "✅ Remote added" -ForegroundColor Green
} else {
    Write-Host "✅ Remote already configured" -ForegroundColor Green
    # Update remote URL in case it changed
    git remote set-url origin https://github.com/agayle8671-cmyk/lead-flow-studio-70.git
}

# Stage all files
Write-Host ""
Write-Host "📝 Staging all files..." -ForegroundColor Cyan
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "💾 Committing changes..." -ForegroundColor Cyan
    git commit -m "Update: Enhanced Runway DNA app with scenario comparison and interactive modals"
    Write-Host "✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No changes to commit" -ForegroundColor Yellow
}

# Push to GitHub
Write-Host ""
Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "   (You may be prompted for GitHub credentials)" -ForegroundColor Yellow
Write-Host ""

try {
    # Try to push
    git push -u origin main
    Write-Host ""
    Write-Host "🎉 Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "📍 Repository: https://github.com/agayle8671-cmyk/lead-flow-studio-70" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "⚠️  Push failed. This is normal if:" -ForegroundColor Yellow
    Write-Host "   1. You need to authenticate with GitHub" -ForegroundColor Yellow
    Write-Host "   2. The repository already has commits" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Try running: git push -u origin main --force" -ForegroundColor Cyan
    Write-Host "(Use --force only if you want to overwrite remote history)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Done! Your code is now on GitHub." -ForegroundColor Green

