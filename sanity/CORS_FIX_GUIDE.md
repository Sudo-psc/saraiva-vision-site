# Sanity Studio CORS Fix - Production Guide

## Problema
```
Access to XMLHttpRequest at 'https://92ocrdmp.api.sanity.io/v2021-06-07/users/me' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

## Causa Raiz
O domínio `https://studio.saraivavision.com.br` não está cadastrado na whitelist 
de CORS do projeto Sanity (ID: 92ocrdmp).

---

## ✅ SOLUÇÃO DEFINITIVA

### PASSO 1: Verificar Projeto Sanity

```bash
# 1.1 - Login no Sanity CLI
cd /home/saraiva-vision-site/sanity
npx sanity login

# 1.2 - Listar projetos (confirmar acesso ao 92ocrdmp)
npx sanity projects list

# 1.3 - Verificar CORS origins atuais
npx sanity cors list

# Exemplo de output:
# Origin                              Allow Credentials
# http://localhost:3333               Yes
# (vazio se nunca configurou)
```

---

### PASSO 2: Adicionar CORS Origins

#### **Método A: Via Sanity CLI (Recomendado)**

```bash
# 2.1 - Adicionar domínio de produção
npx sanity cors add https://studio.saraivavision.com.br \
  --project 92ocrdmp \
  --credentials

# 2.2 - Adicionar localhost para desenvolvimento
npx sanity cors add http://localhost:3333 \
  --project 92ocrdmp \
  --credentials

# 2.3 - Se usar www, adicionar também
npx sanity cors add https://www.studio.saraivavision.com.br \
  --project 92ocrdmp \
  --credentials

# 2.4 - Verificar que foram adicionados
npx sanity cors list

# Output esperado:
# Origin                                      Allow Credentials
# https://studio.saraivavision.com.br         Yes
# http://localhost:3333                       Yes
```

#### **Método B: Via Dashboard (Alternativa)**

1. Acesse: https://manage.sanity.io
2. Login com suas credenciais
3. Selecione o projeto: **saraiva-vision-blog** (ID: 92ocrdmp)
4. No menu lateral: **API** → **CORS Origins**
5. Clique em **Add CORS Origin**
6. Configure:
   ```
   Origin: https://studio.saraivavision.com.br
   ☑ Allow credentials
   ```
7. Clique em **Add Origin**
8. Repita para:
   ```
   Origin: http://localhost:3333
   ☑ Allow credentials
   ```

---

### PASSO 3: Verificar Configuração do Studio

```bash
# 3.1 - Verificar sanity.config.js
cd /home/saraiva-vision-site/sanity
cat sanity.config.js
```

#### **Configuração Esperada:**
```javascript
// sanity.config.js
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas/index.js'

export default defineConfig({
  name: 'saraiva-vision-blog',
  title: 'Saraiva Vision Blog',

  projectId: '92ocrdmp',          // ✅ CORRETO
  dataset: 'production',           // ✅ CORRETO

  basePath: '/',                   // ✅ Importante: root path
  
  apiVersion: '2024-01-01',        // ✅ API version explícita

  plugins: [
    structureTool(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
```

#### **⚠️ Verificações Críticas:**

```bash
# 3.2 - Confirmar que projectId está correto
grep "projectId" sanity.config.js
# Output esperado: projectId: '92ocrdmp',

# 3.3 - Confirmar que basePath é '/' (não '/studio' ou outro)
grep "basePath" sanity.config.js
# Output esperado: basePath: '/',

# 3.4 - Verificar versão do Sanity
npm list sanity @sanity/vision
# Output esperado: 
# sanity@4.11.0
# @sanity/vision@4.11.0
```

---

### PASSO 4: Verificar Nginx (Não Interfira com CORS)

```bash
# 4.1 - Verificar config do Nginx
cat /etc/nginx/sites-available/sanity-studio
```

#### **⚠️ IMPORTANTE: Nginx NÃO deve adicionar headers CORS para api.sanity.io**

