# 🚀 Guia de Migração: Navbar React → Next.js

## ❌ Problema Diagnosticado: React Error #306

**Erro**: `Minified React error #306: Element type is invalid`

**Causa Raiz**:
1. **React Router vs Next.js**: Conflito entre `react-router-dom` e Next.js App Router
2. **Complex Dependencies**: Chain de imports com hooks, utils e componentes filhos
3. **Bundle Splitting**: Em produção, componentes podem não carregar corretamente
4. **Circular Dependencies**: Possível dependência circular entre componentes

## ✅ Solução Implementada

### 1. **NavbarNextJS.tsx** - Componente Corrigido

**Localização**: `/src/components/NavbarNextJS.tsx`

**Principais Correções**:
- ✅ **Next.js App Router**: `Link` de `next/link` + `useRouter`/`usePathname`
- ✅ **Self-Contained**: Componentes filhos inline para evitar import issues
- ✅ **TypeScript**: Tipagem completa para prevenir runtime errors
- ✅ **Error Prevention**: Sem dependencies complexas

**Componentes Inline**:
- `LogoComponent`: Evita import do Logo.jsx
- `ButtonComponent`: Evita import do ui/Button.jsx
- `LanguageSwitcherComponent`: Evita import do LanguageSwitcher.jsx
- `BrazilFlag`/`UsaFlag`: SVGs inline

### 2. **NavbarErrorBoundary.tsx** - Proteção Específica

**Localização**: `/src/components/NavbarErrorBoundary.tsx`

**Funcionalidades**:
- 🛡️ **Captura Error #306**: Específico para navbar
- 🔄 **Fallback Navbar**: Versão hardcoded que sempre funciona
- 📊 **Debug Detalhado**: Logs específicos para troubleshooting
- 🔍 **Dev Feedback**: Notice visual em desenvolvimento

## 📦 Integração no Projeto Next.js

### Estrutura de Arquivos Recomendada

```
app/
├── layout.tsx          # Layout principal com navbar
├── page.tsx           # Homepage
├── servicos/
│   └── page.tsx       # Página de serviços
└── contato/
    └── page.tsx       # Página de contato

components/
├── NavbarNextJS.tsx         # ✅ Novo navbar
├── NavbarErrorBoundary.tsx  # ✅ Error boundary
└── Navbar.jsx              # ❌ Versão antiga (React Router)
```

### 1. **Integração no Layout Principal**

Crie ou atualize `app/layout.tsx`:

```tsx
import NavbarErrorBoundary from '@/components/NavbarErrorBoundary';
import NavbarNextJS from '@/components/NavbarNextJS';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Navbar com Error Boundary */}
        <NavbarErrorBoundary>
          <NavbarNextJS />
        </NavbarErrorBoundary>

        {/* Conteúdo da página */}
        <main className="pt-20"> {/* Offset para navbar fixo */}
          {children}
        </main>
      </body>
    </html>
  );
}
```

### 2. **Configuração de Rotas**

Mapeamento de rotas React Router → Next.js:

```
React Router          →  Next.js App Router
/                     →  app/page.tsx
/servicos             →  app/servicos/page.tsx
/lentes               →  app/lentes/page.tsx
/sobre                →  app/sobre/page.tsx
/depoimentos          →  app/depoimentos/page.tsx
/blog                 →  app/blog/page.tsx
/faq                  →  app/faq/page.tsx
/contato              →  app/contato/page.tsx
/podcast              →  app/podcast/page.tsx
```

### 3. **Configuração i18n (Opcional)**

Se usar internacionalização, configure `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['pt', 'en'],
    defaultLocale: 'pt',
  },
}

module.exports = nextConfig
```

## 🧪 Testes Local vs Produção

### Desenvolvimento Local

```bash
# 1. Instalar dependências Next.js
npm install next react react-dom @types/node @types/react @types/react-dom

# 2. Atualizar package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}

# 3. Rodar desenvolvimento
npm run dev
```

**Verificar**:
- ✅ Navbar renderiza sem erros
- ✅ Links funcionam corretamente
- ✅ Menu mobile responsive
- ✅ Não há console errors #306

### Build de Produção

```bash
# 1. Build para produção
npm run build

# 2. Testar produção localmente
npm run start

# 3. Verificar em http://localhost:3000
```

**Verificar**:
- ✅ Build sem erros TypeScript
- ✅ Navbar funciona em produção minified
- ✅ Error boundary não ativa
- ✅ Performance bom (Lighthouse)

## 🚀 Deploy no Vercel

### 1. **Configuração Vercel**

Atualize `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  }
}
```

### 2. **Variáveis de Ambiente**

No dashboard Vercel, adicione:

```env
NEXT_PUBLIC_SITE_URL=https://saraivavision.com.br
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999
```

### 3. **Deploy**

```bash
# Via CLI
npm install -g vercel
vercel --prod

# Ou via Git push (recomendado)
git add .
git commit -m "feat: migrate navbar to Next.js, fix React #306"
git push origin main
```

## 🐛 Debugging Erros Minified

### Source Maps para Produção

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true, // ✅ Ativar source maps
}

module.exports = nextConfig
```

### Logs de Debug

```js
// Adicionar em qualquer page.tsx para debug
useEffect(() => {
  // Check for saved navbar errors
  const navbarError = sessionStorage.getItem('navbarError');
  if (navbarError) {
    console.log('Previous navbar error:', JSON.parse(navbarError));
  }
}, []);
```

### Error Monitoring (Opcional)

```bash
# Adicionar Sentry para produção
npm install @sentry/nextjs

# Configurar em sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'YOUR_DSN',
  tracesSampleRate: 1.0,
});
```

## 🔄 Fallback Temporário

Se o erro persistir, use o navbar fallback diretamente:

```tsx
// Em layout.tsx temporariamente
import { NavbarFallback } from '@/components/NavbarErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* Usar diretamente até fix completo */}
        <NavbarFallback />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
```

## ✅ Checklist Final

### Pré-Deploy
- [ ] NavbarNextJS.tsx funciona em dev
- [ ] Error boundary não ativa
- [ ] Todas as rotas funcionam
- [ ] Menu mobile responsive
- [ ] Links externos funcionam

### Pós-Deploy
- [ ] Build Vercel sem erros
- [ ] Navbar carrega em produção
- [ ] Sem React Error #306 no console
- [ ] Performance Lighthouse >90
- [ ] Mobile funciona corretamente

### Rollback Plan
- [ ] Manter Navbar.jsx original como backup
- [ ] Poder alternar via feature flag se necessário
- [ ] Fallback navbar hardcoded funcionando

---

**🎯 Resultado Esperado**: Navbar funcionando perfeitamente no Next.js sem React Error #306, com fallback robusto e debugging detalhado!