# CORS Fix Deployment Guide

Guia completo para corrigir erros CORS 204 no WordPress Headless e problemas de logging do Supabase.

## 📋 Sumário Executivo

**Problema**: Origin `https://www.saraivavision.com.br` bloqueada por CORS com status 204 ao acessar WordPress REST API.

**Causa raiz**: Configuração CORS no Nginx/WordPress permitia apenas `https://saraivavision.com.br` (sem www), mas o frontend usa `https://www.saraivavision.com.br` (com www).

**Solução**: Configuração dinâmica de CORS que permite ambas as origens (www e non-www) com validação adequada.

## 🔧 Arquivos Modificados

### 1. Nginx Configuration - WordPress Blog

**Arquivo**: `docs/nginx-wordpress-blog.conf`

**Mudanças**:
- ✅ CORS dinâmico com regex para permitir www e non-www
- ✅ Headers `Vary: Origin` para cache adequado
- ✅ `Access-Control-Allow-Credentials: true` para cookies
- ✅ `Access-Control-Max-Age: 86400` (24h) para performance
- ✅ Preflight OPTIONS com headers completos
- ✅ Header `X-WP-Nonce` adicionado para autenticação WordPress

**Deployment**:
```bash
# No VPS como root ou sudo
sudo cp docs/nginx-wordpress-blog.conf /etc/nginx/sites-available/saraiva-wordpress-blog
sudo nginx -t                      # Validar configuração
sudo systemctl reload nginx        # Aplicar mudanças
```

### 2. Nginx Configuration - WordPress CMS

**Arquivo**: `docs/nginx-wordpress-cms.conf`

**Mudanças**: Idênticas ao blog, aplicadas também ao endpoint GraphQL

**Deployment**:
```bash
sudo cp docs/nginx-wordpress-cms.conf /etc/nginx/sites-available/saraiva-wordpress-cms
sudo nginx -t
sudo systemctl reload nginx
```

### 3. WordPress Must-Use Plugin

**Arquivo**: `docs/wordpress-cors-mu-plugin.php`

**Funcionalidades**:
- ✅ CORS para REST API
- ✅ CORS para GraphQL (WPGraphQL)
- ✅ Preflight OPTIONS handler
- ✅ Suporte para localhost em desenvolvimento
- ✅ Logging de CORS em modo debug

**Deployment**:
```bash
# Blog WordPress
sudo cp docs/wordpress-cors-mu-plugin.php /var/www/blog.saraivavision.com.br/wp-content/mu-plugins/saraiva-cors.php
sudo chown www-data:www-data /var/www/blog.saraivavision.com.br/wp-content/mu-plugins/saraiva-cors.php
sudo chmod 644 /var/www/blog.saraivavision.com.br/wp-content/mu-plugins/saraiva-cors.php

# CMS WordPress (se necessário)
sudo cp docs/wordpress-cors-mu-plugin.php /var/www/cms.saraivavision.com.br/wp-content/mu-plugins/saraiva-cors.php
sudo chown www-data:www-data /var/www/cms.saraivavision.com.br/wp-content/mu-plugins/saraiva-cors.php
sudo chmod 644 /var/www/cms.saraivavision.com.br/wp-content/mu-plugins/saraiva-cors.php
```

### 4. WordPress Client (Frontend)

**Arquivo**: `src/lib/wpClient.ts`

**Funcionalidades**:
- ✅ Retry exponencial (até 2 tentativas)
- ✅ Timeout configurável (padrão 10s)
- ✅ AbortController para cancelamento
- ✅ Error handling específico para 204
- ✅ Tipagem TypeScript completa

**Uso**:
```typescript
import { wpFetch } from '@/lib/wpClient';

const categories = await wpFetch<Category[]>('/categories?per_page=50');
```

### 5. WordPress Categories Hook

**Arquivo**: `src/hooks/useWPCategories.ts`

**Funcionalidades**:
- ✅ Cancelamento automático no unmount
- ✅ Refetch manual via função
- ✅ Estados de loading/error claros
- ✅ Mensagens de erro específicas para 204/404

