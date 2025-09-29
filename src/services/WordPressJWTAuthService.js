/**
 * WordPress JWT Authentication Service
 * Handles JWT token acquisition and management for WordPress REST API
 */

class WordPressJWTAuthService {
    constructor(options = {}) {
        this.baseURL = options.baseURL || 'https://cms.saraivavision.com.br';
        this.tokenEndpoint = '/wp-json/jwt-auth/v1/token';
        this.apiEndpoint = '/wp-json/wp/v2';
        this.token = null;
        this.tokenExpiry = null;
        this.credentials = options.credentials || {
            username: process.env.WORDPRESS_JWT_USERNAME,
            password: process.env.WORDPRESS_JWT_PASSWORD
        };
        this.cacheEnabled = options.cacheEnabled !== false;
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 1000;
    }

    /**
     * Authenticate and obtain JWT token
     */
    async authenticate() {
        // Return existing token if still valid
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.token;
        }

        const url = `${this.baseURL}${this.tokenEndpoint}`;

        let lastError;
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        username: this.credentials.username,
                        password: this.credentials.password
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (data.token) {
                    this.token = data.token;
                    // Set token expiry (default 24 hours from WordPress JWT plugin)
                    this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
                    return this.token;
                } else {
                    throw new Error('Token not found in response');
                }

            } catch (error) {
                lastError = error;
                console.warn(`WordPress JWT authentication failed (attempt ${attempt}/${this.retryAttempts}):`, error.message);

                if (attempt < this.retryAttempts) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }

        throw lastError;
    }

    /**
     * Validate current token
     */
    async validateToken() {
        if (!this.token) {
            return false;
        }

        try {
            const response = await fetch(`${this.baseURL}${this.apiEndpoint}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/json'
                }
            });

            return response.ok;
        } catch (error) {
            console.warn('Token validation failed:', error.message);
            return false;
        }
    }

    /**
     * Refresh token by re-authenticating
     */
    async refreshToken() {
        this.token = null;
        this.tokenExpiry = null;
        return await this.authenticate();
    }

    /**
     * Get authorization header for API requests
     */
    async getAuthorizationHeader() {
        if (!this.token || !(await this.validateToken())) {
            await this.authenticate();
        }

        return {
            'Authorization': `Bearer ${this.token}`
        };
    }

    /**
     * Make authenticated API request
     */
    async makeAuthenticatedRequest(endpoint, options = {}) {
        const authHeader = await this.getAuthorizationHeader();
        const url = `${this.baseURL}${this.apiEndpoint}${endpoint}`;

        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...authHeader,
                ...options.headers
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
            ...options.fetchOptions
        });

        if (!response.ok) {
            // Try to refresh token on 401 error
            if (response.status === 401) {
                await this.refreshToken();
                const newAuthHeader = await this.getAuthorizationHeader();

                const retryResponse = await fetch(url, {
                    method: options.method || 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...newAuthHeader,
                        ...options.headers
                    },
                    body: options.body ? JSON.stringify(options.body) : undefined,
                    ...options.fetchOptions
                });

                if (!retryResponse.ok) {
                    throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
                }

                return await retryResponse.json();
            }

            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Clear authentication state
     */
    clearAuth() {
        this.token = null;
        this.tokenExpiry = null;
    }

    /**
     * Check if currently authenticated
     */
    isAuthenticated() {
        return this.token !== null && this.tokenExpiry !== null && Date.now() < this.tokenExpiry;
    }

    /**
     * Delay utility for retry logic
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current token (for debugging/testing)
     */
    getCurrentToken() {
        return this.token;
    }

    /**
     * Get token expiry time
     */
    getTokenExpiry() {
        return this.tokenExpiry;
    }
}

export default WordPressJWTAuthService;