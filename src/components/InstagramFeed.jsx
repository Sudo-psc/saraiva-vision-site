import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Instagram, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import InstagramPostCard from './InstagramPostCard';
import { useInstagramFeed } from '../hooks/useInstagramFeed';

const InstagramFeed = ({ 
  className = '',
  limit = 4,
  showHeader = true,
  showRefreshButton = true,
  autoRefresh = true,
  pollingInterval = 5 * 60 * 1000, // 5 minutes
  onPostClick = null,
  gridCols = { default: 2, md: 4 },
  animate = true
}) => {
  const refreshButtonRef = useRef(null);

  const {
    posts,
    loading,
    error,
    refresh,
    lastFetch,
    cached,
    isStale
  } = useInstagramFeed({
    limit,
    autoRefresh,
    pollingInterval,
    onError: (err) => {
      console.error('Instagram feed error:', err);
    },
    onSuccess: (data) => {
      console.log('Instagram feed loaded:', data.length, 'posts');
    }
  });

  // Handle manual refresh
  const handleRefresh = async () => {
    if (refreshButtonRef.current) {
      refreshButtonRef.current.classList.add('animate-spin');
    }
    
    try {
      await refresh();
    } finally {
      if (refreshButtonRef.current) {
        setTimeout(() => {
          refreshButtonRef.current?.classList.remove('animate-spin');
        }, 500);
      }
    }
  };

  // Grid column classes
  const getGridClass = () => {
    const { default: defaultCols, md: mdCols } = gridCols;
    return `grid-cols-${defaultCols} md:grid-cols-${mdCols}`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const ContainerWrapper = animate ? motion.section : 'section';
  const HeaderWrapper = animate ? motion.div : 'div';
  const GridWrapper = animate ? motion.div : 'div';

  return (
    <ContainerWrapper
      className={`instagram-feed py-12 px-4 ${className}`}
      variants={animate ? containerVariants : undefined}
      initial={animate ? "hidden" : undefined}
      animate={animate ? "visible" : undefined}
      aria-labelledby="instagram-feed-title"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {showHeader && (
          <HeaderWrapper
            className="text-center mb-8"
            variants={animate ? headerVariants : undefined}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <h2 
                id="instagram-feed-title"
                className="text-3xl font-bold text-gray-900"
              >
                Acompanhe no Instagram
              </h2>
            </div>
            
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
              Fique por dentro das novidades, dicas de saúde ocular e conteúdos exclusivos 
              da Clínica Saraiva Vision
            </p>

            {/* Status indicators */}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              {cached && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                  <span>Cache ativo</span>
                </div>
              )}
              
              {isStale && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Atualizando em breve</span>
                </div>
              )}
              
              {lastFetch && (
                <div className="flex items-center gap-1">
                  <span>Última atualização: {lastFetch.toLocaleTimeString('pt-BR')}</span>
                </div>
              )}

              {/* Refresh button */}
              {showRefreshButton && !loading && (
                <button
                  ref={refreshButtonRef}
                  onClick={handleRefresh}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Atualizar posts do Instagram"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Atualizar</span>
                </button>
              )}
            </div>
          </HeaderWrapper>
        )}

        {/* Loading state */}
        {loading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-gray-600">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="text-lg">Carregando posts do Instagram...</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex flex-col items-center gap-4 text-gray-600">
              <AlertCircle className="w-12 h-12 text-amber-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Não foi possível carregar os posts
                </h3>
                <p className="text-gray-600 mb-4">
                  Verifique sua conexão ou tente novamente mais tarde
                </p>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts grid */}
        {posts.length > 0 && (
          <GridWrapper
            className={`grid gap-6 ${getGridClass()}`}
            variants={animate ? gridVariants : undefined}
          >
            {posts.map((post, index) => (
              <InstagramPostCard
                key={post.id}
                post={post}
                onClick={onPostClick}
                animate={animate}
                className="h-full"
              />
            ))}
          </GridWrapper>
        )}

        {/* Call to action */}
        {posts.length > 0 && (
          <div className="text-center mt-8">
            <a
              href="https://www.instagram.com/saraivavision"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Seguir @saraivavision no Instagram"
            >
              <Instagram className="w-5 h-5" />
              <span>Seguir @saraivavision</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Accessibility info */}
        <div className="sr-only">
          {posts.length > 0 && (
            <p>
              {posts.length} posts do Instagram carregados. 
              Última atualização: {lastFetch?.toLocaleString('pt-BR') || 'desconhecida'}.
              {cached ? ' Dados em cache.' : ''}
              {error ? ` Erro: ${error}` : ''}
            </p>
          )}
        </div>
      </div>
    </ContainerWrapper>
  );
};

export default InstagramFeed;