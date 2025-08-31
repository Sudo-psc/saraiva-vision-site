/**
 * Comprehensive Healthcare Monitoring System for Clínica Saraiva Vision
 * Integrates all error handling, session management, and system monitoring
 * Provides centralized monitoring for healthcare-critical applications
 */

import healthcareSessionManager from './healthcareSessionManager.js';
import healthcareTokenManager from './healthcareTokenManager.js';
import adBlockerCompatibility from './adBlockerCompatibility.js';

class HealthcareMonitoringSystem {
  constructor() {
    this.isInitialized = false;
    this.monitoringActive = false;
    this.errorQueue = [];
    this.performanceMetrics = new Map();
    this.alertThresholds = {
      criticalErrorCount: 5,      // 5 critical errors in monitoring window
      sessionFailureRate: 0.3,    // 30% session failure rate
      tokenFailureRate: 0.5,      // 50% token failure rate
      responseTimeThreshold: 5000, // 5 seconds
      memoryUsageThreshold: 200   // 200MB
    };
    
    // Healthcare-specific monitoring categories
    this.monitoringCategories = {
      patient_safety: { priority: 'CRITICAL', alerts: true },
      data_security: { priority: 'CRITICAL', alerts: true },
      system_availability: { priority: 'HIGH', alerts: true },
      user_experience: { priority: 'MEDIUM', alerts: false },
      analytics: { priority: 'LOW', alerts: false }
    };

    this.init();
  }

  async init() {
    if (this.isInitialized) return;
    
    console.log('🏥 Initializing Healthcare Monitoring System...');
    
    try {
      // Initialize all subsystems
      await this.initializeSubsystems();
      
      // Set up global error handlers
      this.setupGlobalErrorHandling();
      
      // Set up system monitoring
      this.startSystemMonitoring();
      
      // Set up periodic health checks
      this.startHealthChecks();
      
      this.isInitialized = true;
      this.monitoringActive = true;
      
      console.log('✅ Healthcare Monitoring System initialized successfully');
      
      // Send initialization event
      this.recordEvent('system_initialized', {
        category: 'system_availability',
        level: 'info',
        details: 'Healthcare monitoring system started'
      });
      
    } catch (error) {
      console.error('❌ Healthcare Monitoring System initialization failed:', error);
      this.recordEvent('system_init_failed', {
        category: 'system_availability',
        level: 'critical',
        error: error.message
      });
    }
  }

  // Initialize all subsystems
  async initializeSubsystems() {
    console.log('🔧 Initializing healthcare subsystems...');
    
    const subsystems = [
      { name: 'session_manager', instance: healthcareSessionManager },
      { name: 'token_manager', instance: healthcareTokenManager },
      { name: 'adblocker_compatibility', instance: adBlockerCompatibility }
    ];

    for (const subsystem of subsystems) {
      try {
        if (typeof subsystem.instance.init === 'function') {
          await subsystem.instance.init();
        }
        console.log(`✅ ${subsystem.name} initialized`);
      } catch (error) {
        console.error(`❌ ${subsystem.name} initialization failed:`, error);
        this.recordEvent(`${subsystem.name}_init_failed`, {
          category: 'system_availability',
          level: 'critical',
          error: error.message
        });
      }
    }
  }

