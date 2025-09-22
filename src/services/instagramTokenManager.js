/**
 * Instagram Token Manager Service
 * Handles secure token storage, rotation, and validation
 */

class InstagramTokenManager {
    constructor() {
        this.tokens = new Map(); // Store tokens securely
        this.tokenMetadata = new Map(); // Store token metadata
        this.refreshCallbacks = new Map(); // Token refresh callbacks
        this.encryptionKey = null; // Encryption key for token storage
        this.isInitialized = false;

        // Token configuration
        this.config = {
            tokenRefreshThreshold: 7 * 24 * 60 * 60 * 1000, // 7 days before expiry
            maxTokenAge: 60 * 24 * 60 * 60 * 1000, // 60 days max age
            encryptTokens: true,
            validateTokens: true,
            autoRefresh: true
        };

        // Initialize the service
        this.initialize();
    }

    /**
     * Initialize the token manager
     */
    async initialize() {
        try {
            // Generate or load encryption key
            await this.initializeEncryption();

            // Load existing tokens from secure storage
            await this.loadTokensFromStorage();

            // Start token validation and refresh cycle
            this.startTokenMaintenanceCycle();

            this.isInitialized = true;
            console.log('Instagram Token Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Instagram Token Manager:', error);
            throw error;
        }
    }

    /**
     * Initialize encryption for token storage
     */
    async initializeEncryption() {
        if (!this.config.encryptTokens) {
            return;
        }

        try {
            // In a real implementation, this would use a proper key management system
            // For demo purposes, we'll use a simple approach
            const storedKey = this.getStoredEncryptionKey();

            if (storedKey) {
                this.encryptionKey = storedKey;
            } else {
                this.encryptionKey = this.generateEncryptionKey();
                this.storeEncryptionKey(this.encryptionKey);
            }
        } catch (error) {
            console.warn('Failed to initialize encryption, tokens will be stored unencrypted:', error);
            this.config.encryptTokens = false;
        }
    }

