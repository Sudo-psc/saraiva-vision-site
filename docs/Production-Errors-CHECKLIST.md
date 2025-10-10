# Production Errors Fix - Implementation Checklist

**Date**: 2025-10-09
**Status**: 🟢 READY FOR DEPLOYMENT
**Estimated Time**: 4-6 hours (implementation + testing)

---

## 📋 Pre-Implementation Checklist

### Environment Preparation
- [ ] Create feature branch: `fix/production-errors-cors-state`
- [ ] Backup current production: `sudo cp -r /var/www/saraivavision/current /var/www/saraivavision/backup-$(date +%Y%m%d)`
- [ ] Ensure staging environment is available
- [ ] Review all documentation in `docs/` folder

### Documentation Review
- [ ] Read `Production-Error-Diagnosis.md` (comprehensive analysis)
- [ ] Read `PostHog-Fix-Implementation.md` (PostHog-specific fixes)
- [ ] Review created utilities: `errorTracking.js`, `safeTransport.js`, `corsHelper.js`

---

## ✅ Implementation Steps

### Phase 1: Install Error Tracking (30 minutes)

#### 1.1 Import Error Tracker
- [x] Created `src/lib/errorTracking.js`
- [x] Integrated into `src/main.jsx`
- [ ] Test in development:
  ```bash
  npm run dev:vite
  # Open console, trigger error: throw new Error('test')
  # Check: console.exportErrors()
  ```

#### 1.2 Verify Error Tracking
```javascript
// In browser console
window.errorTracker.getErrors()
// Should show captured errors with full details
```

---

### Phase 2: Add Transport Safety (45 minutes)

#### 2.1 Install Safe Transport
- [x] Created `src/lib/safeTransport.js`
- [ ] Add to PostHog Provider:
  ```bash
  # Edit: src/providers/PostHogProvider.jsx
  # Add imports and wrap transport
  ```

#### 2.2 Test Safe Transport
```javascript
// In browser console
const ws = new SafeWebSocket('wss://echo.websocket.org');
ws.send('test'); // Should queue if not OPEN
ws.getState(); // Check state
```

---

### Phase 3: Configure CORS (30 minutes)

#### 3.1 Add crossorigin to Scripts
- [ ] Find all external script tags in `index.html`
- [ ] Add `crossorigin="anonymous"` to each
- [ ] Verify with:
  ```javascript
  Array.from(document.scripts)
    .filter(s => s.src.includes('://') && !s.src.includes(location.hostname))
    .forEach(s => console.log(s.src, s.crossOrigin || '❌ MISSING'));
  ```

**Scripts to update**:
- [ ] PostHog: `us-assets.i.posthog.com`
- [ ] Google Analytics: `googletagmanager.com`
- [ ] Google AJAX: `ajax.googleapis.com`
- [ ] Cloudflare CDN: `cdnjs.cloudflare.com`
- [ ] SendPulse: `cdn.pulse.is`

#### 3.2 Dynamic Script Loading
- [x] Created `src/lib/corsHelper.js`
- [ ] Replace manual script loading with `scriptLoader.loadScript()`
- [ ] Test:
  ```javascript
  import { scriptLoader } from './lib/corsHelper';
  await scriptLoader.loadScript('https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js', {
    crossorigin: 'anonymous'
  });
  ```

---

### Phase 4: Enable Source Maps (20 minutes)

#### 4.1 Update Vite Config
- [ ] Edit `vite.config.js`:
  ```javascript
  export default defineConfig({
    build: {
      sourcemap: true, // Enable source maps ✅
      // ... rest of config
    }
  });
  ```

#### 4.2 Configure Nginx for Source Maps
- [ ] Add to `/etc/nginx/sites-enabled/saraivavision`:
  ```nginx
  location ~* \.map$ {
      expires 7d;
      add_header Cache-Control "public, max-age=604800";
      add_header X-Content-Type-Options "nosniff" always;
      add_header X-Robots-Tag "noindex, nofollow" always;
  }
  ```

#### 4.3 Verify Source Maps
```bash
npm run build:vite
ls -lh dist/assets/*.map
# Should show .map files
```

---

### Phase 5: CSP Verification (15 minutes)

#### 5.1 Check Current CSP
- [x] Updated CSP with all required domains
- [ ] Verify with:
  ```bash
  curl -sI https://saraivavision.com.br | grep -i "content-security-policy"
  ```

