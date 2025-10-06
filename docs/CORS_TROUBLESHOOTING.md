# CORS Troubleshooting Guide - Saraiva Vision

## 🎯 Problema Resolvido

**Erro Original**: `Access to fetch at 'http://localhost:3001/api/google-reviews' from origin 'http://localhost:3002' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present`

**Causa Raiz**: Headers CORS duplicados causando conflito entre middleware Express e headers manuais em route handlers.

---

## ✅ Solução Implementada

### 1. **Configuração CORS Centralizada** (`api/src/server.js`)

```javascript
// CORS configuration - ÚNICA fonte de verdade
app.use(cors({
  origin: [
    'https://saraivavision.com.br',
    'https://www.saraivavision.com.br',
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3003'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));
```

**Importante**: Middleware CORS deve vir **ANTES** de todas as rotas.

### 2. **Remoção de Headers Duplicados** (`api/google-reviews.js`)

**❌ ANTES (causava conflito)**:
```javascript
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // CONFLITO!
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // ...
}
```

**✅ DEPOIS (confia no middleware)**:
```javascript
export default async function handler(req, res) {
    // CORS handled by Express middleware in server.js
    if (req.method === 'OPTIONS') {
        return res.status(204).end(); // Preflight response
    }
    // ...
}
```

### 3. **Adapter Vercel Corrigido**

```javascript
function createExpressAdapter(vercelHandler) {
  return async (req, res) => {
    // Headers CORS já aplicados pelo middleware Express
    const vercelRes = {
      setHeader: (name, value) => {
        res.setHeader(name, value); // Passa através
        return vercelRes;
      },
      // ... outros métodos
    };

    await Promise.resolve(vercelHandler(vercelReq, vercelRes));
  };
}
```

---

## 🧪 Como Testar

### Opção 1: Script Automatizado

```bash
cd /Users/philipecruz/saraiva-vision-site-1/api
chmod +x test-cors-fix.sh
./test-cors-fix.sh
```

### Opção 2: Teste Manual com curl

**Preflight (OPTIONS)**:
```bash
curl -i -X OPTIONS \
  -H "Origin: http://localhost:3002" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  http://localhost:3001/api/google-reviews
```

**Resposta Esperada**:
```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:3002
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Credentials: true
```

**GET Request**:
```bash
curl -i -X GET \
  -H "Origin: http://localhost:3002" \
  "http://localhost:3001/api/google-reviews?placeId=test&limit=3&language=pt-BR"
```

### Opção 3: Teste no Browser

Abra o console do navegador em `http://localhost:3002` e execute:

```javascript
fetch('http://localhost:3001/api/google-reviews?placeId=test&limit=3&language=pt-BR', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ CORS Error:', err));
```

**Resultado Esperado**: Sem erros CORS no console (pode ter erro de API key, mas CORS deve funcionar).

---

## 🔍 Diagnóstico de Problemas

### Check-list de Verificação

- [ ] **Backend rodando?** `curl http://localhost:3001/health`
- [ ] **Middleware CORS carregado antes das rotas?** Verificar ordem em `server.js`
- [ ] **Sem headers CORS manuais em handlers?** Verificar `res.setHeader('Access-Control-...')`
- [ ] **Origin correto?** Frontend deve usar `http://localhost:3002`
- [ ] **Preflight retorna 204/200?** Não deve retornar 401/404
- [ ] **Headers no DevTools?** Network → Headers → Response Headers

### Erros Comuns

#### 1. **Erro: "No 'Access-Control-Allow-Origin' header"**

**Causa**: Middleware CORS não aplicado ou bloqueado antes da rota.

**Solução**:
```javascript
// Em server.js, CORS deve vir ANTES das rotas
app.use(cors({...}));  // ← Primeiro
app.use(express.json());
app.use('/api/google-reviews', handler); // ← Depois
```

#### 2. **Erro: Preflight retorna 401/404**

**Causa**: Middleware de autenticação bloqueando OPTIONS.

**Solução**: Autenticação deve vir **DEPOIS** do CORS:
```javascript
app.use(cors({...}));           // 1. CORS primeiro
app.use(express.json());        // 2. Body parser
app.use('/api/auth', authRoutes); // 3. Rotas sem auth
app.use(validateToken);         // 4. Auth depois
app.use('/api/protected', protectedRoutes);
```

