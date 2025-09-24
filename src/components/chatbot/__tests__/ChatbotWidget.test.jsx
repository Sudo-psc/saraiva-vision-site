import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ChatbotWidget from '../ChatbotWidget';

// Mock the hooks
vi.mock('../../../hooks/useChatbotState', () => ({
    useChatbotState: vi.fn()
}));

vi.mock('../../../hooks/useChatbotAccessibility', () => ({
    useChatbotAccessibility: vi.fn()
}));

vi.mock('../../../hooks/useChatbotRealtime', () => ({
    useChatbotRealtime: vi.fn()
}));

// Mock fetch
global.fetch = vi.fn();

describe('ChatbotWidget', () => {
    const mockUseChatbotState = vi.mocked(await import('../../../hooks/useChatbotState')).useChatbotState;
    const mockUseChatbotAccessibility = vi.mocked(await import('../../../hooks/useChatbotAccessibility')).useChatbotAccessibility;
    const mockUseChatbotRealtime = vi.mocked(await import('../../../hooks/useChatbotRealtime')).useChatbotRealtime;

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset default mock implementations
        mockUseChatbotState.mockReturnValue({
            isOpen: false,
            setIsOpen: vi.fn(),
            messages: [],
            inputMessage: '',
            setInputMessage: vi.fn(),
            isLoading: false,
            error: null,
            sessionId: 'test-session',
            sendMessage: vi.fn(),
            clearError: vi.fn()
        });

        mockUseChatbotAccessibility.mockReturnValue({
            announceMessage: vi.fn(),
            focusManagement: {
                getFocusProps: () => ({})
            },
            keyboardNavigation: {
                getInputProps: () => ({})
            }
        });

        mockUseChatbotRealtime.mockReturnValue({
            isConnected: false,
            isConnecting: false,
            connectionError: null,
            reconnectAttempts: 0,
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
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Floating Action Button', () => {
        it('renders floating action button when closed', () => {
            render(<ChatbotWidget />);

            const button = screen.getByRole('button', { name: /abrir assistente virtual/i });
            expect(button).toBeInTheDocument();
            expect(button).toHaveClass('rounded-full');
        });

        it('opens chat when floating button is clicked', async () => {
            const mockSetIsOpen = vi.fn();
            mockUseChatbotState.mockReturnValue({
                isOpen: false,
                setIsOpen: mockSetIsOpen,
                messages: [],
                inputMessage: '',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: null,
                sessionId: 'test-session',
                sendMessage: vi.fn(),
                clearError: vi.fn()
            });

            render(<ChatbotWidget />);

            const button = screen.getByRole('button', { name: /abrir assistente virtual/i });
            await userEvent.click(button);

            expect(mockSetIsOpen).toHaveBeenCalledWith(true);
        });

        it('applies correct position classes', () => {
            const { rerender } = render(<ChatbotWidget position="bottom-left" />);
            expect(screen.getByRole('button')).toBeInTheDocument();

            rerender(<ChatbotWidget position="center" />);
            expect(screen.getByRole('button')).toBeInTheDocument();

            rerender(<ChatbotWidget position="bottom-right" />);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Chat Interface', () => {
        beforeEach(() => {
            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [
                    {
                        id: 'welcome',
                        role: 'assistant',
                        content: 'Olá! Como posso ajudá-lo?',
                        timestamp: new Date().toISOString(),
                        metadata: { isWelcome: true }
                    }
                ],
                inputMessage: '',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: null,
                sessionId: 'test-session',
                sendMessage: vi.fn(),
                clearError: vi.fn()
            });
        });

        it('renders chat interface when open', () => {
            render(<ChatbotWidget />);

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Assistente Saraiva Vision')).toBeInTheDocument();
            expect(screen.getByText('Online agora')).toBeInTheDocument();
        });

        it('displays welcome message', () => {
            render(<ChatbotWidget />);

            expect(screen.getByText('Olá! Como posso ajudá-lo?')).toBeInTheDocument();
        });

        it('renders input field and send button', () => {
            render(<ChatbotWidget />);

            expect(screen.getByPlaceholderText('Digite sua mensagem...')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /enviar mensagem/i })).toBeInTheDocument();
        });

        it('closes chat when close button is clicked', async () => {
            const mockSetIsOpen = vi.fn();
            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: mockSetIsOpen,
                messages: [],
                inputMessage: '',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: null,
                sessionId: 'test-session',
                sendMessage: vi.fn(),
                clearError: vi.fn()
            });

            render(<ChatbotWidget />);

            const closeButton = screen.getByRole('button', { name: /fechar assistente virtual/i });
            await userEvent.click(closeButton);

            expect(mockSetIsOpen).toHaveBeenCalledWith(false);
        });
    });

    describe('Message Handling', () => {
        it('calls sendMessage when send button is clicked', async () => {
            const mockSendMessage = vi.fn();
            const mockSetInputMessage = vi.fn();

            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: 'Test message',
                setInputMessage: mockSetInputMessage,
                isLoading: false,
                error: null,
                sessionId: 'test-session',
                sendMessage: mockSendMessage,
                clearError: vi.fn()
            });

            render(<ChatbotWidget />);

            const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
            await userEvent.click(sendButton);

            expect(mockSendMessage).toHaveBeenCalled();
        });

        it('calls sendMessage when Enter is pressed', async () => {
            const mockSendMessage = vi.fn();

            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: 'Test message',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: null,
                sessionId: 'test-session',
                sendMessage: mockSendMessage,
                clearError: vi.fn()
            });

            render(<ChatbotWidget />);

            const input = screen.getByPlaceholderText('Digite sua mensagem...');
            await userEvent.type(input, '{enter}');

            expect(mockSendMessage).toHaveBeenCalled();
        });

        it('does not send message when Shift+Enter is pressed', async () => {
            const mockSendMessage = vi.fn();

            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: 'Test message',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: null,
                sessionId: 'test-session',
                sendMessage: mockSendMessage,
                clearError: vi.fn()
            });

            render(<ChatbotWidget />);

            const input = screen.getByPlaceholderText('Digite sua mensagem...');
            await userEvent.type(input, '{shift>}{enter}{/shift}');

            expect(mockSendMessage).not.toHaveBeenCalled();
        });

        it('updates input message when typing', async () => {
            const mockSetInputMessage = vi.fn();

            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: '',
                setInputMessage: mockSetInputMessage,
                isLoading: false,
                error: null,
                sessionId: 'test-session',
                sendMessage: vi.fn(),
                clearError: vi.fn()
            });

            render(<ChatbotWidget />);

            const input = screen.getByPlaceholderText('Digite sua mensagem...');
            await userEvent.type(input, 'Hello');

            expect(mockSetInputMessage).toHaveBeenCalledWith('H');
            expect(mockSetInputMessage).toHaveBeenCalledWith('e');
            expect(mockSetInputMessage).toHaveBeenCalledWith('l');
            expect(mockSetInputMessage).toHaveBeenCalledWith('l');
            expect(mockSetInputMessage).toHaveBeenCalledWith('o');
        });
    });

    describe('Loading State', () => {
        it('shows typing indicator when loading', () => {
            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: '',
                setInputMessage: vi.fn(),
                isLoading: true,
                error: null,
                sessionId: 'test-session',
                sendMessage: vi.fn(),
                clearError: vi.fn()
            });

            render(<ChatbotWidget />);

            expect(screen.getByRole('status', { name: /o assistente está digitando/i })).toBeInTheDocument();
        });

        it('disables input and send button when loading', () => {
            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: 'Test',
                setInputMessage: vi.fn(),
                isLoading: true,
                error: null,
                sessionId: 'test-session',
                sendMessage: vi.fn(),
                clearError: vi.fn()
            });

            render(<ChatbotWidget />);

            expect(screen.getByPlaceholderText('Digite sua mensagem...')).toBeDisabled();
            expect(screen.getByRole('button', { name: /enviar mensagem/i })).toBeDisabled();
        });
    });

    describe('Error Handling', () => {
        it('displays error message when error occurs', () => {
            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: '',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: 'Connection failed',
                sessionId: 'test-session',
                sendMessage: vi.fn(),
                clearError: vi.fn()
            });

            render(<ChatbotWidget />);

            expect(screen.getByText('Connection failed')).toBeInTheDocument();
        });

        it('clears error when close error button is clicked', async () => {
            const mockClearError = vi.fn();

            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: '',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: 'Connection failed',
                sessionId: 'test-session',
                sendMessage: vi.fn(),
                clearError: mockClearError
            });

            render(<ChatbotWidget />);

            const closeErrorButton = screen.getByRole('button', { name: /fechar erro/i });
            await userEvent.click(closeErrorButton);

            expect(mockClearError).toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        beforeEach(() => {
            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [
                    {
                        id: '1',
                        role: 'assistant',
                        content: 'Test message',
                        timestamp: new Date().toISOString(),
                        metadata: {}
                    }
                ],
                inputMessage: '',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: null,
                sessionId: 'test-session',
                sendMessage: vi.fn(),
                clearError: vi.fn()
            });
        });

        it('has proper ARIA attributes', () => {
            render(<ChatbotWidget />);

            const dialog = screen.getByRole('dialog');
            expect(dialog).toHaveAttribute('aria-labelledby', 'chatbot-title');
            expect(dialog).toHaveAttribute('aria-describedby', 'chatbot-description');
        });

        it('has proper labels for input field', () => {
            render(<ChatbotWidget />);

            const input = screen.getByPlaceholderText('Digite sua mensagem...');
            expect(input).toHaveAttribute('aria-label', 'Campo de mensagem');
            expect(input).toHaveAttribute('aria-describedby', 'input-help');
        });

        it('announces messages to screen readers', () => {
            const mockAnnounceMessage = vi.fn();

            mockUseChatbotAccessibility.mockReturnValue({
                announceMessage: mockAnnounceMessage,
                focusManagement: {
                    getFocusProps: () => ({})
                },
                keyboardNavigation: {
                    getInputProps: () => ({})
                }
            });

            render(<ChatbotWidget />);

            // The hook should be called during render
            expect(mockAnnounceMessage).toHaveBeenCalled();
        });

        it('supports keyboard navigation', async () => {
            render(<ChatbotWidget />);

            const input = screen.getByPlaceholderText('Digite sua mensagem...');

            // Test Escape key
            await userEvent.type(input, '{escape}');

            // The escape handler should be attached via the accessibility hook
            expect(mockUseChatbotAccessibility).toHaveBeenCalled();
        });
    });

    describe('Quick Actions', () => {
        beforeEach(() => {
            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: '',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: null,
                sessionId: 'test-session',
                sendMessage: vi.fn(),
                clearError: vi.fn()
            });
        });

        it('renders quick action buttons', () => {
            render(<ChatbotWidget />);

            expect(screen.getByText('WhatsApp')).toBeInTheDocument();
            expect(screen.getByText('Agendar')).toBeInTheDocument();
            expect(screen.getByText('Localização')).toBeInTheDocument();
            expect(screen.getByText('Emergência')).toBeInTheDocument();
        });

        it('hides appointment button when disabled', () => {
            render(<ChatbotWidget enableAppointmentBooking={false} />);

            expect(screen.queryByText('Agendar')).not.toBeInTheDocument();
        });
    });

    describe('Compliance Features', () => {
        it('shows compliance notice in strict mode', () => {
            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: '',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: null,
                sessionId: 'test-session',
                sendMessage: vi.fn(),
                clearError: vi.fn()
            });

            render(<ChatbotWidget complianceMode="strict" />);

            expect(screen.getByText(/conformidade médica e privacidade/i)).toBeInTheDocument();
        });

        it('does not show compliance notice in standard mode', () => {
            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: '',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: null,
                sessionId: 'test-session',
                sendMessage: vi.fn(),
                clearError: vi.fn()
            });

            render(<ChatbotWidget complianceMode="standard" />);

            expect(screen.queryByText(/conformidade médica e privacidade/i)).not.toBeInTheDocument();
        });
    });

    describe('Responsive Design', () => {
        it('applies responsive classes', () => {
            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: '',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: null,
                sessionId: 'test-session',
                sendMessage: vi.fn(),
                clearError: vi.fn()
            });

            render(<ChatbotWidget />);

            const widget = screen.getByRole('dialog');
            expect(widget).toHaveClass('w-96', 'max-w-[calc(100vw-2rem)]');
        });
    });

    describe('Theme Support', () => {
        it('applies light theme classes', () => {
            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: '',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: null,
                sessionId: 'test-session',
                sendMessage: vi.fn(),
                clearError: vi.fn()
            });

            render(<ChatbotWidget theme="light" />);

            const widget = screen.getByRole('dialog').firstChild;
            expect(widget).toHaveClass('text-gray-900');
        });

        it('applies dark theme classes', () => {
            mockUseChatbotState.mockReturnValue({
                isOpen: true,
                setIsOpen: vi.fn(),
                messages: [],
                inputMessage: '',
                setInputMessage: vi.fn(),
                isLoading: false,
                error: null,
                sessionId: 'test-session',
                sendMessage: vi.fn(),
                clearError: vi.fn()
            });

            render(<ChatbotWidget theme="dark" />);

            const widget = screen.getByRole('dialog').firstChild;
            expect(widget).toHaveClass('text-white');
        });
    });
});