# WordPress External API Integration Guide - Saraiva Vision

Este guia completo explica como usar a integração headless do WordPress via APIs externas (não hospedadas no VPS) para o site médico da Clínica Saraiva Vision.

## 📋 Visão Geral

A integração WordPress fornece:
- **🌐 CMS Externo**: WordPress como sistema de gerenciamento de conteúdo via APIs externas
- **⚡ ISR Support**: Regeneração Estática Incremental para performance otimizada
- **🔄 Real-time Updates**: Sincronização automática com fontes externas
- **💾 Caching Distribuído**: Cache Redis e Supabase para alta performance
- **🛡️ Error Handling**: Fallbacks graciosos e recuperação de erros
- **🔒 Segurança Médica**: Conformidade CFM e LGPD
- **📊 Monitoramento**: Métricas e health checks em tempo real
- **🔧 Transformação**: Conteúdo adaptado para conformidade médica

## 🏗️ Arquitetura

```
┌─────────────────┐    External APIs    ┌─────────────────┐
│  React Frontend │ ────────────────── │ WordPress CMS   │
│ saraivavision   │                     │ (External)      │
│     .com.br     │                     │                 │
└─────────────────┘                     └─────────────────┘
         │                                                     │
         └─── Consome dados médicos ──────────────────────────┘
                     ↓
             ┌─────────────────┐
             │   Supabase DB   │
             │   + Redis Cache │
             └─────────────────┘
                     ↓
             ┌─────────────────┐
             │   Node.js API   │
             │   (VPS Backend) │
             └─────────────────┘
```

## 🚀 Configuração Inicial

### 1. Pré-requisitos das Fontes WordPress Externas

**Fontes Externas:** WordPress sites não hospedados no VPS
- **APIs Disponíveis:** REST API (/wp-json/wp/v2/), GraphQL
- **Autenticação:** JWT ou API Keys conforme necessário
- **Segurança:** HTTPS obrigatório, certificados válidos
- **Conformidade:** Conteúdo médico deve seguir CFM e LGPD

### 2. Configuração das Fontes Externas

```javascript
// Configuração das fontes WordPress externas no Supabase
const externalSources = [
  {
    name: "Blog Médico Principal",
    base_url: "https://blog-medico-externo.com",
    api_type: "rest", // ou "graphql"
    auth_type: "jwt", // ou "api_key", "none"
    content_types: ["posts", "pages", "medical_articles"],
    compliance_level: "cfm_strict",
    cache_ttl: 300, // 5 minutos
    sync_frequency: 600 // 10 minutos
  },
  {
    name: "Conteúdo Educacional",
    base_url: "https://conteudo-educacional.com",
    api_type: "graphql",
    auth_type: "none",
    content_types: ["educational_content"],
    compliance_level: "cfm_basic",
    cache_ttl: 1800, // 30 minutos
    sync_frequency: 3600 // 1 hora
  }
];
```

### 3. Mapeamento de Conteúdo Externo

Configure o mapeamento de tipos de conteúdo das fontes externas:

