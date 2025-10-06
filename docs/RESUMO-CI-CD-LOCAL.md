# ✅ CI/CD Local Setup - Completo!

Sistema de deploy automatizado via GitHub webhooks configurado com sucesso no VPS.

## 🎉 O que foi implementado

### ✅ 1. Webhook Receiver Node.js
- **Arquivo**: `scripts/webhook-receiver.cjs`
- **Porta**: 9000 (interno)
- **Status**: ✅ Rodando como serviço systemd
- **Logs**: `/home/saraiva-vision-site/logs/webhook.log`

### ✅ 2. Serviço Systemd
- **Service**: `webhook-receiver.service`
- **Auto-start**: ✓ Habilitado
- **Health Check**: `https://saraivavision.com.br/webhook/health`

### ✅ 3. Nginx Reverse Proxy
- **Endpoint Público**: `https://saraivavision.com.br/webhook`
- **Rate Limiting**: 10 requests/minuto
- **Timeout**: 300 segundos para deploy

### ✅ 4. Workflows GitHub Actions Adaptados
- **Beta Deploy**: `.github/workflows/deploy-beta.yml`
  - Executado via webhook local (não SSH!)
  - Deploy automático para branches: `develop`, `main`, `feature/*`

### ✅ 5. Scripts de Deploy
- **Deploy unificado**: `scripts/deploy-to-environment.sh`
- **Instalação**: `scripts/install-webhook-receiver.sh`
- **Atomic deployment** com backup e rollback

### ✅ 6. Ambientes Configurados
- **Beta**: `/var/www/saraivavision/beta` (HTTP)
- **Production**: `/var/www/saraivavision/current` (HTTPS)

## 🔑 Webhook Secret (IMPORTANTE!)

```
15c7db333699a7e06a256f0e41c471419e62f517a7db0a4a66fcc53dd1e4325e
```

**⚠️ Configure este secret no GitHub!**

## 📋 Próximo Passo: Configurar Webhook no GitHub

### Passo a Passo:

1. **Acesse**: https://github.com/Sudo-psc/saraivavision-site-v2/settings/hooks

2. **Clique** em "Add webhook"

3. **Preencha os campos**:
   ```
   Payload URL: https://saraivavision.com.br/webhook
   Content type: application/json
   Secret: 15c7db333699a7e06a256f0e41c471419e62f517a7db0a4a66fcc53dd1e4325e
   ```

4. **Selecione eventos**:
   - ☑ Just the push event

5. **Active**: ✓

6. **Clique** em "Add webhook"

## ✅ Verificação

### 1. Testar Health Check

```bash
curl https://saraivavision.com.br/webhook/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "uptime": 123.45,
  "port": "9000"
}
```

### 2. Ver Status do Serviço

```bash
sudo systemctl status webhook-receiver
```

**Status esperado:** `Active: active (running)`

### 3. Testar Deploy

```bash
# Fazer push para develop ou main
git push origin develop
```

**O que acontece:**
1. GitHub recebe push
2. GitHub envia webhook para `https://saraivavision.com.br/webhook`
3. Nginx encaminha para Node.js (porta 9000)
4. Webhook receiver valida signature
5. Executa `deploy-to-environment.sh beta`
6. Site atualizado em `/var/www/saraivavision/beta`

## 📊 Monitoramento

### Ver Logs em Tempo Real

```bash
# Logs do webhook
tail -f /home/saraiva-vision-site/logs/webhook.log

# Logs do serviço systemd
sudo journalctl -u webhook-receiver -f

# Logs do Nginx
tail -f /var/log/nginx/saraivavision.access.log
```

### Comandos Úteis

```bash
# Status do serviço
sudo systemctl status webhook-receiver

# Reiniciar serviço
sudo systemctl restart webhook-receiver

# Deploy manual (teste)
sudo ./scripts/deploy-to-environment.sh beta
```

## 🎯 Fluxo de Deploy

```
┌─────────────┐
│ Developer   │
│ git push    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   GitHub    │
│  (webhook)  │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│    Nginx    │
│    :443     │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Node.js   │
│   :9000     │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Deploy    │
│   Script    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Site Beta   │
│  Atualizado │
└─────────────┘
```

## 📁 Estrutura de Arquivos

```
/home/saraiva-vision-site/
├── scripts/
│   ├── webhook-receiver.cjs              ✅ Node.js receiver
│   ├── install-webhook-receiver.sh       ✅ Instalador
│   ├── deploy-to-environment.sh          ✅ Deploy script
│   └── systemd/
│       └── webhook-receiver.service      ✅ Systemd service
├── logs/
│   └── webhook.log                       📝 Logs do webhook
├── .env.webhook                          🔐 Configuração (secret)
└── docs/
    ├── WEBHOOK-SETUP.md                  📖 Setup completo
    ├── QUICKSTART-CI-CD.md               📖 Guia rápido
    └── RESUMO-CI-CD-LOCAL.md             📖 Este arquivo

/etc/nginx/sites-available/
└── saraivavision                         ✅ Config com webhook

/etc/systemd/system/
└── webhook-receiver.service              ✅ Service instalado

/var/www/saraivavision/
├── beta/                                 🧪 Deploy beta
└── current/                              🏭 Deploy produção
```

## 🚀 Benefícios da Arquitetura Local

### Antes (SSH)
❌ Dependência de SSH do GitHub Actions
❌ Credenciais SSH em secrets
❌ Conexão externa necessária
❌ Mais lento (SSH overhead)

### Agora (Webhook Local)
✅ Execução local no VPS
✅ Apenas webhook secret necessário
✅ Sem dependência SSH
✅ Mais rápido
✅ Mais seguro (sem SSH keys)
✅ Logs locais centralizados

## 🔒 Segurança

### Implementado:
- ✅ Verificação de assinatura HMAC SHA-256
- ✅ Rate limiting (10 req/min)
- ✅ Apenas método POST permitido
- ✅ Timeout de 300s para deploy
- ✅ Secret forte (64 caracteres hex)

### Opcional (futuro):
- 🔄 IP whitelist do GitHub
- 🔄 Notificações de falha
- 🔄 Métricas de deploy

## 📚 Documentação

- **Quickstart**: `docs/QUICKSTART-CI-CD.md`
- **Setup Completo**: `docs/WEBHOOK-SETUP.md`
- **CI/CD Pipeline**: `docs/CI-CD-PIPELINE.md`
- **Comandos**: `AGENTS.md`

## ✅ Checklist Final

- [x] Webhook receiver instalado
- [x] Serviço systemd rodando
- [x] Nginx configurado
- [x] Health check funcionando
- [x] Logs sendo gerados
- [x] Workflows adaptados
- [ ] **Webhook configurado no GitHub** ← **VOCÊ PRECISA FAZER ISSO!**
- [ ] DNS beta configurado (opcional)
- [ ] SSL beta configurado (opcional)

## 🎯 Teste Final

Depois de configurar o webhook no GitHub:

```bash
# 1. Fazer mudança no código
echo "# Test deploy" >> README.md

# 2. Commit e push
git add README.md
git commit -m "test: webhook deploy"
git push origin develop

# 3. Ver logs do deploy
tail -f /home/saraiva-vision-site/logs/webhook.log

# 4. Verificar site beta
curl -I http://beta.saraivavision.com.br
```

---

**Status**: ✅ **Sistema instalado e pronto para uso!**

**Ação necessária**: Configure o webhook no GitHub com o secret acima.

**Data**: 2025-10-06
**Versão**: 1.0.0
