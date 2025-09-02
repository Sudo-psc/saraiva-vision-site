# Deploy Local - Saraiva Vision

Este projeto agora está configurado para deploy local usando **nginx + Vite** (sem Docker).

## 🚀 Quick Start

### Desenvolvimento
```bash
# Desenvolvimento completo (frontend + API)
npm run dev:full

# Ou apenas frontend
npm run dev

# Ou apenas API
npm run start:api
```

### Deploy em Produção Local
```bash
# Deploy completo (requer sudo para configurar nginx)
npm run deploy:local

# Ou manualmente
sudo ./deploy.sh
```

## 📁 Estrutura de Deploy

- **Código fonte**: `/home/saraiva-vision-site/`
- **Build de produção (symlink)**: `/var/www/saraivavision/current/`
- **Releases**: `/var/www/saraivavision/releases/<timestamp>/`
- **Configuração nginx**: `/etc/nginx/sites-available/saraivavision`
- **Logs nginx**: `/var/log/nginx/`
- **Backups**: `/var/backups/saraivavisao/`

## ⚙️ Configuração do Sistema

### 1. Nginx
O nginx está configurado para:
- Servir arquivos estáticos do build Vite
- Proxy para API na porta 3001
- Suporte a SPA (React Router)
- Headers de segurança
- Compressão gzip
- Cache de assets

### 2. API Backend
O servidor Node.js roda na porta 3001 e é acessado via proxy nginx em `/api/*`.

### 3. SSL (Opcional)
Para configurar HTTPS:
```bash
sudo certbot --nginx -d saraivavision.com.br -d www.saraivavision.com.br
```

## 🛠️ Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento Vite (porta 5173) |
| `npm run dev:full` | Frontend + API com menu interativo |
| `npm run build` | Build de produção com Vite |
| `npm run preview` | Preview do build local (porta 4173) |
| `npm run start:api` | Apenas API (porta 3001) |
| `npm run deploy:local` | Deploy completo local (requer sudo) |
| `npm run serve` | Serve build na porta 3000 |

## 🔍 Verificações

### Verificar se está funcionando:
```bash
# Status do nginx
sudo systemctl status nginx

# Logs do nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Testar localmente
curl -I http://localhost
curl -I http://localhost/api/health
```

### Verificar API:
```bash
# Verificar se API está rodando
ps aux | grep "node.*server.js"

# Iniciar API se não estiver rodando
nohup npm run start:api > /var/log/saraivavision-api.log 2>&1 &
```

## 🌐 URLs de Acesso

- **Local**: http://localhost
- **Produção**: http://saraivavision.com.br (se DNS configurado)
- **Dev Server**: http://localhost:5173 (apenas desenvolvimento)
- **API**: http://localhost/api/* (via nginx proxy)

## 🐛 Troubleshooting

### Nginx não inicia:
```bash
# Verificar configuração
sudo nginx -t

# Ver logs de erro
sudo tail -f /var/log/nginx/error.log

# Verificar porta ocupada
sudo netstat -tlnp | grep :80
```

### Build falha:
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API não responde:
```bash
# Verificar logs da API
tail -f /var/log/saraivavision-api.log

# Verificar se porta está livre
sudo netstat -tlnp | grep :3001
```

## 🔧 Manutenção

### Atualizar projeto:
```bash
git pull
npm install
npm run deploy:local
```

### Backup manual:
```bash
sudo cp -r /var/www/saraivavision/current /var/backups/saraivavision/saraivavision_$(date +%Y%m%d_%H%M%S)
```

### Limpar backups antigos:
```bash
sudo find /var/backups/saraivavision -name "saraivavision_*" -mtime +30 -exec rm -rf {} \;
```

## 📊 Monitoramento

### Logs importantes:
- Nginx access: `/var/log/nginx/access.log`
- Nginx errors: `/var/log/nginx/error.log`
- API logs: `/var/log/saraivavision-api.log`
- Sistema: `journalctl -u nginx -f`

### Métricas:
```bash
# Uso de disco
df -h /var/www/saraivavision/

# Processos
ps aux | grep -E "(nginx|node)"

# Conexões ativas
ss -tuln | grep -E "(80|443|3001)"
```

---

## 🏗️ Migração do Docker

**Alterações realizadas:**
- ✅ Containers Docker removidos
- ✅ Configuração nginx local criada
- ✅ Script de deploy atualizado
- ✅ Scripts de desenvolvimento criados
- ✅ Package.json atualizado com novos comandos
- ✅ Documentação de deploy local

**Arquivos que podem ser removidos:**
- `docker-compose.yml`
- `docker-compose.staging.yml`
- `Dockerfile`
- `nginx.conf` (versão Docker - mantido para referência SSL)

O projeto agora roda nativamente no sistema sem dependência do Docker! 🎉
