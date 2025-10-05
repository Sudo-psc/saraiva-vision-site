# Guia de Deploy Híbrido - Saraiva Vision

## Arquitetura

**Sistema Híbrido:**
- **Frontend**: Build estático Vite/React servido diretamente pelo Nginx
- **API Routes**: Next.js 15 rodando em PM2 (porta 3002)
- **Backend**: Node.js/Express (porta 3001) - opcional

---

## 📁 Estrutura de Produção

```
/var/www/saraivavision/
├── current → releases/20251005_123456/dist  # Symlink para build atual
├── releases/
│   ├── 20251005_123456/
│   │   ├── dist/              # Build Vite (servido pelo Nginx)
│   │   ├── .next/             # Build Next.js
│   │   ├── app/               # Next.js API Routes
│   │   ├── src/               # Source code
│   │   ├── package.json
│   │   └── .env.local
│   └── 20251004_101010/       # Release anterior
└── shared/
    └── .next-cache/           # Cache Next.js compartilhado
```

---

## 🔧 Configuração Nginx

**Arquivo**: `nginx-hybrid.conf`

### Rotas

1. **`/api/ninsaude/*`** → Proxy para Next.js (porta 3002)
2. **`/api/*`** → Proxy para Node.js Backend (porta 3001)
3. **`/*`** → Arquivos estáticos Vite (`/var/www/saraivavision/current`)

### Features

- ✅ Serve arquivos estáticos diretamente (performance máxima)
- ✅ Proxy para Next.js API Routes (Ninsaúde)
- ✅ Cache agressivo para assets (1 ano)
- ✅ No-cache para HTML e APIs
- ✅ Service Worker support
- ✅ Gzip compression
- ✅ Security headers
- ✅ HTTPS redirect
- ✅ Health check endpoint

---

## 🚀 Deploy

### Opção 1: Deploy Híbrido Completo (Recomendado)

```bash
sudo ./scripts/deploy-hybrid.sh
```

**O que faz:**
1. Cria nova release em `/var/www/saraivavision/releases/`
2. Copia código fonte do `/home/saraiva-vision-site`
3. Instala dependências
4. Build Vite → `dist/`
5. Build Next.js → `.next/`
6. Troca symlink `current` atomicamente (zero-downtime)
7. Reinicia Next.js via PM2
8. Recarrega Nginx
9. Healthcheck
10. Remove releases antigas (mantém últimas 5)

### Opção 2: Deploy Somente Vite (Rápido)

```bash
sudo ./scripts/deploy-atomic-local.sh
```

**Usar quando:**
- Mudanças apenas no frontend (React/Vite)
- Não mexeu em Next.js API Routes

---

## 📋 Checklist Pré-Deploy

### 1. Variáveis de Ambiente

Verificar `.env.local`:

```bash
# Ninsaúde API
NINSAUDE_API_URL=https://api.ninsaude.com/v1
NINSAUDE_ACCOUNT=saraivavision
NINSAUDE_USERNAME=philipe
NINSAUDE_PASSWORD=Psc451992*
NINSAUDE_ACCOUNT_UNIT=1

# Next.js
NEXT_PUBLIC_API_URL=https://saraivavision.com.br

# Google APIs
VITE_GOOGLE_MAPS_API_KEY=...
VITE_GOOGLE_PLACES_API_KEY=...
VITE_GOOGLE_PLACE_ID=...

# Email
RESEND_API_KEY=...
```

### 2. Nginx Config

Atualizar configuração (se necessário):

```bash
# Backup config atual
sudo cp /etc/nginx/sites-enabled/saraivavision \
       /etc/nginx/backups/saraivavision.$(date +%Y%m%d_%H%M%S).bak

# Copiar nova config
sudo cp /home/saraiva-vision-site/nginx-hybrid.conf \
       /etc/nginx/sites-available/saraivavision

# Testar
sudo nginx -t

# Aplicar (se OK)
sudo systemctl reload nginx
```

### 3. PM2 Setup

Garantir que PM2 está instalado:

```bash
npm install -g pm2

# Configurar startup
sudo pm2 startup systemd -u root --hp /root
pm2 save
```

---

## 🔍 Verificações Pós-Deploy

### 1. Verificar Site Estático

```bash
curl -I https://saraivavision.com.br/
# Expect: HTTP/2 200
```

### 2. Verificar Next.js

```bash
# Verificar processo
pm2 status

# Verificar logs
pm2 logs saraiva-nextjs --lines 50

# Testar API
curl -X POST https://saraivavision.com.br/api/ninsaude/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"login"}'
```

### 3. Verificar Nginx

```bash
# Status
sudo systemctl status nginx

# Logs
sudo tail -f /var/log/nginx/saraivavision.access.log
sudo tail -f /var/log/nginx/saraivavision.error.log

# Reload
sudo nginx -s reload
```

