# 🚀 Developer Quick Reference - Saraiva Vision

*Essential commands, patterns, and references for rapid development*

## ⚡ Quick Commands

```bash
# Development
npm run dev                    # Start dev server
npm run dev:full              # Full stack with API
npm run build                 # Production build
npm run test                  # Run tests (watch)
npm run test:coverage         # Coverage report

# Debugging
/api/env-debug               # Check environment variables
npm run smoke:test           # Quick smoke tests
```

## 🎯 Common Tasks

### New Component
```bash
# Location: src/components/
# Pattern: PascalCase.jsx
# Tests: src/components/__tests__/ComponentName.test.jsx
```

### New Page
```bash
# Location: src/pages/
# Pattern: PageName.jsx (lazy loaded)
# Route: Add to src/App.jsx with React.lazy()
```

### Translations
```bash
# Location: src/locales/pt.json, src/locales/en.json
# Usage: const { t } = useTranslation();
```

## 🏗️ Architecture Patterns

### Component Structure
```jsx
// src/components/ComponentName.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const ComponentName = ({ prop1, prop2 }) => {
  const { t } = useTranslation();
  
  return (
    <div className="component-name">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

### Page Structure
```jsx
// src/pages/PageName.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const PageName = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <Helmet>
        <title>{t('pageName.title')}</title>
        <meta name="description" content={t('pageName.description')} />
      </Helmet>
      <main>
        {/* Page content */}
      </main>
    </>
  );
};

export default PageName;
```

## 🎨 Design System Quick Reference

### Colors
```css
/* Brand Colors */
--brand-blue: #1e40af;
--brand-green: #16a34a;
--medical-blue: #0f766e;
--trust-green: #059669;

/* Usage in Tailwind */
bg-brand-blue text-brand-green border-medical-blue
```

### Typography
```css
/* Headings */
text-display-xl    /* 4xl, bold */
text-display-lg    /* 3xl, bold */
text-heading-xl    /* 2xl, semibold */
text-body-lg       /* lg, regular */
text-caption       /* sm, medium */
```

### Spacing (8pt grid)
```css
/* Common Patterns */
p-4 m-4           /* 16px */
p-6 m-6           /* 24px */
p-8 m-8           /* 32px */
gap-4             /* 16px gap */
```

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
sm:   640px and up
md:   768px and up
lg:   1024px and up
xl:   1280px and up
2xl:  1536px and up

/* Usage */
<div className="w-full md:w-1/2 lg:w-1/3">
```

## 🧪 Testing Patterns

### Component Test
```jsx
// src/components/__tests__/ComponentName.test.jsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ComponentName from '../ComponentName';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key })
}));

describe('ComponentName', () => {
  test('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

## 🗂️ File Locations Quick Map

```
📁 Key Directories:
├── src/components/          → UI Components
├── src/pages/              → Route Components  
├── src/hooks/              → Custom Hooks
├── src/lib/                → Core Utils & Config
├── src/locales/            → Translations (pt.json, en.json)
├── src/utils/              → Helper Functions
├── api/                    → Serverless Functions
└── docs/                   → Documentation

🔧 Configuration:
├── vite.config.js          → Build Config
├── tailwind.config.js      → Styling System
├── vitest.config.js        → Testing Setup
└── CLAUDE.md               → AI Development Guide

📊 Reports & Analysis:
├── SEO_AUDIT_REPORT.md     → SEO Analysis
├── TEST_REPORT.md          → Testing Coverage
├── performance-test.md     → Performance Metrics
└── accessibility-report.md → WCAG Compliance
```

## 🔧 Environment Variables

```env
# Required for development
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
VITE_GOOGLE_PLACE_ID=your_place_id  
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Debug endpoint
GET /api/env-debug          → Check environment status
```

## 🚀 Deployment Quick Check

```bash
# Pre-deployment checklist
npm run build               # ✅ Build succeeds
npm run test:run           # ✅ All tests pass
npm run test:coverage      # ✅ Coverage >80%

# Production verification
npm run preview            # ✅ Preview works
curl -I https://site.com   # ✅ SSL certificate valid
lighthouse --view          # ✅ Scores >90
```

## 🎯 Common Code Patterns

### Loading States
```jsx
const [loading, setLoading] = useState(false);

if (loading) {
  return <div className="animate-pulse">Loading...</div>;
}
```

### Error Boundaries
```jsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary>
  <Component />
</ErrorBoundary>
```

### Form Validation
```jsx
import { useFormValidation } from '@/hooks/useFormValidation';

const { errors, validate } = useFormValidation();
```

## 🔗 Important Links

- [🏠 **Main README**](./README.md) - Project overview
- [📚 **Documentation Index**](./PROJECT_DOCUMENTATION_INDEX.md) - Complete docs
- [🏗️ **Architecture Guide**](./docs/SYSTEM_ARCHITECTURE.md) - Technical architecture  
- [🎨 **Design System**](./docs/COMPONENT_DESIGN_SYSTEM.md) - UI guidelines
- [🧪 **Testing Guide**](./docs/TESTING_GUIDE.md) - Testing strategies
- [🤖 **Claude Guide**](./CLAUDE.md) - AI development assistance

## 📞 Need Help?

1. **Documentation**: Check `/docs` directory for detailed guides
2. **Code Examples**: Look at existing components for patterns
3. **Testing**: Run `npm run test:coverage` to see what needs tests
4. **Performance**: Use Lighthouse for performance auditing
5. **Accessibility**: Check against WCAG 2.1 AA standards

---

*This quick reference is designed for developers familiar with React/Vite. For detailed information, consult the full documentation.*