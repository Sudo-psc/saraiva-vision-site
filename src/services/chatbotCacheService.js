/**
 * Intelligent Response Caching Service
 * Implements smart caching for common medical questions and responses
 * with cache invalidation and content freshness management
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

class ChatbotCacheService {
    constructor() {
        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // In-memory cache for frequently accessed items
        this.memoryCache = new Map();
        this.cacheStats = {
            hits: 0,
            misses: 0,
            memoryHits: 0,
            dbHits: 0,
            invalidations: 0,
            totalRequests: 0
        };

        // Cache configuration
        this.config = {
            defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
            medicalInfoTTL: 7 * 24 * 60 * 60 * 1000, // 7 days for medical info
            appointmentTTL: 60 * 60 * 1000, // 1 hour for appointment-related
            emergencyTTL: 0, // Never cache emergency responses
            maxMemoryCacheSize: 1000,
            maxResponseLength: 5000,
            similarityThreshold: 0.85
        };

        // Medical topic categories for intelligent caching
        this.medicalCategories = {
            'cataract': ['catarata', 'cataract', 'visão turva', 'embaçada'],
            'glaucoma': ['glaucoma', 'pressão ocular', 'campo visual'],
            'myopia': ['miopia', 'myopia', 'visão longe', 'distante'],
            'astigmatism': ['astigmatismo', 'astigmatism', 'visão distorcida'],
            'conjunctivitis': ['conjuntivite', 'olho vermelho', 'irritação'],
            'dry_eye': ['olho seco', 'dry eye', 'ressecamento'],
            'retina': ['retina', 'descolamento', 'degeneração macular'],
            'general_info': ['informação', 'o que é', 'como funciona', 'sintomas']
        };

        this.startCleanupInterval();
    }

    /**
     * Generate cache key from message content
     */
    generateCacheKey(message, context = {}) {
        const normalizedMessage = this.normalizeMessage(message);
        const category = this.categorizeMessage(normalizedMessage);
        const contextHash = this.hashContext(context);

        return crypto
            .createHash('sha256')
            .update(`${category}:${normalizedMessage}:${contextHash}`)
            .digest('hex');
    }

    /**
     * Normalize message for consistent caching
     */
    normalizeMessage(message) {
        return message
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .replace(/\s+/g, ' ') // Normalize whitespace
            .substring(0, 500); // Limit length for key generation
    }

    /**
     * Categorize message to determine cache strategy
     */
    categorizeMessage(message) {
        for (const [category, keywords] of Object.entries(this.medicalCategories)) {
            if (keywords.some(keyword => message.includes(keyword))) {
                return category;
            }
        }

        // Check for appointment-related content
        if (message.includes('agendar') || message.includes('consulta') || message.includes('horário')) {
            return 'appointment';
        }

        // Check for emergency content
        if (message.includes('emergência') || message.includes('urgente') || message.includes('socorro')) {
            return 'emergency';
        }

        return 'general';
    }

    /**
     * Hash context for cache key generation
     */
    hashContext(context) {
        const relevantContext = {
            appointmentIntent: context.appointmentIntent || false,
            emergencyContext: context.emergencyContext || false,
            medicalAdviceContext: context.medicalAdviceContext || false
        };

        return crypto
            .createHash('md5')
            .update(JSON.stringify(relevantContext))
            .digest('hex')
            .substring(0, 8);
    }

    /**
     * Determine TTL based on message category
     */
    getTTLForCategory(category) {
        switch (category) {
            case 'emergency':
                return this.config.emergencyTTL;
            case 'appointment':
                return this.config.appointmentTTL;
            case 'cataract':
            case 'glaucoma':
            case 'myopia':
            case 'astigmatism':
            case 'conjunctivitis':
            case 'dry_eye':
            case 'retina':
            case 'general_info':
                return this.config.medicalInfoTTL;
            default:
                return this.config.defaultTTL;
        }
    }

    /**
     * Check if response should be cached
     */
    shouldCache(message, response, category) {
        // Don't cache emergency responses
        if (category === 'emergency') {
            return false;
        }

        // Don't cache very short or very long responses
        if (response.length < 50 || response.length > this.config.maxResponseLength) {
            return false;
        }

        // Don't cache responses with personal information
        if (this.containsPersonalInfo(response)) {
            return false;
        }

        // Don't cache appointment-specific responses with dates/times
        if (category === 'appointment' && this.containsSpecificDateTime(response)) {
            return false;
        }

        return true;
    }

    /**
     * Check if response contains personal information
     */
    containsPersonalInfo(response) {
        const personalPatterns = [
            /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/, // CPF
            /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/, // CNPJ
            /\b\d{2}\s?\d{4,5}-?\d{4}\b/, // Phone numbers
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
            /\b\d{2}\/\d{2}\/\d{4}\b/, // Specific dates
            /\b\d{1,2}:\d{2}\b/ // Specific times
        ];

        return personalPatterns.some(pattern => pattern.test(response));
    }

    /**
     * Check if response contains specific date/time information
     */
    containsSpecificDateTime(response) {
        const dateTimePatterns = [
            /\b\d{1,2}\/\d{1,2}\/\d{4}\b/, // DD/MM/YYYY
            /\b\d{1,2}:\d{2}\b/, // HH:MM
            /(segunda|terça|quarta|quinta|sexta|sábado|domingo)/i, // Days of week
            /(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/i // Months
        ];

        return dateTimePatterns.some(pattern => pattern.test(response));
    }

    /**
     * Get cached response
     */
    async getCachedResponse(message, context = {}) {
        this.cacheStats.totalRequests++;

        const cacheKey = this.generateCacheKey(message, context);

        // Check memory cache first
        if (this.memoryCache.has(cacheKey)) {
            const cached = this.memoryCache.get(cacheKey);
            if (this.isCacheValid(cached)) {
                this.cacheStats.hits++;
                this.cacheStats.memoryHits++;

                // Update access time
                cached.lastAccessed = Date.now();
                cached.accessCount++;

                return {
                    success: true,
                    response: cached.response,
                    metadata: {
                        ...cached.metadata,
                        cacheHit: true,
                        cacheSource: 'memory',
                        cacheAge: Date.now() - cached.createdAt,
                        accessCount: cached.accessCount
                    }
                };
            } else {
                // Remove expired item from memory cache
                this.memoryCache.delete(cacheKey);
            }
        }

        // Check database cache
        try {
            const { data, error } = await this.supabase
                .from('chatbot_response_cache')
                .select('*')
                .eq('cache_key', cacheKey)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error('Cache lookup error:', error);
                this.cacheStats.misses++;
                return { success: false };
            }

            if (data && this.isCacheValid(data)) {
                this.cacheStats.hits++;
                this.cacheStats.dbHits++;

                // Add to memory cache for faster future access
                this.addToMemoryCache(cacheKey, data);

                // Update access statistics
                await this.updateCacheAccess(cacheKey);

                return {
                    success: true,
                    response: data.response,
                    metadata: {
                        ...data.metadata,
                        cacheHit: true,
                        cacheSource: 'database',
                        cacheAge: Date.now() - new Date(data.created_at).getTime(),
                        accessCount: data.access_count + 1
                    }
                };
            }
        } catch (error) {
            console.error('Cache retrieval error:', error);
        }

        this.cacheStats.misses++;
        return { success: false };
    }

    /**
     * Cache a response
     */
    async cacheResponse(message, response, context = {}, metadata = {}) {
        const category = this.categorizeMessage(this.normalizeMessage(message));

        // Check if response should be cached
        if (!this.shouldCache(message, response, category)) {
            return { success: false, reason: 'not_cacheable' };
        }

        const cacheKey = this.generateCacheKey(message, context);
        const ttl = this.getTTLForCategory(category);

        if (ttl === 0) {
            return { success: false, reason: 'zero_ttl' };
        }

        const cacheEntry = {
            cache_key: cacheKey,
            message_normalized: this.normalizeMessage(message),
            response: response,
            category: category,
            context_hash: this.hashContext(context),
            metadata: {
                ...metadata,
                originalMessage: message.substring(0, 200), // Store truncated original
                tokensUsed: metadata.tokensUsed || 0,
                responseTime: metadata.responseTime || 0,
                cacheCreated: Date.now()
            },
            ttl_seconds: Math.floor(ttl / 1000),
            expires_at: new Date(Date.now() + ttl).toISOString(),
            created_at: new Date().toISOString(),
            access_count: 0,
            last_accessed: new Date().toISOString()
        };

        try {
            // Store in database
            const { error } = await this.supabase
                .from('chatbot_response_cache')
                .upsert(cacheEntry, { onConflict: 'cache_key' });

            if (error) {
                console.error('Cache storage error:', error);
                return { success: false, reason: 'storage_error' };
            }

            // Add to memory cache
            this.addToMemoryCache(cacheKey, cacheEntry);

            return {
                success: true,
                cacheKey,
                category,
                ttl: ttl / 1000
            };

        } catch (error) {
            console.error('Cache storage error:', error);
            return { success: false, reason: 'storage_error' };
        }
    }

    /**
     * Add entry to memory cache with size management
     */
    addToMemoryCache(cacheKey, entry) {
        // Remove oldest entries if cache is full
        if (this.memoryCache.size >= this.config.maxMemoryCacheSize) {
            const oldestKey = this.findOldestCacheEntry();
            if (oldestKey) {
                this.memoryCache.delete(oldestKey);
            }
        }

        // Add entry with additional memory cache metadata
        this.memoryCache.set(cacheKey, {
            ...entry,
            createdAt: entry.created_at ? new Date(entry.created_at).getTime() : Date.now(),
            lastAccessed: Date.now(),
            accessCount: entry.access_count || 0
        });
    }

    /**
     * Find oldest entry in memory cache
     */
    findOldestCacheEntry() {
        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, entry] of this.memoryCache.entries()) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }

        return oldestKey;
    }

    /**
     * Check if cache entry is still valid
     */
    isCacheValid(entry) {
        const expiresAt = entry.expires_at ? new Date(entry.expires_at).getTime() :
            (entry.createdAt || Date.now()) + (entry.ttl_seconds * 1000);

        return Date.now() < expiresAt;
    }

    /**
     * Update cache access statistics
     */
    async updateCacheAccess(cacheKey) {
        try {
            await this.supabase
                .from('chatbot_response_cache')
                .update({
                    access_count: this.supabase.raw('access_count + 1'),
                    last_accessed: new Date().toISOString()
                })
                .eq('cache_key', cacheKey);
        } catch (error) {
            console.error('Error updating cache access:', error);
        }
    }

    /**
     * Invalidate cache entries by pattern or category
     */
    async invalidateCache(options = {}) {
        const { category, pattern, olderThan, force = false } = options;

        let query = this.supabase.from('chatbot_response_cache');

        if (category) {
            query = query.eq('category', category);
        }

        if (pattern) {
            query = query.ilike('message_normalized', `%${pattern}%`);
        }

        if (olderThan) {
            query = query.lt('created_at', new Date(Date.now() - olderThan).toISOString());
        }

        if (!force) {
            // Only invalidate expired entries unless force is true
            query = query.lt('expires_at', new Date().toISOString());
        }

        try {
            const { data, error } = await query.delete().select('cache_key');

            if (error) {
                console.error('Cache invalidation error:', error);
                return { success: false, error };
            }

            // Remove from memory cache as well
            if (data) {
                data.forEach(entry => {
                    this.memoryCache.delete(entry.cache_key);
                });

                this.cacheStats.invalidations += data.length;
            }

            return {
                success: true,
                invalidatedCount: data?.length || 0
            };

        } catch (error) {
            console.error('Cache invalidation error:', error);
            return { success: false, error };
        }
    }

    /**
     * Find similar cached responses using text similarity
     */
    async findSimilarResponses(message, limit = 5) {
        const normalizedMessage = this.normalizeMessage(message);
        const category = this.categorizeMessage(normalizedMessage);

        try {
            // Get responses from the same category
            const { data, error } = await this.supabase
                .from('chatbot_response_cache')
                .select('*')
                .eq('category', category)
                .gt('expires_at', new Date().toISOString())
                .order('access_count', { ascending: false })
                .limit(limit * 2); // Get more to filter by similarity

            if (error) {
                console.error('Similar responses lookup error:', error);
                return [];
            }

            if (!data || data.length === 0) {
                return [];
            }

            // Calculate similarity scores
            const similarResponses = data
                .map(entry => ({
                    ...entry,
                    similarity: this.calculateSimilarity(normalizedMessage, entry.message_normalized)
                }))
                .filter(entry => entry.similarity >= this.config.similarityThreshold)
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);

            return similarResponses;

        } catch (error) {
            console.error('Similar responses lookup error:', error);
            return [];
        }
    }

    /**
     * Calculate text similarity using Jaccard similarity
     */
    calculateSimilarity(text1, text2) {
        const words1 = new Set(text1.split(' '));
        const words2 = new Set(text2.split(' '));

        const intersection = new Set([...words1].filter(word => words2.has(word)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    }

    /**
     * Get cache statistics and performance metrics
     */
    getCacheStatistics() {
        const hitRate = this.cacheStats.totalRequests > 0 ?
            (this.cacheStats.hits / this.cacheStats.totalRequests) * 100 : 0;

        const memoryHitRate = this.cacheStats.hits > 0 ?
            (this.cacheStats.memoryHits / this.cacheStats.hits) * 100 : 0;

        return {
            ...this.cacheStats,
            hitRate: Math.round(hitRate * 100) / 100,
            memoryHitRate: Math.round(memoryHitRate * 100) / 100,
            memoryCacheSize: this.memoryCache.size,
            memoryCacheUtilization: (this.memoryCache.size / this.config.maxMemoryCacheSize) * 100
        };
    }

    /**
     * Get cache health status
     */
    async getCacheHealth() {
        try {
            // Get database cache statistics
            const { data: stats, error } = await this.supabase
                .from('chatbot_response_cache')
                .select('category, expires_at, access_count')
                .order('created_at', { ascending: false });

            if (error) {
                return {
                    status: 'unhealthy',
                    error: error.message,
                    memoryCache: this.getCacheStatistics()
                };
            }

            const now = Date.now();
            const validEntries = stats?.filter(entry =>
                new Date(entry.expires_at).getTime() > now
            ) || [];

            const expiredEntries = (stats?.length || 0) - validEntries.length;

            // Calculate category distribution
            const categoryStats = validEntries.reduce((acc, entry) => {
                acc[entry.category] = (acc[entry.category] || 0) + 1;
                return acc;
            }, {});

            return {
                status: 'healthy',
                database: {
                    totalEntries: stats?.length || 0,
                    validEntries: validEntries.length,
                    expiredEntries,
                    categoryDistribution: categoryStats
                },
                memory: this.getCacheStatistics(),
                performance: {
                    averageAccessCount: validEntries.length > 0 ?
                        validEntries.reduce((sum, entry) => sum + entry.access_count, 0) / validEntries.length : 0
                }
            };

        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                memoryCache: this.getCacheStatistics()
            };
        }
    }

    /**
     * Start cleanup interval for expired entries
     */
    startCleanupInterval() {
        // Clean up expired entries every hour
        setInterval(async () => {
            await this.cleanupExpiredEntries();
        }, 60 * 60 * 1000);

        // Clean up memory cache every 15 minutes
        setInterval(() => {
            this.cleanupMemoryCache();
        }, 15 * 60 * 1000);
    }

    /**
     * Clean up expired entries from database
     */
    async cleanupExpiredEntries() {
        try {
            const { data, error } = await this.supabase
                .from('chatbot_response_cache')
                .delete()
                .lt('expires_at', new Date().toISOString())
                .select('cache_key');

            if (error) {
                console.error('Cleanup error:', error);
                return;
            }

            // Remove from memory cache as well
            if (data) {
                data.forEach(entry => {
                    this.memoryCache.delete(entry.cache_key);
                });

                console.log(`Cleaned up ${data.length} expired cache entries`);
            }

        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }

    /**
     * Clean up expired entries from memory cache
     */
    cleanupMemoryCache() {
        const now = Date.now();
        const expiredKeys = [];

        for (const [key, entry] of this.memoryCache.entries()) {
            if (!this.isCacheValid(entry)) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => {
            this.memoryCache.delete(key);
        });

        if (expiredKeys.length > 0) {
            console.log(`Cleaned up ${expiredKeys.length} expired memory cache entries`);
        }
    }

    /**
     * Warm up cache with common medical questions
     */
    async warmUpCache() {
        const commonQuestions = [
            { message: "O que é catarata?", category: "cataract" },
            { message: "Quais são os sintomas do glaucoma?", category: "glaucoma" },
            { message: "Como tratar conjuntivite?", category: "conjunctivitis" },
            { message: "O que causa miopia?", category: "myopia" },
            { message: "Sintomas de olho seco", category: "dry_eye" },
            { message: "Como funciona cirurgia de catarata?", category: "cataract" },
            { message: "Prevenção do glaucoma", category: "glaucoma" }
        ];

        console.log('Starting cache warm-up...');

        for (const question of commonQuestions) {
            const cached = await this.getCachedResponse(question.message);
            if (!cached.success) {
                console.log(`Cache miss for: ${question.message} - will be cached on first real request`);
            }
        }

        console.log('Cache warm-up completed');
    }
}

// Export singleton instance
export default new ChatbotCacheService();