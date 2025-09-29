# Secret Exposure Fix - Status Report

**Date**: 2025-09-29
**Session**: v2.0.1 Security Hardening (Sprint 1 & 2)
**Critical Issue**: API keys exposed in production builds

---

## 🚨 Root Cause Analysis

### The Fundamental Problem
**Vite inlines ALL `import.meta.env` accesses at build time**, regardless of:
- Conditional branches (`if (import.meta.env.PROD)` blocks)
- Dead code elimination
- Tree-shaking optimizations

**Example**:
```javascript
// ❌ BAD - Vite inlines the value even in this "safe" code:
if (import.meta.env.PROD) {
  return ''; // This returns empty
} else {
  return import.meta.env.VITE_API_KEY; // ← Vite STILL inlines this!
}
```

**Minified Result**: `function U(){const e=E("AIzaSyDvio5w5mQVZWZGBnPrys1uTwTQBglmFms")}`

---

## 📊 Current Status (Build 6)

### Secrets Still Exposed
- ✅ **Supabase service role key**: REMOVED (from `src/lib/supabase.ts`)
- ⚠️ **Supabase anon key**: 1 occurrence in `supabaseClient-*.js` (legacy file)
- ⚠️ **Google Maps API key**: 1 occurrence in `GoogleMapSimple-*.js`

### Files Fixed So Far
1. ✅ `src/config/runtime-env.js` - Removed DEV mode `import.meta.env` accesses
2. ✅ `src/lib/supabase.ts` - Replaced inline service role key with empty string
3. ✅ `src/lib/googleMapsKey.js` - Returns empty in production
4. ✅ `src/hooks/useGoogleMaps.ts` - Uses async `getEnvConfig()`
5. ✅ `src/config/env.ts` - Made API key optional
6. ✅ `src/components/GoogleMapsDebugger.jsx` - Async loading
7. ✅ `.env.production` - Explicit empty string overrides
8. ⚠️ `src/lib/supabaseClient.ts` - Legacy file still has inline accesses (partially fixed)

### Remaining Issues
1. **`src/lib/supabaseClient.ts`** (line 37-38):
   ```typescript
   const supabaseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_SUPABASE_URL || '');
   const supabaseAnonKey = import.meta.env.PROD ? '' : (import.meta.env.VITE_SUPABASE_ANON_KEY || '');
   ```
   **Problem**: Even though wrapped in ternary, Vite inlines the `VITE_SUPABASE_ANON_KEY` value.

2. **`src/lib/googleMapsKey.js`** (line 24):
   ```javascript
   const key = normalizeKey(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
   ```
   **Problem**: Accessed in DEV branch but still inlined by Vite.

---

## ✅ Solution Strategy

### The ONLY Working Solution
**Remove ALL `import.meta.env.VITE_*` accesses from ANY file that gets bundled for production.**

### Implementation Plan

#### 1. Replace Legacy Files
- **DELETE** or deprecate `src/lib/supabaseClient.ts` (legacy)
- **USE** `src/lib/supabase.ts` with `getEnvConfig()` everywhere
- **DELETE** `src/lib/googleMapsKey.js` entirely
- **USE** `src/config/runtime-env.js` directly

#### 2. Update All Imports
```javascript
// ❌ OLD (exposes secrets)
import { getBuildTimeGoogleMapsKey } from './googleMapsKey.js'
const key = getBuildTimeGoogleMapsKey();

// ✅ NEW (runtime loading only)
import { getEnvConfig } from '@/config/runtime-env'
const config = await getEnvConfig();
const key = config.googleMapsApiKey;
```

#### 3. API Endpoint Configuration
The `/api/config` endpoint is already created and working:
- ✅ Rate limited (30 requests per 15 minutes)
- ✅ Returns all public keys from server-side env
- ✅ Caches responses (300s max-age)

---

## 🔧 Next Steps (Priority Order)

### CRITICAL (Must Do Before Deploy)
1. **Remove `googleMapsKey.js` completely** - Source of Google Maps key exposure
2. **Replace `supabaseClient.ts` with runtime loading** - Source of Supabase key exposure
3. **Update all imports** to use `getEnvConfig()` directly
4. **Rebuild and verify 0 secrets**: `grep -r "AIzaSy\|eyJhbGci" dist/assets/*.js | wc -l` should return 0
5. **Rotate ALL exposed keys**:
   - Google Maps API key: `AIzaSyDvio5w5mQVZWZGBnPrys1uTwTQBglmFms`
   - Supabase anon key (already exposed in previous builds)
   - Follow `/docs/API_KEY_ROTATION_GUIDE.md`

### HIGH PRIORITY (Deploy Blockers)
6. Fix bundle size warnings (vendor-misc: 479KB → 250KB target)
7. Fix dynamic import conflicts (WordPress modules)

### MEDIUM PRIORITY (Post-Deploy)
8. Complete Contact.jsx refactoring (already planned)
9. Monitor production for runtime config loading issues

---

## 📝 Verification Commands

```bash
# Build production
npm run build

# Check for ANY API key exposure (should return 0)
grep -r "AIzaSy" dist/assets/*.js 2>/dev/null | wc -l
grep -r "eyJhbGci" dist/assets/*.js 2>/dev/null | wc -l

# Find exact locations if any found
grep -n "AIzaSy" dist/assets/*.js 2>/dev/null
grep -n "eyJhbGci" dist/assets/*.js 2>/dev/null
```

---

## 🎯 Success Criteria

✅ **Security Goals**:
- [ ] 0 Google Maps API keys in production bundles
- [ ] 0 Supabase keys in production bundles
- [ ] All keys served only via `/api/config` endpoint
- [ ] Keys rotated after exposure

✅ **Functionality Goals**:
- [ ] Google Maps loads correctly with runtime config
- [ ] Supabase authentication works with runtime config
- [ ] No performance degradation from async loading

---

## 💡 Lessons Learned

1. **Vite Environment Variable Inlining**: ANY `import.meta.env` access gets inlined, even in dead code
2. **Build-Time vs Runtime**: Separation must be ABSOLUTE - no hybrid approaches
3. **Legacy Code Cleanup**: Multiple implementations of same feature (2 supabase clients) caused issues
4. **Environment File Loading**: Vite loads `.env` THEN `.env.production`, requiring explicit overrides

---

## 📚 Related Documentation

- `/docs/API_KEY_ROTATION_GUIDE.md` - Key rotation procedures
- `/.env.production` - Production environment configuration
- `/api/config.js` - Runtime configuration endpoint
- `/src/config/runtime-env.js` - Client-side runtime loader