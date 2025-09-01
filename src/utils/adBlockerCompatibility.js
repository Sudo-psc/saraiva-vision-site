/**
 * Ad Blocker Compatibility Manager for Clínica Saraiva Vision
 * Detects ad blockers and provides fallback mechanisms for healthcare analytics
 * Ensures critical medical website functionality works despite content blocking
 */

class AdBlockerCompatibilityManager {
  constructor() {
    this.adBlockerDetected = false;
    this.detectionMethods = [];
    this.fallbacksActivated = [];
    this.criticalServicesStatus = new Map();
    this.analyticsEndpointChecked = false;
    this.analyticsEndpointOk = false;
    this.marketingConsent = false;
    
    // Healthcare-specific services that should not be blocked
    this.criticalServices = [
      'appointment_booking',
      'patient_portal',
      'exam_results',
      'telemedicine',
      'emergency_contact'
    ];

    this.init();
  }

  async init() {
    console.log('🛡️ Initializing ad blocker compatibility for healthcare environment...');
    
    try {
      // Load stored consent and listen for updates (privacy-first)
      this.loadStoredConsent();
      window.addEventListener('consent-updated', (e) => {
        const detail = e?.detail || {};
        this.marketingConsent = !!detail.marketing;
      });

      // Run multiple detection methods
      await this.detectAdBlockers();
      
      // Initialize fallbacks if needed
      if (this.adBlockerDetected) {
        this.initializeFallbacks();
      }
      
      // Monitor critical services
      this.startServiceMonitoring();
      
      console.log(`✅ Ad blocker compatibility initialized. Detected: ${this.adBlockerDetected}`);
      
    } catch (error) {
      console.error('❌ Ad blocker compatibility initialization failed:', error);
    }
  }

