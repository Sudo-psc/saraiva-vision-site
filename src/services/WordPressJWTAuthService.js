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
            username: process.env.VITE_WORDPRESS_JWT_USERNAME || process.env.WORDPRESS_JWT_USERNAME,
            password: process.env.VITE_WORDPRESS_JWT_PASSWORD || process.env.WORDPRESS_JWT_PASSWORD
        };
        this.cacheEnabled = options.cacheEnabled !== false;
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 1000;

        // Import JWT utilities if available
        this.jwtUtils = null;
        if (typeof window !== 'undefined') {
            import('../lib/wordpress-jwt-utils.js').then(utils => {
                this.jwtUtils = utils;
            }).catch(() => {
                console.warn('JWT utilities not available');
            });
        }
    }

    /**
     * Authenticate and obtain JWT token
     */
    async authenticate() {
        // Return existing token if still valid
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.token;
        }

        // Check credentials
        if (!this.credentials.username || !this.credentials.password) {
            throw new Error('WordPress JWT credentials not configured');
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
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.message || response.statusText;
                    throw new Error(`HTTP ${response.status}: ${errorMessage}`);
                }

                const data = await response.json();

                if (data.token) {
                    this.token = data.token;

                    // Parse JWT payload to get expiry
                    if (this.jwtUtils && this.jwtUtils.decodeJWTPayload) {
                        try {
                            const payload = this.jwtUtils.decodeJWTPayload(data.token);
                            if (payload && payload.exp) {
                                this.tokenExpiry = payload.exp * 1000; // Convert to milliseconds
                            } else {
                                // Fallback: default 24 hours from WordPress JWT plugin
                                this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
                            }
                        } catch (error) {
                            console.warn('Failed to decode JWT payload, using default expiry:', error);
                            this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
                        }
                    } else {
                        this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
                    }

                    // Store token in session storage
                    if (typeof window !== 'undefined' && window.sessionStorage) {
                        try {
                            sessionStorage.setItem('wp_jwt_token', data.token);
                            sessionStorage.setItem('wp_jwt_expiry', this.tokenExpiry.toString());
                        } catch (error) {
                            console.warn('Failed to store token in sessionStorage:', error);
                        }
                    }

                    console.log('WordPress JWT authentication successful');
                    return data.token;
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

        // Check expiry first
        if (this.tokenExpiry && Date.now() >= this.tokenExpiry) {
            console.log('Token expired, needs refresh');
            return false;
        }

        try {
            const response = await fetch(`${this.baseURL}${this.apiEndpoint}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                console.log('JWT token validation successful');
                return true;
            } else if (response.status === 401) {
                console.log('JWT token rejected, needs refresh');
                return false;
            } else {
                console.warn(`Token validation failed with status ${response.status}`);
                return false;
            }
        } catch (error) {
            console.warn('Token validation failed:', error.message);
            return false;
        }
    }

    /**
     * Refresh token by re-authenticating
     */
    async refreshToken() {
        console.log('Refreshing JWT token...');

        // Clear existing token
        this.token = null;
        this.tokenExpiry = null;

        // Clear session storage
        if (typeof window !== 'undefined' && window.sessionStorage) {
            try {
                sessionStorage.removeItem('wp_jwt_token');
                sessionStorage.removeItem('wp_jwt_expiry');
            } catch (error) {
                console.warn('Failed to clear token from sessionStorage:', error);
            }
        }

        return await this.authenticate();
    }

    /**
     * Initialize from stored token
     */
    initializeFromStorage() {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            try {
                const storedToken = sessionStorage.getItem('wp_jwt_token');
                const storedExpiry = sessionStorage.getItem('wp_jwt_expiry');

                if (storedToken && storedExpiry) {
                    const expiryTime = parseInt(storedExpiry);

                    if (Date.now() < expiryTime) {
                        this.token = storedToken;
                        this.tokenExpiry = expiryTime;
                        console.log('Restored JWT token from storage');
                        return true;
                    } else {
                        // Token expired, clear storage
                        sessionStorage.removeItem('wp_jwt_token');
                        sessionStorage.removeItem('wp_jwt_expiry');
                        console.log('Stored JWT token expired, cleared storage');
                    }
                }
            } catch (error) {
                console.warn('Failed to restore token from storage:', error);
            }
        }
        return false;
    }

    /**
     * Get authorization header for API requests
     */
    async getAuthorizationHeader() {
        // Try to initialize from storage first
        if (!this.token) {
            this.initializeFromStorage();
        }

        // Validate and refresh if needed
        if (this.token && !(await this.validateToken())) {
            console.log('Token invalid, attempting refresh...');
            await this.refreshToken();
        }

        // Authenticate if no token or refresh failed
        if (!this.token) {
            await this.authenticate();
        }

        if (!this.token) {
            throw new Error('Failed to obtain valid JWT token');
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

        try {
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
                    console.log('Received 401, attempting token refresh...');
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

                    console.log('Request successful after token refresh');
                    return await retryResponse.json();
                }

                // Handle other HTTP errors
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Authenticated request failed for ${endpoint}:`, error.message);
            throw error;
        }
    }

    /**
     * Clear authentication state
     */
    clearAuth() {
        this.token = null;
        this.tokenExpiry = null;

        // Clear session storage
        if (typeof window !== 'undefined' && window.sessionStorage) {
            try {
                sessionStorage.removeItem('wp_jwt_token');
                sessionStorage.removeItem('wp_jwt_expiry');
            } catch (error) {
                console.warn('Failed to clear token from sessionStorage:', error);
            }
        }

        console.log('JWT authentication state cleared');
    }

    /**
     * Check if currently authenticated
     */
    isAuthenticated() {
        return this.token !== null && this.tokenExpiry !== null && Date.now() < this.tokenExpiry;
    }

    /**
     * Get authentication status
     */
    getAuthStatus() {
        return {
            authenticated: this.isAuthenticated(),
            hasToken: !!this.token,
            tokenExpiry: this.tokenExpiry,
            timeToExpiry: this.tokenExpiry ? Math.max(0, this.tokenExpiry - Date.now()) : 0,
            credentialsConfigured: !!(this.credentials.username && this.credentials.password)
        };
    }

    /**
     * Get current user information
     */
    async getCurrentUser() {
        if (!this.isAuthenticated()) {
            await this.authenticate();
        }

        return await this.makeAuthenticatedRequest('/users/me');
    }

    /**
     * Test connection and authentication
     */
    async testConnection() {
        try {
            // Test basic connectivity
            const healthResponse = await fetch(`${this.baseURL}/wp-json/`);
            if (!healthResponse.ok) {
                throw new Error(`WordPress API not accessible: ${healthResponse.status}`);
            }

            // Test authentication
            const authStatus = this.getAuthStatus();
            if (authStatus.authenticated) {
                const user = await this.getCurrentUser();
                return {
                    success: true,
                    message: 'JWT authentication successful',
                    user: user,
                    authStatus: authStatus
                };
            } else {
                // Try to authenticate
                await this.authenticate();
                const user = await this.getCurrentUser();
                return {
                    success: true,
                    message: 'JWT authentication successful after login',
                    user: user,
                    authStatus: this.getAuthStatus()
                };
            }
        } catch (error) {
            return {
                success: false,
                message: `JWT authentication test failed: ${error.message}`,
                error: error.message,
                authStatus: this.getAuthStatus()
            };
        }
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

    /**
     * Get token time remaining in human readable format
     */
    getTokenTimeRemaining() {
        if (!this.tokenExpiry) {
            return 'No token';
        }

        const remaining = Math.max(0, this.tokenExpiry - Date.now());
        const minutes = Math.floor(remaining / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''}`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
            return 'Less than 1 minute';
        }
    }
}

export default WordPressJWTAuthService;