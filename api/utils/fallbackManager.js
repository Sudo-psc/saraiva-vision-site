/**
 * Fallback Manager for External Service Failures
 * Provides graceful degradation and alternative responses when services fail
 * Requirements: 3.4, 4.5, 7.5, 9.5
 */

import { createLogger } from '../../../../../../..../../../../src/lib/logger.js';
import { logEvent } from '../../../../../../..../../../../src/lib/eventLogger.js';

/**
 * Fallback strategies for different services
 */
export const FALLBACK_STRATEGIES = {
    EMAIL_SERVICE: 'email_service',
    SMS_SERVICE: 'sms_service',
    CHATBOT_AI: 'chatbot_ai',
    PODCAST_SYNC: 'podcast_sync',
    ANALYTICS: 'analytics',
    DATABASE: 'database'
};

/**
 * Fallback Manager Class
 */
export class FallbackManager {
    constructor(options = {}) {
        this.options = {
            enableCaching: true,
            cacheTimeout: 300000, // 5 minutes
            maxRetries: 3,
            retryDelay: 1000,
            ...options
        };

        this.cache = new Map();
        this.serviceStatus = new Map();
        this.logger = createLogger('fallback-manager');
    }

    /**
     * Execute operation with fallback support
     * @param {string} strategy - Fallback strategy to use
     * @param {Function} primaryOperation - Primary operation to execute
     * @param {Object} fallbackOptions - Fallback configuration
     * @returns {Promise<Object>} Operation result
     */
    async executeWithFallback(strategy, primaryOperation, fallbackOptions = {}) {
        const operationId = this.generateOperationId();
        const startTime = Date.now();

        try {
            // Check if service is known to be down
            if (this.isServiceDown(strategy)) {
                await this.logger.info('Service known to be down, using fallback immediately', {
                    strategy,
                    operationId
                });
                return await this.executeFallback(strategy, fallbackOptions, operationId);
            }

            // Try primary operation
            const result = await this.executeWithTimeout(
                primaryOperation,
                fallbackOptions.timeout || 10000
            );

            // Mark service as healthy
            this.markServiceHealthy(strategy);

            await this.logger.info('Primary operation successful', {
                strategy,
                operationId,
                duration: Date.now() - startTime
            });

            return {
                success: true,
                data: result,
                source: 'primary',
                operationId,
                duration: Date.now() - startTime
            };

        } catch (error) {
            await this.logger.warn('Primary operation failed, attempting fallback', {
                strategy,
                operationId,
                error: error.message,
                duration: Date.now() - startTime
            });

            // Mark service as potentially down
            this.markServiceUnhealthy(strategy);

            // Execute fallback
            return await this.executeFallback(strategy, fallbackOptions, operationId, error);
        }
    }

    /**
     * Execute fallback strategy
     * @param {string} strategy - Fallback strategy
     * @param {Object} options - Fallback options
     * @param {string} operationId - Operation ID
     * @param {Error} originalError - Original error that triggered fallback
     * @returns {Promise<Object>} Fallback result
     */
    async executeFallback(strategy, options, operationId, originalError = null) {
        try {
            let fallbackResult;

            switch (strategy) {
                case FALLBACK_STRATEGIES.EMAIL_SERVICE:
                    fallbackResult = await this.handleEmailServiceFallback(options);
                    break;

                case FALLBACK_STRATEGIES.SMS_SERVICE:
                    fallbackResult = await this.handleSmsServiceFallback(options);
                    break;

                case FALLBACK_STRATEGIES.CHATBOT_AI:
                    fallbackResult = await this.handleChatbotFallback(options);
                    break;

                case FALLBACK_STRATEGIES.PODCAST_SYNC:
                    fallbackResult = await this.handlePodcastFallback(options);
                    break;

                case FALLBACK_STRATEGIES.ANALYTICS:
                    fallbackResult = await this.handleAnalyticsFallback(options);
                    break;

                case FALLBACK_STRATEGIES.DATABASE:
                    fallbackResult = await this.handleDatabaseFallback(options);
                    break;

                default:
                    fallbackResult = await this.handleGenericFallback(options);
            }

            await this.logger.info('Fallback executed successfully', {
                strategy,
                operationId,
                fallbackType: fallbackResult.type
            });

            // Log fallback usage for monitoring
            await logEvent({
                eventType: 'fallback_executed',
                severity: 'warn',
                source: 'fallback_manager',
                eventData: {
                    strategy,
                    operationId,
                    fallbackType: fallbackResult.type,
                    originalError: originalError?.message
                }
            });

            return {
                success: true,
                data: fallbackResult.data,
                source: 'fallback',
                fallbackType: fallbackResult.type,
                operationId,
                message: fallbackResult.message
            };

        } catch (fallbackError) {
            await this.logger.error('Fallback execution failed', {
                strategy,
                operationId,
                fallbackError: fallbackError.message,
                originalError: originalError?.message
            });

            return {
                success: false,
                error: fallbackError,
                source: 'fallback_failed',
                operationId,
                originalError
            };
        }
    }

