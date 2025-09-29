# 🚀 Instruções de Deploy - Saraiva Vision

**Data**: 2025-09-29
**Status Build**: ✅ Completado (15.22s)
**Status Nginx**: ✅ Aprovado para produção
**Status Código**: ✅ 10 arquivos corrigidos (API endpoints)

---

## 📋 Resumo das Alterações

### Correções Aplicadas
1. ✅ **API Endpoints**: Todos os endpoints WordPress corrigidos para `cms.saraivavision.com.br`
2. ✅ **Build Completo**: Aplicação React buildada com variáveis corrigidas
3. ✅ **Nginx Review**: Configuração validada e aprovada
4. ✅ **Documentação**: Reviews e correções documentados

### Arquivos Modificados
- 10 arquivos de código (variáveis de ambiente e configurações)
- Build output em `dist/` (168MB, pronto para deploy)
- Nginx configuration validated

---

## 🛠 Deploy Manual no VPS

### Passo 1: Fazer SSH no VPS
```bash
ssh root@31.97.129.78
```

### Passo 2: Navegar para Diretório do Projeto
```bash
cd /home/saraiva-vision-site
```

### Passo 3: Backup da Configuração Atual
```bash
# Backup Nginx configuration
sudo cp /etc/nginx/sites-available/saraivavision \
       /etc/nginx/sites-available/saraivavision.backup.$(date +%Y%m%d_%H%M%S)

# Backup website files
sudo cp -r /var/www/html /var/www/html.backup.$(date +%Y%m%d_%H%M%S)

# Confirmar backups criados
ls -lh /etc/nginx/sites-available/saraivavision.backup.*
ls -lhd /var/www/html.backup.*
```

### Passo 4: Copiar Nova Configuração Nginx
```bash
# Copiar configuração
sudo cp /home/saraiva-vision-site/nginx-optimized.conf \
        /etc/nginx/sites-available/saraivavision

# Testar configuração
sudo nginx -t

# Esperado: "syntax is ok" e "test is successful"
```

### Passo 5: Deploy dos Arquivos React
```bash
# Remover arquivos antigos (preservar backup feito no passo 3)
sudo rm -rf /var/www/html/*

# Copiar novos arquivos
sudo cp -r /home/saraiva-vision-site/dist/* /var/www/html/

# Ajustar permissões
sudo chown -R www-data:www-data /var/www/html
sudo find /var/www/html -type d -exec chmod 755 {} \;
sudo find /var/www/html -type f -exec chmod 644 {} \;

# Verificar arquivos copiados
ls -lh /var/www/html/
```

### Passo 6: Reload Nginx (Zero Downtime)
```bash
# Reload Nginx configuration
sudo systemctl reload nginx

# Verificar status
sudo systemctl status nginx

# Esperado: "active (running)" sem erros
```

### Passo 7: Verificar Logs
```bash
# Ver logs de erro (deve estar vazio ou sem erros recentes)
sudo tail -f /var/log/nginx/saraivavision_error.log

# Em outro terminal, monitorar acesso
sudo tail -f /var/log/nginx/saraivavision_access.log
```

---

## ✅ Testes Pós-Deploy

### Teste 1: Site Principal
```bash
curl -I https://saraivavision.com.br
```
**Esperado**: `200 OK` + security headers

### Teste 2: WordPress REST API
```bash
curl -s "https://saraivavision.com.br/wp-json/wp/v2/posts?per_page=1" | jq '.[0].id'
```
**Esperado**: Número do post ID (ex: `1`)

### Teste 3: CORS Preflight
```bash
curl -I -X OPTIONS "https://saraivavision.com.br/wp-json/wp/v2/posts" \
  -H "Origin: https://saraivavision.com.br" \
  -H "Access-Control-Request-Method: GET"
```
**Esperado**: `204 No Content` + `Access-Control-Allow-Origin` header

### Teste 4: Blog Page (Browser)
1. Abrir https://saraivavision.com.br/blog
2. Verificar:
   - ✅ Posts carregam corretamente
   - ✅ Sem erros CORS no console
   - ✅ Network tab mostra 200 OK para `/wp-json/` requests
   - ✅ JSON válido nas responses

---

## 🔄 Rollback (Se Necessário)

Se algo der errado, reverter para versão anterior:

