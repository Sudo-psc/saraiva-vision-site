/**
 * Blog API Route - List all posts
 * GET /api/blog - List blog posts with pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { blogPosts, categories } from '@/src/data/blogPosts';
import { blogListQuerySchema } from '@/lib/validations/api';
import type { BlogListResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const validationResult = blogListQuerySchema.safeParse({
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '10',
      category: searchParams.get('category') || undefined,
      featured: searchParams.get('featured') || undefined,
      search: searchParams.get('search') || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { page, pageSize, category, featured, search } = validationResult.data;

    // Filter posts
    let filteredPosts = [...blogPosts];

    if (category) {
      filteredPosts = filteredPosts.filter((post) => post.category === category);
    }

    if (featured !== undefined) {
      filteredPosts = filteredPosts.filter((post) => post.featured === featured);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.excerpt.toLowerCase().includes(searchLower) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort by date (newest first)
    filteredPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Pagination
    const total = filteredPosts.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    const response: BlogListResponse = {
      success: true,
      data: {
        posts: paginatedPosts,
        total,
        page,
        pageSize,
        totalPages,
        categories,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Blog API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
