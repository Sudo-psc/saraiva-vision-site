/**
 * Podcast Episodes List Component
 * Displays a list of podcast episodes with pagination and search
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import PodcastEpisodeCard from './PodcastEpisodeCard';

const PodcastEpisodesList = ({
    initialEpisodes = [],
    showSearch = true,
    showPagination = true,
    episodesPerPage = 12,
    compact = false,
    autoRefresh = false,
    refreshInterval = 300000 // 5 minutes
}) => {
    const [episodes, setEpisodes] = useState(initialEpisodes);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch episodes from API
    const fetchEpisodes = useCallback(async (page = 1, search = '', showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            setError(null);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: episodesPerPage.toString(),
                ...(search && { search }),
                sortBy: 'published_at',
                sortOrder: 'desc'
            });

            const response = await fetch(`/api/podcast/episodes?${params}`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error?.message || 'Failed to fetch episodes');
            }

            setEpisodes(data.data.episodes || []);
            setPagination(data.data.pagination);
            setCurrentPage(page);

        } catch (err) {
            console.error('Error fetching episodes:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [episodesPerPage]);

    // Handle search
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setCurrentPage(1);
        fetchEpisodes(1, term);
    }, [fetchEpisodes]);

    // Handle page change
    const handlePageChange = useCallback((page) => {
        if (page >= 1 && (!pagination || page <= pagination.totalPages)) {
            fetchEpisodes(page, searchTerm);
        }
    }, [fetchEpisodes, searchTerm, pagination]);

    // Handle refresh
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchEpisodes(currentPage, searchTerm, false);
    }, [fetchEpisodes, currentPage, searchTerm]);

    // Auto-refresh setup
    useEffect(() => {
        if (!autoRefresh || refreshInterval <= 0) return;

        const interval = setInterval(() => {
            if (!loading && !refreshing) {
                handleRefresh();
            }
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, loading, refreshing, handleRefresh]);

    // Initial load
    useEffect(() => {
        if (initialEpisodes.length === 0) {
            fetchEpisodes();
        }
    }, [fetchEpisodes, initialEpisodes.length]);

    // Memoized search input
    const searchInput = useMemo(() => (
        showSearch && (
            <div className="relative mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar episódios..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-500 text-gray-900"
                    />
                </div>
            </div>
        )
    ), [showSearch, searchTerm, handleSearch]);

    // Memoized pagination
    const paginationComponent = useMemo(() => (
        showPagination && pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 px-4">
                <div className="text-sm text-gray-600">
                    Página {pagination.currentPage} de {pagination.totalPages}
                    ({pagination.totalCount} episódios)
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="p-2 rounded-lg border border-gray-300 text-gray-600
                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
                        aria-label="Página anterior"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <span className="px-3 py-2 text-sm font-medium text-gray-900">
                        {pagination.currentPage}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="p-2 rounded-lg border border-gray-300 text-gray-600
                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
                        aria-label="Próxima página"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )
    ), [showPagination, pagination, currentPage, handlePageChange]);

    return (
        <div className="w-full">
            {/* Header with Search and Refresh */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                    {searchInput}
                </div>

                {autoRefresh && (
                    <button
                        onClick={handleRefresh}
                        disabled={loading || refreshing}
                        className="ml-4 p-2 text-gray-600 hover:text-gray-900 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Atualizar episódios"
                        aria-label="Atualizar episódios"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-red-800">Erro ao carregar episódios</h3>
                            <p className="text-red-700 text-sm mt-1">{error}</p>
                            <button
                                onClick={() => fetchEpisodes(currentPage, searchTerm)}
                                className="text-red-600 hover:text-red-700 font-medium text-sm mt-2"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-gray-600">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Carregando episódios...</span>
                    </div>
                </div>
            )}

            {/* Episodes Grid */}
            {!loading && episodes.length > 0 && (
                <div className={`
          grid gap-6
          ${compact
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-1 lg:grid-cols-2'
                    }
        `}>
                    {episodes.map((episode) => (
                        <PodcastEpisodeCard
                            key={episode.id}
                            episode={episode}
                            compact={compact}
                            showPlayer={true}
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && episodes.length === 0 && !error && (
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                        {searchTerm
                            ? `Nenhum episódio encontrado para "${searchTerm}"`
                            : 'Nenhum episódio disponível'
                        }
                    </div>
                    {searchTerm && (
                        <button
                            onClick={() => handleSearch('')}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Limpar busca
                        </button>
                    )}
                </div>
            )}

            {/* Pagination */}
            {paginationComponent}
        </div>
    );
};

export default PodcastEpisodesList;