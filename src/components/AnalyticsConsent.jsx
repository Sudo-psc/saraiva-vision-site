/**
 * Analytics Consent Component
 * LGPD-compliant consent management for analytics tracking
 */

import React, { useState, useEffect } from 'react';
import analytics from '../lib/analytics';

const AnalyticsConsent = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [consentGiven, setConsentGiven] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Check if user has already made a consent decision
        const savedConsent = localStorage.getItem('analytics_consent');

        if (savedConsent === null) {
            // No previous decision, show banner
            setShowBanner(true);
        } else {
            // Previous decision exists
            const consent = savedConsent === 'true';
            setConsentGiven(consent);

            if (consent) {
                analytics.enable();
            } else {
                analytics.disable();
            }
        }
    }, []);

    const handleAccept = () => {
        setConsentGiven(true);
        setShowBanner(false);
        localStorage.setItem('analytics_consent', 'true');
        analytics.enable();

        // Track consent acceptance (this will now work since analytics is enabled)
        analytics.trackUserInteraction('consent', 'accept', {
            consent_type: 'analytics',
            timestamp: new Date().toISOString(),
        });
    };

    const handleReject = () => {
        setConsentGiven(false);
        setShowBanner(false);
        localStorage.setItem('analytics_consent', 'false');
        analytics.disable();
    };

    const handleRevoke = () => {
        setConsentGiven(false);
        localStorage.setItem('analytics_consent', 'false');
        analytics.disable();

        // Show banner again for new decision
        setShowBanner(true);
    };

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    if (!showBanner && consentGiven === null) {
        return null;
    }

    return (
        <>
            {/* Consent Banner */}
            {showBanner && (
                <div className="analytics-consent-banner" role="dialog" aria-labelledby="consent-title">
                    <div className="consent-content">
                        <div className="consent-header">
                            <h3 id="consent-title">Cookies e Analytics</h3>
                        </div>

                        <div className="consent-body">
                            <p>
                                Utilizamos cookies e ferramentas de analytics para melhorar sua experiência
                                e entender como você interage com nosso site. Seus dados são tratados de
                                acordo com a LGPD.
                            </p>

                            {showDetails && (
                                <div className="consent-details">
                                    <h4>Detalhes sobre coleta de dados:</h4>
                                    <ul>
                                        <li>
                                            <strong>Analytics:</strong> Coletamos dados sobre navegação,
                                            tempo de permanência e interações para melhorar nossos serviços.
                                        </li>
                                        <li>
                                            <strong>Funil de conversão:</strong> Acompanhamos o processo
                                            desde a visita até o agendamento para otimizar a experiência.
                                        </li>
                                        <li>
                                            <strong>Performance:</strong> Monitoramos métricas técnicas
                                            como velocidade de carregamento.
                                        </li>
                                        <li>
                                            <strong>Fontes de tráfego:</strong> Identificamos de onde
                                            vêm nossos visitantes (redes sociais, pesquisas, etc.).
                                        </li>
                                    </ul>

                                    <h4>Seus direitos:</h4>
                                    <ul>
                                        <li>Você pode revogar seu consentimento a qualquer momento</li>
                                        <li>Não coletamos dados pessoais identificáveis nos analytics</li>
                                        <li>Dados são anonimizados e agregados</li>
                                        <li>Você pode solicitar exclusão dos seus dados</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="consent-actions">
                            <button
                                onClick={toggleDetails}
                                className="consent-details-button"
                                aria-expanded={showDetails}
                            >
                                {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
                            </button>

                            <div className="consent-buttons">
                                <button
                                    onClick={handleReject}
                                    className="consent-button reject"
                                >
                                    Rejeitar
                                </button>
                                <button
                                    onClick={handleAccept}
                                    className="consent-button accept"
                                >
                                    Aceitar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Consent Status Indicator (when not showing banner) */}
            {!showBanner && consentGiven !== null && (
                <div className="consent-status">
                    <button
                        onClick={() => setShowBanner(true)}
                        className="consent-status-button"
                        title="Gerenciar preferências de cookies"
                    >
                        🍪 {consentGiven ? 'Analytics ativo' : 'Analytics desativado'}
                    </button>
                </div>
            )}

            {/* Revoke Consent Option */}
            {consentGiven && (
                <div className="consent-revoke">
                    <button
                        onClick={handleRevoke}
                        className="revoke-button"
                    >
                        Revogar consentimento de analytics
                    </button>
                </div>
            )}
        </>
    );
};

export default AnalyticsConsent;