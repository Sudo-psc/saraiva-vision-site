import { executeGraphQLQuery } from './wordpress.js';
import { executeWordPressQueryWithFallback } from './wordpress-health.js';
import {
    getCachedContent,
    setCachedContent,
    prefetchCriticalContent,
    generateEnhancedFallbackContent
} from './wordpress-offline.js';
import { getCMSFallbackSystem, initializeCMSFallbackSystem } from './cms-fallback-system.js';
import { getOfflineContentManager } from './offline-content-manager.js';
import {
    GET_ALL_POSTS,
    GET_POST_BY_SLUG,
    GET_ALL_PAGES,
    GET_PAGE_BY_SLUG,
    GET_ALL_SERVICES,
    GET_SERVICE_BY_SLUG,
    GET_POPULAR_SERVICES,
    GET_ALL_TEAM_MEMBERS,
    GET_TEAM_MEMBER_BY_SLUG,
    GET_FEATURED_TESTIMONIALS,
    GET_ALL_TESTIMONIALS,
    GET_RECENT_POSTS,
    GET_SITE_SETTINGS,
    GET_NAVIGATION_MENUS,
    GET_POSTS_BY_CATEGORY,
    GET_ALL_CATEGORIES,
} from './wordpress-queries.js';

// Cache duration in seconds (5 minutes for most content, 1 hour for static content)
const CACHE_DURATION = {
    POSTS: 300, // 5 minutes
    PAGES: 3600, // 1 hour
    SERVICES: 1800, // 30 minutes
    TEAM_MEMBERS: 3600, // 1 hour
    TESTIMONIALS: 1800, // 30 minutes
    SITE_SETTINGS: 3600, // 1 hour
    NAVIGATION: 3600, // 1 hour
    CATEGORIES: 3600, // 1 hour
};

// Enhanced cache strategy with offline support
const CACHE_STRATEGY = {
    MEMORY: 'memory',     // In-memory cache for fast access
    LOCAL: 'local',      // localStorage for offline persistence
    HYBRID: 'hybrid'     // Both memory and localStorage
};

// Cache configuration
const CACHE_CONFIG = {
    strategy: CACHE_STRATEGY.HYBRID,
    compress: true,
    encrypt: false,
    version: '1.0'
};

// In-memory cache for development (in production, use Redis or similar)
const memoryCache = new Map();

// Enhanced cache helper functions with offline support
const getCacheKey = (type, params = {}) => {
    const paramString = Object.keys(params).length > 0 ? JSON.stringify(params) : '';
    return `wp_${type}_${CACHE_CONFIG.version}:${paramString}`;
};

const getMemoryCachedData = (cacheKey) => {
    const cached = memoryCache.get(cacheKey);
    if (!cached) return null;

    const { data, timestamp, duration } = cached;
    const now = Date.now();

    if (now - timestamp > duration * 1000) {
        memoryCache.delete(cacheKey);
        return null;
    }

    return data;
};

const setMemoryCachedData = (cacheKey, data, duration) => {
    memoryCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        duration,
    });
};

const getLocalCachedData = (cacheKey) => {
    const cached = getCachedContent(cacheKey, 'normal');
    if (!cached) return null;

    const now = Date.now();
    const cacheAge = now - cached.timestamp;

    // Use longer duration for localStorage (offline fallback)
    const extendedDuration = Math.min(
        CACHE_DURATION.POSTS * 4,  // 4x normal duration
        24 * 60 * 60 * 1000    // Max 24 hours
    );

    if (cacheAge > extendedDuration) {
        return null;
    }

    return cached.data;
};

const setLocalCachedData = (cacheKey, data, duration) => {
    // Store in localStorage for offline access
    setCachedContent(cacheKey, data, 'important', 'wordpress');
};

