/**
 * Google Business API Service
 * Handles all interactions with Google My Business API v4
 */

import { googleBusinessConfig } from '../config/googleBusinessEnv.js';

class GoogleBusinessApiService {
    constructor() {
        this.baseUrl = 'https://mybusiness.googleapis.com/v4';
        this.accessToken = null;
        this.tokenExpiry = null;
        this.rateLimitRemaining = 1000;
        this.rateLimitReset = null;
    }

    /**
     * Authenticate with Google My Business API
     * @returns {Promise<boolean>} Authentication success status
     */
    async authenticateAPI() {
        try {
            const credentials = await googleBusinessConfig.getCredentials();

            if (!credentials.clientId || !credentials.clientSecret || !credentials.refreshToken) {
                throw new Error('Missing required Google API credentials');
            }

            const tokenResponse = await this._refreshAccessToken(credentials);

            this.accessToken = tokenResponse.access_token;
            this.tokenExpiry = Date.now() + (tokenResponse.expires_in * 1000);

            return true;
        } catch (error) {
            console.error('Google Business API authentication failed:', error);
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    /**
     * Refresh OAuth2 access token
     * @private
     */
    async _refreshAccessToken(credentials) {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: credentials.clientId,
                client_secret: credentials.clientSecret,
                refresh_token: credentials.refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Token refresh failed: ${errorData.error_description || response.statusText}`);
        }

        return response.json();
    }

    /**
     * Make authenticated request to Google My Business API
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} API response
     */
    async makeRequest(endpoint, options = {}) {
        await this._ensureValidToken();

        const url = `${this.baseUrl}${endpoint}`;
        const requestOptions = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
            timeout: 10000, // 10 second timeout
            ...options,
        };

        try {
            const response = await this._fetchWithTimeout(url, requestOptions);

            // Update rate limit info from headers
            this._updateRateLimitInfo(response);

            if (!response.ok) {
                await this._handleApiError(response);
            }

            return response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout: API took too long to respond');
            }
            throw error;
        }
    }

    /**
     * Fetch with timeout support
     * @private
     */
    async _fetchWithTimeout(url, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * Ensure access token is valid and refresh if needed
     * @private
     */
    async _ensureValidToken() {
        if (!this.accessToken || Date.now() >= this.tokenExpiry - 60000) { // Refresh 1 minute before expiry
            await this.authenticateAPI();
        }
    }

    /**
     * Update rate limit information from response headers
     * @private
     */
    _updateRateLimitInfo(response) {
        if (response.headers && typeof response.headers.get === 'function') {
            const remaining = response.headers.get('X-RateLimit-Remaining');
            const reset = response.headers.get('X-RateLimit-Reset');

            if (remaining) this.rateLimitRemaining = parseInt(remaining, 10);
            if (reset) this.rateLimitReset = new Date(reset);
        }
    }

    /**
     * Handle API errors with appropriate retry logic
     * @private
     */
    async _handleApiError(response) {
        const errorData = await response.json().catch(() => ({}));

        switch (response.status) {
            case 401:
                // Unauthorized - try to re-authenticate once
                this.accessToken = null;
                throw new Error('Authentication failed - invalid or expired token');

            case 403:
                if (errorData.error?.message?.includes('quota')) {
                    throw new Error('API quota exceeded - please try again later');
                }
                throw new Error(`Access forbidden: ${errorData.error?.message || 'Insufficient permissions'}`);

            case 429:
                // Rate limit exceeded
                const retryAfter = response.headers.get('Retry-After') || '60';
                throw new Error(`Rate limit exceeded - retry after ${retryAfter} seconds`);

            case 500:
            case 502:
            case 503:
            case 504:
                throw new Error('Google API server error - please try again later');

            default:
                throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
        }
    }

    /**
     * Handle rate limiting with exponential backoff
     * @param {number} attempt - Current attempt number
     * @returns {Promise<void>}
     */
    async handleRateLimit(attempt = 1) {
        if (this.rateLimitRemaining <= 10) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
            console.warn(`Rate limit approaching, waiting ${delay}ms before retry`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    /**
     * Get current rate limit status
     * @returns {Object} Rate limit information
     */
    getRateLimitStatus() {
        return {
            remaining: this.rateLimitRemaining,
            resetTime: this.rateLimitReset,
            isNearLimit: this.rateLimitRemaining <= 50,
        };
    }

    /**
     * Check if API is properly authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        return this.accessToken && Date.now() < this.tokenExpiry - 60000;
    }
}

export default GoogleBusinessApiService;