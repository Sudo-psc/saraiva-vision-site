# Next.js Multi-Profile Migration Strategy

> **Integração:** Este documento complementa a [migração Next.js existente](./NEXTJS_MIGRATION_GUIDE.md) com sistema de roteamento multi-perfil inteligente.

## 📋 Executive Summary

**Objetivo:** Migrar para Next.js 14+ com sistema de roteamento baseado em perfil de usuário, implementando três experiências distintas através de middleware Edge.

**Timeline:** Q1 2025 (Janeiro-Março) + 2 semanas extras para sistema de perfis
**Budget Adicional:** R$ 35.000 (sistema de perfis + middleware)
**ROI Esperado:** 8-10 meses (vs. 6-8 meses da migração base)

---

## 🎯 Status Atual do Projeto

### Documentação Existente ✅
- [NEXTJS_SUMMARY.md](./NEXTJS_SUMMARY.md) - Executive Summary
- [NEXTJS_MIGRATION_GUIDE.md](./NEXTJS_MIGRATION_GUIDE.md) - Guia técnico completo (32KB)
- [NEXTJS_COMPONENT_MIGRATION.md](./NEXTJS_COMPONENT_MIGRATION.md) - Migração componentes
- [NEXTJS_CONVERSION_SCRIPTS.md](./NEXTJS_CONVERSION_SCRIPTS.md) - Automação
- [NEXTJS_FAQ.md](./NEXTJS_FAQ.md) - Perguntas frequentes
- [NEXTJS_INDEX.md](./NEXTJS_INDEX.md) - Índice central

### Arquitetura Atual Mapeada
```
Saraiva Vision (React + Vite)
├── Componentes: 101
├── Páginas: 21
├── Hooks: 47
├── Utilitários: 33
├── LOC: ~25.000
└── Testes: 40+
```

---

## 🚀 Nova Especificação: Sistema Multi-Perfil

### RF-001: Três Versões da Aplicação

#### 1. Versão Familiar (`/familiar/*`)
**Público-Alvo:** Famílias, pais com crianças, prevenção

**Navegação (4 seções obrigatórias):**
- "Prevenção" (destaque hero)
- "Exames de Rotina"
- "Planos Familiares"
- "Dúvidas Frequentes"

**Design System:**
```typescript
// Design Tokens - Familiar
const familiarTheme = {
  colors: {
    primary: '#0066CC',    // Azul confiança
    secondary: '#00A86B',  // Verde saúde
    accent: '#FFB900',     // Amarelo energia
  },
  typography: {
    base: '16px',
    lineHeight: 1.6,
  },
  spacing: {
    comfortable: '1.5rem', // Espaçamento generoso
  },
  icons: {
    style: 'family',       // 80% dos cards com ícones família
  }
}
```

**CTAs Principais:**
- "Agendar Consulta Preventiva"
- "Plano Família: 30% Desconto"
- "Exames Infantis Gratuitos"

---

#### 2. Versão Jovem (`/jovem/*`)
**Público-Alvo:** 18-35 anos, tech-savvy, assinatura

**Navegação (5 seções obrigatórias):**
- "Assinatura de Lentes" (hero com animação)
- "Tecnologia" (interativo)
- "Lentes de Contato"
- "Óculos Modernos"
- "App Mobile"

**Design System:**
```typescript
// Design Tokens - Jovem
const jovemTheme = {
  colors: {
    primary: '#FF6B6B',    // Coral vibrante
    secondary: '#4ECDC4',  // Turquesa moderno
    gradients: [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    ]
  },
  animation: {
    fps: 60,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: 'fast',
  },
  responsive: {
    strategy: 'mobile-first',
  }
}
```

**Integrações:**
- API de Assinatura (REST)
- Framer Motion 60fps
- Progressive Web App

**CTAs Principais:**
- "Assinar Lentes: R$ 49/mês"
- "Teste Virtual de Óculos"
- "Download App (iOS/Android)"

---

#### 3. Versão Sênior (`/senior/*`)
**Público-Alvo:** 60+ anos, acessibilidade, confiança

**Navegação (4 seções obrigatórias):**
- "Catarata" (informações detalhadas)
- "Glaucoma" (prevenção/tratamento)
- "Cirurgias"
- "Acessibilidade"

