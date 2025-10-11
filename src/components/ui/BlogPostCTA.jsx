import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import WhatsAppCTA from './WhatsAppCTA';

/**
 * Componente que insere CTAs contextuais em posts de blog
 * Detecta automaticamente os melhores locais para inserir CTAs baseado no conteúdo
 */
const BlogPostCTA = ({ content, className = '' }) => {
  const processedContent = useMemo(() => {
    if (!content) return content;

    let processed = content;
    const ctaInserted = [];

    // Padrões para detectar onde inserir CTAs
    const ctaPatterns = [
      {
        // Após explicar sintomas/problems
        pattern: /(<h2[^>]*>.*(?:sintomas|sinais|problemas|impacto).{0,200}<\/h2>[\s\S]*?<\/p>)/gi,
        context: 'duvida',
        message: 'Tenho estes sintomas e gostaria de agendar uma consulta'
      },
      {
        // Após explicar tratamentos/soluções
        pattern: /(<h2[^>]*>.*(?:tratamento|cirurgia|solução|terapia).{0,200}<\/h2>[\s\S]*?<\/p>)/gi,
        context: 'tratamento',
        message: 'Gostaria de saber mais sobre este tratamento'
      },
      {
        // Após seções de prevenção
        pattern: /(<h2[^>]*>.*(?:prevenção|cuidados|evitar).{0,200}<\/h2>[\s\S]*?<\/p>)/gi,
        context: 'exame',
        message: 'Gostaria de agendar um exame oftalmológico preventivo'
      },
      {
        // Após mencionar diagnóstico/exames
        pattern: /(<h2[^>]*>.*(?:diagnóstico|exames|avaliação).{0,200}<\/h2>[\s\S]*?<\/p>)/gi,
        context: 'exame',
        message: 'Preciso agendar um exame oftalmológico'
      },
      {
        // No meio do post (após 2-3 parágrafos)
        pattern: /(<p>[^<]*<\/p>\s*<p>[^<]*<\/p>\s*<p>[^<]*<\/p>)/gi,
        context: 'agendamento',
        message: 'Li seu artigo e gostaria de agendar uma consulta'
      }
    ];

    // Inserir CTAs nos locais apropriados
    ctaPatterns.forEach(({ pattern, context, message }, index) => {
      const matches = [...processed.matchAll(pattern)];

      // Inserir CTA apenas na primeira correspondência de cada padrão
      if (matches.length > 0 && !ctaInserted.includes(index)) {
        const match = matches[0];
        const ctaComponent = `
          <div class="blog-cta-wrapper" data-cta-index="${index}">
            <div class="my-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm">
              <div class="text-center mb-4">
                <h3 class="text-lg font-semibold text-slate-900 mb-2">
                  Gostaria de agendar uma consulta?
                </h3>
                <p class="text-slate-600 text-sm">
                  Fale conosco pelo WhatsApp e agende sua consulta em minutos.
                </p>
              </div>
              <div class="flex justify-center">
                <a href="https://wa.me/5533998601427?text=${encodeURIComponent(message)}"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                  <span>Agendar pelo WhatsApp</span>
                  <span class="hidden sm:inline-block ml-2 text-sm opacity-90">(33) 99860-1427</span>
                </a>
              </div>
            </div>
          </div>
        `;

        processed = processed.replace(match[0], match[0] + ctaComponent);
        ctaInserted.push(index);
      }
    });

    // Adicionar CTA no final do post se nenhum foi inserido
    if (ctaInserted.length === 0) {
      const finalCTA = `
        <div class="blog-cta-wrapper-final my-12 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-8 shadow-sm">
          <div class="text-center">
            <h3 class="text-2xl font-bold text-slate-900 mb-3">
              Precisa de ajuda oftalmológica?
            </h3>
            <p class="text-slate-600 mb-6 max-w-2xl mx-auto">
              Após ler este artigo, se você tiver alguma dúvida ou precisar agendar uma consulta,
              nossa equipe está pronta para ajudar. Fale conosco pelo WhatsApp.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://wa.me/5533998601427?text=Li%20seu%20artigo%20e%20gostaria%20de%20agendar%20uma%20consulta"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
                <span>Falar no WhatsApp</span>
                <span class="hidden sm:inline-block ml-2 text-sm opacity-90">(33) 99860-1427</span>
              </a>
              <a href="tel:+5533998601427"
                 class="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-medium rounded-xl transition-all duration-300">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span>Ligar Agora</span>
              </a>
            </div>
          </div>
        </div>
      `;

      processed += finalCTA;
    }

    return processed;
  }, [content]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

export default BlogPostCTA;