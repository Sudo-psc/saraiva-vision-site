# 🚨 AVISO CRÍTICO - BUILD E DEPLOY

## ⚠️ REGRA DE OURO

**Este projeto usa VITE em produção, NÃO Next.js!**

```bash
# ✅ CORRETO para produção
npm run build:vite

# ❌ ERRADO (gera .next/ que não é servido!)
npm run build
```

## Por quê?

- **Frontend (Vite)**: SPA React servido como arquivos estáticos
- **Backend (Next.js)**: Apenas API routes em `/api/*`
- **Nginx**: Serve `/var/www/saraivavision/current/` (build Vite)

## Quick Start

```bash
# Desenvolvimento
npm run dev:vite

# Build local
npm run build:vite

# Deploy
sudo npm run deploy:quick
```

## Documentação Completa

- **[DEPLOY.md](./DEPLOY.md)** - Guia completo de deploy
- **[CLAUDE.md](./CLAUDE.md)** - Instruções para IA
- **[AGENTS.md](./AGENTS.md)** - Comandos disponíveis

## Estrutura

```
src/ → npm run build:vite → dist/ → deploy → /var/www/saraivavision/current/
```

## Verificação Rápida

```bash
# Após deploy, verificar:
curl -s "https://saraivavision.com.br/" | grep 'index-.*\.js'
```

---

**Se você vê esta mensagem, LEIA antes de fazer deploy!**
