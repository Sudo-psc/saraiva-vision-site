import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { Calendar, ArrowRight, ArrowLeft, Shield, Stethoscope, Cpu, HelpCircle, Clock, User, ChevronLeft, ChevronRight, Headphones, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import { Button } from '@/components/ui/button';
import { blogPosts, categoryConfig, getPostBySlug, getPostBySlugSync, categories } from '@/content/blog';
import { getPostEnrichment } from '@/data/blogPostsEnrichment';
import CategoryBadge from '@/components/blog/CategoryBadge';
import OptimizedImage from '@/components/blog/OptimizedImage';
import SpotifyEmbed from '@/components/SpotifyEmbed';
import TableOfContents from '@/components/blog/TableOfContents';
import RelatedPostsWidget from '@/components/blog/RelatedPostsWidget';
import ShareWidget from '@/components/blog/ShareWidget';
import AuthorWidget from '@/components/blog/AuthorWidget';
import NewsletterForm from '@/components/blog/NewsletterForm';
import { trackBlogInteraction, trackPageView, trackSearchInteraction } from '@/utils/analytics';
import { generateCompleteSchemaBundle, getPostSpecificSchema } from '@/lib/blogSchemaMarkup';

// Helper function to format dates - extracted for performance
const formatDate = (dateString) => {
  dayjs.locale('pt-br');
  return dayjs(dateString).format('DD MMMM, YYYY');
};

// Helper function to extract headings from HTML content - extracted for performance
const extractHeadings = (htmlContent) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const headingElements = tempDiv.querySelectorAll('h2, h3');

  return Array.from(headingElements).map((heading, index) => {
    const text = heading.textContent;
    const id = `heading-${index}`;
    heading.id = id; // Add ID to actual heading in content

    return {
      id,
      text,
      level: parseInt(heading.tagName.charAt(1))
    };
  });
};

const BlogPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = React.useState('Todas');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const POSTS_PER_PAGE = 6;

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Check if viewing single post
  const currentPost = slug ? getPostBySlugSync(slug) : null;

  // Filter posts based on category and debounced search - memoized for performance
  const filteredPosts = React.useMemo(() => {
    return blogPosts.filter(post => {
      const matchesCategory = selectedCategory === 'Todas' || post.category === selectedCategory;
      const matchesSearch = !debouncedSearch ||
        post.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, debouncedSearch]);

  // Calculate pagination - memoized to prevent unnecessary recalculations
  const paginationData = React.useMemo(() => {
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const currentPosts = filteredPosts.slice(startIndex, endIndex);
    return { totalPages, startIndex, endIndex, currentPosts };
  }, [filteredPosts, currentPage]);

  const { totalPages, currentPosts } = paginationData;

  // Reset to page 1 when filters change - optimized to avoid unnecessary effect calls
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearch]);

  // Track page views and blog interactions
  React.useEffect(() => {
    if (currentPost) {
      // Track individual post view
      trackPageView(`/blog/${currentPost.slug}`);
      trackBlogInteraction('view_post', currentPost.slug, {
        post_title: currentPost.title,
        post_category: currentPost.category,
        post_author: currentPost.author
      });
    } else {
      // Track blog listing view
      trackPageView('/blog');
    }
  }, [currentPost]);

  // Track search interactions
  React.useEffect(() => {
    if (debouncedSearch) {
      trackSearchInteraction(debouncedSearch, filteredPosts.length, {
        context: 'blog',
        category: selectedCategory
      });
    }
  }, [debouncedSearch, filteredPosts.length, selectedCategory]);


  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    // Track category filter
    trackBlogInteraction('filter_category', null, {
      category: category,
      results_count: filteredPosts.filter(post =>
        category === 'Todas' || post.category === category
      ).length
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  // Memoized function to render post cards for performance
  const renderPostCard = React.useCallback((post, index) => {
    const enrichment = getPostEnrichment(post.id);
    const readingTime = Math.ceil((post.content?.length || 1000) / 1000);

    return (
      <motion.article
        key={post.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative flex flex-col bg-white rounded-xl border border-border-light hover:border-primary-300 hover:shadow-lg transition-all overflow-hidden h-full"
        role="article"
        aria-labelledby={`post-title-${post.id}`}
      >
        <Link
          to={`/blog/${post.slug}`}
          className="relative block focus:outline-none"
          aria-label={`Ler o post: ${post.title}`}
        >
          <div className="relative w-full h-48 sm:h-52 md:h-56 overflow-hidden bg-gray-100 rounded-t-xl">
            <OptimizedImage
              src={post.image}
              alt={`Imagem ilustrativa do artigo: ${post.title}`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              width="400"
              height="225"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
              fallbackSrc="/img/blog-fallback.jpg"
            />
          </div>
        </Link>

        <div className="p-6 flex flex-col flex-grow min-h-0">
          {/* Category Badge */}
          <div className="mb-3">
            <CategoryBadge category={post.category} size="sm" />
          </div>

          {/* Title */}
          <h3
            id={`post-title-${post.id}`}
            className="text-xl font-bold mb-3 text-text-primary leading-tight"
          >
            <Link
              to={`/blog/${post.slug}`}
              className="hover:text-primary-600 focus:outline-none focus:text-primary-600 focus:underline transition-colors"
            >
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          <p className="text-text-secondary mb-4 text-sm leading-relaxed line-clamp-3 flex-shrink-0">
            {post.excerpt}
          </p>

          {/* Metadata Row */}
          <div className="flex items-center justify-between text-xs text-text-muted mb-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <time
                  dateTime={post.date}
                  aria-label={`Publicado em ${formatDate(post.date)}`}
                >
                  {formatDate(post.date)}
                </time>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{readingTime} min de leitura</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="font-medium">{post.author || 'Dr. Saraiva'}</span>
            </div>
          </div>

          {/* Learning Points Preview */}
          {enrichment?.learningPoints && enrichment.learningPoints.length > 0 && (
            <div className="bg-primary-50 rounded-lg p-3 mb-4 border border-primary-100">
              <p className="text-xs font-semibold text-primary-700 mb-2">O que você vai aprender:</p>
              <ul className="space-y-1">
                {enrichment.learningPoints.slice(0, 2).map((point, idx) => (
                  <li key={idx} className="text-xs text-primary-800 flex items-start gap-2">
                    <span className="text-primary-600 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Clean CTA Button */}
          <Link
            to={`/blog/${post.slug}`}
            className="mt-auto focus:outline-none"
            aria-label={`Leia mais sobre: ${post.title}`}
          >
            <Button variant="default" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2">
              <span>{t('blog.read_more', 'Ler artigo completo')}</span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </motion.article>
    );
  }, [t]);

  // Render single post view
  if (currentPost) {
    const enrichment = getPostEnrichment(currentPost.id);

    // Generate Schema.org structured data
    const schemaBundle = generateCompleteSchemaBundle(currentPost, enrichment?.faqs);
    const postSpecificSchema = getPostSpecificSchema(currentPost.id);

    const headings = currentPost.content ? extractHeadings(currentPost.content) : [];

    // Get related posts from same category
    const relatedPosts = blogPosts
      .filter(post => post.category === currentPost.category && post.id !== currentPost.id)
      .slice(0, 3);

    return (
      <div className="min-h-screen bg-white relative">
        <Helmet>
          <title>{currentPost.seo?.metaTitle || currentPost.title} | Saraiva Vision</title>
          <meta name="description" content={currentPost.seo?.metaDescription || currentPost.excerpt} />
          <meta name="keywords" content={Array.isArray(currentPost.seo?.keywords) ? currentPost.seo.keywords.join(', ') : currentPost.tags?.join(', ') || ''} />

          {/* Schema.org Structured Data */}
          {schemaBundle.map((schema, index) => (
            <script key={`schema-${index}`} type="application/ld+json">
              {JSON.stringify(schema)}
            </script>
          ))}

          {/* Post-specific schema (conditions/procedures) */}
          {postSpecificSchema && (
            <script type="application/ld+json">
              {JSON.stringify(postSpecificSchema)}
            </script>
          )}
        </Helmet>

        <Navbar />

        {/* Skip to content link */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg">
          Pular para o conteúdo
        </a>

        <main id="main-content" tabIndex="-1" className="py-20 md:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center space-x-2 text-sm text-text-secondary">
                <li>
                  <Link to="/" className="hover:text-primary-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link to="/blog" className="hover:text-primary-600 transition-colors">
                    Blog
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-text-primary font-semibold truncate max-w-xs md:max-w-md" title={currentPost.title}>
                  {currentPost.title}
                </li>
              </ol>
            </nav>

            {/* Back Button */}
            <Button
              onClick={() => navigate('/blog')}
              variant="ghost"
              className="mb-8 mt-8 hover:bg-blue-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o blog
            </Button>

            {/* 3-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Left Sidebar - Table of Contents (Hidden on mobile) */}
              <aside className="hidden lg:block lg:col-span-3">
                <div className="sticky top-24">
                  <TableOfContents headings={headings} />
                </div>
              </aside>

              {/* Main Content Area */}
              <article className="lg:col-span-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Featured Image */}
                {currentPost.image && (
                  <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
                    <OptimizedImage
                      src={currentPost.image}
                      alt={currentPost.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="eager"
                      width="1200"
                      height="630"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1200px"
                      fallbackSrc="/img/blog-fallback.jpg"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                    {/* Category Badge on Image */}
                    <div className="absolute top-4 left-4">
                      <CategoryBadge category={currentPost.category} size="md" onImage={true} />
                    </div>
                  </div>
                )}

                {/* Content Container */}
                <div className="p-6 md:p-8 lg:p-10">
                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-6 leading-tight">
                    {currentPost.title}
                  </h1>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-4 pb-6 mb-8 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{currentPost.author}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={currentPost.date}>
                        {formatDate(currentPost.date)}
                      </time>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Clock className="w-4 h-4" />
                      <span>{Math.ceil((currentPost.content?.length || 1000) / 1000)} min de leitura</span>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div
                    className="prose prose-lg max-w-none
                      prose-headings:font-bold prose-headings:text-text-primary
                      prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
                      prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                      prose-p:text-text-secondary prose-p:leading-relaxed prose-p:mb-4
                      prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-text-primary prose-strong:font-semibold
                      prose-ul:my-4 prose-ul:ml-6
                      prose-ol:my-4 prose-ol:ml-6
                      prose-li:text-text-secondary prose-li:mb-2
                      prose-img:rounded-xl prose-img:shadow-md prose-img:my-6
                      prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-text-secondary
                      prose-code:text-primary-600 prose-code:bg-primary-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                      prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-xl prose-pre:overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: currentPost.content }}
                  />

                  {/* Tags */}
                  {currentPost.tags && currentPost.tags.length > 0 && (
                    <div className="mt-10 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-text-muted mb-3">Tags relacionadas:</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentPost.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1.5 bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-100 hover:border-primary-300 transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>

              {/* Right Sidebar - Interactive Widgets */}
              <aside className="lg:col-span-3 space-y-6">
                <div className="sticky top-24 space-y-6">
                  <AuthorWidget
                    author={currentPost.author}
                    date={currentPost.date}
                    category={currentPost.category}
                  />
                  <ShareWidget
                    title={currentPost.title}
                    url={typeof window !== 'undefined' ? window.location.href : ''}
                  />
                  <RelatedPostsWidget
                    posts={relatedPosts}
                    currentPostId={currentPost.id}
                  />
                </div>
              </aside>
            </div>

            {/* Related Podcasts - Full Width Below Content */}
            {currentPost.relatedPodcasts && currentPost.relatedPodcasts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-12 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 md:p-8 border border-primary-100 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-md">
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-text-primary">
                      Podcasts Relacionados
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Ouça nossos episódios sobre este tema
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {currentPost.relatedPodcasts.map((podcast, index) => (
                    <div
                      key={podcast.id || index}
                      className="bg-white rounded-xl p-4 md:p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                    >
                      <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <span className="text-primary-600">🎙️</span>
                        {podcast.title}
                      </h4>

                      {podcast.spotifyShowId ? (
                        <SpotifyEmbed
                          type="show"
                          id={podcast.spotifyShowId}
                          className="mb-0"
                        />
                      ) : podcast.spotifyEpisodeId ? (
                        <SpotifyEmbed
                          type="episode"
                          id={podcast.spotifyEpisodeId}
                          className="mb-0"
                        />
                      ) : (
                        <div className="text-center py-4">
                          <a
                            href={podcast.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold rounded-full transition-colors"
                          >
                            <Headphones className="w-5 h-5" />
                            Ouvir no Spotify
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-primary-200">
                  <p className="text-sm text-text-secondary text-center">
                    <a
                      href="/podcast"
                      className="text-primary-600 hover:text-primary-700 font-medium underline"
                    >
                      Ver todos os episódios do podcast
                    </a>
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </main>

        <EnhancedFooter />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white relative">
      <Helmet>
        <title>Blog | Saraiva Vision</title>
        <meta name="description" content="Artigos informativos sobre saúde ocular, prevenção e tratamentos oftalmológicos na Clínica Saraiva Vision." />
        <meta name="keywords" content="oftalmologia, saúde ocular, catarata, glaucoma, cirurgia refrativa, Caratinga" />
      </Helmet>

      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
      >
        Pular para o conteúdo principal
      </a>

      <Navbar />

      <main
        id="main-content"
        className="py-32 md:py-40 mx-[4%] md:mx-[6%] lg:mx-[8%] xl:mx-[10%] 2xl:mx-[12%] bg-gradient-to-b from-blue-50/30 via-white to-white"
        role="main"
        aria-label="Conteúdo principal do blog"
        tabIndex="-1"
      >
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6"
          >
            {/* Clean header aligned with homepage */}
            <div className="relative">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <Trans i18nKey="blog.title">
                  Blog <span className="text-gradient">Saraiva Vision</span>
                </Trans>
              </h1>
              <p className="text-base md:text-lg text-text-secondary font-normal max-w-2xl mx-auto leading-relaxed">
                Artigos informativos sobre saúde ocular, prevenção e tratamentos oftalmológicos
              </p>
            </div>
          </motion.header>

          <section aria-label="Posts do blog">
            {/* Search and Filter Section */}
            <div className="mb-10">
              {/* Clean Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar artigos por título, conteúdo ou tags..."
                    aria-label="Buscar artigos no blog"
                    aria-describedby="search-help"
                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-text-primary placeholder:text-text-muted shadow-sm hover:shadow-md"
                  />

                  {/* Search icon */}
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Clear button */}
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
                      aria-label="Limpar busca"
                    >
                      <X className="w-4 h-4 text-text-secondary hover:text-primary-600 transition-colors" />
                    </button>
                  )}

                  {/* Loading spinner */}
                  {searchTerm && searchTerm !== debouncedSearch && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                    </div>
                  )}
                </div>

                {/* Search results counter */}
                {debouncedSearch && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3"
                  >
                    <p className="text-sm font-medium text-center text-primary-600" id="search-help" aria-live="polite" aria-atomic="true">
                      ✨ {filteredPosts.length} {filteredPosts.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                    </p>
                  </motion.div>
                )}
                {!debouncedSearch && (
                  <p className="text-xs text-text-muted mt-3 text-center" id="search-help">
                    🔍 Digite para buscar artigos por título, conteúdo ou tags
                  </p>
                )}
              </form>

              {/* Clean Category Filter */}
              <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filtros de categoria">
                {categories.map(category => {
                  const config = categoryConfig[category];
                  const iconMap = {
                    'shield': Shield,
                    'stethoscope': Stethoscope,
                    'cpu': Cpu,
                    'help-circle': HelpCircle
                  };
                  const Icon = config ? iconMap[config.icon] : null;
                  const isActive = selectedCategory === category;

                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCategoryChange(category);
                        }
                      }}
                      aria-pressed={isActive}
                      aria-label={`Filtrar por categoria: ${category}`}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isActive
                          ? 'bg-cyan-500 text-white shadow-sm hover:bg-cyan-600'
                          : 'bg-white text-text-secondary border border-border-light hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                    >
                      {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
                      <span>{category}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Posts Grid */}
            {searchTerm && searchTerm !== debouncedSearch ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                <span className="ml-3 text-text-secondary">Buscando artigos...</span>
              </div>
            ) : filteredPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8 auto-rows-fr">
                  {currentPosts.map((post, index) => renderPostCard(post, index))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-12 flex justify-center items-center gap-2"
                    role="navigation"
                    aria-label="Navegação de páginas"
                  >
                    {/* Previous Button */}
                    <Button
                      onClick={() => {
                        setCurrentPage(prev => Math.max(prev - 1, 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      variant="outline"
                      className="px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50"
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                        // Show first page, last page, current page, and pages around current
                        const showPage = pageNum === 1 ||
                          pageNum === totalPages ||
                          Math.abs(pageNum - currentPage) <= 1;

                        // Show ellipsis
                        const showEllipsisBefore = pageNum === currentPage - 2 && currentPage > 3;
                        const showEllipsisAfter = pageNum === currentPage + 2 && currentPage < totalPages - 2;

                        if (showEllipsisBefore || showEllipsisAfter) {
                          return (
                            <span key={pageNum} className="px-3 py-2 text-text-muted">
                              ...
                            </span>
                          );
                        }

                        if (!showPage) return null;

                        return (
                          <Button
                            key={pageNum}
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            className={`px-4 py-2 min-w-[44px] ${currentPage === pageNum
                                ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                                : 'hover:bg-blue-50'
                              }`}
                            aria-label={`Página ${pageNum}`}
                            aria-current={currentPage === pageNum ? 'page' : undefined}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <Button
                      onClick={() => {
                        setCurrentPage(prev => Math.min(prev + 1, totalPages));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      className="px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50"
                      aria-label="Próxima página"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-12 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50"
              >
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Nenhum artigo encontrado
                </h3>
                <p className="text-text-secondary mb-6">
                  Tente ajustar sua busca ou filtros para encontrar mais artigos.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Todas');
                  }}
                  variant="outline"
                  className="mx-auto"
                >
                  Limpar filtros
                </Button>
              </motion.div>
            )}

            {/* Blog Info Section */}
            <div className="mt-12 bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/50">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  Sobre Nosso Blog
                </h2>
                <p className="text-text-secondary max-w-3xl mx-auto mb-6">
                  No blog Saraiva Vision, compartilhamos conhecimento especializado sobre saúde ocular,
                  prevenção de doenças e as tecnologias mais modernas em oftalmologia.
                  Nossa missão é educar e informar sobre a importância dos cuidados com a visão.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-2">Conteúdo Especializado</h3>
                    <p className="text-sm text-text-secondary">Artigos elaborados por oftalmologistas experientes</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-2">Prevenção e Saúde</h3>
                    <p className="text-sm text-text-secondary">Foco na prevenção e cuidados com a saúde ocular</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-2">Atualizações Regulares</h3>
                    <p className="text-sm text-text-secondary">Novo conteúdo adicionado mensalmente</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Form Section */}
            <div className="mt-8 mb-8">
              <NewsletterForm />
            </div>
          </section>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
};

export default BlogPage;
