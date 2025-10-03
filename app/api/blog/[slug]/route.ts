/**
 * Blog Post API Route - Get single post by slug
 * GET /api/blog/[slug] - Get blog post details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug } from '@/src/data/blogPosts';
import { blogSlugParamSchema } from '@/lib/validations/api';
import type { BlogPostResponse } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const validationResult = blogSlugParamSchema.safeParse({ slug: params.slug });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid slug parameter',
        },
        { status: 400 }
      );
    }

    const post = getPostBySlug(params.slug);

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const response: BlogPostResponse = {
      success: true,
      data: post,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Blog Post API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
