import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ChatbotWidget from '../components/ChatbotWidget';

// Mock fetch
global.fetch = vi.fn();

// Mock scrollIntoView for JSDOM
Element.prototype.scrollIntoView = vi.fn();

describe('ChatbotWidget', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders chat button when closed', () => {
        render(<ChatbotWidget />);

        const chatButton = screen.getByRole('button', { name: /abrir chat de atendimento/i });
        expect(chatButton).toBeInTheDocument();
    });

    it('opens chat interface when button is clicked', () => {
        render(<ChatbotWidget />);

        const chatButton = screen.getByRole('button', { name: /abrir chat de atendimento/i });
        fireEvent.click(chatButton);

        expect(screen.getByText('Assistente Saraiva Vision')).toBeInTheDocument();
        expect(screen.getByText('Online agora')).toBeInTheDocument();
    });

    it('displays welcome message when chat opens', () => {
        render(<ChatbotWidget />);

        const chatButton = screen.getByRole('button', { name: /abrir chat de atendimento/i });
        fireEvent.click(chatButton);

        expect(screen.getByText(/Olá! Sou o assistente virtual da Clínica Saraiva Vision/)).toBeInTheDocument();
    });

    it('sends message when send button is clicked', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                data: {
                    response: 'Obrigado pela sua mensagem!',
                    sessionId: 'test-session',
                    suggestsBooking: false,
                    timestamp: new Date().toISOString()
                }
            })
        });

        render(<ChatbotWidget />);

        // Open chat
        const chatButton = screen.getByRole('button', { name: /abrir chat de atendimento/i });
        fireEvent.click(chatButton);

        // Type message
        const input = screen.getByPlaceholderText('Digite sua mensagem...');
        fireEvent.change(input, { target: { value: 'Olá, preciso de ajuda' } });

        // Send message
        const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Olá, preciso de ajuda',
                    sessionId: null,
                    conversationHistory: expect.any(Array)
                })
            });
        });

        await waitFor(() => {
            expect(screen.getByText('Obrigado pela sua mensagem!')).toBeInTheDocument();
        });
    });

    it('sends message when Enter key is pressed', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                data: {
                    response: 'Resposta do bot',
                    sessionId: 'test-session',
                    suggestsBooking: false,
                    timestamp: new Date().toISOString()
                }
            })
        });

        render(<ChatbotWidget />);

        // Open chat
        const chatButton = screen.getByRole('button', { name: /abrir chat de atendimento/i });
        fireEvent.click(chatButton);

        // Type message and press Enter
        const input = screen.getByPlaceholderText('Digite sua mensagem...');
        fireEvent.change(input, { target: { value: 'Teste Enter' } });
        fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

        await waitFor(() => {
            expect(fetch).toHaveBeenCalled();
        });
    });

    it('displays loading state while sending message', async () => {
        // Mock a delayed response
        fetch.mockImplementationOnce(() =>
            new Promise(resolve =>
                setTimeout(() => resolve({
                    ok: true,
                    json: async () => ({
                        success: true,
                        data: {
                            response: 'Resposta após delay',
                            sessionId: 'test-session',
                            suggestsBooking: false,
                            timestamp: new Date().toISOString()
                        }
                    })
                }), 100)
            )
        );

        render(<ChatbotWidget />);

        // Open chat
        const chatButton = screen.getByRole('button', { name: /abrir chat de atendimento/i });
        fireEvent.click(chatButton);

        // Send message
        const input = screen.getByPlaceholderText('Digite sua mensagem...');
        fireEvent.change(input, { target: { value: 'Teste loading' } });

        const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
        fireEvent.click(sendButton);

        // Check loading state
        expect(sendButton).toBeDisabled();

        await waitFor(() => {
            expect(screen.getByText('Resposta após delay')).toBeInTheDocument();
        });
    });

    it('handles API errors gracefully', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        render(<ChatbotWidget />);

        // Open chat
        const chatButton = screen.getByRole('button', { name: /abrir chat de atendimento/i });
        fireEvent.click(chatButton);

        // Send message
        const input = screen.getByPlaceholderText('Digite sua mensagem...');
        fireEvent.change(input, { target: { value: 'Teste erro' } });

        const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(screen.getByText(/Desculpe, ocorreu um erro/)).toBeInTheDocument();
        });
    });

    it('shows booking suggestion when bot suggests appointment', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                data: {
                    response: 'Gostaria de agendar uma consulta?',
                    sessionId: 'test-session',
                    suggestsBooking: true,
                    timestamp: new Date().toISOString()
                }
            })
        });

        render(<ChatbotWidget />);

        // Open chat
        const chatButton = screen.getByRole('button', { name: /abrir chat de atendimento/i });
        fireEvent.click(chatButton);

        // Send message
        const input = screen.getByPlaceholderText('Digite sua mensagem...');
        fireEvent.change(input, { target: { value: 'Quero agendar' } });

        const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(screen.getByText('Agendar consulta')).toBeInTheDocument();
        });
    });

    it('prevents sending empty messages', () => {
        render(<ChatbotWidget />);

        // Open chat
        const chatButton = screen.getByRole('button', { name: /abrir chat de atendimento/i });
        fireEvent.click(chatButton);

        // Try to send empty message
        const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });
        expect(sendButton).toBeDisabled();

        // Try to send whitespace only
        const input = screen.getByPlaceholderText('Digite sua mensagem...');
        fireEvent.change(input, { target: { value: '   ' } });
        expect(sendButton).toBeDisabled();
    });

    it('closes chat when close button is clicked', () => {
        render(<ChatbotWidget />);

        // Open chat
        const chatButton = screen.getByRole('button', { name: /abrir chat de atendimento/i });
        fireEvent.click(chatButton);

        // Close chat
        const closeButton = screen.getByRole('button', { name: /fechar chat/i });
        fireEvent.click(closeButton);

        // Should show chat button again
        expect(screen.getByRole('button', { name: /abrir chat de atendimento/i })).toBeInTheDocument();
        expect(screen.queryByText('Assistente Saraiva Vision')).not.toBeInTheDocument();
    });

    it('maintains conversation history', async () => {
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        response: 'Primeira resposta',
                        sessionId: 'test-session',
                        suggestsBooking: false,
                        timestamp: new Date().toISOString()
                    }
                })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        response: 'Segunda resposta',
                        sessionId: 'test-session',
                        suggestsBooking: false,
                        timestamp: new Date().toISOString()
                    }
                })
            });

        render(<ChatbotWidget />);

        // Open chat
        const chatButton = screen.getByRole('button', { name: /abrir chat de atendimento/i });
        fireEvent.click(chatButton);

        const input = screen.getByPlaceholderText('Digite sua mensagem...');
        const sendButton = screen.getByRole('button', { name: /enviar mensagem/i });

        // Send first message
        fireEvent.change(input, { target: { value: 'Primeira mensagem' } });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(screen.getByText('Primeira resposta')).toBeInTheDocument();
        });

        // Send second message
        fireEvent.change(input, { target: { value: 'Segunda mensagem' } });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(2);
        });

        // Check that conversation history is passed
        const secondCall = fetch.mock.calls[1];
        const requestBody = JSON.parse(secondCall[1].body);
        expect(requestBody.conversationHistory).toHaveLength(3); // Welcome + user message + first response
    });

    it('respects character limit', () => {
        render(<ChatbotWidget />);

        // Open chat
        const chatButton = screen.getByRole('button', { name: /abrir chat de atendimento/i });
        fireEvent.click(chatButton);

        const input = screen.getByPlaceholderText('Digite sua mensagem...');

        // Try to input more than 1000 characters
        const longMessage = 'a'.repeat(1001);
        fireEvent.change(input, { target: { value: longMessage } });

        // The maxLength attribute should prevent input beyond 1000 characters
        expect(input.getAttribute('maxlength')).toBe('1000');
    });
});