```nginx
# ❌ ERRADO - NÃO FAÇA ISSO
location / {
    add_header 'Access-Control-Allow-Origin' '*';  # ❌ REMOVE ISSO
    add_header 'Access-Control-Allow-Credentials' 'true';  # ❌ REMOVE ISSO
    try_files $uri $uri/ /index.html;
}

# ✅ CORRETO - Nginx apenas serve arquivos estáticos
server {
    listen 443 ssl;
    server_name studio.saraivavision.com.br;

    root /home/saraiva-vision-site/sanity/dist;
    index index.html;

    # SSL config
    ssl_certificate /etc/letsencrypt/live/studio.saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/studio.saraivavision.com.br/privkey.pem;

    # Serve arquivos estáticos
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers (OK para o Studio, não para API)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### **Se encontrou headers CORS no Nginx:**

```bash
# 4.2 - Remover headers CORS incorretos
sudo nano /etc/nginx/sites-available/sanity-studio
# Remova qualquer linha com "Access-Control-Allow-*"

# 4.3 - Testar config
sudo nginx -t

# 4.4 - Recarregar Nginx
sudo systemctl reload nginx
```

---

### PASSO 5: Limpar Cache e Rebuild

```bash
# 5.1 - Limpar cache do Vite
cd /home/saraiva-vision-site/sanity
rm -rf dist node_modules/.vite

# 5.2 - Rebuild
npm run build

# 5.3 - Verificar que build foi criado
ls -lh dist/static/sanity-*.js
```

---

### PASSO 6: Verificar DNS e SSL

```bash
# 6.1 - Testar DNS
dig studio.saraivavision.com.br +short
# Output esperado: 31.97.129.78

# 6.2 - Testar SSL
echo | openssl s_client -servername studio.saraivavision.com.br \
  -connect studio.saraivavision.com.br:443 2>/dev/null | \
  openssl x509 -noout -dates

# Output esperado:
# notBefore=Oct 29 11:43:02 2025 GMT
# notAfter=Jan 27 11:43:01 2026 GMT

# 6.3 - Testar HTTP redirect (deve redirecionar para HTTPS)
curl -I http://studio.saraivavision.com.br
# Output esperado: HTTP/1.1 301 Moved Permanently
# Location: https://studio.saraivavision.com.br/
```

---

### PASSO 7: Testar CORS Preflight

```bash
# 7.1 - Testar OPTIONS request (preflight)
curl -i -X OPTIONS \
  -H "Origin: https://studio.saraivavision.com.br" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: content-type,authorization" \
  "https://92ocrdmp.api.sanity.io/v2021-06-07/users/me?tag=sanity.studio.users.get-current"

# Output esperado (se CORS está configurado):
# HTTP/2 200
# access-control-allow-origin: https://studio.saraivavision.com.br
# access-control-allow-credentials: true
# access-control-allow-methods: GET, POST, PUT, PATCH, DELETE
# vary: Origin
```

#### **Se retornar erro ou sem headers CORS:**
```
❌ CORS não configurado corretamente!
→ Volte ao PASSO 2 e adicione o origin novamente
→ Aguarde 1-2 minutos para propagação
```

---

### PASSO 8: Validação no Browser

#### **8.1 - Limpar Cache do Browser**
```
Windows/Linux: Ctrl + Shift + Del
Mac: Cmd + Shift + Del

Selecione:
☑ Cookies e dados do site
☑ Imagens e arquivos em cache

Período: Tudo
```

#### **8.2 - Abrir em Aba Anônima**
```
Windows/Linux: Ctrl + Shift + N
Mac: Cmd + Shift + N

Navegar para: https://studio.saraivavision.com.br
```

#### **8.3 - Abrir DevTools (F12)**
```
1. Aba Console: NÃO deve ter erros de CORS
2. Aba Network: 
   - Filter: "users/me"
   - Verificar OPTIONS request: Status 200
   - Verificar GET request: Status 200
   - Headers devem incluir:
     ✅ access-control-allow-origin: https://studio.saraivavision.com.br
     ✅ access-control-allow-credentials: true
