/**
 * Data Management Scheduler
 * Handles scheduled execution of data retention, anonymization, and cleanup tasks
 */

import DataManagementService from './dataManagementService.js';
import DataAnonymizationService from './dataAnonymizationService.js';

class DataManagementScheduler {
    constructor() {
        this.dataManagementService = new DataManagementService();
        this.anonymizationService = new DataAnonymizationService();

        this.schedules = {
            dataRetention: {
                enabled: process.env.DATA_RETENTION_SCHEDULE_ENABLED === 'true',
                cron: process.env.DATA_RETENTION_CRON || '0 2 * * *', // Daily at 2 AM
                lastRun: null,
                nextRun: null,
                isRunning: false
            },
            dataAnonymization: {
                enabled: process.env.DATA_ANONYMIZATION_SCHEDULE_ENABLED === 'true',
                cron: process.env.DATA_ANONYMIZATION_CRON || '0 3 * * 0', // Weekly on Sunday at 3 AM
                lastRun: null,
                nextRun: null,
                isRunning: false
            },
            exportCleanup: {
                enabled: process.env.EXPORT_CLEANUP_SCHEDULE_ENABLED === 'true',
                cron: process.env.EXPORT_CLEANUP_CRON || '0 4 * * *', // Daily at 4 AM
                lastRun: null,
                nextRun: null,
                isRunning: false
            },
            complianceReporting: {
                enabled: process.env.COMPLIANCE_REPORTING_SCHEDULE_ENABLED === 'true',
                cron: process.env.COMPLIANCE_REPORTING_CRON || '0 6 * * 1', // Weekly on Monday at 6 AM
                lastRun: null,
                nextRun: null,
                isRunning: false
            }
        };

        this.jobHistory = [];
        this.maxHistorySize = 1000;
        this.isInitialized = false;
    }

    /**
     * Initializes the scheduler
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            console.log('Initializing Data Management Scheduler...');

            // Calculate next run times
            for (const [jobName, schedule] of Object.entries(this.schedules)) {
                if (schedule.enabled) {
                    schedule.nextRun = this.calculateNextRun(schedule.cron);
                    console.log(`${jobName} scheduled for: ${schedule.nextRun}`);
                }
            }

            // Start the scheduler loop
            this.startSchedulerLoop();

            this.isInitialized = true;
            console.log('Data Management Scheduler initialized successfully');

        } catch (error) {
            console.error('Error initializing scheduler:', error);
            throw error;
        }
    }

    /**
     * Starts the main scheduler loop
     */
    startSchedulerLoop() {
        // Check every minute for scheduled jobs
        setInterval(async () => {
            await this.checkAndRunScheduledJobs();
        }, 60 * 1000); // 1 minute

        console.log('Scheduler loop started');
    }

    /**
     * Checks and runs scheduled jobs
     */
    async checkAndRunScheduledJobs() {
        const now = new Date();

        for (const [jobName, schedule] of Object.entries(this.schedules)) {
            if (schedule.enabled &&
                schedule.nextRun &&
                now >= schedule.nextRun &&
                !schedule.isRunning) {

                console.log(`Running scheduled job: ${jobName}`);
                await this.runScheduledJob(jobName, schedule);
            }
        }
    }

    /**
     * Runs a specific scheduled job
     */
    async runScheduledJob(jobName, schedule) {
        const jobId = this.generateJobId();
        const startTime = new Date();

        try {
            schedule.isRunning = true;
            schedule.lastRun = startTime;

            let result;
            switch (jobName) {
                case 'dataRetention':
                    result = await this.runDataRetentionJob();
                    break;
                case 'dataAnonymization':
                    result = await this.runDataAnonymizationJob();
                    break;
                case 'exportCleanup':
                    result = await this.runExportCleanupJob();
                    break;
                case 'complianceReporting':
                    result = await this.runComplianceReportingJob();
                    break;
                default:
                    throw new Error(`Unknown job: ${jobName}`);
            }

            // Log successful job completion
            this.logJobExecution({
                jobId,
                jobName,
                startTime,
                endTime: new Date(),
                status: 'SUCCESS',
                result
            });

            console.log(`Scheduled job ${jobName} completed successfully`);

        } catch (error) {
            console.error(`Error running scheduled job ${jobName}:`, error);

            // Log failed job execution
            this.logJobExecution({
                jobId,
                jobName,
                startTime,
                endTime: new Date(),
                status: 'FAILED',
                error: error.message
            });

        } finally {
            schedule.isRunning = false;
            schedule.nextRun = this.calculateNextRun(schedule.cron);
        }
    }

