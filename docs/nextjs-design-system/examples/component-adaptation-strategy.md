# Component Adaptation Strategy
## Multi-Profile Component Architecture

### Philosophy

The design system uses a **profile-aware component architecture** where components adapt their behavior, styling, and interactions based on the active user profile (Familiar, Jovem, or Sênior).

---

## Strategy Overview

### 1. Shared Base Components (Core Layer)

**Purpose**: Provide fundamental UI building blocks that are profile-agnostic

**Location**: `src/components/ui/`

**Examples**:
- `Button.tsx` - Base button component
- `Card.tsx` - Base card container
- `Input.tsx` - Base form input
- `Modal.tsx` - Base modal dialog

**Characteristics**:
- Minimal styling
- Maximum flexibility
- Accept profile context
- Semantic HTML
- ARIA attributes by default

```typescript
// Example: Base Button Component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  const { profile } = useTheme();
  const tokens = useDesignTokens();

  // Profile-specific class application
  const profileClass = `btn-${profile}`;
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;

  return (
    <button
      className={`btn ${profileClass} ${variantClass} ${sizeClass}`}
      style={{
        fontFamily: tokens.typography.fontFamily.body,
        fontSize: tokens.typography.fontSize.body,
        padding: tokens.spacing.component.padding.button
      }}
      {...props}
    >
      {children}
    </button>
  );
};
```

---

### 2. Profile-Specific Components

**Purpose**: Components with fundamentally different implementations per profile

**Location**: `src/components/profiles/[profile]/`

**Examples**:
- `Navigation.familiar.tsx`
- `Navigation.jovem.tsx`
- `Navigation.senior.tsx`
- `Hero.familiar.tsx`
- `Hero.jovem.tsx`
- `Hero.senior.tsx`

**When to Use**:
- Interaction patterns differ significantly
- Animation requirements vary
- Accessibility needs are fundamentally different
- Content structure changes per profile

```typescript
// Example: Profile Router Component
export const Navigation: React.FC = () => {
  const { profile } = useTheme();

  const components = {
    familiar: NavigationFamiliar,
    jovem: NavigationJovem,
    senior: NavigationSenior
  };

  const Component = components[profile];
  return <Component />;
};
```

---

### 3. Adaptive Components (Hybrid Approach)

**Purpose**: Single component that adapts styling and behavior based on profile

**Location**: `src/components/adaptive/`

**Examples**:
- `AdaptiveCard.tsx`
- `AdaptiveForm.tsx`
- `AdaptiveTable.tsx`

**When to Use**:
- Core structure remains the same
- Only styling/spacing differs
- Accessibility requirements are similar
- Single component is easier to maintain

```typescript
// Example: Adaptive Card Component
export const AdaptiveCard: React.FC<CardProps> = ({
  title,
  children,
  image
}) => {
  const { profile, reducedMotion } = useTheme();
  const tokens = useDesignTokens();

  // Profile-specific configuration
  const config = {
    familiar: {
      borderRadius: '1rem',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      hoverEffect: true
    },
    jovem: {
      borderRadius: '1.5rem',
      shadow: '0 8px 24px rgba(217, 70, 239, 0.3)',
      hoverEffect: !reducedMotion,
      gradient: true
    },
    senior: {
      borderRadius: '0.25rem',
      shadow: 'none',
      border: '3px solid #000000',
      hoverEffect: false
    }
  };

  const profileConfig = config[profile];

  return (
    <motion.div
      className={`card card-${profile}`}
      style={{
        borderRadius: profileConfig.borderRadius,
        boxShadow: profileConfig.shadow,
        border: profileConfig.border
      }}
      whileHover={profileConfig.hoverEffect ? { scale: 1.02 } : {}}
    >
      {profileConfig.gradient && <div className="card-gradient" />}
      {image && <img src={image} alt="" />}
      <h3>{title}</h3>
      {children}
    </motion.div>
  );
};
```

---

## Component Decision Matrix

### Use **Shared Base Component** When:
- ✅ Component is purely presentational
- ✅ Styling differences are minor (colors, spacing)
- ✅ Interaction pattern is identical across profiles
- ✅ Accessibility needs are the same
- ✅ Example: Button, Input, Badge, Tag

### Use **Profile-Specific Components** When:
- ✅ Interaction patterns differ significantly
- ✅ Animation requirements vary (Jovem vs Sênior)
- ✅ Content structure changes per profile
- ✅ Accessibility implementations differ (WCAG AA vs AAA)
- ✅ Example: Navigation, Hero, Pricing Cards

### Use **Adaptive Components** When:
- ✅ Structure is identical but styling varies
- ✅ Single component reduces maintenance burden
- ✅ Profile switching needs to be seamless
- ✅ Configuration-driven approach is feasible
- ✅ Example: Cards, Forms, Tables