```javascript
// src/lib/content-mapping.js - Mapeamento de conteúdo externo

// ==========================================
// MAPEAMENTO DE TIPOS DE CONTEÚDO
// ==========================================

const contentTypeMapping = {
  // Serviços Oftalmológicos
  service: {
    external_type: 'service',
    internal_type: 'service',
    fields: {
      title: 'title.rendered',
      content: 'content.rendered',
      excerpt: 'excerpt.rendered',
      featured_image: 'featured_media',
      custom_fields: {
        duration: 'acf.duration',
        price: 'acf.price',
        medical_disclaimer: 'acf.medical_disclaimer',
        preparation: 'acf.preparation'
      }
    },
    validation: {
      required_fields: ['title', 'medical_disclaimer'],
      compliance: 'cfm_strict'
    }
  },

  // Equipe Médica
  team_member: {
    external_type: 'team_member',
    internal_type: 'team_member',
    fields: {
      title: 'title.rendered',
      content: 'content.rendered',
      featured_image: 'featured_media',
      custom_fields: {
        crm: 'acf.crm',
        specialty: 'acf.specialty',
        education: 'acf.education',
        experience_years: 'acf.experience_years'
      }
    },
    validation: {
      required_fields: ['title', 'crm', 'specialty'],
      compliance: 'cfm_strict'
    }
  },

  // Depoimentos de Pacientes
  testimonial: {
    external_type: 'testimonial',
    internal_type: 'testimonial',
    fields: {
      title: 'title.rendered',
      content: 'content.rendered',
      featured_image: 'featured_media',
      custom_fields: {
        patient_name: 'acf.patient_name',
        procedure: 'acf.procedure',
        rating: 'acf.rating',
        lgpd_consent: 'acf.lgpd_consent'
      }
    },
    validation: {
      required_fields: ['title', 'lgpd_consent'],
      compliance: 'lgpd_strict'
    }
  },

  // Artigos Médicos
  medical_article: {
    external_type: 'medical_article',
    internal_type: 'medical_article',
    fields: {
      title: 'title.rendered',
      content: 'content.rendered',
      excerpt: 'excerpt.rendered',
      author: 'author',
      categories: 'categories',
      tags: 'tags',
      custom_fields: {
        author_crm: 'acf.author_crm',
        medical_disclaimer: 'acf.medical_disclaimer',
        review_date: 'acf.review_date'
      }
    },
    validation: {
      required_fields: ['title', 'author_crm', 'medical_disclaimer', 'review_date'],
      compliance: 'cfm_strict'
    }
  }
};

// ==========================================
// MAPEAMENTO DE TAXONOMIAS
// ==========================================

const taxonomyMapping = {
  medical_specialty: {
    external_taxonomy: 'medical_specialty',
    internal_taxonomy: 'medical_specialty',
    hierarchical: true
  },

  service_category: {
    external_taxonomy: 'service_category',
    internal_taxonomy: 'service_category',
    hierarchical: true
  }
};

// ==========================================
// MAPEAMENTO DE CAMPOS PERSONALIZADOS
// ==========================================

const fieldMapping = {
  // Campos para Serviços Oftalmológicos
  service_fields: {
    duration: {
      external_path: 'acf.duration',
      internal_name: 'duration',
      type: 'number',
      required: true,
      validation: 'positive_integer'
    },
    price: {
      external_path: 'acf.price',
      internal_name: 'price',
      type: 'string',
      validation: 'currency_format'
    },
    medical_disclaimer: {
      external_path: 'acf.medical_disclaimer',
      internal_name: 'medical_disclaimer',
      type: 'string',
      required: true,
      default: 'Este serviço não substitui consulta médica. Procure sempre orientação profissional.'
    },
    preparation: {
      external_path: 'acf.preparation',
      internal_name: 'preparation',
      type: 'html',
      validation: 'safe_html'
    }
  },

  // Campos para Equipe Médica (CFM Compliance)
  team_member_fields: {
    crm: {
      external_path: 'acf.crm',
      internal_name: 'crm',
      type: 'string',
      required: true,
      validation: 'crm_format'
    },
    specialty: {
      external_path: 'acf.specialty',
      internal_name: 'specialty',
      type: 'string',
      required: true
    },
    education: {
      external_path: 'acf.education',
      internal_name: 'education',
      type: 'string',
      validation: 'safe_text'
    },
    experience_years: {
      external_path: 'acf.experience_years',
      internal_name: 'experience_years',
      type: 'number',
      validation: 'positive_integer'
    }
  },

  // Campos para Depoimentos (LGPD Compliance)
  testimonial_fields: {
    patient_name: {
      external_path: 'acf.patient_name',
      internal_name: 'patient_name',
      type: 'string',
      default: 'Paciente Anônimo',
      validation: 'anonymous_name'
    },
    procedure: {
      external_path: 'acf.procedure',
      internal_name: 'procedure',
      type: 'string',
      required: true
    },
    rating: {
      external_path: 'acf.rating',
      internal_name: 'rating',
      type: 'number',
      validation: 'rating_1_5'
    },
    lgpd_consent: {
      external_path: 'acf.lgpd_consent',
      internal_name: 'lgpd_consent',
      type: 'boolean',
      required: true,
      validation: 'must_be_true'
    }
  },

  // Campos para Artigos Médicos (CFM Compliance)
  medical_article_fields: {
    author_crm: {
      external_path: 'acf.author_crm',
      internal_name: 'author_crm',
      type: 'string',
      required: true,
      validation: 'crm_format'
    },
    medical_disclaimer: {
      external_path: 'acf.medical_disclaimer',
      internal_name: 'medical_disclaimer',
      type: 'string',
      required: true,
      default: 'IMPORTANTE: Este artigo não substitui consulta médica...'
    },
    review_date: {
      external_path: 'acf.review_date',
      internal_name: 'review_date',
      type: 'date',
      required: true,
      validation: 'not_future_date'
    },
    peer_reviewed: {
      external_path: 'acf.peer_reviewed',
      internal_name: 'peer_reviewed',
      type: 'boolean'
    }
  }
};
```

