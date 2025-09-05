# GitHub Copilot Instructions - SaraivaVision Medical Clinic Website

## 🏥 Project Overview
This is a React-based medical clinic website for SaraivaVision (ophthalmology clinic) with strict requirements for accessibility, performance, and Brazilian medical compliance.

## 📋 Core Development Principles

### 🎯 Medical Website Requirements
- **Brazilian Medical Compliance**: Follow CFM (Conselho Federal de Medicina) regulations
- **LGPD Compliance**: Brazilian data protection law adherence
- **Accessibility**: WCAG 2.1 AA compliance mandatory
- **Professional Content**: All medical content must be accurate and professionally reviewed
- **Patient Privacy**: Sensitive data handling with utmost care

### ⚡ Performance Standards
- Lighthouse score 90+ on all metrics
- Core Web Vitals compliance
- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1
- Lazy load all non-critical components
- Image optimization with WebP format

## 🛠️ Technology Stack Patterns

### React Development Guidelines
```javascript
// PREFERRED: Functional components with hooks
const Component = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  return (
    <div className="component-container">
      {/* JSX content */}
    </div>
  );
};

// AVOID: Class components unless absolutely necessary
```

### Component Architecture
- **Lazy Loading**: All pages must use React.lazy()
```javascript
const HomePage = lazy(() => import('@/pages/HomePage'));
```

- **Component Organization**:
  - `/components/ui` - Base design system components
  - `/components/icons` - Custom SVG icons (flags, medical icons)
  - `/components/ServiceDetail` - Service-specific components
  - `/components` - Business logic components

### Design System Usage
```javascript
// Use design system tokens from Tailwind config
className="text-brand-blue bg-trust-green p-spacing-4"

// Typography scale
className="text-display-xl font-heading" // Hero titles
className="text-body-lg font-body"       // Body text
className="text-caption font-body"       // Small text

// Spacing (8pt grid system)
className="p-2 m-4 gap-6" // Use 8pt increments
```

### Internationalization (i18n)
```javascript
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();
  
  return (
    <h1>{t('common.welcome')}</h1>
  );
};

// ALL user-facing strings must use i18n
// Default: Portuguese (pt), Secondary: English (en)
```

## 🎨 Styling Guidelines

### Tailwind CSS Best Practices
```javascript
// PREFERRED: Utility-first with design tokens
className="bg-brand-blue text-white px-4 py-2 rounded-lg"

// Component-specific utilities
className="medical-card hover:shadow-trust transition-all duration-300"

// Responsive design (mobile-first)
className="text-sm md:text-base lg:text-lg"
```

### Accessibility Requirements
```javascript
// Always include ARIA labels and roles
<button
  aria-label={t('common.close')}
  role="button"
  className="close-btn"
>
  <CloseIcon aria-hidden="true" />
</button>

// Image alt texts must be descriptive
<img 
  src="/medical-equipment.jpg" 
  alt={t('equipment.description')}
  loading="lazy"
/>

// Form accessibility
<label htmlFor="patient-name">{t('forms.patientName')}</label>
<input 
  id="patient-name"
  type="text"
  required
  aria-describedby="name-help"
/>
```

## 🔒 Security & Privacy

### Data Handling
```javascript
// NEVER log sensitive data
// AVOID
console.log('Patient data:', patientInfo);

// PREFERRED: Sanitized logging
console.log('Processing patient form submission');

// Validate all inputs
const validateCPF = (cpf) => {
  // CPF validation logic
  return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
};
```

### Environment Variables
```javascript
// Use environment variables for sensitive data
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// NEVER commit sensitive keys to repository
```

## 📱 Component Development

### Medical-Specific Components
```javascript
// Service components for medical procedures
const ServiceDetail = ({ serviceId }) => {
  // Include schema markup for medical services
  const schema = {
    "@type": "MedicalProcedure",
    "name": serviceName,
    "description": serviceDescription,
    "provider": {
      "@type": "MedicalOrganization",
      "name": "SaraivaVision"
    }
  };
  
  return (
    <div>
      <SchemaMarkup schema={schema} />
      {/* Component content */}
    </div>
  );
};
```

### Contact Forms
```javascript
// Include reCAPTCHA for spam protection
import ReCAPTCHA from 'react-google-recaptcha';

const ContactForm = () => {
  const [captchaToken, setCaptchaToken] = useState(null);
  
  const handleSubmit = async (formData) => {
    if (!captchaToken) {
      toast.error(t('errors.captchaRequired'));
      return;
    }
    
    // Submit with LGPD compliance
    const response = await submitForm({
      ...formData,
      captchaToken,
      privacyConsent: true
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <ReCAPTCHA
        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
        onChange={setCaptchaToken}
      />
    </form>
  );
};
```

