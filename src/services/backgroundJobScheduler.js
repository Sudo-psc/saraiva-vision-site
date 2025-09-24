/**
 * Background Job Scheduler
 * Handles scheduled tasks for Google Business review synchronization
 */

/**
 * Background Job Scheduler Class
 * Manages scheduled jobs, job queues, and job execution
 */
class BackgroundJobScheduler {
    constructor(options = {}) {
        this.options = {
            // Job execution settings
            maxConcurrentJobs: options.maxConcurrentJobs || 3,
            jobTimeout: options.jobTimeout || 300000, // 5 minutes
            retryAttempts: options.retryAttempts || 3,
            retryDelay: options.retryDelay || 60000, // 1 minute

            // Scheduling settings
            defaultInterval: options.defaultInterval || 86400000, // 24 hours
            enableScheduling: options.enableScheduling !== false,

            // Monitoring settings
            enableLogging: options.enableLogging !== false,
            enableMetrics: options.enableMetrics !== false,

            // Storage settings
            persistJobs: options.persistJobs !== false,
            cleanupInterval: options.cleanupInterval || 3600000, // 1 hour
        };

        // Job management
        this.jobs = new Map();
        this.scheduledJobs = new Map();
        this.runningJobs = new Map();
        this.jobQueue = [];
        this.jobHistory = [];

        // Statistics
        this.stats = {
            totalJobs: 0,
            successfulJobs: 0,
            failedJobs: 0,
            retriedJobs: 0,
            averageExecutionTime: 0,
            lastCleanup: new Date(),
            uptime: Date.now()
        };

        // Intervals
        this.schedulerInterval = null;
        this.cleanupInterval = null;
        this.queueProcessorInterval = null;

        this.log('BackgroundJobScheduler initialized', this.options);
    }

    /**
     * Start the job scheduler
     */
    async start() {
        if (this.schedulerInterval) {
            this.log('Scheduler already running');
            return;
        }

        try {
            // Start the main scheduler loop
            if (this.options.enableScheduling) {
                this.schedulerInterval = setInterval(() => {
                    this.processScheduledJobs();
                }, 60000); // Check every minute
            }

            // Start the job queue processor
            this.queueProcessorInterval = setInterval(() => {
                this.processJobQueue();
            }, 5000); // Process queue every 5 seconds

            // Start cleanup interval
            if (this.options.cleanupInterval > 0) {
                this.cleanupInterval = setInterval(() => {
                    this.cleanup();
                }, this.options.cleanupInterval);
            }

            this.log('Background job scheduler started');
            return true;
        } catch (error) {
            this.log('Error starting scheduler:', error);
            throw error;
        }
    }

    /**
     * Stop the job scheduler
     */
    async stop() {
        try {
            // Clear intervals
            if (this.schedulerInterval) {
                clearInterval(this.schedulerInterval);
                this.schedulerInterval = null;
            }

            if (this.queueProcessorInterval) {
                clearInterval(this.queueProcessorInterval);
                this.queueProcessorInterval = null;
            }

            if (this.cleanupInterval) {
                clearInterval(this.cleanupInterval);
                this.cleanupInterval = null;
            }

            // Wait for running jobs to complete (with timeout)
            await this.waitForRunningJobs(30000); // 30 seconds timeout

            this.log('Background job scheduler stopped');
            return true;
        } catch (error) {
            this.log('Error stopping scheduler:', error);
            throw error;
        }
    }

    /**
     * Register a job type
     * @param {string} jobType - Unique job type identifier
     * @param {Function} handler - Job execution function
     * @param {Object} options - Job-specific options
     */
    registerJob(jobType, handler, options = {}) {
        if (!jobType || typeof handler !== 'function') {
            throw new Error('Job type and handler function are required');
        }

        const jobConfig = {
            type: jobType,
            handler,
            timeout: options.timeout || this.options.jobTimeout,
            retryAttempts: options.retryAttempts || this.options.retryAttempts,
            retryDelay: options.retryDelay || this.options.retryDelay,
            priority: options.priority || 0,
            enabled: options.enabled !== false,
            ...options
        };

        this.jobs.set(jobType, jobConfig);
        this.log(`Registered job type: ${jobType}`);
        return true;
    }

    /**
     * Schedule a recurring job
     * @param {string} jobType - Job type to schedule
     * @param {number} interval - Interval in milliseconds
     * @param {Object} jobData - Data to pass to job handler
     * @param {Object} options - Scheduling options
     */
    scheduleJob(jobType, interval, jobData = {}, options = {}) {
        if (!this.jobs.has(jobType)) {
            throw new Error(`Job type '${jobType}' not registered`);
        }

        const scheduleId = options.scheduleId || `${jobType}_${Date.now()}`;
        const schedule = {
            id: scheduleId,
            jobType,
            interval,
            jobData,
            nextRun: Date.now() + interval,
            lastRun: null,
            enabled: options.enabled !== false,
            runCount: 0,
            maxRuns: options.maxRuns || null,
            createdAt: new Date(),
            ...options
        };

        this.scheduledJobs.set(scheduleId, schedule);
        this.log(`Scheduled job: ${jobType} (${scheduleId}) - interval: ${interval}ms`);
        return scheduleId;
    }