#### Configuração de Sincronização
Configure a sincronização automática com fontes externas:

```javascript
// src/lib/external-sync.js - Sincronização com fontes externas

class ExternalWordPressSync {
    constructor() {
        this.sources = [];
        this.syncInterval = 10 * 60 * 1000; // 10 minutos
        this.cache = new RedisCache();
    }

    // Adicionar fonte externa
    addSource(sourceConfig) {
        this.sources.push({
            ...sourceConfig,
            lastSync: null,
            status: 'active'
        });
    }

    // Iniciar sincronização
    startSync() {
        setInterval(() => {
            this.syncAllSources();
        }, this.syncInterval);
    }

    // Sincronizar todas as fontes
    async syncAllSources() {
        for (const source of this.sources) {
            if (source.status === 'active') {
                await this.syncSource(source);
            }
        }
    }

    // Sincronizar fonte específica
    async syncSource(source) {
        try {
            const content = await this.fetchContent(source);
            const transformed = await this.transformContent(content, source);
            await this.storeContent(transformed, source);
            await this.invalidateCache(source);

            source.lastSync = new Date();
            source.status = 'healthy';
        } catch (error) {
            console.error(`Sync failed for ${source.name}:`, error);
            source.status = 'error';
        }
    }

    // Buscar conteúdo da fonte externa
    async fetchContent(source) {
        const response = await fetch(`${source.base_url}/wp-json/wp/v2/posts`, {
            headers: this.getAuthHeaders(source)
        });
        return response.json();
    }

    // Transformar conteúdo para conformidade
    async transformContent(content, source) {
        // Aplicar validações CFM/LGPD
        // Injetar disclaimers médicos
        // Anonimizar dados pessoais
        return transformedContent;
    }

    // Armazenar no Supabase
    async storeContent(content, source) {
        const { data, error } = await supabase
            .from('external_wordpress_content')
            .upsert(content);

        if (error) throw error;
        return data;
    }
}
```

### 4. Segurança Médica e Conformidade

#### Configurações de Segurança para APIs Externas

```javascript
// src/lib/security-config.js - Configurações de segurança médica

const securityConfig = {
    // Conformidade CFM/LGPD
    compliance: {
        cfm_mode: true,
        lgpd_level: 'strict',
        medical_content_restriction: true,
        audit_logging: true
    },

    // Validações de segurança
    validations: {
        content_filtering: true,
        pii_detection: true,
        medical_disclaimer_injection: true,
        crm_validation: true
    },

    // Autenticação e autorização
    auth: {
        jwt_required: true,
        api_key_fallback: false,
        rate_limiting: {
            requests_per_minute: 60,
            burst_limit: 100
        }
    },

    // Cache e performance
    cache: {
        enabled: true,
        ttl: 300, // 5 minutos
        compression: true,
        invalidation_on_update: true
    }
};
```

