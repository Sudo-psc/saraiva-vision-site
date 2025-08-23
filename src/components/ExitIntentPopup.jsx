import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Gift, Clock, Star, Phone, MessageCircle } from 'lucide-react';
import { useExitPopupAnalytics, useExitPopupStorage } from '@/hooks/useExitPopupAnalytics';

const ExitIntentPopup = () => {
    const { t } = useTranslation();
    const analytics = useExitPopupAnalytics();
    const storage = useExitPopupStorage();

    const [isVisible, setIsVisible] = useState(false);
    const [hasShown, setHasShown] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutos em segundos
    const [isCodeRevealed, setIsCodeRevealed] = useState(false);

    // Gerar código único de desconto
    const generateDiscountCode = () => {
        const prefix = 'SV20';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    };

    // Timer countdown
    useEffect(() => {
        if (isVisible && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        analytics.trackTimerExpired(isCodeRevealed);
                        setIsVisible(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isVisible, timeLeft, analytics, isCodeRevealed]);

    // Detectar intenção de saída
    useEffect(() => {
        // Verificar se já foi exibido hoje
        if (storage.hasShownToday()) {
            setHasShown(true);
            return;
        }

        let timeoutId;

        const handleMouseLeave = (e) => {
            // Detecta quando o mouse sai pela parte superior da página
            if (e.clientY <= 0 && !hasShown && !isVisible) {
                timeoutId = setTimeout(() => {
                    const code = generateDiscountCode();
                    setIsVisible(true);
                    setHasShown(true);
                    setDiscountCode(code);
                    setTimeLeft(600); // Reset timer

                    // Analytics e storage
                    analytics.trackPopupShown('exit_intent');
                    storage.markAsShown(code);
                }, 100);
            }
        };

        const handleMouseEnter = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };

        // Também mostrar após 30 segundos de inatividade
        const handleInactivity = () => {
            if (!hasShown && !isVisible) {
                const code = generateDiscountCode();
                setIsVisible(true);
                setHasShown(true);
                setDiscountCode(code);

                // Analytics e storage
                analytics.trackPopupShown('inactivity_timer');
                storage.markAsShown(code);
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        // Timer de inatividade (30 segundos)
        const inactivityTimer = setTimeout(handleInactivity, 30000);

        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
            clearTimeout(timeoutId);
            clearTimeout(inactivityTimer);
        };
    }, [hasShown, isVisible, analytics, storage]);

    const handleClose = () => {
        analytics.trackPopupClosed(timeLeft, isCodeRevealed);
        setIsVisible(false);
    };

    const handleRevealCode = () => {
        setIsCodeRevealed(true);
        analytics.trackCodeRevealed(discountCode);
    };

    const handleWhatsAppContact = () => {
        const phone = '5533998601427';
        const message = encodeURIComponent(
            `🎯 Olá! Vi a oferta especial de 20% de desconto no site da Saraiva Vision!\n\n💳 Meu código: ${discountCode}\n\n👁️ Gostaria de agendar minha consulta oftalmológica com desconto.`
        );
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        analytics.trackWhatsAppContact(discountCode);
    };

    const handlePhoneCall = () => {
        window.location.href = 'tel:+553399860142';
        analytics.trackPhoneContact(discountCode);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={handleClose}
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden border-4 border-blue-100">

                            {/* Header com Close Button */}
                            <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                <div className="flex items-center justify-center mb-2">
                                    <Gift className="text-yellow-300 mr-2" size={28} />
                                    <h2 className="text-xl font-bold">
                                        {t('exitPopup.title')}
                                    </h2>
                                </div>

                                <div className="text-sm text-blue-100">
                                    {t('exitPopup.subtitle')}
                                </div>
                            </div>

                            {/* Countdown Timer */}
                            <div className="bg-red-50 border-b-2 border-red-100 px-6 py-3">
                                <div className="flex items-center justify-center text-red-600">
                                    <Clock className="mr-2" size={16} />
                                    <span className="font-semibold text-sm">
                                        {t('exitPopup.timeLeft')}: {formatTime(timeLeft)}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">

                                {/* Oferta Principal */}
                                <div className="text-center">
                                    <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold mb-3">
                                        <Star className="mr-1" size={16} />
                                        {t('exitPopup.exclusive')}
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        20% {t('exitPopup.discount')}
                                    </h3>

                                    <p className="text-gray-600 text-sm mb-4">
                                        {t('exitPopup.description')}
                                    </p>
                                </div>

                                {/* Código de Desconto */}
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-dashed border-green-200">
                                    <div className="text-center">
                                        <div className="text-sm text-gray-600 mb-2">
                                            {t('exitPopup.codeLabel')}
                                        </div>

                                        {!isCodeRevealed ? (
                                            <button
                                                onClick={handleRevealCode}
                                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                                            >
                                                {t('exitPopup.revealCode')}
                                            </button>
                                        ) : (
                                            <div className="bg-white rounded-lg p-3 border-2 border-green-300">
                                                <div className="font-mono text-lg font-bold text-green-700 tracking-wider">
                                                    {discountCode}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {t('exitPopup.codeInstructions')}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Benefícios */}
                                <div className="space-y-2">
                                    <div className="text-sm font-semibold text-gray-700 mb-2">
                                        {t('exitPopup.benefits.title')}:
                                    </div>
                                    {t('exitPopup.benefits.list', { returnObjects: true }).map((benefit, index) => (
                                        <div key={index} className="flex items-center text-sm text-gray-600">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                            {benefit}
                                        </div>
                                    ))}
                                </div>

                                {/* Botões de Ação */}
                                <div className="space-y-3 pt-2">
                                    <button
                                        onClick={handleWhatsAppContact}
                                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center"
                                    >
                                        <MessageCircle className="mr-2" size={18} />
                                        {t('exitPopup.whatsappButton')}
                                    </button>

                                    <button
                                        onClick={handlePhoneCall}
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center"
                                    >
                                        <Phone className="mr-2" size={18} />
                                        {t('exitPopup.phoneButton')}
                                    </button>
                                </div>

                                {/* Disclaimer */}
                                <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                                    {t('exitPopup.disclaimer')}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ExitIntentPopup;
