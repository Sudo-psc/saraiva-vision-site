# PostHog Integration Fix - Production Error Resolution

**Issue**: `lazy-recorder.js` causing "Script error." and InvalidStateError
**Impact**: High - Blocking proper error tracking and analytics
**Priority**: 🔴 CRITICAL

---

## 🔍 Problem Analysis

### Current PostHog Integration

**File**: `src/providers/PostHogProvider.jsx`
**Issue**: PostHog loads from CDN without proper CORS configuration

**Symptoms**:
```
[Error] Global error: – {message: "Script error.", filename: "Unknown file"}
    (função anônima) (lazy-recorder.js:1:138470)
    (função anônima) (index-CxXoQ74p.js:37:41977)
[Error] InvalidStateError: The object is in an invalid state.
    send (bundle.js:22:45749)
```

### Root Causes

1. **CORS Masking**: PostHog script loaded without `crossorigin="anonymous"`
2. **State Management**: PostHog recorder tries to send before connection ready
3. **Lazy Loading**: Session replay module loads async, causing race conditions
4. **Page Visibility**: PostHog continues trying to send when tab is hidden

---

## ✅ Implementation Steps

### Step 1: Fix PostHog Provider

**File**: `src/providers/PostHogProvider.jsx`

**Current Code (Problematic)**:
```javascript
import posthog from 'posthog-js';

posthog.init('phc_bpyxyy0AVVh2E9LhjkDfZhi2vlfEsQhOBkijyjvyRSp', {
  api_host: 'https://us.i.posthog.com',
  // ... options
});
```

**Fixed Code**:
```javascript
import posthog from 'posthog-js';
import { SafeXHR, SafeBeacon } from '../lib/safeTransport';

// Wrap transport before init
const safeTransport = (url, data, options) => {
  // Check if should use beacon
  if (options.sendBeacon && navigator.sendBeacon) {
    const beacon = new SafeBeacon(url);
    return beacon.send(data);
  }

  // Fallback to XHR
  const xhr = new SafeXHR(url, 'POST');
  return xhr.send(data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

posthog.init('phc_bpyxyy0AVVh2E9LhjkDfZhi2vlfEsQhOBkijyjvyRSp', {
  api_host: 'https://us.i.posthog.com',

  // Enhanced configuration
  loaded: (posthog) => {
    console.log('[PostHog] Loaded successfully');

    // Wrap native transport
    if (posthog._send_request) {
      const originalSend = posthog._send_request.bind(posthog);
      posthog._send_request = (url, data, options, callback) => {
        try {
          safeTransport(url, data, options)
            .then(() => callback?.({ status: 1 }))
            .catch((error) => {
              console.error('[PostHog] Send error:', error);
              callback?.({ status: 0 });
            });
        } catch (error) {
          console.error('[PostHog] Transport error:', error);
          callback?.({ status: 0 });
        }
      };
    }
  },

  // Session recording configuration
  session_recording: {
    maskAllInputs: true,
    maskAllText: false, // Allow non-PII text
    recordCrossOriginIframes: false, // Security: don't record external iframes

    // CRITICAL: Handle recorder lifecycle
    onActiveRecordingChange: (isActive) => {
      console.log('[PostHog] Recording active:', isActive);
    },

    // Network configuration
    capturePerformance: {
      full_snapshots_on_load: false, // Reduce initial payload
      capture_network_timing: true
    }
  },

  // Respect page visibility
  capture_pageleave: true, // Use beacon on page leave
  capture_pageview: true,

  // Error handling
  on_xhr_error: (req) => {
    console.error('[PostHog] XHR error:', req);
  },

  // Defer non-critical features
  autocapture: {
    dom_event_allowlist: ['click'], // Only capture clicks
    url_allowlist: [window.location.hostname]
  },

  // Disable features that cause issues
  session_recording: {
    ...session_recording,
    // CRITICAL: Prevent recorder from breaking on errors
    sampling: {
      minimumDuration: 2000 // Only record sessions >2s
    }
  },

  // Rate limiting
  ratelimit: {
    events: 100, // Max events per minute
    pageviews: 10 // Max pageviews per minute
  },

  // Advanced persistence
  persistence: 'localStorage+cookie',

  // Bootstrap from flags if needed
  bootstrap: {
    distinctID: undefined,
    featureFlags: {}
  }
});

// Handle visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('[PostHog] Page hidden, pausing capture');
    posthog.opt_out_capturing(); // Pause when hidden
  } else {
    console.log('[PostHog] Page visible, resuming capture');
    posthog.opt_in_capturing(); // Resume when visible
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  console.log('[PostHog] Page unloading, flushing queue');
  posthog.capture('page_leave');

  // Give PostHog 200ms to send beacon
  const start = Date.now();
  while (Date.now() - start < 200) {
    // Blocking wait for beacon
  }
});
```

### Step 2: Add CORS to PostHog Script Tag

**File**: `index.html` (or dynamic loading location)

**If loading via script tag**:
```html
<script
  src="https://us-assets.i.posthog.com/static/array.js"
  crossorigin="anonymous"
  async
  onload="console.log('[PostHog] Script loaded')"
  onerror="console.error('[PostHog] Script failed to load')"
></script>
```

