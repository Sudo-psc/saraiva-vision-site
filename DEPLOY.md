# 🚀 Deploy Guide - Saraiva Vision

## 📋 Índice

- [Arquitetura](#arquitetura)
- [Deploy em Produção](#deploy-em-produção)
- [Rollback](#rollback)
- [Monitoramento](#monitoramento)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitetura

### Stack Técnico
- **Frontend**: React 18.3.1 + Vite 7.1.7
- **Routing**: React Router DOM 6.16.0
- **Server**: Nginx (reverse proxy + static files)
- **Node.js**: ≥22.0.0

### Sistema de Deploy
- **Método**: Release-based com symlinks (zero-downtime)
- **Diretório Base**: `/var/www/saraivavision/`
- **Estrutura**:
  ```
  /var/www/saraivavision/
  ├── current → releases/20251005_032315/dist (symlink)
  ├── releases/
  │   ├── 20251005_032315/dist
  │   ├── 20251004_225030/dist
  │   └── ... (mantém últimas 5 releases)
  ```

### Build System

**Vite Build (Produção Atual)** ✅
```bash
npm run build:vite
# Gera: dist/ com React SPA otimizado
```

**Next.js Build (Legado)** ⚠️
```bash
npm run build
# Gera: .next/ com Next.js app
# Nota: Não utilizado em produção atual
```

**Recomendação**: Padronizar em **Vite** (já configurado e funcionando).

---

## 🚀 Deploy em Produção

### Método Recomendado: Deploy Automatizado

#### 1. Deploy Completo
```bash
# Executa build + deploy + health check
npm run deploy:production
```

**O que faz**:
1. ✅ Verifica Node.js e Nginx
2. ✅ Executa build Vite (`npm run build:vite`)
3. ✅ Cria nova release com timestamp
4. ✅ Atualiza symlink atomicamente
5. ✅ Reload Nginx (zero-downtime)
6. ✅ Health check (rollback automático se falhar)
7. ✅ Remove releases antigas (mantém últimas 5)

#### 2. Deploy Rápido (sem testes)
```bash
npm run deploy:quick
```

### Deploy Manual (Avançado)

Se precisar fazer deploy manual:

```bash
# 1. Build
cd /home/saraiva-vision-site
npm run build:vite

# 2. Criar release
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
sudo mkdir -p /var/www/saraivavision/releases/${TIMESTAMP}
sudo cp -r dist/* /var/www/saraivavision/releases/${TIMESTAMP}/

# 3. Permissões
sudo chown -R root:root /var/www/saraivavision/releases/${TIMESTAMP}
sudo find /var/www/saraivavision/releases/${TIMESTAMP} -type d -exec chmod 755 {} \;
sudo find /var/www/saraivavision/releases/${TIMESTAMP} -type f -exec chmod 644 {} \;

# 4. Atualizar symlink
sudo ln -sfn /var/www/saraivavision/releases/${TIMESTAMP} /var/www/saraivavision/current

# 5. Reload Nginx
sudo nginx -t
sudo systemctl reload nginx

# 6. Verificar
curl -I https://saraivavision.com.br
```

---

## 🔙 Rollback

### Método Automático (Release Anterior)

```bash
npm run deploy:rollback
```

O script irá:
1. Mostrar todas as releases disponíveis
2. Selecionar automaticamente a release anterior
3. Pedir confirmação
4. Executar rollback
5. Validar com health check

### Método Manual (Release Específica)

```bash
# Ver releases disponíveis
ls -lt /var/www/saraivavision/releases/

# Rollback para release específica
sudo ln -sfn /var/www/saraivavision/releases/20251004_225030 /var/www/saraivavision/current
sudo systemctl reload nginx

# Verificar
curl -I https://saraivavision.com.br
```

### Rollback de Emergência (1 linha)

```bash
# Safe rollback with proper error checking
PREVIOUS_RELEASE=$(ls -t /var/www/saraivavision/releases/ | sed -n '2p')
if [ -n "$PREVIOUS_RELEASE" ] && [ -d "/var/www/saraivavision/releases/$PREVIOUS_RELEASE" ]; then
  sudo ln -sfn "/var/www/saraivavision/releases/$PREVIOUS_RELEASE" /var/www/saraivavision/current && sudo systemctl reload nginx
else
  echo "Error: No previous release found for rollback"
  exit 1
fi
```

---

## 📊 Monitoramento

### Health Check Manual

```bash
# Verificar status HTTP
npm run deploy:health

# Detalhado
curl -I https://saraivavision.com.br
```

### Logs

```bash
# Logs de deploy
ls -lt /home/saraiva-vision-site/claudelogs/deploy/

# Ver último deploy
tail -100 /home/saraiva-vision-site/claudelogs/deploy/deploy_*.log | head -100

# Logs Nginx - Erros
sudo tail -f /var/log/nginx/saraivavision_error.log

# Logs Nginx - Acesso
sudo tail -f /var/log/nginx/saraivavision_access.log
```

### Verificar Release Ativa

```bash
# Ver release atual
readlink -f /var/www/saraivavision/current

# Listar todas releases
ls -lt /var/www/saraivavision/releases/
```

### Nginx

```bash
# Status
sudo systemctl status nginx

# Testar configuração
sudo nginx -t

# Reload (sem downtime)
sudo systemctl reload nginx

# Restart (com downtime)
sudo systemctl restart nginx
```

---

## 🔧 Troubleshooting

### Problema: Site retorna 404 ou tela branca

**Diagnóstico**:
```bash
# 1. Verificar symlink
ls -la /var/www/saraivavision/current

# 2. Verificar se index.html existe
ls -la /var/www/saraivavision/current/index.html

# 3. Verificar permissões
stat /var/www/saraivavision/current/index.html

# 4. Testar Nginx
sudo nginx -t

# 5. Ver logs
sudo tail -50 /var/log/nginx/saraivavision_error.log
```

**Solução**:
```bash
# Fazer rollback para release anterior
npm run deploy:rollback
```

---

### Problema: Assets (JS/CSS) não carregam (404)

**Diagnóstico**:
```bash
# Verificar se assets existem
ls -la /var/www/saraivavision/current/assets/

# Testar asset específico
curl -I https://saraivavision.com.br/assets/index-HASH.js
```

**Solução**:
1. Verificar se build foi completo: `ls -la /home/saraiva-vision-site/dist/assets/`
2. Re-deploy: `npm run deploy:production`

---

### Problema: Deploy falha no build

**Diagnóstico**:
```bash
# Testar build localmente
npm run build:vite

# Ver erros
cat /home/saraiva-vision-site/claudelogs/deploy/deploy_*.log | tail -100
```

**Solução**:
```bash
# Limpar cache e rebuild
rm -rf dist node_modules/.vite
npm install
npm run build:vite
```

---

### Problema: Nginx não recarrega

**Diagnóstico**:
```bash
# Verificar sintaxe
sudo nginx -t

# Ver processos
ps aux | grep nginx

# Ver status
sudo systemctl status nginx
```

**Solução**:
```bash
# Reiniciar Nginx
sudo systemctl restart nginx

# Se persistir, verificar config
sudo nano /etc/nginx/sites-enabled/saraivavision
```

---

### Problema: Site lento após deploy

**Diagnóstico**:
```bash
# Verificar tamanho do bundle
ls -lh /var/www/saraivavision/current/assets/ | grep -E "\.(js|css)$"

# Performance audit
npx lighthouse https://saraivavision.com.br --view
```

**Solução**:
1. Analisar bundle: `npm run build:vite -- --mode analyze`
2. Verificar compressão Gzip no Nginx
3. Verificar cache headers

---

## 📚 Comandos Úteis

### Build & Test

```bash
# Build local
npm run build:vite

# Preview build
npm run preview

# Testar build
npm run production:check

# Lint
npm run lint

# Testes
npm run test:run
```

### Deploy

```bash
# Deploy completo (recomendado)
npm run deploy:production

# Deploy rápido
npm run deploy:quick

# Rollback
npm run deploy:rollback

# Verificar deploy
npm run deploy:verify

# Health check
npm run deploy:health
```

### Manutenção

```bash
# Limpar releases antigas manualmente
cd /var/www/saraivavision/releases
if [ "$(ls -t | tail -n +6 | wc -l)" -gt 0 ]; then
  ls -t | tail -n +6 | while IFS= read -r old_release; do
    sudo rm -rf -- "$old_release"
  done
else
  echo "No old releases to clean up"
fi

# Backup completo
sudo tar -czf saraivavision_backup_$(date +%Y%m%d).tar.gz /var/www/saraivavision/

# Restaurar backup
sudo tar -xzf saraivavision_backup_YYYYMMDD.tar.gz -C /
```

---

## 🔐 Permissões

### Estrutura Correta

```bash
# Releases
sudo chown -R root:root /var/www/saraivavision/releases/
sudo find /var/www/saraivavision/releases/ -type d -exec chmod 755 {} \;
sudo find /var/www/saraivavision/releases/ -type f -exec chmod 644 {} \;

# Symlink (Nginx precisa ler)
sudo chown -h root:root /var/www/saraivavision/current
```

### Verificar Permissões

```bash
# Ver permissões completas
namei -l /var/www/saraivavision/current/index.html
```

---

## 🎯 Checklist de Deploy

Antes de fazer deploy em produção:

- [ ] ✅ Testes passando (`npm run test:run`)
- [ ] ✅ Build local funcionando (`npm run build:vite && npm run preview`)
- [ ] ✅ Lint sem erros (`npm run lint`)
- [ ] ✅ Ambiente de produção validado
- [ ] ✅ Backup da release atual (automático no script)
- [ ] ✅ Nginx configurado e testado (`sudo nginx -t`)

Durante o deploy:

- [ ] ✅ Build concluído sem erros
- [ ] ✅ Release criada em `/var/www/saraivavision/releases/TIMESTAMP`
- [ ] ✅ Symlink atualizado
- [ ] ✅ Nginx recarregado
- [ ] ✅ Health check passou (HTTP 200)

Após o deploy:

- [ ] ✅ Site acessível (https://saraivavision.com.br)
- [ ] ✅ Rotas funcionando (`/servicos`, `/blog`, etc.)
- [ ] ✅ Assets carregando (JS, CSS, imagens)
- [ ] ✅ Console sem erros (F12)
- [ ] ✅ Performance OK (Lighthouse > 80)

---

## 🆘 Contatos de Emergência

- **Repositório**: https://github.com/Sudo-psc/saraivavision-site-v2
- **Logs**: `/home/saraiva-vision-site/claudelogs/deploy/`
- **Nginx Logs**: `/var/log/nginx/saraivavision_*.log`

---

## 📝 Changelog de Deploy

Sempre documente deploys importantes:

```bash
# Adicionar nota de release
echo "$(date +'%Y-%m-%d %H:%M:%S') - Deploy v2.0.1: Fix blog images" >> /home/saraiva-vision-site/DEPLOY_HISTORY.md
```

---

**Última atualização**: 05 Out 2025  
**Versão**: 2.0.1  
**Build System**: Vite 7.1.7
