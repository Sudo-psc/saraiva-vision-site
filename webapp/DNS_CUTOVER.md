DNS Cutover Checklist for saraivavision.com.br
==============================================

Pre‑Requirements
- Server ready with Nginx installed and ports 80/443 reachable.
- Application deployed to ` /var/www/saraivavision/current ` with `index.html` present.
- Backend API (if any) listening on `127.0.0.1:3001` for `/api/*` routes.

1) Install TLS Certificates (Let’s Encrypt)
- Ensure HTTP challenge directory exists: `sudo mkdir -p /var/www/certbot`.
- Obtain/renew certs (webroot):
  - `sudo certbot certonly --webroot -w /var/www/certbot -d saraivavision.com.br -d www.saraivavision.com.br`
- Auto‑renew (cron/systemd timers): `sudo systemctl list-timers | rg certbot`.

2) Install Minimal Nginx Site
- Copy `nginx-site-minimal.conf` to server: `/etc/nginx/sites-available/saraivavision`.
- Enable:
  - `sudo ln -s /etc/nginx/sites-available/saraivavision /etc/nginx/sites-enabled/saraivavision`
- Validate and reload:
  - `sudo nginx -t && sudo systemctl reload nginx`

3) Pre‑Cutover Validation (without DNS change)
- Use on-box hosts override or curl --resolve:
  - `curl --resolve saraivavision.com.br:443:SERVER_IP -k https://saraivavision.com.br/ads -i`
    - Expect: `HTTP/2 200`, `Content-Type: application/json`, body `{"status":"ok","message":"ads blocked or disabled"}`
  - `curl --resolve saraivavision.com.br:443:SERVER_IP -k https://saraivavision.com.br/ -I`
    - Expect HTML with `Cache-Control: no-cache, no-store, must-revalidate` and `Pragma: no-cache`
  - `curl --resolve saraivavision.com.br:443:SERVER_IP -k https://saraivavision.com.br/api/reviews -I`
    - Expect `Access-Control-Allow-Origin: https://www.saraivavision.com.br` or same-origin and `Vary: Origin`
  - Health: `curl --resolve saraivavision.com.br:443:SERVER_IP -k https://saraivavision.com.br/health`
    - Expect: `OK`

4) DNS Cutover
- Lower TTL 24–48h before change (e.g., to 300s) for A/AAAA records.
- Update A (and AAAA if IPv6) for `saraivavision.com.br` and `www` to the new SERVER_IP.
- If using a CDN (e.g., Cloudflare), update origin to SERVER_IP and keep proxy/CDN settings consistent.

5) Post‑Cutover Verification
- Repeat the curl checks without `--resolve`.
- Validate real cert is served (no `-k` needed): `curl https://www.saraivavision.com.br/ads -i`.
- Confirm SPA serves index with no-cache headers and `/ads` returns JSON (not HTML).
- Verify `/api/*` routes proxy correctly and return CORS headers.

6) Rollback Plan
- Keep previous DNS values handy for quick revert.
- Preserve the prior Nginx/site config and be able to re-enable it (`sites-enabled`).
- Logs to inspect if needed:
  - `sudo journalctl -u nginx -e`
  - `sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log`

Notes
- If a managed platform (e.g., Hostinger) is still serving, ensure DNS A/AAAA now point to your server. Managed HTML signatures like `Hostinger Horizons` in the root page mean your origin is elsewhere.
- If using Cloudflare, also purge cache after cutover and confirm SSL mode is Full (strict) with your Let’s Encrypt cert.

