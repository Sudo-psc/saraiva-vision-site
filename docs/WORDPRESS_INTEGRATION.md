# WordPress REST API Integration Guide - Saraiva Vision

Este guia completo explica como usar a integração headless do WordPress via REST API no domínio `cms.saraivavision.com.br` para o site médico da Clínica Saraiva Vision.

## 📋 Visão Geral

A integração WordPress fornece:
- **🏥 CMS Headless**: WordPress como sistema de gerenciamento de conteúdo via REST API
- **⚡ ISR Support**: Regeneração Estática Incremental para performance otimizada
- **🔄 Real-time Updates**: Revalidação via webhooks quando conteúdo muda
- **💾 Caching Inteligente**: Cache com TTL configurável
- **🛡️ Error Handling**: Fallbacks graciosos e recuperação de erros
- **🔒 Segurança Médica**: Conformidade CFM e LGPD
- **📊 Monitoramento**: Métricas e health checks em tempo real

## 🏗️ Arquitetura

```
┌─────────────────┐    REST API (/wp-json/wp/v2/)    ┌─────────────────┐
│  React Frontend │ ────────────────────────────── │ WordPress CMS   │
│ saraivavision   │                                 │ cms.saraivavi   │
│     .com.br     │                                 │   sion.com.br   │
└─────────────────┘                                 └─────────────────┘
        │                                                     │
        └─── Consome dados médicos ──────────────────────────┘
                    ↓
            ┌─────────────────┐
            │   ISR Cache     │
            │   (Vercel)      │
            └─────────────────┘
                    ↓
            ┌─────────────────┐
            │ Webhooks para   │
            │ Revalidação     │
            └─────────────────┘
```

## 🚀 Configuração Inicial

### 1. Pré-requisitos do Servidor WordPress

**Servidor:** `cms.saraivavision.com.br` (VPS dedicado)
- **Sistema Operacional:** Ubuntu 22.04 LTS ou Debian 12
- **PHP:** 8.2+ com OPcache
- **Banco de Dados:** MariaDB 10.6+ ou MySQL 8.0+
- **Web Server:** Nginx 1.20+ com SSL Let's Encrypt
- **Cache:** Redis 7.0+ (recomendado)

### 2. Instalação de Plugins Essenciais

```bash
# No servidor WordPress (cms.saraivavision.com.br)
cd /var/www/cms.saraivavision.com.br

# Plugins obrigatórios para integração headless
wp plugin install advanced-custom-fields --activate          # Campos personalizados
wp plugin install jwt-authentication-for-wp-rest-api --activate  # Autenticação JWT
wp plugin install wp-rest-api-menu --activate               # Endpoints de menu
wp plugin install wordpress-seo --activate                  # Otimização SEO
wp plugin install custom-post-type-ui --activate           # Interface CPT
wp plugin install wp-mail-smtp --activate                   # SMTP para emails

# Plugins de segurança médica
wp plugin install wordfence --activate                      # Segurança avançada
wp plugin install wp-security-audit-log --activate         # Logs de auditoria
wp plugin install health-check --activate                  # Health checks

# Plugins de performance
wp plugin install redis-cache --activate                   # Cache Redis
wp plugin install autoptimize --activate                   # Otimização automática
```

### 3. Configuração de Tipos de Post Personalizados

Adicione ao arquivo `functions.php` do seu tema WordPress:

