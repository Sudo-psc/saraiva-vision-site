# Saraiva Vision - Implementation Guide & Best Practices

## 🚀 Getting Started

### Development Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd saraivavision-site-v2

# Install dependencies
npm install

# Environment variables setup
cp .env.example .env.local
# Add your API keys and configuration

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### Required Environment Variables
```bash
# .env.local
VITE_GOOGLE_PLACE_ID=your_google_place_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
GOOGLE_PLACES_API_KEY=your_places_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
NODE_ENV=development
```

## 🏗️ Implementation Best Practices

### 1. Component Development Guidelines

#### Component Structure
```typescript
// Component file structure
components/
├── ComponentName/
│   ├── index.ts              // Export barrel
│   ├── ComponentName.tsx     // Main component
│   ├── ComponentName.test.tsx // Unit tests
│   ├── ComponentName.stories.tsx // Storybook stories
│   └── types.ts              // Type definitions

// Example component implementation
import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { ComponentProps } from './types';

export const ComponentName = forwardRef<HTMLDivElement, ComponentProps>(
  ({ children, className, variant = 'default', ...props }, ref) => {
    const baseClasses = 'component-base-styles';
    const variantClasses = {
      default: 'default-styles',
      primary: 'primary-styles',
      secondary: 'secondary-styles'
    };
    
    return (
      <div
        ref={ref}
        className={clsx(baseClasses, variantClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ComponentName.displayName = 'ComponentName';
```

#### Testing Implementation
```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders with default props', () => {
    render(<ComponentName>Test content</ComponentName>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
  
  it('applies variant classes correctly', () => {
    render(<ComponentName variant="primary">Test</ComponentName>);
    const element = screen.getByText('Test');
    expect(element).toHaveClass('primary-styles');
  });
  
  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<ComponentName ref={ref}>Test</ComponentName>);
    expect(ref.current).toBeInTheDocument();
  });
  
  it('meets accessibility standards', async () => {
    const { container } = render(<ComponentName>Test</ComponentName>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 2. State Management Patterns

#### Local State with Custom Hooks
```typescript
// useComponentState.ts - Custom hook pattern
import { useState, useCallback, useEffect } from 'react';

interface UseComponentStateProps {
  initialValue?: string;
  onChange?: (value: string) => void;
}

export const useComponentState = ({ 
  initialValue = '', 
  onChange 
}: UseComponentStateProps = {}) => {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
    setError(null);
  }, [onChange]);
  
  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue]);
  
  return {
    value,
    loading,
    error,
    handleChange,
    setLoading,
    setError,
    reset
  };
};

// Usage in component
const MyComponent = () => {
  const { value, loading, error, handleChange, setLoading } = useComponentState({
    initialValue: '',
    onChange: (value) => console.log('Value changed:', value)
  });
  
  return (
    <div>
      <input value={value} onChange={(e) => handleChange(e.target.value)} />
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
    </div>
  );
};
```

#### Context Pattern for Global State
```typescript
// GlobalStateContext.tsx
interface GlobalState {
  language: string;
  theme: 'light' | 'dark';
  user: User | null;
}

interface GlobalStateContextType extends GlobalState {
  setLanguage: (lang: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setUser: (user: User | null) => void;
}

const GlobalStateContext = createContext<GlobalStateContextType | null>(null);

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GlobalState>({
    language: 'pt',
    theme: 'light',
    user: null
  });
  
  const setLanguage = useCallback((language: string) => {
    setState(prev => ({ ...prev, language }));
    localStorage.setItem('language', language);
  }, []);
  
  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setState(prev => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);
  }, []);
  
  const setUser = useCallback((user: User | null) => {
    setState(prev => ({ ...prev, user }));
  }, []);
  
  const value = {
    ...state,
    setLanguage,
    setTheme,
    setUser
  };
  
  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within GlobalStateProvider');
  }
  return context;
};
```

### 3. API Integration Patterns

#### API Hook Pattern
```typescript
// useApi.ts - Generic API hook
import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useApi = <T>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions = {}
) => {
  const { immediate = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);
  
  return { data, loading, error, execute, refetch: execute };
};

// Specific API hooks
export const useReviews = () => {
  return useApi(
    () => fetch('/api/reviews').then(res => res.json()),
    {
      onError: (error) => console.error('Failed to load reviews:', error)
    }
  );
};

export const useContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const submitForm = useCallback(async (formData: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      
      return await response.json();
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  return { submitForm, isSubmitting };
};
```

### 4. Performance Optimization Implementation

#### Image Optimization
```typescript
// SafeImage component with optimization
import React, { useState, useRef, useEffect } from 'react';

interface SafeImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallbackSrc,
  alt,
  className = '',
  loading = 'lazy',
  width,
  height
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (loading === 'lazy' && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      
      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }
  }, [src, loading]);
  
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };
  
  const handleError = () => {
    setIsLoading(false);
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };
  
  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Image not available</span>
      </div>
    );
  }
  
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={loading === 'lazy' ? undefined : imageSrc}
        data-src={loading === 'lazy' ? imageSrc : undefined}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};
