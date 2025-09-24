/**
 * Data Management API
 * Handles automated data retention, anonymization, and user data portability requests
 */

import DataManagementService from '../../src/services/dataManagementService.js';
import DataAnonymizationService from '../../src/services/dataAnonymizationService.js';
import { validateInput } from '../utils/inputValidation.js';
import { createSecurityHeaders } from '../utils/securityHeaders.js';
import { supabase } from '../utils/supabase.js';

const dataManagementService = new DataManagementService();
const anonymizationService = new DataAnonymizationService();

export default async function handler(req, res) {
    // Set security headers
    createSecurityHeaders(res);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { method, query, body } = req;
        const { action } = query;

        // Validate request
        const validation = validateDataManagementRequest(method, action, body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: validation.message,
                details: validation.errors
            });
        }

        // Route to appropriate handler
        switch (action) {
            case 'run-retention':
                return await handleRunRetention(req, res);

            case 'run-anonymization':
                return await handleRunAnonymization(req, res);

            case 'export-user-data':
                return await handleExportUserData(req, res);

            case 'get-export-status':
                return await handleGetExportStatus(req, res);

            case 'download-export':
                return await handleDownloadExport(req, res);

            case 'anonymize-data':
                return await handleAnonymizeData(req, res);

            case 'pseudonymize-data':
                return await handlePseudonymizeData(req, res);

            case 'reverse-pseudonymization':
                return await handleReversePseudonymization(req, res);

            case 'get-statistics':
                return await handleGetStatistics(req, res);

            case 'user-rights-request':
                return await handleUserRightsRequest(req, res);

            default:
                return res.status(400).json({
                    success: false,
                    error: 'INVALID_ACTION',
                    message: `Unknown action: ${action}`
                });
        }

    } catch (error) {
        console.error('Data management API error:', error);

        return res.status(500).json({
            success: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
}

/**
 * Handles automated data retention execution
 */
async function handleRunRetention(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'METHOD_NOT_ALLOWED',
            message: 'Only POST method is allowed'
        });
    }

    try {
        const {
            dryRun = false,
            dataTypes = ['ALL'],
            batchSize = 100,
            maxProcessingTime = 30 * 60 * 1000 // 30 minutes
        } = req.body;

        // Check if user has admin permissions
        const hasPermission = await checkAdminPermission(req);
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                error: 'INSUFFICIENT_PERMISSIONS',
                message: 'Admin permissions required for data retention operations'
            });
        }

        const result = await dataManagementService.runAutomatedDataRetention({
            dryRun,
            dataTypes,
            batchSize,
            maxProcessingTime
        });

        // Log the operation
        await logDataManagementOperation({
            operation: 'DATA_RETENTION',
            userId: req.user?.id,
            parameters: { dryRun, dataTypes, batchSize },
            result: result.success,
            timestamp: new Date()
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error in run retention handler:', error);
        return res.status(500).json({
            success: false,
            error: 'RETENTION_EXECUTION_ERROR',
            message: error.message
        });
    }
}

/**
 * Handles automated data anonymization execution
 */
