# Next.js Component Migration Guide

Guia detalhado de migração de componentes React (Vite) para Next.js 15 App Router.

---

## 📋 Princípios Fundamentais

### Server Components vs Client Components

**Next.js 15 App Router**: Todos componentes são **Server Components** por padrão.

```tsx
// ✅ Server Component (padrão)
// src/components/Header.tsx
export default function Header() {
  return <header>...</header>;
}

// ❌ Client Component (quando necessário)
// src/components/Counter.tsx
'use client';  // ← Diretiva obrigatória

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Quando Usar 'use client'

**Necessário para:**
- ✅ React Hooks (useState, useEffect, useContext, etc.)
- ✅ Event handlers (onClick, onChange, etc.)
- ✅ Browser APIs (window, localStorage, etc.)
- ✅ Third-party libraries que usam hooks (Framer Motion, React Hook Form)

**NÃO necessário para:**
- ❌ Componentes estáticos (apenas renderização)
- ❌ Fetch de dados (usar Server Components)
- ❌ SEO metadata

---

## 🔄 Padrões de Migração

### 1. Componentes UI Estáticos

#### Antes (Vite)
```jsx
// src/components/Footer.jsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white p-8">
      <p>&copy; 2025 Saraiva Vision</p>
    </footer>
  );
}
```

#### Depois (Next.js)
```tsx
// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white p-8">
      <p>&copy; 2025 Saraiva Vision</p>
    </footer>
  );
}
```

**Mudanças:**
- ❌ Remover `import React from 'react'` (não necessário)
- ✅ Renomear `.jsx` → `.tsx`
- ✅ Server Component (sem 'use client')

---

### 2. Componentes com Estado (useState)

#### Antes (Vite)
```jsx
// src/components/Accordion.jsx
import React, { useState } from 'react';

export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);
  
  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>
          <button onClick={() => setOpenIndex(index)}>
            {item.title}
          </button>
          {openIndex === index && <p>{item.content}</p>}
        </div>
      ))}
    </div>
  );
}
```

#### Depois (Next.js)
```tsx
// src/components/Accordion.tsx
'use client';  // ← OBRIGATÓRIO (useState)

import { useState } from 'react';

interface AccordionItem {
  title: string;
  content: string;
}

interface Props {
  items: AccordionItem[];
}

export default function Accordion({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>
          <button onClick={() => setOpenIndex(index)}>
            {item.title}
          </button>
          {openIndex === index && <p>{item.content}</p>}
        </div>
      ))}
    </div>
  );
}
```

**Mudanças:**
- ✅ `'use client'` no topo
- ✅ TypeScript interfaces
- ✅ Typed hooks: `useState<number | null>`

---

### 3. Componentes com Context

#### Antes (Vite)
```jsx
// src/components/ThemeProvider.jsx
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

#### Depois (Next.js)
```tsx
// src/components/ThemeProvider.tsx
'use client';  // ← OBRIGATÓRIO (Context + hooks)

import { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export function ThemeProvider({ children }: Props) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

**Mudanças:**
- ✅ `'use client'` no provider
- ✅ TypeScript para context type
- ✅ Error handling no hook

---

### 4. Componentes com React Router Link

#### Antes (Vite)
```jsx
// src/components/ServiceCard.jsx
import { Link } from 'react-router-dom';

export default function ServiceCard({ service }) {
  return (
    <Link to={`/servicos/${service.id}`} className="card">
      <h3>{service.title}</h3>
      <p>{service.description}</p>
    </Link>
  );
}
```

#### Depois (Next.js)
```tsx
// src/components/ServiceCard.tsx
import Link from 'next/link';

interface Service {
  id: string;
  title: string;
  description: string;
}

interface Props {
  service: Service;
}

export default function ServiceCard({ service }: Props) {
  return (
    <Link href={`/servicos/${service.id}`} className="card">
      <h3>{service.title}</h3>
      <p>{service.description}</p>
    </Link>
  );
}
```

**Mudanças:**
- ❌ Remover `react-router-dom`
- ✅ `import Link from 'next/link'`
- ✅ `to` → `href`
- ✅ Server Component (sem hooks)

---

### 5. Componentes com useNavigate

#### Antes (Vite)
```jsx
// src/components/LoginForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email);
    navigate('/dashboard');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

