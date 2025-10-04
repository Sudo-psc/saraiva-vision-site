'use client';

import React, { useState, useEffect } from 'react';
import { usePulseChat } from '../hooks/usePulseChat';
import { MessageCircle, X, Send } from 'lucide-react';

interface LiveChatWidgetProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left';
  autoOpen?: boolean;
}

/**
 * LiveChat Widget Component for Saraiva Vision
 * Healthcare-compliant chat widget with LGPD considerations
 */
export function LiveChatWidget({
  className = '',
  position = 'bottom-right',
  autoOpen = false
}: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{text: string, sender: 'user' | 'support', timestamp: Date}>>([]);
  const [isTyping, setIsTyping] = useState(false);

  const { isReady, state, sendMessage } = usePulseChat();

  useEffect(() => {
    if (autoOpen && isReady) {
      setIsOpen(true);
    }
  }, [autoOpen, isReady]);

  const handleSendMessage = async () => {
    if (!message.trim() || !isReady) return;

    const userMessage = {
      text: message.trim(),
      sender: 'user' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    // Send message via WebSocket
    const success = sendMessage(JSON.stringify({
      type: 'message',
      text: userMessage.text,
      timestamp: userMessage.timestamp.toISOString()
    }));

    if (!success) {
      // Fallback handling if WebSocket is not available
      setIsTyping(false);
      setMessages(prev => [...prev, {
        text: 'Desculpe, estamos com dificuldades técnicas. Por favor, ligue para (33) 3322-1555.',
        sender: 'support',
        timestamp: new Date()
      }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  if (!isReady && state === 'disconnected') {
    // Don't show the widget if chat is not available
    return null;
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Abrir chat"
        >
          <MessageCircle size={24} />
          {state === 'connecting' && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[500px] flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Chat Saraiva Vision</h3>
              <p className="text-xs opacity-90">
                {state === 'connected' ? 'Online' : 'Conectando...'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 rounded p-1 transition-colors"
              aria-label="Fechar chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                <MessageCircle className="mx-auto mb-2" size={32} />
                <p>Olá! Como posso ajudar você hoje?</p>
                <p className="text-xs mt-2">Horário de atendimento: Seg-Sex, 8h-18h</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                  <p className="text-sm">Digitando...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!isReady || state !== 'connected'}
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || !isReady || state !== 'connected'}
                className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                aria-label="Enviar mensagem"
              >
                <Send size={20} />
              </button>
            </div>

            {/* LGPD Compliance Notice */}
            <p className="text-xs text-gray-500 mt-2">
              Ao usar este chat, você concorda com nossos {' '}
              <a href="/privacy" className="underline hover:text-blue-600">
                termos de privacidade
              </a>
              . Não compartilhe informações médicas sensíveis.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveChatWidget;