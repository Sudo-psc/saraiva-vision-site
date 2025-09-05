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
} from '../lib/wordpress';

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

        // Check if WordPress is available
        const isConnected = await checkWordPressConnection();
        setWordpressAvailable(isConnected);

        if (!isConnected) {
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
  }, [currentPage, selectedCategory, searchTerm]);

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
        className="modern-card overflow-hidden flex flex-col"
      >
        <Link to={`/blog/${post.slug}`} className="block overflow-hidden">
          <img
            src={featuredImage || 'https://placehold.co/600x400/e2e8f0/64748b?text=Image'}
            alt={post._embedded?.['wp:featuredmedia']?.[0]?.alt_text ||
              t('ui.alt.blog_post', 'Imagem ilustrativa do artigo') + ': ' +
              (post.title?.rendered || '').replace(/<[^>]+>/g, '')}
            className="w-full h-56 object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        </Link>
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{format(new Date(post.date), 'dd MMMM, yyyy', { locale: getDateLocale() })}</span>
            {post._embedded?.['wp:term']?.[0]?.length > 0 && (
              <span className="ml-4 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {post._embedded['wp:term'][0][0].name}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-900 flex-grow">
            <Link
              to={`/blog/${post.slug}`}
              className="hover:text-blue-600"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
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
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
        </div>
      );
    }

    if (error || !wordpressAvailable) {
      return (
        <div className="text-center p-12 bg-yellow-50 border border-yellow-200 rounded-2xl max-w-2xl mx-auto">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-yellow-800">{t('blog.placeholder_title')}</h3>
          <p className="text-yellow-700 mt-2">{t('blog.placeholder_desc_page')}</p>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="text-center p-12">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('blog.search_placeholder')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedCategory === null
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
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedCategory === category.id
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => renderPostCard(post, index))}
        </div>
      </>
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
