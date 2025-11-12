import express from 'express';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

let blogPosts = [];

try {
  const blogPostsPath = join(__dirname, '../../../src/data/blogPosts.js');
  const content = readFileSync(blogPostsPath, 'utf-8');
  
  const match = content.match(/export const blogPosts = (\[[\s\S]*?\]);/);
  if (match) {
    blogPosts = eval(match[1]);
  }
} catch (error) {
  console.error('Error loading blog posts:', error);
}

router.get('/', (req, res) => {
  const { format = 'json', limit, category, featured } = req.query;

  let filteredPosts = [...blogPosts];

  if (category) {
    filteredPosts = filteredPosts.filter(
      post => post.category?.toLowerCase() === category.toLowerCase()
    );
  }

  if (featured === 'true') {
    filteredPosts = filteredPosts.filter(post => post.featured === true);
  }

  filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (limit) {
    filteredPosts = filteredPosts.slice(0, parseInt(limit, 10));
  }

  if (format === 'llm') {
    const llmFeed = {
      metadata: {
        site: 'Clínica Saraiva Vision',
        url: 'https://saraivavision.com.br',
        description: 'Artigos médicos sobre oftalmologia em Caratinga, MG',
        specialty: 'Ophthalmology',
        author: 'Dr. Philipe Saraiva Cruz',
        crm: 'CRM-MG 69.870',
        language: 'pt-BR',
        country: 'Brasil',
        region: 'Minas Gerais',
        city: 'Caratinga',
        totalArticles: filteredPosts.length,
        lastUpdated: new Date().toISOString(),
        compliance: {
          cfm: true,
          lgpd: true,
        },
      },
      articles: filteredPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        url: `https://saraivavision.com.br/blog/${post.slug}`,
        excerpt: post.excerpt,
        content: post.content?.replace(/<[^>]*>/g, '').substring(0, 2000) + '...',
        fullContent: post.content,
        author: {
          name: post.author,
          specialty: 'Oftalmologia',
          crm: 'CRM-MG 69.870',
          clinic: 'Clínica Saraiva Vision',
        },
        publishedDate: post.date,
        modifiedDate: post.lastModified || post.date,
        category: post.category,
        tags: post.tags || [],
        keywords: post.seo?.keywords || [],
        image: post.image ? `https://saraivavision.com.br${post.image}` : null,
        featured: post.featured || false,
        medicalSpecialty: 'Ophthalmology',
        targetAudience: 'Patients and general public',
        contentType: 'Medical Educational Content',
        seo: {
          metaTitle: post.seo?.metaTitle || post.title,
          metaDescription: post.seo?.metaDescription || post.excerpt,
          keywords: post.seo?.keywords || post.tags || [],
        },
        relatedContent: {
          podcasts: post.relatedPodcasts || [],
        },
      })),
    };

    return res.json(llmFeed);
  }

  if (format === 'minimal') {
    const minimalFeed = filteredPosts.map(post => ({
      title: post.title,
      url: `https://saraivavision.com.br/blog/${post.slug}`,
      date: post.date,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags,
    }));

    return res.json(minimalFeed);
  }

  const standardFeed = {
    total: filteredPosts.length,
    articles: filteredPosts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      url: `https://saraivavision.com.br/blog/${post.slug}`,
      excerpt: post.excerpt,
      author: post.author,
      date: post.date,
      category: post.category,
      tags: post.tags,
      image: post.image,
      featured: post.featured,
      seo: post.seo,
    })),
  };

  res.json(standardFeed);
});

router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const fullArticle = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    url: `https://saraivavision.com.br/blog/${post.slug}`,
    excerpt: post.excerpt,
    content: post.content,
    plainTextContent: post.content?.replace(/<[^>]*>/g, ''),
    author: {
      name: post.author,
      specialty: 'Oftalmologia',
      crm: 'CRM-MG 69.870',
      clinic: 'Clínica Saraiva Vision',
      contact: {
        phone: '+55 33 99860-1427',
        email: 'contato@saraivavision.com.br',
        whatsapp: 'https://wa.me/5533998601427',
      },
    },
    publishedDate: post.date,
    modifiedDate: post.lastModified || post.date,
    category: post.category,
    tags: post.tags || [],
    image: post.image ? `https://saraivavision.com.br${post.image}` : null,
    featured: post.featured || false,
    seo: post.seo,
    relatedContent: {
      podcasts: post.relatedPodcasts || [],
    },
    medicalInfo: {
      specialty: 'Ophthalmology',
      targetAudience: 'Patients and general public',
      contentType: 'Medical Educational Content',
      medicallyReviewed: true,
      reviewedBy: post.author,
    },
    clinic: {
      name: 'Clínica Saraiva Vision',
      address: 'Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga/MG 35300-299',
      phone: '+55 33 99860-1427',
      website: 'https://saraivavision.com.br',
      bookingUrl: 'https://saraivavision.com.br/agendamento',
    },
  };

  res.json(fullArticle);
});

export default router;
