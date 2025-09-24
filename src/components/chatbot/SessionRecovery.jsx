import React, { useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, X, Clock } from 'lucide-react';

/**
 * Session Recovery Component
 * 
 * Handles conversation persistence and session recovery
 * Shows recovery options when connection is lost
 */
export const SessionRecovery = ({
    sessionData,
    isRecovering = false,
    recoveryError = null,
    onRecover,
    onStartNew,
    onDismiss,
    className = ''
}) => {
    const [showDetails, setShowDetails] = useState(false);

    if (!sessionData && !recoveryError) return null;

    const formatSessionAge = (timestamp) => {
        if (!timestamp) return 'Desconhecido';

        try {
            const sessionTime = new Date(timestamp);
            const now = new Date();
            const diffMs = now - sessionTime;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'Agora mesmo';
            if (diffMins < 60) return `${diffMins} minuto${diffMins > 1 ? 's' : ''} atrás`;
            if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
            return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
        } catch (error) {
            return 'Desconhecido';
        }
    };

    return (
        <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${className}`}>
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    {isRecovering ? (
                        <RefreshCw size={20} className="text-blue-600 dark:text-blue-400 animate-spin" />
                    ) : recoveryError ? (
                        <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                    ) : (
                        <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            {isRecovering ? 'Recuperando Sessão...' :
                                recoveryError ? 'Erro na Recuperação' :
                                    'Sessão Anterior Encontrada'}
                        </h4>

                        <button
                            onClick={onDismiss}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                            aria-label="Fechar"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="text-xs text-blue-800 dark:text-blue-200 space-y-2">
                        {recoveryError ? (
                            <div>
                                <p className="mb-2">Não foi possível recuperar sua sessão anterior:</p>
                                <p className="text-red-700 dark:text-red-300 font-medium">{recoveryError}</p>
                            </div>
                        ) : sessionData ? (
                            <div>
                                <p className="mb-2">
                                    Encontramos uma conversa anterior de {formatSessionAge(sessionData.timestamp)}.
                                    Deseja continuar de onde parou?
                                </p>

                                {sessionData.messageCount && (
                                    <div className="flex items-center space-x-4 text-xs text-blue-700 dark:text-blue-300">
                                        <span className="flex items-center space-x-1">
                                            <Clock size={10} />
                                            <span>{sessionData.messageCount} mensagens</span>
                                        </span>
                                        {sessionData.lastTopic && (
                                            <span>Último tópico: {sessionData.lastTopic}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p>Preparando recuperação da sessão...</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {!isRecovering && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                            >
                                {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
                            </button>

                            <div className="flex space-x-2">
                                <button
                                    onClick={onStartNew}
                                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Nova Conversa
                                </button>

                                {sessionData && !recoveryError && (
                                    <button
                                        onClick={onRecover}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Continuar
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Session Details */}
                    {showDetails && sessionData && (
                        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="font-medium">ID da Sessão:</span>
                                        <br />
                                        <span className="font-mono text-xs">{sessionData.sessionId?.slice(-8) || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Última Atividade:</span>
                                        <br />
                                        <span>{formatSessionAge(sessionData.timestamp)}</span>
                                    </div>
                                </div>

                                {sessionData.userAgent && (
                                    <div>
                                        <span className="font-medium">Dispositivo:</span>
                                        <br />
                                        <span className="text-xs">
                                            {sessionData.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
                                        </span>
                                    </div>
                                )}

                                {sessionData.conversationSummary && (
                                    <div>
                                        <span className="font-medium">Resumo:</span>
                                        <br />
                                        <span>{sessionData.conversationSummary}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Session Recovery Banner - Compact version for header
 */
export const SessionRecoveryBanner = ({
    sessionData,
    onRecover,
    onDismiss,
    className = ''
}) => {
    if (!sessionData) return null;

    return (
        <div className={`bg-blue-100 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800 px-4 py-2 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <CheckCircle size={14} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-800 dark:text-blue-200">
                        Sessão anterior disponível
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={onRecover}
                        className="text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-medium transition-colors"
                    >
                        Recuperar
                    </button>
                    <button
                        onClick={onDismiss}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                        aria-label="Dispensar"
                    >
                        <X size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionRecovery;