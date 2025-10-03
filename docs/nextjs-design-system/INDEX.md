# Multi-Profile Design System - Complete Index
## Saraiva Vision Next.js Architecture

**Created**: 2025-10-03
**Status**: Design Complete, Implementation Pending
**Version**: 1.0.0

---

## Document Overview

This design system provides a complete three-profile architecture for the Saraiva Vision ophthalmology clinic website. Each profile is tailored to a specific demographic with unique design characteristics, accessibility requirements, and user experience patterns.

---

## Core Documentation

### 1. README.md
**Purpose**: Main entry point and quick reference
**Contains**:
- Overview of three profiles
- Quick start guide
- Installation instructions
- File structure
- Implementation roadmap
- Performance targets
- Browser support

**Read this first**: [README.md](./README.md)

---

### 2. Configuration Files

#### tailwind.config.profiles.ts
**Purpose**: Tailwind CSS configurations for all three profiles
**Location**: `configs/tailwind.config.profiles.ts`

**Contains**:
- Color palettes (familiar: warm, jovem: vibrant, senior: high-contrast)
- Typography scales (familiar: 16px base, jovem: 16px base, senior: 18px base)
- Spacing systems
- Border radius scales
- Animation configurations (jovem only)
- Accessibility settings (touch targets, focus indicators)

**Key Functions**:
- `createProfileConfig(profile)` - Generate Tailwind config
- `profileThemes` - Profile metadata

**Usage**:
```typescript
import { createProfileConfig } from './configs/tailwind.config.profiles';
export default createProfileConfig('familiar');
```

---

#### design-tokens.ts
**Purpose**: Centralized design token system
**Location**: `configs/design-tokens.ts`

**Contains**:
- Color tokens (brand, semantic, surface, text, border)
- Typography tokens (font families, sizes, weights, line heights)
- Spacing tokens (scale, component padding/gaps)
- Layout tokens (container, breakpoints, z-index)
- Motion tokens (duration, easing, reduced motion)
- Accessibility tokens (focus rings, touch targets, contrast ratios)

**Key Functions**:
- `getDesignTokens(profile)` - Get tokens for profile
- `generateCSSVariables(tokens)` - Generate CSS vars
- `familiarTokens`, `jovemTokens`, `seniorTokens` - Token sets

**Usage**:
```typescript
import { getDesignTokens } from './configs/design-tokens';
const tokens = getDesignTokens('senior');
// Access: tokens.colors.brand.primary
```

---

### 3. Component Files

#### ThemeProvider.tsx
**Purpose**: Theme context provider and state management
**Location**: `components/ThemeProvider.tsx`

**Contains**:
- Theme context (profile, dark mode, accessibility settings)
- Profile switching logic
- CSS variable application
- Local storage persistence
- Accessibility controls (font size, high contrast, reduced motion)

**Components**:
- `ThemeProvider` - Main context provider
- `ProfileSelector` - Profile switching UI
- `AccessibilityControls` - Accessibility settings panel

**Hooks**:
- `useTheme()` - Access theme context
- `useDesignTokens()` - Get current design tokens

**Usage**:
```typescript
import { ThemeProvider, useTheme } from './components/ThemeProvider';

<ThemeProvider defaultProfile="familiar">
  <App />
</ThemeProvider>
```

---

#### Navigation Components (Profile-Specific)

##### Navigation.familiar.tsx
**Purpose**: Family-friendly navigation component
**Characteristics**:
- Warm colors (sky blue, purple, amber)
- Rounded corners (0.5rem)
- Soft shadows
- Family-friendly icons
- Smooth transitions (300ms)
- WCAG AA compliant

**Features**:
- Dropdown menus
- Mobile-responsive hamburger menu
- Active state indicators
- Accessibility labels
- CTA button (Agendar Consulta)

---

##### Navigation.jovem.tsx
**Purpose**: Modern, tech-savvy navigation
**Characteristics**:
- Gradient backgrounds
- Glassmorphism effects
- Framer Motion animations
- Large border radius (1rem-2rem)
- Dark mode support
- Bold typography (Space Grotesk)