**If loading dynamically** (recommended):
```javascript
// In src/providers/PostHogProvider.jsx or main.jsx
import { scriptLoader } from '../lib/corsHelper';

const loadPostHog = async () => {
  try {
    // Load with proper CORS
    await scriptLoader.loadScript(
      'https://us-assets.i.posthog.com/static/array.js',
      {
        crossorigin: 'anonymous',
        async: true,
        onLoad: () => {
          console.log('[PostHog] CDN script loaded');
          // Initialize PostHog after script loads
          initializePostHog();
        },
        onError: (error) => {
          console.error('[PostHog] Failed to load:', error);
          // Fallback: disable analytics
        }
      }
    );
  } catch (error) {
    console.error('[PostHog] Load error:', error);
  }
};

// Call on app initialization
loadPostHog();
```

### Step 3: Configure CSP Headers (Already Done ✅)

**File**: `/etc/nginx/sites-enabled/saraivavision` (line 360)

**Current CSP includes**:
```nginx
script-src ... https://us-assets.i.posthog.com ...;
connect-src ... https://us.i.posthog.com https://us-assets.i.posthog.com ...;
```

### Step 4: Monitor PostHog Events

**Add monitoring to PostHogProvider**:
```javascript
import errorTracker from '../lib/errorTracking';

// Track PostHog events
posthog.on_event_sent = (event) => {
  errorTracker.log('posthog', {
    event: 'sent',
    eventName: event.event,
    timestamp: Date.now()
  });
};

// Track failures
posthog.on_request_failed = (error) => {
  errorTracker.captureError({
    type: 'posthog_request_failed',
    error: error,
    timestamp: Date.now()
  });
};
```

---

## 🧪 Testing Procedure

### Test 1: Verify CORS Headers

**Command**:
```bash
curl -I https://us-assets.i.posthog.com/static/array.js
```

**Expected**:
```
access-control-allow-origin: *
timing-allow-origin: *
```

### Test 2: Check Script Loading

**Browser Console**:
```javascript
// Check if PostHog loaded with crossorigin
const posthogScript = Array.from(document.scripts)
  .find(s => s.src.includes('posthog'));

console.log('PostHog crossOrigin:', posthogScript?.crossOrigin);
// Expected: "anonymous"
```

### Test 3: Verify No State Errors

**Steps**:
1. Open site in incognito
2. Open DevTools console
3. Switch tabs for 30 seconds
4. Return to original tab
5. Check console for errors

**Expected**: No InvalidStateError

### Test 4: Check Event Queue

**Browser Console**:
```javascript
// Check PostHog queue
console.log('PostHog queue:', window.posthog?._requestQueue?.length || 0);
// Expected: 0 (all flushed)

// Check our safe transport queues
console.log('Transport queues:', {
  xhr: window.safeXHRQueue?.length || 0,
  beacon: window.safeBeaconQueue?.length || 0
});
// Expected: All 0
```

### Test 5: Network Throttling

**Steps**:
1. Chrome DevTools → Network → Slow 3G
2. Load page
3. Interact (clicks, navigation)
4. Wait 1 minute
5. Check console for errors

**Expected**: Events queued and sent when connection improves

---

## 📊 Monitoring & Metrics

### PostHog-Specific Metrics

```javascript
// Add to error tracker
const posthogMetrics = {
  events: {
    sent: 0,
    failed: 0,
    queued: 0,
    dropped: 0
  },
  recorder: {
    active: false,
    errors: 0,
    chunks: 0
  },
  transport: {
    beacon: {
      attempts: 0,
      successes: 0,
      failures: 0
    },
    xhr: {
      attempts: 0,
      successes: 0,
      failures: 0
    }
  },
  visibility: {
    hiddenCount: 0,
    totalHiddenTime: 0
  }
};

// Export to PostHog every 60s
setInterval(() => {
  if (window.posthog) {
    window.posthog.capture('posthog_health', posthogMetrics);
  }
}, 60000);
```

### Alerts to Set Up

1. **High Failure Rate**: >5% events failing
2. **Queue Growth**: Queue size >50 events
3. **State Errors**: Any InvalidStateError from PostHog
4. **Recorder Errors**: Session replay errors

---

## ✅ Success Criteria

### Immediate (Post-Deploy)
- [ ] No "Script error." from lazy-recorder.js
- [ ] No InvalidStateError from PostHog transport
- [ ] All PostHog scripts loaded with crossorigin
- [ ] Events successfully sent to PostHog

### 24 Hours
- [ ] PostHog event success rate >98%
- [ ] No increase in error rate
- [ ] Session recordings working
- [ ] No user-reported analytics issues

### 7 Days
- [ ] Sustained event success rate >99%
- [ ] Queue drops <0.1%
- [ ] Recorder errors <1%
- [ ] Analytics data completeness matches baseline

---

## 🚨 Rollback Plan

If PostHog breaks after changes:

### Quick Disable
```javascript
// In PostHogProvider.jsx
export const PostHogProvider = ({ children }) => {
  // Temporarily disable
  return <>{children}</>;
};
```

### Revert to Previous Config
```bash
cd /home/saraiva-vision-site
git diff src/providers/PostHogProvider.jsx
git checkout HEAD -- src/providers/PostHogProvider.jsx
npm run build:vite
sudo npm run deploy:quick
```

---

## 📚 Additional Resources

### PostHog Documentation
- [Session Recording](https://posthog.com/docs/session-replay)
- [JavaScript SDK](https://posthog.com/docs/libraries/js)
- [CORS Configuration](https://posthog.com/docs/self-host/configure/securing-posthog#cors)

### Browser APIs
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Beacon API](https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API)
- [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)

---

**Last Updated**: 2025-10-09
**Status**: ✅ Ready for Implementation
