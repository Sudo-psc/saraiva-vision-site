import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { Calendar, ArrowRight, ArrowLeft, Shield, Stethoscope, Cpu, HelpCircle, Clock, User, ChevronLeft, ChevronRight, Headphones, X, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import { Button } from '@/components/ui/button';
import { categoryConfig, categories } from '@/content/blogCategories';
import { getPostEnrichment } from '@/data/blogPostsEnrichment';
import CategoryBadge from '@/components/blog/CategoryBadge';
// OptimizedImage removed for text-only design
import SpotifyEmbed from '@/components/SpotifyEmbed';
import TableOfContents from '@/components/blog/TableOfContents';
import RelatedPostsWidget from '@/components/blog/RelatedPostsWidget';
import ShareWidget from '@/components/blog/ShareWidget';
import AuthorWidget from '@/components/blog/AuthorWidget';
import NewsletterForm from '@/components/blog/NewsletterForm';
import { trackBlogInteraction, trackPageView, trackSearchInteraction } from '@/utils/analytics';
import { generateCompleteSchemaBundle, getPostSpecificSchema } from '@/lib/blogSchemaMarkup';
import { getPostsMetadata, getPostBySlug } from '@/services/blogDataService';
import PortableTextRenderer from '@/components/PortableTextRenderer';

// Helper function to format dates - extracted for performance
const formatDate = (dateString) => {
  dayjs.locale('pt-br');
  return dayjs(dateString).format('DD MMMM, YYYY');
};

const extractHeadings = (content) => {
  if (!Array.isArray(content)) return [];
  return content
    .filter(block => block?._type === 'block' && ['h2', 'h3'].includes(block.style))
    .map(block => ({
      id: block._key,
      text: Array.isArray(block.children)
        ? block.children.map(child => child.text).join(' ')
        : '',
      level: Number(block.style?.replace('h', '')) || 2
    }));
};

const BlogPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = React.useState('Todas');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [posts, setPosts] = React.useState([]);
  const [postsLoading, setPostsLoading] = React.useState(true);
  const [postsError, setPostsError] = React.useState(null);
  const [currentPost, setCurrentPost] = React.useState(null);
  const [postLoading, setPostLoading] = React.useState(false);
  const [postError, setPostError] = React.useState(null);
  const POSTS_PER_PAGE = 6;

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  React.useEffect(() => {
    const loadPosts = async () => {
      try {
        setPostsLoading(true);
        setPostsError(null);

        // Use blogDataService for Sanity + static fallback
        const postsData = await getPostsMetadata();
        setPosts(Array.isArray(postsData) ? postsData : []);
        setPostsLoading(false);
      } catch (error) {
        console.error('[BlogPage] Error loading posts:', error);
        setPosts([]);
        setPostsError('error');
        setPostsLoading(false);
      }
    };

    loadPosts();
  }, []);

  React.useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        setCurrentPost(null);
        setPostError(null);
        setPostLoading(false);
        return;
      }

      try {
        setPostLoading(true);
        setPostError(null);

        // Use blogDataService to fetch from Sanity or fallback
        const post = await getPostBySlug(slug);

        setCurrentPost(post || null);
        if (!post) {
          setPostError('not_found');
        }
        setPostLoading(false);
      } catch (error) {
        console.error('[BlogPage] Error loading post:', error);
        setCurrentPost(null);
        setPostError('error');
        setPostLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  // Filter posts based on category and debounced search - memoized for performance
  const filteredPosts = React.useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = selectedCategory === 'Todas' || post.category === selectedCategory;
      const matchesSearch = !debouncedSearch ||
        post.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, debouncedSearch, posts]);

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

  React.useEffect(() => {
    if (slug) {
      if (!currentPost || postLoading) return;
      trackPageView(`/blog/${currentPost.slug}`);
      trackBlogInteraction('view_post', currentPost.slug, {
        post_title: currentPost.title,
        post_category: currentPost.category,
        post_author: currentPost.author
      });
      return;
    }

    if (!postsLoading) {
      trackPageView('/blog');
    }
  }, [slug, currentPost, postLoading, postsLoading]);

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

  // Memoized function to render horizontal stacked cards
  const renderPostCard = React.useCallback((post, index) => {
    const enrichment = getPostEnrichment(post.id);
    const readingTime = post.readingTimeMinutes || 4;

    // Category color mapping for accent elements
    const categoryColors = {
      'Prevenção': 'from-emerald-500 to-teal-500',
      'Tratamentos': 'from-blue-500 to-cyan-500',
      'Tecnologia': 'from-purple-500 to-indigo-500',
      'Dúvidas Frequentes': 'from-amber-500 to-orange-500',
      'default': 'from-gray-500 to-slate-500'
    };

    const categoryGradient = categoryColors[post.category] || categoryColors.default;

    return (
      <motion.article
        key={post.id}
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        className="group relative flex flex-col md:flex-row items-stretch bg-gradient-to-br from-white via-gray-50/50 to-white rounded-3xl border-2 border-gray-200/60 hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-100/50 transition-all duration-500 overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        role="article"
        aria-labelledby={`post-title-${post.id}`}
      >
        {/* Left vertical accent bar */}
        <div className={`w-2 md:w-3 bg-gradient-to-b ${categoryGradient} flex-shrink-0`}></div>

        {/* Main content area - Horizontal layout */}
        <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-between">
          <div>
            {/* Top row: Category badge and metadata */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              {/* Category badge */}
              <span className={`inline-flex items-center px-4 py-2 text-xs font-bold tracking-widest uppercase bg-gradient-to-r ${categoryGradient} text-white rounded-full shadow-lg`}>
                {post.category}
              </span>

              {/* Metadata row - Compact */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                  <time dateTime={post.date} className="font-light">
                    {formatDate(post.date)}
                  </time>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                  <span className="font-light">{readingTime} min</span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                  <span className="font-medium text-gray-700">{post.author || 'Dr. Saraiva'}</span>
                </div>
              </div>
            </div>

            {/* Title - Extra large, dominant */}
            <h3
              id={`post-title-${post.id}`}
              className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-5 text-gray-900 leading-tight tracking-tight group-hover:text-teal-700 transition-colors duration-300"
            >
              <Link
                to={`/blog/${post.slug}`}
                className="hover:underline decoration-2 decoration-teal-400 underline-offset-8 focus:outline-none focus:text-teal-700"
              >
                {post.title}
              </Link>
            </h3>

            {/* Excerpt - Two columns on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                {post.excerpt}
              </p>

              {/* Learning Points - Compact in second column */}
              {enrichment?.learningPoints && enrichment.learningPoints.length > 0 && (
                <div className="bg-gradient-to-br from-teal-50/80 to-cyan-50/50 rounded-2xl p-5 border border-teal-200/40">
                  <p className="text-sm font-bold text-teal-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">✓</span>
                    <span>Você vai aprender:</span>
                  </p>
                  <ul className="space-y-2">
                    {enrichment.learningPoints.slice(0, 3).map((point, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2 leading-snug">
                        <span className="text-teal-600 mt-0.5 flex-shrink-0 text-xs">▸</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Bottom CTA - Full width */}
          <Link
            to={`/blog/${post.slug}`}
            className="mt-auto focus:outline-none group/button block"
            aria-label={`Leia mais sobre: ${post.title}`}
          >
            <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 border-2 border-teal-200/60 hover:border-teal-400 rounded-2xl transition-all duration-300 group-hover/button:shadow-lg">
              <span className="text-lg font-semibold text-gray-800 group-hover/button:text-teal-700 transition-colors">
                {t('blog.read_more', 'Ler artigo completo')}
              </span>
              <ArrowRight className="w-6 h-6 text-teal-600 transition-all duration-300 group-hover/button:translate-x-2" aria-hidden="true" />
            </div>
          </Link>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-teal-400/0 via-cyan-400/0 to-blue-400/0 group-hover:from-teal-400/10 group-hover:via-cyan-400/10 group-hover:to-blue-400/10 transition-all duration-500 pointer-events-none"></div>
      </motion.article>
    );
  }, [t]);

  // Render single post view
  if (slug) {
    if (postLoading && !currentPost) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-600" />
        </div>
      );
    }

    if (postError === 'not_found') {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
          <Helmet>
            <title>Artigo não encontrado | Saraiva Vision</title>
          </Helmet>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 text-center">Artigo não encontrado</h1>
          <p className="text-text-secondary max-w-xl text-center mb-6">
            O conteúdo que você procura pode ter sido removido ou atualizado.
          </p>
          <Button onClick={() => navigate('/blog')} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            Voltar para o blog
          </Button>
        </div>
      );
    }

    if (postError === 'error') {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
          <Helmet>
            <title>Erro ao carregar artigo | Saraiva Vision</title>
          </Helmet>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 text-center">Erro ao carregar o artigo</h1>
          <p className="text-text-secondary max-w-xl text-center mb-6">
            Não foi possível carregar o conteúdo neste momento. Tente novamente mais tarde.
          </p>
          <Button onClick={() => navigate('/blog')} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            Voltar para o blog
          </Button>
        </div>
      );
    }

    if (!currentPost) {
      return null;
    }

    const enrichment = getPostEnrichment(currentPost.id);

    // Generate Schema.org structured data
    const schemaBundle = generateCompleteSchemaBundle(currentPost, enrichment?.faqs);
    const postSpecificSchema = getPostSpecificSchema(currentPost.id);

    const headings = currentPost.content ? extractHeadings(currentPost.content) : [];

    const relatedPosts = currentPost.relatedPosts && currentPost.relatedPosts.length > 0
      ? currentPost.relatedPosts
      : posts
        .filter(post => post.category === currentPost.category && post.id !== currentPost.id)
        .slice(0, 3);

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative">
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

              {/* Main Content Area - Text-only design */}
              <article className="lg:col-span-6 bg-gradient-to-br from-white to-gray-50/30 rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden">
                {/* Decorative header accent */}
                <div className="h-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400"></div>

                {/* Content Container */}
                <div className="p-8 md:p-12 lg:p-14">
                  {/* Category Badge */}
                  <div className="mb-6">
                    <span className="inline-block px-5 py-2 text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 rounded-full border-2 border-teal-200/60 shadow-sm">
                      {currentPost.category}
                    </span>
                  </div>

                  {/* Title - Extra large, serif typography */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-8 leading-tight tracking-tight">
                    {currentPost.title}
                  </h1>

                  {/* Metadata Row - Elegant spacing */}
                  <div className="flex flex-wrap items-center gap-5 pb-8 mb-10 border-b-2 border-gray-200/60">
                    <div className="flex items-center gap-2.5 text-base text-gray-600">
                      <User className="w-5 h-5 text-teal-600" />
                      <span className="font-semibold text-gray-800">{currentPost.author}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-2.5 text-base text-gray-600">
                      <Calendar className="w-5 h-5 text-teal-600" />
                      <time dateTime={currentPost.date} className="font-light">
                        {formatDate(currentPost.date)}
                      </time>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-2.5 text-base text-gray-600">
                      <Clock className="w-5 h-5 text-teal-600" />
                      <span className="font-light">{currentPost.readingTimeMinutes || 4} min de leitura</span>
                    </div>
                  </div>

                  {/* Article Content - Relaxing typography */}
                  <div
                    className="prose prose-xl max-w-none
                      prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900
                      prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b-2 prose-h2:border-gray-200/60
                      prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-5 prose-h3:text-gray-800
                      prose-p:text-gray-700 prose-p:leading-loose prose-p:mb-6 prose-p:text-lg
                      prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline hover:prose-a:text-teal-700 prose-a:transition-colors
                      prose-strong:text-gray-900 prose-strong:font-semibold
                      prose-ul:my-6 prose-ul:ml-8 prose-ul:space-y-3
                      prose-ol:my-6 prose-ol:ml-8 prose-ol:space-y-3
                      prose-li:text-gray-700 prose-li:leading-loose prose-li:text-lg
                      prose-li:marker:text-teal-600
                      prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-10
                      prose-blockquote:border-l-4 prose-blockquote:border-teal-400 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-teal-50/30 prose-blockquote:py-4 prose-blockquote:pr-4 prose-blockquote:rounded-r-xl
                      prose-code:text-teal-700 prose-code:bg-teal-50 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-base prose-code:font-mono
                      prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-2xl prose-pre:overflow-x-auto prose-pre:shadow-lg"
                  >
                    {/* Render HTML strings (static posts) or Portable Text (Sanity posts) */}
                    {typeof currentPost.content === 'string' ? (
                      <div dangerouslySetInnerHTML={{ __html: currentPost.content }} />
                    ) : (
                      <PortableTextRenderer content={currentPost.content} />
                    )}
                  </div>

                  {/* Tags - Elegant design */}
                  {currentPost.tags && currentPost.tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t-2 border-gray-200/60">
                      <h3 className="text-base font-semibold text-gray-700 mb-4 tracking-wide">Tags relacionadas</h3>
                      <div className="flex flex-wrap gap-3">
                        {currentPost.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-4 py-2 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 rounded-full text-sm font-medium border-2 border-teal-200/60 hover:border-teal-400 hover:shadow-md transition-all duration-200"
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
        className="py-32 md:py-40 mx-[4%] md:mx-[6%] lg:mx-[8%] xl:mx-[10%] 2xl:mx-[12%] bg-gradient-to-b from-gray-50 via-white to-gray-50"
        role="main"
        aria-label="Conteúdo principal do blog"
        tabIndex="-1"
      >
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            {/* Elegant minimalist header */}
            <div className="relative max-w-4xl mx-auto">
              {/* Decorative line accent */}
              <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 mx-auto mb-8 rounded-full"></div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 text-gray-900 leading-tight tracking-tight">
                <Trans i18nKey="blog.title">
                  Blog <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Saraiva Vision</span>
                </Trans>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 font-light max-w-3xl mx-auto leading-loose">
                Artigos informativos sobre saúde ocular, prevenção e tratamentos oftalmológicos
              </p>

              {/* Decorative bottom accent */}
              <div className="mt-8 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          </motion.header>

          <section aria-label="Posts do blog">
            {/* Search and Filter Section */}
            <div className="mb-14">
              {/* Elegant Search Bar */}
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-10">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar artigos por título, conteúdo ou tags..."
                    aria-label="Buscar artigos no blog"
                    aria-describedby="search-help"
                    className="w-full pl-14 pr-14 py-5 bg-gradient-to-br from-white to-gray-50/50 border-2 border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all text-gray-900 placeholder:text-gray-400 text-lg shadow-lg hover:shadow-xl hover:border-gray-300"
                  />

                  {/* Search icon */}
                  <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Clear button */}
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-5 top-1/2 transform -translate-y-1/2 p-2 hover:bg-red-50 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-red-300"
                      aria-label="Limpar busca"
                    >
                      <X className="w-5 h-5 text-gray-400 hover:text-red-600 transition-colors" />
                    </button>
                  )}

                  {/* Loading spinner */}
                  {searchTerm && searchTerm !== debouncedSearch && (
                    <div className="absolute right-14 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                    </div>
                  )}
                </div>

                {/* Search results counter */}
                {debouncedSearch && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <p className="text-base font-medium text-center text-teal-700 bg-teal-50 py-2 px-4 rounded-full inline-block mx-auto" id="search-help" aria-live="polite" aria-atomic="true">
                      ✨ {filteredPosts.length} {filteredPosts.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                    </p>
                  </motion.div>
                )}
                {!debouncedSearch && (
                  <p className="text-sm text-gray-500 mt-4 text-center font-light" id="search-help">
                    Digite para buscar artigos por título, conteúdo ou tags
                  </p>
                )}
              </form>

              {/* Elegant Category Filter */}
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
                      className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl text-base font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 ${isActive
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-cyan-600 scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-200/60 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50/50 shadow-md hover:shadow-lg'
                        }`}
                    >
                      {Icon && <Icon className="w-5 h-5" aria-hidden="true" />}
                      <span>{category}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Posts Grid */}
            {postsError && !postsLoading && (
              <div className="text-center py-8">
                <p className="text-red-600 font-semibold">Não foi possível carregar os artigos. Tente novamente em instantes.</p>
              </div>
            )}
            {searchTerm && searchTerm !== debouncedSearch ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                <span className="ml-3 text-text-secondary">Buscando artigos...</span>
              </div>
            ) : postsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-600" />
                <span className="ml-3 text-text-secondary">Carregando artigos...</span>
              </div>
            ) : filteredPosts.length > 0 ? (
              <>
                {/* Stacked horizontal cards layout */}
                <div className="flex flex-col space-y-8 max-w-6xl mx-auto">
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
