import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useTranslation } from 'react-i18next';

const StickyWhatsAppCTA = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { generateWhatsAppUrl } = useWhatsApp();

  const whatsappUrl = generateWhatsAppUrl('Olá! Gostaria de agendar uma consulta.');
  const phoneNumber = '+55 33 99860-1427';

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 400 && !isDismissed;
      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleWhatsAppClick = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePhoneClick = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-2xl shadow-2xl border border-green-400/30 backdrop-blur-sm">
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 w-6 h-6 bg-white text-gray-600 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="Fechar"
            >
              <X size={14} />
            </button>
            
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle size={20} className="animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Agende Agora!</h3>
                <p className="text-green-100 text-sm">Resposta em até 1 minuto</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleWhatsAppClick}
                className="flex-1 bg-white text-green-600 font-bold py-3 px-4 rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle size={18} />
                WhatsApp
              </button>
              <button
                onClick={handlePhoneClick}
                className="bg-white/20 text-white font-bold py-3 px-4 rounded-xl hover:bg-white/30 transition-colors flex items-center justify-center"
                aria-label="Ligar"
              >
                <Phone size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyWhatsAppCTA;
