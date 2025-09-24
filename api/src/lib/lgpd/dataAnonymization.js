/**
 * LGPD Data Anonymization Utilities
 * Handles data anonymization for patient requests and compliance
 */

import { dataEncryption } from './encryption.js';

export class DataAnonymizer {
    constructor() {
        this.anonymizationPatterns = {
            email: (email) => {
                const [local, domain] = email.split('@');
                const anonymizedLocal = local.length > 2
                    ? local.substring(0, 2) + '*'.repeat(local.length - 2)
                    : '**';
                return `${anonymizedLocal}@${domain}`;
            },

            phone: (phone) => {
                const cleaned = phone.replace(/\D/g, '');
                if (cleaned.length >= 8) {
                    return cleaned.substring(0, 2) + '*'.repeat(cleaned.length - 4) + cleaned.slice(-2);
                }
                return '*'.repeat(cleaned.length);
            },

            name: (name) => {
                const parts = name.split(' ');
                return parts.map((part, index) => {
                    if (index === 0 || index === parts.length - 1) {
                        // Keep first and last name partially visible
                        return part.length > 2
                            ? part.substring(0, 2) + '*'.repeat(part.length - 2)
                            : part;
                    }
                    return '*'.repeat(part.length);
                }).join(' ');
            },

            cpf: (cpf) => {
                const cleaned = cpf.replace(/\D/g, '');
                if (cleaned.length === 11) {
                    return `${cleaned.substring(0, 3)}.***.**${cleaned.slice(-2)}`;
                }
                return '*'.repeat(cleaned.length);
            },

            address: (address) => {
                // Keep only the neighborhood/city visible
                const parts = address.split(',');
                if (parts.length > 1) {
                    return `*** ${parts[parts.length - 1].trim()}`;
                }
                return '*** [endereço oculto]';
            }
        };
    }

    /**
     * Anonymize a single field based on its type
     */
    anonymizeField(value, fieldType) {
        try {
            if (!value || typeof value !== 'string') return value;

            const anonymizer = this.anonymizationPatterns[fieldType];
            return anonymizer ? anonymizer(value) : this.genericAnonymize(value);
        } catch (error) {
            console.error(`Error anonymizing ${fieldType}:`, error);
            return '[dados ocultos]';
        }
    }

    /**
     * Generic anonymization for unknown field types
     */
    genericAnonymize(value) {
        if (typeof value !== 'string') return value;

        if (value.length <= 3) {
            return '*'.repeat(value.length);
        }

        return value.substring(0, 1) + '*'.repeat(value.length - 2) + value.slice(-1);
    }

    /**
     * Anonymize a complete record
     */
    anonymizeRecord(record, fieldMappings = {}) {
        try {
            const anonymized = { ...record };

            // Default field mappings
            const defaultMappings = {
                email: 'email',
                patient_email: 'email',
                phone: 'phone',
                patient_phone: 'phone',
                name: 'name',
                patient_name: 'name',
                cpf: 'cpf',
                address: 'address',
                patient_address: 'address'
            };

            const mappings = { ...defaultMappings, ...fieldMappings };

            Object.keys(mappings).forEach(field => {
                if (anonymized[field]) {
                    const fieldType = mappings[field];
                    anonymized[field] = this.anonymizeField(anonymized[field], fieldType);
                }
            });

            // Add anonymization metadata
            anonymized._anonymized = true;
            anonymized._anonymized_at = new Date().toISOString();

            return anonymized;
        } catch (error) {
            console.error('Error anonymizing record:', error);
            throw new Error('Failed to anonymize record');
        }
    }

    /**
     * Create anonymized export for patient data request
     */
    createAnonymizedExport(records, exportType = 'json') {
        try {
            const anonymizedRecords = records.map(record => {
                const anonymized = this.anonymizeRecord(record);

                // Remove internal system fields
                const cleaned = { ...anonymized };
                delete cleaned.id;
                delete cleaned.ip_hash;
                delete cleaned.created_at;
                delete cleaned.updated_at;
                delete cleaned.confirmation_token;

                return cleaned;
            });

            const exportData = {
                export_type: 'anonymized_data',
                generated_at: new Date().toISOString(),
                total_records: anonymizedRecords.length,
                lgpd_compliance: true,
                data: anonymizedRecords
            };

            switch (exportType) {
                case 'json':
                    return JSON.stringify(exportData, null, 2);
                case 'csv':
                    return this.convertToCSV(anonymizedRecords);
                default:
                    return exportData;
            }
        } catch (error) {
            console.error('Error creating anonymized export:', error);
            throw new Error('Failed to create anonymized export');
        }
    }

