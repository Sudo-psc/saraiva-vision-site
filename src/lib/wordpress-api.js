import { executeGraphQLQuery } from './wordpress.js';
import { executeWordPressQueryWithFallback } from './wordpress-health.js';
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
};

// In-memory cache for development (in production, use Redis or similar)
const cache = new Map();

// Cache helper functions
const getCacheKey = (type, params = {}) => {
    const paramString = Object.keys(params).length > 0 ? JSON.stringify(params) : '';
    return `${type}:${paramString}`;
};

const getCachedData = (cacheKey) => {
    const cached = cache.get(cacheKey);
    if (!cached) return null;

    const { data, timestamp, duration } = cached;
    const now = Date.now();

    if (now - timestamp > duration * 1000) {
        cache.delete(cacheKey);
        return null;
    }

    return data;
};

const setCachedData = (cacheKey, data, duration) => {
    cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        duration,
    });
};

// Posts API functions with health monitoring
export const getAllPosts = async (options = {}) => {
    const { first = 10, after = null, useCache = true } = options;
    const cacheKey = getCacheKey('posts', { first, after });

    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const queryFunction = async () => {
        const { data, error } = await executeGraphQLQuery(GET_ALL_POSTS, { first, after });

        if (error) {
            return { posts: [], pageInfo: null, error };
        }

        const result = {
            posts: data.posts.nodes || [],
            pageInfo: data.posts.pageInfo || null,
            error: null,
        };

        if (useCache) {
            setCachedData(cacheKey, result, CACHE_DURATION.POSTS);
        }

        return result;
    };

    // Use health monitoring with fallback
    const healthResult = await executeWordPressQueryWithFallback(queryFunction, 'posts', { first, after });

    if (healthResult.isFallback) {
        return {
            posts: healthResult.data.posts || [],
            pageInfo: null,
            error: healthResult.error,
            isFallback: true,
            healthState: healthResult.healthState,
        };
    }

    return healthResult.data;
};

export const getPostBySlug = async (slug, useCache = true) => {
    const cacheKey = getCacheKey('post', { slug });

    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const { data, error } = await executeGraphQLQuery(GET_POST_BY_SLUG, { slug });

    if (error) {
        return { post: null, error };
    }

    const result = {
        post: data.post || null,
        error: null,
    };

    if (useCache) {
        setCachedData(cacheKey, result, CACHE_DURATION.POSTS);
    }

    return result;
};

export const getRecentPosts = async (first = 3, useCache = true) => {
    const cacheKey = getCacheKey('recent_posts', { first });

    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const queryFunction = async () => {
        const { data, error } = await executeGraphQLQuery(GET_RECENT_POSTS, { first });

        if (error) {
            return { posts: [], error };
        }

        const result = {
            posts: data.posts.nodes || [],
            error: null,
        };

        if (useCache) {
            setCachedData(cacheKey, result, CACHE_DURATION.POSTS);
        }

        return result;
    };

    // Use health monitoring with fallback
    const healthResult = await executeWordPressQueryWithFallback(queryFunction, 'posts', { first });

    if (healthResult.isFallback) {
        return {
            posts: healthResult.data.posts || [],
            error: healthResult.error,
            isFallback: true,
            healthState: healthResult.healthState,
        };
    }

    return healthResult.data;
};

// Pages API functions
export const getAllPages = async (useCache = true) => {
    const cacheKey = getCacheKey('pages');

    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const { data, error } = await executeGraphQLQuery(GET_ALL_PAGES);

    if (error) {
        return { pages: [], error };
    }

    const result = {
        pages: data.pages.nodes || [],
        error: null,
    };

    if (useCache) {
        setCachedData(cacheKey, result, CACHE_DURATION.PAGES);
    }

    return result;
};

