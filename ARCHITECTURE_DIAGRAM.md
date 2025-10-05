# 🏗️ Diagrama de Arquitetura - Saraiva Vision

## 📊 Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTERNET (Port 443/80)                        │
│                              ↓                                   │
│                         NGINX SERVER                             │
│                              ↓                                   │
│           ┌──────────────────┴────────────────────┐             │
│           │                                        │             │
│     ┌─────▼──────┐                         ┌──────▼─────┐       │
│     │  React/    │                         │  Next.js   │       │
│     │  Vite      │                         │  (SSR)     │       │
│     │  (SPA)     │                         │            │       │
│     │            │                         │  Port 3002 │       │
│     │  ACTIVE ✅ │                         │  STANDBY 🟡│       │
│     └────────────┘                         └────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Deploy

### Deploy React/Vite (Padrão)

```
┌─────────────┐
│   Código    │
│   Fonte     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ npm run     │
│ build       │
│ (Vite)      │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────────────────┐
│   dist/     │────▶│ /var/www/saraivavision/  │
│  (output)   │     │  releases/TIMESTAMP/     │
└─────────────┘     └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Symlink Atômico     │
                    │  current → release   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Nginx Reload        │
                    │  (zero downtime)     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Health Check        │
                    │  200 OK? ✅          │
                    └──────────────────────┘
```

### Deploy Next.js (Fallback)

```
┌─────────────┐
│   Código    │
│   Fonte     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ npm run     │
│ build:next  │
│ (Next.js)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────────────────────┐
│   .next/    │────▶│ /var/www/saraivavision-next/ │
│  (output)   │     │  releases/TIMESTAMP/         │
└─────────────┘     └──────────┬───────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  npm install         │
                    │  (production)        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  PM2 Start/Restart   │
                    │  Port 3002           │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Health Check        │
                    │  localhost:3002 ✅   │
                    └──────────────────────┘
```

---

## 🔄 Switch de Sistema

```
     ┌──────────────────────┐
     │  npm run             │
     │  deploy:switch       │
     │  [react|next]        │
     └──────────┬───────────┘
                │
                ▼
     ┌──────────────────────┐
     │  Backup Nginx Config │
     └──────────┬───────────┘
                │
                ▼
     ┌──────────────────────────┐
     │  Escolha Sistema Target  │
     └──────────┬───────────────┘
                │
       ┌────────┴────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌─────────────────┐
│ Config React │  │  Config Next.js │
│              │  │                 │
│ root /var/   │  │  proxy_pass     │
│ try_files    │  │  localhost:3002 │
└──────┬───────┘  └────────┬────────┘
       │                   │
       └────────┬──────────┘
                │
                ▼
     ┌──────────────────────┐
     │  Nginx -t (test)     │
     │  Valid? ✅           │
     └──────────┬───────────┘
                │
                ▼
     ┌──────────────────────┐
     │  Nginx Reload        │
     └──────────┬───────────┘
                │
                ▼
     ┌──────────────────────┐
     │  Health Check        │
     │  200 OK? ✅          │
     │  Rollback if fail ❌ │
     └──────────────────────┘
```

---

## 📁 Estrutura de Diretórios

```
/home/saraiva-vision-site/          # Código Fonte
├── src/                            # React components (compartilhado)
├── app/                            # Next.js app dir
├── public/                         # Assets públicos
│
├── dist/                           # Build Vite (local)
├── .next/                          # Build Next.js (local)
│
├── scripts/
│   ├── deploy-react.sh             # Deploy React/Vite
│   ├── deploy-next.sh              # Deploy Next.js
│   ├── switch-build-system.sh      # Alternar sistemas
│   └── monitor-health.sh           # Monitoramento
│
├── vite.config.js                  # Config Vite
├── next.config.js                  # Config Next.js
├── package.json                    # Scripts híbridos
│
├── HYBRID_ARCHITECTURE.md          # Doc arquitetura
├── DEPLOY.md                       # Doc deploy
└── README_HYBRID.md                # Guia rápido


/var/www/                           # Produção
├── saraivavision/                  # React/Vite ✅ ATIVO
│   ├── current → releases/TSTAMP  # Symlink ativo
│   └── releases/
│       ├── 20251005_032315/       # Release atual
│       ├── 20251004_225030/       # Backup
│       └── ...                    # (mantém 5)
│
└── saraivavision-next/             # Next.js 🟡 STANDBY
    ├── current → releases/TSTAMP
    └── releases/
        └── ...


/etc/nginx/
└── sites-enabled/
    └── saraivavision              # Config ativa
        └── (React config OR Next.js config)
```

---

## 🔄 Cenários de Uso

### Cenário 1: Deploy Normal (React)

