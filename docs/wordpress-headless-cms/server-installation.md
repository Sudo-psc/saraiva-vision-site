# Instalação e Configuração do Servidor WordPress

Guia completo para instalação do WordPress Headless CMS no servidor dedicado `cms.saraivavision.com.br`.

## 📋 Requisitos do Sistema

### Servidor Dedicado
- **OS**: Ubuntu 22.04 LTS ou Debian 12
- **RAM**: Mínimo 4GB, recomendado 8GB
- **Storage**: 50GB SSD mínimo
- **CPU**: 2 cores mínimo, 4 cores recomendado
- **Largura de banda**: 100 Mbps

### Stack de Software
- **PHP**: 8.2 ou superior
- **Banco de Dados**: MariaDB 10.6+ ou MySQL 8.0+
- **Web Server**: Nginx 1.20+ (recomendado) ou Apache 2.4+
- **SSL**: Let's Encrypt via Certbot
- **Cache**: Redis 7.0+ (opcional mas recomendado)

---

## 1. Preparação do Servidor

### 1.1 Atualizações Iniciais

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar pacotes essenciais
sudo apt install -y curl wget git unzip software-properties-common
sudo apt install -y ufw fail2ban logrotate
```

### 1.2 Configurar Firewall

```bash
# Configurar UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Verificar status
sudo ufw status verbose
```

### 1.3 Configurar Fail2Ban

```bash
# Criar configuração personalizada
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Editar configuração
sudo nano /etc/fail2ban/jail.local
```

```ini
# /etc/fail2ban/jail.local
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[wordpress]
enabled = true
filter = wordpress
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 3
```

---

## 2. Instalação do Stack LEMP

### 2.1 Nginx

```bash
# Instalar Nginx
sudo apt install nginx -y

# Iniciar e habilitar
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
```

### 2.2 MariaDB

```bash
# Instalar MariaDB
sudo apt install mariadb-server mariadb-client -y

# Iniciar e habilitar
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Executar script de segurança
sudo mysql_secure_installation
```

**Configurações recomendadas no mysql_secure_installation:**
- Set root password: **Yes** (senha forte)
- Remove anonymous users: **Yes**
- Disallow root login remotely: **Yes**
- Remove test database: **Yes**
- Reload privilege tables: **Yes**

### 2.3 PHP 8.2

```bash
# Adicionar repositório PHP
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Instalar PHP e extensões necessárias
sudo apt install php8.2-fpm php8.2-mysql php8.2-curl php8.2-gd \
php8.2-xml php8.2-mbstring php8.2-zip php8.2-intl php8.2-imagick \
php8.2-redis php8.2-opcache php8.2-cli php8.2-common -y

# Verificar instalação
php --version
```

### 2.4 Redis (Opcional - Cache)

```bash
# Instalar Redis
sudo apt install redis-server -y

# Configurar para iniciar automaticamente
sudo systemctl enable redis-server

# Verificar instalação
redis-cli ping
# Resposta esperada: PONG
```

---

## 3. Configuração do Banco de Dados

### 3.1 Criar Banco para WordPress

```bash
# Conectar ao MariaDB
sudo mysql -u root -p
```

```sql
-- Criar banco de dados
CREATE DATABASE saraiva_cms_wp DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário dedicado
CREATE USER 'saraiva_wp'@'localhost' IDENTIFIED BY 'SENHA_SUPER_FORTE_AQUI';

-- Conceder privilégios
GRANT ALL PRIVILEGES ON saraiva_cms_wp.* TO 'saraiva_wp'@'localhost';

-- Aplicar mudanças
FLUSH PRIVILEGES;

-- Verificar usuário
SELECT user, host FROM mysql.user WHERE user = 'saraiva_wp';

-- Sair
EXIT;
```

### 3.2 Otimizações do MariaDB

```bash
# Editar configuração
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
```

```ini
# /etc/mysql/mariadb.conf.d/50-server.cnf
[mysqld]
# InnoDB Settings
innodb_buffer_pool_size = 1G
innodb_buffer_pool_instances = 1
innodb_file_per_table = 1
innodb_flush_log_at_trx_commit = 1
innodb_flush_method = O_DIRECT

