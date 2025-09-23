import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler from '../chatbot.js';

// Mock Supabase
const mockSupabase = {
    from: vi.fn(() => ({
        insert: vi.fn(() => Promise.resolve({ error: null }))
    }))
};

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockSupabase)
}));

// Mock OpenAI API
global.fetch = vi.fn();

// Mock crypto for Node.js environment
global.crypto = {
    createHash: vi.fn(() => ({
        update: vi.fn(() => ({
            digest: vi.fn(() => 'mocked_hash_value')
        }))
    }))
};

// Mock require for crypto in the handler
vi.mock('crypto', () => ({
    createHash: vi.fn(() => ({
        update: vi.fn(() => ({
            digest: vi.fn(() => 'mocked_hash_value')
        }))
    }))
}));

describe('/api/chatbot', () => {
    let req, res;

    beforeEach(() => {
        req = {
            method: 'POST',
            body: {},
            headers: {},
            connection: { remoteAddress: '127.0.0.1' }
        };

        res = {
            status: vi.fn(() => res),
            json: vi.fn(() => res),
            setHeader: vi.fn(() => res),
            end: vi.fn(() => res)
        };

        // Mock environment variables
        process.env.OPENAI_API_KEY = 'test-openai-key';
        process.env.SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

        fetch.mockClear();
        mockSupabase.from.mockClear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('handles OPTIONS request correctly', async () => {
        req.method = 'OPTIONS';

        await handler(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
        expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'POST, OPTIONS');
        expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.end).toHaveBeenCalled();
    });

    it('rejects non-POST requests', async () => {
        req.method = 'GET';

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(405);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: 'Method not allowed'
        });
    });

    it('validates required message field', async () => {
        req.body = {};

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: 'Message is required and must be a non-empty string'
        });
    });

    it('validates message length', async () => {
        req.body = {
            message: 'a'.repeat(1001)
        };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: 'Message too long. Maximum 1000 characters allowed.'
        });
    });

    it('processes valid message successfully', async () => {
        const mockOpenAIResponse = {
            choices: [{
                message: {
                    content: 'Olá! Como posso ajudá-lo hoje?'
                }
            }],
            usage: {
                total_tokens: 50
            }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockOpenAIResponse
        });

        req.body = {
            message: 'Olá, preciso de ajuda',
            sessionId: null,
            conversationHistory: []
        };

        await handler(req, res);

        expect(fetch).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer test-openai-key',
                'Content-Type': 'application/json',
            },
            body: expect.stringContaining('"model":"gpt-3.5-turbo"')
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: {
                response: expect.stringContaining('Olá! Como posso ajudá-lo hoje?'),
                sessionId: expect.any(String),
                suggestsBooking: false,
                timestamp: expect.any(String),
                isEmergency: false,
                containsMedicalKeywords: false
            }
        });
    });

    it('detects emergency messages', async () => {
        const mockOpenAIResponse = {
            choices: [{
                message: {
                    content: 'Procure atendimento médico imediato!'
                }
            }],
            usage: { total_tokens: 30 }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockOpenAIResponse
        });

        req.body = {
            message: 'Socorro! Perdi a visão de repente!',
            sessionId: null,
            conversationHistory: []
        };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: expect.objectContaining({
                isEmergency: true,
                response: expect.stringContaining('ATENÇÃO')
            })
        });
    });

    it('detects medical keywords', async () => {
        const mockOpenAIResponse = {
            choices: [{
                message: {
                    content: 'Recomendo agendar uma consulta para avaliação.'
                }
            }],
            usage: { total_tokens: 40 }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockOpenAIResponse
        });

        req.body = {
            message: 'Meu olho está doendo muito',
            sessionId: null,
            conversationHistory: []
        };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: expect.objectContaining({
                containsMedicalKeywords: true,
                response: expect.stringContaining('IMPORTANTE')
            })
        });
    });

    it('detects booking suggestions', async () => {
        const mockOpenAIResponse = {
            choices: [{
                message: {
                    content: 'Gostaria de agendar uma consulta?'
                }
            }],
            usage: { total_tokens: 35 }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockOpenAIResponse
        });

        req.body = {
            message: 'Quero marcar uma consulta',
            sessionId: null,
            conversationHistory: []
        };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: expect.objectContaining({
                suggestsBooking: true
            })
        });
    });

    it('handles OpenAI API errors', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 500
        });

        req.body = {
            message: 'Test message',
            sessionId: null,
            conversationHistory: []
        };

        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: 'Desculpe, ocorreu um erro interno. Tente novamente em alguns instantes ou entre em contato conosco diretamente.',
            fallback: expect.objectContaining({
                message: expect.stringContaining('telefone'),
                contactInfo: expect.objectContaining({
                    phone: '(33) 99860-1427',
                    whatsapp: 'https://wa.me/5533998601427'
                })
            })
        });
    });

    it('logs conversations to database', async () => {
        const mockOpenAIResponse = {
            choices: [{
                message: {
                    content: 'Resposta do bot'
                }
            }],
            usage: { total_tokens: 25 }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockOpenAIResponse
        });

        req.body = {
            message: 'Mensagem de teste',
            sessionId: 'test-session',
            conversationHistory: []
        };

        await handler(req, res);

        expect(mockSupabase.from).toHaveBeenCalledWith('event_log');
        expect(mockSupabase.from().insert).toHaveBeenCalledWith({
            event_type: 'chatbot_interaction',
            event_data: expect.objectContaining({
                session_id: 'test-session',
                user_message_length: 17,
                bot_response_length: expect.any(Number),
                contains_medical_keywords: false,
                is_emergency: false,
                model_used: 'gpt-3.5-turbo',
                tokens_used: 25
            }),
            severity: 'info',
            source: 'chatbot_api'
        });
    });

    it('maintains conversation context', async () => {
        const mockOpenAIResponse = {
            choices: [{
                message: {
                    content: 'Baseado na nossa conversa anterior...'
                }
            }],
            usage: { total_tokens: 60 }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockOpenAIResponse
        });

        req.body = {
            message: 'Continue nossa conversa',
            sessionId: 'existing-session',
            conversationHistory: [
                { role: 'user', content: 'Primeira mensagem' },
                { role: 'assistant', content: 'Primeira resposta' }
            ]
        };

        await handler(req, res);

        const openAICall = fetch.mock.calls[0];
        const requestBody = JSON.parse(openAICall[1].body);

        expect(requestBody.messages).toHaveLength(4); // system + 2 history + current
        expect(requestBody.messages[1]).toEqual({
            role: 'user',
            content: 'Primeira mensagem'
        });
        expect(requestBody.messages[2]).toEqual({
            role: 'assistant',
            content: 'Primeira resposta'
        });
    });

    it('limits conversation history to 10 messages', async () => {
        const mockOpenAIResponse = {
            choices: [{
                message: {
                    content: 'Resposta com histórico limitado'
                }
            }],
            usage: { total_tokens: 45 }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockOpenAIResponse
        });

        // Create 15 messages in history
        const longHistory = [];
        for (let i = 0; i < 15; i++) {
            longHistory.push(
                { role: 'user', content: `Mensagem ${i}` },
                { role: 'assistant', content: `Resposta ${i}` }
            );
        }

        req.body = {
            message: 'Nova mensagem',
            sessionId: 'test-session',
            conversationHistory: longHistory
        };

        await handler(req, res);

        const openAICall = fetch.mock.calls[0];
        const requestBody = JSON.parse(openAICall[1].body);

        // Should have system prompt + last 10 messages + current message = 12 total
        expect(requestBody.messages).toHaveLength(12);
    });

    it('generates session ID when not provided', async () => {
        const mockOpenAIResponse = {
            choices: [{
                message: {
                    content: 'Nova sessão criada'
                }
            }],
            usage: { total_tokens: 20 }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockOpenAIResponse
        });

        req.body = {
            message: 'Primeira mensagem sem sessão',
            conversationHistory: []
        };

        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: expect.objectContaining({
                sessionId: expect.stringMatching(/^session_/)
            })
        });
    });
});