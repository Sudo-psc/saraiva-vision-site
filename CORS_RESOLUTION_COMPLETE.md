# ✅ SANITY CORS - RESOLUÇÃO COMPLETA

## 🎯 Status Final: RESOLVIDO

**Data**: 29 de Outubro de 2025, 13:25 UTC  
**Problema**: CORS bloqueando autenticação do Sanity Studio  
**Solução**: Origin `https://studio.saraivavision.com.br` adicionado à whitelist  
**Resultado**: ✅ CORS funcionando perfeitamente

---

## 📊 DIAGNÓSTICO EXECUTADO

### 1. Causa Raiz Confirmada
```
❌ ANTES: Origin https://studio.saraivavision.com.br NÃO estava na whitelist
✅ AGORA: Origin adicionado com sucesso + credentials habilitado
```

### 2. CORS Origins Configurados
```bash
$ npx sanity cors list

✅ http://localhost:3333
✅ https://saraivavision.com.br
✅ https://www.saraivavision.com.br
✅ https://localhost:3000
✅ https://localhost:8000
✅ https://saraivavision.sanity.studio
✅ https://studio.saraivavision.com.br  ← NOVO (ADICIONADO AGORA)
```

### 3. Teste de Preflight CORS
```bash
$ curl -i -X OPTIONS \
  -H "Origin: https://studio.saraivavision.com.br" \
  "https://92ocrdmp.api.sanity.io/v2021-06-07/users/me"

HTTP/2 204 ✅
access-control-allow-origin: https://studio.saraivavision.com.br ✅
access-control-allow-credentials: true ✅
access-control-allow-methods: GET ✅
vary: Origin ✅
```

**Interpretação**: 
- ✅ Status 204 = Preflight aprovado
- ✅ Origin exato retornado
- ✅ Credentials permitidas
- ✅ Vary: Origin presente (cache correto)

---

## 🛠️ COMANDOS EXECUTADOS

```bash
# 1. Login no Sanity
cd /home/saraiva-vision-site/sanity
npx sanity login  # (já estava autenticado)

# 2. Listar projetos
npx sanity projects list
# Output: 92ocrdmp   3   SaraivaVision

# 3. Verificar CORS atuais
npx sanity cors list
# Output: 6 origins (sem studio.saraivavision.com.br)

# 4. ADICIONAR ORIGIN CRÍTICO
npx sanity cors add https://studio.saraivavision.com.br --credentials
# Output: CORS origin added successfully ✅

# 5. Confirmar adição
npx sanity cors list
# Output: 7 origins (incluindo studio.saraivavision.com.br) ✅

# 6. Testar preflight
curl -i -X OPTIONS \
  -H "Origin: https://studio.saraivavision.com.br" \
  -H "Access-Control-Request-Method: GET" \
  "https://92ocrdmp.api.sanity.io/v2021-06-07/users/me"
# Output: HTTP/2 204 + headers CORS corretos ✅
```

---

## 🔍 VERIFICAÇÕES DE INFRAESTRUTURA

### ✅ Nginx Configuration
```nginx
# /etc/nginx/sites-available/sanity-studio

server {
    server_name studio.saraivavision.com.br;
    root /home/saraiva-vision-site/sanity/dist;
    
    # ✅ SEM headers CORS (correto - deixa Sanity API gerenciar)
    # ✅ Apenas serve arquivos estáticos
    # ✅ SSL válido até Jan 27, 2026
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Confirmado**: Nginx NÃO interfere com CORS da API Sanity ✅

### ✅ DNS & SSL
```bash
# DNS
studio.saraivavision.com.br → 31.97.129.78 ✅

# SSL
notBefore=Oct 29 11:43:02 2025 GMT
notAfter=Jan 27 11:43:01 2026 GMT ✅

# HTTP → HTTPS redirect
curl -I http://studio.saraivavision.com.br
# HTTP/1.1 301 Moved Permanently ✅
```

### ✅ Build Status
```bash
# Build hash atual
/home/saraiva-vision-site/sanity/dist/static/sanity-CYSh6Nex.js (5.0MB) ✅

# HTML servindo bundle correto
<script type="module" src="/static/sanity-CYSh6Nex.js"></script> ✅

# Studio acessível
https://studio.saraivavision.com.br → HTTP 200 ✅
```

---

## 📋 CHECKLIST DE VALIDAÇÃO

### ✅ Configuração Sanity
- [x] CORS origin adicionado: `https://studio.saraivavision.com.br`
- [x] Credentials habilitado: `--credentials`
- [x] Preflight retorna: `access-control-allow-origin`
- [x] Preflight retorna: `access-control-allow-credentials: true`
- [x] Vary header presente: `Vary: Origin`

