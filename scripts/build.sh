#!/bin/bash
# Build script that optionally deploys Convex

set -e

# Try to deploy Convex, but don't fail if it doesn't work
if [ -n "$CONVEX_DEPLOY_KEY" ]; then
  echo "Deploying Convex..."
  npx convex deploy || echo "⚠️  Convex deployment skipped (deploy key not configured or deployment failed)"
else
  echo "⚠️  Convex deployment skipped (CONVEX_DEPLOY_KEY not set)"
fi

# Always run the Next.js build
echo "Building Next.js app..."
npm run build

