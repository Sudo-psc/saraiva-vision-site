# React/Vite + Nginx Production Diagnostic (2025-10-05)

## 1. Context Snapshot
- **React**: 18.3.1 (`react` dependency)
- **Router**: React Router DOM 6.16.0
- **Vite**: 7.1.7 (`devDependencies`)
- **Node**: `>=22.0.0` required, environment currently using 20.19.4
- **Next.js**: 15.5.4 present but deployment pipeline relies on Vite static build
- **Package Manager**: npm (lockfile `package-lock.json`)
- **Server**: Nginx (optimized config checked in repo)

Source: `package.json`, `node -v`, `nginx-optimized.conf`.

## 2. Observed Build Behaviour
- `npm run build` (Next.js) fails while fetching hosted Inter font files from Google Fonts when offline, aborting the build before assets are generated.
- `npm run build:norender` (pure Vite) succeeds, producing the SPA bundle under `dist/` with hashed assets and `_redirects` for SPA routing.
- `npm run preview` works using the generated Vite bundle, confirming the SPA renders locally.

## 3. Evidence
- Build failure trace highlighting repeated fetch errors for Google Fonts leading to Next.js compilation error.
- Successful Vite build summary with chunk sizes and generated assets list.
- Directory listings for `dist/`, `dist/assets/`, `_redirects`, and `.htaccess`.
- Nginx config snippet pointing `root` to `/var/www/saraiva-vision-site/dist` with proper `try_files` fallback.

## 4. Multi-Dimensional Analysis

### 4.1 Build & Bundling
- Vite config sets `base: '/'`, hashed asset outputs, alias `@ -> src`, and manual asset routing logic.
- Output structure includes `index.html`, hashed JS/CSS chunks, and curated asset directories (`Blog/`, `Podcasts/`, etc.).
- CSS entry `dist/assets/index-LE2QTXCW.css` is large (~345 KB) but gzips to 47 KB; consider modularization or critical CSS extraction if needed.
- Warning about chunk size >200 kB for `OptimizedImage` indicates further code-splitting opportunities.

### 4.2 Server (Nginx)
- `nginx-optimized.conf` configures Brotli/Gzip, `try_files $uri $uri/ /index.html`, and year-long caching for hashed assets while disabling cache for HTML.
- Root path matches deployment folder; includes `_redirects` compatibility for SPA navigation.
- Access/error logs configured with healthcare-compliant format.

### 4.3 Network & Browser
- No live Network tab available in repo; rely on docs referencing 404 caching incidents (see `TROUBLESHOOTING_404_CACHE.md`).
- `_redirects` file covers canonical SPA routes and blog slug rewrites.
- `.htaccess` ensures SPA fallback and security headers when served behind Apache/Netlify fallback.

### 4.4 Routing
- `BrowserRouter` without basename; Vite `base` is `/`, so alignment is correct when served from domain root.
- Routes cover `/`, `/servicos`, `/blog/:slug`, etc., with `<Navigate>` fallback to `/` ensuring SPA handles unknown paths.
- For subdomain `check.*`, logic routes `/` to `CheckPage` but still uses same SPA shell.

### 4.5 Assets & Performance
- Nginx caches hashed assets for 1 year and sets immutable headers; HTML responses are no-cache.
- Both Brotli and Gzip enabled; MIME types for fonts, JS, CSS defined.
- Dist asset naming ensures hashed fingerprinting; large CSS bundle flagged as improvement area.

## 5. Root Cause & Secondary Issues
- **Primary**: Next.js build pipeline cannot complete without external network access to Google Fonts CDN. This prevents `npm run build` from producing output if executed in restricted environments.
- **Secondary**:
  - Runtime still depends on remote fonts; offline deployments should either self-host fonts or configure `@next/font` to fall back gracefully.
  - Environment Node 20.19.4 is below required `>=22.0.0`, which may cause future incompatibilities once dependencies enforce engines.
  - Large CSS/JS bundles trigger warnings; may impact initial load on constrained devices.

## 6. Recommendations

### Layer 1 – Quick Wins
1. Use `npm run build:norender` for Vite-only bundle when Next.js build cannot reach Google Fonts.
2. Ensure deployment copies entire `dist/` to Nginx `root` and run `npm run preview` before shipping.
3. If 404 cache persists, instruct operators to clear browser cache as documented in `TROUBLESHOOTING_404_CACHE.md`.

### Layer 2 – Configuration Fixes
1. Self-host Inter fonts or vendor them into `public/fonts/` and update font loading to avoid remote fetch during Next build.
2. Consider removing `next/font` dependency if Next.js is not part of deployment path.
3. Upgrade Node runtime to >=22 per `package.json` engines.
4. Audit Vite CSS bundling; split Tailwind output into route-level chunks or enable CSS code splitting.

### Layer 3 – Advanced Debugging
- Monitor Nginx logs (`/var/log/nginx/saraiva_access.log`, `/var/log/nginx/saraiva_error.log`) for SPA routing anomalies.
- Use `curl -I https://saraivavision.com.br/assets/<hash>.js` to confirm cache headers and compression.
- Run Lighthouse against `npm run preview` to measure LCP and identify CSS/JS optimization targets.

## 7. Validation Checklist
- [ ] Next.js build completes or fonts self-hosted.
- [ ] Vite build passes without chunk warnings or warnings acknowledged.
- [ ] Nginx `try_files` confirmed to return `index.html` for nested routes.
- [ ] Browser cache cleared / Service Worker updated.
- [ ] Node runtime upgraded or compatibility confirmed.

## 8. Preventive Actions
- Add CI step verifying font assets exist locally before running `next build`.
- Document offline deployment requirements (self-hosted fonts, env vars) in deployment scripts.
- Schedule quarterly performance audits to track bundle growth.

