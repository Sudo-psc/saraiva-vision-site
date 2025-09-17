#!/usr/bin/env node

/**
 * Mock WordPress API Server
 * Provides sample blog data for development and testing
 */

import express from 'express';
import cors from 'cors';


const app = express();
const PORT = 8083;

// Middleware
app.use(cors());
app.use(express.json());

// Sample blog posts data
const samplePosts = [
  {
    id: 1,
    date: '2024-03-15T10:00:00',
    date_gmt: '2024-03-15T13:00:00',
    guid: { rendered: 'http://localhost:8080/?p=1' },
    modified: '2024-03-15T10:00:00',
    modified_gmt: '2024-03-15T13:00:00',
    slug: 'importancia-exame-fundo-de-olho',
    status: 'publish',
    type: 'post',
    link: 'http://localhost:8080/importancia-exame-fundo-de-olho/',
    title: {
      rendered: 'A Importância do Exame de Fundo de Olho na Prevenção de Doenças Oculares'
    },
    content: {
      rendered: `
        <p>O exame de fundo de olho, também conhecido como fundoscopia ou oftalmoscopia, é um dos procedimentos mais importantes na avaliação oftalmológica. Este exame permite ao médico visualizar estruturas internas do olho, incluindo a retina, o nervo óptico e os vasos sanguíneos.</p>
        
        <h3>Por que o exame é importante?</h3>
        <p>Através do fundo de olho, é possível detectar precocemente diversas condições que podem afetar a visão:</p>
        
        <ul>
          <li><strong>Retinopatia diabética:</strong> Complicação do diabetes que pode levar à cegueira</li>
          <li><strong>Glaucoma:</strong> Doença silenciosa que danifica o nervo óptico</li>
          <li><strong>Degeneração macular:</strong> Principal causa de perda visual em idosos</li>
          <li><strong>Descolamento de retina:</strong> Emergência oftalmológica que requer tratamento imediato</li>
        </ul>
        
        <h3>Como é realizado o exame?</h3>
        <p>O procedimento é simples e indolor. Geralmente é aplicado um colírio para dilatar a pupila, permitindo uma melhor visualização das estruturas internas. O médico utiliza um oftalmoscópio para examinar o fundo do olho.</p>
        
        <p>É recomendado que pessoas acima de 40 anos façam o exame anualmente, e aqueles com diabetes ou histórico familiar de doenças oculares devem seguir orientação médica específica.</p>
      `,
      protected: false
    },
    excerpt: {
      rendered: 'O exame de fundo de olho é essencial para detectar precocemente doenças como glaucoma, retinopatia diabética e degeneração macular. Saiba mais sobre sua importância.',
      protected: false
    },
    author: 1,
    featured_media: 1,
    comment_status: 'open',
    ping_status: 'open',
    sticky: false,
    template: '',
    format: 'standard',
    meta: [],
    categories: [1, 3],
    tags: [1, 2, 3],
    _embedded: {
      author: [{
        id: 1,
        name: 'Dr. Philipe Saraiva',
        slug: 'dr-philipe-saraiva',
        description: 'Oftalmologista especializado em cirurgia refrativa e doenças da retina.',
        avatar_urls: {
          '24': '/img/drphilipe_perfil.png',
          '48': '/img/drphilipe_perfil.png',
          '96': '/img/drphilipe_perfil.png'
        }
      }],
      'wp:featuredmedia': [{
        id: 1,
        source_url: '/img/blog/exame-fundo-olho.jpg',
        media_details: {
          sizes: {
            thumbnail: { source_url: '/img/blog/exame-fundo-olho-thumb.jpg' },
            medium: { source_url: '/img/blog/exame-fundo-olho-medium.jpg' },
            large: { source_url: '/img/blog/exame-fundo-olho.jpg' },
            full: { source_url: '/img/blog/exame-fundo-olho.jpg' }
          }
        }
      }],
      'wp:term': [
        [
          { id: 1, name: 'Exames Oftalmológicos', slug: 'exames' },
          { id: 3, name: 'Prevenção', slug: 'prevencao' }
        ],
        [
          { id: 1, name: 'fundo de olho', slug: 'fundo-de-olho' },
          { id: 2, name: 'exames', slug: 'exames' },
          { id: 3, name: 'prevenção', slug: 'prevencao' }
        ]
      ]
    }
  },
  {
    id: 2,
    date: '2024-03-10T14:30:00',
    date_gmt: '2024-03-10T17:30:00',
    guid: { rendered: 'http://localhost:8080/?p=2' },
    modified: '2024-03-10T14:30:00',
    modified_gmt: '2024-03-10T17:30:00',
    slug: 'cirurgia-refrativa-laser',
    status: 'publish',
    type: 'post',
    link: 'http://localhost:8080/cirurgia-refrativa-laser/',
    title: {
      rendered: 'Cirurgia Refrativa a Laser: Liberdade dos Óculos e Lentes de Contato'
    },
    content: {
      rendered: `
        <p>A cirurgia refrativa a laser é um procedimento seguro e eficaz para corrigir problemas de visão como miopia, hipermetropia e astigmatismo. Com tecnologia de ponta, é possível alcançar excelentes resultados e proporcionar maior qualidade de vida aos pacientes.</p>
        
        <h3>Tipos de cirurgia refrativa</h3>
        <ul>
          <li><strong>LASIK:</strong> Técnica mais popular, com recuperação rápida</li>
          <li><strong>PRK:</strong> Indicada para córneas mais finas</li>
          <li><strong>SMILE:</strong> Técnica mais moderna, menos invasiva</li>
        </ul>
        
        <h3>Candidatos ideais</h3>
        <p>A cirurgia é indicada para pessoas maiores de 18 anos, com grau estável há pelo menos um ano, sem doenças oculares ativas e com córneas saudáveis.</p>
        
        <p>O procedimento é realizado com anestesia tópica (colírio) e dura aproximadamente 15 minutos para ambos os olhos. A recuperação é rápida, e a maioria dos pacientes retorna às atividades normais em poucos dias.</p>
      `,
      protected: false
    },
    excerpt: {
      rendered: 'Descubra como a cirurgia refrativa a laser pode proporcionar liberdade dos óculos e lentes de contato. Conheça os tipos de procedimento e candidatos ideais.',
      protected: false
    },
    author: 1,
    featured_media: 2,
    comment_status: 'open',
    ping_status: 'open',
    sticky: false,
    template: '',
    format: 'standard',
    meta: [],
    categories: [2],
    tags: [4, 5, 6],
    _embedded: {
      author: [{
        id: 1,
        name: 'Dr. Philipe Saraiva',
        slug: 'dr-philipe-saraiva',
        description: 'Oftalmologista especializado em cirurgia refrativa e doenças da retina.',
        avatar_urls: {
          '24': '/img/drphilipe_perfil.png',
          '48': '/img/drphilipe_perfil.png',
          '96': '/img/drphilipe_perfil.png'
        }
      }],
      'wp:featuredmedia': [{
        id: 2,
        source_url: '/img/blog/cirurgia-refrativa.jpg',
        media_details: {
          sizes: {
            thumbnail: { source_url: '/img/blog/cirurgia-refrativa-thumb.jpg' },
            medium: { source_url: '/img/blog/cirurgia-refrativa-medium.jpg' },
            large: { source_url: '/img/blog/cirurgia-refrativa.jpg' },
            full: { source_url: '/img/blog/cirurgia-refrativa.jpg' }
          }
        }
      }],
      'wp:term': [
        [
          { id: 2, name: 'Cirurgias', slug: 'cirurgias' }
        ],
        [
          { id: 4, name: 'cirurgia refrativa', slug: 'cirurgia-refrativa' },
          { id: 5, name: 'laser', slug: 'laser' },
          { id: 6, name: 'miopia', slug: 'miopia' }
        ]
      ]
    }
  },
  {
    id: 3,
    date: '2024-03-05T09:15:00',
    date_gmt: '2024-03-05T12:15:00',
    guid: { rendered: 'http://localhost:8080/?p=3' },
    modified: '2024-03-05T09:15:00',
    modified_gmt: '2024-03-05T12:15:00',
    slug: 'cuidados-lentes-contato',
    status: 'publish',
    type: 'post',
    link: 'http://localhost:8080/cuidados-lentes-contato/',
    title: {
      rendered: 'Cuidados Essenciais com Lentes de Contato: Prevenindo Infecções Oculares'
    },
    content: {
      rendered: `
        <p>As lentes de contato são uma excelente opção para correção visual, proporcionando conforto e praticidade. No entanto, é fundamental seguir cuidados específicos para prevenir infecções e complicações oculares.</p>
        
        <h3>Higiene é fundamental</h3>
        <p>Sempre lave as mãos com sabão neutro e seque com toalha limpa antes de manusear as lentes. Este é o primeiro e mais importante passo para prevenir contaminações.</p>
        
        <h3>Cuidados com o estojo</h3>
        <ul>
          <li>Troque o estojo a cada 3 meses</li>
          <li>Lave com solução específica, nunca com água</li>
          <li>Deixe secar ao ar livre após a limpeza</li>
        </ul>
        
        <h3>Sinais de alerta</h3>
        <p>Procure o oftalmologista imediatamente se apresentar:</p>
        <ul>
          <li>Vermelhidão persistente</li>
          <li>Dor ou desconforto</li>
          <li>Visão embaçada</li>
          <li>Sensibilidade à luz</li>
          <li>Secreção ocular</li>
        </ul>
        
        <p>Lembre-se: nunca durma com lentes de contato que não sejam próprias para uso noturno, e respeite sempre o prazo de validade das lentes.</p>
      `,
      protected: false
    },
    excerpt: {
      rendered: 'Aprenda os cuidados essenciais com lentes de contato para prevenir infecções oculares e manter a saúde dos seus olhos em dia.',
      protected: false
    },
    author: 1,
    featured_media: 3,
    comment_status: 'open',
    ping_status: 'open',
    sticky: false,
    template: '',
    format: 'standard',
    meta: [],
    categories: [4],
    tags: [7, 8, 9],
    _embedded: {
      author: [{
        id: 1,
        name: 'Dr. Philipe Saraiva',
        slug: 'dr-philipe-saraiva',
        description: 'Oftalmologista especializado em cirurgia refrativa e doenças da retina.',
        avatar_urls: {
          '24': '/img/drphilipe_perfil.png',
          '48': '/img/drphilipe_perfil.png',
          '96': '/img/drphilipe_perfil.png'
        }
      }],
      'wp:featuredmedia': [{
        id: 3,
        source_url: '/img/blog/lentes-contato.jpg',
        media_details: {
          sizes: {
            thumbnail: { source_url: '/img/blog/lentes-contato-thumb.jpg' },
            medium: { source_url: '/img/blog/lentes-contato-medium.jpg' },
            large: { source_url: '/img/blog/lentes-contato.jpg' },
            full: { source_url: '/img/blog/lentes-contato.jpg' }
          }
        }
      }],
      'wp:term': [
        [
          { id: 4, name: 'Cuidados', slug: 'cuidados' }
        ],
        [
          { id: 7, name: 'lentes de contato', slug: 'lentes-de-contato' },
          { id: 8, name: 'cuidados', slug: 'cuidados' },
          { id: 9, name: 'higiene', slug: 'higiene' }
        ]
      ]
    }
  }
];

