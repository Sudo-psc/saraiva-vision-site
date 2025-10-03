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
