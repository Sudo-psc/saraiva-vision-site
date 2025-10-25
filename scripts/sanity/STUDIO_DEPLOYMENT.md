# Sanity Studio Deployment Guide

Complete guide to deploy Sanity Studio for managing Saraiva Vision blog posts.

**Author**: Dr. Philipe Saraiva Cruz
**Date**: 2025-10-25
**Status**: Ready for deployment

---

## 🎯 What is Sanity Studio?

Sanity Studio is a **visual content management interface** (like WordPress admin) that runs in your browser. It provides:

- 📝 Rich text editor for blog posts
- 🖼️ Drag & drop media management
- 👥 Collaborative editing
- 📋 Content preview
- 🔄 Version history
- 👤 Role-based permissions

---

## 🚀 Deployment Options

### Option 1: Sanity-Hosted (Recommended - Easiest)

**Best for**: Quick setup, no infrastructure management
**URL**: `https://saraivavision.sanity.studio`
**Cost**: Free
**Setup Time**: 5 minutes

### Option 2: Self-Hosted

**Best for**: Custom domain, full control
**URL**: `https://studio.saraivavision.com.br` (your domain)
**Cost**: Hosting costs only
**Setup Time**: 15-30 minutes

---

## 📦 Option 1: Deploy to Sanity Hosting

### Prerequisites

1. **Sanity account created** ✓
2. **Blog posts exported** ✓
3. **Studio project created**

### Step 1: Create Studio Project

```bash
# In a new directory (outside your main project)
cd ~
mkdir saraivavision-studio
cd saraivavision-studio

# Create Sanity Studio
npm create sanity@latest
```

**Configuration prompts**:
```
✔ Project name: Saraiva Vision Studio
✔ Use the default dataset configuration? Yes
✔ Would you like to add configuration files? Yes
✔ Project output path: .
✔ Select project to use: saraivavision (use existing)
✔ Select dataset to use: production
✔ Would you like to add the blog schema? No (we'll add ours)
```

### Step 2: Add Blog Schema

Copy your schema to the Studio:

```bash
# Copy schema from main project
cp /home/saraiva-vision-site/scripts/sanity/sanity-schema.js \
   ./schemas/blogPost.js
```

Edit `schemas/index.js`:

```javascript
import { blogPostSchema } from './blogPost'

export default createSchema({
  name: 'default',
  types: schemaTypes.concat([
    blogPostSchema
  ])
})
```

### Step 3: Configure Studio

Edit `sanity.cli.ts`:

```typescript
import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'YOUR_PROJECT_ID', // From .env
    dataset: 'production'
  },
  studioHost: 'saraivavision' // Your desired subdomain
})
```

### Step 4: Deploy!

```bash
# Install dependencies
npm install

# Deploy to Sanity hosting
npx sanity deploy
```

**You'll be asked**:
```
? Studio hostname (<value>.sanity.studio): saraivavision
```

**Result**: Studio live at `https://saraivavision.sanity.studio` 🎉

### Step 5: Verify Deployment

1. Open `https://saraivavision.sanity.studio`
2. Sign in with your Sanity account
3. You should see all 32 blog posts!

---

## 🏗️ Option 2: Self-Host on Your Domain

### Prerequisites

1. Domain configured (e.g., `studio.saraivavision.com.br`)
2. Hosting platform (Vercel, Netlify, or your VPS)

### Step 1: Create Studio Project

Same as Option 1, Steps 1-2.

### Step 2: Configure for Self-Hosting

Edit `sanity.cli.ts`:

```typescript
import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET
  }
  // No studioHost - we're self-hosting
})
```

Create `.env.local`:

```env
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

### Step 3: Add CORS Origins

**Critical**: Tell Sanity which domains can access your data.

1. Go to https://www.sanity.io/manage
2. Select your project
3. Go to **API** → **CORS Origins**
4. Add origin: `https://studio.saraivavision.com.br`
5. Allow credentials: **Yes**

### Step 4: Build Studio

```bash
npm run build
```

This creates a `dist/` folder with static files.

### Step 5A: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure:
# - Root Directory: . (current)
# - Build Command: npm run build
# - Output Directory: dist
```

Add to `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Step 5B: Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

Add `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 5C: Deploy to Your VPS (Nginx)

Copy files to VPS:

```bash
# Build locally
npm run build