#### Configurações Avançadas de Segurança Médica

```php
// functions.php - Segurança médica avançada
function enforce_medical_security_headers() {
    if (!is_admin()) {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
    }
}
add_action('send_headers', 'enforce_medical_security_headers');

// Bloquear uploads não autorizados
function restrict_medical_file_uploads($file) {
    $allowed_mime_types = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf', // Para laudos médicos
    ];

    if (!in_array($file['type'], $allowed_mime_types)) {
        $file['error'] = 'Tipo de arquivo não permitido para conteúdo médico.';
    }

    // Verificar tamanho máximo para arquivos médicos
    $max_size = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $max_size) {
        $file['error'] = 'Arquivo muito grande. Máximo permitido: 5MB.';
    }

    return $file;
}
add_filter('wp_handle_upload_prefilter', 'restrict_medical_file_uploads');

// Auditoria de conteúdo médico
function log_medical_content_changes($post_id, $post, $update) {
    if (in_array($post->post_type, ['medical_article', 'service', 'testimonial'])) {
        $log_entry = [
            'timestamp' => current_time('mysql'),
            'user_id' => get_current_user_id(),
            'post_type' => $post->post_type,
            'post_id' => $post_id,
            'action' => $update ? 'updated' : 'created',
            'post_title' => $post->post_title,
        ];

        // Log para arquivo seguro
        error_log(json_encode($log_entry) . "\n", 3, WP_CONTENT_DIR . '/medical-audit.log');
    }
}
add_action('wp_insert_post', 'log_medical_content_changes', 10, 3);

// Validação CFM obrigatória para artigos médicos
function validate_cfm_compliance($post_id, $post) {
    if ($post->post_type === 'medical_article' && $post->post_status === 'publish') {
        $crm = get_field('author_crm', $post_id);
        $disclaimer = get_field('medical_disclaimer', $post_id);
        $review_date = get_field('review_date', $post_id);

        if (empty($crm) || empty($disclaimer) || empty($review_date)) {
            // Impedir publicação sem conformidade CFM
            wp_update_post([
                'ID' => $post_id,
                'post_status' => 'draft'
            ]);

            // Notificar admin
            wp_mail(
                get_option('admin_email'),
                'CFM Compliance Violation',
                "O artigo médico '{$post->post_title}' foi movido para rascunho devido à falta de conformidade CFM."
            );
        }
    }
}
add_action('wp_insert_post', 'validate_cfm_compliance', 10, 2);

#### Políticas de Privacidade Médica (LGPD Compliance)

```php
// functions.php - Filtros de privacidade médica obrigatórios
function enforce_medical_privacy($content) {
    // Remove dados pessoais de previews e feeds
    if (is_preview() || is_feed()) {
        $content = preg_replace('/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/', '[CPF REMOVIDO - LGPD]', $content);
        $content = preg_replace('/\b\d{2}\/\d{2}\/\d{4}\b/', '[DATA REMOVIDA - LGPD]', $content);
        $content = preg_replace('/\b\d{2}\s\d{4,5}-\d{4}\b/', '[TELEFONE REMOVIDO - LGPD]', $content);
        $content = preg_replace('/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/', '[EMAIL REMOVIDO - LGPD]', $content);
    }

    // Adiciona disclaimer médico obrigatório
    if (!is_page() && !has_shortcode($content, 'medical_disclaimer')) {
        $content .= "\n\n" . get_medical_disclaimer();
    }

    // Adiciona aviso LGPD para depoimentos
    if (get_post_type() === 'testimonial') {
        $content .= "\n\n" . get_lgpd_testimonial_notice();
    }

    return $content;
}
add_filter('the_content', 'enforce_medical_privacy');

