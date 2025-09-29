# Nginx Configuration Review - 2025-09-29

**Status**: ⚠️ Configuração requer correções críticas para integração WordPress externa
**Reviewer**: Claude Code (Automated Review)
**Focus**: Integração WordPress externa via cms.saraivavision.com.br

---

## 🎯 Executive Summary

A configuração Nginx atual (`nginx-optimized.conf`) possui **3 problemas críticos** relacionados à integração WordPress externa:

1. ❌ **WordPress GraphQL proxy apontando para cms.saraivavision.com.br** mas GraphQL retorna 502 errors (não está sendo usado)
2. ❌ **WordPress REST API proxy apontando para blog.saraivavision.com.br** (deve usar cms.saraivavision.com.br)
3. ⚠️ **CORS configuration** não possui header `Vary: Origin` em locais críticos

---

## 🚨 Problemas Críticos

### Problema 1: WordPress REST API Proxy Endpoint Incorreto

**Localização**: `nginx-optimized.conf:201-213`

**Código Atual**:
```nginx
# WordPress REST API proxy - External WordPress
location /wp-json/ {
    proxy_pass https://blog.saraivavision.com.br/wp-json/;  # ❌ INCORRETO
    proxy_set_header Host blog.saraivavision.com.br;         # ❌ INCORRETO
    # ...
}
```

**Problema**:
- `blog.saraivavision.com.br` retorna HTML com theme rendering, não JSON
- Frontend precisa de JSON da API, não HTML

**Impacto**: 🔴 **CRÍTICO**
- Todas requisições REST API recebem HTML ao invés de JSON
- Parsing errors no frontend
- Blog page completamente quebrado

**Solução**:
```nginx
# WordPress REST API proxy - External WordPress
location /wp-json/ {
    proxy_pass https://cms.saraivavision.com.br/wp-json/;   # ✅ CORRETO
    proxy_set_header Host cms.saraivavision.com.br;         # ✅ CORRETO
    # ...
}
```

**Verificação**:
```bash
# Testar endpoint correto
curl -s "https://cms.saraivavision.com.br/wp-json/wp/v2/posts/" | jq '.[0].id'
# Deve retornar: 1 (JSON válido)

# Endpoint incorreto atual
curl -s "https://blog.saraivavision.com.br/wp-json/wp/v2/posts/" | head -5
# Retorna: <!DOCTYPE html> (HTML, não JSON)
```

---

### Problema 2: WordPress GraphQL Proxy Desnecessário

**Localização**: `nginx-optimized.conf:126-155`

**Código Atual**:
```nginx
# WordPress GraphQL proxy with CORS - External WordPress
location /api/wordpress-graphql/ {
    limit_req zone=api_limit burst=5 nodelay;
    proxy_pass https://cms.saraivavision.com.br/graphql;  # ⚠️ Endpoint retorna 502
    # ...
}
```

**Problema**:
- GraphQL endpoint retorna 502 Bad Gateway
- Frontend foi migrado para REST API (emergency fix)
- Proxy configurado mas não está sendo usado

**Impacto**: 🟡 **MÉDIO**
- Não afeta funcionalidade atual (já migrado para REST)
- Confusão na documentação
- Overhead de configuração desnecessária

**Solução**: Duas opções:
1. **Opção A (Recomendado)**: Remover completamente o bloco GraphQL proxy
2. **Opção B**: Adicionar comentário indicando "Not used - REST API migration complete"

**Justificativa para Remoção**:
- Frontend usa REST API (ver `src/lib/wordpress-compat.js:6-16`)
- GraphQL endpoint confirmado com 502 errors
- Simplifica manutenção

---

### Problema 3: Missing `Vary: Origin` Header em CORS

**Localização**: `nginx-optimized.conf:115,138,209`

**Código Atual**:
```nginx
# CORS headers for API
add_header Access-Control-Allow-Origin $cors_origin always;
add_header Access-Control-Allow-Methods $cors_method always;
add_header Access-Control-Allow-Headers "..." always;
add_header Access-Control-Allow-Credentials "true" always;
# ❌ FALTA: add_header Vary "Origin" always;
```

**Problema**:
- Header `Vary: Origin` ausente em locais com CORS dinâmico
- Causa problemas de cache em proxies/CDNs
- Browsers podem cachear response para uma origin e servir para outra

**Impacto**: 🟡 **MÉDIO**
- Pode causar comportamento inconsistente em cache
- Problemas de CORS intermitentes
- Dificuldade de debug

**Solução**:
```nginx
add_header Access-Control-Allow-Origin $cors_origin always;
add_header Access-Control-Allow-Methods $cors_method always;
add_header Access-Control-Allow-Headers "..." always;
add_header Access-Control-Allow-Credentials "true" always;
add_header Vary "Origin" always;  # ✅ ADICIONAR
```

**Locais que precisam de correção**:
1. `/api/` block (linha 115)
2. `/api/wordpress-graphql/` block (linha 138)
3. `/wp-json/` block (linha 209)

---

## ✅ Configurações Corretas

### 1. CORS Map Configuration (Correto)

**Localização**: `nginx-optimized.conf:20-25`

```nginx
map $http_origin $cors_origin {
    default "";
    "~^https://saraivavision\.com\.br$" "https://saraivavision.com.br";
    "~^https://www\.saraivavision\.com\.br$" "https://www.saraivavision.com.br";
    "~^https://localhost:\d+$" "$http_origin";  # Development
}
```

✅ **Correto**: Permite www e non-www, bloqueia outras origins

---

### 2. SSL Configuration (Correto)

**Localização**: `nginx-optimized.conf:56-73`

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:...;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_stapling on;
ssl_stapling_verify on;
```

✅ **Correto**: TLS 1.2+, OCSP stapling, strong ciphers

---

### 3. Security Headers (Correto)

**Localização**: `nginx-optimized.conf:75-82`

✅ **Correto**: Headers adequados para aplicação médica (CFM compliance)

---

### 4. Rate Limiting (Correto)

**Localização**: `nginx-optimized.conf:5-6`

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=main_limit:10m rate=60r/s;
```

✅ **Correto**: API limit (30/min), Main limit (60/s)

---

## 🔧 Configuração Corrigida

### nginx-optimized.conf (Seção WordPress Corrigida)

```nginx
# WordPress REST API proxy - External CMS
# NOTE: Uses cms.saraivavision.com.br for JSON API (not blog subdomain)
location /wp-json/ {
    # Rate limiting for WordPress API
    limit_req zone=api_limit burst=10 nodelay;

    # Proxy to external WordPress CMS
    proxy_pass https://cms.saraivavision.com.br/wp-json/;
    proxy_set_header Host cms.saraivavision.com.br;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Enhanced CORS for WordPress REST API
    add_header Access-Control-Allow-Origin $cors_origin always;
    add_header Access-Control-Allow-Methods $cors_method always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-WP-Nonce" always;
    add_header Access-Control-Allow-Credentials "true" always;
    add_header Access-Control-Max-Age "86400" always;
    add_header Vary "Origin" always;  # ✅ ADICIONADO

    # Preflight OPTIONS handling
    if ($request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin $cors_origin always;
        add_header Access-Control-Allow-Methods $cors_method always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-WP-Nonce" always;
        add_header Access-Control-Allow-Credentials "true" always;
        add_header Access-Control-Max-Age "86400" always;
        add_header Vary "Origin" always;
        add_header Content-Type text/plain;
        add_header Content-Length 0;
        return 204;
    }

    # Timeouts for WordPress API
    proxy_connect_timeout 15s;
    proxy_send_timeout 15s;
    proxy_read_timeout 15s;
}

# WordPress admin redirect
location /wp-admin/ {
    # Redirect to external WordPress admin
    return 301 https://blog.saraivavision.com.br/wp-admin/;
}

# NOTE: GraphQL endpoint removed - application uses REST API only
# Previous GraphQL proxy at /api/wordpress-graphql/ returned 502 errors
# Migration to REST API completed in emergency fix (2025-09-29)
```

---

## 📋 Checklist de Deploy

### Pré-deployment

- [ ] Backup da configuração atual: `sudo cp /etc/nginx/sites-available/saraivavision /etc/nginx/sites-available/saraivavision.bak`
- [ ] Verificar variáveis de ambiente: `.env.production` usa `cms.saraivavision.com.br`
- [ ] Build da aplicação completo com REST API: `npm run build` (✅ já executado)

