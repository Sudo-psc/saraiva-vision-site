/**
 * API Utilities with Graceful Degradation and Error Handling
 * Provides robust API communication with fallback mechanisms
 */

import React from 'react';
import {
    withRetry,
    withFormRetry,
    getRetryConfig,
    classifyError,
    logError,
    announceError,
    announceRetrySuccess
} from './errorHandling';

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

// Enhanced API request with comprehensive retry logic and error handling
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

    try {
        return await withRetry(
            async () => {
                const response = await fetchWithTimeout(url, config);
                return await response.json();
            },
            {
                errorType: 'api',
                onRetry: (retryInfo) => {
                    logError(retryInfo.error, {
                        endpoint,
                        method: config.method,
                        attempt: retryInfo.attempt,
                        maxAttempts: retryInfo.maxAttempts
                    });
                },
                shouldRetry: (error) => {
                    const errorType = classifyError(error);
                    // Don't retry on client errors (4xx) except for rate limiting
                    if (error.status && error.status >= 400 && error.status < 500) {
                        return error.status === 429; // Only retry rate limit errors
                    }
                    // Retry on network errors and server errors
                    return ['network', 'api', 'unknown'].includes(errorType.type);
                }
            }
        );
    } catch (error) {
        logError(error, {
            endpoint,
            method: config.method,
            finalFailure: true
        });
        announceError(error, { action: 'Falha na comunicação com o servidor' });
        throw error;
    }
}

// Enhanced contact form API with comprehensive error handling and retry logic
export async function submitContactForm(formData, options = {}) {
    if (!networkMonitor.isOnline()) {
        const offlineError = {
            name: 'NetworkError',
            message: 'No internet connection',
            code: 'NETWORK_OFFLINE'
        };
        announceError(offlineError, { action: 'Envio do formulário' });
        throw offlineError;
    }

    // Validate required fields
    const requiredFields = ['name', 'email', 'message'];
    // Token is optional - allow fallback when reCAPTCHA is not available
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
        const validationError = {
            name: 'ValidationError',
            message: 'Missing required fields',
            field: missingFields[0],
            code: 'missing_required_fields'
        };
        announceError(validationError, { action: 'Validação do formulário' });
        throw validationError;
    }

    // Prepare payload with security headers
    const payload = {
        ...formData,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    };

    const submitFunction = async () => {
        const response = await apiRequest('/contact', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        return {
            success: true,
            data: response,
            timestamp: new Date().toISOString()
        };
    };

    try {
        // Use form-specific retry logic with accessibility announcements
        const result = await withFormRetry(
            () => submitFunction(),
            formData,
            {
                errorType: 'api',
                onRetry: (retryInfo) => {
                    logError(retryInfo.error, {
                        endpoint: '/contact',
                        method: 'POST',
                        attempt: retryInfo.attempt,
                        maxAttempts: retryInfo.maxAttempts,
                        formData: sanitizeFormData(formData)
                    });

                    if (options.onRetry) {
                        options.onRetry(retryInfo);
                    }
                },
                shouldRetry: (error) => {
                    const retryConfig = getRetryConfig(error);
                    return retryConfig && retryConfig.shouldRetry(error);
                }
            }
        );

        // Announce success
        announceRetrySuccess(options.attempt || 1);

        return result;
    } catch (error) {
        // Enhance error with additional context
        const enhancedError = {
            ...error,
            context: {
                endpoint: '/contact',
                method: 'POST',
                timestamp: new Date().toISOString(),
                hasRecaptcha: !!formData.token,
                formFields: Object.keys(formData),
                attempt: options.attempt || 1
            }
        };

        logError(enhancedError, {
            formData: sanitizeFormData(formData),
            finalFailure: true
        });

        announceError(enhancedError, { action: 'Envio do formulário falhou' });
        throw enhancedError;
    }
}

// Sanitize form data for logging (remove sensitive information)
function sanitizeFormData(formData) {
    const sanitized = { ...formData };
    // Remove token from logs
    delete sanitized.token;
    return sanitized;
}

// Health check for API availability
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

// Graceful degradation fallbacks
export const FallbackStrategies = {
    // Store failed submissions for later retry
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

    // Retry failed submissions
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

    // Provide alternative contact methods
    getAlternativeContacts: () => {
        return {
            phone: '+55 33 99860-1427',
            email: 'contato@saraivavision.com.br',
            whatsapp: 'https://wa.me/message/2QFZJG3EDJZVF1',
            message: 'Não foi possível enviar sua mensagem. Por favor, entre em contato diretamente pelos meios acima.'
        };
    }
};

// Connection status utility
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

// API response caching for offline scenarios
export class ApiCache {
    constructor() {
        this.cache = new Map();
        this.loadFromStorage();
    }

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

    saveToStorage() {
        try {
            const data = Object.fromEntries(this.cache);
            localStorage.setItem('apiCache', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save API cache to storage:', error);
        }
    }

    set(key, data, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
        const expiry = Date.now() + ttl;
        this.cache.set(key, { data, expiry });
        this.saveToStorage();
    }

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

    clear() {
        this.cache.clear();
        this.saveToStorage();
    }
}

// Global API cache instance
export const apiCache = new ApiCache();
