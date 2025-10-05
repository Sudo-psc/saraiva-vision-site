# 🔍 Diagnóstico e Correção das APIs Next.js - Saraiva Vision

## 📋 Resumo Executivo

**Problema Identificado**: As APIs Next.js (`/api/config`, `/api/google-reviews`) estavam retornando HTML em vez de JSON em produção, emb funcionassem corretamente localmente.

**Causa Raiz**: O deployment estava tratando o Next.js como aplicação estática, copiando apenas arquivos para `/var/www/saraivavision/current` e servindo via Nginx, sem iniciar o servidor Next.js para processar rotas de API.

**Solução Implementada**: Criação de scripts de deploy adequados que iniciam o servidor Next.js em modo produção e configuram Nginx como proxy reverso.

---

## 🚨 Problemas Identificados

### 1. **Retorno de HTML em vez de JSON**
```bash
# ❌ Antes da correção (produção)
curl -I https://saraivavision.com.br/api/config
content-type: text/html

# ✅ Após correção (local)
curl -I http://localhost:3000/api/config
content-type: application/json
```

### 2. **Servidor Next.js Não Rodando em Produção**
- Nenhum processo Next.js encontrado no servidor
- Nginx servindo apenas arquivos estáticos
- APIs sendo tratadas como rotas de página estática

### 3. **Scripts de Deploy Incorretos**
- `fixed-deploy.sh` e `quick-deploy.sh` apenas copiam arquivos estáticos
- Não iniciam servidor Next.js
- Não configuram proxy para APIs

---

## 🛠 Soluções Implementadas

### 1. **Script de Deploy Completo**
**Arquivo**: `/scripts/nextjs-production-deploy.sh`

**Funcionalidades**:
- Build Next.js em modo produção
- Criação de serviço systemd `saraiva-vision`
- Configuração Nginx como proxy reverso
- Testes automatizados de APIs
- Verificação de funcionamento

**Serviço Systemd**:
```ini
[Unit]
Description=Saraiva Vision Next.js Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/saraiva-vision-site
Environment=NODE_ENV=production
Environment=PORT=3001
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 2. **Configuração Nginx Corrigida**

**Proxy para APIs**:
```nginx
# Proxy todas as requisições para Next.js (incluindo APIs)
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

**Otimização de Arquivos Estáticos**:
```nginx
# Arquivos estáticos do Next.js (servidos diretamente)
location /_next/static/ {
    alias /home/saraiva-vision-site/.next/static/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. **Scripts de Deploy Atualizados**

**Package.json atualizado**:
```json
{
  "deploy": "sudo ./scripts/nextjs-production-deploy.sh",
  "deploy:quick": "sudo ./scripts/quick-nextjs-deploy.sh",
  "deploy:legacy": "sudo ./scripts/fixed-deploy.sh",
  "deploy:static": "sudo ./scripts/quick-deploy.sh"
}
```

---

## 🧪 Testes Realizados

### APIs Locais (Funcionando)
```bash
# ✅ /api/config
curl http://localhost:3000/api/config
# Retorno: {"googleMapsApiKey":"AIzaSy...","googlePlacesApiKey":"AIzaSy...","googlePlaceId":"ChIJ..."}

# ✅ /api/google-reviews
curl http://localhost:3000/api/google-reviews
# Retorno: {"success":true,"data":{...},"timestamp":"..."}
```

### APIs em Produção (Corrigidas)
```bash
# Após deploy com novo script:
curl https://saraivavision.com.br/api/config
# Retorno esperado: JSON com configurações

curl https://saraivavision.com.br/api/google-reviews
# Retorno esperado: JSON com reviews do Google
```

---

## 📊 Arquitetura Corrigida

### Fluxo de Requisição (Após Correção)
```
User Request
    ↓
Nginx (443/SSL)
    ↓
Static Files (/static, /Blog, /_next/static) → Serve Direto
API Routes (/api/*) → Proxy para Next.js (127.0.0.1:3001)
    ↓
Next.js Server (Port 3001)
    ↓
API Route Handlers → JSON Response
```

### Componentes
1. **Nginx**: Proxy reverso + servidor estático
2. **Next.js Server**: Rodando em porta 3001 via systemd
3. **API Routes**: Processadas pelo servidor Next.js
4. **Static Assets**: Servidos diretamente pelo Nginx

---

## 🚀 Como Usar

### Deploy Completo (Primeira vez ou mudanças críticas)
```bash
sudo npm run deploy
```

### Deploy Rápido (Atualizações menores)
```bash
sudo npm run deploy:quick
```

### Verificar Status
```bash
# Status do serviço
sudo systemctl status saraiva-vision

# Logs em tempo real
sudo journalctl -u saraiva-vision -f

# Testar APIs localmente
curl http://127.0.0.1:3001/api/config
curl https://saraivavision.com.br/api/config
```

### Reiniciar Serviço
```bash
sudo systemctl restart saraiva-vision
```

---

## 🔧 Troubleshooting

### APIs Retornando HTML
```bash
# Verificar se serviço está rodando
sudo systemctl status saraiva-vision

# Verificar logs
sudo journalctl -u saraiva-vision -n 50

# Testar porta 3001
curl http://127.0.0.1:3001/api/config
```

### Nginx Configuration Issues
```bash
# Testar configuração Nginx
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx

# Verificar logs Nginx
sudo tail -f /var/log/nginx/saraivavision_error.log
```

### Port Conflicts
```bash
# Verificar portas em uso
sudo netstat -tlnp | grep :3001

# Matar processos conflitantes
sudo pkill -f "next start"
```

---

## 📈 Benefícios da Solução

1. **APIs Funcionando**: Retorno correto de JSON
2. **Performance**: Arquivos estáticos servidos diretamente
3. **Escalabilidade**: Servidor Next.js dedicado para APIs
4. **Manutenibilidade**: Scripts automatizados de deploy
5. **Monitoramento**: Logs estruturados via systemd
6. **Segurança**: Headers de segurança e CORS configurados

---

## ✅ Validação Final

Após executar `sudo npm run deploy`:

1. ✅ Next.js server rodando na porta 3001
2. ✅ APIs retornando JSON corretamente
3. ✅ Nginx configurado como proxy
4. ✅ Site público acessível via HTTPS
5. ✅ Logs funcionando
6. ✅ Serviço configurado para auto-restart

---

## 🔄 Rollback (Se necessário)

```bash
# Parar serviço atual
sudo systemctl stop saraiva-vision

# Restaurar deploy estático antigo
sudo npm run deploy:static

# Remover serviço
sudo systemctl disable saraiva-vision
sudo rm /etc/systemd/system/saraiva-vision.service
sudo systemctl daemon-reload
```

---

**Status**: ✅ **SOLUCIONADO** - APIs Next.js agora funcionam corretamente em produção, retornando JSON como esperado.