---

## Profile-Specific Considerations

### Familiar Profile
**Focus**: Trust, warmth, family-friendly

**Component Adaptations**:
- Rounded corners (0.5rem - 1rem)
- Warm color palette
- Gentle shadows
- Friendly icons
- Smooth transitions (300ms)
- Readable font sizes (16px base)

**Example Components**:
```
CardFamiliar:
  - Border radius: 1rem
  - Box shadow: soft, warm
  - Padding: generous (1.5rem)
  - Hover: subtle scale (1.02)
```

---

### Jovem Profile
**Focus**: Modern, vibrant, tech-savvy

**Component Adaptations**:
- Large border radius (1rem - 2rem)
- Gradient backgrounds
- Framer Motion animations
- Bold typography
- Dark mode support
- Glassmorphism effects

**Example Components**:
```
CardJovem:
  - Border radius: 1.5rem
  - Gradient overlay: purple → blue
  - Animations: float, shimmer
  - Padding: spacious (2rem)
  - Hover: transform + gradient shift
```

---

### Sênior Profile
**Focus**: Accessibility, clarity, WCAG AAA

**Component Adaptations**:
- Minimal border radius (0.25rem)
- High contrast borders (3px solid)
- Large touch targets (48x48px)
- Clear focus indicators (3px outline)
- No animations (reduced motion)
- Large text (18px base)
- Atkinson Hyperlegible font

**Example Components**:
```
CardSenior:
  - Border: 3px solid #000000
  - Border radius: 0.25rem
  - Padding: generous + touch-friendly (2rem)
  - Focus: 3px outline, 3px offset
  - No hover effects
  - High contrast text (7:1 ratio)
```

---

## Implementation Patterns

### Pattern 1: Theme Context Hook

```typescript
// Use theme context for profile-aware styling
export const useProfileStyles = () => {
  const { profile } = useTheme();
  const tokens = useDesignTokens();

  return {
    buttonStyle: {
      familiar: {
        borderRadius: '0.75rem',
        padding: '0.75rem 1.5rem'
      },
      jovem: {
        borderRadius: '1.5rem',
        padding: '1rem 2rem'
      },
      senior: {
        borderRadius: '0.25rem',
        padding: '1.25rem 2rem',
        minWidth: '48px',
        minHeight: '48px'
      }
    }[profile]
  };
};
```

### Pattern 2: Conditional Animation Wrapper

```typescript
// Wrapper that respects reducedMotion preference
export const ConditionalMotion: React.FC<MotionProps> = ({
  children,
  animate,
  ...props
}) => {
  const { reducedMotion, profile } = useTheme();

  // Sênior profile always has reduced motion
  const shouldAnimate = !reducedMotion && profile !== 'senior';

  return shouldAnimate ? (
    <motion.div animate={animate} {...props}>
      {children}
    </motion.div>
  ) : (
    <div>{children}</div>
  );
};
```

### Pattern 3: Profile-Specific Variants

```typescript
// Define variants per profile
const cardVariants = {
  familiar: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },
  jovem: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  },
  senior: {
    // No animation
    initial: {},
    animate: {},
    transition: {}
  }
};

export const ProfileCard: React.FC = ({ children }) => {
  const { profile } = useTheme();
  const variant = cardVariants[profile];

  return (
    <motion.div {...variant}>
      {children}
    </motion.div>
  );
};
```

---

## Component Library Structure

```
src/
├── components/
│   ├── ui/                      # Shared base components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Badge.tsx
│   │
│   ├── adaptive/                # Adaptive components (single component, multiple styles)
│   │   ├── AdaptiveCard.tsx
│   │   ├── AdaptiveForm.tsx
│   │   ├── AdaptiveTable.tsx
│   │   └── AdaptiveHero.tsx
│   │
│   ├── profiles/                # Profile-specific components
│   │   ├── familiar/
│   │   │   ├── Navigation.tsx
│   │   │   ├── Hero.tsx
│   │   │   └── PricingCard.tsx
│   │   ├── jovem/
│   │   │   ├── Navigation.tsx
│   │   │   ├── Hero.tsx
│   │   │   └── PricingCard.tsx
│   │   └── senior/
│   │       ├── Navigation.tsx
│   │       ├── Hero.tsx
│   │       └── PricingCard.tsx
│   │
│   ├── layout/                  # Layout components (profile-aware)
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Container.tsx
│   │   └── Grid.tsx
│   │
│   └── providers/               # Context providers
│       ├── ThemeProvider.tsx
│       └── ProfileRouter.tsx
│
└── hooks/
    ├── useTheme.ts
    ├── useDesignTokens.ts
    ├── useProfileStyles.ts
    └── useAccessibility.ts
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('AdaptiveCard', () => {
  it('applies correct styles for familiar profile', () => {
    render(
      <ThemeProvider defaultProfile="familiar">
        <AdaptiveCard title="Test" />
      </ThemeProvider>
    );

    const card = screen.getByRole('article');
    expect(card).toHaveStyle({ borderRadius: '1rem' });
  });

  it('applies high contrast for senior profile', () => {
    render(
      <ThemeProvider defaultProfile="senior">
        <AdaptiveCard title="Test" />
      </ThemeProvider>
    );

    const card = screen.getByRole('article');
    expect(card).toHaveStyle({ border: '3px solid #000000' });
  });

  it('includes animations for jovem profile', () => {
    render(
      <ThemeProvider defaultProfile="jovem">
        <AdaptiveCard title="Test" />
      </ThemeProvider>
    );

    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('data-animated', 'true');
  });
});
```

