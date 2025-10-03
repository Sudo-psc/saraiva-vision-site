# Multi-Profile Component Architecture Diagram
## Saraiva Vision - Next.js Design System

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION LAYER                               │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      Next.js App Router                           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │  │
│  │  │  /familiar │  │   /jovem   │  │  /senior   │                 │  │
│  │  └────────────┘  └────────────┘  └────────────┘                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   Theme Provider (Context)                        │  │
│  │  • Profile State: familiar | jovem | senior                      │  │
│  │  • Dark Mode State                                               │  │
│  │  • High Contrast State                                           │  │
│  │  • Reduced Motion State                                          │  │
│  │  • Font Size State                                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

                                    ↓

┌─────────────────────────────────────────────────────────────────────────┐
│                        DESIGN TOKENS LAYER                               │
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐             │
│  │   Familiar   │    │    Jovem     │    │   Sênior     │             │
│  │   Tokens     │    │    Tokens    │    │   Tokens     │             │
│  ├──────────────┤    ├──────────────┤    ├──────────────┤             │
│  │ Colors       │    │ Colors       │    │ Colors       │             │
│  │ Typography   │    │ Typography   │    │ Typography   │             │
│  │ Spacing      │    │ Spacing      │    │ Spacing      │             │
│  │ Motion       │    │ Motion       │    │ Motion       │             │
│  │ Accessibility│    │ Accessibility│    │ Accessibility│             │
│  └──────────────┘    └──────────────┘    └──────────────┘             │
│                                                                          │
│                    CSS Variables Generator                              │
│           (--color-primary, --spacing-card, etc.)                      │
└─────────────────────────────────────────────────────────────────────────┘

                                    ↓

┌─────────────────────────────────────────────────────────────────────────┐
│                        COMPONENT LAYER                                   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    SHARED BASE COMPONENTS                         │  │
│  │  (Profile-agnostic, accept theme context)                        │  │
│  │                                                                   │  │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐              │  │
│  │  │Button│  │Input │  │Badge │  │ Tag  │  │Icon  │              │  │
│  │  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘              │  │
│  │                                                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   ADAPTIVE COMPONENTS                             │  │
│  │  (Single component, multiple styles via config)                  │  │
│  │                                                                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │AdaptiveCard  │  │AdaptiveForm  │  │AdaptiveTable │           │  │
│  │  │              │  │              │  │              │           │  │
│  │  │ if familiar: │  │ if jovem:    │  │ if senior:   │           │  │
│  │  │   style A    │  │   style B +  │  │   style C +  │           │  │
│  │  │              │  │   animations │  │   WCAG AAA   │           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                 PROFILE-SPECIFIC COMPONENTS                       │  │
│  │  (Fundamentally different implementations)                       │  │
│  │                                                                   │  │
│  │  ┌─────────────────┬─────────────────┬─────────────────┐        │  │
│  │  │    Familiar     │      Jovem      │     Sênior      │        │  │
│  │  ├─────────────────┼─────────────────┼─────────────────┤        │  │
│  │  │ Navigation.tsx  │ Navigation.tsx  │ Navigation.tsx  │        │  │
│  │  │ • Warm colors   │ • Gradients     │ • High contrast │        │  │
│  │  │ • Rounded       │ • Animations    │ • 3px borders   │        │  │
│  │  │ • Icons         │ • Glassmorphism │ • 48px targets  │        │  │
│  │  │                 │ • Dark mode     │ • Skip links    │        │  │
│  │  ├─────────────────┼─────────────────┼─────────────────┤        │  │
│  │  │ Hero.tsx        │ Hero.tsx        │ Hero.tsx        │        │  │
│  │  │ • Family photos │ • Gradient text │ • Large text    │        │  │
│  │  │ • Soft shadows  │ • Floating      │ • Clear CTA     │        │  │
│  │  │ • CTA buttons   │ • Video bg      │ • No distractions│        │  │
│  │  ├─────────────────┼─────────────────┼─────────────────┤        │  │
│  │  │ PricingCard.tsx │ PricingCard.tsx │ PricingCard.tsx │        │  │
│  │  │ • Family plans  │ • Subscriptions │ • Simple pricing│        │  │
│  │  │ • Value focus   │ • Tech features │ • Large buttons │        │  │
│  │  └─────────────────┴─────────────────┴─────────────────┘        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

                                    ↓