async function handleRunAnonymization(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'METHOD_NOT_ALLOWED'
        });
    }

    try {
        const {
            dataTypes = ['CONVERSATION_DATA', 'SESSION_DATA'],
            retentionThreshold = 365,
            batchSize = 50
        } = req.body;

        // Check admin permissions
        const hasPermission = await checkAdminPermission(req);
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                error: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        const result = await dataManagementService.runAutomatedAnonymization({
            dataTypes,
            retentionThreshold,
            batchSize
        });

        await logDataManagementOperation({
            operation: 'DATA_ANONYMIZATION',
            userId: req.user?.id,
            parameters: { dataTypes, retentionThreshold, batchSize },
            result: result.success,
            timestamp: new Date()
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error in run anonymization handler:', error);
        return res.status(500).json({
            success: false,
            error: 'ANONYMIZATION_EXECUTION_ERROR',
            message: error.message
        });
    }
}

/**
 * Handles user data export requests
 */
async function handleExportUserData(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'METHOD_NOT_ALLOWED'
        });
    }

    try {
        const {
            sessionId,
            format = 'JSON',
            dataTypes = ['ALL'],
            includeMetadata = true,
            anonymizeExport = false
        } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_SESSION_ID',
                message: 'Session ID is required for data export'
            });
        }

        // Validate export format
        const validFormats = ['JSON', 'CSV', 'XML', 'PDF'];
        if (!validFormats.includes(format)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_FORMAT',
                message: `Format must be one of: ${validFormats.join(', ')}`
            });
        }

        const result = await dataManagementService.exportUserData(sessionId, {
            format,
            dataTypes,
            includeMetadata,
            anonymizeExport
        });

        // Log export request
        await logDataManagementOperation({
            operation: 'DATA_EXPORT',
            sessionId,
            parameters: { format, dataTypes, includeMetadata, anonymizeExport },
            result: result.success,
            timestamp: new Date()
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error in export user data handler:', error);
        return res.status(500).json({
            success: false,
            error: 'EXPORT_REQUEST_ERROR',
            message: error.message
        });
    }
}

/**
 * Handles export status requests
 */
async function handleGetExportStatus(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'METHOD_NOT_ALLOWED'
        });
    }

    try {
        const { exportId } = req.query;

        if (!exportId) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_EXPORT_ID',
                message: 'Export ID is required'
            });
        }

        const exportRecord = dataManagementService.processingStatus.export.activeExports.get(exportId);

        if (!exportRecord) {
            return res.status(404).json({
                success: false,
                error: 'EXPORT_NOT_FOUND',
                message: 'Export record not found'
            });
        }

        return res.status(200).json({
            success: true,
            export: {
                id: exportRecord.id,
                status: exportRecord.status,
                format: exportRecord.format,
                dataTypes: exportRecord.dataTypes,
                createdAt: exportRecord.createdAt,
                estimatedCompletion: exportRecord.estimatedCompletion,
                completedAt: exportRecord.completedAt,
                downloadUrl: exportRecord.downloadUrl,
                expiresAt: exportRecord.expiresAt,
                fileSize: exportRecord.fileSize,
                error: exportRecord.error
            }
        });

    } catch (error) {
        console.error('Error in get export status handler:', error);
        return res.status(500).json({
            success: false,
            error: 'EXPORT_STATUS_ERROR',
            message: error.message
        });
    }
}

/**
 * Handles data anonymization requests
 */
async function handleAnonymizeData(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'METHOD_NOT_ALLOWED'
        });
    }

    try {
        const {
            data,
            anonymizationLevel = 'STANDARD',
            preserveStructure = true,
            retainStatisticalProperties = false
        } = req.body;

        if (!data) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_DATA',
                message: 'Data is required for anonymization'
            });
        }

        const result = await anonymizationService.anonymizeData(data, {
            anonymizationLevel,
            preserveStructure,
            retainStatisticalProperties
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error in anonymize data handler:', error);
        return res.status(500).json({
            success: false,
            error: 'ANONYMIZATION_ERROR',
            message: error.message
        });
    }
}

/**
 * Handles data pseudonymization requests
 */
async function handlePseudonymizeData(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'METHOD_NOT_ALLOWED'
        });
    }

    try {
        const {
            data,
            preserveFormat = true,
            deterministicMapping = true
        } = req.body;

        if (!data) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_DATA',
                message: 'Data is required for pseudonymization'
            });
        }

        const result = await anonymizationService.pseudonymizeData(data, {
            preserveFormat,
            deterministicMapping
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error in pseudonymize data handler:', error);
        return res.status(500).json({
            success: false,
            error: 'PSEUDONYMIZATION_ERROR',
            message: error.message
        });
    }
}

/**
 * Handles pseudonymization reversal requests
 */
