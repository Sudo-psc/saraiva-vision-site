#!/bin/bash

# Script de configuração automática do WordPress
echo "🔧 Configurando WordPress automaticamente..."

# Aguardar o WordPress estar pronto
echo "⏳ Aguardando WordPress ficar disponível..."
until curl -f http://localhost:8083/wp-admin/install.php; do
    echo "Aguardando WordPress..."
    sleep 5
done

echo "✅ WordPress está pronto para instalação"

# Criar arquivo de configuração wp-config.php manualmente
echo "📝 Criando configuração do WordPress..."

docker exec saraiva-wordpress bash -c 'cat > /var/www/html/wp-config.php << '\''EOF'\''
<?php
/**
 * Configurações básicas do WordPress
 *
 * Este arquivo contém as seguintes configurações: configurações do MySQL, prefixo da tabela,
 * chaves secretas, e ABSPATH. Você pode encontrar mais informações em
 * {@link https://codex.wordpress.org/pt-br:Editando_wp-config.php Editando
 * wp-config.php} Codex. Você pode obter as configurações do MySQL de seu
 * servidor de hospedagem na documentação.
 *
 * @package WordPress
 */

// ** Configurações do MySQL - Você pode obter estas informações do seu servidor ** //
/** O nome do banco de dados do WordPress */
define('DB_NAME', 'wordpress');

/** Usuário do banco de dados MySQL */
define('DB_USER', 'wordpress');

/** Senha do banco de dados MySQL */
define('DB_PASSWORD', 'wordpress');

/** Nome do host do MySQL */
define('DB_HOST', 'db:3306');

/** Charset do banco de dados a ser usado na criação das tabelas. */
define('DB_CHARSET', 'utf8mb4');

/** O tipo de Collate do banco de dados. Não altere isso se em dúvidas. */
define('DB_COLLATE', '');

/**#@+
 * Chaves únicas de autenticação e salts.
 *
 * Altere cada chave para um frase única!
 * Você pode gerar estas chaves usando: {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * Você pode alterar estas a qualquer momento para invalidar todos os cookies existentes. Isso irá forçar todos os usuários a fazerem login novamente.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'put your unique phrase here');
define('SECURE_AUTH_KEY',  'put your unique phrase here');
define('LOGGED_IN_KEY',    'put your unique phrase here');
define('NONCE_KEY',        'put your unique phrase here');
define('AUTH_SALT',        'put your unique phrase here');
define('SECURE_AUTH_SALT', 'put your unique phrase here');
define('LOGGED_IN_SALT',   'put your unique phrase here');
define('NONCE_SALT',       'put your unique phrase here');

/**#@-*/

/**
 * Prefixo da tabela do banco de dados do WordPress.
 *
 * Você pode ter várias instalações em um único banco de dados se você der
 * um prefixo único para cada um. Somente números, letras e sublinhados!
 */
\$table_prefix = 'wp_';

/**
 * Para desenvolvedores: Modo de debug do WordPress.
 *
 * Altere isto para true para ativar a exibição de avisos durante o desenvolvimento.
 * É altamente recomendável que os desenvolvedores de plugins e temas usem o WP_DEBUG
 * em seus ambientes de desenvolvimento.
 *
 * Para informações sobre outras constantes que podem ser usadas para depuração,
 * visite o Codex.
 *
 * @link https://codex.wordpress.org/pt-br:Depuração_no_WordPress
 */
define('WP_DEBUG', true);

/* Isto é tudo, pode parar de editar! :) */

/** Caminho absoluto para o diretório WordPress. */
if ( !defined('ABSPATH') )
    define('ABSPATH', dirname(__FILE__) . '/');

/** Configura as variáveis e arquivos do WordPress. */
require_once(ABSPATH . 'wp-settings.php');
EOF
'

echo "✅ Arquivo wp-config.php criado"

# Aguardar um momento
sleep 3

# Executar instalação via linha de comando
echo "🚀 Instalando WordPress..."

docker exec saraiva-wordpress bash -c '
# Instalar WordPress usando wp-cli se disponível, senão usar curl
if command -v wp >/dev/null 2>&1; then
    wp core install \
        --url="http://localhost:8083" \
        --title="Saraiva Vision Development" \
        --admin_user="admin" \
        --admin_password="admin123" \
        --admin_email="admin@saraivavision.com.br" \
        --skip-email
else
    echo "WP-CLI não disponível, usando curl para instalação manual..."
    # Criar script de instalação via curl
    curl -X POST http://localhost:8083/wp-admin/install.php \
        -d "weblog_title=Saraiva Vision Development" \
        -d "user_name=admin" \
        -d "admin_password=admin123" \
        -d "admin_password2=admin123" \
        -d "admin_email=admin@saraivavision.com.br" \
        -d "Submit=Install WordPress"
fi
'

echo "⏳ Aguardando instalação completar..."
sleep 10

# Verificar se a instalação foi bem sucedida
echo "🔍 Verificando instalação..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8083/)

if [ "$response" == "200" ]; then
    echo "✅ WordPress instalado com sucesso!"
    echo "🔗 Acesso: http://localhost:8083/"
    echo "👤 Admin: http://localhost:8083/wp-admin/"
    echo "📝 Usuário: admin"
    echo "🔐 Senha: admin123"
else
    echo "❌ Falha na instalação. Status: $response"
    echo "🔍 Verificando logs do WordPress..."
    docker logs saraiva-wordpress --tail 20
fi