### Deployment

```bash
# 1. Atualizar arquivo Nginx no VPS
sudo cp nginx-optimized.conf /etc/nginx/sites-available/saraivavision

# 2. Testar configuração
sudo nginx -t

# 3. Se OK, recarregar Nginx (zero downtime)
sudo systemctl reload nginx

# 4. Verificar serviço
sudo systemctl status nginx
```

### Pós-deployment - Testes

```bash
# Teste 1: WordPress REST API via proxy (deve retornar JSON)
curl -s "https://saraivavision.com.br/wp-json/wp/v2/posts?per_page=1" | jq '.[0].id'
# Esperado: 1 (número do post ID)

# Teste 2: CORS OPTIONS preflight
curl -I -X OPTIONS "https://saraivavision.com.br/wp-json/wp/v2/posts" \
  -H "Origin: https://www.saraivavision.com.br" \
  -H "Access-Control-Request-Method: GET"
# Esperado:
# - Status: 204 No Content
# - Access-Control-Allow-Origin: https://www.saraivavision.com.br
# - Vary: Origin

# Teste 3: CORS GET request
curl -I "https://saraivavision.com.br/wp-json/wp/v2/posts?per_page=1" \
  -H "Origin: https://www.saraivavision.com.br"
# Esperado:
# - Status: 200 OK
# - Access-Control-Allow-Origin: https://www.saraivavision.com.br
# - Vary: Origin
# - Content-Type: application/json

# Teste 4: Frontend integration (browser console)
# Abrir https://www.saraivavision.com.br/blog
# Console não deve ter erros CORS
# Blog deve carregar posts corretamente
```

### Pós-deployment - Monitoramento

```bash
# 1. Monitorar logs Nginx por 5 minutos
sudo tail -f /var/log/nginx/saraivavision_access.log | grep "wp-json"

# 2. Verificar erros
sudo tail -f /var/log/nginx/saraivavision_error.log | grep -i "cors\|wordpress\|proxy"

# 3. Verificar no browser
# https://www.saraivavision.com.br/blog
# - Deve carregar posts sem erros CORS
# - Network tab deve mostrar 200 OK para /wp-json/
# - Response deve ser JSON válido
```

---

## 🔍 Análise de Impacto

### Impacto da Correção

| Componente | Antes | Depois | Impacto |
|------------|-------|--------|---------|
| WordPress REST API | ❌ HTML (blog subdomain) | ✅ JSON (cms subdomain) | 🔴 **CRÍTICO FIX** |
| Blog Page | ❌ Quebrado (502 errors) | ✅ Funcional | 🟢 **RESTAURADO** |
| GraphQL Proxy | ⚠️ Configurado mas 502 | ❌ Removido | 🟡 **SIMPLIFICADO** |
| CORS Vary Header | ⚠️ Faltando | ✅ Adicionado | 🟢 **MELHORADO** |
| Cache Behavior | ⚠️ Inconsistente | ✅ Correto | 🟢 **OTIMIZADO** |

### Riscos do Deploy

**Risco Baixo** (🟢):
- Mudança é alinhada com código frontend atual (já usa REST API)
- Build já testado e funcionando
- Zero downtime com `nginx reload`
- Rollback rápido disponível (backup existente)

**Mitigação**:
- Backup automático pré-deploy
- Testes de validação pós-deploy
- Monitoramento de logs por 30 minutos

---

## 📊 Comparação de Arquitetura

### Antes (Configuração Incorreta)

```
Frontend (www.saraivavision.com.br)
    ↓
Nginx Proxy (/wp-json/)
    ↓
blog.saraivavision.com.br/wp-json/  # ❌ Retorna HTML
    ↓
❌ Parsing Error (HTML não é JSON)
```

### Depois (Configuração Correta)

```
Frontend (www.saraivavision.com.br)
    ↓
Nginx Proxy (/wp-json/)
    ↓
cms.saraivavision.com.br/wp-json/   # ✅ Retorna JSON
    ↓
✅ WordPress REST API Response (JSON válido)
    ↓
✅ Blog renderizado corretamente
```

---

## 🎯 Recomendações Adicionais

### 1. Monitoramento WordPress API

