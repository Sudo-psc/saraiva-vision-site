import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { Calendar, User, ArrowLeft, Loader2, AlertTriangle, Share2, Clock } from 'lucide-react';
import DOMPurify from 'dompurify';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  fetchPostBySlug,
  fetchRelatedPosts,
  getFeaturedImageUrl,
  getAuthorInfo,
  cleanHtmlContent,
  extractPlainText
} from '../lib/wordpress';

const PostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const postData = await fetchPostBySlug(slug);
        setPost(postData);

        // Load related posts
        try {
          const related = await fetchRelatedPosts(postData, 3);
          setRelatedPosts(related);
        } catch (relatedError) {
          console.warn('Could not load related posts:', relatedError);
          setRelatedPosts([]);
        }

      } catch (error) {
        console.error('Error loading post:', error);
        setError(error.message);
        if (error.message === 'Post not found') {
          navigate('/blog', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadPost();
    }
  }, [slug, navigate]);

  const getDateLocale = () => {
    return i18n.language === 'pt' ? ptBR : enUS;
  };

  const sharePost = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title?.rendered?.replace(/<[^>]+>/g, '') || '',
        text: extractPlainText(post.excerpt?.rendered || '', 100),
        url: window.location.href,
      });
    } else {
      // Fallback to copy URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const estimateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const text = extractPlainText(content);
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-20 w-20 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-32 md:py-40 mx-[4%] md:mx-[6%] lg:mx-[8%]">
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

  if (!post) return null;

  const cleanTitle = post.title.rendered.replace(/<[^>]+>/g, '');

  return (
    <div className="min-h-screen bg-white relative">
      <Helmet>
        <title>{cleanTitle} | Saraiva Vision</title>
        <meta name="description" content={post.excerpt.rendered.replace(/<[^>]+>/g, '')} />
      </Helmet>
      <Navbar />
      <main className="py-32 md:py-40 mx-[4%] md:mx-[6%] lg:mx-[8%]">
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

            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />

            <div className="flex items-center text-gray-500 space-x-6 mb-10 pb-10 border-b">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{format(new Date(post.date), 'dd MMMM, yyyy', { locale: getDateLocale() })}</span>
              </div>
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                <span>{post?._embedded?.author?.[0]?.name || t('blog.unknown_author', 'Autor desconhecido')}</span>
              </div>
            </div>

            {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
              <img
                src={post._embedded['wp:featuredmedia'][0].source_url}
                alt={post._embedded['wp:featuredmedia'][0]?.alt_text ||
                  t('ui.alt.blog_post', 'Imagem ilustrativa do artigo') + ': ' + cleanTitle}
                className="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-soft-medium mb-12"
              />
            )}

            <div
              className="prose lg:prose-xl max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Aviso de construção removido nesta subpágina */}
    </div>
  );
};

export default PostPage;
