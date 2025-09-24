/**
 * Data Anonymization Service
 * Implements various anonymization and pseudonymization techniques for LGPD compliance
 */

import crypto from 'crypto';
import DataEncryptionService from './dataEncryptionService.js';

class DataAnonymizationService {
    constructor() {
        this.encryptionService = new DataEncryptionService();

        this.anonymizationTechniques = {
            SUPPRESSION: 'suppression',
            GENERALIZATION: 'generalization',
            PERTURBATION: 'perturbation',
            SUBSTITUTION: 'substitution',
            HASHING: 'hashing',
            TOKENIZATION: 'tokenization',
            MASKING: 'masking'
        };

        this.sensitivityLevels = {
            LOW: 1,
            MEDIUM: 2,
            HIGH: 3,
            CRITICAL: 4
        };

        this.dataCategories = {
            PERSONAL_IDENTIFIERS: {
                fields: ['name', 'cpf', 'rg', 'passport'],
                sensitivity: this.sensitivityLevels.CRITICAL,
                technique: this.anonymizationTechniques.TOKENIZATION
            },
            CONTACT_INFO: {
                fields: ['email', 'phone', 'address'],
                sensitivity: this.sensitivityLevels.HIGH,
                technique: this.anonymizationTechniques.HASHING
            },
            MEDICAL_DATA: {
                fields: ['symptoms', 'diagnosis', 'medications', 'allergies'],
                sensitivity: this.sensitivityLevels.CRITICAL,
                technique: this.anonymizationTechniques.SUBSTITUTION
            },
            BEHAVIORAL_DATA: {
                fields: ['conversation_history', 'preferences', 'usage_patterns'],
                sensitivity: this.sensitivityLevels.MEDIUM,
                technique: this.anonymizationTechniques.GENERALIZATION
            },
            TECHNICAL_DATA: {
                fields: ['ip_address', 'user_agent', 'session_id'],
                sensitivity: this.sensitivityLevels.MEDIUM,
                technique: this.anonymizationTechniques.HASHING
            }
        };

        this.pseudonymizationMappings = new Map();
        this.anonymizationLog = [];
    }

    /**
     * Anonymizes data based on sensitivity level and data type
     * @param {Object} data - Data to anonymize
     * @param {Object} options - Anonymization options
     * @returns {Object} Anonymization result
     */
    async anonymizeData(data, options = {}) {
        try {
            const {
                preserveStructure = true,
                anonymizationLevel = 'STANDARD', // MINIMAL, STANDARD, AGGRESSIVE
                retainStatisticalProperties = false,
                customRules = {}
            } = options;

            const anonymizationId = this.generateAnonymizationId();
            const startTime = Date.now();

            const result = {
                id: anonymizationId,
                originalDataHash: this.createDataHash(data),
                anonymizedData: null,
                anonymizationMap: new Map(),
                techniques: [],
                preservedFields: [],
                removedFields: [],
                statistics: {
                    fieldsProcessed: 0,
                    fieldsAnonymized: 0,
                    fieldsRemoved: 0,
                    processingTime: 0
                },
                metadata: {
                    anonymizationLevel,
                    preserveStructure,
                    retainStatisticalProperties,
                    timestamp: new Date(),
                    reversible: false
                }
            };

            // Deep clone data to avoid modifying original
            const workingData = JSON.parse(JSON.stringify(data));

            // Apply anonymization based on data structure
            if (Array.isArray(workingData)) {
                result.anonymizedData = await this.anonymizeArray(workingData, options, result);
            } else if (typeof workingData === 'object' && workingData !== null) {
                result.anonymizedData = await this.anonymizeObject(workingData, options, result);
            } else {
                result.anonymizedData = await this.anonymizeValue(workingData, 'unknown', options, result);
            }

            // Calculate statistics
            result.statistics.processingTime = Date.now() - startTime;

            // Log anonymization
            this.logAnonymization(result);

            return {
                success: true,
                result
            };

        } catch (error) {
            console.error('Error in data anonymization:', error);
            return {
                success: false,
                error: 'ANONYMIZATION_ERROR',
                message: error.message
            };
        }
    }

