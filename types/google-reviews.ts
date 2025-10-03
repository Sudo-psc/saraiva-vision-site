export interface GoogleReviewer {
  displayName: string;
  profilePhotoUrl: string;
  isAnonymous?: boolean;
}

export interface GoogleReview {
  id: string;
  reviewer: GoogleReviewer;
  starRating: number;
  comment: string;
  createTime: string;
  relativeTimeDescription?: string;
  updateTime?: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  } | null;
  isRecent?: boolean;
  hasResponse?: boolean;
  wordCount?: number;
}

export interface NormalizedReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  text: string;
  createTime: string;
  reviewer?: GoogleReviewer;
  starRating?: number;
  comment?: string;
  updateTime?: string | null;
  reviewReply?: {
    comment: string;
    updateTime: string;
  } | null;
  isRecent?: boolean;
  hasResponse?: boolean;
  wordCount?: number;
}

export interface PlaceDetails {
  name: string;
  location: any;
  formattedAddress: string;
  rating: number;
  userRatingCount: number;
  url: string;
  reviews: GoogleReview[];
  photos: any[];
  businessStatus: string;
  priceLevel: number | null;
  fetchedAt: string;
  error?: string;
  openingHours?: {
    weekdayDescriptions?: string[];
  };
}

export interface ReviewStats {
  overview: {
    totalReviews: number;
    averageRating: number;
    recentReviews: number;
    responseRate: number;
  };
  distribution?: Record<number, number>;
  sentiment?: {
    positive: number;
    neutral: number;
    negative: number;
    positivePercentage: number;
    negativePercentage: number;
  };
}