const getCachedData = (cacheKey, type = 'normal') => {
    // Try memory cache first
    const memoryData = getMemoryCachedData(cacheKey);
    if (memoryData) return memoryData;

    // Try localStorage if hybrid strategy
    if (CACHE_CONFIG.strategy === CACHE_STRATEGY.HYBRID || CACHE_CONFIG.strategy === CACHE_STRATEGY.LOCAL) {
        const localData = getLocalCachedData(cacheKey);
        if (localData) {
            // Promote to memory cache for faster access
            setMemoryCachedData(cacheKey, localData, CACHE_DURATION.POSTS);
            return localData;
        }
    }

    return null;
};

const setCachedData = (cacheKey, data, duration, type = 'normal') => {
    // Always store in memory cache
    setMemoryCachedData(cacheKey, data, duration);

    // Store in localStorage if hybrid or local strategy
    if (CACHE_CONFIG.strategy === CACHE_STRATEGY.HYBRID || CACHE_CONFIG.strategy === CACHE_STRATEGY.LOCAL) {
        setLocalCachedData(cacheKey, data, duration);
    }
};

// Prefetch critical content for offline access
export const prefetchCriticalContentForOffline = async () => {
    try {
        console.log('Prefetching critical content for offline access...');

        // Fetch critical content types
        const criticalFetches = [
            getSiteSettings(false),
            getNavigationMenus(false),
            getPopularServices(6, false),
            getRecentPosts(3, false)
        ];

        const results = await Promise.allSettled(criticalFetches);

        const successCount = results.filter(result => result.status === 'fulfilled').length;
        console.log(`Prefetched ${successCount}/${criticalFetches.length} critical content items for offline access`);

        return successCount;
    } catch (error) {
        console.error('Error prefetching critical content:', error);
        return 0;
    }
};

// Enhanced cache with multi-layer fallback system
const getWithOfflineFallback = async (cacheKey, fetchFunction, options = {}) => {
    const {
        duration = CACHE_DURATION.POSTS,
        useCache = true,
        offlineFallback = true,
        contentType = 'general',
        enableCMSFallback = true
    } = options;

    // Try memory cache first
    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) {
            return {
                ...cached,
                isCached: true,
                isFallback: false
            };
        }
    }

    try {
        // Use enhanced CMS fallback system if enabled
        if (enableCMSFallback && contentType) {
            const cmsFallback = getCMSFallbackSystem();
            const result = await cmsFallback.executeWithFallback(fetchFunction, contentType, options);

            if (!result.error && useCache) {
                setCachedData(cacheKey, result, duration);

                // Also store in offline content manager
                const offlineManager = getOfflineContentManager();
                await offlineManager.storeContent(contentType, result, {
                    source: 'online',
                    priority: 'normal'
                });
            }

            return result;
        }

        // Fallback to original fetch function
        const result = await fetchFunction();

        if (!result.error && useCache) {
            setCachedData(cacheKey, result, duration);

            // Store in offline content manager
            const offlineManager = getOfflineContentManager();
            await offlineManager.storeContent(contentType, result, {
                source: 'online',
                priority: 'normal'
            });
        }

        return {
            ...result,
            isCached: false,
            isFallback: false
        };
    } catch (error) {
        console.warn(`Fetch failed for ${cacheKey}:`, error);

        if (offlineFallback) {
            // Try to get from offline content manager first
            const offlineManager = getOfflineContentManager();
            const offlineContent = offlineManager.getContent(contentType, options);

            if (offlineContent && offlineContent.length > 0) {
                console.log(`Using offline content manager for ${cacheKey}`);
                return {
                    [contentType === 'posts' ? 'posts' :
                     contentType === 'services' ? 'services' :
                     contentType === 'teamMembers' ? 'teamMembers' :
                     contentType === 'testimonials' ? 'testimonials' : 'data']: offlineContent,
                    isOffline: true,
                    isFallback: true,
                    isCached: true,
                    error: {
                        type: 'OFFLINE_CONTENT_MANAGER',
                        message: 'Using offline content manager',
                        originalError: error.message
                    }
                };
            }

            // Try legacy offline cache
            const legacyOfflineContent = getLocalCachedData(cacheKey);
            if (legacyOfflineContent) {
                console.log(`Using legacy offline cached content for ${cacheKey}`);
                return {
                    ...legacyOfflineContent,
                    isOffline: true,
                    isFallback: true,
                    isCached: true,
                    error: {
                        type: 'LEGACY_OFFLINE_FALLBACK',
                        message: 'Using cached offline content',
                        originalError: error.message
                    }
                };
            }

            // Generate enhanced fallback content
            const fallbackData = generateEnhancedFallbackContent(contentType, options);
            return {
                ...fallbackData,
                isOffline: true,
                isFallback: true,
                isCached: false,
                error: {
                    type: 'ENHANCED_FALLBACK_CONTENT',
                    message: 'Using generated fallback content',
                    originalError: error.message
                }
            };
        }

        throw error;
    }
};

