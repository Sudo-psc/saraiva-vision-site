<?php
/**
 * Plugin Name: Saraiva Vision API Enhancer
 * Plugin URI: https://saraivavision.com.br/
 * Description: Melhora a API REST da Clínica Saraiva Vision com endpoints customizados para serviços oftalmológicos
 * Version: 1.0.0
 * Author: Dr. Philipe Saraiva Cruz - Clínica Saraiva Vision
 * Author URI: https://saraivavision.com.br/
 * Text Domain: saraiva-vision
 */

// Evitar acesso direto
if (!defined('ABSPATH')) {
    exit;
}

class Saraiva_Vision_API_Enhancer {

    public function __construct() {
        // Registrar endpoints customizados
        add_action('rest_api_init', array($this, 'register_custom_routes'));

        // Melhorar respostas da API existente
        add_filter('rest_post_query', array($this, 'enhance_post_query'), 10, 2);
        add_filter('rest_prepare_post', array($this, 'enhance_post_response'), 10, 3);

        // Forçar regras de rewrite
        add_action('init', array($this, 'flush_rewrite_rules'));

        // Adicionar campos customizados
        add_action('rest_api_init', array($this, 'register_custom_fields'));
    }

    /**
     * Registrar endpoints customizados para a clínica
     */
    public function register_custom_routes() {
        // Endpoint para serviços oftalmológicos
        register_rest_route('saraiva-vision/v1', '/servicos-oftalmologicos', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_servicos_oftalmologicos'),
            'permission_callback' => '__return_true',
            'args' => array(
                'categoria' => array(
                    'default' => 'all',
                    'validate_callback' => function($param) {
                        return is_string($param);
                    }
                ),
                'per_page' => array(
                    'default' => 10,
                    'validate_callback' => function($param) {
                        return is_numeric($param) && $param > 0 && $param <= 100;
                    }
                )
            )
        ));

