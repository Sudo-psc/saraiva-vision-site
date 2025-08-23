# Saraiva Vision - System Architecture Design

## 🏗️ System Overview

**Architecture Pattern**: Modern React SPA with Jamstack principles
**Deployment Strategy**: Static site with serverless functions
**Performance Target**: <3s load time, 90+ Lighthouse scores

## 📊 Technology Stack

### Frontend Layer
```yaml
Core Framework:
  - React 18.2.0 (SPA with Suspense & lazy loading)
  - React Router 6.16.0 (client-side routing)
  - Vite 4.4.5 (build tool & dev server)

Styling & UI:
  - TailwindCSS 3.3.3 (utility-first styling)
  - Radix UI (accessible component primitives)
  - Framer Motion 10.16.4 (animations)
  - Lucide React (icon system)

State & Data:
  - React Hooks (local state management)
  - React i18next (internationalization)
  - Supabase 2.30.0 (backend services)
  - Context API (global state)

Performance:
  - Code Splitting (route-based)
  - Lazy Loading (components & images)
  - Bundle optimization (Rollup)
  - Service Worker ready
```

### Backend & Infrastructure
```yaml
Serverless Functions:
  - Vercel Functions (API routes)
  - Google Places API (reviews)
  - WhatsApp Business API

External Services:
  - Google Maps Platform
  - Google Analytics & GTM
  - Instagram Basic Display
  - Supabase (optional data storage)

Content Management:
  - Static content (JSON/JS)
  - i18n translations (JSON)
  - Image optimization (CDN)
```

## 🎯 Application Architecture

### 1. Component Hierarchy
```
App (Root)
├── ScrollToTop (utility)
├── Suspense Wrapper
│   └── Router
│       ├── HomePage
│       ├── ServiceDetailPage
│       ├── TestimonialsPage
│       ├── LensesPage
│       └── PrivacyPolicyPage
├── Global Components
│   ├── Toaster (notifications)
│   ├── ConsentManager (GDPR)
│   └── ExitIntentPopup (conversion)
```

### 2. Page Structure Pattern
```yaml
Every Page:
  - SEOHead (meta tags & structured data)
  - Navbar (consistent navigation)
  - Main Content (page-specific)
  - Footer (contact & links)
  - FloatingCTA (WhatsApp widget)

Component Pattern:
  - Responsive design (mobile-first)
  - Accessibility compliance (WCAG 2.1)
  - Performance optimization
  - Error boundaries
```

### 3. State Management Strategy
```yaml
Local State (useState/useEffect):
  - Component-specific UI state
  - Form inputs & validation
  - Animation states
  - Loading states

Global State (Context):
  - Language preference (i18n)
  - Theme settings
  - User consent status
  - Analytics tracking

External State:
  - API responses (cached)
  - Browser localStorage
  - URL parameters
  - Environment variables
```

## 🔗 Integration Patterns

### API Integration
```typescript
// Serverless Function Pattern
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Business logic
    const result = await externalAPI.call();
    
    // Response with caching
    res.setHeader('Cache-Control', 's-maxage=300');
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Frontend Integration
const useAPIData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  
  return { data, loading };
};
```

### SEO & Analytics Integration
```typescript
// Structured Data Pattern
const generateSchema = (pageData) => ({
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  "name": clinicInfo.name,
  "url": canonicalUrl,
  "schema": pageData
});

// Analytics Event Pattern
const trackEvent = (action, category, label) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      event_category: category,
      event_label: label
    });
  }
};
```

## 🚀 Performance Architecture

### Code Splitting Strategy
```javascript
// Route-based splitting
const HomePage = lazy(() => import('@/pages/HomePage'));
const ServiceDetailPage = lazy(() => import('@/pages/ServiceDetailPage'));

// Component-based splitting (for heavy components)
const InstagramWidget = lazy(() => import('@/components/InstagramWidget'));
const GoogleMap = lazy(() => import('@/components/GoogleMap'));

// Resource optimization
const preloadCriticalResources = () => {
  // Critical images
  link.rel = 'preload';
  link.as = 'image';
  link.href = criticalImageUrl;
};
```

