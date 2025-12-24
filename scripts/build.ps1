# PowerShell build script for Windows (Vercel uses bash, but including for completeness)
# Build script that optionally deploys Convex

$ErrorActionPreference = "Continue"

# Try to deploy Convex, but don't fail if it doesn't work
if ($env:CONVEX_DEPLOY_KEY) {
  Write-Host "Deploying Convex..."
  npx convex deploy
  if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Convex deployment skipped (deployment failed)" -ForegroundColor Yellow
  }
} else {
  Write-Host "⚠️  Convex deployment skipped (CONVEX_DEPLOY_KEY not set)" -ForegroundColor Yellow
}

# Always run the Next.js build
Write-Host "Building Next.js app..."
npm run build

