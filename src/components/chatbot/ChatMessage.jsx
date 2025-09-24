import React from 'react';
import { User, Bot, ExternalLink, Calendar, AlertTriangle, Shield, Clock } from 'lucide-react';
import { InlineMessageStatus } from './MessageStatus';

/**
 * Individual Chat Message Component
 * 
 * Features:
 * - Accessible message display
 * - Medical compliance indicators
 * - Action buttons for appointments/referrals
 * - Responsive design
 */
export const ChatMessage = ({
    message,
    isLast,
    enableAppointmentBooking,
    enableReferralRequests,
    messageStatus,
    enableRealtime = false
}) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const isError = message.isError || message.type === 'error';
    const isEmergency = message.metadata?.isEmergency;
    const containsMedicalContent = message.metadata?.containsMedicalContent;
    const requiresDisclaimer = message.metadata?.requiresDisclaimer;
    const suggestsAppointment = message.metadata?.suggestsAppointment || message.suggestsBooking;

    const handleAppointmentClick = () => {
        // Track interaction for analytics
        if (window.gtag) {
            window.gtag('event', 'chatbot_appointment_click', {
                event_category: 'chatbot',
                event_label: 'appointment_booking'
            });
        }

        // Redirect to appointment booking
        window.location.href = '/agendamento';
    };

    const handleReferralClick = () => {
        // Track interaction for analytics
        if (window.gtag) {
            window.gtag('event', 'chatbot_referral_click', {
                event_category: 'chatbot',
                event_label: 'referral_request'
            });
        }

        // Open referral form or redirect
        window.open('/referencia', '_blank');
    };

    const handleEmergencyClick = () => {
        // Track emergency interaction
        if (window.gtag) {
            window.gtag('event', 'chatbot_emergency_click', {
                event_category: 'chatbot',
                event_label: 'emergency_contact'
            });
        }

        // Open emergency contact
        window.open('tel:+5533998601427', '_self');
    };

    const getMessageClasses = () => {
        if (isUser) {
            return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white';
        } else if (isError) {
            return 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800';
        } else if (isEmergency) {
            return 'bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100 border border-orange-200 dark:border-orange-800';
        } else if (isSystem) {
            return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
        } else {
            return 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-sm';
        }
    };

    const getAvatarClasses = () => {
        if (isUser) {
            return 'bg-blue-600 text-white';
        } else if (isError) {
            return 'bg-red-500 text-white';
        } else if (isEmergency) {
            return 'bg-orange-500 text-white';
        } else {
            return 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300';
        }
    };

    return (
        <div
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isLast ? 'mb-4' : ''}`}
            role="article"
            aria-label={`${isUser ? 'Sua mensagem' : 'Resposta do assistente'} às ${new Date(message.timestamp).toLocaleTimeString()}`}
        >
            <div className={`flex items-start space-x-3 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getAvatarClasses()}`}>
                    {isUser ? (
                        <User size={14} />
                    ) : isError ? (
                        <AlertTriangle size={14} />
                    ) : (
                        <Bot size={14} />
                    )}
                </div>

                {/* Message Content */}
                <div className={`rounded-2xl px-4 py-3 ${getMessageClasses()} backdrop-blur-sm`}>
                    {/* Message Text */}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                    </div>

                    {/* Medical Disclaimer */}
                    {requiresDisclaimer && !isUser && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-start space-x-2 text-xs text-gray-600 dark:text-gray-400">
                                <Shield size={12} className="flex-shrink-0 mt-0.5" />
                                <p>
                                    <strong>Aviso médico:</strong> Esta informação é apenas educativa.
                                    Para diagnósticos e tratamentos, consulte sempre um médico oftalmologista.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Emergency Alert */}
                    {isEmergency && (
                        <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
                            <div className="flex items-center space-x-2 mb-2">
                                <AlertTriangle size={16} className="text-orange-600 dark:text-orange-400" />
                                <span className="font-semibold text-sm text-orange-800 dark:text-orange-200">
                                    Situação de Emergência Detectada
                                </span>
                            </div>
                            <p className="text-xs text-orange-700 dark:text-orange-300 mb-3">
                                Se você está enfrentando uma emergência oftalmológica, procure atendimento médico imediato.
                            </p>
                            <button
                                onClick={handleEmergencyClick}
                                className="inline-flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                                aria-label="Ligar para emergência"
                            >
                                <AlertTriangle size={12} />
                                <span>Ligar Agora: (33) 99860-1427</span>
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {(suggestsAppointment || message.suggestedActions?.length > 0) && !isUser && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex flex-wrap gap-2">
                                {suggestsAppointment && enableAppointmentBooking && (
                                    <button
                                        onClick={handleAppointmentClick}
                                        className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        aria-label="Agendar consulta"
                                    >
                                        <Calendar size={12} />
                                        <span>Agendar Consulta</span>
                                        <ExternalLink size={10} />
                                    </button>
                                )}

                                {message.metadata?.suggestsReferral && enableReferralRequests && (
                                    <button
                                        onClick={handleReferralClick}
                                        className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                                        aria-label="Solicitar encaminhamento"
                                    >
                                        <ExternalLink size={12} />
                                        <span>Solicitar Encaminhamento</span>
                                    </button>
                                )}

                                {/* Custom suggested actions */}
                                {message.suggestedActions?.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => action.handler()}
                                        className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 ${action.className || 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500'}`}
                                        aria-label={action.ariaLabel || action.label}
                                    >
                                        {action.icon && <action.icon size={12} />}
                                        <span>{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Timestamp and Status */}
                    <div className="mt-2 flex items-center justify-between">
                        <div className={`text-xs ${isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'} flex items-center space-x-1`}>
                            <Clock size={10} />
                            <time dateTime={message.timestamp}>
                                {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </time>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Medical content indicator */}
                            {containsMedicalContent && !isUser && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                    <Shield size={10} />
                                    <span>Conteúdo médico</span>
                                </div>
                            )}

                            {/* Message status for user messages in real-time mode */}
                            {isUser && enableRealtime && messageStatus && (
                                <InlineMessageStatus
                                    status={messageStatus.status}
                                    timestamp={messageStatus.timestamp}
                                    className={isUser ? 'text-blue-100' : ''}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};