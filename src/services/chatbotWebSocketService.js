/**
 * Chatbot WebSocket Service
 * 
 * Provides real-time communication features for the chatbot:
 * - WebSocket connection management
 * - Real-time message delivery
 * - Typing indicators
 * - Connection status updates
 * - Message status tracking
 * - Automatic reconnection
 */

class ChatbotWebSocketService {
    constructor() {
        this.ws = null;
        this.sessionId = null;
        this.isConnected = false;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.maxReconnectDelay = 30000; // Max 30 seconds
        this.heartbeatInterval = null;
        this.heartbeatTimeout = null;
        this.messageQueue = [];
        this.eventListeners = new Map();
        this.typingTimeout = null;
        this.lastActivity = Date.now();

        // Bind methods to preserve context
        this.handleOpen = this.handleOpen.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleError = this.handleError.bind(this);
        this.sendHeartbeat = this.sendHeartbeat.bind(this);
    }

    /**
     * Initialize WebSocket connection
     */
    connect(sessionId) {
        if (this.isConnected || this.isConnecting) {
            return Promise.resolve();
        }

        this.sessionId = sessionId;
        this.isConnecting = true;

        return new Promise((resolve, reject) => {
            try {
                // Determine WebSocket URL
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const host = window.location.host;
                const wsUrl = `${protocol}//${host}/api/chatbot/websocket`;

                // Create WebSocket connection
                this.ws = new WebSocket(wsUrl);

                // Set up event listeners
                this.ws.addEventListener('open', (event) => {
                    this.handleOpen(event);
                    resolve();
                });

                this.ws.addEventListener('message', this.handleMessage);
                this.ws.addEventListener('close', this.handleClose);
                this.ws.addEventListener('error', (event) => {
                    this.handleError(event);
                    if (this.isConnecting) {
                        reject(new Error('WebSocket connection failed'));
                    }
                });

                // Connection timeout
                setTimeout(() => {
                    if (this.isConnecting && !this.isConnected) {
                        this.ws.close();
                        reject(new Error('WebSocket connection timeout'));
                    }
                }, 10000);

            } catch (error) {
                this.isConnecting = false;
                reject(error);
            }
        });
    }

    /**
     * Handle WebSocket open event
     */
    handleOpen(event) {
        console.log('ChatBot WebSocket connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;

        // Send authentication message
        this.sendMessage({
            type: 'auth',
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
        });

        // Start heartbeat
        this.startHeartbeat();

        // Process queued messages
        this.processMessageQueue();

        // Emit connection event
        this.emit('connected', { sessionId: this.sessionId });
    }

    /**
     * Handle incoming WebSocket messages
     */
    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            this.lastActivity = Date.now();

            switch (data.type) {
                case 'auth_success':
                    console.log('ChatBot WebSocket authenticated');
                    this.emit('authenticated', data);
                    break;

                case 'message':
                    this.emit('message', data.payload);
                    break;

                case 'typing_start':
                    this.emit('typing_start', data.payload);
                    break;

                case 'typing_stop':
                    this.emit('typing_stop', data.payload);
                    break;

                case 'message_status':
                    this.emit('message_status', data.payload);
                    break;

                case 'session_update':
                    this.emit('session_update', data.payload);
                    break;

                case 'error':
                    console.error('ChatBot WebSocket error:', data.payload);
                    this.emit('error', data.payload);
                    break;

                case 'pong':
                    // Heartbeat response received
                    if (this.heartbeatTimeout) {
                        clearTimeout(this.heartbeatTimeout);
                        this.heartbeatTimeout = null;
                    }
                    break;

                default:
                    console.warn('Unknown WebSocket message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }

    /**
     * Handle WebSocket close event
     */
    handleClose(event) {
        console.log('ChatBot WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.isConnecting = false;

        // Stop heartbeat
        this.stopHeartbeat();

        // Emit disconnection event
        this.emit('disconnected', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
        });

        // Attempt reconnection if not a clean close
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
        }
    }

    /**
     * Handle WebSocket error event
     */
    handleError(event) {
        console.error('ChatBot WebSocket error:', event);
        this.emit('error', {
            message: 'WebSocket connection error',
            event: event
        });
    }

    /**
     * Schedule reconnection attempt
     */
    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            this.maxReconnectDelay
        );

        console.log(`Scheduling ChatBot WebSocket reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);

        setTimeout(() => {
            if (!this.isConnected && this.sessionId) {
                this.connect(this.sessionId).catch(error => {
                    console.error('Reconnection failed:', error);
                });
            }
        }, delay);
    }

    /**
     * Start heartbeat mechanism
     */
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                this.sendHeartbeat();
            }
        }, 30000); // Send heartbeat every 30 seconds
    }

    /**
     * Stop heartbeat mechanism
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }

        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    /**
     * Send heartbeat ping
     */
    sendHeartbeat() {
        if (!this.isConnected) return;

        this.sendMessage({
            type: 'ping',
            timestamp: new Date().toISOString()
        });

        // Set timeout for pong response
        this.heartbeatTimeout = setTimeout(() => {
            console.warn('ChatBot WebSocket heartbeat timeout');
            this.ws.close();
        }, 10000);
    }

    /**
     * Send message through WebSocket
     */
    sendMessage(message) {
        if (!this.isConnected) {
            // Queue message for later delivery
            this.messageQueue.push(message);
            return false;
        }

        try {
            this.ws.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('Error sending WebSocket message:', error);
            this.messageQueue.push(message);
            return false;
        }
    }

    /**
     * Process queued messages
     */
    processMessageQueue() {
        while (this.messageQueue.length > 0 && this.isConnected) {
            const message = this.messageQueue.shift();
            this.sendMessage(message);
        }
    }

    /**
     * Send chat message
     */
    sendChatMessage(content, messageId) {
        return this.sendMessage({
            type: 'chat_message',
            payload: {
                content,
                messageId,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Send typing indicator
     */
    sendTypingStart() {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        this.sendMessage({
            type: 'typing_start',
            payload: {
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            }
        });

        // Auto-stop typing after 3 seconds
        this.typingTimeout = setTimeout(() => {
            this.sendTypingStop();
        }, 3000);
    }

    /**
     * Stop typing indicator
     */
    sendTypingStop() {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }

        this.sendMessage({
            type: 'typing_stop',
            payload: {
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Update message status
     */
    updateMessageStatus(messageId, status) {
        this.sendMessage({
            type: 'message_status_update',
            payload: {
                messageId,
                status, // 'sent', 'delivered', 'read', 'failed'
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Request conversation history
     */
    requestConversationHistory(limit = 50) {
        this.sendMessage({
            type: 'request_history',
            payload: {
                sessionId: this.sessionId,
                limit,
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Disconnect WebSocket
     */
    disconnect() {
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
        }

        this.stopHeartbeat();
        this.isConnected = false;
        this.isConnecting = false;
        this.sessionId = null;
        this.messageQueue = [];
    }

    /**
     * Add event listener
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit event to listeners
     */
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in WebSocket event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            isConnecting: this.isConnecting,
            sessionId: this.sessionId,
            reconnectAttempts: this.reconnectAttempts,
            queuedMessages: this.messageQueue.length,
            lastActivity: this.lastActivity
        };
    }

    /**
     * Check if connection is healthy
     */
    isHealthy() {
        const now = Date.now();
        const timeSinceLastActivity = now - this.lastActivity;

        return this.isConnected && timeSinceLastActivity < 60000; // Healthy if activity within 1 minute
    }
}

// Create singleton instance
const chatbotWebSocketService = new ChatbotWebSocketService();

export default chatbotWebSocketService;