```

#### Code Splitting Implementation
```typescript
// Lazy loading with error boundaries
import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const LazyComponent = lazy(() => import('./HeavyComponent'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
);

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="text-center p-8">
    <h2 className="text-lg font-semibold text-red-600 mb-2">
      Something went wrong
    </h2>
    <p className="text-sm text-gray-600">{error.message}</p>
  </div>
);

export const LazyComponentWrapper = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent />
    </Suspense>
  </ErrorBoundary>
);
```

### 5. SEO Implementation

#### SEO Hook Implementation
```typescript
// useSEO hook with structured data
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  structuredData: object;
}

export const useSEO = (seoData: Partial<SEOData>) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  
  useEffect(() => {
    // Update document title
    const title = seoData.title || t('site.defaultTitle');
    document.title = title;
    
    // Update meta tags
    updateMetaTag('description', seoData.description || t('site.defaultDescription'));
    updateMetaTag('keywords', seoData.keywords || t('site.defaultKeywords'));
    
    // Update Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', seoData.description || t('site.defaultDescription'), 'property');
    updateMetaTag('og:url', `https://saraivavision.com.br${location.pathname}`, 'property');
    
    // Update canonical URL
    updateCanonicalUrl(seoData.canonicalUrl || `https://saraivavision.com.br${location.pathname}`);
    
    // Update structured data
    if (seoData.structuredData) {
      updateStructuredData(seoData.structuredData);
    }
  }, [seoData, location.pathname, t, i18n.language]);
};

function updateMetaTag(name: string, content: string, attribute = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateCanonicalUrl(url: string) {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = url;
}

function updateStructuredData(data: object) {
  let element = document.querySelector('script[type="application/ld+json"]');
  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}
```

### 6. Accessibility Implementation

#### Accessibility Hooks and Utils
```typescript
// useAccessibility.ts
import { useEffect, useRef } from 'react';

export const useAccessibility = () => {
  const focusTrapRef = useRef<HTMLElement>(null);
  
  const trapFocus = (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    element.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();
    
    return () => element.removeEventListener('keydown', handleKeyDown);
  };
  
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };
  
  return { trapFocus, announceToScreenReader, focusTrapRef };
};

// Accessibility component wrapper
export const AccessibleButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, onClick, disabled, ariaLabel, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      onClick?.(e);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault();
        onClick?.(e as any);
      }
    };
    
    return (
      <button
        ref={ref}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
```

### 7. Testing Implementation Strategy

#### Testing Utilities
```typescript
// test-utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Custom matchers
export const expectToBeAccessible = async (container: HTMLElement) => {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Mock implementations
export const mockIntersectionObserver = () => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() { return null; }
    disconnect() { return null; }
    unobserve() { return null; }
  };
};
```

#### Integration Testing Example
```typescript
// HomePage.integration.test.tsx
import { render, screen, waitFor } from '../test-utils';
import { HomePage } from './HomePage';

describe('HomePage Integration', () => {
  beforeEach(() => {
    mockIntersectionObserver();
  });
  
  it('renders all main sections', async () => {
    render(<HomePage />);
    
    // Test hero section
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /agendar consulta/i })).toBeInTheDocument();
    
    // Test services section
    await waitFor(() => {
      expect(screen.getByText(/nossos serviços/i)).toBeInTheDocument();
    });
    
    // Test testimonials section
    await waitFor(() => {
      expect(screen.getByText(/depoimentos/i)).toBeInTheDocument();
    });
    
    // Test contact section
    expect(screen.getByRole('form')).toBeInTheDocument();
  });
  
  it('handles WhatsApp CTA correctly', async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    
    const whatsappButton = screen.getByRole('button', { name: /whatsapp/i });
    await user.click(whatsappButton);
    
    // Should open WhatsApp (in real implementation, would mock window.open)
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('wa.me'),
      '_blank'
    );
  });
  
  it('meets accessibility standards', async () => {
    const { container } = render(<HomePage />);
    await expectToBeAccessible(container);
  });
});
```

## 📝 Development Workflow

### Git Workflow
```bash
# Feature development
git checkout -b feature/component-name
git add .
git commit -m "feat: add new component with accessibility features"
git push origin feature/component-name

# Create pull request
# After review and approval:
git checkout main
git pull origin main
git branch -d feature/component-name
```

### Code Review Checklist
```markdown
## Code Review Checklist

### Functionality
- [ ] Component works as expected
- [ ] All user interactions function correctly
- [ ] Error states are handled properly
- [ ] Loading states are implemented

### Performance  
- [ ] No unnecessary re-renders
- [ ] Images are optimized and lazy-loaded
- [ ] Bundle size impact is acceptable
- [ ] No memory leaks

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] ARIA labels are appropriate
- [ ] Color contrast meets standards

### Code Quality
- [ ] TypeScript types are correct
- [ ] Code is properly documented
- [ ] Tests cover edge cases
- [ ] No console errors or warnings

### Security
- [ ] No sensitive data exposure
- [ ] Input validation is implemented
- [ ] XSS protection is in place
```

This implementation guide provides comprehensive patterns and best practices for developing and maintaining the Saraiva Vision application.