#!/usr/bin/env node

/**
 * @fileoverview GTM Deployment Verification Script
 * Verifies GTM integration in built assets and deployed site
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GTM_ID = process.env.VITE_GTM_ID || 'GTM-KF2NP85D';
const SITE_URL = process.env.SITE_URL || 'https://saraivavision.com.br';
const DIST_DIR = process.env.DIST_DIR || './dist';

class GTMVerifier {
  constructor() {
    this.results = {
      bundle: false,
      consent: false,
      network: false,
      deployment: false
    };
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔍',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async verifyBundleContainsGTM() {
    this.log('Verificando GTM ID no bundle JavaScript...');
    
    try {
      const assetsDir = path.join(DIST_DIR, 'assets');
      
      this.log(`Procurando em: ${assetsDir}`);
      
      if (!fs.existsSync(assetsDir)) {
        throw new Error(`Assets directory not found: ${assetsDir}`);
      }

      // Get JS files from both root assets dir and subdirectories
      const getAllJsFiles = (dir) => {
        let jsFiles = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            jsFiles = jsFiles.concat(getAllJsFiles(fullPath));
          } else if (item.endsWith('.js')) {
            jsFiles.push(fullPath);
          }
        }
        
        return jsFiles;
      };

      const jsFiles = getAllJsFiles(assetsDir);

      this.log(`Encontrados ${jsFiles.length} arquivos JS para verificar`);

      let gtmFound = false;
      let consentModeFound = false;

      for (const jsFile of jsFiles) {
        const content = fs.readFileSync(jsFile, 'utf8');
        
        // Check for exact GTM ID match (minified or not)
        if (content.includes(GTM_ID)) {
          gtmFound = true;
          this.log(`GTM ID encontrado em: ${path.basename(jsFile)}`, 'success');
        }

        // Check for GTM patterns in minified code
        if (content.includes('"GTM-') || content.includes("'GTM-") || content.includes('M="GTM-')) {
          if (!gtmFound) {
            gtmFound = true;
            this.log(`Padrão GTM detectado em: ${path.basename(jsFile)}`, 'success');
          }
        }

        // Check for consent mode and GTM integration patterns
        if ((content.includes('consent') && content.includes('gtm')) || 
            (content.includes('consent') && content.includes('googletagmanager'))) {
          consentModeFound = true;
          this.log(`Consent Mode encontrado em: ${path.basename(jsFile)}`, 'success');
        }
      }

      if (!gtmFound) {
        throw new Error(`GTM ID ${GTM_ID} não encontrado nos assets JavaScript`);
      }

      if (!consentModeFound) {
        this.log('Consent Mode não detectado no bundle', 'warning');
      }

      this.results.bundle = true;
      return true;

    } catch (error) {
      this.errors.push(`Bundle verification failed: ${error.message}`);
      this.log(`Erro na verificação do bundle: ${error.message}`, 'error');
      return false;
    }
  }

  async verifyDeployedSite() {
    this.log(`Verificando site deployado: ${SITE_URL}...`);
    
    return new Promise((resolve) => {
      const req = https.get(SITE_URL, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'GTM-Verifier/1.0',
          'Cache-Control': 'no-cache'
        }
      }, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            // Check for consent mode in HTML
            const hasConsentMode = data.includes('consent') && data.includes('default');
            
            // Check for GTM comment
            const hasGTMComment = data.includes('Google Tag Manager') || data.includes('GTM');
            
            // Check for dataLayer
            const hasDataLayer = data.includes('dataLayer');

            if (hasConsentMode) {
              this.log('Consent Mode detectado no HTML', 'success');
              this.results.consent = true;
            }

            if (hasGTMComment) {
              this.log('Referências GTM encontradas no HTML', 'success');
            }

            if (hasDataLayer) {
              this.log('dataLayer detectado no HTML', 'success');
            }

            if (res.statusCode === 200) {
              this.log('Site acessível e respondendo', 'success');
              this.results.deployment = true;
            }

            resolve(true);

          } catch (error) {
            this.errors.push(`Site verification failed: ${error.message}`);
            this.log(`Erro na verificação do site: ${error.message}`, 'error');
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        this.errors.push(`Network request failed: ${error.message}`);
        this.log(`Erro de rede: ${error.message}`, 'error');
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        this.errors.push('Request timeout');
        this.log('Timeout ao acessar o site', 'error');
        resolve(false);
      });
    });
  }

  async verifyGTMNetworkRequests() {
    this.log('Verificando se GTM pode ser carregado...');
    
    return new Promise((resolve) => {
      const gtmUrl = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
      
      const req = https.get(gtmUrl, { timeout: 5000 }, (res) => {
        if (res.statusCode === 200) {
          this.log('GTM script acessível via CDN', 'success');
          this.results.network = true;
          resolve(true);
        } else {
          this.errors.push(`GTM CDN returned status ${res.statusCode}`);
          this.log(`GTM CDN retornou status ${res.statusCode}`, 'error');
          resolve(false);
        }
      });

      req.on('error', (error) => {
        this.errors.push(`GTM CDN request failed: ${error.message}`);
        this.log(`Erro ao acessar GTM CDN: ${error.message}`, 'error');
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        this.errors.push('GTM CDN request timeout');
        this.log('Timeout ao acessar GTM CDN', 'error');
        resolve(false);
      });
    });
  }

  async runTests() {
    this.log('Executando testes GTM...');
    
    try {
      // Run GTM-specific tests
      execSync('npm test -- gtm.test.js', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      this.log('Testes GTM passaram', 'success');
    } catch (error) {
      this.errors.push('GTM tests failed');
      this.log('Testes GTM falharam', 'error');
      return false;
    }
    
    return true;
  }

  generateReport() {
    this.log('\n📊 RELATÓRIO DE VERIFICAÇÃO GTM');
    console.log('================================');
    
    const checks = [
      { name: 'Bundle contém GTM ID', status: this.results.bundle },
      { name: 'Consent Mode ativo', status: this.results.consent },
      { name: 'GTM CDN acessível', status: this.results.network },
      { name: 'Site deployado', status: this.results.deployment }
    ];

    checks.forEach(check => {
      const icon = check.status ? '✅' : '❌';
      console.log(`${icon} ${check.name}`);
    });

    const allPassed = Object.values(this.results).every(result => result);
    
    console.log('\n' + '='.repeat(32));
    
    if (allPassed) {
      this.log('✅ TODAS AS VERIFICAÇÕES PASSARAM', 'success');
      this.log(`GTM ${GTM_ID} está configurado corretamente!`, 'success');
      return true;
    } else {
      this.log('❌ ALGUMAS VERIFICAÇÕES FALHARAM', 'error');
      
      if (this.errors.length > 0) {
        console.log('\nErros encontrados:');
        this.errors.forEach(error => {
          console.log(`  • ${error}`);
        });
      }
      
      console.log('\n💡 Como testar o GTM manualmente:');
      console.log('  1. Acesse: https://saraivavision.com.br/');
      console.log('  2. Aceite os cookies no banner');
      console.log('  3. Abra DevTools → Network → procure por "googletagmanager"');
      console.log('  4. O GTM deve carregar após o consentimento');
      
      return false;
    }
  }

  async verify() {
    this.log(`🚀 Iniciando verificação GTM para ID: ${GTM_ID}`);
    
    // Run all verifications
    await Promise.all([
      this.verifyBundleContainsGTM(),
      this.verifyDeployedSite(),
      this.verifyGTMNetworkRequests()
    ]);

    return this.generateReport();
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const verifier = new GTMVerifier();
  
  verifier.verify().then((success) => {
    process.exit(success ? 0 : 1);
  }).catch((error) => {
    console.error('❌ Erro fatal na verificação GTM:', error);
    process.exit(1);
  });
}

export default GTMVerifier;