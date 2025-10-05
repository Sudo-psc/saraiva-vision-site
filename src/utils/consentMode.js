/**
 * Consent Mode v2 implementation for Saraiva Vision
 * Handles LGPD compliance and Google Consent Mode integration
 */

// Default consent state (conservative - deny by default)
const DEFAULT_CONSENT = {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  functionality_storage: 'granted',
  personalization_storage: 'denied',
  security_storage: 'granted',
};

// All consent types
const ALL_CONSENT_TYPES = Object.keys(DEFAULT_CONSENT);

// Necessary consent types (always granted)
const NECESSARY_CONSENT_TYPES = ['functionality_storage', 'security_storage'];

// Consent storage key
const CONSENT_STORAGE_KEY = 'saraiva_vision_consent';

// Current consent state
let currentConsent = { ...DEFAULT_CONSENT };

// Listeners for consent changes
const consentListeners = new Set();

/**
 * Get current consent state
 * @returns {Object} Current consent state
 */
export function getConsent() {
  if (typeof window === 'undefined') {
    return DEFAULT_CONSENT;
  }

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      currentConsent = { ...DEFAULT_CONSENT, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load consent from localStorage:', error);
  }

  return currentConsent;
}

/**
 * Set consent state
 * @param {Object} newConsent - New consent state
 */
export function setConsent(newConsent) {
  const updatedConsent = { ...currentConsent, ...newConsent };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updatedConsent));
      localStorage.setItem(`${CONSENT_STORAGE_KEY}_timestamp`, new Date().toISOString());
    } catch (error) {
      console.warn('Failed to save consent to localStorage:', error);
    }
  }

  currentConsent = updatedConsent;

  // Notify listeners
  consentListeners.forEach(listener => {
    try {
      listener(updatedConsent);
    } catch (error) {
      console.error('Error in consent listener:', error);
    }
  });

  // Update Google Consent Mode if gtag is available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', updatedConsent);
  }

  // Update Meta Pixel consent if fbq is available
  if (typeof window !== 'undefined' && window.fbq) {
    const adConsent = updatedConsent.ad_storage === 'granted' ? 'grant' : 'revoke';
    window.fbq('consent', adConsent);
  }
}

/**
 * Check if consent is granted for a specific type
 * @param {string} consentType - Type of consent to check
 * @returns {boolean} True if consent is granted
 */
export function hasConsent(consentType) {
  const consent = getConsent();
  return consent[consentType] === 'granted';
}

/**
 * Add a listener for consent changes
 * @param {Function} listener - Function to call when consent changes
 * @returns {Function} Unsubscribe function
 */
export function onConsentChange(listener) {
  consentListeners.add(listener);

  // Return unsubscribe function
  return () => {
    consentListeners.delete(listener);
  };
}

/**
 * Initialize consent mode
 * Should be called early in the application lifecycle
 */
export function initializeConsentMode() {
  if (typeof window === 'undefined') return;

  // Load existing consent
  getConsent();

  // Set up Google Consent Mode defaults if gtag is available
  if (window.gtag) {
    window.gtag('consent', 'default', currentConsent);
  }

  // Set up Meta Pixel consent defaults if fbq is available
  if (window.fbq) {
    const adConsent = currentConsent.ad_storage === 'granted' ? 'grant' : 'revoke';
    window.fbq('consent', adConsent);
  }

  console.log('✅ Consent Mode initialized with defaults:', currentConsent);
}

/**
 * Show consent banner (placeholder for UI integration)
 * @param {Object} options - Banner options
 */
export function showConsentBanner(options = {}) {
  // This would typically trigger a UI component
  // For now, just log that it should be shown
  console.log('Consent banner should be displayed', options);

  // In a real implementation, this would show a modal or banner
  // and call setConsent with user choices
}

/**
 * Reset consent to defaults
 */
export function resetConsent() {
  setConsent(DEFAULT_CONSENT);
}

/**
 * Get consent statistics for analytics
 * @returns {Object} Consent statistics
 */
export function getConsentStats() {
  const consent = getConsent();

  return {
    granted: Object.entries(consent).filter(([, value]) => value === 'granted').length,
    denied: Object.entries(consent).filter(([, value]) => value === 'denied').length,
    total: Object.keys(consent).length,
    breakdown: consent,
  };
}

/**
 * Get current consent status
 * @returns {Object} Current consent state
 */
export function getConsentStatus() {
  return getConsent();
}

/**
 * Check if user has made a consent choice
 * @returns {boolean} True if user has explicitly set consent
 */
export function hasUserConsent() {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored !== null;
  } catch {
    return false;
  }
}

/**
 * Accept all consent types
 * @returns {Object} Updated consent state
 */
export function acceptAll() {
  const allGranted = Object.fromEntries(
    ALL_CONSENT_TYPES.map(type => [type, 'granted'])
  );
  setConsent(allGranted);
  return allGranted;
}

/**
 * Accept only necessary consent types
 * @returns {Object} Updated consent state
 */
export function acceptNecessaryOnly() {
  const necessaryGranted = Object.fromEntries(
    ALL_CONSENT_TYPES.map(type =>
      NECESSARY_CONSENT_TYPES.includes(type) ? [type, 'granted'] : [type, 'denied']
    )
  );
  setConsent(necessaryGranted);
  return necessaryGranted;
}

/**
 * Check if consent banner should be shown
 * @returns {boolean} True if banner should be shown
 */
export function shouldShowConsentBanner() {
  return !hasUserConsent();
}

/**
 * Get consent for GDPR/LGPD compliance display
 * @returns {Object} Consent data for display
 */
export function getConsentForDisplay() {
  const consent = getConsent();
  const stats = getConsentStats();

  return {
    consent,
    stats,
    hasUserConsent: hasUserConsent(),
    lastUpdated: typeof window !== 'undefined' ?
      localStorage.getItem(`${CONSENT_STORAGE_KEY}_timestamp`) : null,
  };
}

// Initialize on module load
if (typeof window !== 'undefined') {
  // Initialize consent mode when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeConsentMode);
  } else {
    initializeConsentMode();
  }
}