function get_medical_disclaimer() {
    return '<div class="medical-disclaimer alert alert-warning" role="alert">
        <strong>IMPORTANTE - CFM:</strong> As informações contidas neste conteúdo têm caráter informativo e educacional.
        Não substituem consulta médica oftalmológica. Cada caso é único e deve ser avaliado individualmente por um oftalmologista qualificado.
        Em caso de sintomas, procure atendimento médico imediato.
    </div>';
}

function get_lgpd_testimonial_notice() {
    return '<div class="lgpd-notice alert alert-info" role="alert">
        <strong>Proteção de Dados - LGPD:</strong> Este depoimento foi autorizado pelo paciente mediante termo de consentimento específico,
        garantindo o anonimato e a proteção de dados pessoais conforme Lei Geral de Proteção de Dados (LGPD).
    </div>';
}

// Controle de cookies médicos
function enforce_medical_cookie_consent() {
    if (!isset($_COOKIE['medical_cookie_consent'])) {
        // Bloquear funcionalidades que requerem consentimento
        add_filter('wp_enqueue_scripts', function() {
            wp_dequeue_script('google-analytics');
            wp_dequeue_script('facebook-pixel');
        });
    }
}
add_action('wp', 'enforce_medical_cookie_consent');

// Log de acesso a dados médicos (LGPD)
function log_medical_data_access($post_id) {
    if (in_array(get_post_type($post_id), ['medical_article', 'testimonial'])) {
        $access_log = [
            'timestamp' => current_time('mysql'),
            'post_id' => $post_id,
            'post_type' => get_post_type($post_id),
            'user_ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'referer' => $_SERVER['HTTP_REFERER'] ?? 'direct',
        ];

        // Log seguro para auditoria LGPD
        error_log(json_encode($access_log) . "\n", 3, WP_CONTENT_DIR . '/lgpd-access.log');
    }
}
add_action('wp_head', function() {
    if (is_single()) {
        global $post;
        log_medical_data_access($post->ID);
    }
});
```

### 5. Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```bash
# External WordPress API Configuration
EXTERNAL_WORDPRESS_SOURCES=[{"name":"Blog Médico","base_url":"https://blog-externo.com","api_type":"rest"}]
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
REDIS_URL=redis://localhost:6379

# Autenticação para fontes externas
WP_JWT_SECRET=your_jwt_secret_key_here
EXTERNAL_API_KEYS=[{"source":"blog","key":"your_api_key"}]

# Configurações de Segurança Médica
CFM_COMPLIANCE_ENABLED=true
LGPD_STRICT_MODE=true
MEDICAL_CONTENT_FILTER=true
AUDIT_LOGGING_ENABLED=true

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://saraivavision.com.br
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
```

### 3. Vercel Configuration

Add to your `vercel.json`:

```json
{
  "functions": {
    "api/external-wordpress/health.js": { "maxDuration": 10 },
    "api/external-wordpress/sync.js": { "maxDuration": 30 }
  },
  "env": {
    "SUPABASE_URL": "@supabase_url",
    "SUPABASE_ANON_KEY": "@supabase_anon_key",
    "REDIS_URL": "@redis_url"
  },
  "rewrites": [
    {
      "source": "/api/external-wordpress/:path*",
      "destination": "https://your-vps.com/api/external-wordpress/:path*"
    }
  ]
}
```

## Usage Examples

### 1. Using React Hooks

```jsx
import { usePost, useRecentPosts, usePopularServices } from '../hooks/useWordPress.js';

function BlogPost({ slug }) {
  const { data, loading, error } = usePost(slug);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.post) return <div>Post not found</div>;

  return (
    <article>
      <h1>{data.post.title.rendered}</h1>
      <div dangerouslySetInnerHTML={{ __html: data.post.content.rendered }} />
    </article>
  );
}

