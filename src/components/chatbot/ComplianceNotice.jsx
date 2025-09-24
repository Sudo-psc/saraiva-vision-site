import React, { useState } from 'react';
import { Shield, Info, X, ExternalLink } from 'lucide-react';

/**
 * Compliance Notice Component
 * 
 * Displays CFM and LGPD compliance information
 * Allows users to acknowledge and dismiss the notice
 */
export const ComplianceNotice = ({ complianceMode = 'strict' }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [hasAcknowledged, setHasAcknowledged] = useState(false);

    // Don't show in standard mode or if already acknowledged
    if (complianceMode !== 'strict' || !isVisible || hasAcknowledged) {
        return null;
    }

    const handleAcknowledge = () => {
        setHasAcknowledged(true);
        setIsVisible(false);

        // Store acknowledgment in localStorage
        localStorage.setItem('chatbot_compliance_acknowledged', 'true');

        // Track compliance acknowledgment
        if (window.gtag) {
            window.gtag('event', 'compliance_acknowledged', {
                event_category: 'chatbot',
                event_label: 'cfm_lgpd_notice'
            });
        }
    };

    const handlePrivacyPolicy = () => {
        window.open('/politica-privacidade', '_blank');
    };

    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-4">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    <Shield size={20} className="text-blue-600 dark:text-blue-400" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            Aviso Importante - Conformidade Médica e Privacidade
                        </h4>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                            aria-label="Fechar aviso"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="text-xs text-blue-800 dark:text-blue-200 space-y-2">
                        <div className="flex items-start space-x-2">
                            <Info size={12} className="flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium mb-1">Conformidade CFM:</p>
                                <p>
                                    Este assistente virtual fornece apenas informações educativas.
                                    Não substitui consulta médica profissional. Para diagnósticos,
                                    tratamentos ou emergências, procure sempre um médico oftalmologista.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-2">
                            <Shield size={12} className="flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium mb-1">Proteção de Dados (LGPD):</p>
                                <p>
                                    Suas conversas são criptografadas e protegidas. Coletamos apenas
                                    dados necessários para o atendimento. Você pode solicitar exclusão
                                    dos seus dados a qualquer momento.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                        <button
                            onClick={handlePrivacyPolicy}
                            className="inline-flex items-center space-x-1 text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                        >
                            <ExternalLink size={10} />
                            <span>Política de Privacidade</span>
                        </button>

                        <button
                            onClick={handleAcknowledge}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Entendi e Concordo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};