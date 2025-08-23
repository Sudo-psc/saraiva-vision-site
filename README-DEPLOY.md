# Guia de Deploy - Saraiva Vision

## Situação Atual
O projeto está hospedado no **Hostinger com Apache**, usando `.htaccess` para configurações.

## Opções de Deploy

### 1. Hostinger/Apache (Atual)
**Arquivos relevantes:**
- `public/.htaccess` - Configuração Apache com redirecionamento HTTPS e headers de segurança
- `deploy.sh` - Script de deploy para Apache
- `ssl-setup.sh` - Configuração SSL com certbot para Apache

**Para deploy:**
```bash
# 1. Build da aplicação
npm run build

# 2. Upload da pasta dist/ para o servidor
# 3. Executar ssl-setup.sh no servidor (se SSL não configurado)
sudo bash ssl-setup.sh
```

### 2. Migração para Nginx
**Arquivos relevantes:**
- `nginx.conf` - Configuração completa do Nginx
- `docker-compose.yml` - Setup containerizado
- `Dockerfile` - Container da aplicação

**Para migração:**
```bash
# 1. Instalar nginx
sudo apt install nginx

# 2. Copiar configuração
sudo cp nginx.conf /etc/nginx/sites-available/saraivavisao
sudo ln -sf /etc/nginx/sites-available/saraivavisao /etc/nginx/sites-enabled/

# 3. Executar deploy
sudo bash deploy.sh
```

### 3. Docker (Opcional)
**Para ambiente containerizado:**
```bash
# Build e iniciar
docker-compose up -d

# SSL com certbot
docker-compose exec certbot certbot certonly --webroot -w /var/www/certbot -d saraivavisao.com.br
```

## Configurações de Segurança Aplicadas

✅ **Headers de Segurança:**
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (apenas HTTPS)
- Referrer-Policy: no-referrer-when-downgrade

✅ **SSL/HTTPS:**
- Redirecionamento automático HTTP → HTTPS
- Headers HSTS para forçar HTTPS
- Certificado Let's Encrypt (renovação automática)

✅ **Performance:**
- Cache de assets estáticos (1 ano)
- Compressão gzip/brotli
- Headers de cache otimizados

## Chatwoot/Waha
**Status:** Não foram encontradas configurações existentes para remover.

Se precisar integrar no futuro:
- Chatwoot: Adicionar widget JavaScript no `index.html`
- Waha: Configurar webhook endpoints se necessário

## Próximos Passos

1. **Backup:** Fazer backup da configuração atual antes de aplicar mudanças
2. **Teste:** Validar SSL e redirecionamentos em ambiente de teste
3. **Monitoramento:** Configurar logs e monitoramento pós-deploy
4. **Performance:** Executar Lighthouse audit após deploy

## Suporte

Para problemas:
1. Verificar logs: `sudo tail -f /var/log/apache2/error.log`
2. Testar configuração: `apache2ctl configtest`
3. Verificar SSL: `certbot certificates`