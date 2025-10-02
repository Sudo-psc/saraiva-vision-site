# Saraiva Vision - Quick Reference

## Contexto
- **Tipo**: Clínica oftalmológica (Caratinga, MG, Brasil)
- **Status**: ✅ Produção | 🏥 Healthcare | 🇧🇷 Brasil | ⚖️ CFM/LGPD
- **VPS**: 31.97.129.78 (nativo, sem Docker)

## Stack
- **Frontend**: React 18 + TypeScript 5 + Vite + Tailwind
- **Backend**: Node.js 22+ + Express + Nginx + Redis
- **APIs**: Google Maps/Places, Resend, Instagram, WhatsApp, Spotify
- **Blog**: Estático em `src/data/blogPosts.js` (zero dependências)

## Comandos Dev
```bash
npm run dev              # Dev server (porta 3002)
npm run build            # Build produção
npm test                 # Testes watch
npm run test:comprehensive  # Suite completa
npm run validate:api     # Valida API
```

## Deploy VPS
```bash
npm run deploy           # Deploy completo
npm run deploy:quick     # Deploy rápido (90% casos)
npm run deploy:health    # Health check
```

## Variáveis Obrigatórias
- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_GOOGLE_PLACES_API_KEY` 
- `VITE_GOOGLE_PLACE_ID`
- `RESEND_API_KEY`

## Features Críticas
- **Google Reviews**: 136 avaliações (4.9/5), rate limit 30 req/min
- **Blog**: SEO-friendly, client-side search, dados estáticos
- **Compliance**: CFM validation, LGPD consent, PII detection
- **Performance**: Lazy loading, chunks <250KB, prerendering SEO

## Troubleshooting
- **Build**: Node.js 22+, verificar env vars, limpar cache
- **API**: `journalctl -u saraiva-api`, testar local
- **Nginx**: `/etc/nginx/sites-enabled/saraivavision`
- **SSL**: `sudo certbot renew`