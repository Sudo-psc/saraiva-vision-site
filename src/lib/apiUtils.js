/**
 * API Utilities with Graceful Degradation and Error Handling
 * Provides robust API communication with fallback mechanisms
 */

import { withRetry, RetryConfig, classifyError, logError } from './errorHandling';

// API configuration
export const ApiConfig = {
    baseUrl: process.env.NODE_ENV === 'production'
        ? '/api'
        : 'http://localhost:3000/api',
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000
};

// Network status monitoring
export class NetworkMonitor {
    constructor() {
        this.online = navigator.onLine;
        this.listeners = [];

        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.handleStatusChange(true));
            window.addEventListener('offline', () => this.handleStatusChange(false));
        }
    }

    handleStatusChange(online) {
        this.online = online;
        this.listeners.forEach(listener => listener(online));
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    isOnline() {
        return this.online;
    }
}

// Global network monitor instance
export const networkMonitor = new NetworkMonitor();

// Enhanced fetch with timeout and error handling
export async function fetchWithTimeout(url, options = {}, timeout = ApiConfig.timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw {
                name: 'ApiError',
                message: errorData.message || `HTTP ${response.status}`,
                status: response.status,
                error: errorData.error || 'api_error',
                details: errorData.details || null,
                response
            };
        }

        return response;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw {
                name: 'TimeoutError',
                message: 'Request timeout',
                code: 'NETWORK_ERROR'
            };
        }

        if (!navigator.onLine) {
            throw {
                name: 'NetworkError',
                message: 'No internet connection',
                code: 'NETWORK_OFFLINE'
            };
        }

        throw error;
    }
}

// API request with retry logic and graceful degradation
export async function apiRequest(endpoint, options = {}) {
    const url = `${ApiConfig.baseUrl}${endpoint}`;
    const config = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    // Retry configuration for API calls
    const retryConfig = {
        maxAttempts: ApiConfig.retries,
        shouldRetry: (error) => {
            const errorType = classifyError(error);
            // Don't retry on client errors (4xx) except for rate limiting
            if (error.status && error.status >= 400 && error.status < 500) {
                return error.status === 429; // Only retry rate limit errors
            }
            // Retry on network errors and server errors
            return ['network', 'unknown'].includes(errorType.type);
        }
    };

    try {
        return await withRetry(
            async () => {
                const response = await fetchWithTimeout(url, config);
                return await response.json();
            },
            retryConfig
        );
    } catch (error) {
        logError(error, { endpoint, method: config.method });
        throw error;
    }
}

// Contact form API with enhanced error handling
export async function submitContactForm(formData) {
    if (!networkMonitor.isOnline()) {
        throw {
            name: 'NetworkError',
            message: 'No internet connection',
            code: 'NETWORK_OFFLINE'
        };
    }

// Validate required fields
