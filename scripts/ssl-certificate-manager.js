#!/usr/bin/env node

/**
 * SSL Certificate Manager
 * Comprehensive SSL certificate monitoring, verification, and renewal management
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';
import tls from 'tls';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

class SSLCertificateManager {
    constructor() {
        this.domains = [
            'cms.saraivavision.com.br',
            'saraivavision.com.br'
        ];
        this.certPath = '/etc/letsencrypt/live';
        this.logFile = '/var/log/ssl-manager.log';
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colorMap = {
            info: colors.blue,
            success: colors.green,
            warning: colors.yellow,
            error: colors.red,
            header: colors.magenta
        };

        const logMessage = `[${timestamp}] ${message}`;
        console.log(`${colorMap[type]}${logMessage}${colors.reset}`);

        // Also log to file if running on server
        try {
            fs.appendFileSync(this.logFile, logMessage + '\n');
        } catch (error) {
            // Ignore file logging errors in development
        }
    }

    async checkCertificateExpiry(domain) {
        return new Promise((resolve) => {
            const options = {
                host: domain,
                port: 443,
                method: 'GET',
                rejectUnauthorized: false
            };

            const req = https.request(options, (res) => {
                const cert = res.socket.getPeerCertificate();

                if (cert && cert.valid_to) {
                    const expiryDate = new Date(cert.valid_to);
                    const now = new Date();
                    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

                    resolve({
                        domain,
                        valid: true,
                        expiryDate,
                        daysUntilExpiry,
                        issuer: cert.issuer,
                        subject: cert.subject,
                        serialNumber: cert.serialNumber
                    });
                } else {
                    resolve({
                        domain,
                        valid: false,
                        error: 'No certificate found'
                    });
                }
            });

            req.on('error', (error) => {
                resolve({
                    domain,
                    valid: false,
                    error: error.message
                });
            });

            req.setTimeout(10000, () => {
                req.destroy();
                resolve({
                    domain,
                    valid: false,
                    error: 'Connection timeout'
                });
            });

            req.end();
        });
    }

    async checkLocalCertificate(domain) {
        const certFile = path.join(this.certPath, domain, 'fullchain.pem');

        if (!fs.existsSync(certFile)) {
            return {
                domain,
                exists: false,
                error: 'Certificate file not found'
            };
        }

        try {
            const certContent = fs.readFileSync(certFile, 'utf8');
            const cert = new crypto.X509Certificate(certContent);

            const expiryDate = new Date(cert.validTo);
            const now = new Date();
            const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

            return {
                domain,
                exists: true,
                valid: true,
                expiryDate,
                daysUntilExpiry,
                issuer: cert.issuer,
                subject: cert.subject
            };
        } catch (error) {
            return {
                domain,
                exists: true,
                valid: false,
                error: error.message
            };
        }
    }

    async renewCertificate(domain) {
        this.log(`Attempting to renew certificate for ${domain}...`, 'info');

        try {
            // Test renewal first
            execSync(`certbot renew --cert-name ${domain} --dry-run`, { stdio: 'pipe' });
            this.log(`✅ Dry run successful for ${domain}`, 'success');

            // Perform actual renewal
            const result = execSync(`certbot renew --cert-name ${domain} --force-renewal`, {
                stdio: 'pipe',
                encoding: 'utf8'
            });

            this.log(`✅ Certificate renewed successfully for ${domain}`, 'success');

            // Reload nginx if running in Docker
            try {
                execSync('docker-compose exec nginx nginx -s reload', { stdio: 'pipe' });
                this.log('✅ Nginx reloaded successfully', 'success');
            } catch (error) {
                this.log(`⚠️  Could not reload nginx: ${error.message}`, 'warning');
            }

            return { success: true, output: result };
        } catch (error) {
            this.log(`❌ Certificate renewal failed for ${domain}: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async setupAutoRenewal() {
        this.log('Setting up automatic certificate renewal...', 'info');

        const cronJob = '0 2 * * * /usr/bin/certbot renew --quiet --post-hook "docker-compose exec nginx nginx -s reload"';
        const cronFile = '/etc/cron.d/certbot-renew';

        try {
            fs.writeFileSync(cronFile, cronJob + '\n');
            this.log('✅ Automatic renewal cron job created', 'success');

            // Create renewal script
            const renewalScript = `#!/bin/bash
# SSL Certificate Renewal Script
# Generated by SSL Certificate Manager

set -e

LOG_FILE="/var/log/ssl-renewal.log"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log_message "Starting certificate renewal check..."

# Check and renew certificates
if certbot renew --quiet; then
    log_message "Certificate renewal completed successfully"
    
    # Reload nginx if running
    if docker-compose ps nginx | grep -q "Up"; then
        docker-compose exec nginx nginx -s reload
        log_message "Nginx reloaded successfully"
    fi
else
    log_message "Certificate renewal failed"
    exit 1
fi

log_message "Certificate renewal check completed"
`;

            fs.writeFileSync('/usr/local/bin/ssl-renew.sh', renewalScript);
            execSync('chmod +x /usr/local/bin/ssl-renew.sh');
            this.log('✅ Renewal script created at /usr/local/bin/ssl-renew.sh', 'success');

        } catch (error) {
            this.log(`❌ Failed to setup auto-renewal: ${error.message}`, 'error');
        }
    }

    async createMonitoringScript() {
        this.log('Creating SSL monitoring script...', 'info');

        const monitoringScript = `#!/bin/bash
# SSL Certificate Monitoring Script
# Checks certificate expiry and sends alerts

DOMAINS="${this.domains.join(' ')}"
ALERT_DAYS=30
LOG_FILE="/var/log/ssl-monitor.log"
EMAIL_ALERT="${process.env.DOCTOR_EMAIL || 'admin@saraivavision.com.br'}"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_certificate() {
    local domain=$1
    local cert_file="/etc/letsencrypt/live/$domain/fullchain.pem"
    
    if [ ! -f "$cert_file" ]; then
        log_message "ERROR: Certificate file not found for $domain"
        return 1
    fi
    
    local expiry_date=$(openssl x509 -in "$cert_file" -enddate -noout | cut -d= -f2)
    local expiry_timestamp=$(date -d "$expiry_date" +%s)
    local current_timestamp=$(date +%s)
    local days_until_expiry=$(( ($expiry_timestamp - $current_timestamp) / 86400 ))
    
    log_message "Certificate for $domain expires in $days_until_expiry days"
    
    if [ $days_until_expiry -lt $ALERT_DAYS ]; then
        log_message "WARNING: Certificate for $domain expires in $days_until_expiry days"
        
        # Send email alert if configured
        if command -v mail &> /dev/null; then
            echo "SSL certificate for $domain expires in $days_until_expiry days. Please renew immediately." | \\
                mail -s "SSL Certificate Expiry Alert - $domain" "$EMAIL_ALERT"
        fi
        
        # Attempt automatic renewal
        log_message "Attempting automatic renewal for $domain"
        if /usr/local/bin/ssl-renew.sh; then
            log_message "Automatic renewal successful for $domain"
        else
            log_message "Automatic renewal failed for $domain"
        fi
    fi
}

log_message "Starting SSL certificate monitoring check"

for domain in $DOMAINS; do
    check_certificate "$domain"
done

log_message "SSL certificate monitoring check completed"
`;

        try {
            fs.writeFileSync('/usr/local/bin/ssl-monitor.sh', monitoringScript);
            execSync('chmod +x /usr/local/bin/ssl-monitor.sh');
            this.log('✅ SSL monitoring script created', 'success');

            // Add to cron
            const monitorCron = '0 6 * * * /usr/local/bin/ssl-monitor.sh';
            const existingCron = execSync('crontab -l 2>/dev/null || true', { encoding: 'utf8' });

            if (!existingCron.includes('/usr/local/bin/ssl-monitor.sh')) {
                const newCron = existingCron + monitorCron + '\n';
                execSync(`echo "${newCron}" | crontab -`);
                this.log('✅ SSL monitoring cron job added', 'success');
            }

        } catch (error) {
            this.log(`❌ Failed to create monitoring script: ${error.message}`, 'error');
        }
    }

    async verifySSLConfiguration() {
        this.log('🔒 Verifying SSL Configuration...', 'header');

        const results = [];

        for (const domain of this.domains) {
            this.log(`Checking SSL for ${domain}...`, 'info');

            // Check remote certificate
            const remoteCert = await this.checkCertificateExpiry(domain);

            if (remoteCert.valid) {
                this.log(`✅ ${domain}: Valid until ${remoteCert.expiryDate.toDateString()} (${remoteCert.daysUntilExpiry} days)`, 'success');

                if (remoteCert.daysUntilExpiry < 30) {
                    this.log(`⚠️  ${domain}: Certificate expires in ${remoteCert.daysUntilExpiry} days`, 'warning');
                }
            } else {
                this.log(`❌ ${domain}: ${remoteCert.error}`, 'error');
            }

            results.push(remoteCert);
        }

        return results;
    }

    async testSSLRenewal() {
        this.log('🧪 Testing SSL Renewal Process...', 'header');

        for (const domain of this.domains) {
            this.log(`Testing renewal for ${domain}...`, 'info');

            try {
                execSync(`certbot renew --cert-name ${domain} --dry-run`, {
                    stdio: 'pipe',
                    timeout: 30000
                });
                this.log(`✅ Renewal test passed for ${domain}`, 'success');
            } catch (error) {
                this.log(`❌ Renewal test failed for ${domain}: ${error.message}`, 'error');
            }
        }
    }

    async generateSSLReport() {
        this.log('📊 Generating SSL Certificate Report...', 'header');

        const results = await this.verifySSLConfiguration();
        const reportPath = '/tmp/ssl-report.json';

        const report = {
            timestamp: new Date().toISOString(),
            domains: results,
            summary: {
                total: results.length,
                valid: results.filter(r => r.valid).length,
                expiringSoon: results.filter(r => r.valid && r.daysUntilExpiry < 30).length,
                invalid: results.filter(r => !r.valid).length
            }
        };

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        this.log(`✅ SSL report generated: ${reportPath}`, 'success');

        return report;
    }

    async run(command = 'check') {
        switch (command) {
            case 'check':
                return await this.verifySSLConfiguration();

            case 'renew':
                const renewResults = [];
                for (const domain of this.domains) {
                    const result = await this.renewCertificate(domain);
                    renewResults.push({ domain, ...result });
                }
                return renewResults;

            case 'setup':
                await this.setupAutoRenewal();
                await this.createMonitoringScript();
                break;

            case 'test':
                await this.testSSLRenewal();
                break;

            case 'report':
                return await this.generateSSLReport();

            default:
                this.log(`❌ Unknown command: ${command}`, 'error');
                this.log('Available commands: check, renew, setup, test, report', 'info');
                return false;
        }
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2] || 'check';
    const manager = new SSLCertificateManager();

    manager.run(command).then(result => {
        if (result === false) {
            process.exit(1);
        }
        process.exit(0);
    }).catch(error => {
        console.error('❌ SSL Certificate Manager failed:', error);
        process.exit(1);
    });
}

export default SSLCertificateManager;