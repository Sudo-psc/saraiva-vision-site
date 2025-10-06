/**
 * Google Reviews Fallback Data
 *
 * Avaliações reais capturadas da API do Google Places
 * Última atualização: 06/10/2025
 * Total de avaliações: 136+ (média 4.9 estrelas)
 *
 * Estes dados são usados como fallback quando a API do Google está indisponível
 * ou durante desenvolvimento/testes para garantir UX consistente.
 */

export const FALLBACK_REVIEWS = [
  {
    id: 'places-1759156232',
    reviewer: {
      displayName: 'Joaquim Rezende',
      profilePhotoUrl: 'https://lh3.googleusercontent.com/a/ACg8ocLmpF6xniuEBMK29YCl43r4LMo0cgCqIgSDHgtVAGiCssh5UA=s128-c0x00000000-cc-rp-mo',
      isAnonymous: false
    },
    starRating: 5,
    comment: 'Excelente pessoa , simpática e atenciosa  com todos trata todo mundo igual sem distinção nota máxima',
    createTime: '2025-09-29T14:30:32.000Z',
    updateTime: '2025-09-29T14:30:32.000Z',
    reviewReply: null,
    isRecent: true,
    hasResponse: false,
    wordCount: 17,
    language: 'pt',
    originalRating: 5,
    relativeTimeDescription: 'na última semana'
  },
  {
    id: 'places-1757704573',
    reviewer: {
      displayName: 'Beatriz Ferreira',
      profilePhotoUrl: 'https://lh3.googleusercontent.com/a-/ALV-UjWXteODGetJ7bVXfL6IEE67Ljbrq0VVPYHhN_4b3Ltz2bK2I8Zq8Q=s128-c0x00000000-cc-rp-mo',
      isAnonymous: false
    },
    starRating: 5,
    comment: 'Fui mt bem atendida e pela segunda vez!! A Enf. Ana mt atenciosa e simpática bem como o Dr Philipp e manter isso num ambiente bem povoado é difícil !!\nQue eles consigam dar conta com eficiência e simpatia a todos nós.\nMt obrigada.',
    createTime: '2025-09-12T19:16:13.000Z',
    updateTime: '2025-09-12T19:16:13.000Z',
    reviewReply: null,
    isRecent: true,
    hasResponse: false,
    wordCount: 42,
    language: 'pt',
    originalRating: 5,
    relativeTimeDescription: '3 semanas atrás'
  },
  {
    id: 'places-1754918893',
    reviewer: {
      displayName: 'Elis Regina Rodrigues Cordeiro',
      profilePhotoUrl: 'https://lh3.googleusercontent.com/a-/ALV-UjUi9CV51CMmDTCvlqIuUNRAd9H-JkxRshZwNJlWrwI3nGKAOUH_nQ=s128-c0x00000000-cc-rp-mo',
      isAnonymous: false
    },
    starRating: 5,
    comment: 'Que atendimento maravilhoso! Tem pessoa que realmente nasce para exalar gentileza... Minha avó foi extremamente bem atendida, da chegada a saída da clínica. Muito obrigada, Ana e Samara, por nos tratar com tanta humanidade! 🥰',
    createTime: '2025-08-11T13:28:13.000Z',
    updateTime: '2025-08-11T13:28:13.000Z',
    reviewReply: null,
    isRecent: false,
    hasResponse: false,
    wordCount: 35,
    language: 'pt',
    originalRating: 5,
    relativeTimeDescription: 'um mês atrás'
  },
  {
    id: 'places-1754658055',
    reviewer: {
      displayName: 'Flaviane Cristina',
      profilePhotoUrl: 'https://lh3.googleusercontent.com/a-/ALV-UjV8RIiTUgDc8py9ILNMzAdfw4mJrZH5ieVFkKoGj_6lhKIa8LYI=s128-c0x00000000-cc-rp-mo-ba2',
      isAnonymous: false
    },
    starRating: 5,
    comment: 'Meu filho achou o atendimento nota Mil , eu concordo com ele , obrigada pelo carinho ❤️\nAtendimento rápido e todos são muito educados e prestativos.',
    createTime: '2025-08-08T13:00:55.000Z',
    updateTime: '2025-08-08T13:00:55.000Z',
    reviewReply: null,
    isRecent: false,
    hasResponse: false,
    wordCount: 25,
    language: 'pt',
    originalRating: 5,
    relativeTimeDescription: 'um mês atrás'
  },
  {
    id: 'places-1754049956',
    reviewer: {
      displayName: 'Eliete Eliene',
      profilePhotoUrl: 'https://lh3.googleusercontent.com/a-/ALV-UjW3Xh61KR6TZDvH_N9y1UQvQkZAi5wK_3ySZ2G48kpjetylOok=s128-c0x00000000-cc-rp-mo',
      isAnonymous: false
    },
    starRating: 5,
    comment: 'Simplesmente maravilhosa minha experiência na Saraiva Vision Oftalmologia! Fui recebida com tanto carinho e atenção. Cada profissional que me atendeu demonstrou empatia, cuidado e um amor genuíno pelo que faz. Saí de lá com o coração tranquilo, sentindo que fui ouvida e cuidada de verdade. Em tempos em que o atendimento humanizado faz tanta diferença, esse lugar merece todo o reconhecimento. Gratidão imensa por tudo! ✨',
    createTime: '2025-08-01T12:05:56.000Z',
    updateTime: '2025-08-01T12:05:56.000Z',
    reviewReply: null,
    isRecent: false,
    hasResponse: false,
    wordCount: 66,
    language: 'pt',
    originalRating: 5,
    relativeTimeDescription: '2 meses atrás'
  }
];

export const FALLBACK_STATS = {
  overview: {
    totalReviews: 136,
    averageRating: 4.9,
    recentReviews: 2,
    responseRate: 0
  },
  distribution: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 5
  },
  sentiment: {
    positive: 5,
    neutral: 0,
    negative: 0,
    positivePercentage: 100,
    negativePercentage: 0
  },
  engagement: {
    averageWordCount: 37,
    reviewsWithPhotos: 0,
    businessResponses: 0,
    responseRate: 0
  },
  lastUpdated: '2025-10-06T05:19:55.427Z'
};

export const FALLBACK_PLACE_INFO = {
  id: 'ChIJVUKww7WRugARF7u2lAe7BeE',
  name: 'Saraiva Vision Oftalmologia',
  rating: 4.9,
  userRatingCount: 136,
  url: 'https://maps.google.com/?cid=16214571674651507479'
};
