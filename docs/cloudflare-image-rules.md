# Cloudflare Image Optimization Rules
# For Saraiva Vision Blog Images

## 1. Transform Rule - Format Negotiation

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/transform_rules" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rules": [
      {
        "description": "Image format negotiation for Blog assets",
        "expression": "(http.request.uri.path contains \"/Blog/\" && http.request.uri.path.extension in {\"avif\" \"webp\" \"png\" \"jpg\" \"jpeg\"})",
        "action": {
          "rewrite": {
            "url": {
              "expression": "concat(\"/Blog/\", http.request.uri.path.filename, http.request.uri.path.extension == \"avif\" ? \".avif\" : http.request.uri.path.extension == \"webp\" ? \".webp\" : http.request.uri.path.extension == \"png\" ? \".png\" : http.request.uri.path.extension == \"jpg\" ? \".jpg\" : http.request.uri.path.extension == \"jpeg\" ? \".jpeg\" : \"\")"
            }
          }
        },
        "enabled": true
      }
    ]
  }'
```

## 2. Cache Rule - Optimized Images

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/cache_rules" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rules": [
      {
        "description": "Aggressive caching for optimized blog images",
        "expression": "http.request.uri.path contains \"/Blog/\" && http.request.uri.path.extension in {\"avif\" \"webp\" \"png\" \"jpg\" \"jpeg\"}",
        "action": {
          "cache": {
            "cache_ttl": {
              "mode": "override_origin",
              "duration": 31536000
            },
            "browser_cache_ttl": {
              "mode": "override_origin",
              "duration": 31536000
            },
            "respect_strong_etags": true,
            "cache_key": {
              "cache_by_device_type": false,
              "cache_deception_armor": "off",
              "ignore_query_strings": true,
              "cache_key_vary_by": [
                "http.accept"
              ]
            }
          }
        },
        "enabled": true
      }
    ]
  }'
```

## 3. Page Rule - Fallback Handling

```
# Cloudflare Dashboard > Rules > Page Rules
Pattern: saraivavision.com.br/Blog/*
Settings:
- Browser Cache TTL: 1 year
- Edge Cache TTL: 1 year
- Cache Level: Cache Everything
- Vary: Accept
```

## 4. Origin Cache Control - Headers

```nginx
# Add to your Nginx config
location /Blog/ {
    # Cache-Control headers for Cloudflare
    add_header Cache-Control "public, max-age=31536000, immutable";
    add_header Vary "Accept";

    # Cloudflare-specific headers
    add_header CF-Cache-Status "HIT";
    add_header CF-RAY $http_cf_ray;

    # Image optimization headers
    add_header Accept-Ranges "bytes";
    add_header X-Content-Type-Options "nosniff";
}
```

## 5. Bypass Rules - Development

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/cache_rules" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rules": [
      {
        "description": "Bypass cache for development",
        "expression": "http.request.uri.query contains \"dev=true\" || http.request.headers contains \"dev\"",
        "action": {
          "cache": {
            "bypass": true
          }
        },
        "enabled": true
      }
    ]
  }'
```

## 6. Image Resizing API (Optional)

```bash
# Cloudflare Image Resizing
# Enable: Dashboard > Speed > Optimization

# Usage example:
https://saraivavision.com.br/cdn-cgi/image/width=800,height=600,format=auto,Blog/image.png

# Transform Rules for auto-format:
{
  "expression": "http.request.uri.path contains \"/Blog/\" && http.request.headers[\"accept\"] contains \"image/avif\"",
  "action": {
    "rewrite": {
      "url": {
        "expression": "concat(\"/cdn-cgi/image/format=auto,quality=85,\", http.request.uri.path)"
      }
    }
  }
}
```

## 7. Analytics Setup

```javascript
// Add to your website for monitoring
window.addEventListener('error', function(e) {
  if (e.target.tagName === 'IMG') {
    // Send to analytics
    fetch('/api/image-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        src: e.target.src,
        currentSrc: e.target.currentSrc,
        error: e.message,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        referrer: document.referrer
      })
    });
  }
}, true);
```

## 8. Purge Strategy

```bash
# Purge specific images after updates
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "files": [
      "https://saraivavision.com.br/Blog/capa_daltonismo.avif",
      "https://saraivavision.com.br/Blog/capa_daltonismo.webp",
      "https://saraivavision.com.br/Blog/capa_daltonismo.png"
    ]
  }'

# Or purge by prefix
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prefixes": [
      "https://saraivavision.com.br/Blog/"
    ]
  }'
```

## 9. Edge Function Alternative (Workers)

```javascript
// Cloudflare Worker for intelligent image serving
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/Blog/')) {
      const accept = request.headers.get('accept') || '';
      const path = url.pathname;

      // Determine best format based on Accept header
      let preferredFormat = 'png';
      if (accept.includes('image/avif')) preferredFormat = 'avif';
      else if (accept.includes('image/webp')) preferredFormat = 'webp';

      // Try to serve preferred format
      const optimizedPath = path.replace(/\.(png|jpg|jpeg)$/i, `.${preferredFormat}`);

      try {
        const optimizedResponse = await fetch(optimizedPath);
        if (optimizedResponse.ok) {
          return optimizedResponse;
        }
      } catch (e) {
        // Fall back to original
      }

      // Serve original if optimized not available
      return fetch(path);
    }

    // Default behavior for non-image requests
    return fetch(request);
  }
};
```