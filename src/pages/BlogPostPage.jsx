import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Share2,
  Tag,
  BookOpen
} from 'lucide-react';
import DOMPurify from 'dompurify';
import Navbar from '@/components/Navbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getPostBySlug as fetchPostBySlug,
  getFeaturedImageUrl,
  checkWordPressConnection
} from '../lib/wordpress-compat';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wordpressAvailable, setWordpressAvailable] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[BlogPostPage] Loading post:', slug);

        // Check WordPress connection
        const isConnected = await checkWordPressConnection();
        setWordpressAvailable(isConnected);

        if (!isConnected) {
          console.log('[BlogPostPage] WordPress not available');
          setLoading(false);
          return;
        }

        const postData = await fetchPostBySlug(slug);

        if (!postData) {
          setError('Post not found');
          setLoading(false);
          return;
        }

        setPost(postData);
      } catch (error) {
        console.error('Error loading blog post:', error);
        setError(error.message);
        setWordpressAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadPost();
    }
  }, [slug]);

  const getDateLocale = () => {
    return i18n.language === 'pt' ? ptBR : enUS;
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title.rendered.replace(/<[^>]+>/g, ''),
          text: post.excerpt?.rendered?.replace(/<[^>]+>/g, '') || '',
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const sanitizeContent = (content) => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class']
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-32 md:py-40">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex justify-center items-center h-96">
              <div className="text-center">
                <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">{t('blog.loading_post', 'Carregando artigo...')}</p>
              </div>
            </div>
          </div>
        </main>
        <EnhancedFooter />
      </div>
    );
  }

  if (error || !wordpressAvailable) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-32 md:py-40">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center p-12 bg-yellow-50 border border-yellow-200 rounded-2xl">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-yellow-800 mb-2">
                {t('blog.post_not_available', 'Artigo temporariamente indisponível')}
              </h2>
              <p className="text-yellow-700 mb-6">
                {error || t('blog.connection_error', 'Não foi possível conectar ao sistema de blog.')}
              </p>
              <Button
                onClick={() => navigate('/blog')}
                variant="outline"
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('blog.back_to_blog', 'Voltar ao Blog')}
              </Button>
            </div>
          </div>
        </main>
        <EnhancedFooter />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-32 md:py-40">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center p-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {t('blog.post_not_found', 'Artigo não encontrado')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('blog.post_not_found_desc', 'O artigo que você procura não existe ou foi removido.')}
              </p>
              <Button onClick={() => navigate('/blog')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('blog.back_to_blog', 'Voltar ao Blog')}
              </Button>
            </div>
          </div>
        </main>
        <EnhancedFooter />
      </div>
    );
  }

  const featuredImage = getFeaturedImageUrl(post);
  const publishDate = new Date(post.date);
  const categories = post._embedded?.['wp:term']?.[0] || [];
  const tags = post._embedded?.['wp:term']?.[1] || [];
  const author = post._embedded?.author?.[0] || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{post.title.rendered.replace(/<[^>]+>/g, '')} | Blog - Saraiva Vision</title>
        <meta name="description" content={post.excerpt?.rendered?.replace(/<[^>]+>/g, '') || ''} />
        <meta property="og:title" content={post.title.rendered.replace(/<[^>]+>/g, '')} />
        <meta property="og:description" content={post.excerpt?.rendered?.replace(/<[^>]+>/g, '') || ''} />
        <meta property="og:image" content={featuredImage || ''} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
        <meta property="article:author" content={author.name || 'Dr. Philipe Saraiva'} />
        <meta property="article:published_time" content={post.date} />
        {categories.map(cat => (
          <meta key={cat.id} property="article:section" content={cat.name} />
        ))}
        {tags.map(tag => (
          <meta key={tag.id} property="article:tag" content={tag.name} />
        ))}
      </Helmet>

      <Navbar />

      <main className="py-32 md:py-40">
        <article className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate('/blog')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('blog.back_to_blog', 'Voltar ao Blog')}
            </Button>
          </motion.div>

          {/* Article Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            {featuredImage && (
              <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={featuredImage}
                  alt={post._embedded?.['wp:featuredmedia']?.[0]?.alt_text ||
                    t('ui.alt.blog_post_image', 'Imagem do artigo')}
                  className="w-full h-64 md:h-96 object-cover"
                  loading="eager"
                />
              </div>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map(category => (
                  <Badge key={category.id} variant="secondary" className="bg-blue-100 text-blue-800">
                    <Tag className="w-3 h-3 mr-1" />
                    {category.name}
                  </Badge>
                ))}
              </div>
            )}

            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <time dateTime={post.date}>
                  {format(publishDate, 'dd MMMM, yyyy', { locale: getDateLocale() })}
                </time>
              </div>

              {post.reading_time && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{post.reading_time} min de leitura</span>
                </div>
              )}

              {author.name && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>{author.name}</span>
                </div>
              )}

              {post.doctor_info?.crm && (
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span>{post.doctor_info.crm}</span>
                </div>
              )}
            </div>

            {/* Medical Difficulty Level */}
            {post.medical_difficulty && (
              <div className="mb-6">
                <Badge
                  variant={post.medical_difficulty === 'advanced' ? 'destructive' :
                    post.medical_difficulty === 'intermediate' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {t(`blog.difficulty.${post.medical_difficulty}`, post.medical_difficulty)}
                </Badge>
              </div>
            )}

            {/* Share Button */}
            <div className="flex gap-4">
              <Button onClick={handleShare} variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                {t('blog.share', 'Compartilhar')}
              </Button>
            </div>
          </motion.header>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-lg max-w-none mb-12"
          >
            <div
              className="blog-content text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: sanitizeContent(post.content.rendered)
              }}
            />
          </motion.div>

          {/* Medical Disclaimer */}
          {post.medical_disclaimer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-12"
            >
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-1" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    ⚕️ {t('blog.medical_disclaimer_title', 'Aviso Médico')}
                  </h4>
                  <p className="text-yellow-700 text-sm leading-relaxed">
                    {post.medical_disclaimer}
                  </p>
                  <p className="text-yellow-600 text-xs mt-2 font-medium">
                    Dr. Philipe Saraiva Cruz - CRM-MG 69.870
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-12"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('blog.tags', 'Tags')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge key={tag.id} variant="outline" className="text-gray-600">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* Author Info */}
          {post.doctor_info && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-12"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('blog.about_author', 'Sobre o Autor')}
              </h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{post.doctor_info.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {post.doctor_info.crm} - {post.doctor_info.specialty}
                  </p>
                  <p className="text-sm text-gray-600">
                    📍 {post.doctor_info.clinic}
                  </p>
                  {post.doctor_info.bio && (
                    <p className="text-sm text-gray-700 mt-2">
                      {post.doctor_info.bio}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="text-center"
          >
            <Button onClick={() => navigate('/blog')} size="lg" className="px-8">
              {t('blog.see_more_posts', 'Ver Mais Artigos')}
            </Button>
          </motion.div>
        </article>
      </main>

      <EnhancedFooter />
    </div>
  );
};

export default BlogPostPage;