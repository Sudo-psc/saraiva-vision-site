/**
 * xAI Chatbot Demo Component
 * Demonstrates the new xAI-powered chatbot functionality
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, MessageCircle } from 'lucide-react';

const XAIChatbotDemo = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: 'Olá! Sou o assistente virtual da Clínica Saraiva Vision, agora com inteligência artificial avançada. Como posso ajudá-lo hoje?',
            timestamp: new Date(),
            aiPowered: true
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [useStreaming, setUseStreaming] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            if (useStreaming) {
                await handleStreamingResponse(inputMessage);
            } else {
                await handleJSONResponse(inputMessage);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: 'Desculpe, ocorreu um erro. Tente novamente ou entre em contato pelo telefone (33) 99860-1427.',
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJSONResponse = async (message) => {
        const response = await fetch('/api/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                sessionId: sessionId
            })
        });

        const data = await response.json();

        if (data.success) {
            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: data.data.response,
                timestamp: new Date(),
                aiPowered: data.data.aiPowered,
                model: data.data.model,
                suggestsBooking: data.data.suggestsBooking,
                tokensUsed: data.data.tokensUsed
            };

            setMessages(prev => [...prev, botMessage]);
            setSessionId(data.data.sessionId);
        } else {
            throw new Error(data.message || 'API Error');
        }
    };

    const handleStreamingResponse = async (message) => {
        const response = await fetch('/api/chatbot/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                sessionId: sessionId
            })
        });

        if (!response.ok) {
            throw new Error('Streaming failed');
        }

        // Create initial bot message
        const botMessageId = Date.now() + 1;
        const botMessage = {
            id: botMessageId,
            type: 'bot',
            content: '',
            timestamp: new Date(),
            aiPowered: true,
            isStreaming: true
        };

        setMessages(prev => [...prev, botMessage]);

        // Read streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);

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
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const quickActions = [
        "Quero agendar uma consulta",
        "Quais serviços vocês oferecem?",
        "Onde fica a clínica?",
        "Qual o horário de funcionamento?"
    ];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Bot className="w-6 h-6" />
                            <div>
                                <h2 className="text-lg font-semibold">Assistente Virtual - Clínica Saraiva Vision</h2>
                                <p className="text-blue-100 text-sm">Powered by xAI (Grok)</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={useStreaming}
                                    onChange={(e) => setUseStreaming(e.target.checked)}
                                    className="rounded"
                                />
                                <span>Streaming</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.type === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : message.isError
                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                <div className="flex items-start space-x-2">
                                    {message.type === 'bot' && (
                                        <div className="flex-shrink-0 mt-1">
                                            {message.aiPowered ? (
                                                <Zap className="w-4 h-4 text-yellow-500" />
                                            ) : (
                                                <Bot className="w-4 h-4 text-gray-500" />
                                            )}
                                        </div>
                                    )}
                                    {message.type === 'user' && (
                                        <User className="w-4 h-4 mt-1 flex-shrink-0" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm whitespace-pre-wrap">
                                            {message.content}
                                            {message.isStreaming && (
                                                <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse" />
                                            )}
                                        </p>
                                        {message.type === 'bot' && (
                                            <div className="mt-1 text-xs opacity-70">
                                                {message.aiPowered && (
                                                    <span className="mr-2">🤖 AI: {message.model}</span>
                                                )}
                                                {message.tokensUsed && (
                                                    <span className="mr-2">🎯 {message.tokensUsed} tokens</span>
                                                )}
                                                {message.suggestsBooking && (
                                                    <span className="text-green-600">📅 Agendamento sugerido</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg px-4 py-2">
                                <div className="flex items-center space-x-2">
                                    <Bot className="w-4 h-4 text-gray-500" />
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-2 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => setInputMessage(action)}
                                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                disabled={isLoading}
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Digite sua mensagem..."
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows="2"
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Panel */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Sobre o Novo Chatbot
                </h3>
                <div className="text-blue-700 text-sm space-y-2">
                    <p>• <strong>Inteligência Artificial:</strong> Powered by xAI (Grok) para respostas mais inteligentes</p>
                    <p>• <strong>Fallback Inteligente:</strong> Sistema de backup para garantir disponibilidade</p>
                    <p>• <strong>Streaming:</strong> Respostas em tempo real para melhor experiência</p>
                    <p>• <strong>Contexto Médico:</strong> Treinado especificamente para oftalmologia</p>
                    <p>• <strong>Segurança:</strong> Não fornece diagnósticos, apenas informações e orientações</p>
                </div>
            </div>
        </div>
    );
};

export default XAIChatbotDemo;