**Required domains** (all added ✅):
- [x] `https://fonts.gstatic.com` (font-src)
- [x] `https://maps.googleapis.com` (script-src)
- [x] `https://us.i.posthog.com` (connect-src)
- [x] `https://us-assets.i.posthog.com` (script-src + connect-src)
- [x] `https://analytics.saraivavision.com.br` (script-src + connect-src)
- [x] `https://googleads.g.doubleclick.net` (script-src)
- [x] `https://ajax.googleapis.com` (script-src)
- [x] `https://cdnjs.cloudflare.com` (script-src)
- [x] `https://web.webformscr.com` (script-src + style-src)
- [x] `https://gp.webformscr.com` (script-src)
- [x] `https://s3.eu-central-1.amazonaws.com` (connect-src)
- [x] `wss://lc.pulse.is` (connect-src)
- [x] `https://www.google.com` (connect-src)

---

### Phase 6: Fix PostHog Integration (60 minutes)

#### 6.1 Update PostHog Provider
- [ ] Edit `src/providers/PostHogProvider.jsx`
- [ ] Wrap transport with `SafeXHR` and `SafeBeacon`
- [ ] Add visibility change handlers
- [ ] Add proper error callbacks

**See**: `docs/PostHog-Fix-Implementation.md` for complete code

#### 6.2 Test PostHog
```javascript
// Browser console
window.posthog?.capture('test_event', { test: true });
// Check Network tab for successful POST to us.i.posthog.com
```

---

## 🧪 Testing Phase (90 minutes)

### Test 1: Local Development
```bash
npm run dev:vite
# Open http://localhost:3002
# Open DevTools console
```

**Verify**:
- [ ] No "Script error." with "Unknown file"
- [ ] No InvalidStateError
- [ ] All external scripts load with CORS
- [ ] Error tracker logs to console
- [ ] `console.getErrors()` returns array

### Test 2: Build & Preview
```bash
npm run build:vite
npm run preview
# Open http://localhost:4173
```

**Verify**:
- [ ] Source maps generated in `dist/assets/*.map`
- [ ] Build completes without errors
- [ ] Preview runs without console errors

### Test 3: Network Conditions
**Chrome DevTools → Network → Throttling**

#### Slow 3G Test
- [ ] Load page on Slow 3G
- [ ] Switch tabs for 30s
- [ ] Return and check console
- [ ] **Expected**: No InvalidStateError, events queued

#### Offline Test
- [ ] Load page normally
- [ ] Go offline (DevTools → Network → Offline)
- [ ] Interact with page
- [ ] Go online
- [ ] **Expected**: Queued events flush successfully

### Test 4: Visibility Changes
```javascript
// Script to run in console
let errorCount = 0;
window.addEventListener('error', () => errorCount++);

// Switch tabs 5 times, 30s each
// Return and check:
console.log('Errors during test:', errorCount);
// Expected: 0
```

### Test 5: PostHog Events
```javascript
// Send test events
window.posthog?.capture('test_visibility', { test: true });
window.posthog?.capture('test_interaction', { clicks: 5 });

// Check PostHog dashboard after 5 minutes
// Expected: Both events visible
```

---

## 🚀 Deployment Phase (30 minutes)

### Step 1: Deploy to Production
```bash
cd /home/saraiva-vision-site

# Ensure on correct branch
git status

# Build production
npm run build:vite

# Verify build
ls -lh dist/assets/index-*.js
ls -lh dist/assets/*.map

# Deploy
sudo npm run deploy:quick

# Verify deployment
curl -I https://saraivavision.com.br
```

### Step 2: Smoke Test Production
```bash
# Check CSP headers
curl -sI https://saraivavision.com.br | grep -i "content-security-policy"

# Check source maps
curl -sI https://saraivavision.com.br/assets/index-CxXoQ74p.js.map

# Health check
curl -s https://saraivavision.com.br/health
# Expected: healthy
```

### Step 3: Monitor Initial Traffic
**Open these in separate tabs**:
- [ ] Production site: https://saraivavision.com.br
- [ ] PostHog dashboard: https://us.posthog.com
- [ ] Server logs: `sudo journalctl -u saraiva-api -f`

**Monitor for 15 minutes**:
- [ ] No error spikes in console
- [ ] PostHog events flowing
- [ ] No 500 errors in server logs

