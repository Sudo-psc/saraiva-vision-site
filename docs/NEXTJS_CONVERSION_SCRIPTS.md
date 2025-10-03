# Next.js Conversion Scripts

Scripts utilitários para automatizar a migração de React (Vite) para Next.js 15.

---

## 📋 Scripts Disponíveis

### 1. Converter Blog Posts (JS → Markdown)

Converte `src/data/blogPosts.js` para arquivos Markdown individuais.

```javascript
// scripts/convert-blog-to-markdown.js
const fs = require('fs');
const path = require('path');

const blogPosts = require('../src/data/blogPosts.js').blogPosts;

const outputDir = path.join(__dirname, '../content/blog');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

blogPosts.forEach((post) => {
  const frontmatter = `---
title: "${post.title}"
slug: ${post.slug}
excerpt: "${post.excerpt}"
publishedAt: ${post.publishedAt}
coverImage: ${post.coverImage}
author:
  name: ${post.author.name}
  crm: ${post.author.crm}
category: ${post.category}
tags:
${post.tags?.map(tag => `  - ${tag}`).join('\n') || '  - geral'}
cfmCompliance: ${post.cfmCompliance ?? false}
---

${post.content}
`;

  const filename = `${post.slug}.md`;
  fs.writeFileSync(
    path.join(outputDir, filename),
    frontmatter,
    'utf8'
  );
  
  console.log(`✅ Created: ${filename}`);
});

console.log(`\n✨ Converted ${blogPosts.length} blog posts to Markdown!`);
```

**Uso:**
```bash
node scripts/convert-blog-to-markdown.js
```

---

### 2. Adicionar 'use client' Automaticamente

Detecta componentes que precisam de `'use client'` e adiciona automaticamente.

```javascript
// scripts/add-use-client.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const componentsDir = path.join(__dirname, '../src/components');

const needsUseClient = (content) => {
  const patterns = [
    /useState/,
    /useEffect/,
    /useContext/,
    /useReducer/,
    /useCallback/,
    /useMemo/,
    /useRef/,
    /useLayoutEffect/,
    /onClick=/,
    /onChange=/,
    /onSubmit=/,
    /window\./,
    /document\./,
    /localStorage/,
    /sessionStorage/,
    /from ['"]framer-motion['"]/,
    /from ['"]@radix-ui/,
  ];
  
  return patterns.some(pattern => pattern.test(content));
};

glob.sync(`${componentsDir}/**/*.{jsx,tsx}`).forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  
  if (content.startsWith("'use client'")) {
    console.log(`⏭️  Skip (already has): ${path.basename(file)}`);
    return;
  }
  
  if (needsUseClient(content)) {
    const updated = `'use client';\n\n${content}`;
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`✅ Added 'use client': ${path.basename(file)}`);
  } else {
    console.log(`⚪ No need: ${path.basename(file)}`);
  }
});

console.log('\n✨ Done!');
```

**Uso:**
```bash
node scripts/add-use-client.js
```

---

### 3. Converter React Router → Next.js Link

Substitui imports e usos de `react-router-dom` por `next/link` e `next/navigation`.

```javascript
// scripts/convert-router-to-nextjs.js
const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{jsx,tsx}');

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Substituir import Link
  if (content.includes("from 'react-router-dom'")) {
    content = content.replace(
      /import\s+{\s*Link\s*}\s+from\s+['"]react-router-dom['"]/g,
      "import Link from 'next/link'"
    );
    changed = true;
  }
  
  // Substituir useNavigate
  if (content.includes('useNavigate')) {
    content = content.replace(
      /import\s+{\s*([^}]*useNavigate[^}]*)\s*}\s+from\s+['"]react-router-dom['"]/g,
      (match, imports) => {
        const others = imports
          .split(',')
          .map(i => i.trim())
          .filter(i => !i.includes('useNavigate'))
          .join(', ');
        
        let result = `import { useRouter } from 'next/navigation'`;
        if (others) {
          result += `\nimport { ${others} } from 'next/link'`;
        }
        return result;
      }
    );
    
    content = content.replace(/const\s+navigate\s*=\s*useNavigate\(\)/g, 'const router = useRouter()');
    content = content.replace(/navigate\(/g, 'router.push(');
    
    changed = true;
  }
  
  // Substituir to={} por href={}
  content = content.replace(/(\<Link\s+)to=/g, '$1href=');
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Updated: ${file}`);
  }
});