        // Endpoint para informações da equipe médica
        register_rest_route('saraiva-vision/v1', '/equipe-medica', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_equipe_medica'),
            'permission_callback' => '__return_true'
        ));

        // Endpoint para exames e procedimentos
        register_rest_route('saraiva-vision/v1', '/exames-procedimentos', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_exames_procedimentos'),
            'permission_callback' => '__return_true'
        ));

        // Endpoint de saúde da API
        register_rest_route('saraiva-vision/v1', '/health', array(
            'methods' => 'GET',
            'callback' => array($this, 'api_health_check'),
            'permission_callback' => '__return_true'
        ));
    }

    /**
     * Obter serviços oftalmológicos com categorias específicas
     */
    public function get_servicos_oftalmologicos($request) {
        $params = $request->get_params();
        $categoria = isset($params['categoria']) ? $params['categoria'] : 'all';
        $per_page = isset($params['per_page']) ? intval($params['per_page']) : 10;

        // Mapeamento de categorias oftalmológicas
        $categorias_map = array(
            'glaucoma' => 37,
            'diabetes' => 38,
            'daltonismo' => 41,
            'lentes-contato' => 35,
            'tratamentos' => 9
        );

        $args = array(
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => $per_page,
            'orderby' => 'date',
            'order' => 'DESC'
        );

        if ($categoria !== 'all' && isset($categorias_map[$categoria])) {
            $args['cat'] = $categorias_map[$categoria];
        } else {
            // Buscar em todas as categorias médicas
            $cats_medicas = array_values($categorias_map);
            $args['category__in'] = $cats_medicas;
        }

        $query = new WP_Query($args);
        $posts = array();

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $post_data = $this->prepare_post_data(get_the_ID());
                $posts[] = $post_data;
            }
        }

        wp_reset_postdata();

        return array(
            'success' => true,
            'data' => $posts,
            'total' => count($posts),
            'categoria_filtrada' => $categoria,
            'clinica' => array(
                'nome' => 'Clínica Saraiva Vision',
                'medico_responsavel' => 'Dr. Philipe Saraiva Cruz',
                'crm' => 'CRM-MG 69.870',
                'localizacao' => 'Caratinga, MG'
            )
        );
    }

    /**
     * Obter informações da equipe médica
     */
    public function get_equipe_medica($request) {
        // Buscar páginas sobre equipe médica
        $args = array(
            'post_type' => 'page',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            's' => 'equipe|medico|dra|dr'
        );

        $query = new WP_Query($args);
        $equipe = array();

        // Informações fixas da equipe (podem ser personalizadas via admin)
        $equipe_info = array(
            array(
                'nome' => 'Dr. Philipe Saraiva Cruz',
                'crm' => 'CRM-MG 69.870',
                'especialidade' => 'Oftalmologia',
                'descricao' => 'Médico oftalmologista responsável pela Clínica Saraiva Vision, com foco em atendimento humanizado e tecnologia diagnóstica.',
                'formacao' => array('Graduação em Medicina', 'Especialização em Oftalmologia'),
                'area_atuacao' => array('Cirurgias de catarata', 'Glaucoma', 'Retinopatias', 'Cirurgia refrativa')
            ),
            array(
                'nome' => 'Ana Lúcia',
                'cargo' => 'Enfermeira',
                'descricao' => 'Enfermeira especializada em oftalmologia, responsável pelo pré e pós-operatório e cuidados com pacientes.',
                'formacao' => array('Graduação em Enfermagem', 'Especialização em Oftalmologia'])
        );

        return array(
            'success' => true,
            'data' => $equipe_info,
            'total' => count($equipe_info),
            'clinica' => 'Clínica Saraiva Vision - Caratinga, MG'
        );
    }

    /**
     * Obter exames e procedimentos oftalmológicos
     */
    public function get_exames_procedimentos($request) {
        $exames = array(
            array(
                'id' => 'refracao',
                'nome' => 'Refração',
                'descricao' => 'Exame para determinar o grau de erro refrativo (miopia, hipermetropia, astigmatismo) e prescrever óculos ou lentes de contato.',
                'duracao' => '30 minutos',
                'preparo' => 'Nenhum preparo necessário',
                'idade_minima' => '5 anos'
            ),
            array(
                'id' => 'paquimetria',
                'nome' => 'Paquimetria',
                'descricao' => 'Medição da espessura corneana, essencial para avaliação pré-cirúrgica de catarata e cirurgia refrativa.',
                'duracao' => '15 minutos',
                'preparo' => 'Nenhum preparo necessário',
                'idade_minima' => '3 anos'
            ),
            array(
                'id' => 'mapeamento-retina',
                'nome' => 'Mapeamento de Retina',
                'descricao' => 'Exame detalhado da retina para diagnosticar doenças como retinopatia diabética, degeneração macular e descolamento de retina.',
                'duracao' => '45 minutos',
                'preparo' => 'Dilatação pupilar necessária',
                'idade_minima' => '10 anos'
            ),
            array(
                'id' => 'biometria',
                'nome' => 'Biometria',
                'descricao' => 'Medição das estruturas oculares para cálculo de lentes intraoculares em cirurgias de catarata.',
                'duracao' => '20 minutos',
                'preparo' => 'Nenhum preparo necessário',
                'idade_minima' => '18 anos'
            ),
            array(
                'id' => 'retinografia',
                'nome' => 'Retinografia',
                'descricao' => 'Fotografia do fundo de olho para documentação e acompanhamento de doenças retinianas.',
                'duracao' => '15 minutos',
                'preparo' => 'Dilatação pupilar necessária',
                'idade_minima' => '5 anos'
            ),
            array(
                'id' => 'topografia-corneana',
                'nome' => 'Topografia Corneana',
                'descricao' => 'Mapeamento detalhado da superfície corneana para avaliação de ceratocone e planejamento cirúrgico.',
                'duracao' => '30 minutos',
                'preparo' => 'Nenhum preparo necessário',
                'idade_minima' => '16 anos'
            ),
            array(
                'id' => 'meiobografia',
                'nome' => 'Meiobografia',
                'descricao' => 'Exame das glândulas meibomianas para diagnóstico de olho seco e blefarite.',
                'duracao' => '25 minutos',
                'preparo' => 'Nenhum preparo necessário',
                'idade_minima' => '12 anos'
            ),
            array(
                'id' => 'teste-jones',
                'nome' => 'Teste de Jones',
                'descricao' => 'Avaliação da produção lacrimal para diagnóstico de olho seco.',
                'duracao' => '10 minutos',
                'preparo' => 'Nenhum preparo necessário',
                'idade_minima' => '6 anos'
            ),
            array(
                'id' => 'teste-schirmer',
                'nome' => 'Teste de Schirmer',
                'descricao' => 'Medição quantitativa da produção lacrimal.',
                'duracao' => '5 minutos',
                'preparo' => 'Nenhum preparo necessário',
                'idade_minima' => '6 anos'
            )
        );

        return array(
            'success' => true,
            'data' => $exames,
            'total' => count($exames),
            'clinica' => 'Clínica Saraiva Vision - Especialista em Diagnóstico Oftalmológico'
        );
    }

    /**
     * Health check da API
     */
    public function api_health_check($request) {
        return array(
            'status' => 'healthy',
            'timestamp' => current_time('mysql'),
            'clinica' => 'Clínica Saraiva Vision',
            'medico_responsavel' => 'Dr. Philipe Saraiva Cruz - CRM-MG 69.870',
            'localizacao' => 'Caratinga, MG',
            'endpoints_disponiveis' => array(
                '/wp-json/wp/v2/posts',
                '/wp-json/wp/v2/categories',
                '/wp-json/saraiva-vision/v1/servicos-oftalmologicos',
                '/wp-json/saraiva-vision/v1/equipe-medica',
                '/wp-json/saraiva-vision/v1/exames-procedimentos',
                '/wp-json/saraiva-vision/v1/health'
            ),
            'versao' => '1.0.0'
        );
    }

    /**
     * Preparar dados do post para resposta
     */
    private function prepare_post_data($post_id) {
        $post = get_post($post_id);
        $categories = get_the_category($post_id);
        $category_names = array_map(function($cat) {
            return $cat->name;
        }, $categories);

        return array(
            'id' => $post->ID,
            'titulo' => $post->post_title,
            'conteudo' => wpautop($post->post_content),
            'excerpt' => get_the_excerpt($post_id),
            'categorias' => $category_names,
            'data_publicacao' => $post->post_date,
            'link' => get_permalink($post_id),
            'clinica_info' => array(
                'medico_responsavel' => 'Dr. Philipe Saraiva Cruz',
                'crm' => 'CRM-MG 69.870',
                'especialidade' => 'Oftalmologia'
            )
        );
    }

    /**
     * Melhorar query de posts para incluir conteúdo oftalmológico
     */
    public function enhance_post_query($args, $request) {
        // Garantir que posts médicos sejam priorizados
        $args['orderby'] = 'date';
        $args['order'] = 'DESC';

        // Incluir categorias médicas por padrão
        if (!isset($args['category__not_in'])) {
            $cats_medicas = array(37, 38, 41, 35, 9); // IDs das categorias médicas
            if (!isset($args['category__in'])) {
                $args['category__in'] = $cats_medicas;
            }
        }

        return $args;
    }

    /**
     * Melhorar resposta do post
     */
    public function enhance_post_response($response, $post, $request) {
        $data = $response->get_data();

        // Adicionar informações da clínica
        $data['clinica'] = array(
            'nome' => 'Clínica Saraiva Vision',
            'endereco' => 'Caratinga, MG',
            'medico_responsavel' => 'Dr. Philipe Saraiva Cruz',
            'crm' => 'CRM-MG 69.870',
            'contato' => array(
                'whatsapp' => 'Link para WhatsApp da clínica',
                'telefone' => 'Número de telefone da clínica'
            )
        );

        $response->set_data($data);
        return $response;
    }

    /**
     * Forçar flush das regras de rewrite
     */
    public function flush_rewrite_rules() {
        flush_rewrite_rules();
    }

    /**
     * Registrar campos customizados na API
     */
    public function register_custom_fields() {
        // Registrar campos customizados se necessário
        register_rest_field('post', 'clinica_info', array(
            'get_callback' => array($this, 'get_clinica_info_field'),
            'schema' => null,
        ));
    }

    /**
     * Obter campo de informações da clínica
     */
    public function get_clinica_info_field($object, $field_name, $request) {
        return array(
            'medico_responsavel' => 'Dr. Philipe Saraiva Cruz',
            'crm' => 'CRM-MG 69.870',
            'clinica' => 'Clínica Saraiva Vision',
            'localizacao' => 'Caratinga, MG'
        );
    }
}