    /**
     * Pseudonymizes data (reversible anonymization)
     * @param {Object} data - Data to pseudonymize
     * @param {Object} options - Pseudonymization options
     * @returns {Object} Pseudonymization result
     */
    async pseudonymizeData(data, options = {}) {
        try {
            const {
                keyId = this.generateKeyId(),
                preserveFormat = true,
                deterministicMapping = true
            } = options;

            const pseudonymizationId = this.generatePseudonymizationId();
            const mappings = new Map();

            const result = {
                id: pseudonymizationId,
                keyId,
                pseudonymizedData: null,
                mappings: new Map(),
                reversible: true,
                metadata: {
                    preserveFormat,
                    deterministicMapping,
                    timestamp: new Date()
                }
            };

            // Deep clone data
            const workingData = JSON.parse(JSON.stringify(data));

            // Apply pseudonymization
            result.pseudonymizedData = await this.pseudonymizeObject(workingData, keyId, mappings, options);
            result.mappings = mappings;

            // Store mappings for reversal
            this.pseudonymizationMappings.set(pseudonymizationId, {
                keyId,
                mappings,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
            });

            return {
                success: true,
                result
            };

        } catch (error) {
            console.error('Error in data pseudonymization:', error);
            return {
                success: false,
                error: 'PSEUDONYMIZATION_ERROR',
                message: error.message
            };
        }
    }

    /**
     * Reverses pseudonymization
     * @param {Object} pseudonymizedData - Pseudonymized data
     * @param {string} pseudonymizationId - Pseudonymization ID
     * @returns {Object} Reversal result
     */
    async reversePseudonymization(pseudonymizedData, pseudonymizationId) {
        try {
            const mappingRecord = this.pseudonymizationMappings.get(pseudonymizationId);
            if (!mappingRecord) {
                throw new Error('Pseudonymization mapping not found or expired');
            }

            const { mappings } = mappingRecord;
            const reverseMappings = new Map();

            // Create reverse mapping
            for (const [original, pseudonym] of mappings) {
                reverseMappings.set(pseudonym, original);
            }

            // Apply reverse mapping
            const originalData = await this.applyReverseMapping(pseudonymizedData, reverseMappings);

            return {
                success: true,
                data: originalData,
                reversedAt: new Date()
            };

        } catch (error) {
            console.error('Error reversing pseudonymization:', error);
            return {
                success: false,
                error: 'REVERSAL_ERROR',
                message: error.message
            };
        }
    }

    /**
     * Applies k-anonymity to dataset
     * @param {Array} dataset - Dataset to anonymize
     * @param {number} k - K value for k-anonymity
     * @param {Array} quasiIdentifiers - Quasi-identifier fields
     * @returns {Object} K-anonymity result
     */
    async applyKAnonymity(dataset, k = 3, quasiIdentifiers = []) {
        try {
            if (!Array.isArray(dataset) || dataset.length === 0) {
                throw new Error('Dataset must be a non-empty array');
            }

            const result = {
                originalSize: dataset.length,
                anonymizedDataset: [],
                kValue: k,
                quasiIdentifiers,
                suppressedRecords: 0,
                generalizedFields: new Set(),
                statistics: {
                    informationLoss: 0,
                    dataUtility: 0
                }
            };

            // Group records by quasi-identifier combinations
            const groups = this.groupByQuasiIdentifiers(dataset, quasiIdentifiers);

            // Process each group
            for (const [combination, records] of groups) {
                if (records.length >= k) {
                    // Group satisfies k-anonymity, add to result
                    result.anonymizedDataset.push(...records);
                } else {
                    // Group doesn't satisfy k-anonymity, apply generalization or suppression
                    const processedRecords = await this.processSmallGroup(records, k, quasiIdentifiers);

                    if (processedRecords.length > 0) {
                        result.anonymizedDataset.push(...processedRecords);
                        processedRecords.forEach(record => {
                            Object.keys(record).forEach(field => {
                                if (quasiIdentifiers.includes(field) && record[field] !== records[0][field]) {
                                    result.generalizedFields.add(field);
                                }
                            });
                        });
                    } else {
                        result.suppressedRecords += records.length;
                    }
                }
            }

            // Calculate statistics
            result.statistics.informationLoss = this.calculateInformationLoss(dataset, result.anonymizedDataset);
            result.statistics.dataUtility = this.calculateDataUtility(result.anonymizedDataset, result.originalSize);

            return {
                success: true,
                result
            };

        } catch (error) {
            console.error('Error applying k-anonymity:', error);
            return {
                success: false,
                error: 'K_ANONYMITY_ERROR',
                message: error.message
            };
        }
    }

