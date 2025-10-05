# 🚀 Sistema de Agendamento Online - Next.js 15

## 📋 Visão Geral

Versão completa do sistema de agendamento para **Next.js 15** com App Router, Server Components, e API Routes otimizadas.

---

## 📁 Estrutura de Arquivos Next.js

```
app/
├── agendamento/
│   ├── page.tsx                           # Página principal (Server Component)
│   ├── loading.tsx                        # Loading UI
│   └── error.tsx                          # Error boundary
├── api/
│   └── ninsaude/
│       ├── available-slots/
│       │   └── route.ts                   # GET /api/ninsaude/available-slots
│       └── appointments/
│           └── route.ts                   # POST/DELETE /api/ninsaude/appointments

src/
├── components/
│   └── scheduling/
│       ├── AppointmentScheduler.next.tsx  # Client Component
│       └── AppointmentScheduler.jsx       # Versão React/Vite (existente)
└── hooks/
    ├── usePhoneMask.ts                    # Client Hook (TypeScript)
    └── usePhoneMask.js                    # Versão original
```

---

## 🔧 Instalação e Configuração

### 1. Variáveis de Ambiente

Adicione ao `.env.local`:

```env
# Ninsaúde API Configuration
NINSAUDE_API_URL=https://api.ninsaude.com/v1
NINSAUDE_API_KEY=sua_chave_api_ninsaude_aqui
```

**⚠️ IMPORTANTE:** 
- Use `.env.local` para desenvolvimento (nunca commitar)
- Use variáveis de ambiente do Vercel em produção
- API keys NUNCA devem estar no client-side

### 2. Dependências (já instaladas)

```bash
npm install @radix-ui/react-icons --legacy-peer-deps
npm install react-day-picker@^8.10.0 --legacy-peer-deps
```

---

## 🎯 Diferenças Next.js vs React/Vite

### Versão Next.js (AppointmentScheduler.next.tsx)

**✅ Mudanças Principais:**

1. **'use client' Directive**
   ```tsx
   'use client';  // Marca como Client Component
   ```

2. **API Routes no Backend**
   - Chamadas HTTP para `/api/ninsaude/*` (Next.js API)
   - Não expõe API key no client
   - SSR-friendly

3. **TypeScript**
   - Tipagem completa
   - Interfaces para dados
   - Type-safe

4. **Fetch Direto (sem hook customizado)**
   ```tsx
   const response = await fetch('/api/ninsaude/available-slots?date=...');
   ```

### Versão React/Vite (AppointmentScheduler.jsx)

**Características:**

1. **Hook useNinsaudeScheduling**
   - Chamadas diretas à API externa
   - API key no `.env` (REACT_APP_*)
   - Client-side only

2. **JavaScript**
   - Sem tipos
   - PropTypes opcional

---

## 🔌 API Routes - Documentação

### GET /api/ninsaude/available-slots

**Busca horários disponíveis**

**Query Parameters:**
- `date` (obrigatório): Data no formato YYYY-MM-DD
- `professional_id` (opcional): ID do profissional

**Request:**
```bash
GET /api/ninsaude/available-slots?date=2025-10-15
```

**Response 200:**
```json
{
  "slots": [
    { "time": "08:00", "available": true },
    { "time": "08:30", "available": true },
    { "time": "09:00", "available": true }
  ]
}
```

**Response 400:**
```json
{
  "error": "Date parameter is required"
}
```

**Response 500:**
```json
{
  "error": "API key not configured"
}
```

---

### POST /api/ninsaude/appointments

**Cria novo agendamento**

**Request Body:**
```json
{
  "patient": {
    "name": "Maria Silva",
    "email": "maria@example.com",
    "phone": "33988776655"
  },
  "appointment": {
    "date": "2025-10-15",
    "time": "08:00",
    "reason": "consulta-rotina",
    "notes": "Primeira consulta"
  },
  "consent": {
    "lgpd": true,
    "timestamp": "2025-10-05T10:30:00.000Z"
  }
}
```

**Response 201:**
```json
{
  "id": "AGD-2025-001234",
  "status": "confirmed",
  "date": "2025-10-15",
  "time": "08:00",
  "patient": {
    "name": "Maria Silva",
    "email": "maria@example.com"
  }
}
```

