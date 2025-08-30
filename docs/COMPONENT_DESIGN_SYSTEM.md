# Saraiva Vision - Component Design System

## 🎨 Design System Overview

**Philosophy**: Accessible, consistent, and performant components following medical industry best practices
**Framework**: React + TailwindCSS + Radix UI primitives
**Accessibility Standard**: WCAG 2.1 AA compliance

## 🧩 Component Architecture

### Base Component Pattern
```typescript
interface BaseComponentProps {
  children?: React.ReactNode;
  className?: string;
  testId?: string;
  'aria-label'?: string;
}

const BaseComponent = forwardRef<HTMLElement, BaseComponentProps>(
  ({ children, className = '', testId, ...props }, ref) => {
    const baseClasses = 'component-base';
    
    return (
      <element
        ref={ref}
        className={clsx(baseClasses, className)}
        data-testid={testId}
        {...props}
      >
        {children}
      </element>
    );
  }
);

BaseComponent.displayName = 'BaseComponent';
```

## 🎯 Core Components

### 1. Navigation Components

#### Navbar
```typescript
interface NavbarProps {
  isScrolled?: boolean;
  mobileMenuOpen?: boolean;
  onMenuToggle?: () => void;
}

// Features:
// - Responsive design with mobile hamburger menu
// - Scroll-aware background changes
// - Accessibility keyboard navigation
// - Multi-language support
// - Logo with home link functionality

// Usage:
<Navbar 
  isScrolled={scrolled} 
  mobileMenuOpen={mobileOpen}
  onMenuToggle={handleMenuToggle}
/>
```

#### Footer
```typescript
interface FooterProps {
  showSocialLinks?: boolean;
  showServices?: boolean;
  compactMode?: boolean;
}

// Features:
// - Organized information architecture
// - Social media integration
// - Service links with proper routing
// - Contact information display
// - Partner/certification logos

// Structure:
<Footer>
  <FooterSection title="Serviços" links={serviceLinks} />
  <FooterSection title="Contato" content={contactInfo} />
  <FooterSection title="Redes Sociais" links={socialLinks} />
</Footer>
```

### 2. Content Components

#### Hero Section
```typescript
interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  onCtaClick: () => void;
  backgroundImage?: string;
}

// Features:
// - Compelling headline hierarchy
// - Strong call-to-action placement
// - Background image optimization
// - Social proof indicators
// - Mobile-optimized layout

// Design Pattern:
<Hero>
  <HeroContent>
    <Heading level={1}>{title}</Heading>
    <Subheading>{subtitle}</Subheading>
    <Button variant="primary" size="lg" onClick={onCtaClick}>
      {ctaText}
    </Button>
  </HeroContent>
  <HeroImage src={backgroundImage} alt="Hero visual" />
</Hero>
```

#### Services Section
```typescript
interface ServicesProps {
  services: Service[];
  layout?: 'grid' | 'carousel';
  showPrices?: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price?: string;
  duration?: string;
  image?: string;
}

// Features:
// - Grid/carousel layout options
// - Service detail modal integration
// - Price display (optional)
// - Image lazy loading
// - SEO-optimized markup

// Usage:
<Services 
  services={ophthalmologyServices}
  layout="grid"
  showPrices={false}
/>
```

#### Testimonials Section
```typescript
interface TestimonialsProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  showRatings?: boolean;
  layout?: 'carousel' | 'grid';
}

interface Testimonial {
  id: string;
  name: string;
  content: string;
  rating: number;
  image?: string;
  date: string;
}

// Features:
// - Auto-rotating carousel
// - Star rating display
// - Patient photo integration
// - Mobile swipe gestures
// - Accessibility navigation

// Implementation:
<Testimonials 
  testimonials={patientReviews}
  autoplay={true}
  showRatings={true}
  layout="carousel"
/>
```

### 3. Interactive Components

#### Contact Form
```typescript
interface ContactFormProps {
  onSubmit: (data: ContactData) => void;
  loading?: boolean;
  showAppointmentFields?: boolean;
}

interface ContactData {
  name: string;
  email: string;
  phone: string;
  message: string;
  appointmentDate?: string;
  serviceType?: string;
}

// Features:
// - Form validation with error messages
// - Accessibility labels and descriptions
// - Loading states with proper feedback
// - WhatsApp integration option
// - GDPR consent handling

// Validation Schema:
const contactSchema = {
  name: { required: true, minLength: 2 },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { required: true, pattern: /^\+?[\d\s\-\(\)]{10,}$/ },
  message: { required: true, minLength: 10, maxLength: 500 }
};
```

#### WhatsApp Widget
```typescript
interface WhatsAppWidgetProps {
  message?: string;
  position?: 'bottom-right' | 'bottom-left';
  showTooltip?: boolean;
}

// Features:
// - Fixed positioning with smooth animations
// - Custom message pre-population
// - Tooltip with call-to-action
// - Mobile-optimized touch targets
// - Analytics event tracking

// Usage:
<WhatsAppWidget 
  message="Olá! Gostaria de agendar uma consulta."
  position="bottom-right"
  showTooltip={true}
/>
```

### 4. Layout Components

#### Page Layout
```typescript
interface PageLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  className?: string;
  seoData?: SEOData;
}

// Features:
// - Consistent page structure
// - SEO meta tag management
// - Responsive container widths
// - Skip navigation links
// - Breadcrumb integration

// Structure:
<PageLayout seoData={pageSchema}>
  <SEOHead {...seoData} />
  <SkipNavigation />
  <Navbar />
  <main className="min-h-screen">
    {children}
  </main>
  <Footer />
  <CTAModal />
</PageLayout>
```

