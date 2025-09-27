# Native VPS Deployment Guide - Saraiva Vision

## 🏗️ Arquitetura Native VPS

O Saraiva Vision utiliza uma arquitetura **nativa VPS sem Docker** para máxima performance e controle do sistema. Todos os serviços rodam diretamente no sistema operacional Ubuntu/Debian.

## 📋 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    VPS Ubuntu/Debian                        │
│                     31.97.129.78                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Nginx    │  │   Node.js   │  │   MySQL     │        │
│  │   (native)  │  │  (systemd)  │  │  (native)   │        │
│  │             │  │             │  │             │        │
│  │ Port 80/443 │  │  Port 3001  │  │  Port 3306  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Redis    │  │  PHP-FPM    │  │ Static Files│        │
│  │   (native)  │  │    8.1+     │  │/var/www/html│        │
│  │             │  │  (native)   │  │             │        │
│  │ Port 6379   │  │  Port 9000  │  │  React SPA  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────────────┐
                    │    Supabase     │
                    │   PostgreSQL    │
                    │   (External)    │
                    └─────────────────┘
```

## 🔧 Componentes Nativos

### 1. Nginx (Servidor Web e Proxy)
- **Função**: Servidor web principal e reverse proxy
- **Configuração**: `/etc/nginx/sites-available/saraiva-vision`
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Responsabilidades**:
  - Servir arquivos estáticos React (SPA)
  - Proxy reverso para API Node.js
  - Proxy reverso para WordPress
  - SSL/TLS termination
  - Headers de segurança
  - Cache de arquivos estáticos

### 2. Node.js API (Serviço Systemd)
- **Função**: Backend API REST
- **Service**: `saraiva-api.service`
- **Port**: 3001 (interno)
- **Diretório**: `/opt/saraiva-api/`
- **Usuário**: `saraiva-api` (sistema)
- **Responsabilidades**:
  - Endpoints da API REST
  - Integração com Supabase
  - Processamento de formulários
  - Integrações externas (Instagram, WhatsApp)

### 3. MySQL (Database Nativo)
- **Função**: Database para WordPress e dados locais
- **Port**: 3306
- **Responsabilidades**:
  - Dados do WordPress CMS
  - Cache de dados locais
  - Sessões de usuário

### 4. Redis (Cache Nativo)
- **Função**: Cache e sessões
- **Port**: 6379
- **Responsabilidades**:
  - Cache de API responses
  - Sessões de usuário
  - Cache de páginas WordPress

### 5. PHP-FPM 8.1+ (Processador PHP)
- **Função**: Processamento WordPress
- **Port**: 9000 (FastCGI)
- **Responsabilidades**:
  - WordPress headless CMS
  - Blog e conteúdo dinâmico

### 6. Supabase (External Service)
- **Função**: Database principal PostgreSQL
- **Responsabilidades**:
  - Dados principais da aplicação
  - Autenticação de usuários
  - API real-time

## 🚀 Processo de Deployment

### 1. Setup Inicial do VPS

**Pré-requisitos:**
- Ubuntu/Debian VPS com acesso root
- Domínio apontando para o IP do servidor
- Conectividade SSH

**Comando:**
```bash
# No servidor VPS
wget https://raw.githubusercontent.com/Sudo-psc/saraiva-vision-site/main/setup-vps-native.sh
chmod +x setup-vps-native.sh
sudo ./setup-vps-native.sh
```

**O que o script faz:**
- ✅ Atualiza sistema Ubuntu/Debian
- ✅ Instala Node.js 18+ via NodeSource
- ✅ Instala e configura Nginx
- ✅ Instala MySQL server nativo
- ✅ Instala Redis server nativo
- ✅ Instala PHP-FPM 8.1+ via PPA
- ✅ Configura firewall UFW
- ✅ Instala Certbot para SSL
- ✅ Cria usuário e serviço systemd para API
- ✅ Scripts de manutenção automática

### 2. Deploy da Aplicação

**Ambiente de desenvolvimento:**
```bash
# Clone do repositório
git clone https://github.com/Sudo-psc/saraivavision-site-v2.git
cd saraivavision-site-v2

# Configurar variáveis de ambiente
cp .env.example .env.production
# Editar .env.production com configurações do VPS

# Deploy automático
./deploy-vps-native.sh
```

**O que o deploy faz:**
- ✅ Build da aplicação React com Vite
- ✅ Validação da build gerada
- ✅ Backup automático do deployment anterior
- ✅ Upload seguro via SSH/SCP
- ✅ Extração na pasta `/var/www/html/`
- ✅ Configuração de permissões
- ✅ Reload do Nginx
- ✅ Restart do serviço API (se necessário)
- ✅ Verificação de saúde dos serviços

## 📁 Estrutura de Diretórios no VPS

```
/var/www/html/                 # Frontend React (build estático)
├── index.html                 # SPA entry point
├── assets/                    # JS, CSS, imagens otimizadas
└── ...                        # Outros arquivos da build

/opt/saraiva-api/              # Backend Node.js API
├── server.js                  # Entry point da API
├── package.json              # Dependências Node.js
└── ...                        # Código da API

/etc/nginx/                    # Configuração Nginx
├── sites-available/saraiva-vision
└── sites-enabled/saraiva-vision