function Homepage() {
  const { data: recentPosts } = useRecentPosts(3);
  const { data: popularServices } = usePopularServices(6);

  return (
    <div>
      <section>
        <h2>Recent Posts</h2>
        {recentPosts?.posts?.map(post => (
          <div key={post.id}>{post.title.rendered}</div>
        ))}
      </section>

      <section>
        <h2>Popular Services</h2>
        {popularServices?.services?.map(service => (
          <div key={service.id}>{service.title.rendered}</div>
        ))}
      </section>
    </div>
  );
}
```

### 2. Using Components

```jsx
import { 
  WordPressPost, 
  WordPressPage, 
  RecentPostsPreview, 
  PopularServicesPreview 
} from '../components/WordPressContent.jsx';

function BlogPage({ slug }) {
  return <WordPressPost slug={slug} className="max-w-4xl mx-auto" />;
}

function AboutPage() {
  return <WordPressPage slug="about" className="container mx-auto" />;
}

function Homepage() {
  return (
    <div>
      <RecentPostsPreview count={3} className="mb-12" />
      <PopularServicesPreview count={6} className="mb-12" />
    </div>
  );
}
```

### 3. ISR with Next.js Pages

```jsx
// pages/blog/[slug].js
import { getPostStaticPaths, getPostStaticProps } from '../../src/lib/wordpress-isr.js';
import { WordPressPost } from '../../src/components/WordPressContent.jsx';

export default function BlogPost({ post }) {
  return <WordPressPost slug={post.slug} />;
}

export async function getStaticPaths() {
  return await getPostStaticPaths();
}

export async function getStaticProps({ params }) {
  return await getPostStaticProps(params.slug);
}
```

### 4. Direct API Usage

```jsx
import { getAllPosts, getPostBySlug } from '../lib/wordpress-api.js';

// Fetch all posts with pagination
const { posts, totalPages, totalPosts, error } = await getAllPosts({
  per_page: 10,
  page: 1
});

// Fetch single post
const { post, error } = await getPostBySlug('my-post-slug');

// Disable caching for fresh data
const { posts } = await getAllPosts({ useCache: false });
```

## API Endpoints

### Revalidation Endpoint
`POST /api/revalidate`

Manually trigger ISR revalidation:

```bash
curl -X POST "https://saraivavision.com.br/api/revalidate" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your_revalidate_secret",
    "path": "/blog/my-post-slug"
  }'
```

### Webhook Endpoint
`POST /api/wordpress-webhook`

Receives WordPress webhooks for automatic revalidation:

```json
{
  "action": "publish_post",
  "post_id": 123,
  "post_type": "post",
  "post_slug": "my-new-post",
  "post_status": "publish",
  "post_title": "My New Post",
  "post_modified": "2024-01-15 10:30:00"
}
```

### External WordPress API Endpoints
- `GET /api/external-wordpress/posts` - List posts from external sources
- `GET /api/external-wordpress/posts/{id}` - Get specific post
- `GET /api/external-wordpress/pages` - List pages
- `GET /api/external-wordpress/health` - Health check
- `POST /api/external-wordpress/sync` - Manual sync trigger
- `GET /api/external-wordpress/sources` - List configured sources
```

## Caching Strategy

### Cache Levels
1. **Browser Cache**: Static assets and pages
2. **CDN Cache**: Vercel Edge Network
3. **ISR Cache**: Next.js static generation
4. **Redis Cache**: External content caching
5. **Supabase Cache**: Database query caching

### Cache Durations
- **External Posts**: 5 minutes (frequent updates)
- **External Pages**: 30 minutes (moderate updates)
- **Medical Articles**: 1 hour (infrequent updates)
- **Team Members**: 2 hours (rare updates)
- **Services**: 30 minutes (moderate updates)

### Cache Management

```jsx
import { invalidateCache, getCacheStats } from '../lib/wordpress-api.js';

// Clear all cache
invalidateCache();

// Clear specific content type
invalidateCache('posts');

// Get cache statistics
const stats = getCacheStats();
console.log(`Cached items: ${stats.size}`);
```

## Error Handling

The integration includes comprehensive error handling:

### GraphQL Errors
```jsx
{
  type: 'GRAPHQL_ERROR',
  message: 'Field "invalidField" is not defined',
  errors: [/* GraphQL error details */]
}
```

