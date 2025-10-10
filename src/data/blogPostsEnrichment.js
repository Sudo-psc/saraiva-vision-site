/**
 * Blog Posts Enrichment Data
 * Extended metadata for educational blog posts
 * Includes: learning points, FAQs, testimonials, warnings
 */

export const postEnrichment = {
  // Post ID 1: Catarata - Lentes Premium
  1: {
    learningPoints: [
      'O que é catarata e como ela afeta sua visão no dia a dia',
      'Sintomas de alerta que indicam necessidade de consulta oftalmológica',
      'Como funciona a cirurgia de catarata e suas taxas de sucesso',
      'Diferenças entre lentes padrão e lentes premium (multifocais e tóricas)',
      'Cuidados preventivos e hábitos para manter a saúde ocular'
    ]
  },

  // Post ID 2: Presbiopia (Vista Cansada)
  2: {
    learningPoints: [
      'O que é presbiopia e por que ela ocorre após os 40 anos',
      'Principais sintomas da vista cansada e quando procurar ajuda',
      'Opções de tratamento: óculos, lentes de contato e cirurgia',
      'Como a cirurgia de presbiopia pode reduzir dependência de óculos',
      'Diferença entre presbiopia e hipermetropia'
    ]
  },

  // Post ID 3: Obstrução do Ducto Lacrimal
  3: {
    learningPoints: [
      'Causas da obstrução do ducto lacrimal e lacrimejamento excessivo',
      'Sintomas de alerta: quando o lacrimejamento indica problema sério',
      'Tratamentos disponíveis: desde conservador até cirurgia',
      'Como a cirurgia de dacriocistorrinostomia funciona',
      'Cuidados pós-operatórios e prevenção de complicações'
    ]
  },

  // Post ID 4: Lentes Premium para Catarata
  4: {
    learningPoints: [
      'Benefícios das lentes intraoculares premium em cirurgia de catarata',
      'Diferença entre lentes multifocais, tóricas e monofocais',
      'Como as lentes premium corrigem múltiplos problemas visuais',
      'Quem pode se beneficiar mais das lentes premium',
      'Cuidados e acompanhamento após cirurgia de catarata'
    ]
  },

  // Post ID 5: Oftalmologia Pediátrica
  5: {
    learningPoints: [
      'Quando fazer a primeira consulta oftalmológica da criança',
      'Principais problemas de visão em crianças e como identificá-los',
      'Sinais de alerta que os pais devem observar no comportamento infantil',
      'Importância do diagnóstico precoce para desenvolvimento visual',
      'Tratamentos e correções disponíveis para problemas pediátricos'
    ]
  },

  // Post ID 6: Pterígio
  6: {
    learningPoints: [
      'O que é pterígio e como a exposição solar contribui para seu desenvolvimento',
      'Sintomas iniciais e quando o pterígio requer tratamento cirúrgico',
      'Como a cirurgia de pterígio é realizada e suas taxas de sucesso',
      'Prevenção: importância de óculos de sol e proteção UV',
      'Cuidados pós-operatórios e como evitar recidiva'
    ]
  },

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