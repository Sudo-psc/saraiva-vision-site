# SWR Setup for Next.js App Router

Complete setup guide for SWR (stale-while-revalidate) data fetching in Next.js App Router.

## Installation

```bash
npm install swr@^2.2.0
```

## Architecture

```
lib/swr/
├── config.ts        # SWR configurations
├── fetcher.ts       # Default fetcher functions
└── provider.tsx     # Client-side SWR provider

hooks/
├── useGoogleReviews.ts      # Google Reviews API
├── useBlogPosts.ts          # Blog posts list
├── useBlogPost.ts           # Single blog post
└── useSubscriptionPlans.ts  # Subscription plans
```

## Configuration Files

### lib/swr/config.ts

Exports multiple SWR configurations for different use cases:

- **`swrConfig`** - Default configuration (balanced revalidation)
- **`fastRevalidateConfig`** - Frequent updates (30s interval)
- **`slowRevalidateConfig`** - Infrequent updates (5min interval)
- **`staticConfig`** - Static data (no revalidation)
- **`realtimeConfig`** - Real-time data (5s interval)

### lib/swr/fetcher.ts

Default fetcher functions with error handling:

- **`defaultFetcher`** - Standard GET requests
- **`fetcherWithToken`** - Authenticated requests
- **`postFetcher`** - POST mutations
- **`patchFetcher`** - PATCH updates
- **`deleteFetcher`** - DELETE operations

### lib/swr/provider.tsx

Client-side provider for App Router with fallback support.

## Usage Patterns

### 1. Client Components (Standard SWR)

```tsx
'use client';

import { useGoogleReviews } from '@/hooks/useGoogleReviews';

export function ReviewsWidget() {
  const { reviews, stats, isLoading, isError, error } = useGoogleReviews({
    limit: 5,
    language: 'pt-BR',
  });

  if (isLoading) return <div>Loading reviews...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Rating: {stats?.overview.averageRating}</h2>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
```

### 2. Server Components (Fetch with Cache)

```tsx
// app/blog/page.tsx
import { BlogPostsList } from '@/components/BlogPostsList';

async function getBlogPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog`, {
    next: { revalidate: 3600 }, // Revalidate every hour
  });
  
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function BlogPage() {
  const data = await getBlogPosts();
  
  return <BlogPostsList initialData={data.data.posts} />;
}
```

### 3. Hybrid: Server + Client Hydration

```tsx
// app/reviews/page.tsx (Server Component)
import { ReviewsClient } from './ReviewsClient';

async function getReviews() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
    next: { revalidate: 3600 },
  });
  return res.json();
}

export default async function ReviewsPage() {
  const fallbackData = await getReviews();
  
  return <ReviewsClient fallback={{ '/api/reviews': fallbackData }} />;
}

// app/reviews/ReviewsClient.tsx (Client Component)
'use client';

import { SWRProvider } from '@/lib/swr/provider';
import { ReviewsWidget } from '@/components/ReviewsWidget';

export function ReviewsClient({ fallback }: { fallback: Record<string, any> }) {
  return (
    <SWRProvider fallback={fallback}>
      <ReviewsWidget />
    </SWRProvider>
  );
}
```

### 4. Pagination

```tsx
'use client';

import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useState } from 'react';

export function BlogPagination() {
  const [page, setPage] = useState(1);
  const { posts, totalPages, isLoading } = useBlogPosts({
    page,
    pageSize: 10,
  });

  return (
    <div>
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} />
      ))}
      
      <nav>
        <button 
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
        >
          Previous
        </button>
        <span>{page} / {totalPages}</span>
        <button 
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages || isLoading}
        >
          Next
        </button>
      </nav>
    </div>
  );
}
```

### 5. Infinite Scroll

```tsx
'use client';

import useSWRInfinite from 'swr/infinite';
import { defaultFetcher } from '@/lib/swr/fetcher';

const getKey = (pageIndex: number, previousPageData: any) => {
  if (previousPageData && !previousPageData.data.posts.length) return null;
  
  return `/api/blog?page=${pageIndex + 1}&pageSize=10`;
};

