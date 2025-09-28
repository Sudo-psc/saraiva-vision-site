// WordPress content components for displaying CMS content
import React, { useState, useEffect } from 'react';
import { usePage, useService, usePopularServices } from '../hooks/useWordPress.js';
import useSupabasePosts from '../hooks/useSupabasePosts.js';
import {
    sanitizeWordPressContent,
    sanitizeWordPressExcerpt
} from '@/utils/sanitizeWordPressContent';
import {
    OfflineContentContainer,
    OfflineBanner,
    ConnectionStatus,
    RetryButton,
    getOfflineState,
    generateEnhancedFallbackContent
} from '@/components/ui/OfflineFallback.jsx';

// Component for displaying WordPress post content
export const WordPressPost = ({ slug, className = '' }) => {
    const { post, loading, error } = useSupabasePosts(slug);

    const renderContent = () => {
        if (loading) {
            return (
                <div className={`animate-pulse ${className}`}>
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            );
        }

        if (error) {
            const offlineState = getOfflineState();
            const isOffline = offlineState?.isOffline;

            return (
                <div className={`${isOffline ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'} rounded-lg p-4 ${className}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={`${isOffline ? 'text-orange-800' : 'text-red-800'} font-semibold`}>
                            {isOffline ? 'Conteúdo Temporariamente Indisponível' : 'Erro ao carregar conteúdo'}
                        </h3>
                        <ConnectionStatus />
                    </div>
                    <p className={`${isOffline ? 'text-orange-600' : 'text-red-600'} text-sm mb-4`}>
                        {isOffline
                            ? 'Nosso sistema está temporariamente offline. Exibindo conteúdo em cache quando disponível.'
                            : error.message || 'Não foi possível carregar o post do WordPress.'
                        }
                    </p>
                    <div className="flex items-center space-x-4">
                        <RetryButton
                            onRetry={() => window.location.reload()}
                            className="text-sm"
                        />
                        <p className={`${isOffline ? 'text-orange-500' : 'text-red-500'} text-xs`}>
                            {isOffline
                                ? 'Tentando reconectar automaticamente...'
                                : 'Verifique sua conexão ou tente novamente mais tarde.'
                            }
                        </p>
                    </div>
                </div>
            );
        }

        if (!post) {
            const offlineState = getOfflineState();
            return (
                <div className={`${offlineState?.isOffline ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50 border-yellow-200'} rounded-lg p-4 ${className}`}>
                    <div className="flex items-center justify-between mb-2">
                        <p className={`${offlineState?.isOffline ? 'text-orange-800' : 'text-yellow-800'}`}>
                            {offlineState?.isOffline ? 'Conteúdo Indisponível (Offline)' : 'Post não encontrado.'}
                        </p>
                        <ConnectionStatus />
                    </div>
                    {offlineState?.isOffline && (
                        <p className="text-orange-600 text-xs mt-2">
                            Conteúdo temporariamente indisponível devido a problemas de conectividade.
                        </p>
                    )}
                </div>
            );
        }

        return (
            <article className={`wordpress-post ${className}`}>
                {/* Offline banner for degraded mode */}
                <OfflineBanner />

                {/* Assuming featuredImage is a direct URL in Supabase, or you'll need to adjust */}
                {post.featured_image_url && (
                    <div className="mb-6">
                        <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-64 object-cover rounded-lg"
                            loading="lazy"
                        />
                    </div>
                )}

                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {post.title}
                    </h1>

                    {/* Assuming author, date, categories, and tags are handled differently or not present in Supabase for now */}
                    {/* You will need to adjust this section based on your Supabase table structure */}
                    {/* Example for date if it's a string: */}
                    {post.published_at && (
                        <div className="flex items-center text-sm text-gray-600 mb-4">
                            <time dateTime={post.published_at}>
                                {new Date(post.published_at).toLocaleDateString('pt-BR')}
                            </time>
                            <span className="mx-2">•</span>
                            <ConnectionStatus className="text-xs" />
                        </div>
                    )}
                </header>

                {post.excerpt && (
                    <div className="text-lg text-gray-700 mb-6 font-medium">
                        <div dangerouslySetInnerHTML={{ __html: sanitizeWordPressExcerpt(post.excerpt) }} />
                    </div>
                )}

                <div
                    className="prose prose-lg max-w-none wordpress-content"
                    dangerouslySetInnerHTML={{ __html: sanitizeWordPressContent(post.content) }}
                />
            </article>
        );
    };

    return (
        <OfflineContentContainer
            contentType="posts"
            className={className}
            fallback={
                <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-yellow-800 font-semibold flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.994 0-1.306-1.059-2.366-2.366-2.366S9 1.7 9 3.006c0 1.3-.562 2.66-1.332 3.994L3.27 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Conteúdo Indisponível
                        </h3>
                        <ConnectionStatus />
                    </div>
                    <p className="text-yellow-700 mb-4">
                        Este post está temporariamente indisponível devido a problemas técnicos com nosso sistema de gerenciamento de conteúdo.
                    </p>
                    <div className="flex items-center space-x-4">
                        <RetryButton
                            onRetry={() => window.location.reload()}
                        />
                        <p className="text-yellow-600 text-sm">
                            Nosso conteúdo estará disponível em breve. Agradecemos sua paciência.
                        </p>
                    </div>
                </div>
            }
        >
            {renderContent()}
        </OfflineContentContainer>
    );
};

// Component for displaying WordPress page content
export const WordPressPage = ({ slug, className = '' }) => {
    const { data, loading, error } = usePage(slug);

    const renderContent = () => {
        if (loading) {
            return (
                <div className={`animate-pulse ${className}`}>
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            );
        }

        if (error) {
            const offlineState = getOfflineState();
            const isOffline = offlineState?.isOffline;

            return (
                <div className={`${isOffline ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'} rounded-lg p-4 ${className}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={`${isOffline ? 'text-orange-800' : 'text-red-800'} font-semibold`}>
                            {isOffline ? 'Página Temporariamente Indisponível' : 'Erro ao carregar página'}
                        </h3>
                        <ConnectionStatus />
                    </div>
                    <p className={`${isOffline ? 'text-orange-600' : 'text-red-600'} text-sm mb-4`}>
                        {isOffline
                            ? 'Nosso sistema está temporariamente offline. Exibindo conteúdo em cache quando disponível.'
                            : error.message || 'Não foi possível carregar a página do WordPress.'
                        }
                    </p>
                    <div className="flex items-center space-x-4">
                        <RetryButton
                            onRetry={() => window.location.reload()}
                            className="text-sm"
                        />
                        <p className={`${isOffline ? 'text-orange-500' : 'text-red-500'} text-xs`}>
                            {isOffline
                                ? 'Estamos trabalhando para restabelecer a conexão. Por favor, tente novamente em alguns instantes.'
                                : 'Verifique sua conexão ou tente novamente mais tarde.'
                            }
                        </p>
                    </div>
                    {isOffline && (
                        <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-orange-700 text-sm">
                                    <span className="font-medium">Status offline:</span> Estamos enfrentando dificuldades técnicas.
                                    {offlineState?.cachedContentAvailable ? ' Conteúdo em cache pode estar disponível.' : ' Por favor, tente novamente em breve.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (!data?.page) {
            return (
                <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-yellow-800">Página não encontrada.</p>
                        <ConnectionStatus />
                    </div>
                </div>
            );
        }

        const { page } = data;

        return (
            <div className={`wordpress-page ${className}`}>
                {/* Offline banner for degraded mode */}
                <OfflineBanner />

                {page.featuredImage?.node?.sourceUrl && (
                    <div className="mb-6">
                        <img
                            src={page.featuredImage.node.sourceUrl}
                            alt={page.featuredImage.node.altText || page.title}
                            className="w-full h-64 object-cover rounded-lg"
                            loading="lazy"
                        />
                    </div>
                )}

                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {page.title}
                    </h1>
                    <div className="flex items-center text-sm text-gray-600">
                        <ConnectionStatus className="text-xs" />
                    </div>
                </header>

                <div
                    className="prose prose-lg max-w-none wordpress-content"
                    dangerouslySetInnerHTML={{ __html: sanitizeWordPressContent(page.content) }}
                />
            </div>
        );
    };

    return (
        <OfflineContentContainer
            contentType="pages"
            className={className}
            fallback={
                <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-yellow-800 font-semibold flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Página Indisponível
                        </h3>
                        <ConnectionStatus />
                    </div>
                    <p className="text-yellow-700 mb-4">
                        Esta página está temporariamente indisponível devido a problemas técnicos com nosso sistema de gerenciamento de conteúdo.
                    </p>
                    <div className="flex items-center space-x-4">
                        <RetryButton
                            onRetry={() => window.location.reload()}
                        />
                        <p className="text-yellow-600 text-sm">
                            Por favor, tente novamente em alguns minutos ou entre em contato conosco.
                        </p>
                    </div>
                </div>
            }
        >
            {renderContent()}
        </OfflineContentContainer>
    );
};

// Component for displaying recent posts preview
export const RecentPostsPreview = ({ count = 3, className = '' }) => {
    const { posts, loading, error } = useSupabasePosts();

    if (loading) {
        return (
            <div className={`${className}`}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: count }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
                <h3 className="text-red-800 font-semibold mb-2">Erro ao carregar posts</h3>
                <p className="text-red-600 text-sm">
                    {error.message || 'Não foi possível carregar os posts recentes.'}
                </p>
            </div>
        );
    }

    const recentPosts = posts.slice(0, count);

    if (!recentPosts?.length) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <p className="text-gray-600">Nenhum post encontrado.</p>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recentPosts.map((post) => (
                    <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        {post.featured_image_url && (
                            <div className="aspect-w-16 aspect-h-9">
                                <img
                                    src={post.featured_image_url}
                                    alt={post.title}
                                    className="w-full h-48 object-cover"
                                    loading="lazy"
                                />
                            </div>
                        )}

                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                                {post.title}
                            </h3>

                            {post.excerpt && (
                                <div
                                    className="text-gray-600 text-sm mb-4 line-clamp-3"
                                    dangerouslySetInnerHTML={{ __html: sanitizeWordPressExcerpt(post.excerpt) }}
                                />
                            )}

                            {post.published_at && (
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <time dateTime={post.published_at}>
                                        {new Date(post.published_at).toLocaleDateString('pt-BR')}
                                    </time>
                                </div>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

// Component for displaying popular services
export const PopularServicesPreview = ({ count = 6, className = '' }) => {
    const { data, loading, error } = usePopularServices(count);

    if (loading) {
        return (
            <div className={`${className}`}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: count }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
                <h3 className="text-red-800 font-semibold mb-2">Erro ao carregar serviços</h3>
                <p className="text-red-600 text-sm">
                    {error.message || 'Não foi possível carregar os serviços populares.'}
                </p>
            </div>
        );
    }

    if (!data?.services?.length) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <p className="text-gray-600">Nenhum serviço encontrado.</p>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.services.map((service) => (
                    <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        {service.featuredImage?.node?.sourceUrl && (
                            <div className="aspect-w-16 aspect-h-9">
                                <img
                                    src={service.featuredImage.node.sourceUrl}
                                    alt={service.featuredImage.node.altText || service.title}
                                    className="w-full h-48 object-cover"
                                    loading="lazy"
                                />
                            </div>
                        )}

                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {service.title}
                            </h3>

                            {service.excerpt && (
                                <div
                                    className="text-gray-600 text-sm mb-4 line-clamp-3"
                                    dangerouslySetInnerHTML={{ __html: sanitizeWordPressExcerpt(service.excerpt) }}
                                />
                            )}

                            {service.serviceDetails?.duration && (
                                <div className="text-sm text-gray-500">
                                    <span className="font-medium">Duração:</span> {service.serviceDetails.duration}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};