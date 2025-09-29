# Quick Commands

## Development
```bash
npm run dev              # Dev server (3002)
npm run build            # Production build
npm test                 # Run tests
npm run validate:api     # API linting
```

## Deployment (on VPS)
```bash
cd /home/saraiva-vision-site
bash scripts/deploy-production.sh
```

## Health Checks
```bash
curl -I https://saraivavision.com.br
curl -s "https://saraivavision.com.br/wp-json/wp/v2/posts?per_page=1" | jq
sudo systemctl status nginx
sudo tail -f /var/log/nginx/saraivavision_error.log
```

## Git
```bash
git status
git add -A
git commit -m "type(scope): message"
git push origin branch-name
```