    /**
     * Generate encryption key
     */
    generateEncryptionKey() {
        // In production, use proper cryptographic key generation
        const array = new Uint8Array(32);
        if (typeof window !== 'undefined' && window.crypto) {
            window.crypto.getRandomValues(array);
        } else {
            // Fallback for Node.js environment
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
        }
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Store token securely
     */
    async storeToken(tokenType, tokenData, options = {}) {
        const {
            userId = 'default',
            expiresAt = null,
            scopes = [],
            metadata = {}
        } = options;

        if (!this.isInitialized) {
            throw new Error('Token manager not initialized');
        }

        // Validate token data
        const validation = this.validateTokenData(tokenData);
        if (!validation.isValid) {
            throw new Error(`Invalid token data: ${validation.errors.join(', ')}`);
        }

        const tokenId = this.generateTokenId(tokenType, userId);
        const now = Date.now();

        // Encrypt token if encryption is enabled
        const encryptedToken = this.config.encryptTokens ?
            this.encryptToken(tokenData) : tokenData;

        // Store token
        this.tokens.set(tokenId, {
            tokenType,
            userId,
            token: encryptedToken,
            encrypted: this.config.encryptTokens,
            createdAt: now,
            updatedAt: now,
            expiresAt,
            lastUsed: null,
            usageCount: 0
        });

        // Store metadata
        this.tokenMetadata.set(tokenId, {
            scopes,
            metadata,
            isValid: true,
            lastValidated: now,
            refreshAttempts: 0,
            errors: []
        });

        // Persist to storage
        await this.persistTokenToStorage(tokenId);

        console.log(`Token stored successfully: ${tokenType} for user ${userId}`);
        return tokenId;
    }

    /**
     * Retrieve token
     */
    async getToken(tokenType, userId = 'default') {
        if (!this.isInitialized) {
            throw new Error('Token manager not initialized');
        }

        const tokenId = this.generateTokenId(tokenType, userId);
        const tokenData = this.tokens.get(tokenId);

        if (!tokenData) {
            throw new Error(`Token not found: ${tokenType} for user ${userId}`);
        }

        // Check if token is expired
        if (this.isTokenExpired(tokenData)) {
            throw new Error(`Token expired: ${tokenType} for user ${userId}`);
        }

        // Update usage statistics
        tokenData.lastUsed = Date.now();
        tokenData.usageCount++;

        // Decrypt token if encrypted
        const token = tokenData.encrypted ?
            this.decryptToken(tokenData.token) : tokenData.token;

        // Validate token if validation is enabled
        if (this.config.validateTokens) {
            const isValid = await this.validateToken(token, tokenType);
            if (!isValid) {
                throw new Error(`Token validation failed: ${tokenType} for user ${userId}`);
            }
        }

        return {
            token,
            tokenType,
            userId,
            expiresAt: tokenData.expiresAt,
            metadata: this.tokenMetadata.get(tokenId)
        };
    }

    /**
     * Refresh token
     */
    async refreshToken(tokenType, userId = 'default', refreshTokenData = null) {
        if (!this.isInitialized) {
            throw new Error('Token manager not initialized');
        }

        const tokenId = this.generateTokenId(tokenType, userId);
        const tokenData = this.tokens.get(tokenId);
        const metadata = this.tokenMetadata.get(tokenId);

        if (!tokenData) {
            throw new Error(`Token not found for refresh: ${tokenType} for user ${userId}`);
        }

        try {
            metadata.refreshAttempts++;

            // Call refresh callback if registered
            const refreshCallback = this.refreshCallbacks.get(tokenType);
            if (refreshCallback) {
                const currentToken = tokenData.encrypted ?
                    this.decryptToken(tokenData.token) : tokenData.token;

                const newTokenData = await refreshCallback(currentToken, refreshTokenData);

                // Update token with new data
                const encryptedToken = this.config.encryptTokens ?
                    this.encryptToken(newTokenData.accessToken) : newTokenData.accessToken;

                tokenData.token = encryptedToken;
                tokenData.updatedAt = Date.now();
                tokenData.expiresAt = newTokenData.expiresAt;

                // Update metadata
                metadata.lastValidated = Date.now();
                metadata.isValid = true;
                metadata.errors = [];

                // Persist changes
                await this.persistTokenToStorage(tokenId);

                console.log(`Token refreshed successfully: ${tokenType} for user ${userId}`);
                return true;
            } else {
                throw new Error(`No refresh callback registered for token type: ${tokenType}`);
            }
        } catch (error) {
            metadata.errors.push({
                timestamp: Date.now(),
                error: error.message,
                type: 'refresh-failed'
            });

            console.error(`Token refresh failed: ${tokenType} for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Register token refresh callback
     */
    registerRefreshCallback(tokenType, callback) {
        this.refreshCallbacks.set(tokenType, callback);
    }

    /**
     * Validate token data structure
     */
    validateTokenData(tokenData) {
        const errors = [];

        if (!tokenData) {
            errors.push('Token data is required');
            return { isValid: false, errors };
        }

        if (typeof tokenData === 'string') {
            // Simple token string
            if (tokenData.length < 10) {
                errors.push('Token too short');
            }
        } else if (typeof tokenData === 'object') {
            // Token object with access_token
            if (!tokenData.access_token) {
                errors.push('access_token is required');
            }
            if (tokenData.access_token && tokenData.access_token.length < 10) {
                errors.push('access_token too short');
            }
        } else {
            errors.push('Invalid token data type');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate token with Instagram API
     */
    async validateToken(token, tokenType) {
        try {
            // Make a simple API call to validate token
            const testEndpoint = this.getValidationEndpoint(tokenType);
            const response = await fetch(testEndpoint, {
                headers: {
                    'Authorization': `Bearer ${typeof token === 'string' ? token : token.access_token}`
                }
            });

            return response.ok;
        } catch (error) {
            console.warn(`Token validation failed for ${tokenType}:`, error);
            return false;
        }
    }

    /**
     * Get validation endpoint for token type
     */
    getValidationEndpoint(tokenType) {
        const endpoints = {
            'instagram-basic': 'https://graph.instagram.com/me?fields=id',
            'instagram-graph': 'https://graph.instagram.com/me?fields=id',
            'facebook-graph': 'https://graph.facebook.com/me?fields=id'
        };

        return endpoints[tokenType] || endpoints['instagram-basic'];
    }

    /**
     * Check if token is expired
     */
    isTokenExpired(tokenData) {
        if (!tokenData.expiresAt) {
            // No expiration set, check max age
            const age = Date.now() - tokenData.createdAt;
            return age > this.config.maxTokenAge;
        }

        return Date.now() >= tokenData.expiresAt;
    }

    /**
     * Check if token needs refresh
     */
    needsRefresh(tokenData) {
        if (!tokenData.expiresAt) {
            return false;
        }

        const timeUntilExpiry = tokenData.expiresAt - Date.now();
        return timeUntilExpiry <= this.config.tokenRefreshThreshold;
    }

    /**
     * Generate token ID
     */
    generateTokenId(tokenType, userId) {
        return `${tokenType}:${userId}`;
    }

    /**
     * Encrypt token
     */
    encryptToken(token) {
        if (!this.encryptionKey) {
            return token;
        }

        try {
            // Simple XOR encryption for demo (use proper encryption in production)
            const tokenStr = typeof token === 'string' ? token : JSON.stringify(token);
            const key = this.encryptionKey;
            let encrypted = '';

            for (let i = 0; i < tokenStr.length; i++) {
                const keyChar = key[i % key.length];
                const encryptedChar = String.fromCharCode(
                    tokenStr.charCodeAt(i) ^ keyChar.charCodeAt(0)
                );
                encrypted += encryptedChar;
            }

            return btoa(encrypted); // Base64 encode
        } catch (error) {
            console.warn('Token encryption failed, storing unencrypted:', error);
            return token;
        }
    }

    /**
     * Decrypt token
     */
    decryptToken(encryptedToken) {
        if (!this.encryptionKey) {
            return encryptedToken;
        }

        try {
            const encrypted = atob(encryptedToken); // Base64 decode
            const key = this.encryptionKey;
            let decrypted = '';

            for (let i = 0; i < encrypted.length; i++) {
                const keyChar = key[i % key.length];
                const decryptedChar = String.fromCharCode(
                    encrypted.charCodeAt(i) ^ keyChar.charCodeAt(0)
                );
                decrypted += decryptedChar;
            }

            // Try to parse as JSON, fallback to string
            try {
                return JSON.parse(decrypted);
            } catch {
                return decrypted;
            }
        } catch (error) {
            console.warn('Token decryption failed:', error);
            return encryptedToken;
        }
    }

    /**
     * Get stored encryption key
     */
    getStoredEncryptionKey() {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return localStorage.getItem('instagram-token-key');
            }
        } catch (error) {
            console.warn('Failed to retrieve encryption key from storage:', error);
        }
        return null;
    }

    /**
     * Store encryption key
     */
    storeEncryptionKey(key) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('instagram-token-key', key);
            }
        } catch (error) {
            console.warn('Failed to store encryption key:', error);
        }
    }

    /**
     * Load tokens from storage
     */
    async loadTokensFromStorage() {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const storedTokens = localStorage.getItem('instagram-tokens');
                const storedMetadata = localStorage.getItem('instagram-token-metadata');

                if (storedTokens) {
                    const tokens = JSON.parse(storedTokens);
                    Object.entries(tokens).forEach(([tokenId, tokenData]) => {
                        this.tokens.set(tokenId, tokenData);
                    });
                }

                if (storedMetadata) {
                    const metadata = JSON.parse(storedMetadata);
                    Object.entries(metadata).forEach(([tokenId, metadataData]) => {
                        this.tokenMetadata.set(tokenId, metadataData);
                    });
                }
            }
        } catch (error) {
            console.warn('Failed to load tokens from storage:', error);
        }
    }

    /**
     * Persist token to storage
     */
    async persistTokenToStorage(tokenId) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const tokens = Object.fromEntries(this.tokens);
                const metadata = Object.fromEntries(this.tokenMetadata);

                localStorage.setItem('instagram-tokens', JSON.stringify(tokens));
                localStorage.setItem('instagram-token-metadata', JSON.stringify(metadata));
            }
        } catch (error) {
            console.warn('Failed to persist tokens to storage:', error);
        }
    }

    /**
     * Start token maintenance cycle
     */
    startTokenMaintenanceCycle() {
        // Run maintenance every hour
        setInterval(() => {
            this.performMaintenance();
        }, 60 * 60 * 1000);

        // Initial maintenance run
        setTimeout(() => {
            this.performMaintenance();
        }, 5000);
    }

    /**
     * Perform token maintenance
     */
    async performMaintenance() {
        console.log('Performing token maintenance...');

        for (const [tokenId, tokenData] of this.tokens.entries()) {
            try {
                // Remove expired tokens
                if (this.isTokenExpired(tokenData)) {
                    console.log(`Removing expired token: ${tokenId}`);
                    this.tokens.delete(tokenId);
                    this.tokenMetadata.delete(tokenId);
                    continue;
                }

                // Refresh tokens that need refreshing
                if (this.config.autoRefresh && this.needsRefresh(tokenData)) {
                    console.log(`Auto-refreshing token: ${tokenId}`);
                    try {
                        await this.refreshToken(tokenData.tokenType, tokenData.userId);
                    } catch (error) {
                        console.warn(`Auto-refresh failed for ${tokenId}:`, error);
                    }
                }
            } catch (error) {
                console.error(`Maintenance error for token ${tokenId}:`, error);
            }
        }

        // Persist changes
        await this.persistTokenToStorage();
    }

    /**
     * Get token statistics
     */
    getTokenStatistics() {
        const stats = {
            totalTokens: this.tokens.size,
            tokensByType: {},
            tokensByUser: {},
            expiredTokens: 0,
            tokensNeedingRefresh: 0,
            averageAge: 0,
            totalUsage: 0
        };

        let totalAge = 0;

        for (const [tokenId, tokenData] of this.tokens.entries()) {
            // By type
            stats.tokensByType[tokenData.tokenType] =
                (stats.tokensByType[tokenData.tokenType] || 0) + 1;

            // By user
            stats.tokensByUser[tokenData.userId] =
                (stats.tokensByUser[tokenData.userId] || 0) + 1;

            // Expired
            if (this.isTokenExpired(tokenData)) {
                stats.expiredTokens++;
            }

            // Needs refresh
            if (this.needsRefresh(tokenData)) {
                stats.tokensNeedingRefresh++;
            }

            // Age and usage
            const age = Date.now() - tokenData.createdAt;
            totalAge += age;
            stats.totalUsage += tokenData.usageCount;
        }

        stats.averageAge = stats.totalTokens > 0 ? totalAge / stats.totalTokens : 0;

        return stats;
    }

    /**
     * Remove token
     */
    async removeToken(tokenType, userId = 'default') {
        const tokenId = this.generateTokenId(tokenType, userId);

        this.tokens.delete(tokenId);
        this.tokenMetadata.delete(tokenId);

        await this.persistTokenToStorage();

        console.log(`Token removed: ${tokenType} for user ${userId}`);
    }

    /**
     * Clear all tokens
     */
    async clearAllTokens() {
        this.tokens.clear();
        this.tokenMetadata.clear();

        await this.persistTokenToStorage();

        console.log('All tokens cleared');
    }

    /**
     * Export tokens (for backup)
     */
    exportTokens(includeTokens = false) {
        const export_data = {
            timestamp: Date.now(),
            tokenCount: this.tokens.size,
            statistics: this.getTokenStatistics()
        };

        if (includeTokens) {
            // Only export metadata, not actual tokens for security
            export_data.metadata = Object.fromEntries(this.tokenMetadata);
        }

        return export_data;
    }
}

// Create singleton instance
const instagramTokenManager = new InstagramTokenManager();

export default instagramTokenManager;