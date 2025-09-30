import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CategoryBadge from './CategoryBadge';

/**
 * RelatedPosts - Shows related content to keep users engaged
 * Improves content discovery and session duration
 */
const RelatedPosts = ({ posts = [], currentPostId, className = '' }) => {
  // Filter out current post and limit to 3
  const relatedPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, 3);

  if (relatedPosts.length === 0) return null;

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMM, yyyy', { locale: ptBR });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`my-12 ${className}`}
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
        {relatedPosts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
          >
            <Link to={`/blog/${post.slug}`} className="block">
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-gray-100">
                <img
                  src={post.image}
                  alt={`Imagem ilustrativa do artigo: ${post.title}`}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  style={{ maxWidth: '100%', display: 'block' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/img/blog-fallback.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="mb-3">
                  <CategoryBadge category={post.category} size="sm" />
                </div>

                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

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
          </motion.article>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-8 text-center">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all group"
        >
          <span>Ver Todos os Artigos</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.section>
  );
};

export default RelatedPosts;