### Network Errors
```jsx
{
  type: 'NETWORK_ERROR',
  message: 'Failed to connect to WordPress CMS'
}
```

### Server Errors
```jsx
{
  type: 'SERVER_ERROR',
  message: 'WordPress server is temporarily unavailable',
  status: 500
}
```

## Performance Optimization

### 1. Query Optimization
- Use specific GraphQL fragments
- Request only needed fields
- Implement pagination for large datasets

### 2. Image Optimization
```jsx
// WordPress images with Next.js optimization
import Image from 'next/image';

function OptimizedImage({ post }) {
  const { featuredImage } = post;
  
  if (!featuredImage?.node?.sourceUrl) return null;
  
  return (
    <Image
      src={featuredImage.node.sourceUrl}
      alt={featuredImage.node.altText || post.title}
      width={featuredImage.node.mediaDetails.width}
      height={featuredImage.node.mediaDetails.height}
      priority={false}
    />
  );
}
```

### 3. Preloading Critical Content
```jsx
// Preload homepage data
export async function getStaticProps() {
  return await getHomepageStaticProps();
}
```

## Monitoring and Debugging

### Health Checks
```jsx
import { checkWordPressHealth } from '../lib/wordpress.js';

const health = await checkWordPressHealth();
console.log('WordPress is healthy:', health.isHealthy);
```

### Debug Mode
Set `NODE_ENV=development` to enable request/response logging.

### Error Tracking
All errors are logged with context for debugging:

```javascript
console.error('WordPress GraphQL Error:', {
  query: 'query GetPosts { ... }',
  variables: { first: 10 },
  error: error.message,
  timestamp: new Date().toISOString()
});
```

## Troubleshooting

### Common Issues

1. **External API Not Accessible**
     - Check external WordPress URL and SSL certificate
     - Verify API authentication (JWT/API keys)
     - Test endpoint manually: `curl https://external-blog.com/wp-json/wp/v2/posts`

2. **Sync Not Working**
     - Check Supabase connection and permissions
     - Verify Redis cache connectivity
     - Monitor sync logs in the backend API

3. **ISR Not Updating**
     - Verify external sync triggers revalidation
     - Check Vercel function logs
     - Ensure content transformation is working

4. **Cache Issues**
     - Clear Redis cache: `redis-cli FLUSHDB`
     - Check Supabase RLS policies
     - Verify cache invalidation triggers

### Debug Commands

```bash
# Test external WordPress API
curl https://external-blog.com/wp-json/wp/v2/posts

# Test backend API health
curl https://saraivavision.com.br/api/external-wordpress/health

# Test manual sync
curl -X POST https://saraivavision.com.br/api/external-wordpress/sync \
  -H "Content-Type: application/json" \
  -d '{"source": "blog"}'

# Check Redis cache
redis-cli KEYS "*"

# Check Supabase logs
# Access via Supabase dashboard

# Check Vercel function logs
vercel logs --follow
```

## Security Considerations

1. **Webhook Security**: Use signed webhooks with HMAC verification
2. **Revalidation Secret**: Use strong, unique secrets for revalidation
3. **CORS Configuration**: Restrict origins to WordPress domain
4. **Rate Limiting**: Implement rate limiting on webhook endpoints
5. **Input Validation**: Validate all webhook payloads
6. **Error Disclosure**: Don't expose sensitive information in error messages

## Best Practices

1. **Content Structure**: Use consistent WordPress content structure
2. **SEO Optimization**: Include SEO fields in GraphQL queries
3. **Image Management**: Optimize images in WordPress before serving
4. **Performance Monitoring**: Monitor GraphQL query performance
5. **Fallback Content**: Always provide fallback content for errors
6. **Testing**: Test webhook integration thoroughly
7. **Documentation**: Keep WordPress field documentation updated

This integration provides a robust, scalable solution for headless WordPress content management with optimal performance through ISR and intelligent caching.