# Quick Start: Export Blog Posts to Sanity.io

Get your blog posts exported to Sanity in 5 minutes.

## Step 1: Create Sanity Account (2 minutes)

1. Go to https://www.sanity.io
2. Sign up / Log in
3. Click **"Create new project"**
4. Name it: "Saraiva Vision Blog"
5. Choose region: **US** or **EU**
6. Note your **Project ID** (looks like: `abc123xyz`)

## Step 2: Get API Token (1 minute)

1. Go to https://www.sanity.io/manage
2. Select your project
3. Click **"API"** in sidebar
4. Click **"Tokens"** tab
5. Click **"Add API token"**
6. Name: "Blog Export"
7. Permissions: **Editor**
8. Click **"Create"**
9. **Copy the token** (you'll only see it once!)

## Step 3: Configure Environment (30 seconds)

Add to `.env` file in project root:

```env
SANITY_PROJECT_ID=abc123xyz
SANITY_DATASET=production
SANITY_TOKEN=skAbC123...your_token_here
```

## Step 4: Validate Data (15 seconds)

```bash
npm run sanity:validate
```

Should show: ✅ All posts are valid

## Step 5: Export! (1 minute)

```bash
npm run sanity:export
```

Watch it export all 32 posts!

## Done! 🎉

Your posts are now in Sanity.io!

### View Your Posts

1. Go to https://www.sanity.io/manage
2. Select your project
3. Click **"Vision"** in sidebar
4. Run query: `*[_type == "blogPost"]`

## Next Steps

### Option A: Set Up Sanity Studio (Visual Editor)

```bash
# In a new directory
npm create sanity@latest

# Choose:
# - Use existing project: Saraiva Vision Blog
# - Dataset: production
# - Project output path: ./sanity-studio

cd sanity-studio

# Copy schema
cp ../scripts/sanity/sanity-schema.js schemas/blogPost.js

# Update schemas/index.js (see README)

# Start Studio
npm run dev

# Deploy when ready
sanity deploy
```

### Option B: Query from Frontend

```javascript
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'abc123xyz',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2025-10-25'
})

// Fetch all posts
const posts = await client.fetch('*[_type == "blogPost"] | order(date desc)')
```

### Option C: Hybrid Approach (Recommended)

Keep static files for performance, use Sanity for editing:

1. Content editors use Sanity Studio
2. Build script fetches from Sanity: `npm run build:blog --source=sanity`
3. Generates static files for production
4. Best of both worlds!

## Troubleshooting

### ❌ "Project ID not found"

Check your `.env` file. Project ID should be alphanumeric (no spaces).

### ❌ "Unauthorized"

Your token might be wrong. Create a new one and update `.env`.

### ❌ "Module not found"

Run: `npm install`

## Commands Reference

```bash
npm run sanity:validate    # Check data before export
npm run sanity:export      # Export all posts
npm run sanity:query       # List existing posts
npm run sanity:delete      # Delete all posts (careful!)
```

## Need Help?

- See full documentation: `scripts/sanity/README.md`
- Sanity docs: https://www.sanity.io/docs
- Contact: Dr. Philipe Saraiva Cruz

---

**Time to export**: ~5 minutes
**Posts to export**: 32 blog posts
**Author**: Dr. Philipe Saraiva Cruz