# Copy to server
scp -r dist/* user@31.97.129.78:/var/www/studio-saraivavision/
```

Nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name studio.saraivavision.com.br;

    ssl_certificate /etc/letsencrypt/live/studio.saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/studio.saraivavision.com.br/privkey.pem;

    root /var/www/studio-saraivavision;
    index index.html;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

---

## 📱 Option 3: Embed in Main Application

If you want Studio at `https://saraivavision.com.br/admin`:

### Step 1: Install Studio as Dependency

In your main project:

```bash
npm install sanity @sanity/vision
```

### Step 2: Create Studio Config

Create `src/studio/sanity.config.ts`:

```typescript
import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {blogPostSchema} from './schemas/blogPost'

export default defineConfig({
  name: 'default',
  title: 'Saraiva Vision Studio',

  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,

  basePath: '/admin',

  plugins: [deskTool()],

  schema: {
    types: [blogPostSchema],
  },
})
```

### Step 3: Create Admin Route

Create `src/pages/AdminPage.jsx`:

```jsx
import { Studio } from 'sanity'
import config from '../studio/sanity.config'

export default function AdminPage() {
  return <Studio config={config} />
}
```

### Step 4: Add to Router

In your React Router config:

```javascript
import AdminPage from './pages/AdminPage'

const routes = [
  // ... other routes
  {
    path: '/admin',
    element: <AdminPage />
  }
]
```

### Step 5: Update Vite Config

Edit `vite.config.js`:

```javascript
export default defineConfig({
  // ... existing config

  // Allow Sanity CLI base path
  server: {
    historyApiFallback: true
  }
})
```

Update `sanity.cli.ts`:

```typescript
export default defineCliConfig({
  project: {
    basePath: '/admin'
  }
})
```

**Result**: Studio accessible at `https://saraivavision.com.br/admin` 🎉

---

## 🔄 CI/CD Automated Deployment

### GitHub Actions

Create `.github/workflows/deploy-studio.yml`:

```yaml
name: Deploy Sanity Studio

on:
  push:
    branches: [main]
    paths:
      - 'studio/**'

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci
        working-directory: ./studio

      - name: Deploy to Sanity
        run: npx sanity deploy
        working-directory: ./studio
        env:
          SANITY_AUTH_TOKEN: ${{ secrets.SANITY_AUTH_TOKEN }}
```

**Get deployment token**:
1. Go to https://www.sanity.io/manage
2. Select project → **API** → **Tokens**
3. Create token: "Deploy Token" with **Deploy Studio** permission
4. Copy token
5. Add to GitHub: Settings → Secrets → `SANITY_AUTH_TOKEN`

---

## 🎨 Customizing Studio

### Add Logo

Place logo in `static/logo.png`:

```typescript
export default defineConfig({
  // ... config

  studio: {
    components: {
      logo: () => (
        <img
          src="/static/logo.png"
          alt="Saraiva Vision"
          style={{ height: 40 }}
        />
      )
    }
  }
})
```

### Custom Colors

```typescript
export default defineConfig({
  // ... config

  theme: {
    colors: {
      primary: '#0066cc', // Saraiva Vision blue
      success: '#00c853',
      warning: '#ff9800',
      danger: '#f44336'
    }
  }
})
```

### Add Custom Actions

```typescript
export default defineConfig({
  // ... config

  document: {
    actions: (prev, context) => {
      // Add custom publish workflow
      return [
        ...prev,
        {
          label: 'Publish & Notify',
          onHandle: async () => {
            // Custom logic
          }
        }
      ]
    }
  }
})
```

---

## 👥 Managing Users

### Add Editors

1. Go to https://www.sanity.io/manage
2. Select project → **Members**
3. Click **Invite member**
4. Choose role:
   - **Administrator**: Full access
   - **Editor**: Edit content only
   - **Viewer**: Read-only access

### Roles & Permissions

Example custom role configuration:

```typescript
export default defineConfig({
  // ... config

  document: {
    productionUrl: async (prev, context) => {
      const { document } = context
      return `https://saraivavision.com.br/blog/${document.slug.current}`
    }
  }
})
```

---

## 📊 Monitoring & Analytics

### Enable Insights

In Sanity Dashboard:
1. Select project → **Insights**
2. Enable analytics
3. Track:
   - Content changes
   - User activity
   - API usage

### Studio Logs

View real-time logs:

```bash
# In studio directory
npx sanity debug --log-level info
```

---

## 🔒 Security Best Practices

### 1. CORS Configuration

Only allow your actual domains:
```
✅ https://saraivavision.sanity.studio
✅ https://studio.saraivavision.com.br
✅ http://localhost:3333 (dev only)
❌ https://*.sanity.studio (too broad)
```

### 2. API Tokens

- **Deploy Token**: Only for CI/CD (Deploy Studio permission)
- **Editor Token**: For content editing (Editor permission)
- **Read Token**: For frontend (Viewer permission)

Never commit tokens to git!

### 3. Environment Variables

Use different tokens per environment:

```env
# .env.production
SANITY_STUDIO_PROJECT_ID=prod-project-id
SANITY_AUTH_TOKEN=prod-token

# .env.staging
SANITY_STUDIO_PROJECT_ID=staging-project-id
SANITY_AUTH_TOKEN=staging-token
```

---

## 🧪 Testing Studio Changes

### Local Development

```bash
# In studio directory
npm run dev

# Opens at http://localhost:3333
```

### Preview Before Deploy

```bash
# Build locally
npm run build

# Serve locally
npx serve dist -p 3000
```

---

## 🚨 Troubleshooting

### Issue: "Studio not loading"

**Check**:
1. CORS origins configured correctly?
2. Project ID correct in config?
3. Browser console errors?

**Solution**:
```bash
# Verify config
npx sanity debug

# Check CORS
curl -I https://YOUR_PROJECT.api.sanity.io/v1/data/query/production
```

### Issue: "Changes not appearing"

**Check**:
1. Correct dataset (production vs staging)?
2. Content published (not draft)?
3. Cache cleared?

**Solution**:
```bash
# Force rebuild
rm -rf dist/ .sanity/
npm run build

# Redeploy
npx sanity deploy
```

### Issue: "Deploy fails in CI/CD"

**Check**:
1. `SANITY_AUTH_TOKEN` set in CI?
2. Token has Deploy Studio permission?
3. `sanity.cli.ts` configured with studioHost?

**Solution**:
Create new deploy token with correct permissions.

---

## 📚 Useful Commands

```bash
# Development
npm run dev                    # Start local dev server

# Building
npm run build                  # Build for production
npm run build -- --stats      # Build with stats

# Deployment
npx sanity deploy             # Deploy to Sanity hosting
npx sanity deploy --no-build  # Skip build, deploy only
npx sanity undeploy           # Remove from Sanity hosting

# Management
npx sanity manage             # Open project dashboard
npx sanity debug              # Show debug info
npx sanity check              # Validate config
npx sanity dataset list       # List datasets
npx sanity cors list          # List CORS origins

# Data
npx sanity dataset export     # Export dataset
npx sanity dataset import     # Import dataset
```

---

## 🎯 Recommended Setup for Saraiva Vision

Based on your project, I recommend:

### Setup: Sanity-Hosted Studio + Hybrid Frontend

**Why**:
- ✅ Easiest to maintain
- ✅ No infrastructure costs
- ✅ Fast deployment
- ✅ Keep existing performance

**Architecture**:
```
Content Editing:
  └─ https://saraivavision.sanity.studio (Sanity-hosted)

Production Site:
  ├─ Static files (current approach)
  └─ Generated from Sanity at build time

Workflow:
  1. Edit in Studio → 2. Webhook triggers build → 3. Static files updated
```

### Implementation

1. **Deploy Studio** (Option 1)
   ```bash
   npx sanity deploy
   ```

2. **Add Build Webhook**
   - Sanity Dashboard → Project → **API** → **Webhooks**
   - URL: Your CI/CD webhook endpoint
   - Trigger: On document changes

3. **Update Build Script**
   - Fetch from Sanity during build
   - Generate static files
   - Deploy to production

**Result**: Visual editing + Static site performance 🚀

---

## 📞 Support

- **Sanity Docs**: https://www.sanity.io/docs
- **Community Slack**: https://slack.sanity.io
- **Project Contact**: Dr. Philipe Saraiva Cruz

---

**Status**: ✅ Ready to deploy
**Recommended**: Option 1 (Sanity-hosted)
**Time to Deploy**: 5-10 minutes

Deploy your Studio now and start managing content visually! 🎉
