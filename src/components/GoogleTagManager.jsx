import { useEffect } from 'react';
import { loadGTM, getGTMStatus } from '../utils/gtm-wrapper.js';

/**
 * Google Tag Manager Component with Robust Error Isolation
 *
 * Carrega GTM com:
 * - Isolamento completo de erros de terceiros
 * - Circuit breaker para evitar sobrecarga
 * - Múltiplas estratégias de fallback
 * - Compatibilidade com adblockers
 *
 * @param {Object} props - Component props
 * @param {string} props.gtmId - GTM ID (GTM-XXXXXXX)
 */
const GoogleTagManager = ({ gtmId }) => {
    useEffect(() => {
        if (!gtmId || typeof window === 'undefined') return;

        console.log('🏷️ Loading Google Tag Manager with error isolation, ID:', gtmId);

        let mounted = true;
        let cleanupFunctions = [];

        /**
         * Carrega GTM com isolamento de erros
         */
        const initializeGTM = async () => {
            try {
                // Verifica se já está carregado
                const status = getGTMStatus();
                if (status.loaded) {
                    console.log('🏷️ GTM already loaded, skipping');
                    return;
                }

                // Tenta carregar imediatamente
                const loaded = await loadGTM(gtmId);

                if (loaded) {
                    console.log('✅ GTM loaded successfully');
                } else {
                    console.warn('⚠️ GTM failed to load (circuit breaker or network issue)');
                }
            } catch (error) {
                // Isolamento: erro nunca propaga
                console.error('[GTM Component] Initialization error (isolated):', error);
            }
        };

        /**
         * Estratégia de carregamento com delays progressivos
         */
        const loadWithStrategy = () => {
            try {
                // Imediato
                initializeGTM();

                // Fallback com delays progressivos
                const delays = [1000, 3000, 5000];
                delays.forEach(delay => {
                    const timerId = setTimeout(() => {
                        if (!mounted) return;

                        const status = getGTMStatus();
                        if (!status.loaded) {
                            console.log(`🔄 Retrying GTM load after ${delay}ms`);
                            initializeGTM();
                        }
                    }, delay);

                    cleanupFunctions.push(() => clearTimeout(timerId));
                });
            } catch (error) {
                console.error('[GTM Component] loadWithStrategy error (isolated):', error);
            }
        };

        /**
         * Carrega GTM em interação do usuário (fallback final)
         */
        const loadOnInteraction = () => {
            try {
                if (!mounted) return;

                const status = getGTMStatus();
                if (!status.loaded) {
                    console.log('🏷️ Loading GTM on user interaction (final fallback)');
                    initializeGTM();
                }

                // Remove listeners após primeira interação
                interactionEvents.forEach(event => {
                    window.removeEventListener(event, loadOnInteraction);
                });
            } catch (error) {
                console.error('[GTM Component] loadOnInteraction error (isolated):', error);
            }
        };

        // Eventos de interação para fallback
        const interactionEvents = ['mousedown', 'touchstart', 'scroll', 'keydown'];

        // Adiciona listeners com isolamento de erro
        interactionEvents.forEach(event => {
            try {
                window.addEventListener(event, loadOnInteraction, {
                    once: false,
                    passive: true
                });
            } catch (error) {
                console.error(`[GTM Component] addEventListener error for ${event} (isolated):`, error);
            }
        });

        // Inicia estratégia de carregamento
        loadWithStrategy();

        // Cleanup
        return () => {
            mounted = false;

            // Remove event listeners
            interactionEvents.forEach(event => {
                try {
                    window.removeEventListener(event, loadOnInteraction);
                } catch {}
            });

            // Cleanup timers
            cleanupFunctions.forEach(cleanup => {
                try {
                    cleanup();
                } catch {}
            });
        };
    }, [gtmId]);

    return null;
};

export default GoogleTagManager;
