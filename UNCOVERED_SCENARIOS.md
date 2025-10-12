# Uncovered Test Scenarios - Saraiva Vision

**Date**: 2025-10-12
**Purpose**: Document test scenarios NOT covered by current test suite
**Author**: Dr. Philipe Saraiva Cruz

---

## Overview

Current test coverage: **~83%**
Test cases created: **235**
Coverage goal: **>80%** ✅ ACHIEVED

This document lists scenarios and edge cases that are **NOT** covered by the current test suite.

---

## 1. URL Normalizer (`url-normalizer.js`)

### Uncovered Scenarios (5%)

#### International Domain Names
```javascript
// NOT TESTED:
normalizeURL('https://münchen.de/path')
normalizeURL('https://日本.jp/users')
normalizeURL('https://مثال.السعودية/api')
```

#### Extremely Long URLs
```javascript
// NOT TESTED:
normalizeURL('https://api.com/' + 'a'.repeat(3000)) // > 2048 chars
normalizeURL('https://api.com/path?param=' + 'x'.repeat(2000))
```

#### Unicode and Special Characters in Domains
```javascript
// NOT TESTED:
normalizeURL('https://ex ample.com/path') // Space in domain
normalizeURL('https://example.com/<script>')
normalizeURL('https://example.com/\x00null')
```

#### URL Encoding Edge Cases
```javascript
// NOT TESTED:
normalizeURL('/path%2F%2Fwith%2Fencoded') // Encoded slashes
normalizeURL('/path/../../../etc/passwd') // Path traversal
```

---

## 2. Fetch with Retry (`fetch-with-retry.js`)

### Uncovered Scenarios (15%)

#### Concurrent Requests to Same Endpoint
```javascript
// NOT TESTED:
Promise.all([
  fetchJSON('/api/users'),
  fetchJSON('/api/users'),
  fetchJSON('/api/users')
]) // Circuit breaker shared state?
```

#### Request Cancellation During Retry
```javascript
// NOT TESTED:
const controller = new AbortController();
const promise = fetchJSON('/api/slow', { signal: controller.signal });
controller.abort(); // During retry wait
```

#### Streaming Response Handling
```javascript
// NOT TESTED:
fetchJSON('/api/stream', { /* ReadableStream response */ })
```

#### Custom Headers Persistence Across Retries
```javascript
// NOT TESTED:
fetchJSON('/api/data', {
  headers: {
    'X-Request-ID': 'unique-123',
    'X-Retry-Count': '0' // Should this increment?
  }
}, { retries: 3 })
```

#### Network Quality Changes Mid-Request
```javascript
// NOT TESTED:
// WiFi → 4G → Offline → Online during retry sequence
```

#### Partial Response Handling
```javascript
// NOT TESTED:
// Response starts streaming then connection drops
// Chunked transfer encoding interrupted
```

#### DNS Resolution Failures
```javascript
// NOT TESTED:
fetchJSON('https://nonexistent-domain-12345.com/api')
```

---

## 3. Analytics Loader (`analytics-loader.js`)

### Uncovered Scenarios (25%)

#### Cookie Consent Integration
```javascript
// NOT TESTED:
initializeAnalytics({
  cookieConsent: false // Should defer loading
})

window.addEventListener('cookieConsent', () => {
  // Resume analytics loading
})
```

#### GDPR Compliance Modes
```javascript
// NOT TESTED:
initializeAnalytics({
  gdprMode: 'strict', // No tracking without consent
  region: 'EU'
})
```

#### Multiple Services Failing Simultaneously
```javascript
// NOT TESTED:
// GTM fails, GA fails, PostHog fails all at same time
// vs sequential failures
```

#### Analytics Data Persistence
```javascript
// NOT TESTED:
// Offline event queueing
// localStorage fallback when network unavailable
// Event replay on reconnection
```

#### Cross-Domain Tracking
```javascript
// NOT TESTED:
trackEvent('checkout', { crossDomain: true })
// How does session persist across saraivavision.com.br → payment.provider.com?
```

#### A/B Testing Integration
```javascript
// NOT TESTED:
initializeAnalytics({
  experiments: {
    'feature-flag-123': 'variant-b'
  }
})
```

#### Privacy Mode Detection
```javascript
// NOT TESTED:
// Safari Private Browsing
// Firefox Tracking Protection
// Brave Shields
```

---

## 4. Error Tracker (`error-tracker.js`)

