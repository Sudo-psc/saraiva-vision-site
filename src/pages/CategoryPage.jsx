import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { Calendar, User, ArrowLeft, Loader2, AlertTriangle, ArrowRight, Tag, Grid, List } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import Breadcrumbs from '@/components/Breadcrumbs';
import { usePostsByCategory, useCategories } from '@/hooks/useWordPress';
import { extractPlainText, getFeaturedImageUrl, getAuthorInfo } from '@/lib/wordpress';

const CategoryPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const { data: posts, loading: postsLoading, error: postsError } = usePostsByCategory(slug, {
    per_page: 12
  });
  
  const { data: categories } = useCategories();

  const getDateLocale = () => {
    return i18n.language === 'pt' ? ptBR : enUS;
  };

  // Find current category
  const currentCategory = categories?.find(cat => cat.slug === slug);

  if (postsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-32 md:py-40 mx-[4%] md:mx-[6%] lg:mx-[8%]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex justify-center items-center h-96">
              <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (postsError || !currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-32 md:py-40 mx-[4%] md:mx-[6%] lg:mx-[8%]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center p-12 bg-red-50 border border-red-200 rounded-2xl max-w-2xl mx-auto">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-red-800 mb-2">
                {t('blog.category_not_found', 'Categoria não encontrada')}
              </h2>
              <p className="text-red-700 mb-6">
                {t('blog.category_not_found_desc', 'A categoria solicitada não foi encontrada.')}
              </p>
              <Link to="/blog">
                <Button className="bg-red-600 hover:bg-red-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('blog.back_to_blog', 'Voltar ao Blog')}
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const breadcrumbs = [
    { label: t('nav.home', 'Início'), href: '/' },
    { label: t('blog.page_title', 'Blog'), href: '/blog' },
    { label: currentCategory.name }
  ];

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts?.map((post, index) => {
        const featuredImageUrl = getFeaturedImageUrl(post, 'medium');
        const author = getAuthorInfo(post);
        const excerpt = extractPlainText(post.excerpt?.rendered, 120);

        return (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="modern-card overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300"
          >
            <Link to={`/blog/${post.slug}`} className="block overflow-hidden">
              <img
                src={featuredImageUrl || 'https://placehold.co/600x400/e2e8f0/64748b?text=Artigo+Saraiva+Vision'}
                alt={post._embedded?.['wp:featuredmedia']?.[0]?.alt_text ||
                  t('ui.alt.blog_post', 'Imagem ilustrativa do artigo') + ': ' +
                  (post.title?.rendered || '').replace(/<[^>]+>/g, '')}
                className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{format(new Date(post.date), 'dd MMM, yyyy', { locale: getDateLocale() })}</span>
                </div>
                {author && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span className="text-xs">{author.name}</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-gray-900 flex-grow">
                <Link 
                  to={`/blog/${post.slug}`} 
                  className="hover:text-blue-600 transition-colors" 
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }} 
                />
              </h3>
              
              {excerpt && (
                <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-4">
                  {excerpt}
                </p>
              )}
              
              <Link to={`/blog/${post.slug}`} className="mt-auto">
                <Button variant="link" className="p-0 text-blue-600 font-semibold group/btn">
                  {t('blog.read_more')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.article>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-8">
      {posts?.map((post, index) => {
        const featuredImageUrl = getFeaturedImageUrl(post, 'medium');
        const author = getAuthorInfo(post);
        const excerpt = extractPlainText(post.excerpt?.rendered, 200);

        return (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="modern-card overflow-hidden flex flex-col md:flex-row group hover:shadow-xl transition-all duration-300"
          >
            {featuredImageUrl && (
              <Link to={`/blog/${post.slug}`} className="md:w-80 flex-shrink-0 overflow-hidden">
                <img
                  src={featuredImageUrl}
                  alt={post._embedded?.['wp:featuredmedia']?.[0]?.alt_text ||
                    t('ui.alt.blog_post', 'Imagem ilustrativa do artigo') + ': ' +
                    (post.title?.rendered || '').replace(/<[^>]+>/g, '')}
                  className="w-full h-48 md:h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
            )}
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{format(new Date(post.date), 'dd MMM, yyyy', { locale: getDateLocale() })}</span>
                </div>
                {author && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span className="text-xs">{author.name}</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                <Link 
                  to={`/blog/${post.slug}`} 
                  className="hover:text-blue-600 transition-colors" 
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }} 
                />
              </h3>
              
              {excerpt && (
                <p className="text-gray-600 mb-4 leading-relaxed line-clamp-4">
                  {excerpt}
                </p>
              )}
              
              <Link to={`/blog/${post.slug}`} className="mt-auto">
                <Button variant="link" className="p-0 text-blue-600 font-semibold group/btn">
                  {t('blog.read_more')}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.article>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{currentCategory.name} - {t('blog.page_title')} | Saraiva Vision</title>
        <meta name="description" content={currentCategory.description || 
          t('blog.category_description', 'Artigos sobre {{category}} - Saraiva Vision', { category: currentCategory.name })} />
        <meta name="keywords" content={`${currentCategory.name}, ${t('blog.keywords', 'oftalmologia, saúde ocular')}`} />
        <meta property="og:title" content={`${currentCategory.name} - ${t('blog.page_title')} | Saraiva Vision`} />
        <meta property="og:description" content={currentCategory.description || 
          t('blog.category_description', 'Artigos sobre {{category}} - Saraiva Vision', { category: currentCategory.name })} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://saraivavision.com.br/categoria/${slug}`} />
      </Helmet>

      <Navbar />
      
      <main className="py-32 md:py-40 mx-[4%] md:mx-[6%] lg:mx-[8%]">
        <div className="container mx-auto px-4 md:px-6">
          {/* Breadcrumbs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Breadcrumbs items={breadcrumbs} />
          </motion.div>

          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Link to="/blog">
              <Button variant="ghost" className="pl-0 text-gray-600 hover:text-blue-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('blog.back_to_blog', 'Voltar ao Blog')}
              </Button>
            </Link>
          </motion.div>

          {/* Category header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Tag className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                {currentCategory.name}
              </h1>
            </div>
            
            {currentCategory.description && (
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                {currentCategory.description}
              </p>
            )}
            
            <div className="mt-6 text-sm text-gray-500">
              {posts?.length || 0} {t('blog.articles_count', 'artigos encontrados')}
            </div>
          </motion.div>

          {/* View toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mb-8"
          >
            <div className="flex bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-l-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-r-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Posts content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {!posts || posts.length === 0 ? (
              <div className="text-center p-12">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  {t('blog.no_posts_category', 'Nenhum artigo encontrado nesta categoria')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('blog.no_posts_category_desc', 'Esta categoria ainda não possui artigos publicados.')}
                </p>
                <Link to="/blog">
                  <Button>
                    {t('blog.browse_all_articles', 'Ver todos os artigos')}
                  </Button>
                </Link>
              </div>
            ) : (
              viewMode === 'grid' ? renderGridView() : renderListView()
            )}
          </motion.div>

          {/* Other categories */}
          {categories && categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 pt-12 border-t border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                {t('blog.other_categories', 'Outras Categorias')}
              </h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {categories
                  .filter(cat => cat.slug !== slug)
                  .slice(0, 8)
                  .map((category) => (
                    <Link 
                      key={category.id}
                      to={`/categoria/${category.slug}`}
                      className="px-4 py-2 bg-white text-gray-700 rounded-lg border hover:border-blue-300 hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Tag className="w-3 h-3 mr-1 inline" />
                      {category.name}
                      <span className="ml-2 text-xs text-gray-500">({category.count})</span>
                    </Link>
                  ))
                }
              </div>
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;
