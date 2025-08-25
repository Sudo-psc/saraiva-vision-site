import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

const WhatsappWidget = ({ phoneNumber }) => {
  const whatsappLink = `https://wa.me/${phoneNumber}`;
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Show tooltip after 3 seconds to draw attention
    const timer = setTimeout(() => setShowTooltip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const hideTooltip = () => setShowTooltip(false);

  return (
    <>
      {/* Enhanced Mobile-First WhatsApp Widget */}
      <motion.div
        className="fixed bottom-20 right-4 z-[80] sm:bottom-24 sm:right-6"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1.5 }}
      >
        {/* Tooltip for better visibility */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full right-0 mb-3 bg-white text-slate-800 px-4 py-3 rounded-2xl shadow-xl border border-green-200 max-w-xs text-sm font-medium whitespace-nowrap"
            >
              <button 
                onClick={hideTooltip}
                className="absolute -top-1 -right-1 p-1 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
                aria-label="Fechar dica"
              >
                <X size={12} />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-green-600">💬</span>
                <span>Fale conosco agora!</span>
              </div>
              <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-white border-r border-b border-green-200 transform rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced WhatsApp Button */}
        <motion.a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden group"
          style={{ minHeight: '64px', minWidth: '64px', padding: '16px' }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={hideTooltip}
          aria-label="Fale conosco pelo WhatsApp - Resposta rápida garantida"
        >
          {/* Pulse animation background */}
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-0 bg-green-400 rounded-full animate-pulse opacity-10"></div>
          
          <MessageCircle size={32} className="relative z-10 animate-bounce sm:animate-none group-hover:animate-bounce" />
          
          {/* Online indicator */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
        </motion.a>
      </motion.div>
    </>
  );
};

export default WhatsappWidget;