#### 3. **Erro: "Method POST not allowed"**

**Causa**: `Access-Control-Allow-Methods` não inclui POST.

**Solução**: Adicionar método no middleware CORS:
```javascript
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
```

#### 4. **Erro: "Header Content-Type not allowed"**

**Causa**: `Access-Control-Allow-Headers` não inclui `Content-Type`.

**Solução**: Adicionar header no middleware CORS:
```javascript
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
```

#### 5. **Erro: Conflito com redirects (3xx)**

**Causa**: Redirect remove headers CORS.

**Solução**: Configurar CORS na rota original e no redirect:
```javascript
app.use('/api/old', cors({...}), (req, res) => {
  res.redirect(308, '/api/new'); // 308 preserva método e body
});
```

#### 6. **Erro: Credenciais não permitidas com origin '*'**

**Causa**: `credentials: true` requer origin explícito.

**❌ Errado**:
```javascript
cors({
  origin: '*',           // ← Não funciona com credentials
  credentials: true      // ← Causa erro
})
```

**✅ Correto**:
```javascript
cors({
  origin: ['http://localhost:3002'], // ← Origin explícito
  credentials: true
})
```

---

## 🌐 Configuração Nginx (Produção)

Se usar Nginx como reverse proxy, adicionar headers CORS no `nginx.conf`:

```nginx
server {
    listen 80;
    server_name saraivavision.com.br;

    location /api/ {
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        # Preflight
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '$http_origin' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
            add_header 'Access-Control-Max-Age' 1728000; # 20 days cache
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        # Proxy para backend
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**⚠️ Importante**: Se usar Nginx **E** Express CORS, configurar apenas UM deles. Duplicar headers causa conflito.

---

## 🛡️ Segurança em Produção

### Desenvolvimento (permissivo):
```javascript
cors({
  origin: '*',  // ← OK para dev
  credentials: false
})
```

### Produção (restritivo):
```javascript
cors({
  origin: [
    'https://saraivavision.com.br',
    'https://www.saraivavision.com.br'
  ],
  credentials: true,  // Apenas se usar cookies/auth
  maxAge: 86400       // Cache preflight 24h
})
```

### Origem Dinâmica (dev + prod):
```javascript
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://saraivavision.com.br', 'https://www.saraivavision.com.br']
  : ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003'];

cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
})
```

---

## 🔄 Alternativa: Proxy no Frontend (Desenvolvimento)

Se preferir evitar CORS em dev, configurar proxy no Vite:

**`vite.config.js`**:
```javascript
export default {
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
}
```

**Frontend faz requisição relativa**:
```javascript
// Não precisa de CORS, Vite redireciona internamente
fetch('/api/google-reviews?placeId=test&limit=3')
```

---

## 📊 Ferramentas de Debug

### Chrome DevTools
1. Abra Network tab
2. Faça a requisição
3. Clique na requisição
4. Veja aba **Headers**:
   - **Request Headers**: Deve ter `Origin: http://localhost:3002`
   - **Response Headers**: Deve ter `Access-Control-Allow-Origin: http://localhost:3002`

### Firefox DevTools
Similar ao Chrome, mas com mais detalhes sobre CORS no console.

### Postman/Insomnia
❌ **Não testam CORS** (são apps nativas, não navegadores)
✅ Use curl ou browser console para testar CORS

---

## 📝 Resumo

### ✅ O que fazer:
- Configurar CORS uma única vez no middleware Express
- Aplicar CORS **ANTES** de todas as rotas
- Remover headers CORS manuais de handlers
- Retornar status 204 para OPTIONS (preflight)
- Usar origens explícitas em produção

### ❌ O que NÃO fazer:
- Configurar CORS em múltiplos lugares
- Aplicar autenticação antes do CORS
- Usar `origin: '*'` com `credentials: true`
- Testar CORS com Postman/Insomnia
- Ignorar preflight (OPTIONS)

---

## 🆘 Suporte

Se o problema persistir após seguir este guia:

1. Execute `./test-cors-fix.sh` e envie o output
2. Verifique logs do backend: `npm run dev` (procure por erros de CORS)
3. Capture screenshot do Network tab do DevTools
4. Confirme versões: `node --version`, `npm list cors`

**CORS funcional** = Sem erros no console + Headers CORS presentes no Network tab.