    /**
     * Convert anonymized data to CSV format
     */
    convertToCSV(records) {
        if (!records || records.length === 0) return '';

        const headers = Object.keys(records[0]).filter(key => !key.startsWith('_'));
        const csvHeaders = headers.join(',');

        const csvRows = records.map(record => {
            return headers.map(header => {
                const value = record[header] || '';
                // Escape commas and quotes in CSV
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',');
        });

        return [csvHeaders, ...csvRows].join('\n');
    }

    /**
     * Generate anonymization report
     */
    generateAnonymizationReport(originalCount, anonymizedCount, fieldTypes) {
        return {
            timestamp: new Date().toISOString(),
            original_records: originalCount,
            anonymized_records: anonymizedCount,
            fields_anonymized: fieldTypes,
            compliance_status: 'LGPD_COMPLIANT',
            retention_policy: 'Data anonymized according to LGPD Article 12',
            contact_for_questions: 'privacidade@saraivavision.com.br'
        };
    }

    /**
     * Validate if data is properly anonymized
     */
    validateAnonymization(record) {
        const validationRules = {
            email: /^[a-zA-Z0-9]*\*+[a-zA-Z0-9]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            phone: /^[\d]*\*+[\d]*$/,
            cpf: /^\d{3}\.\*{3}\.\*{2}\d{2}$/
        };

        const issues = [];

        Object.keys(validationRules).forEach(field => {
            if (record[field] && !validationRules[field].test(record[field])) {
                issues.push(`Invalid anonymization for field: ${field}`);
            }
        });

        return {
            isValid: issues.length === 0,
            issues
        };
    }
}

// Singleton instance
export const dataAnonymizer = new DataAnonymizer();

/**
 * LGPD Data Subject Rights Handler
 */
export class DataSubjectRights {
    constructor() {
        this.anonymizer = new DataAnonymizer();
    }

    /**
     * Handle data portability request (Article 18, V)
     */
    async handlePortabilityRequest(patientIdentifier, format = 'json') {
        try {
            // This would typically fetch data from your database
            const patientData = await this.fetchPatientData(patientIdentifier);

            if (!patientData || patientData.length === 0) {
                return {
                    success: false,
                    message: 'Nenhum dado encontrado para o identificador fornecido'
                };
            }

            const exportData = this.anonymizer.createAnonymizedExport(patientData, format);

            return {
                success: true,
                data: exportData,
                format,
                generated_at: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error handling portability request:', error);
            return {
                success: false,
                message: 'Erro ao processar solicitação de portabilidade'
            };
        }
    }

    /**
     * Handle data deletion request (Article 18, VI)
     */
    async handleDeletionRequest(patientIdentifier, reason) {
        try {
            // First, create an anonymized backup for audit purposes
            const patientData = await this.fetchPatientData(patientIdentifier);

            if (patientData && patientData.length > 0) {
                const anonymizedBackup = this.anonymizer.createAnonymizedExport(patientData);

                // Store anonymized backup for audit trail
                await this.storeAnonymizedBackup(patientIdentifier, anonymizedBackup, reason);

                // Delete original data
                await this.deletePatientData(patientIdentifier);

                return {
                    success: true,
                    message: 'Dados removidos com sucesso. Backup anonimizado mantido para auditoria.',
                    deleted_at: new Date().toISOString()
                };
            }

            return {
                success: false,
                message: 'Nenhum dado encontrado para remoção'
            };
        } catch (error) {
            console.error('Error handling deletion request:', error);
            return {
                success: false,
                message: 'Erro ao processar solicitação de remoção'
            };
        }
    }

    /**
     * Fetch patient data (placeholder - implement with your database)
     */
    async fetchPatientData(patientIdentifier) {
        // This should be implemented to fetch from your actual database
        console.log('Fetching patient data for:', patientIdentifier);
        return [];
    }

    /**
     * Store anonymized backup (placeholder - implement with your database)
     */
    async storeAnonymizedBackup(patientIdentifier, anonymizedData, reason) {
        // This should be implemented to store in your audit system
        console.log('Storing anonymized backup for:', patientIdentifier, 'Reason:', reason);
    }

    /**
     * Delete patient data (placeholder - implement with your database)
     */
    async deletePatientData(patientIdentifier) {
        // This should be implemented to delete from your actual database
        console.log('Deleting patient data for:', patientIdentifier);
    }
}

// Singleton instance
export const dataSubjectRights = new DataSubjectRights();