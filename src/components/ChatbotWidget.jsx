import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, ExternalLink, Phone } from 'lucide-react';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [error, setError] = useState(null);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Initialize chat with welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: 'Olá! Sou o assistente virtual da Clínica Saraiva Vision. Como posso ajudá-lo hoje? Posso responder dúvidas sobre nossos serviços, procedimentos oftalmológicos ou ajudar com agendamentos.',
                timestamp: new Date().toISOString()
            }]);
        }
    }, [isOpen, messages.length]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputMessage.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    sessionId: sessionId,
                    conversationHistory: messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Expected JSON response, got: ${text.substring(0, 100)}`);
            }

            const data = await response.json();

            // Validate response structure
            if (!data || typeof data !== 'object') {
                throw new Error('Resposta inválida do servidor');
            }

            if (!data.success) {
                const errorMessage = data.error?.message || data.error || 'Erro na comunicação com o servidor';
                throw new Error(errorMessage);
            }

            // Validate required response data
            if (!data.data || !data.data.response) {
                throw new Error('Resposta incompleta do servidor');
            }

            // Update session ID if provided
            if (data.data.sessionId && !sessionId) {
                setSessionId(data.data.sessionId);
            }

            const botMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.data.response,
                timestamp: data.data.timestamp,
                suggestsBooking: data.data.suggestsBooking
            };

            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error('Chatbot error:', error);
            setError(error.message);

            // Add error message to chat
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Desculpe, ocorreu um erro. Tente novamente ou entre em contato conosco diretamente pelo telefone (33) 99860-1427.',
                timestamp: new Date().toISOString(),
                isError: true
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleBookingRedirect = () => {
        // This would redirect to the appointment booking system
        window.location.href = '/agendamento';
    };

    const handleContactRedirect = () => {
        window.open('https://wa.me/5533998601427', '_blank');
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
                    aria-label="Abrir chat de atendimento - Assistente virtual Saraiva Vision"
                >
                    <MessageCircle size={24} />
                </button>
            </div>
        );
    }

    return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col text-black">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Bot size={18} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-white">Assistente Saraiva Vision</h3>
                        <p className="text-xs text-blue-100">Online agora</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-blue-100 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
                    aria-label="Fechar chat - Assistente virtual Saraiva Vision"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : message.isError
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-300 text-gray-600'
                                }`}>
                                {message.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                            </div>
                            <div className={`rounded-lg p-3 ${message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : message.isError
                                    ? 'bg-red-100 text-red-900 border border-red-200'
                                    : 'bg-white text-black border border-gray-200'
                                }`}>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                {message.suggestsBooking && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <button
                                            onClick={handleBookingRedirect}
                                            className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                            aria-label="Agendar consulta - Abrir página de agendamento"
                                        >
                                            <ExternalLink size={12} />
                                            <span>Agendar consulta</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex items-start space-x-2">
                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                <Bot size={12} />
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex space-x-1" aria-label="Digitando">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Error display */}
            {error && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-200">
                    <p className="text-xs text-red-600">{error}</p>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex space-x-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                        maxLength={1000}
                        aria-label="Campo de mensagem"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Enviar mensagem para o assistente virtual"
                    >
                        <Send size={16} />
                    </button>
                </div>

                {/* Quick actions */}
                <div className="mt-2 flex space-x-2">
                    <button
                        onClick={handleContactRedirect}
                        className="inline-flex items-center space-x-1 text-xs text-gray-800 hover:text-black bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                        aria-label="Abrir WhatsApp - Conversa direta com a clínica"
                    >
                        <Phone size={10} />
                        <span>WhatsApp</span>
                    </button>
                    <button
                        onClick={handleBookingRedirect}
                        className="inline-flex items-center space-x-1 text-xs text-blue-800 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                        aria-label="Agendar consulta - Abrir página de agendamento"
                    >
                        <ExternalLink size={10} />
                        <span>Agendar</span>
                    </button>
                </div>

                <p className="text-xs text-gray-800 mt-2">
                    Pressione Enter para enviar • Máximo 1000 caracteres
                </p>
            </div>
        </div>
    );
};

export default ChatbotWidget;