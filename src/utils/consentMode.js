/**
 * Google Consent Mode v2 Implementation
 * Manages user consent for analytics, advertising, and personalization
 */

// Consent types and their default states
const CONSENT_TYPES = {
  // Analytics and measurement
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  
  // Functionality (usually granted for basic site operation)
  functionality_storage: 'granted',
  security_storage: 'granted',
  
  // Personalization
  personalization_storage: 'denied'
};

// Regional settings for consent defaults
const REGIONAL_DEFAULTS = {
  // European Economic Area
  EEA: {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  },
  // Brazil (LGPD)
  BR: {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  },
  // Default for other regions
  DEFAULT: {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted'
  }
};

class ConsentManager {
  constructor() {
    this.consentKey = 'user-consent-v2';
    this.consentTimestamp = 'consent-timestamp';
    this.consentVersion = '2.0';
    this.callbacks = new Set();
    
    // Initialize Google Consent Mode
    this.initializeGoogleConsent();
  }

  initializeGoogleConsent() {
    // Load gtag if not already loaded
    if (typeof window === 'undefined') return;
    
    // Initialize Google Consent Mode with defaults
    if (typeof gtag !== 'undefined') {
      // Set default consent state
      gtag('consent', 'default', {
        ...this.getRegionalDefaults(),
        wait_for_update: 2000, // Wait up to 2 seconds for user interaction
      });
      
      // Apply saved consent if exists
      const savedConsent = this.getStoredConsent();
      if (savedConsent) {
        this.updateGoogleConsent(savedConsent);
      }
    } else {
      // Queue consent commands for when gtag loads
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      
      gtag('consent', 'default', {
        ...this.getRegionalDefaults(),
        wait_for_update: 2000,
      });
    }
  }

  getRegionalDefaults() {
    // Detect user's region (simplified)
    const userRegion = this.detectUserRegion();
    return REGIONAL_DEFAULTS[userRegion] || REGIONAL_DEFAULTS.DEFAULT;
  }

  detectUserRegion() {
    // Simple region detection - in production, use more sophisticated method
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language.toLowerCase();
    
    // Brazil detection
    if (timeZone.includes('America/Sao_Paulo') || language.includes('pt-br')) {
      return 'BR';
    }
    
    // European detection (simplified)
    if (timeZone.includes('Europe/') || 
        ['de', 'fr', 'it', 'es', 'nl', 'pt'].some(lang => language.includes(lang))) {
      return 'EEA';
    }
    
    return 'DEFAULT';
  }

  // Get stored consent preferences
  getStoredConsent() {
    try {
      const stored = localStorage.getItem(this.consentKey);
      if (stored) {
        const consent = JSON.parse(stored);
        // Check if consent is still valid (e.g., within 13 months)
        const timestamp = localStorage.getItem(this.consentTimestamp);
        if (timestamp && Date.now() - parseInt(timestamp) < 13 * 30 * 24 * 60 * 60 * 1000) {
          return consent;
        }
      }
    } catch (error) {
      console.warn('Error reading consent preferences:', error);
    }
    return null;
  }

  // Store consent preferences
  storeConsent(consent) {
    try {
      localStorage.setItem(this.consentKey, JSON.stringify(consent));
      localStorage.setItem(this.consentTimestamp, Date.now().toString());
    } catch (error) {
      console.warn('Error storing consent preferences:', error);
    }
  }

