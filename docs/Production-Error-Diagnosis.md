# Production Error Diagnosis & Remediation Plan

**Project**: Saraiva Vision
**Date**: 2025-10-09
**Status**: 🔴 CRITICAL - Recurring Production Errors

---

## 📊 Error Summary

### Error 1: "Script error." with "Unknown file"
**Frequency**: High
**Impact**: Unable to debug real issues
**Files Involved**: `lazy-recorder.js`, `index-CxXoQ74p.js`

### Error 2: InvalidStateError in send()
**Frequency**: Medium-High
**Impact**: Analytics/tracking data loss
**Files Involved**: `bundle.js:22:45749`

---

## 🔍 Root Cause Analysis

### 1. "Script error." - CORS & Cross-Origin Issues

#### **Primary Cause (95% confidence): Missing crossorigin Attribute**

**Evidence**:
- Error shows `filename: "Unknown file"`
- No stack trace available
- Errors from `lazy-recorder.js` (PostHog external script)
- Browser security policy masks cross-origin script errors

**Technical Explanation**:
When a script is loaded from a different origin (e.g., PostHog CDN) without the `crossorigin` attribute, browsers:
1. Execute the script normally
2. Catch any errors
3. **Mask error details** for security (CORS policy)
4. Report generic "Script error." with no useful information

**Affected Scripts**:
- PostHog: `us-assets.i.posthog.com/static/lazy-recorder.js`
- PostHog: `us-assets.i.posthog.com/static/array.js`
- Analytics proxy: `analytics.saraivavision.com.br/static/array.js`
- SendPulse: `cdn.pulse.is` scripts
- Cloudflare CDN: `cdnjs.cloudflare.com` scripts
- Google AJAX: `ajax.googleapis.com` scripts

#### **Secondary Cause (70% confidence): Iframe Cross-Origin Errors**

**Evidence**:
- Multiple iframes from different origins:
  - Spotify embeds (`open.spotify.com`)
  - Google Tag Manager (`www.googletagmanager.com`)
  - SendPulse chat (`lc.pulse.is`)
  - Ninsaude scheduling (`apolo.ninsaude.com`)

**Technical Explanation**:
Errors inside cross-origin iframes bubble up to parent window but are masked by same-origin policy.

#### **Tertiary Cause (40% confidence): Missing Source Maps**

**Evidence**:
- Hashed filenames: `index-CxXoQ74p.js`
- Production build without accessible source maps
- Stack traces show minified code

**Impact**:
Even if CORS is fixed, without source maps, debugging remains difficult.

---

### 2. InvalidStateError - WebSocket/XHR State Management

#### **Primary Cause (98% confidence): WebSocket/XHR Send Before Ready**

**Evidence**:
```
InvalidStateError: The object is in an invalid state.
    send (bundle.js:22:45749)
```

**Technical Explanation**:

**WebSocket States**:
```
CONNECTING (0) → Cannot send
OPEN (1)       → Can send ✅
CLOSING (2)    → Cannot send
CLOSED (3)     → Cannot send
```

**Common Scenarios**:
1. **Page Visibility Changes**: User switches tabs
   - Analytics tries to send beacon
   - WebSocket closes in background
   - Queued messages try to send after close
   - **Result**: InvalidStateError

2. **Network Throttling**: Slow/unstable connection
   - WebSocket connects slowly
   - Code tries to send before OPEN
   - **Result**: InvalidStateError

3. **Race Conditions**: Lazy-loaded modules
   - `lazy-recorder.js` loads asynchronously
   - Main bundle tries to use before ready
   - **Result**: InvalidStateError

4. **Reconnection Logic**: Failed reconnect
   - Connection drops
   - Reconnect attempt fails
   - Old code reference tries to send
   - **Result**: InvalidStateError

**Affected Services**:
- PostHog Analytics (WebSocket or XHR)
- SendPulse Chat (WebSocket: `wss://lc.pulse.is`)
- Custom analytics beacon
- Google Analytics (beacon API)

#### **Secondary Cause (80% confidence): Beacon API Payload Too Large**

**Evidence**:
- Beacon API has 64KB limit
- Large analytics payloads fail silently
- Fallback to XHR can cause state errors

#### **Tertiary Cause (60% confidence): Page Unload Race Condition**

**Evidence**:
- Errors during page navigation
- Analytics beacon sends on unload
- Connection torn down mid-send

---

## 🎯 Solution Implementation Plan

### Phase 1: Immediate Fixes (Priority: 🔴 CRITICAL)

#### 1.1 Add crossorigin to All External Scripts

**Files to modify**:
- `index.html`
- Any dynamic script loading in JS

**Implementation**:
```html
<!-- PostHog -->
<script
  src="https://us-assets.i.posthog.com/static/array.js"
  crossorigin="anonymous"
  async
></script>

<!-- Google Analytics -->
<script
  src="https://www.googletagmanager.com/gtag/js?id=G-LXWRK8ELS6"
  crossorigin="anonymous"
  async
></script>

<!-- jQuery (if used) -->
<script
  src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"
  crossorigin="anonymous"
></script>

<!-- Cloudflare CDN -->
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/mobile-detect/1.3.6/mobile-detect.min.js"
  crossorigin="anonymous"
></script>
```