**Design System:**
```typescript
// Design Tokens - Sênior
const seniorTheme = {
  colors: {
    primary: '#1A5490',    // Azul profissional
    secondary: '#000000',  // Preto alto contraste
    background: '#FFFFFF', // Branco puro
    contrast: '7:1',       // WCAG AAA
  },
  typography: {
    base: '18px',          // Fonte maior
    adjustable: '24px',    // Máximo ajustável
    lineHeight: 1.8,       // Leitura confortável
  },
  accessibility: {
    wcag: 'AAA',
    screenReader: 'full',
    keyboard: 'complete',
    buttons: '44x44px',    // Área mínima toque
  }
}
```

**Requisitos WCAG 2.1 AAA:**
- Contraste ≥ 7:1
- ARIA completo (NVDA, JAWS)
- Navegação teclado 100%
- Focus indicators claros
- Sem animações automáticas

**CTAs Principais:**
- "Falar com Especialista"
- "Cirurgia de Catarata: Guia"
- "Agendar Consulta Presencial"

---

## 🛠 Arquitetura Técnica

### Estrutura de Diretórios Next.js
```
/
├── middleware.ts                    # Edge Middleware (profile detection)
├── app/
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Redirect baseado em perfil
│   │
│   ├── familiar/
│   │   ├── layout.tsx              # Layout + nav familiar
│   │   ├── page.tsx                # Home familiar
│   │   ├── prevencao/
│   │   │   └── page.tsx
│   │   ├── exames-rotina/
│   │   │   └── page.tsx
│   │   ├── planos/
│   │   │   └── page.tsx
│   │   └── duvidas/
│   │       └── page.tsx
│   │
│   ├── jovem/
│   │   ├── layout.tsx              # Layout + nav jovem
│   │   ├── page.tsx                # Home jovem (hero assinatura)
│   │   ├── assinatura/
│   │   │   ├── page.tsx
│   │   │   └── api/
│   │   │       └── subscribe/route.ts
│   │   ├── tecnologia/
│   │   │   └── page.tsx            # Animações Framer Motion
│   │   ├── lentes-contato/
│   │   │   └── page.tsx
│   │   ├── oculos/
│   │   │   └── page.tsx
│   │   └── app-mobile/
│   │       └── page.tsx
│   │
│   └── senior/
│       ├── layout.tsx              # Layout + nav sênior (WCAG AAA)
│       ├── page.tsx                # Home sênior
│       ├── catarata/
│       │   └── page.tsx
│       ├── glaucoma/
│       │   └── page.tsx
│       ├── cirurgias/
│       │   └── page.tsx
│       └── acessibilidade/
│           └── page.tsx
│
├── components/
│   ├── navigation/
│   │   ├── FamiliarNav.tsx         # Navegação familiar
│   │   ├── JovemNav.tsx            # Navegação jovem
│   │   └── SeniorNav.tsx           # Navegação sênior
│   │
│   ├── shared/                     # Componentes compartilhados
│   │   ├── Button.tsx              # Adaptável por tema
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   │
│   └── profile/
│       ├── ProfileDetector.tsx     # Client-side profile switcher
│       └── ProfileSelector.tsx     # Manual profile selection
│
└── lib/
    ├── profile-detector.ts         # Lógica detecção perfil
    ├── theme-config.ts             # Design tokens
    └── middleware-utils.ts
```

---

## ⚙️ Middleware Edge: Profile Detection

