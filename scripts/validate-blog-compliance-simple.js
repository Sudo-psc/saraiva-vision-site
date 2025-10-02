#!/usr/bin/env node

/**
 * Blog Image Compliance Validator - Simplified Version
 * Validação simplificada para imagens do blog Saraiva Vision
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const PROJECT_ROOT = path.resolve(__dirname, '..');
const BLOG_IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'Blog');
const BLOG_POSTS_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'blogPosts.js');

class SimpleBlogValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
      issues: [],
      recommendations: []
    };
  }

  /**
   * Executa validação completa
   */
  async validateAll() {
    console.log('🏥 Iniciando validação simplificada CFM/LGPD...\n');

    // Garante diretório de reports
    const reportsDir = path.join(PROJECT_ROOT, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Lê posts usando método robusto
    const posts = await this.loadBlogPostsRobust();

    // Valida cada post
    for (const post of posts) {
      this.validatePost(post);
    }

    // Gera relatório
    this.generateReport();

    // Exit code
    const exitCode = this.results.summary.failed > 0 ? 1 : 0;
    process.exit(exitCode);
  }

  /**
   * Carrega posts com método robusto
   */
  async loadBlogPostsRobust() {
    try {
      // Lê conteúdo bruto
      const content = fs.readFileSync(BLOG_POSTS_FILE, 'utf8');

      // Regex para encontrar objetos de post com image
      const postRegex = /\{\s*id:\s*(\d+),[^}]*image:\s*['"`]([^'"`]+)['"`][^}]*\}/g;

      const posts = [];
      let match;

      while ((match = postRegex.exec(content)) !== null) {
        const id = parseInt(match[1]);
        const image = match[2];

        // Tenta extrair título para o mesmo ID
        const titleRegexForId = new RegExp(`\\{\\s*id:\\s*${id}[^}]*title:\\s*['\\"]([^'\\"]+)['\\"]`);
        const titleMatch = content.match(titleRegexForId);
        const title = titleMatch ? titleMatch[1] : `Post ${id}`;

        posts.push({
          id,
          coverImage: image, // Mapeia para coverImage para compatibilidade
          title,
          content: ''
        });
      }

      console.log(`📋 Carregados ${posts.length} posts (método robusto)`);
      return posts;
    } catch (error) {
      console.error(`❌ Erro ao carregar posts: ${error.message}`);
      return [];
    }
  }

  /**
   * Valida um post
   */
  validatePost(post) {
    this.results.summary.total++;

    const issues = [];
    const warnings = [];

    if (!post.coverImage) {
      issues.push({
        type: 'MISSING_COVER_IMAGE',
        severity: 'HIGH',
        message: `Post ID ${post.id} não possui imagem de capa`
      });
      this.results.summary.failed++;
      return;
    }

    const imagePath = path.join(BLOG_IMAGES_DIR, path.basename(post.coverImage));

    // Verifica se arquivo existe
    if (!fs.existsSync(imagePath)) {
      issues.push({
        type: 'MISSING_FILE',
        severity: 'HIGH',
        message: `Imagem não encontrada: ${post.coverImage}`,
        postId: post.id
      });
      this.results.summary.failed++;
      return;
    }

    // Validações básicas
    const stats = fs.statSync(imagePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    const ext = path.extname(imagePath).toLowerCase();
    const filename = path.basename(imagePath).toLowerCase();

    // Tamanho do arquivo
    if (fileSizeMB > 2) {
      issues.push({
        type: 'LARGE_FILE_SIZE',
        severity: 'MEDIUM',
        message: `Arquivo grande: ${fileSizeMB.toFixed(2)}MB`,
        recommendation: 'Comprimir ou converter para AVIF'
      });
    }

    // Formato legado
    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      issues.push({
        type: 'LEGACY_FORMAT',
        severity: 'LOW',
        message: `Formato legado: ${ext}`,
        recommendation: 'Converter para AVIF/WebP'
      });
    }

    // Validações CFM
    const cfmIssues = this.validateCFMRules(filename, post.title);
    issues.push(...cfmIssues);

    // Consolidado
    if (issues.length > 0) {
      this.results.summary.failed++;
      this.results.issues.push({
        postId: post.id,
        title: post.title,
        coverImage: post.coverImage,
        issues: issues,
        warnings: warnings
      });
    } else {
      this.results.summary.passed++;
      console.log(`✅ Post ${post.id}: ${post.title}`);
    }
  }

  /**
   * Valida regras CFM
   */
  validateCFMRules(filename, title) {
    const issues = [];

    // Termos não profissionais
    const unprofessionalTerms = ['olhinho', 'test-olhinho'];
    for (const term of unprofessionalTerms) {
      if (filename.includes(term)) {
        issues.push({
          type: 'UNPROFESSIONAL_NAMING',
          severity: 'HIGH',
          message: `Nomenclatura não profissional: "${term}"`,
          cfmViolation: true
        });
      }
    }

    // Screenshots
    if (filename.includes('screenshot') || filename.includes('raycast') ||
        filename.includes('perplexity') || filename.includes('chatgpt')) {
      issues.push({
        type: 'SCREENSHOT_NAMING',
        severity: 'MEDIUM',
        message: `Nome de screenshot não profissional`
      });
    }

    return issues;
  }

  /**
   * Gera relatório final
   */
  generateReport() {
    const reportPath = path.join(PROJECT_ROOT, 'reports', 'image-compliance-report.json');

    const report = {
      ...this.results,
      summaryStats: {
        cfmViolations: this.results.issues.filter(i =>
          i.issues.some(issue => issue.cfmViolation)
        ).length,
        technicalIssues: this.results.issues.filter(i =>
          i.issues.some(issue => ['LARGE_FILE_SIZE', 'LEGACY_FORMAT'].includes(issue.type))
        ).length
      },
      generatedAt: new Date().toISOString()
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Console output
    console.log('\n' + '='.repeat(80));
    console.log('🏥 RELATÓRIO DE VALIDAÇÃO CFM/LGPD - BLOG SARAIVA VISION');
    console.log('='.repeat(80));
    console.log(`📊 Estatísticas:`);
    console.log(`   Total analisado: ${this.results.summary.total}`);
    console.log(`   ✅ Aprovados: ${this.results.summary.passed}`);
    console.log(`   ❌ Falharam: ${this.results.summary.failed}`);
    console.log(`   🚨 Violações CFM: ${report.summaryStats.cfmViolations}`);
    console.log(`   🔧 Problemas técnicos: ${report.summaryStats.technicalIssues}`);

    if (this.results.issues.length > 0) {
      console.log('\n❌ ISSUES ENCONTRADOS:');
      this.results.issues.forEach(item => {
        console.log(`\n📄 Post ID ${item.postId}: ${item.title}`);
        item.issues.forEach(issue => {
          const icon = issue.cfmViolation ? '🚨' : '⚠️';
          console.log(`   ${icon} ${issue.message} (${issue.severity})`);
        });
      });
    }

    console.log(`\n📋 Relatório completo: ${reportPath}`);
    console.log('='.repeat(80));
  }
}

// Executa validação
const validator = new SimpleBlogValidator();
validator.validateAll().catch(console.error);