```php
<?php
// functions.php - Configuração para Saraiva Vision CMS

// ==========================================
// TIPOS DE POST PERSONALIZADOS
// ==========================================

// Serviços Oftalmológicos
function register_services_post_type() {
    register_post_type('service', [
        'labels' => [
            'name' => 'Serviços',
            'singular_name' => 'Serviço',
            'menu_name' => 'Serviços Oftalmológicos',
            'add_new' => 'Adicionar Serviço',
            'add_new_item' => 'Adicionar Novo Serviço',
            'edit_item' => 'Editar Serviço',
            'view_item' => 'Ver Serviço',
        ],
        'public' => true,
        'show_in_rest' => true,
        'rest_base' => 'services',
        'menu_icon' => 'dashicons-heart',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'custom-fields', 'revisions'],
        'taxonomies' => ['service_category'],
        'rewrite' => ['slug' => 'servicos'],
    ]);
}
add_action('init', 'register_services_post_type');

// Equipe Médica
function register_team_members_post_type() {
    register_post_type('team_member', [
        'labels' => [
            'name' => 'Equipe Médica',
            'singular_name' => 'Membro da Equipe',
            'menu_name' => 'Equipe Médica',
        ],
        'public' => true,
        'show_in_rest' => true,
        'rest_base' => 'team-members',
        'menu_icon' => 'dashicons-groups',
        'supports' => ['title', 'editor', 'thumbnail', 'custom-fields', 'page-attributes'],
        'rewrite' => ['slug' => 'equipe'],
    ]);
}
add_action('init', 'register_team_members_post_type');

// Depoimentos de Pacientes
function register_testimonials_post_type() {
    register_post_type('testimonial', [
        'labels' => [
            'name' => 'Depoimentos',
            'singular_name' => 'Depoimento',
            'menu_name' => 'Depoimentos de Pacientes',
        ],
        'public' => true,
        'show_in_rest' => true,
        'rest_base' => 'testimonials',
        'menu_icon' => 'dashicons-testimonial',
        'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
        'rewrite' => ['slug' => 'depoimentos'],
    ]);
}
add_action('init', 'register_testimonials_post_type');

// Artigos Médicos (para blog)
function register_medical_articles_post_type() {
    register_post_type('medical_article', [
        'labels' => [
            'name' => 'Artigos Médicos',
            'singular_name' => 'Artigo Médico',
            'menu_name' => 'Blog Médico',
        ],
        'public' => true,
        'show_in_rest' => true,
        'rest_base' => 'medical-articles',
        'menu_icon' => 'dashicons-media-document',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'custom-fields', 'author'],
        'taxonomies' => ['category', 'post_tag', 'medical_specialty'],
        'rewrite' => ['slug' => 'blog'],
    ]);
}
add_action('init', 'register_medical_articles_post_type');

// ==========================================
// TAXONOMIAS PERSONALIZADAS
// ==========================================

// Especialidades Médicas
function register_medical_specialties_taxonomy() {
    register_taxonomy('medical_specialty', ['medical_article'], [
        'labels' => [
            'name' => 'Especialidades Médicas',
            'singular_name' => 'Especialidade Médica',
        ],
        'hierarchical' => true,
        'show_in_rest' => true,
        'rewrite' => ['slug' => 'especialidade'],
    ]);
}
add_action('init', 'register_medical_specialties_taxonomy');

// Categorias de Serviços
function register_service_categories_taxonomy() {
    register_taxonomy('service_category', ['service'], [
        'labels' => [
            'name' => 'Categorias de Serviço',
            'singular_name' => 'Categoria de Serviço',
        ],
        'hierarchical' => true,
        'show_in_rest' => true,
        'rewrite' => ['slug' => 'categoria-servico'],
    ]);
}
add_action('init', 'register_service_categories_taxonomy');

// ==========================================
// CAMPOS ACF (ADVANCED CUSTOM FIELDS)
// ==========================================

// Campos para Serviços Oftalmológicos
function register_service_acf_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group([
            'key' => 'service_details',
            'title' => 'Detalhes do Serviço',
            'fields' => [
                [
                    'key' => 'service_duration',
                    'label' => 'Duração (minutos)',
                    'name' => 'duration',
                    'type' => 'number',
                    'required' => 1,
                ],
                [
                    'key' => 'service_price',
                    'label' => 'Preço Estimado',
                    'name' => 'price',
                    'type' => 'text',
                    'instructions' => 'Formato: R$ XXX,XX',
                ],
                [
                    'key' => 'service_medical_disclaimer',
                    'label' => 'Isenção de Responsabilidade Médica',
                    'name' => 'medical_disclaimer',
                    'type' => 'textarea',
                    'default_value' => 'Este serviço não substitui consulta médica. Procure sempre orientação profissional.',
                    'required' => 1,
                ],
                [
                    'key' => 'service_preparation',
                    'label' => 'Preparação Necessária',
                    'name' => 'preparation',
                    'type' => 'wysiwyg',
                    'instructions' => 'Instruções para o paciente se preparar para o exame/procedimento',
                ],
            ],
            'location' => [
                [
                    [
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'service',
                    ],
                ],
            ],
        ]);
    }
}
add_action('acf/init', 'register_service_acf_fields');

// Campos para Equipe Médica (CFM Compliance)
function register_team_member_acf_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group([
            'key' => 'team_member_details',
            'title' => 'Informações Profissionais (CFM)',
            'fields' => [
                [
                    'key' => 'member_crm',
                    'label' => 'CRM',
                    'name' => 'crm',
                    'type' => 'text',
                    'required' => 1,
                    'instructions' => 'Número do Conselho Regional de Medicina (obrigatório)',
                ],
                [
                    'key' => 'member_specialty',
                    'label' => 'Especialidade Médica',
                    'name' => 'specialty',
                    'type' => 'text',
                    'required' => 1,
                ],
                [
                    'key' => 'member_education',
                    'label' => 'Formação Acadêmica',
                    'name' => 'education',
                    'type' => 'textarea',
                    'instructions' => 'Universidade, ano de formação, títulos',
                ],
                [
                    'key' => 'member_experience',
                    'label' => 'Anos de Experiência',
                    'name' => 'experience_years',
                    'type' => 'number',
                ],
                [
                    'key' => 'member_certifications',
                    'label' => 'Certificações e Títulos',
                    'name' => 'certifications',
                    'type' => 'textarea',
                ],
            ],
            'location' => [
                [
                    [
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'team_member',
                    ],
                ],
            ],
        ]);
    }
}
add_action('acf/init', 'register_team_member_acf_fields');

// Campos para Depoimentos de Pacientes (LGPD Compliance)
function register_testimonial_acf_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group([
            'key' => 'testimonial_details',
            'title' => 'Detalhes do Depoimento (LGPD Compliance)',
            'fields' => [
                [
                    'key' => 'testimonial_patient_name',
                    'label' => 'Nome do Paciente (Anônimo)',
                    'name' => 'patient_name',
                    'type' => 'text',
                    'instructions' => 'Nome fictício ou "Paciente Anônimo" para proteger privacidade (LGPD)',
                    'default_value' => 'Paciente Anônimo',
                ],
                [
                    'key' => 'testimonial_procedure',
                    'label' => 'Procedimento Realizado',
                    'name' => 'procedure',
                    'type' => 'text',
                    'required' => 1,
                    'instructions' => 'Nome do exame ou tratamento oftalmológico',
                ],
                [
                    'key' => 'testimonial_rating',
                    'label' => 'Avaliação (1-5 estrelas)',
                    'name' => 'rating',
                    'type' => 'select',
                    'choices' => [
                        '5' => '⭐⭐⭐⭐⭐ (Excelente)',
                        '4' => '⭐⭐⭐⭐ (Muito Bom)',
                        '3' => '⭐⭐⭐ (Bom)',
                        '2' => '⭐⭐ (Regular)',
                        '1' => '⭐ (Ruim)',
                    ],
                    'default_value' => '5',
                ],
                [
                    'key' => 'testimonial_consent',
                    'label' => 'Consentimento LGPD',
                    'name' => 'lgpd_consent',
                    'type' => 'true_false',
                    'required' => 1,
                    'message' => 'Paciente autorizou o uso do depoimento (obrigatório)',
                    'instructions' => 'Marque apenas se o paciente assinou termo de consentimento LGPD',
                ],
                [
                    'key' => 'testimonial_date',
                    'label' => 'Data do Procedimento',
                    'name' => 'procedure_date',
                    'type' => 'date_picker',
                    'instructions' => 'Data aproximada (mês/ano) para contextualizar o depoimento',
                ],
                [
                    'key' => 'testimonial_medical_disclaimer',
                    'label' => 'Isenção Médica',
                    'name' => 'medical_disclaimer',
                    'type' => 'textarea',
                    'default_value' => 'Este depoimento representa a experiência pessoal do paciente e não garante resultados similares. Cada caso é único e deve ser avaliado individualmente por um oftalmologista.',
                    'required' => 1,
                ],
            ],
            'location' => [
                [
                    [
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'testimonial',
                    ],
                ],
            ],
        ]);
    }
}
add_action('acf/init', 'register_testimonial_acf_fields');

// Campos para Artigos Médicos (CFM Compliance Obrigatória)
function register_medical_article_acf_fields() {
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group([
            'key' => 'medical_article_compliance',
            'title' => 'Conformidade Médica (CFM - Obrigatório)',
            'fields' => [
                [
                    'key' => 'article_author_crm',
                    'label' => 'CRM do Autor Responsável',
                    'name' => 'author_crm',
                    'type' => 'text',
                    'required' => 1,
                    'instructions' => 'CRM do médico responsável pelo conteúdo (obrigatório por lei)',
                ],
                [
                    'key' => 'article_medical_disclaimer',
                    'label' => 'Isenção Médica Obrigatória',
                    'name' => 'medical_disclaimer',
                    'type' => 'textarea',
                    'default_value' => 'IMPORTANTE: Este artigo não substitui consulta médica. As informações aqui apresentadas têm caráter informativo e educacional, não devendo ser usadas como diagnóstico, tratamento ou prescrição médica. Sempre consulte um oftalmologista qualificado para avaliação e tratamento adequados à sua condição.',
                    'required' => 1,
                ],
                [
                    'key' => 'article_references',
                    'label' => 'Referências Científicas',
                    'name' => 'medical_references',
                    'type' => 'textarea',
                    'instructions' => 'Fontes científicas, estudos e referências médicas utilizadas',
                ],
                [
                    'key' => 'article_review_date',
                    'label' => 'Data da Última Revisão Médica',
                    'name' => 'review_date',
                    'type' => 'date_picker',
                    'required' => 1,
                    'instructions' => 'Quando o conteúdo foi revisado pela última vez por profissional médico',
                ],
                [
                    'key' => 'article_target_audience',
                    'label' => 'Público-Alvo',
                    'name' => 'target_audience',
                    'type' => 'select',
                    'choices' => [
                        'geral' => 'Público Geral',
                        'pacientes' => 'Pacientes',
                        'profissionais' => 'Profissionais de Saúde',
                    ],
                    'default_value' => 'geral',
                ],
                [
                    'key' => 'article_content_warnings',
                    'label' => 'Advertências de Conteúdo',
                    'name' => 'content_warnings',
                    'type' => 'checkbox',
                    'choices' => [
                        'graphic_images' => 'Imagens Gráficas Médicas',
                        'sensitive_topics' => 'Tópicos Sensíveis',
                        'treatment_details' => 'Detalhes de Tratamentos',
                        'anatomy_descriptions' => 'Descrições Anatômicas',
                    ],
                    'instructions' => 'Marque se o artigo contém conteúdo que pode ser sensível',
                ],
                [
                    'key' => 'article_peer_reviewed',
                    'label' => 'Revisado por Pares',
                    'name' => 'peer_reviewed',
                    'type' => 'true_false',
                    'instructions' => 'Conteúdo revisado por outro profissional médico qualificado',
                ],
            ],
            'location' => [
                [
                    [
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'medical_article',
                    ],
                ],
            ],
        ]);
    }
}
add_action('acf/init', 'register_medical_article_acf_fields');
```

