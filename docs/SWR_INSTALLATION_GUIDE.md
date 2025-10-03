# SWR Installation & Quick Start Guide

## ⚠️ Current Status

**SWR is NOT installed in this project**. All configuration files and hooks have been created but require the package to be installed first.

## Installation

```bash
npm install swr@^2.2.0
```

## Quick Start (3 Steps)

### 1. Add Global Provider (Optional but Recommended)

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

### 2. Use Pre-built Hooks

```tsx
'use client';

import { useGoogleReviews } from '@/hooks/useGoogleReviews';

export function MyComponent() {
  const { reviews, stats, isLoading } = useGoogleReviews({ limit: 5 });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {reviews.map(review => (
        <div key={review.id}>{review.comment}</div>
      ))}
    </div>
  );
}
```

### 3. Create Custom Hooks (If Needed)

```tsx
// hooks/useMyData.ts
'use client';

import useSWR from 'swr';
import { swrConfig } from '@/lib/swr/config';

export function useMyData() {
  const { data, error, isLoading } = useSWR('/api/my-endpoint', swrConfig);

  return {
    data,
    isError: !!error,
    isLoading,
  };
}
```

## What's Included

### Configuration Files

- **`lib/swr/fetcher.ts`** - Default fetcher with error handling
- **`lib/swr/config.ts`** - 5 preset configurations (default, fast, slow, static, realtime)
- **`lib/swr/provider.tsx`** - Client-side provider component

### Pre-built Hooks

- **`hooks/useGoogleReviews.ts`** - Google Reviews API (slow revalidation)
- **`hooks/useBlogPosts.ts`** - Blog posts list (static, no revalidation)
- **`hooks/useBlogPost.ts`** - Single blog post (static)
- **`hooks/useSubscriptionPlans.ts`** - Subscription plans (static)

### Documentation

- **`docs/SWR_SETUP.md`** - Complete setup guide with patterns
- **`docs/SWR_EXAMPLES.md`** - Practical code examples
- **`docs/SWR_INSTALLATION_GUIDE.md`** - This file

## Available Configurations

```typescript
import {
  swrConfig,           // Balanced (default)
  fastRevalidateConfig, // 30s refresh
  slowRevalidateConfig, // 5min refresh
  staticConfig,        // No revalidation
  realtimeConfig,      // 5s refresh
} from '@/lib/swr/config';
```

## Usage Examples

### Basic Usage

```tsx
'use client';

import { useBlogPosts } from '@/hooks/useBlogPosts';

export function BlogList() {
  const { posts, isLoading, isError } = useBlogPosts({ page: 1, pageSize: 10 });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading posts</div>;

  return (
    <div>
      {posts.map(post => (
        <article key={post.slug}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  );
}
```

### With Server-Side Rendering

```tsx
// app/reviews/page.tsx (Server Component)
async function getReviews() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`);
  return res.json();
}

export default async function Page() {
  const data = await getReviews();
  
  return <ReviewsClient fallback={{ '/api/reviews': data }} />;
}

// app/reviews/ReviewsClient.tsx (Client Component)
'use client';

import { SWRProvider } from '@/lib/swr/provider';
import { ReviewsWidget } from '@/components/ReviewsWidget';

export function ReviewsClient({ fallback }) {
  return (
    <SWRProvider fallback={fallback}>
      <ReviewsWidget />
    </SWRProvider>
  );
}
```

### Pagination

```tsx
'use client';

import { useState } from 'react';
import { useBlogPosts } from '@/hooks/useBlogPosts';

export function PaginatedBlog() {
  const [page, setPage] = useState(1);
  const { posts, totalPages } = useBlogPosts({ page, pageSize: 10 });

  return (
    <div>
      {posts.map(post => <div key={post.slug}>{post.title}</div>)}
      
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
        Next
      </button>
    </div>
  );
}
```

### Manual Refresh

```tsx
const { data, mutate } = useGoogleReviews();

<button onClick={() => mutate()}>Refresh</button>
```

## When to Use SWR vs Server Fetch

### Use SWR (Client Components) for:

✅ Real-time updates
✅ User interactions (search, filter, pagination)
✅ Optimistic UI updates
✅ Background revalidation
✅ Client-side state management

### Use Server Fetch (Server Components) for:

✅ Initial page load (SEO)
✅ Static content
✅ Reduced bundle size
✅ Server-side authentication
✅ Sensitive data

## Common Patterns

### Search with Debouncing

```tsx
const [search, setSearch] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');

useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(search), 500);
  return () => clearTimeout(timer);
}, [search]);

const { posts } = useBlogPosts({ search: debouncedSearch });
```

### Error Handling

```tsx
import { FetchError } from '@/lib/swr/fetcher';

const { error } = useGoogleReviews();

if (error instanceof FetchError) {
  if (error.status === 404) return <div>Not found</div>;
  if (error.status === 500) return <div>Server error</div>;
}
```

### Conditional Fetching

```tsx
const { data } = useSWR(userId ? `/api/user/${userId}` : null);
```

## Performance Tips

1. **Use `dedupingInterval`** to prevent duplicate requests
2. **Disable `revalidateOnFocus`** for static data
3. **Set `errorRetryCount`** to avoid infinite retries
4. **Use fallback data** for SSR hydration
5. **Implement pagination** instead of loading all data

## Testing

```tsx
import { SWRConfig } from 'swr';

test('renders with SWR', () => {
  const mockData = { reviews: [...] };
  
  render(
    <SWRConfig value={{ fallback: { '/api/reviews': mockData } }}>
      <ReviewsWidget />
    </SWRConfig>
  );
});
```

## Troubleshooting

### Types Not Found

If you see `Cannot find module 'swr'`:
```bash
npm install swr@^2.2.0
```

### Provider Errors

Make sure provider is in a Client Component:
```tsx
'use client'; // Add this at the top

import { SWRConfig } from 'swr';
```

### Data Not Updating

Check revalidation config:
```tsx
const { data } = useSWR('/api/data', {
  refreshInterval: 30000, // 30 seconds
  revalidateOnFocus: true,
});
```

## Next Steps

1. Install SWR: `npm install swr@^2.2.0`
2. Add global provider to `app/layout.tsx`
3. Use existing hooks in your components
4. Read `docs/SWR_SETUP.md` for advanced patterns
5. Check `docs/SWR_EXAMPLES.md` for code examples

## API Reference

### Hook Return Values

```typescript
{
  data: T | undefined;           // Response data
  error: Error | undefined;      // Error object
  isLoading: boolean;            // Initial load
  isValidating: boolean;         // Revalidating
  mutate: () => Promise<void>;   // Manual revalidation
}
```

### Custom Hook Options

```typescript
{
  config?: SWRConfiguration;  // Override default config
}
```

## Support

- [SWR Documentation](https://swr.vercel.app/)
- [Next.js App Router](https://nextjs.org/docs/app)
- Project docs: `docs/SWR_*.md`
