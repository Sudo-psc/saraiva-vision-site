# SWR Usage Examples

Practical examples for using SWR in the Saraiva Vision project.

## Installation Note

**SWR is NOT currently installed**. Before using these patterns, add it to your project:

```bash
npm install swr@^2.2.0
```

## Basic Client Component

```tsx
'use client';

import { useGoogleReviews } from '@/hooks/useGoogleReviews';

export function ReviewsWidget() {
  const { reviews, stats, isLoading, isError, error } = useGoogleReviews({
    limit: 5,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded">
        Error loading reviews: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">
          Google Reviews - {stats?.overview.averageRating}/5
        </h2>
        <p className="text-gray-600">
          {stats?.overview.totalReviews} total reviews
        </p>
      </div>
      
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 bg-white shadow rounded">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">
                {review.reviewer.displayName}
              </span>
              <span className="text-yellow-500">
                {'★'.repeat(review.starRating)}
              </span>
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Blog Posts with Pagination

```tsx
'use client';

import { useState } from 'react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import Link from 'next/link';

export function BlogList() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string | undefined>();

  const { posts, totalPages, categories, isLoading } = useBlogPosts({
    page,
    pageSize: 12,
    category,
  });

  return (
    <div>
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setCategory(undefined)}
          className={`px-4 py-2 rounded ${!category ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded ${category === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group"
            >
              <div className="overflow-hidden rounded">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition"
                />
              </div>
              <h3 className="mt-4 font-bold group-hover:text-blue-600">
                {post.title}
              </h3>
              <p className="text-gray-600 text-sm mt-2">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

## SSR with Client Hydration

```tsx
// app/reviews/page.tsx (Server Component)
import { ReviewsClient } from './ReviewsClient';

async function getInitialReviews() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const res = await fetch(`${apiUrl}/api/reviews?limit=5`, {
    next: { revalidate: 3600 },
  });
  
  if (!res.ok) {
    return null;
  }
  
  return res.json();
}

export default async function ReviewsPage() {
  const initialData = await getInitialReviews();
  
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">Patient Reviews</h1>
      <ReviewsClient fallback={initialData ? { '/api/reviews?limit=5': initialData } : undefined} />
    </div>
  );
}

// app/reviews/ReviewsClient.tsx (Client Component)
'use client';

import { SWRProvider } from '@/lib/swr/provider';
import { ReviewsWidget } from '@/components/ReviewsWidget';

interface ReviewsClientProps {
  fallback?: Record<string, any>;
}

export function ReviewsClient({ fallback }: ReviewsClientProps) {
  return (
    <SWRProvider fallback={fallback}>
      <ReviewsWidget />
    </SWRProvider>
  );
}
```

## Search with Debouncing

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useBlogPosts } from '@/hooks/useBlogPosts';

export function BlogSearch() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { posts, isLoading } = useBlogPosts({
    search: debouncedSearch,
    pageSize: 20,
  });

  return (
    <div>
      <input
        type="search"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search blog posts..."
        className="w-full px-4 py-2 border rounded"
      />

      {isLoading && <div className="mt-4">Searching...</div>}

      <div className="mt-6 space-y-4">
        {posts.map((post) => (
          <div key={post.slug} className="p-4 bg-white shadow rounded">
            <h3 className="font-bold">{post.title}</h3>
            <p className="text-gray-600 text-sm mt-2">{post.excerpt}</p>
          </div>
        ))}
        {!isLoading && posts.length === 0 && (
          <p className="text-gray-500">No results found</p>
        )}
      </div>
    </div>
  );
}
```

## Infinite Scroll

```tsx
'use client';

import { useEffect, useRef } from 'react';
import useSWRInfinite from 'swr/infinite';
import { defaultFetcher } from '@/lib/swr/fetcher';
import type { BlogListResponse } from '@/types/api';

const getKey = (pageIndex: number, previousPageData: BlogListResponse | null) => {
  if (previousPageData && previousPageData.data.posts.length === 0) return null;
  
  return `/api/blog?page=${pageIndex + 1}&pageSize=10`;
};

export function InfiniteBlogList() {
  const { data, error, size, setSize, isLoading, isValidating } =
    useSWRInfinite<BlogListResponse>(getKey, defaultFetcher);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const posts = data ? data.flatMap((page) => page.data.posts) : [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.data.posts.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data.posts.length < 10);

  useEffect(() => {
    if (!loadMoreRef.current || isReachingEnd) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          setSize((size) => size + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isLoadingMore, isReachingEnd, setSize]);

  if (error) {
    return <div className="text-red-600">Error loading posts</div>;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <article key={post.slug} className="p-6 bg-white shadow rounded">
          <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
          <p className="text-gray-600">{post.excerpt}</p>
          <div className="mt-4 flex gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-sm rounded">
                {tag}
              </span>
            ))}
          </div>
        </article>
      ))}

      {!isReachingEnd && (
        <div ref={loadMoreRef} className="py-8 text-center">
          {isLoadingMore ? (
            <div className="animate-pulse">Loading more...</div>
          ) : (
            <div className="text-gray-400">Scroll to load more</div>
          )}
        </div>
      )}

      {isReachingEnd && <div className="py-8 text-center text-gray-400">No more posts</div>}
    </div>
  );
}
```

