/**
 * Circuit Breaker Pattern Implementation for Medical API Calls
 *
 * Provides fault tolerance and resilience for critical medical system APIs
 * with fallback mechanisms for patient safety.
 */

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.timeout = options.timeout || 5000; // 5 seconds
    this.monitoringWindow = options.monitoringWindow || 60000; // 1 minute

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = Date.now();

    // Medical-specific configurations
    this.criticalEndpoints = new Set([
      '/api/appointments',
      '/api/patient-data',
      '/api/emergency-contact',
      '/api/medical-records'
    ]);

    this.fallbackStrategies = new Map();
    this.setupFallbackStrategies();
  }

  setupFallbackStrategies() {
    // Critical medical endpoints require cached responses
    this.fallbackStrategies.set('/api/appointments', {
      type: 'cache',
      fallback: () => this.getCachedAppointments(),
      message: 'Using cached appointment data. Please verify by phone if urgent.'
    });

    this.fallbackStrategies.set('/api/patient-data', {
      type: 'cache',
      fallback: () => this.getCachedPatientData(),
      message: 'Using locally stored data. Contact clinic for updates.'
    });

    this.fallbackStrategies.set('/api/emergency-contact', {
      type: 'static',
      fallback: () => this.getEmergencyFallback(),
      message: 'Service unavailable. Please call emergency line: (11) 99999-9999'
    });

    // Non-critical endpoints can show maintenance message
    this.fallbackStrategies.set('default', {
      type: 'maintenance',
      fallback: () => ({ maintenance: true }),
      message: 'Service temporarily unavailable. Please try again in a few minutes.'
    });
  }

  async call(endpoint, requestFn, options = {}) {
    const isCritical = this.criticalEndpoints.has(endpoint);

    // Check circuit state
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        return this.handleFallback(endpoint, 'Circuit breaker is OPEN');
      }
      // Try to close circuit
      this.state = 'HALF_OPEN';
    }

    try {
      // Add timeout wrapper for medical safety
      const result = await this.executeWithTimeout(requestFn, this.timeout);

      this.onSuccess();
      return {
        data: result,
        source: 'api',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.onFailure(error);

      // For critical medical endpoints, always try fallback
      if (isCritical) {
        return this.handleFallback(endpoint, error.message);
      }

      // For non-critical endpoints, fail fast
      throw new Error(`Service unavailable: ${error.message}`);
    }
  }

  async executeWithTimeout(requestFn, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await requestFn({ signal: controller.signal });
      clearTimeout(timeoutId);

      // Validate medical API response structure
      if (!this.isValidMedicalResponse(response)) {
        throw new Error('Invalid medical API response structure');
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  isValidMedicalResponse(response) {
    // Basic medical API response validation
    if (!response || typeof response !== 'object') {
      return false;
    }

    // Medical responses should have timestamp for audit trail
    if (response.data && !response.timestamp) {
      response.timestamp = new Date().toISOString();
    }

    return true;
  }

  onSuccess() {
    this.failureCount = 0;
    this.successCount++;

    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log('Circuit breaker closed after successful request');
    }
  }

  onFailure(error) {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;

      console.error(`Circuit breaker opened after ${this.failureCount} failures`);

      // Alert for critical medical system failures
      this.alertMedicalSystemFailure(error);
    }
  }

  async handleFallback(endpoint, errorMessage) {
    const strategy = this.fallbackStrategies.get(endpoint) ||
                    this.fallbackStrategies.get('default');

    console.warn(`Using fallback for ${endpoint}: ${errorMessage}`);

    try {
      const fallbackData = await strategy.fallback();

      return {
        data: fallbackData,
        source: 'fallback',
        type: strategy.type,
        message: strategy.message,
        timestamp: new Date().toISOString(),
        originalError: errorMessage
      };
    } catch (fallbackError) {
      console.error(`Fallback failed for ${endpoint}:`, fallbackError);

      // Last resort for medical systems
      return {
        data: null,
        source: 'error',
        message: 'All systems unavailable. Please contact clinic directly.',
        emergencyContact: '(11) 99999-9999',
        timestamp: new Date().toISOString(),
        error: errorMessage
      };
    }
  }

  getCachedAppointments() {
    const cached = localStorage.getItem('appointments_cache');
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < 3600000) { // 1 hour cache
        return data.appointments;
      }
    }
    return [];
  }

  getCachedPatientData() {
    const cached = sessionStorage.getItem('patient_cache');
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < 300000) { // 5 minute cache
        return data.patient;
      }
    }
    return null;
  }

  getEmergencyFallback() {
    return {
      emergency: true,
      contact: {
        phone: '(11) 99999-9999',
        whatsapp: '5511999999999',
        address: 'Rua Example, 123 - São Paulo, SP'
      },
      instructions: 'For medical emergencies, please call immediately or visit our clinic.'
    };
  }

  alertMedicalSystemFailure(error) {
    // Send alert to monitoring system
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'medical_system_failure', {
        event_category: 'error',
        event_label: error.message,
        value: this.failureCount
      });
    }

    // Log for medical audit trail
    console.error('MEDICAL SYSTEM FAILURE:', {
      timestamp: new Date().toISOString(),
      failureCount: this.failureCount,
      error: error.message,
      state: this.state
    });
  }

  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt,
      isHealthy: this.state === 'CLOSED' && this.failureCount === 0
    };
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = Date.now();
    console.log('Circuit breaker manually reset');
  }
}

// Singleton instance for the medical system
const medicalApiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3, // Lower threshold for medical systems
  resetTimeout: 30000, // 30 seconds
  timeout: 5000, // 5 seconds timeout
  monitoringWindow: 60000 // 1 minute window
});

// Enhanced fetch with circuit breaker
export const medicalApiFetch = async (endpoint, options = {}) => {
  const requestFn = async ({ signal }) => {
    const response = await fetch(endpoint, {
      ...options,
      signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Medical-System': 'saraiva-vision',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  };

  return medicalApiCircuitBreaker.call(endpoint, requestFn);
};

export { CircuitBreaker, medicalApiCircuitBreaker };
export default medicalApiCircuitBreaker;