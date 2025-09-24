/**
 * LGPD Data Subject Rights API
 * Handles patient requests for data access, portability, and deletion
 */

import { supabase } from '../lib/supabase.js';
import { serverEncryption } from '../utils/encryption.js';
import { DataAnonymizer } from '../lib/lgpd/dataAnonymization.js';

const dataAnonymizer = new DataAnonymizer();

export default async function handler(req, res) {
    // Set CORS headers
    const allowedOrigin = process.env.ALLOWED_ORIGIN;
    if (!allowedOrigin && process.env.NODE_ENV === 'production') {
        throw new Error('ALLOWED_ORIGIN must be set in production');
    }
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin || 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { action, patientIdentifier, verificationCode, requestReason, format = 'json' } = req.body;

        // Validate required fields
        if (!action || !patientIdentifier || !verificationCode) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios: action, patientIdentifier, verificationCode'
            });
        }

        // Verify the patient identity (simplified - in production, use more robust verification)
        const isVerified = await verifyPatientIdentity(patientIdentifier, verificationCode);
        if (!isVerified) {
            return res.status(403).json({
                success: false,
                error: 'Falha na verificação de identidade'
            });
        }

        switch (action) {
            case 'access':
                return await handleDataAccessRequest(res, patientIdentifier);

            case 'portability':
                return await handleDataPortabilityRequest(res, patientIdentifier, format);

            case 'deletion':
                return await handleDataDeletionRequest(res, patientIdentifier, requestReason);

            case 'anonymization':
                return await handleDataAnonymizationRequest(res, patientIdentifier, requestReason);

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Ação não suportada. Use: access, portability, deletion, anonymization'
                });
        }

    } catch (error) {
        console.error('LGPD request error:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
}

/**
 * Verify patient identity using email and verification code
 */
async function verifyPatientIdentity(patientIdentifier, verificationCode) {
    try {
        // In production, implement proper verification:
        // 1. Send verification code via email/SMS
        // 2. Store code temporarily with expiration
        // 3. Verify code matches and hasn't expired

        // For now, simple check (replace with proper implementation)
        const { data: patient } = await supabase
            .from('contact_messages')
            .select('email')
            .eq('email', patientIdentifier)
            .single();

        return patient !== null;
    } catch (error) {
        console.error('Identity verification error:', error);
        return false;
    }
}

/**
 * Handle data access request (Article 15 - Right of access)
 */
async function handleDataAccessRequest(res, patientIdentifier) {
    try {
        const patientData = await fetchAllPatientData(patientIdentifier);

        if (!patientData || Object.keys(patientData).length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nenhum dado encontrado para o identificador fornecido'
            });
        }

        // Decrypt sensitive data for the patient's own access
        const decryptedData = {};
        for (const [table, records] of Object.entries(patientData)) {
            decryptedData[table] = records.map(record =>
                serverEncryption.decryptPersonalData(record)
            );
        }

        return res.status(200).json({
            success: true,
            message: 'Dados pessoais encontrados',
            data: decryptedData,
            generated_at: new Date().toISOString(),
            lgpd_rights: {
                access: 'Você tem direito de acessar seus dados pessoais',
                rectification: 'Você pode solicitar correção de dados incorretos',
                deletion: 'Você pode solicitar a exclusão dos seus dados',
                portability: 'Você pode solicitar seus dados em formato estruturado',
                objection: 'Você pode se opor ao processamento dos seus dados'
            }
        });

    } catch (error) {
        console.error('Data access request error:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao acessar dados pessoais'
        });
    }
}

/**
 * Handle data portability request (Article 20 - Right to data portability)
 */
async function handleDataPortabilityRequest(res, patientIdentifier, format) {
    try {
        const patientData = await fetchAllPatientData(patientIdentifier);

        if (!patientData || Object.keys(patientData).length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nenhum dado encontrado para exportação'
            });
        }

        // Flatten all records for export
        const allRecords = [];
        for (const [table, records] of Object.entries(patientData)) {
            records.forEach(record => {
                const decrypted = serverEncryption.decryptPersonalData(record);
                allRecords.push({
                    ...decrypted,
                    source_table: table
                });
            });
        }

        const exportData = dataAnonymizer.createAnonymizedExport(allRecords, format);

        // Log the export request for audit
        await logDataExport(patientIdentifier, 'portability', allRecords.length);

        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="meus_dados_saraiva_vision.csv"');
            return res.status(200).send(exportData);
        }

        return res.status(200).json({
            success: true,
            message: 'Dados exportados com sucesso',
            data: exportData,
            format,
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Data portability request error:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao exportar dados pessoais'
        });
    }
}

/**
 * Handle data deletion request (Article 17 - Right to erasure)
 */