## Manual Revalidation

```tsx
'use client';

import { useGoogleReviews } from '@/hooks/useGoogleReviews';

export function ReviewsWithRefresh() {
  const { reviews, stats, isValidating, mutate } = useGoogleReviews();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Reviews</h2>
        <button
          onClick={() => mutate()}
          disabled={isValidating}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isValidating ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 bg-white shadow rounded">
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Conditional Fetching

```tsx
'use client';

import { useState } from 'react';
import useSWR from 'swr';

export function ConditionalData() {
  const [userId, setUserId] = useState<string | null>(null);

  const { data: user } = useSWR(userId ? `/api/user/${userId}` : null);

  const { data: userPosts } = useSWR(
    user ? `/api/posts?userId=${user.id}` : null
  );

  return (
    <div>
      <input
        type="text"
        onChange={(e) => setUserId(e.target.value || null)}
        placeholder="Enter user ID"
        className="px-4 py-2 border rounded"
      />

      {user && (
        <div className="mt-4">
          <h3 className="font-bold">{user.name}</h3>
          {userPosts && (
            <div className="mt-2">
              <p>{userPosts.length} posts</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

## Error Handling with Retry

```tsx
'use client';

import { useGoogleReviews } from '@/hooks/useGoogleReviews';
import { FetchError } from '@/lib/swr/fetcher';

export function ReviewsWithErrorHandling() {
  const { reviews, isError, error, mutate } = useGoogleReviews({
    config: {
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
    },
  });

  if (isError) {
    if (error instanceof FetchError) {
      if (error.status === 404) {
        return <div className="p-4 bg-yellow-50">No reviews found</div>;
      }
      
      if (error.status === 429) {
        return (
          <div className="p-4 bg-orange-50">
            Too many requests. Please try again later.
          </div>
        );
      }

      if (error.status >= 500) {
        return (
          <div className="p-4 bg-red-50">
            <p className="text-red-600 mb-2">Server error occurred</p>
            <button
              onClick={() => mutate()}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Retry
            </button>
          </div>
        );
      }
    }

    return (
      <div className="p-4 bg-red-50">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id}>{review.comment}</div>
      ))}
    </div>
  );
}
```

## Testing with SWR

```tsx
// __tests__/ReviewsWidget.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { ReviewsWidget } from '@/components/ReviewsWidget';

describe('ReviewsWidget', () => {
  it('renders reviews', async () => {
    const mockData = {
      success: true,
      data: {
        reviews: [
          {
            id: '1',
            reviewer: { displayName: 'John Doe', profilePhotoUrl: '' },
            starRating: 5,
            comment: 'Great service!',
            createTime: '2024-01-01',
          },
        ],
        stats: {
          overview: {
            averageRating: 4.8,
            totalReviews: 100,
          },
        },
      },
    };

    render(
      <SWRConfig value={{ fallback: { '/api/reviews?limit=5': mockData } }}>
        <ReviewsWidget />
      </SWRConfig>
    );

    await waitFor(() => {
      expect(screen.getByText('Great service!')).toBeInTheDocument();
      expect(screen.getByText(/4.8/)).toBeInTheDocument();
    });
  });
});
```

## Global Provider Setup

```tsx
// app/providers.tsx
'use client';

import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swr/config';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Custom Middleware

```tsx
// lib/swr/middleware.ts
import type { SWRHook } from 'swr';

export const logger: SWRHook = (useSWRNext) => {
  return (key, fetcher, config) => {
    const swr = useSWRNext(key, fetcher, config);

    useEffect(() => {
      console.log('[SWR]', key, 'loaded', swr.data);
    }, [swr.data]);

    return swr;
  };
};

// Usage
import { SWRConfig } from 'swr';
import { logger } from '@/lib/swr/middleware';

<SWRConfig value={{ use: [logger] }}>
  {children}
</SWRConfig>
```

## When NOT to Use SWR

❌ **Don't use SWR for:**

1. Server Components (use Next.js fetch with cache)
2. One-time data fetches
3. Form submissions (use mutations or server actions)
4. Static data that never changes
5. Heavy computations (use React Query or Zustand)

✅ **Use SWR for:**

1. Real-time dashboards
2. User-specific data
3. Search/filter interfaces
4. Pagination/infinite scroll
5. Client-side data that updates frequently