### Caching Strategy
```yaml
Static Assets:
  - Immutable files: 1 year cache
  - HTML: No cache (always fresh)
  - CSS/JS: Content hash versioning

API Responses:
  - Reviews: 5 minutes cache
  - Static data: 1 hour cache
  - Error responses: No cache

Browser Storage:
  - Language preference: localStorage
  - Consent status: localStorage
  - Analytics: sessionStorage
```

## 🛡️ Security & Privacy Architecture

### Data Protection
```yaml
GDPR Compliance:
  - Consent management system
  - Data minimization principle
  - Right to be forgotten
  - Privacy policy transparency

Security Measures:
  - HTTPS enforcement
  - Content Security Policy
  - CORS configuration
  - Input sanitization
  - Error message sanitization
```

### API Security
```javascript
// Rate limiting pattern
const rateLimiter = {
  window: 60000, // 1 minute
  max: 10,       // 10 requests per window
  store: new Map()
};

// Input validation
const validateInput = (input) => {
  return sanitize(input.trim().slice(0, 500));
};
```

## 🎨 Design System Architecture

### Component Design Pattern
```typescript
// Base component structure
interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const Component = ({ 
  children, 
  className = '', 
  variant = 'primary',
  size = 'md',
  ...props 
}: ComponentProps) => {
  const baseClasses = 'component-base';
  const variantClasses = variants[variant];
  const sizeClasses = sizes[size];
  
  return (
    <element 
      className={clsx(baseClasses, variantClasses, sizeClasses, className)}
      {...props}
    >
      {children}
    </element>
  );
};
```

### Styling Architecture
```yaml
Design Tokens:
  - Colors: Primary, secondary, accent, semantic
  - Typography: Font families, sizes, weights
  - Spacing: Consistent scale (4px base)
  - Breakpoints: Mobile-first responsive
  - Animation: Duration, easing, delays

Component Variants:
  - Primary/Secondary styles
  - Size variations (sm/md/lg)
  - State styles (hover/focus/disabled)
  - Theme adaptations
```

## 📱 Responsive Design Strategy

### Breakpoint System
```javascript
const breakpoints = {
  xs: '0px',     // Mobile portrait
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape
  xl: '1280px',  // Desktop
  '2xl': '1536px' // Large desktop
};

// Usage pattern
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

### Mobile-First Approach
```yaml
Design Principles:
  - Touch-friendly interfaces (44px min touch targets)
  - Thumb-friendly navigation
  - Optimized images for mobile
  - Fast loading on 3G connections
  - Progressive enhancement

Performance Targets:
  - Mobile: <3s load time
  - Desktop: <1s load time
  - Core Web Vitals: 90+ scores
```

## 🔍 Monitoring & Analytics Architecture

### Performance Monitoring
```javascript
// Core Web Vitals tracking
const trackWebVitals = ({ name, value }) => {
  gtag('event', 'web_vitals', {
    event_category: 'performance',
    event_label: name,
    value: Math.round(value)
  });
};

// Error tracking
window.addEventListener('error', (event) => {
  gtag('event', 'javascript_error', {
    event_category: 'error',
    event_label: event.filename,
    value: event.lineno
  });
});
```

### Business Metrics
```yaml
Conversion Tracking:
  - WhatsApp clicks
  - Phone calls
  - Form submissions
  - Page engagement

User Experience:
  - Bounce rate
  - Time on site
  - Page views
  - Navigation patterns

Technical Metrics:
  - Load times
  - Error rates
  - Browser usage
  - Device types
```

## 🔮 Scalability Considerations

### Growth Planning
```yaml
Traffic Scaling:
  - CDN for static assets
  - Serverless auto-scaling
  - Database read replicas
  - Caching strategies

Feature Scaling:
  - Modular component architecture
  - Plugin system for integrations
  - Multi-language support
  - A/B testing framework

Team Scaling:
  - Component documentation
  - Design system guidelines
  - Testing strategies
  - Deployment workflows
```

### Future Enhancements
```yaml
Technical Roadmap:
  - Progressive Web App (PWA)
  - Offline functionality
  - Push notifications
  - Advanced analytics

Business Features:
  - Online booking system
  - Patient portal
  - Telemedicine integration
  - Inventory management
```

---

This architecture provides a solid foundation for a modern, performant, and scalable medical clinic website with room for future growth and feature expansion.