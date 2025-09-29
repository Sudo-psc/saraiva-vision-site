import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ArrowRight, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';
import EnhancedFooter from '../components/EnhancedFooter';
import { Button } from '../components/ui/button';
import { blogPosts, categories } from '../data/blogPosts';

const BlogPage = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = React.useState('Todas');
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filter posts based on category and search
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'Todas' || post.category === selectedCategory;
    const matchesSearch = !searchTerm ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
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

  const renderPostCard = (post, index) => {
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
          aria-label={`Ler o post: ${post.title}`}
        >
          <img
            src={post.image}
            alt={`Imagem ilustrativa do artigo: ${post.title}`}
            className="w-full h-48 sm:h-52 md:h-56 object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            decoding="async"
          />
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

          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mb-3">
            {post.category}
          </span>

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
    <div className="min-h-screen bg-gray-50 relative">
      <Helmet>
        <title>Blog | Saraiva Vision</title>
        <meta name="description" content="Artigos informativos sobre saúde ocular, prevenção e tratamentos oftalmológicos na Clínica Saraiva Vision." />
        <meta name="keywords" content="oftalmologia, saúde ocular, catarata, glaucoma, cirurgia refrativa, Caratinga" />
      </Helmet>

      <Navbar />

      <main
        className="py-32 md:py-40 scroll-block-internal mx-[4%] md:mx-[6%] lg:mx-[8%] xl:mx-[10%] 2xl:mx-[12%]"
        role="main"
        aria-label="Conteúdo principal do blog"
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
                    placeholder="Buscar artigos..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-transparent"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </form>

              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filtros de categoria">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    aria-pressed={selectedCategory === category}
                    aria-label={`Filtrar por categoria: ${category}`}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Grid */}
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {filteredPosts.map((post, index) => renderPostCard(post, index))}
              </div>
            ) : (
              <div className="text-center p-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum artigo encontrado
                </h3>
                <p className="text-gray-600">
                  Tente ajustar sua busca ou filtros para encontrar mais artigos.
                </p>
              </div>
            )}

            {/* Blog Info Section */}
            <div className="mt-16 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
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