    /**
     * Applies differential privacy to numerical data
     * @param {Array} data - Numerical data
     * @param {number} epsilon - Privacy budget
     * @param {string} mechanism - Privacy mechanism (laplace, gaussian)
     * @returns {Object} Differential privacy result
     */
    async applyDifferentialPrivacy(data, epsilon = 1.0, mechanism = 'laplace') {
        try {
            if (!Array.isArray(data)) {
                throw new Error('Data must be an array');
            }

            const result = {
                originalData: [...data],
                privatizedData: [],
                epsilon,
                mechanism,
                noiseAdded: [],
                statistics: {
                    meanError: 0,
                    maxError: 0,
                    utilityScore: 0
                }
            };

            // Apply noise based on mechanism
            for (let i = 0; i < data.length; i++) {
                const originalValue = data[i];
                let noise = 0;

                if (mechanism === 'laplace') {
                    noise = this.generateLaplaceNoise(1 / epsilon);
                } else if (mechanism === 'gaussian') {
                    noise = this.generateGaussianNoise(0, Math.sqrt(2 * Math.log(1.25)) / epsilon);
                }

                const privatizedValue = originalValue + noise;
                result.privatizedData.push(privatizedValue);
                result.noiseAdded.push(noise);
            }

            // Calculate statistics
            result.statistics = this.calculatePrivacyStatistics(result.originalData, result.privatizedData);

            return {
                success: true,
                result
            };

        } catch (error) {
            console.error('Error applying differential privacy:', error);
            return {
                success: false,
                error: 'DIFFERENTIAL_PRIVACY_ERROR',
                message: error.message
            };
        }
    }

    // Helper methods for anonymization

    async anonymizeObject(obj, options, result) {
        const anonymized = {};

        for (const [key, value] of Object.entries(obj)) {
            result.statistics.fieldsProcessed++;

            const category = this.identifyDataCategory(key, value);
            const shouldAnonymize = this.shouldAnonymizeField(key, category, options);

            if (shouldAnonymize) {
                const anonymizedValue = await this.anonymizeValue(value, key, options, result);
                anonymized[key] = anonymizedValue;
                result.statistics.fieldsAnonymized++;
                result.techniques.push({
                    field: key,
                    technique: category.technique,
                    category: category
                });
            } else {
                anonymized[key] = value;
                result.preservedFields.push(key);
            }
        }

        return anonymized;
    }

    async anonymizeArray(arr, options, result) {
        const anonymized = [];

        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];

