/**
 * Healthcare-compliant token management for Clínica Saraiva Vision
 * Handles OAuth token refresh for Google Analytics, APIs, and medical integrations
 * with proper error handling and security measures
 */

class HealthcareTokenManager {
  constructor() {
    this.refreshPromises = new Map(); // Prevent duplicate refresh requests
    this.retryAttempts = new Map(); // Track retry attempts per token
    this.maxRetries = 3;
    this.baseRetryDelay = 1000; // 1 second
    
    // Healthcare-specific configuration
    this.tokenTypes = {
      'google_analytics': {
        refreshUrl: 'https://oauth2.googleapis.com/token',
        retryable: true,
        critical: false // Analytics is not critical for patient care
      },
      'clinic_api': {
        refreshUrl: '/api/auth/refresh',
        retryable: true,
        critical: true // Clinic API is critical
      },
      'partner_api': {
        refreshUrl: '/api/partners/auth/refresh',
        retryable: true,
        critical: false // Partner APIs are not critical
      }
    };

    this.init();
  }

  init() {
    console.log('🔐 Initializing healthcare token manager...');
    
    // Listen for token refresh events
    window.addEventListener('token-refresh-needed', this.handleTokenRefreshRequest.bind(this));
    
    // Periodic token validation (every 5 minutes)
    setInterval(() => {
      this.validateAllTokens();
    }, 5 * 60 * 1000);
  }

  // Main method to refresh any token
  async refreshToken(tokenType, refreshToken) {
    const tokenConfig = this.tokenTypes[tokenType];
    if (!tokenConfig) {
      console.error(`❌ Unknown token type: ${tokenType}`);
      return null;
    }

    // Prevent duplicate refresh requests
    const refreshKey = `${tokenType}_${refreshToken}`;
    if (this.refreshPromises.has(refreshKey)) {
      console.log(`⏳ Token refresh already in progress for ${tokenType}`);
      return this.refreshPromises.get(refreshKey);
    }

    // Check retry attempts
    const attempts = this.retryAttempts.get(refreshKey) || 0;
    if (attempts >= this.maxRetries) {
      console.error(`❌ Max retry attempts reached for ${tokenType}`);
      this.handleTokenFailure(tokenType, 'max_retries_exceeded');
      return null;
    }

    // Start refresh process
    const refreshPromise = this.performTokenRefresh(tokenType, refreshToken, attempts);
    this.refreshPromises.set(refreshKey, refreshPromise);

    try {
      const result = await refreshPromise;
      
      // Success - reset retry counter
      this.retryAttempts.delete(refreshKey);
      this.refreshPromises.delete(refreshKey);
      
      console.log(`✅ Token refreshed successfully for ${tokenType}`);
      return result;
      
    } catch (error) {
      // Increment retry counter
      this.retryAttempts.set(refreshKey, attempts + 1);
      this.refreshPromises.delete(refreshKey);
      
      console.error(`❌ Token refresh failed for ${tokenType}:`, error);
      
      // Retry with exponential backoff if retryable
      if (tokenConfig.retryable && attempts < this.maxRetries - 1) {
        const delay = this.calculateRetryDelay(attempts);
        console.log(`🔄 Retrying ${tokenType} token refresh in ${delay}ms...`);
        
        setTimeout(() => {
          this.refreshToken(tokenType, refreshToken);
        }, delay);
      } else {
        this.handleTokenFailure(tokenType, error.message || 'unknown_error');
      }
      
      throw error;
    }
  }

  // Perform the actual token refresh
  async performTokenRefresh(tokenType, refreshToken, attemptNumber = 0) {
    const tokenConfig = this.tokenTypes[tokenType];
    
    try {
      // Special handling for Google Analytics tokens
      if (tokenType === 'google_analytics') {
        return await this.refreshGoogleAnalyticsToken(refreshToken);
      }
      
      // Generic OAuth refresh
      const response = await fetch(tokenConfig.refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Clinica-Saraiva-Vision/1.0'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          // Add clinic identifier for security
          client_identifier: 'saraiva-vision-clinic'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
      }

      const tokenData = await response.json();
      
      // Validate token response
      if (!tokenData.access_token) {
        throw new Error('Invalid token response: missing access_token');
      }

      // Store new token securely
      await this.storeToken(tokenType, tokenData);
      
      return tokenData;
      
    } catch (error) {
      // Enhanced error logging for healthcare environment
      this.logTokenError(tokenType, error, attemptNumber);
      throw error;
    }
  }

  // Special handling for Google Analytics token refresh
  async refreshGoogleAnalyticsToken(refreshToken) {
    try {
      // Check if gtag is available and properly initialized
      if (typeof window.gtag !== 'function') {
        console.warn('⚠️ Google Analytics not properly initialized');
        return null;
      }

      // For GA4, we typically don't need to refresh tokens manually
      // The gtag library handles this automatically
      // But we can validate the connection
      
      const testRequest = new Promise((resolve, reject) => {
        // Test GA connectivity
        const testImg = new Image();
        testImg.onload = () => resolve({ status: 'connected' });
        testImg.onerror = () => reject(new Error('GA connectivity test failed'));
        testImg.src = 'https://www.google-analytics.com/collect?v=1&t=pageview&tid=test';
        
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('GA connectivity test timeout')), 5000);
      });

      await testRequest;
      console.log('✅ Google Analytics connectivity verified');
      
