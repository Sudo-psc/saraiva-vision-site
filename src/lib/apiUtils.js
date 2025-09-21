/**
 * API Utilities with Graceful Degradation and Error Handling
 * Provides robust API communication with fallback mechanisms
 */

import { withRetry, RetryConfig, classifyError, logError } from './errorHandling';

/**
 * @typedef {object} ApiConfig
 * @property {string} baseUrl - The base URL for API requests.
 * @property {number} timeout - The default timeout for requests in milliseconds.
 * @property {number} retries - The default number of retries for failed requests.
 * @property {number} retryDelay - The delay between retries in milliseconds.
 */

/**
 * Configuration for the API client.
 * @type {ApiConfig}
 */
export const ApiConfig = {
    baseUrl: process.env.NODE_ENV === 'production'
        ? '/api'
        : 'http://localhost:3000/api',
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000
};

/**
 * Monitors the network status (online/offline).
 * Listens to browser events to track network connectivity.
 */
export class NetworkMonitor {
    /**
     * Creates an instance of NetworkMonitor.
     */
    constructor() {
        this.online = navigator.onLine;
        this.listeners = [];

        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.handleStatusChange(true));
            window.addEventListener('offline', () => this.handleStatusChange(false));
        }
    }

    /**
     * Handles the online/offline status change and notifies listeners.
     * @private
     * @param {boolean} online - The new network status.
     */
    handleStatusChange(online) {
        this.online = online;
        this.listeners.forEach(listener => listener(online));
    }

    /**
     * Subscribes to network status changes.
     * @param {(online: boolean) => void} callback - The function to call when the status changes.
     * @returns {() => void} A function to unsubscribe.
     */
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

/**
 * A singleton instance of the NetworkMonitor.
 * @type {NetworkMonitor}
 */
export const networkMonitor = new NetworkMonitor();

/**
 * A wrapper around the native `fetch` function that adds a timeout and enhanced error handling.
 *
 * @param {string} url - The URL to fetch.
 * @param {RequestInit} [options={}] - The options for the fetch request.
 * @param {number} [timeout=ApiConfig.timeout] - The timeout for the request in milliseconds.
 * @returns {Promise<Response>} A promise that resolves to the fetch `Response` object.
 * @throws {object} Throws a custom error object on timeout, network error, or non-OK HTTP status.
 */
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

/**
 * Makes a request to the application's API, with built-in retry logic.
 *
 * @param {string} endpoint - The API endpoint to request (e.g., '/contact').
 * @param {RequestInit} [options={}] - The options for the fetch request.
 * @returns {Promise<any>} A promise that resolves to the JSON response from the API.
 * @throws {object} Throws a custom error object if the request fails after all retries.
 */
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

/**
 * Submits the contact form data to the API.
 * Includes client-side validation and network status checks.
 *
 * @param {object} formData - The data from the contact form.
 * @param {string} formData.name - The user's name.
 * @param {string} formData.email - The user's email.
 * @param {string} formData.message - The user's message.
 * @param {string} formData.token - The reCAPTCHA token.
 * @returns {Promise<{success: boolean, data: any, timestamp: string}>} A promise that resolves to a success object containing the API response.
 * @throws {object} Throws a custom error object on validation failure, network error, or API error.
 */
