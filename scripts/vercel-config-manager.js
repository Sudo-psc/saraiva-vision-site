#!/usr/bin/env node

/**
 * Vercel Configuration Manager
 * Manages multiple vercel.json configurations for different deployment scenarios
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class VercelConfigManager {
    constructor() {
        this.configurations = {
            production: {
                name: 'Production',
                buildCommand: 'npm run build',
                outputDirectory: 'dist',
                framework: 'vite',
                functions: {
                    'api/**': {
                        maxDuration: 60,
                        memory: 1024
                    }
                },
                rewrites: [
                    { "source": "/(.*)", "destination": "/" }
                ],
                regions: ["gru1", "iad1"],
                functionFailoverRegions: ["iad1", "cle1"],
                env: {
                    NODE_ENV: 'production',
                    VITE_API_URL: 'https://saraivavision.com.br/api',
                    VITE_WORDPRESS_URL: 'https://saraivavision.com.br'
                }
            },

            development: {
                name: 'Development',
                buildCommand: 'npm run build',
                outputDirectory: 'dist',
                framework: 'vite',
                functions: {
                    'api/**': {
                        maxDuration: 60,
                        memory: 1024
                    }
                },
                rewrites: [
                    { "source": "/(.*)", "destination": "/" }
                ],
                regions: ["gru1", "iad1"],
                env: {
                    NODE_ENV: 'development',
                    VITE_API_URL: 'https://dev.saraivavision.com.br/api',
                    VITE_WORDPRESS_URL: 'https://dev.saraivavision.com.br'
                }
            },

            edge: {
                name: 'Edge Runtime',
                buildCommand: 'npm run build',
                outputDirectory: 'dist',
                framework: 'vite',
                functions: {
                    'api/**': {
                        runtime: 'edge'
                    }
                },
                rewrites: [
                    { "source": "/(.*)", "destination": "/" }
                ],
                env: {
                    NODE_ENV: 'production',
                    VITE_API_URL: 'https://saraivavision.com.br/api',
                    VITE_WORDPRESS_URL: 'https://saraivavision.com.br'
                }
            },

            node20: {
                name: 'Node.js 20',
                buildCommand: 'npm run build',
                outputDirectory: 'dist',
                framework: 'vite',
                functions: {
                    'api/**': {
                        maxDuration: 60,
                        memory: 1024
                    }
                },
                rewrites: [
                    { "source": "/(.*)", "destination": "/" }
                ],
                regions: ["gru1", "iad1"],
                functionFailoverRegions: ["iad1", "cle1"],
                env: {
                    NODE_ENV: 'production',
                    VITE_API_URL: 'https://saraivavision.com.br/api',
                    VITE_WORDPRESS_URL: 'https://saraivavision.com.br'
                }
            },

            static: {
                name: 'Static Only',
                buildCommand: 'npm run build:static',
                outputDirectory: 'dist',
                framework: 'vite',
                rewrites: [
                    { "source": "/(.*)", "destination": "/" }
                ],
                env: {
                    NODE_ENV: 'production',
                    VITE_API_URL: 'https://saraivavision.com.br/api',
                    VITE_WORDPRESS_URL: 'https://saraivavision.com.br'
                }
            },

            minimal: {
                name: 'Minimal Functions',
                buildCommand: 'npm run build',
                outputDirectory: 'dist',
                framework: 'vite',
                functions: {
                    'api/health.js': {
                        maxDuration: 60,
                        memory: 1024
                    },
                    'api/contact/index.js': {
                        maxDuration: 60,
                        memory: 1024
                    }
                },
                rewrites: [
                    { "source": "/(.*)", "destination": "/" }
                ],
                regions: ["gru1", "iad1"],
                env: {
                    NODE_ENV: 'production',
                    VITE_API_URL: 'https://saraivavision.com.br/api',
                    VITE_WORDPRESS_URL: 'https://saraivavision.com.br'
                }
            }
        };

        this.configDir = path.join(process.cwd(), '.vercel-configs');
    }

    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const levels = {
            info: '\x1b[36mINFO\x1b[0m',
            success: '\x1b[32mSUCCESS\x1b[0m',
            warning: '\x1b[33mWARNING\x1b[0m',
            error: '\x1b[31mERROR\x1b[0m'
        };
        console.log(`[${timestamp}] ${levels[level]}: ${message}`);
    }

    async ensureConfigDir() {
        if (!fs.existsSync(this.configDir)) {
            fs.mkdirSync(this.configDir, { recursive: true });
            this.log('Created .vercel-configs directory', 'success');
        }
    }

    async saveConfiguration(name, config) {
        await this.ensureConfigDir();
        const configPath = path.join(this.configDir, `${name}.json`);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        this.log(`Saved configuration: ${name}`, 'success');
    }

    async loadConfiguration(name) {
        const configPath = path.join(this.configDir, `${name}.json`);
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            this.log(`Loaded configuration: ${name}`, 'success');
            return config;
        }
        return null;
    }

    async applyConfiguration(name) {
        const config = this.configurations[name] || await this.loadConfiguration(name);

        if (!config) {
            this.log(`Configuration not found: ${name}`, 'error');
            return false;
        }

        const vercelPath = path.join(process.cwd(), 'vercel.json');
        fs.writeFileSync(vercelPath, JSON.stringify(config, null, 2));

        this.log(`Applied configuration: ${config.name}`, 'success');
        this.log(`Runtime: ${config.functions?.['api/**/*.js']?.runtime || 'static'}`);

        return true;
    }

    async listConfigurations() {
        this.log('Available configurations:', 'info');

        // Built-in configurations
        this.log('\n📋 Built-in Configurations:', 'info');
        Object.entries(this.configurations).forEach(([key, config]) => {
            const runtime = config.functions?.['api/**/*.js']?.runtime || 'static';
            this.log(`  ${key}: ${config.name} (${runtime})`, 'info');
        });

        // Custom configurations
        await this.ensureConfigDir();
        const customConfigs = fs.readdirSync(this.configDir)
            .filter(file => file.endsWith('.json'))
            .map(file => path.basename(file, '.json'));

        if (customConfigs.length > 0) {
            this.log('\n📋 Custom Configurations:', 'info');
            customConfigs.forEach(config => {
                this.log(`  ${config}`, 'info');
            });
        }
    }

    async createCustomConfig(name, options = {}) {
        const baseConfig = this.configurations.production;
        const customConfig = {
            ...baseConfig,
            name: options.name || `Custom ${name}`,
            ...options
        };

        await this.saveConfiguration(name, customConfig);
        this.log(`Created custom configuration: ${name}`, 'success');
        return customConfig;
    }

    async backupCurrent() {
        const vercelPath = path.join(process.cwd(), 'vercel.json');
        const backupPath = path.join(this.configDir, 'backup.json');

        if (fs.existsSync(vercelPath)) {
            const config = fs.readFileSync(vercelPath, 'utf8');
            fs.writeFileSync(backupPath, config);
            this.log('Current configuration backed up', 'success');
        }
    }

    async restoreBackup() {
        const backupPath = path.join(this.configDir, 'backup.json');
        const vercelPath = path.join(process.cwd(), 'vercel.json');

        if (fs.existsSync(backupPath)) {
            const backup = fs.readFileSync(backupPath, 'utf8');
            fs.writeFileSync(vercelPath, backup);
            this.log('Configuration restored from backup', 'success');
        }
    }

    async testConfiguration(name) {
        this.log(`Testing configuration: ${name}`, 'info');

        // Apply configuration
        const applied = await this.applyConfiguration(name);
        if (!applied) {
            return { success: false, error: 'Failed to apply configuration' };
        }

        // Test build
        try {
            execSync('npm run build:vercel', { stdio: 'pipe', timeout: 120000 });
            this.log('Build test passed', 'success');
            return { success: true };
        } catch (error) {
            this.log(`Build test failed: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const configName = args[1];

    const manager = new VercelConfigManager();

    switch (command) {
        case 'list':
            await manager.listConfigurations();
            break;

        case 'apply':
            if (!configName) {
                console.error('Usage: node vercel-config-manager.js apply <config-name>');
                process.exit(1);
            }
            const applied = await manager.applyConfiguration(configName);
            process.exit(applied ? 0 : 1);
            break;

        case 'test':
            if (!configName) {
                console.error('Usage: node vercel-config-manager.js test <config-name>');
                process.exit(1);
            }
            const testResult = await manager.testConfiguration(configName);
            process.exit(testResult.success ? 0 : 1);
            break;

        case 'backup':
            await manager.backupCurrent();
            break;

        case 'restore':
            await manager.restoreBackup();
            break;

        case 'create':
            if (!configName) {
                console.error('Usage: node vercel-config-manager.js create <config-name>');
                process.exit(1);
            }
            await manager.createCustomConfig(configName);
            break;

        default:
            console.log(`
Vercel Configuration Manager

Usage:
  node vercel-config-manager.js list              - List all configurations
  node vercel-config-manager.js apply <name>      - Apply a configuration
  node vercel-config-manager.js test <name>       - Test a configuration
  node vercel-config-manager.js backup            - Backup current config
  node vercel-config-manager.js restore           - Restore from backup
  node vercel-config-manager.js create <name>      - Create custom config

Available configurations:
  production   - Production environment (default)
  development  - Development environment
  edge         - Edge runtime
  node20       - Node.js 20.x runtime
  static       - Static only (no functions)
  minimal      - Minimal functions only
            `);
            break;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default VercelConfigManager;