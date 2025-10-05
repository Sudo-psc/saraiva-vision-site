# 🚀 Sistema Híbrido - Guia Rápido

## 📌 TL;DR

**Sistema Atual**: React/Vite (SPA) ✅  
**Sistema Fallback**: Next.js (SSR) 🔄

```bash
# Deploy React (padrão - recomendado)
npm run deploy

# Deploy Next.js (fallback)
npm run deploy:next

# Alternar entre sistemas
npm run deploy:switch [react|next]
```

---

## 🎯 Comandos Principais

### React/Vite (Atual em Produção)

```bash
# Development
npm run dev                    # Vite dev server (porta 3002)

# Build & Deploy
npm run build                  # Build React/Vite
npm run deploy                 # Deploy React em produção
npm run deploy:rollback        # Rollback React

# Preview
npm run preview                # Preview build local
```

### Next.js (Standby/Fallback)

```bash
# Development
npm run dev:next               # Next.js dev server

# Build & Deploy
npm run build:next             # Build Next.js
npm run deploy:next            # Deploy Next.js (porta 3002)

# Preview
npm run preview:next           # Next.js em produção (porta 3002)
```

### Alternância de Sistemas

```bash
# Ativar React/Vite
npm run deploy:switch react

# Ativar Next.js
npm run deploy:switch next

# Ver sistema atual
grep -E "root|proxy_pass" /etc/nginx/sites-enabled/saraivavision
```

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────┐
│         NGINX (Port 443)            │
│                                     │
│  ┌───────────┐      ┌────────────┐ │
│  │           │      │            │ │
│  │  React/   │ OR   │  Next.js   │ │
│  │  Vite     │      │  (PM2)     │ │
│  │  (Static) │      │  Port 3002 │ │
│  │           │      │            │ │
│  └───────────┘      └────────────┘ │
└─────────────────────────────────────┘
```

**React/Vite** (Ativo):
- Arquivos estáticos em `/var/www/saraivavision/current`
- Nginx serve diretamente
- SPA com React Router

**Next.js** (Standby):
- App Node.js em `/var/www/saraivavision-next/current`
- Nginx faz proxy para `localhost:3002`
- SSR com Next.js

---

## 📊 Comparação Rápida

| Feature | React/Vite | Next.js |
|---------|-----------|---------|
| **Performance** | ⚡⚡⚡ Muito rápido | ⚡⚡ Rápido |
| **SEO** | ⚠️ Client-side | ✅ Server-side |
| **Deploy** | 30s | 60s |
| **Rollback** | 10s | 30s |
| **Recursos** | Baixo | Médio |
| **Complexidade** | Simples | Moderada |
| **Recomendado para** | SPA, Performance | SEO, SSR |

---

## 🔄 Workflow de Desenvolvimento

### Dia a Dia (React Focus)

```bash
# 1. Desenvolver
npm run dev

# 2. Build
npm run build

# 3. Testar local
npm run preview

# 4. Deploy
npm run deploy
```

### Testar Next.js (Quando Necessário)

```bash
# 1. Build Next.js
npm run build:next

# 2. Deploy em standby
npm run deploy:next

# 3. Testar local
curl http://localhost:3002

# 4. Se OK, ativar
npm run deploy:switch next

# 5. Se problemas, voltar
npm run deploy:switch react
```

---

## 🚨 Cenários de Uso

### Use React/Vite Quando:
- ✅ Performance é prioridade
- ✅ SPA é suficiente
- ✅ SEO client-side OK
- ✅ Deploy rápido necessário
- ✅ **PADRÃO RECOMENDADO**

### Use Next.js Quando:
- ✅ SEO crítico (meta tags server-side)
- ✅ SSR/SSG necessário
- ✅ API Routes úteis
- ✅ Fallback em caso de problema React

---

## 🛠️ Troubleshooting Rápido

### Problema: Site não carrega

```bash
# 1. Rollback React
npm run deploy:rollback

# 2. Ou ativar Next.js
npm run deploy:switch next
```

### Problema: Next.js não responde

```bash
# 1. Ver status
pm2 list

# 2. Restart
pm2 restart saraiva-next

# 3. Ou voltar React
npm run deploy:switch react
```

### Verificar Sistema Ativo

```bash
# Ver configuração Nginx
cat /etc/nginx/sites-enabled/saraivavision | grep -E "root|proxy_pass"

# Se mostra "root /var/www/saraivavision" → React ativo
# Se mostra "proxy_pass" → Next.js ativo
```

---

## 📚 Documentação Completa

- **Arquitetura Híbrida**: [HYBRID_ARCHITECTURE.md](HYBRID_ARCHITECTURE.md)
- **Deploy Guide**: [DEPLOY.md](DEPLOY.md)
- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)
- **Melhorias**: [IMPROVEMENTS_2025-10-05.md](IMPROVEMENTS_2025-10-05.md)

---

## 💡 Dicas

1. **Sempre use React como padrão** - Mais rápido e estável
2. **Next.js é fallback** - Ative apenas quando necessário
3. **Rollback é instantâneo** - Sem medo de fazer deploy
4. **Monitore ambos** - Health check automático
5. **Teste Next.js em standby** - Deploy sem ativar

---

**Status**: 🟢 React/Vite em produção | 🟡 Next.js disponível  
**Versão**: 2.0.1 | **Atualizado**: 05 Out 2025