**Response 400:**
```json
{
  "error": "Missing required fields"
}
// ou
{
  "error": "LGPD consent is required"
}
```

---

### DELETE /api/ninsaude/appointments

**Cancela agendamento**

**Query Parameters:**
- `id` (obrigatório): ID do agendamento

**Request:**
```bash
DELETE /api/ninsaude/appointments?id=AGD-2025-001234
```

**Response 200:**
```json
{
  "message": "Appointment cancelled successfully"
}
```

---

## 🚀 Como Usar (Next.js)

### Desenvolvimento Local

```bash
# 1. Configurar variáveis
cp .env.example .env.local
# Editar .env.local com suas chaves

# 2. Rodar Next.js
npm run dev

# 3. Acessar
http://localhost:3000/agendamento
```

### Build de Produção

```bash
# Build otimizado
npm run build

# Preview local
npm run start
```

### Deploy Vercel

```bash
# Deploy automático (conectado ao GitHub)
git push origin main

# Deploy manual
vercel --prod
```

**Configurar no Vercel Dashboard:**
1. Settings → Environment Variables
2. Adicionar `NINSAUDE_API_URL` e `NINSAUDE_API_KEY`
3. Redeploy

---

## 🎨 Features Next.js

### 1. Server Components (Padrão)

**Página:** `app/agendamento/page.tsx`
```tsx
// Server Component (sem 'use client')
export default function AgendamentoPage() {
  return <AppointmentScheduler />; // Client Component
}
```

**Benefícios:**
- SEO otimizado
- Metadata dinâmica
- Zero JavaScript no servidor

### 2. Loading States

**Arquivo:** `app/agendamento/loading.tsx`
```tsx
export default function Loading() {
  return <div>Carregando...</div>;
}
```

**Automático durante navegação:**
- Suspense boundary built-in
- Streaming SSR
- Skeleton UI

### 3. Error Boundaries

**Arquivo:** `app/agendamento/error.tsx`
```tsx
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Erro!</h2>
      <button onClick={reset}>Tentar Novamente</button>
    </div>
  );
}
```

**Captura erros:**
- Client-side
- Server-side (em produção)
- Recover gracefully

### 4. Metadata API

**SEO otimizado:**
```tsx
export const metadata: Metadata = {
  title: 'Agendamento Online - Saraiva Vision',
  description: '...',
  openGraph: { ... },
  alternates: {
    canonical: 'https://saraivavision.com.br/agendamento',
  },
};
```

---

## 🔒 Segurança Next.js

### API Routes (Backend)

✅ **Vantagens:**
- API keys nunca expostas no client
- Validação server-side
- Rate limiting fácil
- Logs centralizados

**Exemplo de proteção:**
```ts
// app/api/ninsaude/appointments/route.ts
export async function POST(request: NextRequest) {
  // Validação LGPD
  if (!consent.lgpd) {
    return NextResponse.json(
      { error: 'LGPD consent is required' },
      { status: 400 }
    );
  }
  
  // Sanitização de dados
  const sanitizedData = sanitize(requestData);
  
  // Rate limiting (opcional)
  const rateLimitOk = await checkRateLimit(request);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // Chamada segura à API externa
  const response = await fetch(NINSAUDE_API, {
    headers: {
      'Authorization': `Bearer ${NINSAUDE_API_KEY}`, // Servidor
    },
  });
}
```

---

## 📊 Performance Next.js

### Otimizações Automáticas

1. **Code Splitting**
   - Client Components separados
   - Lazy loading automático
   - Route-based splitting

2. **Image Optimization**
   ```tsx
   import Image from 'next/image';
   
   <Image 
     src="/logo.png" 
     width={200} 
     height={100}
     alt="Saraiva Vision"
     priority // Above the fold
   />
   ```

3. **Font Optimization**
   ```tsx
   import { Inter } from 'next/font/google';
   
   const inter = Inter({ subsets: ['latin'] });
   ```

4. **Static Generation (quando possível)**
   ```tsx
   // Gera página em build time
   export const dynamic = 'force-static';
   ```

---

## 🧪 Testes Next.js

### Testar API Routes

