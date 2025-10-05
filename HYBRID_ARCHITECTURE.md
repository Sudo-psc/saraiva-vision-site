# 🔄 Arquitetura Híbrida - Saraiva Vision

## 📋 Visão Geral

Sistema de build híbrido que suporta **duas arquiteturas em paralelo**:

1. **React/Vite (Padrão)** - SPA otimizado, atualmente em produção
2. **Next.js (Fallback)** - SSR/SSG, disponível para ativação

---

## 🏗️ Arquitetura Atual

### ✅ Sistema Ativo: React/Vite

```
/var/www/saraivavision/
├── current → releases/20251005_032315 (symlink)
├── releases/
│   ├── 20251005_032315/  (atual)
│   ├── 20251004_225030/  (backup)
│   └── ...
```

**Características**:
- 📦 Build estático (SPA)
- ⚡ Performance otimizada
- 🎯 Bundle splitting inteligente
- 🔄 Zero downtime deploy
- 📊 Servido diretamente pelo Nginx

**Nginx Config**:
```nginx
root /var/www/saraivavision/current;
location / {
    try_files $uri $uri/ /index.html;  # SPA fallback
}
```

---

### 🔄 Sistema Standby: Next.js

```
/var/www/saraivavision-next/
├── current → releases/20251005_140000 (symlink)
├── releases/
│   ├── 20251005_140000/
│   └── ...
```

**Características**:
- 🖥️ Server-Side Rendering (SSR)
- 📄 Static Site Generation (SSG)
- 🚀 API Routes integradas
- 🔧 Executado via PM2 (porta 3002)
- 🌐 Proxy reverso pelo Nginx

**Nginx Config (quando ativo)**:
```nginx
upstream nextjs_backend {
    server 127.0.0.1:3002;
}

location / {
    proxy_pass http://nextjs_backend;
}
```

---

## 🎯 Quando Usar Cada Sistema

### Use React/Vite Quando:

✅ **Performance é prioridade**
- SPA puro sem servidor
- Bundle otimizado e pequeno
- Cache agressivo de assets

✅ **Deploy simples é importante**
- Apenas arquivos estáticos
- Nginx serve diretamente
- Zero configuração de servidor

✅ **Fallback de rotas é suficiente**
- Client-side routing
- React Router DOM

### Use Next.js Quando:

✅ **SEO é crítico**
- Server-Side Rendering
- Meta tags dinâmicas
- Conteúdo indexável

✅ **API Routes são necessárias**
- Backend integrado
- Endpoints serverless

✅ **SSG/ISR é benéfico**
- Páginas estáticas geradas
- Incremental Static Regeneration

---

## 🚀 Comandos de Deploy

### Sistema React/Vite (Padrão)

```bash
# Development
npm run dev                    # Vite dev server

# Build
npm run build                  # Build React/Vite (padrão)
npm run build:react            # Explícito
npm run preview                # Preview build local

# Deploy
npm run deploy                 # Deploy React (padrão)
npm run deploy:react           # Explícito
npm run deploy:rollback        # Rollback
```

### Sistema Next.js (Fallback)

```bash
# Development
npm run dev:next               # Next.js dev server

# Build
npm run build:next             # Build Next.js

# Deploy
npm run deploy:next            # Deploy Next.js
npm run preview:next           # Preview (porta 3002)
```

### Alternância Entre Sistemas

```bash
# Trocar para React/Vite
npm run deploy:switch react

# Trocar para Next.js
npm run deploy:switch next

# Deploy híbrido (ambos)
npm run deploy:hybrid
```

---

## 📊 Comparativo Técnico

| Aspecto | React/Vite | Next.js |
|---------|-----------|---------|
| **Tipo** | SPA Estático | SSR/SSG |
| **Build Output** | `dist/` | `.next/` |
| **Servidor** | Nginx (direto) | Node.js + PM2 |
| **Porta** | - | 3002 |
| **Deploy** | Arquivos estáticos | App Node.js |
| **Rollback** | ~10s (symlink) | ~30s (PM2 restart) |
| **Recursos** | Baixo (nginx) | Médio (node.js) |
| **SEO** | Client-side | Server-side ✅ |
| **Cache** | Agressivo | Dinâmico |
| **Complexidade** | Baixa | Média |

---

## 🔧 Estrutura de Diretórios

```
/home/saraiva-vision-site/
├── src/                          # Código fonte (compartilhado)
├── app/                          # Next.js app dir (Next.js only)
├── public/                       # Assets públicos (compartilhado)
│
├── dist/                         # Build Vite
├── .next/                        # Build Next.js
│
├── vite.config.js               # Config Vite
├── next.config.js               # Config Next.js
├── package.json                 # Scripts híbridos
│
└── scripts/
    ├── deploy-react.sh          # Deploy React/Vite
    ├── deploy-next.sh           # Deploy Next.js
    ├── deploy-hybrid.sh         # Deploy ambos
    └── switch-build-system.sh   # Alternar sistemas
```

---

## 🔄 Estratégia de Fallback

### Cenário 1: React/Vite Falha

```bash
# Opção A: Rollback React
npm run deploy:rollback

# Opção B: Ativar Next.js
npm run deploy:next
npm run deploy:switch next
```

### Cenário 2: Next.js Falha

```bash
# Voltar para React (sempre estável)
npm run deploy:switch react
```

### Cenário 3: Testar Next.js Sem Impacto

```bash
# 1. Deploy Next.js em standby
npm run deploy:next

# 2. Testar localmente
curl http://localhost:3002

# 3. Se OK, ativar em produção
npm run deploy:switch next

# 4. Se problemas, voltar
npm run deploy:switch react
```

