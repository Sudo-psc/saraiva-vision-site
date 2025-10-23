# Planos Flex - Critical Fixes Required

**Status:** 🔴 ACTION REQUIRED
**Priority:** CRITICAL
**Estimated Time:** 5 minutes

---

## Critical Issue: Missing ArrowRight Import

### File Location
```
/home/saraiva-vision-site/src/modules/payments/pages/PlanosFlexPage.jsx
```

### Current Code (Line 6)
```jsx
import { ArrowLeft, Package, CheckCircle } from 'lucide-react';
```

### Error Location (Line 176)
```jsx
<Link
  to="/planosonline"
  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
>
  Ver Planos Online
  <ArrowRight className="w-4 h-4" />  {/* ❌ ArrowRight not imported! */}
</Link>
```

### Fixed Code
```jsx
import { ArrowLeft, Package, CheckCircle, ArrowRight } from 'lucide-react';
```

### Impact if Not Fixed
- ✅ Build will succeed (no TypeScript error)
- ❌ Runtime error when user clicks "Ver Planos Online" CTA
- ❌ React error boundary will trigger
- ❌ Page may crash or show error screen
- ❌ Poor user experience

### How to Fix
```bash
# 1. Open the file
nano /home/saraiva-vision-site/src/modules/payments/pages/PlanosFlexPage.jsx

# 2. Update line 6 to:
import { ArrowLeft, Package, CheckCircle, ArrowRight } from 'lucide-react';

# 3. Save and test
npm run build:vite
npm run test:frontend
```

### Verification Steps
1. Build completes without warnings
2. Navigate to `/planosflex` in browser
3. Scroll to bottom CTA section
4. Click "Ver Planos Online" button
5. Verify no console errors
6. Arrow icon displays correctly

---

## High Priority: Focus States for Accessibility

### Issue
No visible focus indicators for keyboard navigation (WCAG 2.1 Level A requirement)

### Example Fix

**Before:**
```jsx
<Link
  to="/planosflex"
  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
>
```

**After:**
```jsx
<Link
  to="/planosflex"
  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 focus-visible:outline-none"
>
```

### Apply to All Interactive Elements
- All `<Link>` components
- All `<button>` elements
- All clickable cards

---

## Test Commands

### Build Test
```bash
cd /home/saraiva-vision-site
npm run build:vite
```

### Frontend Component Test
```bash
npm run test:frontend -- PlanosFlexPage
```

### Visual Regression Test
```bash
# Open in browser
npm run dev:vite
# Navigate to: http://localhost:3002/planosflex
```

### Accessibility Test
```bash
# Use keyboard navigation
# Tab through all interactive elements
# Verify focus indicators are visible
```

---

## Deployment Checklist

- [ ] Fix ArrowRight import
- [ ] Build succeeds without warnings
- [ ] Test in browser (Chrome, Safari, Firefox)
- [ ] Test keyboard navigation
- [ ] Test on mobile device
- [ ] Deploy to production
- [ ] Monitor error logs for 24 hours

---

**Created:** 2025-10-23
**Last Updated:** 2025-10-23
