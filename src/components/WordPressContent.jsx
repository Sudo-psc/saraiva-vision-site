// WordPress content components for displaying CMS content
import React from 'react';
import { usePage, useService, usePopularServices } from '../hooks/useWordPress.js';
import useSupabasePosts from '../hooks/useSupabasePosts.js';

// Component for displaying WordPress post content
export const WordPressPost = ({ slug, className = '' }) => {
    const { post, loading, error } = useSupabasePosts(slug);

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
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
                <h3 className="text-red-800 font-semibold mb-2">Erro ao carregar conteúdo</h3>
                <p className="text-red-600 text-sm">
                    {error.message || 'Não foi possível carregar o post do WordPress.'}
                </p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
                <p className="text-yellow-800">Post não encontrado.</p>
            </div>
        );
    }

    return (
        <article className={`wordpress-post ${className}`}>
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
                    </div>
                )}
            </header>

            {post.excerpt && (
                <div className="text-lg text-gray-700 mb-6 font-medium">
                    <div dangerouslySetInnerHTML={{ __html: post.excerpt }} />
                </div>
            )}

            <div
                className="prose prose-lg max-w-none wordpress-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
        </article>
    );
};

// Component for displaying WordPress page content
export const WordPressPage = ({ slug, className = '' }) => {
    const { data, loading, error } = usePage(slug);

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
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
                <h3 className="text-red-800 font-semibold mb-2">Erro ao carregar página</h3>
                <p className="text-red-600 text-sm">
                    {error.message || 'Não foi possível carregar a página do WordPress.'}
                </p>
            </div>
        );
    }

    if (!data?.page) {
        return (
            <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
                <p className="text-yellow-800">Página não encontrada.</p>
            </div>
        );
    }

    const { page } = data;

    return (
        <div className={`wordpress-page ${className}`}>
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
            </header>

            <div
                className="prose prose-lg max-w-none wordpress-content"
                dangerouslySetInnerHTML={{ __html: page.content }}
            />
        </div>
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
                                    dangerouslySetInnerHTML={{ __html: post.excerpt }}
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
                                    dangerouslySetInnerHTML={{ __html: service.excerpt }}
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