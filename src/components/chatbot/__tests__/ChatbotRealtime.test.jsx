import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ChatbotWidget from '../ChatbotWidget';
import chatbotWebSocketService from '../../../services/chatbotWebSocketService';

// Mock the WebSocket service
vi.mock('../../../services/chatbotWebSocketService', () => ({
    default: {
        connect: vi.fn(),
        disconnect: vi.fn(),
        sendChatMessage: vi.fn(),
        sendTypingStart: vi.fn(),
        sendTypingStop: vi.fn(),
        updateMessageStatus: vi.fn(),
        requestConversationHistory: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        isConnected: false,
        isHealthy: vi.fn(() => true),
        getStatus: vi.fn(() => ({
            isConnected: false,
            isConnecting: false,
            reconnectAttempts: 0,
            queuedMessages: 0,
            lastActivity: Date.now()
        }))
    }
}));

// Mock hooks
vi.mock('../../../hooks/useChatbotState', () => ({
    useChatbotState: vi.fn(() => ({
        isOpen: true,
        setIsOpen: vi.fn(),
        messages: [],
        inputMessage: '',
        setInputMessage: vi.fn(),
        isLoading: false,
        error: null,
        sessionId: 'test-session-123',
        sendMessage: vi.fn(),
        clearError: vi.fn(),
        getMessageStatus: vi.fn(() => ({ status: 'pending', timestamp: null })),
        updateMessageStatus: vi.fn()
    }))
}));

vi.mock('../../../hooks/useChatbotAccessibility', () => ({
    useChatbotAccessibility: vi.fn(() => ({
        announceMessage: vi.fn(),
        focusManagement: {
            getFocusProps: vi.fn(() => ({}))
        },
        keyboardNavigation: {
            getInputProps: vi.fn(() => ({}))
        }
    }))
}));