**Uso**:
```typescript
import { useWPCategories } from '@/hooks/useWPCategories';

function BlogPage() {
  const { data, loading, error, refetch } = useWPCategories();

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  return <CategoryList categories={data} />;
}
```

### 6. Supabase Singleton Client

**Arquivo**: `src/lib/supabaseClient.ts`

**Funcionalidades**:
- ✅ Singleton pattern - uma única instância GoTrueClient
- ✅ Validação de configuração
- ✅ Separação client (RLS) vs admin (bypass RLS)
- ✅ Detecção de placeholder values
- ✅ Logging detalhado em desenvolvimento

**Uso**:
```typescript
import { getSupabaseClient, getSupabaseAdmin } from '@/lib/supabaseClient';

// Frontend operations (RLS enabled)
const supabase = getSupabaseClient();

// Backend operations (RLS bypassed - use with caution)
const admin = getSupabaseAdmin();
```

### 7. Logger com Fallback

**Arquivo**: `src/lib/logger.js`

**Mudanças**:
- ✅ Usa singleton Supabase centralizado
- ✅ Fallback console quando Supabase não configurado
- ✅ Tratamento específico para erro 401 (API key inválida)
- ✅ Tratamento específico para PGRST301 (JWT error)
- ✅ Mensagens de erro descritivas

### 8. Vite Config com Validação

**Arquivo**: `vite.config.js`

**Funcionalidades**:
- ✅ Validação de variáveis obrigatórias no build
- ✅ Validação de formato de URLs
- ✅ Detecção de placeholder values
- ✅ Build falha em produção se config inválida
- ✅ Warnings para variáveis recomendadas

## 🧪 Testes de Validação

### Teste 1: CORS OPTIONS (Preflight)

```bash
# Blog
curl -I -X OPTIONS "https://blog.saraivavision.com.br/wp-json/wp/v2/categories" \
  -H "Origin: https://www.saraivavision.com.br" \
  -H "Access-Control-Request-Method: GET"

# CMS
curl -I -X OPTIONS "https://cms.saraivavision.com.br/wp-json/wp/v2/categories" \
  -H "Origin: https://www.saraivavision.com.br" \
  -H "Access-Control-Request-Method: GET"
```

**Esperado**:
- Status: `204 No Content`
- Header: `Access-Control-Allow-Origin: https://www.saraivavision.com.br`
- Header: `Vary: Origin`
- Header: `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- Header: `Access-Control-Max-Age: 86400`

### Teste 2: GET Request com CORS

```bash
# Blog
curl -I "https://blog.saraivavision.com.br/wp-json/wp/v2/categories?per_page=5" \
  -H "Origin: https://www.saraivavision.com.br"

# CMS
curl -I "https://cms.saraivavision.com.br/wp-json/wp/v2/?_fields=name" \
  -H "Origin: https://www.saraivavision.com.br"
```

**Esperado**:
- Status: `200 OK`
- Header: `Access-Control-Allow-Origin: https://www.saraivavision.com.br`
- Header: `Vary: Origin`
- Header: `Content-Type: application/json`

### Teste 3: GraphQL CORS

```bash
curl -I -X POST "https://cms.saraivavision.com.br/graphql" \
  -H "Origin: https://www.saraivavision.com.br" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

**Esperado**:
- Status: `200 OK`
- Header: `Access-Control-Allow-Origin: https://www.saraivavision.com.br`

### Teste 4: Frontend Integration

1. **Abrir console do navegador** em `https://www.saraivavision.com.br`

2. **Testar wpClient diretamente**:
```javascript
import { wpFetch } from '/src/lib/wpClient.ts';

// Deve funcionar sem erro CORS
const result = await wpFetch('/categories?per_page=5');
console.log('Categories:', result);
```

3. **Verificar logs**:
- ❌ Não deve haver erros de CORS
- ❌ Não deve haver warnings sobre múltiplos GoTrueClient
- ❌ Não deve haver erros 401 do Supabase (ou deve ter fallback console)

