import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Globe, MessageCircle, Phone, Mail, X, Bot } from 'lucide-react';
import { clinicInfo } from '@/lib/clinicInfo';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { CONTACT } from '@/lib/constants';
import { trackConversion } from '@/utils/analytics';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

// Standalone CTA modal (no floating button). Opens via 'open-cta-modal' event.
const CTAModal = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { generateWhatsAppUrl } = useWhatsApp();

  const modalRef = useFocusTrap(open, {
    onEscape: () => setOpen(false),
    autoFocus: true,
    returnFocus: true,
  });

  useEffect(() => setMounted(true), []);

  // Listen for global event to open the modal
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-cta-modal', handler);
    return () => window.removeEventListener('open-cta-modal', handler);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Prevent background scroll when CTA modal is open
  useBodyScrollLock(open);

  const whatsappUrl = generateWhatsAppUrl(CONTACT.DEFAULT_MESSAGES.WHATSAPP);
  const phoneDisplay = CONTACT.PHONE.DISPLAY;
  const phoneHref = CONTACT.PHONE.HREF;
  const email = CONTACT.EMAIL;
  const chatbotUrl = "https://chatgpt.com/g/g-quepJB90J-saraiva-vision-clinica-oftalmologica?model=gpt-4o";

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

  const handleClose = useCallback(() => setOpen(false), []);

  if (!mounted) return null;

  const Modal = (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="cta-modal-title"
      aria-describedby="cta-modal-description"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleClose} />
      <div
        ref={modalRef}
        className="relative w-full sm:max-w-md mx-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-xl p-6 sm:p-8 animate-in fade-in zoom-in-95 max-h-[90dvh] overflow-y-auto touch-scroll"
      >
        <button className="absolute top-3 right-3 p-2 rounded-full hover:bg-slate-100" aria-label={t('ui.close', 'Fechar')} onClick={handleClose}>
          <X size={18} />
        </button>
        <h3 id="cta-modal-title" className="text-xl font-semibold mb-1 text-slate-800">{t('contact.schedule_consultation', 'Agendar Consulta')}</h3>
        <p id="cta-modal-description" className="text-sm text-slate-500 mb-6">{t('contact.modal_description', 'Escolha sua forma preferida de contato. Resposta em até 1 minuto no horário comercial.')}</p>

        <div className="space-y-4">
          {/* Online Scheduling */}
          <button
            onClick={() => { try { trackConversion('schedule_start', { method: 'online' }); } catch(_) {}; safeOpenExternal(clinicInfo.onlineSchedulingUrl, 'Agendamento Online'); }}
            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 transform hover:scale-[1.02] shadow-lg w-full text-left"
          >
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
              <Globe size={24} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
                {t('contact.online_scheduling_title', 'Agendamento Online')}
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">{t('ui.recommended', 'RECOMENDADO')}</span>
              </div>
              <div className="text-sm text-blue-700 font-medium">{t('contact.online_scheduling_desc', 'Agende sua consulta diretamente pela plataforma web')}</div>
              <div className="text-xs text-slate-500 mt-1">{t('ui.available_24_7', 'Disponível 24h • Confirmação instantânea')}</div>
            </div>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => { try { trackConversion('whatsapp_click'); } catch(_) {}; safeOpenExternal(whatsappUrl, 'WhatsApp'); }}
            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-200 transform hover:scale-[1.02] shadow-lg w-full text-left"
          >
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md">
              <MessageCircle size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-lg">{t('contact.whatsapp_title', 'WhatsApp')}</div>
              <div className="text-sm text-green-700 font-medium">{t('contact.whatsapp_fast_response', 'Resposta em até 1 minuto • Mais rápido')}</div>
              <div className="text-xs text-slate-500 mt-1">{phoneDisplay}</div>
            </div>
          </button>

          {/* Chatbot */}
          <button
            onClick={() => safeOpenExternal(chatbotUrl, 'Chatbot AI')}
            className="flex items-center gap-4 p-4 rounded-2xl border border-teal-200 bg-teal-50 hover:bg-teal-100 transition w-full text-left"
          >
            <div className="p-3 rounded-xl bg-teal-500 text-white"><Bot size={22} /></div>
            <div>
              <div className="font-medium text-slate-800">{t('contact.chatbot_title', 'Chatbot AI')}</div>
              <div className="text-xs text-slate-500">{t('contact.chatbot_desc', 'Tire dúvidas sobre oftalmologia e procedimentos instantaneamente')}</div>
            </div>
          </button>

          {/* Phone */}
          <button
            onClick={() => {
              try { trackConversion('phone_click'); } catch(_) {}
              try { window.location.href = phoneHref; } catch (e) { console.error('Error initiating phone call:', e); alert(t('contact.phone_call_error', `Erro ao iniciar chamada. Ligue manualmente: ${phoneDisplay}`)); }
            }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition w-full text-left"
          >
            <div className="p-3 rounded-xl bg-blue-500 text-white"><Phone size={22} /></div>
            <div>
              <div className="font-medium text-slate-800">{t('contact.phone_title', 'Telefone')}</div>
              <div className="text-xs text-slate-500">{t('contact.phone_call_now', 'Ligue agora')}: {phoneDisplay}</div>
            </div>
          </button>

          {/* Email */}
          <button
            onClick={() => {
              try { trackConversion('email_click'); } catch(_) {}
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
          {t('contact.whatsapp_footer_help', 'Caso o WhatsApp não abra automaticamente, adicione o número manualmente:')} {phoneDisplay}.
        </div>
      </div>
    </div>
  );

  return mounted && open ? createPortal(Modal, document.body) : null;
};

export default CTAModal;
