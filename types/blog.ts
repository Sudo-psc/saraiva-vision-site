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
  featured: boolean;
  seo: {
    metaDescription: string;
    keywords: string | string[];
    ogImage?: string;
  };
  readingTime?: number;
  relatedPodcasts?: RelatedPodcast[];
  updatedAt?: string;
}

export interface RelatedPodcast {
  id?: string;
  title: string;
  spotifyShowId?: string;
  spotifyEpisodeId?: string;
  spotifyUrl?: string;
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