async function handleReversePseudonymization(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'METHOD_NOT_ALLOWED'
        });
    }

    try {
        const { pseudonymizedData, pseudonymizationId } = req.body;

        if (!pseudonymizedData || !pseudonymizationId) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_PARAMETERS',
                message: 'Pseudonymized data and pseudonymization ID are required'
            });
        }

        const result = await anonymizationService.reversePseudonymization(
            pseudonymizedData,
            pseudonymizationId
        );

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error in reverse pseudonymization handler:', error);
        return res.status(500).json({
            success: false,
            error: 'REVERSAL_ERROR',
            message: error.message
        });
    }
}

/**
 * Handles data management statistics requests
 */
async function handleGetStatistics(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'METHOD_NOT_ALLOWED'
        });
    }

    try {
        // Check admin permissions for detailed statistics
        const hasPermission = await checkAdminPermission(req);
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                error: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        const statistics = await dataManagementService.getDataManagementStatistics();

        return res.status(200).json({
            success: true,
            statistics
        });

    } catch (error) {
        console.error('Error in get statistics handler:', error);
        return res.status(500).json({
            success: false,
            error: 'STATISTICS_ERROR',
            message: error.message
        });
    }
}

/**
 * Handles user rights requests (LGPD compliance)
 */
async function handleUserRightsRequest(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'METHOD_NOT_ALLOWED'
        });
    }

    try {
        const {
            sessionId,
            rightType, // 'access', 'rectification', 'deletion', 'portability', 'objection'
            requestData = {}
        } = req.body;

        if (!sessionId || !rightType) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_PARAMETERS',
                message: 'Session ID and right type are required'
            });
        }

        const validRights = ['access', 'rectification', 'deletion', 'portability', 'objection'];
        if (!validRights.includes(rightType)) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_RIGHT_TYPE',
                message: `Right type must be one of: ${validRights.join(', ')}`
            });
        }

        const result = await dataManagementService.privacyManager.processUserRightsRequest({
            sessionId,
            rightType,
            requestData
        });

        // Log user rights request
        await logDataManagementOperation({
            operation: 'USER_RIGHTS_REQUEST',
            sessionId,
            parameters: { rightType, requestData },
            result: result.success,
            timestamp: new Date()
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error in user rights request handler:', error);
        return res.status(500).json({
            success: false,
            error: 'USER_RIGHTS_ERROR',
            message: error.message
        });
    }
}

// Helper functions

function validateDataManagementRequest(method, action, body) {
    const validation = { isValid: true, errors: [] };

    // Validate method
    const allowedMethods = ['GET', 'POST', 'OPTIONS'];
    if (!allowedMethods.includes(method)) {
        validation.isValid = false;
        validation.errors.push(`Method ${method} not allowed`);
    }

    // Validate action
    const allowedActions = [
        'run-retention',
        'run-anonymization',
        'export-user-data',
        'get-export-status',
        'download-export',
        'anonymize-data',
        'pseudonymize-data',
        'reverse-pseudonymization',
        'get-statistics',
        'user-rights-request'
    ];

    if (!allowedActions.includes(action)) {
        validation.isValid = false;
        validation.errors.push(`Invalid action: ${action}`);
    }

    // Validate body for POST requests
    if (method === 'POST' && !body) {
        validation.isValid = false;
        validation.errors.push('Request body is required for POST requests');
    }

    if (!validation.isValid) {
        validation.message = validation.errors.join(', ');
    }

    return validation;
}

async function checkAdminPermission(req) {
    // Implementation would check user permissions
    // For now, return true for development
    return process.env.NODE_ENV === 'development' || req.headers['x-admin-key'] === process.env.ADMIN_API_KEY;
}

async function logDataManagementOperation(operation) {
    try {
        // Log to audit system
        const { data, error } = await supabase
            .from('chatbot_audit_logs')
            .insert({
                event_type: operation.operation,
                session_id: operation.sessionId,
                event_data: {
                    parameters: operation.parameters,
                    result: operation.result,
                    timestamp: operation.timestamp
                },
                compliance_category: 'lgpd',
                severity_level: 'info'
            });

        if (error) {
            console.error('Error logging data management operation:', error);
        }
    } catch (error) {
        console.error('Error in log operation:', error);
    }
}