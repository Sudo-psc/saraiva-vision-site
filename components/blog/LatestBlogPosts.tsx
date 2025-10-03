'use client';

import { Rss } from 'lucide-react';
import Link from 'next/link';
import BlogCard from './BlogCard';
import type { BlogPost } from '@/types/blog';

interface LatestBlogPostsProps {
  posts: BlogPost[];
  limit?: number;
}

export default function LatestBlogPosts({ posts, limit = 3 }: LatestBlogPostsProps) {
  const displayPosts = posts.slice(0, limit);

  if (displayPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-12 lg:py-16 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-indigo-400/5 to-blue-400/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-[7%] relative z-10">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 via-indigo-50 to-blue-100 text-blue-700 mb-8 border border-blue-200/50 shadow-lg backdrop-blur-sm">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Rss className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-wide uppercase">Blog</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Últimas do Blog
            </span>
          </h2>

          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-4xl mx-auto leading-relaxed font-medium">
            Artigos e novidades sobre saúde ocular para manter você bem informado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} priority={index === 0} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Visitar Blog Completo
            <Rss className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
