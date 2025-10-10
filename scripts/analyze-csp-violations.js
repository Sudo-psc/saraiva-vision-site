#!/usr/bin/env node

/**
 * CSP Violations Analyzer
 * Analyzes CSP violation logs and generates reports
 *
 * Usage:
 *   node scripts/analyze-csp-violations.js [--days=7] [--json]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  days: 7,
  json: false
};

args.forEach(arg => {
  if (arg.startsWith('--days=')) {
    options.days = parseInt(arg.split('=')[1]);
  } else if (arg === '--json') {
    options.json = true;
  }
});

const logFilePath = path.join(__dirname, '../api/logs/csp-violations.log');

/**
 * Analyze CSP violations from log file
 */
async function analyzeViolations() {
  if (!fs.existsSync(logFilePath)) {
    console.error('❌ No CSP violations log file found at:', logFilePath);
    console.log('\n💡 Violations will be logged once CSP is active and reports are received.');
    process.exit(0);
  }

  const violations = {
    total: 0,
    byDirective: {},
    byBlockedURL: {},
    byPage: {},
    bySourceFile: {},
    byType: {
      'reporting-api': 0,
      'csp-level-2': 0
    },
    timeline: {}
  };

  // Read log file
  const content = fs.readFileSync(logFilePath, 'utf8');
  const lines = content.trim().split('\n').filter(line => line.length > 0);

  // Cutoff date
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - options.days);

  lines.forEach(line => {
    try {
      const entry = JSON.parse(line);
      const reportDate = new Date(entry.timestamp);

      // Skip old reports
      if (reportDate < cutoffDate) {
        return;
      }

      violations.total++;

      // Track report type
      if (entry.type) {
        violations.byType[entry.type] = (violations.byType[entry.type] || 0) + 1;
      }

      // Extract violation details
      const violation = entry.violation;
      if (!violation) return;

      // Group by directive
      const directive = violation.effectiveDirective || 'unknown';
      violations.byDirective[directive] = (violations.byDirective[directive] || 0) + 1;

      // Group by blocked URL
      const blockedURL = violation.blockedURL || violation.blockedUri || 'inline';
      violations.byBlockedURL[blockedURL] = (violations.byBlockedURL[blockedURL] || 0) + 1;

      // Group by page
      const page = violation.documentURL || 'unknown';
      violations.byPage[page] = (violations.byPage[page] || 0) + 1;

      // Group by source file
      const sourceFile = violation.sourceFile || 'unknown';
      violations.bySourceFile[sourceFile] = (violations.bySourceFile[sourceFile] || 0) + 1;

      // Timeline (by day)
      const day = reportDate.toISOString().split('T')[0];
      violations.timeline[day] = (violations.timeline[day] || 0) + 1;

    } catch (err) {
      console.error('Error parsing line:', err.message);
    }
  });

  return violations;
}

/**
 * Print analysis results
 */
function printResults(violations) {
  if (options.json) {
    console.log(JSON.stringify(violations, null, 2));
    return;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CSP Violations Analysis Report');
  console.log(`📅 Last ${options.days} days`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`🔢 Total Violations: ${violations.total}\n`);

  if (violations.total === 0) {
    console.log('✅ No violations found in the specified period!\n');
    return;
  }

  // Report types
  console.log('📋 Report Types:');
  Object.entries(violations.byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const percentage = ((count / violations.total) * 100).toFixed(1);
      console.log(`  ${type}: ${count} (${percentage}%)`);
    });

  // By directive
  console.log('\n🛡️  Violations by Directive:');
  Object.entries(violations.byDirective)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([directive, count], index) => {
      const percentage = ((count / violations.total) * 100).toFixed(1);
      const bar = '█'.repeat(Math.ceil(percentage / 2));
      console.log(`  ${index + 1}. ${directive}`);
      console.log(`     ${bar} ${count} (${percentage}%)`);
    });

  // By blocked URL
  console.log('\n🚫 Top 10 Blocked URLs:');
  Object.entries(violations.byBlockedURL)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([url, count], index) => {
      const percentage = ((count / violations.total) * 100).toFixed(1);
      const displayURL = url.length > 60 ? url.substring(0, 57) + '...' : url;
      console.log(`  ${index + 1}. ${displayURL}`);
      console.log(`     Count: ${count} (${percentage}%)`);
    });

  // By page
  console.log('\n📄 Top 10 Affected Pages:');
  Object.entries(violations.byPage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([page, count], index) => {
      const percentage = ((count / violations.total) * 100).toFixed(1);
      const displayPage = page.length > 60 ? page.substring(0, 57) + '...' : page;
      console.log(`  ${index + 1}. ${displayPage}`);
      console.log(`     Count: ${count} (${percentage}%)`);
    });

  // Timeline
  console.log('\n📈 Timeline (Daily):');
  Object.entries(violations.timeline)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([day, count]) => {
      const bar = '█'.repeat(Math.ceil((count / Math.max(...Object.values(violations.timeline))) * 50));
      console.log(`  ${day}: ${bar} ${count}`);
    });

  // Recommendations
  console.log('\n💡 Recommendations:\n');

  // Check for common issues
  const hasStyleSrcViolations = Object.keys(violations.byDirective).some(d => d.includes('style-src'));
  const hasScriptSrcViolations = Object.keys(violations.byDirective).some(d => d.includes('script-src'));
  const hasUnsafeInline = Object.keys(violations.byBlockedURL).some(url => url === 'inline');

  if (hasStyleSrcViolations) {
    console.log('  🎨 style-src violations detected:');
    console.log('     → Check if all external stylesheets are whitelisted');
    console.log('     → Consider using nonce for inline styles\n');
  }

  if (hasScriptSrcViolations) {
    console.log('  📜 script-src violations detected:');
    console.log('     → Verify all external scripts are whitelisted');
    console.log('     → Consider migrating to nonce-based CSP\n');
  }

  if (hasUnsafeInline) {
    console.log('  ⚠️  Inline script/style violations:');
    console.log('     → Use nonce or hash for inline content');
    console.log('     → Avoid \'unsafe-inline\' in production\n');
  }

  // Top blocked domains
  const blockedDomains = {};
  Object.keys(violations.byBlockedURL).forEach(url => {
    try {
      if (url !== 'inline' && url !== 'eval' && url.startsWith('http')) {
        const domain = new URL(url).hostname;
        blockedDomains[domain] = (blockedDomains[domain] || 0) + violations.byBlockedURL[url];
      }
    } catch (err) {
      // Invalid URL, skip
    }
  });

  if (Object.keys(blockedDomains).length > 0) {
    console.log('  🌐 Top blocked domains to consider whitelisting:');
    Object.entries(blockedDomains)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([domain, count]) => {
        console.log(`     → ${domain} (${count} violations)`);
      });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Main execution
try {
  const violations = await analyzeViolations();
  printResults(violations);
} catch (error) {
  console.error('❌ Error analyzing violations:', error);
  process.exit(1);
}