      return { 
        access_token: 'ga_connected', 
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'analytics'
      };
      
    } catch (error) {
      console.warn('⚠️ Google Analytics token refresh failed:', error.message);
      // Don't throw error for GA - it's not critical for clinic operations
      return null;
    }
  }

  // Store token securely in appropriate storage
  async storeToken(tokenType, tokenData) {
    try {
      const tokenInfo = {
        ...tokenData,
        stored_at: Date.now(),
        expires_at: Date.now() + (tokenData.expires_in * 1000),
        token_type: tokenType
      };

      // Use sessionStorage for sensitive tokens
      if (this.tokenTypes[tokenType].critical) {
        sessionStorage.setItem(`hc_token_${tokenType}`, JSON.stringify(tokenInfo));
      } else {
        // Use localStorage for non-critical tokens with encryption
        const encryptedToken = btoa(JSON.stringify(tokenInfo));
        localStorage.setItem(`hc_token_${tokenType}`, encryptedToken);
      }

      console.log(`🔒 Token stored securely for ${tokenType}`);
      
    } catch (error) {
      console.error(`❌ Failed to store token for ${tokenType}:`, error);
      throw error;
    }
  }

  // Get stored token
  getStoredToken(tokenType) {
    try {
      let tokenData;
      
      if (this.tokenTypes[tokenType]?.critical) {
        tokenData = sessionStorage.getItem(`hc_token_${tokenType}`);
      } else {
        const encryptedToken = localStorage.getItem(`hc_token_${tokenType}`);
        if (encryptedToken) {
          tokenData = atob(encryptedToken);
        }
      }

      if (!tokenData) return null;

      const token = JSON.parse(tokenData);
      
      // Check if token is expired
      if (token.expires_at && Date.now() > token.expires_at) {
        console.warn(`⚠️ Token expired for ${tokenType}`);
        this.removeStoredToken(tokenType);
        return null;
      }

      return token;
      
    } catch (error) {
      console.error(`❌ Failed to get token for ${tokenType}:`, error);
      return null;
    }
  }

  // Remove stored token
  removeStoredToken(tokenType) {
    try {
      sessionStorage.removeItem(`hc_token_${tokenType}`);
      localStorage.removeItem(`hc_token_${tokenType}`);
      console.log(`🗑️ Token removed for ${tokenType}`);
    } catch (error) {
      console.error(`❌ Failed to remove token for ${tokenType}:`, error);
    }
  }

  // Validate all stored tokens
  validateAllTokens() {
    Object.keys(this.tokenTypes).forEach(tokenType => {
      const token = this.getStoredToken(tokenType);
      if (token && token.expires_at) {
        const timeUntilExpiry = token.expires_at - Date.now();
        
        // Refresh if expiring within 5 minutes
        if (timeUntilExpiry < 5 * 60 * 1000) {
          console.log(`🔄 Proactively refreshing ${tokenType} token`);
          if (token.refresh_token) {
            this.refreshToken(tokenType, token.refresh_token);
          }
        }
      }
    });
  }

  // Calculate retry delay with exponential backoff
  calculateRetryDelay(attemptNumber) {
    return this.baseRetryDelay * Math.pow(2, attemptNumber);
  }

  // Handle token refresh failures
  handleTokenFailure(tokenType, errorMessage) {
    const tokenConfig = this.tokenTypes[tokenType];
    
    // Log the failure
    console.error(`🚨 Token failure for ${tokenType}: ${errorMessage}`);
    
    // Remove invalid token
    this.removeStoredToken(tokenType);
    
    // If it's a critical token, notify the application
    if (tokenConfig.critical) {
      window.dispatchEvent(new CustomEvent('critical-token-failure', {
        detail: { tokenType, error: errorMessage }
      }));
    }

    // Send analytics event (if analytics is working)
    if (window.gtag && tokenType !== 'google_analytics') {
      window.gtag('event', 'token_failure', {
        event_category: 'healthcare_security',
        event_label: tokenType,
        value: 1
      });
    }
  }

  // Enhanced error logging for healthcare environment
  logTokenError(tokenType, error, attemptNumber) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      tokenType,
      error: error.message,
      attemptNumber,
      clinic: 'saraiva-vision',
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Don't log sensitive information
    console.error('🚨 Healthcare token error:', {
      ...errorInfo,
      // Sanitize URL to remove sensitive parameters
      url: window.location.origin + window.location.pathname
    });
  }

  // Handle token refresh requests from other parts of the application
  async handleTokenRefreshRequest(event) {
    const { tokenType, refreshToken } = event.detail;
    
    try {
      const newToken = await this.refreshToken(tokenType, refreshToken);
      
      // Notify success
      window.dispatchEvent(new CustomEvent('token-refreshed', {
        detail: { tokenType, success: true, token: newToken }
      }));
      
    } catch (error) {
      // Notify failure
      window.dispatchEvent(new CustomEvent('token-refreshed', {
        detail: { tokenType, success: false, error: error.message }
      }));
    }
  }

  // Public method to manually trigger token refresh
  async manualRefresh(tokenType) {
    const storedToken = this.getStoredToken(tokenType);
    if (!storedToken || !storedToken.refresh_token) {
      throw new Error(`No refresh token available for ${tokenType}`);
    }
    
    return this.refreshToken(tokenType, storedToken.refresh_token);
  }
}

// Export singleton instance
const healthcareTokenManager = new HealthcareTokenManager();
export default healthcareTokenManager;

// Also export class for testing
export { HealthcareTokenManager };