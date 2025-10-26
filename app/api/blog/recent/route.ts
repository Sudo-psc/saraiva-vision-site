import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '92ocrdmp',
  dataset: 'production',
  apiVersion: '2024-05-16',
  useCdn: true,
  token: process.env.SANITY_READ_TOKEN,
});

const CACHE_DURATION = 5 * 60 * 1000;
const cache = new Map<string, { data: any; timestamp: number }>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3');
    const cacheKey = `recent-posts-${limit}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
      console.log('[API/blog] Using cached data');
      return NextResponse.json({
        success: true,
        data: cachedData.data,
        cached: true,
        timestamp: new Date().toISOString(),
      });
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

    console.log('[API/blog] Fetching posts from Sanity...');

    const posts = await client.fetch(query);

    cache.set(cacheKey, {
      data: posts,
      timestamp: Date.now(),
    });

    console.log(`[API/blog] Successfully fetched ${posts.length} posts`);

    return NextResponse.json({
      success: true,
      data: posts,
      cached: false,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    console.error('[API/blog] Sanity fetch error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch posts',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