┌─────────────────────────────────────────────────────────────────────────┐
│                        UTILITY LAYER                                     │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        Custom Hooks                               │  │
│  │                                                                   │  │
│  │  ┌───────────────┐  ┌────────────────┐  ┌──────────────────┐   │  │
│  │  │  useTheme()   │  │useDesignTokens │  │useAccessibility()│   │  │
│  │  │               │  │                │  │                  │   │  │
│  │  │ • getProfile  │  │ • getColors    │  │ • reducedMotion  │   │  │
│  │  │ • setProfile  │  │ • getSpacing   │  │ • highContrast   │   │  │
│  │  │ • isDarkMode  │  │ • getTypography│  │ • fontSize       │   │  │
│  │  └───────────────┘  └────────────────┘  └──────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Selection Flow

```
┌─────────────────────────────────────────┐
│   User visits page                      │
│   (e.g., /familiar, /jovem, /senior)   │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│   Theme Provider initializes            │
│   • Reads profile from URL/storage      │
│   • Loads design tokens                 │
│   • Applies CSS variables               │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│   Component Render Decision Tree        │
└───────────────┬─────────────────────────┘
                │
                ↓
        ┌───────────────┐
        │ Component Type?│
        └───────┬───────┘
                │
    ┌───────────┼───────────┐
    │           │           │
    ↓           ↓           ↓
┌────────┐ ┌────────┐ ┌────────────┐
│Shared  │ │Adaptive│ │Profile-    │
│Base    │ │        │ │Specific    │
└────┬───┘ └────┬───┘ └────┬───────┘
     │          │          │
     ↓          ↓          ↓
┌─────────┐ ┌───────────┐ ┌──────────────────┐
│Use theme│ │Check      │ │Route to correct  │
│context  │ │profile &  │ │implementation:   │
│for      │ │apply      │ │                  │
│styling  │ │conditional│ │ • Navigation-    │
│         │ │styles     │ │   Familiar.tsx   │
│         │ │           │ │ • Navigation-    │
│         │ │           │ │   Jovem.tsx      │
│         │ │           │ │ • Navigation-    │
│         │ │           │ │   Senior.tsx     │
└─────────┘ └───────────┘ └──────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        User Actions                           │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ↓
    ┌───────────────────────────────────────────┐
    │    1. Select Profile                      │
    │    ProfileSelector.onClick('jovem')       │
    └───────────────┬───────────────────────────┘
                    │
                    ↓
    ┌───────────────────────────────────────────┐
    │    2. Update Theme Context                │
    │    setProfile('jovem')                    │
    │    localStorage.setItem(...)              │
    └───────────────┬───────────────────────────┘
                    │
                    ↓
    ┌───────────────────────────────────────────┐
    │    3. Load Design Tokens                  │
    │    tokens = getDesignTokens('jovem')      │
    └───────────────┬───────────────────────────┘
                    │
                    ↓
    ┌───────────────────────────────────────────┐
    │    4. Generate CSS Variables              │
    │    cssVars = generateCSSVariables(tokens) │
    └───────────────┬───────────────────────────┘
                    │
                    ↓
    ┌───────────────────────────────────────────┐
    │    5. Apply to DOM                        │
    │    document.documentElement.style.set...  │
    │    document.documentElement.setAttribute  │
    │      ('data-profile', 'jovem')            │
    └───────────────┬───────────────────────────┘
                    │
                    ↓
    ┌───────────────────────────────────────────┐
    │    6. Components Re-render                │
    │    • useTheme() returns new profile       │
    │    • Components apply new styles          │
    │    • Conditional rendering updates        │
    └───────────────┬───────────────────────────┘
                    │
                    ↓
    ┌───────────────────────────────────────────┐
    │    7. Visual Update Complete              │
    │    • Jovem navigation with gradients      │
    │    • Animations enabled                   │
    │    • Dark mode support active             │
    └───────────────────────────────────────────┘
```

---

## Profile Routing Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      URL Structure                           │
└─────────────────────────────────────────────────────────────┘