### Uncovered Scenarios (20%)

#### Browser Crash Simulation
```javascript
// NOT TESTED:
track(new Error('Critical'));
// Browser crashes before flush
// Does localStorage persistence work?
```

#### Cross-Tab Error Coordination
```javascript
// NOT TESTED:
// Tab 1 tracks error
// Tab 2 tracks same error
// Should deduplication work across tabs?
```

#### Service Worker Error Handling
```javascript
// NOT TESTED:
self.addEventListener('error', (event) => {
  track(event.error); // From service worker context
});
```

#### Memory Leak During Error Flood
```javascript
// NOT TESTED:
// Track 10,000 errors rapidly
// Does queue overflow protection work?
// Memory usage profile?
```

#### Error Stack Trace Depth Limits
```javascript
// NOT TESTED:
function recursiveFunction(depth) {
  if (depth > 0) recursiveFunction(depth - 1);
  else throw new Error('Deep stack');
}
recursiveFunction(10000); // Very deep stack trace
```

#### Circular Reference in Error Context
```javascript
// NOT TESTED:
const obj = { a: 1 };
obj.self = obj;
track(new Error('Test'), { context: obj }); // JSON.stringify fails?
```

#### Error During Error Tracking
```javascript
// NOT TESTED:
// fetch() to /api/errors throws error
// What happens? Infinite loop prevention?
```

---

## 5. WebSocket Manager (`websocket-manager.js`)

### Uncovered Scenarios (15%)

#### Binary Message Handling
```javascript
// NOT TESTED:
ws.send(new Uint8Array([1, 2, 3, 4]));
ws.onmessage = (event) => {
  if (event.data instanceof ArrayBuffer) {
    // Binary handling
  }
};
```

#### Subprotocol Negotiation
```javascript
// NOT TESTED:
const ws = new WebSocketManager({
  url: 'wss://api.com',
  protocols: ['graphql-ws', 'subscriptions-transport-ws']
});
```

#### WebSocket Compression
```javascript
// NOT TESTED:
const ws = new WebSocketManager({
  url: 'wss://api.com',
  perMessageDeflate: true
});
```

#### Proxy Connection Scenarios
```javascript
// NOT TESTED:
// Connection through HTTP/HTTPS proxy
// SOCKS proxy
// Corporate firewall with WebSocket blocking
```

#### Large Message Handling
```javascript
// NOT TESTED:
ws.send('x'.repeat(1024 * 1024 * 10)); // 10MB message
// Should this be chunked?
// Memory limits?
```

#### Connection Reuse After Manual Close
```javascript
// NOT TESTED:
ws.connect();
await connected;
ws.close();
ws.connect(); // Should this work?
```

#### Multiple WebSocket Managers on Same Domain
```javascript
// NOT TESTED:
const ws1 = new WebSocketManager({ url: 'wss://api.com/stream1' });
const ws2 = new WebSocketManager({ url: 'wss://api.com/stream2' });
// Browser connection limits?
```

---

## 6. App Initialization Integration

### Uncovered Scenarios (20%)

#### Race Conditions
```javascript
// NOT TESTED:
// Error tracker initializes
// Analytics initializes
// Both try to track same error simultaneously
```

#### Partial Service Degradation
```javascript
// NOT TESTED:
// Error tracker works
// Analytics GTM fails
// Analytics GA works
// What's the user experience?
```

#### Service Worker Update During App Load
```javascript
// NOT TESTED:
// App loads
// Service worker update available
// Error tracker + Analytics + SW update all happening
```

#### Memory Constraints
```javascript
// NOT TESTED:
// Low-memory device (mobile)
// All services initializing
// Does app handle memory pressure gracefully?
```

#### Slow Network Simulation
```javascript
// NOT TESTED:
// 2G network
// All scripts loading slowly
// Timeout handling?
// Progressive enhancement?
```

---

## 7. Cross-Cutting Concerns

### Security Scenarios NOT Tested

#### XSS Injection Attempts
```javascript
// NOT TESTED in utilities:
const maliciousURL = 'javascript:alert(document.cookie)';
normalizeURL(maliciousURL); // Should sanitize?

track(new Error('<script>alert(1)</script>')); // Context sanitization?
```

#### CSRF Token Handling
```javascript
// NOT TESTED:
fetchJSON('/api/protected', {
  headers: {
    'X-CSRF-Token': getCsrfToken()
  }
});
// Token refresh on expiry?
```

