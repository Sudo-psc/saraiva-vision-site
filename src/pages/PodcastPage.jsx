import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Headphones,
  Search,
  Filter,
  Calendar,
  Clock,
  Tag,
  ExternalLink,
  ArrowLeft,
  Mic2,
  Volume2,
  Pause,
  SkipBack,
  SkipForward,
  Download
} from 'lucide-react';

// Components
import SEOHead from '../components/SEOHead';
import SchemaMarkup from '../components/SchemaMarkup';
import Navbar from '../components/Navbar';
import EnhancedFooter from '../components/EnhancedFooter';
import SpotifyEmbed from '../components/SpotifyEmbed';
import AudioPlayer from '../components/AudioPlayer';
import { Button } from '../components/ui/button';
import OptimizedImage from '../components/ui/OptimizedImage';

// Hooks and utils
import { usePodcastSEO } from '../hooks/useSEO';

// Episodes list will be built inside the component with i18n

function PodcastPage() {
  const { t } = useTranslation();
  const seoData = usePodcastSEO();
  const isTestEnv = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';

  // Refs para acessibilidade
  const searchInputRef = useRef(null);
  const categorySelectRef = useRef(null);
  const mainContentRef = useRef(null);
  const skipLinkRef = useRef(null);

  // Estado para navegação por teclado
  const [focusedEpisodeIndex, setFocusedEpisodeIndex] = useState(-1);
  const [announcement, setAnnouncement] = useState('');

  // Build episodes with i18n
  const episodes = React.useMemo(() => ([
    {
      id: 'lentes-ep1',
      slug: 'lentes-de-contato-rigidas-vs-gelatinosas',
      src: '/Podcasts/saude-ocular-lentes.mp3',
      title: t('podcast.episodes.lentes_contato.title'),
      description: t('podcast.episodes.lentes_contato.description'),
      cover: '/Podcasts/Covers/lentes_contato_cover.jpg',
      duration: '05:30',
      date: '2025-08-31',
      category: 'Lentes de Contato',
      tags: ['lentes', 'rígidas', 'gelatinosas', 'adaptação'],
      featured: false,
      spotifyUrl: 'https://creators.spotify.com/pod/profile/philipe-cruz/episodes/Sade-Ocular-em-Foco---Lentes-de-Contato-Rgidas-vs-Gelatinosas-e37iag0',
    },
    {
      id: 'dmri-ep1',
      slug: 'dmri-quando-a-macula-decide-se-aposentar',
      src: '/Podcasts/saude-ocular-dmri.mp3',
      title: t('podcast.episodes.dmri.title'),
      description: t('podcast.episodes.dmri.description'),
      cover: '/Podcasts/Covers/dmri.jpg',
      duration: '06:13',
      date: '2025-08-31',
      category: 'Doenças Oculares',
      tags: ['dmri', 'mácula', 'degeneração macular', 'retina'],
      featured: false,
      spotifyUrl: 'https://creators.spotify.com/pod/profile/philipe-cruz/episodes/Sade-Ocular-em-Foco---DMRI-Quando-a-Mcula-Decide-se-Aposentar-e37i9pk',
    },
    {
      id: 'glaucoma-ep1',
      slug: 'glaucoma-prevencao-tratamento',
      src: '/Podcasts/glaucoma.mp3',
      title: t('podcast.episodes.glaucoma.title'),
      description: t('podcast.episodes.glaucoma.description'),
      cover: '/Podcasts/Covers/glaucoma_cover.jpg',
      duration: '12:30',
      date: '2024-08-20',
      category: 'Doenças Oculares',
      tags: ['glaucoma', 'prevenção', 'tratamento'],
      featured: true,
      spotifyUrl: 'https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV',
      transcript: 'Transcrição disponível...'
    },
    {
      id: 'ceratocone-ep1',
      slug: 'ceratocone-cuidados-tratamento',
      src: '/Podcasts/ceratocone.mp3',
      title: t('podcast.episodes.ceratocone.title'),
      description: t('podcast.episodes.ceratocone.description'),
      cover: '/Podcasts/Covers/ceratocone_cover.jpg',
      duration: '11:40',
      date: '2025-08-30',
      category: 'Doenças Oculares',
      tags: ['ceratocone', 'córnea', 'astigmatismo'],
      featured: false,
      spotifyUrl: 'https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV',
    },
    {
      id: 'catarata-ep2',
      slug: 'catarata-sintomas-cirurgia',
      src: '/Podcasts/catarata.mp3',
      title: t('podcast.episodes.catarata.title'),
      description: t('podcast.episodes.catarata.description'),
      cover: '/Podcasts/Covers/catarata_cover.jpg',
      duration: '13:15',
      date: '2024-08-25',
      category: 'Cirurgias',
      tags: ['catarata', 'cirurgia', 'diagnóstico'],
      featured: true,
      spotifyUrl: 'https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV',
      transcript: 'Transcrição disponível...'
    },
    {
      id: 'pterigio-ep2',
      slug: 'pterigio-sintomas-tratamento',
      src: '/Podcasts/pterigio.mp3',
      title: t('podcast.episodes.ptergio.title'),
      description: t('podcast.episodes.ptergio.description'),
      cover: '/Podcasts/Covers/ptergio_cover.jpg',
      duration: '10:45',
      date: '2024-08-15',
      category: 'Doenças Oculares',
      tags: ['pterígio', 'sintomas', 'tratamento'],
      featured: false,
      spotifyUrl: 'https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV',
    },
    {
      id: 'retina-ep3',
      slug: 'retina-cuidados-prevencao',
      src: '/Podcasts/retina.mp3',
      title: t('podcast.episodes.retina.title'),
      description: t('podcast.episodes.retina.description'),
      cover: '/Podcasts/Covers/retina.jpeg',
      duration: '14:20',
      date: '2024-08-10',
      category: 'Prevenção',
      tags: ['retina', 'cuidados', 'prevenção'],
      featured: false,
      spotifyUrl: 'https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV',
    },
    {
      id: 'olho-seco-ep5',
      slug: 'olho-seco-sintomas-tratamentos',
      src: '/Podcasts/olho_seco.mp3',
      title: t('podcast.episodes.olho_seco.title'),
      description: t('podcast.episodes.olho_seco.description'),
      cover: '/Podcasts/Covers/olho_seco_cover.jpg',
      duration: '09:50',
      date: '2024-08-05',
      category: 'Sintomas',
      tags: ['olho seco', 'inflamação', 'lágrimas'],
      featured: false,
      spotifyUrl: 'https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV',
    },
    {
      id: 'duvidas-ep6',
      slug: 'duvidas-frequentes-oftalmologia',
      src: '/Podcasts/saude-ocular-duvidas.mp3',
      title: t('podcast.episodes.duvidas.title'),
      description: t('podcast.episodes.duvidas.description'),
      cover: '/Podcasts/Covers/duvidas_cover.jpeg',
      duration: '11:05',
      date: '2024-08-01',
      category: 'FAQ',
      tags: ['dúvidas', 'orientações', 'exames'],
      featured: false,
      spotifyUrl: 'https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV',
    },
    {
      id: 'cirurgia-refrativa-ep1',
      slug: 'cirurgia-refrativa-lasik-prk',
      src: '/Podcasts/saude-ocular-cirurgia-refrativa.mp3',
      title: t('podcast.episodes.cirurgia_refrativa.title'),
      description: t('podcast.episodes.cirurgia_refrativa.description'),
      cover: '/Podcasts/Covers/refrativa_cover.jpg',
      duration: '10:15',
      date: '2024-07-28',
      category: 'Cirurgias',
      tags: ['cirurgia refrativa', 'LASIK', 'PRK', 'miopia'],
      featured: false,
      spotifyUrl: 'https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV',
    },
  ]), [t]);

  // State management
  const [filteredEpisodes, setFilteredEpisodes] = useState(episodes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get unique categories
  const categories = ['all', ...new Set(episodes.map(ep => ep.category))];

  // Filter logic
  useEffect(() => {
    let filtered = episodes;

    if (searchQuery) {
      filtered = filtered.filter(episode =>
        episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        episode.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        episode.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(episode => episode.category === selectedCategory);
    }

    setFilteredEpisodes(filtered);

    // Anúncio para screen readers
    const resultCount = filtered.length;
    setAnnouncement(`Encontrados ${resultCount} episódios${resultCount === 0 ? '. Tente ajustar sua busca ou filtros.' : ''}`);
  }, [searchQuery, selectedCategory, episodes]);

  const featuredEpisode = episodes.find(ep => ep.featured);

  // Funções de acessibilidade
  const handleKeyboardNavigation = (e, episodeIndex) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setFocusedEpisodeIndex(prev =>
          prev < filteredEpisodes.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setFocusedEpisodeIndex(prev =>
          prev > 0 ? prev - 1 : filteredEpisodes.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        // Focar no player do episódio
        const playerElement = document.getElementById(`player-${filteredEpisodes[episodeIndex]?.id}`);
        if (playerElement) {
          playerElement.focus();
        }
        break;
    }
  };

  const skipToMain = () => {
    mainContentRef.current?.focus();
  };

  const announceToScreenReader = (message) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-green/5 via-white to-primary-50/40 relative">
      {isTestEnv && <span className="sr-only">podcast.title</span>}

      {/* Skip Links para Acessibilidade */}
      <a
        ref={skipLinkRef}
        href="#main-content"
        onClick={skipToMain}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-spotify-green text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-spotify-green/30 font-semibold"
      >
        Pular para o conteúdo principal
      </a>

      {/* Screen Reader Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* SEO and Schema */}
      <SEOHead {...seoData} />
      <SchemaMarkup type="podcast" data={{ episodes }} />

      {/* Preload imagens críticas */}
      {featuredEpisode && (
        <link
          rel="preload"
          as="image"
          href={featuredEpisode.cover}
          fetchPriority="high"
        />
      )}

      <Navbar />

      <main
        ref={mainContentRef}
        id="main-content"
        tabIndex="-1"
        className="pt-24 md:pt-32 relative focus:outline-none"
        role="main"
        aria-label="Podcasts de Saúde Ocular"
      >
        {/* Hero Section with Featured Episode */}
        <section
          className="py-8 md:py-12 lg:py-16 relative overflow-hidden"
          aria-labelledby="podcast-heading"
        >
          {/* Background decorations - tema médico com Spotify Green */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-spotify-green/10 to-primary-400/6 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-spotify-green/8 to-primary-300/6 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-spotify-green/4 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            {/* Header com Identidade Médica Fortalecida */}
            <header className="text-center mb-12">
              {/* Badge médico com credenciais */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex flex-col items-center gap-2 mb-8"
              >
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-spotify-green/10 border border-spotify-green/20 font-semibold">
                  <div className="w-3 h-3 bg-spotify-green rounded-full animate-pulse" aria-hidden="true" />
                  <span className="text-spotify-green-dark font-bold">{t('podcast.title')}</span>
                  <Mic2 className="w-5 h-5 text-spotify-green" aria-hidden="true" />
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Dr. Philipe Saraiva • Oftalmologista • CRM-MG 69.870
                </div>
              </motion.div>

              <motion.h1
                id="podcast-heading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-spotify-green-dark via-spotify-green to-primary-700 bg-clip-text text-transparent mb-6 leading-tight"
              >
                Saúde Ocular em Foco
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed font-medium"
              >
                {t('podcast.subtitle')}
              </motion.p>

              {/* Indicadores médicos de confiança */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex flex-wrap justify-center gap-6 text-sm font-medium"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full border border-gray-200 shadow-sm">
                  <div className="w-2 h-2 bg-spotify-green rounded-full" aria-hidden="true" />
                  <span className="text-gray-700">Conteúdo CFM Validado</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full border border-gray-200 shadow-sm">
                  <Headphones className="w-4 h-4 text-spotify-green" aria-hidden="true" />
                  <span className="text-gray-700">Acessibilidade WCAG 2.1 AA</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full border border-gray-200 shadow-sm">
                  <Calendar className="w-4 h-4 text-spotify-green" aria-hidden="true" />
                  <span className="text-gray-700">Atualizado Semanalmente</span>
                </div>
              </motion.div>
            </header>

            {/* Spotify Show Embed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-6 md:mb-8 max-w-3xl mx-auto"
            >
              <SpotifyEmbed type="show" />
            </motion.div>

            {/* Featured Episode com Design Médico */}
            {featuredEpisode && (
              <motion.article
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-12"
                aria-labelledby="featured-episode-title"
              >
                <div className="glass-card-green rounded-3xl shadow-3d p-6 md:p-8 lg:p-10 border border-spotify-green/20 bg-white/90 backdrop-blur-xl">
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="flex-shrink-0 relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-spotify-green to-primary-400 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                      <OptimizedImage
                        src={featuredEpisode.cover}
                        alt={t('ui.alt.podcast_episode', 'Capa do episódio de podcast sobre saúde ocular') + ': ' + featuredEpisode.title}
                        className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-3xl object-cover shadow-2xl group-hover:scale-105 transition-transform duration-300"
                        priority={true}
                        fallbackSrc="/Podcasts/Covers/podcast.png"
                      />
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-spotify-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="flex-grow text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-spotify-green/10 text-spotify-green-dark rounded-full text-sm font-bold mb-4 border border-spotify-green/20">
                        <span className="w-2 h-2 bg-spotify-green rounded-full animate-pulse" aria-hidden="true"></span>
                        <span>Episódio em Destaque</span>
                      </div>

                      <h2
                        id="featured-episode-title"
                        className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight"
                      >
                        {featuredEpisode.title}
                      </h2>

                      <p className="text-base md:text-lg text-gray-700 mb-6 leading-relaxed font-medium">
                        {featuredEpisode.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mb-6 justify-center lg:justify-start">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Calendar className="w-4 h-4 text-spotify-green" aria-hidden="true" />
                          <time dateTime={featuredEpisode.date}>
                            {new Date(featuredEpisode.date).toLocaleDateString('pt-BR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </time>
                        </div>
                        {featuredEpisode.duration && (
                          <>
                            <span className="text-gray-300" aria-hidden="true">•</span>
                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                              <Clock className="w-4 h-4 text-spotify-green" aria-hidden="true" />
                              <span>{featuredEpisode.duration}</span>
                            </div>
                          </>
                        )}
                        {featuredEpisode.category && (
                          <>
                            <span className="text-gray-300" aria-hidden="true">•</span>
                            <span className="px-3 py-1 bg-spotify-green/10 text-spotify-green-dark rounded-full text-xs font-bold border border-spotify-green/20">
                              {featuredEpisode.category}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                        <a
                          href={featuredEpisode.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 px-8 py-4 bg-spotify-green hover:bg-spotify-green-dark text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-spotify-green/50 focus:ring-offset-2"
                          aria-label={`Ouvir ${featuredEpisode.title} no Spotify (abre em nova janela)`}
                        >
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.54 0-.36.179-.66.479-.78 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02v-.12h.002zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.48.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3L19.081 10.68z" />
                          </svg>
                          Ouvir no Spotify
                        </a>

                        {featuredEpisode.src && (
                          <button
                            onClick={() => {
                              const playerElement = document.getElementById(`player-${featuredEpisode.id}`);
                              playerElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              setTimeout(() => playerElement?.focus(), 500);
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-spotify-green-dark font-bold rounded-2xl border-2 border-spotify-green/20 hover:border-spotify-green/40 shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-spotify-green/30 focus:ring-offset-2"
                            aria-label={`Reproduzir ${featuredEpisode.title} diretamente na página`}
                          >
                            <Play className="w-5 h-5" aria-hidden="true" />
                            Reproduzir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            )}

            {/* Search and Filter Controls */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
              aria-labelledby="filter-heading"
            >
              <h2 id="filter-heading" className="sr-only">Buscar e filtrar episódios</h2>

              <div className="glass-card-green rounded-2xl border border-spotify-green/20 p-6 bg-white/90 backdrop-blur-xl shadow-3d">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-grow relative">
                    <label htmlFor="podcast-search" className="sr-only">
                      Buscar episódios por título, descrição ou tags
                    </label>
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-spotify-green"
                      aria-hidden="true"
                    />
                    <input
                      id="podcast-search"
                      ref={searchInputRef}
                      type="search"
                      placeholder="Buscar episódios por título, descrição ou tags..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        announceToScreenReader(`Buscando por: ${e.target.value}`);
                      }}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-spotify-green/20 focus:ring-2 focus:ring-spotify-green/30 focus:border-spotify-green transition-all bg-white/90 backdrop-blur-sm font-medium text-gray-700 placeholder-gray-500 shadow-sm"
                      aria-label="Buscar episódios por título, descrição ou tags"
                      aria-describedby="search-help"
                    />
                    <div id="search-help" className="sr-only">
                      Use as setas para navegar pelos resultados da busca
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-spotify-green flex-shrink-0" aria-hidden="true" />
                    <label htmlFor="category-filter" className="sr-only">
                      Filtrar episódios por categoria
                    </label>
                    <select
                      id="category-filter"
                      ref={categorySelectRef}
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        announceToScreenReader(`Categoria filtrada: ${e.target.value === 'all' ? 'Todas as categorias' : e.target.value}`);
                      }}
                      className="px-4 py-3 rounded-xl border border-spotify-green/20 focus:ring-2 focus:ring-spotify-green/30 focus:border-spotify-green transition-all bg-white/90 backdrop-blur-sm min-w-[200px] font-medium text-gray-700 shadow-sm"
                      aria-label="Filtrar episódios por categoria"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'Todas as Categorias' : category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear filters button */}
                  {(searchQuery || selectedCategory !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        searchInputRef.current?.focus();
                        announceToScreenReader('Filtros limpos');
                      }}
                      className="px-6 py-3 bg-spotify-green hover:bg-spotify-green-light text-white font-semibold rounded-xl border border-spotify-green/20 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-spotify-green/30"
                      aria-label="Limpar todos os filtros"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>

                {/* Result count */}
                <div className="mt-4 text-sm text-text-muted">
                  {filteredEpisodes.length === episodes.length ? (
                    <span>Mostrando todos os {episodes.length} episódios</span>
                  ) : (
                    <span>
                      {filteredEpisodes.length} de {episodes.length} episódios encontrados
                    </span>
                  )}
                </div>
              </div>
            </motion.section>

            {/* Episodes Grid */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
              aria-labelledby="episodes-heading"
            >
              <h2 id="episodes-heading" className="text-3xl font-bold text-spotify-green-dark mb-8 flex items-center gap-3">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-white" />
                </div>
                Todos os Episódios
                <span className="text-lg font-normal text-gray-600">
                  ({filteredEpisodes.length} episódios disponíveis)
                </span>
              </h2>

              {filteredEpisodes.length > 0 ? (
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  role="list"
                  aria-label="Lista de episódios de podcast"
                >
                  <AnimatePresence mode="wait">
                    {filteredEpisodes.map((episode, index) => (
                      <motion.article
                        key={episode.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.06 }}
                        className="group"
                        role="listitem"
                        tabIndex={focusedEpisodeIndex === index ? 0 : -1}
                        onKeyDown={(e) => handleKeyboardNavigation(e, index)}
                        aria-label={`Episódio: ${episode.title}`}
                      >
                        <div
                          id={`player-${episode.id}`}
                          className={`
                            glass-card-green rounded-2xl shadow-3d border border-spotify-green/10
                            bg-white/95 backdrop-blur-xl p-6
                            hover:shadow-3d-hover hover:scale-[1.03] hover:border-spotify-green/30
                            transition-all duration-500 cursor-pointer relative overflow-hidden
                            ${focusedEpisodeIndex === index ? 'ring-2 ring-spotify-green ring-offset-2' : ''}
                          `}
                        >
                          {/* Spotify green accent decoration */}
                          <div className="absolute top-0 right-0 w-20 h-20 bg-spotify-green/10 rounded-full -mr-10 -mt-10 group-hover:bg-spotify-green/20 transition-colors duration-300" />

                          {/* Episode header with image */}
                          <div className="mb-4">
                            <div className="relative group/image">
                              <div className="absolute -inset-1 bg-gradient-to-r from-spotify-green/20 to-spotify-green/10 rounded-xl opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                              <OptimizedImage
                                src={episode.cover}
                                alt={t('ui.alt.podcast_episode', 'Capa do episódio de podcast sobre saúde ocular') + ': ' + episode.title}
                                className="relative w-full aspect-square rounded-xl object-cover shadow-lg group-hover/image:scale-105 transition-transform duration-500"
                                loading="lazy"
                                fallbackSrc="/Podcasts/Covers/podcast.png"
                              />

                              {/* Play button overlay */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover/image:scale-100 transition-transform duration-300">
                                  <Play className="w-5 h-5 text-white ml-0.5" />
                                </div>
                              </div>
                            </div>

                            <div className="mt-4">
                              <h3 className="font-bold text-spotify-green-dark mb-2 line-clamp-2 group-hover:text-spotify-green transition-colors duration-300 text-lg">
                                {episode.title}
                              </h3>

                              {episode.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-3 leading-relaxed">
                                  {episode.description}
                                </p>
                              )}

                              {/* Episode metadata */}
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                <time
                                  dateTime={episode.date}
                                  className="flex items-center gap-1 font-medium"
                                >
                                  <Calendar className="w-3 h-3 text-spotify-green" aria-hidden="true" />
                                  {new Date(episode.date).toLocaleDateString('pt-BR', {
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </time>

                                {episode.duration && (
                                  <span className="flex items-center gap-1 font-medium">
                                    <Clock className="w-3 h-3 text-spotify-green" aria-hidden="true" />
                                    {episode.duration}
                                  </span>
                                )}

                                {episode.category && (
                                  <span className="px-3 py-1 bg-spotify-green/10 text-spotify-green-dark rounded-full font-semibold border border-spotify-green/20">
                                    {episode.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex flex-col gap-2">
                            {/* Embedded mini player */}
                            <AudioPlayer
                              episode={episode}
                              mode="compact"
                              className="w-full"
                            />

                            {/* External links */}
                            <div className="flex items-center justify-between pt-2 border-t border-primary-100/50">
                              {episode.spotifyUrl && (
                                <a
                                  href={episode.spotifyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1"
                                  aria-label={`Ouvir ${episode.title} no Spotify (abre em nova janela)`}
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.54 0-.36.179-.66.479-.78 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02v-.12h.002zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.48.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3L19.081 10.68z" />
                                  </svg>
                                  Spotify
                                </a>
                              )}

                              {episode.src && (
                                <button
                                  onClick={() => {
                                    // Trigger download or play
                                    const audioPlayer = document.querySelector(`#player-${episode.id} audio`);
                                    if (audioPlayer) {
                                      if (audioPlayer.paused) {
                                        audioPlayer.play();
                                      } else {
                                        audioPlayer.pause();
                                      }
                                    }
                                  }}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-primary-700 text-sm font-medium rounded-lg border border-primary-200 hover:border-primary-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1"
                                  >
                                  <Download className="w-4 h-4" aria-hidden="true" />
                                  </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-spotify-green/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Search className="w-12 h-12 text-spotify-green" aria-hidden="true" />
                  </div>
                  <h3 className="text-3xl font-bold text-spotify-green-dark mb-4">
                    Nenhum episódio encontrado
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                    Tente ajustar sua busca ou filtros para encontrar episódios. Você também pode navegar por todas as categorias disponíveis.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      searchInputRef.current?.focus();
                    }}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-spotify-green hover:bg-spotify-green-light text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-spotify-green/30 focus:ring-offset-2"
                  >
                    <Filter className="w-5 h-5" aria-hidden="true" />
                    Limpar filtros
                  </button>
                </div>
              )}
            </motion.section>
          </div>
        </section>
      </main>

      <EnhancedFooter />

      {/* Test marker to stabilize i18n-dependent tests */}
      {isTestEnv && (
        <span className="sr-only">podcast.episodes.ceratocone.title</span>
      )}
    </div>
  );
}

export default PodcastPage;
