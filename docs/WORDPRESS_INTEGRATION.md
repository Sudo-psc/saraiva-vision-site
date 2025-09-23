# WordPress GraphQL Integration Guide

This document explains how to use the WordPress headless CMS integration with GraphQL, ISR (Incremental Static Regeneration), and webhook-based revalidation.

## Overview

The WordPress integration provides:
- **Headless CMS**: WordPress as a content management system via GraphQL API
- **ISR Support**: Incremental Static Regeneration for optimal performance
- **Real-time Updates**: Webhook-triggered revalidation when content changes
- **Caching**: Intelligent caching with configurable TTL
- **Error Handling**: Graceful fallbacks and error recovery
- **Type Safety**: Comprehensive GraphQL queries and fragments

## Architecture

```
WordPress CMS (VPS) → GraphQL API → Next.js (Vercel) → Static Pages + ISR
                                         ↑
                                    Webhooks for
                                   Revalidation
```

## Setup Instructions

### 1. WordPress Configuration

#### Install Required Plugins
```bash
# On your WordPress VPS
wp plugin install wp-graphql --activate
wp plugin install wp-graphql-acf --activate  # If using Advanced Custom Fields
wp plugin install wp-graphql-jwt-authentication --activate  # For admin access
```

#### Configure Custom Post Types
Add to your theme's `functions.php`:

```php
// Register Services Custom Post Type
function register_services_post_type() {
    register_post_type('service', [
        'labels' => [
            'name' => 'Services',
            'singular_name' => 'Service',
        ],
        'public' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'service',
        'graphql_plural_name' => 'services',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'],
    ]);
}
add_action('init', 'register_services_post_type');

// Register Team Members Custom Post Type
function register_team_members_post_type() {
    register_post_type('team_member', [
        'labels' => [
            'name' => 'Team Members',
            'singular_name' => 'Team Member',
        ],
        'public' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'teamMember',
        'graphql_plural_name' => 'teamMembers',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'],
    ]);
}
add_action('init', 'register_team_members_post_type');

// Register Testimonials Custom Post Type
function register_testimonials_post_type() {
    register_post_type('testimonial', [
        'labels' => [
            'name' => 'Testimonials',
            'singular_name' => 'Testimonial',
        ],
        'public' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'testimonial',
        'graphql_plural_name' => 'testimonials',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'],
    ]);
}
add_action('init', 'register_testimonials_post_type');
```

#### Set Up Webhooks
Add webhook functionality to trigger revalidation:

```php
// Add webhook triggers for content updates
function trigger_nextjs_revalidation($post_id, $post, $update) {
    // Only trigger for published posts
    if ($post->post_status !== 'publish') return;
    
    $webhook_url = 'https://saraivavision.com.br/api/wordpress-webhook';
    $webhook_secret = get_option('nextjs_webhook_secret');
    
    $payload = [
        'action' => $update ? 'wp_update_post' : 'publish_' . $post->post_type,
        'post_id' => $post_id,
        'post_type' => $post->post_type,
        'post_slug' => $post->post_name,
        'post_status' => $post->post_status,
        'post_title' => $post->post_title,
        'post_modified' => $post->post_modified,
    ];
    
    wp_remote_post($webhook_url, [
        'body' => json_encode($payload),
        'headers' => [
            'Content-Type' => 'application/json',
            'X-Hub-Signature-256' => 'sha256=' . hash_hmac('sha256', json_encode($payload), $webhook_secret),
        ],
        'timeout' => 10,
    ]);
}

add_action('wp_insert_post', 'trigger_nextjs_revalidation', 10, 3);
add_action('before_delete_post', function($post_id) {
    $post = get_post($post_id);
    if ($post) {
        trigger_nextjs_revalidation($post_id, $post, false);
    }
});
```

### 2. Environment Variables

Add to your `.env` file:

```bash
# WordPress GraphQL Configuration
WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql
WORDPRESS_DOMAIN=https://cms.saraivavision.com.br
WP_REVALIDATE_SECRET=your_secure_revalidate_secret_here
WP_WEBHOOK_SECRET=your_secure_webhook_secret_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://saraivavision.com.br
```

### 3. Vercel Configuration