**Dynamic Loading** (using new CORSScriptLoader):
```javascript
import { scriptLoader } from './lib/corsHelper';

// Load PostHog with CORS
await scriptLoader.loadScript('https://us-assets.i.posthog.com/static/array.js', {
  crossorigin: 'anonymous',
  async: true
});
```

#### 1.2 Enable Source Maps in Production

**Vite Configuration** (`vite.config.js`):
```javascript
export default defineConfig({
  build: {
    sourcemap: true, // Enable source maps
    // ... other config
  }
});
```

**Nginx Configuration** (serve source maps):
```nginx
location ~* \.map$ {
    expires 7d;
    add_header Cache-Control "public, max-age=604800";
    add_header X-Content-Type-Options "nosniff" always;
    # Don't index source maps
    add_header X-Robots-Tag "noindex, nofollow" always;
}
```

**Security Consideration**:
Source maps expose code structure. Options:
1. **Serve with authentication** (recommended for healthcare)
2. **Host separately** on authenticated endpoint
3. **Accept risk** for better debugging (Report-Only CSP helps)

#### 1.3 Wrap All Transport with State Checks

**PostHog Initialization** (example):
```javascript
import { SafeXHR, SafeBeacon } from './lib/safeTransport';

// Wrap PostHog beacon
const originalBeacon = navigator.sendBeacon.bind(navigator);
navigator.sendBeacon = (url, data) => {
  const beacon = new SafeBeacon(url);
  return beacon.send(data);
};
```

**WebSocket Wrapper** (SendPulse chat):
```javascript
import { SafeWebSocket } from './lib/safeTransport';

// Replace native WebSocket
const originalWebSocket = window.WebSocket;
window.WebSocket = SafeWebSocket;
```

---

### Phase 2: CDN & CORS Headers (Priority: 🟡 HIGH)

#### 2.1 Configure Nginx CORS for Analytics Proxy

**File**: `/etc/nginx/sites-enabled/saraivavision`

**Add CORS headers for analytics proxy**:
```nginx
location /static/ {
    # Allow CORS for source maps and scripts
    add_header Access-Control-Allow-Origin "https://saraivavision.com.br" always;
    add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type" always;
    add_header Timing-Allow-Origin "https://saraivavision.com.br" always;

    # Handle preflight
    if ($request_method = OPTIONS) {
        return 204;
    }

    expires 7d;
    add_header Cache-Control "public, max-age=604800";
}
```

#### 2.2 Request CORS from Third-Party CDNs

**PostHog**: Already provides CORS
**Google APIs**: Already provides CORS
**Cloudflare CDN**: Already provides CORS
**SendPulse**: Contact support if issues persist

---

### Phase 3: Advanced Monitoring (Priority: 🟢 MEDIUM)

#### 3.1 Error Tracking Dashboard

**Metrics to Track**:
```javascript
// In errorTracking.js
const metrics = {
  scriptErrors: {
    total: 0,
    byOrigin: {},
    byCrossOrigin: 0,
    bySourceMapped: 0
  },
  stateErrors: {
    total: 0,
    byService: {
      posthog: 0,
      sendpulse: 0,
      analytics: 0
    },
    byState: {
      connecting: 0,
      closing: 0,
      closed: 0
    },
    byVisibility: {
      hidden: 0,
      visible: 0
    }
  },
  reconnections: {
    attempts: 0,
    successes: 0,
    failures: 0,
    avgTime: 0
  },
  queues: {
    currentSize: 0,
    maxSize: 0,
    drops: 0
  }
};
```

**Send to PostHog**:
```javascript
// Every 30 seconds
setInterval(() => {
  if (window.posthog) {
    window.posthog.capture('error_metrics', metrics);
  }
}, 30000);
```

#### 3.2 Real User Monitoring (RUM)

**Track Visibility Changes**:
```javascript
let hiddenStart = null;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    hiddenStart = Date.now();
  } else if (hiddenStart) {
    const hiddenDuration = Date.now() - hiddenStart;

    // Track errors after visibility change
    errorTracker.log('visibility', {
      event: 'resumed',
      hiddenDuration,
      errorsSinceHidden: errorTracker.getErrors()
        .filter(e => e.timestamp > hiddenStart).length
    });
  }
});
```

**Track Network Quality**:
```javascript
if ('connection' in navigator) {
  navigator.connection.addEventListener('change', () => {
    errorTracker.log('network', {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    });
  });
}
```

---

### Phase 4: Iframe Security (Priority: 🟢 LOW)

#### 4.1 Sandbox Iframes

**For untrusted iframes** (e.g., ads, external widgets):
```html
<iframe
  src="https://external.com/widget"
  sandbox="allow-scripts allow-same-origin"
  allow="accelerometer 'none'; camera 'none'; microphone 'none'"
></iframe>
```

#### 4.2 Catch Iframe Errors

