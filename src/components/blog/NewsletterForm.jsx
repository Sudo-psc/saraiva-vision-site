import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Newsletter Form Component
 * Integrates WebForm subscription form for Saraiva Vision blog
 */
const NewsletterForm = () => {
  useEffect(() => {
    // Dynamically load WebForm script
    const script = document.createElement('script');
    script.src = '//web.webformscr.com/apps/fc3/build/loader.js';
    script.async = true;
    script.setAttribute('sp-form-id', '40b2c4a6498ea30aea1114a8f94542f492141eca71b2941b72e36f38cf9fb5c8');

    // Append script to the form container
    const formContainer = document.getElementById('newsletter-form-container');
    if (formContainer) {
      formContainer.appendChild(script);
    }

    // Cleanup function to remove script on unmount
    return () => {
      if (formContainer && script.parentNode === formContainer) {
        formContainer.removeChild(script);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-2xl p-8 md:p-10 shadow-xl border border-primary-100"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-lg">
              <Mail className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Fique por dentro das novidades
          </h2>

          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Receba artigos exclusivos sobre saúde ocular, dicas de prevenção e
            as últimas novidades em oftalmologia diretamente no seu e-mail.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-primary-100 shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-text-primary text-sm mb-1">
                Conteúdo Exclusivo
              </h3>
              <p className="text-xs text-text-secondary">
                Artigos especializados antes de todos
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-primary-100 shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-text-primary text-sm mb-1">
                Sem Spam
              </h3>
              <p className="text-xs text-text-secondary">
                Apenas conteúdo de qualidade
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-primary-100 shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-text-primary text-sm mb-1">
                Cancele Quando Quiser
              </h3>
              <p className="text-xs text-text-secondary">
                Cancelamento fácil e rápido
              </p>
            </div>
          </div>
        </div>

        {/* WebForm Container */}
        <div
          id="newsletter-form-container"
          className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
          role="region"
          aria-label="Formulário de inscrição na newsletter"
        >
          {/* WebForm script will be injected here */}
          <noscript>
            <div className="text-center p-6 bg-amber-50 rounded-lg border border-amber-200">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-3" />
              <p className="text-text-secondary">
                Por favor, habilite o JavaScript no seu navegador para se inscrever na newsletter.
              </p>
            </div>
          </noscript>
        </div>

        {/* Privacy Notice */}
        <p className="text-xs text-text-muted text-center mt-6 px-4">
          🔒 Seus dados estão seguros. Respeitamos sua privacidade conforme a LGPD.
          Ao se inscrever, você concorda em receber e-mails da Saraiva Vision.
        </p>
      </div>
    </motion.div>
  );
};

export default NewsletterForm;
