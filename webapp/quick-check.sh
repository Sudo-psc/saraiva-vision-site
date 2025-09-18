#!/bin/bash

# Quick health check for Saraiva Vision website

echo "=== Saraiva Vision Quick Health Check ==="
echo "Date: $(date)"
echo ""

# Check main pages
echo "Main Pages:"
curl -s -o /dev/null -w "Homepage: %{http_code}\n" https://saraivavision.com.br/
curl -s -o /dev/null -w "Services: %{http_code}\n" https://saraivavision.com.br/servicos
curl -s -o /dev/null -w "Blog: %{http_code}\n" https://saraivavision.com.br/blog
echo ""

# Check service routes
echo "Service Routes:"
curl -s -o /dev/null -w "Consulta: %{http_code}\n" https://saraivavision.com.br/servicos/consulta-oftalmologica-completa
curl -s -o /dev/null -w "Catarata: %{http_code}\n" https://saraivavision.com.br/servicos/cirurgia-de-catarata
echo ""

# Check WordPress API
echo "WordPress API:"
posts=$(curl -s https://saraivavision.com.br/wp-json/wp/v2/posts?per_page=1 2>/dev/null | jq 'length' 2>/dev/null || echo "0")
echo "Posts available: $posts"

# Check Service Worker
echo ""
echo "Service Worker:"
sw_version=$(curl -s https://saraivavision.com.br/sw.js | grep "const SW_VERSION" | grep -o "v[0-9.]*" || echo "unknown")
echo "Version: $sw_version"

echo ""
echo "=== Check Complete ==="