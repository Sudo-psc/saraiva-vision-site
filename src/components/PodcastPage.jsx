/**
 * Podcast Page Component
 * Main podcast page with episodes list and featured content
 */

import React, { useState, useEffect } from 'react';
import GlassContainer from './ui/GlassContainer';
import { Play } from 'lucide-react';
import PodcastEpisodesList from './PodcastEpisodesList';
import SEOHead from './SEOHead';

// SpotifyEmbed: iframe seguro com fallback
function SpotifyEmbed({ embedUrl, episodeTitle, spotifyUrl }) {
    const [failed, setFailed] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setFailed(true), 5000);
        return () => clearTimeout(timer);
    }, []);
    if (failed) {
        return (
            <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg">
                <span className="text-gray-800 mb-2">Não foi possível carregar o player do Spotify.</span>
                {spotifyUrl && (
                    <a
                        href={spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
                        aria-label={`Ouvir episódio no Spotify: ${episodeTitle}`}
                    >
                        Ouvir no Spotify
                    </a>
                )}
            </div>
        );
    }
    return (
        <iframe
            src={embedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="encrypted-media; clipboard-write; picture-in-picture"
            allowTransparency="true"
            sandbox="allow-scripts allow-same-origin allow-popups"
            referrerPolicy="no-referrer"
            loading="lazy"
            aria-label={`Player do Spotify - ${episodeTitle}`}
            title={`Player do Spotify - ${episodeTitle}`}
            className="rounded-lg shadow-md"
            onError={() => setFailed(true)}
            onLoad={() => setFailed(false)}
        />
    );
}

const PodcastPage = () => {
    const [featuredEpisode, setFeaturedEpisode] = useState(null);
    // const [podcastStats, setPodcastStats] = useState(null); // Removido pois não está em uso

    // Fetch featured episode and stats

    useEffect(() => {
        const fetchPodcastData = async () => {
            try {
                // Fetch latest episode as featured
                const response = await fetch('/api/podcast/episodes?limit=1&sortBy=published_at&sortOrder=desc');
                const data = await response.json();

                if (data.success && data.data.episodes.length > 0) {
                    setFeaturedEpisode(data.data.episodes[0]);
                }
            } catch (error) {
                console.error('Error fetching podcast data:', error);
            }
        };
        fetchPodcastData();
    }, []);


    return (
        <>
            <SEOHead title="Podcast Saúde Ocular com Dr. Philipe" />
            {/* Featured Episode */}
            {featuredEpisode && (
                <section className="py-12 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <Play className="w-6 h-6 text-cyan-600" />
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Episódio Mais Recente
                                </h2>
                            </div>
                            <GlassContainer intensity="medium" className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-6 border border-cyan-100">
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
                                            <SpotifyEmbed
                                                embedUrl={featuredEpisode.embedUrl}
                                                episodeTitle={featuredEpisode.title}
                                                spotifyUrl={featuredEpisode.spotifyUrl}
                                            />
                                        </div>
                                    )}
                                </div>
                            </GlassContainer>
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
                    <GlassContainer intensity="subtle" className="max-w-4xl mx-auto text-center p-8 rounded-2xl">
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
                            <GlassContainer intensity="medium" className="bg-gray-50 rounded-xl p-6 inline-block">
                                <h3 className="font-semibold text-gray-900 mb-3">
                                    Não perca nenhum episódio
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Siga o podcast no Spotify e receba notificações de novos episódios
                                </p>
                                {/* Adapte aqui se houver uma prop para o link do Spotify */}
                            </GlassContainer>
                        </div>
                    </GlassContainer>
                </div>

            </section>
        </>
    );
}

export default PodcastPage;