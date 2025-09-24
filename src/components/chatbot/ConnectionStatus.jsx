import React from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';

/**
 * Connection Status Component
 * 
 * Displays real-time connection status and provides reconnection controls
 */
export const ConnectionStatus = ({
    isConnected,
    isConnecting,
    connectionError,
    reconnectAttempts,
    onReconnect,
    className = ''
}) => {
    const getStatusIcon = () => {
        if (isConnecting) {
            return <RefreshCw size={12} className="animate-spin text-yellow-600" />;
        } else if (isConnected) {
            return <CheckCircle size={12} className="text-green-600" />;
        } else if (connectionError) {
            return <AlertCircle size={12} className="text-red-600" />;
        } else {
            return <WifiOff size={12} className="text-gray-400" />;
        }
    };

    const getStatusText = () => {
        if (isConnecting) {
            return reconnectAttempts > 0 ? `Reconectando... (${reconnectAttempts})` : 'Conectando...';
        } else if (isConnected) {
            return 'Conectado';
        } else if (connectionError) {
            return 'Erro de conexão';
        } else {
            return 'Desconectado';
        }
    };

    const getStatusColor = () => {
        if (isConnecting) {
            return 'text-yellow-600 dark:text-yellow-400';
        } else if (isConnected) {
            return 'text-green-600 dark:text-green-400';
        } else if (connectionError) {
            return 'text-red-600 dark:text-red-400';
        } else {
            return 'text-gray-500 dark:text-gray-400';
        }
    };

    const getBgColor = () => {
        if (isConnecting) {
            return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
        } else if (isConnected) {
            return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
        } else if (connectionError) {
            return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
        } else {
            return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
        }
    };

    return (
        <div className={`flex items-center justify-between px-3 py-2 border-b ${getBgColor()} ${className}`}>
            <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={`text-xs font-medium ${getStatusColor()}`}>
                    {getStatusText()}
                </span>
            </div>

            {/* Reconnect button for error states */}
            {connectionError && !isConnecting && (
                <button
                    onClick={onReconnect}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1"
                    aria-label="Tentar reconectar"
                >
                    Reconectar
                </button>
            )}

            {/* Connection quality indicator */}
            {isConnected && (
                <div className="flex items-center space-x-1" title="Qualidade da conexão">
                    <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-1 h-2 bg-green-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-green-300 rounded-full"></div>
                </div>
            )}
        </div>
    );
};