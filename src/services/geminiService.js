/**
 * Google Gemini Flash 2.5 API Service
 * Handles authentication, rate limiting, and API interactions
 * Enhanced for medical chatbot with conversation context management
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
    constructor() {
        this.apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        this.genAI = null;
        this.model = null;
        this.rateLimiter = new Map(); // Simple in-memory rate limiter
        this.conversationContexts = new Map(); // Store conversation contexts
        this.tokenUsageTracker = new Map(); // Track token usage per session
        this.maxRequestsPerMinute = 60;
        this.maxTokensPerRequest = 8192;
        this.maxContextLength = 10; // Maximum conversation history to maintain
        this.tokenBudgetPerSession = 50000; // Maximum tokens per session

        this.initialize();
    }

    /**
     * Initialize the Gemini API client with enhanced configuration
     */
    initialize() {
        if (!this.apiKey) {
            throw new Error('GOOGLE_GEMINI_API_KEY environment variable is required');
        }

        try {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({
                model: 'gemini-2.0-flash-exp',
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: this.maxTokensPerRequest,
                    candidateCount: 1,
                    stopSequences: [],
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                ],
                systemInstruction: `You are a medical assistant chatbot for Saraiva Vision, an ophthalmology clinic in Brazil. 
        
        IMPORTANT MEDICAL COMPLIANCE RULES:
        1. You CANNOT provide medical diagnoses - always recommend consulting with Dr. Philipe Saraiva
        2. For medical emergencies, immediately direct users to emergency services (SAMU 192 or emergency room)
        3. You can provide general educational information about eye conditions but must include disclaimers
        4. Always include the disclaimer: "Esta informação é apenas educativa. Consulte sempre um médico oftalmologista para diagnóstico e tratamento adequados."
        5. You can help schedule appointments and provide information about clinic services
        6. Be empathetic, professional, and helpful while maintaining medical ethics
        7. Maintain conversation context and refer to previous messages when relevant
        8. If users ask about appointment scheduling, guide them through the process
        9. For referral requests, collect necessary information while maintaining compliance
        
        Respond in Portuguese (Brazilian) and maintain a warm, professional tone.`,
            });

            // Initialize cleanup intervals
            this.startCleanupIntervals();
        } catch (error) {
            console.error('Failed to initialize Gemini API:', error);
            throw new Error('Failed to initialize Gemini API service');
        }
    }

    /**
     * Start cleanup intervals for memory management
     */
    startCleanupIntervals() {
        // Clean up old conversation contexts every 30 minutes
        setInterval(() => {
            this.cleanupOldContexts();
        }, 30 * 60 * 1000);

        // Clean up old rate limit entries every 5 minutes
        setInterval(() => {
            this.cleanupRateLimiter();
        }, 5 * 60 * 1000);
    }

    /**
     * Clean up old conversation contexts (older than 2 hours)
     */
    cleanupOldContexts() {
        const cutoffTime = Date.now() - (2 * 60 * 60 * 1000); // 2 hours ago

        for (const [sessionId, context] of this.conversationContexts.entries()) {
            if (context.lastActivity < cutoffTime) {
                this.conversationContexts.delete(sessionId);
                this.tokenUsageTracker.delete(sessionId);
            }
        }
    }

    /**
     * Clean up old rate limiter entries
     */
    cleanupRateLimiter() {
        const cutoffTime = Date.now() - (60 * 1000); // 1 minute ago

        for (const [identifier, requests] of this.rateLimiter.entries()) {
            const recentRequests = requests.filter(timestamp => timestamp > cutoffTime);
            if (recentRequests.length === 0) {
                this.rateLimiter.delete(identifier);
            } else {
                this.rateLimiter.set(identifier, recentRequests);
            }
        }
    }

    /**
     * Check rate limiting for a given identifier (IP, session, etc.)
     */
    checkRateLimit(identifier) {
        const now = Date.now();
        const windowStart = now - 60000; // 1 minute window

        if (!this.rateLimiter.has(identifier)) {
            this.rateLimiter.set(identifier, []);
        }

        const requests = this.rateLimiter.get(identifier);

        // Remove old requests outside the window
        const recentRequests = requests.filter(timestamp => timestamp > windowStart);
        this.rateLimiter.set(identifier, recentRequests);

        if (recentRequests.length >= this.maxRequestsPerMinute) {
            return {
                allowed: false,
                resetTime: Math.ceil((recentRequests[0] + 60000 - now) / 1000),
                remaining: 0
            };
        }

        // Add current request
        recentRequests.push(now);
        this.rateLimiter.set(identifier, recentRequests);

        return {
            allowed: true,
            remaining: this.maxRequestsPerMinute - recentRequests.length,
            resetTime: 60
        };
    }

    /**
     * Get or create conversation context for a session
     */
    getConversationContext(sessionId) {
        if (!this.conversationContexts.has(sessionId)) {
            this.conversationContexts.set(sessionId, {
                messages: [],
                metadata: {
                    startTime: Date.now(),
                    lastActivity: Date.now(),
                    totalTokens: 0,
                    messageCount: 0,
                    topics: new Set(),
                    intents: new Set()
                }
            });
        }

        const context = this.conversationContexts.get(sessionId);
        context.metadata.lastActivity = Date.now();
        return context;
    }

    /**
     * Add message to conversation context
     */
    addToConversationContext(sessionId, role, content, metadata = {}) {
        const context = this.getConversationContext(sessionId);

        const message = {
            role,
            content,
            timestamp: Date.now(),
            metadata
        };

        context.messages.push(message);
        context.metadata.messageCount++;

        // Keep only the last N messages to manage memory
        if (context.messages.length > this.maxContextLength) {
            context.messages = context.messages.slice(-this.maxContextLength);
        }

        // Extract topics and intents from metadata
        if (metadata.topics) {
            metadata.topics.forEach(topic => context.metadata.topics.add(topic));
        }
        if (metadata.intents) {
            metadata.intents.forEach(intent => context.metadata.intents.add(intent));
        }

        return context;
    }

    /**
     * Track token usage for a session
     */
    trackTokenUsage(sessionId, tokensUsed) {
        if (!this.tokenUsageTracker.has(sessionId)) {
            this.tokenUsageTracker.set(sessionId, {
                totalTokens: 0,
                requestCount: 0,
                startTime: Date.now(),
                lastRequest: Date.now()
            });
        }

        const usage = this.tokenUsageTracker.get(sessionId);
        usage.totalTokens += tokensUsed;
        usage.requestCount++;
        usage.lastRequest = Date.now();

        // Update conversation context metadata
        const context = this.getConversationContext(sessionId);
        context.metadata.totalTokens = usage.totalTokens;

        return usage;
    }

    /**
     * Check if session is within token budget
     */
    checkTokenBudget(sessionId) {
        const usage = this.tokenUsageTracker.get(sessionId);
        if (!usage) return { allowed: true, remaining: this.tokenBudgetPerSession };

        const remaining = this.tokenBudgetPerSession - usage.totalTokens;
        return {
            allowed: remaining > 0,
            remaining: Math.max(0, remaining),
            used: usage.totalTokens,
            percentage: (usage.totalTokens / this.tokenBudgetPerSession) * 100
        };
    }

    /**
     * Build optimized conversation history for API call
     */
    buildConversationHistory(sessionId, maxTokens = 4000) {
        const context = this.getConversationContext(sessionId);
        const messages = context.messages;

        if (messages.length === 0) {
            return [];
        }

        // Start with the most recent messages and work backwards
        const optimizedHistory = [];
        let estimatedTokens = 0;

        for (let i = messages.length - 1; i >= 0; i--) {
            const message = messages[i];
            const messageTokens = this.estimateTokens(message.content);

            if (estimatedTokens + messageTokens > maxTokens) {
                break;
            }

            optimizedHistory.unshift(message);
            estimatedTokens += messageTokens;
        }

        return optimizedHistory;
    }

    /**
     * Estimate token count for text (rough approximation)
     */
    estimateTokens(text) {
        // Rough estimation: 1 token ≈ 4 characters for Portuguese
        return Math.ceil(text.length / 4);
    }

    /**
     * Extract conversation insights
     */
    getConversationInsights(sessionId) {
        const context = this.getConversationContext(sessionId);
        const usage = this.tokenUsageTracker.get(sessionId);

        return {
            sessionId,
            messageCount: context.metadata.messageCount,
            duration: Date.now() - context.metadata.startTime,
            totalTokens: context.metadata.totalTokens,
            topics: Array.from(context.metadata.topics),
            intents: Array.from(context.metadata.intents),
            averageResponseTime: usage ? (Date.now() - usage.startTime) / usage.requestCount : 0,
            lastActivity: context.metadata.lastActivity
        };
    }

    /**
     * Generate a response using Gemini Flash 2.5 with enhanced context management
     */
    async generateResponse(message, options = {}) {
        const {
            sessionId = 'anonymous',
            conversationHistory = [],
            context = {},
            useStoredContext = true
        } = options;

        // Check rate limiting
        const rateLimitResult = this.checkRateLimit(sessionId);
        if (!rateLimitResult.allowed) {
            throw new Error(`Rate limit exceeded. Try again in ${rateLimitResult.resetTime} seconds.`);
        }

        // Check token budget
        const tokenBudget = this.checkTokenBudget(sessionId);
        if (!tokenBudget.allowed) {
            throw new Error(`Token budget exceeded for this session. Please start a new conversation.`);
        }

        try {
            const startTime = Date.now();

            // Add user message to conversation context
            this.addToConversationContext(sessionId, 'user', message, {
                topics: this.extractTopics(message),
                intents: this.extractIntents(message, context)
            });

            // Build optimized conversation history
            let historyToUse = conversationHistory;
            if (useStoredContext) {
                historyToUse = this.buildConversationHistory(sessionId, 3000); // Reserve tokens for response
            }

            // Build enhanced prompt with context
            let prompt = this.buildEnhancedPrompt(message, historyToUse, context, sessionId);

            // Generate content with retry logic
            const result = await this.generateWithRetry(prompt, 3);
            const response = await result.response;
            const text = response.text();

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Get safety ratings and usage info
            const safetyRatings = response.candidates?.[0]?.safetyRatings || [];
            const usageMetadata = response.usageMetadata || {};
            const tokensUsed = usageMetadata.totalTokenCount || this.estimateTokens(prompt + text);

            // Track token usage
            this.trackTokenUsage(sessionId, tokensUsed);

            // Add assistant response to conversation context
            this.addToConversationContext(sessionId, 'assistant', text, {
                responseTime,
                tokensUsed,
                safetyRatings
            });

            // Calculate response optimization metrics
            const optimizationMetrics = this.calculateOptimizationMetrics(sessionId, responseTime, tokensUsed);

            return {
                success: true,
                content: text,
                metadata: {
                    responseTime,
                    tokensUsed,
                    safetyRatings,
                    finishReason: response.candidates?.[0]?.finishReason || 'STOP',
                    rateLimitRemaining: rateLimitResult.remaining,
                    tokenBudgetRemaining: tokenBudget.remaining,
                    conversationLength: this.getConversationContext(sessionId).messages.length,
                    optimizationMetrics
                }
            };

        } catch (error) {
            console.error('Gemini API error:', error);

            // Add error to conversation context for debugging
            this.addToConversationContext(sessionId, 'system', `Error: ${error.message}`, {
                error: true,
                timestamp: Date.now()
            });

            // Handle specific API errors
            if (error.message?.includes('quota')) {
                throw new Error('API quota exceeded. Please try again later.');
            }
            if (error.message?.includes('safety')) {
                throw new Error('Content blocked by safety filters. Please rephrase your message.');
            }
            if (error.message?.includes('rate')) {
                throw new Error('Too many requests. Please wait before trying again.');
            }
            if (error.message?.includes('Token budget')) {
                throw error; // Re-throw token budget errors as-is
            }

            throw new Error('Failed to generate response. Please try again.');
        }
    }

    /**
     * Generate content with retry logic
     */
    async generateWithRetry(prompt, maxRetries = 3) {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.model.generateContent(prompt);
            } catch (error) {
                lastError = error;

                // Don't retry on certain errors
                if (error.message?.includes('safety') ||
                    error.message?.includes('quota') ||
                    error.message?.includes('rate')) {
                    throw error;
                }

                // Wait before retry (exponential backoff)
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }

        throw lastError;
    }

    /**
     * Build enhanced prompt with context and conversation history
     */
    buildEnhancedPrompt(message, conversationHistory, context, sessionId) {
        let prompt = '';

        // Add conversation history if available
        if (conversationHistory.length > 0) {
            prompt += 'Conversation history:\n';
            conversationHistory.forEach(msg => {
                prompt += `${msg.role}: ${msg.content}\n`;
            });
            prompt += '\n';
        }

        // Add contextual information
        const contextParts = [];

        if (context.appointmentIntent) {
            contextParts.push('User is interested in scheduling an appointment');
        }
        if (context.emergencyContext) {
            contextParts.push('This may be a medical emergency - prioritize safety');
        }
        if (context.referralIntent) {
            contextParts.push('User is requesting a medical referral');
        }

        // Add conversation insights
        const insights = this.getConversationInsights(sessionId);
        if (insights.topics.length > 0) {
            contextParts.push(`Previous topics discussed: ${insights.topics.join(', ')}`);
        }
        if (insights.intents.length > 0) {
            contextParts.push(`User intents detected: ${insights.intents.join(', ')}`);
        }

        if (contextParts.length > 0) {
            prompt += `Context: ${contextParts.join('. ')}\n\n`;
        }

        // Add current message
        prompt += `Current message: ${message}`;

        return prompt;
    }

    /**
     * Extract topics from message content
     */
    extractTopics(message) {
        const topics = [];
        const lowerMessage = message.toLowerCase();

        // Medical topics
        const medicalTopics = {
            'catarata': 'cataract',
            'glaucoma': 'glaucoma',
            'miopia': 'myopia',
            'astigmatismo': 'astigmatism',
            'conjuntivite': 'conjunctivitis',
            'retina': 'retina',
            'córnea': 'cornea',
            'lente': 'lens',
            'óculos': 'glasses',
            'cirurgia': 'surgery'
        };

        Object.entries(medicalTopics).forEach(([keyword, topic]) => {
            if (lowerMessage.includes(keyword)) {
                topics.push(topic);
            }
        });

        // Service topics
        if (lowerMessage.includes('consulta') || lowerMessage.includes('agend')) {
            topics.push('appointment');
        }
        if (lowerMessage.includes('preço') || lowerMessage.includes('valor') || lowerMessage.includes('custo')) {
            topics.push('pricing');
        }
        if (lowerMessage.includes('horário') || lowerMessage.includes('funcionamento')) {
            topics.push('hours');
        }

        return topics;
    }

    /**
     * Extract intents from message and context
     */
    extractIntents(message, context) {
        const intents = [];
        const lowerMessage = message.toLowerCase();

        // Explicit intents from context
        if (context.appointmentIntent) intents.push('schedule_appointment');
        if (context.emergencyContext) intents.push('emergency_help');
        if (context.referralIntent) intents.push('request_referral');

        // Inferred intents from message
        if (lowerMessage.includes('agendar') || lowerMessage.includes('marcar consulta')) {
            intents.push('schedule_appointment');
        }
        if (lowerMessage.includes('emergência') || lowerMessage.includes('urgente')) {
            intents.push('emergency_help');
        }
        if (lowerMessage.includes('especialista') || lowerMessage.includes('encaminhar')) {
            intents.push('request_referral');
        }
        if (lowerMessage.includes('informação') || lowerMessage.includes('o que é')) {
            intents.push('get_information');
        }

        return intents;
    }

    /**
     * Calculate optimization metrics for response
     */
    calculateOptimizationMetrics(sessionId, responseTime, tokensUsed) {
        const context = this.getConversationContext(sessionId);
        const usage = this.tokenUsageTracker.get(sessionId);

        return {
            efficiency: {
                tokensPerSecond: tokensUsed / (responseTime / 1000),
                averageTokensPerMessage: usage ? usage.totalTokens / usage.requestCount : tokensUsed,
                contextUtilization: context.messages.length / this.maxContextLength
            },
            performance: {
                responseTime,
                isOptimal: responseTime < 3000, // Under 3 seconds
                tokenEfficiency: tokensUsed < this.maxTokensPerRequest * 0.8 // Under 80% of max
            },
            conversation: {
                depth: context.messages.length,
                topicDiversity: context.metadata.topics.size,
                intentDiversity: context.metadata.intents.size
            }
        };
    }

    /**
     * Validate API configuration
     */
    async validateConfiguration() {
        try {
            const testResult = await this.generateResponse('Hello, this is a test message.');
            return {
                valid: true,
                message: 'Gemini API configuration is valid',
                testResponse: testResult.content
            };
        } catch (error) {
            return {
                valid: false,
                message: error.message,
                error: error.toString()
            };
        }
    }

    /**
     * Clear conversation context for a session
     */
    clearConversationContext(sessionId) {
        this.conversationContexts.delete(sessionId);
        this.tokenUsageTracker.delete(sessionId);
        return true;
    }

    /**
     * Get conversation summary for a session
     */
    getConversationSummary(sessionId) {
        const context = this.getConversationContext(sessionId);
        const usage = this.tokenUsageTracker.get(sessionId);

        return {
            sessionId,
            messageCount: context.metadata.messageCount,
            totalTokens: context.metadata.totalTokens,
            duration: Date.now() - context.metadata.startTime,
            topics: Array.from(context.metadata.topics),
            intents: Array.from(context.metadata.intents),
            lastActivity: context.metadata.lastActivity,
            averageResponseTime: usage ? (Date.now() - usage.startTime) / usage.requestCount : 0
        };
    }

    /**
     * Export conversation for analysis or backup
     */
    exportConversation(sessionId) {
        const context = this.getConversationContext(sessionId);
        const usage = this.tokenUsageTracker.get(sessionId);

        return {
            sessionId,
            messages: context.messages,
            metadata: context.metadata,
            usage,
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Get service statistics
     */
    getServiceStatistics() {
        const activeContexts = this.conversationContexts.size;
        const totalTokensUsed = Array.from(this.tokenUsageTracker.values())
            .reduce((sum, usage) => sum + usage.totalTokens, 0);

        const activeSessions = Array.from(this.conversationContexts.values())
            .filter(context => Date.now() - context.metadata.lastActivity < 30 * 60 * 1000); // Active in last 30 minutes

        return {
            activeContexts,
            activeSessions: activeSessions.length,
            totalTokensUsed,
            averageTokensPerSession: activeContexts > 0 ? totalTokensUsed / activeContexts : 0,
            rateLimiterEntries: this.rateLimiter.size,
            memoryUsage: {
                conversationContexts: this.conversationContexts.size,
                tokenUsageTracker: this.tokenUsageTracker.size,
                rateLimiter: this.rateLimiter.size
            }
        };
    }

    /**
     * Optimize service performance
     */
    optimizePerformance() {
        const beforeStats = this.getServiceStatistics();

        // Clean up old contexts and rate limiter entries
        this.cleanupOldContexts();
        this.cleanupRateLimiter();

        const afterStats = this.getServiceStatistics();

        return {
            optimization: 'completed',
            before: beforeStats,
            after: afterStats,
            freed: {
                contexts: beforeStats.activeContexts - afterStats.activeContexts,
                rateLimiterEntries: beforeStats.rateLimiterEntries - afterStats.rateLimiterEntries
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get service health status with enhanced metrics
     */
    getHealthStatus() {
        const stats = this.getServiceStatistics();

        return {
            service: 'GeminiService',
            status: this.model ? 'healthy' : 'unhealthy',
            apiKeyConfigured: !!this.apiKey,
            modelInitialized: !!this.model,
            statistics: stats,
            performance: {
                memoryUsage: 'normal', // Could be enhanced with actual memory monitoring
                responseTimeAverage: 'good', // Could be calculated from stored metrics
                errorRate: 'low' // Could be tracked from error occurrences
            },
            configuration: {
                maxRequestsPerMinute: this.maxRequestsPerMinute,
                maxTokensPerRequest: this.maxTokensPerRequest,
                maxContextLength: this.maxContextLength,
                tokenBudgetPerSession: this.tokenBudgetPerSession
            },
            timestamp: new Date().toISOString()
        };
    }
}

// Export singleton instance
export default new GeminiService();