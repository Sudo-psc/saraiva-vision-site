-- Configuração inicial do banco de dados MySQL
-- Clínica Saraiva Vision - Dr. Philipe Saraiva Cruz (CRM-MG 69.870)

-- Criar usuário dedicado para WordPress
CREATE USER IF NOT EXISTS 'saraiva_user'@'%' IDENTIFIED BY 'saraiva_secure_2024';

-- Dar permissões completas no banco WordPress
GRANT ALL PRIVILEGES ON saraiva_vision_db.* TO 'saraiva_user'@'%';

-- Garantir que as configurações sejam aplicadas
FLUSH PRIVILEGES;

-- Configurações de performance do MySQL
SET GLOBAL max_connections = 200;
SET GLOBAL innodb_buffer_pool_size = 268435456; -- 256MB

-- Log de inicialização
INSERT INTO mysql.general_log (event_time, user_host, thread_id, server_id, command_type, argument) 
VALUES (NOW(), 'saraiva_user@%', 1, 1, 'Query', 'Clínica Saraiva Vision - Database initialized successfully');

-- Comentário de identificação
-- Sistema: WordPress Headless CMS
-- Clínica: Saraiva Vision Oftalmologia
-- Médico: Dr. Philipe Saraiva Cruz
-- CRM: CRM-MG 69.870
-- Localização: Caratinga, MG