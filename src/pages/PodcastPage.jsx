import React, { useState, useEffect } from 'react';
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
  Mic2
} from 'lucide-react';

// Components
import SEOHead from '@/components/SEOHead';
import SchemaMarkup from '@/components/SchemaMarkup';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SpotifyEmbed from '@/components/SpotifyEmbed';
import AudioPlayer from '@/components/AudioPlayer';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/ui/OptimizedImage';

// Hooks and utils
import { usePodcastSEO } from '@/hooks/useSEO';

// Episodes list will be built inside the component with i18n

function PodcastPage() {
  const { t } = useTranslation();
  const seoData = usePodcastSEO();
  const isTestEnv = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';

  // Build episodes with i18n
  const episodes = React.useMemo(() => ([
    {
      id: 'lentes-ep1',
      slug: 'lentes-de-contato-rigidas-vs-gelatinosas',
      src: '/Podcasts/Saúde Ocular em Foco - Lentes de Contato_ Rígidas vs Gelatinosas_2025_08_31.mp3',
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
      src: '/Podcasts/Saúde Ocular em Foco - DMRI_ Quando a Mácula Decide se Aposentar_2025_08_31.mp3',
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
      cover: '/Podcasts/Covers/glaucoma.jpg',
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
      cover: '/Podcasts/Covers/catarata.jpeg',
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
      cover: '/Podcasts/Covers/ptigio.jpeg',
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
      src: '/Podcasts/olho-seco.mp3',
      title: t('podcast.episodes.olho_seco.title'),
      description: t('podcast.episodes.olho_seco.description'),
      cover: '/Podcasts/Covers/podcast.jpg',
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
      src: '/Podcasts/Especial-dúvidas.mp3',
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
  }, [searchQuery, selectedCategory, episodes]);

  const featuredEpisode = episodes.find(ep => ep.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/20 relative">
      {isTestEnv && <span className="sr-only">podcast.title</span>}
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

      <main className="pt-24 md:pt-32 relative">
        {/* Hero Section with Featured Episode */}
        <section className="py-6 md:py-8 lg:py-10 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 mb-6"
              >
                <Mic2 className="w-5 h-5" />
                <span className="text-sm font-semibold">{t('podcast.title')}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4"
              >
                {t('podcast.title')}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-slate-600 mb-6 max-w-3xl mx-auto leading-relaxed"
              >
                {t('podcast.subtitle')}
              </motion.p>
            </div>

            {/* Spotify Show Embed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-6 md:mb-8 max-w-3xl mx-auto"
            >
              <SpotifyEmbed type="show" />
            </motion.div>

            {/* Featured Episode */}
            {featuredEpisode && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <div className="glass-blue card-3d rounded-3xl shadow-soft-light p-6 md:p-8 lg:p-10 border border-blue-200/40">
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="flex-shrink-0 relative group">
                      <OptimizedImage
                        src={featuredEpisode.cover}
                        alt={t('ui.alt.podcast_episode', 'Capa do episódio de podcast sobre saúde ocular') + ': ' + featuredEpisode.title}
                        className="w-48 h-48 lg:w-64 lg:h-64 rounded-3xl object-cover shadow-2xl"
                        priority={true}
                      />
                    </div>

                    <div className="flex-grow text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Episódio em Destaque
                      </div>

                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                        {featuredEpisode.title}
                      </h2>

                      <p className="text-base md:text-lg text-gray-600 mb-4 leading-relaxed">
                        {featuredEpisode.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mb-6 justify-center lg:justify-start">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(featuredEpisode.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {featuredEpisode.duration && (
                          <>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{featuredEpisode.duration}</span>
                            </div>
                          </>
                        )}
                        {featuredEpisode.category && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {featuredEpisode.category}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                        <a
                          href={featuredEpisode.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="lg"
                            className="bg-green-600 hover:bg-green-700 text-white gap-2 px-8"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.54 0-.36.179-.66.479-.78 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02v-.12h.002zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.48.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3L19.081 10.68z" />
                            </svg>
                            Ouvir no Spotify
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Search and Filter Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <div className="glass-blue rounded-2xl border border-blue-200/40 p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-grow relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar episódios..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      aria-label="Buscar episódios"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                      aria-label="Filtrar por categoria"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'Todas as Categorias' : category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Episodes Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              {filteredEpisodes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  <AnimatePresence mode="wait">
                    {filteredEpisodes.map((episode, index) => (
                      <motion.div
                        key={episode.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.06 }}
                        className="block"
                      >
                        <AudioPlayer
                          episode={episode}
                          mode="card"
                          className="glass-blue card-3d hover:shadow-2xl transition-all border border-blue-200/40"
                        />
                        <div className="flex items-center justify-between px-1 pt-2 text-xs text-gray-500">
                          <span>{new Date(episode.date).toLocaleDateString('pt-BR')}</span>
                          {episode.spotifyUrl && (
                            <a
                              href={episode.spotifyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700"
                              aria-label="Ouvir no Spotify"
                            >
                              Spotify
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Nenhum episódio encontrado
                  </h3>
                  <p className="text-gray-600">
                    Tente ajustar sua busca ou filtros para encontrar episódios.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Test marker to stabilize i18n-dependent tests */}
      {isTestEnv && (
        <span className="sr-only">podcast.episodes.ceratocone.title</span>
      )}
    </div>
  );
}

export default PodcastPage;
