/**
 * FixedCTA Component (Blog)
 * Next.js 15 - Client Component with Expandable Menu
 *
 * Fixed floating CTA for blog pages with multiple contact options.
 * Scroll-triggered, expandable, mobile-optimized, and dismissible.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MessageCircle, Phone, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { FixedCTAProps, ContactOption } from '@/types/cta';

const defaultContactOptions: ContactOption[] = [
  {
    icon: Calendar,
    label: 'Agendar Consulta',
    href: '/#agendar',
    color: 'bg-blue-600 hover:bg-blue-700',
    description: 'Escolha o melhor horário',
    external: false,
    trackingLabel: 'schedule_consultation',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    href: 'https://wa.me/5533998765432?text=Olá!%20Gostaria%20de%20agendar%20uma%20consulta.',
    color: 'bg-green-600 hover:bg-green-700',
    description: 'Atendimento rápido',
    external: true,
    trackingLabel: 'whatsapp_contact',
  },
  {
    icon: Phone,
    label: 'Ligar Agora',
    href: 'tel:+553333331234',
    color: 'bg-purple-600 hover:bg-purple-700',
    description: '(33) 3333-1234',
    external: true,
    trackingLabel: 'phone_call',
  },
];

const DEFAULT_SHOW_AFTER_SCROLL = 300; // pixels

export default function FixedCTA({
  className = '',
  config,
  onExpand,
  onCollapse,
}: FixedCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(config?.expanded || false);

  const showAfterScroll = config?.showAfterScroll || DEFAULT_SHOW_AFTER_SCROLL;
  const contactOptions = defaultContactOptions;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > showAfterScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll]);

  const handleToggleExpand = useCallback(() => {
    const newState = !isExpanded;
    setIsExpanded(newState);

    if (newState) {
      onExpand?.();
    } else {
      onCollapse?.();
    }
  }, [isExpanded, onExpand, onCollapse]);

  const handleOptionClick = useCallback(() => {
    setIsExpanded(false);
    onCollapse?.();
  }, [onCollapse]);

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
        role="complementary"
        aria-label="Menu de agendamento fixo"
      >
        {/* Expanded Menu */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-72 md:w-80"
            >
              <div className="space-y-3">
                {contactOptions.map((option, index) => {
                  const Icon = option.icon;
                  const isExternal = option.external;

                  if (isExternal) {
                    return (
                      <motion.a
                        key={option.label}
                        href={option.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={handleOptionClick}
                        className={`${option.color} text-white rounded-xl p-4 flex items-center gap-3 transition-all hover:shadow-lg group w-full`}
                      >
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-sm">{option.label}</p>
                          <p className="text-xs opacity-90">{option.description}</p>
                        </div>
                      </motion.a>
                    );
                  }

                  return (
                    <motion.div
                      key={option.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={option.href}
                        onClick={handleOptionClick}
                        className={`${option.color} text-white rounded-xl p-4 flex items-center gap-3 transition-all hover:shadow-lg group w-full block`}
                      >
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-sm">{option.label}</p>
                          <p className="text-xs opacity-90">{option.description}</p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleToggleExpand}
            className={`${
              isExpanded
                ? 'bg-gray-900 hover:bg-black'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            } text-white shadow-2xl px-6 py-6 rounded-full text-base font-semibold flex items-center gap-3 transition-all`}
            aria-label={isExpanded ? 'Fechar menu de agendamento' : 'Abrir menu de agendamento'}
            aria-expanded={isExpanded}
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
                {config?.pulseAnimation !== false && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