### ✅ Infraestrutura
- [x] DNS resolvendo corretamente
- [x] SSL válido (89 dias restantes)
- [x] Nginx servindo Studio corretamente
- [x] Build atualizado (sanity-CYSh6Nex.js)
- [x] HTTP redirect para HTTPS funcionando

### ✅ Testes de API
- [x] OPTIONS /users/me → 204 (preflight ok)
- [x] API Sanity acessível
- [x] Headers CORS corretos
- [x] Nenhum conflito de headers

### ⏳ Pendente: Validação do Usuário
- [ ] Limpar cache do browser (OBRIGATÓRIO)
- [ ] Abrir Studio em aba anônima
- [ ] Verificar DevTools Console (sem erros CORS)
- [ ] Testar fluxo de login
- [ ] Confirmar dashboard carrega

---

## 🎯 PRÓXIMOS PASSOS (USUÁRIO DEVE EXECUTAR)

### PASSO 1: Limpar Cache do Browser (CRÍTICO)

**Método A: Hard Refresh**
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**Método B: Limpar Cache Completo** (Recomendado)
```
Windows/Linux: Ctrl + Shift + Del
Mac: Cmd + Shift + Del

Selecionar:
☑ Cookies e dados do site
☑ Imagens e arquivos em cache
Período: Tudo
```

**Método C: Aba Anônima** (Teste Rápido)
```
Windows/Linux: Ctrl + Shift + N
Mac: Cmd + Shift + N
```

### PASSO 2: Verificar no DevTools

1. Abrir `https://studio.saraivavision.com.br`
2. Pressionar **F12** (abrir DevTools)
3. Ir para aba **Console**
4. **NÃO** deve aparecer:
   ```
   ❌ Access to XMLHttpRequest ... blocked by CORS policy
   ❌ Uncaught Error: Workspace: missing context value
   ```
5. Ir para aba **Network**
6. Filtrar por: `users/me`
7. Clicar na requisição
8. Ver aba **Headers**
9. Confirmar:
   ```
   Response Headers:
   ✅ access-control-allow-origin: https://studio.saraivavision.com.br
   ✅ access-control-allow-credentials: true
   ```

### PASSO 3: Testar Login

1. Na tela do Studio, clicar em **"Sign in"**
2. Escolher método (Google/GitHub/Email)
3. Completar autenticação
4. **Deve** redirecionar de volta ao Studio
5. Dashboard **deve** carregar sem erros
6. Ver schemas: Blog Post, Author, Category

### PASSO 4: Validar Funcionalidades

- [ ] Criar novo documento (teste)
- [ ] Upload de imagem
- [ ] Editar conteúdo
- [ ] Salvar alterações
- [ ] Query GROQ no Vision tool

---

## 🚨 SE ERRO PERSISTIR

### Cenário 1: "CORS ainda bloqueado após limpar cache"

```bash
# Verifique qual origin o browser está enviando
# DevTools → Console, execute:
console.log(window.location.origin)

# Deve retornar EXATAMENTE:
# https://studio.saraivavision.com.br (sem trailing slash)

# Se retornar com / no final ou http:// ou www:
# Adicione esse origin exato:
npx sanity cors add <origin-exato> --credentials
```

### Cenário 2: "Workspace: missing context value" persiste

```bash
# 1. Verificar que config está correta
cd /home/saraiva-vision-site/sanity
cat sanity.config.js | grep -A 3 "name:"
# Deve ter: name: 'saraiva-vision-blog',

# 2. Rebuild completo
rm -rf dist node_modules/.vite
npm run build

# 3. Hard refresh no browser
# Ctrl+Shift+R
```

### Cenário 3: Login redireciona mas falha

```bash
# 1. Verificar se token/session está sendo criado
# DevTools → Application → Cookies
# Deve ter cookies de: api.sanity.io

# 2. Verificar se há bloqueio de third-party cookies
# Chrome: Settings → Privacy → Cookies
# Permitir cookies de api.sanity.io
```

---

## 📊 TESTES DE VALIDAÇÃO (curl)

### Teste 1: Preflight CORS
```bash
curl -i -X OPTIONS \
  -H "Origin: https://studio.saraivavision.com.br" \
  -H "Access-Control-Request-Method: GET" \
  "https://92ocrdmp.api.sanity.io/v2021-06-07/users/me"

# Output esperado:
HTTP/2 204
access-control-allow-origin: https://studio.saraivavision.com.br
access-control-allow-credentials: true
vary: Origin
```

### Teste 2: Studio Serving
```bash
curl -I https://studio.saraivavision.com.br

# Output esperado:
HTTP/2 200
content-type: text/html
```

