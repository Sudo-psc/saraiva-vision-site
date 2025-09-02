# 🚀 Nginx Configuration Update - Saraiva Vision

**Data da Atualização**: 26 de agosto de 2025

## 📋 **Principais Melhorias Implementadas**

### 🔒 **Segurança Aprimorada**

1. **TLS/SSL Modernizado**:
   - TLSv1.3 priorizado sobre TLSv1.2
   - Ciphers atualizados para configuração moderna
   - Session cache otimizado (`shared:TLS:50m`)
   - OCSP stapling com trusted certificate

2. **Headers de Segurança Expandidos**:
   - HSTS com prazo estendido (2 anos)
   - Permissions-Policy mais restritiva
   - CSP aprimorada com suporte a mais recursos
   - X-Robots-Tag para SEO
   - Upgrade-insecure-requests habilitado

3. **Rate Limiting Granular**:
   - `req_limit`: 10r/s para requisições gerais
   - `api_limit`: 5r/s para APIs (mais restritivo)
   - `login_limit`: 1r/s para login (preparado para futuras implementações)

### ⚡ **Performance Otimizada**

1. **Compressão Avançada**:
   - Tipos MIME expandidos para gzip
   - Suporte preparado para Brotli
   - Vary headers otimizados

2. **Cache Inteligente**:
   - Assets estáticos: 1 ano com `immutable`
   - HTML: no-cache para atualizações imediatas
   - JSON: cache de 1 dia (API responses)
   - Manifest/SW: 7 dias
   - Diferentes estratégias por tipo de arquivo

3. **Modern Image Support**:
   - AVIF e WebP com cache otimizado
   - Vary Accept-Encoding para melhor compressão

### 🛡️ **Proteção de Arquivos Sensíveis**

1. **Arquivos Bloqueados**:
   - Arquivos de configuração (.env, package.json, etc.)
   - Arquivos de backup e temporários
   - Arquivos de versionamento (.git, .svn)
   - Docker files e configs

2. **Proteção de Uploads**:
   - Scripts PHP/Python/etc. bloqueados em /uploads/
   - Log access desabilitado para arquivos sensíveis

### 🌐 **API Proxy Melhorado**

1. **Headers Expandidos**:
   - X-Forwarded-Host e X-Forwarded-Port
   - Real IP detection com fallback
   - Headers de servidor ocultos

2. **CORS Mais Restritivo (Whitelist)**:
   - `map $http_origin $cors_origin` definido no contexto `http`
   - Domínios permitidos: `https://saraivavision.com.br`, `https://www.saraivavision.com.br`, `https://saraivavision.vercel.app`, `http://localhost[:porta]`
   - Cabeçalhos:
     - `Access-Control-Allow-Origin: $cors_origin`
     - `Vary: Origin`
   - Mantido `Access-Control-Allow-Credentials: true`

3. **Timeouts e Buffers**:
   - Timeouts de conexão otimizados
   - Buffer settings para melhor performance

### 📊 **Monitoramento e Observabilidade**

1. **Health Check Endpoint**:
   - `/health` para monitoring
   - Access log desabilitado para reduzir ruído

2. **SEO-Friendly**:
   - robots.txt com cache adequado
   - sitemap.xml com headers XML corretos

## 🔧 **Arquivos Atualizados**

- ✅ `nginx.conf` - ÚNICA configuração de Nginx (canônica)
- 🗑️ Removidos para evitar conflitos: `nginx.local.conf`, `nginx.staging.conf`, `nginx-fixed.conf`, `saraivavision*.conf`

### Migração de caminho raiz (prod)
- Novo caminho canônico: `/var/www/saraivavision/current` (symlink mantido pelo deploy)
- Layout: `/var/www/saraivavision/releases/<timestamp>` + symlink `current`
- Deploy script atualizado para publicar e alternar releases nesse caminho

## 📝 **Comandos de Deploy**

### Para Ambiente de Produção:
```bash
# Testar configuração
sudo nginx -t

# Reload sem downtime
sudo systemctl reload nginx

# Verificar status
sudo systemctl status nginx
```

### Para Ambiente Local:
```bash
# Copiar configuração
sudo cp nginx.local.conf /etc/nginx/sites-available/saraivavision

# Criar symlink
sudo ln -sf /etc/nginx/sites-available/saraivavision /etc/nginx/sites-enabled/

# Testar e recarregar
sudo nginx -t && sudo systemctl reload nginx
```

## 🧪 **Testes Recomendados**

1. **SSL Labs**: https://www.ssllabs.com/ssltest/
2. **Security Headers**: https://securityheaders.com/
3. **Performance**: GTmetrix, PageSpeed Insights
4. **Funcionalidade**: Testar todos os endpoints da API

## ⚠️ **Observações Importantes**

1. **Brotli**: Comentado no código, pode ser habilitado se o módulo estiver disponível
2. **CSP**: Pode precisar de ajustes se novos recursos externos forem adicionados
3. **Rate Limiting**: Monitorar logs para ajustar limites se necessário
4. **Cache**: HTML com no-cache garante atualizações imediatas do SPA

### Habilitar Brotli (opcional)
1. Verificar módulos:
   - `nginx -V 2>&1 | grep -i brotli` ou `ls /etc/nginx/modules-enabled | grep brotli`
2. Se disponível, habilitar no `server` HTTPS (nginx.conf):
   - Descomentar:
     - `brotli on;`
     - `brotli_comp_level 6;`
     - `brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;`
3. Testar e recarregar: `sudo nginx -t && sudo systemctl reload nginx`

## 📈 **Benefícios Esperados**

- 🔒 **Segurança**: Score A+ em testes de segurança
- ⚡ **Performance**: Redução de 20-30% no tempo de carregamento
- 🛡️ **Proteção**: Bloqueio proativo de ataques comuns
- 📊 **Monitoramento**: Melhor observabilidade da aplicação

---

**Preparado por**: GitHub Copilot  
**Revisão**: Recomendada antes do deploy em produção
