import { NextRequest, NextResponse } from 'next/server';
import type { InstagramApiResponse, InstagramError, InstagramPost } from '@/types/instagram';

let instagramCache: {
  data: InstagramApiResponse | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000;

const FALLBACK_POSTS: InstagramPost[] = [
  {
    id: 'fallback-1',
    caption: 'Cuidando da sua visão com tecnologia e excelência. #oftalmologia #saúdeocular',
    media_type: 'IMAGE',
    media_url: '/img/hero.avif',
    permalink: 'https://instagram.com/saraivavision',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    username: 'saraivavision',
    fallback: true,
  },
  {
    id: 'fallback-2',
    caption: 'Equipamentos de última geração para diagnóstico preciso. #tecnologiamedica',
    media_type: 'IMAGE',
    media_url: '/img/hero.avif',
    permalink: 'https://instagram.com/saraivavision',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    username: 'saraivavision',
    fallback: true,
  },
  {
    id: 'fallback-3',
    caption: 'Nosso compromisso é com a sua saúde visual. Agende sua consulta! 👓',
    media_type: 'IMAGE',
    media_url: '/img/hero.avif',
    permalink: 'https://instagram.com/saraivavision',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    username: 'saraivavision',
    fallback: true,
  },
  {
    id: 'fallback-4',
    caption: 'Equipe especializada em oftalmologia. Confie nos melhores! ✨',
    media_type: 'IMAGE',
    media_url: '/img/hero.avif',
    permalink: 'https://instagram.com/saraivavision',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    username: 'saraivavision',
    fallback: true,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '4', 10);
    const includeStats = searchParams.get('includeStats') !== 'false';

    const now = Date.now();
    if (instagramCache.data && now - instagramCache.timestamp < CACHE_TTL) {
      console.log('Returning cached Instagram posts');
      return NextResponse.json(instagramCache.data, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache': 'HIT',
        },
      });
    }

    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const instagramUserId = process.env.INSTAGRAM_USER_ID;

    if (!accessToken || !instagramUserId || accessToken === 'your_instagram_token_here') {
      console.warn('Instagram API not configured, using fallback data');
      
      const fallbackResponse: InstagramApiResponse = {
        success: true,
        posts: FALLBACK_POSTS.slice(0, limit),
        cached: false,
        total: FALLBACK_POSTS.length,
        timestamp: new Date().toISOString(),
        source: 'fallback',
      };

      instagramCache = {
        data: fallbackResponse,
        timestamp: now,
      };

      return NextResponse.json(fallbackResponse, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache': 'MISS',
        },
      });
    }

    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username';
    const apiUrl = `https://graph.instagram.com/${instagramUserId}/media?fields=${fields}&access_token=${accessToken}&limit=${limit}`;

    console.log('Fetching Instagram posts from Graph API');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from Instagram API');
    }

    const posts: InstagramPost[] = data.data.map((post: any) => ({
      id: post.id,
      caption: post.caption || '',
      media_type: post.media_type || 'IMAGE',
      media_url: post.media_url,
      thumbnail_url: post.thumbnail_url,
      permalink: post.permalink,
      timestamp: post.timestamp,
      username: post.username || 'saraivavision',
      fallback: false,
    }));

    const result: InstagramApiResponse = {
      success: true,
      posts,
      cached: false,
      total: posts.length,
      timestamp: new Date().toISOString(),
      source: 'instagram-graph-api',
    };

    instagramCache = {
      data: result,
      timestamp: now,
    };

    console.log(`Successfully fetched ${posts.length} Instagram posts`);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'MISS',
      },
    });
  } catch (error: any) {
    console.error('Instagram API Error:', error);

    const errorResponse: InstagramError = {
      success: false,
      error: error.message || 'Failed to fetch Instagram posts',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