```bash
# 1. Restaurar Nginx configuration
LATEST_NGINX_BACKUP=$(ls -t /etc/nginx/sites-available/saraivavision.backup.* | head -1)
sudo cp "$LATEST_NGINX_BACKUP" /etc/nginx/sites-available/saraivavision

# 2. Testar configuração
sudo nginx -t

# 3. Reload Nginx
sudo systemctl reload nginx

# 4. Restaurar website files
LATEST_HTML_BACKUP=$(ls -td /var/www/html.backup.* | head -1)
sudo rm -rf /var/www/html/*
sudo cp -r "$LATEST_HTML_BACKUP"/* /var/www/html/

# 5. Ajustar permissões
sudo chown -R www-data:www-data /var/www/html
sudo find /var/www/html -type d -exec chmod 755 {} \;
sudo find /var/www/html -type f -exec chmod 644 {} \;

# 6. Verificar site
curl -I https://saraivavision.com.br
```

---

## 📊 Monitoramento Recomendado

### Primeiros 30 Minutos
```bash
# Terminal 1: Erros
sudo tail -f /var/log/nginx/saraivavision_error.log | grep -i "cors\|wordpress\|proxy\|error"

# Terminal 2: WordPress API
sudo tail -f /var/log/nginx/saraivavision_access.log | grep "wp-json"

# Terminal 3: Rate limiting
sudo tail -f /var/log/nginx/saraivavision_error.log | grep "limiting"
```

### Primeiras 24 Horas
- Monitorar Core Web Vitals no Google Search Console
- Verificar uptime monitoring (se configurado)
- Revisar Google Analytics para anomalias
- Checar logs de erro periodicamente

---

## 🎯 Critérios de Sucesso

Deploy considerado bem-sucedido quando:

### Imediato (0-30 min)
- ✅ Nginx reload sem erros
- ✅ Site principal carrega (200 OK)
- ✅ WordPress API responde JSON
- ✅ Blog page funcional sem erros CORS

### Curto Prazo (30 min - 24h)
- ✅ 0 erros CORS nos logs
- ✅ 100% das requisições WordPress API com 200 OK
- ✅ Sem degradação de performance (Core Web Vitals)
- ✅ Sem aumento de erros 404/500

### Médio Prazo (24h+)
- ✅ Uptime 99.9%+
- ✅ Core Web Vitals mantidos
- ✅ Usuários reportam experiência normal
- ✅ Analytics sem anomalias

---

## 📚 Documentação Relacionada

Consulte para mais detalhes:

1. **[NGINX_REVIEW_2025-09-29_APPROVED.md](./docs/NGINX_REVIEW_2025-09-29_APPROVED.md)**
   Review completo da configuração Nginx com validações

2. **[API_CORRECTIONS_2025-09-29.md](./docs/API_CORRECTIONS_2025-09-29.md)**
   Lista de todos os 10 arquivos corrigidos

3. **[scripts/deploy-nginx-wordpress-fix.sh](./scripts/deploy-nginx-wordpress-fix.sh)**
   Script automatizado de deploy (alternativa ao manual)

4. **[CLAUDE.md](./CLAUDE.md)**
   Documentação técnica completa do projeto

---

## ❓ Troubleshooting

### Problema: Nginx test failed
**Solução**: Verificar sintaxe do arquivo `nginx-optimized.conf`
```bash
sudo nginx -t  # Ver erro específico
```

### Problema: 502 Bad Gateway
**Solução**: Verificar se API Node.js está rodando
```bash
sudo systemctl status saraiva-api
sudo systemctl restart saraiva-api
```

### Problema: CORS errors no browser
**Solução**: Verificar se Nginx foi recarregado
```bash
sudo systemctl reload nginx
# Limpar cache do browser (Ctrl+Shift+R)
```

### Problema: Blog page não carrega posts
**Solução**: Testar endpoint WordPress diretamente
```bash
curl -s "https://cms.saraivavision.com.br/wp-json/wp/v2/posts?per_page=1"
# Se retornar JSON, problema é no proxy Nginx
# Se retornar erro, problema é no WordPress externo
```

---

## 🆘 Suporte

Se encontrar problemas após o deploy:

1. **Verificar logs**: `sudo tail -n 100 /var/log/nginx/saraivavision_error.log`
2. **Testar endpoints manualmente**: Usar comandos curl acima
3. **Rollback se necessário**: Seguir procedimento de rollback
4. **Consultar documentação**: Verificar arquivos relacionados

---

**Preparado por**: Claude Code
**Data**: 2025-09-29
**Versão**: 1.0

✅ **STATUS**: Deploy ready - Aguardando execução no VPS
