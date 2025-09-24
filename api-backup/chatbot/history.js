/**
 * Conversation History API
 * Handles conversation history retrieval with privacy controls
 */

import conversationStateManager from '../../src/services/conversationStateManager.js';

/**
 * Conversation history handler
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed',
            message: 'Only GET requests are supported'
        });
    }

    try {
        const { sessionId } = req.query;
        const {
            limit = 50,
            includeMetadata = false,
            format = 'detailed'
        } = req.query;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Missing session ID',
                message: 'Session ID is required'
            });
        }

        // Validate session exists
        const session = await conversationStateManager.getSession(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found',
                message: 'The requested session does not exist or has expired'
            });
        }

        // Get conversation history with privacy controls
        const history = await conversationStateManager.getConversationHistory(sessionId, {
            limit: parseInt(limit),
            includeMetadata: includeMetadata === 'true',
            decryptContent: true,
            filterSensitive: true
        });

        // Format response based on requested format
        let formattedHistory;
        if (format === 'simple') {
            formattedHistory = history.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp
            }));
        } else {
            formattedHistory = history;
        }

        // Get conversation insights
        const insights = conversationStateManager.getConversationSummary(sessionId);

        return res.status(200).json({
            success: true,
            data: {
                sessionId,
                messages: formattedHistory,
                totalMessages: history.length,
                insights: {
                    messageCount: insights.messageCount,
                    duration: insights.duration,
                    topics: insights.topics,
                    intents: insights.intents,
                    lastActivity: insights.lastActivity
                },
                privacy: {
                    encryptionEnabled: session.privacy.encryptMessages,
                    retentionPeriod: session.privacy.retentionPeriod,
                    dataFiltered: true
                }
            }
        });

    } catch (error) {
        console.error('History API error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve conversation history',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
}