## 🧪 Testing Standards

### Component Testing
```javascript
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Component from '../Component';

describe('Component', () => {
  it('renders with accessibility compliance', () => {
    render(<Component />);
    
    // Test accessibility
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByLabelText(/close/i)).toBeInTheDocument();
  });
  
  it('handles medical data correctly', () => {
    // Test medical-specific functionality
  });
});
```

### Integration Testing
```javascript
// Test Google Maps integration
it('loads Google Maps with fallback', async () => {
  const mockLoadGoogleMaps = vi.fn();
  render(<GoogleMap />);
  
  // Test fallback when Maps fails
  expect(screen.getByText(/map not available/i)).toBeInTheDocument();
});
```

## 🔧 API Integration

### Supabase Integration
```javascript
import { supabase } from '@/lib/customSupabaseClient';

const submitContactForm = async (formData) => {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([{
        ...formData,
        created_at: new Date().toISOString(),
        privacy_consent: true
      }]);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Contact form submission error:', error.message);
    throw error;
  }
};
```

### Google Maps Integration
```javascript
import { loadGoogleMaps } from '@/lib/loadGoogleMaps';

const GoogleMapComponent = () => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setMapLoaded(true))
      .catch(() => setMapError(true));
  }, []);
  
  if (mapError) {
    return <div>{t('map.loadError')}</div>;
  }
  
  return mapLoaded ? <GoogleMapLoaded /> : <MapSkeleton />;
};
```

## 📊 Performance Optimization

### Image Optimization
```javascript
import OptimizedImage from '@/components/ui/OptimizedImage';

// Use optimized images with WebP support
<OptimizedImage
  src="/hero-image.jpg"
  alt={t('hero.imageAlt')}
  width={1200}
  height={600}
  priority={true} // For above-fold images
  className="hero-image"
/>
```

### Code Splitting
```javascript
// Lazy load heavy components
const ChartComponent = lazy(() => import('@/components/ChartComponent'));

// Use Suspense with medical-themed fallbacks
<Suspense fallback={<MedicalSpinner />}>
  <ChartComponent />
</Suspense>
```

## 🚨 Error Handling

### Error Boundaries
```javascript
import ErrorBoundary from '@/components/ErrorBoundary';

// Wrap components that might fail
<ErrorBoundary fallback={<MedicalErrorFallback />}>
  <GoogleMap />
</ErrorBoundary>
```

### User-Friendly Error Messages
```javascript
const handleError = (error) => {
  // Log technical details (not sensitive data)
  console.error('Operation failed:', error.message);
  
  // Show user-friendly message
  toast.error(t('errors.tryAgainLater'));
};
```

## 📋 Code Quality Rules

### ESLint Configuration
- Follow existing `.eslintrc.json` rules  
- Maximum function complexity: 15
- Maximum line length: 120 characters
- Mandatory PropTypes for components
- No console.log in production code (except console.warn/error)

### Common ESLint Issues to Avoid

#### Import Organization
```javascript
// CORRECT: All imports at the top
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import { clinicInfo } from '@/lib/clinicInfo';

const Component = () => {
  // Component logic
};

// AVOID: Imports in component body
const Component = () => {
  import('./dynamic-module'); // ❌ Wrong - use dynamic imports with await
};
```

#### Global Variables (Google APIs, Analytics)
```javascript
// CORRECT: Check availability before using
const initGoogleMap = () => {
  if (typeof google !== 'undefined' && google.maps) {
    const map = new google.maps.Map(element, options);
  }
};

const trackEvent = (eventName, parameters) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, parameters);
  }
};

// AVOID: Direct usage without checks
const map = new google.maps.Map(); // ❌ May cause no-undef errors
```

#### React Hooks Rules
```javascript
// CORRECT: Hooks at component top level
const Component = ({ condition }) => {
  const [state, setState] = useState(initial);
  const memoValue = useMemo(() => calculation, [deps]);
  
  useEffect(() => {
    if (condition) {
      // Effect logic
    }
  }, [condition]);
  
  if (!condition) return null; // Early return after hooks
};

// AVOID: Conditional hooks
const Component = ({ condition }) => {
  if (!condition) return null; // ❌ Early return before hooks
  
  const [state, setState] = useState(initial); // ❌ Hook after early return
};
```

