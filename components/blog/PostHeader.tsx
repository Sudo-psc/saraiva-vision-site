import React from 'react';
import Image from 'next/image';
import { Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { PostHeaderProps } from '@/types/blog';

/**
 * PostHeader - Enhanced header for blog posts with visual hierarchy
 * Features hero image, category badge, metadata, and reading time
 *
 * Features:
 * - Hero image with gradient overlay
 * - Category badge overlay
 * - Structured metadata (author, date, reading time)
 * - Responsive typography scaling
 * - Optimized Next.js Image loading
 * - Semantic HTML with proper heading hierarchy
 * - WCAG AA compliant
 *
 * @example
 * ```tsx
 * <PostHeader
 *   title="Understanding Cataracts"
 *   category="Tratamento"
 *   author="Dr. Philipe Saraiva"
 *   date="2025-09-29"
 *   readingTime="5 min"
 *   image="/blog/cataracts.jpg"
 * />
 * ```
 */
export function PostHeader({
  title,
  tagline,
  excerpt,
  category,
  author,
  date,
  readingTime = '5 min',
  image,
  imageAlt,
  className = '',
}: PostHeaderProps) {
  /**
   * Format date to Portuguese locale
   */
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM, yyyy', { locale: ptBR });
  };

  return (
    <header className={`mb-8 ${className}`}>
      {/* Hero Image with Gradient Overlay */}
      {image && (
        <div className="relative w-full h-72 md:h-96 lg:h-[28rem] rounded-2xl overflow-hidden shadow-2xl mb-6">
          <Image
            src={image}
            alt={imageAlt || `Imagem de destaque: ${title}`}
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1200px"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/img/blog-fallback.jpg';
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Category Badge Overlay */}
          <div className="absolute top-6 left-6">
            <span className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm">
              {category}
            </span>
          </div>
        </div>
      )}

      {/* Title and Metadata Container */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-lg border border-white/50">
        {/* Tagline */}
        {tagline && (
          <p className="text-blue-600 font-semibold text-sm md:text-base mb-3 uppercase tracking-wide">
            {tagline}
          </p>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          {title}
        </h1>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">{excerpt}</p>
        )}

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
          {/* Author */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span className="font-medium">{author}</span>
          </div>

          <span className="text-gray-400" aria-hidden="true">
            •
          </span>

          {/* Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <time dateTime={date}>{formatDate(date)}</time>
          </div>

          <span className="text-gray-400" aria-hidden="true">
            •
          </span>

          {/* Reading Time */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>{readingTime} de leitura</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default PostHeader;
