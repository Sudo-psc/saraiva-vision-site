# 🚀 CORS Fix - Quick Start Guide

## ⚡ TL;DR - 3 Comandos para Testar

```bash
# 1. Iniciar backend
cd api && npm run dev

# 2. Testar CORS
./test-cors-fix.sh

# 3. Verificar no browser (http://localhost:3002)
# Cole no console:
fetch('http://localhost:3001/api/google-reviews?placeId=test&limit=3').then(r=>r.json()).then(console.log)
```

**Resultado esperado**: ✅ Sem erros CORS, headers `Access-Control-*` presentes

---

## 📋 O Que Foi Mudado?

### ❌ ANTES (Conflito)
```
📂 api/
├── src/server.js          ← CORS middleware aqui
└── google-reviews.js      ← E headers CORS duplicados aqui! ❌
```

### ✅ DEPOIS (Corrigido)
```
📂 api/
├── src/server.js          ← CORS middleware (único lugar)
└── google-reviews.js      ← Sem headers, confia no middleware ✅
```

---

## 🔍 Como Funciona Agora?

```
┌─────────────────────────────────────────────────────────┐
│ 1. Request do Frontend (http://localhost:3002)         │
│    ↓                                                    │
│    fetch('http://localhost:3001/api/google-reviews')   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Preflight OPTIONS Request (automático do browser)    │
│    Headers:                                             │
│    - Origin: http://localhost:3002                      │
│    - Access-Control-Request-Method: GET                 │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Backend Express (http://localhost:3001)              │
│    ↓                                                    │
│    app.use(cors({                                       │
│      origin: ['http://localhost:3002'],                │
│      methods: ['GET', 'POST', 'OPTIONS'],               │
│      credentials: true                                  │
│    }))  ← Adiciona headers automaticamente             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Response com Headers CORS                            │
│    HTTP/1.1 204 No Content                              │
│    Access-Control-Allow-Origin: http://localhost:3002   │
│    Access-Control-Allow-Methods: GET, POST, OPTIONS     │
│    Access-Control-Allow-Headers: Content-Type, ...      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Browser valida headers e permite request real        │
│    ✅ CORS OK → Faz GET request                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Teste Completo em 5 Passos

### 1️⃣ **Verificar arquivos foram alterados**
```bash
cd /Users/philipecruz/saraiva-vision-site-1

# Verificar que google-reviews.js NÃO tem headers CORS
grep -n "Access-Control-Allow-Origin" api/google-reviews.js
# Resultado esperado: (vazio ou apenas em comentário)

# Verificar que server.js TEM middleware CORS
grep -n "app.use(cors" api/src/server.js
# Resultado esperado: app.use(cors({...}))
```

### 2️⃣ **Iniciar backend**
```bash
cd api
npm run dev
# Aguardar: "🚀 Saraiva Vision API server running on port 3001"
```

### 3️⃣ **Testar Preflight (OPTIONS)**
```bash
# Novo terminal
curl -i -X OPTIONS \
  -H "Origin: http://localhost:3002" \
  -H "Access-Control-Request-Method: GET" \
  http://localhost:3001/api/google-reviews

# ✅ Sucesso se ver:
# HTTP/1.1 204 No Content
# Access-Control-Allow-Origin: http://localhost:3002
```

### 4️⃣ **Testar GET Request**
```bash
curl -i -H "Origin: http://localhost:3002" \
  "http://localhost:3001/api/google-reviews?placeId=test&limit=3"

# ✅ Sucesso se ver headers CORS:
# Access-Control-Allow-Origin: http://localhost:3002
# (Pode ter erro 400/500 da API, mas headers CORS devem estar presentes)
```

### 5️⃣ **Testar no Browser**
```javascript
// 1. Abrir http://localhost:3002 no browser
// 2. Abrir DevTools (F12)
// 3. Ir para Console
// 4. Colar e executar:

fetch('http://localhost:3001/api/google-reviews?placeId=test&limit=3', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
.then(res => {
  console.log('Status:', res.status);
  console.log('CORS header:', res.headers.get('Access-Control-Allow-Origin'));
  return res.json();
})
.then(data => console.log('✅ Data:', data))
.catch(err => console.error('❌ Error:', err));

// ✅ Sucesso: Sem erros CORS no console
// ❌ Falha: "blocked by CORS policy"
```

---

## 🔧 Troubleshooting Rápido

### ❌ Erro: "blocked by CORS policy"

**Verificar checklist**:
```bash
# 1. Backend rodando?
curl http://localhost:3001/health
# Deve retornar: {"status":"healthy"}

# 2. Headers CORS no response?
curl -I http://localhost:3001/api/google-reviews
# Procurar: Access-Control-Allow-Origin

# 3. Frontend na origem correta?
# Deve ser http://localhost:3002 (não 3000, não 3003)

# 4. Logs do backend (procurar erros)
npm run dev
# Olhar console para stack traces
```

**Soluções**:
```bash
# Solução 1: Reiniciar backend
npm run dev

# Solução 2: Limpar cache do browser
# Chrome: Ctrl+Shift+Delete → Clear cache

# Solução 3: Testar em aba anônima
# Chrome: Ctrl+Shift+N

# Solução 4: Verificar ordem de middleware
# Em server.js, CORS deve vir ANTES das rotas
```

### ❌ Erro: Preflight returns 401/404

**Causa**: Middleware de autenticação bloqueando OPTIONS.

**Solução**: Garantir ordem em `api/src/server.js`:
```javascript
app.use(cors({...}));           // 1. CORS primeiro
app.use(express.json());        // 2. Body parser
app.use('/api/public', routes); // 3. Rotas públicas
app.use(authMiddleware);        // 4. Auth DEPOIS
app.use('/api/protected', ...); // 5. Rotas protegidas
```

---

## 📊 DevTools - Como Verificar

### 1. Abrir DevTools (F12)
### 2. Ir para aba **Network**
### 3. Fazer a requisição fetch
### 4. Clicar na requisição `google-reviews`
### 5. Ir para aba **Headers**

**Verificar**:
```
Request Headers:
  Origin: http://localhost:3002        ✅

Response Headers:
  Access-Control-Allow-Origin: http://localhost:3002   ✅
  Access-Control-Allow-Methods: GET, POST, OPTIONS     ✅
  Access-Control-Allow-Headers: Content-Type, ...      ✅
  Access-Control-Allow-Credentials: true               ✅
```

**Screenshot**:
```
┌────────────────────────────────────────────────────┐
│ Network                                            │
├────────────────────────────────────────────────────┤
│ ☑ All  □ XHR  □ JS  □ CSS  □ Img                  │
├────────────────────────────────────────────────────┤
│ Name              Status  Type   Size    Time      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ google-reviews    200     xhr    1.2KB   45ms      │ ← Clicar aqui
├────────────────────────────────────────────────────┤
│ Headers  Preview  Response  Timing                 │
├────────────────────────────────────────────────────┤
│ Response Headers                                   │
│   Access-Control-Allow-Origin: http://localhost... │ ← Deve estar aqui
│   Content-Type: application/json                   │
│   ...                                              │
└────────────────────────────────────────────────────┘
```

---

## ✅ Checklist Final

Antes de considerar CORS resolvido:

- [ ] Backend rodando (`npm run dev` em `api/`)
- [ ] Middleware CORS em `server.js` (antes das rotas)
- [ ] SEM headers CORS em `google-reviews.js`
- [ ] Preflight (OPTIONS) retorna 204 com headers CORS
- [ ] GET request retorna dados (ou erro, mas com headers CORS)
- [ ] Browser console SEM erros "blocked by CORS"
- [ ] DevTools Network mostra `Access-Control-Allow-Origin`
- [ ] Teste com fetch no console do browser funciona

**✅ 8/8 = CORS 100% funcional**

---

## 🚀 Próximos Passos (Pós-CORS)

1. ✅ **CORS resolvido**
2. 🔑 **Configurar API key** → `.env.local`:
   ```bash
   GOOGLE_PLACES_API_KEY=your_actual_key_here
   GOOGLE_PLACE_ID=ChIJ...  # ID do Google Places
   ```
3. 🧪 **Testar com dados reais**:
   ```bash
   curl "http://localhost:3001/api/google-reviews?placeId=ChIJ..."
   ```
4. 🚀 **Deploy produção**:
   ```bash
   npm run build
   npm run deploy
   ```
5. 📊 **Monitorar** → Logs, performance, erros

---

## 📚 Documentação Completa

- 📖 [CORS_TROUBLESHOOTING.md](docs/CORS_TROUBLESHOOTING.md) - Guia detalhado
- 🛠️ [CORS_EXAMPLES.md](docs/CORS_EXAMPLES.md) - Exemplos multi-framework
- 📋 [CORS_FIX_SUMMARY.md](CORS_FIX_SUMMARY.md) - Resumo técnico
- 🧪 [test-cors-fix.sh](api/test-cors-fix.sh) - Script de teste

---

## 🆘 Ajuda

**Problema não resolvido?**

1. Execute `./api/test-cors-fix.sh` → Compartilhe output
2. Screenshot do DevTools → Network → Headers
3. Logs do backend → `npm run dev` → Copie erros
4. Versões → `node --version`, `npm list cors`

**CORS OK** = ✅ Console limpo + Headers presentes + fetch funciona

---

**Última atualização**: 2025-10-06
**Status**: ✅ Configurado e testável
**Breaking changes**: Nenhum