---

## 🔄 Rollback

### Rollback Automático

O script faz rollback automaticamente se:
- Build falhar
- Healthcheck falhar
- Next.js não iniciar

### Rollback Manual

```bash
# Listar releases
ls -lah /var/www/saraivavision/releases/

# Ver release atual
readlink /var/www/saraivavision/current

# Rollback para release anterior
sudo ln -sfn /var/www/saraivavision/releases/RELEASE_ANTERIOR/dist \
             /var/www/saraivavision/current

# Reiniciar Next.js nessa release
cd /var/www/saraivavision/releases/RELEASE_ANTERIOR
PORT=3002 pm2 restart saraiva-nextjs

# Recarregar Nginx
sudo systemctl reload nginx
```

---

## 🐛 Troubleshooting

### Next.js não inicia

```bash
# Ver logs
pm2 logs saraiva-nextjs --lines 100

# Reiniciar
pm2 restart saraiva-nextjs

# Testar manualmente
cd /var/www/saraivavision/current
PORT=3002 npm start
```

### API Routes retornam 502

```bash
# Verificar se Next.js está rodando
pm2 status
curl http://localhost:3002/api/ninsaude/auth

# Verificar Nginx upstream
sudo nginx -t
sudo systemctl restart nginx
```

### Build falha

```bash
# Ver log completo
tail -n 200 /home/saraiva-vision-site/claudelogs/deploy/deploy_hybrid_TIMESTAMP.log

# Verificar Node.js version
node --version  # Deve ser 22+

# Limpar cache
cd /home/saraiva-vision-site
rm -rf node_modules .next dist
npm install
npm run build
```

### Variáveis de ambiente não carregam

```bash
# Verificar .env.local
cat /var/www/saraivavision/releases/RELEASE_ATUAL/.env.local

# Copiar do source
sudo cp /home/saraiva-vision-site/.env.local \
        /var/www/saraivavision/releases/RELEASE_ATUAL/.env.local

# Reiniciar Next.js
pm2 restart saraiva-nextjs
```

---

## 📊 Monitoramento

### PM2 Monitoring

```bash
# Status geral
pm2 status

# CPU/Memory usage
pm2 monit

# Logs em tempo real
pm2 logs saraiva-nextjs

# Restart automático em caso de crash
pm2 save
```

### Nginx Logs

```bash
# Access log
sudo tail -f /var/log/nginx/saraivavision.access.log

# Error log
sudo tail -f /var/log/nginx/saraivavision.error.log

# Filtrar API requests
sudo grep "/api/ninsaude" /var/log/nginx/saraivavision.access.log
```

### Health Checks

```bash
# Site principal
curl -f https://saraivavision.com.br/health

# Next.js direto
curl -f http://localhost:3002/api/ninsaude/auth \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"action":"login"}'
```

---

## 🔒 Segurança

### Headers de Segurança

Nginx adiciona automaticamente:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000`

### HTTPS/SSL

```bash
# Renovar certificado
sudo certbot renew

# Verificar validade
sudo certbot certificates

# Testar SSL
curl -I https://saraivavision.com.br
```

### Firewall

```bash
# Verificar regras
sudo ufw status

# Portas necessárias
# 80 (HTTP) ✅
# 443 (HTTPS) ✅
# 3001 (Backend) - apenas localhost
# 3002 (Next.js) - apenas localhost
```

---

## 📝 Logs de Deploy

Todos os deploys são logados em:

```
/home/saraiva-vision-site/claudelogs/deploy/
├── deploy_hybrid_20251005_123456.log
├── deploy_hybrid_20251004_101010.log
└── ...
```

**Ver último deploy:**
```bash
ls -t /home/saraiva-vision-site/claudelogs/deploy/ | head -1 | xargs -I {} cat "/home/saraiva-vision-site/claudelogs/deploy/{}"
```

---

## 🎯 Checklist de Deploy Completo

- [ ] `.env.local` atualizado
- [ ] Código commitado no Git
- [ ] Testes passando (`npm run test:run`)
- [ ] Build local OK (`npm run build`)
- [ ] Nginx config revisado
- [ ] PM2 configurado
- [ ] Backup da configuração atual
- [ ] Deploy executado (`sudo ./scripts/deploy-hybrid.sh`)
- [ ] Site funcionando (https://saraivavision.com.br)
- [ ] API Routes funcionando (`/api/ninsaude/*`)
- [ ] PM2 status OK (`pm2 status`)
- [ ] Logs sem erros (`pm2 logs`)
- [ ] Releases antigas limpas

---

**Última atualização:** 2025-10-05  
**Versão:** 1.0.0
