/**
 * Data Management Scheduler Tests
 * Tests for scheduled data management operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import DataManagementScheduler from '../dataManagementScheduler.js';

describe('DataManagementScheduler', () => {
    let scheduler;
    let mockDataManagementService;
    let mockAnonymizationService;

    beforeEach(() => {
        // Mock environment variables
        process.env.DATA_RETENTION_SCHEDULE_ENABLED = 'true';
        process.env.DATA_ANONYMIZATION_SCHEDULE_ENABLED = 'true';
        process.env.EXPORT_CLEANUP_SCHEDULE_ENABLED = 'true';
        process.env.COMPLIANCE_REPORTING_SCHEDULE_ENABLED = 'true';

        // Mock services
        mockDataManagementService = {
            runAutomatedDataRetention: vi.fn().mockResolvedValue({
                success: true,
                results: { processed: 10, anonymized: 5, deleted: 5, errors: [] }
            }),
            runAutomatedAnonymization: vi.fn().mockResolvedValue({
                success: true,
                results: { processed: 20, anonymized: 20, errors: [] }
            }),
            getDataManagementStatistics: vi.fn().mockResolvedValue({
                retention: { overdueItems: 0 },
                compliance: {
                    dataRetentionCompliance: 95.5,
                    anonymizationCompliance: 98.2,
                    userRightsFulfillment: 99.1
                }
            }),
            processingStatus: {
                export: {
                    activeExports: new Map()
                }
            }
        };

        mockAnonymizationService = {
            pseudonymizationMappings: new Map()
        };

        scheduler = new DataManagementScheduler();
        scheduler.dataManagementService = mockDataManagementService;
        scheduler.anonymizationService = mockAnonymizationService;

        // Mock console methods
        vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();

        // Clear environment variables
        delete process.env.DATA_RETENTION_SCHEDULE_ENABLED;
        delete process.env.DATA_ANONYMIZATION_SCHEDULE_ENABLED;
        delete process.env.EXPORT_CLEANUP_SCHEDULE_ENABLED;
        delete process.env.COMPLIANCE_REPORTING_SCHEDULE_ENABLED;
    });

    describe('initialization', () => {
        it('should initialize scheduler with default settings', async () => {
            await scheduler.initialize();

            expect(scheduler.isInitialized).toBe(true);
            expect(scheduler.schedules.dataRetention.enabled).toBe(true);
            expect(scheduler.schedules.dataAnonymization.enabled).toBe(true);
            expect(scheduler.schedules.exportCleanup.enabled).toBe(true);
            expect(scheduler.schedules.complianceReporting.enabled).toBe(true);
        });

        it('should calculate next run times for enabled jobs', async () => {
            await scheduler.initialize();

            for (const [jobName, schedule] of Object.entries(scheduler.schedules)) {
                if (schedule.enabled) {
                    expect(schedule.nextRun).toBeInstanceOf(Date);
                    expect(schedule.nextRun.getTime()).toBeGreaterThan(Date.now());
                }
            }
        });

        it('should not initialize twice', async () => {
            await scheduler.initialize();
            const firstInitTime = scheduler.isInitialized;

            await scheduler.initialize();
            expect(scheduler.isInitialized).toBe(firstInitTime);
        });
    });

    describe('job scheduling', () => {
        beforeEach(async () => {
            await scheduler.initialize();
        });

        it('should run data retention job', async () => {
            const result = await scheduler.runDataRetentionJob();

            expect(result.success).toBe(true);
            expect(mockDataManagementService.runAutomatedDataRetention).toHaveBeenCalledWith({
                dryRun: false,
                dataTypes: ['ALL'],
                batchSize: 100,
                maxProcessingTime: 30 * 60 * 1000
            });
        });

        it('should run data anonymization job', async () => {
            const result = await scheduler.runDataAnonymizationJob();

            expect(result.success).toBe(true);
            expect(mockDataManagementService.runAutomatedAnonymization).toHaveBeenCalledWith({
                dataTypes: ['CONVERSATION_DATA', 'SESSION_DATA'],
                retentionThreshold: 365,
                batchSize: 50
            });
        });

        it('should run export cleanup job', async () => {
            // Add expired export to test cleanup
            const expiredDate = new Date();
            expiredDate.setDate(expiredDate.getDate() - 10); // 10 days ago

            mockDataManagementService.processingStatus.export.activeExports.set('export_1', {
                id: 'export_1',
                expiresAt: expiredDate
            });

            const result = await scheduler.runExportCleanupJob();

            expect(result.success).toBe(true);
            expect(result.cleanedExports).toBe(1);
            expect(mockDataManagementService.processingStatus.export.activeExports.size).toBe(0);
        });

        it('should run compliance reporting job', async () => {
            const result = await scheduler.runComplianceReportingJob();

            expect(result.success).toBe(true);
            expect(result.report).toBeDefined();
            expect(result.report.reportDate).toBeInstanceOf(Date);
            expect(result.report.statistics).toBeDefined();
            expect(result.report.complianceStatus).toBeDefined();
        });
    });

    describe('manual job triggering', () => {
        beforeEach(async () => {
            await scheduler.initialize();
        });

        it('should manually trigger data retention job', async () => {
            const result = await scheduler.triggerJob('dataRetention');

            expect(mockDataManagementService.runAutomatedDataRetention).toHaveBeenCalled();
            expect(scheduler.jobHistory).toHaveLength(1);
            expect(scheduler.jobHistory[0].jobName).toBe('dataRetention');
            expect(scheduler.jobHistory[0].status).toBe('SUCCESS');
        });

        it('should prevent triggering job that is already running', async () => {
            scheduler.schedules.dataRetention.isRunning = true;

            await expect(scheduler.triggerJob('dataRetention'))
                .rejects.toThrow('Job dataRetention is already running');
        });

        it('should handle unknown job names', async () => {
            await expect(scheduler.triggerJob('unknownJob'))
                .rejects.toThrow('Unknown job: unknownJob');
        });

        it('should handle job execution errors', async () => {
            mockDataManagementService.runAutomatedDataRetention.mockRejectedValue(
                new Error('Database connection failed')
            );

            await scheduler.triggerJob('dataRetention');

            expect(scheduler.jobHistory).toHaveLength(1);
            expect(scheduler.jobHistory[0].status).toBe('FAILED');
            expect(scheduler.jobHistory[0].error).toBe('Database connection failed');
        });
    });

    describe('scheduler status', () => {
        beforeEach(async () => {
            await scheduler.initialize();
        });

        it('should return comprehensive scheduler status', () => {
            const status = scheduler.getSchedulerStatus();

            expect(status.isInitialized).toBe(true);
            expect(status.schedules).toBeDefined();
            expect(status.schedules.dataRetention).toBeDefined();
            expect(status.schedules.dataRetention.enabled).toBe(true);
            expect(status.schedules.dataRetention.nextRun).toBeInstanceOf(Date);
            expect(status.recentJobs).toEqual([]);
        });

        it('should include recent job history', async () => {
            await scheduler.triggerJob('dataRetention');

            const status = scheduler.getSchedulerStatus();
            expect(status.recentJobs).toHaveLength(1);
            expect(status.recentJobs[0].jobName).toBe('dataRetention');
        });
    });

    describe('schedule management', () => {
        beforeEach(async () => {
            await scheduler.initialize();
        });

        it('should update job schedule', () => {
            const newCron = '0 5 * * *'; // 5 AM daily
            scheduler.updateJobSchedule('dataRetention', newCron, true);

            expect(scheduler.schedules.dataRetention.cron).toBe(newCron);
            expect(scheduler.schedules.dataRetention.enabled).toBe(true);
            expect(scheduler.schedules.dataRetention.nextRun).toBeInstanceOf(Date);
        });

        it('should disable job when updating schedule', () => {
            scheduler.updateJobSchedule('dataRetention', '0 5 * * *', false);

            expect(scheduler.schedules.dataRetention.enabled).toBe(false);
            expect(scheduler.schedules.dataRetention.nextRun).toBeNull();
        });

        it('should handle unknown job names in schedule update', () => {
            expect(() => scheduler.updateJobSchedule('unknownJob', '0 5 * * *'))
                .toThrow('Unknown job: unknownJob');
        });
    });

    describe('compliance assessment', () => {
        beforeEach(async () => {
            await scheduler.initialize();
        });

        it('should assess excellent compliance status', () => {
            const statistics = {
                compliance: {
                    dataRetentionCompliance: 98,
                    anonymizationCompliance: 97,
                    userRightsFulfillment: 99
                }
            };

            const status = scheduler.assessComplianceStatus(statistics);

            expect(status.overallScore).toBeCloseTo(98);
            expect(status.status).toBe('EXCELLENT');
        });

        it('should assess needs attention compliance status', () => {
            const statistics = {
                compliance: {
                    dataRetentionCompliance: 75,
                    anonymizationCompliance: 80,
                    userRightsFulfillment: 70
                }
            };

            const status = scheduler.assessComplianceStatus(statistics);

            expect(status.overallScore).toBeCloseTo(75);
            expect(status.status).toBe('NEEDS_ATTENTION');
        });

        it('should handle missing compliance data', () => {
            const statistics = {};

            const status = scheduler.assessComplianceStatus(statistics);

            expect(status.overallScore).toBe(0);
            expect(status.status).toBe('NEEDS_ATTENTION');
        });
    });

    describe('recommendations generation', () => {
        beforeEach(async () => {
            await scheduler.initialize();
        });

        it('should generate retention recommendations', () => {
            const statistics = {
                retention: { overdueItems: 5 },
                compliance: { dataRetentionCompliance: 85 },
                exports: { activeExports: 15 }
            };

            const recommendations = scheduler.generateRecommendations(statistics);

            expect(recommendations).toHaveLength(3);
            expect(recommendations[0].type).toBe('DATA_RETENTION');
            expect(recommendations[0].priority).toBe('HIGH');
            expect(recommendations[1].type).toBe('COMPLIANCE');
            expect(recommendations[1].priority).toBe('MEDIUM');
            expect(recommendations[2].type).toBe('PERFORMANCE');
            expect(recommendations[2].priority).toBe('LOW');
        });

        it('should generate no recommendations for good statistics', () => {
            const statistics = {
                retention: { overdueItems: 0 },
                compliance: { dataRetentionCompliance: 95 },
                exports: { activeExports: 5 }
            };

            const recommendations = scheduler.generateRecommendations(statistics);

            expect(recommendations).toHaveLength(0);
        });
    });

    describe('utility methods', () => {
        it('should calculate next run time correctly', () => {
            const cronExpression = '0 2 * * *'; // 2 AM daily
            const nextRun = scheduler.calculateNextRun(cronExpression);

            expect(nextRun).toBeInstanceOf(Date);
            expect(nextRun.getHours()).toBe(2);
            expect(nextRun.getMinutes()).toBe(0);
            expect(nextRun.getTime()).toBeGreaterThan(Date.now());
        });

        it('should generate unique job IDs', () => {
            const id1 = scheduler.generateJobId();
            const id2 = scheduler.generateJobId();

            expect(id1).toMatch(/^job_\d+_[a-z0-9]+$/);
            expect(id2).toMatch(/^job_\d+_[a-z0-9]+$/);
            expect(id1).not.toBe(id2);
        });

        it('should maintain job history size limit', () => {
            scheduler.maxHistorySize = 3;

            // Add more jobs than the limit
            for (let i = 0; i < 5; i++) {
                scheduler.logJobExecution({
                    jobId: `job_${i}`,
                    jobName: 'testJob',
                    startTime: new Date(),
                    endTime: new Date(),
                    status: 'SUCCESS'
                });
            }

            expect(scheduler.jobHistory).toHaveLength(3);
            expect(scheduler.jobHistory[0].jobId).toBe('job_2'); // First two should be removed
        });
    });

    describe('cleanup operations', () => {
        beforeEach(async () => {
            await scheduler.initialize();
        });

        it('should cleanup expired pseudonymization mappings', async () => {
            const expiredDate = new Date();
            expiredDate.setDate(expiredDate.getDate() - 1); // Yesterday

            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1); // Tomorrow

            // Add expired and valid mappings
            mockAnonymizationService.pseudonymizationMappings.set('expired_1', {
                expiresAt: expiredDate
            });
            mockAnonymizationService.pseudonymizationMappings.set('valid_1', {
                expiresAt: futureDate
            });

            const cleanedCount = await scheduler.cleanupPseudonymizationMappings();

            expect(cleanedCount).toBe(1);
            expect(mockAnonymizationService.pseudonymizationMappings.size).toBe(1);
            expect(mockAnonymizationService.pseudonymizationMappings.has('valid_1')).toBe(true);
        });

        it('should handle cleanup errors gracefully', async () => {
            scheduler.cleanupExportFile = vi.fn().mockRejectedValue(new Error('File system error'));

            const expiredDate = new Date();
            expiredDate.setDate(expiredDate.getDate() - 10);

            mockDataManagementService.processingStatus.export.activeExports.set('export_1', {
                id: 'export_1',
                expiresAt: expiredDate
            });

            const result = await scheduler.runExportCleanupJob();

            expect(result.success).toBe(false);
            expect(result.error).toBe('File system error');
        });
    });

    describe('environment configuration', () => {
        it('should respect disabled schedule configuration', () => {
            process.env.DATA_RETENTION_SCHEDULE_ENABLED = 'false';

            const newScheduler = new DataManagementScheduler();

            expect(newScheduler.schedules.dataRetention.enabled).toBe(false);
        });

        it('should use custom cron expressions from environment', () => {
            process.env.DATA_RETENTION_CRON = '0 1 * * *'; // 1 AM

            const newScheduler = new DataManagementScheduler();

            expect(newScheduler.schedules.dataRetention.cron).toBe('0 1 * * *');
        });

        it('should use default values when environment variables are missing', () => {
            delete process.env.DATA_RETENTION_CRON;

            const newScheduler = new DataManagementScheduler();

            expect(newScheduler.schedules.dataRetention.cron).toBe('0 2 * * *');
        });
    });
});