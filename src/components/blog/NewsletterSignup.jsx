import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

/**
 * NewsletterSignup - Newsletter subscription form
 * Captures leads with educational content promise
 */
const NewsletterSignup = ({
  title = 'Receba dicas de saúde ocular',
  subtitle = 'Junte-se a mais de 5.000 pessoas que recebem conteúdo exclusivo sobre cuidados com a visão',
  benefits = [
    'Dicas semanais de especialistas',
    'Novidades em tratamentos oftalmológicos',
    'Alertas sobre campanhas de saúde',
    'Conteúdo exclusivo para assinantes'
  ],
  className = ''
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !name) {
      setStatus('error');
      setMessage('Por favor, preencha todos os campos.');
      return;
    }

    setStatus('loading');

    try {
      // Simulated API call - replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Integrate with real newsletter service (Mailchimp, SendGrid, etc.)
      // const response = await fetch('/api/newsletter', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, name })
      // });

      setStatus('success');
      setMessage('🎉 Bem-vindo! Verifique seu email para confirmar a inscrição.');
      setEmail('');
      setName('');

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setMessage('Erro ao cadastrar. Tente novamente mais tarde.');
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`my-16 bg-gradient-to-br from-cyan-50 via-cyan-50 to-indigo-50 rounded-3xl p-8 md:p-12 shadow-xl border-2 border-cyan-100 ${className}`}
      aria-label="Inscrição na newsletter"
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Info */}
          <div>
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-full mb-4 shadow-lg"
            >
              <Mail className="w-8 h-8 text-white" aria-hidden="true" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              {title}
            </h2>
            <p className="text-gray-700 text-lg mb-6">
              {subtitle}
            </p>

            {/* Benefits List */}
            <ul className="space-y-3" role="list">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 text-gray-700"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>

            {/* Trust Badge */}
            <div className="mt-6 pt-6 border-t border-cyan-200">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                <span>
                  Seus dados estão seguros. Sem spam, apenas conteúdo de qualidade.
                </span>
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200">
              <div className="space-y-4">
                {/* Name Input */}
                <div>
                  <label htmlFor="newsletter-name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Seu Nome
                  </label>
                  <input
                    id="newsletter-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Maria Silva"
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="newsletter-email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Seu Email
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-bold py-4 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Cadastrando...
                    </span>
                  ) : status === 'success' ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Inscrito com Sucesso!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-5 h-5" />
                      Quero Receber Dicas
                    </span>
                  )}
                </Button>

                {/* Status Message */}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                      status === 'success'
                        ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {status === 'success' ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span>{message}</span>
                  </motion.div>
                )}

                {/* Privacy Notice */}
                <p className="text-xs text-gray-500 text-center">
                  Ao se inscrever, você concorda com nossa{' '}
                  <a href="/politica-privacidade" className="text-cyan-600 hover:underline">
                    Política de Privacidade
                  </a>
                  .
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default NewsletterSignup;