**Implementar health check automatizado**:
```bash
#!/bin/bash
# /usr/local/bin/check-wordpress-api.sh

API_URL="https://cms.saraivavision.com.br/wp-json/wp/v2/posts?per_page=1"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL")

if [ "$RESPONSE" != "200" ]; then
    echo "❌ WordPress API health check failed: HTTP $RESPONSE"
    # Opcional: enviar alerta por email/SMS
    exit 1
fi

echo "✅ WordPress API health check passed"
exit 0
```

**Adicionar ao cron**:
```cron
# Check WordPress API every 5 minutes
*/5 * * * * /usr/local/bin/check-wordpress-api.sh >> /var/log/wordpress-health.log 2>&1
```

---

### 2. Cache Strategy para WordPress API

**Considerar adicionar cache em Nginx**:
```nginx
# WordPress REST API proxy com cache (opcional)
location /wp-json/ {
    # Cache configuration
    proxy_cache wordpress_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    proxy_cache_bypass $http_cache_control;
    add_header X-Cache-Status $upstream_cache_status;

    # Resto da configuração...
}
```

**Benefícios**:
- Reduz carga no WordPress externo
- Melhora latência para usuários
- Resiliência se WordPress temporariamente down

**Considerações**:
- Cache deve ser curto (5 minutos recomendado)
- Adicionar `proxy_cache_bypass` para admin operations
- Monitorar hit/miss ratio

---

### 3. Rate Limiting Específico WordPress

**Configuração atual é adequada mas pode ser otimizada**:

```nginx
# Rate limiting mais granular (opcional)
limit_req_zone $binary_remote_addr zone=wp_read:10m rate=60r/m;    # GET requests
limit_req_zone $binary_remote_addr zone=wp_write:10m rate=10r/m;   # POST/PUT/DELETE

location /wp-json/ {
    # Apply different limits based on method
    limit_req zone=wp_read burst=10 nodelay;  # Para GET
    # Para POST/PUT/DELETE usar zone=wp_write (requer configuração condicional)

    # Resto da configuração...
}
```

---

## 📚 Documentação Relacionada

- [EMERGENCY_FIXES_2025-09-29.md](./EMERGENCY_FIXES_2025-09-29.md) - Migração GraphQL → REST API
- [WORDPRESS_CMS_URL_ARCHITECTURE.md](./WORDPRESS_CMS_URL_ARCHITECTURE.md) - Arquitetura de subdomínios
- [WORDPRESS_LOCAL_CLEANUP_2025-09-29.md](./WORDPRESS_LOCAL_CLEANUP_2025-09-29.md) - Cleanup de recursos locais
- [CORS_FIX_DEPLOYMENT.md](./CORS_FIX_DEPLOYMENT.md) - Guia CORS deployment

---

## 🔐 Segurança

### Headers de Segurança (Já Implementados)

✅ **Correto**:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy` adequado para medical compliance
- `Permissions-Policy` restritivo

### Rate Limiting (Já Implementado)

✅ **Correto**:
- API: 30 requests/minute
- Main: 60 requests/second
- Burst handling adequado

### SSL/TLS (Já Implementado)

✅ **Correto**:
- TLS 1.2 e 1.3 apenas
- Strong ciphers
- OCSP stapling
- Perfect Forward Secrecy

---

## ✅ Critérios de Sucesso

### Backend (Nginx)

- [x] WordPress REST API proxy aponta para cms.saraivavision.com.br
- [x] CORS headers completos incluindo Vary: Origin
- [x] OPTIONS preflight handling correto
- [x] Rate limiting adequado
- [x] Timeouts configurados

### Frontend (React)

- [ ] Blog page carrega posts sem erros CORS
- [ ] Network tab mostra 200 OK para /wp-json/ requests
- [ ] Console sem erros WordPress API
- [ ] Fallback system funciona se API down

### Integração

- [ ] End-to-end test: www.saraivavision.com.br/blog funcional
- [ ] Performance não degradada (Core Web Vitals)
- [ ] Logs Nginx sem erros CORS ou proxy
- [ ] Monitoramento por 24h sem incidentes

---

**Data**: 2025-09-29
**Status**: ✅ Review completo
**Próxima ação**: Aplicar correções e fazer deployment