    /**
     * Queue a job for immediate execution
     * @param {string} jobType - Job type to execute
     * @param {Object} jobData - Data to pass to job handler
     * @param {Object} options - Job execution options
     */
    queueJob(jobType, jobData = {}, options = {}) {
        if (!this.jobs.has(jobType)) {
            throw new Error(`Job type '${jobType}' not registered`);
        }

        const jobId = options.jobId || `${jobType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const job = {
            id: jobId,
            type: jobType,
            data: jobData,
            priority: options.priority || 0,
            attempts: 0,
            maxAttempts: options.maxAttempts || this.jobs.get(jobType).retryAttempts,
            createdAt: new Date(),
            scheduledFor: options.delay ? Date.now() + options.delay : Date.now(),
            ...options
        };

        // Insert job in priority order
        const insertIndex = this.jobQueue.findIndex(queuedJob =>
            queuedJob.priority < job.priority ||
            (queuedJob.priority === job.priority && queuedJob.scheduledFor > job.scheduledFor)
        );

        if (insertIndex === -1) {
            this.jobQueue.push(job);
        } else {
            this.jobQueue.splice(insertIndex, 0, job);
        }

        this.log(`Queued job: ${jobType} (${jobId})`);
        return jobId;
    }

    /**
     * Process scheduled jobs
     */
    async processScheduledJobs() {
        const now = Date.now();

        for (const [scheduleId, schedule] of this.scheduledJobs) {
            if (!schedule.enabled || schedule.nextRun > now) {
                continue;
            }

            // Check if max runs reached
            if (schedule.maxRuns && schedule.runCount >= schedule.maxRuns) {
                this.log(`Schedule ${scheduleId} reached max runs (${schedule.maxRuns})`);
                this.scheduledJobs.delete(scheduleId);
                continue;
            }

            // Queue the job
            try {
                const jobId = this.queueJob(schedule.jobType, schedule.jobData, {
                    scheduleId,
                    priority: schedule.priority || 0
                });

                // Update schedule
                schedule.lastRun = now;
                schedule.nextRun = now + schedule.interval;
                schedule.runCount++;

                this.log(`Scheduled job queued: ${schedule.jobType} (${jobId}) from schedule ${scheduleId}`);
            } catch (error) {
                this.log(`Error queuing scheduled job ${scheduleId}:`, error);
            }
        }
    }

    /**
     * Process job queue
     */
    async processJobQueue() {
        // Check if we can run more jobs
        if (this.runningJobs.size >= this.options.maxConcurrentJobs) {
            return;
        }

        // Find next job to run
        const now = Date.now();
        const jobIndex = this.jobQueue.findIndex(job => job.scheduledFor <= now);

        if (jobIndex === -1) {
            return;
        }

        // Remove job from queue
        const job = this.jobQueue.splice(jobIndex, 1)[0];

        // Execute job
        this.executeJob(job);
    }

    /**
     * Execute a job
     * @param {Object} job - Job to execute
     */
    async executeJob(job) {
        const jobConfig = this.jobs.get(job.type);
        if (!jobConfig || !jobConfig.enabled) {
            this.log(`Job type ${job.type} not found or disabled`);
            return;
        }

        const startTime = Date.now();
        job.attempts++;
        job.startedAt = new Date();

        // Add to running jobs
        this.runningJobs.set(job.id, job);

        try {
            this.log(`Executing job: ${job.type} (${job.id}) - attempt ${job.attempts}`);

            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Job timeout')), jobConfig.timeout);
            });

            // Execute job with timeout
            const result = await Promise.race([
                jobConfig.handler(job.data, job),
                timeoutPromise
            ]);

            // Job completed successfully
            const executionTime = Date.now() - startTime;
            job.completedAt = new Date();
            job.result = result;
            job.status = 'completed';

            this.stats.totalJobs++;
            this.stats.successfulJobs++;
            this.updateAverageExecutionTime(executionTime);

            this.log(`Job completed: ${job.type} (${job.id}) in ${executionTime}ms`);

        } catch (error) {
            const executionTime = Date.now() - startTime;
            job.error = error.message;
            job.failedAt = new Date();

            this.log(`Job failed: ${job.type} (${job.id}) - ${error.message}`);

            // Check if we should retry
            if (job.attempts < job.maxAttempts) {
                // Schedule retry
                const retryDelay = jobConfig.retryDelay * Math.pow(2, job.attempts - 1); // Exponential backoff
                job.scheduledFor = Date.now() + retryDelay;
                job.status = 'retrying';

                // Add back to queue
                this.jobQueue.push(job);
                this.stats.retriedJobs++;

                this.log(`Job scheduled for retry: ${job.type} (${job.id}) in ${retryDelay}ms`);
            } else {
                // Job failed permanently
                job.status = 'failed';
                this.stats.totalJobs++;
                this.stats.failedJobs++;
                this.updateAverageExecutionTime(executionTime);

                this.log(`Job failed permanently: ${job.type} (${job.id})`);
            }
        } finally {
            // Remove from running jobs
            this.runningJobs.delete(job.id);

            // Add to history
            this.addToHistory(job);
        }
    }

    /**
     * Cancel a scheduled job
     * @param {string} scheduleId - Schedule ID to cancel
     */
    cancelScheduledJob(scheduleId) {
        if (this.scheduledJobs.has(scheduleId)) {
            this.scheduledJobs.delete(scheduleId);
            this.log(`Cancelled scheduled job: ${scheduleId}`);
            return true;
        }
        return false;
    }

    /**
     * Cancel a queued job
     * @param {string} jobId - Job ID to cancel
     */
    cancelQueuedJob(jobId) {
        const jobIndex = this.jobQueue.findIndex(job => job.id === jobId);
        if (jobIndex !== -1) {
            const job = this.jobQueue.splice(jobIndex, 1)[0];
            job.status = 'cancelled';
            job.cancelledAt = new Date();
            this.addToHistory(job);
            this.log(`Cancelled queued job: ${jobId}`);
            return true;
        }
        return false;
    }

    /**
     * Get scheduler status
     */
    getStatus() {
        return {
            isRunning: !!this.schedulerInterval,
            registeredJobs: Array.from(this.jobs.keys()),
            scheduledJobs: this.scheduledJobs.size,
            queuedJobs: this.jobQueue.length,
            runningJobs: this.runningJobs.size,
            stats: {
                ...this.stats,
                uptime: Date.now() - this.stats.uptime
            },
            nextScheduledRun: this.getNextScheduledRun()
        };
    }

    /**
     * Get job history
     * @param {number} limit - Maximum number of jobs to return
     */
    getJobHistory(limit = 50) {
        return this.jobHistory
            .slice(-limit)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * Get running jobs
     */
    getRunningJobs() {
        return Array.from(this.runningJobs.values());
    }

    /**
     * Get queued jobs
     */
    getQueuedJobs() {
        return [...this.jobQueue];
    }

    /**
     * Get scheduled jobs
     */
    getScheduledJobs() {
        return Array.from(this.scheduledJobs.values());
    }

    /**
     * Clean up old job history and completed jobs
     */
    cleanup() {
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

        // Clean up job history
        this.jobHistory = this.jobHistory.filter(job =>
            now - new Date(job.createdAt).getTime() < maxAge
        );

        // Clean up completed scheduled jobs
        for (const [scheduleId, schedule] of this.scheduledJobs) {
            if (schedule.maxRuns && schedule.runCount >= schedule.maxRuns) {
                this.scheduledJobs.delete(scheduleId);
            }
        }

        this.stats.lastCleanup = new Date();
        this.log('Cleanup completed');
    }

    // Private methods

    /**
     * Wait for running jobs to complete
     * @param {number} timeout - Timeout in milliseconds
     */
    async waitForRunningJobs(timeout = 30000) {
        const startTime = Date.now();

        while (this.runningJobs.size > 0 && (Date.now() - startTime) < timeout) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (this.runningJobs.size > 0) {
            this.log(`Warning: ${this.runningJobs.size} jobs still running after timeout`);
        }
    }

    /**
     * Add job to history
     * @param {Object} job - Job to add to history
     */
    addToHistory(job) {
        // Keep only essential information
        const historyEntry = {
            id: job.id,
            type: job.type,
            status: job.status,
            attempts: job.attempts,
            createdAt: job.createdAt,
            startedAt: job.startedAt,
            completedAt: job.completedAt,
            failedAt: job.failedAt,
            cancelledAt: job.cancelledAt,
            error: job.error,
            scheduleId: job.scheduleId
        };

        this.jobHistory.push(historyEntry);

        // Keep history size manageable
        if (this.jobHistory.length > 1000) {
            this.jobHistory = this.jobHistory.slice(-500);
        }
    }

    /**
     * Update average execution time
     * @param {number} executionTime - Execution time in milliseconds
     */
    updateAverageExecutionTime(executionTime) {
        const totalJobs = this.stats.successfulJobs + this.stats.failedJobs;
        if (totalJobs === 1) {
            this.stats.averageExecutionTime = executionTime;
        } else {
            this.stats.averageExecutionTime =
                (this.stats.averageExecutionTime * (totalJobs - 1) + executionTime) / totalJobs;
        }
    }

    /**
     * Get next scheduled run time
     */
    getNextScheduledRun() {
        let nextRun = null;

        for (const schedule of this.scheduledJobs.values()) {
            if (schedule.enabled && (!nextRun || schedule.nextRun < nextRun)) {
                nextRun = schedule.nextRun;
            }
        }

        return nextRun ? new Date(nextRun) : null;
    }

    /**
     * Log messages if logging is enabled
     * @param {string} message - Log message
     * @param {Object} data - Additional data to log
     */
    log(message, data = null) {
        if (this.options.enableLogging) {
            const timestamp = new Date().toISOString();
            console.log(`[BackgroundJobScheduler] ${timestamp}: ${message}`, data || '');
        }
    }
}

export default BackgroundJobScheduler;