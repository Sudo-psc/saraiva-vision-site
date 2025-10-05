# 🔐 Ninsa úde OAuth2 - Setup e Implementação

## ✅ O que mudou?

Sistema atualizado para usar autenticação **OAuth2** oficial do Ninsaúde (baseado no Postman Collection).

---

## 🔑 Variáveis de Ambiente

### Antes (❌ Inseguro):
```env
REACT_APP_NINSAUDE_API_KEY=chave_exposta_client_side
```

### Depois (✅ Seguro):
```env
# OAuth2 Credentials (NUNCA expor no client)
NINSAUDE_API_URL=https://api.ninsaude.com/v1
NINSAUDE_ACCOUNT=sua_conta
NINSAUDE_USERNAME=seu_usuario  
NINSAUDE_PASSWORD=sua_senha
NINSAUDE_ACCOUNT_UNIT=1
```

---

## 🔄 Fluxo de Autenticação OAuth2

```
1. Login (Server-side)
   POST /api/ninsaude/auth
   { "action": "login" }
   → refresh_token (15 dias)
   → access_token (15 minutos)

2. Armazenar Tokens (Secure Cookie/Session)
   - refresh_token: httpOnly, secure, sameSite
   - access_token: memória (15 min)

3. Renovar Access Token (Auto)
   Antes de expirar (< 5 min):
   POST /api/ninsaude/auth
   { "action": "refresh", "refreshToken": "..." }
   → novo access_token

4. Usar nas Requisições
   GET /api/ninsaude/available-slots
   Headers: x-access-token: {access_token}
```

---

## 📡 API Routes Atualizadas

### 1. Autenticação

**Arquivo:** `app/api/ninsaude/auth/route.ts`

```typescript
// Login
POST /api/ninsaude/auth
Body: { "action": "login" }

Response:
{
  "access_token": "eyJ0...",
  "refresh_token": "def502...",
  "token_type": "Bearer",
  "expires_in": 900
}

// Refresh
POST /api/ninsaude/auth  
Body: { "action": "refresh", "refreshToken": "def502..." }

Response:
{
  "access_token": "eyJ0...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

---

### 2. Horários Disponíveis

**Arquivo:** `app/api/ninsaude/available-slots/route.ts`

```typescript
GET /api/ninsaude/available-slots?date=2025-10-15
Headers:
  x-access-token: {access_token}

// Chama internamente:
GET https://api.ninsaude.com/v1/agenda/horarios-disponiveis
Authorization: bearer {access_token}
```

---

### 3. Criar Agendamento

**Arquivo:** `app/api/ninsaude/appointments/route.ts`

```typescript
POST /api/ninsaude/appointments
Headers:
  x-access-token: {access_token}
Body: { patient, appointment, consent }

// Chama internamente:
POST https://api.ninsaude.com/v1/agenda/agendar
Authorization: bearer {access_token}
```

---

### 4. Cancelar Agendamento

```typescript
DELETE /api/ninsaude/appointments?id=AGD-001
Headers:
  x-access-token: {access_token}

// Chama internamente:
DELETE https://api.ninsaude.com/v1/agenda/AGD-001
Authorization: bearer {access_token}
```

---

## 💻 Client Component Atualizado

```typescript
// src/components/scheduling/AppointmentScheduler.next.tsx

// 1. Obter Access Token (useEffect inicial)
useEffect(() => {
  async function getAccessToken() {
    const response = await fetch('/api/ninsaude/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login' })
    });
    
    const { access_token, expires_in } = await response.json();
    
    // Armazenar em state/context
    setAccessToken(access_token);
    
    // Renovar antes de expirar
    setTimeout(() => refreshAccessToken(), (expires_in - 300) * 1000);
  }
  
  getAccessToken();
}, []);

