/**
 * Tests for LGPD Data Anonymization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dataAnonymizer, DataSubjectRights } from '../../lib/lgpd/dataAnonymization.js';

describe('DataAnonymizer', () => {
    describe('anonymizeField', () => {
        it('should anonymize email addresses correctly', () => {
            const email = 'patient@example.com';
            const result = dataAnonymizer.anonymizeField(email, 'email');

            expect(result).toBe('pa*****@example.com');
            expect(result).toContain('@example.com');
        });

        it('should anonymize phone numbers correctly', () => {
            const phone = '11999887766';
            const result = dataAnonymizer.anonymizeField(phone, 'phone');

            expect(result).toBe('11*******66');
            expect(result).toMatch(/^\d{2}\*+\d{2}$/);
        });

        it('should anonymize names correctly', () => {
            const name = 'João Silva Santos';
            const result = dataAnonymizer.anonymizeField(name, 'name');

            expect(result).toBe('Jo** ***** Sa****');
            expect(result.split(' ')).toHaveLength(3);
        });

        it('should anonymize CPF correctly', () => {
            const cpf = '12345678901';
            const result = dataAnonymizer.anonymizeField(cpf, 'cpf');

            expect(result).toBe('123.***.**01');
            expect(result).toMatch(/^\d{3}\.\*{3}\.\*{2}\d{2}$/);
        });

        it('should anonymize addresses correctly', () => {
            const address = 'Rua das Flores, 123, Centro, São Paulo';
            const result = dataAnonymizer.anonymizeField(address, 'address');

            expect(result).toBe('*** São Paulo');
            expect(result).toContain('São Paulo');
        });

        it('should handle short email addresses', () => {
            const email = 'a@b.co';
            const result = dataAnonymizer.anonymizeField(email, 'email');

            expect(result).toBe('**@b.co');
        });

        it('should handle empty or null values', () => {
            expect(dataAnonymizer.anonymizeField('', 'email')).toBe('');
            expect(dataAnonymizer.anonymizeField(null, 'phone')).toBeNull();
            expect(dataAnonymizer.anonymizeField(undefined, 'name')).toBeUndefined();
        });

        it('should use generic anonymization for unknown field types', () => {
            const value = 'sensitive-data';
            const result = dataAnonymizer.anonymizeField(value, 'unknown');

            expect(result).toBe('s************a');
        });
    });

    describe('anonymizeRecord', () => {
        it('should anonymize all sensitive fields in a record', () => {
            const record = {
                id: '123',
                name: 'Maria Silva',
                email: 'maria@example.com',
                phone: '11987654321',
                cpf: '98765432100',
                address: 'Av. Paulista, 1000, Bela Vista, São Paulo',
                message: 'Gostaria de agendar uma consulta'
            };

            const result = dataAnonymizer.anonymizeRecord(record);

            expect(result.name).toBe('Ma*** Si***');
            expect(result.email).toBe('ma***@example.com');
            expect(result.phone).toBe('11*******21');
            expect(result.cpf).toBe('987.***.**00');
            expect(result.address).toBe('*** São Paulo');
            expect(result.id).toBe('123'); // Non-sensitive field unchanged
            expect(result._anonymized).toBe(true);
            expect(result._anonymized_at).toBeDefined();
        });

        it('should handle custom field mappings', () => {
            const record = {
                patient_email: 'test@example.com',
                custom_field: 'sensitive-info'
            };

            const fieldMappings = {
                custom_field: 'name'
            };

            const result = dataAnonymizer.anonymizeRecord(record, fieldMappings);

            expect(result.patient_email).toBe('te**@example.com');
            expect(result.custom_field).toBe('se************');
        });

        it('should handle records with missing fields gracefully', () => {
            const record = {
                id: '456',
                name: 'João Santos'
            };

            const result = dataAnonymizer.anonymizeRecord(record);

            expect(result.name).toBe('Jo** Sa****');
            expect(result.id).toBe('456');
            expect(result._anonymized).toBe(true);
        });
    });

    describe('createAnonymizedExport', () => {
        it('should create JSON export with anonymized data', () => {
            const records = [
                {
                    id: '1',
                    name: 'Patient One',
                    email: 'patient1@example.com',
                    created_at: '2024-01-01T00:00:00Z'
                },
                {
                    id: '2',
                    name: 'Patient Two',
                    email: 'patient2@example.com',
                    created_at: '2024-01-02T00:00:00Z'
                }
            ];

            const result = dataAnonymizer.createAnonymizedExport(records, 'json');
            const exportData = JSON.parse(result);

            expect(exportData.export_type).toBe('anonymized_data');
            expect(exportData.total_records).toBe(2);
            expect(exportData.lgpd_compliance).toBe(true);
            expect(exportData.data).toHaveLength(2);
            expect(exportData.data[0].name).toBe('Pa***** On*');
            expect(exportData.data[0]).not.toHaveProperty('id');
            expect(exportData.data[0]).not.toHaveProperty('created_at');
        });

        it('should create CSV export with anonymized data', () => {
            const records = [
                {
                    name: 'Test User',
                    email: 'test@example.com'
                }
            ];

            const result = dataAnonymizer.createAnonymizedExport(records, 'csv');

            expect(result).toContain('name,email');
            expect(result).toContain('"Te** Us**","te**@example.com"');
        });

        it('should handle empty records array', () => {
            const result = dataAnonymizer.createAnonymizedExport([], 'json');
            const exportData = JSON.parse(result);

            expect(exportData.total_records).toBe(0);
            expect(exportData.data).toHaveLength(0);
        });
    });

    describe('convertToCSV', () => {
        it('should convert records to CSV format', () => {
            const records = [
                { name: 'John', email: 'john@test.com' },
                { name: 'Jane', email: 'jane@test.com' }
            ];

            const result = dataAnonymizer.convertToCSV(records);

            expect(result).toBe('name,email\n"John","john@test.com"\n"Jane","jane@test.com"');
        });

        it('should handle records with commas and quotes', () => {
            const records = [
                { name: 'John "Johnny" Doe', address: 'Street, 123' }
            ];

            const result = dataAnonymizer.convertToCSV(records);

            expect(result).toContain('"John ""Johnny"" Doe"');
            expect(result).toContain('"Street, 123"');
        });

        it('should return empty string for empty array', () => {
            const result = dataAnonymizer.convertToCSV([]);
            expect(result).toBe('');
        });
    });

    describe('validateAnonymization', () => {
        it('should validate properly anonymized email', () => {
            const record = { email: 'te**@example.com' };
            const result = dataAnonymizer.validateAnonymization(record);

            expect(result.isValid).toBe(true);
            expect(result.issues).toHaveLength(0);
        });

        it('should detect invalid email anonymization', () => {
            const record = { email: 'test@example.com' }; // Not anonymized
            const result = dataAnonymizer.validateAnonymization(record);

            expect(result.isValid).toBe(false);
            expect(result.issues).toContain('Invalid anonymization for field: email');
        });

        it('should validate properly anonymized CPF', () => {
            const record = { cpf: '123.***.**89' };
            const result = dataAnonymizer.validateAnonymization(record);

            expect(result.isValid).toBe(true);
        });

        it('should detect invalid CPF anonymization', () => {
            const record = { cpf: '12345678901' }; // Not anonymized
            const result = dataAnonymizer.validateAnonymization(record);

            expect(result.isValid).toBe(false);
            expect(result.issues).toContain('Invalid anonymization for field: cpf');
        });
    });

    describe('generateAnonymizationReport', () => {
        it('should generate complete anonymization report', () => {
            const report = dataAnonymizer.generateAnonymizationReport(
                100, 95, ['email', 'phone', 'name']
            );

            expect(report.original_records).toBe(100);
            expect(report.anonymized_records).toBe(95);
            expect(report.fields_anonymized).toEqual(['email', 'phone', 'name']);
            expect(report.compliance_status).toBe('LGPD_COMPLIANT');
            expect(report.contact_for_questions).toBe('privacidade@saraivavision.com.br');
            expect(report.timestamp).toBeDefined();
        });
    });
});

describe('DataSubjectRights', () => {
    let dataSubjectRights;

    beforeEach(() => {
        dataSubjectRights = new DataSubjectRights();

        // Mock the database methods
        dataSubjectRights.fetchPatientData = vi.fn();
        dataSubjectRights.storeAnonymizedBackup = vi.fn();
        dataSubjectRights.deletePatientData = vi.fn();
    });

    describe('handlePortabilityRequest', () => {
        it('should handle successful portability request', async () => {
            const mockData = [
                { name: 'Test Patient', email: 'test@example.com' }
            ];

            dataSubjectRights.fetchPatientData.mockResolvedValue(mockData);

            const result = await dataSubjectRights.handlePortabilityRequest('test@example.com', 'json');

            expect(result.success).toBe(true);
            expect(result.format).toBe('json');
            expect(result.data).toBeDefined();
            expect(result.generated_at).toBeDefined();
        });

        it('should handle no data found', async () => {
            dataSubjectRights.fetchPatientData.mockResolvedValue([]);

            const result = await dataSubjectRights.handlePortabilityRequest('notfound@example.com');

            expect(result.success).toBe(false);
            expect(result.message).toContain('Nenhum dado encontrado');
        });

        it('should handle database errors', async () => {
            dataSubjectRights.fetchPatientData.mockRejectedValue(new Error('Database error'));

            const result = await dataSubjectRights.handlePortabilityRequest('error@example.com');

            expect(result.success).toBe(false);
            expect(result.message).toContain('Erro ao processar');
        });
    });

    describe('handleDeletionRequest', () => {
        it('should handle successful deletion request', async () => {
            const mockData = [
                { name: 'Test Patient', email: 'test@example.com' }
            ];

            dataSubjectRights.fetchPatientData.mockResolvedValue(mockData);
            dataSubjectRights.storeAnonymizedBackup.mockResolvedValue(true);
            dataSubjectRights.deletePatientData.mockResolvedValue(true);

            const result = await dataSubjectRights.handleDeletionRequest(
                'test@example.com',
                'Patient request'
            );

            expect(result.success).toBe(true);
            expect(result.message).toContain('removidos com sucesso');
            expect(result.deleted_at).toBeDefined();
            expect(dataSubjectRights.storeAnonymizedBackup).toHaveBeenCalled();
            expect(dataSubjectRights.deletePatientData).toHaveBeenCalled();
        });

        it('should handle no data to delete', async () => {
            dataSubjectRights.fetchPatientData.mockResolvedValue([]);

            const result = await dataSubjectRights.handleDeletionRequest('notfound@example.com');

            expect(result.success).toBe(false);
            expect(result.message).toContain('Nenhum dado encontrado');
        });
    });
});