```

#### **8.4 - Testar Login**
```
1. Clicar em "Sign in"
2. Autenticar com Google/GitHub/Email
3. Deve redirecionar de volta ao Studio
4. Dashboard deve carregar sem erros
```

---

## 🚨 Troubleshooting

### Erro 1: "CORS ainda bloqueado após adicionar origin"

**Possíveis causas:**
```bash
# A) Cache do browser
Solução: Limpar cache (Ctrl+Shift+Del) + testar em aba anônima

# B) Origin com trailing slash
Problema: https://studio.saraivavision.com.br/ (com /)
Solução: Remover e adicionar sem trailing slash
npx sanity cors delete <id>
npx sanity cors add https://studio.saraivavision.com.br --credentials

# C) HTTP vs HTTPS
Problema: Adicionou http:// mas site roda em https://
Solução: Verificar protocol exato no browser
npx sanity cors list
# Deve coincidir EXATAMENTE com o que aparece no console do browser

# D) Nginx adicionando headers CORS conflitantes
Solução: Remover add_header Access-Control-* do nginx.conf
```

### Erro 2: "Workspace: missing context value" persiste

```bash
# A) Versão do Sanity incompatível
npm list sanity
# Se < 4.0.0, atualizar:
npm install sanity@latest @sanity/vision@latest

# B) Config inválida
# Verificar que sanity.config.js exporta default:
head -5 sanity.config.js
# Deve ter: export default defineConfig({

# C) Node modules corrompidos
rm -rf node_modules package-lock.json
npm install
npm run build

# D) Multiple configs
# Verificar se não há sanity.config.ts E sanity.config.js
ls -la sanity.config.*
# Deve ter apenas UM arquivo
```

### Erro 3: "Preflight OPTIONS retorna 404"

```bash
# A) URL da API está errada
# Verificar que projectId no config é 92ocrdmp
grep projectId sanity.config.js

# B) Projeto não existe ou foi deletado
npx sanity projects list
# Deve aparecer: 92ocrdmp - saraiva-vision-blog

# C) Network bloqueado (firewall/proxy)
# Testar direct access:
curl -I https://92ocrdmp.api.sanity.io/v2021-06-07/data/doc/production
# Deve retornar HTTP/2 200
```

---

## 📋 CHECKLIST DE VALIDAÇÃO FINAL

### ✅ Configuração Sanity (CLI/Dashboard)
- [ ] CORS origin adicionado: `https://studio.saraivavision.com.br`
- [ ] CORS credentials habilitado: `Allow credentials: Yes`
- [ ] CORS localhost adicionado (dev): `http://localhost:3333`
- [ ] Verificado com: `npx sanity cors list`

### ✅ Configuração Studio (sanity.config.js)
- [ ] `projectId: '92ocrdmp'` está correto
- [ ] `dataset: 'production'` está correto
- [ ] `basePath: '/'` está configurado
- [ ] `apiVersion: '2024-01-01'` está definido
- [ ] Schemas importados corretamente (com `.js`)

### ✅ Infraestrutura
- [ ] DNS resolve: `studio.saraivavision.com.br → 31.97.129.78`
- [ ] SSL válido: Certificado não expirado
- [ ] HTTP→HTTPS redirect: Funciona (301)
- [ ] Nginx NÃO adiciona headers CORS para `/`
- [ ] Build atualizado: `dist/` contém versão mais recente

### ✅ Testes de CORS (curl)
- [ ] OPTIONS request retorna 200 com headers CORS
- [ ] `access-control-allow-origin` contém origin exato
- [ ] `access-control-allow-credentials: true`
- [ ] `vary: Origin` presente

