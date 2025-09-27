/**
 * Hook para gerenciar Instagram Embed sem API
 * Funcionalidades avançadas para @saraiva_vision
 */

import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import instagramEmbedService from '../services/instagramEmbedService.js';

export const useInstagramEmbed = (options = {}) => {
    const {
        maxPosts = 6,
        refreshInterval = 300000, // 5 minutos
        enableAutoRefresh = false,
        cacheKey = 'instagram_posts',
        enableOfflineMode = true
    } = options;

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [profileStats, setProfileStats] = useState(null);
    
    const refreshIntervalRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Verificar conectividade
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Carregar posts do cache
    const loadFromCache = useCallback(() => {
        try {
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                const { posts: cachedPosts, timestamp, stats } = JSON.parse(cachedData);
                const cacheAge = Date.now() - timestamp;
                const maxAge = 24 * 60 * 60 * 1000; // 24 horas

                if (cacheAge < maxAge) {
                    setPosts(cachedPosts);
                    setProfileStats(stats);
                    setLastUpdated(new Date(timestamp));
                    return true;
                }
            }
        } catch (err) {
            console.warn('Erro ao carregar cache:', err);
        }
        return false;
    }, [cacheKey]);

    // Salvar posts no cache
    const saveToCache = useCallback((postsData, statsData) => {
        try {
            const cacheData = {
                posts: postsData,
                stats: statsData,
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (err) {
            console.warn('Erro ao salvar cache:', err);
        }
    }, [cacheKey]);

    // Buscar posts
    const fetchPosts = useCallback(async (showLoading = true) => {
        // Cancelar requisição anterior se existir
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        try {
            if (showLoading) {
                setLoading(true);
            }
            setError(null);

            // Tentar carregar do cache primeiro em modo offline
            if (!isOnline && enableOfflineMode) {
                const cacheLoaded = loadFromCache();
                if (cacheLoaded) {
                    setLoading(false);
                    return;
                }
            }

            // Buscar posts do serviço
            const response = await instagramEmbedService.fetchPosts(maxPosts);
            const stats = instagramEmbedService.getProfileStats();

            if (response.success) {
                setPosts(response.posts);
                setProfileStats(stats);
                setLastUpdated(new Date());
                
                // Salvar no cache
                saveToCache(response.posts, stats);
            } else {
                throw new Error('Falha ao carregar posts');
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                return; // Requisição cancelada
            }

            setError(err.message);
            
            // Tentar carregar do cache como fallback
            if (enableOfflineMode) {
                const cacheLoaded = loadFromCache();
                if (!cacheLoaded) {
                    console.error('Instagram fetch error:', err);
                }
            }
        } finally {
            setLoading(false);
        }
    }, [maxPosts, isOnline, enableOfflineMode, loadFromCache, saveToCache]);

    // Atualizar posts
    const refreshPosts = useCallback(() => {
        fetchPosts(false);
    }, [fetchPosts]);

    // Configurar auto-refresh
    useEffect(() => {
        if (enableAutoRefresh && refreshInterval > 0) {
            refreshIntervalRef.current = setInterval(refreshPosts, refreshInterval);
            
            return () => {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                }
            };
        }
    }, [enableAutoRefresh, refreshInterval, refreshPosts]);

    // Buscar posts na inicialização
    useEffect(() => {
        fetchPosts();
        
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchPosts]);

    // Filtrar posts por hashtag
    const getPostsByHashtag = useCallback(async (hashtag) => {
        try {
            const response = await instagramEmbedService.getPostsByHashtag(hashtag);
            return response;
        } catch (err) {
            console.error('Erro ao buscar posts por hashtag:', err);
            return { success: false, posts: [] };
        }
    }, []);

    // Obter post específico
    const getPostById = useCallback((postId) => {
        return posts.find(post => post.id === postId) || null;
    }, [posts]);

    // Calcular estatísticas
    const getStats = useCallback(() => {
        if (!posts.length) return null;

        const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
        const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);
        const avgLikes = Math.round(totalLikes / posts.length);
        const avgComments = Math.round(totalComments / posts.length);

        return {
            totalPosts: posts.length,
            totalLikes,
            totalComments,
            avgLikes,
            avgComments,
            profileStats
        };
    }, [posts, profileStats]);

    // Verificar se tem posts recentes
    const hasRecentPosts = useCallback(() => {
        if (!posts.length) return false;
        
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return posts.some(post => new Date(post.timestamp) > oneDayAgo);
    }, [posts]);

    return {
        // Dados
        posts,
        profileStats,
        
        // Estados
        loading,
        error,
        lastUpdated,
        isOnline,
        
        // Ações
        refreshPosts,
        getPostsByHashtag,
        getPostById,
        
        // Utilitários
        getStats,
        hasRecentPosts,
        
        // Metadados
        isEmpty: posts.length === 0,
        isStale: lastUpdated && (Date.now() - lastUpdated.getTime()) > 3600000, // 1 hora
        isOfflineMode: !isOnline && enableOfflineMode
    };
};

// Hook simplificado para widgets pequenos
export const useInstagramMini = (maxPosts = 3) => {
    const { posts, loading, error } = useInstagramEmbed({ 
        maxPosts, 
        enableAutoRefresh: false 
    });
    
    return {
        posts: posts.slice(0, maxPosts),
        loading,
        hasError: !!error
    };
};

// Hook para posts por categoria/hashtag
export const useInstagramByCategory = (hashtag, maxPosts = 6) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoryPosts = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await instagramEmbedService.getPostsByHashtag(hashtag, maxPosts);
                
                if (response.success) {
                    setPosts(response.posts);
                } else {
                    setError('Erro ao carregar posts');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (hashtag) {
            fetchCategoryPosts();
        }
    }, [hashtag, maxPosts]);

    return { posts, loading, error };
};

// Context para compartilhar dados entre componentes

const InstagramEmbedContext = createContext();

export const InstagramEmbedProvider = ({ children, ...options }) => {
    const instagramData = useInstagramEmbed(options);
    
    return (
        <InstagramEmbedContext.Provider value={instagramData}>
            {children}
        </InstagramEmbedContext.Provider>
    );
};

export const useInstagramContext = () => {
    const context = useContext(InstagramEmbedContext);
    if (!context) {
        throw new Error('useInstagramContext deve ser usado dentro de InstagramEmbedProvider');
    }
    return context;
};

export default useInstagramEmbed;