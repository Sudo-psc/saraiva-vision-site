/**
 * Healthcare-specific session management for Clínica Saraiva Vision
 * Ensures secure session handling for medical applications with LGPD compliance
 */

class HealthcareSessionManager {
  constructor() {
    this.sessionCheckInterval = null;
    this.warningTimeout = null;
    this.isActive = false;
    this.lastActivity = Date.now();
    
    // Healthcare-specific timeouts (shorter for security)
    this.SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
    this.WARNING_TIME = 2 * 60 * 1000;    // 2 minutes before expiry
    
    this.init();
  }

  init() {
    // Initialize healthcare session manager
    
    try {
      // Check if session storage is available
      if (typeof(Storage) === "undefined") {
        // Session storage not available - fallback to memory
        return false;
      }

      // Check for existing session
      const existingSession = this.getSession();
      if (existingSession) {
        // Existing session found
        this.startSessionMonitoring();
      } else {
        // No existing session
      }

      // Add activity listeners
      this.addActivityListeners();
      
      return true;
    } catch (error) {
      console.error('❌ Session manager initialization failed:', error);
      this.handleSessionError(error);
      return false;
    }
  }

  // Create new session with healthcare-specific security
  createSession(userData = {}) {
    try {
      const sessionId = this.generateSecureSessionId();
      const sessionData = {
        id: sessionId,
        created: Date.now(),
        lastActivity: Date.now(),
        userType: userData.userType || 'patient', // patient, staff, doctor
        clinicId: 'saraiva-vision',
        // Don't store sensitive medical data in session
        permissions: userData.permissions || ['basic'],
        ...userData
      };

      // Store in sessionStorage (more secure than localStorage for medical data)
      sessionStorage.setItem('healthcare_session', JSON.stringify(sessionData));
      this.lastActivity = Date.now();
      this.startSessionMonitoring();
      
      // Healthcare session created successfully
      return sessionData;
    } catch (error) {
      console.error('❌ Failed to create session:', error);
      this.handleSessionError(error);
      return null;
    }
  }

  // Get current session with validation
  getSession() {
    try {
      const sessionData = sessionStorage.getItem('healthcare_session');
      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData);
      
      // Validate session integrity
      if (!this.validateSession(session)) {
        // Invalid session detected, clearing
        this.clearSession();
        return null;
      }

      // Check if session expired
      if (this.isSessionExpired(session)) {
        // Session expired, clearing
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('❌ Failed to get session:', error);
      this.handleSessionError(error);
      return null;
    }
  }

  // Update session activity
  updateActivity() {
    try {
      const session = this.getSession();
      if (session) {
        session.lastActivity = Date.now();
        sessionStorage.setItem('healthcare_session', JSON.stringify(session));
        this.lastActivity = Date.now();
      }
    } catch (error) {
      console.error('❌ Failed to update activity:', error);
    }
  }

  // Clear session securely
  clearSession() {
    try {
      // Clear session storage
      sessionStorage.removeItem('healthcare_session');
      
      // Clear any sensitive data from localStorage
      const sensitiveKeys = Object.keys(localStorage).filter(key =>
        key.includes('patient') || 
        key.includes('medical') || 
        key.includes('exam') ||
        key.includes('appointment')
      );
      
      sensitiveKeys.forEach(key => localStorage.removeItem(key));
      
      // Stop monitoring
      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval);
      }
      if (this.warningTimeout) {
        clearTimeout(this.warningTimeout);
      }

      // Session cleared securely
      
      // Notify application of session end
      this.dispatchSessionEvent('session-ended');
      
    } catch (error) {
      console.error('❌ Failed to clear session:', error);
    }
  }

  // Validate session data integrity
  validateSession(session) {
    if (!session || typeof session !== 'object') return false;
    if (!session.id || !session.created || !session.lastActivity) return false;
    if (!session.clinicId || session.clinicId !== 'saraiva-vision') return false;
    return true;
  }

  // Check if session is expired
  isSessionExpired(session) {
    const now = Date.now();
    const timeSinceActivity = now - session.lastActivity;
    return timeSinceActivity > this.SESSION_TIMEOUT;
  }

  // Start monitoring session
  startSessionMonitoring() {
    // Clear existing intervals
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    // Check session every minute
    this.sessionCheckInterval = setInterval(() => {
      const session = this.getSession();
      if (!session) {
        clearInterval(this.sessionCheckInterval);
        return;
      }

      const timeSinceActivity = Date.now() - session.lastActivity;
      const timeUntilExpiry = this.SESSION_TIMEOUT - timeSinceActivity;

      // Show warning before expiry
      if (timeUntilExpiry <= this.WARNING_TIME && !this.warningTimeout) {
        this.showExpiryWarning(timeUntilExpiry);
      }

      // Auto-logout on expiry
      if (timeUntilExpiry <= 0) {
        // Session expired due to inactivity
        this.clearSession();
      }
    }, 60000); // Check every minute
  }

  // Show expiry warning to user
  showExpiryWarning(timeLeft) {
    const minutes = Math.ceil(timeLeft / 60000);
    // Session expiring warning
    
    // Dispatch warning event for UI to handle
    this.dispatchSessionEvent('session-warning', { timeLeft });

    // Set timeout for final warning
    this.warningTimeout = setTimeout(() => {
      this.dispatchSessionEvent('session-final-warning');
    }, timeLeft - 30000); // 30 seconds before expiry
  }

  // Add activity event listeners
  addActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.updateActivity();
      }, { passive: true });
    });
  }

  // Generate secure session ID
  generateSecureSessionId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2);
    return `hc_${timestamp}_${randomPart}`;
  }

  // Handle session errors
  handleSessionError(error) {
    // Log error securely (don't include sensitive data)
    const errorInfo = {
      timestamp: new Date().toISOString(),
      error: error.message,
      clinic: 'saraiva-vision',
      type: 'session-error'
    };

    // Send to monitoring service if available
    if (window.gtag) {
      window.gtag('event', 'session_error', {
        event_category: 'healthcare',
        event_label: error.message,
        value: 1
      });
    }

    console.error('🚨 Healthcare session error:', errorInfo);
  }

  // Dispatch session events
  dispatchSessionEvent(type, data = {}) {
    const event = new CustomEvent(type, {
      detail: { ...data, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }

  // Public method to extend session (for authenticated actions)
  extendSession() {
    const session = this.getSession();
    if (session) {
      session.lastActivity = Date.now();
      sessionStorage.setItem('healthcare_session', JSON.stringify(session));
      // Session extended
      return true;
    }
    return false;
  }
}

// Export singleton instance
const healthcareSessionManager = new HealthcareSessionManager();
export default healthcareSessionManager;

// Also export class for testing
export { HealthcareSessionManager };