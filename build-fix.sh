#!/bin/bash

echo "🔧 Fixing build issues and deploying..."

# Clean previous builds
rm -rf dist node_modules/.cache

# Build with fixed config
npx vite build --config vite.config.fix.js

# Deploy to Vercel
vercel --prod --yes

echo "✅ Build fixed and deployed!"