#### Set Up Webhooks
Add webhook functionality to trigger revalidation:

```php
// Add webhook triggers for content updates
function trigger_nextjs_revalidation($post_id, $post, $update) {
    // Only trigger for published posts
    if ($post->post_status !== 'publish') return;
    
    $webhook_url = 'https://saraivavision.com.br/api/wordpress-webhook';
    $webhook_secret = get_option('nextjs_webhook_secret');
    
    $payload = [
        'action' => $update ? 'wp_update_post' : 'publish_' . $post->post_type,
        'post_id' => $post_id,
        'post_type' => $post->post_type,
        'post_slug' => $post->post_name,
        'post_status' => $post->post_status,
        'post_title' => $post->post_title,
        'post_modified' => $post->post_modified,
    ];
    
    wp_remote_post($webhook_url, [
        'body' => json_encode($payload),
        'headers' => [
            'Content-Type' => 'application/json',
            'X-Hub-Signature-256' => 'sha256=' . hash_hmac('sha256', json_encode($payload), $webhook_secret),
        ],
        'timeout' => 10,
    ]);
}

add_action('wp_insert_post', 'trigger_nextjs_revalidation', 10, 3);
add_action('before_delete_post', function($post_id) {
    $post = get_post($post_id);
    if ($post) {
        trigger_nextjs_revalidation($post_id, $post, false);
    }
});
```

