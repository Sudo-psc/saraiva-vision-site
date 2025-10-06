# 🚀 CI/CD Pipeline - Quick Start Guide

Pipeline de deploy automatizado com ambientes Beta e Produção.

---

## 📌 Links Rápidos

- **Beta:** https://beta.saraivavision.com.br
- **Produção:** https://saraivavision.com.br
- **Actions:** https://github.com/<seu-repo>/actions
- **Documentação Completa:** [docs/CI-CD-PIPELINE.md](docs/CI-CD-PIPELINE.md)

---

## 🎯 TL;DR

### Deploy para Beta (Automático)

```bash
git checkout develop
git add .
git commit -m "feat: nova feature"
git push origin develop
```

✅ Deploy automático para `beta.saraivavision.com.br`

### Deploy para Produção (Manual)

1. Acessar: `Actions > 🏭 Deploy to Production`
2. Click `Run workflow`
3. Digite: `DEPLOY TO PRODUCTION`
4. Aguardar aprovação
5. Monitorar deploy

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│ Developer Push (develop/main)                       │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│ GitHub Actions - Deploy Beta                        │
│ ├─ Build & Test                                     │
│ ├─ Deploy to beta.saraivavision.com.br (AUTO)      │
│ └─ Health Check                                     │
└────────────┬────────────────────────────────────────┘
             │
             │ (após testes e validação)
             ▼
┌─────────────────────────────────────────────────────┐
│ Manual Trigger - Deploy Production                  │
│ ├─ Build Production                                 │
│ ├─ ⏸️  AGUARDAR APROVAÇÃO MANUAL                   │
│ ├─ Backup Current                                   │
│ ├─ Deploy to saraivavision.com.br                  │
│ └─ Health Check (5x)                                │
└─────────────────────────────────────────────────────┘
```

---

## ⚙️ Setup Inicial (One-time)

### 1. Configurar VPS

```bash
ssh root@31.97.129.78
cd /home/saraiva-vision-site
sudo bash scripts/setup-beta-environment.sh
```

### 2. Configurar DNS

Adicionar registro no Hostinger:

```
Tipo: A
Nome: beta
Valor: 31.97.129.78
TTL: 300
```

### 3. Configurar GitHub Secrets

Em `Settings > Secrets and variables > Actions`:

```
VPS_HOST=31.97.129.78
VPS_SSH_KEY=<ssh-private-key>
BETA_GOOGLE_MAPS_API_KEY=<beta-key>
BETA_GOOGLE_PLACES_API_KEY=<beta-key>
GOOGLE_MAPS_API_KEY=<prod-key>
GOOGLE_PLACES_API_KEY=<prod-key>
GOOGLE_PLACE_ID=ChIJXxxx...
GA_TRACKING_ID=G-XXX...
```

### 4. Configurar Environments

Em `Settings > Environments`:

**beta:**
- Protection: None
- Branches: `develop`, `main`, `feature/**`

**production:**
- Protection: Required reviewers (1+)
- Branches: `main` only

**production-build:**
- Protection: None
- Branches: `main` only

---

## 🚀 Workflows Disponíveis

### 1. Deploy Beta (Automático)

**Arquivo:** `.github/workflows/deploy-beta.yml`

**Triggers:**
- Push para `develop`
- Push para `main`
- Push para `feature/**`

**Processo:**
1. Build & Test
2. Deploy para `beta.saraivavision.com.br`
3. Health check
4. Notificação

**Duração:** ~5-10 min

### 2. Deploy Production (Manual)

**Arquivo:** `.github/workflows/deploy-production.yml`

**Trigger:**
- Manual via GitHub Actions UI

**Requisitos:**
- Digitar: `DEPLOY TO PRODUCTION`
- Aprovação de reviewer

**Processo:**
1. Validação
2. Build production
3. **Aguardar aprovação**
4. Backup current
5. Deploy para `saraivavision.com.br`
6. 5 health checks
7. Monitoring pós-deploy

**Duração:** ~20-30 min (+ aprovação)

---

## 🔄 Comandos Úteis

### Deploy Manual (VPS)

```bash
# Deploy para beta
sudo bash scripts/deploy-to-environment.sh beta

# Deploy para produção (com confirmação)
sudo bash scripts/deploy-to-environment.sh production
```

### Rollback

```bash
# Rollback produção (última release)
sudo bash scripts/rollback.sh production

# Rollback específico
sudo bash scripts/rollback.sh production 20251006_100000
```

### Verificação

```bash
# Status beta
curl -I https://beta.saraivavision.com.br

# Status produção
curl -I https://saraivavision.com.br

# Build info
curl https://saraivavision.com.br/BUILD_INFO.txt

# Health check completo
sudo bash scripts/system-health-check.sh
```

### Logs

```bash
# Beta
tail -f /var/log/nginx/beta-saraivavision-error.log

# Produção
tail -f /var/log/nginx/saraivavision-error.log

# Deployment history
tail -f /var/log/saraiva-deployments.log
```

---

## 📊 Estrutura de Arquivos

```
.
├── .github/workflows/
│   ├── deploy-beta.yml          # Deploy automático para beta
│   └── deploy-production.yml    # Deploy manual para produção
├── scripts/
│   ├── setup-beta-environment.sh    # Setup inicial beta
│   ├── deploy-to-environment.sh     # Deploy unificado
│   └── rollback.sh                  # Rollback
├── docs/
│   └── CI-CD-PIPELINE.md        # Documentação completa
├── .env.beta                    # Vars beta (gitignored)
├── .env.production              # Vars produção (gitignored)
└── README_CI_CD.md              # Este arquivo
```

---

## 🆘 Troubleshooting Rápido

### Deploy falhou

```bash
# Ver logs do workflow no GitHub Actions
# Checar erros de build/test

# Testar build local
npm run build:vite
```

### Health check falhou

```bash
# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx

# Verificar SSL
openssl s_client -connect saraivavision.com.br:443
```

### Rollback

```bash
# Se deploy deu errado, rollback imediato
sudo bash scripts/rollback.sh production

# Investigar logs
tail -f /var/log/nginx/saraivavision-error.log
```

---

## 📚 Documentação Adicional

- **Pipeline Completo:** [docs/CI-CD-PIPELINE.md](docs/CI-CD-PIPELINE.md)
- **Deploy Manual:** [DEPLOY.md](DEPLOY.md)
- **Comandos Build:** [AGENTS.md](AGENTS.md)
- **Build Vite:** [CLAUDE.md](CLAUDE.md)

---

## ✅ Checklist de Deploy

### Antes do Deploy

- [ ] Código revisado
- [ ] Testes passando
- [ ] Testado em beta
- [ ] Aprovação stakeholders
- [ ] Release notes prontas

### Deploy

- [ ] Build OK
- [ ] Aprovação obtida
- [ ] Health checks OK
- [ ] Logs sem erros

### Após Deploy

- [ ] Site acessível
- [ ] Features OK
- [ ] Performance OK
- [ ] Analytics OK
- [ ] Equipe notificada

---

**Última atualização:** 2025-10-06
**Versão:** 1.0.0
**Suporte:** dev@saraivavision.com.br
