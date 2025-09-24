/**
 * Chatbot Resource Manager
 * Handles connection pooling, request optimization, and automatic scaling
 */

import { createClient } from '@supabase/supabase-js';

class ChatbotResourceManager {
    constructor() {
        // Connection pool for Supabase
        this.connectionPool = new Map();
        this.poolConfig = {
            maxConnections: parseInt(process.env.CHATBOT_MAX_CONNECTIONS) || 10,
            minConnections: parseInt(process.env.CHATBOT_MIN_CONNECTIONS) || 2,
            acquireTimeout: parseInt(process.env.CHATBOT_ACQUIRE_TIMEOUT) || 30000,
            idleTimeout: parseInt(process.env.CHATBOT_IDLE_TIMEOUT) || 300000, // 5 minutes
            maxLifetime: parseInt(process.env.CHATBOT_MAX_LIFETIME) || 1800000, // 30 minutes
        };

        // Request queue for load balancing
        this.requestQueue = [];
        this.activeRequests = new Map();
        this.maxConcurrentRequests = parseInt(process.env.CHATBOT_MAX_CONCURRENT) || 50;

        // Resource usage tracking
        this.resourceMetrics = {
            connections: {
                active: 0,
                idle: 0,
                total: 0,
                created: 0,
                destroyed: 0
            },
            requests: {
                queued: 0,
                active: 0,
                completed: 0,
                failed: 0,
                avgWaitTime: 0,
                avgProcessingTime: 0
            },
            memory: {
                heapUsed: 0,
                heapTotal: 0,
                external: 0,
                rss: 0
            },
            cpu: {
                usage: 0,
                loadAverage: []
            }
        };

        // Auto-scaling configuration
        this.autoScaling = {
            enabled: process.env.CHATBOT_AUTO_SCALING !== 'false',
            scaleUpThreshold: 0.8, // Scale up when 80% capacity
            scaleDownThreshold: 0.3, // Scale down when 30% capacity
            cooldownPeriod: 60000, // 1 minute cooldown
            lastScaleAction: 0,
            maxInstances: parseInt(process.env.CHATBOT_MAX_INSTANCES) || 5,
            minInstances: parseInt(process.env.CHATBOT_MIN_INSTANCES) || 1
        };

        // Circuit breaker for external services
        this.circuitBreaker = {
            gemini: {
                state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
                failures: 0,
                threshold: 5,
                timeout: 60000, // 1 minute
                lastFailure: 0
            }
        };

        this.initializeConnectionPool();
        this.startResourceMonitoring();
    }

    /**
     * Initialize connection pool
     */
    async initializeConnectionPool() {
        console.log('Initializing connection pool...');

        // Create minimum number of connections
        for (let i = 0; i < this.poolConfig.minConnections; i++) {
            await this.createConnection();
        }

        console.log(`Connection pool initialized with ${this.poolConfig.minConnections} connections`);
    }