export const getPageBySlug = async (slug, useCache = true) => {
    const cacheKey = getCacheKey('page', { slug });

    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const { data, error } = await executeGraphQLQuery(GET_PAGE_BY_SLUG, { slug });

    if (error) {
        return { page: null, error };
    }

    const result = {
        page: data.page || null,
        error: null,
    };

    if (useCache) {
        setCachedData(cacheKey, result, CACHE_DURATION.PAGES);
    }

    return result;
};

// Services API functions
export const getAllServices = async (useCache = true) => {
    const cacheKey = getCacheKey('services');

    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const { data, error } = await executeGraphQLQuery(GET_ALL_SERVICES);

    if (error) {
        return { services: [], error };
    }

    const result = {
        services: data.services.nodes || [],
        error: null,
    };

    if (useCache) {
        setCachedData(cacheKey, result, CACHE_DURATION.SERVICES);
    }

    return result;
};

export const getServiceBySlug = async (slug, useCache = true) => {
    const cacheKey = getCacheKey('service', { slug });

    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const { data, error } = await executeGraphQLQuery(GET_SERVICE_BY_SLUG, { slug });

    if (error) {
        return { service: null, error };
    }

    const result = {
        service: data.service || null,
        error: null,
    };

    if (useCache) {
        setCachedData(cacheKey, result, CACHE_DURATION.SERVICES);
    }

    return result;
};

export const getPopularServices = async (first = 6, useCache = true) => {
    const cacheKey = getCacheKey('popular_services', { first });

    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const { data, error } = await executeGraphQLQuery(GET_POPULAR_SERVICES, { first });

    if (error) {
        return { services: [], error };
    }

    const result = {
        services: data.services.nodes || [],
        error: null,
    };

    if (useCache) {
        setCachedData(cacheKey, result, CACHE_DURATION.SERVICES);
    }

    return result;
};

// Team Members API functions
export const getAllTeamMembers = async (useCache = true) => {
    const cacheKey = getCacheKey('team_members');

    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const { data, error } = await executeGraphQLQuery(GET_ALL_TEAM_MEMBERS);

    if (error) {
        return { teamMembers: [], error };
    }

    const result = {
        teamMembers: data.teamMembers.nodes || [],
        error: null,
    };

    if (useCache) {
        setCachedData(cacheKey, result, CACHE_DURATION.TEAM_MEMBERS);
    }

    return result;
};

export const getTeamMemberBySlug = async (slug, useCache = true) => {
    const cacheKey = getCacheKey('team_member', { slug });

    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const { data, error } = await executeGraphQLQuery(GET_TEAM_MEMBER_BY_SLUG, { slug });

    if (error) {
        return { teamMember: null, error };
    }

    const result = {
        teamMember: data.teamMember || null,
        error: null,
    };

    if (useCache) {
        setCachedData(cacheKey, result, CACHE_DURATION.TEAM_MEMBERS);
    }

    return result;
};

// Testimonials API functions
export const getFeaturedTestimonials = async (first = 6, useCache = true) => {
    const cacheKey = getCacheKey('featured_testimonials', { first });

    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const { data, error } = await executeGraphQLQuery(GET_FEATURED_TESTIMONIALS, { first });

    if (error) {
        return { testimonials: [], error };
    }

    const result = {
        testimonials: data.testimonials.nodes || [],
        error: null,
    };

    if (useCache) {
        setCachedData(cacheKey, result, CACHE_DURATION.TESTIMONIALS);
    }

    return result;
};

export const getAllTestimonials = async (useCache = true) => {
    const cacheKey = getCacheKey('testimonials');

    if (useCache) {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
    }

    const { data, error } = await executeGraphQLQuery(GET_ALL_TESTIMONIALS);

    if (error) {
        return { testimonials: [], error };
    }

    const result = {
        testimonials: data.testimonials.nodes || [],
        error: null,
    };

    if (useCache) {
        setCachedData(cacheKey, result, CACHE_DURATION.TESTIMONIALS);
    }

    return result;
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
        cache.clear();
        return;
    }

    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    }
};

export const getCacheStats = () => {
    return {
        size: cache.size,
        keys: Array.from(cache.keys()),
    };
};
