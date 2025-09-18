import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Globe, MessageCircle, Calendar } from 'lucide-react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { clinicInfo } from '@/lib/clinicInfo';

const ScheduleDropdown = ({ 
  isOpen, 
  onClose, 
  triggerRef,
  className = ""
}) => {
  const { t } = useTranslation();
  const dropdownRef = useRef(null);
  const { generateWhatsAppUrl, openFloatingCTA } = useWhatsApp();
  const whatsappLink = generateWhatsAppUrl();

  // Position calculation
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

  // Safe URL opener
  const safeOpen = (url) => {
    if (!url || url.trim() === '') {
      console.error('Invalid URL provided to safeOpen:', url);
      return;
    }

    try {
      const validUrl = url.startsWith('http') ? url : `https://${url}`;
      const win = window.open(validUrl, '_blank', 'noopener,noreferrer');

      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = validUrl;
      }
    } catch (e) {
      console.error('Error opening URL:', url, e);
      try {
        window.location.href = url.startsWith('http') ? url : `https://${url}`;
      } catch (fallbackError) {
        console.error('Fallback navigation also failed:', fallbackError);
      }
    }
  };

  const handleAgendarOnlineClick = () => {
    if (!clinicInfo.onlineSchedulingUrl) {
      console.error('Online scheduling URL not configured');
      alert(t('navbar.scheduling_error', 'Serviço indisponível. Use WhatsApp ou ligue para (33) 99860-1427'));
      return;
    }
    safeOpen(clinicInfo.onlineSchedulingUrl);
    onClose();
  };

  const handleAgendarWhatsappClick = () => {
    safeOpen(whatsappLink);
    onClose();
  };

  const handleAgendarContatoClick = () => {
    openFloatingCTA();
    onClose();
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
            <button
              onClick={handleAgendarOnlineClick}
              className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors text-left focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-inset"
              tabIndex="0"
              role="menuitem"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onClose();
                }
              }}
            >
              <Globe size={20} className="text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">{t('contact.online_scheduling_title')}</div>
                <div className="text-xs text-gray-700">{t('contact.online_scheduling_desc')}</div>
              </div>
            </button>
            
            <button
              onClick={handleAgendarWhatsappClick}
              className="w-full flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg transition-colors text-left focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-inset"
              tabIndex="0"
              role="menuitem"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onClose();
                }
              }}
            >
              <MessageCircle size={20} className="text-green-600" />
              <div>
                <div className="font-medium text-gray-900">{t('navbar.whatsapp')}</div>
                <div className="text-xs text-gray-700">{t('navbar.whatsapp_direct')}</div>
              </div>
            </button>
            
            <button
              onClick={handleAgendarContatoClick}
              className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg transition-colors text-left focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-inset"
              tabIndex="0"
              role="menuitem"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onClose();
                }
              }}
            >
              <Calendar size={20} className="text-purple-600" />
              <div>
                <div className="font-medium text-gray-900">{t('navbar.more_options')}</div>
                <div className="text-xs text-gray-700">{t('navbar.more_options_desc')}</div>
              </div>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default ScheduleDropdown;