**Features**:
- Animated dropdowns
- Gradient hover effects
- Shimmer button animation
- Mobile menu with transitions
- Badge animations
- Smooth page transitions

**Dependencies**:
- `framer-motion` - Animation library

---

##### Navigation.senior.tsx
**Purpose**: WCAG AAA compliant navigation
**Characteristics**:
- High contrast (7:1 ratio)
- 3px solid borders
- 48x48px minimum touch targets
- 3px focus indicators
- No animations (reduced motion)
- Atkinson Hyperlegible font
- 18px base font size

**Features**:
- Skip navigation link (WCAG 2.4.1)
- Screen reader announcements
- Keyboard navigation optimized
- Clear focus states
- Accessibility tool buttons (font size, contrast)
- Descriptive ARIA labels

**Accessibility**:
- WCAG AAA compliant
- Full keyboard navigation
- Screen reader optimized
- High contrast mode
- Large touch targets

---

### 4. Strategy Documents

#### component-adaptation-strategy.md
**Purpose**: Comprehensive guide for component implementation
**Location**: `examples/component-adaptation-strategy.md`

**Sections**:
1. **Strategy Overview**
   - Shared base components
   - Profile-specific components
   - Adaptive components

2. **Component Decision Matrix**
   - When to use shared components
   - When to use profile-specific components
   - When to use adaptive components

3. **Profile-Specific Considerations**
   - Familiar: Trust, warmth, family-friendly
   - Jovem: Modern, vibrant, tech-savvy
   - Sênior: Accessibility, clarity, WCAG AAA

4. **Implementation Patterns**
   - Theme context hook
   - Conditional animation wrapper
   - Profile-specific variants

5. **Component Library Structure**
   - Directory organization
   - File naming conventions
   - Import/export patterns

6. **Testing Strategy**
   - Unit tests
   - Accessibility tests
   - Visual regression tests

7. **Migration Guide**
   - Converting existing components
   - Adding profile awareness
   - Testing across profiles

8. **Best Practices**
   - DO's and DON'Ts
   - Performance considerations
   - Code splitting strategies

**Read this for**: Implementation guidance and best practices

---

#### component-architecture.md
**Purpose**: Visual diagrams and system architecture
**Location**: `diagrams/component-architecture.md`

**Diagrams**:
1. **System Architecture Overview**
   - Application layer
   - Design tokens layer
   - Component layer
   - Utility layer

2. **Component Selection Flow**
   - Decision tree for component routing
   - Profile-based rendering logic

3. **Data Flow Diagram**
   - User actions → Theme context → Token loading → DOM updates

4. **Profile Routing Strategy**
   - Subdirectory routing
   - Query parameter routing
   - Subdomain routing (recommended)
   - Cookie-based routing

5. **Tailwind Configuration Flow**
   - Config generation
   - CSS class generation
   - Component usage

6. **Accessibility Feature Matrix**
   - Feature comparison across profiles
   - WCAG compliance levels
   - Touch target sizes
   - Font sizes
   - Contrast ratios

7. **Performance Optimization Strategy**
   - Code splitting by profile
   - Lazy loading
   - Tree shaking
   - Image optimization
   - Font loading

8. **Testing Architecture**
   - Test pyramid (E2E → Integration → Unit)
   - Accessibility testing
   - Visual regression testing

9. **Deployment Strategy**
   - Build process
   - Testing pipeline
   - Production deployment

10. **Future Enhancements**
    - Phase 1: MVP
    - Phase 2: Expansion
    - Phase 3: Advanced features

**Read this for**: System understanding and architecture decisions

---

## Profile Comparison

### Quick Reference Table

