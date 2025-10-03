# Next.js Multi-Profile Design System
## Saraiva Vision - Three-Version Architecture

**Version**: 1.0.0
**Last Updated**: 2025-10-03
**Status**: Design Complete, Implementation Pending

---

## Overview

This design system implements a sophisticated three-profile architecture tailored to different demographic groups visiting the Saraiva Vision ophthalmology clinic website.

### Three Profiles

1. **Familiar** - Family-focused, trust, prevention
2. **Jovem** - Young, tech-savvy, subscription model
3. **Sênior** - Accessibility-first, WCAG AAA, high contrast

---

## Quick Start

### Installation

```bash
# Install dependencies
npm install framer-motion tailwindcss@latest

# Copy design system files
cp -r docs/nextjs-design-system/configs/ src/
cp -r docs/nextjs-design-system/components/ src/
```

### Basic Usage

```typescript
import { ThemeProvider } from '@/components/ThemeProvider';
import { NavigationFamiliar } from '@/components/profiles/familiar/Navigation';
import { NavigationJovem } from '@/components/profiles/jovem/Navigation';
import { NavigationSenior } from '@/components/profiles/senior/Navigation';

function App() {
  return (
    <ThemeProvider defaultProfile="familiar">
      <Navigation />
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

---

## File Structure

```
docs/nextjs-design-system/
├── README.md                               # This file
├── configs/
│   ├── tailwind.config.profiles.ts        # Tailwind configurations
│   └── design-tokens.ts                   # Design tokens system
├── components/
│   ├── ThemeProvider.tsx                  # Theme context provider
│   ├── Navigation.familiar.tsx            # Familiar navigation
│   ├── Navigation.jovem.tsx               # Jovem navigation
│   └── Navigation.senior.tsx              # Sênior navigation
├── examples/
│   └── component-adaptation-strategy.md   # Implementation guide
└── diagrams/
    └── component-architecture.md          # System architecture
```

---

## Core Concepts

### 1. Design Tokens

Centralized design decisions that adapt per profile:

```typescript
import { getDesignTokens } from '@/configs/design-tokens';

const tokens = getDesignTokens('familiar');
// Access: tokens.colors.brand.primary
//         tokens.typography.fontSize.body
//         tokens.spacing.component.padding.button
```

### 2. Theme Provider

Context-based theme management:

```typescript
import { useTheme } from '@/components/ThemeProvider';