### Accessibility Tests
```typescript
describe('Navigation Accessibility', () => {
  it('meets WCAG AAA standards for senior profile', async () => {
    const { container } = render(
      <ThemeProvider defaultProfile="senior">
        <Navigation />
      </ThemeProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();

    // Check contrast ratio
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(getContrastRatio(link)).toBeGreaterThanOrEqual(7);
    });
  });

  it('has minimum touch targets for senior profile', () => {
    render(
      <ThemeProvider defaultProfile="senior">
        <Navigation />
      </ThemeProvider>
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      const { width, height } = button.getBoundingClientRect();
      expect(width).toBeGreaterThanOrEqual(48);
      expect(height).toBeGreaterThanOrEqual(48);
    });
  });
});
```

---

## Migration Guide

### Converting Existing Components

**Step 1: Identify Component Type**
- Is it presentational or interactive?
- Does interaction differ per profile?
- Are accessibility requirements different?

**Step 2: Choose Strategy**
- Shared → Use base component with profile classes
- Adaptive → Single component with conditional styling
- Profile-Specific → Separate implementations

**Step 3: Implement Profile Awareness**
```typescript
// Before
export const Card = ({ title, children }) => (
  <div className="card">
    <h3>{title}</h3>
    {children}
  </div>
);

// After (Adaptive)
export const Card = ({ title, children }) => {
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
      <h3>{title}</h3>
      {children}
    </div>
  );
};
```

**Step 4: Add Accessibility**
```typescript
// Add ARIA attributes
<div
  className={`card card-${profile}`}
  role="article"
  aria-labelledby="card-title"
>
  <h3 id="card-title">{title}</h3>
  {children}
</div>
```

**Step 5: Test All Profiles**
- Visual testing in Storybook
- Automated accessibility tests
- Manual keyboard navigation
- Screen reader testing

---

## Best Practices

### DO:
✅ Use design tokens for consistency
✅ Respect user's reduced motion preference
✅ Test with keyboard navigation
✅ Include ARIA attributes
✅ Document profile-specific behavior
✅ Use semantic HTML
✅ Test contrast ratios

### DON'T:
❌ Hardcode colors or spacing
❌ Ignore accessibility settings
❌ Assume all users have mice
❌ Use profile-specific code without context
❌ Skip testing across all profiles
❌ Use complex animations for senior profile
❌ Use small touch targets

---

## Performance Considerations

### Code Splitting
```typescript
// Lazy load profile-specific components
const NavigationFamiliar = lazy(() => import('./profiles/familiar/Navigation'));
const NavigationJovem = lazy(() => import('./profiles/jovem/Navigation'));
const NavigationSenior = lazy(() => import('./profiles/senior/Navigation'));

export const Navigation = () => {
  const { profile } = useTheme();

  return (
    <Suspense fallback={<NavigationSkeleton />}>
      {profile === 'familiar' && <NavigationFamiliar />}
      {profile === 'jovem' && <NavigationJovem />}
      {profile === 'senior' && <NavigationSenior />}
    </Suspense>
  );
};
```

### CSS-in-JS Optimization
```typescript
// Memoize styled components
const StyledCard = memo(styled.div<{ profile: ProfileType }>`
  border-radius: ${({ profile }) => borderRadius[profile]};
  padding: ${({ profile }) => padding[profile]};
  /* ... */
`);
```

---

## Conclusion

This component adaptation strategy ensures:
- **Consistency**: Shared design tokens across profiles
- **Flexibility**: Components adapt to user needs
- **Accessibility**: WCAG AAA compliance for senior profile
- **Performance**: Code splitting and lazy loading
- **Maintainability**: Clear patterns and documentation
- **User Experience**: Tailored experiences per demographic
