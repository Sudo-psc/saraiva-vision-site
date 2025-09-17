<?php
/**
 * WordPress API Mock Simples para Clínica Saraiva Vision
 * Dr. Philipe Saraiva Cruz - CRM-MG 69.870
 * 
 * Simula API REST do WordPress sem banco de dados
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: http://localhost:3002');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Informações da clínica
define('CLINIC_NAME', 'Clínica Saraiva Vision');
define('DOCTOR_NAME', 'Dr. Philipe Saraiva Cruz');
define('DOCTOR_CRM', 'CRM-MG 69.870');
define('CLINIC_LOCATION', 'Caratinga, Minas Gerais');

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Routing simples
if (strpos($path, '/wp-json/wp/v2/posts') !== false) {
    handlePosts();
} elseif (strpos($path, '/wp-json/wp/v2/categories') !== false) {
    handleCategories();
} elseif (strpos($path, '/wp-json/wp/v2/tags') !== false) {
    handleTags();
} elseif (strpos($path, '/wp-json/wp/v2') !== false) {
    handleApiIndex();
} elseif (strpos($path, '/wp-json') !== false) {
    handleRootApi();
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not Found']);
}

function handlePosts() {
    $posts = [
        [
            'id' => 1,
            'date' => '2024-03-15T10:00:00',
            'date_gmt' => '2024-03-15T13:00:00',
            'guid' => ['rendered' => 'http://localhost:8083/?p=1'],
            'modified' => '2024-03-15T10:00:00',
            'modified_gmt' => '2024-03-15T13:00:00',
            'slug' => 'importancia-exame-fundo-de-olho',
            'status' => 'publish',
            'type' => 'post',
            'link' => 'http://localhost:8083/importancia-exame-fundo-de-olho/',
            'title' => [
                'rendered' => 'A Importância do Exame de Fundo de Olho na Prevenção de Doenças Oculares'
            ],
            'content' => [
                'rendered' => '<p>O exame de fundo de olho é um dos procedimentos mais importantes na avaliação oftalmológica da Clínica Saraiva Vision. Dr. Philipe Saraiva Cruz (CRM-MG 69.870) explica a importância deste exame para detectar precocemente diversas condições que podem afetar a visão.</p><h3>Por que o exame é importante?</h3><p>Através do fundo de olho, é possível detectar:</p><ul><li>Retinopatia diabética</li><li>Glaucoma</li><li>Degeneração macular</li><li>Descolamento de retina</li></ul>',
                'protected' => false
            ],
            'excerpt' => [
                'rendered' => 'O exame de fundo de olho é essencial para detectar precocemente doenças como glaucoma, retinopatia diabética e degeneração macular.',
                'protected' => false
            ],
            'author' => 1,
            'featured_media' => 1,
            'comment_status' => 'open',
            'ping_status' => 'open',
            'sticky' => false,
            'template' => '',
            'format' => 'standard',
            'meta' => [],
            'categories' => [1, 3],
            'tags' => [1, 2, 3],
            '_embedded' => [
                'author' => [[
                    'id' => 1,
                    'name' => DOCTOR_NAME,
                    'slug' => 'dr-philipe-saraiva',
                    'description' => 'Oftalmologista especializado em cirurgia refrativa e doenças da retina. ' . DOCTOR_CRM,
                    'avatar_urls' => [
                        '24' => '/img/drphilipe_perfil.png',
                        '48' => '/img/drphilipe_perfil.png',
                        '96' => '/img/drphilipe_perfil.png'
                    ]
                ]]
            ]
        ],
        [
            'id' => 2,
            'date' => '2024-03-10T14:00:00',
            'date_gmt' => '2024-03-10T17:00:00',
            'guid' => ['rendered' => 'http://localhost:8083/?p=2'],
            'modified' => '2024-03-10T14:00:00',
            'modified_gmt' => '2024-03-10T17:00:00',
            'slug' => 'refracao-medida-precisa-grau',
            'status' => 'publish',
            'type' => 'post',
            'link' => 'http://localhost:8083/refracao-medida-precisa-grau/',
            'title' => [
                'rendered' => 'Refração: A Medida Precisa do Grau dos Óculos'
            ],
            'content' => [
                'rendered' => '<p>A refração é um exame fundamental realizado na ' . CLINIC_NAME . ' para determinar o grau exato necessário para óculos ou lentes de contato. ' . DOCTOR_NAME . ' (' . DOCTOR_CRM . ') utiliza equipamentos de última geração para garantir a precisão do exame.</p><h3>Como é realizado?</h3><p>O exame de refração envolve:</p><ul><li>Teste de acuidade visual</li><li>Autorrefrator computadorizado</li><li>Refração subjetiva</li><li>Teste de visão binocular</li></ul>',
                'protected' => false
            ],
            'excerpt' => [
                'rendered' => 'A refração é fundamental para determinar o grau exato dos óculos, garantindo visão nítida e confortável.',
                'protected' => false
            ],
            'author' => 1,
            'featured_media' => 2,
            'comment_status' => 'open',
            'ping_status' => 'open',
            'sticky' => false,
            'template' => '',
            'format' => 'standard',
            'meta' => [],
            'categories' => [2],
            'tags' => [4, 5],
            '_embedded' => [
                'author' => [[
                    'id' => 1,
                    'name' => DOCTOR_NAME,
                    'slug' => 'dr-philipe-saraiva',
                    'description' => 'Oftalmologista especializado em cirurgia refrativa e doenças da retina. ' . DOCTOR_CRM,
                    'avatar_urls' => [
                        '24' => '/img/drphilipe_perfil.png',
                        '48' => '/img/drphilipe_perfil.png',
                        '96' => '/img/drphilipe_perfil.png'
                    ]
                ]]
            ]
        ]
    ];
    
    // Paginação simples
    $per_page = isset($_GET['per_page']) ? min((int)$_GET['per_page'], 10) : 10;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $offset = ($page - 1) * $per_page;
    
    $result = array_slice($posts, $offset, $per_page);
    
    // Headers de paginação
    header('X-WP-Total: ' . count($posts));
    header('X-WP-TotalPages: ' . ceil(count($posts) / $per_page));
    
    echo json_encode($result);
}

function handleCategories() {
    $categories = [
        [
            'id' => 1,
            'count' => 5,
            'description' => 'Exames especializados em oftalmologia',
            'link' => 'http://localhost:8083/category/exames/',
            'name' => 'Exames Especializados',
            'slug' => 'exames',
            'taxonomy' => 'category',
            'parent' => 0
        ],
        [
            'id' => 2,
            'count' => 3,
            'description' => 'Consultas oftalmológicas completas',
            'link' => 'http://localhost:8083/category/consultas/',
            'name' => 'Consultas Oftalmológicas',
            'slug' => 'consultas',
            'taxonomy' => 'category',
            'parent' => 0
        ],
        [
            'id' => 3,
            'count' => 8,
            'description' => 'Prevenção e cuidados com a saúde ocular',
            'link' => 'http://localhost:8083/category/prevencao/',
            'name' => 'Prevenção e Cuidados',
            'slug' => 'prevencao',
            'taxonomy' => 'category',
            'parent' => 0
        ]
    ];
    
    echo json_encode($categories);
}

function handleTags() {
    $tags = [
        ['id' => 1, 'name' => 'Fundo de Olho', 'slug' => 'fundo-de-olho', 'count' => 3],
        ['id' => 2, 'name' => 'Exames', 'slug' => 'exames', 'count' => 5],
        ['id' => 3, 'name' => 'Prevenção', 'slug' => 'prevencao', 'count' => 4],
        ['id' => 4, 'name' => 'Refração', 'slug' => 'refracao', 'count' => 2],
        ['id' => 5, 'name' => 'Óculos', 'slug' => 'oculos', 'count' => 2]
    ];
    
    echo json_encode($tags);
}

function handleApiIndex() {
    $api_info = [
        'name' => CLINIC_NAME,
        'description' => 'WordPress API para ' . CLINIC_NAME . ' - ' . CLINIC_LOCATION,
        'url' => 'http://localhost:8083',
        'home' => 'http://localhost:8083',
        'namespaces' => [
            'oembed/1.0',
            'wp/v2',
            'clinica-saraiva-vision/v1'
        ],
        'authentication' => [],
        'routes' => [
            '/wp/v2/posts' => [
                'namespace' => 'wp/v2',
                'methods' => ['GET'],
                'endpoints' => [
                    [
                        'methods' => ['GET'],
                        'args' => [
                            'context' => ['default' => 'view'],
                            'page' => ['default' => 1],
                            'per_page' => ['default' => 10]
                        ]
                    ]
                ]
            ]
        ],
        'clinic_info' => [
            'name' => CLINIC_NAME,
            'doctor' => DOCTOR_NAME,
            'crm' => DOCTOR_CRM,
            'location' => CLINIC_LOCATION,
            'api_version' => '1.0',
            'status' => 'operational'
        ]
    ];
    
    echo json_encode($api_info);
}

function handleRootApi() {
    $root_info = [
        'name' => CLINIC_NAME . ' API',
        'description' => 'WordPress REST API para ' . CLINIC_NAME,
        'clinic' => [
            'name' => CLINIC_NAME,
            'doctor' => DOCTOR_NAME,
            'crm' => DOCTOR_CRM,
            'location' => CLINIC_LOCATION
        ],
        'available_apis' => [
            'wp/v2' => 'http://localhost:8083/wp-json/wp/v2',
            'clinica-saraiva-vision/v1' => 'http://localhost:8083/wp-json/clinica-saraiva-vision/v1'
        ]
    ];
    
    echo json_encode($root_info);
}
?>