function MyComponent() {
  const { profile, setProfile, isDarkMode } = useTheme();

  return (
    <button onClick={() => setProfile('jovem')}>
      Switch to Jovem
    </button>
  );
}
```

### 3. Profile-Specific Components

Components with fundamentally different implementations:

```
Navigation:
├── Navigation.familiar.tsx    # Family-friendly navigation
├── Navigation.jovem.tsx       # Modern with animations
└── Navigation.senior.tsx      # WCAG AAA compliant
```

### 4. Adaptive Components

Single component that adapts styling based on profile:

```typescript
function AdaptiveCard({ title, children }) {
  const { profile } = useTheme();
  const tokens = useDesignTokens();

  return (
    <div
      className={`card card-${profile}`}
      style={{
        borderRadius: tokens.borderRadius.DEFAULT,
        padding: tokens.spacing.component.padding.card
      }}
    >
      {children}
    </div>
  );
}
```

---

## Profile Characteristics

### Familiar Profile

**Target Audience**: Families, parents, prevention-focused
**Design Philosophy**: Trust, warmth, approachability

**Visual Characteristics**:
- Warm color palette (sky blue, purple, amber)
- Rounded corners (0.5rem - 1rem)
- Soft shadows
- Friendly icons
- Smooth transitions (300ms)
- 16px base font size

**Use Cases**:
- Family eye care
- Children's vision
- Preventive care
- Insurance navigation

---

### Jovem Profile

**Target Audience**: Young adults (18-35), tech-savvy
**Design Philosophy**: Modern, vibrant, dynamic

**Visual Characteristics**:
- Gradient backgrounds (purple → green → pink)
- Large border radius (1rem - 2rem)
- Framer Motion animations
- Glassmorphism effects
- Dark mode support
- Bold typography (Space Grotesk)
- 16px base font size

**Use Cases**:
- Subscription plans
- Tech-focused features
- Social sharing
- Online booking

---

### Sênior Profile

**Target Audience**: Older adults (60+), accessibility needs
**Design Philosophy**: Clarity, accessibility, simplicity

**Visual Characteristics**:
- High contrast (WCAG AAA - 7:1 ratio)
- Minimal border radius (0.25rem)
- Strong borders (3px solid)
- Large touch targets (48x48px)
- No animations (reduced motion)
- Atkinson Hyperlegible font
- 18px base font size
- Clear focus indicators (3px outline)

**Use Cases**:
- Medicare/senior plans
- Cataract information
- Glaucoma treatment
- Easy appointment booking

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Install dependencies (Tailwind, Framer Motion)
- [ ] Implement design tokens system
- [ ] Create ThemeProvider component
- [ ] Set up CSS variables generation
- [ ] Configure Tailwind for all profiles

### Phase 2: Navigation (Week 3)
- [ ] Implement NavigationFamiliar
- [ ] Implement NavigationJovem
- [ ] Implement NavigationSenior
- [ ] Add profile switching
- [ ] Test keyboard navigation

### Phase 3: Core Components (Week 4-5)
- [ ] Create shared base components
- [ ] Implement adaptive components
- [ ] Build profile-specific hero sections
- [ ] Create pricing cards per profile
- [ ] Implement forms and inputs

### Phase 4: Pages (Week 6-7)
- [ ] Home page for each profile
- [ ] Services pages
- [ ] About pages
- [ ] Contact pages
- [ ] Blog integration

### Phase 5: Testing & Optimization (Week 8)
- [ ] Accessibility testing (WCAG AAA)
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Screen reader testing

### Phase 6: Deployment (Week 9)
- [ ] Set up profile routing
- [ ] Configure subdomains
- [ ] Deploy to production
- [ ] Monitor analytics per profile
- [ ] Gather user feedback

---

## Accessibility Compliance

### WCAG Standards

| Profile  | WCAG Level | Contrast Ratio | Touch Target |
|----------|-----------|----------------|--------------|
| Familiar | AA        | 4.5:1          | 44x44px      |
| Jovem    | AA        | 4.5:1          | 44x44px      |
| Sênior   | AAA       | 7:1            | 48x48px      |

### Testing Checklist

**Automated Testing**:
- [ ] axe-core (all pages)
- [ ] Lighthouse (score 100)
- [ ] WAVE (zero errors)
- [ ] jest-axe (unit tests)

**Manual Testing**:
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader (NVDA, JAWS, VoiceOver)
- [ ] Focus visibility (all interactive elements)
- [ ] Color blindness (Deuteranopia, Protanopia)
- [ ] Reduced motion (animations disabled)

---

## Performance Targets

### Bundle Size Goals

| Profile  | Main Bundle | Profile Bundle | Total  |
|----------|-------------|----------------|--------|
| Familiar | 150KB       | 120KB          | 270KB  |
| Jovem    | 150KB       | 180KB          | 330KB  |
| Sênior   | 150KB       | 95KB           | 245KB  |

### Core Web Vitals

| Metric | Target | Method |
|--------|--------|--------|
| LCP    | < 2.5s | Image optimization, lazy loading |
| FID    | < 100ms| Code splitting, minimal JS |
| CLS    | < 0.1  | Reserved space, no layout shifts |

---

## Tailwind Configuration

### Familiar Profile

```typescript
import { createProfileConfig } from '@/configs/tailwind.config.profiles';

export default createProfileConfig('familiar');
// Generates config with warm colors, rounded corners, family-friendly spacing
```

### Jovem Profile

```typescript
export default createProfileConfig('jovem');
// Generates config with gradients, animations, modern typography
```

### Sênior Profile

```typescript
export default createProfileConfig('senior');
// Generates config with high contrast, large text, accessibility-first
```

---

## Component Examples

### Button Component

```typescript
// Base Button (Shared)
import { useTheme, useDesignTokens } from '@/components/ThemeProvider';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  ...props
}) => {
  const { profile } = useTheme();
  const tokens = useDesignTokens();

  return (
    <button
      className={`btn btn-${profile} btn-${variant}`}
      style={{
        fontFamily: tokens.typography.fontFamily.body,
        fontSize: tokens.typography.fontSize.body,
        padding: tokens.spacing.component.padding.button,
        borderRadius: tokens.borderRadius.DEFAULT,
        minWidth: tokens.accessibility.minTouchTarget.width,
        minHeight: tokens.accessibility.minTouchTarget.height
      }}
      {...props}
    >
      {children}
    </button>
  );
};
```

### Card Component (Adaptive)

```typescript
export const AdaptiveCard: React.FC<CardProps> = ({
  title,
  children
}) => {
  const { profile, reducedMotion } = useTheme();
  const tokens = useDesignTokens();

  const profileStyles = {
    familiar: {
      borderRadius: '1rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
    },
    jovem: {
      borderRadius: '1.5rem',
      boxShadow: '0 8px 24px rgba(217, 70, 239, 0.3)',
      background: 'linear-gradient(135deg, rgba(217, 70, 239, 0.1), rgba(139, 92, 246, 0.1))'
    },
    senior: {
      borderRadius: '0.25rem',
      border: '3px solid #000000',
      boxShadow: 'none'
    }
  };

  const style = profileStyles[profile];

  return (
    <motion.div
      className={`card card-${profile}`}
      style={style}
      whileHover={!reducedMotion && profile !== 'senior' ? { scale: 1.02 } : {}}
    >
      <h3>{title}</h3>
      {children}
    </motion.div>
  );
};
```

---

## Testing Guidelines

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('applies correct styles for familiar profile', () => {
    render(
      <ThemeProvider defaultProfile="familiar">
        <Button>Click Me</Button>
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-familiar');
  });

  it('meets minimum touch target for senior profile', () => {
    render(
      <ThemeProvider defaultProfile="senior">
        <Button>Click Me</Button>
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    const { width, height } = button.getBoundingClientRect();
    expect(width).toBeGreaterThanOrEqual(48);
    expect(height).toBeGreaterThanOrEqual(48);
  });
});
```

