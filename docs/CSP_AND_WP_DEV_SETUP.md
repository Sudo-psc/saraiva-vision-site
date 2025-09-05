**Goal**
- Allow frontend to call WordPress in development without CSP/CORS issues.
- Keep production CSP strict; prefer same-origin or HTTPS for API.

**Development Setup**
- Vite proxy: `vite.config.js` already proxies `'/wp-json'` → `http://localhost:8083`.
- Env: use same-origin API path so the browser hits the Vite server which proxies to WP.
- File: `.env.development`

```
VITE_WORDPRESS_API_URL=/wp-json/wp/v2
```

This keeps requests relative (same-origin). Do not set `http://localhost:8083` here.

**Frontend Calls**
- The WP client builds URLs from `VITE_WORDPRESS_API_URL`. In dev it becomes `/wp-json/wp/v2` and requests remain same-origin (e.g., `/wp-json/wp/v2/posts?...`).
- No CSP change needed for dev because requests are same-origin.

**Hardened Behavior (Dev)**
- `src/lib/wordpress.js` prefers same-origin in dev if an absolute API origin does not match the page origin. This automatically avoids mixed-content and CSP pitfalls during local work.

**WordPress CORS (only if not proxying)**
- Use a dev-only CORS configuration on WP if you intentionally make cross-origin calls in dev:

```php
// functions.php or small mu-plugin (DEV ONLY)
add_action('rest_api_init', function () {
  if (!function_exists('wp_get_environment_type') || wp_get_environment_type() !== 'development') {
    return;
  }
  remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
  add_filter('rest_pre_serve_request', function ($value) {
    header('Access-Control-Allow-Origin: http://localhost:3002'); // your Vite dev origin
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    return $value;
  }, 15);
});
```

Note: CORS doesn’t replace CSP. Prefer the proxy to avoid both.

**Production Options**
- Same-origin reverse proxy: Serve WP API at `/wp-json` on the app’s domain.
- Dedicated HTTPS origin: Add `https://cms.example.com` to `connect-src` and never call `http:` from an `https:` page.

**WordPress CSP (production)**
- Set `connect-src` to allow your API host only. Example PHP header (single source of truth):

```php
add_action('send_headers', function () {
  $connectSrc = [
    "'self'",
    'https://cms.example.com', // your production WP origin over HTTPS
  ];
  $policy = "default-src 'self'; " .
            "connect-src " . implode(' ', $connectSrc) . "; " .
            "img-src 'self' data: https:; " .
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; " .
            "style-src 'self' 'unsafe-inline' https:; " .
            "frame-src https://www.google.com https://www.youtube.com; " .
            "font-src 'self' data: https:;";
  header_remove('Content-Security-Policy');
  header("Content-Security-Policy: $policy");
}, 15);
```

**Verification**
- DevTools → Network: `GET /wp-json/wp/v2/...` returns 200 and origin matches the app.
- DevTools → Console: no CSP or mixed-content errors.
- Response headers: exactly one `Content-Security-Policy` in prod.

