import React from 'react';
import { Bot } from 'lucide-react';

/**
 * Typing Indicator Component
 * 
 * Shows animated dots when the chatbot is processing a response
 * Includes accessibility support for screen readers
 */
export const TypingIndicator = () => {
    return (
        <div className="flex justify-start" role="status" aria-label="O assistente está digitando">
            <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-gray-600 dark:text-gray-300" />
                </div>

                {/* Typing Animation */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center space-x-1" aria-hidden="true">
                        <div
                            className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                        ></div>
                        <div
                            className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                        ></div>
                        <div
                            className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                        ></div>
                    </div>

                    {/* Screen reader text */}
                    <span className="sr-only">O assistente está processando sua mensagem</span>
                </div>
            </div>
        </div>
    );
};