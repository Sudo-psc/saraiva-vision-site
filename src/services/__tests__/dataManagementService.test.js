/**
 * Data Management Service Tests
 * Tests for automated data retention, anonymization, and user data portability
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import DataManagementService from '../dataManagementService.js';

describe('DataManagementService', () => {
    let dataManagementService;
    let mockEncryptionService;
    let mockPrivacyManager;
    let mockRetentionService;

    beforeEach(() => {
        // Mock dependencies
        mockEncryptionService = {
            encrypt: vi.fn().mockReturnValue({ success: true, encrypted: 'encrypted_data' }),
            decrypt: vi.fn().mockReturnValue({ success: true, data: 'decrypted_data' }),
            createHash: vi.fn().mockReturnValue('hash_value'),
            createSecureToken: vi.fn().mockReturnValue('secure_token')
        };

        mockPrivacyManager = {
            validateConsent: vi.fn().mockResolvedValue({ isValid: true }),
            processUserRightsRequest: vi.fn().mockResolvedValue({ success: true })
        };

        mockRetentionService = {
            scheduleDataRetention: vi.fn().mockResolvedValue({ success: true }),
            processRetentionQueue: vi.fn().mockResolvedValue({ success: true })
        };

        dataManagementService = new DataManagementService();
        dataManagementService.encryptionService = mockEncryptionService;
        dataManagementService.privacyManager = mockPrivacyManager;
        dataManagementService.retentionService = mockRetentionService;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('runAutomatedDataRetention', () => {
        it('should successfully run automated data retention', async () => {
            // Mock expired data items
            dataManagementService.getExpiredDataItems = vi.fn().mockResolvedValue([
                { id: '1', action: 'ANONYMIZE', dataType: 'CONVERSATION_DATA' },
                { id: '2', action: 'DELETE', dataType: 'MARKETING_DATA' }
            ]);

            dataManagementService.processBatch = vi.fn().mockResolvedValue({
                processed: 2,
                anonymized: 1,
                deleted: 1,
                errors: []
            });

            dataManagementService.generateRetentionSummary = vi.fn().mockResolvedValue({
                totalProcessed: 2,
                successRate: 100
            });

            dataManagementService.logRetentionActivity = vi.fn().mockResolvedValue();

            const result = await dataManagementService.runAutomatedDataRetention({
                dryRun: false,
                batchSize: 10
            });

            expect(result.success).toBe(true);
            expect(result.results.processed).toBe(2);
            expect(result.results.anonymized).toBe(1);
            expect(result.results.deleted).toBe(1);
            expect(dataManagementService.getExpiredDataItems).toHaveBeenCalledWith(['ALL']);
        });

        it('should handle retention process already running', async () => {
            dataManagementService.processingStatus.retention.isRunning = true;

            const result = await dataManagementService.runAutomatedDataRetention();

            expect(result.success).toBe(false);
            expect(result.error).toBe('RETENTION_ALREADY_RUNNING');
        });

        it('should handle errors during retention processing', async () => {
            dataManagementService.getExpiredDataItems = vi.fn().mockRejectedValue(
                new Error('Database error')
            );

            const result = await dataManagementService.runAutomatedDataRetention();

            expect(result.success).toBe(false);
            expect(result.error).toBe('RETENTION_PROCESSING_ERROR');
            expect(result.message).toBe('Database error');
        });

        it('should support dry run mode', async () => {
            dataManagementService.getExpiredDataItems = vi.fn().mockResolvedValue([
                { id: '1', action: 'DELETE', dataType: 'OLD_DATA' }
            ]);

            dataManagementService.processBatch = vi.fn().mockResolvedValue({
                processed: 1,
                anonymized: 0,
                deleted: 0,
                errors: []
            });

            dataManagementService.generateRetentionSummary = vi.fn().mockResolvedValue({});
            dataManagementService.logRetentionActivity = vi.fn().mockResolvedValue();

            const result = await dataManagementService.runAutomatedDataRetention({
                dryRun: true
            });

            expect(result.success).toBe(true);
            expect(result.dryRun).toBe(true);
            expect(result.results.deleted).toBe(0); // No actual deletion in dry run
        });
    });

    describe('runAutomatedAnonymization', () => {
        it('should successfully run automated anonymization', async () => {
            dataManagementService.getDataForAnonymization = vi.fn().mockResolvedValue([
                { id: '1', data: 'sensitive_data' },
                { id: '2', data: 'personal_info' }
            ]);

            dataManagementService.anonymizeDataType = vi.fn().mockResolvedValue({
                processed: 2,
                anonymized: 2,
                errors: []
            });

            dataManagementService.logAnonymizationActivity = vi.fn().mockResolvedValue();

            const result = await dataManagementService.runAutomatedAnonymization({
                dataTypes: ['CONVERSATION_DATA'],
                retentionThreshold: 365
            });

            expect(result.success).toBe(true);
            expect(result.results.processed).toBe(2);
            expect(result.results.anonymized).toBe(2);
            expect(dataManagementService.getDataForAnonymization).toHaveBeenCalledWith(
                'CONVERSATION_DATA',
                365
            );
        });

        it('should handle anonymization process already running', async () => {
            dataManagementService.processingStatus.anonymization.isRunning = true;

            const result = await dataManagementService.runAutomatedAnonymization();

            expect(result.success).toBe(false);
            expect(result.error).toBe('ANONYMIZATION_ALREADY_RUNNING');
        });

        it('should process multiple data types', async () => {
            const dataTypes = ['CONVERSATION_DATA', 'SESSION_DATA'];

            dataManagementService.getDataForAnonymization = vi.fn()
                .mockResolvedValueOnce([{ id: '1' }])
                .mockResolvedValueOnce([{ id: '2' }]);

            dataManagementService.anonymizeDataType = vi.fn()
                .mockResolvedValueOnce({ processed: 1, anonymized: 1, errors: [] })
                .mockResolvedValueOnce({ processed: 1, anonymized: 1, errors: [] });

            dataManagementService.logAnonymizationActivity = vi.fn().mockResolvedValue();

            const result = await dataManagementService.runAutomatedAnonymization({
                dataTypes
            });

            expect(result.success).toBe(true);
            expect(result.results.processed).toBe(2);
            expect(result.results.dataTypes).toHaveProperty('CONVERSATION_DATA');
            expect(result.results.dataTypes).toHaveProperty('SESSION_DATA');
        });
    });

    describe('exportUserData', () => {
        it('should successfully initiate user data export', async () => {
            dataManagementService.processDataExport = vi.fn().mockResolvedValue();

            const result = await dataManagementService.exportUserData('session_123', {
                format: 'JSON',
                dataTypes: ['CONVERSATIONS', 'CONSENTS']
            });

            expect(result.success).toBe(true);
            expect(result.status).toBe('PROCESSING');
            expect(result.format).toBe('JSON');
            expect(result.dataTypes).toEqual(['CONVERSATIONS', 'CONSENTS']);
            expect(result.exportId).toBeDefined();
        });

        it('should handle different export formats', async () => {
            const formats = ['JSON', 'CSV', 'XML', 'PDF'];

            for (const format of formats) {
                dataManagementService.processDataExport = vi.fn().mockResolvedValue();

                const result = await dataManagementService.exportUserData('session_123', {
                    format
                });

                expect(result.success).toBe(true);
                expect(result.format).toBe(format);
            }
        });

        it('should calculate estimated completion time', async () => {
            dataManagementService.processDataExport = vi.fn().mockResolvedValue();

            const result = await dataManagementService.exportUserData('session_123', {
                dataTypes: ['ALL']
            });

            expect(result.estimatedCompletion).toBeInstanceOf(Date);
            expect(result.estimatedCompletion.getTime()).toBeGreaterThan(Date.now());
        });

        it('should handle export initiation errors', async () => {
            dataManagementService.calculateExportCompletion = vi.fn().mockImplementation(() => {
                throw new Error('Calculation error');
            });

            const result = await dataManagementService.exportUserData('session_123');

            expect(result.success).toBe(false);
            expect(result.error).toBe('EXPORT_INITIATION_ERROR');
        });
    });

    describe('processDataExport', () => {
        it('should successfully process data export', async () => {
            const exportRecord = {
                id: 'export_123',
                sessionId: 'session_123',
                format: 'JSON',
                dataTypes: ['CONVERSATIONS'],
                includeMetadata: true,
                anonymizeExport: false
            };

            dataManagementService.collectUserData = vi.fn().mockResolvedValue({
                sessionId: 'session_123',
                data: { conversations: [] }
            });

            dataManagementService.formatExportData = vi.fn().mockResolvedValue('formatted_data');
            dataManagementService.storeExportFile = vi.fn().mockResolvedValue('download_url');
            dataManagementService.logDataExport = vi.fn().mockResolvedValue();
            dataManagementService.notifyExportCompletion = vi.fn().mockResolvedValue();

            await dataManagementService.processDataExport(exportRecord);

            expect(exportRecord.status).toBe('COMPLETED');
            expect(exportRecord.downloadUrl).toBe('download_url');
            expect(exportRecord.completedAt).toBeInstanceOf(Date);
            expect(dataManagementService.collectUserData).toHaveBeenCalledWith(
                'session_123',
                ['CONVERSATIONS']
            );
        });

        it('should apply anonymization when requested', async () => {
            const exportRecord = {
                id: 'export_123',
                sessionId: 'session_123',
                format: 'JSON',
                dataTypes: ['CONVERSATIONS'],
                includeMetadata: false,
                anonymizeExport: true
            };

            dataManagementService.collectUserData = vi.fn().mockResolvedValue({
                data: { conversations: [{ message: 'test' }] }
            });

            dataManagementService.anonymizeExportData = vi.fn().mockResolvedValue({
                conversations: [{ message: '[ANONYMIZED]' }]
            });

            dataManagementService.formatExportData = vi.fn().mockResolvedValue('formatted_data');
            dataManagementService.storeExportFile = vi.fn().mockResolvedValue('download_url');
            dataManagementService.logDataExport = vi.fn().mockResolvedValue();
            dataManagementService.notifyExportCompletion = vi.fn().mockResolvedValue();

            await dataManagementService.processDataExport(exportRecord);

            expect(dataManagementService.anonymizeExportData).toHaveBeenCalled();
            expect(exportRecord.status).toBe('COMPLETED');
        });

        it('should handle export processing errors', async () => {
            const exportRecord = {
                id: 'export_123',
                sessionId: 'session_123',
                format: 'JSON',
                dataTypes: ['CONVERSATIONS']
            };

            dataManagementService.collectUserData = vi.fn().mockRejectedValue(
                new Error('Data collection failed')
            );

            await expect(dataManagementService.processDataExport(exportRecord))
                .rejects.toThrow('Data collection failed');

            expect(exportRecord.status).toBe('FAILED');
            expect(exportRecord.error).toBe('Data collection failed');
            expect(exportRecord.failedAt).toBeInstanceOf(Date);
        });
    });

    describe('pseudonymizeData', () => {
        it('should successfully pseudonymize data', async () => {
            const testData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '+55 11 99999-9999'
            };

            dataManagementService.generatePseudonym = vi.fn()
                .mockResolvedValueOnce({ value: 'NAME_ABC123', token: 'token1' })
                .mockResolvedValueOnce({ value: 'EMAIL_DEF456', token: 'token2' })
                .mockResolvedValueOnce({ value: 'PHONE_GHI789', token: 'token3' });

            dataManagementService.storePseudonymizationMapping = vi.fn().mockResolvedValue();

            const result = await dataManagementService.pseudonymizeData(testData, 'PERSONAL_DATA');

            expect(result.success).toBe(true);
            expect(result.data.name).toBe('NAME_ABC123');
            expect(result.data.email).toBe('EMAIL_DEF456');
            expect(result.data.phone).toBe('PHONE_GHI789');
            expect(result.pseudonymizationApplied).toBe(true);
            expect(result.reversible).toBe(true);
        });

        it('should handle unknown data types', async () => {
            const testData = { unknownField: 'value' };

            const result = await dataManagementService.pseudonymizeData(testData, 'UNKNOWN_TYPE');

            expect(result.success).toBe(false);
            expect(result.error).toBe('PSEUDONYMIZATION_ERROR');
        });
    });

    describe('getDataManagementStatistics', () => {
        it('should return comprehensive statistics', async () => {
            // Mock all statistics methods
            dataManagementService.getScheduledRetentionCount = vi.fn().mockResolvedValue(50);
            dataManagementService.getOverdueRetentionCount = vi.fn().mockResolvedValue(5);
            dataManagementService.getAnonymizedRecordsCount = vi.fn().mockResolvedValue(1000);
            dataManagementService.getCompletedExportsToday = vi.fn().mockResolvedValue(10);
            dataManagementService.getTotalExportsCount = vi.fn().mockResolvedValue(500);
            dataManagementService.calculateRetentionCompliance = vi.fn().mockResolvedValue(95.5);
            dataManagementService.calculateAnonymizationCompliance = vi.fn().mockResolvedValue(98.2);
            dataManagementService.calculateUserRightsFulfillment = vi.fn().mockResolvedValue(99.1);

            const stats = await dataManagementService.getDataManagementStatistics();

            expect(stats.retention).toBeDefined();
            expect(stats.retention.scheduledItems).toBe(50);
            expect(stats.retention.overdueItems).toBe(5);

            expect(stats.anonymization).toBeDefined();
            expect(stats.anonymization.anonymizedRecords).toBe(1000);

            expect(stats.exports).toBeDefined();
            expect(stats.exports.completedToday).toBe(10);
            expect(stats.exports.totalExports).toBe(500);

            expect(stats.compliance).toBeDefined();
            expect(stats.compliance.dataRetentionCompliance).toBe(95.5);
            expect(stats.compliance.anonymizationCompliance).toBe(98.2);
            expect(stats.compliance.userRightsFulfillment).toBe(99.1);
        });

        it('should handle statistics errors', async () => {
            dataManagementService.getScheduledRetentionCount = vi.fn().mockRejectedValue(
                new Error('Database error')
            );

            const stats = await dataManagementService.getDataManagementStatistics();

            expect(stats.error).toBe('STATISTICS_ERROR');
            expect(stats.message).toBe('Database error');
        });
    });

    describe('utility methods', () => {
        it('should generate unique export IDs', () => {
            const id1 = dataManagementService.generateExportId();
            const id2 = dataManagementService.generateExportId();

            expect(id1).toMatch(/^export_\d+_[a-z0-9]+$/);
            expect(id2).toMatch(/^export_\d+_[a-z0-9]+$/);
            expect(id1).not.toBe(id2);
        });

        it('should calculate export completion time', () => {
            const dataTypes = ['CONVERSATIONS', 'CONSENTS', 'APPOINTMENTS'];
            const completion = dataManagementService.calculateExportCompletion(dataTypes);

            expect(completion).toBeInstanceOf(Date);
            expect(completion.getTime()).toBeGreaterThan(Date.now());
        });

        it('should count records correctly', () => {
            const data = {
                conversations: [{ id: 1 }, { id: 2 }],
                consents: [{ id: 1 }],
                metadata: {
                    total: 3,
                    nested: {
                        count: 1
                    }
                }
            };

            const count = dataManagementService.countRecords(data);
            expect(count).toBe(6); // 2 + 1 + 1 + 1 + 1 = 6
        });
    });

    describe('integration scenarios', () => {
        it('should handle complete data lifecycle management', async () => {
            // Test complete workflow: retention -> anonymization -> export

            // 1. Run retention
            dataManagementService.getExpiredDataItems = vi.fn().mockResolvedValue([]);
            dataManagementService.generateRetentionSummary = vi.fn().mockResolvedValue({});
            dataManagementService.logRetentionActivity = vi.fn().mockResolvedValue();

            const retentionResult = await dataManagementService.runAutomatedDataRetention();
            expect(retentionResult.success).toBe(true);

            // 2. Run anonymization
            dataManagementService.getDataForAnonymization = vi.fn().mockResolvedValue([]);
            dataManagementService.anonymizeDataType = vi.fn().mockResolvedValue({
                processed: 0, anonymized: 0, errors: []
            });
            dataManagementService.logAnonymizationActivity = vi.fn().mockResolvedValue();

            const anonymizationResult = await dataManagementService.runAutomatedAnonymization();
            expect(anonymizationResult.success).toBe(true);

            // 3. Export data
            dataManagementService.processDataExport = vi.fn().mockResolvedValue();

            const exportResult = await dataManagementService.exportUserData('session_123');
            expect(exportResult.success).toBe(true);
        });

        it('should maintain processing status correctly', async () => {
            expect(dataManagementService.processingStatus.retention.isRunning).toBe(false);
            expect(dataManagementService.processingStatus.anonymization.isRunning).toBe(false);
            expect(dataManagementService.processingStatus.export.activeExports.size).toBe(0);

            // Start export
            dataManagementService.processDataExport = vi.fn().mockResolvedValue();
            await dataManagementService.exportUserData('session_123');

            expect(dataManagementService.processingStatus.export.activeExports.size).toBe(1);
        });
    });
});