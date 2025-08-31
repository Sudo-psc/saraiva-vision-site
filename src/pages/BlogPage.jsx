import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { Calendar, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const BlogPage = ({ wordpressUrl }) => {
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
        const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/posts?_embed`);
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
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
        </div>
      );
    }

    if (error || !wordpressUrl) {
      return (
        <div className="text-center p-12 bg-yellow-50 border border-yellow-200 rounded-2xl max-w-2xl mx-auto">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-yellow-800">{t('blog.placeholder_title')}</h3>
          <p className="text-yellow-700 mt-2">{t('blog.placeholder_desc_page')}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="modern-card overflow-hidden flex flex-col"
          >
            <Link to={`/blog/${post.slug}`} className="block overflow-hidden">
              <img
                src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://placehold.co/600x400/e2e8f0/64748b?text=Image'}
                alt={(post.title?.rendered || '').replace(/<[^>]+>/g, '')}
                className="w-full h-56 object-cover transition-transform duration-300 hover:scale-105"
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
              <div className="text-gray-600 mb-4 text-sm" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered.substring(0, 120) + '...' }} />
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
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{t('blog.page_title')} | Saraiva Vision</title>
        <meta name="description" content={t('blog.page_description')} />
      </Helmet>
      <Navbar />
      <main className="py-32 md:py-40">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{t('blog.page_title')}</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t('blog.page_subtitle')}</p>
          </motion.div>
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
