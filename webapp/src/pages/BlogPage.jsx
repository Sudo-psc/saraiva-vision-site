import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { Calendar, Loader2, AlertTriangle, ArrowRight, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  fetchPosts,
  fetchCategories,
  getFeaturedImageUrl,
  extractPlainText,
  checkWordPressConnection
} from '../lib/wordpress-fixed';

const BlogPage = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [wordpressAvailable, setWordpressAvailable] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Debug: Log API configuration
        console.log('[BlogPage] Checking WordPress connection...');
        console.log('[BlogPage] API_BASE_URL:', import.meta.env.VITE_WORDPRESS_API_URL);

        // Check if WordPress is available
        const isConnected = await checkWordPressConnection();
        console.log('[BlogPage] WordPress connection result:', isConnected);
        setWordpressAvailable(isConnected);

        if (!isConnected) {
          console.log('[BlogPage] WordPress not available, showing fallback');
          setLoading(false);
          return;
        }

        const params = {
          per_page: 9,
          page: currentPage,
        };

        if (selectedCategory) {
          params.categories = [selectedCategory];
        }

        if (searchTerm) {
          params.search = searchTerm;
        }

        const [postsData, categoriesData] = await Promise.all([
          fetchPosts(params),
          categories.length === 0 ? fetchCategories() : Promise.resolve(categories)
        ]);

        setPosts(postsData);
        if (categories.length === 0) {
          setCategories(categoriesData);
        }

      } catch (error) {
        console.error('Error loading blog data:', error);
        setError(error.message);
        setWordpressAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, selectedCategory, searchTerm, categories]);

  const getDateLocale = () => {
    return i18n.language === 'pt' ? ptBR : enUS;
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const renderPostCard = (post, index) => {
    const featuredImage = getFeaturedImageUrl(post);
    const excerpt = extractPlainText(post.excerpt?.rendered || '', 120);

    return (
      <motion.article
        key={post.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="modern-card overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
        role="article"
        aria-labelledby={`post-title-${post.id}`}
      >
        <Link 
          to={`/blog/${post.slug}`} 
          className="block overflow-hidden focus:outline-none"
          aria-label={t('blog.read_post', 'Ler o post: {{title}}', { title: (post.title?.rendered || '').replace(/<[^>]+>/g, '') })}
        >
          <img
            src={featuredImage || 'https://placehold.co/600x400/e2e8f0/64748b?text=Image'}
            alt={post._embedded?.['wp:featuredmedia']?.[0]?.alt_text ||
              t('ui.alt.blog_post', 'Imagem ilustrativa do artigo') + ': ' +
              (post.title?.rendered || '').replace(/<[^>]+>/g, '')}
            className="w-full h-48 sm:h-52 md:h-56 object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        </Link>
        <div className="p-4 sm:p-6 flex flex-col flex-grow">
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
            <time 
              dateTime={post.date}
              aria-label={t('blog.published_date', 'Publicado em {{date}}', { 
                date: format(new Date(post.date), 'dd MMMM, yyyy', { locale: getDateLocale() }) 
              })}
            >
              {format(new Date(post.date), 'dd MMMM, yyyy', { locale: getDateLocale() })}
            </time>
            {post._embedded?.['wp:term']?.[0]?.length > 0 && (
              <span 
                className="ml-4 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                role="note"
                aria-label={t('blog.category_label', 'Categoria: {{category}}', { 
                  category: post._embedded['wp:term'][0][0].name 
                })}
              >
                {post._embedded['wp:term'][0][0].name}
              </span>
            )}
          </div>
          <h3 
            id={`post-title-${post.id}`}
            className="text-xl font-bold mb-3 text-gray-900 flex-grow"
          >
            <Link
              to={`/blog/${post.slug}`}
              className="hover:text-blue-600 focus:outline-none focus:text-blue-600 focus:underline"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
          </h3>
          {excerpt && (
            <div className="text-gray-600 mb-4 text-sm">
              {excerpt}
            </div>
          )}
          <Link 
            to={`/blog/${post.slug}`} 
            className="mt-auto focus:outline-none"
            aria-label={t('blog.read_more_post', 'Leia mais sobre: {{title}}', { 
              title: (post.title?.rendered || '').replace(/<[^>]+>/g, '') 
            })}
          >
            <Button variant="link" className="p-0 text-blue-600 font-semibold group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
              {t('blog.read_more')}
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </motion.article>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96" role="status" aria-live="polite">
          <Loader2 className="h-16 w-16 animate-spin text-blue-500" aria-hidden="true" />
          <span className="sr-only">{t('blog.loading', 'Carregando posts do blog...')}</span>
        </div>
      );
    }

    if (error || !wordpressAvailable) {
      return (
        <div 
          className="text-center p-12 bg-yellow-50 border border-yellow-200 rounded-2xl max-w-2xl mx-auto"
          role="alert"
          aria-live="assertive"
        >
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-2xl font-semibold text-yellow-800">{t('blog.placeholder_title')}</h3>
          <p className="text-yellow-700 mt-2">{t('blog.placeholder_desc_page')}</p>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div 
          className="text-center p-12"
          role="status"
          aria-live="polite"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('blog.no_posts')}</h3>
          <p className="text-gray-600">{t('blog.no_posts_description')}</p>
        </div>
      );
    }

    return (
      <>
        {/* Search and Filter Section */}
        <div className="mb-12">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
            <div className="relative">
              <label htmlFor="blog-search" className="sr-only">
                {t('blog.search_placeholder')}
              </label>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
              <input
                id="blog-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('blog.search_placeholder')}
                aria-describedby="search-description"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-transparent"
              />
              <span id="search-description" className="sr-only">
                {t('blog.search_description', 'Digite para buscar posts por título ou conteúdo')}
              </span>
            </div>
          </form>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2" role="group" aria-label={t('blog.category_filters', 'Filtros de categoria')}>
              <button
                onClick={() => handleCategoryChange(null)}
                aria-pressed={selectedCategory === null}
                aria-label={t('blog.all_categories_label', 'Mostrar todos os posts')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {t('blog.all_categories')}
              </button>

              {categories.slice(0, 6).map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  aria-pressed={selectedCategory === category.id}
                  aria-label={t('blog.filter_by_category', 'Filtrar por categoria: {{category}}', { category: category.name })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8">
          {posts.map((post, index) => renderPostCard(post, index))}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Helmet>
        <title>{t('blog.page_title')} | Saraiva Vision</title>
        <meta name="description" content={t('blog.page_description')} />
      </Helmet>
      <Navbar />
      <main 
        className="py-32 md:py-40 scroll-block-internal mx-[4%] md:mx-[6%] lg:mx-[8%] xl:mx-[10%] 2xl:mx-[12%]"
        role="main"
        aria-label={t('blog.main_content_label', 'Conteúdo principal do blog')}
      >
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{t('blog.page_title')}</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t('blog.page_subtitle')}</p>
          </motion.header>
          <section aria-label={t('blog.posts_section_label', 'Posts do blog')}>
            {renderContent()}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
