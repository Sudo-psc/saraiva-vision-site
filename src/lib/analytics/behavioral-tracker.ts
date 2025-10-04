'use client';

import { BehavioralData, DeviceInfo, TrafficSource, InteractionEvent } from '@/middleware/utils/scoring.engine';

interface BehavioralEvent {
  type: 'pageview' | 'scroll' | 'click' | 'time' | 'exit';
  timestamp: number;
  payload: Record<string, unknown>;
}

class BehavioralTracker {
  private events: BehavioralEvent[] = [];
  private sessionStart: number = Date.now();
  private currentPage: string = '';
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.loadStoredData();
      this.initialize();
    }
  }
  
  private loadStoredData() {
    try {
      const stored = localStorage.getItem('behavioral_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.events = data.events || [];
        this.sessionStart = data.sessionStart || Date.now();
      }
    } catch (error) {
      console.error('Failed to load behavioral data:', error);
    }
  }
  
  private initialize() {
    this.trackPageView();
    this.trackScrollDepth();
    this.trackTimeOnPage();
    this.trackInteractions();
  }
  
  private trackPageView() {
    this.currentPage = window.location.pathname;
    this.addEvent({
      type: 'pageview',
      timestamp: Date.now(),
      payload: {
        path: this.currentPage,
        referrer: document.referrer,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
    });
  }
  
  private trackScrollDepth() {
    let maxScroll = 0;
    
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        if ([25, 50, 75, 100].includes(scrollPercent)) {
          this.addEvent({
            type: 'scroll',
            timestamp: Date.now(),
            payload: { depth: scrollPercent, page: this.currentPage },
          });
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
  
  private trackTimeOnPage() {
    const startTime = Date.now();
    
    const beforeUnload = () => {
      const timeSpent = Date.now() - startTime;
      
      this.addEvent({
        type: 'time',
        timestamp: Date.now(),
        payload: {
          page: this.currentPage,
          duration: timeSpent,
        },
      });
      
      this.persist();
    };
    
    window.addEventListener('beforeunload', beforeUnload);
  }
  
  private trackInteractions() {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.matches('a, button, [role="button"]')) {
        this.addEvent({
          type: 'click',
          timestamp: Date.now(),
          payload: {
            element: target.tagName,
            text: target.textContent?.slice(0, 50),
            href: (target as HTMLAnchorElement).href,
          },
        });
      }
    });
  }
  
  private addEvent(event: BehavioralEvent) {
    this.events.push(event);
    
    if (this.events.length % 10 === 0) {
      this.persist();
    }
  }
  
  private persist() {
    try {
      const data = {
        events: this.events,
        sessionStart: this.sessionStart,
      };
      
      localStorage.setItem('behavioral_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist behavioral data:', error);
    }
  }
  
  public getAnalytics(): BehavioralData {
    return {
      pagesVisited: [...new Set(
        this.events
          .filter(e => e.type === 'pageview')
          .map(e => e.payload.path as string)
      )],
      timeOnPages: this.events
        .filter(e => e.type === 'time')
        .reduce((acc, e) => {
          acc[e.payload.page as string] = e.payload.duration as number;
          return acc;
        }, {} as Record<string, number>),
      interactions: this.events.filter(e => e.type === 'click') as InteractionEvent[],
      deviceInfo: this.getDeviceInfo(),
      trafficSource: this.getTrafficSource(),
    };
  }
  
  private getDeviceInfo(): DeviceInfo {
    return {
      type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      browser: this.detectBrowser(),
      os: this.detectOS(),
    };
  }
  
  private getTrafficSource(): TrafficSource {
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
      referrer,
      campaign: urlParams.get('utm_campaign') || undefined,
      source: urlParams.get('utm_source') || this.categorizeReferrer(referrer),
      medium: urlParams.get('utm_medium') || undefined,
    };
  }
  
  private categorizeReferrer(referrer: string): string {
    if (!referrer) return 'direct';
    if (/google/i.test(referrer)) return 'google';
    if (/facebook|instagram/i.test(referrer)) return 'social';
    return 'referral';
  }
  
  private detectBrowser(): string {
    const ua = navigator.userAgent;
    if (/Chrome/i.test(ua)) return 'chrome';
    if (/Safari/i.test(ua)) return 'safari';
    if (/Firefox/i.test(ua)) return 'firefox';
    return 'other';
  }
  
  private detectOS(): string {
    const ua = navigator.userAgent;
    if (/Windows/i.test(ua)) return 'windows';
    if (/Mac/i.test(ua)) return 'macos';
    if (/Android/i.test(ua)) return 'android';
    if (/iOS|iPhone|iPad/i.test(ua)) return 'ios';
    return 'other';
  }
  
  public clear() {
    this.events = [];
    localStorage.removeItem('behavioral_data');
  }
}

export const behavioralTracker = new BehavioralTracker();
