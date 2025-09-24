import React from 'react';
import { Phone, Calendar, ExternalLink, MessageSquare, Clock, MapPin } from 'lucide-react';

/**
 * Quick Actions Component
 * 
 * Provides quick access buttons for common actions
 * Includes appointment booking, contact options, and emergency access
 */
export const QuickActions = ({
    enableAppointmentBooking = true,
    enableReferralRequests = true
}) => {
    const handleWhatsAppClick = () => {
        // Track WhatsApp interaction
        if (window.gtag) {
            window.gtag('event', 'chatbot_whatsapp_click', {
                event_category: 'chatbot',
                event_label: 'whatsapp_contact'
            });
        }

        window.open('https://wa.me/5533998601427?text=Olá! Vim através do assistente virtual do site.', '_blank');
    };

    const handleAppointmentClick = () => {
        // Track appointment interaction
        if (window.gtag) {
            window.gtag('event', 'chatbot_appointment_quick_click', {
                event_category: 'chatbot',
                event_label: 'quick_appointment_booking'
            });
        }

        window.location.href = '/agendamento';
    };

    const handleLocationClick = () => {
        // Track location interaction
        if (window.gtag) {
            window.gtag('event', 'chatbot_location_click', {
                event_category: 'chatbot',
                event_label: 'clinic_location'
            });
        }

        window.open('https://maps.google.com/?q=Clínica+Saraiva+Vision+Governador+Valadares', '_blank');
    };

    const handleEmergencyClick = () => {
        // Track emergency interaction
        if (window.gtag) {
            window.gtag('event', 'chatbot_emergency_quick_click', {
                event_category: 'chatbot',
                event_label: 'emergency_contact'
            });
        }

        window.open('tel:+5533998601427', '_self');
    };

    const quickActions = [
        {
            id: 'whatsapp',
            label: 'WhatsApp',
            icon: MessageSquare,
            onClick: handleWhatsAppClick,
            className: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800',
            ariaLabel: 'Abrir conversa no WhatsApp'
        },
        {
            id: 'appointment',
            label: 'Agendar',
            icon: Calendar,
            onClick: handleAppointmentClick,
            className: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800',
            ariaLabel: 'Agendar consulta',
            show: enableAppointmentBooking
        },
        {
            id: 'location',
            label: 'Localização',
            icon: MapPin,
            onClick: handleLocationClick,
            className: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800',
            ariaLabel: 'Ver localização da clínica'
        },
        {
            id: 'emergency',
            label: 'Emergência',
            icon: Phone,
            onClick: handleEmergencyClick,
            className: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800',
            ariaLabel: 'Ligar para emergência'
        }
    ];

    const visibleActions = quickActions.filter(action => action.show !== false);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Ações Rápidas
                </span>
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={10} />
                    <span>Atendimento 24h</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {visibleActions.map((action) => {
                    const IconComponent = action.icon;

                    return (
                        <button
                            key={action.id}
                            onClick={action.onClick}
                            className={`
                inline-flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium 
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 
                hover:scale-105 active:scale-95 backdrop-blur-sm
                ${action.className}
              `}
                            aria-label={action.ariaLabel}
                        >
                            <IconComponent size={12} />
                            <span>{action.label}</span>
                            {action.id === 'appointment' && <ExternalLink size={8} />}
                        </button>
                    );
                })}
            </div>

            {/* Additional info */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
                <p>Horário de funcionamento: Segunda a Sexta, 8h às 18h</p>
            </div>
        </div>
    );
};