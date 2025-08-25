import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';

const Blog = ({ wordpressUrl }) => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wordpressUrl) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/posts?per_page=3&_embed`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [wordpressUrl]);

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

    if (error || !wordpressUrl) {
      return (
        <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-2xl">
          <h3 className="text-xl font-semibold text-yellow-800">{t('blog.placeholder_title')}</h3>
          <p className="text-yellow-700 mt-2">{t('blog.placeholder_desc')}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => (
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
                src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://placehold.co/600x400/e2e8f0/64748b?text=Image'}
                alt={post.title.rendered}
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
              />
            </Link>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{format(new Date(post.date), 'dd MMMM, yyyy', { locale: getDateLocale() })}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 flex-grow">
                <Link to={`/blog/${post.slug}`} className="hover:text-blue-600" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
              </h3>
              <div className="text-gray-600 mb-4 text-sm" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered.substring(0, 100) + '...' }} />
              <Link to={`/blog/${post.slug}`} className="mt-auto">
                <Button variant="link" className="p-0 text-blue-600 font-semibold group">
                  {t('blog.read_more')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.article>
        ))}
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
