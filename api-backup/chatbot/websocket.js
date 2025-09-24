import { WebSocketServer } from 'ws';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// WebSocket message schemas
const authMessageSchema = z.object({
    type: z.literal('auth'),
    sessionId: z.string().min(1),
    timestamp: z.string()
});

const chatMessageSchema = z.object({
    type: z.literal('chat_message'),
    payload: z.object({
        content: z.string().min(1).max(1000),
        messageId: z.string().min(1),
        sessionId: z.string().min(1),
        timestamp: z.string()
    })
});

const typingStartSchema = z.object({
    type: z.literal('typing_start'),
    payload: z.object({
        sessionId: z.string().min(1),
        timestamp: z.string()
    })
});

const typingStopSchema = z.object({
    type: z.literal('typing_stop'),
    payload: z.object({
        sessionId: z.string().min(1),
        timestamp: z.string()
    })
});

const messageStatusSchema = z.object({
    type: z.literal('message_status_update'),
    payload: z.object({
        messageId: z.string().min(1),
        status: z.enum(['sent', 'delivered', 'read', 'failed']),
        sessionId: z.string().min(1),
        timestamp: z.string()
    })
});

const requestHistorySchema = z.object({
    type: z.literal('request_history'),
    payload: z.object({
        sessionId: z.string().min(1),
        limit: z.number().min(1).max(100).default(50),
        timestamp: z.string()
    })
});

// Active connections and sessions
const connections = new Map();
const sessions = new Map(); // sessionId -> Set of connection IDs
const typingUsers = new Map(); // sessionId -> Set of connection IDs

export default async function handler(req, res) {
    // Check if this is a WebSocket upgrade request
    if (req.headers.upgrade !== 'websocket') {
        return res.status(400).json({
            error: 'WebSocket upgrade required',
            message: 'This endpoint only supports WebSocket connections'
        });
    }

    // Handle WebSocket upgrade
    if (!res.socket.server.wss) {
        console.log('Setting up Chatbot WebSocket server...');

        const wss = new WebSocketServer({
            noServer: true,
            path: '/api/chatbot/websocket'
        });

        res.socket.server.wss = wss;

        // Handle WebSocket connections
        wss.on('connection', handleWebSocketConnection);

        // Handle server upgrade
        res.socket.server.on('upgrade', (request, socket, head) => {
            const pathname = new URL(request.url, 'http://localhost').pathname;

            if (pathname === '/api/chatbot/websocket') {
                wss.handleUpgrade(request, socket, head, (ws) => {
                    wss.emit('connection', ws, request);
                });
            } else {
                socket.destroy();
            }
        });
    }

    res.status(200).json({
        message: 'Chatbot WebSocket server initialized',
        endpoint: '/api/chatbot/websocket'
    });
}

// Handle new WebSocket connection
function handleWebSocketConnection(ws, request) {
    const connectionId = generateConnectionId();
    const clientIP = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    console.log(`New Chatbot WebSocket connection: ${connectionId} from ${clientIP}`);

    // Store connection
    connections.set(connectionId, {
        ws,
        sessionId: null,
        authenticated: false,
        lastActivity: Date.now(),
        clientIP,
        userAgent: request.headers['user-agent']
    });

    // Send welcome message
    sendMessage(ws, {
        type: 'connected',
        connectionId,
        timestamp: new Date().toISOString()
    });

    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            handleWebSocketMessage(connectionId, message);
        } catch (error) {
            console.error('Invalid WebSocket message:', error);
            sendMessage(ws, {
                type: 'error',
                payload: {
                    message: 'Invalid message format',
                    code: 'INVALID_JSON'
                },
                timestamp: new Date().toISOString()
            });
        }
    });

    // Handle connection close
    ws.on('close', (code, reason) => {
        console.log(`Chatbot WebSocket connection closed: ${connectionId} (${code}: ${reason})`);
        handleConnectionClose(connectionId);
    });

    // Handle connection error
    ws.on('error', (error) => {
        console.error(`Chatbot WebSocket error for ${connectionId}:`, error);
        handleConnectionClose(connectionId);
    });

    // Set up ping/pong for connection health
    const pingInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
            ws.ping();
        } else {
            clearInterval(pingInterval);
        }
    }, 30000); // Ping every 30 seconds

    ws.on('pong', () => {
        const connection = connections.get(connectionId);
        if (connection) {
            connection.lastActivity = Date.now();
        }
    });

    // Store ping interval for cleanup
    connections.get(connectionId).pingInterval = pingInterval;
}

