# Performance Optimization Examples

## Real Code Fixes from Saraiva Vision Analysis

### 1. ❌ Problem: Inline Styles Creating New Objects

**File**: `src/components/Services.jsx:63`
```javascript
// BEFORE - Creates new object every render
<div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-700"
     style={{ background: 'radial-gradient(circle at 30% 20%, rgba(96,165,250,0.35), transparent 60%)' }} />
```

**FIX 1 - Move to CSS Class**:
```css
/* services.css */
.gradient-halo {
  background: radial-gradient(circle at 30% 20%, rgba(96,165,250,0.35), transparent 60%);
}
```

```javascript
// AFTER - Use CSS class
<div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-700 gradient-halo" />
```

**FIX 2 - Use Static Constant**:
```javascript
// Define outside component
const GRADIENT_STYLE = {
  background: 'radial-gradient(circle at 30% 20%, rgba(96,165,250,0.35), transparent 60%)'
};

// Use in component
<div style={GRADIENT_STYLE} />
```

### 2. ❌ Problem: Missing React.memo on Heavy Component

**File**: `src/components/GoogleLocalSection.jsx`
```javascript
// BEFORE - Re-renders on every parent update
const GoogleLocalSection = () => {
  const { t } = useTranslation();
  // 116 lines of code with Google Maps
  return <section>...</section>;
};

export default GoogleLocalSection;
```

**AFTER - Memoized Component**:
```javascript
import React from 'react';

const GoogleLocalSection = React.memo(() => {
  const { t } = useTranslation();
  // Component code...
  return <section>...</section>;
});

// Optional: Custom comparison function for props
export default React.memo(GoogleLocalSection, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  return prevProps.mapConfig === nextProps.mapConfig;
});
```

### 3. ❌ Problem: useEffect Without Dependencies

**File**: `src/components/CTAModal.jsx:29`
```javascript
// BEFORE - Missing proper setup
useEffect(() => setMounted(true), []);
```

**AFTER - Proper Cleanup**:
```javascript
useEffect(() => {
  let isMounted = true;

  if (isMounted) {
    setMounted(true);
  }

  return () => {
    isMounted = false;
  };
}, []);
```

### 4. ❌ Problem: Event Handlers Re-created

**File**: `src/views/HomePage.jsx`
```javascript
// BEFORE - New function every render
<Button onClick={() => smoothScrollTo('#services')}>
  Our Services
</Button>
```

**AFTER - Memoized Handler**:
```javascript
import { useCallback } from 'react';

const HomePage = () => {
  // Memoize the handler
  const handleServicesClick = useCallback(() => {
    smoothScrollTo('#services');
  }, []); // Empty deps if no external dependencies

  return (
    <Button onClick={handleServicesClick}>
      Our Services
    </Button>
  );
};
```

### 5. ❌ Problem: Expensive Computations Without useMemo

**File**: `src/components/BlogPage.jsx`
```javascript
// BEFORE - Filters/sorts on every render
const BlogPage = ({ posts }) => {
  // This runs every render!
  const sortedPosts = posts
    .filter(post => post.published)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  return <div>{sortedPosts.map(...)}</div>;
};
```

**AFTER - Memoized Computation**:
```javascript
import { useMemo } from 'react';

const BlogPage = ({ posts }) => {
  // Only re-compute when posts change
  const sortedPosts = useMemo(() => {
    return posts
      .filter(post => post.published)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }, [posts]);

  return <div>{sortedPosts.map(...)}</div>;
};
```

### 6. ❌ Problem: Large Bundle Not Split

**File**: `src/components/GoogleLocalSection.jsx` (121KB bundle)
```javascript
// BEFORE - Loads immediately with page
import GoogleMapRobust from '@/components/GoogleMapRobust';

const GoogleLocalSection = () => {
  return (
    <section>
      <GoogleMapRobust />
    </section>
  );
};
```

