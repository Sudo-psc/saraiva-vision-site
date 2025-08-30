# Performance Testing Guide

## Cache Disabling for Testing

### Browser DevTools
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Check "Disable cache" checkbox
4. Keep DevTools open during testing

### Firefox DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Click gear icon
4. Check "Disable HTTP cache"

### Testing Commands

```bash
# Build production version
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run build && npx vite-bundle-analyzer dist
```

## Bundle Analysis

### Expected Chunk Structure
- `vendor-react`: React/ReactDOM (~130-150KB)
- `vendor-motion`: Framer Motion (~80-100KB)
- `vendor-i18n`: i18next libraries (~40-60KB)
- `vendor-ui`: Lucide React icons (~20-30KB)
- `vendor-db`: Supabase client (~50-70KB)
- `components-main`: Hero, Services, About (~30-50KB)
- `components-contact`: Contact forms, maps (~20-40KB)
- `components-secondary`: Service details, episodes (~15-30KB)
- `app-utils`: Utilities and helpers (~10-20KB)
- `app-i18n`: Translation files (~5-15KB)

### Performance Targets
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms
- Total bundle size: < 1MB compressed

## Measuring Performance

### Lighthouse
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run performance audit
lighthouse http://localhost:4173 --output=json --output-path=./lighthouse-report.json
```

### Bundle Analyzer
```bash
# Analyze production bundle
npx vite-bundle-analyzer dist
```

### Load Testing
```bash
# Test with different network conditions
# Slow 3G: 400kbps, 400ms RTT
# Fast 3G: 1.6Mbps, 150ms RTT
# 4G: 9Mbps, 170ms RTT
```