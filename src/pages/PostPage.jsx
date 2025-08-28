import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { Calendar, User, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import blogPosts from '@/lib/blogPosts';

const PostPage = ({ wordpressUrl }) => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wordpressUrl) {
      const localPost = blogPosts.find((p) => p.slug === slug);
      if (localPost) {
        setPost(localPost);
      } else {
        setError('Post not found');
      }
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/posts?slug=${slug}&_embed`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.length > 0) {
          setPost(data[0]);
        } else {
          throw new Error('Post not found');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, wordpressUrl]);

  const getDateLocale = () => {
    return i18n.language === 'pt' ? ptBR : enUS;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-20 w-20 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-32 md:py-40">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-red-800">{t('blog.post_error_title')}</h1>
            <p className="text-red-700 mt-2 mb-6">{t('blog.post_error_desc')}</p>
            <Link to="/blog" className="text-blue-600 hover:underline">
              {t('blog.back_to_blog')}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isWP = !!post.title?.rendered;
  const title = isWP ? post.title.rendered : post.translations[i18n.language].title;
  const content = isWP ? post.content.rendered : post.translations[i18n.language].content;
  const excerpt = isWP
    ? post.excerpt.rendered.replace(/<[^>]+>/g, '')
    : post.translations[i18n.language].excerpt;
  const image = isWP ? post._embedded?.['wp:featuredmedia']?.[0]?.source_url : post.image;
  const author = isWP ? post._embedded.author[0].name : post.author;
  const cleanTitle = isWP ? post.title.rendered.replace(/<[^>]+>/g, '') : post.translations[i18n.language].title;

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{cleanTitle} | Saraiva Vision</title>
        <meta name="description" content={excerpt} />
      </Helmet>
      <Navbar />
      <main className="py-32 md:py-40">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Link to="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-8 font-semibold group">
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              {t('blog.back_to_blog')}
            </Link>

            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6" dangerouslySetInnerHTML={{ __html: title }} />

            <div className="flex items-center text-gray-500 space-x-6 mb-10 pb-10 border-b">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{format(new Date(post.date), 'dd MMMM, yyyy', { locale: getDateLocale() })}</span>
              </div>
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                <span>{author}</span>
              </div>
            </div>

            {image && (
              <img
                src={image}
                alt={title}
                className="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-soft-medium mb-12"
              />
            )}

            <div
              className="prose lg:prose-xl max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostPage;