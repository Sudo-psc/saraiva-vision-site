<?php

/**
 * WordPress API REST Fix - Clínica Saraiva Vision
 * 
 * Adicione este código ao functions.php do tema ativo ou crie um plugin
 * para resolver problemas de 404 na API REST do WordPress
 * 
 * Desenvolvido para: Dr. Philipe Saraiva Cruz (CRM-MG 69.870)
 * Clínica: Saraiva Vision - Caratinga, MG
 */

// Prevenir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Classe principal para corrigir problemas da API REST
 */
class ClinicaSaraivaVision_API_Fix
{

    public function __construct()
    {
        add_action('init', array($this, 'fix_rest_api_permalinks'));
        add_action('wp_loaded', array($this, 'ensure_rest_api_enabled'));
        add_filter('rest_enabled', '__return_true');
        add_filter('rest_jsonp_enabled', '__return_true');

        // Hook para depuração (apenas em desenvolvimento)
        if (WP_DEBUG) {
            add_action('rest_api_init', array($this, 'log_rest_api_status'));
        }
    }

    /**
     * Corrigir problemas de permalinks da API REST
     */
    public function fix_rest_api_permalinks()
    {
        // Verificar se as regras de rewrite precisam ser atualizadas
        $permalink_structure = get_option('permalink_structure');

        // Se permalinks estiverem vazios, configurar estrutura padrão
        if (empty($permalink_structure)) {
            // Check if we've already attempted to fix this
            $fix_attempted = get_option('saraiva_vision_permalink_fix_attempted');

            if (!$fix_attempted) {
                global $wp_rewrite;
                $wp_rewrite->set_permalink_structure('/%postname%/');
                flush_rewrite_rules(false);
                update_option('saraiva_vision_permalink_fix_attempted', true);

                // Log da correção
                error_log('[Clínica Saraiva Vision] Permalink structure corrigida');
            }
        }
        // Garantir que a API REST funcione mesmo com permalinks problemáticos
        add_action('parse_request', array($this, 'handle_rest_route_fallback'));
    }

    /**
     * Fallback para quando a API REST não funciona com permalinks
     */
    public function handle_rest_route_fallback($wp)
    {
        // Verificar se é uma requisição para API REST via query parameter
        if (isset($_GET['rest_route'])) {
            $rest_route = sanitize_text_field($_GET['rest_route']);

            // Verificar se é uma rota válida da API WP v2
            if (strpos($rest_route, '/wp/v2/') === 0) {
                // Definir a rota REST
                $wp->query_vars['rest_route'] = $rest_route;

                // Log da correção
                error_log('[Clínica Saraiva Vision] Usando fallback rest_route: ' . $rest_route);
            }
        }
    }

    /**
     * Garantir que a API REST esteja habilitada
     */
    public function ensure_rest_api_enabled()
    {
        // Remover filtros que possam desabilitar a API REST
        $filters_to_remove = array(
            'rest_enabled',
            'rest_jsonp_enabled',
            'wp_rest_server_class'
        );

        foreach ($filters_to_remove as $filter) {
            if (has_filter($filter, '__return_false')) {
                remove_filter($filter, '__return_false');
                error_log('[Clínica Saraiva Vision] Removido filtro restritivo: ' . $filter);
            }
        }

        // Garantir que a API REST esteja habilitada
        if (!function_exists('rest_get_server')) {
            error_log('[Clínica Saraiva Vision] ERRO: Função rest_get_server não existe');
        }
    }

    /**
     * Log do status da API REST (apenas em desenvolvimento)
     */
    public function log_rest_api_status()
    {
        if (!WP_DEBUG) {
            return;
        }

        $status = array(
            'timestamp' => current_time('mysql'),
            'clinic' => 'Clínica Saraiva Vision - Caratinga, MG',
            'doctor' => 'Dr. Philipe Saraiva Cruz (CRM-MG 69.870)',
            'api_enabled' => rest_enabled(),
            'permalink_structure' => get_option('permalink_structure'),
            'rest_url' => get_rest_url(),
            'home_url' => home_url(),
            'site_url' => site_url()
        );

        error_log('[Clínica Saraiva Vision] Status da API REST: ' . json_encode($status));
    }

    /**
     * Adicionar headers CORS para desenvolvimento
     */
    public function add_cors_headers()
    {
        // Apenas adicionar CORS em desenvolvimento
        if (WP_DEBUG || (defined('WP_ENVIRONMENT_TYPE') && WP_ENVIRONMENT_TYPE === 'development')) {
            // Use specific origins instead of wildcard
            $allowed_origins = array(
                'http://localhost:4173',
                'http://localhost:5173',
                'http://192.168.100.122:4173'
            );

            $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
            if (in_array($origin, $allowed_origins)) {
                header('Access-Control-Allow-Origin: ' . $origin);
            }

            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');

            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                http_response_code(200);
                exit;
            }
        }
    }
}

// Inicializar a correção
new ClinicaSaraivaVision_API_Fix();

/**
 * Adicionar endpoint customizado para teste da API
 */
add_action('rest_api_init', function () {
    register_rest_route('clinica-saraiva-vision/v1', '/test', array(
        'methods' => 'GET',
        'callback' => 'clinica_saraiva_vision_api_test',
        'permission_callback' => '__return_true'
    ));
});

/**
 * Função de teste da API da clínica
 */
function clinica_saraiva_vision_api_test()
{
    return new WP_REST_Response(array(
        'status' => 'success',
        'message' => 'API WordPress funcionando corretamente',
        'clinic' => array(
            'name' => 'Clínica Saraiva Vision',
            'location' => 'Caratinga, Minas Gerais',
            'doctor' => array(
                'name' => 'Dr. Philipe Saraiva Cruz',
                'crm' => 'CRM-MG 69.870',
                'specialty' => 'Oftalmologia'
            ),
            'nurse' => array(
                'name' => 'Ana Lúcia',
                'specialty' => 'Enfermagem Oftalmológica'
            ),
            'partnership' => 'Clínica Amor e Saúde',
            'services' => array(
                'Consultas Oftalmológicas',
                'Refração',
                'Paquimetria',
                'Mapeamento de Retina',
                'Biometria',
                'Retinografia',
                'Topografia Corneana',
                'Meiobografia',
                'Testes de Jones e Schirmer',
                'Adaptação de Lentes de Contato'
            )
        ),
        'api_info' => array(
            'rest_url' => get_rest_url(),
            'posts_endpoint' => get_rest_url(null, 'wp/v2/posts'),
            'categories_endpoint' => get_rest_url(null, 'wp/v2/categories'),
            'test_endpoint' => get_rest_url(null, 'clinica-saraiva-vision/v1/test')
        ),
        'timestamp' => current_time('mysql'),
        'wordpress_version' => get_bloginfo('version'),
        'php_version' => PHP_VERSION
    ), 200);
}

/**
 * Adicionar informações da clínica ao cabeçalho da API REST
 */
add_action('rest_api_init', function () {
    header('X-Clinic-Name: Clinica Saraiva Vision');
    header('X-Clinic-Doctor: Dr. Philipe Saraiva Cruz CRM-MG-69870');
    header('X-Clinic-Location: Caratinga-MG');
});

/**
 * Flush de regras de rewrite na ativação (se usado como plugin)
 */
register_activation_hook(__FILE__, function () {
    flush_rewrite_rules();
    error_log('[Clínica Saraiva Vision] Plugin ativado - regras de rewrite atualizadas');
});

register_deactivation_hook(__FILE__, function () {
    flush_rewrite_rules();
    error_log('[Clínica Saraiva Vision] Plugin desativado - regras de rewrite limpas');
});


