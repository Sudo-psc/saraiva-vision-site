'use client';

/**
 * Schedule Dropdown Component
 * Displays scheduling options: online booking, WhatsApp, and contact form
 * Client-side only (uses DOM positioning and window events)
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, MessageCircle, Calendar } from 'lucide-react';
import { clinicInfo } from '@/lib/clinicInfo';
import type { ScheduleDropdownProps, ScheduleOption } from '@/types/scheduling';

// Constants for WhatsApp messaging
const DEFAULT_WHATSAPP_MESSAGE = 'Olá! Gostaria de agendar uma consulta.';
const CONTACT_PHONE_NUMBER = '+553398601427'; // From clinicInfo

const ScheduleDropdown: React.FC<ScheduleDropdownProps> = ({
  isOpen,
  onClose,
  triggerRef,
  className = '',
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Generate WhatsApp URL with pre-filled message
   */
  const generateWhatsAppUrl = (message: string = DEFAULT_WHATSAPP_MESSAGE): string => {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${CONTACT_PHONE_NUMBER}?text=${encodedMessage}`;
  };

  /**
   * Open floating CTA modal via custom event
   */
  const openFloatingCTA = () => {
    window.dispatchEvent(new Event('open-cta-modal'));
  };

  /**
   * Safe URL opener with fallback
   */
  const safeOpen = (url: string) => {
    if (!url || url.trim() === '') {
      console.error('[ScheduleDropdown] Invalid URL provided:', url);
      return;
    }

    try {
      const validUrl = url.startsWith('http') ? url : `https://${url}`;
      const win = window.open(validUrl, '_blank', 'noopener,noreferrer');

      // Fallback if popup blocked
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = validUrl;
      }
    } catch (error) {
      console.error('[ScheduleDropdown] Error opening URL:', url, error);
      try {
        window.location.href = url.startsWith('http') ? url : `https://${url}`;
      } catch (fallbackError) {
        console.error('[ScheduleDropdown] Fallback navigation also failed:', fallbackError);
      }
    }
  };

  /**
   * Schedule option handlers
   */
  const handleOnlineScheduling = () => {
    if (!clinicInfo.onlineSchedulingUrl) {
      console.error('[ScheduleDropdown] Online scheduling URL not configured');
      alert('Serviço indisponível. Use WhatsApp ou ligue para (33) 99860-1427');
      return;
    }
    safeOpen(clinicInfo.onlineSchedulingUrl);
    onClose();
  };

  const handleWhatsAppScheduling = () => {
    const whatsappUrl = generateWhatsAppUrl();
    safeOpen(whatsappUrl);
    onClose();
  };

  const handleContactForm = () => {
    openFloatingCTA();
    onClose();
  };

  /**
   * Schedule options configuration
   */
  const scheduleOptions: ScheduleOption[] = [
    {
      id: 'online',
      title: 'Agendamento Online',
      description: 'Agende direto no sistema',
      icon: Globe,
      action: handleOnlineScheduling,
      ariaLabel: 'Agendar consulta através do sistema online',
      color: 'blue',
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: 'Atendimento direto',
      icon: MessageCircle,
      action: handleWhatsAppScheduling,
      ariaLabel: 'Agendar consulta via WhatsApp',
      color: 'green',
    },
    {
      id: 'contact',
      title: 'Mais Opções',
      description: 'Formulário de contato',
      icon: Calendar,
      action: handleContactForm,
      ariaLabel: 'Abrir formulário de contato para mais opções',
      color: 'purple',
    },
  ];

  /**
   * Position dropdown relative to trigger button
   */
  useEffect(() => {
    if (isOpen && triggerRef.current && dropdownRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dropdown = dropdownRef.current;

      // Position dropdown below the trigger button
      dropdown.style.position = 'fixed';
      dropdown.style.top = `${triggerRect.bottom + 8}px`;
      dropdown.style.right = `${window.innerWidth - triggerRect.right}px`;
      dropdown.style.zIndex = '9999';
    }
  }, [isOpen, triggerRef]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  /**
   * Color mapping for button hover states
   */
  const colorClasses = {
    blue: 'hover:bg-blue-50 focus:ring-blue-600',
    green: 'hover:bg-green-50 focus:ring-green-600',
    purple: 'hover:bg-purple-50 focus:ring-purple-600',
    orange: 'hover:bg-orange-50 focus:ring-orange-600',
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dropdown */}
      <AnimatePresence>
        <motion.div
          ref={dropdownRef}
          id="navbar-schedule-menu"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`fixed w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-200 z-[9999] ${className}`}
          role="menu"
          aria-labelledby="schedule-button"
        >
          <div className="p-3">
            {scheduleOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={option.action}
                  onKeyDown={(e) => handleKeyDown(e, option.action)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left focus:outline-none focus:ring-2 focus:ring-inset ${colorClasses[option.color]}`}
                  tabIndex={0}
                  role="menuitem"
                  aria-label={option.ariaLabel}
                >
                  <Icon size={20} className={iconColorClasses[option.color]} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.title}</div>
                    <div className="text-xs text-gray-700">{option.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default ScheduleDropdown;