### 4. Segurança Médica e Conformidade

#### Configurações de Segurança CFM/LGPD

```php
// wp-config.php - Configurações de segurança médica obrigatórias
define('CFM_COMPLIANCE_MODE', true);
define('LGPD_COMPLIANCE_LEVEL', 'strict');
define('MEDICAL_CONTENT_RESTRICTION', true);

// Desabilitar edição de arquivos (segurança crítica)
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', false); // Permite apenas plugins aprovados
define('DISALLOW_UNFILTERED_HTML', true); // Previne XSS em conteúdo médico

// Logs de auditoria médica obrigatórios
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);

// Limitações de conteúdo médico
define('MAX_POST_REVISIONS', 10);
define('EMPTY_TRASH_DAYS', 30);
define('WP_POST_REVISIONS', 10);
define('AUTOSAVE_INTERVAL', 300); // 5 minutos para conteúdo médico

// Segurança adicional para dados médicos
define('FORCE_SSL_ADMIN', true);
define('FORCE_SSL_LOGIN', true);
define('WP_CACHE', true); // Cache obrigatório para performance
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
# WordPress REST API Configuration
WORDPRESS_API_URL=https://cms.saraivavision.com.br
WORDPRESS_DOMAIN=https://cms.saraivavision.com.br
WP_REVALIDATE_SECRET=your_secure_revalidate_secret_here
WP_WEBHOOK_SECRET=your_secure_webhook_secret_here

# Autenticação JWT (para admin operations)
WP_JWT_SECRET=your_jwt_secret_key_here
WP_ADMIN_USERNAME=admin_saraiva
WP_APP_PASSWORD=secure_app_password_here

# Configurações de Segurança Médica
CFM_COMPLIANCE_ENABLED=true
LGPD_STRICT_MODE=true
MEDICAL_CONTENT_FILTER=true

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://saraivavision.com.br
NEXT_PUBLIC_WORDPRESS_URL=https://cms.saraivavision.com.br
```

