import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Shield, Gift } from 'lucide-react';

/**
 * Newsletter Form Component
 * Jotform subscription form for Saraiva Vision blog
 *
 * @author Dr. Philipe Saraiva Cruz
 */
const NewsletterForm = () => {
  useEffect(() => {
    // Load Jotform embed handler script
    const script = document.createElement('script');
    script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
    script.async = true;

    document.head.appendChild(script);

    // Initialize Jotform embed after script loads
    script.onload = () => {
      if (window.jotformEmbedHandler) {
        window.jotformEmbedHandler("iframe[id='JotFormIFrame-252818674112054']", "https://form.jotform.com/");
      }
    };

    // Cleanup function to remove script on unmount
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="newsletter-container max-w-4xl mx-auto my-12"
    >
      <div className="bg-gradient-to-br from-cyan-50 via-white to-cyan-50 rounded-3xl shadow-2xl overflow-hidden border border-cyan-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-8 py-6 text-white">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-cyan-50">Newsletter Exclusiva</h2>
          </div>
          <p className="text-center text-cyan-100 text-lg max-w-2xl mx-auto">
            Receba conteúdos especializados sobre saúde ocular diretamente no seu e-mail
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-8 py-6 bg-cyan-50/30">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-cyan-100"
          >
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Conteúdo Exclusivo
              </h3>
              <p className="text-xs text-gray-600">
                Artigos especializados em primeira mão
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-cyan-100"
          >
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Privacidade Garantida
              </h3>
              <p className="text-xs text-gray-600">
                Seus dados protegidos pela LGPD
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-cyan-100"
          >
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Ofertas Especiais
              </h3>
              <p className="text-xs text-gray-600">
                Descontos exclusivos em lentes
              </p>
            </div>
          </motion.div>
        </div>

        {/* Form Section */}
        <div className="px-8 pb-8">
          {/* Jotform Iframe */}
          <div className="w-full bg-white rounded-2xl shadow-lg overflow-auto border border-cyan-100">
            <iframe
              id="JotFormIFrame-252818674112054"
              title="Receba informações exclusivas, dicas de especialistas, novidades sobre tratamentos e promoções da SaraivaVision direto no seu e-mail! "
              onLoad={() => {
                // Scroll to top when iframe loads (safe function call)
                try {
                  window.parent.scrollTo(0, 0);
                } catch (e) {
                  // Ignore CORS errors - expected behavior for cross-origin iframes
                  console.debug('[JotForm] CORS restriction on scrollTo - this is expected and safe');
                }
              }}
              allowTransparency="true"
              allow="payment; fullscreen"
              src="https://form.jotform.com/252818674112054"
              frameBorder="0"
              style={{
                minWidth: '100%',
                maxWidth: '100%',
                height: '700px',
                minHeight: '600px',
                border: 'none'
              }}
              scrolling="yes"
            />
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="px-8 pb-6">
          <div className="bg-gradient-to-r from-cyan-50 to-cyan-50 rounded-xl p-4 border border-cyan-200">
            <p className="text-xs text-gray-600 text-center flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-cyan-600" />
              <span>
                <strong className="text-gray-900">Seus dados estão seguros.</strong> Respeitamos sua privacidade conforme a LGPD.
                Ao se inscrever, você concorda em receber e-mails da Saraiva Vision. Cancele quando quiser.
              </span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsletterForm;