// Posts API functions with health monitoring and offline fallback
export const getAllPosts = async (options = {}) => {
    const { first = 10, after = null, useCache = true } = options;
    const cacheKey = getCacheKey('posts', { first, after });

    const fetchFunction = async () => {
        const { data, error } = await executeGraphQLQuery(GET_ALL_POSTS, { first, after });

        if (error) {
            return { posts: [], pageInfo: null, error };
        }

        return {
            posts: data.posts.nodes || [],
            pageInfo: data.posts.pageInfo || null,
            error: null,
        };
    };

    const result = await getWithOfflineFallback(cacheKey, fetchFunction, {
        duration: CACHE_DURATION.POSTS,
        useCache,
        offlineFallback: true,
        contentType: 'posts'
    });

    if (result.isOffline || result.isFallback) {
        return {
            posts: result.posts || [],
            pageInfo: result.pageInfo || null,
            error: result.error,
            isOffline: result.isOffline,
            isFallback: result.isFallback,
            isCached: result.isCached,
            healthState: result.healthState,
            fallbackMeta: result.fallbackMeta,
        };
    }

    return {
        ...(result || {}),
        error: result?.error || null,
        isOffline: false,
        isFallback: false,
        isCached: result.isCached,
    };
};

export const getPostBySlug = async (slug, useCache = true) => {
    const cacheKey = getCacheKey('post', { slug });

    const fetchFunction = async () => {
        const { data, error } = await executeGraphQLQuery(GET_POST_BY_SLUG, { slug });

        if (error) {
            return { post: null, error };
        }

        return {
            post: data.post || null,
            error: null,
        };
    };

    const result = await getWithOfflineFallback(cacheKey, fetchFunction, {
        duration: CACHE_DURATION.POSTS,
        useCache,
        offlineFallback: true,
        contentType: 'posts'
    });

    if (result.isOffline || result.isFallback) {
        return {
            post: result.post || null,
            error: result.error,
            isOffline: result.isOffline,
            isFallback: result.isFallback,
            isCached: result.isCached,
            healthState: result.healthState,
            fallbackMeta: result.fallbackMeta,
        };
    }

    return {
        ...(result || {}),
        error: result?.error || null,
        isOffline: false,
        isFallback: false,
        isCached: result.isCached,
    };
};

export const getRecentPosts = async (first = 3, useCache = true) => {
    const cacheKey = getCacheKey('recent_posts', { first });

    const fetchFunction = async () => {
        const { data, error } = await executeGraphQLQuery(GET_RECENT_POSTS, { first });

        if (error) {
            return { posts: [], error };
        }

        return {
            posts: data.posts.nodes || [],
            error: null,
        };
    };

    const result = await getWithOfflineFallback(cacheKey, fetchFunction, {
        duration: CACHE_DURATION.POSTS,
        useCache,
        offlineFallback: true,
        contentType: 'posts'
    });

    if (result.isOffline || result.isFallback) {
        return {
            posts: result.posts || [],
            error: result.error,
            isOffline: result.isOffline,
            isFallback: result.isFallback,
            isCached: result.isCached,
            healthState: result.healthState,
            fallbackMeta: result.fallbackMeta,
        };
    }

    return {
        ...(result || {}),
        error: result?.error || null,
        isOffline: false,
        isFallback: false,
        isCached: result.isCached,
    };
};

