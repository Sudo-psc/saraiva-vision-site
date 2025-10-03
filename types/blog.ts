// =============================================================================
// Blog Post Types
// =============================================================================

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string | BlogAuthor;
  date: string;
  category: string;
  tags: string[];
  image: string;
  featured: boolean;
  seo: BlogSEO;
  readingTime?: number;
  relatedPodcasts?: RelatedPodcast[];
  updatedAt?: string;
  publishedAt?: string;
  wordCount?: number;
  coverImageAlt?: string;
  coverImageCaption?: string;
  headings?: BlogHeading[];
  cfmCompliance?: CFMCompliance;
}

export interface BlogAuthor {
  name: string;
  title?: string;
  role?: string;
  photo?: string;
  bio?: string;
  credentials?: string[];
  email?: string;
  phone?: string;
  crm?: string;
  specialty?: string;
}

export interface BlogSEO {
  metaTitle?: string;
  metaDescription: string;
  keywords: string | string[];
  ogImage?: string;
}

export interface CFMCompliance {
  disclaimerRequired: boolean;
  medicalContentLevel: 'educational' | 'clinical' | 'general';
  reviewedBy?: string;
  reviewDate?: string;
}

export interface BlogHeading {
  id: string;
  text: string;
  level: number;
}

export interface RelatedPodcast {
  id?: string;
  title: string;
  spotifyShowId?: string;
  spotifyEpisodeId?: string;
  spotifyUrl?: string;
}

// =============================================================================
// Component Props Types
// =============================================================================

export interface BlogPostLayoutProps {
  post: BlogPost;
  children: React.ReactNode;
}

export interface PostPageTemplateProps {
  slug: string;
}

export interface TableOfContentsProps {
  headings: BlogHeading[];
  className?: string;
}

export interface AuthorProfileProps {
  name?: string;
  role?: string;
  crm?: string;
  specialty?: string;
  image?: string;
  bio?: string;
  email?: string;
  phone?: string;
  showContact?: boolean;
  className?: string;
}

export interface ShareWidgetProps {
  title: string;
  url?: string;
  className?: string;
}

export interface RelatedPostsProps {
  posts: BlogPost[];
  currentPostId: number;
  category?: string;
  limit?: number;
  className?: string;
}

export interface PostHeaderProps {
  title: string;
  tagline?: string;
  excerpt?: string;
  category: string;
  author: string;
  date: string;
  readingTime?: string;
  image?: string;
  imageAlt?: string;
  className?: string;
}

export interface BlogCardProps {
  post: BlogPost;
  priority?: boolean;
}

export interface BlogListProps {
  posts: BlogPost[];
  category?: string;
  limit?: number;
}

// =============================================================================
// Metadata Types
// =============================================================================

export interface BlogMetadata {
  title: string;
  description: string;
  keywords: string[];
  openGraph: {
    title: string;
    description: string;
    images: string[];
    type: 'article';
    publishedTime: string;
    authors: string[];
  };
  twitter: {
    card: 'summary_large_image';
    title: string;
    description: string;
    images: string[];
  };
}

export interface BlogPageParams {
  slug: string;
}

export interface BlogCategory {
  name: string;
  slug: string;
  count: number;
}

// =============================================================================
// Share Platform Types
// =============================================================================

export type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'copy';

export interface ShareConfig {
  platform: SharePlatform;
  name: string;
  url: (shareUrl: string, title: string) => string;
  ariaLabel: string;
}