export function InfiniteBlogList() {
  const { data, error, size, setSize, isLoading } = useSWRInfinite(
    getKey,
    defaultFetcher
  );

  const posts = data ? data.flatMap((page) => page.data.posts) : [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.data.posts.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data.posts.length < 10);

  return (
    <div>
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} />
      ))}
      
      {!isReachingEnd && (
        <button 
          onClick={() => setSize(size + 1)} 
          disabled={isLoadingMore}
        >
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

### 6. Optimistic Updates

```tsx
'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { postFetcher } from '@/lib/swr/fetcher';

export function ReviewForm() {
  const { data, mutate } = useSWR('/api/reviews');
  const { trigger, isMutating } = useSWRMutation('/api/reviews', postFetcher);

  const handleSubmit = async (formData: any) => {
    const newReview = {
      id: `temp-${Date.now()}`,
      ...formData,
      createTime: new Date().toISOString(),
    };

    await mutate(
      async () => {
        await trigger(formData);
        return { ...data, reviews: [newReview, ...data.reviews] };
      },
      {
        optimisticData: { ...data, reviews: [newReview, ...data.reviews] },
        rollbackOnError: true,
        populateCache: true,
        revalidate: true,
      }
    );
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 7. Error Handling

```tsx
'use client';

import { useGoogleReviews } from '@/hooks/useGoogleReviews';
import { FetchError } from '@/lib/swr/fetcher';

export function ReviewsWithErrorHandling() {
  const { reviews, isError, error, mutate } = useGoogleReviews();

  if (isError) {
    if (error instanceof FetchError) {
      if (error.status === 404) {
        return <div>Reviews not found</div>;
      }
      if (error.status === 500) {
        return (
          <div>
            Server error. <button onClick={() => mutate()}>Retry</button>
          </div>
        );
      }
    }
    return <div>Error: {error.message}</div>;
  }

  return <ReviewsList reviews={reviews} />;
}
```

### 8. Loading States

```tsx
'use client';

import { useBlogPosts } from '@/hooks/useBlogPosts';

export function BlogWithSkeletons() {
  const { posts, isLoading, isValidating } = useBlogPosts();

  return (
    <div>
      {isValidating && <div className="loading-indicator">Updating...</div>}
      
      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
```

## Client vs Server Components

### When to use SWR (Client Components)

✅ **Use SWR when:**
- Need real-time updates
- User interactions trigger refetching
- Optimistic UI updates required
- Infinite scroll or pagination
- Data depends on client-side state
- Need background revalidation

### When to use Server Components

✅ **Use Server fetch when:**
- Initial page load performance critical
- SEO required (static data)
- Data doesn't change frequently
- No user interaction needed
- Reduces client bundle size
- Secrets/API keys required

### Comparison Table

| Feature | SWR (Client) | Server Fetch |
|---------|--------------|--------------|
| **Bundle Size** | +9KB | 0KB |
| **Initial Load** | Slower | Faster |
| **Revalidation** | Automatic | Manual |
| **SEO** | Limited | Full |
| **Real-time** | ✅ | ❌ |
| **Optimistic UI** | ✅ | ❌ |
| **Cache** | Client | Server |

## App Router Caveats

### 1. Provider Must Be Client Component

```tsx
// ❌ Wrong - Server Component
import { SWRConfig } from 'swr';

export default function RootLayout({ children }) {
  return <SWRConfig>...</SWRConfig>; // Error!
}

// ✅ Correct - Client Component
'use client';
import { SWRProvider } from '@/lib/swr/provider';

export function Providers({ children }) {
  return <SWRProvider>{children}</SWRProvider>;
}
```

### 2. Cannot Use Hooks in Server Components

```tsx
// ❌ Wrong
export default async function Page() {
  const { data } = useSWR('/api/data'); // Error!
  return <div>{data}</div>;
}

// ✅ Correct - Extract to Client Component
export default function Page() {
  return <DataDisplay />; // Client Component
}
```

### 3. Fallback Data for SSR

```tsx
// Preload data on server, hydrate on client
export default async function Page() {
  const data = await fetch('...').then(r => r.json());
  
  return (
    <SWRProvider fallback={{ '/api/data': data }}>
      <ClientComponent />
    </SWRProvider>
  );
}
```

### 4. Global Config

```tsx
// app/providers.tsx
'use client';

import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swr/config';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Best Practices

### 1. Type Safety

Always type your hooks with expected response types:

```tsx
const { data } = useSWR<ReviewsResponse>('/api/reviews');
```

### 2. Conditional Fetching

```tsx
const { data } = useSWR(shouldFetch ? '/api/data' : null);
```

### 3. Dependent Requests

```tsx
const { data: user } = useSWR('/api/user');
const { data: projects } = useSWR(user ? `/api/projects?userId=${user.id}` : null);
```

### 4. Custom Cache Keys

```tsx
useSWR(['api/user', userId], ([url, id]) => fetcher(`${url}/${id}`));
```

### 5. Global Mutations

```tsx
import { mutate } from 'swr';

// Revalidate all reviews endpoints
mutate((key) => typeof key === 'string' && key.startsWith('/api/reviews'));
```

### 6. Prefetching

```tsx
import { preload } from 'swr';
import { defaultFetcher } from '@/lib/swr/fetcher';

// Preload on hover
<Link 
  href="/reviews"
  onMouseEnter={() => preload('/api/reviews', defaultFetcher)}
>
  Reviews
</Link>
```

## Performance Tips

1. **Use `dedupingInterval`** to prevent duplicate requests
2. **Disable `revalidateOnFocus`** for static data
3. **Set `errorRetryCount`** to avoid infinite retries
4. **Use `fallback`** for SSR hydration
5. **Implement pagination** instead of loading all data
6. **Consider `revalidateIfStale: false`** for truly static content

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import { SWRConfig } from 'swr';

test('renders reviews', async () => {
  const mockData = { reviews: [...], stats: {...} };
  
  render(
    <SWRConfig value={{ fallback: { '/api/reviews': mockData } }}>
      <ReviewsWidget />
    </SWRConfig>
  );
  
  expect(await screen.findByText('Rating: 4.5')).toBeInTheDocument();
});
```

## Additional Resources

- [SWR Documentation](https://swr.vercel.app/)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [SWR Examples](https://github.com/vercel/swr/tree/main/examples)