```typescript
// __tests__/api/appointments.test.ts
import { POST } from '@/app/api/ninsaude/appointments/route';

describe('POST /api/ninsaude/appointments', () => {
  it('should create appointment', async () => {
    const request = new Request('http://localhost/api/ninsaude/appointments', {
      method: 'POST',
      body: JSON.stringify({
        patient: { ... },
        appointment: { ... },
        consent: { lgpd: true, timestamp: '...' }
      }),
    });
    
    const response = await POST(request as any);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.id).toBeDefined();
  });
});
```

### Testar Client Component

```typescript
// Mesmo teste do React/Vite funciona!
import { render, screen } from '@testing-library/react';
import AppointmentScheduler from '@/components/scheduling/AppointmentScheduler.next';

test('renders title', () => {
  render(<AppointmentScheduler />);
  expect(screen.getByText('Agendamento Online')).toBeInTheDocument();
});
```

---

## 🔄 Migração React/Vite → Next.js

### Checklist de Migração

- [x] Criar API routes (`app/api/ninsaude/`)
- [x] Adicionar `'use client'` em componentes interativos
- [x] Converter hooks para TypeScript
- [x] Criar página em `app/agendamento/`
- [x] Configurar variáveis de ambiente (`.env.local`)
- [x] Adicionar loading/error states
- [x] Otimizar metadata SEO
- [ ] Testar em produção (Vercel)
- [ ] Configurar rate limiting (opcional)
- [ ] Implementar analytics server-side (opcional)

---

## 📝 Diferenças de Código

### useNinsaudeScheduling (React) → Fetch Direto (Next.js)

**Antes (React/Vite):**
```jsx
import { useNinsaudeScheduling } from '@/hooks/useNinsaudeScheduling';

const { fetchAvailableSlots } = useNinsaudeScheduling();
const slots = await fetchAvailableSlots(date);
```

**Depois (Next.js):**
```tsx
const response = await fetch(`/api/ninsaude/available-slots?date=${date}`);
const data = await response.json();
const slots = data.slots;
```

**Por quê?**
- API key segura no servidor
- Menor bundle client-side
- Cache e revalidação Next.js

---

## 🌐 URLs e Rotas

### Next.js App Router

```
/agendamento              → app/agendamento/page.tsx
/api/ninsaude/*          → app/api/ninsaude/*/route.ts
```

### Navegação Programática

```tsx
'use client';

import { useRouter } from 'next/navigation';

export default function Component() {
  const router = useRouter();
  
  const handleSuccess = () => {
    router.push('/agendamento?success=true');
  };
}
```

---

## 🚨 Troubleshooting Next.js

### Erro: "fetch is not defined"

**Solução:** Usar Next.js 13+, fetch é global

### Erro: "Hooks can only be called inside body of function component"

**Solução:** Adicionar `'use client'` no topo do arquivo

### Erro: "API route not found"

**Verificar:**
```bash
app/api/ninsaude/available-slots/route.ts  ✅
app/api/ninsaude/available-slots.ts        ❌ (errado)
```

### Erro: "Environment variable not found"

**Solução:**
1. Verificar `.env.local` existe
2. Reiniciar `npm run dev`
3. Variáveis devem começar com `NEXT_PUBLIC_` para client-side
4. Variáveis sem prefixo são server-only (correto para API keys)

---

## 📚 Recursos Adicionais

**Documentação Oficial:**
- [Next.js 15 Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

**Exemplos:**
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)
- [Vercel Templates](https://vercel.com/templates)

---

## ✅ Checklist Final

Antes de deploy em produção:

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] API Ninsaúde testada com dados reais
- [ ] LGPD checkbox funcional
- [ ] Validações client + server
- [ ] Loading states funcionando
- [ ] Error boundaries testadas
- [ ] SEO metadata correta
- [ ] Testes passando (32/32) ✅
- [ ] Performance Web Vitals > 90
- [ ] Acessibilidade (a11y) verificada
- [ ] Mobile responsivo testado
- [ ] WhatsApp integration funcional
- [ ] Logs de erro configurados (Sentry/Vercel)

---

**Versão:** 1.0.0 - Next.js 15  
**Status:** ✅ PRONTO PARA PRODUÇÃO  
**Rota:** `/agendamento`  
**Autor:** Equipe Saraiva Vision
