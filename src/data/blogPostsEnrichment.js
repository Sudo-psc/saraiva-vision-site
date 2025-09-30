/**
 * Blog Posts Enrichment Data
 * Extended metadata for educational blog posts
 * Includes: learning points, FAQs, testimonials, warnings
 */

export const postEnrichment = {
  // Post ID 17: Cuidados visuais para esportes
  17: {
    learningPoints: [
      'Como a visão impacta diretamente o seu desempenho esportivo',
      'Principais riscos oculares em diferentes modalidades esportivas',
      'Equipamentos de proteção ocular recomendados para cada atividade',
      'Sinais de alerta que indicam necessidade de avaliação oftalmológica',
      'Cuidados preventivos para evitar lesões e fadiga visual'
    ],
    faq: [
      {
        question: 'Posso praticar esportes se uso óculos de grau?',
        answer: 'Sim! Existem soluções específicas como óculos esportivos com grau, lentes de contato adequadas para atividades físicas, ou até cirurgia refrativa para casos selecionados. O importante é uma avaliação individualizada com seu oftalmologista.'
      },
      {
        question: 'Como proteger os olhos em esportes ao ar livre?',
        answer: 'Use sempre óculos com proteção UV 400, especialmente em atividades sob sol intenso. Óculos com lentes de policarbonato oferecem proteção adicional contra impactos. Evite horários de sol mais forte (10h-16h) quando possível.'
      },
      {
        question: 'Musculação pode causar problemas de visão?',
        answer: 'Esforços extremos e técnicas inadequadas podem aumentar a pressão intraocular temporariamente. Pessoas com glaucoma ou predisposição devem informar o oftalmologista e seguir orientações específicas. Manter boa técnica e respiração adequada ajuda a prevenir riscos.'
      },
      {
        question: 'Quando devo procurar um oftalmologista após praticar esportes?',
        answer: 'Procure atendimento imediato se houver trauma ocular, dor persistente, visão embaçada, flashes de luz, ou qualquer alteração visual súbita. Avaliações regulares anuais são recomendadas para atletas.'
      }
    ],
    warnings: [
      {
        type: 'warning',
        title: 'Quando buscar ajuda imediata',
        content: 'Procure atendimento oftalmológico de emergência se apresentar: trauma ocular durante esporte, perda súbita de visão, dor intensa nos olhos, visão dupla ou qualquer sangramento ocular.'
      },
      {
        type: 'tip',
        title: 'Dica do Especialista',
        content: 'Atletas de alta performance devem realizar avaliação oftalmológica completa a cada 6-12 meses, incluindo exame de fundo de olho, pressão intraocular e teste de campo visual. A visão otimizada pode melhorar significativamente seu rendimento esportivo!'
      }
    ],
    relatedCategories: ['Prevenção', 'Tratamento'],
    readingTime: 8
  },

  // Template para futuros posts
  template: {
    learningPoints: [
      'Ponto de aprendizado 1',
      'Ponto de aprendizado 2',
      'Ponto de aprendizado 3'
    ],
    faq: [
      {
        question: 'Pergunta frequente?',
        answer: 'Resposta clara e objetiva em linguagem acessível.'
      }
    ],
    warnings: [
      {
        type: 'warning', // ou 'tip', 'info', 'summary', 'success'
        title: 'Título do aviso',
        content: 'Conteúdo do aviso em linguagem clara.'
      }
    ],
    relatedCategories: [],
    readingTime: 5
  }
};

/**
 * Get enrichment data for a specific post
 */
export const getPostEnrichment = (postId) => {
  return postEnrichment[postId] || null;
};

/**
 * Check if post has enrichment data
 */
export const hasEnrichment = (postId) => {
  return postEnrichment.hasOwnProperty(postId);
};