export async function submitContactForm(formData) {
    if (!networkMonitor.isOnline()) {
        throw {
            name: 'NetworkError',
            message: 'No internet connection',
            code: 'NETWORK_OFFLINE'
        };
    }

    // Validate required fields
    const requiredFields = ['name', 'email', 'message', 'token'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
        throw {
            name: 'ValidationError',
            message: 'Missing required fields',
            field: missingFields[0],
            code: 'missing_required_fields'
        };
    }

    // Prepare payload with security headers
    const payload = {
        ...formData,
        // Add timestamp for tracking
        timestamp: new Date().toISOString(),
        // Add user agent for debugging
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    };

    try {
        const response = await apiRequest('/contact', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        return {
            success: true,
            data: response,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        // Enhance error with additional context
        const enhancedError = {
            ...error,
            context: {
                endpoint: '/contact',
                method: 'POST',
                timestamp: new Date().toISOString(),
                hasRecaptcha: !!formData.token,
                formFields: Object.keys(formData)
            }
        };

        logError(enhancedError, { formData: sanitizeFormData(formData) });
        throw enhancedError;
    }
}

/**
 * Sanitizes form data for logging by removing sensitive information like the reCAPTCHA token.
 * @private
 * @param {object} formData The form data to sanitize.
 * @returns {object} The sanitized form data.
 */
function sanitizeFormData(formData) {
    const sanitized = { ...formData };
    // Remove token from logs
    delete sanitized.token;
    return sanitized;
}

/**
 * Checks the health of the API by making a request to the /health endpoint.
 *
 * @returns {Promise<{healthy: boolean, response?: any, error?: string, timestamp: string}>} A promise that resolves to an object indicating the API's health status.
 */
export async function checkApiHealth() {
    try {
        const response = await apiRequest('/health', {
            method: 'GET',
            // Health check should have shorter timeout
            timeout: 5000
        });

        return {
            healthy: true,
            response,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            healthy: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * A collection of fallback strategies for handling API failures, such as network errors.
 * @namespace FallbackStrategies
 */
export const FallbackStrategies = {
    /**
     * Stores a failed form submission in localStorage to be retried later.
     * @memberof FallbackStrategies
     * @param {object} formData - The form data that failed to submit.
     * @returns {boolean} True if the submission was stored successfully.
     */
    storeForRetry: (formData) => {
        try {
            const failedSubmissions = JSON.parse(
                localStorage.getItem('failedContactSubmissions') || '[]'
            );

            failedSubmissions.push({
                ...formData,
                timestamp: new Date().toISOString(),
                retryCount: 0
            });

            // Keep only last 5 submissions
            const trimmed = failedSubmissions.slice(-5);
            localStorage.setItem('failedContactSubmissions', JSON.stringify(trimmed));

            return true;
        } catch (error) {
            console.error('Failed to store submission for retry:', error);
            return false;
        }
    },

    /**
     * Attempts to retry sending all submissions stored in localStorage.
     * @memberof FallbackStrategies
     * @returns {Promise<{success: boolean, retried: number, results?: any[], error?: string}>} A promise that resolves with the results of the retry attempts.
     */
    retryFailedSubmissions: async () => {
        try {
            const failedSubmissions = JSON.parse(
                localStorage.getItem('failedContactSubmissions') || '[]'
            );

            if (failedSubmissions.length === 0) {
                return { success: true, retried: 0 };
            }

            const results = [];
            const remaining = [];

            for (const submission of failedSubmissions) {
                if (submission.retryCount >= 3) {
                    // Skip if already retried too many times
                    remaining.push(submission);
                    continue;
                }

                try {
                    // Remove retry metadata before submitting
                    const { timestamp, retryCount, ...formData } = submission;

                    await submitContactForm(formData);
                    results.push({ success: true, originalTimestamp: timestamp });
                } catch (error) {
                    submission.retryCount = (submission.retryCount || 0) + 1;
                    remaining.push(submission);
                    results.push({
                        success: false,
                        originalTimestamp: submission.timestamp,
                        error: error.message
                    });
                }
            }

            // Update remaining submissions
            localStorage.setItem('failedContactSubmissions', JSON.stringify(remaining));

            return {
                success: true,
                retried: results.length,
                results
            };
        } catch (error) {
            logError(error, { action: 'retry_failed_submissions' });
            return { success: false, error: error.message };
        }
    },

    /**
     * Provides alternative contact information as a fallback.
     * @memberof FallbackStrategies
     * @returns {{phone: string, email: string, whatsapp: string, message: string}} An object with alternative contact details.
     */
    getAlternativeContacts: () => {
        return {
            phone: '+55 33 99860-1427',
            email: 'saraivavision@gmail.com',
            whatsapp: 'https://wa.me/5533998601427',
            message: 'Não foi possível enviar sua mensagem. Por favor, entre em contato diretamente pelos meios acima.'
        };
    }
};

/**
 * A React hook to get the current network connection status.
 *
 * @returns {{isOnline: boolean, lastChecked: string}} An object with the current online status.
 */
export function useConnectionStatus() {
    const [isOnline, setIsOnline] = React.useState(networkMonitor.isOnline());

    React.useEffect(() => {
        const unsubscribe = networkMonitor.subscribe(setIsOnline);
        return unsubscribe;
    }, []);

    return {
        isOnline,
        lastChecked: new Date().toISOString()
    };
}

/**
 * A simple in-memory cache with localStorage persistence for API responses.
 * Useful for offline support.
 */
export class ApiCache {
    /**
     * Creates an instance of ApiCache and loads existing data from localStorage.
     */
    constructor() {
        this.cache = new Map();
        this.loadFromStorage();
    }

    /**
     * Loads the cache from localStorage.
     * @private
     */
    loadFromStorage() {
        try {
            const cached = localStorage.getItem('apiCache');
            if (cached) {
                const data = JSON.parse(cached);
                this.cache = new Map(Object.entries(data));
            }
        } catch (error) {
            console.warn('Failed to load API cache from storage:', error);
        }
    }

    /**
     * Saves the current cache to localStorage.
     * @private
     */
    saveToStorage() {
        try {
            const data = Object.fromEntries(this.cache);
            localStorage.setItem('apiCache', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save API cache to storage:', error);
        }
    }

    /**
     * Sets a value in the cache with an optional Time-To-Live (TTL).
     * @param {string} key - The cache key.
     * @param {any} data - The data to store.
     * @param {number} [ttl=300000] - The TTL in milliseconds.
     */
    set(key, data, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
        const expiry = Date.now() + ttl;
        this.cache.set(key, { data, expiry });
        this.saveToStorage();
    }

    /**
     * Retrieves a value from the cache. Returns null if the item does not exist or has expired.
     * @param {string} key - The cache key.
     * @returns {any | null} The cached data or null.
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            this.saveToStorage();
            return null;
        }

        return item.data;
    }

    /**
     * Clears the entire cache.
     */
    clear() {
        this.cache.clear();
        this.saveToStorage();
    }
}

/**
 * A singleton instance of the ApiCache.
 * @type {ApiCache}
 */
export const apiCache = new ApiCache();
