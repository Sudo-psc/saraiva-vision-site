/**
 * Consolidated Podcast Page
 * SEO-optimized with transcripts, local keywords, and internal service links
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from '@/utils/router';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Play,
  Search,
  Filter,
  Calendar,
  Clock,
  Tag,
  ArrowLeft,
  Mic2,
  Home,
  ChevronRight
} from 'lucide-react';

// Components
import Navbar from '../components/Navbar';
import EnhancedFooter from '../components/EnhancedFooter';
import SpotifyEmbed from '../components/SpotifyEmbed';
import PodcastTranscript from '../components/podcast/PodcastTranscript';
import { Button } from '../components/ui/button';

// Data and utils
import {
  podcastEpisodes,
  getEpisodeBySlug,
  getPodcastCategories,
  searchEpisodes as searchEpisodesData
} from '../data/podcastEpisodes';
import {
  generatePodcastSchemaBundle,
  generatePodcastLocalBusinessSchema
} from '../lib/podcastSchemaMarkup';

function PodcastPageConsolidated() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Get current episode if slug provided
  const currentEpisode = slug ? getEpisodeBySlug(slug) : null;

  // Categories
  const categories = useMemo(() => ['Todas', ...getPodcastCategories()], []);

  // Filtered episodes
  const filteredEpisodes = useMemo(() => {
    let episodes = podcastEpisodes;

    // Filter by search
    if (searchTerm) {
      episodes = searchEpisodesData(searchTerm);
    }

    // Filter by category
    if (selectedCategory !== 'Todas') {
      episodes = episodes.filter(ep => ep.category === selectedCategory);
    }

    return episodes;
  }, [searchTerm, selectedCategory]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Schema.org
  const schemaBundle = generatePodcastSchemaBundle(currentEpisode);
  const localBusinessSchema = generatePodcastLocalBusinessSchema();

  // Render single episode view
  if (currentEpisode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-blue-50/30 to-bg-primary">
        <Helmet>
          <title>{currentEpisode.title} | Podcast Saraiva Vision</title>
          <meta name="description" content={currentEpisode.description} />
          <meta name="keywords" content={currentEpisode.transcript?.keywords?.join(', ')} />

          {/* Schema.org */}
          {schemaBundle.map((schema, index) => (
            <script key={`schema-${index}`} type="application/ld+json">
              {JSON.stringify(schema)}
            </script>
          ))}
        </Helmet>

        <Navbar />

        {/* Skip to content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg"
        >
          Pular para o conteúdo
        </a>

        <main id="main-content" tabIndex="-1" className="py-32 md:py-40 mx-[4%] md:mx-[6%] lg:mx-[8%] xl:mx-[10%] 2xl:mx-[12%]">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center space-x-2 text-sm text-gray-600">
                <li>
                  <Link to="/" className="hover:text-primary-600 transition-colors flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    Home
                  </Link>
                </li>
                <li><ChevronRight className="w-4 h-4 text-gray-400" /></li>
                <li>
                  <Link to="/podcast" className="hover:text-primary-600 transition-colors">
                    Podcast
                  </Link>
                </li>
                <li><ChevronRight className="w-4 h-4 text-gray-400" /></li>
                <li className="text-gray-900 font-semibold truncate max-w-xs" title={currentEpisode.title}>
                  {currentEpisode.title}
                </li>
              </ol>
            </nav>

            {/* Back Button */}
            <Button
              onClick={() => navigate('/podcast')}
              variant="ghost"
              className="mb-8 hover:bg-blue-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o podcast
            </Button>

            {/* Episode Header */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-8 md:p-12 mb-12 shadow-2xl">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                {/* Cover */}
                {currentEpisode.cover && (
                  <div className="md:col-span-1">
                    <img
                      src={currentEpisode.cover}
                      alt={currentEpisode.title}
                      className="w-full aspect-square object-cover rounded-2xl shadow-2xl"
                    />
                  </div>
                )}

                {/* Info */}
                <div className={`${currentEpisode.cover ? 'md:col-span-2' : 'md:col-span-3'} text-white`}>
                  {/* Category */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                    <Tag className="w-4 h-4" />
                    {currentEpisode.category}
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                    {currentEpisode.title}
                  </h1>

                  {/* Description */}
                  <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
                    {currentEpisode.description}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(currentEpisode.date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {currentEpisode.duration}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-6">
                    {currentEpisode.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Spotify Embed */}
            {currentEpisode.spotifyShowId && (
              <div className="mb-12">
                <SpotifyEmbed
                  type="show"
                  id={currentEpisode.spotifyShowId}
                  className="w-full"
                />
              </div>
            )}

            {/* Transcript */}
            <div className="mb-12">
              <PodcastTranscript episode={currentEpisode} />
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Agende sua Consulta
              </h2>
              <p className="text-lg mb-6 text-white/90 max-w-2xl mx-auto">
                Ficou com dúvidas sobre {currentEpisode.category.toLowerCase()}? Agende uma consulta na Clínica Saraiva Vision em Caratinga, MG.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/agendar"
                  className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-xl font-semibold transition-colors inline-flex items-center justify-center gap-2 shadow-lg"
                >
                  <Calendar className="w-5 h-5" />
                  Agendar Consulta
                </Link>
                <a
                  href="https://wa.me/5533998601427"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold transition-colors inline-flex items-center justify-center gap-2 border-2 border-white/50"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </main>

        <EnhancedFooter />
      </div>
    );
  }

  // Render podcast list view
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-blue-50/30 to-bg-primary">
      <Helmet>
        <title>Podcast Saúde Ocular em Foco | Saraiva Vision Caratinga</title>
        <meta
          name="description"
          content="Podcast sobre oftalmologia e saúde ocular. Dr. Philipe Saraiva compartilha conhecimento sobre catarata, pterígio, olho seco e mais. Caratinga, MG."
        />
        <meta
          name="keywords"
          content="podcast oftalmologia, saúde ocular, catarata, pterígio, olho seco, Caratinga MG, Dr. Philipe Saraiva"
        />

        {/* Schema.org */}
        {schemaBundle.map((schema, index) => (
          <script key={`schema-${index}`} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      </Helmet>

      <Navbar />

      <main className="py-32 md:py-40 mx-[4%] md:mx-[6%] lg:mx-[8%] xl:mx-[10%] 2xl:mx-[12%]">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full text-white mb-6 shadow-lg">
              <Mic2 className="w-6 h-6" />
              <span className="font-semibold">Podcast</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 bg-clip-text text-transparent mb-6">
              Saúde Ocular em Foco
            </h1>

            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
              Podcast sobre oftalmologia com <strong>Dr. Philipe Saraiva</strong>.
              Informações sobre catarata, pterígio, olho seco e cuidados com a visão em <strong>Caratinga, MG</strong>.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="mb-12 space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar episódios por título, descrição ou palavra-chave..."
                  className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-sm border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg scale-105'
                      : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* All Episodes */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Todos os Podcasts
              {filteredEpisodes.length > 0 && (
                <span className="text-lg font-normal text-gray-600 ml-3">
                  ({filteredEpisodes.length} {filteredEpisodes.length === 1 ? 'episódio' : 'episódios'})
                </span>
              )}
            </h2>

            {filteredEpisodes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEpisodes.map(episode => (
                  <Link
                    key={episode.id}
                    to={`/podcast/${episode.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    {episode.cover && (
                      <div className="aspect-video overflow-hidden bg-gray-200">
                        <img
                          src={episode.cover}
                          alt={episode.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-5">
                      <div className="text-xs text-blue-600 font-semibold mb-2">
                        {episode.category}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {episode.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {episode.duration}
                        </span>
                        <span>{formatDate(episode.date)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/70 backdrop-blur-sm rounded-3xl">
                <p className="text-gray-600 text-lg">
                  Nenhum episódio encontrado com os filtros selecionados.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}

export default PodcastPageConsolidated;
