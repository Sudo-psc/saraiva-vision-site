/**
 * Sistema de Gerenciamento de Blog Posts
 * Centraliza todos os artigos do blog da Clínica Saraiva Vision
 */

export const blogPosts = [
    {
        id: 'lentes-contato-presbiopia-caratinga',
        title: 'Lentes de Contato para Presbiopia: Soluções Modernas e Confortáveis em Caratinga, MG',
        slug: 'lentes-contato-presbiopia-caratinga',
        excerpt: 'Descubra as melhores soluções em lentes de contato para presbiopia em Caratinga, MG. Tratamento personalizado com Dr. Philipe Saraiva Cruz na Clínica Saraiva Vision.',
        content: '/src/content/blog/lentes-contato-presbiopia-caratinga.md',
        component: 'BlogPostPresbiopia',
        author: {
            name: 'Dr. Philipe Saraiva Cruz',
            credentials: 'CRM-MG 69.870',
            avatar: '/images/team/dr-philipe-saraiva-cruz.jpg',
            bio: 'Oftalmologista especializado em lentes de contato e cirurgias refrativas'
        },
        publishedAt: '2024-12-25',
        updatedAt: '2024-12-25',
        readingTime: '8 min',
        category: {
            name: 'Lentes de Contato',
            slug: 'lentes-de-contato',
            color: 'blue'
        },
        tags: [
            { name: 'presbiopia', slug: 'presbiopia' },
            { name: 'lentes de contato', slug: 'lentes-de-contato' },
            { name: 'vista cansada', slug: 'vista-cansada' },
            { name: 'oftalmologia', slug: 'oftalmologia' },
            { name: 'Caratinga', slug: 'caratinga' }
        ],
        featured: true,
        status: 'published',
        seo: {
            metaTitle: 'Lentes de Contato para Presbiopia em Caratinga, MG | Dr. Philipe Saraiva Cruz',
            metaDescription: 'Lentes de contato para presbiopia em Caratinga, MG. Tratamento especializado com Dr. Philipe Saraiva Cruz. Agende sua consulta: (33) 99860-1427',
            keywords: 'lentes de contato presbiopia, vista cansada Caratinga, oftalmologista Caratinga, Dr Philipe Saraiva Cruz, lentes multifocais',
            canonicalUrl: '/blog/lentes-contato-presbiopia-caratinga',
            ogImage: '/images/blog/lentes-contato-presbiopia-og.jpg',
            ogType: 'article'
        },
        schema: {
            type: 'MedicalArticle',
            medicalAudience: 'Patient',
            about: 'Presbyopia contact lens treatment',
            author: {
                name: 'Dr. Philipe Saraiva Cruz',
                credentials: 'CRM-MG 69.870',
                affiliation: 'Clínica Saraiva Vision'
            }
        },
        relatedPosts: [],
        comments: {
            enabled: false,
            count: 0
        },
        social: {
            shares: 0,
            likes: 0
        },
        analytics: {
            views: 0,
            uniqueViews: 0,
            avgTimeOnPage: 0,
            bounceRate: 0
        }
    }
];

// Categorias disponíveis
export const blogCategories = [
    {
        name: 'Lentes de Contato',
        slug: 'lentes-de-contato',
        description: 'Artigos sobre adaptação, cuidados e tipos de lentes de contato',
        color: 'blue',
        icon: '👁️'
    },
    {
        name: 'Cirurgias Oculares',
        slug: 'cirurgias-oculares',
        description: 'Informações sobre procedimentos cirúrgicos oftalmológicos',
        color: 'green',
        icon: '🔬'
    },
    {
        name: 'Saúde Ocular',
        slug: 'saude-ocular',
        description: 'Dicas e informações sobre cuidados com a visão',
        color: 'purple',
        icon: '👀'
    },
    {
        name: 'Tecnologia',
        slug: 'tecnologia',
        description: 'Novidades em equipamentos e técnicas oftalmológicas',
        color: 'orange',
        icon: '⚡'
    }
];

// Tags mais utilizadas
export const popularTags = [
    { name: 'presbiopia', slug: 'presbiopia', count: 1 },
    { name: 'lentes de contato', slug: 'lentes-de-contato', count: 1 },
    { name: 'vista cansada', slug: 'vista-cansada', count: 1 },
    { name: 'oftalmologia', slug: 'oftalmologia', count: 1 },
    { name: 'Caratinga', slug: 'caratinga', count: 1 }
];

// Funções utilitárias
export const getBlogPostBySlug = (slug) => {
    return blogPosts.find(post => post.slug === slug);
};

export const getBlogPostsByCategory = (categorySlug) => {
    return blogPosts.filter(post => post.category.slug === categorySlug);
};

export const getBlogPostsByTag = (tagSlug) => {
    return blogPosts.filter(post =>
        post.tags.some(tag => tag.slug === tagSlug)
    );
};

export const getFeaturedPosts = () => {
    return blogPosts.filter(post => post.featured && post.status === 'published');
};

export const getRecentPosts = (limit = 5) => {
    return blogPosts
        .filter(post => post.status === 'published')
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, limit);
};

export const searchPosts = (query) => {
    const searchTerm = query.toLowerCase();
    return blogPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        post.tags.some(tag => tag.name.toLowerCase().includes(searchTerm))
    );
};

// Metadados do blog
export const blogMetadata = {
    title: 'Blog - Clínica Saraiva Vision',
    description: 'Artigos especializados sobre oftalmologia, lentes de contato, cirurgias oculares e cuidados com a visão em Caratinga, MG.',
    author: 'Dr. Philipe Saraiva Cruz',
    siteUrl: 'https://saraivavisao.com.br',
    language: 'pt-BR',
    social: {
        twitter: '@saraivavisao',
        facebook: 'saraivavisao',
        instagram: '@saraivavisao'
    }
};