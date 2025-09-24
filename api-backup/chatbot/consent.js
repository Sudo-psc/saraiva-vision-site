/**
 * LGPD Consent Management API
 * Handles user consent for data processing and privacy rights
 */

import conversationStateManager from '../../src/services/conversationStateManager.js';

/**
 * Consent management handler
 */
export default async function handler(req, res) {
    const { method } = req;
    const { sessionId } = req.query;

    try {
        switch (method) {
            case 'GET':
                return await handleGetConsent(req, res, sessionId);
            case 'POST':
                return await handleUpdateConsent(req, res, sessionId);
            case 'DELETE':
                return await handleRevokeConsent(req, res, sessionId);
            default:
                return res.status(405).json({
                    success: false,
                    error: 'Method not allowed',
                    message: `Method ${method} is not supported`
                });
        }
    } catch (error) {
        console.error('Consent API error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
}

/**
 * Get current consent status
 */
async function handleGetConsent(req, res, sessionId) {
    if (!sessionId) {
        return res.status(400).json({
            success: false,
            error: 'Missing session ID',
            message: 'Session ID is required'
        });
    }

    const session = await conversationStateManager.getSession(sessionId);
    if (!session) {
        return res.status(404).json({
            success: false,
            error: 'Session not found',
            message: 'The requested session does not exist or has expired'
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            sessionId,
            consent: session.consent,
            privacySettings: session.privacy,
            consentTimestamp: session.consent.consentTimestamp,
            lastUpdated: session.consent.lastUpdated || session.consent.consentTimestamp
        }
    });
}

/**
 * Update consent preferences
 */
async function handleUpdateConsent(req, res, sessionId) {
    if (!sessionId) {
        return res.status(400).json({
            success: false,
            error: 'Missing session ID',
            message: 'Session ID is required'
        });
    }

    const {
        dataProcessing,
        medicalData,
        analytics,
        marketing,
        cookies
    } = req.body;

    // Validate consent data
    const consentUpdates = {};
    if (typeof dataProcessing === 'boolean') consentUpdates.dataProcessing = dataProcessing;
    if (typeof medicalData === 'boolean') consentUpdates.medicalData = medicalData;
    if (typeof analytics === 'boolean') consentUpdates.analytics = analytics;
    if (typeof marketing === 'boolean') consentUpdates.marketing = marketing;
    if (typeof cookies === 'boolean') consentUpdates.cookies = cookies;

    if (Object.keys(consentUpdates).length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Invalid consent data',
            message: 'At least one consent preference must be provided'
        });
    }

    const updatedConsent = await conversationStateManager.updateConsent(sessionId, consentUpdates);

    return res.status(200).json({
        success: true,
        data: {
            sessionId,
            consent: updatedConsent,
            updated: true,
            message: 'Consent preferences have been updated successfully'
        }
    });
}

/**
 * Revoke all consent and request data deletion (LGPD Right to be Forgotten)
 */
async function handleRevokeConsent(req, res, sessionId) {
    if (!sessionId) {
        return res.status(400).json({
            success: false,
            error: 'Missing session ID',
            message: 'Session ID is required'
        });
    }

    const { requestDataDeletion = false } = req.body;

    // Revoke all consent
    const revokedConsent = await conversationStateManager.updateConsent(sessionId, {
        dataProcessing: false,
        medicalData: false,
        analytics: false,
        marketing: false,
        cookies: false,
        revokedAt: new Date()
    });

    let deletionStatus = null;
    if (requestDataDeletion) {
        // Anonymize or delete session data
        const anonymized = await conversationStateManager.anonymizeSession(sessionId);
        deletionStatus = {
            anonymized,
            message: anonymized
                ? 'Session data has been anonymized as requested'
                : 'Failed to anonymize session data'
        };
    }

    return res.status(200).json({
        success: true,
        data: {
            sessionId,
            consent: revokedConsent,
            revoked: true,
            deletionStatus,
            message: 'All consent has been revoked successfully',
            lgpdCompliance: {
                rightToWithdrawConsent: 'exercised',
                rightToBeForgotten: requestDataDeletion ? 'processed' : 'not_requested',
                timestamp: new Date().toISOString()
            }
        }
    });
}