Option 1: Subdirectory Routing
├── /familiar
│   ├── /familiar/servicos
│   ├── /familiar/planos
│   └── /familiar/blog
├── /jovem
│   ├── /jovem/servicos
│   ├── /jovem/planos
│   └── /jovem/blog
└── /senior
    ├── /senior/servicos
    ├── /senior/planos
    └── /senior/blog

Option 2: Query Parameter
├── /?profile=familiar
├── /servicos?profile=jovem
└── /blog?profile=senior

Option 3: Subdomain (Recommended for Production)
├── familiar.saraivavision.com.br
├── jovem.saraivavision.com.br
└── senior.saraivavision.com.br

Option 4: Cookie + Default Route
├── / (reads profile from cookie/localStorage)
├── /servicos (applies saved profile)
└── /switch-profile (profile selector page)
```

**Recommendation**: Start with **Option 1** (subdirectories) for development, migrate to **Option 3** (subdomains) for production.

---

## Tailwind Configuration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 tailwind.config.js                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
        ┌──────────────────────────────┐
        │  createProfileConfig()       │
        │  • Input: 'familiar'         │
        │  • Output: Tailwind config   │
        └──────────────┬───────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ↓                             ↓
┌───────────────┐           ┌────────────────┐
│  Colors       │           │  Typography    │
│  • primary    │           │  • fontFamily  │
│  • secondary  │           │  • fontSize    │
│  • accent     │           │  • lineHeight  │
└───────────────┘           └────────────────┘
        │                             │
        └──────────────┬──────────────┘
                       │
                       ↓
        ┌──────────────────────────────┐
        │  Generated CSS Classes       │
        │  • bg-primary-500            │
        │  • text-lg                   │
        │  • rounded-lg                │
        │  • space-y-card              │
        └──────────────┬───────────────┘
                       │
                       ↓
        ┌──────────────────────────────┐
        │  Used in Components          │
        │  className="bg-primary-500   │
        │             text-lg          │
        │             rounded-lg"      │
        └──────────────────────────────┘
```

---

## Accessibility Feature Matrix

```
┌──────────────────────────────────────────────────────────────────────┐
│                    Accessibility Features by Profile                  │
├──────────────┬─────────────┬─────────────┬──────────────────────────┤
│   Feature    │  Familiar   │   Jovem     │      Sênior              │
├──────────────┼─────────────┼─────────────┼──────────────────────────┤
│ Contrast     │  WCAG AA    │  WCAG AA    │  WCAG AAA                │
│ Ratio        │  (4.5:1)    │  (4.5:1)    │  (7:1)                   │
├──────────────┼─────────────┼─────────────┼──────────────────────────┤
│ Font Size    │  16px base  │  16px base  │  18px base               │
│              │             │             │  (1.125rem)              │
├──────────────┼─────────────┼─────────────┼──────────────────────────┤
│ Touch        │  44x44px    │  44x44px    │  48x48px                 │
│ Targets      │  (WCAG 2.1) │  (WCAG 2.1) │  (WCAG 2.5.5)            │
├──────────────┼─────────────┼─────────────┼──────────────────────────┤
│ Focus        │  2px solid  │  2px solid  │  3px solid               │
│ Indicator    │  2px offset │  2px offset │  3px offset              │
├──────────────┼─────────────┼─────────────┼──────────────────────────┤
│ Animations   │  Enabled    │  Enhanced   │  Disabled                │
│              │  (300ms)    │  (250ms)    │  (0ms)                   │
├──────────────┼─────────────┼─────────────┼──────────────────────────┤
│ Skip Links   │  Optional   │  Optional   │  Required                │
├──────────────┼─────────────┼─────────────┼──────────────────────────┤
│ ARIA         │  Basic      │  Basic      │  Comprehensive           │
│ Labels       │  Required   │  Required   │  + Descriptions          │
├──────────────┼─────────────┼─────────────┼──────────────────────────┤
│ Keyboard     │  Full       │  Full       │  Full + Visual           │
│ Navigation   │  Support    │  Support    │  Feedback                │
├──────────────┼─────────────┼─────────────┼──────────────────────────┤
│ Screen       │  Tested     │  Tested     │  Optimized               │
│ Reader       │             │             │  (Atkinson font)         │
└──────────────┴─────────────┴─────────────┴──────────────────────────┘
```

