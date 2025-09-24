import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle, Send } from 'lucide-react';

/**
 * Message Status Component
 * 
 * Shows the delivery status of messages in real-time conversations
 * Supports different status states: pending, sent, delivered, read, failed
 */
export const MessageStatus = ({
    status = 'pending',
    timestamp = null,
    showText = false,
    className = ''
}) => {
    const getStatusIcon = () => {
        switch (status) {
            case 'sent':
                return <Check size={12} className="text-gray-400" />;
            case 'delivered':
                return <CheckCheck size={12} className="text-blue-500" />;
            case 'read':
                return <CheckCheck size={12} className="text-green-500" />;
            case 'failed':
                return <AlertCircle size={12} className="text-red-500" />;
            case 'pending':
            default:
                return <Clock size={12} className="text-gray-300 animate-pulse" />;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'sent':
                return 'Enviado';
            case 'delivered':
                return 'Entregue';
            case 'read':
                return 'Lido';
            case 'failed':
                return 'Falhou';
            case 'pending':
            default:
                return 'Enviando...';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'sent':
                return 'text-gray-400';
            case 'delivered':
                return 'text-blue-500';
            case 'read':
                return 'text-green-500';
            case 'failed':
                return 'text-red-500';
            case 'pending':
            default:
                return 'text-gray-300';
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';

        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '';
        }
    };

    return (
        <div className={`flex items-center space-x-1 ${className}`}>
            {getStatusIcon()}

            {showText && (
                <span className={`text-xs ${getStatusColor()}`}>
                    {getStatusText()}
                </span>
            )}

            {timestamp && (
                <span className="text-xs text-gray-400">
                    {formatTimestamp(timestamp)}
                </span>
            )}
        </div>
    );
};

/**
 * Inline Message Status - for use within message bubbles
 */
export const InlineMessageStatus = ({
    status = 'pending',
    timestamp = null,
    className = ''
}) => {
    return (
        <div className={`flex items-center justify-end space-x-1 mt-1 ${className}`}>
            <MessageStatus
                status={status}
                timestamp={timestamp}
                className="opacity-70"
            />
        </div>
    );
};

/**
 * Detailed Message Status - shows more information
 */
export const DetailedMessageStatus = ({
    status = 'pending',
    timestamp = null,
    deliveredAt = null,
    readAt = null,
    className = ''
}) => {
    const getDetailedInfo = () => {
        const info = [];

        if (status === 'sent' || status === 'delivered' || status === 'read') {
            info.push({
                label: 'Enviado',
                time: timestamp,
                icon: <Send size={10} className="text-gray-400" />
            });
        }

        if (status === 'delivered' || status === 'read') {
            info.push({
                label: 'Entregue',
                time: deliveredAt || timestamp,
                icon: <Check size={10} className="text-blue-500" />
            });
        }

        if (status === 'read') {
            info.push({
                label: 'Lido',
                time: readAt || deliveredAt || timestamp,
                icon: <CheckCheck size={10} className="text-green-500" />
            });
        }

        return info;
    };

    const formatDetailedTime = (timestamp) => {
        if (!timestamp) return '';

        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / (1000 * 60));

            if (diffMins < 1) return 'Agora mesmo';
            if (diffMins < 60) return `${diffMins}min atrás`;

            return date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '';
        }
    };

    const detailedInfo = getDetailedInfo();

    if (detailedInfo.length === 0) {
        return (
            <div className={`flex items-center space-x-1 ${className}`}>
                <Clock size={10} className="text-gray-300 animate-pulse" />
                <span className="text-xs text-gray-300">Enviando...</span>
            </div>
        );
    }

    return (
        <div className={`space-y-1 ${className}`}>
            {detailedInfo.map((info, index) => (
                <div key={index} className="flex items-center space-x-2">
                    {info.icon}
                    <span className="text-xs text-gray-500">
                        {info.label}
                    </span>
                    <span className="text-xs text-gray-400">
                        {formatDetailedTime(info.time)}
                    </span>
                </div>
            ))}
        </div>
    );
};

/**
 * Bulk Message Status - for showing status of multiple messages
 */
export const BulkMessageStatus = ({
    messages = [],
    className = ''
}) => {
    const getStatusCounts = () => {
        const counts = {
            pending: 0,
            sent: 0,
            delivered: 0,
            read: 0,
            failed: 0
        };

        messages.forEach(message => {
            const status = message.status || 'pending';
            counts[status] = (counts[status] || 0) + 1;
        });

        return counts;
    };

    const counts = getStatusCounts();
    const total = messages.length;

    if (total === 0) return null;

    return (
        <div className={`flex items-center space-x-3 text-xs ${className}`}>
            {counts.pending > 0 && (
                <div className="flex items-center space-x-1">
                    <Clock size={10} className="text-gray-300" />
                    <span className="text-gray-500">{counts.pending} enviando</span>
                </div>
            )}

            {counts.sent > 0 && (
                <div className="flex items-center space-x-1">
                    <Check size={10} className="text-gray-400" />
                    <span className="text-gray-500">{counts.sent} enviado</span>
                </div>
            )}

            {counts.delivered > 0 && (
                <div className="flex items-center space-x-1">
                    <CheckCheck size={10} className="text-blue-500" />
                    <span className="text-blue-600">{counts.delivered} entregue</span>
                </div>
            )}

            {counts.read > 0 && (
                <div className="flex items-center space-x-1">
                    <CheckCheck size={10} className="text-green-500" />
                    <span className="text-green-600">{counts.read} lido</span>
                </div>
            )}

            {counts.failed > 0 && (
                <div className="flex items-center space-x-1">
                    <AlertCircle size={10} className="text-red-500" />
                    <span className="text-red-600">{counts.failed} falhou</span>
                </div>
            )}
        </div>
    );
};

export default MessageStatus;