console.log('\n✨ React Router → Next.js conversion complete!');
```

**Uso:**
```bash
node scripts/convert-router-to-nextjs.js
```

---

### 4. Converter JSX → TSX

Renomeia arquivos `.jsx` para `.tsx` e adiciona interfaces básicas.

```javascript
// scripts/convert-jsx-to-tsx.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('src/**/*.jsx');

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Adicionar interface Props se tiver parâmetros
  let updated = content;
  const propsMatch = content.match(/export\s+default\s+function\s+\w+\s*\(\s*{\s*([^}]+)\s*}\s*\)/);
  
  if (propsMatch) {
    const props = propsMatch[1]
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
    
    const interfaces = props
      .map(prop => `  ${prop}: any;`)
      .join('\n');
    
    const interfaceCode = `\ninterface Props {\n${interfaces}\n}\n\n`;
    
    updated = content.replace(
      /export\s+default\s+function\s+(\w+)\s*\(\s*{\s*([^}]+)\s*}\s*\)/,
      `${interfaceCode}export default function $1({ $2 }: Props)`
    );
  }
  
  // Renomear arquivo
  const newFile = file.replace('.jsx', '.tsx');
  fs.writeFileSync(newFile, updated, 'utf8');
  fs.unlinkSync(file);
  
  console.log(`✅ ${path.basename(file)} → ${path.basename(newFile)}`);
});

console.log(`\n✨ Converted ${files.length} files to TypeScript!`);
```

**Uso:**
```bash
node scripts/convert-jsx-to-tsx.js
```

---

### 5. Gerar Metadata API

Converte componentes com `react-helmet` para Metadata API do Next.js.

```javascript
// scripts/convert-helmet-to-metadata.js
const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/pages/**/*.{jsx,tsx}');

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('react-helmet')) {
    console.log(`⏭️  Skip (no helmet): ${file}`);
    return;
  }
  
  // Extrair título e descrição do Helmet
  const titleMatch = content.match(/<title>([^<]+)<\/title>/);
  const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  
  if (!titleMatch && !descMatch) {
    console.log(`⚠️  No metadata found: ${file}`);
    return;
  }
  
  const title = titleMatch?.[1] || 'Saraiva Vision';
  const description = descMatch?.[1] || '';
  
  // Gerar código Metadata API
  const metadataCode = `
export const metadata: Metadata = {
  title: '${title}',
  description: '${description}',
  openGraph: {
    title: '${title}',
    description: '${description}',
  },
};
`;
  
  // Remover imports react-helmet
  content = content.replace(/import\s+{\s*Helmet\s*}\s+from\s+['"]react-helmet-async['"];?\n?/g, '');
  content = content.replace(/import\s+{\s*Helmet\s*}\s+from\s+['"]react-helmet['"];?\n?/g, '');
  
  // Adicionar import Metadata
  if (!content.includes("from 'next'")) {
    content = `import { Metadata } from 'next';\n${content}`;
  }
  
  // Adicionar metadata export
  content = content.replace(
    /export\s+default\s+function/,
    `${metadataCode}\nexport default function`
  );
  
  // Remover tags Helmet do JSX
  content = content.replace(/<Helmet>[\s\S]*?<\/Helmet>/g, '');
  content = content.replace(/<>\s*<\/>/g, ''); // Remover fragments vazios
  
  fs.writeFileSync(file, content, 'utf8');
  console.log(`✅ Converted: ${file}`);
});

console.log('\n✨ Helmet → Metadata API conversion complete!');
```

**Uso:**
```bash
node scripts/convert-helmet-to-metadata.js
```

---

### 6. Análise de Dependências

Detecta quais componentes precisam de 'use client' e gera relatório.

```javascript
// scripts/analyze-components.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const components = glob.sync('src/components/**/*.{jsx,tsx}');

const analysis = {
  serverComponents: [],
  clientComponents: [],
  needsClient: [],
  stats: {
    total: 0,
    server: 0,
    client: 0,
    needsConversion: 0,
  },
};

const detectClientNeeds = (content) => {
  const reasons = [];
  
  if (/useState|useEffect|useContext|useReducer/.test(content)) {
    reasons.push('React Hooks');
  }
  if (/onClick=|onChange=|onSubmit=/.test(content)) {
    reasons.push('Event Handlers');
  }
  if (/window\.|document\.|localStorage|sessionStorage/.test(content)) {
    reasons.push('Browser APIs');
  }
  if (/from ['"]framer-motion['"]/.test(content)) {
    reasons.push('Framer Motion');
  }
  if (/from ['"]@radix-ui/.test(content)) {
    reasons.push('Radix UI');
  }
  
  return reasons;
};

components.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const hasUseClient = content.startsWith("'use client'");
  const needs = detectClientNeeds(content);
  
  analysis.stats.total++;
  
  const fileInfo = {
    file: path.relative(process.cwd(), file),
    reasons: needs,
  };
  
  if (hasUseClient) {
    analysis.clientComponents.push(fileInfo);
    analysis.stats.client++;
  } else if (needs.length > 0) {
    analysis.needsClient.push(fileInfo);
    analysis.stats.needsConversion++;
  } else {
    analysis.serverComponents.push(fileInfo);
    analysis.stats.server++;
  }
});

console.log('\n📊 Component Analysis Report\n');
console.log(`Total Components: ${analysis.stats.total}`);
console.log(`✅ Server Components: ${analysis.stats.server} (${Math.round(analysis.stats.server / analysis.stats.total * 100)}%)`);
console.log(`🔵 Client Components: ${analysis.stats.client} (${Math.round(analysis.stats.client / analysis.stats.total * 100)}%)`);
console.log(`⚠️  Needs 'use client': ${analysis.stats.needsConversion} (${Math.round(analysis.stats.needsConversion / analysis.stats.total * 100)}%)`);

if (analysis.needsClient.length > 0) {
  console.log('\n⚠️  Components that need "use client":\n');
  analysis.needsClient.forEach(({ file, reasons }) => {
    console.log(`  ${file}`);
    console.log(`    Reasons: ${reasons.join(', ')}\n`);
  });
}

const reportPath = path.join(__dirname, '../analysis-report.json');
fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2), 'utf8');
console.log(`\n📄 Full report saved to: ${reportPath}`);
```

**Uso:**
```bash
node scripts/analyze-components.js
```

---

### 7. Gerar Estrutura de Pastas Next.js

Cria a estrutura básica do App Router baseada nas rotas do React Router.

```javascript
// scripts/generate-nextjs-structure.js
const fs = require('fs');
const path = require('path');