// Sample categories
const sampleCategories = [
  { id: 1, name: 'Exames Oftalmológicos', slug: 'exames', description: 'Posts sobre diferentes tipos de exames oftalmológicos' },
  { id: 2, name: 'Cirurgias', slug: 'cirurgias', description: 'Informações sobre procedimentos cirúrgicos' },
  { id: 3, name: 'Prevenção', slug: 'prevencao', description: 'Dicas de prevenção e cuidados com a saúde ocular' },
  { id: 4, name: 'Cuidados', slug: 'cuidados', description: 'Cuidados gerais com a saúde dos olhos' }
];

// Sample tags
const sampleTags = [
  { id: 1, name: 'fundo de olho', slug: 'fundo-de-olho' },
  { id: 2, name: 'exames', slug: 'exames' },
  { id: 3, name: 'prevenção', slug: 'prevencao' },
  { id: 4, name: 'cirurgia refrativa', slug: 'cirurgia-refrativa' },
  { id: 5, name: 'laser', slug: 'laser' },
  { id: 6, name: 'miopia', slug: 'miopia' },
  { id: 7, name: 'lentes de contato', slug: 'lentes-de-contato' },
  { id: 8, name: 'cuidados', slug: 'cuidados' },
  { id: 9, name: 'higiene', slug: 'higiene' }
];

