'use client';

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  personalization: boolean;
  marketing: boolean;
  timestamp: number;
}

export class CookieConsentManager {
  private static STORAGE_KEY = 'cookie_consent';
  
  static getConsent(): CookieConsent | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
  
  static setConsent(consent: Omit<CookieConsent, 'timestamp'>) {
    if (typeof window === 'undefined') return;
    
    const fullConsent: CookieConsent = {
      ...consent,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(fullConsent));
    
    if (!consent.personalization) {
      this.clearPersonalizationData();
    }
    
    if (!consent.analytics) {
      this.clearAnalyticsData();
    }
  }
  
  static clearPersonalizationData() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('persona_hint');
    localStorage.removeItem('behavioral_data');
    
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name.startsWith('persona_')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  }
  
  static clearAnalyticsData() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('behavioral_data');
  }
  
  static hasConsent(category: keyof Omit<CookieConsent, 'timestamp'>): boolean {
    const consent = this.getConsent();
    return consent ? consent[category] : false;
  }
  
  static clearAllConsent() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.STORAGE_KEY);
    this.clearPersonalizationData();
    this.clearAnalyticsData();
  }
}
