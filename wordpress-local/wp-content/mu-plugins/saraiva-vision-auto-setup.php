<?php

/**
 * Plugin Name: Saraiva Vision Auto Setup
 * Description: Plugin para configurar automaticamente o WordPress para o blog médico da Saraiva Vision
 * Version: 1.0
 * Author: Saraiva Vision Team
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class SaraivaVisionAutoSetup
{

    public function __construct()
    {
        add_action('init', array($this, 'setup_wordpress'));
        add_action('wp_loaded', array($this, 'create_sample_content'), 1);
        add_action('rest_api_init', array($this, 'setup_cors'));
        add_filter('rest_pre_serve_request', array($this, 'cors_preflight'), 10, 4);
    }

    public function setup_wordpress()
    {
        // Enable CORS for REST API
        $this->enable_cors();

        // Setup permalink structure
        if (get_option('permalink_structure') !== '/%postname%/') {
            update_option('permalink_structure', '/%postname%/');
            flush_rewrite_rules();
        }

        // Set site title and description
        if (get_option('blogname') === 'WordPress') {
            update_option('blogname', 'Blog Saraiva Vision - Oftalmologia');
            update_option('blogdescription', 'Artigos sobre saúde ocular, tratamentos oftalmológicos e dicas de cuidados com a visão');
            update_option('date_format', 'd/m/Y');
            update_option('time_format', 'H:i');
            update_option('timezone_string', 'America/Sao_Paulo');
        }

        // Create admin user if doesn't exist
        $admin_user = get_user_by('login', 'admin');
        if (!$admin_user) {
            $user_id = wp_create_user('admin', 'admin123', 'admin@saraivavision.com.br');
            if (!is_wp_error($user_id)) {
                $user = new WP_User($user_id);
                $user->set_role('administrator');
                wp_update_user(array(
                    'ID' => $user_id,
                    'display_name' => 'Dr. Philipe Saraiva',
                    'first_name' => 'Philipe',
                    'last_name' => 'Saraiva Cruz',
                    'description' => 'Médico oftalmologista especialista em cirurgias refrativas e catarata. CRM-MG 69.870'
                ));
            }
        }

        // Create categories
        $this->create_categories();
    }

    private function create_categories()
    {
        $categories = array(
            'saude-ocular' => array(
                'name' => 'Saúde Ocular',
                'description' => 'Artigos sobre cuidados gerais com a visão e prevenção de doenças oculares'
            ),
            'doencas-oculares' => array(
                'name' => 'Doenças Oculares',
                'description' => 'Informações sobre diferentes patologias que afetam os olhos'
            ),
            'cirurgias' => array(
                'name' => 'Cirurgias',
                'description' => 'Artigos sobre procedimentos cirúrgicos oftalmológicos'
            ),
            'lentes-de-contato' => array(
                'name' => 'Lentes de Contato',
                'description' => 'Orientações sobre uso, cuidados e tipos de lentes de contato'
            ),
            'exames' => array(
                'name' => 'Exames',
                'description' => 'Informações sobre exames oftalmológicos e sua importância'
            )
        );

        foreach ($categories as $slug => $category_data) {
            if (!term_exists($category_data['name'], 'category')) {
                wp_insert_term($category_data['name'], 'category', array(
                    'slug' => $slug,
                    'description' => $category_data['description']
                ));
            }
        }
    }

    public function create_sample_content()
    {
        // Only create content once
        if (get_option('saraiva_content_created')) {
            return;
        }

        $posts = array(
            array(
                'title' => 'Como Cuidar da Saúde dos Seus Olhos: Guia Completo',
                'content' => '<p>A saúde ocular é fundamental para nossa qualidade de vida. Nossos olhos são órgãos complexos que merecem cuidados especiais para funcionarem adequadamente ao longo da vida.</p>

<h2>Cuidados Básicos Diários</h2>
<p>Alguns hábitos simples podem fazer toda a diferença na preservação da sua visão:</p>
<ul>
<li><strong>Proteja-se do sol:</strong> Use sempre óculos de sol com proteção UV adequada</li>
<li><strong>Mantenha uma dieta balanceada:</strong> Alimentos ricos em vitamina A, C e E são essenciais</li>
<li><strong>Descanse os olhos:</strong> Faça pausas regulares durante o uso de computadores e celulares</li>
<li><strong>Mantenha a higiene:</strong> Lave sempre as mãos antes de tocar os olhos</li>
</ul>

<h2>Sinais de Alerta</h2>
<p>Procure um oftalmologista imediatamente se apresentar:</p>
<ul>
<li>Dor ocular intensa</li>
<li>Perda súbita de visão</li>
<li>Visão dupla persistente</li>
<li>Flashes de luz ou moscas volantes em excesso</li>
</ul>

<h2>Importância dos Exames Regulares</h2>
<p>Consultas oftalmológicas regulares são essenciais para detectar precocemente doenças como glaucoma, degeneração macular e outras condições que podem ser tratadas com maior sucesso quando identificadas cedo.</p>

<blockquote>
<p><em>A prevenção é sempre o melhor remédio. Um exame oftalmológico anual pode prevenir problemas graves de visão.</em></p>
</blockquote>',
                'category' => 'saude-ocular',
                'excerpt' => 'Descubra os cuidados essenciais para manter a saúde dos seus olhos e preservar sua visão ao longo da vida.',
                'meta' => array(
                    'reading_time' => '5',
                    'medical_difficulty' => 'beginner',
                    'medical_disclaimer' => 'Este conteúdo é apenas informativo e não substitui a consulta médica. Sempre consulte um oftalmologista para avaliação e orientação personalizada.',
                    'doctor_info' => array(
                        'name' => 'Dr. Philipe Saraiva Cruz',
                        'crm' => 'CRM-MG 69.870',
                        'specialty' => 'Oftalmologia',
                        'clinic' => 'Saraiva Vision - Clínica Oftalmológica',
                        'bio' => 'Especialista em cirurgias refrativas e catarata, com mais de 10 anos de experiência em oftalmologia.'
                    )
                )
            ),
            array(
                'title' => 'Catarata: Sintomas, Tratamento e Cirurgia',
                'content' => '<p>A catarata é uma das principais causas de perda de visão no mundo, mas felizmente tem tratamento eficaz. Neste artigo, vamos esclarecer tudo sobre esta condição.</p>

<h2>O que é Catarata?</h2>
<p>A catarata é a opacificação do cristalino, a lente natural do olho. Com o tempo, essa lente pode ficar turva, causando diminuição progressiva da visão.</p>

<h2>Principais Sintomas</h2>
<ul>
<li>Visão embaçada ou nublada</li>
<li>Sensibilidade aumentada à luz</li>
<li>Dificuldade para enxergar à noite</li>
<li>Visão dupla em um olho</li>
<li>Necessidade de trocar a prescrição dos óculos frequentemente</li>
</ul>

<h2>Tipos de Catarata</h2>
<p>Existem diferentes tipos de catarata:</p>
<ul>
<li><strong>Catarata senil:</strong> Relacionada ao envelhecimento</li>
<li><strong>Catarata congênita:</strong> Presente desde o nascimento</li>
<li><strong>Catarata traumática:</strong> Causada por lesões</li>
<li><strong>Catarata secundária:</strong> Decorrente de outras doenças</li>
</ul>

<h2>Tratamento Cirúrgico</h2>
<p>A cirurgia de catarata é um dos procedimentos mais realizados no mundo, com alta taxa de sucesso. O procedimento consiste na remoção do cristalino opacificado e implante de uma lente intraocular.</p>

<h3>Tecnologias Modernas</h3>
<p>Hoje contamos com técnicas avançadas como:</p>
<ul>
<li>Facoemulsificação</li>
<li>Laser de femtosegundo</li>
<li>Lentes intraoculares premium</li>
</ul>

<h2>Recuperação</h2>
<p>A recuperação é geralmente rápida, com melhora da visão já nos primeiros dias. É importante seguir todas as orientações médicas pós-operatórias.</p>',
                'category' => 'cirurgias',
                'excerpt' => 'Entenda tudo sobre catarata: sintomas, tipos, tratamento cirúrgico e as mais modernas técnicas disponíveis.',
                'meta' => array(
                    'reading_time' => '8',
                    'medical_difficulty' => 'intermediate',
                    'medical_disclaimer' => 'Este artigo é informativo. O diagnóstico e tratamento da catarata devem sempre ser realizados por médico oftalmologista qualificado.',
                    'doctor_info' => array(
                        'name' => 'Dr. Philipe Saraiva Cruz',
                        'crm' => 'CRM-MG 69.870',
                        'specialty' => 'Oftalmologia - Especialista em Catarata',
                        'clinic' => 'Saraiva Vision - Clínica Oftalmológica',
                        'bio' => 'Especialista em cirurgias de catarata com técnicas modernas, incluindo facoemulsificação e lentes premium.'
                    )
                )
            ),
            array(
                'title' => 'Lentes de Contato: Guia Completo de Uso e Cuidados',
                'content' => '<p>As lentes de contato são uma excelente opção para correção visual, oferecendo liberdade e comodidade. No entanto, seu uso correto é fundamental para evitar complicações.</p>

<h2>Tipos de Lentes de Contato</h2>

<h3>Lentes Gelatinosas (Hidrogel)</h3>
<ul>
<li>Mais confortáveis para iniciantes</li>
<li>Disponíveis em diferentes modalidades</li>
<li>Maior retenção de água</li>
</ul>

<h3>Lentes Rígidas (RGP)</h3>
<ul>
<li>Melhor qualidade visual</li>
<li>Maior durabilidade</li>
<li>Indicadas para casos específicos</li>
</ul>

<h2>Cuidados Essenciais</h2>

<h3>Higiene das Mãos</h3>
<p>Sempre lave as mãos com sabão antes de manusear as lentes. Use toalhas que não soltem fiapos para secar as mãos.</p>

<h3>Limpeza das Lentes</h3>
<p>Para lentes reutilizáveis:</p>
<ol>
<li>Retire a lente e coloque na palma da mão</li>
<li>Aplique algumas gotas de solução multiuso</li>
<li>Esfregue suavemente com o dedo</li>
<li>Enxágue com solução nova</li>
<li>Armazene no estojo com solução fresca</li>
</ol>

<h2>Tempo de Uso</h2>
<p>Respeite sempre o tempo máximo de uso recomendado:</p>
<ul>
<li><strong>Diárias:</strong> Descarte após o uso</li>
<li><strong>Quinzenais:</strong> Substitua a cada 15 dias</li>
<li><strong>Mensais:</strong> Troque mensalmente</li>
</ul>

<h2>Sinais de Alerta</h2>
<p>Remova as lentes imediatamente e procure seu oftalmologista se apresentar:</p>
<ul>
<li>Dor ou desconforto</li>
<li>Vermelhidão excessiva</li>
<li>Lacrimejamento aumentado</li>
<li>Visão embaçada</li>
<li>Sensação de cisco</li>
</ul>

<h2>Dicas para Iniciantes</h2>
<ul>
<li>Comece com poucas horas de uso</li>
<li>Aumente gradualmente o tempo</li>
<li>Tenha sempre óculos como alternativa</li>
<li>Faça acompanhamento regular</li>
</ul>',
                'category' => 'lentes-de-contato',
                'excerpt' => 'Aprenda tudo sobre lentes de contato: tipos, cuidados, tempo de uso e dicas importantes para usuários.',
                'meta' => array(
                    'reading_time' => '6',
                    'medical_difficulty' => 'beginner',
                    'medical_disclaimer' => 'O uso de lentes de contato deve ser sempre acompanhado por oftalmologista. Siga rigorosamente as orientações profissionais.',
                    'doctor_info' => array(
                        'name' => 'Dr. Philipe Saraiva Cruz',
                        'crm' => 'CRM-MG 69.870',
                        'specialty' => 'Oftalmologia - Especialista em Lentes de Contato',
                        'clinic' => 'Saraiva Vision - Clínica Oftalmológica',
                        'bio' => 'Especialista em adaptação de lentes de contato especiais e convencionais para diferentes necessidades visuais.'
                    )
                )
            )
        );

        foreach ($posts as $post_data) {
            $category = get_term_by('slug', $post_data['category'], 'category');

            $post_id = wp_insert_post(array(
                'post_title' => $post_data['title'],
                'post_content' => $post_data['content'],
                'post_excerpt' => $post_data['excerpt'],
                'post_status' => 'publish',
                'post_type' => 'post',
                'post_author' => 1
            ));

            if ($post_id && !is_wp_error($post_id)) {
                // Set category
                if ($category) {
                    wp_set_post_categories($post_id, array($category->term_id));
                }

                // Add custom meta
                foreach ($post_data['meta'] as $key => $value) {
                    update_post_meta($post_id, $key, $value);
                }
            }
        }

        update_option('saraiva_content_created', true);
    }

    public function setup_cors()
    {
        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
        add_filter('rest_pre_serve_request', array($this, 'cors_headers'));
    }

    public function cors_headers($value)
    {
        $allowed_origins = array(
            'http://localhost:5173',
            'http://localhost:3000',
            'https://saraivavision.com.br',
            'https://www.saraivavision.com.br'
        );

        $origin = get_http_origin();

        if (in_array($origin, $allowed_origins) || $this->is_development()) {
            header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
            header('Access-Control-Allow-Credentials: true');
        }

        return $value;
    }

    public function cors_preflight($served, $result, $request, $server)
    {
        if ($request->get_method() === 'OPTIONS') {
            $this->cors_headers(null);
            exit;
        }
        return $served;
    }

    private function enable_cors()
    {
        if (!headers_sent()) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce');
        }
    }

    private function is_development()
    {
        return defined('WP_DEBUG') && WP_DEBUG;
    }
}

// Initialize the plugin
new SaraivaVisionAutoSetup();