// Pages API functions
export const getAllPages = async (useCache = true) => {
    const cacheKey = getCacheKey('pages');

    const fetchFunction = async () => {
        const { data, error } = await executeGraphQLQuery(GET_ALL_PAGES);

        if (error) {
            return { pages: [], error };
        }

        return {
            pages: data.pages.nodes || [],
            error: null,
        };
    };

    const result = await getWithOfflineFallback(cacheKey, fetchFunction, {
        duration: CACHE_DURATION.PAGES,
        useCache,
        offlineFallback: true,
        contentType: 'pages'
    });

    if (result.isOffline || result.isFallback) {
        return {
            pages: result.pages || [],
            error: result.error,
            isOffline: result.isOffline,
            isFallback: result.isFallback,
            isCached: result.isCached,
            healthState: result.healthState,
            fallbackMeta: result.fallbackMeta,
        };
    }

    return {
        ...(result || {}),
        error: result?.error || null,
        isOffline: false,
        isFallback: false,
        isCached: result.isCached,
    };
};

export const getPageBySlug = async (slug, useCache = true) => {
    const cacheKey = getCacheKey('page', { slug });

    const fetchFunction = async () => {
        const { data, error } = await executeGraphQLQuery(GET_PAGE_BY_SLUG, { slug });

        if (error) {
            return { page: null, error };
        }

        return {
            page: data.page || null,
            error: null,
        };
    };

    const result = await getWithOfflineFallback(cacheKey, fetchFunction, {
        duration: CACHE_DURATION.PAGES,
        useCache,
        offlineFallback: true,
        contentType: 'pages'
    });

    if (result.isOffline || result.isFallback) {
        return {
            page: result.page || null,
            error: result.error,
            isOffline: result.isOffline,
            isFallback: result.isFallback,
            isCached: result.isCached,
            healthState: result.healthState,
            fallbackMeta: result.fallbackMeta,
        };
    }

    return {
        ...(result || {}),
        error: null,
        isOffline: false,
        isFallback: false,
        isCached: result.isCached,
    };
};

// Services API functions
export const getAllServices = async (useCache = true) => {
    const cacheKey = getCacheKey('services');

    const fetchFunction = async () => {
        const { data, error } = await executeGraphQLQuery(GET_ALL_SERVICES);

        if (error) {
            return { services: [], error };
        }

        return {
            services: data.services.nodes || [],
            error: null,
        };
    };

    const result = await getWithOfflineFallback(cacheKey, fetchFunction, {
        duration: CACHE_DURATION.SERVICES,
        useCache,
        offlineFallback: true,
        contentType: 'services'
    });

    if (result.isOffline || result.isFallback) {
        return {
            services: result.services || [],
            error: result.error,
            isOffline: result.isOffline,
            isFallback: result.isFallback,
            isCached: result.isCached,
            healthState: result.healthState,
            fallbackMeta: result.fallbackMeta,
        };
    }

    return {
        ...(result || {}),
        error: null,
        isOffline: false,
        isFallback: false,
        isCached: result.isCached,
    };
};

export const getServiceBySlug = async (slug, useCache = true) => {
    const cacheKey = getCacheKey('service', { slug });

    const fetchFunction = async () => {
        const { data, error } = await executeGraphQLQuery(GET_SERVICE_BY_SLUG, { slug });

        if (error) {
            return { service: null, error };
        }

        return {
            service: data.service || null,
            error: null,
        };
    };

    const result = await getWithOfflineFallback(cacheKey, fetchFunction, {
        duration: CACHE_DURATION.SERVICES,
        useCache,
        offlineFallback: true,
        contentType: 'services'
    });

    if (result.isOffline || result.isFallback) {
        return {
            service: result.service || null,
            error: result.error,
            isOffline: result.isOffline,
            isFallback: result.isFallback,
            isCached: result.isCached,
            healthState: result.healthState,
            fallbackMeta: result.fallbackMeta,
        };
    }

    return {
        ...(result || {}),
        error: null,
        isOffline: false,
        isFallback: false,
        isCached: result.isCached,
    };
};

