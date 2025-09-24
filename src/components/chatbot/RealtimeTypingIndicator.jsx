import React from 'react';
import { Bot } from 'lucide-react';

/**
 * Real-time Typing Indicator Component
 * 
 * Shows when the assistant or other users are typing
 * Includes smooth animations and accessibility support
 */
export const RealtimeTypingIndicator = ({
    isVisible = false,
    userName = 'Assistente',
    className = ''
}) => {
    if (!isVisible) return null;

    return (
        <div
            className={`flex justify-start animate-fade-in ${className}`}
            role="status"
            aria-label={`${userName} está digitando`}
        >
            <div className="flex items-start space-x-3 max-w-[85%]">
                {/* Avatar */}
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-gray-600 dark:text-gray-300" />
                </div>

                {/* Typing Animation Container */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                        {/* Typing dots */}
                        <div className="flex items-center space-x-1" aria-hidden="true">
                            <div
                                className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
                            ></div>
                            <div
                                className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '160ms', animationDuration: '1.4s' }}
                            ></div>
                            <div
                                className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '320ms', animationDuration: '1.4s' }}
                            ></div>
                        </div>

                        {/* Typing text */}
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {userName} está digitando...
                        </span>
                    </div>

                    {/* Screen reader text */}
                    <span className="sr-only">
                        {userName} está digitando uma resposta
                    </span>
                </div>
            </div>
        </div>
    );
};

/**
 * Enhanced Typing Indicator with pulse effect
 */
export const PulseTypingIndicator = ({
    isVisible = false,
    userName = 'Assistente',
    className = ''
}) => {
    if (!isVisible) return null;

    return (
        <div
            className={`flex justify-start animate-slide-up ${className}`}
            role="status"
            aria-label={`${userName} está digitando`}
        >
            <div className="flex items-start space-x-3 max-w-[85%]">
                {/* Avatar with pulse */}
                <div className="relative">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot size={14} className="text-gray-600 dark:text-gray-300" />
                    </div>

                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
                </div>

                {/* Enhanced typing animation */}
                <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                        {/* Wave animation */}
                        <div className="flex items-center space-x-1" aria-hidden="true">
                            {[0, 1, 2].map((index) => (
                                <div
                                    key={index}
                                    className="w-1.5 h-1.5 bg-gradient-to-t from-blue-500 to-blue-400 rounded-full"
                                    style={{
                                        animation: `wave 1.4s ease-in-out infinite`,
                                        animationDelay: `${index * 0.16}s`
                                    }}
                                ></div>
                            ))}
                        </div>

                        {/* Typing text with fade animation */}
                        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium animate-pulse">
                            {userName} está digitando...
                        </span>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes wave {
          0%, 60%, 100% {
            transform: initial;
          }
          30% {
            transform: translateY(-8px);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

/**
 * Minimal Typing Indicator for compact spaces
 */
export const MinimalTypingIndicator = ({
    isVisible = false,
    className = ''
}) => {
    if (!isVisible) return null;

    return (
        <div
            className={`flex items-center space-x-2 px-3 py-1 ${className}`}
            role="status"
            aria-label="Assistente está digitando"
        >
            <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '160ms' }}></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '320ms' }}></div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
                Digitando...
            </span>
        </div>
    );
};

export default RealtimeTypingIndicator;