import React from 'react';
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';

/**
 * Chatbot Error Boundary Component
 * 
 * Catches and handles errors in the chatbot widget
 * Provides fallback UI and recovery options
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('Chatbot Error:', error, errorInfo);

        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Track error in analytics
        if (window.gtag) {
            window.gtag('event', 'chatbot_error', {
                event_category: 'error',
                event_label: error.message,
                value: this.state.retryCount
            });
        }

        // Report to error monitoring service if available
        if (window.Sentry) {
            window.Sentry.captureException(error, {
                contexts: {
                    react: {
                        componentStack: errorInfo.componentStack
                    }
                },
                tags: {
                    component: 'chatbot',
                    retry_count: this.state.retryCount
                }
            });
        }
    }

    handleRetry = () => {
        this.setState(prevState => ({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: prevState.retryCount + 1
        }));
    };

    handleContactSupport = () => {
        // Track support contact
        if (window.gtag) {
            window.gtag('event', 'chatbot_error_support_contact', {
                event_category: 'support',
                event_label: 'error_fallback'
            });
        }

        window.open('https://wa.me/5533998601427?text=Olá! Estou enfrentando problemas com o assistente virtual do site.', '_blank');
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-red-200 dark:border-red-800 overflow-hidden">
                    {/* Header */}
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 border-b border-red-200 dark:border-red-800">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-red-900 dark:text-red-100">
                                    Erro no Assistente Virtual
                                </h3>
                                <p className="text-xs text-red-700 dark:text-red-300">
                                    Algo deu errado, mas estamos aqui para ajudar
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            <p className="mb-2">
                                Desculpe, ocorreu um erro inesperado no assistente virtual.
                                Você pode tentar novamente ou entrar em contato conosco diretamente.
                            </p>

                            {this.state.retryCount > 0 && (
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Tentativas de recuperação: {this.state.retryCount}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                            <button
                                onClick={this.handleRetry}
                                className="flex-1 inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={this.state.retryCount >= 3}
                            >
                                <RefreshCw size={14} />
                                <span>
                                    {this.state.retryCount >= 3 ? 'Limite Atingido' : 'Tentar Novamente'}
                                </span>
                            </button>

                            <button
                                onClick={this.handleContactSupport}
                                className="flex-1 inline-flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <MessageSquare size={14} />
                                <span>WhatsApp</span>
                            </button>
                        </div>

                        {/* Alternative Contact Info */}
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                Ou ligue diretamente:
                                <a
                                    href="tel:+5533998601427"
                                    className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
                                >
                                    (33) 99860-1427
                                </a>
                            </p>
                        </div>

                        {/* Debug Info (only in development) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <summary className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                    Detalhes do Erro (Desenvolvimento)
                                </summary>
                                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-mono">
                                    <p><strong>Erro:</strong> {this.state.error.toString()}</p>
                                    {this.state.errorInfo && (
                                        <pre className="mt-2 whitespace-pre-wrap text-xs">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}