export const getPopularServices = async (first = 6, useCache = true) => {
    const cacheKey = getCacheKey('popular_services', { first });

    const fetchFunction = async () => {
        const { data, error } = await executeGraphQLQuery(GET_POPULAR_SERVICES, { first });

        if (error) {
            return { services: [], error };
        }

        return {
            services: data.services.nodes || [],
            error: null,
        };
    };

    const result = await getWithOfflineFallback(cacheKey, fetchFunction, {
        duration: CACHE_DURATION.SERVICES,
        useCache,
        offlineFallback: true,
        contentType: 'services'
    });

    if (result.isOffline || result.isFallback) {
        return {
            services: result.services || [],
            error: result.error,
            isOffline: result.isOffline,
            isFallback: result.isFallback,
            isCached: result.isCached,
            healthState: result.healthState,
            fallbackMeta: result.fallbackMeta,
        };
    }

    return {
        ...(result || {}),
        error: null,
        isOffline: false,
        isFallback: false,
        isCached: result.isCached,
    };
};

// Team Members API functions
export const getAllTeamMembers = async (useCache = true) => {
    const cacheKey = getCacheKey('team_members');

    const fetchFunction = async () => {
        const { data, error } = await executeGraphQLQuery(GET_ALL_TEAM_MEMBERS);

        if (error) {
            return { teamMembers: [], error };
        }

        return {
            teamMembers: data.teamMembers.nodes || [],
            error: null,
        };
    };

    const result = await getWithOfflineFallback(cacheKey, fetchFunction, {
        duration: CACHE_DURATION.TEAM_MEMBERS,
        useCache,
        offlineFallback: true,
        contentType: 'teamMembers'
    });

    if (result.isOffline || result.isFallback) {
        return {
            teamMembers: result.teamMembers || [],
            error: result.error,
            isOffline: result.isOffline,
            isFallback: result.isFallback,
            isCached: result.isCached,
            healthState: result.healthState,
            fallbackMeta: result.fallbackMeta,
        };
    }

    return {
        ...(result || {}),
        error: null,
        isOffline: false,
        isFallback: false,
        isCached: result.isCached,
    };
};

export const getTeamMemberBySlug = async (slug, useCache = true) => {
    const cacheKey = getCacheKey('team_member', { slug });

    const fetchFunction = async () => {
        const { data, error } = await executeGraphQLQuery(GET_TEAM_MEMBER_BY_SLUG, { slug });

        if (error) {
            return { teamMember: null, error };
        }

        return {
            teamMember: data.teamMember || null,
            error: null,
        };
    };

    const result = await getWithOfflineFallback(cacheKey, fetchFunction, {
        duration: CACHE_DURATION.TEAM_MEMBERS,
        useCache,
        offlineFallback: true,
        contentType: 'teamMembers'
    });

    if (result.isOffline || result.isFallback) {
        return {
            teamMember: result.teamMember || null,
            error: result.error,
            isOffline: result.isOffline,
            isFallback: result.isFallback,
            isCached: result.isCached,
            healthState: result.healthState,
            fallbackMeta: result.fallbackMeta,
        };
    }

    return {
        ...(result || {}),
        error: null,
        isOffline: false,
        isFallback: false,
        isCached: result.isCached,
    };
};

