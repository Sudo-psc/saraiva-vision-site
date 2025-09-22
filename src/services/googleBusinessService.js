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
}

export default GoogleBusinessService;