### 3. Vercel Configuration

Add to your `vercel.json`:

```json
{
  "functions": {
    "api/revalidate.js": { "maxDuration": 10 },
    "api/wordpress-webhook.js": { "maxDuration": 15 }
  },
  "env": {
    "WORDPRESS_GRAPHQL_ENDPOINT": "@wordpress_graphql_endpoint",
    "WP_REVALIDATE_SECRET": "@wp_revalidate_secret",
    "WP_WEBHOOK_SECRET": "@wp_webhook_secret"
  }
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

### WordPress REST API Endpoints
- `GET /wp-json/wp/v2/posts` - List all posts
- `GET /wp-json/wp/v2/posts/{id}` - Get specific post
- `GET /wp-json/wp/v2/pages` - List all pages
- `GET /wp-json/wp/v2/categories` - List categories
- `GET /wp-json/wp/v2/tags` - List tags
- `GET /wp-json/wp/v2/media` - List media files
```

## Caching Strategy

### Cache Levels
1. **Browser Cache**: Static assets and pages
2. **CDN Cache**: Vercel Edge Network
3. **ISR Cache**: Next.js static generation
4. **API Cache**: In-memory WordPress API responses

### Cache Durations
- **Posts**: 5 minutes (frequent updates)
- **Pages**: 1 hour (less frequent updates)
- **Services**: 30 minutes (moderate updates)
- **Site Settings**: 1 hour (rare updates)

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

1. **REST API Endpoint Not Accessible**
    - Check WordPress URL and SSL certificate
    - Verify REST API is enabled (default in WordPress)
    - Test endpoint manually: `curl https://cms.saraivavision.com.br/wp-json/wp/v2/posts`

2. **Webhooks Not Working**
    - Verify webhook URL is accessible from WordPress server
    - Check webhook secret configuration
    - Monitor webhook logs in WordPress

3. **ISR Not Updating**
    - Verify revalidation secret is correct
    - Check Vercel function logs
    - Ensure webhook payload format is correct

4. **Cache Issues**
    - Clear cache manually: `invalidateCache()`
    - Check cache TTL settings
    - Verify cache key generation

### Debug Commands

```bash
# Test WordPress REST API endpoint
curl https://cms.saraivavision.com.br/wp-json/wp/v2/posts

# Test specific post
curl https://cms.saraivavision.com.br/wp-json/wp/v2/posts/123

# Test revalidation endpoint
curl -X POST https://saraivavision.com.br/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret": "your_secret", "path": "/"}'

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