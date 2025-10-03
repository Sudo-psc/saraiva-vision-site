/**
 * API Type Definitions
 * Saraiva Vision - Next.js API Routes
 */

// ============================================================================
// Contact API Types
// ============================================================================

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  honeypot?: string; // Anti-spam field
}

export interface ContactResponse {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
  code?: string;
}

// ============================================================================
// Google Reviews API Types
// ============================================================================

export interface GoogleReview {
  id: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl: string | null;
    isAnonymous: boolean;
  };
  starRating: number;
  comment: string;
  createTime: string;
  updateTime: string;
  reviewReply: string | null;
  isRecent: boolean;
  hasResponse: boolean;
  wordCount: number;
  language: string;
  originalRating: number;
  relativeTimeDescription: string | null;
}

export interface ReviewsStats {
  overview: {
    totalReviews: number;
    averageRating: number;
    recentReviews: number;
    responseRate: number;
  };
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    positivePercentage: number;
    negativePercentage: number;
  };
  engagement: {
    averageWordCount: number;
    reviewsWithPhotos: number;
    businessResponses: number;
    responseRate: number;
  };
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  lastUpdated: string;
}

export interface ReviewsResponse {
  success: boolean;
  data?: {
    reviews: GoogleReview[];
    stats: ReviewsStats;
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
    metadata: {
      fetchedAt: string;
      source: string;
      placeId: string;
      placeName: string;
      totalReviews: number;
      averageRating: number;
    };
  };
  error?: string;
  timestamp: string;
}

// ============================================================================
// Blog API Types
// ============================================================================

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  image: string;
  ogImage?: string;
  featured: boolean;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  relatedPodcasts?: Array<{
    id: string;
    title: string;
    spotifyUrl: string;
    spotifyShowId: string;
  }>;
}

export interface BlogListResponse {
  success: boolean;
  data?: {
    posts: BlogPost[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    categories: string[];
  };
  error?: string;
}

export interface BlogPostResponse {
  success: boolean;
  data?: BlogPost;
  error?: string;
}

// ============================================================================
// Profile API Types
// ============================================================================

export interface ProfilePreference {
  profile: 'familiar' | 'jovem' | 'senior';
  detectedAt: string;
  source: 'manual' | 'auto';
  confidence?: number;
}

export interface ProfileResponse {
  success: boolean;
  data?: ProfilePreference;
  message?: string;
  error?: string;
}

// ============================================================================
// Subscription API Types (NEW for Jovem profile)
// ============================================================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

export interface CreateSubscriptionRequest {
  planId: string;
  customerEmail: string;
  customerName: string;
  paymentMethodId?: string;
}

export interface CreateSubscriptionResponse {
  success: boolean;
  data?: {
    subscriptionId: string;
    clientSecret: string;
    status: string;
  };
  error?: string;
}

export interface SubscriptionDetailsResponse {
  success: boolean;
  data?: {
    subscriptionId: string;
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    plan: SubscriptionPlan;
  };
  error?: string;
}

// ============================================================================
// Health Check API Types
// ============================================================================

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  service: string;
  environment: string;
  version: string;
  services: {
    [key: string]: {
      status: 'ok' | 'error' | 'degraded';
      configured: boolean;
      errors?: string[];
    };
  };
  config?: {
    nodeEnv: string;
    [key: string]: string | boolean | undefined;
  };
}

// ============================================================================
// Error Types
// ============================================================================

export interface APIError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
}

// ============================================================================
// Generic API Response
// ============================================================================

export type APIResponse<T> =
  | ({ success: true } & T)
  | APIError;

// ============================================================================
// Rate Limiting
// ============================================================================

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}