// WordPress API Routes

// Posts endpoint
app.get('/wp-json/wp/v2/posts', (req, res) => {
  console.log('📝 Posts request:', req.query);
  
  let posts = [...samplePosts];
  const { per_page = 10, page = 1, search, slug, categories, tags, orderby = 'date', order = 'desc' } = req.query;

  // Filter by slug
  if (slug) {
    posts = posts.filter(post => post.slug === slug);
  }

  // Filter by search
  if (search) {
    const searchTerm = search.toLowerCase();
    posts = posts.filter(post => 
      post.title.rendered.toLowerCase().includes(searchTerm) ||
      post.content.rendered.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by categories
  if (categories) {
    const categoryIds = categories.split(',').map(id => parseInt(id));
    posts = posts.filter(post => 
      post.categories.some(catId => categoryIds.includes(catId))
    );
  }

  // Filter by tags
  if (tags) {
    const tagIds = tags.split(',').map(id => parseInt(id));
    posts = posts.filter(post => 
      post.tags.some(tagId => tagIds.includes(tagId))
    );
  }

  // Sort
  posts.sort((a, b) => {
    if (orderby === 'date') {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    }
    return 0;
  });

  // Pagination
  const startIndex = (page - 1) * per_page;
  const endIndex = startIndex + parseInt(per_page);
  const paginatedPosts = posts.slice(startIndex, endIndex);

  res.json(paginatedPosts);
});

// Single post by ID
app.get('/wp-json/wp/v2/posts/:id', (req, res) => {
  const post = samplePosts.find(p => p.id === parseInt(req.params.id));
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
});

// Categories endpoint
app.get('/wp-json/wp/v2/categories', (req, res) => {
  console.log('📂 Categories request:', req.query);
  res.json(sampleCategories);
});

// Tags endpoint
app.get('/wp-json/wp/v2/tags', (req, res) => {
  console.log('🏷️  Tags request:', req.query);
  res.json(sampleTags);
});

// WordPress Admin Panel Mock (for development)
app.get('/wp-admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WordPress Admin - Clínica Saraiva Vision (Mock)</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 500px;
                width: 100%;
                text-align: center;
            }
            .logo {
                width: 60px;
                height: 60px;
                background: #3b82f6;
                border-radius: 12px;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                color: white;
                font-weight: bold;
            }
            h1 {
                color: #1f2937;
                margin: 0 0 10px 0;
                font-size: 24px;
            }
            .subtitle {
                color: #6b7280;
                margin-bottom: 30px;
            }
            .info-box {
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            .info-box h3 {
                margin: 0 0 10px 0;
                color: #374151;
                font-size: 16px;
            }
            .info-box p {
                margin: 5px 0;
                color: #6b7280;
                font-size: 14px;
            }
            .endpoints {
                background: #ecfdf5;
                border: 1px solid #d1fae5;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                text-align: left;
            }
            .endpoints h3 {
                margin: 0 0 10px 0;
                color: #065f46;
                font-size: 16px;
            }
            .endpoints ul {
                margin: 0;
                padding-left: 20px;
                color: #047857;
            }
            .endpoints li {
                margin: 5px 0;
                font-family: monospace;
                font-size: 13px;
            }
            .btn {
                display: inline-block;
                padding: 12px 24px;
                background: #3b82f6;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 500;
                margin: 10px 5px;
                transition: background 0.2s;
            }
            .btn:hover {
                background: #2563eb;
            }
            .btn-secondary {
                background: #6b7280;
            }
            .btn-secondary:hover {
                background: #4b5563;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">🏥</div>
            <h1>WordPress Admin - Mock Server</h1>
            <p class="subtitle">Servidor de desenvolvimento - Clínica Saraiva Vision</p>
            
            <div class="info-box">
                <h3>⚠️ Ambiente de Desenvolvimento</h3>
                <p>Este é um servidor mock do WordPress usado apenas para desenvolvimento.</p>
                <p>Em produção, esta URL redirecionará para o painel real do WordPress.</p>
            </div>
            
            <div class="endpoints">
                <h3>📋 Endpoints Disponíveis:</h3>
                <ul>
                    <li>GET /wp-json/wp/v2/posts</li>
                    <li>GET /wp-json/wp/v2/posts/:id</li>
                    <li>GET /wp-json/wp/v2/categories</li>
                    <li>GET /wp-json/wp/v2/tags</li>
                </ul>
            </div>

            <div class="info-box">
                <h3>🔧 Para Desenvolvedores</h3>
                <p><strong>API Base:</strong> http://localhost:8081/wp-json/wp/v2</p>
                <p><strong>Posts:</strong> ${samplePosts.length} posts médicos disponíveis</p>
                <p><strong>Categorias:</strong> ${sampleCategories.length} categorias</p>
                <p><strong>Status:</strong> ✅ Funcionando</p>
            </div>

            <div>
                <a href="http://localhost:3002/blog" class="btn">Ver Blog</a>
                <a href="http://localhost:8081/wp-json/wp/v2/posts" class="btn btn-secondary">Ver API</a>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Health check
app.get('/wp-json', (req, res) => {
  res.json({
    name: 'SaraivaVision Mock WordPress API',
    description: 'Mock WordPress REST API for development',
    version: '1.0.0',
    namespaces: ['wp/v2']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock WordPress API Server running on http://localhost:${PORT}`);
  console.log(`📋 API Base: http://localhost:${PORT}/wp-json/wp/v2`);
  console.log('📝 Available endpoints:');
  console.log('   - GET /wp-json/wp/v2/posts');
  console.log('   - GET /wp-json/wp/v2/posts/:id');
  console.log('   - GET /wp-json/wp/v2/categories');
  console.log('   - GET /wp-json/wp/v2/tags');
  console.log('');
  console.log('💡 Use Ctrl+C to stop the server');
});

export default app;