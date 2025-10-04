'use client';

/**
 * CTAModal Component
 * Conversion-focused modal for appointment booking and contact actions
 * Phase 4: UI Components Migration (Vite → Next.js 15)
 *
 * Features:
 * - Multiple contact methods (Online, WhatsApp, Phone, Email, Chatbot)
 * - Portal rendering with React 18 createPortal
 * - Focus trap and keyboard navigation (Escape to close)
 * - Body scroll lock when open
 * - Event-driven opening ('open-cta-modal' event)
 * - Safe external link handling with user confirmation
 * - Framer Motion animations
 * - WCAG AAA accessibility compliance
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Globe, MessageCircle, Phone, Mail, X, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CTAModalProps, CTAAction } from '@/types/ui';

// Clinic contact information
const CONTACT = {
  PHONE: {
    NUMBER: '5533987654321',
    DISPLAY: '(33) 98765-4321',
    HREF: 'tel:+5533987654321',
  },
  EMAIL: 'contato@saraivavision.com.br',
  WHATSAPP_MESSAGE: 'Olá! Gostaria de agendar uma consulta.',
  EMAIL_SUBJECT: 'Agendamento de Consulta - Saraiva Vision',
  ONLINE_SCHEDULING: 'https://saraivavision.com.br/agendamento',
  CHATBOT: 'https://chatgpt.com/g/g-quepJB90J-saraiva-vision-clinica-oftalmologica?model=gpt-4o',
};

/**
 * Generate WhatsApp URL with message
 */
const generateWhatsAppUrl = (message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${CONTACT.PHONE.NUMBER}?text=${encodedMessage}`;
};

/**
 * Safely open external URL with user confirmation
 */
const safeOpenExternal = (url: string, serviceName: string): void => {
  const confirmed = window.confirm(`Você será redirecionado para ${serviceName}. Continuar?`);
  if (confirmed) {
    try {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win || win.closed) {
        window.location.href = url;
      }
    } catch (e) {
      console.error('Error opening external URL:', e);
      window.location.href = url;
    }
  }
};

/**
 * Focus trap hook
 */
const useFocusTrap = (isOpen: boolean, ref: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
    if (!isOpen || !ref.current) return;

    const container = ref.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element on open
    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen, ref]);
};

/**
 * Body scroll lock hook
 */
const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isLocked) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isLocked]);
};

/**
 * CTAModal Component
 */
export const CTAModal: React.FC<CTAModalProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  title = 'Agendar Consulta',
  description = 'Escolha sua forma preferida de contato. Resposta em até 1 minuto no horário comercial.',
  actions,
  footer,
  className = '',
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setOpen = externalOnClose ? (value: boolean) => !value && externalOnClose() : setInternalIsOpen;

  // Mount detection for SSR
  useEffect(() => setMounted(true), []);

  // Listen for global 'open-cta-modal' event
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-cta-modal', handler);
    return () => window.removeEventListener('open-cta-modal', handler);
  }, [setOpen]);

  // Escape key handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, setOpen]);

  // Focus trap and scroll lock
  useFocusTrap(isOpen, modalRef);
  useBodyScrollLock(isOpen);

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  // Default actions if not provided
  const defaultActions: CTAAction[] = [
    {
      id: 'online',
      title: 'Agendamento Online',
      description: 'Agende sua consulta diretamente pela plataforma web',
      icon: <Globe size={24} />,
      onClick: () => safeOpenExternal(CONTACT.ONLINE_SCHEDULING, 'Agendamento Online'),
      variant: 'primary',
      badge: 'RECOMENDADO',
      className: 'border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200',
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: 'Resposta em até 1 minuto • Mais rápido',
      icon: <MessageCircle size={24} className="animate-pulse" />,
      onClick: () => safeOpenExternal(generateWhatsAppUrl(CONTACT.WHATSAPP_MESSAGE), 'WhatsApp'),
      variant: 'primary',
      className:
        'border-green-300 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200',
    },
    {
      id: 'chatbot',
      title: 'Chatbot AI',
      description: 'Tire dúvidas sobre oftalmologia e procedimentos instantaneamente',
      icon: <Bot size={22} />,
      onClick: () => safeOpenExternal(CONTACT.CHATBOT, 'Chatbot AI'),
      variant: 'secondary',
      className: 'border border-teal-200 bg-teal-50 hover:bg-teal-100',
    },
    {
      id: 'phone',
      title: 'Telefone',
      description: `Ligue agora: ${CONTACT.PHONE.DISPLAY}`,
      icon: <Phone size={22} />,
      onClick: () => (window.location.href = CONTACT.PHONE.HREF),
      variant: 'secondary',
      className: 'border border-blue-200 bg-blue-50 hover:bg-blue-100',
    },
    {
      id: 'email',
      title: 'E-mail',
      description: 'Envie detalhes e preferências de horário',
      icon: <Mail size={22} />,
      onClick: () =>
        (window.location.href = `mailto:${CONTACT.EMAIL}?subject=${encodeURIComponent(CONTACT.EMAIL_SUBJECT)}`),
      variant: 'secondary',
      className: 'border border-blue-200 bg-blue-50 hover:bg-blue-100',
    },
  ];

  const finalActions = actions || defaultActions;

  if (!mounted) return null;

  const Modal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="cta-modal-title"
          aria-describedby="cta-modal-description"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleBackdropClick} />

          {/* Modal Content */}
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-xl p-6 sm:p-8 max-h-[90dvh] overflow-y-auto ${className}`}
          >
            {/* Close Button */}
            <button
              type="button"
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              aria-label="Fechar"
              onClick={handleClose}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h3 id="cta-modal-title" className="text-xl font-semibold mb-1 text-slate-800">
                {title}
              </h3>
              <p id="cta-modal-description" className="text-sm text-slate-500">
                {description}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {finalActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 transform hover:scale-[1.02] shadow-lg w-full text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                    action.className || ''
                  }`}
                >
                  <div
                    className={`p-4 rounded-xl text-white shadow-md ${
                      action.variant === 'primary'
                        ? action.id === 'online'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : 'bg-gradient-to-br from-green-500 to-green-600'
                        : 'bg-gradient-to-br from-teal-500 to-teal-600'
                    }`}
                  >
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      {action.title}
                      {action.badge && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">{action.description}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            {footer || (
              <div className="mt-6 text-[11px] leading-snug text-slate-400">
                Caso o WhatsApp não abra automaticamente, adicione o número manualmente: {CONTACT.PHONE.DISPLAY}.
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return mounted && isOpen ? createPortal(Modal, document.body) : null;
};

export default CTAModal;
