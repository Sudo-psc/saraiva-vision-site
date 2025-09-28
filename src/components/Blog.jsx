import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useRecentPosts } from '@/hooks/useWordPress';
import WordPressFallbackNotice from '@/components/WordPressFallbackNotice';
import { extractPlainText } from '@/lib/wordpress';
import { sanitizeWordPressTitle } from '@/utils/sanitizeWordPressContent';

const Blog = () => {
  const { t, i18n } = useTranslation();
  const {
    data,
    loading,
    error,
    refetch
  } = useRecentPosts(3, {
    refetchOnWindowFocus: true,
    refreshInterval: 60000,
  });

  const posts = data?.posts || [];
  const fallbackMeta = data?.fallbackMeta;
  const isFallback = data?.isFallback || fallbackMeta?.isFallback || posts?.meta?.isFallback;

  const getDateLocale = () => {
    return i18n.language === 'pt' ? ptBR : enUS;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      );
    }

    if (error && !isFallback) {
      return (
        <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-2xl">
          <h3 className="text-xl font-semibold text-yellow-800">{t('blog.placeholder_title')}</h3>
          <p className="text-yellow-700 mt-2">{t('blog.placeholder_desc')}</p>
        </div>
      );
    }

    if (isFallback) {
      return (
        <div className="space-y-6">
          <WordPressFallbackNotice meta={fallbackMeta} onRetry={refetch} />
          {posts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id ?? index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="modern-card overflow-hidden flex flex-col bg-white/60 border border-yellow-100"
                >
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{format(new Date(post.date), 'dd MMMM, yyyy', { locale: getDateLocale() })}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm flex-grow">
                      {post.excerpt}
                    </p>
                    <span className="mt-4 text-xs text-gray-500">Atualizaremos automaticamente assim que o CMS retornar.</span>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (!posts.length) {
      return (
        <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-2xl">
          <h3 className="text-xl font-semibold text-yellow-800">{t('blog.placeholder_title')}</h3>
          <p className="text-yellow-700 mt-2">{t('blog.no_posts')}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => {
          const featuredImage = post.featuredImage?.node?.sourceUrl;
          const titleHtml = sanitizeWordPressTitle(post.title || '');
          const excerpt = extractPlainText(post.excerpt || '', 120);
          const date = post.date ? format(new Date(post.date), 'dd MMMM, yyyy', { locale: getDateLocale() }) : '';

          return (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="modern-card overflow-hidden flex flex-col"
            >
              <Link to={`/blog/${post.slug}`} className="block overflow-hidden">
                <img
                  loading="lazy"
                  decoding="async"
                  src={featuredImage || 'https://placehold.co/600x400/e2e8f0/64748b?text=Imagem'}
                  alt={post.featuredImage?.node?.altText || t('ui.alt.blog_post', 'Imagem ilustrativa do artigo')}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                />
              </Link>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center text-sm text-gray-700 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{date}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 flex-grow">
                  {/* eslint-disable-next-line lint/security/noDangerouslySetInnerHtml -- sanitized via sanitizeWordPressTitle */}
                  <Link
                    to={`/blog/${post.slug}`}
                    className="hover:text-blue-600"
                    dangerouslySetInnerHTML={{ __html: titleHtml }}
                  />
                </h3>
                {excerpt && (
                  <div className="text-gray-600 mb-4 text-sm">
                    {excerpt}
                  </div>
                )}
                <Link to={`/blog/${post.slug}`} className="mt-auto">
                  <Button variant="link" className="p-0 text-blue-600 font-semibold group">
                    {t('blog.read_more')}
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </motion.article>
          );
        })}
      </div>
    );
  };

  return (
    <section id="blog" className="bg-subtle-gradient">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {t('blog.tag')}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-extrabold mb-4"
          >
            {t('blog.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto text-lg"
          >
            {t('blog.subtitle')}
          </motion.p>
        </div>

        {renderContent()}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link to="/blog">
            <Button size="lg" variant="outline">
              {t('blog.view_all')} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;