Add to your `vercel.json`:

```json
{
  "functions": {
    "api/revalidate.js": { "maxDuration": 10 },
    "api/wordpress-webhook.js": { "maxDuration": 15 }
  },
  "env": {
    "WORDPRESS_GRAPHQL_ENDPOINT": "@wordpress_graphql_endpoint",
    "WP_REVALIDATE_SECRET": "@wp_revalidate_secret",
    "WP_WEBHOOK_SECRET": "@wp_webhook_secret"
  }
}
```

## Usage Examples

### 1. Using React Hooks

```jsx
import { usePost, useRecentPosts, usePopularServices } from '../hooks/useWordPress.js';

function BlogPost({ slug }) {
  const { data, loading, error } = usePost(slug);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.post) return <div>Post not found</div>;
  
  return (
    <article>
      <h1>{data.post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: data.post.content }} />
    </article>
  );
}

function Homepage() {
  const { data: recentPosts } = useRecentPosts(3);
  const { data: popularServices } = usePopularServices(6);
  
  return (
    <div>
      <section>
        <h2>Recent Posts</h2>
        {recentPosts?.posts?.map(post => (
          <div key={post.id}>{post.title}</div>
        ))}
      </section>
      
      <section>
        <h2>Popular Services</h2>
        {popularServices?.services?.map(service => (
          <div key={service.id}>{service.title}</div>
        ))}
      </section>
    </div>
  );
}
```

### 2. Using Components

```jsx
import { 
  WordPressPost, 
  WordPressPage, 
  RecentPostsPreview, 
  PopularServicesPreview 
} from '../components/WordPressContent.jsx';

function BlogPage({ slug }) {
  return <WordPressPost slug={slug} className="max-w-4xl mx-auto" />;
}

function AboutPage() {
  return <WordPressPage slug="about" className="container mx-auto" />;
}

function Homepage() {
  return (
    <div>
      <RecentPostsPreview count={3} className="mb-12" />
      <PopularServicesPreview count={6} className="mb-12" />
    </div>
  );
}
```

### 3. ISR with Next.js Pages

```jsx
// pages/blog/[slug].js
import { getPostStaticPaths, getPostStaticProps } from '../../src/lib/wordpress-isr.js';
import { WordPressPost } from '../../src/components/WordPressContent.jsx';

export default function BlogPost({ post }) {
  return <WordPressPost slug={post.slug} />;
}

export async function getStaticPaths() {
  return await getPostStaticPaths();
}

export async function getStaticProps({ params }) {
  return await getPostStaticProps(params.slug);
}
```

### 4. Direct API Usage

```jsx
import { getAllPosts, getPostBySlug } from '../lib/wordpress-api.js';

// Fetch all posts with pagination
const { posts, pageInfo, error } = await getAllPosts({
  first: 10,
  after: 'cursor_string'
});

// Fetch single post
const { post, error } = await getPostBySlug('my-post-slug');

// Disable caching for fresh data
const { posts } = await getAllPosts({ useCache: false });
```

## API Endpoints

### Revalidation Endpoint
`POST /api/revalidate`

Manually trigger ISR revalidation:

```bash
curl -X POST "https://saraivavision.com.br/api/revalidate" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your_revalidate_secret",
    "path": "/blog/my-post-slug"
  }'
```

### Webhook Endpoint
`POST /api/wordpress-webhook`

Receives WordPress webhooks for automatic revalidation:

```json
{
  "action": "publish_post",
  "post_id": 123,
  "post_type": "post",
  "post_slug": "my-new-post",
  "post_status": "publish",
  "post_title": "My New Post",
  "post_modified": "2024-01-15 10:30:00"
}
```

## Caching Strategy

### Cache Levels
1. **Browser Cache**: Static assets and pages
2. **CDN Cache**: Vercel Edge Network
3. **ISR Cache**: Next.js static generation
4. **API Cache**: In-memory WordPress API responses

### Cache Durations
- **Posts**: 5 minutes (frequent updates)
- **Pages**: 1 hour (less frequent updates)
- **Services**: 30 minutes (moderate updates)
- **Site Settings**: 1 hour (rare updates)

### Cache Management

