import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ArrowRight, ArrowLeft, Eye, Shield, Stethoscope, Cpu, HelpCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import EnhancedFooter from '../components/EnhancedFooter';
import { Button } from '../components/ui/button';
import { blogPosts, categories, getPostBySlug, categoryConfig } from '../data/blogPosts';
import CategoryBadge from '../components/blog/CategoryBadge';

const BlogPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = React.useState('Todas');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

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

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMMM, yyyy', { locale: ptBR });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  // Render single post view
  if (currentPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 relative">
        <Helmet>
          <title>{currentPost.seo?.metaTitle || currentPost.title} | Saraiva Vision</title>
          <meta name="description" content={currentPost.seo?.metaDescription || currentPost.excerpt} />
          <meta name="keywords" content={currentPost.seo?.keywords?.join(', ') || currentPost.tags.join(', ')} />
        </Helmet>

        <Navbar />

        <main className="py-32 md:py-40 scroll-block-internal mx-[4%] md:mx-[6%] lg:mx-[8%] xl:mx-[10%] 2xl:mx-[12%]">
          <article className="container mx-auto px-4 md:px-6 max-w-4xl">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center space-x-2 text-sm text-gray-600">
                <li>
                  <Link to="/" className="hover:text-blue-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link to="/blog" className="hover:text-blue-600 transition-colors">
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
              className="mb-8 hover:bg-blue-50 transition-colors"
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
                <div className="w-full h-64 md:h-80 lg:h-96 overflow-hidden">
                  <img
                    src={currentPost.image}
                    alt={currentPost.title}
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                </div>
              </motion.div>
            )}

            {/* Post content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="prose prose-lg max-w-none bg-white/70 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-lg border border-white/50"
              dangerouslySetInnerHTML={{ __html: currentPost.content }}
            />

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
        </main>

        <EnhancedFooter />
      </div>
    );
  }

  const renderPostCard = (post, index) => {
    return (
      <motion.article
        key={post.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 border border-white/50"
        role="article"
        aria-labelledby={`post-title-${post.id}`}
      >
        <Link
          to={`/blog/${post.slug}`}
          className="block overflow-hidden focus:outline-none"
          aria-label={`Ler o post: ${post.title}`}
        >
          <div className="relative w-full h-48 sm:h-52 md:h-56 overflow-hidden bg-gradient-to-br from-blue-100 to-gray-100">
            <img
              src={post.image}
              alt={`Imagem ilustrativa do artigo: ${post.title}`}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/img/blog-fallback.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </Link>
        <div className="p-4 sm:p-6 flex flex-col flex-grow">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
              <time
                dateTime={post.date}
                aria-label={`Publicado em ${formatDate(post.date)}`}
              >
                {formatDate(post.date)}
              </time>
            </div>
          </div>

          <div className="mb-3">
            <CategoryBadge category={post.category} size="sm" />
          </div>

          <h3
            id={`post-title-${post.id}`}
            className="text-xl font-bold mb-3 text-gray-900 flex-grow"
          >
            <Link
              to={`/blog/${post.slug}`}
              className="hover:text-blue-600 focus:outline-none focus:text-blue-600 focus:underline"
            >
              {post.title}
            </Link>
          </h3>

          <p className="text-gray-600 mb-4 text-sm flex-grow">
            {post.excerpt}
          </p>

          <Link
            to={`/blog/${post.slug}`}
            className="mt-auto focus:outline-none"
            aria-label={`Leia mais sobre: ${post.title}`}
          >
            <Button variant="link" className="p-0 text-blue-600 font-semibold group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
              {t('blog.read_more', 'Leia mais')}
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
          </Link>
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
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
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
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Blog Saraiva Vision
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Artigos informativos sobre saúde ocular, prevenção e tratamentos oftalmológicos
              com a qualidade e expertise da Clínica Saraiva Vision.
            </p>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded"></div>
          </motion.header>

          <section aria-label="Posts do blog">
            {/* Search and Filter Section */}
            <div className="mb-12">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar artigos por título, conteúdo ou tags..."
                    aria-label="Buscar artigos no blog"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchTerm && searchTerm !== debouncedSearch && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {debouncedSearch && (
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    {filteredPosts.length} {filteredPosts.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                  </p>
                )}
              </form>

              {/* Category Filter */}
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

                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      aria-pressed={selectedCategory === category}
                      aria-label={`Filtrar por categoria: ${category}`}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm ${
                        selectedCategory === category
                          ? config
                            ? `${config.bgColor} ${config.textColor} ring-2 ${config.borderColor} shadow-md`
                            : 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-md'
                          : config
                          ? `${config.bgColor} ${config.textColor} hover:shadow-md ${config.hoverBg}`
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
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
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {filteredPosts.map((post, index) => renderPostCard(post, index))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-12 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50"
              >
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <EnhancedFooter />
    </div>
  );
};

export default BlogPage;