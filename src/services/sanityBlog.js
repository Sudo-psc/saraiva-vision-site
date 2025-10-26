const SANITY_PROJECT_ID = '92ocrdmp';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-05-16';

const CACHE_DURATION = 5 * 60 * 1000;
const cache = new Map();

export async function fetchRecentPosts(limit = 3) {
  const cacheKey = `recent-posts-${limit}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('[SanityBlog] Using cached data');
    return cached.data;
  }

  const query = `*[_type == "blogPost"] | order(publishedAt desc) [0...${limit}] {
    _id,
    id,
    title,
    "slug": slug.current,
    excerpt,
    "author": author->name,
    "authorDetails": author->{name, credentials, image},
    "category": category->title,
    "categorySlug": category->slug.current,
    tags,
    publishedAt,
    seo,
    featured,
    mainImage,
    legacyImageUrl,
    "plainText": pt::text(content)
  }`;

  const encodedQuery = encodeURIComponent(query);
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodedQuery}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Sanity API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.result) {
      throw new Error('Invalid response format from Sanity');
    }

    cache.set(cacheKey, {
      data: data.result,
      timestamp: Date.now(),
    });

    console.log(`[SanityBlog] Fetched ${data.result.length} posts`);
    return data.result;

  } catch (error) {
    console.error('[SanityBlog] Fetch error:', error);
    throw error;
  }
}

export async function fetchPostBySlug(slug) {
  const query = `*[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    id,
    title,
    "slug": slug.current,
    excerpt,
    content,
    "author": author->name,
    "authorDetails": author->{name, credentials, image, bio},
    "category": category->title,
    "categorySlug": category->slug.current,
    tags,
    publishedAt,
    updatedAt,
    seo,
    featured,
    mainImage,
    legacyImageUrl,
    "plainText": pt::text(content)
  }`;

  const encodedQuery = encodeURIComponent(query);
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodedQuery}&$slug="${slug}"`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Sanity API error: ${response.status}`);
    }

    const data = await response.json();
    return data.result;

  } catch (error) {
    console.error('[SanityBlog] Fetch post error:', error);
    throw error;
  }
}

export async function fetchAllPosts() {
  const query = `*[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "category": category->title,
    publishedAt,
    featured,
    mainImage
  }`;

  const encodedQuery = encodeURIComponent(query);
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodedQuery}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Sanity API error: ${response.status}`);
    }

    const data = await response.json();
    return data.result;

  } catch (error) {
    console.error('[SanityBlog] Fetch all posts error:', error);
    throw error;
  }
}

export function clearCache() {
  cache.clear();
  console.log('[SanityBlog] Cache cleared');
}