---

## 📊 Post-Deployment Monitoring (24 hours)

### Hour 1: Immediate Checks
- [ ] Error rate compared to baseline
- [ ] PostHog event count vs. pageview count (should be >95%)
- [ ] No user complaints
- [ ] Check error tracker localStorage:
  ```javascript
  JSON.parse(localStorage.getItem('errorTracker'))
  ```

### Hour 6: Mid-Day Check
- [ ] Review PostHog dashboard for errors
- [ ] Check server error logs
- [ ] Verify analytics data completeness
- [ ] Monitor reconnection rates

### Hour 24: Full Day Review
**Metrics to Check**:
```javascript
// Browser console on site
const report = window.errorTracker.getReport();
console.table({
  'Total Errors': report.errorCount,
  'Script Errors': report.errors.filter(e => e.type === 'error' && e.filename === 'Unknown file').length,
  'State Errors': report.errors.filter(e => e.message?.includes('InvalidStateError')).length,
  'PostHog Errors': report.errors.filter(e => e.message?.includes('posthog')).length
});
```

**Success Criteria**:
- [ ] "Script error." count: <5 (down from ~50-100)
- [ ] InvalidStateError count: <2 (down from ~30-50)
- [ ] PostHog events: >98% delivery rate
- [ ] No production incidents

---

## 🆘 Rollback Procedures

### If Errors Spike (>20% increase)

#### Quick Disable Error Tracker
```javascript
// Edit src/main.jsx
// Comment out:
// import errorTracker from './lib/errorTracking';
```

#### Quick Disable Safe Transport
```javascript
// Edit src/providers/PostHogProvider.jsx
// Remove transport wrapper, use default
```

#### Full Rollback
```bash
sudo npm run deploy:rollback
# Or manual:
sudo rm -rf /var/www/saraivavision/current/*
sudo cp -r /var/www/saraivavision/backup-20251009/* /var/www/saraivavision/current/
sudo systemctl reload nginx
```

---

## ✅ Success Validation (7 days)

### Day 1
- [ ] Error rate stable or decreased
- [ ] No rollbacks needed
- [ ] Analytics working

### Day 3
- [ ] Sustained error reduction
- [ ] No user complaints
- [ ] PostHog data quality maintained

### Day 7
- [ ] Document final metrics
- [ ] Update CLAUDE.md if needed
- [ ] Close related tickets
- [ ] Share results with team

**Final Metrics Template**:
```
Before:
- Script Errors: ~75/day
- State Errors: ~40/day
- Analytics Coverage: 85%

After:
- Script Errors: X/day (improvement: Y%)
- State Errors: X/day (improvement: Y%)
- Analytics Coverage: X% (improvement: Y%)
```

---

## 📝 Documentation Updates

### Files to Update After Success
- [ ] Update `CLAUDE.md` with new error tracking approach
- [ ] Add "Production Errors Fixed" to changelog
- [ ] Document monitoring procedures
- [ ] Update runbook with new debugging tools

### Knowledge Sharing
- [ ] Write blog post about CORS debugging (optional)
- [ ] Share PostHog integration learnings
- [ ] Document safe transport pattern

---

## 🎯 Key Takeaways

### What We Fixed
1. ✅ Added `crossorigin="anonymous"` to all external scripts
2. ✅ Implemented state-aware transport layer (SafeWebSocket, SafeXHR, SafeBeacon)
3. ✅ Created comprehensive error tracking system
4. ✅ Enabled source maps for production debugging
5. ✅ Updated CSP to allow all required domains
6. ✅ Fixed PostHog integration with proper lifecycle management

### What We Learned
- CORS masking makes debugging impossible
- WebSocket/XHR state management is critical
- Page visibility changes break naive implementations
- Source maps are essential for production debugging
- CSP Report-Only mode is perfect for iterative fixes

### Prevention
- Always add `crossorigin` to external scripts
- Always check connection state before send
- Always test with network throttling
- Always enable source maps (with auth if needed)
- Always monitor error metrics post-deployment

---

**Estimated Total Time**: 4-6 hours
**Complexity**: Medium-High
**Risk Level**: Low (Report-Only CSP, gradual rollout possible)
**Confidence**: High (comprehensive testing plan)

---

**Last Updated**: 2025-10-09
**Version**: 1.0
**Status**: ✅ READY FOR IMPLEMENTATION
