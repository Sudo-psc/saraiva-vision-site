#!/bin/bash
echo "=== SANITY STUDIO DIAGNOSTIC ==="
echo ""
echo "1. Build Status:"
ls -lh /home/saraiva-vision-site/sanity/dist/static/sanity-*.js
echo ""
echo "2. Config Workspace Name:"
grep "name:" /home/saraiva-vision-site/sanity/sanity.config.js | head -1
echo ""
echo "3. Nginx Status:"
systemctl is-active nginx
echo ""
echo "4. SSL Certificate:"
echo | openssl s_client -servername studio.saraivavision.com.br -connect 31.97.129.78:443 2>/dev/null | openssl x509 -noout -dates | head -2
echo ""
echo "5. HTTP Response:"
curl -s -o /dev/null -w "Status: %{http_code}\nSize: %{size_download} bytes\n" https://studio.saraivavision.com.br
echo ""
echo "6. Recent Nginx Errors:"
tail -5 /var/log/nginx/sanity-studio-error.log 2>/dev/null || echo "No errors logged"
echo ""
echo "=== END DIAGNOSTIC ==="