---

## Performance Optimization Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Bundle Optimization                       │
└─────────────────────────────────────────────────────────────┘

1. Code Splitting by Profile
   ┌──────────────────────────────────────────┐
   │  familiar.chunk.js    (120KB)            │
   │  • NavigationFamiliar                    │
   │  • HeroFamiliar                          │
   │  • PricingCardFamiliar                   │
   └──────────────────────────────────────────┘

   ┌──────────────────────────────────────────┐
   │  jovem.chunk.js       (180KB)            │
   │  • NavigationJovem                       │
   │  • HeroJovem + Framer Motion             │
   │  • PricingCardJovem                      │
   └──────────────────────────────────────────┘

   ┌──────────────────────────────────────────┐
   │  senior.chunk.js      (95KB)             │
   │  • NavigationSenior                      │
   │  • HeroSenior (no animations)            │
   │  • PricingCardSenior                     │
   └──────────────────────────────────────────┘

2. Lazy Loading
   ┌──────────────────────────────────────────┐
   │  const NavigationFamiliar = lazy(() =>   │
   │    import('./profiles/familiar/Nav')     │
   │  );                                      │
   └──────────────────────────────────────────┘

3. Tree Shaking
   ┌──────────────────────────────────────────┐
   │  • Remove unused design tokens           │
   │  • Eliminate dead code paths             │
   │  • Optimize Tailwind CSS                 │
   └──────────────────────────────────────────┘

4. Image Optimization
   ┌──────────────────────────────────────────┐
   │  • Next.js Image component               │
   │  • WebP format                           │
   │  • Responsive images                     │
   │  • Lazy loading                          │
   └──────────────────────────────────────────┘

5. Font Loading
   ┌──────────────────────────────────────────┐
   │  • Preload critical fonts                │
   │  • Font subsetting                       │
   │  • FOUT prevention                       │
   └──────────────────────────────────────────┘
```

---

## Testing Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Test Pyramid                            │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────┐
                    │   E2E    │  Playwright
                    │  Tests   │  • Profile switching
                    └──────────┘  • User journeys
                   ┌────────────┐
                   │Integration │  React Testing Library
                   │   Tests    │  • Component interactions
                   └────────────┘  • Theme context
                ┌──────────────────┐
                │   Unit Tests     │  Vitest + Jest
                │                  │  • Individual components
                │                  │  • Hooks
                │                  │  • Utilities
                └──────────────────┘

Accessibility Testing:
├── axe-core (automated)
├── jest-axe (unit tests)
├── Lighthouse (CI/CD)
└── Manual (keyboard + screen reader)

Visual Regression:
├── Percy
├── Chromatic
└── Storybook
```

---

## Deployment Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Flow                           │
└─────────────────────────────────────────────────────────────┘

Development
    ↓
┌────────────────┐
│  Build All     │  npm run build
│  Profiles      │  • familiar bundle
│                │  • jovem bundle
│                │  • senior bundle
└───────┬────────┘
        │
        ↓
┌────────────────┐
│  Run Tests     │  npm run test:all
│                │  • Unit tests
│                │  • Integration tests
│                │  • Accessibility tests
└───────┬────────┘
        │
        ↓
┌────────────────┐
│  Lighthouse    │  Performance audit
│  Audit         │  • Score: 90+
│                │  • Accessibility: 100
└───────┬────────┘
        │
        ↓
┌────────────────┐
│  Deploy to     │  Vercel / VPS
│  Production    │  • Edge network
│                │  • CDN caching
│                │  • Gzip compression
└────────────────┘
```

---

## Future Enhancements

```
Phase 1: MVP (Current)
├── Three profile support
├── Design tokens system
├── Basic components
└── Accessibility compliance

Phase 2: Expansion
├── Profile customization
├── A/B testing per profile
├── Analytics per demographic
└── User preference learning

Phase 3: Advanced
├── AI-powered profile suggestion
├── Dynamic token adjustment
├── Multi-language support
└── Advanced personalization
```

---

This architecture ensures scalability, maintainability, and optimal user experience across all three demographic profiles.
