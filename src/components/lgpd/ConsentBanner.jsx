import React, { useState, useEffect } from 'react';
import { consentManager } from '../../lib/lgpd/consentManager.js';
import './ConsentBanner.css';

export const ConsentBanner = ({ onConsentChange }) => {
    const [showBanner, setShowBanner] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Check if consent is needed
        if (!consentManager.hasValidConsent()) {
            setShowBanner(true);
        }
    }, []);

    const handleAcceptConsent = async () => {
        setIsLoading(true);

        try {
            // Get IP hash for consent record
            const ipHash = await getIPHash();

            const consentDetails = {
                purposes: [
                    'appointment_scheduling',
                    'communication',
                    'service_improvement',
                    'marketing_communications'
                ],
                ipHash,
                consentMethod: 'banner_accept'
            };

            const success = consentManager.recordConsent(consentDetails);

            if (success) {
                setShowBanner(false);
                onConsentChange?.(true);
            } else {
                alert('Erro ao registrar consentimento. Tente novamente.');
            }
        } catch (error) {
            console.error('Error recording consent:', error);
            alert('Erro ao registrar consentimento. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectConsent = () => {
        // For essential services, we still need minimal consent
        // Redirect to a page explaining essential vs optional data processing
        window.location.href = '/privacidade/consentimento-essencial';
    };

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    if (!showBanner) return null;

    return (
        <div className="consent-banner" role="dialog" aria-labelledby="consent-title">
            <div className="consent-content">
                <div className="consent-header">
                    <h3 id="consent-title">🔒 Proteção de Dados Pessoais</h3>
                </div>

                <div className="consent-body">
                    <p>
                        Utilizamos seus dados para oferecer a melhor experiência em nossos serviços médicos.
                        Ao continuar, você concorda com nossa política de privacidade em conformidade com a LGPD.
                    </p>

                    {showDetails && (
                        <div className="consent-details">
                            <h4>Como utilizamos seus dados:</h4>
                            <ul>
                                <li>📅 <strong>Agendamentos:</strong> Para marcar e confirmar consultas</li>
                                <li>📧 <strong>Comunicação:</strong> Lembretes e informações importantes</li>
                                <li>📊 <strong>Melhoria:</strong> Aprimorar nossos serviços (dados anonimizados)</li>
                                <li>📱 <strong>Marketing:</strong> Informações sobre novos tratamentos (opcional)</li>
                            </ul>

                            <p className="consent-rights">
                                <strong>Seus direitos:</strong> Você pode acessar, corrigir, excluir ou solicitar
                                a portabilidade dos seus dados a qualquer momento através do email
                                <a href="mailto:privacidade@saraivavision.com.br">privacidade@saraivavision.com.br</a>
                            </p>
                        </div>
                    )}
                </div>

                <div className="consent-actions">
                    <button
                        type="button"
                        className="consent-btn consent-btn-details"
                        onClick={toggleDetails}
                        aria-expanded={showDetails}
                    >
                        {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
                    </button>

                    <div className="consent-btn-group">
                        <button
                            type="button"
                            className="consent-btn consent-btn-reject"
                            onClick={handleRejectConsent}
                            disabled={isLoading}
                        >
                            Apenas essencial
                        </button>

                        <button
                            type="button"
                            className="consent-btn consent-btn-accept"
                            onClick={handleAcceptConsent}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Registrando...' : 'Aceitar todos'}
                        </button>
                    </div>
                </div>

                <div className="consent-footer">
                    <small>
                        <a href="/privacidade" target="_blank" rel="noopener noreferrer">
                            Política de Privacidade Completa
                        </a>
                        {' | '}
                        <a href="/privacidade/direitos" target="_blank" rel="noopener noreferrer">
                            Seus Direitos LGPD
                        </a>
                    </small>
                </div>
            </div>
        </div>
    );
};

// Helper function to get IP hash
async function getIPHash() {
    try {
        // In production, this would call your API to get a hashed IP
        const response = await fetch('/api/utils/ip-hash');
        const data = await response.json();
        return data.ipHash;
    } catch (error) {
        console.warn('Could not get IP hash:', error);
        return 'unknown';
    }
}