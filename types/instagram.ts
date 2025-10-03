export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  username?: string;
  fallback?: boolean;
}

export interface InstagramStats {
  likes?: number;
  comments?: number;
  engagement?: number;
}

export interface InstagramFeedProps {
  maxPosts?: number;
  layout?: 'grid' | 'carousel';
  showStats?: boolean;
  showCaption?: boolean;
  className?: string;
}

export interface InstagramApiResponse {
  success: boolean;
  posts: InstagramPost[];
  cached?: boolean;
  cacheAge?: number;
  total?: number;
  timestamp: string;
  source?: string;
}

export interface InstagramError {
  success: false;
  error: string;
  timestamp: string;
}