#### Section Container
```typescript
interface SectionProps {
  children: React.ReactNode;
  backgroundColor?: 'white' | 'gray' | 'blue';
  padding?: 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

// Features:
// - Consistent spacing system
// - Background color variants
// - Responsive max-width containers
// - Proper semantic HTML structure

// Usage:
<Section backgroundColor="gray" padding="lg" maxWidth="xl">
  <SectionContent>
    {children}
  </SectionContent>
</Section>
```

## 🎨 Design Tokens

### Color System
```javascript
const colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    500: '#3b82f6',  // Primary blue
    600: '#2563eb',
    900: '#1e3a8a'
  },
  
  // Medical/Healthcare Colors
  medical: {
    teal: '#14b8a6',    // Trust, cleanliness
    green: '#059669',   // Health, success
    blue: '#0ea5e9',    // Professional, calm
    navy: '#1e40af'     // Authority, expertise
  },
  
  // Semantic Colors
  success: '#059669',
  warning: '#d97706', 
  error: '#dc2626',
  info: '#0ea5e9',
  
  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    900: '#111827'
  }
};
```

### Typography Scale
```javascript
const typography = {
  fontFamilies: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    heading: ['Montserrat', 'Inter', 'sans-serif'],
    mono: ['Monaco', 'Consolas', 'monospace']
  },
  
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px  
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem'  // 36px
  },
  
  lineHeights: {
    tight: '1.25',
    normal: '1.5', 
    relaxed: '1.75'
  }
};
```

### Spacing System
```javascript
const spacing = {
  // Base unit: 4px (0.25rem)
  0: '0px',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem'     // 96px
};
```

## 🔧 Utility Components

### SafeImage
```typescript
interface SafeImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onError?: () => void;
}

// Features:
// - Automatic fallback handling
// - Lazy loading with intersection observer
// - WebP format with fallback
// - Proper alt text requirements
// - Loading state indicators

// Usage:
<SafeImage
  src="image.webp"
  fallbackSrc="image.jpg" 
  alt="Descriptive text"
  loading="lazy"
  className="w-full h-auto"
/>
```

### Loading States
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
}

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

// Features:
// - Accessible loading indicators
// - Multiple size variants
// - Screen reader announcements
// - Smooth animations

// Usage:
<LoadingSpinner size="md" label="Carregando conteúdo..." />
<Skeleton width="100%" height="200px" className="rounded" />
```

## 📱 Responsive Design Patterns

### Breakpoint Usage
```typescript
// Mobile-first responsive design
const ResponsiveComponent = () => (
  <div className="
    grid grid-cols-1
    md:grid-cols-2 
    lg:grid-cols-3
    gap-4 md:gap-6 lg:gap-8
    p-4 md:p-6 lg:p-8
  ">
    {/* Content adapts to screen size */}
  </div>
);

// Responsive text scaling
<h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
  Responsive Heading
</h1>
```

### Touch-Friendly Design
```javascript
const touchTargets = {
  // Minimum 44px touch targets (iOS HIG)
  minSize: '2.75rem', // 44px
  spacing: '0.5rem',  // 8px between targets
  
  // Button sizing
  button: {
    sm: 'px-3 py-2 text-sm',      // 32px+ height
    md: 'px-4 py-2.5 text-base',  // 40px+ height  
    lg: 'px-6 py-3 text-lg'       // 48px+ height
  }
};
```

## ♿ Accessibility Implementation

### ARIA Patterns
```typescript
// Proper heading hierarchy
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>

// Form accessibility
<label htmlFor="email" className="sr-only">
  Email Address
</label>
<input 
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={hasError}
  placeholder="Email"
/>
<div id="email-error" role="alert">
  {error && <span className="text-red-600">{error}</span>}
</div>

// Button states
<button
  aria-expanded={isOpen}
  aria-controls="menu-content"
  aria-label="Toggle navigation menu"
>
  Menu
</button>
```

### Focus Management
```css
/* Focus visible styles */
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Skip navigation link */
.skip-nav {
  @apply absolute left-4 top-4 z-50 bg-blue-600 text-white px-4 py-2 rounded;
  @apply transform -translate-y-16 focus:translate-y-0 transition-transform;
}
```

## 🧪 Component Testing Strategy

### Testing Patterns
```typescript
// Component unit tests
describe('Hero Component', () => {
  it('renders with required props', () => {
    render(
      <Hero 
        title="Test Title"
        subtitle="Test Subtitle"
        ctaText="Click Me"
        onCtaClick={mockFunction}
      />
    );
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Title');
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
  
  it('handles CTA click correctly', async () => {
    const mockClick = jest.fn();
    render(<Hero {...props} onCtaClick={mockClick} />);
    
    await user.click(screen.getByRole('button', { name: /click me/i }));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});

// Accessibility tests
it('meets accessibility standards', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 📚 Documentation Standards

### Component Documentation
```typescript
/**
 * Hero section component for landing pages
 * 
 * @example
 * ```jsx
 * <Hero 
 *   title="Welcome to Our Clinic"
 *   subtitle="Professional eye care services"
 *   ctaText="Schedule Appointment"
 *   onCtaClick={() => openBooking()}
 * />
 * ```
 */
export const Hero: FC<HeroProps> = ({ title, subtitle, ctaText, onCtaClick }) => {
  // Component implementation
};

// Props interface with JSDoc
interface HeroProps {
  /** Main headline text (required) */
  title: string;
  /** Supporting subtitle text (required) */
  subtitle: string;
  /** Call-to-action button text (required) */
  ctaText: string;
  /** Handler for CTA button click (required) */
  onCtaClick: () => void;
  /** Background image URL (optional) */
  backgroundImage?: string;
}
```

This design system ensures consistency, accessibility, and maintainability across all components in the Saraiva Vision application.