#### Unused Variables and Imports
```javascript
// CORRECT: Remove unused imports
import { useState } from 'react'; // Only import what's used

const Component = () => {
  const [state, setState] = useState(initial);
  
  // Use underscore prefix for intentionally unused parameters
  const handleCallback = (_unusedParam, usedParam) => {
    console.log(usedParam);
  };
};

// AVOID: Unused imports
import { useState, useEffect } from 'react'; // ❌ useEffect not used
import { Button } from './Button'; // ❌ Button not used
```

### Import Organization
```javascript
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// 2. Internal components
import Button from '@/components/ui/Button';
import MedicalCard from '@/components/ui/MedicalCard';

// 3. Utilities and configurations
import { clinicInfo } from '@/lib/clinicInfo';
import { cn } from '@/lib/utils';
```

### Translation Usage
```javascript
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('services.ophthalmology.description')}</p>
    </div>
  );
};

// AVOID: Undefined translation function
const BadComponent = () => {
  return <h1>{t('common.welcome')}</h1>; // ❌ t is not defined
};
```

### Service Worker and Web Workers
```javascript
// CORRECT: Service worker context
if (typeof self !== 'undefined') {
  self.addEventListener('fetch', event => {
    // Service worker logic
  });
}

// AVOID: Using 'self' in regular components
const Component = () => {
  self.postMessage(data); // ❌ Restricted global
};
```
- Components: PascalCase (`ContactForm.jsx`)
- Utilities: camelCase (`clinicInfo.js`)
- Constants: SCREAMING_SNAKE_CASE (`API_ENDPOINTS.js`)
- Test files: `ComponentName.test.jsx`

## 🎯 Medical Website Specific Guidelines

### Content Guidelines
- All medical terminology must be accurate
- Include disclaimers for medical advice
- Provide multiple contact methods for emergencies
- Display physician credentials (CFM registration)

### Schema Markup
```javascript
// Always include medical business schema
const medicalBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "SaraivaVision",
  "address": clinicInfo.address,
  "telephone": clinicInfo.phone,
  "priceRange": "$$"
};
```

### SEO for Medical Websites
```javascript
import { Helmet } from 'react-helmet-async';

const ServicePage = ({ service }) => (
  <>
    <Helmet>
      <title>{t(`services.${service.id}.seoTitle`)}</title>
      <meta name="description" content={t(`services.${service.id}.seoDescription`)} />
      <meta name="keywords" content={t(`services.${service.id}.keywords`)} />
      
      {/* Medical-specific meta tags */}
      <meta name="medical-specialty" content="Ophthalmology" />
      <meta name="geo.region" content="BR-SP" />
    </Helmet>
    {/* Page content */}
  </>
);
```

## 🔍 Code Review Checklist

When reviewing or generating code, ensure:

### ✅ Functionality
- [ ] Component follows React best practices
- [ ] Proper error handling implemented
- [ ] Accessibility attributes included
- [ ] Internationalization keys used
- [ ] Mobile responsiveness considered

### ✅ Performance
- [ ] Images optimized and lazy loaded
- [ ] Components properly memoized if needed
- [ ] No unnecessary re-renders
- [ ] Bundle size impact considered

### ✅ Medical Compliance
- [ ] Medical content accuracy verified
- [ ] Privacy considerations addressed
- [ ] Schema markup for medical services
- [ ] LGPD compliance maintained

### ✅ Security
- [ ] No sensitive data exposure
- [ ] Input validation implemented
- [ ] XSS prevention measures
- [ ] Environment variables used correctly

## 🚀 Deployment Considerations

### Build Optimization
```javascript
// Vite configuration for medical website
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'medical-vendor': ['react', 'react-dom'],
          'maps': ['@googlemaps/js-api-loader'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-toast']
        }
      }
    }
  }
});
```

### ESLint Configuration Updates
- Exclude build artifacts from linting (dist/, node_modules/)
- Configure for ESM module system compatibility
- Use environment globals for browser APIs (gtag, dataLayer, chrome)
- Allow console.log in development/debug files

### Environment Setup
- Development: `npm run dev` (localhost:5173)
- Production build: `npm run build`
- Local deployment: `npm run deploy:local`
- API server: `npm run start:api`

Remember: This is a medical website serving real patients. Always prioritize accuracy, accessibility, privacy, and security in all code suggestions and implementations.