### Teste 5: Validação de Build

```bash
# Deve passar validação
npm run build

# Deve falhar com variáveis inválidas
VITE_SUPABASE_URL=invalid npm run build
```

## 📦 Checklist de Deployment

### Pré-deployment
- [ ] Backup das configurações Nginx atuais
- [ ] Backup do diretório mu-plugins do WordPress
- [ ] Verificar se variáveis de ambiente estão corretas em `.env.production`

### Deployment - Backend (VPS)

```bash
# 1. Atualizar Nginx configs
sudo cp docs/nginx-wordpress-blog.conf /etc/nginx/sites-available/saraiva-wordpress-blog
sudo cp docs/nginx-wordpress-cms.conf /etc/nginx/sites-available/saraiva-wordpress-cms

# 2. Validar Nginx
sudo nginx -t

# 3. Aplicar Nginx (sem downtime)
sudo systemctl reload nginx

# 4. Instalar WordPress mu-plugin
sudo mkdir -p /var/www/blog.saraivavision.com.br/wp-content/mu-plugins
sudo mkdir -p /var/www/cms.saraivavision.com.br/wp-content/mu-plugins

sudo cp docs/wordpress-cors-mu-plugin.php /var/www/blog.saraivavision.com.br/wp-content/mu-plugins/saraiva-cors.php
sudo cp docs/wordpress-cors-mu-plugin.php /var/www/cms.saraivavision.com.br/wp-content/mu-plugins/saraiva-cors.php

# 5. Ajustar permissões
sudo chown -R www-data:www-data /var/www/blog.saraivavision.com.br/wp-content/mu-plugins
sudo chown -R www-data:www-data /var/www/cms.saraivavision.com.br/wp-content/mu-plugins
sudo chmod 644 /var/www/blog.saraivavision.com.br/wp-content/mu-plugins/saraiva-cors.php
sudo chmod 644 /var/www/cms.saraivavision.com.br/wp-content/mu-plugins/saraiva-cors.php

# 6. Verificar serviços
sudo systemctl status nginx
sudo systemctl status php8.3-fpm
```

### Deployment - Frontend

```bash
# 1. Validar variáveis de ambiente
cat .env.production | grep -E "VITE_SUPABASE_URL|VITE_WORDPRESS_API_URL"

# 2. Build com validação
npm run build

# 3. Deploy para VPS
sudo cp -r dist/* /var/www/html/

# 4. Limpar cache Nginx (se necessário)
sudo rm -rf /var/cache/nginx/blog/*
sudo rm -rf /var/cache/nginx/cms/*

# 5. Verificar serviço frontend
curl -I https://www.saraivavision.com.br
```

### Pós-deployment
- [ ] Executar todos os testes de validação acima
- [ ] Verificar console do navegador para erros
- [ ] Testar navegação completa no site
- [ ] Verificar logs do Nginx: `sudo tail -f /var/log/nginx/blog_saraiva_error.log`
- [ ] Verificar logs do Nginx: `sudo tail -f /var/log/nginx/cms_saraiva_error.log`
- [ ] Monitorar por 24h para garantir estabilidade

## 🔍 Troubleshooting

### Problema: Ainda recebendo erro CORS 204

**Diagnóstico**:
```bash
# Verificar se Nginx foi recarregado
sudo systemctl status nginx

# Verificar configuração ativa
sudo nginx -T | grep -A 20 "Access-Control"

# Testar diretamente
curl -v -X OPTIONS "https://blog.saraivavision.com.br/wp-json/wp/v2/categories" \
  -H "Origin: https://www.saraivavision.com.br"
```

**Soluções**:
1. Forçar reload: `sudo systemctl restart nginx`
2. Verificar cache do CDN (se houver)
3. Limpar cache do navegador (Ctrl+Shift+Delete)
4. Verificar se o WordPress mu-plugin está ativo: acessar `https://blog.saraivavision.com.br/wp-admin/plugins.php?plugin_status=mustuse`