    /**
     * Runs the data retention job
     */
    async runDataRetentionJob() {
        const options = {
            dryRun: false,
            dataTypes: ['ALL'],
            batchSize: parseInt(process.env.RETENTION_BATCH_SIZE) || 100,
            maxProcessingTime: parseInt(process.env.MAX_PROCESSING_TIME) || 30 * 60 * 1000
        };

        const result = await this.dataManagementService.runAutomatedDataRetention(options);

        // Send notification if there are errors or significant processing
        if (result.results?.errors?.length > 0 || result.results?.processed > 100) {
            await this.sendJobNotification('dataRetention', result);
        }

        return result;
    }

    /**
     * Runs the data anonymization job
     */
    async runDataAnonymizationJob() {
        const options = {
            dataTypes: ['CONVERSATION_DATA', 'SESSION_DATA'],
            retentionThreshold: parseInt(process.env.ANONYMIZATION_THRESHOLD) || 365,
            batchSize: parseInt(process.env.ANONYMIZATION_BATCH_SIZE) || 50
        };

        const result = await this.dataManagementService.runAutomatedAnonymization(options);

        // Send notification for significant anonymization activity
        if (result.results?.anonymized > 50) {
            await this.sendJobNotification('dataAnonymization', result);
        }

        return result;
    }

