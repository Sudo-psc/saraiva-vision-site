/**
 * BlogPost Component
 * Displays a single blog post with full content, SEO meta tags, and related posts
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import WordPressBlogService from '../../services/WordPressBlogService';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import BlogList from './BlogList';

const BlogPost = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const blogService = new WordPressBlogService();

    useEffect(() => {
        loadPost();
    }, [slug]);

    useEffect(() => {
        if (post) {
            loadRelatedPosts();
        }
    }, [post]);

    const loadPost = async () => {
        try {
            setLoading(true);
            setError(null);

            const postData = await blogService.getPostBySlug(slug);
            setPost(postData);

        } catch (err) {
            console.error('Error loading blog post:', err);
            setError('Post não encontrado.');
        } finally {
            setLoading(false);
        }
    };

    const loadRelatedPosts = async () => {
        try {
            const related = await blogService.getRelatedPosts(post.id, { limit: 3 });
            setRelatedPosts(related);
        } catch (err) {
            console.error('Error loading related posts:', err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const stripHtml = (html) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="text-center">
                    <ErrorMessage message={error} />
                    <Link
                        to="/blog"
                        className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Voltar ao Blog
                    </Link>
                </div>
            </div>
        );
    }

    if (!post) {
        return null;
    }

    return (
        <>
            {/* SEO Meta Tags */}
            <Helmet>
                <title>{post.seo.title}</title>
                <meta name="description" content={post.seo.description} />
                <link rel="canonical" href={post.seo.canonical} />

                {/* Open Graph */}
                <meta property="og:title" content={post.seo.ogTitle} />
                <meta property="og:description" content={post.seo.ogDescription} />
                <meta property="og:type" content={post.seo.ogType} />
                <meta property="og:url" content={post.seo.ogUrl} />
                {post.seo.ogImage && <meta property="og:image" content={post.seo.ogImage} />}

                {/* Twitter */}
                <meta name="twitter:card" content={post.seo.twitterCard} />
                <meta name="twitter:title" content={post.seo.twitterTitle} />
                <meta name="twitter:description" content={post.seo.twitterDescription} />
                {post.seo.twitterImage && <meta name="twitter:image" content={post.seo.twitterImage} />}

                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify(post.seo.structuredData)}
                </script>
            </Helmet>

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Breadcrumb */}
                    <nav className="mb-8" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2 text-sm text-gray-500">
                            <li>
                                <Link to="/" className="hover:text-blue-600">
                                    Início
                                </Link>
                            </li>
                            <span>/</span>
                            <li>
                                <Link to="/blog" className="hover:text-blue-600">
                                    Blog
                                </Link>
                            </li>
                            <span>/</span>
                            <li className="text-gray-900 truncate">
                                {stripHtml(post.title)}
                            </li>
                        </ol>
                    </nav>

                    {/* Post Header */}
                    <header className="mb-8">
                        {/* Categories */}
                        {post.categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {post.categories.map((category) => (
                                    <span
                                        key={category.id}
                                        className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                                    >
                                        {category.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            {stripHtml(post.title)}
                        </h1>

                        {/* Meta Information */}
                        <div className="flex items-center space-x-6 text-gray-600 mb-6">
                            {/* Author */}
                            {post.author && (
                                <div className="flex items-center space-x-3">
                                    {post.author.avatar && (
                                        <img
                                            src={post.author.avatar}
                                            alt={post.author.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">{post.author.name}</p>
                                        {post.author.description && (
                                            <p className="text-sm text-gray-500">{post.author.description}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Date */}
                            <time dateTime={post.date} className="text-gray-500">
                                {formatDate(post.date)}
                            </time>
                        </div>

                        {/* Featured Image */}
                        {post.featuredImage && (
                            <div className="mb-8">
                                <img
                                    src={post.featuredImage.url}
                                    alt={post.featuredImage.alt}
                                    className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                                />
                                {post.featuredImage.caption && (
                                    <p className="mt-2 text-sm text-gray-500 italic text-center">
                                        {stripHtml(post.featuredImage.caption)}
                                    </p>
                                )}
                            </div>
                        )}
                    </header>

                    {/* Post Content */}
                    <article className="bg-white rounded-lg shadow-sm p-8 mb-12">
                        <div
                            className="prose prose-lg max-w-none
                                       prose-headings:text-gray-900 prose-headings:font-bold
                                       prose-p:text-gray-700 prose-p:leading-relaxed
                                       prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                                       prose-strong:text-gray-900
                                       prose-ul:text-gray-700 prose-ol:text-gray-700
                                       prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50
                                       prose-img:rounded-lg prose-img:shadow-md"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Medical Disclaimer */}
                        <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        ⚕️ Aviso Médico
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p>
                                            Este conteúdo tem caráter informativo e não substitui consulta médica.
                                            Para diagnóstico e tratamento, procure sempre orientação médica qualificada.
                                            Em caso de emergência, procure atendimento médico imediato.
                                        </p>
                                        <p className="mt-2 font-medium">
                                            📋 CRM Responsável: Dr. Philipe Saraiva Cruz - CRM-MG 69.870
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Tags:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                                        >
                                            #{tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Posts Relacionados
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {relatedPosts.map((relatedPost) => (
                                    <article
                                        key={relatedPost.id}
                                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <Link to={relatedPost.link}>
                                            {relatedPost.featuredImage && (
                                                <img
                                                    src={relatedPost.featuredImage.url}
                                                    alt={relatedPost.featuredImage.alt}
                                                    className="w-full h-48 object-cover rounded-t-lg"
                                                />
                                            )}
                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                                                    {stripHtml(relatedPost.title)}
                                                </h3>
                                                <p className="text-gray-600 text-sm line-clamp-3">
                                                    {stripHtml(relatedPost.excerpt)}
                                                </p>
                                                <time className="text-xs text-gray-500 mt-2 block">
                                                    {relatedPost.dateFormatted}
                                                </time>
                                            </div>
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                        <Link
                            to="/blog"
                            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            ← Voltar ao Blog
                        </Link>

                        <div className="flex space-x-4">
                            {/* Share buttons could go here */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BlogPost;