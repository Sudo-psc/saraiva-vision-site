'use client';

import { MessageCircle } from 'lucide-react';
import { trackCtaClick } from '@/lib/laas/analytics';
import { LAAS_WHATSAPP_NUMBER } from '@/lib/laas/config';

export function FloatingWhatsApp() {
  const handleClick = () => {
    trackCtaClick('whatsapp', 'floating');
    const message = encodeURIComponent('Olá! Gostaria de saber mais sobre o LAAS.');
    window.open(`https://wa.me/${LAAS_WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 group"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Fale conosco
      </span>
    </button>
  );
}