// Testimonials API functions
export const getFeaturedTestimonials = async (first = 6, useCache = true) => {
    const cacheKey = getCacheKey('featured_testimonials', { first });

    const fetchFunction = async () => {
        const { data, error } = await executeGraphQLQuery(GET_FEATURED_TESTIMONIALS, { first });

        if (error) {
            return { testimonials: [], error };
        }

        return {
            testimonials: data.testimonials.nodes || [],
            error: null,
        };
    };

    const result = await getWithOfflineFallback(cacheKey, fetchFunction, {
        duration: CACHE_DURATION.TESTIMONIALS,
        useCache,
        offlineFallback: true,
        contentType: 'testimonials'
    });

    if (result.isOffline || result.isFallback) {
        return {
            testimonials: result.testimonials || [],
            error: result.error,
            isOffline: result.isOffline,
            isFallback: result.isFallback,
            isCached: result.isCached,
            healthState: result.healthState,
            fallbackMeta: result.fallbackMeta,
        };
    }

    return {
        ...(result || {}),
        error: null,
        isOffline: false,
        isFallback: false,
        isCached: result.isCached,
    };
};

export const getAllTestimonials = async (useCache = true) => {
    const cacheKey = getCacheKey('testimonials');

    const fetchFunction = async () => {
        const { data, error } = await executeGraphQLQuery(GET_ALL_TESTIMONIALS);

        if (error) {
            return { testimonials: [], error };
        }

        return {
            testimonials: data.testimonials.nodes || [],
            error: null,
        };
    };

    const result = await getWithOfflineFallback(cacheKey, fetchFunction, {
        duration: CACHE_DURATION.TESTIMONIALS,
        useCache,
        offlineFallback: true,
        contentType: 'testimonials'
    });

    if (result.isOffline || result.isFallback) {
        return {
            testimonials: result.testimonials || [],
            error: result.error,
            isOffline: result.isOffline,
            isFallback: result.isFallback,
            isCached: result.isCached,
            healthState: result.healthState,
            fallbackMeta: result.fallbackMeta,
        };
    }

    return {
        ...(result || {}),
        error: null,
        isOffline: false,
        isFallback: false,
        isCached: result.isCached,
    };
};

// Site Settings API functions
export const getSiteSettings = async (useCache = true) => {
    const cacheKey = getCacheKey('site_settings');

    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const { data, error } = await executeGraphQLQuery(GET_SITE_SETTINGS);

    if (error) {
        return { settings: null, error };
    }

    const result = {
        settings: {
            general: data.generalSettings || null,
            all: data.allSettings || null,
        },
        error: null,
    };

    if (useCache) {
        setCachedData(cacheKey, result, CACHE_DURATION.SITE_SETTINGS);
    }

    return result;
};

export const getNavigationMenus = async (useCache = true) => {
    const cacheKey = getCacheKey('navigation_menus');

    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const { data, error } = await executeGraphQLQuery(GET_NAVIGATION_MENUS);

    if (error) {
        return { menus: [], error };
    }

    const result = {
        menus: data.menus.nodes || [],
        error: null,
    };

    if (useCache) {
        setCachedData(cacheKey, result, CACHE_DURATION.NAVIGATION);
    }

    return result;
};

// Category API functions
export const getPostsByCategory = async (categorySlug, options = {}) => {
    const { first = 12, useCache = true } = options;
    const cacheKey = getCacheKey('posts_by_category', { categorySlug, first });

    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const { data, error } = await executeGraphQLQuery(GET_POSTS_BY_CATEGORY, {
        slug: categorySlug,
        first
    });

    if (error) {
        return { posts: [], error };
    }

    const result = {
        posts: data.category?.posts?.nodes || [],
        error: null,
    };

    if (useCache) {
        setCachedData(cacheKey, result, CACHE_DURATION.POSTS);
    }

    return result;
};