### `/middleware.ts`
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // 1. Check query parameter (highest priority)
  const profileParam = searchParams.get('profile')
  if (profileParam && ['familiar', 'jovem', 'senior'].includes(profileParam)) {
    const response = NextResponse.redirect(new URL(`/${profileParam}`, request.url))
    response.cookies.set('user_profile', profileParam, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
    return response
  }

  // 2. Check cookie (second priority)
  const profileCookie = request.cookies.get('user_profile')?.value
  if (profileCookie && ['familiar', 'jovem', 'senior'].includes(profileCookie)) {
    if (!pathname.startsWith(`/${profileCookie}`)) {
      return NextResponse.redirect(new URL(`/${profileCookie}`, request.url))
    }
    return NextResponse.next()
  }

  // 3. User-Agent detection (fallback)
  const userAgent = request.headers.get('user-agent') || ''
  const profile = detectProfileFromUserAgent(userAgent)

  // Redirect root to detected profile
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${profile}`, request.url))
  }

  return NextResponse.next()
}

function detectProfileFromUserAgent(userAgent: string): string {
  // Mobile devices → Jovem
  if (/Mobile|Android|iPhone/i.test(userAgent)) {
    return 'jovem'
  }

  // Tablets → Familiar
  if (/iPad|Tablet/i.test(userAgent)) {
    return 'familiar'
  }

  // Desktop → Default to Familiar (safe choice)
  return 'familiar'
}

export const config = {
  matcher: [
    '/',
    '/familiar/:path*',
    '/jovem/:path*',
    '/senior/:path*',
  ],
}
```

### Performance Target
- **Middleware Execution:** < 50ms
- **Throughput:** 1000+ req/s
- **Edge Runtime:** Vercel Edge Functions

---

## 🎨 Design System Implementation

### Theme Provider Setup
```typescript
// lib/theme-config.ts
export const themes = {
  familiar: {
    colors: {
      primary: '#0066CC',
      secondary: '#00A86B',
      accent: '#FFB900',
    },
    typography: {
      fontSize: { base: 16, scale: 1.125 },
      lineHeight: 1.6,
    },
    spacing: { unit: 8, scale: 1.5 },
  },

  jovem: {
    colors: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      gradients: {
        hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        cta: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
    },
    animation: {
      fps: 60,
      duration: { fast: 200, normal: 300, slow: 500 },
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  senior: {
    colors: {
      primary: '#1A5490',
      text: '#000000',
      background: '#FFFFFF',
      minContrast: 7, // WCAG AAA
    },
    typography: {
      fontSize: { base: 18, max: 24 },
      lineHeight: 1.8,
      fontWeight: { normal: 400, bold: 700 },
    },
    accessibility: {
      focusWidth: 3,
      buttonMinSize: 44,
      ariaLabels: true,
    },
  },
} as const

export type ThemeKey = keyof typeof themes
```

### Layout Implementation
```typescript
// app/familiar/layout.tsx
import { FamiliarNav } from '@/components/navigation/FamiliarNav'
import { ThemeProvider } from '@/components/ThemeProvider'

export default function FamiliarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider theme="familiar">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <FamiliarNav />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </ThemeProvider>
  )
}

export const metadata = {
  title: 'Saraiva Vision - Cuidado Familiar',
  description: 'Exames preventivos e planos familiares em oftalmologia',
}
```

---

## 📊 Performance Requirements

### Core Web Vitals (todos os perfis)
```yaml
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1
INP (Interaction to Next Paint): < 200ms
```

### Bundle Size Targets
```yaml
Total Bundle (gzipped): < 200KB
Main Chunk: < 80KB
Profile Chunks:
  - familiar.js: < 40KB
  - jovem.js: < 50KB (animações)
  - senior.js: < 35KB
Route Chunks: < 30KB each
```

### Loading Performance
```yaml
Time to Interactive: < 3s (3G)
First Contentful Paint: < 1.5s
Speed Index: < 3.5s
Route Transition: < 200ms
```

### Lighthouse Scores (mínimo)
```yaml
Performance: ≥ 90
Accessibility: ≥ 95 (100 para /senior)
Best Practices: ≥ 90
SEO: ≥ 95
```

---

## ♿ Accessibility Requirements

### WCAG 2.1 Compliance
| Perfil | Nível | Requisitos |
|--------|-------|-----------|
| **Familiar** | AA | Contraste 4.5:1, navegação teclado, ARIA básico |
| **Jovem** | AA | Contraste 4.5:1, animações redutíveis |
| **Sênior** | **AAA** | Contraste 7:1, ARIA completo, zero barreiras |

### Sênior - Requisitos Específicos
```typescript
// Accessibility Config - Senior Profile
const seniorA11y = {
  contrast: {
    minimum: 7,          // WCAG AAA
    textSize: 18,        // px base
    adjustable: true,    // Font size toggle
  },

  navigation: {
    keyboard: true,
    tabIndex: 'logical',
    skipLinks: true,
    focusIndicator: {
      width: 3,          // px
      color: '#1A5490',
      offset: 2,
    },
  },

  interactive: {
    minTouchTarget: 44,  // px × px
    spacing: 16,         // px between elements
    hoverTimeout: 0,     // Immediate hover
  },

  screenReader: {
    ariaLabels: 'complete',
    landmarks: true,
    headingStructure: 'h1-h6',
    altText: 'descriptive',
  },

  motion: {
    prefersReducedMotion: true,
    noAutoplay: true,
    pauseControls: true,
  },
}
```

### Testing Tools
- **Automated:** axe-core, Lighthouse, WAVE
- **Manual:** NVDA, JAWS, VoiceOver
- **Keyboard:** Tab navigation, screen reader mode

---

## 🔒 Security & Compliance

### CFM/LGPD (todos os perfis)
- ✅ Medical disclaimers
- ✅ PII detection e anonimização
- ✅ Consent management
- ✅ Audit logging
- ✅ SHA-256 cache keys

### API Security
```typescript
// Rate Limiting - Next.js API Routes
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 req/10s
  analytics: true,
})

// API Route Handler
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }

  // Process request...
}
```

### Headers de Segurança
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https: blob:;
      font-src 'self' data:;
      connect-src 'self' https://api.saraivavision.com.br;
    `.replace(/\s{2,}/g, ' ').trim(),
  },
]
```

---

## 🧪 Testing Strategy

### Test Coverage (mínimo 80%)
```yaml
Unit Tests:
  - Components: 85%
  - Utils: 90%
  - Hooks: 80%

Integration Tests:
  - Profile Detection: 100%
  - Navigation: 95%
  - Theme Switching: 90%

E2E Tests (Playwright):
  - Fluxo Familiar: 100%
  - Fluxo Jovem: 100%
  - Fluxo Sênior: 100%
  - Middleware: 100%

Performance Tests:
  - Lighthouse CI: All PRs
  - Bundle Size: < 200KB gate
  - Core Web Vitals: All profiles

Accessibility Tests:
  - axe-core: All components
  - WCAG AAA: Senior profile
  - Screen Reader: Manual weekly
```

### E2E Test Example
```typescript
// tests/e2e/profile-detection.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Profile Detection', () => {
  test('redirects to jovem on mobile user-agent', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)')

    await page.goto('/')

    await expect(page).toHaveURL(/\/jovem/)
    await expect(page.locator('nav')).toContainText('Assinatura de Lentes')
  })

  test('respects profile query parameter', async ({ page }) => {
    await page.goto('/?profile=senior')

    await expect(page).toHaveURL(/\/senior/)

    // Check WCAG AAA compliance
    const contrastRatio = await page.evaluate(() => {
      const bg = getComputedStyle(document.body).backgroundColor
      const color = getComputedStyle(document.body).color
      // Calculate contrast (simplified)
      return 7.5 // Should be ≥ 7
    })

    expect(contrastRatio).toBeGreaterThanOrEqual(7)
  })
})
```

---

## 📅 Implementation Roadmap

### Fase 0: Preparação (1 semana)
**Objetivo:** Setup ambiente multi-perfil

- [ ] Criar branch `feature/multi-profile`
- [ ] Setup Next.js 14+ com App Router
- [ ] Configurar Tailwind CSS com temas
- [ ] Implementar middleware básico
- [ ] POC com 1 perfil (Familiar)

**Entregáveis:**
- Next.js configurado
- Middleware funcional
- 1 layout de perfil

---

### Fase 1: Migração Base (4 semanas)
**Objetivo:** Migrar app React para Next.js

- [ ] Migrar 101 componentes (seguir [NEXTJS_COMPONENT_MIGRATION.md](./NEXTJS_COMPONENT_MIGRATION.md))
- [ ] Converter rotas React Router → file-based routing
- [ ] Implementar Server/Client Components
- [ ] Migrar hooks e utilitários
- [ ] Atualizar testes (Vitest → Jest)

**Entregáveis:**
- App funcional em Next.js
- Testes passando (80% coverage)
- Performance baseline

---

### Fase 2: Sistema de Perfis (3 semanas)

#### Semana 1: Profile Detection
- [ ] Implementar middleware Edge completo
- [ ] Cookie persistence (1 ano)
- [ ] Query param handling
- [ ] User-Agent detection
- [ ] Testes E2E middleware (100%)

#### Semana 2: Layouts & Navegação
- [ ] Criar 3 layouts (Familiar/Jovem/Sênior)
- [ ] Implementar navegações customizadas
- [ ] ThemeProvider com design tokens
- [ ] Tailwind config por tema
- [ ] Responsividade (mobile-first)

#### Semana 3: Páginas Específicas
- [ ] **Familiar:** 4 páginas (Prevenção, Exames, Planos, Dúvidas)
- [ ] **Jovem:** 5 páginas (Assinatura, Tech, Lentes, Óculos, App)
- [ ] **Sênior:** 4 páginas (Catarata, Glaucoma, Cirurgias, A11y)
- [ ] SEO por perfil (metadata, sitemap)

**Entregáveis:**
- 3 versões completas da aplicação
- Middleware estável
- Navegação fluida (<200ms)

---

### Fase 3: Features Avançadas (2 semanas)

#### Semana 1: Integrações
- [ ] API de Assinatura (/jovem)
- [ ] Framer Motion animations (60fps)
- [ ] Profile selector manual
- [ ] Analytics por perfil

#### Semana 2: Acessibilidade Sênior
- [ ] WCAG AAA compliance
- [ ] Font size adjuster (18-24px)
- [ ] ARIA completo
- [ ] Testes screen reader (NVDA, JAWS)
- [ ] Keyboard navigation 100%

**Entregáveis:**
- Assinatura funcional
- Animações 60fps
- WCAG AAA certificado

---

### Fase 4: Performance & QA (2 semanas)

#### Semana 1: Otimização
- [ ] Bundle size < 200KB
- [ ] Code splitting agressivo
- [ ] Image optimization (WebP, AVIF)
- [ ] Lazy loading avançado
- [ ] Lighthouse 90+ (todos perfis)

#### Semana 2: QA & Bug Fixing
- [ ] Testes E2E completos
- [ ] Cross-browser testing
- [ ] Performance testing (3G)
- [ ] Security audit
- [ ] CFM/LGPD compliance

**Entregáveis:**
- Core Web Vitals atingidos
- Zero critical bugs
- Compliance certificado

---

### Fase 5: Deploy & Monitoring (1 semana)

#### Staging Deploy
- [ ] Deploy Vercel staging
- [ ] QA final
- [ ] Load testing (1000+ req/s)
- [ ] A/B testing setup

#### Production Deploy
- [ ] Deploy gradual (10% → 50% → 100%)
- [ ] Monitoring 24/7 (Vercel Analytics)
- [ ] Error tracking (Sentry)
- [ ] Rollback plan testado

**Entregáveis:**
- App em produção
- Monitoring ativo
- Zero downtime

---

## 📊 Success Metrics

### Performance KPIs
| Métrica | Target | Medição |
|---------|--------|---------|
| **LCP** | < 2.5s | Lighthouse CI |
| **FID** | < 100ms | Real User Monitoring |
| **CLS** | < 0.1 | Vercel Analytics |
| **Bundle Size** | < 200KB | Webpack Bundle Analyzer |
| **Route Transition** | < 200ms | Performance API |

### Business KPIs
| Métrica | Target | Período |
|---------|--------|---------|
| **Conversão** | +25% | 3 meses |
| **Bounce Rate** | -30% | 2 meses |
| **Session Duration** | +40% | 3 meses |
| **Assinaturas** | 500/mês | 6 meses |
| **NPS** | ≥ 70 | 3 meses |

### Accessibility KPIs
| Métrica | Target | Verificação |
|---------|--------|------------|
| **WCAG Sênior** | AAA | Axe-core |
| **Keyboard Nav** | 100% | Manual |
| **Screen Reader** | Zero issues | NVDA/JAWS |
| **Contrast Ratio** | ≥ 7:1 | Color Contrast Analyzer |

---

## 💰 Budget & Resources

### Custos Estimados

#### Migração Base (já documentado)
- Desenvolvimento: R$ 72.000 (360h × R$ 200/h)
- QA: R$ 16.000 (80h × R$ 200/h)
- Infra: R$ 8.000 (40h × R$ 200/h)
- **Subtotal:** R$ 96.000

#### Sistema Multi-Perfil (adicional)
- Desenvolvimento: R$ 24.000 (120h × R$ 200/h)
- Design System: R$ 6.000 (30h × R$ 200/h)
- Acessibilidade AAA: R$ 5.000 (25h × R$ 200/h)
- **Subtotal:** R$ 35.000

#### Total Geral
**R$ 131.000** (13 semanas, 2 devs full-time)

### ROI Esperado
```yaml
Investimento: R$ 131.000
Retorno Anual (conservador):
  - Conversões: +25% → R$ 180.000
  - Assinaturas: 500/mês × R$ 49 → R$ 294.000
  - Retenção: +15% → R$ 90.000

Total Retorno Ano 1: R$ 564.000
ROI: 330%
Payback: 3-4 meses
```

---

## 🚨 Risks & Mitigation

### Riscos Técnicos

#### 1. Performance Degradation
**Risco:** Bundle size > 200KB devido a 3 versões
**Mitigação:**
- Code splitting agressivo
- Dynamic imports por perfil
- Tree shaking avançado
- Monitoring contínuo

#### 2. Middleware Latency
**Risco:** Middleware Edge > 50ms
**Mitigação:**
- Edge runtime otimizado
- Caching de detecção
- Fallback instantâneo
- Load testing 1000+ req/s

#### 3. Accessibility Compliance
**Risco:** WCAG AAA não atingido (Sênior)
**Mitigação:**
- Testes automatizados (axe-core)
- Manual testing (NVDA, JAWS)
- Consultoria acessibilidade
- Iteração contínua

### Riscos de Negócio

#### 1. User Confusion
**Risco:** Usuários confusos com 3 versões
**Mitigação:**
- Profile selector visível
- Onboarding claro
- Analytics de comportamento
- A/B testing

#### 2. SEO Impact
**Risco:** Conteúdo duplicado, ranking down
**Mitigação:**
- Canonical URLs corretas
- Sitemap multi-perfil
- Structured data por perfil
- Monitoring Google Search Console

---

## 📚 Next Steps

### Imediato (esta semana)
1. [ ] Apresentar este documento para stakeholders
2. [ ] Aprovar budget adicional (R$ 35k)
3. [ ] Alocar 2 devs full-time (13 semanas)
4. [ ] Setup ambiente de desenvolvimento

### Curto Prazo (próximas 2 semanas)
1. [ ] Criar branch `feature/multi-profile`
2. [ ] Implementar middleware básico
3. [ ] POC com perfil Familiar
4. [ ] Validar performance baseline

### Médio Prazo (Q1 2025)
1. [ ] Executar roadmap de 13 semanas
2. [ ] Testes contínuos (CI/CD)
3. [ ] Deploy staging (semana 10)
4. [ ] Deploy produção gradual (semana 13)

---

## 🔗 Related Documentation

- [NEXTJS_SUMMARY.md](./NEXTJS_SUMMARY.md) - Executive summary migração base
- [NEXTJS_MIGRATION_GUIDE.md](./NEXTJS_MIGRATION_GUIDE.md) - Guia técnico completo
- [NEXTJS_COMPONENT_MIGRATION.md](./NEXTJS_COMPONENT_MIGRATION.md) - Migração componentes
- [NEXTJS_CONVERSION_SCRIPTS.md](./NEXTJS_CONVERSION_SCRIPTS.md) - Scripts automação
- [NEXTJS_FAQ.md](./NEXTJS_FAQ.md) - Perguntas frequentes
- [NEXTJS_INDEX.md](./NEXTJS_INDEX.md) - Índice central

---

**Documento criado:** Outubro 2025
**Última atualização:** Outubro 2025
**Status:** ✅ Pronto para Aprovação
**Autores:** Equipe Saraiva Vision + Especificação Multi-Perfil