    /**
     * Runs the export cleanup job
     */
    async runExportCleanupJob() {
        try {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() - (parseInt(process.env.EXPORT_EXPIRY_DAYS) || 7));

            const activeExports = this.dataManagementService.processingStatus.export.activeExports;
            let cleanedCount = 0;

            // Clean up expired exports
            for (const [exportId, exportRecord] of activeExports) {
                if (exportRecord.expiresAt && exportRecord.expiresAt < expiryDate) {
                    // Remove export file if it exists
                    await this.cleanupExportFile(exportRecord);

                    // Remove from active exports
                    activeExports.delete(exportId);
                    cleanedCount++;
                }
            }

            // Clean up old pseudonymization mappings
            const mappingCleanupCount = await this.cleanupPseudonymizationMappings();

            return {
                success: true,
                cleanedExports: cleanedCount,
                cleanedMappings: mappingCleanupCount
            };

        } catch (error) {
            console.error('Error in export cleanup job:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Runs the compliance reporting job
     */
    async runComplianceReportingJob() {
        try {
            const statistics = await this.dataManagementService.getDataManagementStatistics();

            const report = {
                reportDate: new Date(),
                statistics,
                complianceStatus: this.assessComplianceStatus(statistics),
                recommendations: this.generateRecommendations(statistics)
            };

            // Store compliance report
            await this.storeComplianceReport(report);

            // Send report to stakeholders if needed
            if (report.complianceStatus.overallScore < 95) {
                await this.sendComplianceAlert(report);
            }

            return {
                success: true,
                report
            };

        } catch (error) {
            console.error('Error in compliance reporting job:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Manually triggers a specific job
     */
    async triggerJob(jobName, options = {}) {
        const schedule = this.schedules[jobName];
        if (!schedule) {
            throw new Error(`Unknown job: ${jobName}`);
        }

        if (schedule.isRunning) {
            throw new Error(`Job ${jobName} is already running`);
        }

        console.log(`Manually triggering job: ${jobName}`);
        return await this.runScheduledJob(jobName, schedule);
    }

    /**
     * Gets scheduler status
     */
    getSchedulerStatus() {
        return {
            isInitialized: this.isInitialized,
            schedules: Object.fromEntries(
                Object.entries(this.schedules).map(([name, schedule]) => [
                    name,
                    {
                        enabled: schedule.enabled,
                        cron: schedule.cron,
                        lastRun: schedule.lastRun,
                        nextRun: schedule.nextRun,
                        isRunning: schedule.isRunning
                    }
                ])
            ),
            recentJobs: this.jobHistory.slice(-10)
        };
    }

    /**
     * Updates job schedule
     */
    updateJobSchedule(jobName, newCron, enabled = true) {
        const schedule = this.schedules[jobName];
        if (!schedule) {
            throw new Error(`Unknown job: ${jobName}`);
        }

        schedule.cron = newCron;
        schedule.enabled = enabled;
        schedule.nextRun = enabled ? this.calculateNextRun(newCron) : null;

        console.log(`Updated schedule for ${jobName}: ${newCron} (enabled: ${enabled})`);
    }

    // Helper methods

    calculateNextRun(cronExpression) {
        // Simple cron parser for basic expressions
        // In production, use a proper cron library like node-cron
        const now = new Date();
        const [minute, hour, dayOfMonth, month, dayOfWeek] = cronExpression.split(' ');

        const nextRun = new Date(now);
        nextRun.setSeconds(0);
        nextRun.setMilliseconds(0);

        // Set minute and hour
        nextRun.setMinutes(parseInt(minute) || 0);
        nextRun.setHours(parseInt(hour) || 0);

        // If the time has passed today, move to tomorrow
        if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 1);
        }

        return nextRun;
    }

    generateJobId() {
        return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    logJobExecution(execution) {
        this.jobHistory.push({
            ...execution,
            duration: execution.endTime - execution.startTime
        });

        // Maintain history size limit
        if (this.jobHistory.length > this.maxHistorySize) {
            this.jobHistory = this.jobHistory.slice(-this.maxHistorySize);
        }
    }

    async cleanupExportFile(exportRecord) {
        // Implementation would remove the actual export file
        console.log(`Cleaning up export file: ${exportRecord.id}`);
    }

    async cleanupPseudonymizationMappings() {
        const now = new Date();
        let cleanedCount = 0;

        for (const [id, mapping] of this.anonymizationService.pseudonymizationMappings) {
            if (mapping.expiresAt && mapping.expiresAt < now) {
                this.anonymizationService.pseudonymizationMappings.delete(id);
                cleanedCount++;
            }
        }

        return cleanedCount;
    }

    assessComplianceStatus(statistics) {
        const scores = {
            dataRetention: statistics.compliance?.dataRetentionCompliance || 0,
            anonymization: statistics.compliance?.anonymizationCompliance || 0,
            userRights: statistics.compliance?.userRightsFulfillment || 0
        };

        const overallScore = (scores.dataRetention + scores.anonymization + scores.userRights) / 3;

        return {
            scores,
            overallScore,
            status: overallScore >= 95 ? 'EXCELLENT' :
                overallScore >= 90 ? 'GOOD' :
                    overallScore >= 80 ? 'ACCEPTABLE' : 'NEEDS_ATTENTION'
        };
    }

    generateRecommendations(statistics) {
        const recommendations = [];

        if (statistics.retention?.overdueItems > 0) {
            recommendations.push({
                type: 'DATA_RETENTION',
                priority: 'HIGH',
                message: `${statistics.retention.overdueItems} items are overdue for retention processing`
            });
        }

        if (statistics.compliance?.dataRetentionCompliance < 90) {
            recommendations.push({
                type: 'COMPLIANCE',
                priority: 'MEDIUM',
                message: 'Data retention compliance is below 90%. Review retention policies.'
            });
        }

        if (statistics.exports?.activeExports > 10) {
            recommendations.push({
                type: 'PERFORMANCE',
                priority: 'LOW',
                message: 'High number of active exports. Consider increasing cleanup frequency.'
            });
        }

        return recommendations;
    }

    async storeComplianceReport(report) {
        // Implementation would store the report in database
        console.log('Storing compliance report:', report.reportDate);
    }

    async sendJobNotification(jobName, result) {
        // Implementation would send notifications to administrators
        console.log(`Sending notification for job: ${jobName}`, result);
    }

    async sendComplianceAlert(report) {
        // Implementation would send compliance alerts
        console.log('Sending compliance alert:', report.complianceStatus);
    }
}

export default DataManagementScheduler;