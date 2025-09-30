import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MessageCircle, Download, Phone } from 'lucide-react';
import { Button } from '../ui/button';

/**
 * ActionButtons - Call-to-action buttons for patient engagement
 * Facilitates appointment booking, contact, and resource downloads
 */
const ActionButtons = ({
  showAppointment = true,
  showContact = true,
  showPDF = false,
  pdfUrl = null,
  pdfTitle = 'Guia Completo',
  className = ''
}) => {
  const handleAppointment = () => {
    window.location.href = '/sobre#contact';
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/message/EHTAAAAYH7SHJ1', '_blank', 'noopener,noreferrer');
  };

  const handlePDFDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 shadow-xl ${className}`}
      role="complementary"
      aria-label="Ações rápidas"
    >
      <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
        <span>🏥</span>
        <span>Como podemos ajudar?</span>
      </h3>

      <div className="space-y-3">
        {showAppointment && (
          <Button
            onClick={handleAppointment}
            variant="secondary"
            className="w-full bg-white text-blue-700 hover:bg-blue-50 shadow-md hover:shadow-lg transition-all group"
          >
            <Calendar className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Agendar Consulta</span>
          </Button>
        )}

        {showContact && (
          <Button
            onClick={handleWhatsApp}
            variant="outline"
            className="w-full bg-green-500 text-white border-green-600 hover:bg-green-600 shadow-md hover:shadow-lg transition-all group"
          >
            <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Falar com Especialista</span>
          </Button>
        )}

        {showPDF && pdfUrl && (
          <Button
            onClick={handlePDFDownload}
            variant="outline"
            className="w-full bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm shadow-md hover:shadow-lg transition-all group"
          >
            <Download className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">{pdfTitle}</span>
          </Button>
        )}
      </div>

      {/* Contact Info */}
      <div className="mt-6 pt-6 border-t border-white/20">
        <p className="text-white/90 text-sm mb-3 font-medium">
          Atendimento imediato:
        </p>
        <a
          href="tel:+553399860142"
          className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors group"
        >
          <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-lg">(33) 99860-1427</span>
        </a>
      </div>

      {/* Trust Badge */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-white/80 text-xs text-center">
          ✓ Atendimento humanizado &nbsp;•&nbsp; ✓ Tecnologia de ponta
        </p>
      </div>
    </motion.div>
  );
};

export default ActionButtons;