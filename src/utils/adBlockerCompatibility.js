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
    const detectionPromises = [
      this.detectByElementBlocking(),
      this.detectByNetworkBlocking(),
      this.detectByScriptBlocking(),
      this.detectByFilterLists()
    ];

    try {
      const results = await Promise.allSettled(detectionPromises);
      
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
        const testUrls = [
          'https://googleads.g.doubleclick.net/pagead/ads',
          'https://www.googletagservices.com/tag/js/gpt.js',
          'https://static.ads-twitter.com/uwt.js'
        ];

        let blockedCount = 0;
        let completedTests = 0;

        testUrls.forEach((url) => {
          const img = new Image();
          
          img.onload = () => {
            completedTests++;
            if (completedTests === testUrls.length) {
              resolve(blockedCount > 0);
            }
          };
          
          img.onerror = () => {
            blockedCount++;
            completedTests++;
            if (completedTests === testUrls.length) {
              resolve(blockedCount > 0);
            }
          };
          
          img.src = url + '?test=' + Date.now();
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

  // Method 3: Detect by script blocking
  detectByScriptBlocking() {
    return new Promise((resolve) => {
      try {
        // Check if common ad-related variables are undefined
        const adVariables = [
          'google_ad_client',
          'google_analytics',
          'fbq',
          '__gads'
        ];

        // Try to create a script element that ad blockers block
        const script = document.createElement('script');
        script.src = 'data:text/javascript;base64,' + btoa('window.__adblock_test = true;');
        script.async = true;
        
        let scriptBlocked = false;
        
        script.onerror = () => {
          scriptBlocked = true;
          resolve(true);
        };
        
        script.onload = () => {
          // Check if script executed
          const executed = window.__adblock_test === true;
          delete window.__adblock_test;
          resolve(!executed);
        };

        document.head.appendChild(script);
        
        setTimeout(() => {
          try {
            document.head.removeChild(script);
          } catch (e) {}
          if (!scriptBlocked) {
            resolve(false);
          }
        }, 1000);
        
      } catch (error) {
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
    } catch (error) {
      console.error('❌ Analytics fallback failed:', error);
    }
  }

  // Send events using navigator.sendBeacon as fallback
  sendFallbackEvent(eventName, params) {
    try {
      if (!navigator.sendBeacon) {
        return; // No fallback available
      }

      const eventData = {
        event: eventName,
        clinic: 'saraiva-vision',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
        ...params
      };

      // Send to local analytics endpoint
      const payload = JSON.stringify(eventData);
      const sent = navigator.sendBeacon('/api/analytics/fallback', payload);
      
      if (sent) {
        console.log('📊 Fallback analytics event sent:', eventName);
      }
      
    } catch (error) {
      console.error('❌ Fallback event sending failed:', error);
    }
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
    try {
      let isWorking = false;

      switch (serviceName) {
        case 'appointment_booking':
          isWorking = await this.testServiceEndpoint('/api/appointments/status');
          break;
        case 'patient_portal':
          isWorking = await this.testServiceEndpoint('/api/patient/status');
          break;
        case 'exam_results':
          isWorking = await this.testServiceEndpoint('/api/exams/status');
          break;
        case 'telemedicine':
          isWorking = await this.testServiceEndpoint('/api/telemedicine/status');
          break;
        case 'emergency_contact':
          isWorking = await this.testServiceEndpoint('/api/emergency/status');
          break;
        default:
          isWorking = true; // Assume working if not specifically testable
      }

      this.criticalServicesStatus.set(serviceName, isWorking);
      
      if (!isWorking) {
        console.error(`🚨 Critical service not working: ${serviceName}`);
        this.reportCriticalServiceFailure(serviceName);
      } else {
        console.log(`✅ Critical service working: ${serviceName}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to check critical service ${serviceName}:`, error);
      this.criticalServicesStatus.set(serviceName, false);
    }
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