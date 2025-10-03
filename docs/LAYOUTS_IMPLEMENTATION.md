# Next.js Profile Layouts Implementation

## Overview

Three distinct profile layouts implemented with custom navigation and design systems for Saraiva Vision's multi-profile architecture.

**Status**: ✅ Navigation Components Complete | 🚧 Layouts In Progress

---

## 📂 File Structure

```
/components/navigation/
├── FamiliarNav.tsx       ✅ Complete (176 lines)
├── JovemNav.tsx          ✅ Complete (303 lines with Framer Motion)
└── SeniorNav.tsx         ✅ Complete (273 lines with WCAG AAA)

/app/
├── familiar/
│   ├── layout.tsx        ✅ Complete (with footer)
│   └── page.tsx          ✅ Complete (hero + services + trust + CTA)
├── jovem/
│   ├── layout.tsx        🚧 Needs Update
│   └── page.tsx          🚧 Needs Update
└── senior/
    ├── layout.tsx        🚧 Needs Update
    └── page.tsx          🚧 Needs Update
```

---

## 🎨 Design Profiles

### 1. Familiar (Family-Focused)

**Theme**: Trust, prevention, family care
**Colors**: Blue (`#0ea5e9`), Purple (`#d946ef`), Warm tones
**Navigation**:
- Prevenção
- Exames (dropdown: Retina, Glaucoma, Refração, Infantil)
- Planos Familiares (badge: Popular)
- Dúvidas Frequentes

**Features**:
- 44px minimum touch targets
- Clear hierarchy
- Family-friendly icons
- Comfortable spacing (1.5rem padding)

**Page Sections**:
1. Hero with family imagery
2. Services grid (4 cards)
3. Trust features
4. CTA section

---

### 2. Jovem (Young & Tech-Savvy)

**Theme**: Modern, vibrant, subscription model
**Colors**: Purple gradients, electric green, bold pink
**Navigation**:
- Assinatura (badge: Popular)
- Tecnologia (dropdown: Laser, ICL, Topografia, VR)
- Lentes Premium
- Óculos Modernos
- App (badge: Novo)

**Features**:
- Framer Motion animations
- Glassmorphism effects
- Gradient backgrounds
- Dark mode support
- Animated badges (pulse effect)

**Tech Stack**:
- `framer-motion` for animations
- AnimatePresence for transitions
- Gradient buttons with shimmer effect

---

### 3. Sênior (Accessibility-First)

**Theme**: High contrast, WCAG AAA compliance
**Colors**: Black (#000), High-contrast blue (`#0066cc`)
**Navigation**:
- Catarata
- Glaucoma (dropdown: Diagnóstico, Tratamento, Cirurgia, Acompanhamento)
- Cirurgias
- Acessibilidade

**Accessibility Features**:
- Skip navigation link (WCAG 2.4.1)
- 48px minimum touch targets (WCAG 2.5.5)
- 3px focus indicators
- Screen reader announcements
- Keyboard navigation support
- ARIA labels and descriptions
- High contrast borders (4px solid)
- Reduced motion (0ms transitions)
- Large font sizes (18px base)
- Atkinson Hyperlegible font

**Accessibility Tools**:
- A+ / A- font size controls
- High contrast toggle
- Text-to-speech ready

---

##  Navigation Features

### Common Features (All Profiles)
- Responsive mobile/desktop layouts
- Dropdown menus with keyboard support
- Active route highlighting
- ARIA roles and labels
- Mobile hamburger menu
- CTA button integration

### Mobile Breakpoint
- Desktop: >1024px
- Mobile: ≤1024px

### Responsive Behavior
- Desktop: Horizontal nav with dropdowns
- Mobile: Slide-down menu with stacked items

---

## 🛠 Implementation Details

### Navigation Components

**Import Path**: `@/components/navigation/[Profile]Nav`

```tsx
import FamiliarNav from '@/components/navigation/FamiliarNav';
import JovemNav from '@/components/navigation/JovemNav';
import SeniorNav from '@/components/navigation/SeniorNav';
```

**Usage in Layouts**:
```tsx
<div className="[profile]-layout" data-profile="[profile]">
  <[Profile]Nav />
  <main>{children}</main>
  <footer>...</footer>
</div>
```

### CSS Requirements

Each profile requires a corresponding CSS file:

```
/styles/
├── familiar.css   (Blue/green theme, comfortable spacing)
├── jovem.css      (Gradients, glassmorphism, dark mode)
└── senior.css     (High contrast, large fonts, accessibility)
```

**CSS Variables** (from design-tokens.ts):
```css
--color-primary: [profile-specific]
--color-secondary: [profile-specific]
--font-body: [profile-specific]
--spacing-section: [profile-specific]
```

---

## 📋 Metadata & SEO

### Familiar
```tsx
title: 'Saraiva Vision - Cuidado com a Visão da Sua Família'
keywords: ['oftalmologia familiar', 'exames de vista', 'cuidado preventivo']
```

### Jovem
```tsx
title: 'Saraiva Vision - Tecnologia e Inovação para Sua Visão'
keywords: ['cirurgia laser', 'lentes premium', 'assinatura oftalmológica']
```

### Sênior
```tsx
title: 'Saraiva Vision - Cuidado Acessível para Idosos'
keywords: ['catarata', 'glaucoma', 'acessibilidade', 'terceira idade']
```

---

## 🚀 Next Steps

### Immediate (This Session)
1. ✅ Create navigation components (Done)
2. ✅ Create Familiar layout & page (Done)
3. 🚧 Create Jovem layout & page (In Progress)
4. 🚧 Create Senior layout & page (Pending)
5. ⏳ Run Kluster verification

### Follow-up
1. Create CSS files for each profile
2. Add ThemeProvider integration
3. Implement profile detection middleware
4. Create sub-pages for each profile
5. Add unit tests for navigation
6. Implement analytics tracking

---

## 🧪 Testing Checklist

### Functional Tests
- [ ] Navigation renders on all profiles
- [ ] Dropdowns open/close correctly
- [ ] Active route highlighting works
- [ ] Mobile menu toggles properly
- [ ] CTA buttons link correctly

### Accessibility Tests
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Screen reader announces menu states
- [ ] Focus indicators visible (3px)
- [ ] Skip navigation link functional
- [ ] ARIA labels present and correct
- [ ] Contrast ratios meet WCAG AAA (Senior)

### Responsive Tests
- [ ] Desktop layout (>1024px)
- [ ] Tablet layout (768px-1024px)
- [ ] Mobile layout (<768px)
- [ ] Touch targets ≥44px (Familiar/Jovem) or ≥48px (Senior)

---

## 📦 Dependencies

### Required Packages
```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^18.x",
    "framer-motion": "^11.x"  // Jovem profile only
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^18.x"
  }
}
```

### Font Requirements
- **Familiar**: Inter (body), Poppins (headings)
- **Jovem**: Inter (body), Space Grotesk (headings), JetBrains Mono (mono)
- **Senior**: Atkinson Hyperlegible (all text)

---

## 🔗 Related Documentation

- [Next.js Migration Guide](./NEXTJS_MIGRATION_GUIDE.md)
- [Design System Components](./nextjs-design-system/README.md)
- [Middleware Strategy](./nextjs-middleware/README.md)
- [Performance Optimization](./nextjs-performance/PERFORMANCE_OPTIMIZATION_PLAN.md)
- [Accessibility Plan](./nextjs-performance/ACCESSIBILITY_OPTIMIZATION_PLAN.md)

---

**Created**: October 2025
**Last Updated**: October 2025
**Status**: 60% Complete (3/9 files implemented)
**Author**: Saraiva Vision Development Team