---

## 📈 Workflow Recomendado

### 1. Desenvolvimento (React Focus)

```bash
# Dia a dia
npm run dev                      # Vite dev server
npm run build                    # Build React
npm run deploy                   # Deploy React
```

### 2. Testes de SEO/SSR (Next.js)

```bash
# Desenvolver features Next.js
npm run dev:next

# Build Next.js
npm run build:next

# Deploy Next.js em standby
npm run deploy:next

# Ativar Next.js em produção (quando pronto)
npm run deploy:switch next
```

### 3. Rollback de Emergência

```bash
# Sempre que Next.js falhar
npm run deploy:switch react      # Instant fallback
```

---

## 🛡️ Sistema de Fallback Automático

### Health Check Monitor

O script `monitor-health.sh` verifica ambos sistemas:

```bash
# React/Vite (porta 443)
curl https://saraivavision.com.br

# Next.js (porta 3002)  
curl http://localhost:3002
```

### Auto-Recovery (Futuro)

```bash
# Se React falhar → Ativar Next.js
# Se Next.js falhar → Ativar React
# Implementar em: scripts/auto-recovery.sh
```

---

## 📝 Configuração Nginx Dinâmica

### Config Ativa: React/Vite

```nginx
# /etc/nginx/sites-enabled/saraivavision

server {
    root /var/www/saraivavision/current;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Config Alternativa: Next.js

```nginx
# /etc/nginx/sites-enabled/saraivavision

upstream nextjs_backend {
    server 127.0.0.1:3002;
}

server {
    location / {
        proxy_pass http://nextjs_backend;
    }
}
```

### Troca Automática

O script `switch-build-system.sh`:
1. Detecta sistema atual
2. Backup da config Nginx
3. Aplica nova config
4. Testa `nginx -t`
5. Reload Nginx
6. Health check
7. Rollback se falhar

---

## 🔐 Segurança e Isolamento

### React/Vite
- ✅ Sem servidor Node.js exposto
- ✅ Apenas Nginx (mais seguro)
- ✅ Arquivos estáticos (sem execução)

### Next.js
- ⚠️ Node.js na porta 3002 (local only)
- ✅ Nginx como proxy reverso
- ✅ PM2 com restart automático

---

## 📊 Métricas por Sistema

### React/Vite (Atual)
- ⚡ TTFB: <100ms
- 📦 Bundle: ~500KB (gzipped)
- 🚀 Deploy: ~30s
- 💾 Memória: ~50MB (nginx)
- 🔄 Rollback: ~10s

### Next.js (Standby)
- ⚡ TTFB: ~200ms (SSR)
- 📦 Bundle: ~800KB
- 🚀 Deploy: ~60s
- 💾 Memória: ~150MB (node)
- 🔄 Rollback: ~30s

---

## 🎯 Roadmap

### Curto Prazo (Implementado)
- [x] Scripts de deploy para ambos sistemas
- [x] Switch automático entre builds
- [x] Documentação completa
- [x] Rollback para ambos

### Médio Prazo (Planejado)
- [ ] Auto-recovery em falhas
- [ ] A/B testing entre sistemas
- [ ] Métricas comparativas
- [ ] CI/CD para ambos builds

### Longo Prazo (Futuro)
- [ ] Edge rendering (Cloudflare/Vercel)
- [ ] ISR (Incremental Static Regeneration)
- [ ] Hybrid rendering (algumas páginas SSR)

---

## 🚨 Troubleshooting

### React/Vite não carrega

```bash
# 1. Verificar build
ls -la /var/www/saraivavision/current/

# 2. Ver logs Nginx
sudo tail -50 /var/log/nginx/saraivavision_error.log

# 3. Rollback
npm run deploy:rollback

# 4. Ou ativar Next.js
npm run deploy:switch next
```

### Next.js não responde

```bash
# 1. Verificar PM2
pm2 list
pm2 logs saraiva-next

# 2. Restart Next.js
pm2 restart saraiva-next

# 3. Ou voltar para React
npm run deploy:switch react
```

### Ambos falhando (Crítico)

```bash
# 1. Verificar Nginx
sudo systemctl status nginx
sudo nginx -t

# 2. Restaurar config Nginx
sudo cp /etc/nginx/sites-enabled/saraivavision.backup.* /etc/nginx/sites-enabled/saraivavision
sudo systemctl reload nginx

# 3. Verificar release
ls -lt /var/www/saraivavision/releases/
```

---

## 📞 Comandos Rápidos

```bash
# Status atual
npm run deploy:health                    # HTTP check
readlink /var/www/saraivavision/current  # Release ativa
pm2 list                                 # Next.js status

# Deploy
npm run deploy                           # React (padrão)
npm run deploy:next                      # Next.js
npm run deploy:hybrid                    # Ambos

# Switch
npm run deploy:switch react              # Ativar React
npm run deploy:switch next               # Ativar Next.js

# Rollback
npm run deploy:rollback                  # Sistema ativo

# Logs
tail -f ~/claudelogs/deploy/*.log        # Deploy logs
sudo tail -f /var/log/nginx/*.log        # Nginx logs
pm2 logs saraiva-next                    # Next.js logs
```

---

## 📚 Referências

- **React/Vite**: [DEPLOY.md](DEPLOY.md)
- **Scripts**: [scripts/](scripts/)
- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)
- **Melhorias**: [IMPROVEMENTS_2025-10-05.md](IMPROVEMENTS_2025-10-05.md)

---

**Status Atual**: 🟢 React/Vite em produção  
**Fallback**: 🟡 Next.js disponível  
**Última atualização**: 05 Out 2025
