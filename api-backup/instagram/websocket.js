import { WebSocketServer } from 'ws';
import { z } from 'zod';

// WebSocket message schemas
const subscribeMessageSchema = z.object({
    type: z.literal('subscribe'),
    postIds: z.array(z.string()).min(1).max(25),
    interval: z.number().min(30000).max(300000).optional().default(300000) // 5 minutes default
});

const unsubscribeMessageSchema = z.object({
    type: z.literal('unsubscribe'),
    postIds: z.array(z.string()).optional()
});

// Active connections and subscriptions
const connections = new Map();
const subscriptions = new Map(); // postId -> Set of connection IDs
let updateIntervals = new Map(); // postId -> interval ID

// Environment variables
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

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
        console.log('Setting up WebSocket server...');

        const wss = new WebSocketServer({
            noServer: true,
            path: '/api/instagram/websocket'
        });

        res.socket.server.wss = wss;

        // Handle WebSocket connections
        wss.on('connection', handleWebSocketConnection);

        // Handle server upgrade
        res.socket.server.on('upgrade', (request, socket, head) => {
            const pathname = new URL(request.url, 'http://localhost').pathname;

            if (pathname === '/api/instagram/websocket') {
                wss.handleUpgrade(request, socket, head, (ws) => {
                    wss.emit('connection', ws, request);
                });
            } else {
                socket.destroy();
            }
        });
    }

    res.status(200).json({
        message: 'WebSocket server initialized',
        endpoint: '/api/instagram/websocket'
    });
}

// Handle new WebSocket connection
function handleWebSocketConnection(ws, request) {
    const connectionId = generateConnectionId();

    console.log(`New WebSocket connection: ${connectionId}`);

    // Store connection
    connections.set(connectionId, {
        ws,
        subscriptions: new Set(),
        lastActivity: Date.now()
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
                message: 'Invalid message format',
                timestamp: new Date().toISOString()
            });
        }
    });

    // Handle connection close
    ws.on('close', () => {
        console.log(`WebSocket connection closed: ${connectionId}`);
        handleConnectionClose(connectionId);
    });

    // Handle connection error
    ws.on('error', (error) => {
        console.error(`WebSocket error for ${connectionId}:`, error);
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
}

// Handle WebSocket messages
function handleWebSocketMessage(connectionId, message) {
    const connection = connections.get(connectionId);
    if (!connection) return;

    connection.lastActivity = Date.now();

    try {
        switch (message.type) {
            case 'subscribe':
                handleSubscribe(connectionId, message);
                break;
            case 'unsubscribe':
                handleUnsubscribe(connectionId, message);
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
                    message: `Unknown message type: ${message.type}`,
                    timestamp: new Date().toISOString()
                });
        }
    } catch (error) {
        console.error('Error handling WebSocket message:', error);
        sendMessage(connection.ws, {
            type: 'error',
            message: 'Failed to process message',
            timestamp: new Date().toISOString()
        });
    }
}

// Handle subscription requests
function handleSubscribe(connectionId, message) {
    const validation = subscribeMessageSchema.safeParse(message);

    if (!validation.success) {
        const connection = connections.get(connectionId);
        if (connection) {
            sendMessage(connection.ws, {
                type: 'error',
                message: 'Invalid subscribe message',
                details: validation.error.errors,
                timestamp: new Date().toISOString()
            });
        }
        return;
    }

    const { postIds, interval } = validation.data;
    const connection = connections.get(connectionId);

    if (!connection) return;

    // Add subscriptions
    postIds.forEach(postId => {
        // Add to connection's subscriptions
        connection.subscriptions.add(postId);

        // Add to global subscriptions map
        if (!subscriptions.has(postId)) {
            subscriptions.set(postId, new Set());
        }
        subscriptions.get(postId).add(connectionId);

        // Start update interval for this post if not already running
        if (!updateIntervals.has(postId)) {
            const intervalId = setInterval(() => {
                updatePostStats(postId);
            }, interval);
            updateIntervals.set(postId, intervalId);
        }
    });

    // Send confirmation
    sendMessage(connection.ws, {
        type: 'subscribed',
        postIds,
        interval,
        timestamp: new Date().toISOString()
    });

    // Send initial stats
    sendInitialStats(connectionId, postIds);
}

