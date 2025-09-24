/**
 * Chatbot Session Management API
 * Handles session creation, retrieval, and management
 */

import conversationStateManager from '../../src/services/conversationStateManager.js';

/**
 * Session management handler
 */
export default async function handler(req, res) {
    const { method } = req;
    const { sessionId } = req.query;

    try {
        switch (method) {
            case 'GET':
                return await handleGetSession(req, res, sessionId);
            case 'POST':
                return await handleCreateSession(req, res);
            case 'PUT':
                return await handleUpdateSession(req, res, sessionId);
            case 'DELETE':
                return await handleDeleteSession(req, res, sessionId);
            default:
                return res.status(405).json({
                    success: false,
                    error: 'Method not allowed',
                    message: `Method ${method} is not supported`
                });
        }
    } catch (error) {
        console.error('Session API error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
}

/**
 * Get session information
 */
async function handleGetSession(req, res, sessionId) {
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

    // Get conversation summary
    const summary = conversationStateManager.getConversationSummary(sessionId);

    return res.status(200).json({
        success: true,
        data: {
            sessionId: session.sessionId,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            isActive: session.state.isActive,
            conversationState: session.state,
            consent: session.consent,
            summary
        }
    });
}

/**
 * Create new session
 */
async function handleCreateSession(req, res) {
    const {
        userConsent = {},
        metadata = {},
        privacySettings = {}
    } = req.body;

    // Get client information
    const clientIp = req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        'unknown';

    const enhancedMetadata = {
        ...metadata,
        ipAddress: clientIp,
        userAgent: req.headers['user-agent'] || 'unknown',
        timestamp: new Date().toISOString()
    };

    const session = await conversationStateManager.createSession({
        userConsent,
        metadata: enhancedMetadata,
        privacySettings
    });

    return res.status(201).json({
        success: true,
        data: {
            sessionId: session.sessionId,
            createdAt: session.createdAt,
            consent: session.consent,
            privacySettings: session.privacy
        }
    });
}

/**
 * Update session (consent, privacy settings, etc.)
 */
async function handleUpdateSession(req, res, sessionId) {
    if (!sessionId) {
        return res.status(400).json({
            success: false,
            error: 'Missing session ID',
            message: 'Session ID is required'
        });
    }

    const { consent, privacySettings } = req.body;

    const session = await conversationStateManager.getSession(sessionId);
    if (!session) {
        return res.status(404).json({
            success: false,
            error: 'Session not found',
            message: 'The requested session does not exist or has expired'
        });
    }

    // Update consent if provided
    if (consent) {
        await conversationStateManager.updateConsent(sessionId, consent);
    }

    // Update privacy settings if provided
    if (privacySettings) {
        session.privacy = { ...session.privacy, ...privacySettings };
        // Note: This would need to be implemented in conversationStateManager
    }

    return res.status(200).json({
        success: true,
        data: {
            sessionId,
            consent: session.consent,
            privacySettings: session.privacy,
            updated: true
        }
    });
}

/**
 * Delete session and all associated data
 */
async function handleDeleteSession(req, res, sessionId) {
    if (!sessionId) {
        return res.status(400).json({
            success: false,
            error: 'Missing session ID',
            message: 'Session ID is required'
        });
    }

    const deleted = await conversationStateManager.deleteSession(sessionId);

    if (!deleted) {
        return res.status(404).json({
            success: false,
            error: 'Session not found',
            message: 'The requested session does not exist'
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            sessionId,
            deleted: true,
            message: 'Session and all associated data have been permanently deleted'
        }
    });
}