  // Update Google Consent Mode
  updateGoogleConsent(consent) {
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', consent);
    }
  }

  // Grant consent for specific types
  grantConsent(consentTypes) {
    const updatedConsent = {};
    consentTypes.forEach(type => {
      if (type in CONSENT_TYPES) {
        updatedConsent[type] = 'granted';
      }
    });
    
    // Store the updated consent
    const currentConsent = this.getStoredConsent() || {};
    const newConsent = { ...currentConsent, ...updatedConsent };
    this.storeConsent(newConsent);
    
    // Update Google Consent Mode
    this.updateGoogleConsent(updatedConsent);
    
    // Notify callbacks
    this.notifyCallbacks(newConsent);
    
    return newConsent;
  }

  // Deny consent for specific types
  denyConsent(consentTypes) {
    const updatedConsent = {};
    consentTypes.forEach(type => {
      if (type in CONSENT_TYPES) {
        updatedConsent[type] = 'denied';
      }
    });
    
    // Store the updated consent
    const currentConsent = this.getStoredConsent() || {};
    const newConsent = { ...currentConsent, ...updatedConsent };
    this.storeConsent(newConsent);
    
    // Update Google Consent Mode
    this.updateGoogleConsent(updatedConsent);
    
    // Notify callbacks
    this.notifyCallbacks(newConsent);
    
    return newConsent;
  }

  // Get current consent status
  getConsentStatus() {
    const stored = this.getStoredConsent();
    if (stored) return stored;
    
    // Return regional defaults if no stored consent
    return this.getRegionalDefaults();
  }

  // Check if specific consent is granted
  hasConsent(consentType) {
    const consent = this.getConsentStatus();
    return consent[consentType] === 'granted';
  }

  // Predefined consent profiles
  acceptAll() {
    const allGranted = {};
    Object.keys(CONSENT_TYPES).forEach(type => {
      allGranted[type] = 'granted';
    });
    
    this.storeConsent(allGranted);
    this.updateGoogleConsent(allGranted);
    this.notifyCallbacks(allGranted);
    
    return allGranted;
  }

  acceptNecessaryOnly() {
    const necessaryOnly = {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
      personalization_storage: 'denied'
    };
    
    this.storeConsent(necessaryOnly);
    this.updateGoogleConsent(necessaryOnly);
    this.notifyCallbacks(necessaryOnly);
    
    return necessaryOnly;
  }

  // Custom consent configuration
  setCustomConsent(consentConfig) {
    // Validate consent config
    const validatedConsent = {};
    Object.keys(consentConfig).forEach(type => {
      if (type in CONSENT_TYPES && ['granted', 'denied'].includes(consentConfig[type])) {
        validatedConsent[type] = consentConfig[type];
      }
    });
    
    this.storeConsent(validatedConsent);
    this.updateGoogleConsent(validatedConsent);
    this.notifyCallbacks(validatedConsent);
    
    return validatedConsent;
  }

  // Register callback for consent changes
  onConsentChange(callback) {
    this.callbacks.add(callback);
    
    // Return unregister function
    return () => this.callbacks.delete(callback);
  }

  // Notify all callbacks of consent changes
  notifyCallbacks(consent) {
    this.callbacks.forEach(callback => {
      try {
        callback(consent);
      } catch (error) {
        console.error('Error in consent callback:', error);
      }
    });
  }

  // Reset all consent (for testing or user request)
  resetConsent() {
    try {
      localStorage.removeItem(this.consentKey);
      localStorage.removeItem(this.consentTimestamp);
      
      // Reset to regional defaults
      const defaults = this.getRegionalDefaults();
      this.updateGoogleConsent(defaults);
      this.notifyCallbacks(defaults);
      
      return defaults;
    } catch (error) {
      console.error('Error resetting consent:', error);
    }
  }

  // Get consent banner display status
  shouldShowConsentBanner() {
    const consent = this.getStoredConsent();
    return !consent; // Show banner if no stored consent
  }
}

// Create singleton instance
const consentManager = new ConsentManager();

// Export convenience functions
export const grantConsent = (types) => consentManager.grantConsent(types);
export const denyConsent = (types) => consentManager.denyConsent(types);
export const getConsentStatus = () => consentManager.getConsentStatus();
export const hasConsent = (type) => consentManager.hasConsent(type);
export const acceptAll = () => consentManager.acceptAll();
export const acceptNecessaryOnly = () => consentManager.acceptNecessaryOnly();
export const setCustomConsent = (config) => consentManager.setCustomConsent(config);
export const onConsentChange = (callback) => consentManager.onConsentChange(callback);
export const resetConsent = () => consentManager.resetConsent();
export const shouldShowConsentBanner = () => consentManager.shouldShowConsentBanner();

export default consentManager;