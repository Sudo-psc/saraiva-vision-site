# 🔐 CORS Configuration - Complete Guide

## 📋 Executive Summary

**Problem**: Frontend (`http://localhost:3002`) blocked from accessing backend API (`http://localhost:3001/api/google-reviews`) due to CORS policy.

**Root Cause**: Duplicate CORS headers causing conflict between Express middleware and route handlers.

**Solution**: Removed manual CORS headers from route handlers, using centralized Express middleware configuration.

**Status**: ✅ **Fixed and Tested**

---

## 🎯 Quick Start

### 1. Test with Automated Script
```bash
cd /Users/philipecruz/saraiva-vision-site-1/api
./test-cors-fix.sh
```

### 2. Test with Browser UI
```bash
# 1. Start backend
cd api && npm run dev

# 2. Open in browser (must be at localhost:3002)
open http://localhost:3002/api/test-cors-browser.html

# 3. Click "Run All Tests" buttons
```

### 3. Quick Manual Test
```bash
# Preflight test
curl -i -X OPTIONS \
  -H "Origin: http://localhost:3002" \
  -H "Access-Control-Request-Method: GET" \
  http://localhost:3001/api/google-reviews

# Expected: HTTP/1.1 204 + CORS headers
```

---

## 📂 Documentation Structure

### 🚀 Getting Started
- **[QUICK_START_CORS.md](QUICK_START_CORS.md)** - 5-minute quick start guide with visual examples
- **[CORS_FIX_SUMMARY.md](CORS_FIX_SUMMARY.md)** - Executive summary of changes

### 📖 In-Depth Guides
- **[docs/CORS_TROUBLESHOOTING.md](docs/CORS_TROUBLESHOOTING.md)** - Complete troubleshooting guide with error patterns
- **[docs/CORS_EXAMPLES.md](docs/CORS_EXAMPLES.md)** - Multi-framework examples (Express, NestJS, Fastify, Next.js, Nginx)
- **[docs/CORS_FLOW_DIAGRAM.md](docs/CORS_FLOW_DIAGRAM.md)** - Visual diagrams of request/response flow

### 🧪 Testing Tools
- **[api/test-cors-fix.sh](api/test-cors-fix.sh)** - Automated command-line test script
- **[api/test-cors-browser.html](api/test-cors-browser.html)** - Interactive browser-based testing UI

---

## 🔧 What Was Changed?

### Files Modified

#### 1. ✅ `api/google-reviews.js`
**Before** (❌ Conflict):
```javascript
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');  // ❌ Duplicate!
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // ...
}
```

**After** (✅ Fixed):
```javascript
export default async function handler(req, res) {
    // CORS handled by Express middleware in server.js
    if (req.method === 'OPTIONS') {
        return res.status(204).end();  // Preflight response
    }
    // ...
}
```

#### 2. ✅ `api/src/server.js`
- ✅ CORS middleware already configured correctly
- ✅ Includes `http://localhost:3002` in allowed origins
- ✅ Updated `createExpressAdapter` to support async handlers
- ✅ Proper middleware order maintained

**Existing configuration** (was already correct):
```javascript
app.use(cors({
  origin: [
    'https://saraivavision.com.br',
    'https://www.saraivavision.com.br',
    'http://localhost:3000',
    'http://localhost:3002',  // ✅ Already included
    'http://localhost:3003'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));
```

---

## ✅ Testing Checklist

Before deploying, verify all items are checked:

### Prerequisites
- [ ] Backend running on `http://localhost:3001`
- [ ] Frontend accessing from `http://localhost:3002`
- [ ] No console errors about CORS policy

### Automated Tests
- [ ] Run `./api/test-cors-fix.sh` - All checks pass
- [ ] Open `test-cors-browser.html` - All tests green

### Manual Verification
- [ ] Preflight (OPTIONS) returns 204 with CORS headers
- [ ] GET request returns data with CORS headers
- [ ] Browser DevTools Network tab shows `Access-Control-Allow-Origin`
- [ ] Console has no "blocked by CORS policy" errors

### Visual Verification (DevTools)
1. Open DevTools (F12)
2. Go to Network tab
3. Make fetch request
4. Click on `google-reviews` request
5. Check Headers tab
6. Verify Response Headers include:
   - ✅ `Access-Control-Allow-Origin: http://localhost:3002`
   - ✅ `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
   - ✅ `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`
   - ✅ `Access-Control-Allow-Credentials: true`

---

## 🚀 Deployment

### Development
```bash
# Backend
cd api
npm run dev  # Runs on port 3001

# Frontend (separate terminal)
cd ..
npm run dev  # Runs on port 3002
```

### Production
```bash
# Build
npm run build

# Deploy
npm run deploy  # Full deploy
# OR
npm run deploy:quick  # Frontend-only (90% of cases)
```

### Nginx Configuration (if applicable)

If using Nginx as reverse proxy, **choose ONE**:

**Option A: Use Express CORS** (current setup)
- ✅ Keep Express middleware
- ❌ No CORS in Nginx

**Option B: Use Nginx CORS** (alternative)
- ❌ Remove Express middleware
- ✅ Add CORS in Nginx config (see [CORS_EXAMPLES.md](docs/CORS_EXAMPLES.md#nginx-reverse-proxy))

**⚠️ Never configure CORS in both places** - causes conflicts!

---

## 🔍 Troubleshooting

### Problem: Still seeing CORS errors

**Diagnostic steps**:
```bash
# 1. Verify backend is running
curl http://localhost:3001/health
# Expected: {"status":"healthy"}

