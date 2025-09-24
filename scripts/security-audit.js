#!/usr/bin/env node

/**
 * Security Audit Script
 * Comprehensive security assessment for production deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';
import crypto from 'crypto';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

class SecurityAuditor {
    constructor() {
        this.results = {
            critical: [],
            high: [],
            medium: [],
            low: [],
            info: []
        };
        this.score = 0;
        this.maxScore = 0;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colorMap = {
            info: colors.blue,
            success: colors.green,
            warning: colors.yellow,
            error: colors.red,
            header: colors.magenta,
            critical: colors.red
        };

        console.log(`${colorMap[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    addFinding(severity, title, description, recommendation = '') {
        const finding = {
            severity,
            title,
            description,
            recommendation,
            timestamp: new Date().toISOString()
        };

        this.results[severity].push(finding);

        // Update score based on severity
        const severityScores = {
            critical: 0,
            high: 2,
            medium: 5,
            low: 8,
            info: 10
        };

        this.score += severityScores[severity];
        this.maxScore += 10;
    }

    async checkEnvironmentVariables() {
        this.log('🔐 Auditing Environment Variables...', 'header');

        const sensitiveVars = [
            'MYSQL_PASSWORD',
            'MYSQL_ROOT_PASSWORD',
            'SUPABASE_SERVICE_ROLE_KEY',
            'RESEND_API_KEY',
            'OPENAI_API_KEY',
            'JWT_SECRET_KEY'
        ];

        const requiredVars = [
            'SUPABASE_URL',
            'WORDPRESS_GRAPHQL_ENDPOINT',
            'DOCTOR_EMAIL'
        ];

        // Check for sensitive variables in code
        try {
            const result = execSync('grep -r "process.env" --include="*.js" --include="*.ts" api/ src/ 2>/dev/null || true', { encoding: 'utf8' });

            for (const sensitiveVar of sensitiveVars) {
                if (result.includes(sensitiveVar)) {
                    this.addFinding('medium',
                        `Sensitive variable ${sensitiveVar} found in code`,
                        `The sensitive environment variable ${sensitiveVar} is referenced in source code`,
                        'Ensure sensitive variables are properly secured and not logged'
                    );
                }
            }
        } catch (error) {
            // Ignore grep errors
        }

        // Check for hardcoded secrets
        try {
            const secretPatterns = [
                /sk-[a-zA-Z0-9]{48}/g, // OpenAI API keys
                /re_[a-zA-Z0-9]{24}/g, // Resend API keys
                /[a-zA-Z0-9]{64}/g     // Generic long tokens
            ];

            const files = execSync('find api/ src/ -name "*.js" -o -name "*.ts" 2>/dev/null || true', { encoding: 'utf8' }).split('\n').filter(f => f);

            for (const file of files) {
                if (fs.existsSync(file)) {
                    const content = fs.readFileSync(file, 'utf8');

                    for (const pattern of secretPatterns) {
                        const matches = content.match(pattern);
                        if (matches) {
                            this.addFinding('critical',
                                `Potential hardcoded secret in ${file}`,
                                `Found potential API key or secret: ${matches[0].substring(0, 10)}...`,
                                'Remove hardcoded secrets and use environment variables'
                            );
                        }
                    }
                }
            }
        } catch (error) {
            // Ignore file system errors
        }

        // Check environment variable security
        for (const varName of requiredVars) {
            if (!process.env[varName]) {
                this.addFinding('high',
                    `Missing required environment variable: ${varName}`,
                    `The required environment variable ${varName} is not set`,
                    'Set all required environment variables for production'
                );
            } else {
                this.addFinding('info',
                    `Environment variable ${varName} is set`,
                    `Required environment variable ${varName} is properly configured`
                );
            }
        }
    }

    async checkAPIEndpointSecurity() {
        this.log('🛡️  Auditing API Endpoint Security...', 'header');

        const apiFiles = execSync('find api/ -name "*.js" -type f -not -path "*/node_modules/*" 2>/dev/null || true', { encoding: 'utf8' }).split('\n').filter(f => f);

        for (const file of apiFiles) {
            if (fs.existsSync(file) && fs.statSync(file).isFile()) {
                const content = fs.readFileSync(file, 'utf8');

                // Check for input validation
                if (!content.includes('zod') && !content.includes('joi') && !content.includes('validate')) {
                    this.addFinding('medium',
                        `No input validation in ${file}`,
                        'API endpoint appears to lack input validation',
                        'Implement proper input validation using Zod or similar library'
                    );
                }

                // Check for rate limiting
                if (!content.includes('rateLimit') && !content.includes('rate-limit')) {
                    this.addFinding('medium',
                        `No rate limiting in ${file}`,
                        'API endpoint appears to lack rate limiting',
                        'Implement rate limiting to prevent abuse'
                    );
                }

                // Check for CORS configuration
                if (content.includes('cors') || content.includes('Access-Control-Allow-Origin')) {
                    this.addFinding('info',
                        `CORS configuration found in ${file}`,
                        'API endpoint has CORS configuration'
                    );
                }

                // Check for authentication
                if (content.includes('auth') || content.includes('jwt') || content.includes('token')) {
                    this.addFinding('info',
                        `Authentication found in ${file}`,
                        'API endpoint includes authentication mechanisms'
                    );
                }

                // Check for SQL injection protection
                if (content.includes('query') && !content.includes('prepared') && !content.includes('parameterized')) {
                    this.addFinding('high',
                        `Potential SQL injection risk in ${file}`,
                        'Database queries may not use parameterized statements',
                        'Use parameterized queries or ORM to prevent SQL injection'
                    );
                }

                // Check for XSS protection
                if (content.includes('innerHTML') || content.includes('dangerouslySetInnerHTML')) {
                    this.addFinding('high',
                        `Potential XSS risk in ${file}`,
                        'Code uses potentially unsafe HTML insertion methods',
                        'Sanitize user input and use safe DOM manipulation methods'
                    );
                }
            }
        }
    }

    async checkDatabaseSecurity() {
        this.log('🗄️  Auditing Database Security...', 'header');

        // Check Docker Compose database configuration
        const dockerComposePath = 'vps-wordpress/docker-compose.yml';
        if (fs.existsSync(dockerComposePath)) {
            const content = fs.readFileSync(dockerComposePath, 'utf8');

            // Check for default passwords
            if (content.includes('password') && (content.includes('admin') || content.includes('root') || content.includes('123'))) {
                this.addFinding('critical',
                    'Potential default database password',
                    'Database configuration may contain default or weak passwords',
                    'Use strong, randomly generated passwords for database accounts'
                );
            }

            // Check for exposed ports
            if (content.includes('3306:3306') || content.includes('5432:5432')) {
                this.addFinding('high',
                    'Database port exposed externally',
                    'Database port is exposed to external connections',
                    'Remove external port mapping for database containers'
                );
            }

            // Check for volume configuration
            if (content.includes('volumes:')) {
                this.addFinding('info',
                    'Database volumes configured',
                    'Database data persistence is properly configured'
                );
            } else {
                this.addFinding('medium',
                    'No database volumes configured',
                    'Database data may not persist across container restarts',
                    'Configure persistent volumes for database data'
                );
            }
        }

        // Check for database backup encryption
        const backupScript = '/usr/local/bin/wordpress-backup.sh';
        if (fs.existsSync(backupScript)) {
            const content = fs.readFileSync(backupScript, 'utf8');

            if (content.includes('gpg') || content.includes('encrypt')) {
                this.addFinding('info',
                    'Database backup encryption found',
                    'Database backups appear to be encrypted'
                );
            } else {
                this.addFinding('medium',
                    'Database backups not encrypted',
                    'Database backups may not be encrypted at rest',
                    'Implement backup encryption using GPG or similar tools'
                );
            }
        }
    }

    async checkSSLTLSSecurity() {
        this.log('🔒 Auditing SSL/TLS Security...', 'header');

        const domains = [
            'cms.saraivavision.com.br',
            'saraivavision.com.br'
        ];

        for (const domain of domains) {
            try {
                await this.checkSSLConfiguration(domain);
            } catch (error) {
                this.addFinding('high',
                    `SSL/TLS check failed for ${domain}`,
                    `Could not verify SSL/TLS configuration: ${error.message}`,
                    'Ensure SSL certificates are properly configured and accessible'
                );
            }
        }

        // Check nginx SSL configuration
        const nginxConfigPath = 'vps-wordpress/nginx/conf.d';
        if (fs.existsSync(nginxConfigPath)) {
            const configFiles = fs.readdirSync(nginxConfigPath).filter(f => f.endsWith('.conf'));

            for (const configFile of configFiles) {
                const content = fs.readFileSync(path.join(nginxConfigPath, configFile), 'utf8');

                // Check SSL protocols
                if (content.includes('ssl_protocols') && !content.includes('TLSv1.3')) {
                    this.addFinding('medium',
                        `Outdated SSL protocols in ${configFile}`,
                        'SSL configuration may not include TLS 1.3',
                        'Update SSL configuration to support TLS 1.3'
                    );
                }

                // Check SSL ciphers
                if (content.includes('ssl_ciphers') && content.includes('RC4')) {
                    this.addFinding('high',
                        `Weak SSL ciphers in ${configFile}`,
                        'SSL configuration includes weak ciphers',
                        'Remove weak ciphers from SSL configuration'
                    );
                }

                // Check HSTS
                if (!content.includes('Strict-Transport-Security')) {
                    this.addFinding('medium',
                        `Missing HSTS header in ${configFile}`,
                        'HTTP Strict Transport Security header not configured',
                        'Add HSTS header to enforce HTTPS connections'
                    );
                }
            }
        }
    }

    async checkSSLConfiguration(domain) {
        return new Promise((resolve, reject) => {
            const options = {
                host: domain,
                port: 443,
                method: 'HEAD',
                rejectUnauthorized: true
            };

            const req = https.request(options, (res) => {
                const cert = res.socket.getPeerCertificate(true);

                if (cert) {
                    // Check certificate expiry
                    const expiryDate = new Date(cert.valid_to);
                    const now = new Date();
                    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

                    if (daysUntilExpiry < 30) {
                        this.addFinding('high',
                            `SSL certificate expiring soon for ${domain}`,
                            `Certificate expires in ${daysUntilExpiry} days`,
                            'Renew SSL certificate before expiration'
                        );
                    } else {
                        this.addFinding('info',
                            `SSL certificate valid for ${domain}`,
                            `Certificate expires in ${daysUntilExpiry} days`
                        );
                    }

                    // Check certificate issuer
                    if (cert.issuer && cert.issuer.O === "Let's Encrypt") {
                        this.addFinding('info',
                            `Let's Encrypt certificate for ${domain}`,
                            'Using trusted certificate authority'
                        );
                    }

                    // Check security headers
                    const securityHeaders = [
                        'strict-transport-security',
                        'x-content-type-options',
                        'x-frame-options',
                        'x-xss-protection'
                    ];

                    for (const header of securityHeaders) {
                        if (res.headers[header]) {
                            this.addFinding('info',
                                `Security header ${header} present for ${domain}`,
                                `Security header ${header} is configured`
                            );
                        } else {
                            this.addFinding('medium',
                                `Missing security header ${header} for ${domain}`,
                                `Security header ${header} is not configured`,
                                `Add ${header} security header to improve security posture`
                            );
                        }
                    }
                }

                resolve();
            });

            req.on('error', reject);
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Connection timeout'));
            });

            req.end();
        });
    }

    async checkContainerSecurity() {
        this.log('🐳 Auditing Container Security...', 'header');

        const dockerComposePath = 'vps-wordpress/docker-compose.yml';
        if (fs.existsSync(dockerComposePath)) {
            const content = fs.readFileSync(dockerComposePath, 'utf8');

            // Check for privileged containers
            if (content.includes('privileged: true')) {
                this.addFinding('high',
                    'Privileged container detected',
                    'Container is running with privileged access',
                    'Remove privileged access unless absolutely necessary'
                );
            }

            // Check for root user
            if (!content.includes('user:') && !content.includes('USER')) {
                this.addFinding('medium',
                    'Containers may be running as root',
                    'No explicit user configuration found in containers',
                    'Configure containers to run as non-root users'
                );
            }

            // Check for read-only root filesystem
            if (!content.includes('read_only: true')) {
                this.addFinding('low',
                    'Root filesystem not read-only',
                    'Containers are not configured with read-only root filesystem',
                    'Consider using read-only root filesystem where possible'
                );
            }

            // Check for resource limits
            if (!content.includes('mem_limit') && !content.includes('cpus')) {
                this.addFinding('medium',
                    'No resource limits configured',
                    'Containers do not have memory or CPU limits',
                    'Configure resource limits to prevent resource exhaustion'
                );
            }

            // Check for health checks
            if (content.includes('healthcheck:')) {
                this.addFinding('info',
                    'Health checks configured',
                    'Container health checks are properly configured'
                );
            } else {
                this.addFinding('low',
                    'No health checks configured',
                    'Containers do not have health check configuration',
                    'Add health checks to monitor container status'
                );
            }
        }
    }

    async checkFilePermissions() {
        this.log('📁 Auditing File Permissions...', 'header');

        const criticalFiles = [
            '.env',
            'vps-wordpress/.env',
            '/etc/letsencrypt/live',
            '/usr/local/bin/wordpress-backup.sh'
        ];

        for (const file of criticalFiles) {
            if (fs.existsSync(file)) {
                try {
                    const stats = fs.statSync(file);
                    const mode = stats.mode & parseInt('777', 8);

                    // Check for world-readable sensitive files
                    if ((file.includes('.env') || file.includes('ssl') || file.includes('cert')) && (mode & parseInt('004', 8))) {
                        this.addFinding('high',
                            `World-readable sensitive file: ${file}`,
                            `File ${file} is readable by all users`,
                            'Restrict file permissions to owner only (600 or 640)'
                        );
                    }

                    // Check for world-writable files
                    if (mode & parseInt('002', 8)) {
                        this.addFinding('high',
                            `World-writable file: ${file}`,
                            `File ${file} is writable by all users`,
                            'Remove world-write permissions'
                        );
                    }

                    // Check executable scripts
                    if (file.endsWith('.sh') && !(mode & parseInt('100', 8))) {
                        this.addFinding('medium',
                            `Script not executable: ${file}`,
                            `Script ${file} is not executable`,
                            'Add execute permissions for script files'
                        );
                    }

                } catch (error) {
                    this.addFinding('low',
                        `Cannot check permissions for ${file}`,
                        `Error checking file permissions: ${error.message}`,
                        'Verify file exists and permissions are correct'
                    );
                }
            }
        }
    }

    async checkNetworkSecurity() {
        this.log('🌐 Auditing Network Security...', 'header');

        // Check firewall configuration
        try {
            const ufwStatus = execSync('sudo ufw status 2>/dev/null || echo "UFW not available"', { encoding: 'utf8' });

            if (ufwStatus.includes('Status: active')) {
                this.addFinding('info',
                    'Firewall is active',
                    'UFW firewall is enabled and active'
                );

                // Check for open ports
                if (ufwStatus.includes('22/tcp') && ufwStatus.includes('ALLOW')) {
                    this.addFinding('medium',
                        'SSH port open to all',
                        'SSH port 22 is open to all IP addresses',
                        'Restrict SSH access to specific IP ranges'
                    );
                }
            } else {
                this.addFinding('high',
                    'Firewall not active',
                    'System firewall is not enabled',
                    'Enable and configure UFW firewall'
                );
            }
        } catch (error) {
            this.addFinding('medium',
                'Cannot check firewall status',
                'Unable to determine firewall configuration',
                'Verify firewall is properly configured'
            );
        }

        // Check for exposed services
        try {
            const netstat = execSync('netstat -tuln 2>/dev/null || ss -tuln 2>/dev/null || echo "No network tools available"', { encoding: 'utf8' });

            const dangerousPorts = ['3306', '5432', '6379', '27017']; // MySQL, PostgreSQL, Redis, MongoDB

            for (const port of dangerousPorts) {
                if (netstat.includes(`:${port} `) && netstat.includes('0.0.0.0')) {
                    this.addFinding('high',
                        `Database port ${port} exposed externally`,
                        `Port ${port} is listening on all interfaces`,
                        'Bind database services to localhost only'
                    );
                }
            }
        } catch (error) {
            // Ignore network check errors
        }
    }

    async checkLogSecurity() {
        this.log('📋 Auditing Log Security...', 'header');

        const logFiles = [
            '/var/log/nginx/access.log',
            '/var/log/nginx/error.log',
            '/var/log/wordpress/backup.log',
            '/var/log/ssl-monitor.log'
        ];

        for (const logFile of logFiles) {
            if (fs.existsSync(logFile)) {
                try {
                    const content = fs.readFileSync(logFile, 'utf8');

                    // Check for sensitive data in logs
                    const sensitivePatterns = [
                        /password/i,
                        /secret/i,
                        /token/i,
                        /key/i,
                        /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card pattern
                        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email pattern
                    ];

                    for (const pattern of sensitivePatterns) {
                        if (pattern.test(content)) {
                            this.addFinding('medium',
                                `Potential sensitive data in ${logFile}`,
                                'Log file may contain sensitive information',
                                'Review and sanitize log files to remove sensitive data'
                            );
                            break;
                        }
                    }

                    // Check log file permissions
                    const stats = fs.statSync(logFile);
                    const mode = stats.mode & parseInt('777', 8);

                    if (mode & parseInt('044', 8)) {
                        this.addFinding('low',
                            `Log file ${logFile} is world-readable`,
                            'Log file can be read by all users',
                            'Restrict log file permissions to prevent unauthorized access'
                        );
                    }

                } catch (error) {
                    // Ignore log file read errors
                }
            }
        }

        // Check log rotation
        if (fs.existsSync('/etc/logrotate.d/wordpress')) {
            this.addFinding('info',
                'Log rotation configured',
                'WordPress log rotation is properly configured'
            );
        } else {
            this.addFinding('medium',
                'No log rotation configured',
                'Log files may grow indefinitely without rotation',
                'Configure log rotation to manage disk space'
            );
        }
    }

    generateSecurityReport() {
        this.log('📊 Security Audit Report', 'header');
        this.log('='.repeat(60), 'info');

        const totalFindings = Object.values(this.results).reduce((sum, findings) => sum + findings.length, 0);
        const securityScore = this.maxScore > 0 ? Math.round((this.score / this.maxScore) * 100) : 0;

        // Summary
        this.log(`Security Score: ${securityScore}%`, securityScore >= 80 ? 'success' : securityScore >= 60 ? 'warning' : 'error');
        this.log(`Total Findings: ${totalFindings}`, 'info');

        // Findings by severity
        const severities = ['critical', 'high', 'medium', 'low', 'info'];
        for (const severity of severities) {
            const count = this.results[severity].length;
            if (count > 0) {
                const color = severity === 'critical' ? 'critical' : severity === 'high' ? 'error' : severity === 'medium' ? 'warning' : 'info';
                this.log(`${severity.toUpperCase()}: ${count} findings`, color);
            }
        }

        this.log('='.repeat(60), 'info');

        // Detailed findings
        for (const severity of severities) {
            if (this.results[severity].length > 0) {
                this.log(`\n${severity.toUpperCase()} FINDINGS:`, 'header');

                for (const finding of this.results[severity]) {
                    this.log(`\n• ${finding.title}`, severity === 'critical' ? 'critical' : severity === 'high' ? 'error' : 'warning');
                    this.log(`  ${finding.description}`, 'info');
                    if (finding.recommendation) {
                        this.log(`  Recommendation: ${finding.recommendation}`, 'info');
                    }
                }
            }
        }

        // Overall assessment
        this.log('\n🎯 SECURITY ASSESSMENT', 'header');
        if (this.results.critical.length > 0) {
            this.log('❌ CRITICAL ISSUES FOUND - Immediate action required before production deployment', 'critical');
            return 3;
        } else if (this.results.high.length > 0) {
            this.log('⚠️  HIGH RISK ISSUES - Address before production deployment', 'error');
            return 2;
        } else if (this.results.medium.length > 0) {
            this.log('⚠️  MEDIUM RISK ISSUES - Consider addressing for improved security', 'warning');
            return 1;
        } else {
            this.log('✅ No critical security issues found - Ready for production', 'success');
            return 0;
        }
    }

    async run() {
        this.log('🔍 Starting Security Audit...', 'header');

        await this.checkEnvironmentVariables();
        await this.checkAPIEndpointSecurity();
        await this.checkDatabaseSecurity();
        await this.checkSSLTLSSecurity();
        await this.checkContainerSecurity();
        await this.checkFilePermissions();
        await this.checkNetworkSecurity();
        await this.checkLogSecurity();

        return this.generateSecurityReport();
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const auditor = new SecurityAuditor();

    auditor.run().then(exitCode => {
        process.exit(exitCode);
    }).catch(error => {
        console.error('❌ Security audit failed:', error);
        process.exit(1);
    });
}

export default SecurityAuditor;