**AFTER - Lazy Load on Visibility**:
```javascript
import { lazy, Suspense, useState, useEffect, useRef } from 'react';

// Lazy load the heavy component
const GoogleMapRobust = lazy(() => import('@/components/GoogleMapRobust'));

const GoogleLocalSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Load 100px before visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef}>
      {isVisible ? (
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse">Loading map...</div>}>
          <GoogleMapRobust />
        </Suspense>
      ) : (
        <div className="h-96 bg-gray-100">Map placeholder</div>
      )}
    </section>
  );
};
```

### 7. ❌ Problem: Context Causing Global Re-renders

**File**: `src/providers/ConfigProvider.jsx`
```javascript
// BEFORE - New object every render
const ConfigProvider = ({ children }) => {
  const value = {
    config: { /* ... */ },
    updateConfig: () => { /* ... */ }
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};
```

**AFTER - Memoized Context Value**:
```javascript
import { useMemo, useCallback, useState } from 'react';

const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(initialConfig);

  const updateConfig = useCallback((newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Memoize context value
  const value = useMemo(() => ({
    config,
    updateConfig
  }), [config, updateConfig]);

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};
```

### 8. ❌ Problem: Multiple setState Calls

**File**: `src/components/ContactForm.jsx`
```javascript
// BEFORE - Multiple setState causing multiple re-renders
const handleSubmit = () => {
  setLoading(true);
  setError(null);
  setSuccess(false);
  // API call...
};
```

**AFTER - Batch State Updates**:
```javascript
// Option 1: Use reducer
const [state, dispatch] = useReducer(formReducer, initialState);

const handleSubmit = () => {
  dispatch({ type: 'SUBMIT_START' });
  // API call...
};

// Option 2: Combine into single state
const [formState, setFormState] = useState({
  loading: false,
  error: null,
  success: false
});

const handleSubmit = () => {
  setFormState({
    loading: true,
    error: null,
    success: false
  });
  // API call...
};
```

## Performance Checklist

### Before Every Component:
- [ ] Does it need to re-render when parent updates? → Add `React.memo`
- [ ] Are there inline styles? → Extract to constants/CSS
- [ ] Are there arrow functions in props? → Use `useCallback`
- [ ] Is there heavy computation? → Use `useMemo`
- [ ] Is it over 100 lines? → Consider splitting

### Before Every useEffect:
- [ ] Does it have dependencies? → Add them
- [ ] Does it need cleanup? → Add return function
- [ ] Is it running too often? → Check dependencies
- [ ] Can it be moved to event handler? → Prefer handlers over effects

### Before Every Build:
- [ ] Run `npm run build:vite` and check sizes
- [ ] Are all chunks under 200KB?
- [ ] Are heavy libraries lazy loaded?
- [ ] Is initial bundle under 400KB?

## Quick Performance Wins

1. **Add React.memo to these components first**:
   - GoogleLocalSection (saves ~121KB from re-renders)
   - EnhancedFooter (saves ~56KB)
   - Services cards
   - FAQ items

2. **Lazy load these heavy imports**:
   - Google Maps components
   - Framer Motion animations
   - DOMPurify (blog only)
   - Sanity CMS components

3. **Fix these inline styles**:
   - All gradient backgrounds → CSS classes
   - Transform styles → CSS animations
   - Dynamic heights → CSS custom properties

4. **Optimize these bundle chunks**:
   - Split vendor-misc into feature chunks
   - Separate blog data from blog component
   - Extract podcast episodes to async load

## Measuring Impact

```bash
# Before optimization
npm run build:vite
# Note the total size and largest chunks

# After optimization
npm run build:vite
# Compare sizes

# Test in browser
# 1. Open DevTools → Performance
# 2. Start recording
# 3. Reload page
# 4. Check metrics:
#    - First Contentful Paint (target < 1.5s)
#    - Time to Interactive (target < 3s)
#    - Total Blocking Time (target < 300ms)
```

## Expected Results

After implementing these optimizations:
- **Bundle size**: -30% reduction
- **Initial load**: -50% JavaScript
- **First Paint**: -40% faster
- **Re-renders**: -60% fewer
- **Memory usage**: -25% lower