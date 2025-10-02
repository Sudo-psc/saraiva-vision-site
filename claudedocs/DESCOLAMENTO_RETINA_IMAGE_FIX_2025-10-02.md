# Descolamento de Retina Image Fix - October 2, 2025

## Issue
The blog post "Descolamento de Retina: Mitos e Verdades | Caratinga MG" (ID 19) was not loading the new cover image `descolamento-retina-capa.png` despite multiple deployment attempts.

## Root Cause
The build process includes a **prebuild script** (`scripts/build-blog-posts.js`) that **regenerates** `src/content/blog/posts.json` from markdown files. Any direct edits to `posts.json` were being overwritten during every build.

### Build Flow
```bash
npm run build
  ↓
prebuild: node scripts/build-blog-posts.js  # ← Regenerates posts.json from .md files!
  ↓
build: vite build
  ↓
postbuild: node scripts/prerender-pages.js
```

## Solution
Edited the **source markdown file** instead of the generated JSON:
- **File**: `src/content/blog/descolamento-retina-mitos-verdades-caratinga.md`
- **Changed**: Lines 18 and 28
  - `image: /Blog/capa-descolamento-retina.png` → `image: /Blog/descolamento-retina-capa.png`
  - `ogImage: /Blog/capa-descolamento-retina.png` → `ogImage: /Blog/descolamento-retina-capa.png`

## Image Variants Generated
All responsive variants created and deployed:

### AVIF Format (Modern browsers)
- ✅ `descolamento-retina-capa-480w.avif` (25KB)
- ✅ `descolamento-retina-capa-768w.avif` (48KB)
- ✅ `descolamento-retina-capa-1280w.avif` (92KB)
- ✅ `descolamento-retina-capa-1920w.avif` (158KB)

### WebP Format (Fallback)
- ✅ `descolamento-retina-capa-480w.webp` (32KB)
- ✅ `descolamento-retina-capa-768w.webp` (61KB)
- ✅ `descolamento-retina-capa-1280w.webp` (115KB)
- ✅ `descolamento-retina-capa-1920w.webp` (195KB)

## Deployment Status
```bash
Build: ✅ Successful (27.54s)
Deploy: ✅ rsync to /var/www/html/ complete
Verification: ✅ All 8 image variants return HTTP 200
Bundle: ✅ Contains correct image path "/Blog/descolamento-retina-capa.png"
```

## Testing
```bash
# All variants tested and accessible:
curl -I https://saraivavision.com.br/Blog/descolamento-retina-capa-480w.avif  # 200 OK
curl -I https://saraivavision.com.br/Blog/descolamento-retina-capa-768w.avif  # 200 OK
curl -I https://saraivavision.com.br/Blog/descolamento-retina-capa-1280w.avif # 200 OK
curl -I https://saraivavision.com.br/Blog/descolamento-retina-capa-1920w.avif # 200 OK
# (Same for .webp variants)
```

## Lessons Learned
1. **Always check for prebuild/postbuild scripts** that might regenerate files
2. **Edit source markdown files** for blog posts, not the generated JSON
3. **The build system** uses `gray-matter` to parse frontmatter from .md → JSON
4. **Edit tool** works correctly when targeting the actual source files

## Files Modified
- ✅ `src/content/blog/descolamento-retina-mitos-verdades-caratinga.md` (lines 18, 28)
- ✅ Generated 8 responsive image variants
- ✅ `dist/` rebuilt with correct bundle
- ✅ Deployed to `/var/www/html/`

## Cache Clearing
User should perform hard refresh (Ctrl+Shift+R or Cmd+Shift+R) to see new image immediately.

---
**Status**: ✅ **RESOLVED**
**Date**: October 2, 2025
**Build Time**: 27.54s
**Deploy Method**: rsync
**Verification**: All image variants return HTTP 200
