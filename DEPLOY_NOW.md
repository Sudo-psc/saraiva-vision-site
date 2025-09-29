# 🚀 Deploy Imediato - Execute Agora

## Pré-requisito
**Importante**: Todos os comandos devem ser executados **dentro do VPS** no diretório do projeto.

## Opção 1: Script Automatizado (Recomendado)

### Executar script de deploy
```bash
cd /home/saraiva-vision-site
bash scripts/deploy-production.sh
```

O script irá:
- ✅ Fazer backup automático (Nginx + files)
- ✅ Testar configuração Nginx
- ✅ Deploy dos arquivos
- ✅ Ajustar permissões
- ✅ Reload Nginx (zero downtime)
- ✅ Verificar deployment

---

## Opção 2: Comandos Manuais (Passo a Passo)

### 1. Navegar para o projeto
```bash
cd /home/saraiva-vision-site
```

### 2. Backup (Segurança)
```bash
# Backup Nginx config
sudo cp /etc/nginx/sites-available/saraivavision \
       /etc/nginx/sites-available/saraivavision.backup.$(date +%Y%m%d_%H%M%S)

# Backup website files
sudo cp -r /var/www/html /var/www/html.backup.$(date +%Y%m%d_%H%M%S)

# Verificar backups criados
ls -lh /etc/nginx/sites-available/saraivavision.backup.*
ls -lhd /var/www/html.backup.*
```

### 3. Deploy Nginx
```bash
# Copiar configuração
sudo cp nginx-optimized.conf /etc/nginx/sites-available/saraivavision

# Testar (IMPORTANTE: não prosseguir se houver erro)
sudo nginx -t

# Deve mostrar: "syntax is ok" e "test is successful"
```

### 4. Deploy Website
```bash
# Remover arquivos antigos
sudo rm -rf /var/www/html/*

# Copiar novos arquivos
sudo cp -r dist/* /var/www/html/

# Ajustar permissões
sudo chown -R www-data:www-data /var/www/html
sudo find /var/www/html -type d -exec chmod 755 {} \;
sudo find /var/www/html -type f -exec chmod 644 {} \;
```

### 5. Reload Nginx
```bash
# Reload (zero downtime)
sudo systemctl reload nginx

# Verificar status
sudo systemctl status nginx
```

### 6. Validação Imediata
```bash
# Teste 1: Site principal
curl -I https://saraivavision.com.br
# Esperado: 200 OK

# Teste 2: WordPress API
curl -s "https://saraivavision.com.br/wp-json/wp/v2/posts?per_page=1" | jq '.[0].id'
# Esperado: número do post (ex: 1)

# Teste 3: CORS
curl -I -X OPTIONS "https://saraivavision.com.br/wp-json/wp/v2/posts" \
  -H "Origin: https://saraivavision.com.br"
# Esperado: 204 No Content + Access-Control headers
```

---

## ✅ Critérios de Sucesso

Após deploy, verificar:

1. ✅ **Nginx reload** sem erros
2. ✅ **Site principal** carrega (200 OK)
3. ✅ **WordPress API** retorna JSON
4. ✅ **Blog page** funcional (https://saraivavision.com.br/blog)

---

## 📊 Monitoramento (30 minutos)

### Terminal 1: Erros
```bash
sudo tail -f /var/log/nginx/saraivavision_error.log | grep -i "error\|cors\|wordpress"
```

### Terminal 2: WordPress API
```bash
sudo tail -f /var/log/nginx/saraivavision_access.log | grep "wp-json"
```

---

## 🆘 Se Algo Der Errado

### Rollback Rápido
```bash
# 1. Encontrar último backup
LATEST_NGINX=$(ls -t /etc/nginx/sites-available/saraivavision.backup.* | head -1)
LATEST_HTML=$(ls -td /var/www/html.backup.* | head -1)

# 2. Restaurar Nginx
sudo cp "$LATEST_NGINX" /etc/nginx/sites-available/saraivavision
sudo nginx -t && sudo systemctl reload nginx

# 3. Restaurar files
sudo rm -rf /var/www/html/*
sudo cp -r "$LATEST_HTML"/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
```

---

## 🎯 Quick Start (Para Deploy Imediato)

**Copie e cole no terminal do VPS**:

```bash
cd /home/saraiva-vision-site && bash scripts/deploy-production.sh
```

Isso executará todo o processo automaticamente com validações e rollback em caso de erro.

---

**Preparado**: 2025-09-29
**Status**: ✅ Ready to execute
**Local**: VPS em /home/saraiva-vision-site