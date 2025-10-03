# Blog System - Usage Examples

## Quick Start

### 1. Display Latest Posts on Homepage

```tsx
// app/page.tsx
import LatestBlogPosts from '@/components/blog/LatestBlogPosts';
import blogPosts from '@/src/content/blog/posts.json';
import type { BlogPost } from '@/types/blog';

export default function HomePage() {
  const recentPosts = (blogPosts as BlogPost[])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <main>
      <Hero />
      <Services />
      <LatestBlogPosts posts={recentPosts} limit={3} />
      <Contact />
    </main>
  );
}
```

### 2. Individual Blog Card

```tsx
import BlogCard from '@/components/blog/BlogCard';
import type { BlogPost } from '@/types/blog';

export default function CustomBlogSection() {
  const featuredPost: BlogPost = {
    id: 1,
    slug: 'cirurgia-catarata',
    title: 'Cirurgia de Catarata Moderna',
    excerpt: 'Conheça as técnicas mais avançadas...',
    // ... other fields
  };

  return (
    <div className="container mx-auto">
      <BlogCard post={featuredPost} priority={true} />
    </div>
  );
}
```

### 3. Filter Posts by Category

```tsx
import blogPosts from '@/src/content/blog/posts.json';
import BlogCard from '@/components/blog/BlogCard';
import type { BlogPost } from '@/types/blog';

export default function CategoryPage({ category }: { category: string }) {
  const filteredPosts = (blogPosts as BlogPost[]).filter(
    (post) => post.category === category
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredPosts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### 4. Search Posts by Tag

```tsx
'use client';

import { useState } from 'react';
import blogPosts from '@/src/content/blog/posts.json';
import BlogCard from '@/components/blog/BlogCard';
import type { BlogPost } from '@/types/blog';