  // Set up global error handling
  setupGlobalErrorHandling() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleGlobalError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleGlobalError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        promise: event.promise,
        reason: event.reason
      });
    });

    // Chrome extension errors
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onConnect.addListener((port) => {
        port.onDisconnect.addListener(() => {
          if (chrome.runtime.lastError) {
            this.handleGlobalError({
              type: 'chrome_extension_error',
              message: chrome.runtime.lastError.message,
              context: 'extension_disconnect'
            });
          }
        });
      });
    }

    // Network errors
    window.addEventListener('online', () => {
      this.recordEvent('network_online', {
        category: 'system_availability',
        level: 'info'
      });
    });

    window.addEventListener('offline', () => {
      this.recordEvent('network_offline', {
        category: 'system_availability',
        level: 'warning'
      });
    });

    // Healthcare-specific event listeners
    this.setupHealthcareEventListeners();
  }

  // Set up healthcare-specific event listeners
  setupHealthcareEventListeners() {
    // Session events
    window.addEventListener('session-ended', (event) => {
      this.recordEvent('session_ended', {
        category: 'data_security',
        level: 'info',
        details: 'User session ended'
      });
    });

    window.addEventListener('session-warning', (event) => {
      this.recordEvent('session_warning', {
        category: 'user_experience',
        level: 'warning',
        timeLeft: event.detail.timeLeft
      });
    });

    // Token events
    window.addEventListener('critical-token-failure', (event) => {
      this.recordEvent('critical_token_failure', {
        category: 'data_security',
        level: 'critical',
        tokenType: event.detail.tokenType,
        error: event.detail.error
      });
    });

    // Critical service events
    window.addEventListener('critical-service-failure', (event) => {
      this.recordEvent('critical_service_failure', {
        category: 'patient_safety',
        level: 'critical',
        service: event.detail.service,
        adBlockerDetected: event.detail.adBlockerDetected
      });
    });
  }

  // Handle global errors
  handleGlobalError(errorInfo) {
    const categorizedError = this.categorizeError(errorInfo);
    
    // Add to error queue
    this.errorQueue.push({
      ...categorizedError,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.getCurrentSessionId()
    });

    // Maintain error queue size
    if (this.errorQueue.length > 100) {
      this.errorQueue.shift();
    }

    // Record the event
    this.recordEvent('global_error', categorizedError);

    // Check if we need to send alerts
    this.checkAlertThresholds();
  }

  // Categorize errors for healthcare context
  categorizeError(errorInfo) {
    let category = 'system_availability';
    let level = 'error';

    // Categorize based on error type and message
    if (errorInfo.message?.includes('session') || errorInfo.type?.includes('session')) {
      category = 'data_security';
    } else if (errorInfo.message?.includes('token') || errorInfo.message?.includes('auth')) {
      category = 'data_security';
      level = 'critical';
    } else if (errorInfo.message?.includes('patient') || errorInfo.message?.includes('medical')) {
      category = 'patient_safety';
      level = 'critical';
    } else if (errorInfo.message?.includes('network') || errorInfo.message?.includes('fetch')) {
      category = 'system_availability';
    } else if (errorInfo.type === 'chrome_extension_error') {
      category = 'user_experience';
    }

    return {
      ...errorInfo,
      category,
      level
    };
  }

  // Record events with healthcare context
  recordEvent(eventName, eventData) {
    const event = {
      name: eventName,
      timestamp: new Date().toISOString(),
      clinic: 'saraiva-vision',
      category: eventData.category || 'system_availability',
      level: eventData.level || 'info',
      ...eventData
    };

    // Log to console with appropriate level
    const logMethod = this.getLogMethod(event.level);
    logMethod(`🏥 Healthcare Event [${event.category.toUpperCase()}]:`, event);

    // Send to analytics if available and appropriate
    if (this.shouldSendToAnalytics(event)) {
      this.sendToAnalytics(event);
    }

    // Store in local monitoring
    this.storeEventLocally(event);

    // Check if immediate alert is needed
    if (event.level === 'critical' && this.monitoringCategories[event.category]?.alerts) {
      this.sendImmediateAlert(event);
    }
  }

  // Get appropriate log method based on event level
  getLogMethod(level) {
    switch (level) {
      case 'critical':
      case 'error':
        return console.error;
      case 'warning':
        return console.warn;
      case 'info':
      default:
        return console.log;
    }
  }

  // Determine if event should be sent to analytics
  shouldSendToAnalytics(event) {
    // Don't send sensitive healthcare data to external analytics
    if (event.category === 'patient_safety' && event.level === 'critical') {
      return false;
    }
    
    // Don't send if ad blocker is detected and this is a low priority event
    if (adBlockerCompatibility.isAdBlockerDetected() && 
        this.monitoringCategories[event.category]?.priority === 'LOW') {
      return false;
    }

    return true;
  }

  // Send event to analytics
  sendToAnalytics(event) {
    try {
      if (window.gtag && typeof window.gtag === 'function') {
        window.gtag('event', 'healthcare_monitoring', {
          event_category: event.category,
          event_label: event.name,
          custom_parameter_level: event.level,
          value: 1
        });
      }
    } catch (error) {
      console.warn('⚠️ Failed to send event to analytics:', error);
    }
  }

  // Store event locally for reporting
  storeEventLocally(event) {
    try {
      const storageKey = 'healthcare_events';
      const existingEvents = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      existingEvents.push(event);
      
      // Keep only last 500 events
      if (existingEvents.length > 500) {
        existingEvents.splice(0, existingEvents.length - 500);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(existingEvents));
    } catch (error) {
      console.warn('⚠️ Failed to store event locally:', error);
    }
  }

  // Send immediate alert for critical events
  sendImmediateAlert(event) {
    console.error('🚨 CRITICAL HEALTHCARE ALERT:', event);
    
    // Create visual alert for clinic staff
    this.showCriticalAlert(event);
    
    // Try to send to monitoring service
    this.sendToMonitoringService(event);
  }

  // Show visual alert to clinic staff
  showCriticalAlert(event) {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc2626;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 400px;
      font-family: system-ui, sans-serif;
    `;
    
    alertElement.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px;">
        🚨 ALERTA CRÍTICO DO SISTEMA
      </div>
      <div style="font-size: 14px; margin-bottom: 8px;">
        ${event.name}: ${event.details || event.message || 'Erro crítico detectado'}
      </div>
      <div style="font-size: 12px; opacity: 0.9;">
        Categoria: ${event.category} | ${new Date().toLocaleTimeString()}
      </div>
      <button onclick="this.parentElement.remove()" style="
        position: absolute; top: 8px; right: 8px; 
        background: transparent; border: none; color: white; 
        font-size: 18px; cursor: pointer;
      ">×</button>
    `;
    
    document.body.appendChild(alertElement);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (alertElement.parentElement) {
        alertElement.remove();
      }
    }, 30000);
  }

  // Send to external monitoring service
  sendToMonitoringService(event) {
    try {
      if (navigator.sendBeacon) {
        const payload = JSON.stringify({
          ...event,
          clinic_id: 'saraiva-vision',
          alert_type: 'critical'
        });
        
        navigator.sendBeacon('/api/monitoring/alert', payload);
      }
    } catch (error) {
      console.warn('⚠️ Failed to send to monitoring service:', error);
    }
  }

  // Start system monitoring
  startSystemMonitoring() {
    // Monitor performance metrics every 30 seconds
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 30000);

    // Monitor memory usage every minute
    setInterval(() => {
      this.monitorMemoryUsage();
    }, 60000);

    // Monitor critical services every 2 minutes
    setInterval(() => {
      this.monitorCriticalServices();
    }, 2 * 60000);
  }

  // Collect performance metrics
  collectPerformanceMetrics() {
    try {
      if (!window.performance) return;

      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const metrics = {
          pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstContentfulPaint: this.getFirstContentfulPaint(),
          timestamp: Date.now()
        };

        this.performanceMetrics.set('navigation', metrics);

        // Check thresholds
        if (metrics.pageLoadTime > this.alertThresholds.responseTimeThreshold) {
          this.recordEvent('slow_page_load', {
            category: 'user_experience',
            level: 'warning',
            loadTime: metrics.pageLoadTime
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Performance metrics collection failed:', error);
    }
  }

  // Get First Contentful Paint metric
  getFirstContentfulPaint() {
    try {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcp ? fcp.startTime : null;
    } catch (error) {
      return null;
    }
  }

  // Monitor memory usage
  monitorMemoryUsage() {
    try {
      if (performance.memory) {
        const memory = performance.memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;

        if (usedMB > this.alertThresholds.memoryUsageThreshold) {
          this.recordEvent('high_memory_usage', {
            category: 'system_availability',
            level: 'warning',
            usedMB: Math.round(usedMB),
            limitMB: Math.round(limitMB)
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Memory monitoring failed:', error);
    }
  }

  // Monitor critical services
  async monitorCriticalServices() {
    try {
      const servicesStatus = await adBlockerCompatibility.recheckServices();
      
      Object.entries(servicesStatus).forEach(([service, isWorking]) => {
        if (!isWorking) {
          this.recordEvent('critical_service_down', {
            category: 'patient_safety',
            level: 'critical',
            service: service
          });
        }
      });
    } catch (error) {
      console.warn('⚠️ Critical services monitoring failed:', error);
    }
  }

  // Start periodic health checks
  startHealthChecks() {
    // Overall system health check every 5 minutes
    setInterval(() => {
      this.performSystemHealthCheck();
    }, 5 * 60000);
  }

  // Perform comprehensive system health check
  async performSystemHealthCheck() {
    console.log('🔍 Performing healthcare system health check...');
    
    const healthReport = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      issues: []
    };

    try {
      // Check session management
      const sessionHealth = healthcareSessionManager.getSession() !== null;
      if (!sessionHealth) {
        healthReport.issues.push('session_management');
      }

      // Check token management
      const tokenHealth = this.checkTokenHealth();
      if (!tokenHealth) {
        healthReport.issues.push('token_management');
      }

      // Check ad blocker impact
      const adBlockerImpact = adBlockerCompatibility.isAdBlockerDetected();
      if (adBlockerImpact) {
        healthReport.issues.push('adblocker_detected');
      }

      // Check error rate
      const recentErrors = this.getRecentErrors();
      if (recentErrors.length > this.alertThresholds.criticalErrorCount) {
        healthReport.issues.push('high_error_rate');
      }

      // Determine overall health
      if (healthReport.issues.length > 0) {
        healthReport.overall = healthReport.issues.some(issue => 
          issue.includes('session') || issue.includes('token')
        ) ? 'critical' : 'degraded';
      }

      // Record health check
      this.recordEvent('system_health_check', {
        category: 'system_availability',
        level: healthReport.overall === 'healthy' ? 'info' : 'warning',
        overall: healthReport.overall,
        issues: healthReport.issues.join(',')
      });

    } catch (error) {
      console.error('❌ Health check failed:', error);
      this.recordEvent('health_check_failed', {
        category: 'system_availability',
        level: 'error',
        error: error.message
      });
    }
  }

  // Check token health
  checkTokenHealth() {
    try {
      // Check if critical tokens are available and not expired
      const criticalTokenTypes = ['clinic_api', 'google_analytics'];
      
      return criticalTokenTypes.every(tokenType => {
        const token = healthcareTokenManager.getStoredToken(tokenType);
        return token && (!token.expires_at || Date.now() < token.expires_at);
      });
    } catch (error) {
      return false;
    }
  }

  // Get recent errors for analysis
  getRecentErrors(timeWindow = 5 * 60 * 1000) { // 5 minutes
    const cutoff = Date.now() - timeWindow;
    return this.errorQueue.filter(error => 
      new Date(error.timestamp).getTime() > cutoff
    );
  }

  // Check alert thresholds
  checkAlertThresholds() {
    const recentErrors = this.getRecentErrors();
    const criticalErrors = recentErrors.filter(error => error.level === 'critical');
    
    if (criticalErrors.length >= this.alertThresholds.criticalErrorCount) {
      this.recordEvent('critical_error_threshold_exceeded', {
        category: 'system_availability',
        level: 'critical',
        errorCount: criticalErrors.length
      });
    }
  }

  // Get current session ID for correlation
  getCurrentSessionId() {
    try {
      const session = healthcareSessionManager.getSession();
      return session ? session.id : 'no_session';
    } catch (error) {
      return 'unknown';
    }
  }

  // Public method to get system status
  getSystemStatus() {
    return {
      isInitialized: this.isInitialized,
      monitoringActive: this.monitoringActive,
      recentErrors: this.getRecentErrors().length,
      adBlockerDetected: adBlockerCompatibility.isAdBlockerDetected(),
      criticalServices: adBlockerCompatibility.getCriticalServicesStatus(),
      sessionActive: healthcareSessionManager.getSession() !== null,
      performanceMetrics: Object.fromEntries(this.performanceMetrics)
    };
  }

  // Public method to generate health report
  generateHealthReport() {
    const status = this.getSystemStatus();
    const recentErrors = this.getRecentErrors(15 * 60 * 1000); // 15 minutes
    
    return {
      timestamp: new Date().toISOString(),
      clinic: 'saraiva-vision',
      status: status,
      recentErrors: recentErrors.length,
      errorsByCategory: this.groupErrorsByCategory(recentErrors),
      recommendations: this.generateRecommendations(status, recentErrors)
    };
  }

  // Group errors by category for reporting
  groupErrorsByCategory(errors) {
    return errors.reduce((groups, error) => {
      const category = error.category || 'unknown';
      groups[category] = (groups[category] || 0) + 1;
      return groups;
    }, {});
  }

  // Generate recommendations based on current state
  generateRecommendations(status, errors) {
    const recommendations = [];

    if (!status.sessionActive) {
      recommendations.push('Usuário não autenticado - verifique sistema de login');
    }

    if (status.adBlockerDetected) {
      recommendations.push('Ad blocker detectado - pode interferir com analytics');
    }

    if (errors.length > 5) {
      recommendations.push('Alta taxa de erros detectada - verificar logs detalhados');
    }

    const criticalServices = Object.entries(status.criticalServices || {});
    const failingServices = criticalServices.filter(([service, working]) => !working);
    
    if (failingServices.length > 0) {
      recommendations.push(`Serviços críticos fora do ar: ${failingServices.map(([s]) => s).join(', ')}`);
    }

    return recommendations;
  }
}

// Export singleton instance
const healthcareMonitoring = new HealthcareMonitoringSystem();
export default healthcareMonitoring;

// Also export class for testing
export { HealthcareMonitoringSystem };