describe('ChatbotWidget Real-time Features', () => {
    let mockWebSocketService;

    beforeEach(() => {
        mockWebSocketService = chatbotWebSocketService;
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('WebSocket Connection', () => {
        it('should initialize WebSocket connection when real-time is enabled', async () => {
            const mockConnect = vi.fn().mockResolvedValue();
            mockWebSocketService.connect = mockConnect;

            render(
                <ChatbotWidget
                    enableRealtime={true}
                    initialMessage="Test message"
                />
            );

            await waitFor(() => {
                expect(mockConnect).toHaveBeenCalledWith('test-session-123');
            });
        });

        it('should not initialize WebSocket when real-time is disabled', () => {
            const mockConnect = vi.fn();
            mockWebSocketService.connect = mockConnect;

            render(
                <ChatbotWidget
                    enableRealtime={false}
                    initialMessage="Test message"
                />
            );

            expect(mockConnect).not.toHaveBeenCalled();
        });

        it('should show connection status indicator', () => {
            render(
                <ChatbotWidget
                    enableRealtime={true}
                    initialMessage="Test message"
                />
            );

            // Should show connection status component
            expect(screen.getByText(/conectando|conectado|desconectado/i)).toBeInTheDocument();
        });
    });

    describe('Typing Indicators', () => {
        it('should send typing start when user starts typing', async () => {
            const mockSendTypingStart = vi.fn();
            mockWebSocketService.sendTypingStart = mockSendTypingStart;
            mockWebSocketService.isConnected = true;

            render(
                <ChatbotWidget
                    enableRealtime={true}
                    initialMessage="Test message"
                />
            );

            const input = screen.getByPlaceholderText(/digite sua mensagem/i);

            await act(async () => {
                fireEvent.change(input, { target: { value: 'Hello' } });
            });

            await waitFor(() => {
                expect(mockSendTypingStart).toHaveBeenCalled();
            });
        });

        it('should send typing stop after inactivity', async () => {
            const mockSendTypingStop = vi.fn();
            mockWebSocketService.sendTypingStop = mockSendTypingStop;
            mockWebSocketService.isConnected = true;

            vi.useFakeTimers();

            render(
                <ChatbotWidget
                    enableRealtime={true}
                    initialMessage="Test message"
                />
            );

            const input = screen.getByPlaceholderText(/digite sua mensagem/i);

            await act(async () => {
                fireEvent.change(input, { target: { value: 'Hello' } });
            });

            // Fast-forward time to trigger typing stop
            await act(async () => {
                vi.advanceTimersByTime(2100); // 2.1 seconds
            });

            expect(mockSendTypingStop).toHaveBeenCalled();

            vi.useRealTimers();
        });

        it('should show typing indicator when assistant is typing', () => {
            // Mock the hook to return typing state
            const { useChatbotRealtime } = require('../../../hooks/useChatbotRealtime');
            useChatbotRealtime.mockReturnValue({
                isConnected: true,
                isConnecting: false,
                connectionError: null,
                reconnectAttempts: 0,
                isTyping: true, // Assistant is typing
                messageStatuses: new Map(),
                sessionData: null,
                sendRealtimeMessage: vi.fn(),
                startTyping: vi.fn(),
                stopTyping: vi.fn(),
                getMessageStatus: vi.fn(() => ({ status: 'pending', timestamp: null })),
                reconnect: vi.fn(),
                clearSession: vi.fn()
            });

            render(
                <ChatbotWidget
                    enableRealtime={true}
                    initialMessage="Test message"
                />
            );

            expect(screen.getByText(/está digitando/i)).toBeInTheDocument();
        });
    });

    describe('Message Status Updates', () => {
        it('should show message status for user messages', () => {
            const { useChatbotState } = require('../../../hooks/useChatbotState');
            useChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [{
                    id: 'user-msg-1',
                    role: 'user',
                    content: 'Hello',
                    timestamp: new Date().toISOString()
                }],
                inputMessage: '',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: null,
                sessionId: 'test-session-123',
                sendMessage: vi.fn(),
                clearError: vi.fn(),
                getMessageStatus: vi.fn(() => ({ status: 'sent', timestamp: new Date().toISOString() })),
                updateMessageStatus: vi.fn()
            });

            render(
                <ChatbotWidget
                    enableRealtime={true}
                    initialMessage="Test message"
                />
            );

            // Should show message status icon
            expect(screen.getByRole('article')).toBeInTheDocument();
        });

        it('should update message status when WebSocket events are received', async () => {
            const mockUpdateMessageStatus = vi.fn();
            const { useChatbotState } = require('../../../hooks/useChatbotState');
            useChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: '',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: null,
                sessionId: 'test-session-123',
                sendMessage: vi.fn(),
                clearError: vi.fn(),
                getMessageStatus: vi.fn(() => ({ status: 'pending', timestamp: null })),
                updateMessageStatus: mockUpdateMessageStatus
            });

            render(
                <ChatbotWidget
                    enableRealtime={true}
                    initialMessage="Test message"
                />
            );

            // Simulate WebSocket message status event
            const mockEventHandlers = {};
            mockWebSocketService.on.mockImplementation((event, handler) => {
                mockEventHandlers[event] = handler;
            });

            // Trigger message status update
            if (mockEventHandlers.message_status) {
                mockEventHandlers.message_status({
                    messageId: 'test-msg-1',
                    status: 'delivered',
                    timestamp: new Date().toISOString()
                });
            }

            await waitFor(() => {
                expect(mockUpdateMessageStatus).toHaveBeenCalledWith(
                    'test-msg-1',
                    'delivered',
                    expect.any(String)
                );
            });
        });
    });

    describe('Session Recovery', () => {
        it('should show session recovery banner when session data is available', () => {
            const { useChatbotRealtime } = require('../../../hooks/useChatbotRealtime');
            useChatbotRealtime.mockReturnValue({
                isConnected: true,
                isConnecting: false,
                connectionError: null,
                reconnectAttempts: 0,
                isTyping: false,
                messageStatuses: new Map(),
                sessionData: {
                    sessionId: 'test-session-123',
                    messageCount: 5,
                    timestamp: new Date().toISOString(),
                    lastTopic: 'Agendamento'
                },
                sendRealtimeMessage: vi.fn(),
                startTyping: vi.fn(),
                stopTyping: vi.fn(),
                getMessageStatus: vi.fn(() => ({ status: 'pending', timestamp: null })),
                reconnect: vi.fn(),
                clearSession: vi.fn()
            });

            render(
                <ChatbotWidget
                    enableRealtime={true}
                    initialMessage="Test message"
                />
            );

            expect(screen.getByText(/sessão anterior disponível/i)).toBeInTheDocument();
        });

        it('should handle session recovery action', async () => {
            const mockClearSession = vi.fn();
            const { useChatbotRealtime } = require('../../../hooks/useChatbotRealtime');
            useChatbotRealtime.mockReturnValue({
                isConnected: true,
                isConnecting: false,
                connectionError: null,
                reconnectAttempts: 0,
                isTyping: false,
                messageStatuses: new Map(),
                sessionData: {
                    sessionId: 'test-session-123',
                    messageCount: 5,
                    timestamp: new Date().toISOString()
                },
                sendRealtimeMessage: vi.fn(),
                startTyping: vi.fn(),
                stopTyping: vi.fn(),
                getMessageStatus: vi.fn(() => ({ status: 'pending', timestamp: null })),
                reconnect: vi.fn(),
                clearSession: mockClearSession
            });

            render(
                <ChatbotWidget
                    enableRealtime={true}
                    initialMessage="Test message"
                />
            );

            const dismissButton = screen.getByLabelText(/dispensar/i);
            fireEvent.click(dismissButton);

            expect(mockClearSession).toHaveBeenCalled();
        });
    });

    describe('Connection Error Handling', () => {
        it('should show connection error and retry button', () => {
            const { useChatbotRealtime } = require('../../../hooks/useChatbotRealtime');
            useChatbotRealtime.mockReturnValue({
                isConnected: false,
                isConnecting: false,
                connectionError: 'Connection failed',
                reconnectAttempts: 2,
                isTyping: false,
                messageStatuses: new Map(),
                sessionData: null,
                sendRealtimeMessage: vi.fn(),
                startTyping: vi.fn(),
                stopTyping: vi.fn(),
                getMessageStatus: vi.fn(() => ({ status: 'pending', timestamp: null })),
                reconnect: vi.fn(),
                clearSession: vi.fn()
            });

            render(
                <ChatbotWidget
                    enableRealtime={true}
                    initialMessage="Test message"
                />
            );

            expect(screen.getByText(/erro de conexão/i)).toBeInTheDocument();
            expect(screen.getByText(/reconectar/i)).toBeInTheDocument();
        });

        it('should handle reconnection attempt', async () => {
            const mockReconnect = vi.fn();
            const { useChatbotRealtime } = require('../../../hooks/useChatbotRealtime');
            useChatbotRealtime.mockReturnValue({
                isConnected: false,
                isConnecting: false,
                connectionError: 'Connection failed',
                reconnectAttempts: 1,
                isTyping: false,
                messageStatuses: new Map(),
                sessionData: null,
                sendRealtimeMessage: vi.fn(),
                startTyping: vi.fn(),
                stopTyping: vi.fn(),
                getMessageStatus: vi.fn(() => ({ status: 'pending', timestamp: null })),
                reconnect: mockReconnect,
                clearSession: vi.fn()
            });

            render(
                <ChatbotWidget
                    enableRealtime={true}
                    initialMessage="Test message"
                />
            );

            const reconnectButton = screen.getByText(/reconectar/i);
            fireEvent.click(reconnectButton);

            expect(mockReconnect).toHaveBeenCalled();
        });
    });

    describe('Real-time Message Sending', () => {
        it('should send message via WebSocket when connected', async () => {
            const mockSendRealtimeMessage = vi.fn().mockReturnValue(true);
            const mockSendMessage = vi.fn();

            const { useChatbotState } = require('../../../hooks/useChatbotState');
            useChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: 'Test message',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: null,
                sessionId: 'test-session-123',
                sendMessage: mockSendMessage,
                clearError: vi.fn(),
                getMessageStatus: vi.fn(() => ({ status: 'pending', timestamp: null })),
                updateMessageStatus: vi.fn()
            });

            const { useChatbotRealtime } = require('../../../hooks/useChatbotRealtime');
            useChatbotRealtime.mockReturnValue({
                isConnected: true,
                isConnecting: false,
                connectionError: null,
                reconnectAttempts: 0,
                isTyping: false,
                messageStatuses: new Map(),
                sessionData: null,
                sendRealtimeMessage: mockSendRealtimeMessage,
                startTyping: vi.fn(),
                stopTyping: vi.fn(),
                getMessageStatus: vi.fn(() => ({ status: 'pending', timestamp: null })),
                reconnect: vi.fn(),
                clearSession: vi.fn()
            });

            render(
                <ChatbotWidget
                    enableRealtime={true}
                    initialMessage="Test message"
                />
            );

            const sendButton = screen.getByLabelText(/enviar mensagem/i);
            fireEvent.click(sendButton);

            await waitFor(() => {
                expect(mockSendRealtimeMessage).toHaveBeenCalledWith(
                    'Test message',
                    expect.any(String)
                );
                expect(mockSendMessage).toHaveBeenCalled();
            });
        });

        it('should fallback to regular sending when WebSocket is not connected', async () => {
            const mockSendRealtimeMessage = vi.fn().mockReturnValue(false);
            const mockSendMessage = vi.fn();

            const { useChatbotState } = require('../../../hooks/useChatbotState');
            useChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: 'Test message',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: null,
                sessionId: 'test-session-123',
                sendMessage: mockSendMessage,
                clearError: vi.fn(),
                getMessageStatus: vi.fn(() => ({ status: 'pending', timestamp: null })),
                updateMessageStatus: vi.fn()
            });

            const { useChatbotRealtime } = require('../../../hooks/useChatbotRealtime');
            useChatbotRealtime.mockReturnValue({
                isConnected: false,
                isConnecting: false,
                connectionError: null,
                reconnectAttempts: 0,
                isTyping: false,
                messageStatuses: new Map(),
                sessionData: null,
                sendRealtimeMessage: mockSendRealtimeMessage,
                startTyping: vi.fn(),
                stopTyping: vi.fn(),
                getMessageStatus: vi.fn(() => ({ status: 'pending', timestamp: null })),
                reconnect: vi.fn(),
                clearSession: vi.fn()
            });

            render(
                <ChatbotWidget
                    enableRealtime={true}
                    initialMessage="Test message"
                />
            );

            const sendButton = screen.getByLabelText(/enviar mensagem/i);
            fireEvent.click(sendButton);

            await waitFor(() => {
                expect(mockSendMessage).toHaveBeenCalled();
            });
        });
    });

    describe('Accessibility', () => {
        it('should announce typing status to screen readers', () => {
            const { useChatbotRealtime } = require('../../../hooks/useChatbotRealtime');
            useChatbotRealtime.mockReturnValue({
                isConnected: true,
                isConnecting: false,
                connectionError: null,
                reconnectAttempts: 0,
                isTyping: true,
                messageStatuses: new Map(),
                sessionData: null,
                sendRealtimeMessage: vi.fn(),
                startTyping: vi.fn(),
                stopTyping: vi.fn(),
                getMessageStatus: vi.fn(() => ({ status: 'pending', timestamp: null })),
                reconnect: vi.fn(),
                clearSession: vi.fn()
            });

            render(
                <ChatbotWidget
                    enableRealtime={true}
                    initialMessage="Test message"
                />
            );

            const typingIndicator = screen.getByRole('status');
            expect(typingIndicator).toHaveAttribute('aria-label', expect.stringContaining('está digitando'));
        });

        it('should provide proper ARIA labels for connection status', () => {
            render(
                <ChatbotWidget
                    enableRealtime={true}
                    initialMessage="Test message"
                />
            );

            // Connection status should be accessible
            const connectionStatus = screen.getByText(/conectando|conectado|desconectado/i);
            expect(connectionStatus).toBeInTheDocument();
        });
    });
});