### Accessibility Tests

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Navigation Accessibility', () => {
  it('passes axe accessibility tests for senior profile', async () => {
    const { container } = render(
      <ThemeProvider defaultProfile="senior">
        <NavigationSenior />
      </ThemeProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## Deployment Configuration

### Subdomain Routing (Recommended)

```nginx
# Nginx configuration
server {
  server_name familiar.saraivavision.com.br;
  root /var/www/saraiva-vision/familiar;
  # ... SSL, caching, etc.
}

server {
  server_name jovem.saraivavision.com.br;
  root /var/www/saraiva-vision/jovem;
}

server {
  server_name senior.saraivavision.com.br;
  root /var/www/saraiva-vision/senior;
}
```

### Next.js Middleware (Alternative)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  let profile = 'familiar'; // default

  if (hostname.startsWith('jovem.')) {
    profile = 'jovem';
  } else if (hostname.startsWith('senior.')) {
    profile = 'senior';
  }

  // Set profile cookie
  const response = NextResponse.next();
  response.cookies.set('profile', profile);

  return response;
}
```

---

## Browser Support

| Browser          | Version | Support |
|------------------|---------|---------|
| Chrome           | 90+     | ✅ Full |
| Firefox          | 88+     | ✅ Full |
| Safari           | 14+     | ✅ Full |
| Edge             | 90+     | ✅ Full |
| iOS Safari       | 14+     | ✅ Full |
| Android Chrome   | 90+     | ✅ Full |

---

## Troubleshooting

### Issue: Profile not switching

**Solution**: Check localStorage and ensure ThemeProvider is at root level

```typescript
// Clear profile storage
localStorage.removeItem('saraiva-theme-profile');

// Verify ThemeProvider wraps entire app
<ThemeProvider defaultProfile="familiar">
  <App />
</ThemeProvider>
```

### Issue: Tailwind classes not working

**Solution**: Ensure Tailwind config uses correct profile

```typescript
// tailwind.config.js
import { createProfileConfig } from './src/configs/tailwind.config.profiles';

export default createProfileConfig(process.env.NEXT_PUBLIC_PROFILE || 'familiar');
```

### Issue: Animations not disabled for senior profile

**Solution**: Check reducedMotion state and CSS

```typescript
const { reducedMotion, profile } = useTheme();

// Animations should be disabled
if (profile === 'senior' || reducedMotion) {
  // No animations
}
```

---

## Contributing

### Adding a New Component

1. Create shared base component in `src/components/ui/`
2. Add profile-specific variants if needed
3. Implement accessibility features (ARIA, keyboard nav)
4. Write unit tests and accessibility tests
5. Document component in Storybook
6. Test across all three profiles

### Design Token Updates

1. Edit `src/configs/design-tokens.ts`
2. Update all three profile token sets
3. Regenerate CSS variables
4. Test visual changes in Storybook
5. Update documentation

---

## Resources

### Documentation
- [Component Adaptation Strategy](./examples/component-adaptation-strategy.md)
- [Architecture Diagram](./diagrams/component-architecture.md)
- [Tailwind Configuration](./configs/tailwind.config.profiles.ts)
- [Design Tokens](./configs/design-tokens.ts)

### External Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Atkinson Hyperlegible Font](https://brailleinstitute.org/freefont)

---

## License

Proprietary - Saraiva Vision
For internal use only

---

## Contact

**Design System Owner**: Development Team
**Last Updated**: 2025-10-03
**Version**: 1.0.0

---

**Next Steps**: Review this design system documentation, implement Phase 1 (Foundation), and begin building the multi-profile Next.js application.
