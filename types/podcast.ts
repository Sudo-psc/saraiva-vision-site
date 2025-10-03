export interface PodcastHighlight {
  timestamp: string;
  text: string;
  keywords: string[];
}

export interface PodcastTranscript {
  summary: string;
  keywords: string[];
  highlights: PodcastHighlight[];
  fullTranscript: string;
}

export interface PodcastRelatedService {
  title: string;
  url: string;
  icon: string;
}

export interface PodcastRelatedPost {
  id: number;
  title: string;
  slug: string;
}

export interface PodcastEpisode {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover: string;
  duration: string;
  date: string;
  category: string;
  tags: string[];
  featured: boolean;
  spotifyShowId: string;
  spotifyEpisodeId: string;
  spotifyUrl: string;
  transcript: PodcastTranscript;
  relatedServices: PodcastRelatedService[];
  relatedPosts: PodcastRelatedPost[];
}

export interface PodcastPlayerEpisode {
  title: string;
  description?: string;
  formattedDuration?: string;
  publishedAt?: string;
  embedUrl?: string;
  spotifyUrl?: string;
  imageUrl?: string;
}

/**
 * Spotify embed component props
 */
export interface SpotifyEmbedProps {
  type?: 'show' | 'episode';
  id?: string;
  className?: string;
  episodeTitle?: string | null;
  compact?: boolean;
  height?: number;
  showDirectLink?: boolean;
}

/**
 * Latest episodes component props
 */
export interface LatestEpisodesProps {
  maxEpisodes?: number;
  showPlayer?: boolean;
  className?: string;
  variant?: 'grid' | 'list' | 'carousel';
}

/**
 * Podcast transcript component props
 */
export interface PodcastTranscriptProps {
  episode: PodcastEpisode;
  className?: string;
  defaultExpanded?: boolean;
  enableSearch?: boolean;
}

/**
 * Transcript section for navigation
 */
export interface TranscriptSection {
  title: string;
  timestamp: string;
  timecodeSeconds: number;
  content: string;
}

/**
 * Audio player state
 */
export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error?: string;
}

/**
 * Audio player controls
 */
export interface AudioPlayerControls {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  togglePlayPause: () => void;
}

/**
 * Podcast analytics event
 */
export interface PodcastAnalyticsEvent {
  episodeId: string;
  eventType: 'play' | 'pause' | 'complete' | 'skip' | 'share';
  timestamp: number;
  position?: number;
  duration?: number;
}