/var/backups/saraiva-vision/   # Backups automáticos
├── saraiva-vision-20240927_140530.tar.gz
└── ...

/etc/systemd/system/           # Serviços systemd
└── saraiva-api.service        # Serviço da API
```

## ⚙️ Configuração dos Serviços

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name saraivavision.com.br www.saraivavision.com.br;
    root /var/www/html;
    index index.html;

    # React SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WordPress proxy
    location /blog/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
    }
}
```

### Systemd Service (API)
```ini
[Unit]
Description=Saraiva Vision API Service
After=network.target mysql.service redis.service

[Service]
Type=simple
User=saraiva-api
WorkingDirectory=/opt/saraiva-api
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

## 🔧 Comandos de Manutenção

### Verificar Status dos Serviços
```bash
# Status de todos os serviços
sudo systemctl status nginx saraiva-api mysql redis php8.1-fpm

# Logs específicos
sudo journalctl -u saraiva-api -f
sudo journalctl -u nginx -f
```

### Restart de Serviços
```bash
# Restart individual
sudo systemctl restart nginx
sudo systemctl restart saraiva-api
sudo systemctl restart mysql
sudo systemctl restart redis
sudo systemctl restart php8.1-fpm

# Restart completo
sudo systemctl restart nginx saraiva-api mysql redis php8.1-fpm
```

### Backup Manual
```bash
# Backup do frontend
sudo tar -czf /var/backups/saraiva-vision/manual-$(date +%Y%m%d_%H%M%S).tar.gz -C /var/www/html .

# Backup do database MySQL
sudo mysqldump --all-databases > /var/backups/saraiva-vision/mysql-$(date +%Y%m%d_%H%M%S).sql
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Site não carrega (Nginx)
```bash
# Verificar configuração
sudo nginx -t

# Verificar logs
sudo tail -f /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```

#### 2. API não responde
```bash
# Verificar serviço
sudo systemctl status saraiva-api

# Verificar logs
sudo journalctl -u saraiva-api -f

# Restart
sudo systemctl restart saraiva-api
```

#### 3. Database connection issues
```bash
# Verificar MySQL
sudo systemctl status mysql

# Verificar conexões
sudo mysqladmin -u root -p processlist

# Restart MySQL
sudo systemctl restart mysql
```

#### 4. Cache issues (Redis)
```bash
# Verificar Redis
sudo systemctl status redis

# Limpar cache
redis-cli FLUSHALL

# Restart Redis
sudo systemctl restart redis
```

## 📊 Monitoramento e Performance

### Metrics dos Serviços
```bash
# CPU e memória
htop

# Disk usage
df -h

# Network connections
sudo netstat -tulnp

# Process monitoring
ps aux | grep -E "nginx|node|mysql|redis|php-fpm"
```

### Logs Importantes
```bash
# Nginx access/error logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Systemd journal
journalctl -f

# MySQL logs
tail -f /var/log/mysql/error.log

# Redis logs
tail -f /var/log/redis/redis-server.log
```

## 🔐 Segurança

### Firewall Configuration (UFW)
```bash
# Status
sudo ufw status

# Permitir apenas portas necessárias
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### SSL Certificate (Let's Encrypt)
```bash
# Obter certificado
sudo certbot --nginx -d saraivavision.com.br -d www.saraivavision.com.br

# Renovação automática
sudo certbot renew --dry-run
```

### Updates de Segurança
```bash
# Update do sistema
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
cd /opt/saraiva-api && npm audit fix

# Update WordPress (se necessário)
# Via admin dashboard ou WP-CLI
```

## 🎯 Vantagens da Arquitetura Nativa

### Performance
- ✅ **Overhead mínimo** - sem camadas de containerização
- ✅ **Acesso direto ao hardware** - máxima performance I/O
- ✅ **Cache nativo** - Redis integrado diretamente no SO
- ✅ **Network performance** - sem bridge networks

### Simplicidade
- ✅ **Debugging facilitado** - logs diretos no journalctl
- ✅ **Configuração familiar** - systemd, nginx conf padrão
- ✅ **Troubleshooting direto** - ferramentas nativas do SO
- ✅ **Backup simples** - tar, rsync, mysqldump

### Recursos
- ✅ **Menor uso de RAM** - sem containers overhead
- ✅ **CPU eficiente** - execução direta no kernel
- ✅ **Disk I/O otimizado** - sem filesystem layers
- ✅ **Network latency mínima** - binding direto nas portas

### Manutenção
- ✅ **Updates do SO** - apt upgrade normal
- ✅ **Service management** - systemctl padrão
- ✅ **Monitoring integrado** - journalctl, htop, etc.
- ✅ **Backup tradicional** - ferramentas conhecidas

## 🚀 Próximos Passos

1. **SSL Automático**: Configurar renovação automática dos certificados
2. **Monitoring**: Implementar Prometheus/Grafana para métricas
3. **Load Balancing**: Configurar múltiplas instâncias se necessário
4. **CI/CD**: Automatizar deploys via GitHub Actions
5. **Database Optimization**: Tuning MySQL para performance
6. **Cache Strategy**: Otimizar Redis para diferentes tipos de dados

---

**Arquitetura Native VPS garante máxima performance e controle total do ambiente de produção.**