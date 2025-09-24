import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, ExternalLink, Phone } from 'lucide-react';

const ChatbotWidgetStream = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
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

        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch('/api/chatbot-stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Create a placeholder message for streaming
            const botMessageId = (Date.now() + 1).toString();
            const botMessage = {
                id: botMessageId,
                role: 'assistant',
                content: '',
                timestamp: new Date().toISOString(),
                isStreaming: true
            };

            setMessages(prev => [...prev, botMessage]);

            // Read the streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                
                // Update the bot message with new content
                setMessages(prev => prev.map(msg => 
                    msg.id === botMessageId 
                        ? { ...msg, content: msg.content + chunk }
                        : msg
                ));
            }

            // Mark streaming as complete
            setMessages(prev => prev.map(msg => 
                msg.id === botMessageId 
                    ? { ...msg, isStreaming: false }
                    : msg
            ));

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request was aborted');
                return;
            }

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
            abortControllerRef.current = null;
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleContactRedirect = () => {
        window.open('https://wa.me/5533998601427', '_blank');
    };

    const handleBookingRedirect = () => {
        window.location.href = '/agendamento';
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

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
                    aria-label="Fechar chat"
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
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                message.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : message.isError
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-300 text-gray-600'
                            }`}>
                                {message.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                            </div>
                            <div className={`rounded-lg p-3 ${
                                message.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : message.isError
                                        ? 'bg-red-100 text-red-900 border border-red-200'
                                        : 'bg-white text-black border border-gray-200'
                            }`}>
                                <p className="text-sm whitespace-pre-wrap">
                                    {message.content}
                                    {message.isStreaming && (
                                        <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse">|</span>
                                    )}
                                </p>
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
                        aria-label="Enviar mensagem"
                    >
                        <Send size={16} />
                    </button>
                </div>

                {/* Quick actions */}
                <div className="mt-2 flex space-x-2">
                    <button
                        onClick={handleContactRedirect}
                        className="inline-flex items-center space-x-1 text-xs text-gray-800 hover:text-black bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                        aria-label="Abrir WhatsApp"
                    >
                        <Phone size={10} />
                        <span>WhatsApp</span>
                    </button>
                    <button
                        onClick={handleBookingRedirect}
                        className="inline-flex items-center space-x-1 text-xs text-blue-800 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                        aria-label="Agendar consulta"
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

export default ChatbotWidgetStream;