# 🚀 Quickstart: CI/CD Local via Webhook

Guia rápido para configurar o sistema de deploy automatizado.

## ✅ Pré-requisitos

- ✅ VPS com Node.js 22+
- ✅ Nginx configurado
- ✅ Acesso root ao VPS
- ✅ Repositório GitHub configurado

## 📦 Instalação (5 minutos)

### 1. Instalar Webhook Receiver

```bash
cd /home/saraiva-vision-site
sudo ./scripts/install-webhook-receiver.sh
```

**Este comando irá:**
- Criar diretório de logs
- Gerar secret do webhook (anote!)
- Instalar serviço systemd
- Iniciar o webhook receiver
- Configurar Nginx reverse proxy

### 2. Copiar Webhook Secret

Anote o secret exibido no final da instalação:
```
🔐 Webhook Secret (configure in GitHub):
15c7db333699a7e06a256f0e41c471419e62f517a7db0a4a66fcc53dd1e4325e
```

### 3. Configurar no GitHub

1. Acesse: https://github.com/Sudo-psc/saraivavision-site-v2/settings/hooks
2. Clique em **"Add webhook"**
3. Preencha:
   - **Payload URL**: `https://saraivavision.com.br/webhook`
   - **Content type**: `application/json`
   - **Secret**: Cole o secret copiado acima
   - **Events**: Just the push event
   - **Active**: ✓
4. Salve

## ✅ Verificação

### Testar Health Check

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

### Testar Deploy Manual

```bash
# Push para develop ou main
git push origin develop
```

**O webhook irá automaticamente:**
1. Receber notificação do GitHub
2. Puxar o código
3. Instalar dependências
4. Executar build
5. Deploy para beta

## 📊 Monitoramento

### Ver Logs do Webhook

```bash
# Logs do serviço
sudo journalctl -u webhook-receiver -f

# Logs do webhook
tail -f /home/saraiva-vision-site/logs/webhook.log
```

### Status do Serviço

```bash
sudo systemctl status webhook-receiver
```

## 🎯 Como Funciona

```
Push para GitHub → GitHub Webhook → Nginx → Node.js → Deploy Script → Site Atualizado
```

### Mapeamento de Branches

| Branch | Ambiente | URL |
|--------|----------|-----|
| `develop` | Beta | https://beta.saraivavision.com.br |
| `main` | Beta | https://beta.saraivavision.com.br |
| `feature/*` | Beta | https://beta.saraivavision.com.br |

## 🛠️ Comandos Úteis

### Gerenciamento do Serviço

```bash
# Status
sudo systemctl status webhook-receiver

# Reiniciar
sudo systemctl restart webhook-receiver

# Ver logs em tempo real
sudo journalctl -u webhook-receiver -f
```

### Testar Deploy Manualmente

```bash
cd /home/saraiva-vision-site
sudo ./scripts/deploy-to-environment.sh beta
```

## 🐛 Troubleshooting

### Webhook não funciona?

1. **Verificar serviço:**
   ```bash
   sudo systemctl status webhook-receiver
   ```

2. **Verificar logs:**
   ```bash
   tail -f /home/saraiva-vision-site/logs/webhook.log
   ```

3. **Testar health:**
   ```bash
   curl https://saraivavision.com.br/webhook/health
   ```

### Deploy falha?

1. **Ver logs de erro:**
   ```bash
   grep "FAILED" /home/saraiva-vision-site/logs/webhook.log
   ```

2. **Executar manualmente:**
   ```bash
   sudo ./scripts/deploy-to-environment.sh beta
   ```

## 📚 Documentação Completa

- **Setup detalhado**: `docs/WEBHOOK-SETUP.md`
- **CI/CD Pipeline**: `docs/CI-CD-PIPELINE.md`
- **Comandos**: `AGENTS.md`

## ⚡ Próximos Passos

1. ✅ Push código para `develop`
2. ✅ Verificar deploy no Beta
3. ✅ Configurar DNS para `beta.saraivavision.com.br`
4. ✅ Obter certificado SSL para beta

---

**Instalação concluída!** 🎉

O sistema agora faz deploy automático quando você fizer push para `develop`, `main`, ou branches `feature/*`.