export const getBlogPosts = async (options = {}) => {
    const { first = 10, after = null, categorySlug = null, useCache = true } = options;
    const cacheKey = getCacheKey('blog_posts', { first, after, categorySlug });

    const fetchFunction = async () => {
        let query = GET_ALL_POSTS;
        let variables = { first, after };

        if (categorySlug) {
            query = GET_POSTS_BY_CATEGORY;
            variables = { slug: categorySlug, first };
        }

        const { data, error } = await executeGraphQLQuery(query, variables);

        if (error) {
            return { posts: [], pageInfo: null, error };
        }

        return {
            posts: data.posts?.nodes || data.category?.posts?.nodes || [],
            pageInfo: data.posts?.pageInfo || null,
            error: null,
        };
    };

    const result = await getWithOfflineFallback(cacheKey, fetchFunction, {
        duration: CACHE_DURATION.POSTS,
        useCache,
        offlineFallback: true,
        contentType: 'posts'
    });

    if (result.isOffline || result.isFallback) {
        return {
            posts: result.posts || [],
            pageInfo: result.pageInfo || null,
            error: result.error,
            isOffline: result.isOffline,
            isFallback: result.isFallback,
            isCached: result.isCached,
            healthState: result.healthState,
            fallbackMeta: result.fallbackMeta,
        };
    }

    return {
        ...(result || {}),
        error: result?.error || null,
        isOffline: false,
        isFallback: false,
        isCached: result.isCached,
    };
};

export const getAllCategories = async (useCache = true) => {
    const cacheKey = getCacheKey('all_categories');

    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const { data, error } = await executeGraphQLQuery(GET_ALL_CATEGORIES);

    if (error) {
        return { categories: [], error };
    }

    const result = {
        categories: data.categories?.nodes || [],
        error: null,
    };

    if (useCache) {
        setCachedData(cacheKey, result, CACHE_DURATION.POSTS);
    }

    return result;
};

// Utility functions
export const invalidateCache = (pattern = null) => {
    if (!pattern) {
        memoryCache.clear();
        // Clear localStorage caches with our prefix
        if (typeof localStorage !== 'undefined') {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('wp_fallback_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        return;
    }

    // Clear memory cache
    for (const key of memoryCache.keys()) {
        if (key.includes(pattern)) {
            memoryCache.delete(key);
        }
    }

    // Clear localStorage cache
    if (typeof localStorage !== 'undefined') {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes(pattern) && key.startsWith('wp_fallback_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
};

export const getCacheStats = () => {
    const memoryStats = {
        size: memoryCache.size,
        keys: Array.from(memoryCache.keys()),
    };

    let localStorageStats = { size: 0, keys: [] };
    if (typeof localStorage !== 'undefined') {
        const wpKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('wp_fallback_')) {
                wpKeys.push(key);
            }
        }
        localStorageStats = {
            size: wpKeys.length,
            keys: wpKeys,
        };
    }

    return {
        memory: memoryStats,
        localStorage: localStorageStats,
        total: memoryStats.size + localStorageStats.size,
    };
};

// Initialize enhanced fallback systems
export const initializeOfflineCaching = async () => {
    if (typeof window !== 'undefined') {
        // Initialize CMS fallback system
        try {
            await initializeCMSFallbackSystem();
            console.log('CMS fallback system initialized');
        } catch (error) {
            console.warn('Failed to initialize CMS fallback system:', error);
        }

        // Start offline monitoring
        import('./wordpress-offline.js').then(({ startOfflineMonitoring }) => {
            startOfflineMonitoring();
        });

        // Prefetch critical content after page load
        setTimeout(async () => {
            const successCount = await prefetchCriticalContentForOffline();
            console.log(`Offline caching initialized with ${successCount} critical items`);
        }, 2000);
    }
};

// Check if we're in offline mode
export const isOfflineMode = () => {
    if (typeof window === 'undefined') return false;

    const offlineState = localStorage.getItem('wp_offline_state');
    if (offlineState) {
        try {
            const parsed = JSON.parse(offlineState);
            return parsed.isOffline || false;
        } catch {
            return false;
        }
    }

    return !navigator.onLine;
};

// Get cache health information
export const getCacheHealth = () => {
    const stats = getCacheStats();
    const isOffline = isOfflineMode();

    return {
        isOffline,
        cacheSize: stats.total,
        memoryCacheSize: stats.memory.size,
        localStorageSize: stats.localStorage.size,
        offlineContentAvailable: stats.localStorage.size > 0,
        cacheStrategy: CACHE_CONFIG.strategy,
        lastCacheUpdate: stats.memory.keys.length > 0 ? 'recent' : 'none',
    };
};
