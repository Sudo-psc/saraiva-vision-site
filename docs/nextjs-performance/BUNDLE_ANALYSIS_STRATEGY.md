# Bundle Analysis Strategy - Multi-Profile Next.js Application

**Versão**: 1.0.0 | **Data**: Outubro 2025 | **Status**: Planejamento

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Bundle Analysis Tools](#bundle-analysis-tools)
3. [Automated Bundle Analysis](#automated-bundle-analysis)
4. [Profile-Specific Analysis](#profile-specific-analysis)
5. [Tree-Shaking Optimization](#tree-shaking-optimization)
6. [Code Splitting Strategies](#code-splitting-strategies)
7. [Bundle Budget Enforcement](#bundle-budget-enforcement)
8. [Continuous Monitoring](#continuous-monitoring)

---

## 🎯 Visão Geral

Esta estratégia detalha como analisar, otimizar e monitorar o tamanho dos bundles JavaScript para cada perfil de usuário, garantindo que os targets de performance sejam alcançados:

- **Familiar**: < 180KB (gzipped)
- **Jovem**: < 195KB (gzipped)
- **Sênior**: < 165KB (gzipped)

### Metas de Análise

1. **Identificar código não utilizado** em cada perfil
2. **Otimizar tree-shaking** para bibliotecas como Radix UI e Lucide React
3. **Eliminar duplicação** entre chunks
4. **Validar code splitting** está funcionando corretamente
5. **Monitorar tamanho** de bundles em CI/CD

---

## 🛠 Bundle Analysis Tools

### 1. @next/bundle-analyzer

```bash
# Install
npm install --save-dev @next/bundle-analyzer

# Add to package.json
"analyze": "ANALYZE=true next build",
"analyze:familiar": "PROFILE=familiar ANALYZE=true next build",
"analyze:jovem": "PROFILE=jovem ANALYZE=true next build",
"analyze:senior": "PROFILE=senior ANALYZE=true next build"
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
});

module.exports = withBundleAnalyzer({
  // ... existing Next.js config
});
```

### 2. Webpack Bundle Analyzer

```javascript
// scripts/analyze-bundles.js

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const path = require('path');

module.exports = function withDetailedBundleAnalyzer(nextConfig = {}) {
  return {
    ...nextConfig,
    webpack(config, options) {
      if (process.env.ANALYZE === 'true') {
        const profile = process.env.PROFILE || 'all';

        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: options.isServer
              ? path.join(__dirname, `../analyze/server-${profile}.html`)
              : path.join(__dirname, `../analyze/client-${profile}.html`),
            openAnalyzer: false,
            generateStatsFile: true,
            statsFilename: options.isServer
              ? path.join(__dirname, `../analyze/server-stats-${profile}.json`)
              : path.join(__dirname, `../analyze/client-stats-${profile}.json`),
            statsOptions: {
              source: false,
              reasons: true,
              modules: true,
              chunks: true,
              chunkModules: true,
              chunkOrigins: true,
              depth: true,
              usedExports: true,
              providedExports: true,
              optimizationBailout: true,
            },
          })
        );
      }

      return typeof nextConfig.webpack === 'function'
        ? nextConfig.webpack(config, options)
        : config;
    },
  };
};
```

### 3. size-limit

```bash
# Install
npm install --save-dev @size-limit/preset-app

# Add to package.json
"size": "size-limit",
"size:why": "size-limit --why"
```

```javascript
// .size-limit.js

module.exports = [
  {
    name: 'Familiar Profile - First Load',
    path: '.next/static/chunks/pages/index-*.js',
    limit: '180 KB',
    gzip: true,
    running: false,
  },
  {
    name: 'Jovem Profile - First Load',
    path: '.next/static/chunks/pages/index-jovem-*.js',
    limit: '195 KB',
    gzip: true,
    running: false,
  },
  {
    name: 'Sênior Profile - First Load',
    path: '.next/static/chunks/pages/index-senior-*.js',
    limit: '165 KB',
    gzip: true,
    running: false,
  },
  {
    name: 'React Core (shared)',
    path: '.next/static/chunks/framework-*.js',
    limit: '45 KB',
    gzip: true,
  },
  {
    name: 'Radix UI Bundle',
    path: '.next/static/chunks/radix-*.js',
    limit: '25 KB',
    gzip: true,
  },
];
```

### 4. bundle-buddy

```bash
# Install globally
npm install -g bundle-buddy

# Generate source maps
GENERATE_SOURCEMAP=true npm run build

# Analyze with bundle-buddy
bundle-buddy .next/static/**/*.js.map
```

---

## 🤖 Automated Bundle Analysis

### CI/CD Pipeline Integration

```yaml
# .github/workflows/bundle-analysis.yml

name: Bundle Size Analysis

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  analyze-bundles:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        profile: [familiar, jovem, senior]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build with analysis
        run: npm run analyze:${{ matrix.profile }}
        env:
          PROFILE: ${{ matrix.profile }}
          ANALYZE: true

      - name: Upload bundle analysis
        uses: actions/upload-artifact@v3
        with:
          name: bundle-analysis-${{ matrix.profile }}
          path: analyze/

      - name: Check bundle size
        run: npm run size
        continue-on-error: true

      - name: Compare with base branch
        uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          skip_step: install

      - name: Comment PR with bundle size
        uses: actions/github-script@v6
        if: github.event_name == 'pull_request'
        with:
          script: |
            const fs = require('fs');
            const statsPath = `./analyze/client-stats-${{ matrix.profile }}.json`;

            if (!fs.existsSync(statsPath)) {
              console.log('Stats file not found');
              return;
            }

            const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
            const { assets } = stats;

            // Calculate total size
            const totalSize = assets.reduce((sum, asset) => {
              if (asset.name.endsWith('.js')) {
                return sum + asset.size;
              }
              return sum;
            }, 0);

            const totalSizeKB = (totalSize / 1024).toFixed(2);
            const gzipEstimate = (totalSize * 0.35 / 1024).toFixed(2);

            const limits = {
              familiar: 180,
              jovem: 195,
              senior: 165
            };

            const limit = limits['${{ matrix.profile }}'];
            const status = parseFloat(gzipEstimate) <= limit ? '✅ PASS' : '❌ FAIL';

            const comment = `
            ## Bundle Size Report: ${{ matrix.profile }} Profile

            ${status}

            **Total JS Size**: ${totalSizeKB} KB (uncompressed)
            **Estimated Gzipped**: ${gzipEstimate} KB
            **Limit**: ${limit} KB

            ### Top 5 Largest Chunks:
            ${assets
              .filter(a => a.name.endsWith('.js'))
              .sort((a, b) => b.size - a.size)
              .slice(0, 5)
              .map(a => `- \`${a.name}\`: ${(a.size / 1024).toFixed(2)} KB`)
              .join('\n')}

            [View detailed analysis](https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }})
            `;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### Build-Time Analysis Script

```javascript
// scripts/analyze-build.js

const fs = require('fs');
const path = require('path');
const gzipSize = require('gzip-size');
const chalk = require('chalk');

async function analyzeBuild(profile) {
  console.log(chalk.blue(`\n🔍 Analyzing ${profile} profile bundle...\n`));

  const buildDir = path.join(__dirname, '../.next');
  const statsPath = path.join(__dirname, `../analyze/client-stats-${profile}.json`);

  if (!fs.existsSync(statsPath)) {
    console.error(chalk.red(`Stats file not found: ${statsPath}`));
    process.exit(1);
  }

  const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
  const { assets, chunks } = stats;

  // Analyze JavaScript files
  const jsAssets = assets.filter(a => a.name.endsWith('.js'));
  const totalSize = jsAssets.reduce((sum, a) => sum + a.size, 0);

  // Calculate gzip sizes
  const gzipSizes = {};
  for (const asset of jsAssets) {
    const filePath = path.join(buildDir, 'static', asset.name);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      gzipSizes[asset.name] = await gzipSize(content);
    }
  }

  const totalGzipSize = Object.values(gzipSizes).reduce((sum, size) => sum + size, 0);

  // Bundle size targets
  const limits = {
    familiar: 180 * 1024,
    jovem: 195 * 1024,
    senior: 165 * 1024,
  };

  const limit = limits[profile];
  const withinLimit = totalGzipSize <= limit;

  // Display results
  console.log(chalk.bold('Bundle Analysis Results:'));
  console.log('─'.repeat(80));
  console.log(`Total JS Size:        ${formatBytes(totalSize)}`);
  console.log(`Total Gzipped Size:   ${formatBytes(totalGzipSize)}`);
  console.log(`Target Limit:         ${formatBytes(limit)}`);
  console.log(`Status:               ${withinLimit ? chalk.green('✅ PASS') : chalk.red('❌ FAIL')}`);
  console.log(`Compression Ratio:    ${((totalGzipSize / totalSize) * 100).toFixed(1)}%`);
  console.log('─'.repeat(80));

  // Top chunks by size
  console.log(chalk.bold('\nTop 10 Largest Chunks (Gzipped):'));
  console.log('─'.repeat(80));

  const sortedAssets = jsAssets
    .map(asset => ({
      name: asset.name,
      size: asset.size,
      gzipSize: gzipSizes[asset.name] || 0,
    }))
    .sort((a, b) => b.gzipSize - a.gzipSize)
    .slice(0, 10);

  sortedAssets.forEach((asset, index) => {
    const bar = createBar(asset.gzipSize, totalGzipSize, 30);
    console.log(
      `${index + 1}. ${asset.name.padEnd(40)} ${formatBytes(asset.gzipSize).padStart(10)} ${bar}`
    );
  });

  // Chunk analysis
  console.log(chalk.bold('\n\nChunk Dependencies:'));
  console.log('─'.repeat(80));

  chunks.forEach(chunk => {
    if (chunk.files.some(f => f.endsWith('.js'))) {
      const chunkSize = chunk.files
        .filter(f => f.endsWith('.js'))
        .reduce((sum, file) => {
          const asset = assets.find(a => a.name === file);
          return sum + (asset?.size || 0);
        }, 0);

      console.log(`\n${chalk.cyan(chunk.names.join(', ') || chunk.id)}:`);
      console.log(`  Size: ${formatBytes(chunkSize)}`);
      console.log(`  Modules: ${chunk.modules.length}`);

      // Top module contributors
      const topModules = chunk.modules
        .sort((a, b) => b.size - a.size)
        .slice(0, 3);

      topModules.forEach(mod => {
        console.log(`  - ${mod.name}: ${formatBytes(mod.size)}`);
      });
    }
  });

  // Find duplicate modules
  console.log(chalk.bold('\n\nDuplicate Modules:'));
  console.log('─'.repeat(80));

  const moduleOccurrences = new Map();
  chunks.forEach(chunk => {
    chunk.modules.forEach(mod => {
      if (!moduleOccurrences.has(mod.name)) {
        moduleOccurrences.set(mod.name, []);
      }
      moduleOccurrences.get(mod.name).push(chunk.names.join(',') || chunk.id);
    });
  });

  const duplicates = Array.from(moduleOccurrences.entries())
    .filter(([_, occurrences]) => occurrences.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10);

  if (duplicates.length > 0) {
    duplicates.forEach(([moduleName, chunks]) => {
      console.log(`\n${chalk.yellow('⚠')} ${moduleName}`);
      console.log(`  Found in ${chunks.length} chunks: ${chunks.join(', ')}`);
    });
  } else {
    console.log(chalk.green('No duplicates found! ✅'));
  }

  // Save report
  const report = {
    profile,
    timestamp: new Date().toISOString(),
    totalSize,
    totalGzipSize,
    limit,
    withinLimit,
    assets: sortedAssets,
    duplicates: duplicates.map(([name, chunks]) => ({ name, chunks })),
  };

  const reportPath = path.join(__dirname, `../analyze/report-${profile}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(chalk.bold(`\n\n📄 Report saved to: ${reportPath}\n`));

  // Exit with error if over limit
  if (!withinLimit) {
    console.error(chalk.red(`\n❌ Bundle size exceeds limit for ${profile} profile!`));
    process.exit(1);
  }
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function createBar(value, total, width) {
  const percentage = (value / total) * 100;
  const filledWidth = Math.round((percentage / 100) * width);
  const emptyWidth = width - filledWidth;
  return chalk.green('█'.repeat(filledWidth)) + chalk.gray('░'.repeat(emptyWidth));
}

// Run analysis
const profile = process.argv[2] || 'familiar';
analyzeBuild(profile).catch(console.error);
```

---

## 📊 Profile-Specific Analysis

### Familiar Profile Analysis

```javascript
// scripts/analyze-familiar.js

const { analyzeBuild } = require('./analyze-build');

async function analyzeFamiliar() {
  console.log('Analyzing Familiar Profile...\n');

  const analysis = await analyzeBuild('familiar');

  // Familiar-specific checks
  const checks = [
    {
      name: 'Framer Motion',
      shouldExist: false,
      message: 'Familiar profile should NOT include framer-motion',
    },
    {
      name: 'OpenDyslexic Font',
      shouldExist: false,
      message: 'Familiar profile should NOT include OpenDyslexic font',
    },
    {
      name: 'React Core',
      shouldExist: true,
      maxSize: 45 * 1024, // 45KB gzipped
      message: 'React core bundle within limits',
    },
    {
      name: 'Radix UI',
      shouldExist: true,
      maxSize: 25 * 1024, // 25KB gzipped
      message: 'Radix UI bundle within limits',
    },
  ];

  console.log('\nFamiliar Profile Specific Checks:');
  console.log('─'.repeat(80));

  checks.forEach(check => {
    const found = analysis.assets.some(a => a.name.includes(check.name.toLowerCase()));

    if (check.shouldExist && !found) {
      console.error(`❌ ${check.message} - NOT FOUND`);
    } else if (!check.shouldExist && found) {
      console.error(`❌ ${check.message} - FOUND (should not exist)`);
    } else if (check.maxSize) {
      const asset = analysis.assets.find(a => a.name.includes(check.name.toLowerCase()));
      if (asset && asset.gzipSize > check.maxSize) {
        console.error(`❌ ${check.message} - TOO LARGE (${formatBytes(asset.gzipSize)})`);
      } else {
        console.log(`✅ ${check.message}`);
      }
    } else {
      console.log(`✅ ${check.message}`);
    }
  });
}

analyzeFamiliar();
```

### Jovem Profile Analysis

```javascript
// scripts/analyze-jovem.js

const { analyzeBuild } = require('./analyze-build');

async function analyzeJovem() {
  console.log('Analyzing Jovem Profile...\n');

  const analysis = await analyzeBuild('jovem');

  // Jovem-specific checks
  const checks = [
    {
      name: 'Framer Motion',
      shouldExist: true,
      maxSize: 30 * 1024, // 30KB gzipped max
      message: 'Framer Motion included for animations',
    },
    {
      name: 'Motion Components',
      shouldExist: true,
      message: 'Motion-enhanced components loaded',
    },
    {
      name: 'OpenDyslexic Font',
      shouldExist: false,
      message: 'Jovem profile should NOT include OpenDyslexic font',
    },
    {
      name: 'Prefers-Reduced-Motion Support',
      check: () => {
        // Check if CSS includes prefers-reduced-motion
        return analysis.cssIncludes('@media (prefers-reduced-motion');
      },
      message: 'Prefers-reduced-motion CSS media query included',
    },
  ];

  console.log('\nJovem Profile Specific Checks:');
  console.log('─'.repeat(80));

  checks.forEach(check => {
    if (check.check) {
      const result = check.check();
      console.log(result ? `✅ ${check.message}` : `❌ ${check.message}`);
    } else {
      const found = analysis.assets.some(a => a.name.includes(check.name.toLowerCase()));

      if (check.shouldExist && !found) {
        console.error(`❌ ${check.message} - NOT FOUND`);
      } else if (!check.shouldExist && found) {
        console.error(`❌ ${check.message} - FOUND (should not exist)`);
      } else if (check.maxSize) {
        const asset = analysis.assets.find(a => a.name.includes(check.name.toLowerCase()));
        if (asset && asset.gzipSize > check.maxSize) {
          console.error(`❌ ${check.message} - TOO LARGE (${formatBytes(asset.gzipSize)})`);
        } else {
          console.log(`✅ ${check.message}`);
        }
      } else {
        console.log(`✅ ${check.message}`);
      }
    }
  });
}

analyzeJovem();
```

### Sênior Profile Analysis

```javascript
// scripts/analyze-senior.js

const { analyzeBuild } = require('./analyze-build');

async function analyzeSenior() {
  console.log('Analyzing Sênior Profile...\n');

  const analysis = await analyzeBuild('senior');

  // Sênior-specific checks
  const checks = [
    {
      name: 'Framer Motion',
      shouldExist: false,
      message: 'Sênior profile should NOT include framer-motion (no animations)',
    },
    {
      name: 'OpenDyslexic Font',
      shouldExist: true,
      maxSize: 20 * 1024, // 20KB max for font file
      message: 'OpenDyslexic font included',
    },
    {
      name: 'Accessibility Libraries',
      shouldExist: true,
      message: 'Enhanced accessibility features included',
    },
    {
      name: 'High Contrast Styles',
      check: () => {
        return analysis.cssIncludes('[data-high-contrast="true"]');
      },
      message: 'High contrast mode styles included',
    },
    {
      name: 'No Heavy Assets',
      check: () => {
        // Ensure no single chunk exceeds 50KB
        return !analysis.assets.some(a => a.gzipSize > 50 * 1024);
      },
      message: 'All chunks under 50KB (lightweight profile)',
    },
  ];

  console.log('\nSênior Profile Specific Checks:');
  console.log('─'.repeat(80));

  checks.forEach(check => {
    if (check.check) {
      const result = check.check();
      console.log(result ? `✅ ${check.message}` : `❌ ${check.message}`);
    } else {
      const found = analysis.assets.some(a => a.name.includes(check.name.toLowerCase()));

      if (check.shouldExist && !found) {
        console.error(`❌ ${check.message} - NOT FOUND`);
      } else if (!check.shouldExist && found) {
        console.error(`❌ ${check.message} - FOUND (should not exist)`);
      } else if (check.maxSize) {
        const asset = analysis.assets.find(a => a.name.includes(check.name.toLowerCase()));
        if (asset && asset.gzipSize > check.maxSize) {
          console.error(`❌ ${check.message} - TOO LARGE (${formatBytes(asset.gzipSize)})`);
        } else {
          console.log(`✅ ${check.message}`);
        }
      } else {
        console.log(`✅ ${check.message}`);
      }
    }
  });
}

analyzeSenior();
```

---

## 🌲 Tree-Shaking Optimization

### Optimizing Lucide React Icons

```typescript
// ❌ BAD: Imports entire library
import { Heart, Star, Eye } from 'lucide-react';

// ✅ GOOD: Direct imports (tree-shakeable)
import Heart from 'lucide-react/dist/esm/icons/heart';
import Star from 'lucide-react/dist/esm/icons/star';
import Eye from 'lucide-react/dist/esm/icons/eye';

// Even better: Create icon barrel file
// src/lib/icons.ts
export { default as HeartIcon } from 'lucide-react/dist/esm/icons/heart';
export { default as StarIcon } from 'lucide-react/dist/esm/icons/star';
export { default as EyeIcon } from 'lucide-react/dist/esm/icons/eye';

// Usage
import { HeartIcon } from '@/lib/icons';
```

### Optimizing Radix UI

```typescript
// ❌ BAD: Barrel imports may include unused code
import * as Dialog from '@radix-ui/react-dialog';

// ✅ GOOD: Named imports only what you need
import {
  Root as DialogRoot,
  Trigger as DialogTrigger,
  Content as DialogContent,
  Close as DialogClose,
} from '@radix-ui/react-dialog';
```

### Webpack Side Effects Configuration

```javascript
// next.config.js

module.exports = {
  webpack: (config) => {
    // Mark packages as side-effect free for better tree-shaking
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/(lucide-react|@radix-ui)/,
      sideEffects: false,
    });

    return config;
  },
};
```

---

## ✂️ Code Splitting Strategies

### Route-Based Code Splitting

```typescript
// Automatic with Next.js App Router
src/app/
├── page.tsx          → Chunk: index
├── servicos/
│   └── page.tsx      → Chunk: servicos
└── blog/
    ├── page.tsx      → Chunk: blog
    └── [slug]/
        └── page.tsx  → Chunk: blog-[slug]
```

### Component-Based Code Splitting

```typescript
// src/components/lazy/index.ts

import dynamic from 'next/dynamic';

export const GoogleReviews = dynamic(
  () => import('../GoogleReviews'),
  {
    loading: () => <div className="skeleton-reviews" />,
    ssr: false, // Client-side only
  }
);

export const BlogLatest = dynamic(
  () => import('../BlogLatest'),
  {
    loading: () => <div className="skeleton-blog" />,
  }
);

export const PodcastPlayer = dynamic(
  () => import('../PodcastPlayer'),
  {
    loading: () => <div className="skeleton-player" />,
    ssr: false,
  }
);
```

### Profile-Specific Splitting

```typescript
// src/app/layout.tsx

import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';

// Lazy load profile-specific assets
const loadProfileAssets = (profile: UserProfile) => {
  switch (profile) {
    case 'jovem':
      return {
        MotionProvider: dynamic(() => import('@/providers/MotionProvider')),
        GlassmorphismStyles: dynamic(() => import('@/styles/glassmorphism')),
      };
    case 'senior':
      return {
        HighContrastProvider: dynamic(() => import('@/providers/HighContrastProvider')),
        OpenDyslexicFont: dynamic(() => import('@/fonts/OpenDyslexic')),
      };
    default:
      return {};
  }
};

export default async function RootLayout({ children }: Props) {
  const profile = getProfileFromCookies();
  const ProfileAssets = loadProfileAssets(profile);

  return (
    <html lang="pt-BR">
      <body>
        {ProfileAssets.MotionProvider && (
          <ProfileAssets.MotionProvider>{children}</ProfileAssets.MotionProvider>
        )}
        {ProfileAssets.HighContrastProvider && (
          <ProfileAssets.HighContrastProvider>{children}</ProfileAssets.HighContrastProvider>
        )}
        {!ProfileAssets.MotionProvider && !ProfileAssets.HighContrastProvider && children}
      </body>
    </html>
  );
}
```

---

## 📏 Bundle Budget Enforcement

### package.json Budgets

```json
{
  "scripts": {
    "postbuild": "node scripts/check-bundle-size.js"
  }
}
```

```javascript
// scripts/check-bundle-size.js

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const BUDGETS = {
  familiar: {
    'First Load JS': 180 * 1024,
    'react-core': 45 * 1024,
    'radix-ui': 25 * 1024,
  },
  jovem: {
    'First Load JS': 195 * 1024,
    'react-core': 45 * 1024,
    'radix-ui': 25 * 1024,
    'profile-motion': 30 * 1024,
  },
  senior: {
    'First Load JS': 165 * 1024,
    'react-core': 45 * 1024,
    'radix-ui': 25 * 1024,
  },
};

function checkBundleSizes() {
  const buildManifest = path.join(__dirname, '../.next/build-manifest.json');

  if (!fs.existsSync(buildManifest)) {
    console.error(chalk.red('Build manifest not found. Run build first.'));
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
  let hasErrors = false;

  Object.entries(BUDGETS).forEach(([profile, budgets]) => {
    console.log(chalk.bold(`\nChecking ${profile} profile budgets...`));

    Object.entries(budgets).forEach(([chunkName, budget]) => {
      // Find matching chunk
      const chunk = findChunk(manifest, chunkName);

      if (!chunk) {
        console.warn(chalk.yellow(`⚠ Chunk "${chunkName}" not found`));
        return;
      }

      const size = getChunkSize(chunk);

      if (size > budget) {
        console.error(
          chalk.red(`❌ ${chunkName}: ${formatBytes(size)} exceeds budget of ${formatBytes(budget)}`)
        );
        hasErrors = true;
      } else {
        const percentage = ((size / budget) * 100).toFixed(1);
        console.log(
          chalk.green(`✅ ${chunkName}: ${formatBytes(size)} (${percentage}% of budget)`)
        );
      }
    });
  });

  if (hasErrors) {
    console.error(chalk.red('\n❌ Bundle size check failed!'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All bundle sizes within budget!'));
  }
}

function findChunk(manifest, name) {
  // Implementation depends on manifest structure
  return manifest.pages?.find(p => p.includes(name));
}

function getChunkSize(chunk) {
  // Calculate gzipped size
  const filePath = path.join(__dirname, '../.next', chunk);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath);
    return gzipSize.sync(content);
  }
  return 0;
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

checkBundleSizes();
```

### Lighthouse Performance Budget

```json
// lighthouserc.json

{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "onlyCategories": ["performance"]
      }
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "resource-summary:script:size": ["error", { "maxNumericValue": 180000 }],
        "resource-summary:total:size": ["error", { "maxNumericValue": 500000 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1500 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    }
  }
}
```

---

## 📈 Continuous Monitoring

### Post-Deployment Monitoring

```typescript
// src/lib/bundle-monitoring.ts

export async function trackBundleMetrics() {
  if (typeof window === 'undefined') return;

  // Get Resource Timing API data
  const resources = performance.getEntriesByType('resource');

  const jsResources = resources.filter(r =>
    r.name.endsWith('.js')
  );

  const totalJSSize = jsResources.reduce((sum, r) => {
    return sum + (r.transferSize || 0);
  }, 0);

  // Send to analytics
  if (window.posthog) {
    window.posthog.capture('bundle_loaded', {
      total_js_size: totalJSSize,
      js_file_count: jsResources.length,
      profile: getUserProfile(),
      page: window.location.pathname,
    });
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle Metrics:', {
      totalJSSize: `${(totalJSSize / 1024).toFixed(2)} KB`,
      fileCount: jsResources.length,
      files: jsResources.map(r => ({
        name: r.name.split('/').pop(),
        size: `${(r.transferSize / 1024).toFixed(2)} KB`,
      })),
    });
  }
}

// Call after page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', trackBundleMetrics);
}
```

### Performance Regression Alerts

```yaml
# .github/workflows/performance-regression.yml

name: Performance Regression Detection

on:
  pull_request:
    branches: [main]

jobs:
  compare-bundles:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Checkout base branch
        run: git checkout ${{ github.base_ref }}

      - name: Build base branch
        run: |
          npm ci
          npm run build
          cp -r .next .next-base

      - name: Checkout PR branch
        run: git checkout ${{ github.head_ref }}

      - name: Build PR branch
        run: |
          npm ci
          npm run build

      - name: Compare bundle sizes
        run: node scripts/compare-bundles.js .next-base .next

      - name: Alert on regression
        if: ${{ failure() }}
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ **Performance Regression Detected!**\n\nBundle size increased significantly. Please review the changes.'
            });
```

---

**Próximo Documento**: [Monitoring Dashboard Design](./MONITORING_DASHBOARD.md)

**Última Atualização**: Outubro 2025
**Autor**: Equipe Saraiva Vision
**Status**: Em Planejamento
