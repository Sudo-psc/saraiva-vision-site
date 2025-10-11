import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Phone } from 'lucide-react';

/**
 * Componente CTA contextual para WhatsApp
 * Pode ser usado em serviços, posts de blog e páginas
 */
const WhatsAppCTA = ({
  variant = 'default',
  size = 'medium',
  message = 'Olhei seu site e gostaria de agendar uma consulta',
  showPhone = false,
  className = '',
  context = 'agendamento'
}) => {
  const phoneNumber = '5533998601427';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  const phoneUrl = `tel:+${phoneNumber}`;

  const baseClasses = 'relative overflow-hidden rounded-2xl transition-all duration-300';

  const variants = {
    default: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 border-green-500 text-green-700 hover:bg-green-50 hover:border-green-600 bg-white',
    minimal: 'text-green-600 hover:text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg',
    card: 'bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-200 text-green-800 hover:border-green-300'
  };

  const sizes = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  const messages = {
    agendamento: 'Olhei seu site e gostaria de agendar uma consulta',
    duvida: 'Tenho uma dúvida sobre um tratamento e gostaria de mais informações',
    emergencia: 'Preciso de uma consulta o mais rápido possível. É uma emergência?',
    exame: 'Gostaria de agendar um exame oftalmológico',
    cirurgia: 'Tenho interesse em saber mais sobre cirurgias oftalmológicas',
    lentes: 'Gostaria de agendar uma adaptação de lentes de contato',
    pediatria: 'Preciso agendar uma consulta oftalmológica para minha criança',
    laudo: 'Preciso de um laudo oftalmológico para CNH/concurso'
  };

  const contextMessage = messages[context] || message;

  const buttonContent = (
    <>
      {/* Icone do WhatsApp */}
      <MessageCircle className="w-5 h-5 mr-2 flex-shrink-0" />

      {/* Texto principal */}
      <span className="font-medium">
        {variant === 'minimal' ? 'Falar no WhatsApp' : 'Agendar pelo WhatsApp'}
      </span>

      {/* Telefone (se mostrado) */}
      {showPhone && (
        <span className="hidden sm:inline-block ml-2 text-sm opacity-90">
          (33) 99860-1427
        </span>
      )}

      {/* Efeito de brilho */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </>
  );

  if (variant === 'minimal') {
    return (
      <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClasses} ${variants[variant]} ${sizes[size]} inline-flex items-center justify-center group`}
          aria-label="Agendar consulta pelo WhatsApp"
        >
          {buttonContent}
        </a>
        {showPhone && (
          <a
            href={phoneUrl}
            className={`${baseClasses} ${variants.outline} ${sizes[size]} inline-flex items-center justify-center group`}
            aria-label="Ligar para a clínica"
          >
            <Phone className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="font-medium">Ligar Agora</span>
          </a>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full group"
        aria-label="Agendar consulta pelo WhatsApp"
      >
        {buttonContent}
      </a>
    </motion.div>
  );
};

export default WhatsAppCTA;