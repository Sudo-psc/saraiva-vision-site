/**
 * BlogList Component
 * Displays a list of blog posts with pagination and filtering
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WordPressBlogService from '../../services/WordPressBlogService';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

const BlogList = ({
    category = null,
    featured = false,
    limit = 10,
    showPagination = true,
    className = ''
}) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(category);

    const blogService = new WordPressBlogService();

    useEffect(() => {
        loadPosts();
        loadCategories();
    }, [currentPage, selectedCategory, limit]);

    const loadPosts = async () => {
        try {
            setLoading(true);
            setError(null);

            const postsData = await blogService.getPosts({
                page: currentPage,
                perPage: limit,
                category: selectedCategory,
                orderby: featured ? 'date' : 'date',
                order: 'desc'
            });

            setPosts(postsData);

            // WordPress returns total pages in X-WP-TotalPages header
            // For now, we'll estimate based on posts length
            setTotalPages(Math.ceil(postsData.length / limit) || 1);

        } catch (err) {
            console.error('Error loading blog posts:', err);
            setError('Erro ao carregar posts do blog. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const categoriesData = await blogService.getCategories();
            setCategories(categoriesData);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <div className="flex justify-center items-center min-h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className={`blog-list ${className}`}>
            {/* Category Filter */}
            {!category && categories.length > 0 && (
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleCategoryChange(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                !selectedCategory
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Todos
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    selectedCategory === cat.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Posts Grid */}
            <div className="grid gap-8 md:gap-12">
                {posts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            Nenhum post encontrado.
                        </p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <article
                            key={post.id}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                            <div className="grid md:grid-cols-3 gap-6 p-6">
                                {/* Featured Image */}
                                {post.featuredImage && (
                                    <div className="md:col-span-1">
                                        <Link to={post.link}>
                                            <img
                                                src={post.featuredImage.url}
                                                alt={post.featuredImage.alt}
                                                className="w-full h-48 md:h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                                                loading="lazy"
                                            />
                                        </Link>
                                    </div>
                                )}

                                {/* Content */}
                                <div className={post.featuredImage ? 'md:col-span-2' : 'md:col-span-3'}>
                                    {/* Categories */}
                                    {post.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {post.categories.map((cat) => (
                                                <span
                                                    key={cat.id}
                                                    className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                                                >
                                                    {cat.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Title */}
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                                        <Link
                                            to={post.link}
                                            className="hover:text-blue-600 transition-colors"
                                        >
                                            {stripHtml(post.title)}
                                        </Link>
                                    </h2>

                                    {/* Excerpt */}
                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                        {stripHtml(post.excerpt)}
                                    </p>

                                    {/* Meta Information */}
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center space-x-4">
                                            {/* Author */}
                                            {post.author && (
                                                <div className="flex items-center space-x-2">
                                                    {post.author.avatar && (
                                                        <img
                                                            src={post.author.avatar}
                                                            alt={post.author.name}
                                                            className="w-8 h-8 rounded-full"
                                                        />
                                                    )}
                                                    <span>{post.author.name}</span>
                                                </div>
                                            )}

                                            {/* Date */}
                                            <time dateTime={post.date}>
                                                {formatDate(post.date)}
                                            </time>
                                        </div>

                                        {/* Read More Link */}
                                        <Link
                                            to={post.link}
                                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                        >
                                            Ler mais →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>

            {/* Pagination */}
            {showPagination && totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                    <nav className="flex items-center space-x-2">
                        {/* Previous Page */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                    page === currentPage
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next Page */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próxima
                        </button>
                    </nav>
                </div>
            )}

            {/* Medical Disclaimer */}
            <div className="mt-12 p-6 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
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
                                O conteúdo deste blog tem caráter informativo e não substitui consulta médica.
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
        </div>
    );
};

export default BlogList;