async function handleDataDeletionRequest(res, patientIdentifier, requestReason) {
    try {
        const patientData = await fetchAllPatientData(patientIdentifier);

        if (!patientData || Object.keys(patientData).length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nenhum dado encontrado para exclusão'
            });
        }

        // Create anonymized backup for audit purposes
        const allRecords = [];
        for (const [table, records] of Object.entries(patientData)) {
            records.forEach(record => {
                const decrypted = serverEncryption.decryptPersonalData(record);
                allRecords.push({
                    ...decrypted,
                    source_table: table
                });
            });
        }

        const anonymizedBackup = dataAnonymizer.createAnonymizedExport(allRecords);

        // Store anonymized backup
        await storeAnonymizedBackup(patientIdentifier, anonymizedBackup, requestReason);

        // Delete actual data
        let deletedCount = 0;
        for (const [table, records] of Object.entries(patientData)) {
            const ids = records.map(record => record.id);
            const { count } = await supabase
                .from(table)
                .delete()
                .in('id', ids);
            deletedCount += count || 0;
        }

        // Log the deletion for audit
        await logDataDeletion(patientIdentifier, requestReason, deletedCount);

        return res.status(200).json({
            success: true,
            message: 'Dados pessoais excluídos com sucesso',
            deleted_records: deletedCount,
            deleted_at: new Date().toISOString(),
            audit_note: 'Backup anonimizado mantido para fins de auditoria conforme LGPD'
        });

    } catch (error) {
        console.error('Data deletion request error:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao excluir dados pessoais'
        });
    }
}

/**
 * Handle data anonymization request
 */
async function handleDataAnonymizationRequest(res, patientIdentifier, requestReason) {
    try {
        const patientData = await fetchAllPatientData(patientIdentifier);

        if (!patientData || Object.keys(patientData).length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nenhum dado encontrado para anonimização'
            });
        }

        let anonymizedCount = 0;

        // Anonymize data in each table
        for (const [table, records] of Object.entries(patientData)) {
            for (const record of records) {
                const decrypted = serverEncryption.decryptPersonalData(record);
                const anonymized = dataAnonymizer.anonymizeRecord(decrypted);
                const reencrypted = serverEncryption.encryptPersonalData(anonymized);

                await supabase
                    .from(table)
                    .update(reencrypted)
                    .eq('id', record.id);

                anonymizedCount++;
            }
        }

        // Log the anonymization for audit
        await logDataAnonymization(patientIdentifier, requestReason, anonymizedCount);

        return res.status(200).json({
            success: true,
            message: 'Dados pessoais anonimizados com sucesso',
            anonymized_records: anonymizedCount,
            anonymized_at: new Date().toISOString(),
            note: 'Dados mantidos de forma anonimizada para fins estatísticos'
        });

    } catch (error) {
        console.error('Data anonymization request error:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao anonimizar dados pessoais'
        });
    }
}

/**
 * Fetch all patient data from all relevant tables
 */
async function fetchAllPatientData(patientIdentifier) {
    try {
        const tables = ['contact_messages', 'appointments'];
        const patientData = {};

        for (const table of tables) {
            let query = supabase.from(table).select('*');

            // Different tables may use different email field names
            if (table === 'appointments') {
                query = query.eq('patient_email', patientIdentifier);
            } else {
                query = query.eq('email', patientIdentifier);
            }

            const { data, error } = await query;

            if (error) {
                console.error(`Error fetching from ${table}:`, error);
                continue;
            }

            if (data && data.length > 0) {
                patientData[table] = data;
            }
        }

        return patientData;
    } catch (error) {
        console.error('Error fetching patient data:', error);
        throw error;
    }
}

/**
 * Store anonymized backup for audit purposes
 */
async function storeAnonymizedBackup(patientIdentifier, anonymizedData, reason) {
    try {
        await supabase
            .from('lgpd_audit_log')
            .insert({
                patient_identifier: serverEncryption.hash(patientIdentifier).hash,
                action: 'anonymized_backup',
                reason,
                anonymized_data: anonymizedData,
                created_at: new Date().toISOString()
            });
    } catch (error) {
        console.error('Error storing anonymized backup:', error);
    }
}

/**
 * Log data export for audit
 */
async function logDataExport(patientIdentifier, exportType, recordCount) {
    try {
        const { error } = await supabase
            .from('lgpd_audit_log')
            .insert({
                patient_identifier: serverEncryption.hash(patientIdentifier).hash,
                action: `data_export_${exportType}`,
                record_count: recordCount,
                created_at: new Date().toISOString()
            });

        if (error) {
            // Log to alternative audit system or alert
            console.error('Critical: Audit log failed:', error);
            // Consider throwing to prevent operation if audit is mandatory
            throw new Error('Audit logging failed - operation cannot proceed');
        }
    } catch (error) {
        console.error('Error logging data export:', error);
        // Re-throw for critical audit failures
        throw error;
    }
}

/**
 * Log data deletion for audit
 */
async function logDataDeletion(patientIdentifier, reason, recordCount) {
    try {
        await supabase
            .from('lgpd_audit_log')
            .insert({
                patient_identifier: serverEncryption.hash(patientIdentifier).hash,
                action: 'data_deletion',
                reason,
                record_count: recordCount,
                created_at: new Date().toISOString()
            });
    } catch (error) {
        console.error('Error logging data deletion:', error);
    }
}

/**
 * Log data anonymization for audit
 */
async function logDataAnonymization(patientIdentifier, reason, recordCount) {
    try {
        await supabase
            .from('lgpd_audit_log')
            .insert({
                patient_identifier: serverEncryption.hash(patientIdentifier).hash,
                action: 'data_anonymization',
                reason,
                record_count: recordCount,
                created_at: new Date().toISOString()
            });
    } catch (error) {
        console.error('Error logging data anonymization:', error);
    }
}