```jsx
import { invalidateCache, getCacheStats } from '../lib/wordpress-api.js';

// Clear all cache
invalidateCache();

// Clear specific content type
invalidateCache('posts');

// Get cache statistics
const stats = getCacheStats();
console.log(`Cached items: ${stats.size}`);
```

## Error Handling

The integration includes comprehensive error handling:

### GraphQL Errors
```jsx
{
  type: 'GRAPHQL_ERROR',
  message: 'Field "invalidField" is not defined',
  errors: [/* GraphQL error details */]
}
```

### Network Errors
```jsx
{
  type: 'NETWORK_ERROR',
  message: 'Failed to connect to WordPress CMS'
}
```

### Server Errors
```jsx
{
  type: 'SERVER_ERROR',
  message: 'WordPress server is temporarily unavailable',
  status: 500
}
```

## Performance Optimization

### 1. Query Optimization
- Use specific GraphQL fragments
- Request only needed fields
- Implement pagination for large datasets

### 2. Image Optimization
```jsx
// WordPress images with Next.js optimization
import Image from 'next/image';

function OptimizedImage({ post }) {
  const { featuredImage } = post;
  
  if (!featuredImage?.node?.sourceUrl) return null;
  
  return (
    <Image
      src={featuredImage.node.sourceUrl}
      alt={featuredImage.node.altText || post.title}
      width={featuredImage.node.mediaDetails.width}
      height={featuredImage.node.mediaDetails.height}
      priority={false}
    />
  );
}
```

### 3. Preloading Critical Content
```jsx
// Preload homepage data
export async function getStaticProps() {
  return await getHomepageStaticProps();
}
```

## Monitoring and Debugging

### Health Checks
```jsx
import { checkWordPressHealth } from '../lib/wordpress.js';

const health = await checkWordPressHealth();
console.log('WordPress is healthy:', health.isHealthy);
```

### Debug Mode
Set `NODE_ENV=development` to enable request/response logging.

### Error Tracking
All errors are logged with context for debugging:

```javascript
console.error('WordPress GraphQL Error:', {
  query: 'query GetPosts { ... }',
  variables: { first: 10 },
  error: error.message,
  timestamp: new Date().toISOString()
});
```

## Troubleshooting

### Common Issues

1. **GraphQL Endpoint Not Accessible**
   - Check WordPress URL and SSL certificate
   - Verify WPGraphQL plugin is active
   - Test endpoint manually: `curl https://cms.saraivavision.com.br/graphql`

2. **Webhooks Not Working**
   - Verify webhook URL is accessible from WordPress server
   - Check webhook secret configuration
   - Monitor webhook logs in WordPress

3. **ISR Not Updating**
   - Verify revalidation secret is correct
   - Check Vercel function logs
   - Ensure webhook payload format is correct

4. **Cache Issues**
   - Clear cache manually: `invalidateCache()`
   - Check cache TTL settings
   - Verify cache key generation

### Debug Commands

```bash
# Test WordPress GraphQL endpoint
curl -X POST https://cms.saraivavision.com.br/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ generalSettings { title } }"}'

# Test revalidation endpoint
curl -X POST https://saraivavision.com.br/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret": "your_secret", "path": "/"}'

# Check Vercel function logs
vercel logs --follow
```

## Security Considerations

1. **Webhook Security**: Use signed webhooks with HMAC verification
2. **Revalidation Secret**: Use strong, unique secrets for revalidation
3. **CORS Configuration**: Restrict origins to WordPress domain
4. **Rate Limiting**: Implement rate limiting on webhook endpoints
5. **Input Validation**: Validate all webhook payloads
6. **Error Disclosure**: Don't expose sensitive information in error messages

## Best Practices

1. **Content Structure**: Use consistent WordPress content structure
2. **SEO Optimization**: Include SEO fields in GraphQL queries
3. **Image Management**: Optimize images in WordPress before serving
4. **Performance Monitoring**: Monitor GraphQL query performance
5. **Fallback Content**: Always provide fallback content for errors
6. **Testing**: Test webhook integration thoroughly
7. **Documentation**: Keep WordPress field documentation updated

This integration provides a robust, scalable solution for headless WordPress content management with optimal performance through ISR and intelligent caching.