| Aspect                | Familiar           | Jovem              | Sênior            |
|-----------------------|--------------------|--------------------|-------------------|
| **Target Audience**   | Families, parents  | Young adults 18-35 | Older adults 60+  |
| **Color Palette**     | Warm (blue/purple) | Vibrant (gradients)| High contrast B&W |
| **Typography**        | Inter, Poppins     | Space Grotesk      | Atkinson Hyperlegible |
| **Base Font Size**    | 16px               | 16px               | 18px              |
| **Border Radius**     | 0.5rem - 1rem      | 1rem - 2rem        | 0.25rem           |
| **Animations**        | Smooth (300ms)     | Enhanced (250ms)   | None (0ms)        |
| **Touch Targets**     | 44x44px            | 44x44px            | 48x48px           |
| **Contrast Ratio**    | 4.5:1 (WCAG AA)    | 4.5:1 (WCAG AA)    | 7:1 (WCAG AAA)    |
| **Focus Indicator**   | 2px solid, 2px offset | 2px solid, 2px offset | 3px solid, 3px offset |
| **Dark Mode**         | No                 | Yes                | No                |
| **Glassmorphism**     | No                 | Yes                | No                |
| **Gradients**         | Minimal            | Extensive          | None              |
| **Skip Links**        | Optional           | Optional           | Required          |
| **ARIA Descriptions** | Basic              | Basic              | Comprehensive     |

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Install dependencies (Tailwind CSS, Framer Motion)
- [ ] Set up design tokens system
- [ ] Implement ThemeProvider
- [ ] Configure Tailwind for all profiles
- [ ] Test CSS variable generation

### Phase 2: Navigation
- [ ] Implement NavigationFamiliar component
- [ ] Implement NavigationJovem component
- [ ] Implement NavigationSenior component
- [ ] Add profile switching functionality
- [ ] Test keyboard navigation across all profiles
- [ ] Verify WCAG AAA compliance for senior profile

### Phase 3: Core Components
- [ ] Create Button component (shared base)
- [ ] Create Input component (shared base)
- [ ] Create Card component (adaptive)
- [ ] Create Modal component (adaptive)
- [ ] Create Form components (profile-specific)

### Phase 4: Pages
- [ ] Home page (all profiles)
- [ ] Services page (all profiles)
- [ ] About page (all profiles)
- [ ] Contact page (all profiles)
- [ ] Blog integration (all profiles)

### Phase 5: Testing
- [ ] Unit tests (Vitest/Jest)
- [ ] Integration tests (React Testing Library)
- [ ] Accessibility tests (axe-core, jest-axe)
- [ ] E2E tests (Playwright)
- [ ] Visual regression tests (Percy/Chromatic)
- [ ] Performance tests (Lighthouse)

### Phase 6: Deployment
- [ ] Set up subdomain routing
- [ ] Configure production builds
- [ ] Deploy to VPS/Vercel
- [ ] Set up analytics per profile
- [ ] Monitor performance
- [ ] Gather user feedback

---

## File Reference

```
docs/nextjs-design-system/
│
├── README.md                              # Main documentation
├── INDEX.md                               # This file - complete index
│
├── configs/
│   ├── tailwind.config.profiles.ts       # Tailwind configurations
│   └── design-tokens.ts                  # Design token system
│
├── components/
│   ├── ThemeProvider.tsx                 # Theme context provider
│   ├── Navigation.familiar.tsx           # Familiar navigation
│   ├── Navigation.jovem.tsx              # Jovem navigation
│   └── Navigation.senior.tsx             # Sênior navigation
│
├── examples/
│   └── component-adaptation-strategy.md  # Implementation guide
│
└── diagrams/
    └── component-architecture.md         # Architecture diagrams
```

---

## Quick Links

### Get Started
1. Read [README.md](./README.md) for overview
2. Review [component-adaptation-strategy.md](./examples/component-adaptation-strategy.md) for implementation patterns
3. Study [component-architecture.md](./diagrams/component-architecture.md) for system design
4. Explore [tailwind.config.profiles.ts](./configs/tailwind.config.profiles.ts) for styling
5. Implement [ThemeProvider.tsx](./components/ThemeProvider.tsx) first

### Development Workflow
1. Install dependencies
2. Copy configuration files to `src/`
3. Implement ThemeProvider
4. Build navigation components
5. Create page layouts
6. Test across all profiles
7. Deploy to production

---

## Dependencies