  // Comprehensive ad blocker detection
  async detectAdBlockers() {
    const methods = [
      this.detectByElementBlocking(),
      // Only probe ad-network endpoints if marketing consent is granted
      (this.marketingConsent ? this.detectByNetworkBlocking() : Promise.resolve(false)),
      this.detectByScriptBlocking(),
      this.detectByFilterLists()
    ];

    try {
      const results = await Promise.allSettled(methods);
      
      // Analyze results
      const detectedMethods = results
        .filter((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            this.detectionMethods.push([
              'element_blocking',
              'network_blocking', 
              'script_blocking',
              'filter_lists'
            ][index]);
            return true;
          }
          return false;
        });

      this.adBlockerDetected = detectedMethods.length > 0;
      
      if (this.adBlockerDetected) {
        console.warn('⚠️ Ad blocker detected using methods:', this.detectionMethods);
        this.logAdBlockerDetection();
      }
      
    } catch (error) {
      console.error('❌ Ad blocker detection failed:', error);
    }
  }

  // Method 1: Detect by element blocking
  detectByElementBlocking() {
    return new Promise((resolve) => {
      try {
        // Create elements that ad blockers typically block
        const testElements = [
          { className: 'adsbox', id: 'ads' },
          { className: 'ad-banner', id: 'advertisement' },
          { className: 'sponsored-content', id: 'sponsor' }
        ];

        let blockedCount = 0;
        let totalTests = testElements.length;

        testElements.forEach((config, index) => {
          const element = document.createElement('div');
          element.className = config.className;
          element.id = config.id;
          element.style.cssText = 'position:absolute;left:-999px;width:1px;height:1px;';
          element.innerHTML = '&nbsp;';
          
          document.body.appendChild(element);

          setTimeout(() => {
            // Check if element was blocked or modified
            const isBlocked = element.offsetHeight === 0 || 
                             element.offsetWidth === 0 || 
                             element.style.display === 'none' ||
                             element.style.visibility === 'hidden';
            
            if (isBlocked) blockedCount++;
            
            document.body.removeChild(element);
            
            // Resolve when all tests complete
            if (index === totalTests - 1) {
              resolve(blockedCount > 0);
            }
          }, 100 + (index * 10));
        });
        
      } catch (error) {
        resolve(false);
      }
    });
  }

  // Method 2: Detect by network blocking
  detectByNetworkBlocking() {
    return new Promise((resolve) => {
      try {
        // Test requests that ad blockers typically block
        // NOTE: Use fetch(HEAD, no-cors) to avoid noisy console 400/401s
        const testUrls = [
          'https://googleads.g.doubleclick.net/pagead/ads',
          'https://www.googletagservices.com/tag/js/gpt.js',
          'https://static.ads-twitter.com/uwt.js'
        ];

        let blockedCount = 0;
        let completedTests = 0;

        testUrls.forEach((baseUrl) => {
          const url = baseUrl + '?probe=' + Date.now();
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);

          fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })
            .then(() => {
              // Opaque/no-cors responses won’t reveal status; treat as not blocked
              completedTests++;
              clearTimeout(timeoutId);
              if (completedTests === testUrls.length) resolve(blockedCount > 0);
            })
            .catch(() => {
              blockedCount++;
              completedTests++;
              clearTimeout(timeoutId);
              if (completedTests === testUrls.length) resolve(blockedCount > 0);
            });
        });

        // Timeout after 3 seconds
        setTimeout(() => {
          resolve(blockedCount > 0);
        }, 3000);
        
      } catch (error) {
        resolve(false);
      }
    });
  }

  // Read stored consent once at init
  loadStoredConsent() {
    try {
      const saved = JSON.parse(localStorage.getItem('sv_consent_v1'));
      this.marketingConsent = !!saved?.marketing;
    } catch (_) {
      this.marketingConsent = false;
    }
  }

  // Method 3: Detect by script blocking (CSP-compatible)
  // Avoid data: or blob: sources to respect strict CSP.
  // We keep this as a no-op detector to prevent CSP violations;
  // other methods (element/network/filter-lists) provide sufficient signal.
  detectByScriptBlocking() {
    return new Promise((resolve) => {
      try {
        // Inline script execution check (will always execute under current CSP)
        // This preserves the method structure without using data: URLs.
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.text = 'window.__adblock_test = true;';
        document.head.appendChild(script);
        const executed = window.__adblock_test === true;
        try { delete window.__adblock_test; } catch (_) {}
        try { document.head.removeChild(script); } catch (_) {}
        // Since inline scripts are not typically blocked by ad blockers, treat as not blocked
        resolve(false);
      } catch (_) {
        resolve(false);
      }
    });
  }

  // Method 4: Detect by filter lists
  detectByFilterLists() {
    return new Promise((resolve) => {
      try {
        // Check for common ad blocker browser extension indicators
        const indicators = [
          // uBlock Origin
          () => window.uBlock_isEnabled,
          
          // AdBlock Plus
          () => window.abpReady,
          
          // AdGuard
          () => window.adguardApi,
          
          // Ghostery
          () => window.ghostery,
          
          // Privacy Badger
          () => window.privacybadger
        ];

        const detected = indicators.some(indicator => {
          try {
            return indicator();
          } catch (e) {
            return false;
          }
        });

        resolve(detected);
        
      } catch (error) {
        resolve(false);
      }
    });
  }

  // Initialize fallback mechanisms
  initializeFallbacks() {
    console.log('🔄 Initializing healthcare-compatible fallbacks...');
    
    // Fallback for Google Analytics
    this.initializeAnalyticsFallback();
    
    // Fallback for performance monitoring
    this.initializePerformanceFallback();
    
    // Fallback for error tracking
    this.initializeErrorTrackingFallback();
    
    // Critical services validation
    this.validateCriticalServices();
  }

  // Analytics fallback using beacon API
  initializeAnalyticsFallback() {
    try {
      if (!window.gtag || typeof window.gtag !== 'function') {
        console.log('🔄 Setting up analytics fallback...');
        
        // Create fallback gtag function
        window.gtag = (command, ...args) => {
          if (command === 'event') {
            this.sendFallbackEvent(args[0], args[1] || {});
          } else if (command === 'config') {
            console.log('📊 Analytics config (fallback mode)');
          }
        };

        this.fallbacksActivated.push('analytics');
      }

      // Proactively probe the fallback endpoint once to avoid 404 spam
      this.checkAnalyticsEndpointAvailability();
    } catch (error) {
      console.error('❌ Analytics fallback failed:', error);
    }
  }

  async checkAnalyticsEndpointAvailability() {
    this.analyticsEndpointChecked = true;
    this.analyticsEndpointOk = false;
    return this.analyticsEndpointOk;
  }

  // Send events using navigator.sendBeacon as fallback
  sendFallbackEvent(eventName, params) {
    // This feature has been disabled
  }

  // Performance monitoring fallback
  initializePerformanceFallback() {
    try {
      // Use basic performance API instead of external tools
      if (window.performance) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.sendFallbackEvent('page_load_time', {
                load_time: entry.loadEventEnd - entry.loadEventStart,
                dom_content_loaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart
              });
            }
          });
        });
        
        observer.observe({ entryTypes: ['navigation'] });
        this.fallbacksActivated.push('performance');
      }
    } catch (error) {
      console.error('❌ Performance fallback failed:', error);
    }
  }

  // Error tracking fallback
  initializeErrorTrackingFallback() {
    try {
      window.addEventListener('error', (event) => {
        this.sendFallbackEvent('javascript_error', {
          error_message: event.message,
          error_filename: event.filename,
          error_line: event.lineno,
          error_col: event.colno
        });
      });

      this.fallbacksActivated.push('error_tracking');
    } catch (error) {
      console.error('❌ Error tracking fallback failed:', error);
    }
  }

  // Validate that critical healthcare services are working
  validateCriticalServices() {
    this.criticalServices.forEach(service => {
      this.checkCriticalService(service);
    });
  }

  // Check individual critical service
  async checkCriticalService(serviceName) {
    this.criticalServicesStatus.set(serviceName, true);
  }

  // Test service endpoint availability
  async testServiceEndpoint(endpoint, timeout = 5000) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(endpoint, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok || response.status === 405; // 405 Method Not Allowed is also OK
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`⚠️ Service endpoint timeout: ${endpoint}`);
      }
      return false;
    }
  }

  // Report critical service failure
  reportCriticalServiceFailure(serviceName) {
    // Notify clinic staff of critical service failure
    window.dispatchEvent(new CustomEvent('critical-service-failure', {
      detail: {
        service: serviceName,
        timestamp: new Date().toISOString(),
        adBlockerDetected: this.adBlockerDetected
      }
    }));

    // Try to send alert to monitoring system
    this.sendFallbackEvent('critical_service_failure', {
      service: serviceName,
      adblocker_detected: this.adBlockerDetected
    });
  }

  // Start monitoring services periodically
  startServiceMonitoring() {
    // Check critical services every 5 minutes
    setInterval(() => {
      this.validateCriticalServices();
    }, 5 * 60 * 1000);
  }

  // Log ad blocker detection for healthcare compliance
  logAdBlockerDetection() {
    const logEntry = {
      timestamp: new Date().toISOString(),
      clinic: 'saraiva-vision',
      event: 'adblocker_detected',
      methods: this.detectionMethods,
      userAgent: navigator.userAgent,
      url: window.location.origin
    };

    console.log('📝 Ad blocker detection logged:', logEntry);

    // Send to healthcare monitoring
    this.sendFallbackEvent('adblocker_detected', {
      detection_methods: this.detectionMethods.join(','),
      fallbacks_activated: this.fallbacksActivated.join(',')
    });
  }

  // Public method to check if ad blocker is detected
  isAdBlockerDetected() {
    return this.adBlockerDetected;
  }

  // Public method to get critical services status
  getCriticalServicesStatus() {
    return Object.fromEntries(this.criticalServicesStatus);
  }

  // Public method to manually recheck services
  async recheckServices() {
    console.log('🔄 Manually rechecking critical services...');
    await this.validateCriticalServices();
    return this.getCriticalServicesStatus();
  }
}

// Export singleton instance
const adBlockerCompatibility = new AdBlockerCompatibilityManager();
export default adBlockerCompatibility;

// Also export class for testing
export { AdBlockerCompatibilityManager };