            if (typeof item === 'object' && item !== null) {
                anonymized.push(await this.anonymizeObject(item, options, result));
            } else {
                anonymized.push(await this.anonymizeValue(item, `item_${i}`, options, result));
            }
        }

        return anonymized;
    }

    async anonymizeValue(value, fieldName, options, result) {
        const category = this.identifyDataCategory(fieldName, value);

        switch (category.technique) {
            case this.anonymizationTechniques.SUPPRESSION:
                return this.suppressValue(value);

            case this.anonymizationTechniques.GENERALIZATION:
                return this.generalizeValue(value, fieldName);

            case this.anonymizationTechniques.HASHING:
                return this.hashValue(value);

            case this.anonymizationTechniques.TOKENIZATION:
                return this.tokenizeValue(value, fieldName);

            case this.anonymizationTechniques.SUBSTITUTION:
                return this.substituteValue(value, fieldName);

            case this.anonymizationTechniques.MASKING:
                return this.maskValue(value);

            default:
                return this.suppressValue(value);
        }
    }

    // Anonymization techniques implementation

    suppressValue(value) {
        return '[SUPPRESSED]';
    }

    generalizeValue(value, fieldName) {
        if (typeof value === 'number') {
            // Generalize numbers to ranges
            if (value < 18) return '0-17';
            if (value < 30) return '18-29';
            if (value < 50) return '30-49';
            if (value < 70) return '50-69';
            return '70+';
        }

        if (typeof value === 'string') {
            // Generalize strings
            if (fieldName.includes('email')) {
                const domain = value.split('@')[1];
                return `***@${domain}`;
            }

            if (fieldName.includes('address')) {
                return value.split(' ').slice(-2).join(' '); // Keep only city/state
            }
        }

        return '[GENERALIZED]';
    }

    hashValue(value) {
        return this.encryptionService.createHash(String(value));
    }

    tokenizeValue(value, fieldName) {
        const token = this.encryptionService.createSecureToken(8);
        return `${fieldName.toUpperCase()}_${token}`;
    }

    substituteValue(value, fieldName) {
        const substitutions = {
            name: ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa'],
            email: ['usuario@exemplo.com', 'contato@teste.com', 'info@demo.com'],
            phone: ['+55 11 9999-9999', '+55 21 8888-8888', '+55 31 7777-7777'],
            symptoms: ['sintoma genérico', 'desconforto leve', 'condição comum']
        };

        const categoryKey = Object.keys(substitutions).find(key =>
            fieldName.toLowerCase().includes(key)
        );

        if (categoryKey && substitutions[categoryKey]) {
            const options = substitutions[categoryKey];
            return options[Math.floor(Math.random() * options.length)];
        }

        return '[SUBSTITUTED]';
    }

    maskValue(value) {
        if (typeof value !== 'string') {
            return '[MASKED]';
        }

        if (value.length <= 4) {
            return '*'.repeat(value.length);
        }

        const visibleChars = 2;
        const maskedLength = value.length - (visibleChars * 2);
        return value.substring(0, visibleChars) +
            '*'.repeat(maskedLength) +
            value.substring(value.length - visibleChars);
    }

    // Helper methods

    identifyDataCategory(fieldName, value) {
        const lowerFieldName = fieldName.toLowerCase();

        for (const [categoryName, category] of Object.entries(this.dataCategories)) {
            if (category.fields.some(field => lowerFieldName.includes(field))) {
                return category;
            }
        }

        // Default category for unknown fields
        return {
            fields: [fieldName],
            sensitivity: this.sensitivityLevels.LOW,
            technique: this.anonymizationTechniques.GENERALIZATION
        };
    }

    shouldAnonymizeField(fieldName, category, options) {
        const { anonymizationLevel = 'STANDARD' } = options;

        switch (anonymizationLevel) {
            case 'MINIMAL':
                return category.sensitivity >= this.sensitivityLevels.CRITICAL;
            case 'STANDARD':
                return category.sensitivity >= this.sensitivityLevels.HIGH;
            case 'AGGRESSIVE':
                return category.sensitivity >= this.sensitivityLevels.MEDIUM;
            default:
                return category.sensitivity >= this.sensitivityLevels.HIGH;
        }
    }

    createDataHash(data) {
        return this.encryptionService.createHash(JSON.stringify(data));
    }

    generateAnonymizationId() {
        return 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generatePseudonymizationId() {
        return 'pseudo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateKeyId() {
        return 'key_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    logAnonymization(result) {
        this.anonymizationLog.push({
            id: result.id,
            timestamp: result.metadata.timestamp,
            fieldsProcessed: result.statistics.fieldsProcessed,
            fieldsAnonymized: result.statistics.fieldsAnonymized,
            techniques: result.techniques.map(t => t.technique),
            processingTime: result.statistics.processingTime
        });

        // Keep only last 1000 log entries
        if (this.anonymizationLog.length > 1000) {
            this.anonymizationLog = this.anonymizationLog.slice(-1000);
        }
    }

    // Statistical methods for privacy analysis

    generateLaplaceNoise(scale) {
        const u = Math.random() - 0.5;
        return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
    }

    generateGaussianNoise(mean, stdDev) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + stdDev * z0;
    }

    calculateInformationLoss(original, anonymized) {
        // Simplified information loss calculation
        return Math.max(0, 1 - (anonymized.length / original.length));
    }

    calculateDataUtility(anonymizedData, originalSize) {
        // Simplified utility calculation
        return Math.min(1, anonymizedData.length / originalSize);
    }

    calculatePrivacyStatistics(original, privatized) {
        const errors = original.map((val, i) => Math.abs(val - privatized[i]));

        return {
            meanError: errors.reduce((sum, err) => sum + err, 0) / errors.length,
            maxError: Math.max(...errors),
            utilityScore: 1 - (errors.reduce((sum, err) => sum + err, 0) / original.reduce((sum, val) => sum + Math.abs(val), 0))
        };
    }

    // Placeholder methods for complex operations
    async pseudonymizeObject(obj, keyId, mappings, options) {
        // Implementation would apply pseudonymization to object
        return obj;
    }

    async applyReverseMapping(data, reverseMappings) {
        // Implementation would reverse pseudonymization
        return data;
    }

    groupByQuasiIdentifiers(dataset, quasiIdentifiers) {
        // Implementation would group records by quasi-identifiers
        return new Map();
    }

    async processSmallGroup(records, k, quasiIdentifiers) {
        // Implementation would process groups that don't meet k-anonymity
        return records;
    }
}

export default DataAnonymizationService;