// Handle WebSocket messages
async function handleWebSocketMessage(connectionId, message) {
    const connection = connections.get(connectionId);
    if (!connection) return;

    connection.lastActivity = Date.now();

    try {
        switch (message.type) {
            case 'auth':
                await handleAuthentication(connectionId, message);
                break;
            case 'chat_message':
                await handleChatMessage(connectionId, message);
                break;
            case 'typing_start':
                handleTypingStart(connectionId, message);
                break;
            case 'typing_stop':
                handleTypingStop(connectionId, message);
                break;
            case 'message_status_update':
                await handleMessageStatusUpdate(connectionId, message);
                break;
            case 'request_history':
                await handleRequestHistory(connectionId, message);
                break;
            case 'ping':
                sendMessage(connection.ws, {
                    type: 'pong',
                    timestamp: new Date().toISOString()
                });
                break;
            default:
                sendMessage(connection.ws, {
                    type: 'error',
                    payload: {
                        message: `Unknown message type: ${message.type}`,
                        code: 'UNKNOWN_MESSAGE_TYPE'
                    },
                    timestamp: new Date().toISOString()
                });
        }
    } catch (error) {
        console.error('Error handling WebSocket message:', error);
        sendMessage(connection.ws, {
            type: 'error',
            payload: {
                message: 'Failed to process message',
                code: 'PROCESSING_ERROR',
                details: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
}

// Handle authentication
async function handleAuthentication(connectionId, message) {
    const validation = authMessageSchema.safeParse(message);

    if (!validation.success) {
        const connection = connections.get(connectionId);
        if (connection) {
            sendMessage(connection.ws, {
                type: 'error',
                payload: {
                    message: 'Invalid authentication message',
                    code: 'INVALID_AUTH',
                    details: validation.error.errors
                },
                timestamp: new Date().toISOString()
            });
        }
        return;
    }

    const { sessionId } = validation.data;
    const connection = connections.get(connectionId);

    if (!connection) return;

    try {
        // Validate session exists or create new one
        let sessionData = await getOrCreateSession(sessionId, {
            clientIP: connection.clientIP,
            userAgent: connection.userAgent
        });

        // Update connection
        connection.sessionId = sessionId;
        connection.authenticated = true;

        // Add to session connections
        if (!sessions.has(sessionId)) {
            sessions.set(sessionId, new Set());
        }
        sessions.get(sessionId).add(connectionId);

        // Send authentication success
        sendMessage(connection.ws, {
            type: 'auth_success',
            session: sessionData,
            timestamp: new Date().toISOString()
        });

        console.log(`Chatbot WebSocket authenticated: ${connectionId} for session ${sessionId}`);

    } catch (error) {
        console.error('Authentication error:', error);
        sendMessage(connection.ws, {
            type: 'error',
            payload: {
                message: 'Authentication failed',
                code: 'AUTH_FAILED',
                details: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
}

// Handle chat messages
async function handleChatMessage(connectionId, message) {
    const validation = chatMessageSchema.safeParse(message);

    if (!validation.success) {
        const connection = connections.get(connectionId);
        if (connection) {
            sendMessage(connection.ws, {
                type: 'error',
                payload: {
                    message: 'Invalid chat message',
                    code: 'INVALID_CHAT_MESSAGE',
                    details: validation.error.errors
                },
                timestamp: new Date().toISOString()
            });
        }
        return;
    }

    const connection = connections.get(connectionId);
    if (!connection || !connection.authenticated) {
        sendMessage(connection.ws, {
            type: 'error',
            payload: {
                message: 'Not authenticated',
                code: 'NOT_AUTHENTICATED'
            },
            timestamp: new Date().toISOString()
        });
        return;
    }

    const { payload } = validation.data;

    try {
        // Store message in database
        await storeMessage({
            messageId: payload.messageId,
            sessionId: payload.sessionId,
            content: payload.content,
            role: 'user',
            timestamp: payload.timestamp,
            connectionId
        });

        // Broadcast message status to other connections in the same session
        broadcastToSession(payload.sessionId, connectionId, {
            type: 'message_status',
            payload: {
                messageId: payload.messageId,
                status: 'delivered',
                timestamp: new Date().toISOString()
            }
        });

        // Send acknowledgment
        sendMessage(connection.ws, {
            type: 'message_received',
            payload: {
                messageId: payload.messageId,
                status: 'received',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error handling chat message:', error);
        sendMessage(connection.ws, {
            type: 'error',
            payload: {
                message: 'Failed to process chat message',
                code: 'CHAT_MESSAGE_ERROR',
                details: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
}

// Handle typing indicators
function handleTypingStart(connectionId, message) {
    const validation = typingStartSchema.safeParse(message);

    if (!validation.success) return;

    const connection = connections.get(connectionId);
    if (!connection || !connection.authenticated) return;

    const { payload } = validation.data;

    // Add to typing users
    if (!typingUsers.has(payload.sessionId)) {
        typingUsers.set(payload.sessionId, new Set());
    }
    typingUsers.get(payload.sessionId).add(connectionId);

    // Broadcast to other connections in the same session
    broadcastToSession(payload.sessionId, connectionId, {
        type: 'typing_start',
        payload: {
            sessionId: payload.sessionId,
            connectionId,
            timestamp: payload.timestamp
        }
    });
}

function handleTypingStop(connectionId, message) {
    const validation = typingStopSchema.safeParse(message);

    if (!validation.success) return;

    const connection = connections.get(connectionId);
    if (!connection || !connection.authenticated) return;

    const { payload } = validation.data;

    // Remove from typing users
    const sessionTyping = typingUsers.get(payload.sessionId);
    if (sessionTyping) {
        sessionTyping.delete(connectionId);
        if (sessionTyping.size === 0) {
            typingUsers.delete(payload.sessionId);
        }
    }

    // Broadcast to other connections in the same session
    broadcastToSession(payload.sessionId, connectionId, {
        type: 'typing_stop',
        payload: {
            sessionId: payload.sessionId,
            connectionId,
            timestamp: payload.timestamp
        }
    });
}

// Handle message status updates
async function handleMessageStatusUpdate(connectionId, message) {
    const validation = messageStatusSchema.safeParse(message);

    if (!validation.success) return;

    const connection = connections.get(connectionId);
    if (!connection || !connection.authenticated) return;

    const { payload } = validation.data;

    try {
        // Update message status in database
        await updateMessageStatus(payload.messageId, payload.status);

        // Broadcast status update to session
        broadcastToSession(payload.sessionId, null, {
            type: 'message_status',
            payload: {
                messageId: payload.messageId,
                status: payload.status,
                timestamp: payload.timestamp
            }
        });

    } catch (error) {
        console.error('Error updating message status:', error);
    }
}

// Handle conversation history requests
async function handleRequestHistory(connectionId, message) {
    const validation = requestHistorySchema.safeParse(message);

    if (!validation.success) return;

    const connection = connections.get(connectionId);
    if (!connection || !connection.authenticated) return;

    const { payload } = validation.data;

    try {
        const history = await getConversationHistory(payload.sessionId, payload.limit);

        sendMessage(connection.ws, {
            type: 'conversation_history',
            payload: {
                sessionId: payload.sessionId,
                messages: history,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error fetching conversation history:', error);
        sendMessage(connection.ws, {
            type: 'error',
            payload: {
                message: 'Failed to fetch conversation history',
                code: 'HISTORY_ERROR',
                details: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
}

// Database operations
async function getOrCreateSession(sessionId, metadata) {
    try {
        // Check if session exists
        const { data: existingSession, error: fetchError } = await supabase
            .from('chatbot_conversations')
            .select('session_id, created_at')
            .eq('session_id', sessionId)
            .limit(1)
            .single();

        if (existingSession) {
            return {
                sessionId: existingSession.session_id,
                createdAt: existingSession.created_at,
                messageCount: await getMessageCount(sessionId),
                lastActivity: new Date().toISOString()
            };
        }

        // Create new session entry
        const { data: newSession, error: createError } = await supabase
            .from('chatbot_conversations')
            .insert({
                session_id: sessionId,
                user_message: '',
                bot_response: '',
                message_metadata: {
                    type: 'session_start',
                    clientIP: metadata.clientIP,
                    userAgent: metadata.userAgent
                },
                compliance_flags: {}
            })
            .select()
            .single();

        if (createError) throw createError;

        return {
            sessionId: sessionId,
            createdAt: newSession.created_at,
            messageCount: 0,
            lastActivity: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error getting/creating session:', error);
        throw error;
    }
}

async function storeMessage({ messageId, sessionId, content, role, timestamp, connectionId }) {
    try {
        const { error } = await supabase
            .from('chatbot_conversations')
            .insert({
                session_id: sessionId,
                user_message: role === 'user' ? content : '',
                bot_response: role === 'assistant' ? content : '',
                message_metadata: {
                    messageId,
                    role,
                    connectionId,
                    timestamp
                },
                compliance_flags: {}
            });

        if (error) throw error;

    } catch (error) {
        console.error('Error storing message:', error);
        throw error;
    }
}

async function updateMessageStatus(messageId, status) {
    try {
        const { error } = await supabase
            .from('chatbot_conversations')
            .update({
                message_metadata: supabase.raw(`
                    message_metadata || jsonb_build_object('status', '${status}', 'statusUpdated', '${new Date().toISOString()}')
                `)
            })
            .eq('message_metadata->messageId', messageId);

        if (error) throw error;

    } catch (error) {
        console.error('Error updating message status:', error);
        throw error;
    }
}

async function getConversationHistory(sessionId, limit = 50) {
    try {
        const { data, error } = await supabase
            .from('chatbot_conversations')
            .select('user_message, bot_response, message_metadata, created_at')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })
            .limit(limit);

        if (error) throw error;

        return data.map(row => ({
            id: row.message_metadata?.messageId || `msg_${Date.now()}`,
            content: row.user_message || row.bot_response,
            role: row.user_message ? 'user' : 'assistant',
            timestamp: row.created_at,
            metadata: row.message_metadata
        }));

    } catch (error) {
        console.error('Error fetching conversation history:', error);
        throw error;
    }
}

async function getMessageCount(sessionId) {
    try {
        const { count, error } = await supabase
            .from('chatbot_conversations')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', sessionId);

        if (error) throw error;
        return count || 0;

    } catch (error) {
        console.error('Error getting message count:', error);
        return 0;
    }
}

// Utility functions
function broadcastToSession(sessionId, excludeConnectionId, message) {
    const sessionConnections = sessions.get(sessionId);
    if (!sessionConnections) return;

    sessionConnections.forEach(connectionId => {
        if (connectionId !== excludeConnectionId) {
            const connection = connections.get(connectionId);
            if (connection && connection.ws.readyState === connection.ws.OPEN) {
                sendMessage(connection.ws, message);
            }
        }
    });
}

function sendMessage(ws, message) {
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(message));
    }
}

function generateConnectionId() {
    return `chatbot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Handle connection close
function handleConnectionClose(connectionId) {
    const connection = connections.get(connectionId);
    if (!connection) return;

    // Clear ping interval
    if (connection.pingInterval) {
        clearInterval(connection.pingInterval);
    }

    // Remove from session
    if (connection.sessionId) {
        const sessionConnections = sessions.get(connection.sessionId);
        if (sessionConnections) {
            sessionConnections.delete(connectionId);
            if (sessionConnections.size === 0) {
                sessions.delete(connection.sessionId);
            }
        }

        // Remove from typing users
        const sessionTyping = typingUsers.get(connection.sessionId);
        if (sessionTyping) {
            sessionTyping.delete(connectionId);
            if (sessionTyping.size === 0) {
                typingUsers.delete(connection.sessionId);
            } else {
                // Broadcast typing stop
                broadcastToSession(connection.sessionId, connectionId, {
                    type: 'typing_stop',
                    payload: {
                        sessionId: connection.sessionId,
                        connectionId,
                        timestamp: new Date().toISOString()
                    }
                });
            }
        }
    }

    // Remove connection
    connections.delete(connectionId);
}

// Cleanup inactive connections (run periodically)
setInterval(() => {
    const now = Date.now();
    const timeout = 10 * 60 * 1000; // 10 minutes

    connections.forEach((connection, connectionId) => {
        if (now - connection.lastActivity > timeout) {
            console.log(`Cleaning up inactive chatbot connection: ${connectionId}`);
            connection.ws.terminate();
            handleConnectionClose(connectionId);
        }
    });
}, 60000); // Check every minute

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down Chatbot WebSocket server...');
    connections.forEach((connection, connectionId) => {
        connection.ws.close(1001, 'Server shutting down');
    });
});