#!/bin/bash

# Vercel Deployment Script
# Saraiva Vision Site - Simplified Deployment

set -e

echo "🚀 Starting Vercel deployment for Saraiva Vision Site"

# Check if user is logged in
if ! npx vercel whoami > /dev/null 2>&1; then
    echo "🔐 Please login to Vercel first:"
    echo "   Run: npx vercel login"
    echo "   Or visit: https://vercel.com/account/tokens"
    exit 1
fi

# Check build
echo "📦 Testing build..."
npm run build:vercel

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful"

# Deploy with auto-confirm
echo "🚀 Deploying to Vercel..."
npx vercel --prod --yes

echo "✅ Deployment completed!"
echo "🌐 Check your deployment at: https://vercel.com/dashboard"