### Teste 3: JS Bundle
```bash
curl -I https://studio.saraivavision.com.br/static/sanity-CYSh6Nex.js

# Output esperado:
HTTP/2 200
content-type: application/javascript
cache-control: max-age=31536000
```

### Teste 4: DNS
```bash
dig studio.saraivavision.com.br +short

# Output esperado:
31.97.129.78
```

---

## 🔄 PLANO DE ROLLBACK (SE NECESSÁRIO)

### Remover Origin Adicionado
```bash
# 1. Listar com IDs
npx sanity cors list --json

# 2. Identificar ID do studio.saraivavision.com.br
# Exemplo: { "id": "abc123", "origin": "https://studio..." }

# 3. Deletar
npx sanity cors delete abc123

# 4. Confirmar
npx sanity cors list
```

### Rollback de Build
```bash
# Se build atual causar problemas
cd /home/saraiva-vision-site/sanity
git checkout HEAD~1 -- sanity.config.js
npm run build
```

### Usar Sanity Managed Hosting
```bash
# Se self-hosting continuar problemático
cd /home/saraiva-vision-site/sanity
npx sanity deploy

# Output: https://saraiva-vision-blog.sanity.studio
# (sem necessidade de configurar CORS, gerenciado pelo Sanity)
```

---

## 📈 MÉTRICAS DE SUCESSO

### Antes da Correção
```
❌ CORS Error: Access blocked
❌ Status: OPTIONS /users/me → CORS rejection
❌ Login: Failed (can't authenticate)
❌ Studio: "Workspace: missing context value"
```

### Depois da Correção
```
✅ CORS: Configured and working
✅ Status: OPTIONS /users/me → 204 with correct headers
✅ Login: Should work (pending user test)
✅ Studio: Should load dashboard (pending user test)
```

---

## 🎓 O QUE FOI APRENDIDO

### 1. CORS no Sanity Studio
- Studio roda no browser (SPA)
- Faz XHR/fetch para api.sanity.io do domínio onde está hospedado
- Browser exige CORS explícito para cross-origin requests
- Origin deve ser adicionado EXATAMENTE como aparece no browser
- Flag `--credentials` é OBRIGATÓRIA para auth cookies

### 2. Nginx e CORS
- Nginx deve APENAS servir arquivos estáticos do Studio
- NÃO adicionar headers CORS no nginx para requests à API Sanity
- API Sanity gerencia seus próprios headers CORS
- Conflito de headers pode causar preflight duplo (error)

### 3. Debugging CORS
- OPTIONS request é o preflight (deve retornar 2xx)
- Header `Vary: Origin` é importante para cache correto
- `access-control-allow-credentials: true` necessário para auth
- Cache do browser pode esconder fixes (sempre testar em incognito)

### 4. Propagação
- Mudanças de CORS no Sanity são imediatas (sem delay)
- Cache do browser pode levar horas para expirar
- Hard refresh (Ctrl+Shift+R) nem sempre limpa tudo
- Aba anônima é melhor forma de testar

---

## 📞 COMANDOS DE DIAGNÓSTICO RÁPIDO

```bash
# Script criado em: /home/saraiva-vision-site/check-sanity-cors.sh
cd /home/saraiva-vision-site
./check-sanity-cors.sh

# Mostra:
# - CORS origins configurados
# - Project ID e dataset
# - Teste de preflight
# - Status do build
# - DNS/SSL
# - Resumo de problemas
```

---

## 🔗 RECURSOS ÚTEIS

- **Sanity CORS Docs**: https://www.sanity.io/docs/cors
- **Manage Dashboard**: https://manage.sanity.io/project/92ocrdmp
- **CLI Reference**: https://www.sanity.io/docs/cli
- **Community Slack**: https://slack.sanity.io
- **Status Page**: https://status.sanity.io

---

## ✅ CONCLUSÃO

**CORS foi configurado com sucesso!**

### O que funcionou:
1. ✅ Origin `https://studio.saraivavision.com.br` adicionado
2. ✅ Credentials habilitadas (`--credentials`)
3. ✅ Preflight retorna headers corretos
4. ✅ Nginx não interfere com CORS
5. ✅ Build e infraestrutura corretos

### O que falta:
1. ⏳ Usuário limpar cache do browser
2. ⏳ Testar login no Studio
3. ⏳ Confirmar que dashboard carrega

### Próxima ação:
**USUÁRIO**: Limpe o cache (Ctrl+Shift+Del) e teste o Studio!

---

**Documentado em**: 29/10/2025 13:25 UTC  
**Técnico**: OpenCode AI  
**Status**: ✅ CORS RESOLVIDO - Aguardando validação do usuário