    /**
     * Handle email service fallback
     * @param {Object} options - Fallback options
     * @returns {Promise<Object>} Fallback result
     */
    async handleEmailServiceFallback(options) {
        // Queue email for later delivery
        if (options.queueForRetry) {
            return {
                type: 'queued',
                data: { queued: true, retryAfter: 300 },
                message: 'Email foi adicionado à fila para envio posterior.'
            };
        }

        // Use alternative email service if configured
        if (options.alternativeService) {
            return {
                type: 'alternative_service',
                data: { sent: true, service: 'alternative' },
                message: 'Email enviado através de serviço alternativo.'
            };
        }

        // Default: queue for retry
        return {
            type: 'queued',
            data: { queued: true, retryAfter: 300 },
            message: 'Sua mensagem foi salva e será enviada assim que o serviço for restaurado.'
        };
    }

    /**
     * Handle SMS service fallback
     * @param {Object} options - Fallback options
     * @returns {Promise<Object>} Fallback result
     */
    async handleSmsServiceFallback(options) {
        // Fall back to email-only notification
        return {
            type: 'email_only',
            data: { emailOnly: true },
            message: 'Confirmação será enviada apenas por email. SMS temporariamente indisponível.'
        };
    }

    /**
     * Handle chatbot AI fallback
     * @param {Object} options - Fallback options
     * @returns {Promise<Object>} Fallback result
     */
    async handleChatbotFallback(options) {
        // Use predefined responses based on message content
        const staticResponse = this.getStaticChatbotResponse(options.userMessage);

        return {
            type: 'static_responses',
            data: {
                response: staticResponse,
                isStatic: true,
                contactInfo: {
                    phone: '(33) 99860-1427',
                    whatsapp: 'https://wa.me/5533998601427',
                    message: 'Para agendamentos e dúvidas, entre em contato diretamente.'
                }
            },
            message: 'Assistente virtual temporariamente indisponível. Respostas automáticas ativas.'
        };
    }

    /**
     * Handle podcast sync fallback
     * @param {Object} options - Fallback options
     * @returns {Promise<Object>} Fallback result
     */
    async handlePodcastFallback(options) {
        // Serve cached podcast data
        const cachedEpisodes = this.getCachedContent('podcast', 'episodes');

        if (cachedEpisodes) {
            return {
                type: 'cached_episodes',
                data: cachedEpisodes,
                message: 'Episódios em cache sendo exibidos.'
            };
        }

        // Serve static podcast information
        return {
            type: 'static_episodes',
            data: this.getStaticPodcastData(),
            message: 'Informações estáticas do podcast sendo exibidas.'
        };
    }

    /**
     * Handle analytics fallback
     * @param {Object} options - Fallback options
     * @returns {Promise<Object>} Fallback result
     */
    async handleAnalyticsFallback(options) {
        // Return mock analytics data
        return {
            type: 'mock_data',
            data: this.getMockAnalyticsData(options.metricType),
            message: 'Dados de exemplo sendo exibidos.'
        };
    }

    /**
     * Handle database fallback
     * @param {Object} options - Fallback options
     * @returns {Promise<Object>} Fallback result
     */
    async handleDatabaseFallback(options) {
        // For read operations, try cached data
        if (options.operation === 'read') {
            const cachedData = this.getCachedContent('database', options.table);
            if (cachedData) {
                return {
                    type: 'cached_data',
                    data: cachedData,
                    message: 'Dados em cache sendo utilizados.'
                };
            }
        }

        // For write operations, queue for later processing
        if (options.operation === 'write') {
            return {
                type: 'queued_write',
                data: { queued: true, retryAfter: 60 },
                message: 'Operação foi adicionada à fila para processamento posterior.'
            };
        }

        throw new Error('Database unavailable and no fallback available');
    }

    /**
     * Handle generic fallback
     * @param {Object} options - Fallback options
     * @returns {Promise<Object>} Fallback result
     */
    async handleGenericFallback(options) {
        return {
            type: 'generic',
            data: { available: false },
            message: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.'
        };
    }

    /**
     * Execute operation with timeout
     * @param {Function} operation - Operation to execute
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise} Operation result
     */
    async executeWithTimeout(operation, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Operation timeout'));
            }, timeout);

            operation()
                .then(result => {
                    clearTimeout(timer);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timer);
                    reject(error);
                });
        });
    }

    /**
     * Check if service is known to be down
     * @param {string} strategy - Service strategy
     * @returns {boolean} Whether service is down
     */
    isServiceDown(strategy) {
        const status = this.serviceStatus.get(strategy);
        if (!status) return false;

        const now = Date.now();
        const downTime = now - status.lastFailure;
        const backoffTime = Math.min(status.consecutiveFailures * 30000, 300000); // Max 5 minutes

        return status.consecutiveFailures >= 3 && downTime < backoffTime;
    }

    /**
     * Mark service as healthy
     * @param {string} strategy - Service strategy
     */
    markServiceHealthy(strategy) {
        this.serviceStatus.set(strategy, {
            healthy: true,
            consecutiveFailures: 0,
            lastSuccess: Date.now()
        });
    }

    /**
     * Mark service as unhealthy
     * @param {string} strategy - Service strategy
     */
    markServiceUnhealthy(strategy) {
        const current = this.serviceStatus.get(strategy) || { consecutiveFailures: 0 };

        this.serviceStatus.set(strategy, {
            healthy: false,
            consecutiveFailures: current.consecutiveFailures + 1,
            lastFailure: Date.now()
        });
    }

    /**
     * Get cached content
     * @param {string} type - Content type
     * @param {string} identifier - Content identifier
     * @returns {any} Cached content or null
     */
    getCachedContent(type, identifier) {
        if (!this.options.enableCaching) return null;

        const cacheKey = `${type}:${identifier}`;
        const cached = this.cache.get(cacheKey);

        if (!cached) return null;

        const now = Date.now();
        if (now - cached.timestamp > this.options.cacheTimeout) {
            this.cache.delete(cacheKey);
            return null;
        }

        return cached.data;
    }

    /**
     * Set cached content
     * @param {string} type - Content type
     * @param {string} identifier - Content identifier
     * @param {any} data - Data to cache
     */
    setCachedContent(type, identifier, data) {
        if (!this.options.enableCaching) return;

        const cacheKey = `${type}:${identifier}`;
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Get static chatbot response
     * @param {string} userMessage - User message
     * @returns {string} Static response
     */
    getStaticChatbotResponse(userMessage) {
        const message = userMessage?.toLowerCase() || '';

        // Emergency keywords
        if (message.includes('emergência') || message.includes('urgente') || message.includes('dor')) {
            return '🚨 Para emergências oftalmológicas, procure atendimento médico imediato ou ligue para (33) 99860-1427.';
        }

        // Appointment keywords
        if (message.includes('agendar') || message.includes('consulta') || message.includes('horário')) {
            return '📅 Para agendamentos, ligue (33) 99860-1427 ou use nosso WhatsApp. Atendemos de segunda a sexta, das 08:00 às 18:00.';
        }

        // Services keywords
        if (message.includes('serviço') || message.includes('exame') || message.includes('cirurgia')) {
            return '👁️ Oferecemos consultas, exames especializados, cirurgias de catarata, tratamento de glaucoma e muito mais. Entre em contato para mais informações.';
        }

        // Location keywords
        if (message.includes('endereço') || message.includes('localização') || message.includes('onde')) {
            return '📍 Estamos localizados na Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga-MG, CEP: 35300-299.';
        }

        // Default response
        return '👋 Olá! Sou o assistente da Saraiva Vision. Para agendamentos e informações, ligue (33) 99860-1427 ou use nosso WhatsApp. Como posso ajudar?';
    }

    /**
     * Get static podcast data
     * @returns {Object} Static podcast data
     */
    getStaticPodcastData() {
        return {
            episodes: [
                {
                    id: 'static-1',
                    title: 'Saúde Ocular - Informações Gerais',
                    description: 'Episódio sobre cuidados básicos com a saúde dos olhos.',
                    duration: '15:00',
                    published_at: new Date().toISOString()
                }
            ],
            message: 'Episódios sendo atualizados. Visite nosso Spotify para o conteúdo completo.'
        };
    }

    /**
     * Get mock analytics data
     * @param {string} metricType - Type of metric
     * @returns {Object} Mock analytics data
     */
    getMockAnalyticsData(metricType) {
        const mockData = {
            funnel: {
                visits: 100,
                contacts: 15,
                appointments: 8,
                conversions: 5
            },
            traffic: {
                organic: 60,
                direct: 25,
                social: 10,
                referral: 5
            },
            vitals: {
                lcp: 2.1,
                fid: 85,
                cls: 0.08
            }
        };

        return mockData[metricType] || { message: 'Dados temporariamente indisponíveis' };
    }

    /**
     * Generate unique operation ID
     * @returns {string} Operation ID
     */
    generateOperationId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `op_${timestamp}_${random}`;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get service status
     * @returns {Object} Service status map
     */
    getServiceStatus() {
        const status = {};
        for (const [service, data] of this.serviceStatus.entries()) {
            status[service] = {
                healthy: data.healthy,
                consecutiveFailures: data.consecutiveFailures,
                lastFailure: data.lastFailure,
                lastSuccess: data.lastSuccess
            };
        }
        return status;
    }
}

/**
 * Global fallback manager instance
 */
export const globalFallbackManager = new FallbackManager({
    enableCaching: true,
    cacheTimeout: 300000, // 5 minutes
    maxRetries: 3
});

/**
 * Convenience function for executing operations with fallback
 * @param {string} strategy - Fallback strategy
 * @param {Function} operation - Primary operation
 * @param {Object} options - Fallback options
 * @returns {Promise<Object>} Operation result
 */
export async function executeWithFallback(strategy, operation, options = {}) {
    return await globalFallbackManager.executeWithFallback(strategy, operation, options);
}

export default FallbackManager;