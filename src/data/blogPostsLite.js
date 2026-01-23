/**
 * Blog posts metadata (lightweight version for HomePage)
 * Only includes essential fields for preview cards - no full content
 * Full content is lazy loaded only when visiting /blog/:slug
 *
 * This reduces initial bundle by ~350KB (from blogPosts.js)
 */

export const blogPostsLite = [
  {
    id: 34,
    slug: "olho-seco-cronico-nao-tratado-consequencias-risco-perda-visual",
    title: "Olho Seco Crônico Não Tratado: Consequências a Longo Prazo e Risco de Perda Visual",
    excerpt: "Entenda como a inflamação persistente do olho seco pode gerar neovascularização, cicatrizes corneanas e risco de perda visual quando não é tratada.",
    author: "Dr. Philipe Saraiva Cruz",
    date: "2025-11-23",
    category: "Tratamento",
    image: null,
    featured: true,
    readingTimeMinutes: 8
  },
  {
    id: 31,
    slug: "olho-seco-plugs-lacrimais-meibografia-caratinga-mg",
    title: "Olho Seco, Plugs Lacrimais e Meibografia: Diagnóstico e Tratamento Avançado em Caratinga, MG",
    excerpt: "Descubra como plugs lacrimais e meibografia ajudam no diagnóstico e tratamento do olho seco. Agende sua consulta na Clínica Saraiva Vision em Caratinga, MG.",
    author: "Dr. Philipe Saraiva Cruz",
    date: "2025-10-31",
    category: "Tratamentos",
    image: "/Blog/olho-seco-plugs-lacrimais-meibografia-optimized-1200w.webp",
    featured: true,
    readingTimeMinutes: 12
  },
  {
    id: 27,
    slug: "monovisao-lentes-multifocais-presbiopia-caratinga-mg",
    title: "Monovisão ou Lentes Multifocais: Qual a Melhor Solução para Presbiopia?",
    excerpt: "Descubra as diferenças entre monovisão e lentes multifocais para tratar presbiopia. Orientação especializada na Clínica Saraiva Vision em Caratinga, MG.",
    author: "Dr. Philipe Saraiva Cruz",
    date: "2025-10-13",
    category: "Dúvidas Frequentes",
    image: "/Blog/monovisao-lentes-multifocais-presbiopia.webp",
    featured: false,
    readingTimeMinutes: 10
  },
  {
    id: 26,
    slug: "hipermetropia-criancas-estrabismo-ambliopia-tratamento",
    title: "Hipermetropia em Crianças: Relação com Estrabismo e Ambliopia",
    excerpt: "Entenda como a hipermetropia em crianças pode causar estrabismo e ambliopia, e a importância do diagnóstico precoce para preservar a visão.",
    author: "Dr. Philipe Saraiva Cruz",
    date: "2025-10-12",
    category: "Prevenção",
    image: "/Blog/hipermetropia-criancas-estrabismo-ambliopia.webp",
    featured: false,
    readingTimeMinutes: 7
  },
  {
    id: 25,
    slug: "luz-pulsada-irpl-tratamento-olho-seco-disfuncao-glandulas-meibomio",
    title: "Luz Pulsada IRPL: Tratamento Revolucionário para Olho Seco e Disfunção das Glândulas de Meibômio",
    excerpt: "Descubra como a Luz Pulsada IRPL revoluciona o tratamento do olho seco evaporativo, restaurando a função das glândulas de Meibômio de forma não invasiva.",
    author: "Dr. Philipe Saraiva Cruz",
    date: "2025-10-11",
    category: "Tratamentos",
    image: "/Blog/luz-pulsada-irpl-tratamento-olho-seco.webp",
    featured: true,
    readingTimeMinutes: 9
  },
  {
    id: 24,
    slug: "cuidados-olhos-criancas-quando-levar-oftalmologista",
    title: "Cuidados com os Olhos das Crianças: Quando Levar ao Oftalmologista?",
    excerpt: "Guia completo sobre saúde visual infantil: sinais de alerta, idade ideal para consultas e como proteger a visão das crianças desde cedo.",
    author: "Dr. Philipe Saraiva Cruz",
    date: "2025-10-10",
    category: "Prevenção",
    image: "/Blog/cuidados-olhos-criancas.webp",
    featured: false,
    readingTimeMinutes: 8
  }
];

/**
 * Get latest N posts for homepage preview
 * @param {number} count - Number of posts to return
 * @returns {Array} - Latest posts sorted by date
 */
export const getLatestPostsLite = (count = 3) => {
  return [...blogPostsLite]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, count);
};

/**
 * Get featured posts for homepage
 * @param {number} count - Number of featured posts to return
 * @returns {Array} - Featured posts
 */
export const getFeaturedPostsLite = (count = 3) => {
  return blogPostsLite
    .filter(post => post.featured)
    .slice(0, count);
};

export default blogPostsLite;
