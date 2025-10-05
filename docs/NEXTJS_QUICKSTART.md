# 🚀 Next.js - Guia Rápido de Setup

## ✅ O que foi criado

Sistema completo de agendamento para **Next.js 15** com App Router.

---

## 📁 Arquivos Criados

```
app/
├── agendamento/
│   ├── page.tsx                    ✅ Página principal
│   ├── loading.tsx                 ✅ Loading UI
│   └── error.tsx                   ✅ Error boundary
└── api/
    └── ninsaude/
        ├── available-slots/
        │   └── route.ts            ✅ GET horários disponíveis
        └── appointments/
            └── route.ts            ✅ POST/DELETE agendamentos

src/
├── components/scheduling/
│   └── AppointmentScheduler.next.tsx  ✅ Client Component
└── hooks/
    └── usePhoneMask.ts             ✅ TypeScript version
```

---

## 🔧 Setup Rápido

### 1. Variáveis de Ambiente

Crie `.env.local` na raiz:

```env
NINSAUDE_API_URL=https://api.ninsaude.com/v1
NINSAUDE_API_KEY=sua_chave_api_aqui
```

### 2. Rodar Next.js

```bash
npm run dev
```

### 3. Acessar

```
http://localhost:3000/agendamento
```

---

## 🔑 Principais Diferenças

### React/Vite → Next.js

| Feature | React/Vite | Next.js |
|---------|------------|---------|
| API Calls | Client direto | Server API Routes |
| API Key | `.env` (REACT_APP_*) | `.env.local` (server-only) |
| Routing | React Router | App Router (built-in) |
| Language | JavaScript | TypeScript |
| SEO | Manual (Helmet) | Automático (Metadata API) |

---

## 📡 API Routes (Backend)

### Buscar Horários
```
GET /api/ninsaude/available-slots?date=2025-10-15
```

### Criar Agendamento
```
POST /api/ninsaude/appointments
Body: { patient, appointment, consent }
```

### Cancelar Agendamento
```
DELETE /api/ninsaude/appointments?id=AGD-001
```

---

## 🎯 Vantagens Next.js

✅ **Segurança:** API keys no servidor (nunca expostas)  
✅ **SEO:** Metadata automática, Server Components  
✅ **Performance:** Code splitting, caching, ISR  
✅ **DX:** TypeScript, hot reload, error overlay  
✅ **Deploy:** Vercel (zero config), edge functions  

---

## 🚀 Deploy Vercel

```bash
# Conectar repositório GitHub
vercel

# Deploy produção
vercel --prod
```

**Configurar Variáveis no Dashboard:**
1. Vercel → Settings → Environment Variables
2. Adicionar `NINSAUDE_API_URL` e `NINSAUDE_API_KEY`
3. Redeploy

---

## 📚 Documentação Completa

Ver: `docs/NEXTJS_SCHEDULING_GUIDE.md`

---

## ✨ Testes

```bash
# Mesmos testes do React/Vite funcionam!
npm run test:run -- \
  src/hooks/__tests__/usePhoneMask.test.js \
  src/hooks/__tests__/useNinsaudeScheduling.test.js \
  src/components/scheduling/__tests__/AppointmentScheduler.simple.test.jsx
```

**Resultado:** 32/32 testes passando ✅

---

**Status:** ✅ PRONTO PARA PRODUÇÃO  
**Rota:** `/agendamento`  
**Versão:** Next.js 15 + App Router
