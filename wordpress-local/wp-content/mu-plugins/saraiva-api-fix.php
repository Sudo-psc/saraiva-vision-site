<?php

/**
 * Plugin para configuração automática do WordPress
 * Clínica Saraiva Vision - Dr. Philipe Saraiva Cruz
 * 
 * Este plugin configura automaticamente o WordPress para funcionar como Headless CMS
 * para o site da Clínica Saraiva Vision
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Configurações de CORS para API REST
 */
function saraiva_enable_cors()
{
    // Allow CORS from frontend domains
    $allowed_origins = [
        'http://localhost:3002',
        'http://localhost:8082',
        'https://saraivavision.com.br',
        'https://www.saraivavision.com.br'
    ];

    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
    }

    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
            header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
        }

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
        }

        exit(0);
    }
}
add_action('init', 'saraiva_enable_cors');

/**
 * Adicionar campos customizados para posts médicos
 */
function saraiva_add_post_meta_fields()
{
    // Campos específicos para posts médicos
    add_meta_box(
        'saraiva_medical_meta',
        'Informações Médicas',
        'saraiva_medical_meta_callback',
        'post',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'saraiva_add_post_meta_fields');

function saraiva_medical_meta_callback($post)
{
    wp_nonce_field('saraiva_medical_meta', 'saraiva_medical_meta_nonce');

    $difficulty_level = get_post_meta($post->ID, '_medical_difficulty', true);
    $reading_time = get_post_meta($post->ID, '_reading_time', true);
    $medical_disclaimer = get_post_meta($post->ID, '_medical_disclaimer', true);

?>
    <table class="form-table">
        <tr>
            <th><label for="medical_difficulty">Nível de Dificuldade:</label></th>
            <td>
                <select name="medical_difficulty" id="medical_difficulty">
                    <option value="basic" <?php selected($difficulty_level, 'basic'); ?>>Básico</option>
                    <option value="intermediate" <?php selected($difficulty_level, 'intermediate'); ?>>Intermediário</option>
                    <option value="advanced" <?php selected($difficulty_level, 'advanced'); ?>>Avançado</option>
                </select>
            </td>
        </tr>
        <tr>
            <th><label for="reading_time">Tempo de Leitura (min):</label></th>
            <td>
                <input type="number" name="reading_time" id="reading_time" value="<?php echo $reading_time; ?>" min="1" max="60" />
            </td>
        </tr>
        <tr>
            <th><label for="medical_disclaimer">Aviso Médico Personalizado:</label></th>
            <td>
                <textarea name="medical_disclaimer" id="medical_disclaimer" rows="3" cols="50"><?php echo $medical_disclaimer; ?></textarea>
                <p class="description">Deixe em branco para usar o aviso padrão.</p>
            </td>
        </tr>
    </table>
<?php
}

function saraiva_save_medical_meta($post_id)
{
    if (!isset($_POST['saraiva_medical_meta_nonce']) || !wp_verify_nonce($_POST['saraiva_medical_meta_nonce'], 'saraiva_medical_meta')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (isset($_POST['medical_difficulty'])) {
        update_post_meta($post_id, '_medical_difficulty', sanitize_text_field($_POST['medical_difficulty']));
    }

    if (isset($_POST['reading_time'])) {
        update_post_meta($post_id, '_reading_time', intval($_POST['reading_time']));
    }

    if (isset($_POST['medical_disclaimer'])) {
        update_post_meta($post_id, '_medical_disclaimer', sanitize_textarea_field($_POST['medical_disclaimer']));
    }
}
add_action('save_post', 'saraiva_save_medical_meta');

/**
 * Adicionar campos customizados à API REST
 */
function saraiva_register_rest_fields()
{
    // Campo de dificuldade médica
    register_rest_field('post', 'medical_difficulty', [
        'get_callback' => function ($object) {
            return get_post_meta($object['id'], '_medical_difficulty', true) ?: 'basic';
        },
        'schema' => [
            'description' => 'Nível de dificuldade do conteúdo médico',
            'type' => 'string',
            'enum' => ['basic', 'intermediate', 'advanced'],
        ],
    ]);

    // Campo de tempo de leitura
    register_rest_field('post', 'reading_time', [
        'get_callback' => function ($object) {
            return intval(get_post_meta($object['id'], '_reading_time', true)) ?: 5;
        },
        'schema' => [
            'description' => 'Tempo estimado de leitura em minutos',
            'type' => 'integer',
        ],
    ]);

    // Campo de aviso médico
    register_rest_field('post', 'medical_disclaimer', [
        'get_callback' => function ($object) {
            $custom = get_post_meta($object['id'], '_medical_disclaimer', true);
            return $custom ?: 'Este conteúdo é meramente informativo. Consulte sempre um oftalmologista para diagnóstico e tratamento adequado.';
        },
        'schema' => [
            'description' => 'Aviso médico do post',
            'type' => 'string',
        ],
    ]);

    // Informações do autor médico
    register_rest_field('post', 'doctor_info', [
        'get_callback' => function ($object) {
            $author_id = $object['author'];
            return [
                'name' => get_the_author_meta('display_name', $author_id),
                'crm' => get_user_meta($author_id, 'doctor_crm', true) ?: 'CRM-MG 69.870',
                'specialty' => get_user_meta($author_id, 'doctor_specialty', true) ?: 'Oftalmologia',
                'clinic' => get_user_meta($author_id, 'clinic_location', true) ?: 'Caratinga, MG',
                'bio' => get_the_author_meta('description', $author_id),
            ];
        },
        'schema' => [
            'description' => 'Informações do médico autor',
            'type' => 'object',
        ],
    ]);

    // Featured image URLs otimizadas
    register_rest_field('post', 'featured_image_urls', [
        'get_callback' => function ($object) {
            $image_id = get_post_thumbnail_id($object['id']);
            if ($image_id) {
                return [
                    'thumbnail' => wp_get_attachment_image_url($image_id, 'blog-thumb'),
                    'medium' => wp_get_attachment_image_url($image_id, 'blog-medium'),
                    'large' => wp_get_attachment_image_url($image_id, 'blog-large'),
                    'full' => wp_get_attachment_image_url($image_id, 'full'),
                    'alt_text' => get_post_meta($image_id, '_wp_attachment_image_alt', true)
                ];
            }
            return null;
        },
        'schema' => [
            'description' => 'URLs das imagens em diferentes tamanhos',
            'type' => 'object',
        ],
    ]);
}
add_action('rest_api_init', 'saraiva_register_rest_fields');

/**
 * Configurar thumbnails e tamanhos de imagem
 */
function saraiva_setup_theme_support()
{
    // Habilitar thumbnails
    add_theme_support('post-thumbnails');

    // Definir tamanhos de imagem personalizados
    add_image_size('blog-thumb', 300, 200, true);
    add_image_size('blog-medium', 600, 400, true);
    add_image_size('blog-large', 1200, 800, true);
    add_image_size('blog-hero', 1920, 1080, true);
}
add_action('after_setup_theme', 'saraiva_setup_theme_support');

/**
 * Configurações automáticas na ativação
 */
function saraiva_auto_configure()
{
    // Configurar permalinks para SEO
    update_option('permalink_structure', '/blog/%postname%/');

    // Configurações do site
    update_option('blogname', 'Blog Médico - Dr. Philipe Saraiva');
    update_option('blogdescription', 'Informações especializadas em oftalmologia');

    // Configurações de discussão
    update_option('default_comment_status', 'closed');
    update_option('default_ping_status', 'closed');

    // Configurações de leitura
    update_option('posts_per_page', 12);
    update_option('show_on_front', 'posts');

    // Flush rewrite rules
    flush_rewrite_rules();
}

// Executar configurações na primeira carga
if (!get_option('saraiva_configured', false)) {
    saraiva_auto_configure();
    update_option('saraiva_configured', true);
}

/**
 * Adicionar endpoints customizados para a clínica
 */
function saraiva_custom_endpoints()
{
    // Endpoint para informações da clínica
    register_rest_route('saraiva/v1', '/clinic-info', [
        'methods' => 'GET',
        'callback' => function () {
            return [
                'name' => 'Clínica Saraiva Vision',
                'doctor' => [
                    'name' => 'Dr. Philipe Saraiva Cruz',
                    'crm' => 'CRM-MG 69.870',
                    'specialty' => 'Oftalmologia',
                    'qualifications' => [
                        'Especialização em Cirurgia Refrativa',
                        'Especialização em Doenças da Retina',
                        'Membro da Sociedade Brasileira de Oftalmologia'
                    ]
                ],
                'location' => [
                    'city' => 'Caratinga',
                    'state' => 'Minas Gerais',
                    'address' => 'Rua Coronel Antônio Pinto, 131 - Centro',
                    'phone' => '(33) 3321-8555',
                    'email' => 'contato@saraivavision.com.br'
                ],
                'services' => [
                    'Consultas Oftalmológicas',
                    'Exame de Fundo de Olho',
                    'Cirurgia Refrativa',
                    'Tratamento de Glaucoma',
                    'Cirurgia de Catarata',
                    'Adaptação de Lentes de Contato'
                ]
            ];
        },
        'permission_callback' => '__return_true'
    ]);

    // Endpoint para estatísticas do blog
    register_rest_route('saraiva/v1', '/blog-stats', [
        'methods' => 'GET',
        'callback' => function () {
            $posts_count = wp_count_posts('post');
            $categories_count = wp_count_terms(['taxonomy' => 'category']);

            return [
                'total_posts' => $posts_count->publish,
                'total_categories' => $categories_count,
                'latest_post' => get_the_date('c', get_option('sticky_posts')[0] ?? null),
                'wordpress_version' => get_bloginfo('version'),
                'last_updated' => current_time('c')
            ];
        },
        'permission_callback' => '__return_true'
    ]);
}
add_action('rest_api_init', 'saraiva_custom_endpoints');

/**
 * Configurar menus automáticos
 */
function saraiva_create_menus()
{
    // Registrar localização do menu
    register_nav_menus([
        'main-menu' => 'Menu Principal',
        'footer-menu' => 'Menu do Rodapé'
    ]);
}
add_action('init', 'saraiva_create_menus');

/**
 * Adicionar logs de debug para desenvolvimento
 */
function saraiva_log($message, $type = 'info')
{
    if (WP_DEBUG && WP_DEBUG_LOG) {
        error_log("[Saraiva Vision - $type] $message");
    }
}

// Log de inicialização
saraiva_log('Plugin Saraiva Vision carregado com sucesso');

/**
 * Adicionar aviso médico automático nos posts
 */
function saraiva_add_medical_disclaimer($content)
{
    if (is_single() && get_post_type() === 'post') {
        $disclaimer = '<div class="medical-disclaimer" style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 14px;">';
        $disclaimer .= '<strong>⚕️ Aviso Médico:</strong> ';
        $disclaimer .= get_post_meta(get_the_ID(), '_medical_disclaimer', true) ?:
            'Este conteúdo é meramente informativo e não substitui uma consulta médica. Consulte sempre um oftalmologista para diagnóstico e tratamento adequado.';
        $disclaimer .= '<br><small><strong>Dr. Philipe Saraiva Cruz - CRM-MG 69.870</strong></small>';
        $disclaimer .= '</div>';

        $content = $content . $disclaimer;
    }

    return $content;
}
add_filter('the_content', 'saraiva_add_medical_disclaimer');

// Configuração final
saraiva_log('Configurações da Clínica Saraiva Vision aplicadas com sucesso');
?>