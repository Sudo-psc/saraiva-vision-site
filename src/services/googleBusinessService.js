import CryptoJS from 'crypto-js';

/**
 * Google Business API Service
 * Handles all interactions with Google My Business API v4
 */
class GoogleBusinessService {
    constructor() {
        this.baseURL = 'https://mybusiness.googleapis.com/v4';
        this.apiKey = null;
        this.accessToken = null;
        this.rateLimitRemaining = 1000;
        this.rateLimitReset = null;
        this.requestTimeout = 10000; // 10 seconds
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second base delay
    }

    /**
     * Initialize the service with encrypted credentials
     * @param {string} encryptedCredentials - Encrypted API credentials
     * @param {string} encryptionKey - Key for decryption
     */
    async initialize(encryptedCredentials, encryptionKey) {
        try {
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedCredentials, encryptionKey);
            const credentials = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

            this.apiKey = credentials.apiKey;
            this.accessToken = credentials.accessToken;

            // Validate credentials
            await this.validateCredentials();

            console.log('Google Business Service initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Google Business Service:', error);
            throw new Error('Invalid credentials or encryption key');
        }
    }

    /**
     * Authenticate with Google My Business API
     */
    async authenticateAPI() {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        try {
            // Test authentication with a simple API call
            const response = await this.makeRequest('/accounts', 'GET');

            if (response.ok) {
                console.log('Google Business API authentication successful');
                return true;
            } else {
                throw new Error(`Authentication failed: ${response.status}`);
            }
        } catch (error) {
            console.error('Google Business API authentication failed:', error);
            throw error;
        }
    }

    /**
     * Validate API credentials
     */
    async validateCredentials() {
        if (!this.apiKey || !this.accessToken) {
            throw new Error('Missing API credentials');
        }

        // Basic format validation
        if (typeof this.apiKey !== 'string' || this.apiKey.length < 10) {
            throw new Error('Invalid API key format');
        }

        if (typeof this.accessToken !== 'string' || this.accessToken.length < 10) {
            throw new Error('Invalid access token format');
        }

        return true;
    }

    /**
     * Make authenticated request to Google My Business API
     * @param {string} endpoint - API endpoint
     * @param {string} method - HTTP method
     * @param {Object} data - Request data
     * @param {Object} options - Additional options
     */
    async makeRequest(endpoint, method = 'GET', data = null, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            ...options.headers
        };

        const requestOptions = {
            method,
            headers,
            signal: AbortSignal.timeout(this.requestTimeout)
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            requestOptions.body = JSON.stringify(data);
        }

        let lastError;

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                // Check rate limit before making request
                await this.checkRateLimit();

                const response = await fetch(url, requestOptions);

                // Update rate limit info from headers
                this.updateRateLimitInfo(response);

                if (response.ok) {
                    const responseData = await response.json();
                    return {
                        ok: true,
                        status: response.status,
                        data: responseData
                    };
                }

                // Handle specific error cases
                if (response.status === 401) {
                    throw new Error('Authentication failed - invalid credentials');
                }

                if (response.status === 403) {
                    throw new Error('Access forbidden - check API permissions');
                }

                if (response.status === 429) {
                    // Rate limit exceeded
                    await this.handleRateLimit(response);
                    continue; // Retry after rate limit handling
                }

                if (response.status >= 500) {
                    // Server error - retry with exponential backoff
                    const delay = this.retryDelay * Math.pow(2, attempt);
                    await this.sleep(delay);
                    continue;
                }

                // Client error - don't retry
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API request failed: ${response.status} - ${errorData.message || 'Unknown error'}`);

            } catch (error) {
                lastError = error;

                if (error.name === 'AbortError') {
                    throw new Error('Request timeout - API response took too long');
                }

                if (attempt === this.maxRetries - 1) {
                    break; // Don't retry on last attempt
                }

                // Exponential backoff for retries
                const delay = this.retryDelay * Math.pow(2, attempt);
                await this.sleep(delay);
            }
        }

        throw lastError || new Error('Request failed after all retry attempts');
    }

    /**
     * Check if we're within rate limits
     */
    async checkRateLimit() {
        if (this.rateLimitRemaining <= 0 && this.rateLimitReset) {
            const now = Date.now();
            const resetTime = new Date(this.rateLimitReset).getTime();

            if (now < resetTime) {
                const waitTime = resetTime - now;
                console.warn(`Rate limit exceeded. Waiting ${waitTime}ms until reset.`);
                await this.sleep(waitTime);
            }
        }
    }

    /**
     * Handle rate limit exceeded response
     * @param {Response} response - HTTP response object
     */
    async handleRateLimit(response) {
        const retryAfter = response.headers.get('Retry-After');
        const resetTime = response.headers.get('X-RateLimit-Reset');

        let waitTime = 60000; // Default 1 minute

        if (retryAfter) {
            waitTime = parseInt(retryAfter) * 1000;
        } else if (resetTime) {
            waitTime = new Date(resetTime).getTime() - Date.now();
        }

        console.warn(`Rate limit exceeded. Waiting ${waitTime}ms before retry.`);
        await this.sleep(waitTime);
    }

    /**
     * Update rate limit information from response headers
     * @param {Response} response - HTTP response object
     */
    updateRateLimitInfo(response) {
        const remaining = response.headers.get('X-RateLimit-Remaining');
        const reset = response.headers.get('X-RateLimit-Reset');

        if (remaining !== null) {
            this.rateLimitRemaining = parseInt(remaining);
        }

        if (reset !== null) {
            this.rateLimitReset = reset;
        }
    }

    /**
     * Sleep for specified milliseconds
     * @param {number} ms - Milliseconds to sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current rate limit status
     */
    getRateLimitStatus() {
        return {
            remaining: this.rateLimitRemaining,
            reset: this.rateLimitReset,
            isLimited: this.rateLimitRemaining <= 0
        };
    }

    /**
     * Test API connectivity
     */
    async testConnection() {
        try {
            const response = await this.makeRequest('/accounts', 'GET');
            return {
                success: true,
                status: response.status,
                message: 'API connection successful'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'API connection failed'
            };
        }
    }

    /**
     * Get service health status
     */
    getHealthStatus() {
        return {
            initialized: !!(this.apiKey && this.accessToken),
            rateLimitStatus: this.getRateLimitStatus(),
            lastError: this.lastError || null,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Fetch reviews for a specific location
     * @param {string} locationId - Google My Business location ID
     * @param {Object} options - Fetch options
     */
    async fetchReviews(locationId, options = {}) {
        if (!locationId) {
            throw new Error('Location ID is required');
        }

        // Validate location ID format
        if (!locationId.includes('accounts/') || !locationId.includes('locations/')) {
            throw new Error('Invalid location ID format. Expected: accounts/{accountId}/locations/{locationId}');
        }

        const {
            pageSize = 50,
            pageToken = null,
            orderBy = 'updateTime desc',
            filter = null
        } = options;

        const endpoint = `/${locationId}/reviews`;
        const queryParams = new URLSearchParams();

        if (pageSize) queryParams.append('pageSize', pageSize.toString());
        if (pageToken) queryParams.append('pageToken', pageToken);
        if (orderBy) queryParams.append('orderBy', orderBy);
        if (filter) queryParams.append('filter', filter);

        const fullEndpoint = queryParams.toString()
            ? `${endpoint}?${queryParams.toString()}`
            : endpoint;

        try {
            const response = await this.makeRequest(fullEndpoint, 'GET');

            if (response.ok) {
                return {
                    success: true,
                    reviews: response.data.reviews || [],
                    nextPageToken: response.data.nextPageToken || null,
                    totalSize: response.data.totalSize || 0,
                    averageRating: response.data.averageRating || 0,
                    fetchedAt: new Date().toISOString()
                };
            }

            throw new Error(`Failed to fetch reviews: ${response.status}`);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return {
                success: false,
                error: error.message,
                reviews: [],
                fetchedAt: new Date().toISOString()
            };
        }
    }

    /**
     * Fetch business information including overall rating
     * @param {string} locationId - Google My Business location ID
     */
    async fetchBusinessInfo(locationId) {
        if (!locationId) {
            throw new Error('Location ID is required');
        }

        const endpoint = `/${locationId}`;
        const queryParams = new URLSearchParams();
        queryParams.append('readMask', 'name,storeCode,displayName,websiteUri,regularHours,specialHours,phoneNumbers,categories,storefrontAddress,serviceArea,labels,adWordsLocationExtensions,latlng,openInfo,metadata');

        const fullEndpoint = `${endpoint}?${queryParams.toString()}`;

        try {
            const response = await this.makeRequest(fullEndpoint, 'GET');

            if (response.ok) {
                return {
                    success: true,
                    businessInfo: response.data,
                    fetchedAt: new Date().toISOString()
                };
            }

            throw new Error(`Failed to fetch business info: ${response.status}`);
        } catch (error) {
            console.error('Error fetching business info:', error);
            return {
                success: false,
                error: error.message,
                businessInfo: null,
                fetchedAt: new Date().toISOString()
            };
        }
    }

    /**
     * Get review statistics for a location
     * @param {string} locationId - Google My Business location ID
     */
    async getReviewStats(locationId) {
        try {
            // Fetch reviews to calculate statistics
            const reviewsResponse = await this.fetchReviews(locationId, {
                pageSize: 50,
                orderBy: 'updateTime desc'
            });

            if (!reviewsResponse.success) {
                return {
                    success: false,
                    error: reviewsResponse.error,
                    stats: null
                };
            }

            const reviews = reviewsResponse.reviews;
            const stats = this.calculateReviewStats(reviews);

            return {
                success: true,
                stats: {
                    ...stats,
                    totalReviews: reviewsResponse.totalSize || reviews.length,
                    averageRating: reviewsResponse.averageRating || stats.averageRating,
                    lastUpdated: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error getting review stats:', error);
            return {
                success: false,
                error: error.message,
                stats: null
            };
        }
    }

    /**
     * Calculate statistics from review data
     * @param {Array} reviews - Array of review objects
     */
    calculateReviewStats(reviews) {
        if (!reviews || reviews.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                recentReviews: 0,
                responseRate: 0
            };
        }

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let totalRating = 0;
        let reviewsWithResponses = 0;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        let recentReviews = 0;

        reviews.forEach(review => {
            const rating = this.parseStarRating(review.starRating);
            if (rating >= 1 && rating <= 5) {
                ratingDistribution[rating]++;
                totalRating += rating;
            }

            if (review.reviewReply && review.reviewReply.comment) {
                reviewsWithResponses++;
            }

            const reviewDate = new Date(review.createTime);
            if (reviewDate >= thirtyDaysAgo) {
                recentReviews++;
            }
        });

        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        const responseRate = reviews.length > 0 ? (reviewsWithResponses / reviews.length) * 100 : 0;

        return {
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            totalReviews: reviews.length,
            ratingDistribution,
            recentReviews,
            responseRate: Math.round(responseRate * 10) / 10
        };
    }

    /**
     * Parse star rating from Google's enum format
     * @param {string} starRating - Star rating enum (ONE, TWO, THREE, FOUR, FIVE)
     */
    parseStarRating(starRating) {
        const ratingMap = {
            'ONE': 1,
            'TWO': 2,
            'THREE': 3,
            'FOUR': 4,
            'FIVE': 5
        };

        return ratingMap[starRating] || 0;
    }

    /**
     * Parse and validate review data
     * @param {Object} rawReview - Raw review data from API
     */
    parseReviewData(rawReview) {
        if (!rawReview) {
            return null;
        }

        try {
            return {
                id: rawReview.name || rawReview.reviewId || null,
                reviewId: rawReview.reviewId || null,
                reviewer: {
                    displayName: rawReview.reviewer?.displayName || 'Anonymous',
                    profilePhotoUrl: rawReview.reviewer?.profilePhotoUrl || null,
                    isAnonymous: rawReview.reviewer?.isAnonymous || false
                },
                starRating: this.parseStarRating(rawReview.starRating),
                comment: rawReview.comment || '',
                createTime: rawReview.createTime || null,
                updateTime: rawReview.updateTime || null,
                reviewReply: rawReview.reviewReply ? {
                    comment: rawReview.reviewReply.comment || '',
                    updateTime: rawReview.reviewReply.updateTime || null
                } : null,
                // Additional metadata
                isRecent: this.isRecentReview(rawReview.createTime),
                hasResponse: !!(rawReview.reviewReply && rawReview.reviewReply.comment),
                wordCount: rawReview.comment ? rawReview.comment.split(' ').length : 0
            };
        } catch (error) {
            console.error('Error parsing review data:', error);
            return null;
        }
    }

    /**
     * Check if a review is recent (within last 30 days)
     * @param {string} createTime - Review creation timestamp
     */
    isRecentReview(createTime) {
        if (!createTime) return false;

        try {
            const reviewDate = new Date(createTime);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            return reviewDate >= thirtyDaysAgo;
        } catch (error) {
            return false;
        }
    }

    /**
     * Fetch reviews with pagination support
     * @param {string} locationId - Google My Business location ID
     * @param {Object} options - Pagination and filtering options
     */
    async fetchAllReviews(locationId, options = {}) {
        const {
            maxReviews = 50,
            minRating = 1,
            includeReplies = true,
            sortBy = 'newest',
            dateRange = null, // { start: Date, end: Date }
            keywords = null, // Array of keywords to filter by
            excludeAnonymous = false,
            onProgress = null // Progress callback function
        } = options;

        let allReviews = [];
        let nextPageToken = null;
        let totalFetched = 0;
        let totalProcessed = 0;

        const orderByMap = {
            'newest': 'updateTime desc',
            'oldest': 'updateTime asc',
            'highest': 'starRating desc',
            'lowest': 'starRating asc'
        };

        try {
            do {
                const response = await this.fetchReviews(locationId, {
                    pageSize: Math.min(50, maxReviews - totalFetched),
                    pageToken: nextPageToken,
                    orderBy: orderByMap[sortBy] || 'updateTime desc'
                });

                if (!response.success) {
                    throw new Error(response.error);
                }

                // Parse and filter reviews
                const parsedReviews = response.reviews
                    .map(review => this.parseReviewData(review))
                    .filter(review => {
                        if (!review) return false;

                        // Rating filter
                        if (review.starRating < minRating) return false;

                        // Date range filter
                        if (dateRange && review.createTime) {
                            const reviewDate = new Date(review.createTime);
                            if (dateRange.start && reviewDate < dateRange.start) return false;
                            if (dateRange.end && reviewDate > dateRange.end) return false;
                        }

                        // Keywords filter
                        if (keywords && keywords.length > 0) {
                            const reviewText = (review.comment || '').toLowerCase();
                            const hasKeyword = keywords.some(keyword =>
                                reviewText.includes(keyword.toLowerCase())
                            );
                            if (!hasKeyword) return false;
                        }

                        // Anonymous filter
                        if (excludeAnonymous && review.reviewer.isAnonymous) return false;

                        return true;
                    });

                allReviews = allReviews.concat(parsedReviews);
                totalFetched += parsedReviews.length;
                totalProcessed += response.reviews.length;
                nextPageToken = response.nextPageToken;

                // Call progress callback if provided
                if (onProgress && typeof onProgress === 'function') {
                    onProgress({
                        totalFetched,
                        totalProcessed,
                        hasMore: !!nextPageToken,
                        currentBatch: parsedReviews.length
                    });
                }

            } while (nextPageToken && totalFetched < maxReviews);

            return {
                success: true,
                reviews: allReviews.slice(0, maxReviews),
                totalFetched: totalFetched,
                totalProcessed: totalProcessed,
                hasMore: !!nextPageToken,
                fetchedAt: new Date().toISOString(),
                metadata: {
                    appliedFilters: {
                        minRating,
                        dateRange,
                        keywords,
                        excludeAnonymous
                    },
                    sortBy
                }
            };

        } catch (error) {
            console.error('Error fetching all reviews:', error);
            return {
                success: false,
                error: error.message,
                reviews: allReviews, // Return what we have so far
                totalFetched: totalFetched,
                totalProcessed: totalProcessed,
                hasMore: false,
                fetchedAt: new Date().toISOString()
            };
        }
    }

    /**
     * Filter reviews based on criteria
     * @param {Array} reviews - Array of review objects
     * @param {Object} filters - Filter criteria
     */
    filterReviews(reviews, filters = {}) {
        if (!reviews || reviews.length === 0) {
            return [];
        }

        const {
            minRating = 1,
            maxRating = 5,
            hasResponse = null,
            isRecent = null,
            minWordCount = 0,
            keywords = null,
            excludeAnonymous = false,
            dateRange = null,
            sentiment = null, // 'positive', 'negative', 'neutral'
            hasImages = null,
            reviewerType = null // 'verified', 'local_guide', 'regular'
        } = filters;

        return reviews.filter(review => {
            // Rating filter
            if (review.starRating < minRating || review.starRating > maxRating) {
                return false;
            }

            // Response filter
            if (hasResponse !== null && review.hasResponse !== hasResponse) {
                return false;
            }

            // Recent filter
            if (isRecent !== null && review.isRecent !== isRecent) {
                return false;
            }

            // Word count filter
            if (review.wordCount < minWordCount) {
                return false;
            }

            // Anonymous filter
            if (excludeAnonymous && review.reviewer.isAnonymous) {
                return false;
            }

            // Date range filter
            if (dateRange && review.createTime) {
                const reviewDate = new Date(review.createTime);
                if (dateRange.start && reviewDate < dateRange.start) {
                    return false;
                }
                if (dateRange.end && reviewDate > dateRange.end) {
                    return false;
                }
            }

            // Sentiment filter (basic implementation)
            if (sentiment !== null) {
                const reviewSentiment = this.analyzeSentiment(review);
                if (reviewSentiment !== sentiment) {
                    return false;
                }
            }

            // Keywords filter
            if (keywords && keywords.length > 0) {
                const reviewText = (review.comment || '').toLowerCase();
                const hasKeyword = keywords.some(keyword =>
                    reviewText.includes(keyword.toLowerCase())
                );
                if (!hasKeyword) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Analyze sentiment of a review (basic implementation)
     * @param {Object} review - Review object
     * @returns {string} - 'positive', 'negative', or 'neutral'
     */
    analyzeSentiment(review) {
        if (!review.comment) return 'neutral';

        const comment = review.comment.toLowerCase();

        // Simple keyword-based sentiment analysis
        const positiveWords = [
            'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect',
            'love', 'best', 'awesome', 'outstanding', 'superb', 'brilliant',
            'good', 'nice', 'happy', 'satisfied', 'recommend', 'impressed'
        ];

        const negativeWords = [
            'terrible', 'awful', 'horrible', 'worst', 'bad', 'poor', 'disappointing',
            'hate', 'disgusting', 'rude', 'slow', 'expensive', 'dirty', 'unprofessional',
            'never', 'avoid', 'waste', 'regret', 'complaint', 'problem'
        ];

        let positiveScore = 0;
        let negativeScore = 0;

        positiveWords.forEach(word => {
            if (comment.includes(word)) positiveScore++;
        });

        negativeWords.forEach(word => {
            if (comment.includes(word)) negativeScore++;
        });

        // Factor in star rating
        if (review.starRating >= 4) positiveScore += 2;
        if (review.starRating <= 2) negativeScore += 2;

        if (positiveScore > negativeScore) return 'positive';
        if (negativeScore > positiveScore) return 'negative';
        return 'neutral';
    }

    /**
     * Fetch reviews with advanced batch processing
     * @param {string} locationId - Google My Business location ID
     * @param {Object} options - Advanced options
     */
    async fetchReviewsBatch(locationId, options = {}) {
        const {
            batchSize = 20,
            maxBatches = 5,
            delayBetweenBatches = 1000, // ms
            filters = {},
            onBatchComplete = null,
            onError = null
        } = options;

        const results = {
            batches: [],
            totalReviews: 0,
            totalBatches: 0,
            errors: [],
            startTime: new Date().toISOString(),
            endTime: null
        };

        try {
            let nextPageToken = null;
            let batchCount = 0;

            do {
                batchCount++;
                const batchStartTime = Date.now();

                try {
                    const response = await this.fetchReviews(locationId, {
                        pageSize: batchSize,
                        pageToken: nextPageToken,
                        orderBy: 'updateTime desc'
                    });

                    if (!response.success) {
                        throw new Error(response.error);
                    }

                    // Parse and filter reviews
                    const parsedReviews = response.reviews
                        .map(review => this.parseReviewData(review))
                        .filter(review => review !== null);

                    const filteredReviews = this.filterReviews(parsedReviews, filters);

                    const batchResult = {
                        batchNumber: batchCount,
                        reviews: filteredReviews,
                        rawCount: response.reviews.length,
                        filteredCount: filteredReviews.length,
                        processingTime: Date.now() - batchStartTime,
                        nextPageToken: response.nextPageToken,
                        timestamp: new Date().toISOString()
                    };

                    results.batches.push(batchResult);
                    results.totalReviews += filteredReviews.length;
                    results.totalBatches = batchCount;

                    // Call batch complete callback
                    if (onBatchComplete && typeof onBatchComplete === 'function') {
                        onBatchComplete(batchResult, results);
                    }

                    nextPageToken = response.nextPageToken;

                    // Delay between batches to respect rate limits
                    if (nextPageToken && batchCount < maxBatches && delayBetweenBatches > 0) {
                        await this.sleep(delayBetweenBatches);
                    }

                } catch (batchError) {
                    const errorInfo = {
                        batchNumber: batchCount,
                        error: batchError.message,
                        timestamp: new Date().toISOString()
                    };

                    results.errors.push(errorInfo);

                    if (onError && typeof onError === 'function') {
                        onError(errorInfo, results);
                    }

                    // Continue with next batch unless it's a critical error
                    if (batchError.message.includes('Authentication') ||
                        batchError.message.includes('forbidden')) {
                        break;
                    }
                }

            } while (nextPageToken && batchCount < maxBatches);

            results.endTime = new Date().toISOString();
            results.totalProcessingTime = new Date(results.endTime) - new Date(results.startTime);

            return {
                success: results.errors.length === 0,
                results,
                summary: {
                    totalReviews: results.totalReviews,
                    totalBatches: results.totalBatches,
                    errorCount: results.errors.length,
                    averageProcessingTime: results.batches.length > 0
                        ? results.batches.reduce((sum, batch) => sum + batch.processingTime, 0) / results.batches.length
                        : 0
                }
            };

        } catch (error) {
            results.endTime = new Date().toISOString();
            results.errors.push({
                error: error.message,
                timestamp: results.endTime,
                critical: true
            });

            return {
                success: false,
                results,
                error: error.message
            };
        }
    }
}

export default GoogleBusinessService;