### Required
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "next": "^13.0.0",
    "framer-motion": "^10.0.0",
    "tailwindcss": "^3.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jest-axe": "^8.0.0",
    "axe-core": "^4.0.0",
    "vitest": "^1.0.0"
  }
}
```

### Optional
- `@headlessui/react` - Accessible UI components
- `react-icons` - Icon library
- `clsx` - Conditional class names
- `tailwind-merge` - Merge Tailwind classes

---

## Performance Benchmarks

### Target Metrics

| Metric               | Familiar | Jovem  | Sênior |
|----------------------|----------|--------|--------|
| Bundle Size          | 270KB    | 330KB  | 245KB  |
| First Contentful Paint | <1.5s   | <1.8s  | <1.2s  |
| Time to Interactive  | <3.0s    | <3.5s  | <2.5s  |
| Lighthouse Score     | 95+      | 90+    | 100    |
| Accessibility Score  | 100      | 100    | 100    |

---

## Browser Testing Matrix

| Browser          | Familiar | Jovem  | Sênior | Priority |
|------------------|----------|--------|--------|----------|
| Chrome Desktop   | ✅       | ✅     | ✅     | High     |
| Firefox Desktop  | ✅       | ✅     | ✅     | High     |
| Safari Desktop   | ✅       | ✅     | ✅     | High     |
| Edge Desktop     | ✅       | ✅     | ✅     | Medium   |
| Chrome Mobile    | ✅       | ✅     | ✅     | High     |
| Safari iOS       | ✅       | ✅     | ✅     | High     |
| Firefox Mobile   | ✅       | ✅     | ✅     | Medium   |
| Samsung Internet | ✅       | ✅     | ✅     | Medium   |

---

## Accessibility Testing Tools

### Automated
- **axe DevTools** - Browser extension
- **Lighthouse** - Chrome DevTools
- **WAVE** - Web accessibility evaluation tool
- **jest-axe** - Unit test integration

### Manual
- **NVDA** - Windows screen reader
- **JAWS** - Professional screen reader
- **VoiceOver** - macOS/iOS screen reader
- **TalkBack** - Android screen reader

### Keyboard Testing
- Tab navigation
- Enter/Space activation
- Escape key (close modals)
- Arrow keys (navigation)
- Skip links (senior profile)

---

## Next Steps

1. **Review Documentation**
   - Read README.md thoroughly
   - Study component adaptation strategy
   - Review architecture diagrams

2. **Set Up Development Environment**
   - Install Node.js 18+
   - Install dependencies
   - Configure VS Code/IDE

3. **Implement Foundation**
   - Copy design tokens
   - Set up ThemeProvider
   - Configure Tailwind

4. **Build Components**
   - Start with navigation
   - Create shared components
   - Build profile-specific variants

5. **Test Thoroughly**
   - Unit tests
   - Accessibility tests
   - Cross-browser testing

6. **Deploy to Production**
   - Configure routing
   - Set up analytics
   - Monitor performance

---

## Support & Maintenance

### Code Review Checklist
- [ ] Follows design token system
- [ ] Implements all three profiles
- [ ] Passes accessibility tests
- [ ] Includes unit tests
- [ ] Documents component usage
- [ ] Optimized for performance
- [ ] Cross-browser compatible

### Update Process
1. Update design tokens first
2. Regenerate CSS variables
3. Test components visually
4. Run automated tests
5. Deploy to staging
6. Manual testing
7. Deploy to production

---

## Contact Information

**Project**: Saraiva Vision Multi-Profile Design System
**Version**: 1.0.0
**Last Updated**: 2025-10-03
**Status**: Design Complete, Implementation Pending

---

## Conclusion

This design system provides everything needed to implement a sophisticated three-profile architecture for the Saraiva Vision website. Each profile is carefully designed to meet the specific needs of its target demographic while maintaining consistent branding and exceptional user experience.

**Key Strengths**:
- Comprehensive accessibility (WCAG AAA for senior profile)
- Performance optimized (code splitting per profile)
- Maintainable architecture (design tokens, shared components)
- User-focused design (tailored to each demographic)
- Production-ready (complete testing strategy)

**Ready for implementation** - Follow the roadmap in README.md to begin building.
