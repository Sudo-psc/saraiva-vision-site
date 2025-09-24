import React, { useState } from 'react';
import { Send, Bot } from 'lucide-react';

/**
 * Simple example of xAI Grok integration using AI SDK
 * Demonstrates streaming text responses
 */
const XAIChatbotExample = () => {
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const sendMessage = async () => {
        if (!message.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResponse('');

        try {
            const res = await fetch('/api/chatbot-stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message.trim(),
                }),
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            // Read streaming response
            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setResponse(prev => prev + chunk);
            }

        } catch (err) {
            console.error('Error:', err);
            setError(err.message);
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

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center space-x-2 mb-6">
                <Bot className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">
                    xAI Grok Chatbot Example
                </h2>
            </div>

            <div className="space-y-4">
                {/* Input */}
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite sua mensagem para o Grok..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!message.trim() || isLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <Send size={16} />
                    </button>
                </div>

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex items-center space-x-2 text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Grok está pensando...</span>
                    </div>
                )}

                {/* Error display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 text-sm">
                            <strong>Erro:</strong> {error}
                        </p>
                    </div>
                )}

                {/* Response display */}
                {response && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                            <Bot className="text-blue-600 mt-1" size={16} />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Resposta do Grok:
                                </p>
                                <div className="text-gray-800 whitespace-pre-wrap">
                                    {response}
                                    {isLoading && (
                                        <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse">|</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                        Como usar:
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Digite uma pergunta ou mensagem</li>
                        <li>• Pressione Enter ou clique no botão enviar</li>
                        <li>• Veja a resposta sendo gerada em tempo real</li>
                        <li>• O Grok está configurado para responder sobre a Clínica Saraiva Vision</li>
                    </ul>
                </div>

                {/* Configuration info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Configuração atual:
                    </h3>
                    <div className="text-xs text-gray-600 space-y-1">
                        <p>• Modelo: {process.env.XAI_MODEL || 'grok-2-1212'}</p>
                        <p>• Max Tokens: {process.env.XAI_MAX_TOKENS || '8192'}</p>
                        <p>• Temperature: {process.env.XAI_TEMPERATURE || '0.1'}</p>
                        <p>• Streaming: Habilitado</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default XAIChatbotExample;