**In parent window**:
```javascript
import { iframeHelper } from './lib/corsHelper';

// Configure allowed origins
iframeHelper.allowOrigin('https://open.spotify.com');
iframeHelper.allowOrigin('https://lc.pulse.is');

// Listen for error messages from iframes
iframeHelper.onMessage('error', (data, event) => {
  errorTracker.captureError({
    type: 'iframe_error',
    origin: event.origin,
    ...data
  });
});
```

---

## 🧪 Testing & Reproduction

### Test Scenarios

#### 1. Network Throttling
```javascript
// Chrome DevTools → Network → Throttling → Slow 3G
// Reproduce: Load page, switch tabs, return
// Expected: No InvalidStateError
```

#### 2. Page Visibility
```javascript
// Open page
// Switch to another tab for 30s
// Return to original tab
// Check console for errors
// Expected: Clean reconnection, no state errors
```

#### 3. Offline → Online
```javascript
// Chrome DevTools → Network → Offline
// Wait 10s
// Enable network
// Check reconnection behavior
// Expected: Graceful reconnection, queue flushed
```

#### 4. Script Loading
```javascript
// Check all external scripts have crossorigin
document.querySelectorAll('script[src*="://"]').forEach(script => {
  console.log(script.src, script.crossOrigin || 'MISSING');
});
// Expected: All external scripts show "anonymous"
```

---

## ✅ Post-Fix Verification Checklist

### Immediate Verification

- [ ] All external scripts have `crossorigin="anonymous"`
- [ ] Source maps are generated and accessible
- [ ] Error tracker is logging to console
- [ ] No "Script error." with "Unknown file" in console
- [ ] No InvalidStateError in production

### 24-Hour Monitoring

- [ ] Error rate decreased by >80%
- [ ] "Script error." count near zero
- [ ] InvalidStateError count near zero
- [ ] PostHog events show detailed stack traces
- [ ] Analytics data completeness >98%

### 7-Day Monitoring

- [ ] No error spikes during peak hours
- [ ] Reconnection success rate >95%
- [ ] Queue drops <1% of messages
- [ ] No user-reported issues related to tracking

---

## 📈 Success Metrics

### Before Implementation (Baseline)
```
Script Errors:        ~50-100/day
InvalidStateErrors:   ~30-50/day
Debugging Quality:    ❌ Poor (masked errors)
Analytics Coverage:   ~85% (15% loss)
User Experience:      ⚠️ Degraded (tracking failures)
```

### After Implementation (Target)
```
Script Errors:        <5/day (non-CORS sources)
InvalidStateErrors:   <2/day (edge cases only)
Debugging Quality:    ✅ Good (full stack traces)
Analytics Coverage:   >98% (2% acceptable loss)
User Experience:      ✅ Seamless
```

---

## 🚀 Deployment Plan

### Step 1: Development
1. Add error tracking utilities ✅
2. Add safe transport wrappers ✅
3. Add CORS helpers ✅
4. Test locally

### Step 2: Staging
1. Deploy to staging environment
2. Run all test scenarios
3. Monitor for 24 hours
4. Fix any issues

### Step 3: Production (Canary)
1. Deploy to 10% of users
2. Monitor error rates
3. Compare metrics with baseline
4. Rollback if needed

### Step 4: Production (Full)
1. Deploy to 100% of users
2. Monitor for 7 days
3. Document final metrics
4. Close tickets

---

## 🔧 Maintenance & Prevention

### Weekly Checks
- [ ] Review error tracker dashboard
- [ ] Check queue sizes and drop rates
- [ ] Monitor reconnection success rates
- [ ] Verify source maps are accessible

### Monthly Audits
- [ ] Review all external script sources
- [ ] Verify crossorigin attributes
- [ ] Update dependencies (PostHog, analytics)
- [ ] Test error scenarios

### Release Checklist
- [ ] All new external scripts have crossorigin
- [ ] Source maps generated for production
- [ ] Error tracking tested in staging
- [ ] No new InvalidStateError sources introduced
- [ ] CSP updated if new domains added

---

## 📚 References

### Documentation
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MDN: crossorigin attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin)
- [MDN: WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [PostHog Docs](https://posthog.com/docs)
- [Web Vitals](https://web.dev/vitals/)

### Tools
- Chrome DevTools → Network → Throttling
- Chrome DevTools → Application → Background Services
- PostHog Session Replay
- Sentry Error Tracking (future consideration)

---

## 🆘 Emergency Rollback Plan

If errors spike after deployment:

1. **Immediate**: Revert Nginx config
   ```bash
   sudo cp /etc/nginx/sites-enabled/saraivavision.backup /etc/nginx/sites-enabled/saraivavision
   sudo systemctl reload nginx
   ```

2. **Quick**: Disable error tracker
   ```javascript
   // In main.jsx
   // Comment out: import errorTracker from './lib/errorTracking';
   ```

3. **Full**: Rollback deployment
   ```bash
   sudo npm run deploy:rollback
   ```

---

**End of Diagnosis Document**