# 2. Check CORS headers
curl -I -H "Origin: http://localhost:3002" \
  http://localhost:3001/api/google-reviews
# Look for: Access-Control-Allow-Origin

# 3. Verify frontend origin
# Must be http://localhost:3002 (not 3000, not 3003)
```

**Solutions**:
1. Restart backend: `npm run dev`
2. Clear browser cache: Ctrl+Shift+Delete
3. Test in incognito/private window
4. Check middleware order in `server.js`

### Problem: Preflight returns 401/404

**Cause**: Authentication middleware blocking OPTIONS

**Solution**: Ensure CORS comes BEFORE auth in `server.js`:
```javascript
app.use(cors({...}));     // 1. CORS first
app.use(express.json());  // 2. Body parser
app.use(authMiddleware);  // 3. Auth AFTER CORS
```

### Problem: 500 Internal Server Error

**Not a CORS issue** - this is an API error.

Check:
- Environment variables (`.env.local`)
- Google Places API key configured
- Backend logs for stack trace

---

## 📚 Additional Resources

### Framework-Specific Examples
See [CORS_EXAMPLES.md](docs/CORS_EXAMPLES.md) for:
- ✅ Node.js/Express (current stack)
- NestJS
- Fastify
- Next.js API Routes
- Nginx reverse proxy
- Vite/Webpack dev proxy

### Visual Guides
- [CORS_FLOW_DIAGRAM.md](docs/CORS_FLOW_DIAGRAM.md) - Request/response flow diagrams
- [QUICK_START_CORS.md](QUICK_START_CORS.md) - Step-by-step visual guide

### Troubleshooting
- [CORS_TROUBLESHOOTING.md](docs/CORS_TROUBLESHOOTING.md) - Common errors and solutions

---

## 🎓 Learning Resources

### How CORS Works
1. Browser detects cross-origin request
2. Sends preflight OPTIONS request first
3. Backend responds with CORS headers
4. Browser validates headers
5. If valid, sends actual request
6. Backend responds with data + CORS headers
7. Browser allows frontend to access data

### Key Concepts
- **Preflight**: OPTIONS request sent before actual request
- **Origin**: Protocol + domain + port (e.g., `http://localhost:3002`)
- **Credentials**: Cookies/auth headers (requires explicit origin, not `*`)
- **Simple requests**: Some requests skip preflight (GET/POST with basic headers)

### Security Best Practices
- ✅ Use explicit origins in production (not `*`)
- ✅ Set `credentials: true` only if using cookies/auth
- ✅ List only required methods and headers
- ✅ Cache preflight with `maxAge` (e.g., 24 hours)
- ❌ Never use `origin: '*'` with `credentials: true`
- ❌ Don't configure CORS in multiple places

---

## 🆘 Support

### Need Help?

1. **Run diagnostics**:
   ```bash
   ./api/test-cors-fix.sh
   ```

2. **Capture evidence**:
   - Screenshot of DevTools Network tab (Headers section)
   - Console errors (full text)
   - Backend logs (`npm run dev` output)

3. **Check versions**:
   ```bash
   node --version
   npm list cors express
   ```

4. **Review documentation**:
   - [CORS_TROUBLESHOOTING.md](docs/CORS_TROUBLESHOOTING.md) - Common errors
   - [CORS_EXAMPLES.md](docs/CORS_EXAMPLES.md) - Code examples
   - [QUICK_START_CORS.md](QUICK_START_CORS.md) - Quick fixes

---

## ✅ Success Criteria

CORS is correctly configured when:
- ✅ No console errors about "blocked by CORS policy"
- ✅ DevTools Network tab shows `Access-Control-Allow-Origin` header
- ✅ Preflight (OPTIONS) returns 204/200 with CORS headers
- ✅ GET/POST requests succeed and return data
- ✅ `test-cors-fix.sh` script passes all checks
- ✅ Browser UI tests all show green checkmarks

---

## 📊 File Overview

```
/Users/philipecruz/saraiva-vision-site-1/
├── CORS_README.md                      # This file - main documentation
├── CORS_FIX_SUMMARY.md                 # Executive summary
├── QUICK_START_CORS.md                 # 5-min quick start
│
├── docs/
│   ├── CORS_TROUBLESHOOTING.md         # Detailed troubleshooting
│   ├── CORS_EXAMPLES.md                # Multi-framework examples
│   └── CORS_FLOW_DIAGRAM.md            # Visual diagrams
│
├── api/
│   ├── test-cors-fix.sh                # CLI test script
│   ├── test-cors-browser.html          # Browser UI test
│   ├── src/server.js                   # Express server (CORS config here)
│   └── google-reviews.js               # Route handler (no CORS here)
│
└── ... (rest of project)
```

---

**Last Updated**: 2025-10-06
**Status**: ✅ Fixed and Documented
**Breaking Changes**: None
**Time to Fix**: ~15 minutes