# Query Cache (para MySQL 5.7 e anteriores)
# query_cache_type = 1
# query_cache_size = 64M

# Connection Settings
max_connections = 100
max_allowed_packet = 64M

# Logging
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Character Set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```

```bash
# Reiniciar MariaDB
sudo systemctl restart mariadb
```

---

## 4. Configuração do Nginx

### 4.1 Remover Configuração Padrão

```bash
# Remover site padrão
sudo rm /etc/nginx/sites-enabled/default
```

### 4.2 Criar Configuração do Site

```bash
# Criar configuração do site
sudo nano /etc/nginx/sites-available/cms.saraivavision.com.br
```

```nginx
# /etc/nginx/sites-available/cms.saraivavision.com.br
server {
    listen 80;
    server_name cms.saraivavision.com.br;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cms.saraivavision.com.br;

    root /var/www/cms.saraivavision.com.br;
    index index.php index.html;

    # SSL Configuration (será configurado pelo Certbot)
    ssl_certificate /etc/letsencrypt/live/cms.saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cms.saraivavision.com.br/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'; frame-ancestors 'self';" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # CORS Headers para API
    add_header Access-Control-Allow-Origin "https://saraivavision.com.br" always;
    add_header Access-Control-Allow-Origin "https://www.saraivavision.com.br" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Accept, Authorization, Cache-Control, Content-Type, DNT, If-Modified-Since, Keep-Alive, Origin, User-Agent, X-Requested-With" always;

    # Handle preflight OPTIONS requests
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "https://saraivavision.com.br";
        add_header Access-Control-Allow-Origin "https://www.saraivavision.com.br";
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Accept, Authorization, Cache-Control, Content-Type, DNT, If-Modified-Since, Keep-Alive, Origin, User-Agent, X-Requested-With";
        add_header Access-Control-Max-Age 1728000;
        add_header Content-Type 'text/plain; charset=utf-8';
        add_header Content-Length 0;
        return 204;
    }

    # Logs
    access_log /var/log/nginx/cms.saraivavision.com.br.access.log;
    error_log /var/log/nginx/cms.saraivavision.com.br.error.log;

    # WordPress Rules
    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    # REST API - Otimizações especiais
    location ~ ^/wp-json/ {
        # Cache para recursos estáticos da API
        location ~ ^/wp-json/.+\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        try_files $uri $uri/ /index.php?$args;
    }

    # PHP Processing
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;

        # Increase timeouts for API calls
        fastcgi_connect_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_read_timeout 300;
    }

    # WordPress Security
    location = /xmlrpc.php {
        deny all;
        access_log off;
        log_not_found off;
    }

    location = /wp-config.php {
        deny all;
    }

    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Static Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
    }

    # Limit wp-admin access (opcional - configurar IPs permitidos)
    location /wp-admin/ {
        # allow 192.168.1.100; # Seu IP de administração
        # deny all;

        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        }
    }

    # Block access to uploads PHP files
    location ~* /(?:uploads|files)/.*\.php$ {
        deny all;
    }

    # WordPress SEO by Yoast rules
    location ~ ([^/]*)sitemap(.*).x(m|s)l$ {
        rewrite ^/sitemap.xml$ /index.php?sitemap=1 last;
        rewrite ^/([^/]+?)-sitemap([0-9]+)?.xml$ /index.php?sitemap=$1&sitemap_n=$2 last;
    }

    # Block access to any files with a .php extension in the uploads directory
    location ~* /(?:uploads|files)/.*\.php$ {
        deny all;
    }
}
```

### 4.3 Ativar Site

```bash
# Criar symlink para ativar site
sudo ln -s /etc/nginx/sites-available/cms.saraivavision.com.br /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Se ok, recarregar
sudo systemctl reload nginx
```

---

## 5. Configuração do PHP-FPM

### 5.1 Otimizar Pool do PHP-FPM

```bash
# Editar pool www
sudo nano /etc/php/8.2/fpm/pool.d/www.conf
```

```ini
# /etc/php/8.2/fpm/pool.d/www.conf
[www]
user = www-data
group = www-data

listen = /run/php/php8.2-fpm.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660

