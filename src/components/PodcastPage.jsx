/**
 * Podcast Page Component
 * Main podcast page with episodes list and featured content
 */

import React, { useState, useEffect } from 'react';
import { Headphones, Rss, ExternalLink, Play } from 'lucide-react';
import PodcastEpisodesList from './PodcastEpisodesList';
import SEOHead from './SEOHead';

const PodcastPage = () => {
    const [featuredEpisode, setFeaturedEpisode] = useState(null);
    const [podcastStats, setPodcastStats] = useState(null);

    // Fetch featured episode and stats
    useEffect(() => {
        const fetchPodcastData = async () => {
            try {
                // Fetch latest episode as featured
                const response = await fetch('/api/podcast/episodes?limit=1&sortBy=published_at&sortOrder=desc');
                const data = await response.json();

                if (data.success && data.data.episodes.length > 0) {
                    setFeaturedEpisode(data.data.episodes[0]);
                    setPodcastStats({
                        totalEpisodes: data.data.pagination.totalCount
                    });
                }
            } catch (error) {
                console.error('Error fetching podcast data:', error);
            }
        };

        fetchPodcastData();
    }, []);

    const podcastInfo = {
        title: 'Saúde Ocular com Dr. Philipe',
        description: 'Podcast sobre saúde ocular, prevenção e tratamentos oftalmológicos com Dr. Philipe Saraiva. Episódios semanais com dicas práticas e informações importantes para cuidar da sua visão.',
        spotifyUrl: 'https://open.spotify.com/show/your-podcast-id',
        rssUrl: process.env.SPOTIFY_RSS_URL
    };

    return (
        <>
            <SEOHead
                title="Podcast Saúde Ocular - Dr. Philipe Saraiva"
                description={podcastInfo.description}
                keywords="podcast, saúde ocular, oftalmologia, Dr. Philipe Saraiva, visão, olhos"
                canonicalUrl="/podcast"
            />

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
                    <div className="container mx-auto px-4 py-16">
                        <div className="max-w-4xl mx-auto text-center">
                            {/* Podcast Icon */}
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
                                <Headphones className="w-10 h-10" />
                            </div>

                            {/* Title and Description */}
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                {podcastInfo.title}
                            </h1>

                            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                                {podcastInfo.description}
                            </p>

                            {/* Stats and Actions */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                                {podcastStats && (
                                    <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                                        <span className="text-sm font-medium">
                                            {podcastStats.totalEpisodes} episódios disponíveis
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    {podcastInfo.spotifyUrl && (
                                        <a
                                            href={podcastInfo.spotifyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 
                               text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                            Ouvir no Spotify
                                        </a>
                                    )}

                                    {podcastInfo.rssUrl && (
                                        <a
                                            href={podcastInfo.rssUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 
                               text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                        >
                                            <Rss className="w-5 h-5" />
                                            RSS Feed
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Episode */}
                {featuredEpisode && (
                    <section className="py-12 bg-white">
                        <div className="container mx-auto px-4">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex items-center gap-3 mb-6">
                                    <Play className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Episódio Mais Recente
                                    </h2>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                    <div className="grid md:grid-cols-2 gap-6 items-center">
                                        {/* Episode Info */}
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                                {featuredEpisode.title}
                                            </h3>

                                            {featuredEpisode.description && (
                                                <p className="text-gray-700 mb-4 leading-relaxed">
                                                    {featuredEpisode.description.length > 200
                                                        ? `${featuredEpisode.description.substring(0, 200)}...`
                                                        : featuredEpisode.description
                                                    }
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                {featuredEpisode.publishedAt && (
                                                    <span>
                                                        {new Date(featuredEpisode.publishedAt).toLocaleDateString('pt-BR')}
                                                    </span>
                                                )}
                                                {featuredEpisode.formattedDuration && (
                                                    <span>{featuredEpisode.formattedDuration}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Spotify Player */}
                                        {featuredEpisode.embedUrl && (
                                            <div className="w-full">
                                                <iframe
                                                    src={featuredEpisode.embedUrl}
                                                    width="100%"
                                                    height="152"
                                                    frameBorder="0"
                                                    allowtransparency="true"
                                                    allow="encrypted-media"
                                                    className="rounded-lg shadow-md"
                                                    title={`Player do Spotify - ${featuredEpisode.title}`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Episodes List */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold text-gray-900">
                                    Todos os Episódios
                                </h2>

                                <div className="text-sm text-gray-600">
                                    Novos episódios toda semana
                                </div>
                            </div>

                            <PodcastEpisodesList
                                showSearch={true}
                                showPagination={true}
                                episodesPerPage={12}
                                compact={false}
                                autoRefresh={true}
                                refreshInterval={300000} // 5 minutes
                            />
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                Sobre o Podcast
                            </h2>

                            <div className="prose prose-lg mx-auto text-gray-700">
                                <p>
                                    O podcast "Saúde Ocular com Dr. Philipe" é dedicado a compartilhar
                                    conhecimento sobre cuidados com a visão, prevenção de doenças oculares
                                    e os mais modernos tratamentos oftalmológicos.
                                </p>

                                <p>
                                    Com episódios semanais, Dr. Philipe Saraiva aborda temas como catarata,
                                    glaucoma, degeneração macular, ceratocone e muito mais, sempre com
                                    linguagem acessível e dicas práticas para o dia a dia.
                                </p>

                                <p>
                                    Acompanhe também nas redes sociais e não perca nenhum episódio!
                                </p>
                            </div>

                            {/* Subscribe CTA */}
                            <div className="mt-8">
                                <div className="bg-gray-50 rounded-xl p-6 inline-block">
                                    <h3 className="font-semibold text-gray-900 mb-3">
                                        Não perca nenhum episódio
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Siga o podcast no Spotify e receba notificações de novos episódios
                                    </p>
                                    {podcastInfo.spotifyUrl && (
                                        <a
                                            href={podcastInfo.spotifyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 
                               text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                        >
                                            <Headphones className="w-5 h-5" />
                                            Seguir no Spotify
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default PodcastPage;