import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MessageCircle, Phone, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

/**
 * Fixed CTA (Call-to-Action) Component
 * Sticky button that follows user scroll for easy appointment booking
 */
const FixedCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling 300px
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const contactOptions = [
    {
      icon: Calendar,
      label: 'Agendar Consulta',
      href: '/#agendar',
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Escolha o melhor horário',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      href: 'https://wa.me/5533998765432?text=Olá!%20Gostaria%20de%20agendar%20uma%20consulta.',
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Atendimento rápido',
      external: true,
    },
    {
      icon: Phone,
      label: 'Ligar Agora',
      href: 'tel:+553333331234',
      color: 'bg-purple-600 hover:bg-purple-700',
      description: '(33) 3333-1234',
      external: true,
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40"
        >
          {/* Expanded Menu */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-72"
              >
                <div className="space-y-3">
                  {contactOptions.map((option, index) => {
                    const Icon = option.icon;
                    const Component = option.external ? 'a' : Link;

                    return (
                      <motion.div
                        key={option.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Component
                          to={!option.external ? option.href : undefined}
                          href={option.external ? option.href : undefined}
                          target={option.external ? '_blank' : undefined}
                          rel={option.external ? 'noopener noreferrer' : undefined}
                          className={`${option.color} text-white rounded-xl p-4 flex items-center gap-3 transition-all hover:shadow-lg group w-full`}
                          onClick={() => setIsExpanded(false)}
                        >
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-sm">{option.label}</p>
                            <p className="text-xs opacity-90">{option.description}</p>
                          </div>
                        </Component>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`${
                isExpanded
                  ? 'bg-gray-900 hover:bg-black'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              } text-white shadow-2xl px-6 py-6 rounded-full text-base font-semibold flex items-center gap-3 transition-all`}
              aria-label={isExpanded ? 'Fechar menu de agendamento' : 'Abrir menu de agendamento'}
            >
              {isExpanded ? (
                <>
                  <X className="w-5 h-5" />
                  <span>Fechar</span>
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  <span>Agendar Consulta</span>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                    aria-hidden="true"
                  />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FixedCTA;