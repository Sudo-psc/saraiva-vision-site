#!/usr/bin/env node

/**
 * VPS Setup Script for Saraiva Vision
 *
 * This script sets up a VPS for hosting the Saraiva Vision website
 * including system packages, Node.js, Docker, Nginx, and SSL certificates.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VPSSetup {
    constructor() {
        this.steps = [
            'System Update',
            'Install Dependencies',
            'Install Node.js',
            'Install Docker',
            'Install Nginx',
            'Configure Firewall',
            'Setup Directories',
            'Install SSL Certificate',
            'Configure Nginx',
            'Setup Environment'
        ];
        this.currentStep = 0;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔄';
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    executeCommand(command, description, optional = false) {
        try {
            this.log(`Executing: ${description}`);
            const result = execSync(command, {
                encoding: 'utf8',
                stdio: 'pipe',
                timeout: 300000 // 5 minutes timeout
            });
            this.log(`✅ ${description} completed successfully`, 'success');
            return result;
        } catch (error) {
            if (optional) {
                this.log(`⚠️ ${description} failed (optional): ${error.message}`, 'warning');
                return null;
            }
            this.log(`❌ ${description} failed: ${error.message}`, 'error');
            throw error;
        }
    }

    systemUpdate() {
        this.log('📦 Updating system packages...');

        this.executeCommand('sudo apt update', 'Update package list');
        this.executeCommand('sudo apt upgrade -y', 'Upgrade system packages');
        this.executeCommand('sudo apt autoremove -y', 'Remove unused packages');
        this.executeCommand('sudo apt autoclean', 'Clean package cache');
    }

    installDependencies() {
        this.log('🔧 Installing system dependencies...');

        const packages = [
            'curl', 'wget', 'git', 'unzip', 'zip', 'tar',
            'build-essential', 'python3', 'python3-pip',
            'certbot', 'python3-certbot-nginx',
            'ufw', 'fail2ban', 'htop', 'vim', 'nano'
        ];

        this.executeCommand(
            `sudo apt install -y ${packages.join(' ')}`,
            'Install essential packages'
        );
    }

    installNodeJS() {
        this.log('🟢 Installing Node.js...');

        // Install Node.js 18.x using NodeSource repository
        this.executeCommand(
            'curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -',
            'Add NodeSource repository'
        );

        this.executeCommand(
            'sudo apt install -y nodejs',
            'Install Node.js'
        );

        // Verify installation
        const nodeVersion = this.executeCommand('node --version', 'Check Node.js version');
        const npmVersion = this.executeCommand('npm --version', 'Check npm version');

        this.log(`Node.js: ${nodeVersion.trim()}, npm: ${npmVersion.trim()}`, 'success');
    }

    installDocker() {
        this.log('🐳 Installing Docker and Docker Compose...');

        // Install Docker
        this.executeCommand(
            'curl -fsSL https://get.docker.com -o get-docker.sh',
            'Download Docker installation script'
        );

        this.executeCommand(
            'sudo sh get-docker.sh',
            'Install Docker'
        );

        // Add user to docker group
        this.executeCommand(
            'sudo usermod -aG docker $USER',
            'Add user to docker group'
        );

        // Install Docker Compose
        this.executeCommand(
            'sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose',
            'Download Docker Compose'
        );

        this.executeCommand(
            'sudo chmod +x /usr/local/bin/docker-compose',
            'Make Docker Compose executable'
        );

        // Start Docker service
        this.executeCommand(
            'sudo systemctl enable docker',
            'Enable Docker service'
        );

        this.executeCommand(
            'sudo systemctl start docker',
            'Start Docker service'
        );

        // Verify installation
        const dockerVersion = this.executeCommand('docker --version', 'Check Docker version');
        const composeVersion = this.executeCommand('docker-compose --version', 'Check Docker Compose version');

        this.log(`Docker: ${dockerVersion.trim()}, Docker Compose: ${composeVersion.trim()}`, 'success');
    }

    installNginx() {
        this.log('🌐 Installing Nginx...');

        this.executeCommand(
            'sudo apt install -y nginx',
            'Install Nginx'
        );

        this.executeCommand(
            'sudo systemctl enable nginx',
            'Enable Nginx service'
        );

        this.executeCommand(
            'sudo systemctl start nginx',
            'Start Nginx service'
        );

        // Create backup of default configuration
        this.executeCommand(
            'sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup',
            'Backup default Nginx configuration',
            true
        );
    }

    configureFirewall() {
        this.log('🛡️ Configuring firewall...');

        // Enable UFW
        this.executeCommand(
            'sudo ufw --force enable',
            'Enable UFW firewall'
        );

        // Allow essential ports
        const ports = [
            '22',    // SSH
            '80',    // HTTP
            '443',   // HTTPS
            '3002'   // Development server (optional)
        ];

        ports.forEach(port => {
            this.executeCommand(
                `sudo ufw allow ${port}`,
                `Allow port ${port}`
            );
        });

        // Allow Docker connections
        this.executeCommand(
            'sudo ufw allow from 172.17.0.0/16',
            'Allow Docker network connections'
        );

        this.log('🔥 Firewall configured successfully', 'success');
    }

    setupDirectories() {
        this.log('📁 Creating deployment directories...');

        const directories = [
            '/var/www/saraiva-vision',
            '/var/www/saraiva-vision/html',
            '/var/www/saraiva-vision/logs',
            '/var/www/saraiva-vision/backups',
            '/var/www/saraiva-vision/ssl',
            '/opt/docker/saraiva-vision',
            '/etc/nginx/sites-available',
            '/etc/nginx/sites-enabled'
        ];

        directories.forEach(dir => {
            this.executeCommand(
                `sudo mkdir -p ${dir}`,
                `Create directory: ${dir}`
            );
        });

        // Set permissions
        this.executeCommand(
            'sudo chown -R $USER:$USER /var/www/saraiva-vision',
            'Set directory ownership'
        );

        this.executeCommand(
            'sudo chmod -R 755 /var/www/saraiva-vision',
            'Set directory permissions'
        );
    }

    installSSLCertificate() {
        this.log('🔒 Setting up SSL certificate...');

        // Note: This step requires domain name to be pointed to the VPS
        this.log('⚠️ SSL certificate setup requires domain name configuration', 'warning');
        this.log('Run this step after pointing your domain to the VPS IP:', 'info');
        this.log('sudo certbot --nginx -d your-domain.com -d www.your-domain.com', 'info');
    }

    configureNginx() {
        this.log('⚙️ Configuring Nginx...');

        // Create Nginx configuration file
        const nginxConfig = `
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    root /var/www/saraiva-vision/html;
    index index.html index.htm;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Static File Caching
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WordPress Proxy
    location /wp-admin/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health Check
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }

    # Security
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Hide sensitive files
    location ~* \\.(env|log|conf)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}`;

        fs.writeFileSync('/tmp/saraiva-vision-nginx.conf', nginxConfig);

        this.log('📝 Nginx configuration template created', 'info');
        this.log('⚠️ Update domain name in /tmp/saraiva-vision-nginx.conf before applying', 'warning');
        this.log('Then run: sudo cp /tmp/saraiva-vision-nginx.conf /etc/nginx/sites-available/saraiva-vision', 'info');
    }

    setupEnvironment() {
        this.log('🔧 Setting up environment...');

        // Create environment file template
        const envTemplate = `# Production Environment Variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_HYPERTUNE_TOKEN=your_hypertune_token
NODE_ENV=production`;

        fs.writeFileSync('/tmp/.env.production', envTemplate);

        this.log('📝 Environment template created at /tmp/.env.production', 'info');
        this.log('⚠️ Update the values and move to project directory', 'warning');
    }

    async setup() {
        try {
            this.log('🚀 Starting VPS setup for Saraiva Vision...');
            this.log('📋 This process will take approximately 15-20 minutes');

            for (const step of this.steps) {
                this.currentStep++;
                this.log(`Step ${this.currentStep}/${this.steps.length}: ${step}`);

                switch (step) {
                    case 'System Update':
                        this.systemUpdate();
                        break;
                    case 'Install Dependencies':
                        this.installDependencies();
                        break;
                    case 'Install Node.js':
                        this.installNodeJS();
                        break;
                    case 'Install Docker':
                        this.installDocker();
                        break;
                    case 'Install Nginx':
                        this.installNginx();
                        break;
                    case 'Configure Firewall':
                        this.configureFirewall();
                        break;
                    case 'Setup Directories':
                        this.setupDirectories();
                        break;
                    case 'Install SSL Certificate':
                        this.installSSLCertificate();
                        break;
                    case 'Configure Nginx':
                        this.configureNginx();
                        break;
                    case 'Setup Environment':
                        this.setupEnvironment();
                        break;
                }

                this.log(`✅ Step ${this.currentStep} completed`, 'success');
                this.log(''); // Empty line for readability
            }

            this.log('🎉 VPS setup completed successfully!', 'success');
            this.log('📋 Next steps:', 'info');
            this.log('1. Point your domain to the VPS IP address', 'info');
            this.log('2. Configure SSL certificate with Certbot', 'info');
            this.log('3. Update Nginx configuration with your domain', 'info');
            this.log('4. Setup environment variables', 'info');
            this.log('5. Deploy the application using: npm run deploy:vps', 'info');

        } catch (error) {
            this.log(`❌ Setup failed: ${error.message}`, 'error');
            this.log('🔧 Check the error messages above and fix any issues', 'info');
            this.log('💡 You can resume the setup by running the script again', 'info');
            process.exit(1);
        }
    }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const setup = new VPSSetup();
    setup.setup().catch(console.error);
}

export default VPSSetup;