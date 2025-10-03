import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { RelatedPostsProps } from '@/types/blog';

/**
 * RelatedPosts - Shows related content to keep users engaged
 * Improves content discovery and session duration
 *
 * Features:
 * - Smart filtering by category and current post
 * - Responsive grid layout (1 col mobile, 3 cols desktop)
 * - Optimized image loading with Next.js Image
 * - Smooth hover animations
 * - SEO-friendly Next.js Link navigation
 * - WCAG AA compliant
 *
 * @example
 * ```tsx
 * <RelatedPosts
 *   posts={allBlogPosts}
 *   currentPostId={5}
 *   category="Tratamento"
 *   limit={3}
 * />
 * ```
 */
export function RelatedPosts({
  posts = [],
  currentPostId,
  category,
  limit = 3,
  className = '',
}: RelatedPostsProps) {
  // Filter posts: remove current post, prioritize same category
  const filteredPosts = posts
    .filter((post) => post.id !== currentPostId)
    .sort((a, b) => {
      // Prioritize same category
      if (category) {
        const aMatchesCategory = a.category === category ? 1 : 0;
        const bMatchesCategory = b.category === category ? 1 : 0;
        if (aMatchesCategory !== bMatchesCategory) {
          return bMatchesCategory - aMatchesCategory;
        }
      }
      // Then sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, limit);

  // Don't render if no related posts
  if (filteredPosts.length === 0) return null;

  /**
   * Format date to Portuguese locale
   */
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM, yyyy', { locale: ptBR });
  };

  return (
    <section
      className={`my-12 px-4 md:px-6 ${className}`}
      aria-labelledby="related-posts-title"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-3 shadow-md">
          <ArrowRight className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <div>
          <h2 id="related-posts-title" className="text-2xl font-bold text-gray-900">
            Continue Aprendendo
          </h2>
          <p className="text-sm text-gray-600">Artigos relacionados que podem interessar</p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
          >
            <Link href={`/blog/${post.slug}`} className="block">
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-gray-100">
                <Image
                  src={post.image}
                  alt={`Imagem ilustrativa do artigo: ${post.title}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/img/blog-fallback.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Category Badge */}
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                  </div>
                  <span className="text-blue-600 font-medium group-hover:underline flex items-center gap-1">
                    Ler mais
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-8 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all group"
        >
          <span>Ver Todos os Artigos</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}

export default RelatedPosts;