### ✅ Testes de Browser
- [ ] DevTools Console: SEM erros de CORS
- [ ] Network: OPTIONS /users/me → 200
- [ ] Network: GET /users/me → 200
- [ ] Login funciona: Redireciona corretamente
- [ ] Dashboard carrega: Mostra schemas (Blog Post, Author, etc.)

### ✅ Funcionalidades
- [ ] Criar novo documento: Funciona
- [ ] Upload de imagem: Funciona
- [ ] Vision (GROQ): Queries retornam dados
- [ ] Deploy: Frontend consome dados do Sanity

---

## 🔄 PLANO DE ROLLBACK

Se a correção causar problemas inesperados:

### Opção 1: Reverter CORS

```bash
# 1. Listar origins com IDs
npx sanity cors list

# Output:
# ID                                    Origin                              Credentials
# abc123                                https://studio.saraivavision...     Yes
# def456                                http://localhost:3333               Yes

# 2. Deletar origin problemático
npx sanity cors delete abc123

# 3. Verificar remoção
npx sanity cors list
```

### Opção 2: Rollback do Build

```bash
# 1. Restaurar backup anterior
cd /home/saraiva-vision-site
tar -xzf monit-backups/monit-backup-20251029_113549.tar.gz sanity/dist

# 2. Ou rebuild de commit anterior
cd sanity
git log --oneline -5
git checkout <commit-hash> -- sanity.config.js
npm run build
```

### Opção 3: Usar Sanity Deploy (Managed Hosting)

Se self-hosting causar problemas contínuos:

```bash
# 1. Deploy para Sanity Cloud
cd /home/saraiva-vision-site/sanity
npx sanity deploy

# 2. Desabilitar custom domain no nginx
sudo mv /etc/nginx/sites-enabled/sanity-studio \
       /etc/nginx/sites-available/sanity-studio.backup
sudo systemctl reload nginx

# 3. Usar URL do Sanity
# Output do deploy: https://saraiva-vision-blog.sanity.studio
```

### Opção 4: Reverter Nginx Config

```bash
# 1. Restaurar backup do nginx
sudo cp /etc/nginx/sites-available/sanity-studio.backup \
       /etc/nginx/sites-available/sanity-studio

# 2. Testar e recarregar
sudo nginx -t && sudo systemctl reload nginx
```

---

## 📊 COMANDOS RÁPIDOS DE DIAGNÓSTICO

```bash
# Quick check script
cat > ~/check-sanity-cors.sh << 'SCRIPT'
#!/bin/bash
echo "=== SANITY CORS DIAGNOSTIC ==="
echo ""
echo "1. CORS Origins:"
cd /home/saraiva-vision-site/sanity && npx sanity cors list
echo ""
echo "2. Project ID:"
grep projectId sanity.config.js
echo ""
echo "3. DNS:"
dig studio.saraivavision.com.br +short
echo ""
echo "4. SSL:"
echo | openssl s_client -servername studio.saraivavision.com.br -connect studio.saraivavision.com.br:443 2>/dev/null | openssl x509 -noout -dates
echo ""
echo "5. CORS Preflight Test:"
curl -s -I -X OPTIONS \
  -H "Origin: https://studio.saraivavision.com.br" \
  -H "Access-Control-Request-Method: GET" \
  "https://92ocrdmp.api.sanity.io/v2021-06-07/users/me" | grep -i "access-control"
echo ""
echo "=== END DIAGNOSTIC ==="
SCRIPT

chmod +x ~/check-sanity-cors.sh
~/check-sanity-cors.sh
```

---

## 🔗 RECURSOS ÚTEIS

- **Sanity CORS Docs**: https://www.sanity.io/docs/cors
- **CLI Reference**: https://www.sanity.io/docs/cli
- **Manage Dashboard**: https://manage.sanity.io
- **Status Page**: https://status.sanity.io
- **Community**: https://slack.sanity.io

---

**Última Atualização**: Oct 29, 2025  
**Projeto**: saraiva-vision-blog (92ocrdmp)  
**Studio URL**: https://studio.saraivavision.com.br
