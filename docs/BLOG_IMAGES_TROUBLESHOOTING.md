# Blog Images Troubleshooting Guide

## Quick Diagnosis

### ✅ Images Are Working (Confirmed Oct 2, 2025)

All blog cover images are correctly deployed and accessible:
- ✓ `capa-olho-seco-{480w,768w,1280w,1920w}.avif`
- ✓ `capa-nutricao-visao-{480w,768w,1280w,1920w}.avif`
- ✓ `capa-lentes-presbiopia-{480w,768w,1280w,1920w}.avif`
- ✓ `capa-terapias-geneticas-{480w,768w,1280w,1920w}.avif`
- ✓ `capa-estrabismo-tratamento-{480w,768w,1280w,1920w}.avif`

**Production URLs return HTTP 200:**
```bash
curl -I https://saraivavision.com.br/Blog/capa-olho-seco-1280w.avif
# HTTP/2 200
```

---

## If You See 404 Errors

### 1. Clear Browser Cache

The most common cause is **cached 404 responses** from before deployment.

**Chrome/Edge:**
```
1. Open DevTools (F12)
2. Right-click Reload button
3. Select "Empty Cache and Hard Reload"
```

**Firefox:**
```
Ctrl+Shift+Delete → Check "Cache" → Clear Now
```

**Safari:**
```
Develop → Empty Caches (or Cmd+Opt+E)
```

### 2. Check CDN/Proxy Cache

If using Cloudflare:
```bash
# Purge cache for specific images
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://saraivavision.com.br/Blog/capa-olho-seco-1280w.avif"]}'
```

Or use Cloudflare Dashboard:
1. Cache → Configuration → Purge Cache
2. Select "Custom Purge" → Enter URLs

### 3. Verify Nginx is Serving Files

SSH into VPS:
```bash
# Check if files exist
ls -la /var/www/saraivavision/dist/Blog/capa-*.avif

# Test nginx directly (bypass CDN)
curl -I http://localhost/Blog/capa-olho-seco-1280w.avif

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### 4. Validate Build Output

Before deploying:
```bash
# Run validation script
npm run validate:blog-images

# Or manually
./scripts/verify-blog-images.sh

# Check dist folder
find dist/Blog -name "*.avif" | wc -l
# Should show 400+ AVIF files
```

---

## How Image Optimization Works

### Component Flow

1. **Blog posts reference base images:**
   ```json
   {
     "image": "/Blog/capa-olho-seco.png"
   }
   ```

2. **OptimizedImage component generates responsive srcSets:**
   ```jsx
   <picture>
     <source type="image/avif" srcSet="
       /Blog/capa-olho-seco-480w.avif 480w,
       /Blog/capa-olho-seco-768w.avif 768w,
       /Blog/capa-olho-seco-1280w.avif 1280w,
       /Blog/capa-olho-seco-1920w.avif 1920w
     " />
     <source type="image/webp" srcSet="..." />
     <img src="/Blog/capa-olho-seco.png" alt="..." />
   </picture>
   ```

3. **Browser selects best format:**
   - AVIF (90% size reduction) if supported
   - WebP (30% size reduction) if AVIF not available
   - PNG/JPEG as final fallback

### File Structure

```
public/Blog/
├── capa-olho-seco.png              (original - 1.2MB)
├── capa-olho-seco-480w.avif        (20KB)
├── capa-olho-seco-768w.avif        (35KB)
├── capa-olho-seco-1280w.avif       (60KB)
├── capa-olho-seco-1920w.avif       (90KB)
├── capa-olho-seco-480w.webp        (25KB)
└── ... (same pattern for all images)
```

**Symlinks** are used for alternative naming:
```bash
capa-olho-seco-768w.avif → capa-pad-768w.avif
capa-nutricao-visao-768w.avif → capa-alimentacao-microbioma-ocular-768w.avif
```

Vite **automatically dereferences symlinks** during build, copying actual files to `dist/`.

---

## Prevention: Pre-Build Validation

Add to `package.json`:
```json
{
  "scripts": {
    "prebuild": "npm run validate:blog-images",
    "validate:blog-images": "./scripts/verify-blog-images.sh"
  }
}
```

This prevents deploying if images are missing.

---

## Nginx Configuration (Reference)

Ensure AVIF MIME type is configured:
```nginx
# /etc/nginx/mime.types
types {
    image/avif  avif;
}

# Blog assets caching
location ~* ^/Blog/.*\.(avif|webp|png|jpe?g)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept";
    try_files $uri =404;
}
```

Reload nginx after changes:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## Testing Checklist

Before reporting issues:

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Test in incognito/private mode
- [ ] Check DevTools Network tab (filter by "avif")
- [ ] Verify files exist in `dist/Blog/` locally
- [ ] Test direct URL: `https://saraivavision.com.br/Blog/capa-olho-seco-1280w.avif`
- [ ] Check browser console for OptimizedImage errors
- [ ] Verify nginx error logs on VPS

---

## Related Files

- **Component:** `src/components/blog/OptimizedImage.jsx`
- **Validation:** `scripts/verify-blog-images.sh`
- **Config:** `vite.config.js` (line 222: `assetsInclude`)
- **Posts:** `src/content/blog/posts.json`

---

## Contact

If issues persist after following this guide, provide:
1. Screenshot of DevTools Network tab showing 404
2. Browser and version
3. Output of `./scripts/verify-blog-images.sh`
4. Nginx error log snippet

Last verified: **October 2, 2025** ✅
