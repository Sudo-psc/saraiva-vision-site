# Deploy Guide - Saraiva Vision

Guia completo para deploy e atualização do site.

## 🚀 Comandos Rápidos

### Deploy Completo (Recomendado)
```bash
npm run deploy
# ou
sudo ./scripts/deploy.sh
```

**O que faz**:
- ✅ Build da aplicação
- ✅ Backup automático da versão atual
- ✅ Deploy para produção
- ✅ Copia imagens otimizadas
- ✅ Reload do Nginx
- ✅ Verificação de saúde
- ✅ Cleanup de backups antigos

### Deploy Rápido (Updates Menores)
```bash
npm run deploy:quick
# ou
sudo ./scripts/quick-deploy.sh
```

**O que faz**:
- ✅ Build rápido
- ✅ Deploy direto
- ✅ Reload do Nginx
- ⚠️ Sem backup (use apenas para updates pequenos)

## 📋 Processo Manual (se necessário)

### 1. Build
```bash
npm run build
```

### 2. Deploy
```bash
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
```

### 3. Reload Nginx
```bash
sudo systemctl reload nginx
```

## 🔄 Workflow Recomendado

### Para Pequenas Alterações
```bash
# Editar arquivos...
npm run deploy:quick
```

### Para Grandes Alterações
```bash
# Editar arquivos...
npm run build
npm run test:run        # Rodar testes
npm run deploy          # Deploy com backup
```

### Para Novos Posts de Blog
```bash
# 1. Adicionar imagens em public/Blog/
# 2. Otimizar imagens
npm run optimize:images

# 3. Editar src/data/blogPosts.js
# 4. Deploy
npm run deploy:quick
```

## 🔙 Rollback

### Restaurar Versão Anterior
```bash
# Listar backups disponíveis
ls -lh /var/backups/saraiva-vision/

# Restaurar backup específico
sudo tar -xzf /var/backups/saraiva-vision/backup_YYYYMMDD_HHMMSS.tar.gz -C /var/www/html/
sudo systemctl reload nginx
```

### Rollback Automático
O script `deploy.sh` faz rollback automático se o deploy falhar.

## 🧪 Testar Antes do Deploy

### Build Local
```bash
npm run build
npm run preview   # Testar build localmente
```

### Testes Completos
```bash
npm run test:run           # Todos os testes
npm run test:api           # Testes da API
npm run lint               # Lint
```

## ⚙️ Nginx - Quando Reload é Necessário?

### ✅ NÃO precisa reload Nginx para:
- Atualizar HTML/JS/CSS (arquivos estáticos)
- Adicionar/editar posts do blog
- Atualizar imagens
- Mudanças no frontend React

### ⚠️ PRECISA reload Nginx para:
- Mudanças na configuração do Nginx
- Adicionar novos redirects
- Mudanças em headers HTTP
- Configuração de SSL/HTTPS

**Como fazer reload**:
```bash
# Testar configuração antes
sudo nginx -t

# Reload (sem downtime)
sudo systemctl reload nginx

# Restart (com downtime mínimo)
sudo systemctl restart nginx
```

## 🎯 Scripts Disponíveis

### Deploy
```bash
npm run deploy              # Deploy completo com backup
npm run deploy:quick        # Deploy rápido sem backup
npm run deploy:health       # Verificar saúde do site
```

### Build
```bash
npm run build               # Build de produção
npm run preview             # Preview local do build
```

### Otimização
```bash
npm run optimize:images     # Otimizar imagens do blog
```

### Testes
```bash
npm run test                # Testes em watch mode
npm run test:run            # Rodar todos os testes
npm run test:coverage       # Cobertura de testes
```

## 📂 Estrutura de Diretórios

```
/home/saraiva-vision-site/    # Código fonte
├── dist/                     # Build output (após npm run build)
├── public/                   # Assets estáticos
├── src/                      # Código React
└── scripts/
    ├── deploy.sh            # Deploy completo
    └── quick-deploy.sh      # Deploy rápido

/var/www/html/                # Produção (Nginx)
├── index.html
├── assets/                   # JS/CSS
├── Blog/                     # Imagens do blog
└── ...

/var/backups/saraiva-vision/  # Backups automáticos
├── backup_20250930_180400.tar.gz
└── ...
```

## 🔒 Permissões

### Verificar Permissões
```bash
ls -la /var/www/html/
```

### Corrigir Permissões (se necessário)
```bash
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

## 🐛 Troubleshooting

### Erro: "Permission denied"
```bash
# Executar com sudo
sudo npm run deploy
```

### Erro: "Build failed"
```bash
# Limpar cache e node_modules
rm -rf node_modules dist
npm install
npm run build
```

### Erro: "Nginx reload failed"
```bash
# Verificar configuração
sudo nginx -t

# Ver logs
sudo journalctl -u nginx -n 50

# Status do serviço
sudo systemctl status nginx
```

### Site não atualiza após deploy
```bash
# Limpar cache do navegador (Ctrl+Shift+R)
# Verificar se arquivos foram copiados
ls -lh /var/www/html/

# Verificar Service Worker
# DevTools → Application → Service Workers → Unregister
```

## 📊 Monitoramento Pós-Deploy

### Verificações Rápidas
```bash
# Status dos serviços
sudo systemctl status nginx

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Testar endpoint
curl -I https://saraivavision.com.br
```

### Métricas
- Google Analytics (após configurar GA_ID)
- Core Web Vitals
- Lighthouse score
- Uptime monitoring

## ⏱️ Tempos Esperados

### Deploy Completo (`npm run deploy`)
- Build: ~15-20s
- Backup: ~2-5s
- Copy: ~1-2s
- Reload: <1s
- **Total**: ~20-30s

### Deploy Rápido (`npm run deploy:quick`)
- Build: ~15-20s
- Copy: ~1-2s
- Reload: <1s
- **Total**: ~15-25s

## 🎓 Melhores Práticas

1. **Sempre testar localmente primeiro**
   ```bash
   npm run dev
   ```

2. **Usar deploy completo para mudanças importantes**
   ```bash
   npm run deploy
   ```

3. **Usar deploy rápido para updates menores**
   ```bash
   npm run deploy:quick
   ```

4. **Verificar site após deploy**
   - Abrir https://saraivavision.com.br
   - Testar navegação
   - Verificar console do navegador

5. **Manter backups**
   - Backups automáticos em `/var/backups/saraiva-vision/`
   - Últimos 5 backups são mantidos
   - Backup manual antes de mudanças grandes

## 🔗 Links Úteis

- **Site**: https://saraivavision.com.br
- **Blog**: https://saraivavision.com.br/blog
- **Health Check**: `npm run deploy:health`
- **Docs**: `/home/saraiva-vision-site/docs/`

---

**Última Atualização**: 2025-09-30
**Versão**: 2.0.1
