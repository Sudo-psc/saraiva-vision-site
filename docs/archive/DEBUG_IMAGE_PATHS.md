# Debug: Image 404 Errors - Diagnostic Guide

## Current Status

After deploying with `OptimizedImage` component, still seeing 404 errors in browser console.

### Error Pattern

```
capa-olho-seco-1280w.avif:1 Failed to load resource: 404
```

**Note:** URLs are missing the `/Blog/` prefix!

---

## Root Cause Investigation

### 1. Files Exist on Server ✅

```bash
ls -la /var/www/html/Blog/capa-olho-seco-1280w.avif
# -rw-r--r-- 1 root root 46253 Oct 2 14:51
```

```bash
curl -I https://saraivavision.com.br/Blog/capa-olho-seco-1280w.avif
# HTTP/2 200 ✅
```

### 2. URLs Without Prefix Fail ❌

```bash
curl -I https://saraivavision.com.br/capa-olho-seco-1280w.avif
# HTTP/2 404 ❌
```

### 3. OptimizedImage Logic is Correct ✅

Test extraction logic:
```javascript
const src = '/Blog/capa-olho-seco.png';
const imagePath = src.substring(0, src.lastIndexOf('/') + 1);
// Result: '/Blog/' ✅

const basename = 'capa-olho-seco';
const url = `${imagePath}${basename}-1280w.avif`;
// Result: '/Blog/capa-olho-seco-1280w.avif' ✅
```

---

## Hypothesis: Browser Cache

The browser is **caching old URLs** from before the OptimizedImage fix.

### Evidence:
1. Files exist and are accessible with correct paths
2. Component logic generates correct URLs
3. Fresh deployment completed successfully
4. Errors persist only in cached sessions

---

## Solution Steps

### Step 1: Hard Refresh (Immediate)

**Chrome/Edge:**
1. Open DevTools (F12)
2. Right-click Reload button
3. Select "Empty Cache and Hard Reload"

**Firefox:**
```
Ctrl + Shift + Delete
→ Check "Cache"
→ Time range: "Everything"
→ Clear Now
```

**Safari:**
```
Develop → Empty Caches
(or Cmd + Opt + E)
```

### Step 2: Test in Incognito Mode

Open site in incognito/private browsing:
```
Chrome: Ctrl + Shift + N
Firefox: Ctrl + Shift + P
Safari: Cmd + Shift + N
```

This bypasses all cached data.

### Step 3: Verify Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "avif"
4. Reload page
5. Check **Request URL** column

**Expected:**
```
https://saraivavision.com.br/Blog/capa-olho-seco-1280w.avif
Status: 200
```

**If you see:**
```
https://saraivavision.com.br/capa-olho-seco-1280w.avif
Status: 404
```

Then cache is still active. Clear and retry.

### Step 4: Check Service Worker

Service workers can cache requests aggressively.

**Chrome DevTools:**
1. Application tab
2. Service Workers section
3. Click "Unregister" if any are active
4. Reload page

---

## Verification Commands

### Test Image Accessibility

```bash
# Test with full path (should work)
curl -I https://saraivavision.com.br/Blog/capa-olho-seco-1280w.avif
curl -I https://saraivavision.com.br/Blog/capa-nutricao-visao-768w.avif

# Test without path (should fail)
curl -I https://saraivavision.com.br/capa-olho-seco-1280w.avif
```

### Check Component in Browser Console

Open browser console and run:

```javascript
// Check if OptimizedImage is being used
document.querySelectorAll('picture source[type="image/avif"]').forEach(source => {
  console.log('AVIF srcSet:', source.srcset);
});

// Should show URLs like:
// "/Blog/capa-olho-seco-480w.avif 480w, /Blog/capa-olho-seco-768w.avif 768w, ..."
```

### Enable Logging in OptimizedImage

Edit `src/components/blog/OptimizedImage.jsx` temporarily:

```javascript
// Line 30: Force logging in production
enableLogging = true // Always log
```

Then rebuild and check browser console for diagnostic messages.

---

## Expected Behavior

### Correct srcSet Generation

```html
<picture>
  <source 
    type="image/avif" 
    srcset="/Blog/capa-olho-seco-480w.avif 480w, 
            /Blog/capa-olho-seco-768w.avif 768w, 
            /Blog/capa-olho-seco-1280w.avif 1280w, 
            /Blog/capa-olho-seco-1920w.avif 1920w"
    sizes="(max-width: 640px) 640px, (max-width: 960px) 960px, 1280px"
  />
  <source type="image/webp" srcset="...webp..." />
  <img src="/Blog/capa-olho-seco.png" alt="..." />
</picture>
```

Browser picks best format and size based on:
- Format support (AVIF > WebP > PNG)
- Viewport width
- Device pixel ratio

---

## If Problem Persists

### Scenario 1: URLs Still Wrong in HTML

**Check:** View page source (Ctrl+U) and search for `srcset=`

If URLs are missing `/Blog/`:
1. Component might not be imported correctly
2. Different component might be used
3. Check all files importing blog images

### Scenario 2: Cloudflare/CDN Cache

If using Cloudflare:
```bash
# Purge cache via API
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

Or Dashboard:
1. Caching → Configuration
2. Purge Everything

### Scenario 3: Different Component Used

Search for blog image references:
```bash
grep -r "post.image\|featuredImage" src/ --include="*.jsx" -A3
```

Make sure all use `OptimizedImage`, not plain `<img>`.

---

## Documentation References

- **OptimizedImage Component:** `src/components/blog/OptimizedImage.jsx`
- **LatestBlogPosts (Fixed):** `src/components/LatestBlogPosts.jsx`
- **Troubleshooting:** `docs/BLOG_IMAGES_TROUBLESHOOTING.md`

---

## Test Checklist

Before reporting issues:

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Test in incognito mode
- [ ] Check DevTools Network tab for actual URLs
- [ ] Verify files exist: `curl -I https://saraivavision.com.br/Blog/capa-olho-seco-1280w.avif`
- [ ] Unregister service workers
- [ ] Clear Cloudflare cache (if applicable)
- [ ] Check browser console for `[OptimizedImage]` logs

---

**Last Updated:** October 2, 2025  
**Status:** Investigating browser cache hypothesis
