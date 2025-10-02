#!/usr/bin/env node

/**
 * Blog Image Compliance Validator
 * Sistema automatizado de validação CFM/LGPD para imagens do blog
 *
 * Validações implementadas:
 * - Conformidade CFM (padrões médicos)
 * - Otimização técnica (formatos, tamanhos)
 * - Alinhamento editorial
 * - Nomenclatura profissional
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
const VALIDATION_REPORT = path.join(PROJECT_ROOT, 'reports', 'image-compliance-report.json');

// Padrões CFM
const CFM_PATTERNS = {
  // Termos proibidos/não profissionais
  UNPROFESSIONAL_TERMS: [
    'olhinho', 'test-olhinho', 'olhos-pequenos'
  ],

  // Termos que sugerem garantias
  GUARANTEE_TERMS: [
    'cura', 'garantia', 'resultado-garantido', 'definitivo'
  ],

  // Padrões recomendados de nomenclatura
  PROFESSIONAL_NAMING: [
    /^capa-[a-z0-9-]+-\d+w\.(avif|webp|png)$/, // capa-tema-resolucao.formato
    /^[a-z-]+-(exame|procedimento|condicao|tratamento)-\d+w\.(avif|webp|png)$/
  ]
};

// Critérios técnicos
const TECHNICAL_LIMITS = {
  MAX_FILE_SIZE_MB: 2,
  OPTIMAL_FORMATS: ['.avif', '.webp'],
  LEGACY_FORMATS: ['.png', '.jpg', '.jpeg'],
  MIN_DIMENSIONS: { width: 800, height: 600 },
  ASPECT_RATIO: { min: 0.75, max: 1.5 }
};

class BlogImageValidator {
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
    console.log('🏥 Iniciando validação CFM/LGPD de imagens do blog...\n');

    // Garante diretório de reports
    const reportsDir = path.dirname(VALIDATION_REPORT);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Lê posts do blog
    const blogPosts = await this.loadBlogPosts();

    // Valida cada post
    for (const post of blogPosts) {
      await this.validatePostImages(post);
    }

    // Gera relatório final
    this.generateReport();

    // Exit code baseado nos resultados
    const exitCode = this.results.summary.failed > 0 ? 1 : 0;
    process.exit(exitCode);
  }

  /**
   * Carrega posts do blog
   */
  async loadBlogPosts() {
    try {
      // Import dinâmico usando import() nativo
      const fileUrl = `file://${BLOG_POSTS_FILE}`;
      const module = await import(fileUrl);

      if (!module.blogPosts || !Array.isArray(module.blogPosts)) {
        throw new Error('blogPosts not found or not an array');
      }

      console.log(`📋 Carregados ${module.blogPosts.length} posts do blog`);
      return module.blogPosts;
    } catch (error) {
      console.error(`❌ Erro ao carregar posts: ${error.message}`);
      console.error('Tentando método alternativo...');

      // Método fallback: parse manual simples
      try {
        const content = fs.readFileSync(BLOG_POSTS_FILE, 'utf8');

        // Regex para extrair apenas IDs e coverImage
        const postMatches = content.match(/\{\s*id:\s*(\d+),[^}]*coverImage:\s*['"`]([^'"`]+)['"`][^}]*\}/g);

        if (postMatches) {
          const posts = postMatches.map(match => {
            const idMatch = match.match(/id:\s*(\d+)/);
            const coverMatch = match.match(/coverImage:\s*['"`]([^'"`]+)['"`]/);

            return {
              id: parseInt(idMatch[1]),
              coverImage: coverMatch ? coverMatch[1] : null,
              title: `Post ${idMatch[1]}`, // Placeholder
              content: '' // Placeholder
            };
          });

          console.log(`📋 Carregados ${posts.length} posts (fallback simplificado)`);
          return posts;
        }
      } catch (fallbackError) {
        console.error(`❌ Erro no fallback: ${fallbackError.message}`);
      }

      return [];
    }
  }

  /**
   * Valida imagens de um post
   */
  async validatePostImages(post) {
    this.results.summary.total++;

    const issues = [];
    const warnings = [];

    // Verifica se post tem imagem de capa
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

    // Validações técnicas
    const technicalIssues = await this.validateTechnicalQuality(imagePath, post);
    issues.push(...technicalIssues);

    // Validações CFM
    const cfmIssues = this.validateCFMCompliance(imagePath, post);
    issues.push(...cfmIssues);

    // Validações editoriais
    const editorialIssues = this.validateEditorialAlignment(imagePath, post);
    warnings.push(...editorialIssues);

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
      if (warnings.length > 0) {
        this.results.summary.warnings++;
        console.log(`⚠️  Post ${post.id}: ${post.title} - ${warnings.length} avisos`);
      } else {
        console.log(`✅ Post ${post.id}: ${post.title} - Validado`);
      }
    }
  }

  /**
   * Valida qualidade técnica da imagem
   */
  async validateTechnicalQuality(imagePath, post) {
    const issues = [];
    const stats = fs.statSync(imagePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    const ext = path.extname(imagePath).toLowerCase();
    const filename = path.basename(imagePath);

    // Tamanho do arquivo
    if (fileSizeMB > TECHNICAL_LIMITS.MAX_FILE_SIZE_MB) {
      issues.push({
        type: 'LARGE_FILE_SIZE',
        severity: 'MEDIUM',
        message: `Arquivo muito grande: ${fileSizeMB.toFixed(2)}MB (limite: ${TECHNICAL_LIMITS.MAX_FILE_SIZE_MB}MB)`,
        recommendation: 'Comprimir imagem ou converter para AVIF/WebP'
      });
    }

    // Formato do arquivo
    if (TECHNICAL_LIMITS.LEGACY_FORMATS.includes(ext)) {
      issues.push({
        type: 'LEGACY_FORMAT',
        severity: 'LOW',
        message: `Formato legado: ${ext}`,
        recommendation: 'Converter para AVIF ou WebP'
      });
    }

    // Nomenclatura profissional
    const namingIssues = this.validateProfessionalNaming(filename);
    issues.push(...namingIssues);

    return issues;
  }

  /**
   * Valida conformidade CFM
   */
  validateCFMCompliance(imagePath, post) {
    const issues = [];
    const filename = path.basename(imagePath).toLowerCase();
    const title = post.title.toLowerCase();
    const content = post.content.toLowerCase();

    // Termos não profissionais
    for (const term of CFM_PATTERNS.UNPROFESSIONAL_TERMS) {
      if (filename.includes(term)) {
        issues.push({
          type: 'UNPROFESSIONAL_NAMING',
          severity: 'HIGH',
          message: `Nomenclatura não profissional: "${term}"`,
          cfmViolation: true,
          recommendation: 'Renomear com terminologia médica adequada'
        });
      }
    }

    // Termos que sugerem garantias
    for (const term of CFM_PATTERNS.GUARANTEE_TERMS) {
      if (filename.includes(term) || title.includes(term)) {
        issues.push({
          type: 'GUARANTEE_CLAIM',
          severity: 'HIGH',
          message: `Termo sugere garantia: "${term}"`,
          cfmViolation: true,
          recommendation: 'Remover termos que sugiram garantias de resultado'
        });
      }
    }

    // Procedimentos experimentais
    if (title.includes('experimental') || title.includes('pesquisa') ||
        title.includes('terapia gênica') || title.includes('futuro')) {

      // Verifica se tem disclaimer adequado
      if (!content.includes('pesquisa') && !content.includes('estudo') &&
          !content.includes('experimental')) {
        issues.push({
          type: 'EXPERIMENTAL_WITHOUT_DISCLAIMER',
          severity: 'HIGH',
          message: 'Procedimento experimental sem disclaimer adequado',
          cfmViolation: true,
          recommendation: 'Adicionar disclaimer: "Procedimento em fase de pesquisa"'
        });
      }
    }

    return issues;
  }

  /**
   * Valida nomenclatura profissional
   */
  validateProfessionalNaming(filename) {
    const issues = [];

    // Verifica se segue padrão recomendado
    const hasProfessionalPattern = CFM_PATTERNS.PROFESSIONAL_NAMING.some(pattern =>
      pattern.test(filename)
    );

    if (!hasProfessionalPattern) {
      issues.push({
        type: 'NAMING_PATTERN',
        severity: 'LOW',
        message: `Nomenclatura não segue padrão profissional: ${filename}`,
        recommendation: 'Usar padrão: capa-{tema}-{resolucao}.formato'
      });
    }

    // Screenshots não profissionais
    if (filename.includes('screenshot') || filename.includes('raycast') ||
        filename.includes('perplexity') || filename.includes('chatgpt')) {
      issues.push({
        type: 'SCREENSHOT_NAMING',
        severity: 'MEDIUM',
        message: `Nome de screenshot não profissional: ${filename}`,
        recommendation: 'Renomear para nomenclatura médica adequada'
      });
    }

    return issues;
  }

  /**
   * Valida alinhamento editorial
   */
  validateEditorialAlignment(imagePath, post) {
    const warnings = [];
    const filename = path.basename(imagePath).toLowerCase();
    const title = post.title.toLowerCase();
    const content = post.content.toLowerCase();

    // Mapeamento temático básico
    const thematicKeywords = {
      'catarata': ['catarata'],
      'glaucoma': ['glaucoma'],
      'retina': ['retina', 'descolamento', 'retinose'],
      'olho seco': ['olho seco', 'drye'],
      'estrabismo': ['estrabismo'],
      'pterígio': ['pterigio'],
      'daltonismo': ['daltonismo'],
      'presbiopia': ['presbiopia'],
      'fotofobia': ['fotofobia'],
      'terapia genética': ['terapia gênica', 'genetica'],
      'doença de coats': ['coats']
    };

    // Verifica alinhamento temático básico
    let thematicAlignment = false;
    for (const [theme, keywords] of Object.entries(thematicKeywords)) {
      const titleHasTheme = keywords.some(keyword => title.includes(keyword));
      const imageHasTheme = keywords.some(keyword => filename.includes(keyword));

      if (titleHasTheme && !imageHasTheme) {
        warnings.push({
          type: 'THEMATIC_MISALIGNMENT',
          message: `Título menciona "${theme}" mas imagem não reflete o tema`,
          recommendation: `Considerar imagem mais específica para ${theme}`
        });
        break;
      }

      if (titleHasTheme && imageHasTheme) {
        thematicAlignment = true;
        break;
      }
    }

    return warnings;
  }

  /**
   * Gera relatório final
   */
  generateReport() {
    const report = {
      ...this.results,
      summaryStats: {
        cfmViolations: this.results.issues.filter(i =>
          i.issues.some(issue => issue.cfmViolation)
        ).length,
        technicalIssues: this.results.issues.filter(i =>
          i.issues.some(issue => ['LARGE_FILE_SIZE', 'LEGACY_FORMAT'].includes(issue.type))
        ).length,
        namingIssues: this.results.issues.filter(i =>
          i.issues.some(issue => ['UNPROFESSIONAL_NAMING', 'NAMING_PATTERN'].includes(issue.type))
        ).length
      },
      generatedAt: new Date().toISOString()
    };

    // Salva relatório
    fs.writeFileSync(VALIDATION_REPORT, JSON.stringify(report, null, 2));

    // Console output
    console.log('\n' + '='.repeat(80));
    console.log('🏥 RELATÓRIO DE VALIDAÇÃO CFM/LGPD - BLOG SARAIVA VISION');
    console.log('='.repeat(80));
    console.log(`📊 Estatísticas:`);
    console.log(`   Total analisado: ${this.results.summary.total}`);
    console.log(`   ✅ Aprovados: ${this.results.summary.passed}`);
    console.log(`   ❌ Falharam: ${this.results.summary.failed}`);
    console.log(`   ⚠️  Avisos: ${this.results.summary.warnings}`);
    console.log(`   🚨 Violações CFM: ${report.summaryStats.cfmViolations}`);
    console.log(`   🔧 Problemas técnicos: ${report.summaryStats.technicalIssues}`);
    console.log(`   📝 Problemas nomenclatura: ${report.summaryStats.namingIssues}`);

    if (this.results.issues.length > 0) {
      console.log('\n❌ ISSUES CRÍTICOS ENCONTRADOS:');
      this.results.issues.forEach(item => {
        console.log(`\n📄 Post ID ${item.postId}: ${item.title}`);
        item.issues.forEach(issue => {
          const icon = issue.cfmViolation ? '🚨' : '⚠️';
          console.log(`   ${icon} ${issue.message} (${issue.severity})`);
          if (issue.recommendation) {
            console.log(`      💡 ${issue.recommendation}`);
          }
        });
      });
    }

    console.log(`\n📋 Relatório completo salvo em: ${VALIDATION_REPORT}`);
    console.log('='.repeat(80));
  }
}

// Executa validação
const validator = new BlogImageValidator();
validator.validateAll().catch(console.error);