// Inicializar o plugin
new Saraiva_Vision_API_Enhancer();

/**
 * Função de validação de rotas (para diagnóstico)
 */
function validate_saraiva_vision_routes() {
    $routes = array(
        'posts' => '/wp-json/wp/v2/posts',
        'categories' => '/wp-json/wp/v2/categories',
        'servicos_oftalmologicos' => '/wp-json/saraiva-vision/v1/servicos-oftalmologicos',
        'equipe_medica' => '/wp-json/saraiva-vision/v1/equipe-medica',
        'exames_procedimentos' => '/wp-json/saraiva-vision/v1/exames-procedimentos',
        'health' => '/wp-json/saraiva-vision/v1/health'
    );

    $results = array();

    foreach ($routes as $name => $route) {
        $response = wp_remote_get(get_home_url(null, $route));
        $results[$name] = array(
            'route' => $route,
            'status' => wp_remote_retrieve_response_code($response),
            'success' => wp_remote_retrieve_response_code($response) === 200
        );
    }

    return $results;
}

/**
 * Forçar regras de rewrite na ativação
 */
register_activation_hook(__FILE__, function() {
    flush_rewrite_rules();
});

/**
 * Limpar regras de rewrite na desativação
 */
register_deactivation_hook(__FILE__, function() {
    flush_rewrite_rules();
});
?>