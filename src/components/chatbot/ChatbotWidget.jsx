import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, Shield, AlertTriangle, Minimize2, Maximize2, Bell } from 'lucide-react';
import { useChatbotState } from '../../hooks/useChatbotState';
import { useChatbotAccessibility } from '../../hooks/useChatbotAccessibility';
import { useChatbotRealtime } from '../../hooks/useChatbotRealtime';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { RealtimeTypingIndicator } from './RealtimeTypingIndicator';
import { ComplianceNotice } from './ComplianceNotice';
import { QuickActions } from './QuickActions';
import { ConnectionStatus } from './ConnectionStatus';
import { SessionRecoveryBanner } from './SessionRecovery';
import { ErrorBoundary } from '../ErrorBoundaries/ChatbotErrorBoundary';

/**
 * Enhanced AI Chatbot Widget Component
 * 
 * Features:
 * - Responsive design for mobile and desktop
 * - WCAG 2.1 AA accessibility compliance
 * - CFM and LGPD compliance
 * - Modern UI/UX with glass morphism design
 * - Real-time conversation management
 * - Medical safety filters
 * - Appointment booking integration
 * 
 * Requirements: 7.1, 7.2, 7.4, 7.5
 */
const ChatbotWidget = ({
    initialMessage,
    theme = 'auto',
    position = 'bottom-right',
    enableAppointmentBooking = true,
    enableReferralRequests = true,
    complianceMode = 'strict',
    enableRealtime = true,
    className = '',
    ...props
}) => {
    // State management
    const {
        isOpen,
        setIsOpen,
        messages,
        inputMessage,
        setInputMessage,
        isLoading,
        error,
        sessionId,
        sendMessage,
        clearError
    } = useChatbotState({ initialMessage, complianceMode });

    // Real-time features
    const {
        isConnected,
        isConnecting,
        connectionError,
        reconnectAttempts,
        isTyping: isAssistantTyping,
        messageStatuses,
        sessionData,
        sendRealtimeMessage,
        startTyping,
        stopTyping,
        getMessageStatus,
        reconnect,
        clearSession
    } = useChatbotRealtime({
        sessionId,
        enabled: enableRealtime && isOpen
    });

    // Accessibility hooks
    const {
        announceMessage,
        focusManagement,
        keyboardNavigation
    } = useChatbotAccessibility();

    // Refs
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const widgetRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isUserTyping, setIsUserTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasNewMessages, setHasNewMessages] = useState(false);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Focus management
    useEffect(() => {
        if (isOpen && !isMinimized && inputRef.current) {
            // Delay focus to ensure DOM is ready
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, isMinimized]);

    // Typing detection
    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        setInputMessage(value);

        // Real-time typing indicators
        if (enableRealtime && value.trim() && !isUserTyping) {
            setIsUserTyping(true);
            startTyping();
        }

        // Clear typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            if (isUserTyping) {
                setIsUserTyping(false);
                stopTyping();
            }
        }, 2000);
    }, [setInputMessage, enableRealtime, isUserTyping, startTyping, stopTyping]);

    // Enhanced message sending with real-time support
    const handleSendMessage = useCallback(async () => {
        if (!inputMessage.trim()) return;

        // Stop typing indicator when sending
        if (isUserTyping) {
            setIsUserTyping(false);
            stopTyping();
        }

        // Send via real-time if enabled and connected
        if (enableRealtime && isConnected) {
            const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const success = sendRealtimeMessage(inputMessage.trim(), messageId);

            if (success) {
                // Clear input immediately for better UX
                setInputMessage('');
                // The message will be added to the conversation via the regular sendMessage flow
                // but with real-time status updates
            }
        }

        // Always call the regular sendMessage for processing
        await sendMessage();
    }, [inputMessage, isUserTyping, stopTyping, enableRealtime, isConnected, sendRealtimeMessage, sendMessage, setInputMessage]);

    // Keyboard event handlers
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    }, [handleSendMessage, setIsOpen]);

    // Message announcement for screen readers and notification management
    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'assistant') {
                announceMessage(lastMessage.content);

                // Handle notification badges when widget is closed or minimized
                if (!isOpen || isMinimized) {
                    setUnreadCount(prev => prev + 1);
                    setHasNewMessages(true);
                }
            }
        }
    }, [messages, announceMessage, isOpen, isMinimized]);

    // Clear notifications when widget is opened and expanded
    useEffect(() => {
        if (isOpen && !isMinimized) {
            setUnreadCount(0);
            setHasNewMessages(false);
        }
    }, [isOpen, isMinimized]);

    // Cleanup typing timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    // Position classes
    const getPositionClasses = () => {
        switch (position) {
            case 'bottom-left':
                return 'bottom-6 left-6';
            case 'center':
                return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
            default:
                return 'bottom-6 right-6';
        }
    };

    // Theme classes
    const getThemeClasses = () => {
        const baseClasses = 'backdrop-blur-md border border-white/20 shadow-2xl';

        if (theme === 'dark') {
            return `${baseClasses} bg-gray-900/90 text-white`;
        } else if (theme === 'light') {
            return `${baseClasses} bg-white/90 text-gray-900`;
        } else {
            // Auto theme - use system preference
            return `${baseClasses} bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white`;
        }
    };

    // Floating action button
    if (!isOpen) {
        return (
            <div className={`fixed ${getPositionClasses()} z-50`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300/50 backdrop-blur-sm"
                    aria-label={`Abrir assistente virtual Saraiva Vision${hasNewMessages ? ` (${unreadCount} mensagens não lidas)` : ''}`}
                    aria-describedby="chatbot-open-description"
                    {...focusManagement.getFocusProps()}
                >
                    <MessageCircle size={24} className="transition-transform group-hover:scale-110" />

                    {/* Notification badge */}
                    {hasNewMessages && unreadCount > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-bounce">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                    )}

                    {/* Pulse animation - enhanced when there are new messages */}
                    <div className={`absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20 ${hasNewMessages ? 'animate-pulse' : ''}`}></div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        {hasNewMessages ? `Assistente Virtual (${unreadCount} novas)` : 'Assistente Virtual'}
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                </button>

                <div id="chatbot-open-description" className="sr-only">
                    Clique para abrir o assistente virtual da Clínica Saraiva Vision.
                    Posso ajudar com informações sobre serviços, agendamentos e dúvidas gerais.
                    {hasNewMessages && ` Você tem ${unreadCount} mensagens não lidas.`}
                </div>
            </div>
        );
    }

    // Main widget
    return (
        <ErrorBoundary>
            <div
                ref={widgetRef}
                className={`fixed ${getPositionClasses()} z-50 transition-all duration-300 ${className}`}
                role="dialog"
                aria-labelledby="chatbot-title"
                aria-describedby="chatbot-description"
                aria-modal="true"
                {...props}
            >
                {/* Skip Link for Accessibility */}
                <a
                    href="#chatbot-input"
                    className="chatbot-skip-link sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:text-sm"
                >
                    Pular para campo de mensagem
                </a>
                <div className={`
          ${getThemeClasses()}
          rounded-2xl overflow-hidden
          w-96 max-w-[calc(100vw-2rem)]
          ${isMinimized ? 'h-16' : 'h-[600px] max-h-[calc(100vh-3rem)]'}
          flex flex-col
          transition-all duration-300 ease-in-out
          chatbot-widget
          
          /* Mobile responsive classes */
          xs:w-full xs:h-[calc(100vh-4rem)] xs:max-h-none xs:rounded-t-2xl xs:rounded-b-none
          sm:w-80 sm:h-[500px] sm:rounded-2xl
          md:w-96 md:h-[600px]
          lg:w-[400px] lg:h-[650px]
          
          /* Touch-friendly sizing */
          touch:min-h-[60px]
        `}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-blue-500/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Bot size={20} />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                                <h3 id="chatbot-title" className="font-semibold text-sm">
                                    Assistente Saraiva Vision
                                </h3>
                                <p className="text-xs text-blue-100 flex items-center">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                                    Online agora
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Notification indicator when minimized */}
                            {isMinimized && hasNewMessages && (
                                <div className="flex items-center space-x-1 text-blue-100">
                                    <Bell size={14} className="animate-pulse" />
                                    <span className="text-xs">{unreadCount}</span>
                                </div>
                            )}

                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="text-blue-100 hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-300/50"
                                aria-label={isMinimized ? "Expandir chat" : "Minimizar chat"}
                            >
                                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-blue-100 hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-300/50"
                                aria-label="Fechar assistente virtual"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Content - hidden when minimized */}
                    {!isMinimized && (
                        <>
                            {/* Compliance Notice */}
                            <ComplianceNotice complianceMode={complianceMode} />

                            {/* Connection Status */}
                            {enableRealtime && (
                                <ConnectionStatus
                                    isConnected={isConnected}
                                    isConnecting={isConnecting}
                                    connectionError={connectionError}
                                    reconnectAttempts={reconnectAttempts}
                                    onReconnect={reconnect}
                                />
                            )}

                            {/* Session Recovery */}
                            {enableRealtime && sessionData && (
                                <SessionRecoveryBanner
                                    sessionData={sessionData}
                                    onRecover={() => {
                                        // Implement session recovery logic
                                        console.log('Recovering session:', sessionData);
                                    }}
                                    onDismiss={clearSession}
                                />
                            )}

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50">
                                {messages.map((message, index) => (
                                    <ChatMessage
                                        key={message.id}
                                        message={message}
                                        isLast={index === messages.length - 1}
                                        enableAppointmentBooking={enableAppointmentBooking}
                                        enableReferralRequests={enableReferralRequests}
                                        messageStatus={enableRealtime ? getMessageStatus(message.id) : null}
                                        enableRealtime={enableRealtime}
                                    />
                                ))}

                                {isLoading && <TypingIndicator />}

                                {/* Real-time typing indicator */}
                                {enableRealtime && isAssistantTyping && !isLoading && (
                                    <RealtimeTypingIndicator
                                        isVisible={true}
                                        userName="Assistente"
                                    />
                                )}

                                <div ref={messagesEndRef} aria-hidden="true" />
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="px-4 py-3 bg-red-50/90 dark:bg-red-900/20 border-t border-red-200/50 dark:border-red-800/50 backdrop-blur-sm">
                                    <div className="flex items-center space-x-2">
                                        <AlertTriangle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0" />
                                        <p className="text-sm text-red-700 dark:text-red-300 flex-1">{error}</p>
                                        <button
                                            onClick={clearError}
                                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                                            aria-label="Fechar erro"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Input Area */}
                            <div className="p-4 border-t border-white/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex-shrink-0">
                                <div className="flex space-x-2 mb-3">
                                    <div className="flex-1 relative">
                                        <input
                                            id="chatbot-input"
                                            ref={inputRef}
                                            type="text"
                                            value={inputMessage}
                                            onChange={handleInputChange}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Digite sua mensagem..."
                                            className={`
                                                w-full border border-gray-300/50 dark:border-gray-600/50 
                                                rounded-xl px-4 py-3 pr-16 text-sm 
                                                bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm 
                                                placeholder-gray-500 dark:placeholder-gray-400 
                                                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent 
                                                transition-all duration-200
                                                
                                                /* Mobile optimizations */
                                                touch:py-4 touch:text-base
                                                sm:py-3 sm:text-sm
                                                
                                                /* High contrast support */
                                                contrast-more:border-2 contrast-more:border-gray-900 dark:contrast-more:border-white
                                                
                                                /* Accessibility */
                                                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                            disabled={isLoading}
                                            maxLength={1000}
                                            aria-label="Campo de mensagem do assistente virtual"
                                            aria-describedby="input-help input-counter"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            autoCapitalize="sentences"
                                            spellCheck="true"
                                            {...keyboardNavigation.getInputProps()}
                                        />

                                        {/* Character counter */}
                                        <div
                                            id="input-counter"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none"
                                            aria-live="polite"
                                        >
                                            <span className={inputMessage.length > 900 ? 'text-orange-500' : inputMessage.length > 950 ? 'text-red-500' : ''}>
                                                {inputMessage.length}/1000
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputMessage.trim() || isLoading}
                                        className={`
                                            bg-gradient-to-r from-blue-600 to-blue-700 
                                            hover:from-blue-700 hover:to-blue-800 
                                            disabled:from-gray-300 disabled:to-gray-400 
                                            disabled:cursor-not-allowed text-white rounded-xl 
                                            px-4 py-3 transition-all duration-200 
                                            focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                                            hover:scale-105 disabled:hover:scale-100
                                            
                                            /* Mobile optimizations */
                                            touch:px-5 touch:py-4 touch:min-w-[60px]
                                            sm:px-4 sm:py-3
                                            
                                            /* High contrast support */
                                            contrast-more:border-2 contrast-more:border-blue-900
                                        `}
                                        aria-label={isLoading ? "Enviando mensagem..." : "Enviar mensagem"}
                                        type="submit"
                                    >
                                        <Send size={16} className={isLoading ? 'animate-pulse' : ''} />
                                    </button>
                                </div>

                                {/* Quick Actions */}
                                <QuickActions
                                    enableAppointmentBooking={enableAppointmentBooking}
                                    enableReferralRequests={enableReferralRequests}
                                />

                                {/* Help Text */}
                                <div id="input-help" className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-between flex-wrap gap-2">
                                    <span className="flex items-center space-x-1">
                                        <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                                            Enter
                                        </kbd>
                                        <span>para enviar</span>
                                    </span>
                                    <div className="flex items-center space-x-1">
                                        <Shield size={10} />
                                        <span>Protegido por LGPD</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Screen reader announcements */}
                <div id="chatbot-description" className="sr-only">
                    Assistente virtual da Clínica Saraiva Vision.
                    Use as setas para navegar pelas mensagens, Enter para enviar, Escape para fechar.
                </div>

                <div aria-live="polite" aria-atomic="true" className="sr-only" id="chat-announcements">
                    {/* Dynamic announcements will be inserted here */}
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default ChatbotWidget;