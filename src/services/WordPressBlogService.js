/**
 * WordPress Blog Service
 * Handles API communication with WordPress headless blog
 * Includes caching, error handling, JWT authentication, and SEO optimization
 */

import WordPressJWTAuthService from './WordPressJWTAuthService.js';
import {
    tokenStorage,
    wordpressEndpoints,
    WordPressAPIError,
    validateWordPressResponse,
    logger,
    isTokenExpired
} from '../lib/wordpress-jwt-utils.js';

class WordPressBlogService {
    constructor(options = {}) {
        this.baseURL = options.baseURL || 'https://cms.saraivavision.com.br';
        this.apiEndpoint = '/wp-json/wp/v2';
        this.cmsBaseURL = options.cmsBaseURL || 'https://cms.saraivavision.com.br';
        this.cacheEnabled = options.cacheEnabled !== false;
        this.cacheTimeout = options.cacheTimeout || 5 * 60 * 1000; // 5 minutes
        this.cache = this.cacheEnabled ? new Map() : null;
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 1000;

        // JWT Authentication
        this.useJWTAuth = options.useJWTAuth !== false;
        this.jwtService = this.useJWTAuth ? new WordPressJWTAuthService({
            baseURL: this.cmsBaseURL,
            credentials: options.jwtCredentials
        }) : null;

        // Try to restore token from storage
        this.initializeAuth();
    }

    /**
     * Initialize authentication from stored tokens
     */
    async initializeAuth() {
        if (!this.useJWTAuth || !this.jwtService) {
            return;
        }

        try {
            // Use the new initializeFromStorage method
            const restored = this.jwtService.initializeFromStorage();
            if (restored) {
                logger.auth('Restored token from storage', { expires: new Date(this.jwtService.tokenExpiry).toISOString() });
            }
        } catch (error) {
            logger.error('Failed to initialize auth', error);
        }
    }

    /**
     * Generic API request method with JWT authentication and retry logic
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${this.apiEndpoint}${endpoint}`;
        const cacheKey = `${endpoint}_${JSON.stringify(options.params || {})}`;

        // Check cache first
        if (this.cache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        // Build URL with parameters
        const urlWithParams = new URL(url);
        if (options.params) {
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    urlWithParams.searchParams.append(key, value);
                }
            });
        }

        let lastError;
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                let headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers
                };

                // Add JWT authentication header if enabled
                if (this.useJWTAuth && this.jwtService) {
                    try {
                        const authHeader = await this.jwtService.getAuthorizationHeader();
                        headers = { ...headers, ...authHeader };
                    } catch (authError) {
                        logger.error('Failed to get auth header', authError);
                        // Continue without auth for public endpoints
                    }
                }

                const response = await fetch(urlWithParams.toString(), {
                    method: options.method || 'GET',
                    headers,
                    ...options.fetchOptions
                });

                // Handle authentication errors
                if (response.status === 401 && this.useJWTAuth && this.jwtService) {
                    logger.auth('Token expired, attempting refresh');
                    try {
                        await this.jwtService.refreshToken();

                        // Store new token
                        const newToken = this.jwtService.getCurrentToken();
                        if (newToken) {
                            tokenStorage.setToken(newToken);
                        }

                        // Retry with fresh token
                        const authHeader = await this.jwtService.getAuthorizationHeader();
                        const retryResponse = await fetch(urlWithParams.toString(), {
                            method: options.method || 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                ...authHeader,
                                ...options.headers
                            },
                            ...options.fetchOptions
                        });

                        if (!retryResponse.ok) {
                            throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
                        }

                        const data = await retryResponse.json();

                        // Cache successful responses
                        if (this.cache && options.method !== 'POST') {
                            this.cache.set(cacheKey, {
                                data,
                                timestamp: Date.now()
                            });
                        }

                        logger.api(options.method || 'GET', endpoint, response.status);
                        return data;
                    } catch (refreshError) {
                        logger.error('Token refresh failed', refreshError);
                        throw refreshError;
                    }
                }

                if (!response.ok) {
                    throw new WordPressAPIError(
                        `HTTP ${response.status}: ${response.statusText}`,
                        response.status,
                        endpoint
                    );
                }

                const data = await response.json();

                // Cache successful responses
                if (this.cache && options.method !== 'POST') {
                    this.cache.set(cacheKey, {
                        data,
                        timestamp: Date.now()
                    });
                }

                logger.api(options.method || 'GET', endpoint, response.status);
                return data;

            } catch (error) {
                lastError = error;
                logger.error(`API request failed (attempt ${attempt}/${this.retryAttempts})`, error);

                if (attempt < this.retryAttempts) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }

        throw lastError;
    }

    /**
     * Make authenticated request to CMS endpoints
     */
    async makeAuthenticatedRequest(endpoint, options = {}) {
        if (!this.useJWTAuth || !this.jwtService) {
            throw new Error('JWT authentication is not enabled');
        }

        return await this.jwtService.makeAuthenticatedRequest(endpoint, options);
    }