const routes = [
  { path: '/', name: 'page' },
  { path: '/servicos', name: 'page' },
  { path: '/servicos/[serviceId]', name: 'page' },
  { path: '/blog', name: 'page' },
  { path: '/blog/[slug]', name: 'page' },
  { path: '/podcast', name: 'page' },
  { path: '/podcast/[slug]', name: 'page' },
  { path: '/sobre', name: 'page' },
  { path: '/lentes', name: 'page' },
  { path: '/faq', name: 'page' },
  { path: '/privacy', name: 'page' },
  { path: '/check', name: 'page' },
  { path: '/api/google-reviews', name: 'route' },
  { path: '/api/analytics', name: 'route' },
  { path: '/api/health', name: 'route' },
];

const baseDir = path.join(__dirname, '../src/app');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

routes.forEach(({ path: routePath, name }) => {
  const fullPath = path.join(baseDir, routePath);
  
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  
  const ext = name === 'route' ? 'ts' : 'tsx';
  const filePath = path.join(fullPath, `${name}.${ext}`);
  
  if (!fs.existsSync(filePath)) {
    const template = name === 'route' 
      ? `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'TODO: Implement' });
}

export const runtime = 'edge';
`
      : `export default function Page() {
  return (
    <div>
      <h1>TODO: Migrate content from React Router</h1>
    </div>
  );
}
`;
    
    fs.writeFileSync(filePath, template, 'utf8');
    console.log(`✅ Created: ${routePath}/${name}.${ext}`);
  }
});

// Criar layout.tsx root
const layoutPath = path.join(baseDir, 'layout.tsx');
if (!fs.existsSync(layoutPath)) {
  const layoutTemplate = `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Saraiva Vision - Clínica Oftalmológica',
  description: 'Clínica oftalmológica em Caratinga, MG',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
`;
  fs.writeFileSync(layoutPath, layoutTemplate, 'utf8');
  console.log(`✅ Created: layout.tsx`);
}

console.log('\n✨ Next.js App Router structure created!');
```

**Uso:**
```bash
node scripts/generate-nextjs-structure.js
```

---

## 🚀 Workflow Completo de Conversão

### Passo a Passo

```bash
# 1. Criar estrutura Next.js
node scripts/generate-nextjs-structure.js

# 2. Converter blog posts para Markdown
node scripts/convert-blog-to-markdown.js

# 3. Analisar componentes
node scripts/analyze-components.js

# 4. Adicionar 'use client' onde necessário
node scripts/add-use-client.js

# 5. Converter React Router → Next.js
node scripts/convert-router-to-nextjs.js

# 6. Converter Helmet → Metadata API
node scripts/convert-helmet-to-metadata.js

# 7. Converter JSX → TSX (opcional)
node scripts/convert-jsx-to-tsx.js

# 8. Verificar e ajustar manualmente
# (Review dos arquivos gerados)
```

---

## 📦 package.json Scripts

Adicione ao `package.json`:

```json
{
  "scripts": {
    "migrate:analyze": "node scripts/analyze-components.js",
    "migrate:blog": "node scripts/convert-blog-to-markdown.js",
    "migrate:router": "node scripts/convert-router-to-nextjs.js",
    "migrate:helmet": "node scripts/convert-helmet-to-metadata.js",
    "migrate:structure": "node scripts/generate-nextjs-structure.js",
    "migrate:full": "npm run migrate:structure && npm run migrate:blog && npm run migrate:analyze && npm run migrate:router && npm run migrate:helmet"
  }
}
```

**Uso:**
```bash
npm run migrate:full
```

---

**Última Atualização**: Outubro 2025
