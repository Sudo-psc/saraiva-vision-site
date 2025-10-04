/**
 * Analytics Type Definitions
 * Event tracking, user behavior, and LGPD-compliant analytics
 */

// ==================== Analytics Events ====================

export type EventCategory =
  | 'engagement'
  | 'navigation'
  | 'conversion'
  | 'form'
  | 'media'
  | 'social'
  | 'appointment'
  | 'error';

export type EventAction =
  | 'click'
  | 'view'
  | 'submit'
  | 'play'
  | 'pause'
  | 'download'
  | 'share'
  | 'scroll'
  | 'search'
  | 'book'
  | 'error';

export interface BaseAnalyticsEvent {
  category: EventCategory;
  action: EventAction;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId?: string;
  userId?: string;
}

// ==================== Specific Event Types ====================

export interface PageViewEvent extends BaseAnalyticsEvent {
  category: 'navigation';
  action: 'view';
  page: string;
  referrer?: string;
  pathname: string;
  search?: string;
}

export interface CTAClickEvent extends BaseAnalyticsEvent {
  category: 'engagement';
  action: 'click';
  ctaId: string;
  ctaText: string;
  ctaLocation: string;
  destinationUrl?: string;
}

export interface FormEvent extends BaseAnalyticsEvent {
  category: 'form';
  formId: string;
  formName: string;
  fieldName?: string;
  success?: boolean;
  errorMessage?: string;
}

export interface AppointmentEvent extends BaseAnalyticsEvent {
  category: 'appointment';
  action: 'book';
  appointmentType?: string;
  profile?: 'familiar' | 'jovem' | 'senior';
  success: boolean;
}

export interface MediaEvent extends BaseAnalyticsEvent {
  category: 'media';
  action: 'play' | 'pause';
  mediaType: 'video' | 'audio' | 'podcast';
  mediaTitle: string;
  duration?: number;
  currentTime?: number;
}

export interface SocialClickEvent extends BaseAnalyticsEvent {
  category: 'social';
  action: 'click';
  platform: 'instagram' | 'whatsapp' | 'facebook' | 'spotify';
  context: string;
}

export interface BlogEvent extends BaseAnalyticsEvent {
  category: 'engagement';
  action: 'view';
  postId: number;
  postTitle: string;
  readTime?: number;
  scrollDepth?: number;
}

export interface DownloadEvent extends BaseAnalyticsEvent {
  category: 'engagement';
  action: 'download';
  fileName: string;
  fileType: string;
  fileSize?: number;
}

export interface ErrorEvent extends BaseAnalyticsEvent {
  category: 'error';
  action: 'error';
  errorType: 'javascript' | 'network' | 'api' | 'render';
  errorMessage: string;
  errorStack?: string;
  componentName?: string;
}

export type AnalyticsEvent =
  | PageViewEvent
  | CTAClickEvent
  | FormEvent
  | AppointmentEvent
  | MediaEvent
  | SocialClickEvent
  | BlogEvent
  | DownloadEvent
  | ErrorEvent;

// ==================== LGPD Compliance ====================

export interface ConsentStatus {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: number;
  version: string;
}

export interface UserPreferences {
  consent: ConsentStatus;
  doNotTrack: boolean;
  anonymousId?: string;
}

export interface LGPDCompliantEvent extends BaseAnalyticsEvent {
  anonymized: boolean;
  consentGiven: boolean;
  privacyLevel: 'anonymous' | 'pseudonymous' | 'identified';
}

// ==================== Analytics Configuration ====================

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  respectDoNotTrack: boolean;
  requireConsent: boolean;
  anonymizeIp: boolean;
  cookieExpiration: number; // in days
  sessionTimeout: number; // in minutes
  batchSize: number;
  batchInterval: number; // in ms
}

export interface AnalyticsProvider {
  name: string;
  enabled: boolean;
  apiKey?: string;
  config?: Record<string, any>;
}

// ==================== Analytics State ====================

export interface AnalyticsState {
  initialized: boolean;
  consentGiven: boolean;
  sessionId: string | null;
  userId: string | null;
  eventsQueue: AnalyticsEvent[];
  lastEventTime: number | null;
}

// ==================== Analytics Hooks ====================

export interface UseAnalyticsReturn {
  trackEvent: (event: Partial<AnalyticsEvent>) => void;
  trackPageView: (page: string, additionalData?: Record<string, any>) => void;
  trackCTAClick: (ctaId: string, ctaText: string, location: string) => void;
  trackFormSubmit: (formId: string, success: boolean, errorMessage?: string) => void;
  trackAppointment: (appointmentType: string, success: boolean) => void;
  trackMediaPlay: (mediaType: 'video' | 'audio' | 'podcast', title: string) => void;
  trackSocialClick: (platform: string, context: string) => void;
  trackDownload: (fileName: string, fileType: string) => void;
  trackError: (error: Error, errorInfo?: any) => void;
  setUserConsent: (consent: ConsentStatus) => void;
  getUserConsent: () => ConsentStatus | null;
  isConsentGiven: boolean;
  isInitialized: boolean;
}

// ==================== Analytics Metrics ====================

export interface SessionMetrics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  pageViews: number;
  events: number;
  bounceRate?: number;
  exitPage?: string;
}

export interface UserBehaviorMetrics {
  totalSessions: number;
  averageSessionDuration: number;
  averagePageViewsPerSession: number;
  mostVisitedPages: Array<{ page: string; visits: number }>;
  mostClickedCTAs: Array<{ ctaId: string; clicks: number }>;
  conversionRate?: number;
}

export interface EngagementMetrics {
  totalEvents: number;
  eventsByCategory: Record<EventCategory, number>;
  eventsByAction: Record<EventAction, number>;
  topEngagementPages: Array<{ page: string; score: number }>;
  averageTimeOnPage: number;
  scrollDepth: number;
}

// ==================== Analytics Reports ====================

export interface AnalyticsReport {
  startDate: string;
  endDate: string;
  totalUsers: number;
  totalSessions: number;
  totalPageViews: number;
  totalEvents: number;
  sessionMetrics: SessionMetrics[];
  userBehavior: UserBehaviorMetrics;
  engagement: EngagementMetrics;
  topContent: Array<{ title: string; views: number }>;
  conversionFunnel?: {
    step: string;
    users: number;
    dropoffRate: number;
  }[];
}

// ==================== Real-time Analytics ====================

export interface RealTimeMetrics {
  activeUsers: number;
  currentPageViews: Record<string, number>;
  recentEvents: AnalyticsEvent[];
  topPages: Array<{ page: string; users: number }>;
  timestamp: number;
}

export interface RealTimeAlert {
  type: 'spike' | 'drop' | 'error' | 'anomaly';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
}

// ==================== A/B Testing ====================

export interface Experiment {
  id: string;
  name: string;
  description: string;
  variants: Array<{
    id: string;
    name: string;
    weight: number;
  }>;
  startDate: string;
  endDate?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
}

export interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  userId: string;
  timestamp: number;
}

export interface ExperimentResults {
  experimentId: string;
  variants: Array<{
    id: string;
    name: string;
    users: number;
    conversions: number;
    conversionRate: number;
  }>;
  winner?: string;
  confidence: number;
}

// ==================== Heatmap Data ====================

export interface HeatmapClick {
  x: number;
  y: number;
  elementSelector: string;
  timestamp: number;
}

export interface HeatmapData {
  page: string;
  clicks: HeatmapClick[];
  scrollDepth: number[];
  viewportSize: { width: number; height: number };
  deviceType: 'mobile' | 'tablet' | 'desktop';
}