### Problema: Múltiplas instâncias GoTrueClient

**Diagnóstico**:
```bash
# Procurar por createClient duplicados
grep -r "createClient" src/ --include="*.js" --include="*.ts"
```

**Solução**:
- Substituir todos os imports diretos de `createClient` por:
```typescript
import { getSupabaseClient } from '@/lib/supabaseClient';
const supabase = getSupabaseClient();
```

### Problema: Logger 401 Unauthorized

**Diagnóstico**:
- Verificar se `VITE_SUPABASE_SERVICE_ROLE_KEY` está correto
- Verificar se `VITE_SUPABASE_URL` aponta para o projeto correto

**Solução**:
- O logger agora faz fallback para console automaticamente
- Verificar .env.production e reconstruir: `npm run build`

### Problema: Build falha com variáveis faltando

**Diagnóstico**:
```bash
npm run build 2>&1 | grep "Missing required"
```

**Solução**:
- Adicionar variáveis faltantes em `.env.production`
- Para desenvolvimento, adicionar em `.env.local`
- Verificar o template: `.env.example`

## 📊 Monitoramento Pós-Deploy

### Métricas a Monitorar

1. **Nginx Access Logs**:
```bash
# Monitorar requests para WordPress
sudo tail -f /var/log/nginx/blog_saraiva_access.log | grep "wp-json"
sudo tail -f /var/log/nginx/cms_saraiva_access.log | grep "wp-json"
```

2. **Nginx Error Logs**:
```bash
# Monitorar erros CORS
sudo tail -f /var/log/nginx/blog_saraiva_error.log | grep -i "cors\|origin"
sudo tail -f /var/log/nginx/cms_saraiva_error.log | grep -i "cors\|origin"
```

3. **WordPress Debug Log** (se WP_DEBUG ativo):
```bash
sudo tail -f /var/www/blog.saraivavision.com.br/wp-content/debug.log | grep "CORS"
```

4. **Frontend Console**:
- Abrir DevTools (F12)
- Console: verificar erros CORS
- Network: verificar status das requisições para WordPress

### Alertas Críticos

- ❌ Status 204 sem headers CORS
- ❌ Múltiplas instâncias de GoTrueClient
- ❌ Erros 401 repetidos do Supabase logging
- ❌ Timeout em requests WordPress

## 🎯 Critérios de Sucesso

### ✅ Backend
- [ ] OPTIONS retorna 204 com headers CORS completos
- [ ] GET/POST retornam 200 com Access-Control-Allow-Origin
- [ ] Ambas origins (www e non-www) são permitidas
- [ ] Header Vary presente para cache adequado
- [ ] Nginx reload sem erros

### ✅ Frontend
- [ ] Nenhum erro CORS no console
- [ ] Nenhum warning sobre múltiplos GoTrueClient
- [ ] Logger funciona ou faz fallback silencioso para console
- [ ] Build passa validação de environment
- [ ] WordPress categories carregam sem erro

### ✅ Integração
- [ ] Blog page carrega categorias corretamente
- [ ] Nenhum fetch repetido desnecessariamente
- [ ] Cancelamento de requests funciona no unmount
- [ ] Performance não degradou (Core Web Vitals)

## 📚 Referências

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [Nginx CORS Config](https://enable-cors.org/server_nginx.html)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

## 🔒 Segurança

**Práticas Implementadas**:
- ✅ Whitelist de origins (apenas saraivavision.com.br e www)
- ✅ Validação de origin via regex
- ✅ Access-Control-Allow-Credentials apenas quando necessário
- ✅ Service Role Key apenas no backend
- ✅ Rate limiting mantido no Nginx (10 req/s)

**Não Implementado** (por decisão de arquitetura):
- ❌ CORS totalmente aberto (`*`) - risco de segurança
- ❌ Service Role Key no frontend - risco crítico
- ❌ Desabilitar rate limiting - risco de abuse