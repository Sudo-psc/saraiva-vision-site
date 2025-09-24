/**
 * Simple LGPD Consent Manager
 * Placeholder implementation for consent tracking
 */

class ConsentManager {
  constructor() {
    this.storageKey = 'saraiva_lgpd_consent';
  }

  hasValidConsent() {
    try {
      const consent = localStorage.getItem(this.storageKey);
      if (!consent) return true; // Default to true for now
      
      const consentData = JSON.parse(consent);
      return consentData.accepted && new Date(consentData.timestamp) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year
    } catch (error) {
      console.debug('[LGPD] Error checking consent:', error);
      return true; // Default to true if error
    }
  }

  grantConsent() {
    try {
      const consentData = {
        accepted: true,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem(this.storageKey, JSON.stringify(consentData));
      console.debug('[LGPD] Consent granted');
    } catch (error) {
      console.debug('[LGPD] Error granting consent:', error);
    }
  }

  revokeConsent() {
    try {
      localStorage.removeItem(this.storageKey);
      console.debug('[LGPD] Consent revoked');
    } catch (error) {
      console.debug('[LGPD] Error revoking consent:', error);
    }
  }
}

export const consentManager = new ConsentManager();
export default consentManager;