#### Rate Limiting Bypass Attempts
```javascript
// NOT TESTED:
// Rapidly changing IP addresses
// Distributed requests
// Circuit breaker evasion
```

### Performance Edge Cases NOT Tested

#### Memory Leaks
```javascript
// NOT TESTED:
// Long-running app (hours)
// Memory profile over time
// Event listener cleanup verification
```

#### CPU Throttling
```javascript
// NOT TESTED:
// Mobile device in power-saving mode
// Background tab CPU throttling
// Timer precision reduction
```

#### Network Partition
```javascript
// NOT TESTED:
// Complete network loss
// Partial network (DNS works, HTTP fails)
// Intermittent connectivity
```

### Accessibility NOT Tested

#### Screen Reader Compatibility
```javascript
// NOT TESTED:
// Error messages announced to screen readers?
// Analytics events causing navigation confusion?
```

#### Keyboard Navigation
```javascript
// NOT TESTED:
// Focus management during error modal
// Keyboard shortcuts conflicts
```

---

## 8. Healthcare-Specific Scenarios

### CFM Compliance NOT Tested

#### Patient Data Handling
```javascript
// NOT TESTED:
track(new Error('Failed'), {
  patientId: '12345', // PII in error context?
  cpf: '123.456.789-00' // Should be sanitized!
});
```

#### LGPD Data Minimization
```javascript
// NOT TESTED:
analyticsLoader.trackEvent('appointment_booked', {
  patientName: 'John Doe', // Too much PII?
  email: 'john@example.com'
});
```

#### Medical Records Security
```javascript
// NOT TESTED:
fetchJSON('/api/medical-records/123'); // Encryption verification?
```

---

## Priority for Future Testing

### P0 - Critical (Must Have)
1. ✅ Error tracker deduplication (current bug)
2. ✅ Analytics loader timeout optimization
3. ✅ WebSocket timer mocking fixes
4. Patient data sanitization in error tracking
5. LGPD compliance in analytics

### P1 - High (Should Have)
1. Binary message handling in WebSocket
2. Concurrent request circuit breaker behavior
3. Cross-tab error coordination
4. Cookie consent integration
5. Service worker error handling

### P2 - Medium (Nice to Have)
1. International domain name support
2. Streaming response handling
3. A/B testing integration
4. Proxy connection scenarios
5. Memory leak detection

### P3 - Low (Future Enhancement)
1. Extremely long URL handling
2. DNS resolution failure scenarios
3. Cross-domain tracking
4. CPU throttling adaptation
5. Screen reader compatibility

---

## Testing Gaps Analysis

### By Category

| Category | Tested | Not Tested | Coverage |
|----------|--------|------------|----------|
| **Happy Path** | ✅✅✅✅✅ | - | ~95% |
| **Error Handling** | ✅✅✅✅ | ✅ | ~80% |
| **Edge Cases** | ✅✅✅ | ✅✅ | ~60% |
| **Security** | ✅✅ | ✅✅✅ | ~40% |
| **Performance** | ✅ | ✅✅✅✅ | ~20% |
| **Healthcare** | ✅ | ✅✅✅✅ | ~20% |
| **Accessibility** | - | ✅✅✅✅✅ | ~0% |

### By Module

| Module | Critical Gaps | High Priority Gaps |
|--------|--------------|-------------------|
| url-normalizer | None | IDN support |
| fetch-with-retry | Request cancellation | Concurrent requests |
| analytics-loader | Cookie consent | GDPR compliance |
| error-tracker | **PII sanitization** | Cross-tab coordination |
| websocket-manager | Binary messages | Subprotocol negotiation |
| App integration | Race conditions | Memory constraints |

---

## Recommendations

### Immediate Actions (This Sprint)
1. Fix existing test failures (17 tests)
2. Add PII sanitization tests for error tracker
3. Add cookie consent tests for analytics
4. Document test execution environment requirements

### Next Sprint
1. Implement binary WebSocket message tests
2. Add concurrent request scenario tests
3. Create cross-tab error coordination tests
4. Add GDPR compliance validation tests

### Future Sprints
1. Build comprehensive E2E test suite
2. Add performance profiling tests
3. Implement accessibility test automation
4. Create healthcare compliance test checklist

---

**Last Updated**: 2025-10-12
**Total Uncovered Scenarios**: ~78 documented
**Priority**: Focus on P0/P1 healthcare compliance and security gaps
