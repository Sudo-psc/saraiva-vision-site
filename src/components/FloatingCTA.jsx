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
        <h3 id="cta-modal-title" className="text-xl font-semibold mb-1 text-slate-800">Agendar Consulta</h3>
        <p className="text-sm text-slate-500 mb-6">Escolha sua forma preferida de contato. Resposta em até 1 minuto no horário comercial.</p>
        <div className="space-y-4">
          <a href={clinicInfo.onlineSchedulingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition">
            <div className="p-3 rounded-xl bg-blue-500 text-white"><Globe size={22} /></div>
            <div>
              <div className="font-medium text-slate-800">{t('contact.online_scheduling_title')}</div>
              <div className="text-xs text-slate-500">{t('contact.online_scheduling_desc')}</div>
            </div>
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-green-200 bg-green-50 hover:bg-green-100 transition">
            <div className="p-3 rounded-xl bg-green-500 text-white"><MessageCircle size={22} /></div>
            <div>
              <div className="font-medium text-slate-800">WhatsApp</div>
              <div className="text-xs text-slate-500">Conversa rápida com confirmação imediata</div>
            </div>
          </a>
          <a href={chatbotUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-teal-200 bg-teal-50 hover:bg-teal-100 transition">
            <div className="p-3 rounded-xl bg-teal-500 text-white"><Bot size={22} /></div>
            <div>
              <div className="font-medium text-slate-800">{t('contact.chatbot_title')}</div>
              <div className="text-xs text-slate-500">{t('contact.chatbot_desc')}</div>
            </div>
          </a>
          <a href={phoneHref} className="flex items-center gap-4 p-4 rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition">
            <div className="p-3 rounded-xl bg-blue-500 text-white"><Phone size={22} /></div>
            <div>
              <div className="font-medium text-slate-800">Telefone</div>
              <div className="text-xs text-slate-500">Ligue agora: {phoneDisplay}</div>
            </div>
          </a>
          <a href={`mailto:${email}?subject=${encodeURIComponent(CONTACT.DEFAULT_MESSAGES.EMAIL_SUBJECT)}`} className="flex items-center gap-4 p-4 rounded-2xl border border-purple-200 bg-purple-50 hover:bg-purple-100 transition">
            <div className="p-3 rounded-xl bg-purple-500 text-white"><Mail size={22} /></div>
            <div>
              <div className="font-medium text-slate-800">E-mail</div>
              <div className="text-xs text-slate-500">Envie detalhes e preferências de horário</div>
            </div>
          </a>
        </div>
        <div className="mt-6 text-[11px] leading-snug text-slate-400">
          Caso o WhatsApp não abra automaticamente, adicione o número manualmente: {phoneDisplay}. Garantimos sigilo dos seus dados.
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[90] shadow-2xl rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 text-white font-semibold flex items-center gap-2 px-5 py-4 text-sm sm:text-base"
        aria-label="Agendar Consulta"
      >
        <Calendar size={20} /> <span className="hidden sm:inline">Agendar Consulta</span><span className="sm:hidden">Agendar</span>
      </button>
      {mounted && open && createPortal(Modal, document.body)}
    </>
  );
};

export default FloatingCTA;
