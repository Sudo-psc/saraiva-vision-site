import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { Calendar, Loader2, AlertTriangle, ArrowRight, Search, Activity } from 'lucide-react';
import Navbar from '../components/Navbar';
import EnhancedFooter from '../components/EnhancedFooter';
import { Button } from '../components/ui/button';
import WordPressFallbackNotice from '@/components/WordPressFallbackNotice';
import BlogStatusBanner from '@/components/BlogStatusBanner';
import { sanitizeWordPressTitle } from '@/utils/sanitizeWordPressContent';
import { createLogger } from '@/lib/logger';
import { getUserFriendlyError } from '@/lib/errorHandling';
// WordPress functions with backward compatibility
import {
  fetchPosts,
  fetchCategories,
  getFeaturedImageUrl,
  extractPlainText,
  checkWordPressConnection
} from '../lib/wordpress-compat';

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
  const [retryIndex, setRetryIndex] = useState(0);
  const [errorDetails, setErrorDetails] = useState(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const loggerRef = useRef(createLogger('blog-page'));

  const logEvent = useCallback((level, message, metadata = {}) => {
    const logger = loggerRef.current;
    if (!logger || typeof logger[level] !== 'function') return;
    Promise.resolve(logger[level](message, metadata)).catch(() => {});
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Do not set a page-level error for categories, as posts might still load
      }
    };

    loadCategories();
  }, []); // Runs only once on mount

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        setErrorDetails(null);
        setShowDiagnostics(false);

        const connectionResult = await checkWordPressConnection();
        setWordpressAvailable(connectionResult.isConnected);

        logEvent('info', 'WordPress connection check completed', {
          isConnected: connectionResult.isConnected,
          healthState: connectionResult.healthState
        });

        if (!connectionResult.isConnected) {
          const connectionError = {
            message: connectionResult.error || t('blog.cms_unavailable', 'CMS indisponível no momento.'),
            code: 'network.offline',
            severity: 'high',
            timestamp: new Date().toISOString(),
            retryable: true
          };
          setError(connectionError.message);
          setErrorDetails(connectionError);
          logEvent('warn', 'WordPress connection unavailable', connectionError);
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

        const postsData = await fetchPosts(params);
        setPosts(postsData);
        const meta = postsData?.meta || {};
        const diagnostics = meta.diagnostics || {};
        const metaError = meta.errorDetails || null;
        setErrorDetails(metaError);

        logEvent(meta.isFallback ? 'warn' : 'info', meta.isFallback
          ? 'Serving blog posts via fallback'
          : 'Blog posts loaded successfully', {
          count: Array.isArray(postsData) ? postsData.length : 0,
          ...diagnostics,
          errorCode: metaError?.code,
          message: metaError?.message || meta?.fallbackMeta?.message
        });

      } catch (error) {
        const friendly = getUserFriendlyError(error.details || error);
        const detailedError = {
          message: friendly.userMessage || friendly.message || error.message || t('blog.cms_error', 'Não foi possível carregar os artigos.'),
          code: friendly.code,
          severity: friendly.severity,
          retryable: friendly.retryable !== false,
          originalMessage: error.message,
          timestamp: new Date().toISOString()
        };

        setError(detailedError.message);
        setErrorDetails(detailedError);
        setWordpressAvailable(false);

        logEvent('error', 'Error loading blog posts', {
          ...detailedError,
          stack: error.stack,
          params: {
            currentPage,
            selectedCategory,
            searchTerm
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [currentPage, selectedCategory, searchTerm, retryIndex, logEvent, t]);

  const handleRetry = () => {
    logEvent('info', 'Manual blog retry triggered', {
      currentPage,
      selectedCategory,
      searchTerm
    });
    setRetryIndex((prev) => prev + 1);
  };

  const getDateLocale = () => {
    return i18n.language === 'pt' ? ptBR : enUS;
  };

  const formatTimestamp = useCallback((isoString) => {
    if (!isoString) {
      return t('blog.not_available', 'Não informado');
    }

    try {
      return format(new Date(isoString), 'dd/MM/yyyy HH:mm:ss', { locale: getDateLocale() });
    } catch (err) {
      return isoString;
    }
  }, [getDateLocale, t]);

  const renderDiagnosticsPanel = useCallback((meta, titleParam) => {
    const title = titleParam ?? t('blog.diagnostics_title', 'Diagnóstico do CMS');
    if (!meta && !errorDetails) {
      return null;
    }

    const diagnostics = meta?.diagnostics || {};
    const detailSource = meta?.errorDetails || errorDetails;
    const timestamp = diagnostics.fetchedAt || meta?.fallbackMeta?.generatedAt || detailSource?.timestamp;

    const parameterEntries = diagnostics.parameters
      ? Object.entries(diagnostics.parameters)
          .filter(([, value]) => value !== null && value !== undefined && value !== '')
      : [];

    return (
      <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm" role="status" aria-live="polite">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm">
              <Activity className="w-4 h-4" aria-hidden="true" />
              <span>{title}</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {t('blog.diagnostics_meta', 'Origem: {{source}} • Última atualização: {{timestamp}}', {
                source: diagnostics.source || (meta?.isFallback ? 'fallback' : 'live'),
                timestamp: formatTimestamp(timestamp)
              })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDiagnostics(prev => !prev)}
            className="text-blue-700 hover:text-blue-800"
          >
            {showDiagnostics ? t('blog.hide_logs', 'Ocultar logs') : t('blog.show_logs', 'Ver logs técnicos')}
          </Button>
        </div>

        {showDiagnostics && (
          <div className="mt-4 space-y-4 text-xs text-left text-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div><span className="font-semibold">{t('blog.diagnostics_status', 'Fallback')}:</span> {meta?.isFallback ? t('blog.yes', 'Sim') : t('blog.no', 'Não')}</div>
              <div><span className="font-semibold">{t('blog.diagnostics_health', 'Estado do CMS')}:</span> {diagnostics.healthState || t('blog.not_available', 'Não informado')}</div>
              <div><span className="font-semibold">{t('blog.diagnostics_cached', 'Conteúdo em cache')}:</span> {diagnostics.isCached ? t('blog.yes', 'Sim') : t('blog.no', 'Não')}</div>
              <div><span className="font-semibold">{t('blog.diagnostics_offline', 'Modo offline')}:</span> {diagnostics.isOffline ? t('blog.yes', 'Sim') : t('blog.no', 'Não')}</div>
            </div>

            {parameterEntries.length > 0 && (
              <div>
                <p className="font-semibold text-gray-800 mb-2">{t('blog.diagnostics_filters', 'Parâmetros da consulta')}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {parameterEntries.map(([key, value]) => (
                    <li key={key} className="bg-gray-50 border border-gray-100 rounded px-2 py-1 text-gray-600">
                      <span className="font-medium text-gray-800">{key}</span>: {Array.isArray(value) ? value.join(', ') : value.toString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detailSource && (
              <div className="border-t border-gray-200 pt-3 space-y-1">
                <p className="font-semibold text-gray-800">{t('blog.diagnostics_last_error', 'Último erro registrado')}</p>
                {detailSource.code && (
                  <p><span className="font-semibold text-gray-700">{t('blog.diagnostics_code', 'Código')}:</span> {detailSource.code}</p>
                )}
                <p><span className="font-semibold text-gray-700">{t('blog.diagnostics_message', 'Mensagem')}:</span> {detailSource.message}</p>
                {detailSource.originalMessage && (
                  <p className="text-gray-500">{detailSource.originalMessage}</p>
                )}
                <p><span className="font-semibold text-gray-700">{t('blog.diagnostics_retry', 'Tentativa recomendada')}:</span> {detailSource.retryable ? t('blog.yes', 'Sim') : t('blog.no', 'Não')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }, [errorDetails, formatTimestamp, showDiagnostics, t]);

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
              dangerouslySetInnerHTML={{ __html: sanitizeWordPressTitle(post.title?.rendered || '') }}
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

    const fallbackMeta = posts.meta;
    const isFallback = fallbackMeta?.isFallback;

    if (isFallback) {
      return (
        <div className="space-y-8">
          <BlogStatusBanner className="mb-6" />
          <WordPressFallbackNotice meta={fallbackMeta} onRetry={handleRetry} />
          {renderDiagnosticsPanel(fallbackMeta)}
          {posts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id ?? index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="modern-card overflow-hidden flex flex-col border border-yellow-100 bg-white/60"
                  role="article"
                  aria-label="Conteúdo temporário do blog"
                >
                  <div className="p-4 sm:p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
                      <time dateTime={post.date}>{format(new Date(post.date), 'dd MMMM, yyyy', { locale: getDateLocale() })}</time>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{post.title}</h3>
                    <p className="text-gray-600 text-sm flex-grow">{post.excerpt}</p>
                    <span className="mt-4 text-xs text-gray-500">Tentaremos novamente automaticamente em instantes.</span>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (error || !wordpressAvailable) {
      return (
        <div className="space-y-6">
          <BlogStatusBanner showDetails className="mb-6" />
          {renderDiagnosticsPanel({
            isFallback: false,
            diagnostics: {
              source: 'error',
              fetchedAt: errorDetails?.timestamp,
              healthState: 'unhealthy'
            },
            errorDetails
          }, t('blog.diagnostics_error_title', 'Detalhes do incidente'))}
          <div
            className="text-center p-12 bg-yellow-50 border border-yellow-200 rounded-2xl max-w-2xl mx-auto"
            role="alert"
            aria-live="assertive"
          >
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-2xl font-semibold text-yellow-800">{t('blog.placeholder_title')}</h3>
            <p className="text-yellow-700 mt-2">{t('blog.placeholder_desc_page')}</p>
          </div>
        </div>
      );
    }

    if (error || !wordpressAvailable) {
      return (
        <div className="space-y-6">
          <BlogStatusBanner showDetails className="mb-6" />
          <div
            className="text-center p-12 bg-yellow-50 border border-yellow-200 rounded-2xl max-w-2xl mx-auto"
            role="alert"
            aria-live="assertive"
          >
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-2xl font-semibold text-yellow-800">{t('blog.placeholder_title')}</h3>
            <p className="text-yellow-700 mt-2">{t('blog.placeholder_desc_page')}</p>
          </div>
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
      <EnhancedFooter />
    </div>
  );
};

export default BlogPage;
