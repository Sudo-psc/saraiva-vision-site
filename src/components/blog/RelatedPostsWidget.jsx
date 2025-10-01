import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';

const RelatedPostsWidget = ({ posts = [], currentPostId }) => {
  const relatedPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="sticky top-24 bg-gradient-to-br from-white/90 via-slate-50/80 to-primary-50/50 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-200">
        <div className="p-2 bg-gradient-to-br from-primary-100 to-slate-100 rounded-lg">
          <BookOpen className="w-4 h-4 text-primary-600" />
        </div>
        <h3 className="text-sm font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
          Continue Lendo
        </h3>
      </div>

      <div className="space-y-4">
        {relatedPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
          >
            <Link
              to={`/blog/${post.slug}`}
              className="group block p-3 rounded-lg hover:bg-white/80 transition-all"
            >
              <h4 className="text-sm font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                {post.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{Math.ceil((post.content?.length || 1000) / 1000)} min</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-primary-500 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            {index < relatedPosts.length - 1 && (
              <div className="mt-3 border-b border-slate-100" />
            )}
          </motion.div>
        ))}
      </div>

      <Link
        to="/blog"
        className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-center gap-2 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors group"
      >
        <span>Ver todos os artigos</span>
        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
};

export default RelatedPostsWidget;
