# 🚀 Next.js Migration - Quick Reference

> Referência rápida para depuração da migração React → Next.js App Router

---

## 📦 Comandos Essenciais

```bash
# Desenvolvimento
npm run dev                           # Dev server (port 3000)

# Build e Deploy
npm run build                         # Build produção
npm run start                         # Servidor produção (após build)

# Verificações
npm run lint                          # ESLint
bash scripts/detect-client-components.sh   # Detectar 'use client' faltante
bash scripts/validate-metadata.sh          # Verificar metadata
bash scripts/check-unoptimized-images.sh   # Verificar <img> não otimizadas

# Limpeza
rm -rf .next node_modules/.cache      # Limpar cache
```

---

## 🔍 Debugging Rápido

### Hydration Mismatch

```tsx
// ❌ ERRADO
export default function Page() {
  const width = window.innerWidth; // Quebra SSR
}

// ✅ CORRETO
'use client';
import { useEffect, useState } from 'react';

export default function Page() {
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => setWidth(window.innerWidth), []);
  if (width === null) return null;
  return <div>{width}</div>;
}
```

### Server Component com Hooks

```tsx
// ❌ ERRADO
export default function Page() {
  const [count, setCount] = useState(0); // Erro!
}

// ✅ CORRETO
'use client';
import { useState } from 'react';

export default function Page() {
  const [count, setCount] = useState(0);
}
```

### 404 em Rotas Dinâmicas

```tsx
// app/blog/[slug]/page.tsx

// ✅ OBRIGATÓRIO para SSG
export async function generateStaticParams() {
  const posts = await fetch('...').then(r => r.json());
  return posts.map((post) => ({ slug: post.slug }));
}
```

### Cache Desatualizado (ISR)

```tsx
// ✅ Revalidar a cada 1 hora
export const revalidate = 3600;

export default async function Page() {
  const data = await fetch('...', {
    next: { revalidate: 3600 },
  }).then(r => r.json());
}
```

### Metadata Faltante

```tsx
// ✅ Metadata estática
export const metadata = {
  title: 'Meu Título',
  description: 'Minha descrição',
};

// ✅ Metadata dinâmica
export async function generateMetadata({ params }) {
  const data = await fetch(`.../${params.id}`).then(r => r.json());
  return {
    title: data.title,
    description: data.description,
  };
}
```

---

## 🔧 Grep Úteis

```bash
# Buscar window/document em Server Components
grep -RIn "window\|document" app | grep -v '"use client"'

# Buscar componentes sem 'use client' mas com hooks
grep -r "useState\|useEffect" app --include="*.tsx" | grep -v '"use client"'

# Buscar rotas sem metadata
find app -name "page.tsx" -exec grep -L "metadata\|generateMetadata" {} \;

# Buscar <img> não otimizadas
grep -r '<img' app src --include="*.tsx" | grep -v "next/image"

# Buscar fetch sem cache config
grep -r "fetch(" app --include="*.tsx" | grep -v "cache:\|revalidate:"
```

---

## 🎯 Checklist Mínimo

- [ ] `npm run build` sem erros
- [ ] Sem hydration mismatch no console
- [ ] Client Components têm `'use client'`
- [ ] Rotas dinâmicas têm `generateStaticParams`
- [ ] Metadata em todas as páginas
- [ ] Imagens usando `next/image`
- [ ] Middleware < 50ms

---

## 📚 Links Úteis

- [Guia Completo de Depuração](./NEXTJS_MIGRATION_DEBUG_GUIDE.md)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Migração Review](../NEXTJS_MIGRATION_REVIEW.md)

---

**Última Atualização**: Outubro 2025
