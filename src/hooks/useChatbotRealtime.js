import { useState, useEffect, useCallback, useRef } from 'react';
import chatbotWebSocketService from '../services/chatbotWebSocketService';

/**
 * Custom hook for real-time chatbot features
 * 
 * Provides:
 * - WebSocket connection management
 * - Real-time message delivery
 * - Typing indicators
 * - Message status updates
 * - Connection status monitoring
 * - Session persistence and recovery
 */
export const useChatbotRealtime = ({ sessionId, enabled = true }) => {
    // Connection state
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    // Real-time features state
    const [isTyping, setIsTyping] = useState(false);
    const [messageStatuses, setMessageStatuses] = useState(new Map());
    const [onlineUsers, setOnlineUsers] = useState(0);

    // Session state
    const [sessionData, setSessionData] = useState(null);
    const [conversationHistory, setConversationHistory] = useState([]);

    // Refs for cleanup and persistence
    const connectionTimeoutRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const sessionStorageKey = `chatbot_session_${sessionId}`;

    // Initialize connection when enabled and sessionId is available
    useEffect(() => {
        if (!enabled || !sessionId) return;

        const initializeConnection = async () => {
            try {
                setIsConnecting(true);
                setConnectionError(null);

                await chatbotWebSocketService.connect(sessionId);

                // Load persisted session data
                loadPersistedSession();

            } catch (error) {
                console.error('Failed to initialize WebSocket connection:', error);
                setConnectionError(error.message);
            } finally {
                setIsConnecting(false);
            }
        };

        initializeConnection();

        return () => {
            if (chatbotWebSocketService.isConnected) {
                chatbotWebSocketService.disconnect();
            }
        };
    }, [sessionId, enabled]);

    // Set up WebSocket event listeners
    useEffect(() => {
        if (!enabled) return;

        const handleConnected = (data) => {
            setIsConnected(true);
            setIsConnecting(false);
            setConnectionError(null);
            setReconnectAttempts(0);

            // Request conversation history
            chatbotWebSocketService.requestConversationHistory();
        };

        const handleDisconnected = (data) => {
            setIsConnected(false);
            setIsConnecting(false);

            if (!data.wasClean) {
                setConnectionError('Connection lost');
            }
        };

        const handleError = (error) => {
            setConnectionError(error.message || 'Connection error');
            setIsConnecting(false);
        };

        const handleAuthenticated = (data) => {
            setSessionData(data.session);
            persistSession(data.session);
        };

        const handleMessage = (message) => {
            // Handle incoming real-time messages
            if (message.type === 'chat_response') {
                // Update message status to delivered
                updateMessageStatus(message.replyTo, 'delivered');
            } else if (message.type === 'message_received') {
                // Update message status when server confirms receipt
                updateMessageStatus(message.payload.messageId, 'delivered');
            }
        };

        const handleTypingStart = (data) => {
            if (data.sessionId !== sessionId) {
                setIsTyping(true);

                // Clear existing timeout
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                // Auto-stop typing after 5 seconds
                typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                }, 5000);
            }
        };

        const handleTypingStop = (data) => {
            if (data.sessionId !== sessionId) {
                setIsTyping(false);

                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = null;
                }
            }
        };

        const handleMessageStatus = (data) => {
            setMessageStatuses(prev => new Map(prev.set(data.messageId, {
                status: data.status,
                timestamp: data.timestamp
            })));
        };

        const handleSessionUpdate = (data) => {
            setSessionData(prev => ({ ...prev, ...data }));
            persistSession(data);
        };

        // Register event listeners
        chatbotWebSocketService.on('connected', handleConnected);
        chatbotWebSocketService.on('disconnected', handleDisconnected);
        chatbotWebSocketService.on('error', handleError);
        chatbotWebSocketService.on('authenticated', handleAuthenticated);
        chatbotWebSocketService.on('message', handleMessage);
        chatbotWebSocketService.on('typing_start', handleTypingStart);
        chatbotWebSocketService.on('typing_stop', handleTypingStop);
        chatbotWebSocketService.on('message_status', handleMessageStatus);
        chatbotWebSocketService.on('session_update', handleSessionUpdate);

        // Cleanup event listeners
        return () => {
            chatbotWebSocketService.off('connected', handleConnected);
            chatbotWebSocketService.off('disconnected', handleDisconnected);
            chatbotWebSocketService.off('error', handleError);
            chatbotWebSocketService.off('authenticated', handleAuthenticated);
            chatbotWebSocketService.off('message', handleMessage);
            chatbotWebSocketService.off('typing_start', handleTypingStart);
            chatbotWebSocketService.off('typing_stop', handleTypingStop);
            chatbotWebSocketService.off('message_status', handleMessageStatus);
            chatbotWebSocketService.off('session_update', handleSessionUpdate);

            // Clear timeouts
            if (connectionTimeoutRef.current) {
                clearTimeout(connectionTimeoutRef.current);
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [sessionId, enabled]);

    // Monitor connection health
    useEffect(() => {
        if (!enabled || !isConnected) return;

        const healthCheckInterval = setInterval(() => {
            const status = chatbotWebSocketService.getStatus();
            setReconnectAttempts(status.reconnectAttempts);

            if (!chatbotWebSocketService.isHealthy()) {
                setConnectionError('Connection unhealthy');
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(healthCheckInterval);
    }, [enabled, isConnected]);

    // Persist session data to localStorage
    const persistSession = useCallback((session) => {
        try {
            const sessionData = {
                ...session,
                timestamp: new Date().toISOString(),
                sessionId
            };
            localStorage.setItem(sessionStorageKey, JSON.stringify(sessionData));
        } catch (error) {
            console.warn('Failed to persist session data:', error);
        }
    }, [sessionStorageKey, sessionId]);

    // Load persisted session data
    const loadPersistedSession = useCallback(() => {
        try {
            const stored = localStorage.getItem(sessionStorageKey);
            if (stored) {
                const sessionData = JSON.parse(stored);

                // Check if session is still valid (not older than 24 hours)
                const sessionAge = Date.now() - new Date(sessionData.timestamp).getTime();
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours

                if (sessionAge < maxAge) {
                    setSessionData(sessionData);
                    return sessionData;
                } else {
                    // Remove expired session
                    localStorage.removeItem(sessionStorageKey);
                }
            }
        } catch (error) {
            console.warn('Failed to load persisted session:', error);
        }
        return null;
    }, [sessionStorageKey]);

    // Send real-time message
    const sendRealtimeMessage = useCallback((content, messageId) => {
        if (!isConnected) {
            return false;
        }

        const success = chatbotWebSocketService.sendChatMessage(content, messageId);

        if (success) {
            // Update message status to sent
            updateMessageStatus(messageId, 'sent');
        }

        return success;
    }, [isConnected]);

    // Start typing indicator
    const startTyping = useCallback(() => {
        if (isConnected) {
            chatbotWebSocketService.sendTypingStart();
        }
    }, [isConnected]);

    // Stop typing indicator
    const stopTyping = useCallback(() => {
        if (isConnected) {
            chatbotWebSocketService.sendTypingStop();
        }
    }, [isConnected]);

    // Update message status
    const updateMessageStatus = useCallback((messageId, status) => {
        if (isConnected) {
            chatbotWebSocketService.updateMessageStatus(messageId, status);
        }

        // Update local state
        setMessageStatuses(prev => new Map(prev.set(messageId, {
            status,
            timestamp: new Date().toISOString()
        })));
    }, [isConnected]);

    // Get message status
    const getMessageStatus = useCallback((messageId) => {
        return messageStatuses.get(messageId) || { status: 'pending', timestamp: null };
    }, [messageStatuses]);

    // Manually reconnect
    const reconnect = useCallback(async () => {
        if (isConnecting || isConnected) return;

        try {
            setIsConnecting(true);
            setConnectionError(null);
            await chatbotWebSocketService.connect(sessionId);
        } catch (error) {
            setConnectionError(error.message);
            throw error;
        }
    }, [sessionId, isConnecting, isConnected]);

    // Clear session data
    const clearSession = useCallback(() => {
        try {
            localStorage.removeItem(sessionStorageKey);
            setSessionData(null);
            setConversationHistory([]);
            setMessageStatuses(new Map());
        } catch (error) {
            console.warn('Failed to clear session data:', error);
        }
    }, [sessionStorageKey]);

    // Get connection info
    const getConnectionInfo = useCallback(() => {
        return {
            isConnected,
            isConnecting,
            connectionError,
            reconnectAttempts,
            sessionId,
            lastActivity: chatbotWebSocketService.getStatus().lastActivity,
            queuedMessages: chatbotWebSocketService.getStatus().queuedMessages
        };
    }, [isConnected, isConnecting, connectionError, reconnectAttempts, sessionId]);

    return {
        // Connection state
        isConnected,
        isConnecting,
        connectionError,
        reconnectAttempts,

        // Real-time features
        isTyping,
        messageStatuses,
        onlineUsers,

        // Session management
        sessionData,
        conversationHistory,

        // Actions
        sendRealtimeMessage,
        startTyping,
        stopTyping,
        updateMessageStatus,
        getMessageStatus,
        reconnect,
        clearSession,
        getConnectionInfo,

        // Utilities
        persistSession,
        loadPersistedSession
    };
};