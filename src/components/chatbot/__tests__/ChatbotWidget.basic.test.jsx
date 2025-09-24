import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ChatbotWidget from '../ChatbotWidget';

// Mock the hooks
vi.mock('../../../hooks/useChatbotState', () => ({
    useChatbotState: vi.fn(() => ({
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
    }))
}));

vi.mock('../../../hooks/useChatbotAccessibility', () => ({
    useChatbotAccessibility: vi.fn(() => ({
        announceMessage: vi.fn(),
        focusManagement: {
            getFocusProps: () => ({})
        },
        keyboardNavigation: {
            getInputProps: () => ({})
        }
    }))
}));

vi.mock('../../../hooks/useChatbotRealtime', () => ({
    useChatbotRealtime: vi.fn(() => ({
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
    }))
}));

describe('ChatbotWidget Basic Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders floating action button when closed', () => {
        render(<ChatbotWidget />);

        const button = screen.getByRole('button', { name: /abrir assistente virtual/i });
        expect(button).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
        render(<ChatbotWidget />);

        const button = screen.getByRole('button', { name: /abrir assistente virtual/i });
        expect(button).toHaveAttribute('aria-label');
        expect(button).toHaveAttribute('aria-describedby');
    });
});