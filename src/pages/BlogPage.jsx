import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ArrowRight, ArrowLeft, Eye, Shield, Stethoscope, Cpu, HelpCircle, Clock, User, ChevronLeft, ChevronRight, Headphones } from 'lucide-react';
import Navbar from '../components/Navbar';
import EnhancedFooter from '../components/EnhancedFooter';
import { Button } from '../components/ui/button';
import { blogPosts, categories, getPostBySlug, categoryConfig } from '../data/blogPosts';
import { getPostEnrichment } from '../data/blogPostsEnrichment';
import CategoryBadge from '../components/blog/CategoryBadge';
import AuthorProfile from '../components/blog/AuthorProfile';
import ActionButtons from '../components/blog/ActionButtons';
import LearningSummary from '../components/blog/LearningSummary';
import InfoBox from '../components/blog/InfoBox';
import PostFAQ from '../components/blog/PostFAQ';
import RelatedPosts from '../components/blog/RelatedPosts';
import AccessibilityControls from '../components/blog/AccessibilityControls';
import PatientEducationSidebar from '../components/blog/PatientEducationSidebar';
import SpotifyEmbed from '../components/SpotifyEmbed';
import OptimizedImage from '../components/blog/OptimizedImage';
import { trackBlogInteraction, trackPageView, trackSearchInteraction } from '../utils/analytics';
import { generateCompleteSchemaBundle, getPostSpecificSchema } from '../lib/blogSchemaMarkup';

const BlogPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = React.useState('Todas');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const POSTS_PER_PAGE = 9;

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Check if viewing single post
  const currentPost = slug ? getPostBySlug(slug) : null;

  // Filter posts based on category and debounced search
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'Todas' || post.category === selectedCategory;
    const matchesSearch = !debouncedSearch ||
      post.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
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

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMMM, yyyy', { locale: ptBR });
  };

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

  // Render single post view
  if (currentPost) {
    const enrichment = getPostEnrichment(currentPost.id);

    // Generate Schema.org structured data
    const schemaBundle = generateCompleteSchemaBundle(currentPost, enrichment?.faqs);
    const postSpecificSchema = getPostSpecificSchema(currentPost.id);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 relative">
        <Helmet>
          <title>{currentPost.seo?.metaTitle || currentPost.title} | Saraiva Vision</title>
          <meta name="description" content={currentPost.seo?.metaDescription || currentPost.excerpt} />
          <meta name="keywords" content={currentPost.seo?.keywords?.join(', ') || currentPost.tags.join(', ')} />

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

        <main className="py-32 md:py-40 scroll-block-internal mx-[4%] md:mx-[6%] lg:mx-[8%] xl:mx-[10%] 2xl:mx-[12%]">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Content Area */}
              <article className="lg:col-span-8">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center space-x-2 text-sm text-gray-600">
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
                <li className="text-gray-900 font-medium truncate max-w-xs" title={currentPost.title}>
                  {currentPost.title}
                </li>
              </ol>
            </nav>

            {/* Back button */}
            <Button
              onClick={() => navigate('/blog')}
              variant="ghost"
              className="mb-8 hover:bg-primary-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o blog
            </Button>

            {/* Post header */}
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 bg-white/70 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-lg border border-white/50"
            >
              <div className="mb-4">
                <CategoryBadge category={currentPost.category} size="lg" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                {currentPost.title}
              </h1>
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                <time dateTime={currentPost.date}>
                  {formatDate(currentPost.date)}
                </time>
                <span className="mx-2">•</span>
                <span className="font-medium">{currentPost.author}</span>
              </div>
            </motion.header>

            {/* Featured image */}
            {currentPost.image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8 rounded-xl overflow-hidden shadow-lg bg-gray-100"
              >
                <OptimizedImage
                  src={currentPost.image}
                  alt={`${currentPost.title} - Saraiva Vision`}
                  className="w-full h-64 md:h-80 lg:h-96"
                  loading="eager"
                  aspectRatio="16/9"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 66vw, 800px"
                />
              </motion.div>
            )}

            {/* Learning Summary */}
            {enrichment?.learningPoints && (
              <LearningSummary items={enrichment.learningPoints} />
            )}

            {/* Post content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="prose prose-lg max-w-none bg-white/70 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-lg border border-white/50"
              dangerouslySetInnerHTML={{ __html: currentPost.content }}
            />

            {/* Info Boxes/Warnings */}
            {enrichment?.warnings && enrichment.warnings.map((warning, index) => (
              <InfoBox
                key={index}
                type={warning.type}
                title={warning.title}
              >
                <p>{warning.content}</p>
              </InfoBox>
            ))}

            {/* Tags */}
            {currentPost.tags && currentPost.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {currentPost.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Podcasts Section */}
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
                    <h3 className="text-2xl font-bold text-gray-900">
                      Podcasts Relacionados
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
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
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                  <p className="text-sm text-gray-600 text-center">
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

            {/* FAQ Section */}
            {enrichment?.faq && (
              <PostFAQ questions={enrichment.faq} />
            )}

            {/* Share and back */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between items-center">
              <Button
                onClick={() => navigate('/blog')}
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ver todos os posts
              </Button>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Author Profile */}
            <AuthorProfile
              showContact={false}
            />

            {/* Action Buttons */}
            <ActionButtons
              showAppointment={true}
              showContact={true}
              showPDF={false}
            />

            {/* Patient Education Sidebar */}
            <PatientEducationSidebar />
          </aside>
        </div>

            {/* Related Posts - Full Width */}
            <RelatedPosts
              posts={blogPosts}
              currentPostId={currentPost.id}
            />
          </div>
        </main>

        {/* Accessibility Controls */}
        <AccessibilityControls />

        <EnhancedFooter />
      </div>
    );
  }

  const renderPostCard = (post, index) => {
    const enrichment = getPostEnrichment(post.id);
    const readingTime = Math.ceil((post.content?.length || 1000) / 1000);

    return (
      <motion.article
        key={post.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative overflow-hidden flex flex-col focus:outline-none"
        role="article"
        aria-labelledby={`post-title-${post.id}`}
      >
        {/* 3D shadow layer */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 rounded-3xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

        {/* Glass card container */}
        <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col border-2 border-white/50 group-hover:border-white/80 group-hover:scale-[1.02] group-focus-within:ring-2 group-focus-within:ring-blue-400 group-focus-within:ring-offset-2">
          {/* Liquid glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <Link
            to={`/blog/${post.slug}`}
            className="relative block focus:outline-none z-10"
            aria-label={`Ler o post: ${post.title}`}
          >
            <div className="relative w-full h-48 sm:h-52 md:h-56 lg:h-60 overflow-hidden bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 flex-shrink-0 rounded-t-3xl">
              <OptimizedImage
                src={post.image}
                alt={`Imagem ilustrativa do artigo: ${post.title}`}
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                aspectRatio="16/9"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
                fallbackSrc="/img/blog-fallback.jpg"
              />
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 via-secondary-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          </Link>

          <div className="relative p-5 sm:p-6 md:p-7 flex flex-col flex-grow z-10">
          {/* Category Badge */}
          <div className="mb-3">
            <CategoryBadge category={post.category} size="sm" />
          </div>

          {/* Title */}
          <h3
            id={`post-title-${post.id}`}
            className="text-xl font-bold mb-3 text-gray-900 leading-tight"
          >
            <Link
              to={`/blog/${post.slug}`}
              className="hover:text-primary-600 focus:outline-none focus:text-primary-600 focus:underline transition-colors"
            >
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          <p className="text-gray-600 mb-4 text-sm flex-grow leading-relaxed">
            {post.excerpt}
          </p>

          {/* Metadata Row */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-4 border-t border-gray-100">
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
            <div className="bg-primary-50/50 rounded-lg p-3 mb-4 border border-primary-100">
              <p className="text-xs font-semibold text-primary-900 mb-2">O que você vai aprender:</p>
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

          {/* CTA Button with 3D effect */}
          <Link
            to={`/blog/${post.slug}`}
            className="mt-auto focus:outline-none"
            aria-label={`Leia mais sobre: ${post.title}`}
          >
            <div className="relative group/button">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl blur opacity-30 group-hover/button:opacity-50 transition-opacity"></div>
              <Button variant="default" className="relative w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 border border-white/20">
                <span className="relative z-10">{t('blog.read_more', 'Ler artigo completo')}</span>
                <ArrowRight className="relative z-10 w-4 h-4 ml-2 transition-transform group-hover/button:translate-x-1" aria-hidden="true" />
              </Button>
            </div>
          </Link>
        </div>
        </div>
      </motion.article>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 relative">
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
        className="py-32 md:py-40 scroll-block-internal mx-[4%] md:mx-[6%] lg:mx-[8%] xl:mx-[10%] 2xl:mx-[12%]"
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
            {/* Glass morphism header with 3D effect */}
            <div className="relative inline-block">
              {/* 3D shadow layers */}
              <div className="absolute -inset-2 bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 rounded-3xl blur-2xl opacity-15 animate-pulse"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl blur-xl opacity-20"></div>

              {/* Glass container */}
              <div className="relative bg-white/40 backdrop-blur-xl rounded-3xl px-8 md:px-12 py-6 md:py-8 border border-white/50 shadow-2xl shadow-primary-500/20">
                {/* Liquid glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-primary-600/10 rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-tl from-white/20 via-transparent to-white/20 rounded-3xl"></div>

                {/* Content */}
                <div className="relative z-10">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-gray-900 via-primary-900 to-gray-900 bg-clip-text text-transparent mb-3 drop-shadow-sm">
                    Blog Saraiva Vision
                  </h1>
                  <p className="text-base md:text-lg text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed">
                    Artigos informativos sobre saúde ocular, prevenção e tratamentos oftalmológicos
                  </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full blur-2xl opacity-30"></div>
                <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-gradient-to-tr from-secondary-400 to-primary-400 rounded-full blur-2xl opacity-30"></div>
              </div>
            </div>
          </motion.header>

          <section aria-label="Posts do blog">
            {/* Search and Filter Section */}
            <div className="mb-10">
              {/* Search Bar with 3D Glass Effect */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
                <div className="relative group">
                  {/* 3D glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 group-focus-within:opacity-30 transition-opacity duration-300"></div>

                  {/* Glass search container */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar artigos por título, conteúdo ou tags..."
                      aria-label="Buscar artigos no blog"
                      aria-describedby="search-help"
                      className="w-full pl-14 pr-14 py-4 bg-white/60 backdrop-blur-xl border-2 border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:border-primary-400 transition-all duration-300 shadow-lg shadow-primary-500/10 hover:shadow-xl hover:shadow-primary-500/20 focus:shadow-2xl focus:shadow-primary-500/30 text-gray-800 placeholder:text-gray-500"
                    />

                    {/* Search icon with 3D effect */}
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary-500 rounded-full blur-md opacity-40"></div>
                        <svg className="relative w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Clear button */}
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-secondary-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
                        aria-label="Limpar busca"
                      >
                        <X className="w-5 h-5 text-text-secondary hover:text-primary-600 transition-colors" />
                      </button>
                    )}

                    {/* Loading spinner */}
                    {searchTerm && searchTerm !== debouncedSearch && (
                      <div className="absolute right-14 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                      </div>
                    )}

                    {/* Liquid glass overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-primary-600/5 rounded-2xl pointer-events-none"></div>
                  </div>
                </div>

                {/* Search results counter */}
                {debouncedSearch && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3"
                  >
                    <p className="text-sm font-medium text-center bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent" id="search-help">
                      ✨ {filteredPosts.length} {filteredPosts.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                    </p>
                  </motion.div>
                )}
                {!debouncedSearch && (
                  <p className="text-xs text-gray-500 mt-3 text-center" id="search-help">
                    🔍 Digite para buscar artigos por título, conteúdo ou tags
                  </p>
                )}
              </form>

               {/* Category Filter with 3D Glass Pills */}
               <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Filtros de categoria">
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
                    <div key={category} className="relative group">
                      {/* 3D glow for active button */}
                      {isActive && (
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full blur-md opacity-40 animate-pulse"></div>
                      )}

                      <button
                        onClick={() => handleCategoryChange(category)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleCategoryChange(category);
                          }
                        }}
                        aria-pressed={isActive}
                        aria-label={`Filtrar por categoria: ${category}`}
                        className={`relative inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 ${
                          isActive
                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-xl shadow-primary-500/30 scale-105 border-2 border-white/50 backdrop-blur-sm'
                            : config
                            ? `${config.bgColor} ${config.textColor} hover:shadow-lg ${config.hoverBg} shadow-md border-2 border-white/30 backdrop-blur-sm hover:scale-[1.03] active:scale-95`
                            : 'bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80 hover:shadow-lg shadow-md border-2 border-white/50 hover:scale-[1.03] active:scale-95'
                        }`}
                      >
                        {/* Liquid glass overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 rounded-full pointer-events-none"></div>

                        {Icon && <Icon className="relative w-4 h-4 z-10" aria-hidden="true" />}
                        <span className="relative z-10">{category}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

             {/* Posts Grid */}
             {searchTerm && searchTerm !== debouncedSearch ? (
               <div className="flex justify-center items-center py-12">
                 <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                 <span className="ml-3 text-gray-600">Buscando artigos...</span>
               </div>
             ) : filteredPosts.length > 0 ? (
               <>
                 <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
                       className="px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50"
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
                             <span key={pageNum} className="px-3 py-2 text-gray-500">
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
                             className={`px-4 py-2 min-w-[44px] ${
                               currentPage === pageNum
                                 ? 'bg-primary-600 text-white hover:bg-primary-700'
                                 : 'hover:bg-primary-50'
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
                       className="px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-50"
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum artigo encontrado
                </h3>
                <p className="text-gray-600 mb-6">
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
            <div className="mt-16 bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/50">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Sobre Nosso Blog
                </h2>
                <p className="text-gray-600 max-w-3xl mx-auto mb-6">
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
                    <h3 className="font-semibold text-gray-900 mb-2">Conteúdo Especializado</h3>
                    <p className="text-sm text-gray-600">Artigos elaborados por oftalmologistas experientes</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Prevenção e Saúde</h3>
                    <p className="text-sm text-gray-600">Foco na prevenção e cuidados com a saúde ocular</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Atualizações Regulares</h3>
                    <p className="text-sm text-gray-600">Novo conteúdo adicionado mensalmente</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Accessibility Controls */}
      <AccessibilityControls />

      <EnhancedFooter />
    </div>
  );
};

export default BlogPage;