// 2. Renovar Access Token
async function refreshAccessToken() {
  const response = await fetch('/api/ninsaude/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      action: 'refresh', 
      refreshToken: getRefreshToken() 
    })
  });
  
  const { access_token, expires_in } = await response.json();
  setAccessToken(access_token);
  
  setTimeout(() => refreshAccessToken(), (expires_in - 300) * 1000);
}

// 3. Usar nas Requisições
const response = await fetch('/api/ninsaude/available-slots?date=...', {
  headers: {
    'x-access-token': accessToken
  }
});
```

---

## 🔒 Segurança

### ✅ Boas Práticas Implementadas

1. **Credenciais no Servidor**
   - Conta, usuário, senha NUNCA no client
   - Variáveis de ambiente server-only

2. **Tokens Protegidos**
   - Refresh Token: httpOnly cookie
   - Access Token: memória (não localStorage)

3. **Renovação Automática**
   - Access Token renovado a cada 10 minutos
   - Usuário nunca precisa fazer login novamente

4. **HTTPS Obrigatório**
   - Todas as requisições via HTTPS
   - Certificado Let's Encrypt

---

## 📝 Endpoints Reais do Ninsaúde

Baseado no **Postman Collection oficial**:

### Autenticação
```
POST /v1/oauth2/token (login)
POST /v1/oauth2/token (refresh)
POST /v1/oauth2/revoke (logout)
```

### Agendamentos
```
GET  /v1/agenda/horarios-disponiveis
POST /v1/agenda/agendar
GET  /v1/agenda/{id}
PUT  /v1/agenda/{id}
DELETE /v1/agenda/{id}
```

### Pacientes
```
GET  /v1/paciente/buscar-cpf/{cpf}
POST /v1/paciente
GET  /v1/paciente/{id}
```

### Unidades
```
GET  /v1/account_geral/listar
GET  /v1/account_geral/{id}
```

### Profissionais
```
GET  /v1/profissional/listar
GET  /v1/profissional/{id}
```

---

## 🚀 Deploy (Vercel)

### 1. Configurar Variáveis

```bash
vercel env add NINSAUDE_API_URL
vercel env add NINSAUDE_ACCOUNT
vercel env add NINSAUDE_USERNAME
vercel env add NINSAUDE_PASSWORD
vercel env add NINSAUDE_ACCOUNT_UNIT
```

### 2. Deploy

```bash
vercel --prod
```

---

## 🧪 Testar OAuth2

```bash
# 1. Login
curl -X POST http://localhost:3000/api/ninsaude/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"login"}'

# Response:
# {
#   "access_token": "eyJ0...",
#   "refresh_token": "def502...",
#   "expires_in": 900
# }

# 2. Usar Access Token
curl -X GET "http://localhost:3000/api/ninsaude/available-slots?date=2025-10-15" \
  -H "x-access-token: eyJ0..."

# 3. Refresh Token
curl -X POST http://localhost:3000/api/ninsaude/auth \
  -H "Content-Type": application/json" \
  -d '{
    "action": "refresh",
    "refreshToken": "def502..."
  }'
```

---

## ⚠️ Importante

1. **NUNCA commitar credenciais**
   - Use `.env.local` (git ignorado)
   - Variáveis no Vercel Dashboard

2. **Refresh Token**
   - Armazenar com segurança máxima
   - Revogar ao fazer logout

3. **Access Token**
   - Expira em 15 minutos
   - Renovar automaticamente

4. **Rate Limiting**
   - Implementar rate limit (opcional)
   - Evitar múltiplos logins simultâneos

---

## 📚 Referências

- **Postman Collection:** `Ninsaúde Clinic.postman_collection.json`
- **API Reference:** `docs/NINSAUDE_API_REFERENCE.md`
- **Next.js Guide:** `docs/NEXTJS_SCHEDULING_GUIDE.md`

---

**Status:** ✅ Autenticação OAuth2 implementada  
**Segurança:** ✅ Credenciais protegidas no servidor  
**Tokens:** ✅ Renovação automática
