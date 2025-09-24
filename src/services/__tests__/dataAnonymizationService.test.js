/**
 * Data Anonymization Service Tests
 * Tests for anonymization and pseudonymization techniques
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import DataAnonymizationService from '../dataAnonymizationService.js';

describe('DataAnonymizationService', () => {
    let anonymizationService;
    let mockEncryptionService;

    beforeEach(() => {
        mockEncryptionService = {
            createHash: vi.fn().mockReturnValue('hashed_value'),
            createSecureToken: vi.fn().mockReturnValue('secure_token')
        };

        anonymizationService = new DataAnonymizationService();
        anonymizationService.encryptionService = mockEncryptionService;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('anonymizeData', () => {
        it('should successfully anonymize object data', async () => {
            const testData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '+55 11 99999-9999',
                age: 35,
                city: 'São Paulo'
            };

            const result = await anonymizationService.anonymizeData(testData, {
                anonymizationLevel: 'STANDARD',
                preserveStructure: true
            });

            expect(result.success).toBe(true);
            expect(result.result.anonymizedData).toBeDefined();
            expect(result.result.statistics.fieldsProcessed).toBeGreaterThan(0);
            expect(result.result.metadata.anonymizationLevel).toBe('STANDARD');
            expect(result.result.metadata.preserveStructure).toBe(true);
        });

        it('should handle array data anonymization', async () => {
            const testData = [
                { name: 'João', email: 'joao@test.com' },
                { name: 'Maria', email: 'maria@test.com' }
            ];

            const result = await anonymizationService.anonymizeData(testData);

            expect(result.success).toBe(true);
            expect(Array.isArray(result.result.anonymizedData)).toBe(true);
            expect(result.result.anonymizedData).toHaveLength(2);
        });

        it('should apply different anonymization levels', async () => {
            const testData = {
                name: 'João Silva',
                email: 'joao@example.com',
                preferences: 'likes coffee'
            };

            // Test MINIMAL level
            const minimalResult = await anonymizationService.anonymizeData(testData, {
                anonymizationLevel: 'MINIMAL'
            });

            // Test AGGRESSIVE level
            const aggressiveResult = await anonymizationService.anonymizeData(testData, {
                anonymizationLevel: 'AGGRESSIVE'
            });

            expect(minimalResult.success).toBe(true);
            expect(aggressiveResult.success).toBe(true);

            // Aggressive should anonymize more fields
            expect(aggressiveResult.result.statistics.fieldsAnonymized)
                .toBeGreaterThanOrEqual(minimalResult.result.statistics.fieldsAnonymized);
        });

        it('should preserve statistical properties when requested', async () => {
            const testData = {
                ages: [25, 30, 35, 40, 45],
                scores: [85, 90, 78, 92, 88]
            };

            const result = await anonymizationService.anonymizeData(testData, {
                retainStatisticalProperties: true
            });

            expect(result.success).toBe(true);
            expect(result.result.metadata.retainStatisticalProperties).toBe(true);
        });

        it('should handle anonymization errors gracefully', async () => {
            // Mock error in anonymization process
            anonymizationService.anonymizeObject = vi.fn().mockRejectedValue(
                new Error('Anonymization failed')
            );

            const result = await anonymizationService.anonymizeData({ test: 'data' });

            expect(result.success).toBe(false);
            expect(result.error).toBe('ANONYMIZATION_ERROR');
            expect(result.message).toBe('Anonymization failed');
        });
    });

    describe('pseudonymizeData', () => {
        it('should successfully pseudonymize data', async () => {
            const testData = {
                name: 'João Silva',
                email: 'joao@example.com',
                id: '12345'
            };

            anonymizationService.pseudonymizeObject = vi.fn().mockResolvedValue({
                name: 'PSEUDO_NAME_123',
                email: 'PSEUDO_EMAIL_456',
                id: 'PSEUDO_ID_789'
            });

            const result = await anonymizationService.pseudonymizeData(testData, {
                preserveFormat: true,
                deterministicMapping: true
            });

            expect(result.success).toBe(true);
            expect(result.result.reversible).toBe(true);
            expect(result.result.pseudonymizedData).toBeDefined();
            expect(result.result.keyId).toBeDefined();
            expect(result.result.metadata.preserveFormat).toBe(true);
        });

        it('should store pseudonymization mappings', async () => {
            const testData = { name: 'Test User' };

            anonymizationService.pseudonymizeObject = vi.fn().mockResolvedValue({
                name: 'PSEUDO_NAME_123'
            });

            const result = await anonymizationService.pseudonymizeData(testData);

            expect(result.success).toBe(true);
            expect(anonymizationService.pseudonymizationMappings.size).toBe(1);

            const mapping = anonymizationService.pseudonymizationMappings.get(result.result.id);
            expect(mapping).toBeDefined();
            expect(mapping.keyId).toBe(result.result.keyId);
        });

        it('should handle pseudonymization errors', async () => {
            anonymizationService.pseudonymizeObject = vi.fn().mockRejectedValue(
                new Error('Pseudonymization failed')
            );

            const result = await anonymizationService.pseudonymizeData({ test: 'data' });

            expect(result.success).toBe(false);
            expect(result.error).toBe('PSEUDONYMIZATION_ERROR');
        });
    });

    describe('reversePseudonymization', () => {
        it('should successfully reverse pseudonymization', async () => {
            const originalData = { name: 'João Silva' };
            const pseudonymizedData = { name: 'PSEUDO_NAME_123' };

            // First pseudonymize
            const mappings = new Map([['João Silva', 'PSEUDO_NAME_123']]);
            const pseudoId = 'pseudo_123';

            anonymizationService.pseudonymizationMappings.set(pseudoId, {
                keyId: 'key_123',
                mappings,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            });

            anonymizationService.applyReverseMapping = vi.fn().mockResolvedValue(originalData);

            const result = await anonymizationService.reversePseudonymization(
                pseudonymizedData,
                pseudoId
            );

            expect(result.success).toBe(true);
            expect(result.data).toEqual(originalData);
            expect(result.reversedAt).toBeInstanceOf(Date);
        });

        it('should handle missing pseudonymization mapping', async () => {
            const result = await anonymizationService.reversePseudonymization(
                { name: 'PSEUDO_NAME_123' },
                'nonexistent_id'
            );

            expect(result.success).toBe(false);
            expect(result.error).toBe('REVERSAL_ERROR');
            expect(result.message).toContain('mapping not found');
        });
    });

    describe('applyKAnonymity', () => {
        it('should successfully apply k-anonymity to dataset', async () => {
            const dataset = [
                { age: 25, zipcode: '12345', disease: 'flu' },
                { age: 25, zipcode: '12345', disease: 'cold' },
                { age: 25, zipcode: '12345', disease: 'fever' },
                { age: 30, zipcode: '54321', disease: 'headache' }
            ];

            const quasiIdentifiers = ['age', 'zipcode'];

            anonymizationService.groupByQuasiIdentifiers = vi.fn().mockReturnValue(
                new Map([
                    ['25_12345', dataset.slice(0, 3)],
                    ['30_54321', dataset.slice(3)]
                ])
            );

            anonymizationService.processSmallGroup = vi.fn().mockResolvedValue([]);

            const result = await anonymizationService.applyKAnonymity(dataset, 3, quasiIdentifiers);

            expect(result.success).toBe(true);
            expect(result.result.kValue).toBe(3);
            expect(result.result.quasiIdentifiers).toEqual(quasiIdentifiers);
            expect(result.result.originalSize).toBe(4);
        });

        it('should handle empty dataset', async () => {
            const result = await anonymizationService.applyKAnonymity([], 3, ['age']);

            expect(result.success).toBe(false);
            expect(result.error).toBe('K_ANONYMITY_ERROR');
            expect(result.message).toContain('non-empty array');
        });

        it('should calculate information loss and data utility', async () => {
            const dataset = [
                { age: 25, city: 'SP' },
                { age: 30, city: 'RJ' },
                { age: 35, city: 'MG' }
            ];

            anonymizationService.groupByQuasiIdentifiers = vi.fn().mockReturnValue(
                new Map([['group1', dataset]])
            );

            const result = await anonymizationService.applyKAnonymity(dataset, 2, ['age']);

            expect(result.success).toBe(true);
            expect(result.result.statistics.informationLoss).toBeDefined();
            expect(result.result.statistics.dataUtility).toBeDefined();
            expect(result.result.statistics.informationLoss).toBeGreaterThanOrEqual(0);
            expect(result.result.statistics.dataUtility).toBeLessThanOrEqual(1);
        });
    });

    describe('applyDifferentialPrivacy', () => {
        it('should successfully apply Laplace mechanism', async () => {
            const data = [10, 20, 30, 40, 50];
            const epsilon = 1.0;

            const result = await anonymizationService.applyDifferentialPrivacy(
                data,
                epsilon,
                'laplace'
            );

            expect(result.success).toBe(true);
            expect(result.result.originalData).toEqual(data);
            expect(result.result.privatizedData).toHaveLength(data.length);
            expect(result.result.epsilon).toBe(epsilon);
            expect(result.result.mechanism).toBe('laplace');
            expect(result.result.noiseAdded).toHaveLength(data.length);
        });

        it('should successfully apply Gaussian mechanism', async () => {
            const data = [100, 200, 300];
            const epsilon = 0.5;

            const result = await anonymizationService.applyDifferentialPrivacy(
                data,
                epsilon,
                'gaussian'
            );

            expect(result.success).toBe(true);
            expect(result.result.mechanism).toBe('gaussian');
            expect(result.result.statistics.meanError).toBeGreaterThan(0);
            expect(result.result.statistics.utilityScore).toBeLessThanOrEqual(1);
        });

        it('should handle non-array input', async () => {
            const result = await anonymizationService.applyDifferentialPrivacy('not an array');

            expect(result.success).toBe(false);
            expect(result.error).toBe('DIFFERENTIAL_PRIVACY_ERROR');
            expect(result.message).toContain('array');
        });

        it('should calculate privacy statistics', async () => {
            const data = [1, 2, 3, 4, 5];

            const result = await anonymizationService.applyDifferentialPrivacy(data, 1.0);

            expect(result.success).toBe(true);
            expect(result.result.statistics.meanError).toBeGreaterThanOrEqual(0);
            expect(result.result.statistics.maxError).toBeGreaterThanOrEqual(0);
            expect(result.result.statistics.utilityScore).toBeGreaterThanOrEqual(0);
            expect(result.result.statistics.utilityScore).toBeLessThanOrEqual(1);
        });
    });

    describe('anonymization techniques', () => {
        it('should suppress values correctly', () => {
            const result = anonymizationService.suppressValue('sensitive data');
            expect(result).toBe('[SUPPRESSED]');
        });

        it('should generalize numerical values', () => {
            expect(anonymizationService.generalizeValue(15, 'age')).toBe('0-17');
            expect(anonymizationService.generalizeValue(25, 'age')).toBe('18-29');
            expect(anonymizationService.generalizeValue(45, 'age')).toBe('30-49');
            expect(anonymizationService.generalizeValue(75, 'age')).toBe('70+');
        });

        it('should generalize email addresses', () => {
            const result = anonymizationService.generalizeValue('user@example.com', 'email');
            expect(result).toBe('***@example.com');
        });

        it('should hash values using encryption service', () => {
            const result = anonymizationService.hashValue('test value');
            expect(mockEncryptionService.createHash).toHaveBeenCalledWith('test value');
            expect(result).toBe('hashed_value');
        });

        it('should tokenize values with field prefix', () => {
            const result = anonymizationService.tokenizeValue('sensitive', 'name');
            expect(mockEncryptionService.createSecureToken).toHaveBeenCalledWith(8);
            expect(result).toBe('NAME_secure_token');
        });

        it('should substitute values with realistic alternatives', () => {
            const nameResult = anonymizationService.substituteValue('João Silva', 'name');
            expect(['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa'])
                .toContain(nameResult);

            const emailResult = anonymizationService.substituteValue('test@test.com', 'email');
            expect(['usuario@exemplo.com', 'contato@teste.com', 'info@demo.com'])
                .toContain(emailResult);
        });

        it('should mask values preserving structure', () => {
            expect(anonymizationService.maskValue('1234567890')).toBe('12******90');
            expect(anonymizationService.maskValue('test')).toBe('****');
            expect(anonymizationService.maskValue('ab')).toBe('**');
            expect(anonymizationService.maskValue(123)).toBe('[MASKED]');
        });
    });

    describe('data category identification', () => {
        it('should identify personal identifier fields', () => {
            const category = anonymizationService.identifyDataCategory('cpf', '123.456.789-00');
            expect(category.sensitivity).toBe(anonymizationService.sensitivityLevels.CRITICAL);
            expect(category.technique).toBe(anonymizationService.anonymizationTechniques.TOKENIZATION);
        });

        it('should identify contact information fields', () => {
            const category = anonymizationService.identifyDataCategory('email', 'test@example.com');
            expect(category.sensitivity).toBe(anonymizationService.sensitivityLevels.HIGH);
            expect(category.technique).toBe(anonymizationService.anonymizationTechniques.HASHING);
        });

        it('should identify medical data fields', () => {
            const category = anonymizationService.identifyDataCategory('symptoms', 'headache');
            expect(category.sensitivity).toBe(anonymizationService.sensitivityLevels.CRITICAL);
            expect(category.technique).toBe(anonymizationService.anonymizationTechniques.SUBSTITUTION);
        });

        it('should handle unknown fields with default category', () => {
            const category = anonymizationService.identifyDataCategory('unknown_field', 'value');
            expect(category.sensitivity).toBe(anonymizationService.sensitivityLevels.LOW);
            expect(category.technique).toBe(anonymizationService.anonymizationTechniques.GENERALIZATION);
        });
    });

    describe('anonymization level logic', () => {
        it('should respect MINIMAL anonymization level', () => {
            const criticalCategory = { sensitivity: anonymizationService.sensitivityLevels.CRITICAL };
            const highCategory = { sensitivity: anonymizationService.sensitivityLevels.HIGH };

            expect(anonymizationService.shouldAnonymizeField('test', criticalCategory, { anonymizationLevel: 'MINIMAL' })).toBe(true);
            expect(anonymizationService.shouldAnonymizeField('test', highCategory, { anonymizationLevel: 'MINIMAL' })).toBe(false);
        });

        it('should respect STANDARD anonymization level', () => {
            const highCategory = { sensitivity: anonymizationService.sensitivityLevels.HIGH };
            const mediumCategory = { sensitivity: anonymizationService.sensitivityLevels.MEDIUM };

            expect(anonymizationService.shouldAnonymizeField('test', highCategory, { anonymizationLevel: 'STANDARD' })).toBe(true);
            expect(anonymizationService.shouldAnonymizeField('test', mediumCategory, { anonymizationLevel: 'STANDARD' })).toBe(false);
        });

        it('should respect AGGRESSIVE anonymization level', () => {
            const mediumCategory = { sensitivity: anonymizationService.sensitivityLevels.MEDIUM };
            const lowCategory = { sensitivity: anonymizationService.sensitivityLevels.LOW };

            expect(anonymizationService.shouldAnonymizeField('test', mediumCategory, { anonymizationLevel: 'AGGRESSIVE' })).toBe(true);
            expect(anonymizationService.shouldAnonymizeField('test', lowCategory, { anonymizationLevel: 'AGGRESSIVE' })).toBe(false);
        });
    });

    describe('utility methods', () => {
        it('should generate unique anonymization IDs', () => {
            const id1 = anonymizationService.generateAnonymizationId();
            const id2 = anonymizationService.generateAnonymizationId();

            expect(id1).toMatch(/^anon_\d+_[a-z0-9]+$/);
            expect(id2).toMatch(/^anon_\d+_[a-z0-9]+$/);
            expect(id1).not.toBe(id2);
        });

        it('should generate unique pseudonymization IDs', () => {
            const id1 = anonymizationService.generatePseudonymizationId();
            const id2 = anonymizationService.generatePseudonymizationId();

            expect(id1).toMatch(/^pseudo_\d+_[a-z0-9]+$/);
            expect(id2).toMatch(/^pseudo_\d+_[a-z0-9]+$/);
            expect(id1).not.toBe(id2);
        });

        it('should create consistent data hashes', () => {
            const data = { name: 'test', value: 123 };
            const hash1 = anonymizationService.createDataHash(data);
            const hash2 = anonymizationService.createDataHash(data);

            expect(hash1).toBe(hash2);
            expect(mockEncryptionService.createHash).toHaveBeenCalledWith(JSON.stringify(data));
        });

        it('should log anonymization activities', () => {
            const result = {
                id: 'anon_123',
                metadata: { timestamp: new Date() },
                statistics: { fieldsProcessed: 5, fieldsAnonymized: 3, processingTime: 100 },
                techniques: [
                    { technique: 'hashing' },
                    { technique: 'tokenization' }
                ]
            };

            anonymizationService.logAnonymization(result);

            expect(anonymizationService.anonymizationLog).toHaveLength(1);
            expect(anonymizationService.anonymizationLog[0].id).toBe('anon_123');
            expect(anonymizationService.anonymizationLog[0].fieldsProcessed).toBe(5);
            expect(anonymizationService.anonymizationLog[0].techniques).toEqual(['hashing', 'tokenization']);
        });

        it('should maintain log size limit', () => {
            // Fill log beyond limit
            for (let i = 0; i < 1005; i++) {
                anonymizationService.anonymizationLog.push({
                    id: `anon_${i}`,
                    timestamp: new Date(),
                    fieldsProcessed: 1,
                    fieldsAnonymized: 1,
                    techniques: ['test'],
                    processingTime: 10
                });
            }

            const result = {
                id: 'anon_new',
                metadata: { timestamp: new Date() },
                statistics: { fieldsProcessed: 1, fieldsAnonymized: 1, processingTime: 10 },
                techniques: [{ technique: 'test' }]
            };

            anonymizationService.logAnonymization(result);

            expect(anonymizationService.anonymizationLog).toHaveLength(1000);
            expect(anonymizationService.anonymizationLog[999].id).toBe('anon_new');
        });
    });

    describe('statistical methods', () => {
        it('should generate Laplace noise', () => {
            const noise1 = anonymizationService.generateLaplaceNoise(1.0);
            const noise2 = anonymizationService.generateLaplaceNoise(1.0);

            expect(typeof noise1).toBe('number');
            expect(typeof noise2).toBe('number');
            expect(noise1).not.toBe(noise2); // Should be different random values
        });

        it('should generate Gaussian noise', () => {
            const noise1 = anonymizationService.generateGaussianNoise(0, 1);
            const noise2 = anonymizationService.generateGaussianNoise(0, 1);

            expect(typeof noise1).toBe('number');
            expect(typeof noise2).toBe('number');
            expect(noise1).not.toBe(noise2); // Should be different random values
        });

        it('should calculate information loss correctly', () => {
            const original = [1, 2, 3, 4, 5];
            const anonymized = [1, 2, 3]; // 2 items removed

            const loss = anonymizationService.calculateInformationLoss(original, anonymized);
            expect(loss).toBe(0.4); // (5-3)/5 = 0.4
        });

        it('should calculate data utility correctly', () => {
            const utility1 = anonymizationService.calculateDataUtility([1, 2, 3], 5);
            expect(utility1).toBe(0.6); // 3/5 = 0.6

            const utility2 = anonymizationService.calculateDataUtility([1, 2, 3, 4, 5, 6], 5);
            expect(utility2).toBe(1); // min(1, 6/5) = 1
        });

        it('should calculate privacy statistics correctly', () => {
            const original = [10, 20, 30];
            const privatized = [12, 18, 32];

            const stats = anonymizationService.calculatePrivacyStatistics(original, privatized);

            expect(stats.meanError).toBe(2); // (2+2+2)/3 = 2
            expect(stats.maxError).toBe(2); // max(2,2,2) = 2
            expect(stats.utilityScore).toBeGreaterThan(0);
            expect(stats.utilityScore).toBeLessThanOrEqual(1);
        });
    });
});