#### Depois (Next.js)
```tsx
// src/components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email);
    router.push('/dashboard');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

**Mudanças:**
- ✅ `'use client'` (useState + event handlers)
- ✅ `useNavigate` → `useRouter` (next/navigation)
- ✅ `navigate('/path')` → `router.push('/path')`

---

### 6. Componentes com useParams

#### Antes (Vite)
```jsx
// src/components/ServiceDetail.jsx
import { useParams } from 'react-router-dom';

export default function ServiceDetail() {
  const { serviceId } = useParams();
  
  return <h1>Service: {serviceId}</h1>;
}
```

#### Depois (Next.js)
```tsx
// src/app/servicos/[serviceId]/page.tsx
interface Props {
  params: { serviceId: string };
}

export default function ServiceDetailPage({ params }: Props) {
  return <h1>Service: {params.serviceId}</h1>;
}
```

**Mudanças:**
- ❌ Não usar `useParams` (não existe em Server Components)
- ✅ Receber `params` como prop da page
- ✅ Server Component (melhor SEO)

---

### 7. Componentes com Framer Motion

#### Antes (Vite)
```jsx
// src/components/AnimatedCard.jsx
import { motion } from 'framer-motion';

export default function AnimatedCard({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
```

#### Depois (Next.js)
```tsx
// src/components/AnimatedCard.tsx
'use client';  // ← OBRIGATÓRIO (Framer Motion usa hooks)

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function AnimatedCard({ children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
```

**Mudanças:**
- ✅ `'use client'` (Framer Motion)
- ✅ TypeScript para props

---

### 8. Componentes com Helmet (SEO)

#### Antes (Vite)
```jsx
// src/pages/ServicesPage.jsx
import { Helmet } from 'react-helmet-async';

export default function ServicesPage() {
  return (
    <>
      <Helmet>
        <title>Serviços | Saraiva Vision</title>
        <meta name="description" content="Nossos serviços" />
      </Helmet>
      <h1>Serviços</h1>
    </>
  );
}
```

#### Depois (Next.js)
```tsx
// src/app/servicos/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Serviços | Saraiva Vision',
  description: 'Nossos serviços',
  openGraph: {
    title: 'Serviços | Saraiva Vision',
    description: 'Nossos serviços',
  },
};

export default function ServicesPage() {
  return <h1>Serviços</h1>;
}
```

**Mudanças:**
- ❌ Remover `react-helmet-async`
- ✅ Usar `export const metadata` (Next.js Metadata API)
- ✅ Server Component

---

### 9. Componentes com useEffect (Data Fetching)

#### Antes (Vite)
```jsx
// src/components/ReviewsList.jsx
import { useState, useEffect } from 'react';

export default function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/google-reviews')
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <p>Loading...</p>;
  
  return (
    <ul>
      {reviews.map(review => (
        <li key={review.id}>{review.text}</li>
      ))}
    </ul>
  );
}
```

#### Depois (Next.js) - Opção 1: Server Component (Recomendado)
```tsx
// src/components/ReviewsList.tsx (Server Component)
async function getReviews() {
  const res = await fetch('https://saraivavision.com.br/api/google-reviews', {
    next: { revalidate: 3600 }, // Cache 1h
  });
  
  if (!res.ok) throw new Error('Failed to fetch');
  
  return res.json();
}

export default async function ReviewsList() {
  const { reviews } = await getReviews();
  
  return (
    <ul>
      {reviews.map((review: any) => (
        <li key={review.id}>{review.text}</li>
      ))}
    </ul>
  );
}
```

#### Depois (Next.js) - Opção 2: Client Component
```tsx
// src/components/ReviewsList.tsx (Client Component)
'use client';

import { useState, useEffect } from 'react';

export default function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/google-reviews')
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <p>Loading...</p>;
  
  return (
    <ul>
      {reviews.map((review: any) => (
        <li key={review.id}>{review.text}</li>
      ))}
    </ul>
  );
}
```

**Recomendação:** Usar **Server Component** para SEO e performance.

---

## 🎨 Componentes UI (Radix + shadcn)

### Status de Compatibilidade

| Componente | Vite | Next.js | Mudanças |
|------------|------|---------|----------|
| **Dialog** | ✅ | ✅ | Adicionar 'use client' |
| **Dropdown** | ✅ | ✅ | Adicionar 'use client' |
| **Toast** | ✅ | ✅ | Adicionar 'use client' |
| **Tabs** | ✅ | ✅ | Adicionar 'use client' |
| **Label** | ✅ | ✅ | Server Component OK |

### Exemplo: Dialog Migration

#### Antes (Vite)
```jsx
// src/components/ui/dialog.jsx
import * as DialogPrimitive from '@radix-ui/react-dialog';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogContent = DialogPrimitive.Content;
```

#### Depois (Next.js)
```tsx
// src/components/ui/dialog.tsx
'use client';  // ← OBRIGATÓRIO (Radix UI)

import * as DialogPrimitive from '@radix-ui/react-dialog';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogContent = DialogPrimitive.Content;
```

**Mudança:** Apenas adicionar `'use client'`.

---

## 📦 Componentes Específicos do Projeto

### 1. Navbar

```tsx
// src/components/Navbar.tsx
'use client';  // ← useState para mobile menu

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 w-full bg-white shadow-lg z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link href="/">
            <img src="/logo.svg" alt="Saraiva Vision" />
          </Link>
          
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
          
          <div className={isOpen ? 'block' : 'hidden md:block'}>
            <Link href="/servicos">Serviços</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/sobre">Sobre</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### 2. CFMCompliance

```tsx
// src/components/compliance/CFMCompliance.tsx
export default function CFMCompliance() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <p className="text-sm text-yellow-800">
        <strong>Aviso CFM:</strong> Este artigo possui caráter informativo...
      </p>
    </div>
  );
}
```

**Mudança:** Server Component (sem hooks).

### 3. GoogleReviewsCard

```tsx
// src/components/GoogleReviewsCard.tsx
'use client';

import { useGoogleReviews } from '@/hooks/useGoogleReviews';

export default function GoogleReviewsCard() {
  const { reviews, loading, error } = useGoogleReviews();
  
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar</div>;
  
  return (
    <div className="grid gap-4">
      {reviews.map((review) => (
        <div key={review.id}>
          <p>{review.text}</p>
          <span>{review.rating} ⭐</span>
        </div>
      ))}
    </div>
  );
}
```

**Mudança:** `'use client'` (custom hook).

---

## 🧪 Testes de Componentes

### Antes (Vitest)
```jsx
// src/__tests__/Navbar.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';

describe('Navbar', () => {
  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Serviços')).toBeInTheDocument();
  });
});
```

### Depois (Jest + Next.js)
```tsx
// __tests__/components/Navbar.test.tsx
import { render, screen } from '@testing-library/react';
import Navbar from '@/components/Navbar';

jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Navbar', () => {
  it('renders navigation links', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Serviços')).toBeInTheDocument();
  });
});
```

**Mudanças:**
- ❌ Remover `BrowserRouter`
- ✅ Mock `next/link`

---

## ✅ Checklist de Migração por Componente

### Para Cada Componente:

- [ ] Analisar dependências (hooks, browser APIs, etc.)
- [ ] Decidir: Server Component ou Client Component?
- [ ] Adicionar `'use client'` se necessário
- [ ] Renomear `.jsx` → `.tsx`
- [ ] Adicionar TypeScript interfaces
- [ ] Substituir React Router por Next.js
  - [ ] `Link` → `import Link from 'next/link'`
  - [ ] `useNavigate` → `useRouter` (next/navigation)
  - [ ] `useParams` → `params` prop (pages)
- [ ] Substituir `react-helmet` → Metadata API
- [ ] Atualizar imports (remover `import React`)
- [ ] Escrever testes
- [ ] Validar no Storybook (se aplicável)

---

## 📊 Estatísticas de Migração

### Componentes Saraiva Vision (101 total)

| Tipo | Quantidade | Client Component | Server Component |
|------|-----------|------------------|------------------|
| **UI Components** | 45 | 40 | 5 |
| **Pages** | 21 | 8 | 13 |
| **Compliance** | 12 | 2 | 10 |
| **Instagram** | 8 | 8 | 0 |
| **Forms** | 6 | 6 | 0 |
| **Outros** | 9 | 5 | 4 |

**Estimativa:** ~60% Client Components, ~40% Server Components

---

**Última Atualização**: Outubro 2025