// Handle unsubscription requests
function handleUnsubscribe(connectionId, message) {
    const validation = unsubscribeMessageSchema.safeParse(message);

    if (!validation.success) {
        const connection = connections.get(connectionId);
        if (connection) {
            sendMessage(connection.ws, {
                type: 'error',
                message: 'Invalid unsubscribe message',
                details: validation.error.errors,
                timestamp: new Date().toISOString()
            });
        }
        return;
    }

    const { postIds } = validation.data;
    const connection = connections.get(connectionId);

    if (!connection) return;

    const unsubscribedIds = [];

    if (postIds) {
        // Unsubscribe from specific posts
        postIds.forEach(postId => {
            if (connection.subscriptions.has(postId)) {
                connection.subscriptions.delete(postId);
                unsubscribedIds.push(postId);

                const postSubscriptions = subscriptions.get(postId);
                if (postSubscriptions) {
                    postSubscriptions.delete(connectionId);

                    // If no more subscribers, stop the update interval
                    if (postSubscriptions.size === 0) {
                        const intervalId = updateIntervals.get(postId);
                        if (intervalId) {
                            clearInterval(intervalId);
                            updateIntervals.delete(postId);
                        }
                        subscriptions.delete(postId);
                    }
                }
            }
        });
    } else {
        // Unsubscribe from all posts
        connection.subscriptions.forEach(postId => {
            unsubscribedIds.push(postId);
            const postSubscriptions = subscriptions.get(postId);
            if (postSubscriptions) {
                postSubscriptions.delete(connectionId);

                if (postSubscriptions.size === 0) {
                    const intervalId = updateIntervals.get(postId);
                    if (intervalId) {
                        clearInterval(intervalId);
                        updateIntervals.delete(postId);
                    }
                    subscriptions.delete(postId);
                }
            }
        });
        connection.subscriptions.clear();
    }

    // Send confirmation
    sendMessage(connection.ws, {
        type: 'unsubscribed',
        postIds: unsubscribedIds,
        timestamp: new Date().toISOString()
    });
}

// Send initial statistics for subscribed posts
async function sendInitialStats(connectionId, postIds) {
    const connection = connections.get(connectionId);
    if (!connection) return;

    try {
        for (const postId of postIds) {
            const stats = await fetchPostStats(postId);
            sendMessage(connection.ws, {
                type: 'stats_update',
                postId,
                stats,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Error sending initial stats:', error);
        sendMessage(connection.ws, {
            type: 'error',
            message: 'Failed to fetch initial statistics',
            timestamp: new Date().toISOString()
        });
    }
}

// Update statistics for a post and broadcast to subscribers
async function updatePostStats(postId) {
    const postSubscriptions = subscriptions.get(postId);
    if (!postSubscriptions || postSubscriptions.size === 0) return;

    try {
        const stats = await fetchPostStats(postId);

        // Broadcast to all subscribers
        postSubscriptions.forEach(connectionId => {
            const connection = connections.get(connectionId);
            if (connection && connection.ws.readyState === connection.ws.OPEN) {
                sendMessage(connection.ws, {
                    type: 'stats_update',
                    postId,
                    stats,
                    timestamp: new Date().toISOString()
                });
            }
        });
    } catch (error) {
        console.error(`Error updating stats for post ${postId}:`, error);

        // Send error to subscribers
        postSubscriptions.forEach(connectionId => {
            const connection = connections.get(connectionId);
            if (connection && connection.ws.readyState === connection.ws.OPEN) {
                sendMessage(connection.ws, {
                    type: 'stats_error',
                    postId,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }
}

// Fetch post statistics (reuse from stats.js logic)
async function fetchPostStats(postId) {
    if (!INSTAGRAM_ACCESS_TOKEN) {
        throw new Error('Instagram access token not configured');
    }

    const url = new URL(`https://graph.instagram.com/${postId}`);
    url.searchParams.set('fields', 'like_count,comments_count,timestamp');
    url.searchParams.set('access_token', INSTAGRAM_ACCESS_TOKEN);

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || `Stats API error: ${response.status}`);
    }

    return {
        likes: data.like_count || 0,
        comments: data.comments_count || 0,
        engagement_rate: calculateEngagementRate({
            like_count: data.like_count || 0,
            comments_count: data.comments_count || 0
        }),
        last_updated: new Date().toISOString()
    };
}

// Calculate engagement rate
function calculateEngagementRate(stats) {
    const totalEngagement = (stats.like_count || 0) + (stats.comments_count || 0);
    const estimatedFollowers = 1000; // This should be dynamic
    return totalEngagement > 0 ? parseFloat(((totalEngagement / estimatedFollowers) * 100).toFixed(2)) : 0;
}

// Handle connection close
function handleConnectionClose(connectionId) {
    const connection = connections.get(connectionId);
    if (!connection) return;

    // Remove from all subscriptions
    connection.subscriptions.forEach(postId => {
        const postSubscriptions = subscriptions.get(postId);
        if (postSubscriptions) {
            postSubscriptions.delete(connectionId);

            // If no more subscribers, stop the update interval
            if (postSubscriptions.size === 0) {
                const intervalId = updateIntervals.get(postId);
                if (intervalId) {
                    clearInterval(intervalId);
                    updateIntervals.delete(postId);
                }
                subscriptions.delete(postId);
            }
        }
    });

    // Remove connection
    connections.delete(connectionId);
}

// Send message to WebSocket client
function sendMessage(ws, message) {
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(message));
    }
}

// Generate unique connection ID
function generateConnectionId() {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Cleanup inactive connections (run periodically)
setInterval(() => {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    connections.forEach((connection, connectionId) => {
        if (now - connection.lastActivity > timeout) {
            console.log(`Cleaning up inactive connection: ${connectionId}`);
            connection.ws.terminate();
            handleConnectionClose(connectionId);
        }
    });
}, 60000); // Check every minute