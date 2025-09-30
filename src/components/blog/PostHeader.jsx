import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CategoryBadge from './CategoryBadge';

/**
 * PostHeader - Enhanced header for blog posts with visual hierarchy
 * Features: Hero image, category badge, metadata, reading time
 */
const PostHeader = ({
  title,
  tagline,
  excerpt,
  category,
  author,
  date,
  readingTime = '5 min',
  image,
  imageAlt,
  className = ''
}) => {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMMM, yyyy', { locale: ptBR });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`mb-8 ${className}`}
    >
      {/* Hero Image with Gradient Overlay */}
      {image && (
        <div className="relative w-full h-72 md:h-96 lg:h-[28rem] rounded-2xl overflow-hidden shadow-2xl mb-6">
          <img
            src={image}
            alt={imageAlt || `Imagem de destaque: ${title}`}
            className="w-full h-full object-cover object-center"
            loading="eager"
            style={{ maxWidth: '100%', display: 'block' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

          {/* Category Badge Overlay */}
          <div className="absolute top-6 left-6">
            <CategoryBadge category={category} size="lg" />
          </div>
        </div>
      )}

      {/* Title and Tagline */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-lg border border-white/50">
        {/* Tagline */}
        {tagline && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-blue-600 font-semibold text-sm md:text-base mb-3 uppercase tracking-wide"
          >
            {tagline}
          </motion.p>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight"
        >
          {title}
        </motion.h1>

        {/* Excerpt */}
        {excerpt && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-700 mb-6 leading-relaxed"
          >
            {excerpt}
          </motion.p>
        )}

        {/* Metadata Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200"
        >
          {/* Author */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span className="font-medium">{author}</span>
          </div>

          <span className="text-gray-400">•</span>

          {/* Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <time dateTime={date}>
              {formatDate(date)}
            </time>
          </div>

          <span className="text-gray-400">•</span>

          {/* Reading Time */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>{readingTime} de leitura</span>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default PostHeader;