    /**
     * Create a new database connection
     */
    async createConnection() {
        const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            const client = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY,
                {
                    db: {
                        schema: 'public'
                    },
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );

            const connection = {
                id: connectionId,
                client: client,
                created: Date.now(),
                lastUsed: Date.now(),
                inUse: false,
                requestCount: 0
            };

            this.connectionPool.set(connectionId, connection);
            this.resourceMetrics.connections.created++;
            this.resourceMetrics.connections.total++;
            this.resourceMetrics.connections.idle++;

            console.log(`Created connection: ${connectionId}`);
            return connection;

        } catch (error) {
            console.error('Failed to create connection:', error);
            throw error;
        }
    }

    /**
     * Acquire a connection from the pool
     */
    async acquireConnection(timeout = this.poolConfig.acquireTimeout) {
        const startTime = Date.now();

        return new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Connection acquire timeout'));
            }, timeout);

            try {
                // Look for available connection
                let connection = this.findAvailableConnection();

                if (!connection) {
                    // Create new connection if under limit
                    if (this.resourceMetrics.connections.total < this.poolConfig.maxConnections) {
                        connection = await this.createConnection();
                    } else {
                        // Wait for connection to become available
                        await this.waitForConnection();
                        connection = this.findAvailableConnection();
                    }
                }

                if (connection) {
                    connection.inUse = true;
                    connection.lastUsed = Date.now();
                    connection.requestCount++;

                    this.resourceMetrics.connections.active++;
                    this.resourceMetrics.connections.idle--;

                    clearTimeout(timeoutId);
                    resolve(connection);
                } else {
                    clearTimeout(timeoutId);
                    reject(new Error('No connection available'));
                }

            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    /**
     * Find an available connection
     */
    findAvailableConnection() {
        for (const connection of this.connectionPool.values()) {
            if (!connection.inUse && this.isConnectionValid(connection)) {
                return connection;
            }
        }
        return null;
    }

    /**
     * Check if connection is still valid
     */
    isConnectionValid(connection) {
        const now = Date.now();
        const age = now - connection.created;
        const idle = now - connection.lastUsed;

        // Check if connection exceeded max lifetime
        if (age > this.poolConfig.maxLifetime) {
            this.destroyConnection(connection.id);
            return false;
        }

        // Check if connection exceeded idle timeout
        if (idle > this.poolConfig.idleTimeout) {
            this.destroyConnection(connection.id);
            return false;
        }

        return true;
    }

    /**
     * Release a connection back to the pool
     */
    releaseConnection(connectionId) {
        const connection = this.connectionPool.get(connectionId);

        if (connection) {
            connection.inUse = false;
            connection.lastUsed = Date.now();

            this.resourceMetrics.connections.active--;
            this.resourceMetrics.connections.idle++;
        }
    }

    /**
     * Destroy a connection
     */
    destroyConnection(connectionId) {
        const connection = this.connectionPool.get(connectionId);

        if (connection) {
            this.connectionPool.delete(connectionId);
            this.resourceMetrics.connections.total--;
            this.resourceMetrics.connections.destroyed++;

            if (connection.inUse) {
                this.resourceMetrics.connections.active--;
            } else {
                this.resourceMetrics.connections.idle--;
            }

            console.log(`Destroyed connection: ${connectionId}`);
        }
    }

    /**
     * Wait for a connection to become available
     */
    async waitForConnection(maxWait = 5000) {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                const available = this.findAvailableConnection();
                if (available) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);

            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, maxWait);
        });
    }

    /**
     * Execute a database operation with connection pooling
     */
    async executeWithConnection(operation, options = {}) {
        const { timeout = 30000, retries = 3 } = options;
        let connection = null;
        let attempt = 0;

        while (attempt < retries) {
            try {
                connection = await this.acquireConnection(timeout);
                const result = await operation(connection.client);

                this.releaseConnection(connection.id);
                return result;

            } catch (error) {
                if (connection) {
                    this.releaseConnection(connection.id);
                }

                attempt++;
                if (attempt >= retries) {
                    throw error;
                }

                // Wait before retry with exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    /**
     * Queue a request for processing
     */
    async queueRequest(requestHandler, priority = 'normal') {
        return new Promise((resolve, reject) => {
            const request = {
                id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                handler: requestHandler,
                priority: priority,
                queued: Date.now(),
                resolve,
                reject
            };

            // Insert based on priority
            if (priority === 'high') {
                this.requestQueue.unshift(request);
            } else {
                this.requestQueue.push(request);
            }

            this.resourceMetrics.requests.queued++;
            this.processQueue();
        });
    }

    /**
     * Process the request queue
     */
    async processQueue() {
        if (this.activeRequests.size >= this.maxConcurrentRequests || this.requestQueue.length === 0) {
            return;
        }

        const request = this.requestQueue.shift();
        if (!request) return;

        this.resourceMetrics.requests.queued--;
        this.resourceMetrics.requests.active++;
        this.activeRequests.set(request.id, request);

        const waitTime = Date.now() - request.queued;
        this.updateAverageWaitTime(waitTime);

        try {
            const startTime = Date.now();
            const result = await request.handler();
            const processingTime = Date.now() - startTime;

            this.updateAverageProcessingTime(processingTime);
            this.resourceMetrics.requests.completed++;

            request.resolve(result);

        } catch (error) {
            this.resourceMetrics.requests.failed++;
            request.reject(error);
        } finally {
            this.activeRequests.delete(request.id);
            this.resourceMetrics.requests.active--;

            // Process next request
            setImmediate(() => this.processQueue());
        }
    }

    /**
     * Update average wait time
     */
    updateAverageWaitTime(waitTime) {
        const currentAvg = this.resourceMetrics.requests.avgWaitTime;
        const completed = this.resourceMetrics.requests.completed;

        this.resourceMetrics.requests.avgWaitTime =
            (currentAvg * completed + waitTime) / (completed + 1);
    }

    /**
     * Update average processing time
     */
    updateAverageProcessingTime(processingTime) {
        const currentAvg = this.resourceMetrics.requests.avgProcessingTime;
        const completed = this.resourceMetrics.requests.completed;

        this.resourceMetrics.requests.avgProcessingTime =
            (currentAvg * completed + processingTime) / (completed + 1);
    }

    /**
     * Check circuit breaker state
     */
    checkCircuitBreaker(service) {
        const breaker = this.circuitBreaker[service];
        if (!breaker) return true;

        const now = Date.now();

        switch (breaker.state) {
            case 'OPEN':
                if (now - breaker.lastFailure > breaker.timeout) {
                    breaker.state = 'HALF_OPEN';
                    console.log(`Circuit breaker for ${service} moved to HALF_OPEN`);
                    return true;
                }
                return false;

            case 'HALF_OPEN':
                return true;

            case 'CLOSED':
            default:
                return true;
        }
    }

    /**
     * Record circuit breaker success
     */
    recordCircuitBreakerSuccess(service) {
        const breaker = this.circuitBreaker[service];
        if (!breaker) return;

        if (breaker.state === 'HALF_OPEN') {
            breaker.state = 'CLOSED';
            breaker.failures = 0;
            console.log(`Circuit breaker for ${service} moved to CLOSED`);
        }
    }

    /**
     * Record circuit breaker failure
     */
    recordCircuitBreakerFailure(service) {
        const breaker = this.circuitBreaker[service];
        if (!breaker) return;

        breaker.failures++;
        breaker.lastFailure = Date.now();

        if (breaker.failures >= breaker.threshold) {
            breaker.state = 'OPEN';
            console.log(`Circuit breaker for ${service} moved to OPEN`);
        }
    }

    /**
     * Auto-scale resources based on load
     */
    async autoScale() {
        if (!this.autoScaling.enabled) return;

        const now = Date.now();
        if (now - this.autoScaling.lastScaleAction < this.autoScaling.cooldownPeriod) {
            return; // Still in cooldown
        }

        const currentLoad = this.getCurrentLoad();
        const currentConnections = this.resourceMetrics.connections.total;

        // Scale up if load is high
        if (currentLoad > this.autoScaling.scaleUpThreshold &&
            currentConnections < this.poolConfig.maxConnections) {

            const newConnections = Math.min(
                currentConnections + 2,
                this.poolConfig.maxConnections
            );

            for (let i = currentConnections; i < newConnections; i++) {
                await this.createConnection();
            }

            this.autoScaling.lastScaleAction = now;
            console.log(`Scaled up: added ${newConnections - currentConnections} connections`);
        }

        // Scale down if load is low
        else if (currentLoad < this.autoScaling.scaleDownThreshold &&
            currentConnections > this.poolConfig.minConnections) {

            const connectionsToRemove = Math.min(
                Math.floor((currentConnections - this.poolConfig.minConnections) / 2),
                2
            );

            // Remove idle connections
            let removed = 0;
            for (const [id, connection] of this.connectionPool.entries()) {
                if (!connection.inUse && removed < connectionsToRemove) {
                    this.destroyConnection(id);
                    removed++;
                }
            }

            if (removed > 0) {
                this.autoScaling.lastScaleAction = now;
                console.log(`Scaled down: removed ${removed} connections`);
            }
        }
    }

    /**
     * Calculate current system load
     */
    getCurrentLoad() {
        const connectionLoad = this.resourceMetrics.connections.active / this.poolConfig.maxConnections;
        const requestLoad = this.activeRequests.size / this.maxConcurrentRequests;
        const queueLoad = Math.min(this.requestQueue.length / 100, 1); // Cap at 100 queued requests

        return Math.max(connectionLoad, requestLoad, queueLoad);
    }

    /**
     * Start resource monitoring
     */
    startResourceMonitoring() {
        // Monitor every 30 seconds
        setInterval(() => {
            this.updateResourceMetrics();
            this.autoScale();
            this.cleanupExpiredConnections();
        }, 30000);

        // Detailed monitoring every 5 minutes
        setInterval(() => {
            this.logResourceStatus();
        }, 300000);
    }

    /**
     * Update resource metrics
     */
    updateResourceMetrics() {
        // Update memory metrics
        const memUsage = process.memoryUsage();
        this.resourceMetrics.memory = {
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external,
            rss: memUsage.rss
        };

        // Update CPU metrics (simplified)
        this.resourceMetrics.cpu.loadAverage = process.loadavg ? process.loadavg() : [0, 0, 0];
    }

    /**
     * Clean up expired connections
     */
    cleanupExpiredConnections() {
        const now = Date.now();
        const connectionsToRemove = [];

        for (const [id, connection] of this.connectionPool.entries()) {
            if (!connection.inUse && !this.isConnectionValid(connection)) {
                connectionsToRemove.push(id);
            }
        }

        connectionsToRemove.forEach(id => {
            this.destroyConnection(id);
        });

        if (connectionsToRemove.length > 0) {
            console.log(`Cleaned up ${connectionsToRemove.length} expired connections`);
        }
    }

    /**
     * Log resource status
     */
    logResourceStatus() {
        const status = this.getResourceStatus();
        console.log('Resource Status:', JSON.stringify(status, null, 2));
    }

    /**
     * Get current resource status
     */
    getResourceStatus() {
        return {
            timestamp: new Date().toISOString(),
            connections: { ...this.resourceMetrics.connections },
            requests: { ...this.resourceMetrics.requests },
            memory: {
                ...this.resourceMetrics.memory,
                heapUsedMB: Math.round(this.resourceMetrics.memory.heapUsed / 1024 / 1024),
                heapTotalMB: Math.round(this.resourceMetrics.memory.heapTotal / 1024 / 1024),
                rssMB: Math.round(this.resourceMetrics.memory.rss / 1024 / 1024)
            },
            cpu: { ...this.resourceMetrics.cpu },
            load: this.getCurrentLoad(),
            circuitBreakers: Object.fromEntries(
                Object.entries(this.circuitBreaker).map(([service, breaker]) => [
                    service,
                    {
                        state: breaker.state,
                        failures: breaker.failures,
                        lastFailure: breaker.lastFailure
                    }
                ])
            ),
            autoScaling: {
                enabled: this.autoScaling.enabled,
                lastAction: this.autoScaling.lastScaleAction,
                cooldownRemaining: Math.max(0,
                    this.autoScaling.cooldownPeriod - (Date.now() - this.autoScaling.lastScaleAction)
                )
            }
        };
    }

    /**
     * Get performance recommendations
     */
    getPerformanceRecommendations() {
        const status = this.getResourceStatus();
        const recommendations = [];

        // Connection pool recommendations
        if (status.connections.active / status.connections.total > 0.9) {
            recommendations.push({
                type: 'warning',
                category: 'connections',
                message: 'Connection pool utilization is very high',
                recommendation: 'Consider increasing max connections or optimizing query performance'
            });
        }

        // Request queue recommendations
        if (status.requests.queued > 50) {
            recommendations.push({
                type: 'warning',
                category: 'requests',
                message: 'Request queue is building up',
                recommendation: 'Consider increasing concurrent request limit or optimizing request processing'
            });
        }

        // Memory recommendations
        if (status.memory.heapUsedMB > 500) {
            recommendations.push({
                type: 'info',
                category: 'memory',
                message: 'Memory usage is elevated',
                recommendation: 'Monitor for memory leaks and consider garbage collection optimization'
            });
        }

        // Circuit breaker recommendations
        Object.entries(status.circuitBreakers).forEach(([service, breaker]) => {
            if (breaker.state === 'OPEN') {
                recommendations.push({
                    type: 'error',
                    category: 'circuit_breaker',
                    message: `Circuit breaker for ${service} is OPEN`,
                    recommendation: `Check ${service} service health and connectivity`
                });
            }
        });

        return recommendations;
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        console.log('Shutting down resource manager...');

        // Wait for active requests to complete (with timeout)
        const shutdownTimeout = 30000; // 30 seconds
        const startTime = Date.now();

        while (this.activeRequests.size > 0 && (Date.now() - startTime) < shutdownTimeout) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Close all connections
        for (const [id, connection] of this.connectionPool.entries()) {
            this.destroyConnection(id);
        }

        console.log('Resource manager shutdown complete');
    }
}

// Export singleton instance
export default new ChatbotResourceManager();