# Pool size otimizado para 4GB RAM
pm = dynamic
pm.max_children = 20
pm.start_servers = 5
pm.min_spare_servers = 2
pm.max_spare_servers = 8
pm.max_requests = 1000

# Limites
request_terminate_timeout = 300
request_slowlog_timeout = 10s
slowlog = /var/log/php8.2-fpm-slow.log

# Environment
env[HOSTNAME] = $HOSTNAME
env[PATH] = /usr/local/bin:/usr/bin:/bin
env[TMP] = /tmp
env[TMPDIR] = /tmp
env[TEMP] = /tmp
```

### 5.2 Configurações PHP para WordPress

```bash
# Editar php.ini
sudo nano /etc/php/8.2/fpm/php.ini
```

```ini
# /etc/php/8.2/fpm/php.ini - Otimizações importantes

# Memory
memory_limit = 512M

# Execution
max_execution_time = 300
max_input_time = 300

# File uploads
upload_max_filesize = 64M
post_max_size = 64M
max_file_uploads = 20

# Sessions
session.gc_maxlifetime = 86400

# OPcache (Performance crítica)
opcache.enable = 1
opcache.enable_cli = 1
opcache.memory_consumption = 256
opcache.interned_strings_buffer = 64
opcache.max_accelerated_files = 10000
opcache.revalidate_freq = 2
opcache.save_comments = 1
opcache.validate_timestamps = 1

# Timezone
date.timezone = "America/Sao_Paulo"

# Error reporting (production)
display_errors = Off
log_errors = On
error_log = /var/log/php8.2-fpm-errors.log

# Security
expose_php = Off
allow_url_fopen = Off
allow_url_include = Off
```

```bash
# Reiniciar PHP-FPM
sudo systemctl restart php8.2-fpm
```

---

## 6. Instalação do WordPress

### 6.1 Baixar WordPress

```bash
# Criar diretório do site
sudo mkdir -p /var/www/cms.saraivavision.com.br

# Baixar WordPress
cd /tmp
wget https://br.wordpress.org/latest-pt_BR.tar.gz

# Extrair
tar xzf latest-pt_BR.tar.gz