    /**
     * Delay utility for retry logic
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get blog posts with pagination and filtering
     */
    async getPosts(options = {}) {
        const params = {
            page: options.page || 1,
            per_page: options.perPage || 10,
            _embed: true, // Include embedded data (author, media, etc.)
            _fields: 'id,date,slug,title,excerpt,content,author,featured_media,categories,tags,_embedded,_links',
            ...options.filters
        };

        if (options.category) {
            params.categories = options.category;
        }

        if (options.search) {
            params.search = options.search;
        }

        if (options.orderby) {
            params.orderby = options.orderby;
            params.order = options.order || 'desc';
        }

        const posts = await this.makeRequest('/posts', { params });

        // Process posts for frontend consumption
        return posts.map(post => this.processPost(post));
    }

    /**
     * Get a single post by slug
     */
    async getPostBySlug(slug) {
        const posts = await this.makeRequest('/posts', {
            params: {
                slug,
                _embed: true,
                _fields: 'id,date,slug,title,excerpt,content,author,featured_media,categories,tags,_embedded,_links'
            }
        });

        if (posts.length === 0) {
            throw new Error(`Post with slug "${slug}" not found`);
        }

        return this.processPost(posts[0]);
    }

    /**
     * Get post by ID
     */
    async getPost(id) {
        const post = await this.makeRequest(`/posts/${id}`, {
            params: {
                _embed: true,
                _fields: 'id,date,slug,title,excerpt,content,author,featured_media,categories,tags,_embedded,_links'
            }
        });

        return this.processPost(post);
    }

    /**
     * Get categories
     */
    async getCategories(options = {}) {
        const params = {
            per_page: options.perPage || 50,
            orderby: 'name',
            order: 'asc',
            hide_empty: true,
            ...options.filters
        };

        return await this.makeRequest('/categories', { params });
    }

    /**
     * Get tags
     */
    async getTags(options = {}) {
        const params = {
            per_page: options.perPage || 50,
            orderby: 'name',
            order: 'asc',
            hide_empty: true,
            ...options.filters
        };

        return await this.makeRequest('/tags', { params });
    }

    /**
     * Search posts
     */
    async searchPosts(query, options = {}) {
        return await this.getPosts({
            search: query,
            ...options
        });
    }

    /**
     * Get related posts based on categories
     */
    async getRelatedPosts(postId, options = {}) {
        // First get the post to find its categories
        const post = await this.getPost(postId);

        if (!post.categories || post.categories.length === 0) {
            return [];
        }

        // Get posts in the same categories
        const relatedPosts = await this.getPosts({
            category: post.categories[0].id,
            perPage: options.limit || 5,
            page: 1
        });

        // Filter out the current post
        return relatedPosts.filter(relatedPost => relatedPost.id !== postId);
    }

