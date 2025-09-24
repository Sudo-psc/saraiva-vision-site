import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatbotMockService } from '../services/chatbotMockService.js';

/**
 * Custom hook for managing chatbot state
 * 
 * Handles conversation state, message management, and API communication
 * Includes error handling and session management
 */
export const useChatbotState = ({ initialMessage, complianceMode = 'strict' }) => {
    // Core state
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sessionId, setSessionId] = useState(null);

    // Advanced state
    const [conversationContext, setConversationContext] = useState({});
    const [userConsent, setUserConsent] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [messageStatuses, setMessageStatuses] = useState(new Map());

    // Refs for cleanup
    const abortControllerRef = useRef(null);
    const timeoutRef = useRef(null);

    // Initialize welcome message when chat opens
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage = initialMessage ||
                'Olá! Sou o assistente virtual da Clínica Saraiva Vision. Como posso ajudá-lo hoje? Posso responder dúvidas sobre nossos serviços, procedimentos oftalmológicos ou ajudar com agendamentos.';

            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: welcomeMessage,
                timestamp: new Date().toISOString(),
                metadata: {
                    isWelcome: true,
                    containsMedicalContent: false,
                    requiresDisclaimer: false
                }
            }]);
        }
    }, [isOpen, messages.length, initialMessage]);

    // Generate session ID
    useEffect(() => {
        if (isOpen && !sessionId) {
            const newSessionId = `chatbot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            setSessionId(newSessionId);
        }
    }, [isOpen, sessionId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Clear error after timeout
    useEffect(() => {
        if (error) {
            timeoutRef.current = setTimeout(() => {
                setError(null);
            }, 5000);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [error]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const sendMessage = useCallback(async (messageId = null) => {
        if (!inputMessage.trim() || isLoading) return;

        // Generate message ID if not provided (for real-time integration)
        const msgId = messageId || `user_${Date.now()}`;

        // Create user message
        const userMessage = {
            id: msgId,
            role: 'user',
            content: inputMessage.trim(),
            timestamp: new Date().toISOString(),
            metadata: {
                containsMedicalContent: false,
                requiresDisclaimer: false
            }
        };

        // Set initial message status
        setMessageStatuses(prev => new Map(prev.set(msgId, {
            status: 'pending',
            timestamp: new Date().toISOString()
        })));

        // Add user message to conversation
        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputMessage.trim();
        setInputMessage('');
        setIsLoading(true);
        setError(null);

        // Cancel any previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        try {
            // Update message status to sent
            setMessageStatuses(prev => new Map(prev.set(userMessage.id, {
                status: 'sent',
                timestamp: new Date().toISOString()
            })));

            let data;

            try {
                // Try API first
                const requestData = {
                    message: currentInput,
                    sessionId: sessionId,
                    conversationHistory: messages.map(msg => ({
                        role: msg.role,
                        content: msg.content,
                        timestamp: msg.timestamp
                    })),
                    context: {
                        complianceMode,
                        userConsent: userConsent,
                        conversationContext: conversationContext
                    }
                };

                const response = await fetch('/api/chatbot', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                    signal: abortControllerRef.current.signal
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Invalid response type');
                }

                const responseText = await response.text();
                if (!responseText || responseText.trim() === '') {
                    throw new Error('Empty response');
                }

                data = JSON.parse(responseText);

                if (!data.success || !data.data || !data.data.response) {
                    throw new Error('Invalid response structure');
                }

            } catch (apiError) {
                console.warn('API request failed, using mock service:', apiError.message);

                // Fallback to mock service
                data = await ChatbotMockService.generateResponse(currentInput, sessionId);
            }

            // Update session ID if provided
            if (data.data.sessionId && data.data.sessionId !== sessionId) {
                setSessionId(data.data.sessionId);
            }

            // Update conversation context
            if (data.data.conversationContext) {
                setConversationContext(prev => ({
                    ...prev,
                    ...data.data.conversationContext
                }));
            }

            // Create bot response message
            const botMessage = {
                id: `assistant_${Date.now()}`,
                role: 'assistant',
                content: data.data.response,
                timestamp: data.data.timestamp || new Date().toISOString(),
                metadata: {
                    containsMedicalContent: data.data.complianceInfo?.containsMedicalContent || false,
                    requiresDisclaimer: data.data.complianceInfo?.requiresDisclaimer || false,
                    isEmergency: data.data.complianceInfo?.emergencyDetected || false,
                    suggestsAppointment: data.data.complianceInfo?.suggestsAppointment || false,
                    suggestsReferral: data.data.complianceInfo?.suggestsReferral || false,
                    safetyScore: data.data.metadata?.safetyScore,
                    tokensUsed: data.data.metadata?.tokensUsed
                },
                suggestedActions: data.data.suggestedActions || [],
                suggestsBooking: data.data.suggestsBooking // Legacy support
            };

            // Add bot message to conversation
            setMessages(prev => [...prev, botMessage]);

            // Update message status to delivered
            setMessageStatuses(prev => new Map(prev.set(userMessage.id, {
                status: 'delivered',
                timestamp: new Date().toISOString()
            })));

            // Reset retry count on success
            setRetryCount(0);

            // Track successful interaction
            if (window.gtag) {
                window.gtag('event', 'chatbot_message_success', {
                    event_category: 'chatbot',
                    event_label: 'message_sent',
                    value: data.data.metadata?.tokensUsed || 0
                });
            }

        } catch (error) {
            // Don't handle aborted requests
            if (error.name === 'AbortError') {
                return;
            }

            console.error('Chatbot error:', error);
            setError(error.message);
            setRetryCount(prev => prev + 1);

            // Update message status to failed
            setMessageStatuses(prev => new Map(prev.set(userMessage.id, {
                status: 'failed',
                timestamp: new Date().toISOString()
            })));

            // Create error message
            const errorMessage = {
                id: `error_${Date.now()}`,
                role: 'assistant',
                content: 'Desculpe, ocorreu um erro. Tente novamente ou entre em contato conosco diretamente pelo telefone (33) 99860-1427.',
                timestamp: new Date().toISOString(),
                isError: true,
                metadata: {
                    containsMedicalContent: false,
                    requiresDisclaimer: false,
                    isEmergency: false
                }
            };

            setMessages(prev => [...prev, errorMessage]);

            // Track error
            if (window.gtag) {
                window.gtag('event', 'chatbot_message_error', {
                    event_category: 'error',
                    event_label: error.message,
                    value: retryCount
                });
            }

        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [inputMessage, isLoading, sessionId, messages, complianceMode, userConsent, conversationContext, retryCount]);

    const resetConversation = useCallback(() => {
        setMessages([]);
        setSessionId(null);
        setConversationContext({});
        setError(null);
        setRetryCount(0);
        setMessageStatuses(new Map());

        // Cancel any pending requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    // Get message status
    const getMessageStatus = useCallback((messageId) => {
        return messageStatuses.get(messageId) || { status: 'pending', timestamp: null };
    }, [messageStatuses]);

    // Update message status (for real-time updates)
    const updateMessageStatus = useCallback((messageId, status, timestamp = null) => {
        setMessageStatuses(prev => new Map(prev.set(messageId, {
            status,
            timestamp: timestamp || new Date().toISOString()
        })));
    }, []);

    const updateUserConsent = useCallback((consent) => {
        setUserConsent(consent);

        // Store consent in localStorage for persistence
        if (consent) {
            localStorage.setItem('chatbot_user_consent', JSON.stringify({
                ...consent,
                timestamp: new Date().toISOString()
            }));
        }
    }, []);

    // Load stored consent on mount
    useEffect(() => {
        try {
            const storedConsent = localStorage.getItem('chatbot_user_consent');
            if (storedConsent) {
                const consent = JSON.parse(storedConsent);
                // Check if consent is still valid (e.g., not older than 1 year)
                const consentDate = new Date(consent.timestamp);
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

                if (consentDate > oneYearAgo) {
                    setUserConsent(consent);
                } else {
                    // Remove expired consent
                    localStorage.removeItem('chatbot_user_consent');
                }
            }
        } catch (error) {
            console.warn('Error loading stored consent:', error);
        }
    }, []);

    return {
        // Core state
        isOpen,
        setIsOpen,
        messages,
        inputMessage,
        setInputMessage,
        isLoading,
        error,
        sessionId,

        // Advanced state
        conversationContext,
        userConsent,
        retryCount,

        // Actions
        sendMessage,
        clearError,
        resetConversation,
        updateUserConsent,
        getMessageStatus,
        updateMessageStatus,

        // Message status state
        messageStatuses
    };
};