export default function BlogSearch() {
  const [selectedTag, setSelectedTag] = useState<string>('');

  const allTags = Array.from(
    new Set(blogPosts.flatMap((post: BlogPost) => post.tags))
  );

  const filteredPosts = selectedTag
    ? (blogPosts as BlogPost[]).filter((post) =>
        post.tags.includes(selectedTag)
      )
    : (blogPosts as BlogPost[]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-3">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
            className={`px-4 py-2 rounded-full transition-colors ${
              tag === selectedTag
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
```

### 5. Featured Posts Section

```tsx
import blogPosts from '@/src/content/blog/posts.json';
import BlogCard from '@/components/blog/BlogCard';
import type { BlogPost } from '@/types/blog';

export default function FeaturedPosts() {
  const featuredPosts = (blogPosts as BlogPost[]).filter(
    (post) => post.featured
  );

  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold text-center mb-12">
        Artigos em Destaque
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredPosts.map((post, index) => (
          <BlogCard key={post.id} post={post} priority={index === 0} />
        ))}
      </div>
    </section>
  );
}
```

### 6. Related Posts Widget

```tsx
import blogPosts from '@/src/content/blog/posts.json';
import BlogCard from '@/components/blog/BlogCard';
import type { BlogPost } from '@/types/blog';

interface RelatedPostsProps {
  currentPostId: number;
  category: string;
  limit?: number;
}

export default function RelatedPosts({
  currentPostId,
  category,
  limit = 3,
}: RelatedPostsProps) {
  const relatedPosts = (blogPosts as BlogPost[])
    .filter(
      (post) => post.category === category && post.id !== currentPostId
    )
    .slice(0, limit);

  if (relatedPosts.length === 0) return null;

  return (
    <section className="mt-16">
      <h3 className="text-2xl font-bold mb-8">Artigos Relacionados</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
```

### 7. Blog Archive by Month

```tsx
import blogPosts from '@/src/content/blog/posts.json';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { BlogPost } from '@/types/blog';

export default function BlogArchive() {
  const postsByMonth = (blogPosts as BlogPost[]).reduce((acc, post) => {
    const monthKey = format(new Date(post.date), 'MMMM yyyy', {
      locale: ptBR,
    });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(post);
    return acc;
  }, {} as Record<string, BlogPost[]>);

  return (
    <div className="space-y-8">
      {Object.entries(postsByMonth).map(([month, posts]) => (
        <div key={month}>
          <h3 className="text-xl font-bold mb-4">{month}</h3>
          <ul className="space-y-2">
            {posts.map((post) => (
              <li key={post.id}>
                <a
                  href={`/blog/${post.slug}`}
                  className="text-blue-600 hover:underline"
                >
                  {post.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### 8. RSS Feed Generation (API Route)

```typescript
// app/api/blog/rss/route.ts
import { NextResponse } from 'next/server';
import blogPosts from '@/src/content/blog/posts.json';
import type { BlogPost } from '@/types/blog';

export async function GET() {
  const sortedPosts = (blogPosts as BlogPost[]).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Saraiva Vision Blog</title>
    <link>https://saraivavision.com.br/blog</link>
    <description>Artigos sobre saúde ocular e oftalmologia</description>
    <language>pt-BR</language>
    <atom:link href="https://saraivavision.com.br/api/blog/rss" rel="self" type="application/rss+xml" />
    ${sortedPosts
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>https://saraivavision.com.br/blog/${post.slug}</link>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>https://saraivavision.com.br/blog/${post.slug}</guid>
      <category>${escapeXml(post.category)}</category>
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}
```

### 9. Sitemap Generation

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import blogPosts from '@/src/content/blog/posts.json';
import type { BlogPost } from '@/types/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const blogSitemapEntries = (blogPosts as BlogPost[]).map((post) => ({
    url: `https://saraivavision.com.br/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.date),
    changeFrequency: 'monthly' as const,
    priority: post.featured ? 0.9 : 0.7,
  }));

  return [
    {
      url: 'https://saraivavision.com.br',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://saraivavision.com.br/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...blogSitemapEntries,
  ];
}
```

### 10. Blog Statistics Component

```tsx
'use client';

import blogPosts from '@/src/content/blog/posts.json';
import type { BlogPost } from '@/types/blog';

export default function BlogStats() {
  const totalPosts = blogPosts.length;
  const categories = Array.from(
    new Set(blogPosts.map((post: BlogPost) => post.category))
  );
  const totalTags = Array.from(
    new Set(blogPosts.flatMap((post: BlogPost) => post.tags))
  ).length;

  const categoryStats = categories.map((category) => ({
    name: category,
    count: blogPosts.filter((post: BlogPost) => post.category === category)
      .length,
  }));

  return (
    <div className="bg-gray-50 rounded-2xl p-8">
      <h3 className="text-2xl font-bold mb-6">Estatísticas do Blog</h3>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <p className="text-4xl font-bold text-blue-600">{totalPosts}</p>
          <p className="text-gray-600">Artigos</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-blue-600">
            {categories.length}
          </p>
          <p className="text-gray-600">Categorias</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-blue-600">{totalTags}</p>
          <p className="text-gray-600">Tags</p>
        </div>
      </div>
      <div className="space-y-3">
        {categoryStats.map((stat) => (
          <div key={stat.name} className="flex justify-between">
            <span className="font-medium">{stat.name}</span>
            <span className="text-gray-600">{stat.count} artigos</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Advanced Patterns

### Server Component with Data Fetching (Future)

```tsx
// For when you move to API-based blog posts
import { Suspense } from 'react';
import BlogCard from '@/components/blog/BlogCard';

async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 }, // ISR: revalidate every hour
  });
  return res.json();
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <div className="grid grid-cols-3 gap-8">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </Suspense>
  );
}
```

### Loading Skeleton

```tsx
export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}
```

---

## Testing Examples

### Unit Test (Vitest + React Testing Library)

```tsx
import { render, screen } from '@testing-library/react';
import BlogCard from '@/components/blog/BlogCard';
import { describe, it, expect } from 'vitest';

describe('BlogCard', () => {
  const mockPost = {
    id: 1,
    slug: 'test-post',
    title: 'Test Post Title',
    excerpt: 'This is a test excerpt',
    content: '<p>Test content</p>',
    author: 'Dr. Test',
    date: '2025-01-01T00:00:00.000Z',
    category: 'Test Category',
    tags: ['test', 'example'],
    image: '/test-image.png',
    featured: true,
    seo: {
      metaDescription: 'Test meta description',
      keywords: ['test', 'keywords'],
    },
  };

  it('renders post title', () => {
    render(<BlogCard post={mockPost} />);
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('renders post excerpt', () => {
    render(<BlogCard post={mockPost} />);
    expect(screen.getByText('This is a test excerpt')).toBeInTheDocument();
  });

  it('has correct link to post', () => {
    render(<BlogCard post={mockPost} />);
    const link = screen.getByRole('link', { name: /Test Post Title/i });
    expect(link).toHaveAttribute('href', '/blog/test-post');
  });
});
```

---

**Last Updated**: October 3, 2025
