import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, MessageCircle, Phone, Mail, X, Globe, Bot } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { clinicInfo } from '@/lib/clinicInfo';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { CONTACT } from '@/lib/constants';

// Sticky CTA with modal offering multiple contact channels
const FloatingCTA = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { generateWhatsAppUrl, whatsappNumber } = useWhatsApp();

  const whatsappUrl = generateWhatsAppUrl(CONTACT.DEFAULT_MESSAGES.WHATSAPP);
  const phoneDisplay = CONTACT.PHONE.DISPLAY;
  const phoneHref = CONTACT.PHONE.HREF;
  const email = CONTACT.EMAIL;
  const chatbotUrl = "https://chatgpt.com/g/g-quepJB90J-saraiva-vision-clinica-oftalmologica?model=gpt-4o";

  // Safe external URL opener with user confirmation
  const safeOpenExternal = useCallback((url, serviceName) => {
    const confirmed = window.confirm(
      t('contact.external_redirect_warning', `Você será redirecionado para ${serviceName}. Continuar?`)
    );
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
  }, [t]);

  useEffect(() => { setMounted(true); }, []);

  // Listen for global event to open modal from anywhere (e.g., contact section links)
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-floating-cta', handler);
    return () => window.removeEventListener('open-floating-cta', handler);
  }, []);

  const handleOpenModal = useCallback(() => setOpen(true), []);
  const handleCloseModal = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  const Modal = (
    <div aria-modal="true" role="dialog" aria-labelledby="cta-modal-title" className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleCloseModal} />
      <div className="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-xl p-6 sm:p-8 animate-in fade-in zoom-in-95">
        <button className="absolute top-3 right-3 p-2 rounded-full hover:bg-slate-100" aria-label="Fechar" onClick={handleCloseModal}>
          <X size={18} />
        </button>
        <h3 id="cta-modal-title" className="text-xl font-semibold mb-1 text-slate-800">{t('contact.schedule_consultation', 'Agendar Consulta')}</h3>
        <p className="text-sm text-slate-500 mb-6">{t('contact.modal_description', 'Escolha sua forma preferida de contato. Resposta em até 1 minuto no horário comercial.')}</p>

        {/* Mobile-First: Most Popular Option First */}
        <div className="space-y-4">
          {/* Priority #1: Online Scheduling - Most convenient for mobile */}
          <button
            onClick={() => safeOpenExternal(clinicInfo.onlineSchedulingUrl, 'Agendamento Online')}
            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 transform hover:scale-[1.02] shadow-lg w-full text-left"
          >
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
              <Globe size={24} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
                {t('contact.online_scheduling_title')}
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">RECOMENDADO</span>
              </div>
              <div className="text-sm text-blue-700 font-medium">{t('contact.online_scheduling_desc')}</div>
              <div className="text-xs text-slate-500 mt-1">📅 Disponível 24h • Confirmação instantânea</div>
            </div>
          </button>
          <button
            onClick={() => safeOpenExternal(whatsappUrl, 'WhatsApp')}
            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-200 transform hover:scale-[1.02] shadow-lg w-full text-left"
          >
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md">
              <MessageCircle size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-lg">{t('contact.whatsapp_title', 'WhatsApp')} ⚡</div>
              <div className="text-sm text-green-700 font-medium">{t('contact.whatsapp_fast_response', 'Resposta em até 1 minuto • Mais rápido')}</div>
              <div className="text-xs text-slate-500 mt-1">📱 {phoneDisplay}</div>
            </div>
          </button>
          <button
            onClick={() => safeOpenExternal(chatbotUrl, 'Chatbot AI')}
            className="flex items-center gap-4 p-4 rounded-2xl border border-teal-200 bg-teal-50 hover:bg-teal-100 transition w-full text-left"
          >
            <div className="p-3 rounded-xl bg-teal-500 text-white"><Bot size={22} /></div>
            <div>
              <div className="font-medium text-slate-800">{t('contact.chatbot_title')}</div>
              <div className="text-xs text-slate-500">{t('contact.chatbot_desc')}</div>
            </div>
          </button>
          <button
            onClick={() => {
              try {
                window.location.href = phoneHref;
              } catch (e) {
                console.error('Error initiating phone call:', e);
                alert(t('contact.phone_call_error', `Erro ao iniciar chamada. Ligue manualmente: ${phoneDisplay}`));
              }
            }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition w-full text-left"
          >
            <div className="p-3 rounded-xl bg-blue-500 text-white"><Phone size={22} /></div>
            <div>
              <div className="font-medium text-slate-800">{t('contact.phone_title', 'Telefone')}</div>
              <div className="text-xs text-slate-500">{t('contact.phone_call_now', 'Ligue agora')}: {phoneDisplay}</div>
            </div>
          </button>
          <button
            onClick={() => {
              try {
                const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(CONTACT.DEFAULT_MESSAGES.EMAIL_SUBJECT)}`;
                window.location.href = mailtoUrl;
              } catch (e) {
                console.error('Error opening email client:', e);
                alert(t('contact.email_error', `Erro ao abrir cliente de email. Envie para: ${email}`));
              }
            }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-purple-200 bg-purple-50 hover:bg-purple-100 transition w-full text-left"
          >
            <div className="p-3 rounded-xl bg-purple-500 text-white"><Mail size={22} /></div>
            <div>
              <div className="font-medium text-slate-800">{t('contact.email_title', 'E-mail')}</div>
              <div className="text-xs text-slate-500">{t('contact.email_details', 'Envie detalhes e preferências de horário')}</div>
            </div>
          </button>
        </div>
        <div className="mt-6 text-[11px] leading-snug text-slate-400">
          Caso o WhatsApp não abra automaticamente, adicione o número manualmente: {phoneDisplay}. Garantimos sigilo dos seus dados.
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile-First Prominent CTA Button - Positioned to avoid overlap with Accessibility Widget */}
      <button
        onClick={handleOpenModal}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[85] shadow-2xl rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 text-white font-bold flex items-center gap-3 px-4 py-4 sm:px-6 sm:py-5 text-sm sm:text-base transform hover:scale-105 active:scale-95 transition-all duration-200 max-w-[calc(100vw-2rem)] overflow-hidden"
        style={{
          minHeight: '56px',
          maxHeight: '64px',
          // Ensure it floats above content and adjusts on scroll
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
        aria-label="Agendar Consulta - Clique para ver opções de contato"
        tabIndex="0"
      >
        <Calendar size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
        <span className="hidden sm:inline whitespace-nowrap">Agendar Consulta</span>
        <span className="sm:hidden text-xs font-bold whitespace-nowrap">Agendar</span>
      </button>

      {/* Additional Mobile Call Button for Direct Phone Contact */}
      <a
        href={phoneHref}
        className="fixed bottom-4 left-4 z-[85] shadow-xl rounded-full bg-green-600 hover:bg-green-700 active:bg-green-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-300 text-white font-bold flex items-center justify-center p-4 sm:hidden transform hover:scale-105 active:scale-95 transition-all duration-200"
        style={{
          minHeight: '56px',
          minWidth: '56px',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
        aria-label={`Ligar agora: ${phoneDisplay}`}
        tabIndex="0"
      >
        <Phone size={20} className="animate-bounce" />
      </a>
      {mounted && open && createPortal(Modal, document.body)}
    </>
  );
};

export default FloatingCTA;