# Mover arquivos
sudo cp -R wordpress/* /var/www/cms.saraivavision.com.br/

# Ajustar permissões
sudo chown -R www-data:www-data /var/www/cms.saraivavision.com.br
sudo find /var/www/cms.saraivavision.com.br/ -type d -exec chmod 755 {} \;
sudo find /var/www/cms.saraivavision.com.br/ -type f -exec chmod 644 {} \;
```

### 6.2 Configurar wp-config.php

```bash
# Copiar arquivo de configuração
sudo cp /var/www/cms.saraivavision.com.br/wp-config-sample.php /var/www/cms.saraivavision.com.br/wp-config.php

# Editar configuração
sudo nano /var/www/cms.saraivavision.com.br/wp-config.php
```

```php
<?php
// /var/www/cms.saraivavision.com.br/wp-config.php

// ** Database settings ** //
define( 'DB_NAME', 'saraiva_cms_wp' );
define( 'DB_USER', 'saraiva_wp' );
define( 'DB_PASSWORD', 'SENHA_SUPER_FORTE_AQUI' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8mb4' );
define( 'DB_COLLATE', '' );

// ** Authentication Unique Keys and Salts ** //
// Gerar em: https://api.wordpress.org/secret-key/1.1/salt/
define( 'AUTH_KEY',         'CHAVE_UNICA_GERADA' );
define( 'SECURE_AUTH_KEY',  'CHAVE_UNICA_GERADA' );
define( 'LOGGED_IN_KEY',    'CHAVE_UNICA_GERADA' );
define( 'NONCE_KEY',        'CHAVE_UNICA_GERADA' );
define( 'AUTH_SALT',        'CHAVE_UNICA_GERADA' );
define( 'SECURE_AUTH_SALT', 'CHAVE_UNICA_GERADA' );
define( 'LOGGED_IN_SALT',   'CHAVE_UNICA_GERADA' );
define( 'NONCE_SALT',       'CHAVE_UNICA_GERADA' );

// ** WordPress Database Table prefix ** //
$table_prefix = 'wp_saraiva_';

// ** WordPress Debugging ** //
define( 'WP_DEBUG', false );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );

// ** Security Settings ** //
define( 'DISALLOW_FILE_EDIT', true );
define( 'DISALLOW_FILE_MODS', false ); // Permite plugins/themes
define( 'FORCE_SSL_ADMIN', true );
define( 'WP_HOME', 'https://cms.saraivavision.com.br' );
define( 'WP_SITEURL', 'https://cms.saraivavision.com.br' );

// ** WordPress Memory Limit ** //
define( 'WP_MEMORY_LIMIT', '512M' );

// ** Multisite (disabled for headless) ** //
define( 'WP_ALLOW_MULTISITE', false );

// ** Redis Cache (se instalado) ** //
define( 'WP_REDIS_HOST', '127.0.0.1' );
define( 'WP_REDIS_PORT', 6379 );
define( 'WP_REDIS_DATABASE', 0 );

// ** REST API Settings ** //
// Desabilitar XML-RPC
define( 'WP_ALLOW_XML_RPC', false );

// ** Auto Updates ** //
define( 'WP_AUTO_UPDATE_CORE', 'minor' ); // Apenas updates menores
define( 'AUTOMATIC_UPDATER_DISABLED', false );

// ** File System ** //
define( 'FS_METHOD', 'direct' );

// ** Custom Settings ** //
// Desabilitar pingbacks/trackbacks
define( 'WP_ALLOW_PINGBACKS', false );

// Limitar revisões de posts
define( 'WP_POST_REVISIONS', 10 );

// Limpeza automática de lixeira
define( 'EMPTY_TRASH_DAYS', 30 );

// ** That's all, stop editing! Happy publishing. ** //
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

require_once ABSPATH . 'wp-settings.php';
?>
```

### 6.3 Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d cms.saraivavision.com.br

# Configurar renovação automática
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Testar renovação
sudo certbot renew --dry-run
```

---

## 7. Plugins Necessários

### 7.1 Lista de Plugins Obrigatórios

```bash
# Acessar diretório de plugins
cd /var/www/cms.saraivavision.com.br/wp-content/plugins
```

**Plugins para instalar via WP Admin:**

1. **JWT Authentication for WP REST API**
   - Plugin: `jwt-authentication-for-wp-rest-api`
   - Função: Autenticação JWT para API

2. **Advanced Custom Fields (ACF)**
   - Plugin: `advanced-custom-fields`
   - Função: Campos personalizados

3. **Yoast SEO**
   - Plugin: `wordpress-seo`
   - Função: SEO e meta tags

4. **WP REST API - Menus**
   - Plugin: `wp-rest-api-menu`
   - Função: Expor menus via API

5. **Redis Object Cache**
   - Plugin: `redis-cache`
   - Função: Cache com Redis

6. **Webhook Plugin** (custom ou third-party)
   - Plugin: `wp-webhooks`
   - Função: Disparar webhooks

### 7.2 Configuração dos Plugins

#### JWT Authentication
```php
// Adicionar ao wp-config.php
define('JWT_AUTH_SECRET_KEY', 'CHAVE_JWT_SUPER_SECRETA');
define('JWT_AUTH_CORS_ENABLE', true);
```

#### Advanced Custom Fields
- Configurar via admin para campos customizados
- Expor campos via REST API

#### Redis Cache
```bash
# Verificar se Redis está funcionando
redis-cli ping

# No WordPress Admin, ativar Redis Object Cache
```

---

## 8. Hardening de Segurança

### 8.1 Configurações de Segurança do WordPress

```php
// wp-config.php - Adicionar configurações de segurança

// Desabilitar editor de arquivos
define('DISALLOW_FILE_EDIT', true);

// Desabilitar instalação de plugins via admin (opcional)
// define('DISALLOW_FILE_MODS', true);

// SSL obrigatório no admin
define('FORCE_SSL_ADMIN', true);

// Limitar login attempts (via plugin ou código customizado)
define('WP_LOGIN_ATTEMPTS', 3);

// Desabilitar XML-RPC
define('WP_ALLOW_XML_RPC', false);

// Ocultar versão do WordPress
remove_action('wp_head', 'wp_generator');
```

### 8.2 .htaccess Adicional (se usar Apache)

```apache
# .htaccess - Configurações de segurança
RewriteEngine On

# Bloquear acesso a arquivos sensíveis
<Files wp-config.php>
    Order allow,deny
    Deny from all
</Files>

<Files .htaccess>
    Order allow,deny
    Deny from all
</Files>

# Bloquear XML-RPC
<Files xmlrpc.php>
    Order allow,deny
    Deny from all
</Files>

# Headers de segurança
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options SAMEORIGIN
Header always set X-XSS-Protection "1; mode=block"

# CORS para API
Header set Access-Control-Allow-Origin "https://saraivavision.com.br"
Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header set Access-Control-Allow-Headers "Authorization, Content-Type"
```

### 8.3 Backup Automatizado

```bash
# Criar script de backup
sudo nano /usr/local/bin/backup-cms.sh
```

```bash
#!/bin/bash
# /usr/local/bin/backup-cms.sh

# Configurações
BACKUP_DIR="/var/backups/cms"
SITE_DIR="/var/www/cms.saraivavision.com.br"
DB_NAME="saraiva_cms_wp"
DB_USER="saraiva_wp"
DB_PASS="SENHA_DO_BANCO"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco de dados
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/database_$DATE.sql

# Backup dos arquivos
tar -czf $BACKUP_DIR/files_$DATE.tar.gz -C $SITE_DIR .

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup concluído: $DATE"
```

```bash
# Tornar executável
sudo chmod +x /usr/local/bin/backup-cms.sh

# Configurar cron para backup diário
sudo crontab -e
```

```cron
# Backup diário às 3:00 AM
0 3 * * * /usr/local/bin/backup-cms.sh >> /var/log/cms-backup.log 2>&1
```

---

## 9. Finalizando Instalação

### 9.1 Instalação via Web

1. Acesse `https://cms.saraivavision.com.br`
2. Configure idioma: **Português do Brasil**
3. Título do site: **Saraiva Vision CMS**
4. Usuário admin: **admin_saraiva** (usuário forte)
5. Senha: **Senha super forte com símbolos**
6. Email: **admin@saraivavision.com.br**

### 9.2 Configurações Iniciais

#### Configurações Gerais
- **Título do site**: Saraiva Vision - Blog
- **Subtítulo**: Conteúdo sobre saúde ocular
- **URL do WordPress**: https://cms.saraivavision.com.br
- **URL do site**: https://cms.saraivavision.com.br
- **Fuso horário**: São Paulo

#### Configurações de Permalinks
- Estrutura personalizada: `/%postname%/`
- Isso garante URLs amigáveis para SEO

#### Configurações de API REST
- Certificar que a API REST está ativa
- Testar: `curl https://cms.saraivavision.com.br/wp-json/wp/v2/posts`

### 9.3 Configurar Usuário API

```sql
-- Criar usuário específico para API
INSERT INTO wp_saraiva_users (user_login, user_pass, user_nicename, user_email, user_registered, user_status, display_name)
VALUES ('api_saraiva', MD5('senha_api_forte'), 'api_saraiva', 'api@saraivavision.com.br', NOW(), 0, 'API Saraiva Vision');

-- Definir role de editor para o usuário API
INSERT INTO wp_saraiva_usermeta (user_id, meta_key, meta_value)
VALUES (LAST_INSERT_ID(), 'wp_saraiva_capabilities', 'a:1:{s:6:"editor";b:1;}');

INSERT INTO wp_saraiva_usermeta (user_id, meta_key, meta_value)
VALUES (LAST_INSERT_ID(), 'wp_saraiva_user_level', '7');
```

---

## 10. Testes de Verificação

### 10.1 Testes de Conectividade

```bash
# Teste básico de conectividade
curl -I https://cms.saraivavision.com.br

# Teste da API REST
curl https://cms.saraivavision.com.br/wp-json/wp/v2/posts

# Teste de autenticação JWT
curl -X POST https://cms.saraivavision.com.br/wp-json/jwt-auth/v1/token \
     -H "Content-Type: application/json" \
     -d '{"username":"api_saraiva","password":"senha_api_forte"}'
```

### 10.2 Testes de Performance

```bash
# Instalar Apache Bench
sudo apt install apache2-utils

# Teste de carga básico
ab -n 100 -c 10 https://cms.saraivavision.com.br/wp-json/wp/v2/posts

# Teste com autenticação
ab -n 50 -c 5 -H "Authorization: Bearer JWT_TOKEN_AQUI" \
   https://cms.saraivavision.com.br/wp-json/wp/v2/posts
```

### 10.3 Verificação de Logs

```bash
# Verificar logs do Nginx
sudo tail -f /var/log/nginx/cms.saraivavision.com.br.access.log
sudo tail -f /var/log/nginx/cms.saraivavision.com.br.error.log

# Verificar logs do PHP
sudo tail -f /var/log/php8.2-fpm-errors.log

# Verificar logs do WordPress
sudo tail -f /var/www/cms.saraivavision.com.br/wp-content/debug.log
```

---

## 11. Documentação dos Endpoints

### 11.1 Endpoints Principais da API

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/wp-json/wp/v2/posts` | GET | Lista de posts |
| `/wp-json/wp/v2/posts/{id}` | GET | Post específico |
| `/wp-json/wp/v2/categories` | GET | Categorias |
| `/wp-json/wp/v2/tags` | GET | Tags |
| `/wp-json/wp/v2/media` | GET | Arquivos de mídia |
| `/wp-json/wp/v2/users` | GET | Usuários (limitado) |
| `/wp-json/jwt-auth/v1/token` | POST | Obter token JWT |

### 11.2 Parâmetros Importantes

```javascript
// Exemplo de requisição completa
const params = {
  per_page: 100,        // Número de posts por página
  page: 1,              // Página atual
  status: 'publish',    // Status do post
  _embed: true,         // Incluir dados relacionados
  _fields: 'id,slug,title,content,excerpt,date,modified,featured_media,categories,tags,acf,_embedded',
  after: '2023-01-01T00:00:00Z',  // Posts após esta data
  categories: '1,2,3',  // IDs das categorias
  tags: '4,5,6',        // IDs das tags
  search: 'termo'       // Busca por termo
};
```

### 11.3 Exemplos de Resposta

```json
{
  "id": 123,
  "slug": "saude-ocular-diabeticos",
  "title": {
    "rendered": "Saúde Ocular em Diabéticos"
  },
  "content": {
    "rendered": "<p>Conteúdo do artigo...</p>"
  },
  "excerpt": {
    "rendered": "<p>Resumo do artigo...</p>"
  },
  "date": "2023-10-15T10:00:00",
  "modified": "2023-10-15T15:30:00",
  "status": "publish",
  "featured_media": 456,
  "_embedded": {
    "wp:featuredmedia": [{
      "id": 456,
      "source_url": "https://cms.saraivavision.com.br/wp-content/uploads/2023/10/diabetes-olhos.jpg",
      "alt_text": "Exame oftalmológico em paciente diabético"
    }],
    "wp:term": [
      [
        {
          "id": 1,
          "name": "Diabetes",
          "slug": "diabetes"
        }
      ],
      [
        {
          "id": 10,
          "name": "Prevenção",
          "slug": "prevencao"
        }
      ]
    ]
  },
  "acf": {
    "medical_disclaimer": true,
    "crm_responsible": "CRM/MG 12345",
    "reading_time": 5
  }
}
```

---

## ✅ Checklist de Instalação Completa

- [ ] Servidor configurado com stack LEMP
- [ ] Banco de dados MariaDB criado e otimizado
- [ ] Nginx configurado com SSL e CORS
- [ ] PHP 8.2 otimizado com OPcache
- [ ] WordPress instalado e configurado
- [ ] Plugins essenciais instalados e ativos
- [ ] Segurança hardened (Fail2Ban, Firewall, etc.)
- [ ] Backup automatizado configurado
- [ ] SSL Let's Encrypt configurado e renovação automática
- [ ] API REST testada e funcionando
- [ ] JWT Authentication configurado
- [ ] CORS configurado para frontend
- [ ] Logs configurados e monitoramento ativo
- [ ] Performance testada e otimizada
- [ ] Documentação da API disponível

**Instalação concluída com sucesso! 🎉**

O WordPress Headless CMS está pronto para servir conteúdo para o frontend React da Saraiva Vision através da API REST.