    /**
     * Process post data for frontend consumption
     */
    processPost(post) {
        const processed = {
            id: post.id,
            title: post.title?.rendered || '',
            content: post.content?.rendered || '',
            excerpt: post.excerpt?.rendered || '',
            slug: post.slug,
            date: post.date,
            dateFormatted: new Date(post.date).toLocaleDateString('pt-BR'),
            link: `/blog/${post.slug}`,
            categories: [],
            tags: [],
            author: null,
            featuredImage: null,
            seo: this.generateSEOData(post)
        };

        // Process embedded data
        if (post._embedded) {
            // Author
            if (post._embedded.author && post._embedded.author[0]) {
                processed.author = {
                    id: post._embedded.author[0].id,
                    name: post._embedded.author[0].name,
                    description: post._embedded.author[0].description,
                    avatar: post._embedded.author[0].avatar_urls?.['96'] || null
                };
            }

            // Featured image
            if (post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
                const media = post._embedded['wp:featuredmedia'][0];
                processed.featuredImage = {
                    id: media.id,
                    url: media.source_url,
                    alt: media.alt_text || processed.title,
                    sizes: media.media_details?.sizes || {},
                    caption: media.caption?.rendered || ''
                };
            }

            // Categories
            if (post._embedded['wp:term']) {
                post._embedded['wp:term'].forEach(termGroup => {
                    termGroup.forEach(term => {
                        if (term.taxonomy === 'category') {
                            processed.categories.push({
                                id: term.id,
                                name: term.name,
                                slug: term.slug,
                                description: term.description
                            });
                        } else if (term.taxonomy === 'post_tag') {
                            processed.tags.push({
                                id: term.id,
                                name: term.name,
                                slug: term.slug,
                                description: term.description
                            });
                        }
                    });
                });
            }
        }

        return processed;
    }

    /**
     * Generate SEO data for a post
     */
    generateSEOData(post) {
        const title = post.title?.rendered || '';
        const excerpt = post.excerpt?.rendered || '';
        const cleanExcerpt = excerpt.replace(/<[^>]*>/g, '').substring(0, 160);

        return {
            title: `${title} | Blog Saraiva Vision`,
            description: cleanExcerpt,
            canonical: `https://saraivavision.com.br/blog/${post.slug}`,
            ogTitle: title,
            ogDescription: cleanExcerpt,
            ogImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
            ogType: 'article',
            ogUrl: `https://saraivavision.com.br/blog/${post.slug}`,
            twitterCard: 'summary_large_image',
            twitterTitle: title,
            twitterDescription: cleanExcerpt,
            twitterImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
            structuredData: {
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                headline: title,
                description: cleanExcerpt,
                author: {
                    '@type': 'Person',
                    name: post._embedded?.author?.[0]?.name || 'Dr. Philipe Saraiva Cruz'
                },
                datePublished: post.date,
                dateModified: post.modified || post.date,
                publisher: {
                    '@type': 'Organization',
                    name: 'Clínica Saraiva Vision',
                    logo: {
                        '@type': 'ImageObject',
                        url: 'https://saraivavision.com.br/img/logo-saraiva-vision.svg'
                    }
                },
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': `https://saraivavision.com.br/blog/${post.slug}`
                },
                image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
            }
        };
    }

    /**
     * Clear cache
     */
    clearCache() {
        if (this.cache) {
            this.cache.clear();
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        if (!this.cache) {
            return { enabled: false };
        }

        return {
            enabled: true,
            size: this.cache.size,
            timeout: this.cacheTimeout
        };
    }

    /**
     * Get authentication status
     */
    getAuthStatus() {
        if (!this.useJWTAuth || !this.jwtService) {
            return {
                enabled: false,
                authenticated: false,
                tokenExpiry: null
            };
        }

        return this.jwtService.getAuthStatus();
    }

    /**
     * Authenticate with WordPress CMS
     */
    async authenticate() {
        if (!this.useJWTAuth || !this.jwtService) {
            throw new Error('JWT authentication is not enabled');
        }

        const token = await this.jwtService.authenticate();
        logger.auth('Authentication successful', { expires: new Date(this.jwtService.tokenExpiry).toISOString() });

        return token;
    }

    /**
     * Get current user information from WordPress
     */
    async getCurrentUser() {
        if (!this.useJWTAuth || !this.jwtService) {
            throw new Error('JWT authentication is not enabled');
        }

        try {
            return await this.jwtService.getCurrentUser();
        } catch (error) {
            logger.error('Failed to get current user', error);
            throw error;
        }
    }

    /**
     * Logout/clear authentication
     */
    async logout() {
        if (this.jwtService) {
            this.jwtService.clearAuth();
        }
        tokenStorage.clearAllTokens();
        logger.auth('Logged out successfully');
    }

    /**
     * Test WordPress JWT connection
     */
    async testConnection() {
        if (!this.useJWTAuth || !this.jwtService) {
            throw new Error('JWT authentication is not enabled');
        }

        return await this.jwtService.testConnection();
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return response.ok;
        } catch (error) {
            console.error('WordPress blog health check failed:', error);
            return false;
        }
    }
}

export default WordPressBlogService;