```
Developer → npm run deploy → Build Vite → Deploy → Nginx Reload → ✅ Live
                                  ↓
                            Health Check
                                  ↓
                              ✅ OK? → Success
                              ❌ Fail? → Auto Rollback
```

### Cenário 2: Ativar Next.js

```
Developer → npm run deploy:next → Build Next.js → PM2 Start → Test Local
                                                                    ↓
                                                        http://localhost:3002
                                                                    ↓
                                                                  ✅ OK?
                                                                    ↓
                              npm run deploy:switch next → Nginx Config → ✅ Live
```

### Cenário 3: Rollback de Emergência

```
Site Down ❌ → npm run deploy:rollback → Symlink Change → Nginx Reload → ✅ Live
                        (10 segundos)
                             OU
               npm run deploy:switch [other-system] → Config Change → ✅ Live
                        (30 segundos)
```

---

## 🛡️ Sistema de Fallback

```
                 ┌─────────────────┐
                 │  Sistema Ativo  │
                 └────────┬────────┘
                          │
                    ┌─────▼─────┐
                    │  Falha?   │
                    └─────┬─────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
      ┌───────────────┐       ┌──────────────┐
      │  Rollback     │       │  Switch to   │
      │  (10s)        │       │  Other System│
      │               │       │  (30s)       │
      └───────┬───────┘       └──────┬───────┘
              │                      │
              └──────────┬───────────┘
                         │
                         ▼
                 ┌───────────────┐
                 │  Sistema      │
                 │  Restaurado ✅│
                 └───────────────┘
```

---

## 📊 Fluxo de Monitoramento

```
                    ┌──────────────────┐
                    │  Cron Job        │
                    │  (*/5 minutes)   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  monitor-health  │
                    │  .sh             │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Health Check    │
                    │  HTTP 200?       │
                    └────────┬─────────┘
                             │
                 ┌───────────┴────────────┐
                 │                        │
                 ▼                        ▼
         ┌───────────────┐        ┌──────────────┐
         │  ✅ OK        │        │  ❌ FAIL     │
         │               │        │              │
         │  Log: UP      │        │  Log: DOWN   │
         │  No Alert     │        │  Send Alert  │
         └───────────────┘        └──────┬───────┘
                                          │
                                          ▼
                                  ┌───────────────┐
                                  │  Email Alert  │
                                  │  + Log        │
                                  └───────────────┘
```

---

## 🔐 Camadas de Segurança

```
┌─────────────────────────────────────────────┐
│          Internet (Public)                  │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  SSL/TLS (Let's Encrypt)                    │
│  - TLS 1.2/1.3                              │
│  - Strong ciphers                           │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Nginx (Reverse Proxy)                      │
│  - Security headers                         │
│  - Rate limiting                            │
│  - Request filtering                        │
└────────────────┬────────────────────────────┘
                 │
       ┌─────────┴─────────┐
       │                   │
       ▼                   ▼
┌─────────────┐    ┌──────────────────┐
│ Static      │    │ Next.js          │
│ Files       │    │ (localhost:3002) │
│ (React/     │    │                  │
│  Vite)      │    │ - PM2 managed    │
│             │    │ - Internal only  │
│ - Read-only │    └──────────────────┘
│ - No exec   │
└─────────────┘
```

---

## 📈 Performance Flow

### React/Vite (Otimizado para Performance)

```
Request → Nginx → Static File → Browser
          (0ms)   (< 10ms)      (render)
                  
Total TTFB: < 100ms ⚡⚡⚡
```

### Next.js (Otimizado para SEO)

```
Request → Nginx → Proxy → Next.js → SSR → Browser
          (0ms)   (5ms)   (50ms)   (100ms) (render)
                  
Total TTFB: ~200ms ⚡⚡
```

---

## 🎯 Resumo Visual

```
┌─────────────────────────────────────────────────────────┐
│                  SARAIVA VISION                         │
│                  Hybrid Architecture                    │
│                                                         │
│  ┌──────────────┐              ┌──────────────┐       │
│  │  React/Vite  │◄────────────▶│   Next.js    │       │
│  │              │   Switch      │              │       │
│  │  ✅ Active   │   (30s)       │  🟡 Standby  │       │
│  │              │               │              │       │
│  │  Performance │               │  SEO Focus   │       │
│  │  Focus       │               │              │       │
│  └──────────────┘               └──────────────┘       │
│                                                         │
│  Features:                                              │
│  - ⚡ Zero Downtime Deploy                             │
│  - 🔄 Instant Rollback (10s)                           │
│  - 🛡️ Auto Fallback                                    │
│  - 📊 Health Monitoring                                │
│  - 📝 Complete Documentation                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Versão**: 2.0.1  
**Status**: 🟢 React/Vite Active | 🟡 Next.js Standby  
**Última atualização**: 05 Out 2025
