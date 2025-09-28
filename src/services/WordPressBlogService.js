/**
 * WordPress Blog Service
 * Handles API communication with WordPress headless blog
 * Includes caching, error handling, and SEO optimization
 */

class WordPressBlogService {
    constructor(options = {}) {
        this.baseURL = options.baseURL || 'https://blog.saraivavision.com.br';
        this.apiEndpoint = '/wp-json/wp/v2';
        this.cacheEnabled = options.cacheEnabled !== false;
        this.cacheTimeout = options.cacheTimeout || 5 * 60 * 1000; // 5 minutes
        this.cache = this.cacheEnabled ? new Map() : null;
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 1000;
    }

    /**
     * Generic API request method with retry logic
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
                const response = await fetch(urlWithParams.toString(), {
                    method: options.method || 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...options.headers
                    },
                    ...options.fetchOptions
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                // Cache successful responses
                if (this.cache && options.method !== 'POST') {
                    this.cache.set(cacheKey, {
                        data,
                        timestamp: Date.now()
                    });
                }

                return data;

            } catch (error) {
                lastError = error;
                console.warn(`WordPress API request failed (attempt ${attempt}/${this.retryAttempts}):`, error.message);

                if (attempt < this.retryAttempts) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }

        throw lastError;
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