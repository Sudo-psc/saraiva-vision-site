#!/usr/bin/env node

/**
 * Performance Analyzer for React + Vite Project
 * Identifies performance issues in React components and build configuration
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLORS = {
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  GREEN: '\x1b[32m',
  CYAN: '\x1b[36m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

class PerformanceAnalyzer {
  constructor() {
    this.issues = {
      critical: [],
      warning: [],
      info: []
    };
    this.stats = {
      totalComponents: 0,
      memoizedComponents: 0,
      inlineStyles: 0,
      useEffectIssues: 0,
      largeComponents: 0,
      lazyLoadedRoutes: 0
    };
  }

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    // Check for React.memo
    if (this.isComponent(content)) {
      this.stats.totalComponents++;

      if (!this.hasMemoization(content) && this.shouldBeMemoized(content)) {
        this.issues.warning.push({
          file: filePath,
          issue: 'Component could benefit from React.memo',
          line: this.findComponentDeclaration(content)
        });
      } else if (this.hasMemoization(content)) {
        this.stats.memoizedComponents++;
      }
    }

    // Check for inline styles
    const inlineStyles = this.findInlineStyles(content);
    if (inlineStyles.length > 0) {
      this.stats.inlineStyles += inlineStyles.length;
      inlineStyles.forEach(style => {
        this.issues.critical.push({
          file: filePath,
          issue: `Inline style object created on every render`,
          line: style.line,
          code: style.code
        });
      });
    }

    // Check useEffect issues
    const effectIssues = this.findUseEffectIssues(content);
    if (effectIssues.length > 0) {
      this.stats.useEffectIssues += effectIssues.length;
      effectIssues.forEach(issue => {
        this.issues.warning.push({
          file: filePath,
          issue: issue.message,
          line: issue.line
        });
      });
    }

    // Check for large components
    const lines = content.split('\n').length;
    if (lines > 300) {
      this.stats.largeComponents++;
      this.issues.warning.push({
        file: filePath,
        issue: `Large component (${lines} lines) - consider splitting`,
        lines
      });
    }

    // Check for missing useMemo/useCallback
    const expensiveComputations = this.findExpensiveComputations(content);
    expensiveComputations.forEach(comp => {
      this.issues.warning.push({
        file: filePath,
        issue: `Expensive computation without useMemo`,
        line: comp.line,
        code: comp.code
      });
    });
  }

  isComponent(content) {
    return /function\s+\w+\s*\(.*\)|const\s+\w+\s*=.*=>.*return.*</.test(content) &&
           /import\s+React|from\s+['"]react['"]/.test(content);
  }

  hasMemoization(content) {
    return /React\.memo\(|export\s+default\s+React\.memo/.test(content);
  }

  shouldBeMemoized(content) {
    // Components that likely benefit from memoization
    const hasProps = /function.*\(.*props.*\)|=.*\(.*props.*\)/.test(content);
    const hasComplexRender = content.split('\n').length > 50;
    const hasChildComponents = /<\w+/.test(content);

    return hasProps && (hasComplexRender || hasChildComponents);
  }

  findComponentDeclaration(content) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (/function\s+\w+|const\s+\w+\s*=.*=>/.test(lines[i])) {
        return i + 1;
      }
    }
    return 1;
  }

  findInlineStyles(content) {
    const issues = [];
    const lines = content.split('\n');
    const styleRegex = /style=\{\{[^}]+\}\}/g;

    lines.forEach((line, index) => {
      if (styleRegex.test(line)) {
        // Check if it's not a static style
        if (!/style=\{\{.*\}\}/.test(line) || line.includes('(') || line.includes('?')) {
          issues.push({
            line: index + 1,
            code: line.trim()
          });
        }
      }
    });

    return issues;
  }

  findUseEffectIssues(content) {
    const issues = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Missing dependency array
      if (/useEffect\s*\(\s*\(\s*\)\s*=>\s*{/.test(line) &&
          !lines.slice(index, index + 10).join('\n').includes('],')) {
        issues.push({
          line: index + 1,
          message: 'useEffect might be missing dependency array'
        });
      }

      // Empty dependency array with external variables
      if (/useEffect.*\[\s*\]/.test(line)) {
        const effectBlock = this.extractEffectBlock(lines, index);
        if (this.hasExternalDependencies(effectBlock)) {
          issues.push({
            line: index + 1,
            message: 'useEffect with empty deps but uses external variables'
          });
        }
      }
    });

    return issues;
  }

  extractEffectBlock(lines, startIndex) {
    let block = '';
    let braceCount = 0;
    let started = false;

    for (let i = startIndex; i < Math.min(startIndex + 50, lines.length); i++) {
      const line = lines[i];
      if (line.includes('useEffect')) started = true;
      if (!started) continue;

      block += line + '\n';
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;

      if (braceCount === 0 && started) break;
    }

    return block;
  }

  hasExternalDependencies(block) {
    // Check for common external dependencies
    const patterns = [
      /props\./,
      /state\./,
      /dispatch/,
      /navigate/,
      /location\./,
      /params\./
    ];

    return patterns.some(pattern => pattern.test(block));
  }

  findExpensiveComputations(content) {
    const issues = [];
    const lines = content.split('\n');

    const expensivePatterns = [
      /\.map\(.*\)\.filter\(/,  // Chained array methods
      /\.reduce\(.*\{.*\}/,      // Complex reduce
      /JSON\.parse/,             // JSON parsing
      /new Date/,                // Date creation
      /\.sort\(/,                // Array sorting
      /Object\.entries/,         // Object iteration
    ];

    lines.forEach((line, index) => {
      expensivePatterns.forEach(pattern => {
        if (pattern.test(line) && !line.includes('useMemo') && !line.includes('useCallback')) {
          issues.push({
            line: index + 1,
            code: line.trim()
          });
        }
      });
    });

    return issues;
  }

  analyzeBundleSize() {
    const distPath = path.join(process.cwd(), 'dist', 'assets');

    if (!fs.existsSync(distPath)) {
      console.log(`${COLORS.YELLOW}No dist folder found. Run 'npm run build:vite' first.${COLORS.RESET}`);
      return;
    }

    const files = fs.readdirSync(distPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));

    const bundles = jsFiles.map(file => {
      const stats = fs.statSync(path.join(distPath, file));
      return {
        name: file,
        size: stats.size,
        sizeKB: Math.round(stats.size / 1024)
      };
    }).sort((a, b) => b.size - a.size);

    console.log(`\n${COLORS.CYAN}${COLORS.BOLD}📦 Bundle Size Analysis${COLORS.RESET}`);
    console.log('─'.repeat(60));

    bundles.slice(0, 10).forEach(bundle => {
      const color = bundle.sizeKB > 200 ? COLORS.RED :
                    bundle.sizeKB > 100 ? COLORS.YELLOW :
                    COLORS.GREEN;

      const name = bundle.name.length > 40 ?
                   bundle.name.substring(0, 37) + '...' :
                   bundle.name;

      console.log(`${color}${name.padEnd(40)} ${bundle.sizeKB.toString().padStart(6)}KB${COLORS.RESET}`);
    });

    const totalSize = bundles.reduce((sum, b) => sum + b.size, 0);
    console.log('─'.repeat(60));
    console.log(`Total JS: ${Math.round(totalSize / 1024)}KB (${bundles.length} files)`);

    // Check for oversized bundles
    const oversized = bundles.filter(b => b.sizeKB > 200);
    if (oversized.length > 0) {
      this.issues.critical.push({
        issue: `${oversized.length} bundles exceed 200KB target`,
        files: oversized.map(b => `${b.name} (${b.sizeKB}KB)`)
      });
    }
  }

  printReport() {
    console.log(`\n${COLORS.CYAN}${COLORS.BOLD}🔍 React Performance Analysis Report${COLORS.RESET}`);
    console.log('═'.repeat(60));

    // Statistics
    console.log(`\n${COLORS.BOLD}📊 Statistics${COLORS.RESET}`);
    console.log(`  Total Components: ${this.stats.totalComponents}`);
    console.log(`  Memoized: ${this.stats.memoizedComponents} (${Math.round(this.stats.memoizedComponents / this.stats.totalComponents * 100)}%)`);
    console.log(`  Inline Styles: ${this.stats.inlineStyles}`);
    console.log(`  useEffect Issues: ${this.stats.useEffectIssues}`);
    console.log(`  Large Components: ${this.stats.largeComponents}`);

    // Critical Issues
    if (this.issues.critical.length > 0) {
      console.log(`\n${COLORS.RED}${COLORS.BOLD}🔴 Critical Issues (${this.issues.critical.length})${COLORS.RESET}`);
      this.issues.critical.slice(0, 10).forEach(issue => {
        console.log(`${COLORS.RED}  ⚠️  ${issue.issue}${COLORS.RESET}`);
        if (issue.file) {
          const shortPath = issue.file.replace(process.cwd(), '.');
          console.log(`     ${shortPath}${issue.line ? `:${issue.line}` : ''}`);
        }
        if (issue.code) {
          console.log(`     ${COLORS.CYAN}${issue.code.substring(0, 60)}...${COLORS.RESET}`);
        }
      });
    }

    // Warnings
    if (this.issues.warning.length > 0) {
      console.log(`\n${COLORS.YELLOW}${COLORS.BOLD}🟡 Warnings (${this.issues.warning.length})${COLORS.RESET}`);
      this.issues.warning.slice(0, 10).forEach(issue => {
        console.log(`${COLORS.YELLOW}  ⚠️  ${issue.issue}${COLORS.RESET}`);
        if (issue.file) {
          const shortPath = issue.file.replace(process.cwd(), '.');
          console.log(`     ${shortPath}${issue.line ? `:${issue.line}` : ''}`);
        }
      });
    }

    // Summary
    const totalIssues = this.issues.critical.length + this.issues.warning.length;
    const scoreColor = totalIssues < 10 ? COLORS.GREEN :
                       totalIssues < 30 ? COLORS.YELLOW :
                       COLORS.RED;

    console.log(`\n${COLORS.BOLD}📈 Performance Score${COLORS.RESET}`);
    console.log(`${scoreColor}  Grade: ${this.calculateGrade()} (${totalIssues} total issues)${COLORS.RESET}`);

    // Recommendations
    console.log(`\n${COLORS.BOLD}💡 Top Recommendations${COLORS.RESET}`);
    const recommendations = this.getTopRecommendations();
    recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }

  calculateGrade() {
    const totalIssues = this.issues.critical.length + this.issues.warning.length;
    if (totalIssues < 10) return 'A - Excellent';
    if (totalIssues < 20) return 'B - Good';
    if (totalIssues < 30) return 'C - Average';
    if (totalIssues < 50) return 'D - Needs Improvement';
    return 'F - Critical';
  }

  getTopRecommendations() {
    const recs = [];

    if (this.stats.inlineStyles > 10) {
      recs.push('Extract inline styles to useMemo or CSS classes');
    }

    const memoizationRate = this.stats.memoizedComponents / this.stats.totalComponents;
    if (memoizationRate < 0.3) {
      recs.push('Add React.memo to frequently re-rendered components');
    }

    if (this.stats.useEffectIssues > 5) {
      recs.push('Review useEffect dependencies and add proper cleanup');
    }

    if (this.stats.largeComponents > 3) {
      recs.push('Split large components into smaller, focused ones');
    }

    if (this.issues.critical.length > 0) {
      recs.push('Fix critical performance issues in production components');
    }

    return recs.length > 0 ? recs : ['Keep monitoring performance as the app grows'];
  }

  run() {
    console.log(`${COLORS.CYAN}Starting performance analysis...${COLORS.RESET}\n`);

    // Analyze React components
    const componentFiles = glob.sync('src/**/*.{jsx,js}', {
      ignore: ['**/*.test.*', '**/*.spec.*', '**/node_modules/**']
    });

    componentFiles.forEach(file => {
      try {
        this.analyzeFile(file);
      } catch (error) {
        console.error(`Error analyzing ${file}:`, error.message);
      }
    });

    // Analyze bundle size
    this.analyzeBundleSize();

    // Print report
    this.printReport();
  }
}

// Run the analyzer
const analyzer = new PerformanceAnalyzer();
analyzer.run();