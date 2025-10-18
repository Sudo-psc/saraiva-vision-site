# D. Integração com Build System (Vite + Tailwind)

**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-18

---

## 1. Integração com Vite

### 1.1 Plugin YAML para Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import yaml from '@rollup/plugin-yaml'; // ← ADICIONAR

export default defineConfig({
  plugins: [
    react({
      // Fast Refresh habilitado
      fastRefresh: true,
    }),

    yaml(), // ← Suporte a imports de .yaml

    // Plugin customizado para config hash header
    {
      name: 'config-hash-header',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Lazy load para evitar erro circular
          import('./src/lib/config/ConfigService.js').then(({ ConfigService }) => {
            const config = ConfigService.getInstance();
            if (config.getContentHash) {
              res.setHeader('X-Config-Hash', config.getContentHash());
              res.setHeader('X-Config-Version', config.getVersion());
            }
          }).catch(() => {
            // Config ainda não carregado, ignorar
          });
          next();
        });
      },
    },
  ],

  // Alias para imports
  resolve: {
    alias: {
      '@': '/src',
      '@config': '/config',
    },
  },

  // Public dir para assets estáticos (incluindo YAMLs)
  publicDir: 'public',

  // Build options
  build: {
    // Manual chunks (já existente, manter)
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-libs': ['lucide-react', '@headlessui/react'],
          'healthcare': ['@/utils/healthcareCompliance'],
          'analytics': ['@/components/AnalyticsProxy'],
        },
      },
    },

    // Minificação
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remover console.log em prod
      },
    },
  },

  // Dev server
  server: {
    port: 3002,
    open: true,
    hmr: {
      overlay: true, // Mostrar erros na tela
    },
  },
});
```

**Instalar dependência**:
```bash
npm install --save-dev @rollup/plugin-yaml
```

---

### 1.2 Hot Module Replacement (HMR)

```typescript
// src/main.tsx
import { ConfigService } from '@/lib/config/ConfigService';

const config = ConfigService.getInstance();

async function bootstrap() {
  await config.load();

  // ... render app

  // HMR para config files
  if (import.meta.hot) {
    import.meta.hot.accept('/config/config.base.yaml', async () => {
      console.log('[HMR] Config changed, reloading...');

      // Reload config
      await config.load();

      // Notificar componentes React
      window.dispatchEvent(new CustomEvent('config-update'));

      // Re-injetar CSS vars
      const { injectCssVars } = await import('@/lib/config/buildCssVars');
      injectCssVars();
    });

    // Watch env-specific configs também
    const env = import.meta.env.MODE;
    import.meta.hot.accept(`/config/config.${env}.yaml`, async () => {
      console.log(`[HMR] ${env} config changed, reloading...`);
      await config.load();
      window.dispatchEvent(new CustomEvent('config-update'));
    });
  }
}

bootstrap();
```

**Comportamento**:
- Editar `config.base.yaml` → App recarrega config automaticamente
- Componentes React re-renderizam com novos valores
- CSS vars são re-injetadas
- Sem full page reload (preserva estado)

---

### 1.3 Config no Build Time

```javascript
// scripts/prebuild.js
// Rodar antes do build para validar config

const { ConfigSchema } = require('../src/lib/config/config.schema');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

console.log('[Prebuild] Validating configuration...');

// Determinar ambiente (pode vir de env var)
const env = process.env.NODE_ENV || 'production';

// Carregar configs
const baseConfig = yaml.load(
  fs.readFileSync('config/config.base.yaml', 'utf8')
);

let envConfig = {};
try {
  envConfig = yaml.load(
    fs.readFileSync(`config/config.${env}.yaml`, 'utf8')
  );
} catch {
  console.log(`[Prebuild] No ${env} overrides found (optional)`);
}

// Merge
const mergedConfig = { ...baseConfig, ...envConfig };

// Validar
const result = ConfigSchema.safeParse(mergedConfig);

if (!result.success) {
  console.error('[Prebuild] ❌ Configuration validation failed:');
  console.error(result.error.format());
  process.exit(1);
}

console.log(`[Prebuild] ✅ Configuration valid (v${result.data.version})`);

// Gerar arquivo de metadata
const metadata = {
  version: result.data.version,
  environment: result.data.environment,
  buildTime: new Date().toISOString(),
  hash: require('crypto')
    .createHash('md5')
    .update(JSON.stringify(result.data))
    .digest('hex')
    .substring(0, 8),
};

fs.writeFileSync(
  'public/config-metadata.json',
  JSON.stringify(metadata, null, 2)
);

console.log('[Prebuild] Config metadata written to public/config-metadata.json');
```

**Adicionar ao package.json**:
```json
{
  "scripts": {
    "prebuild": "node scripts/prebuild.js",
    "build:vite": "npm run prebuild && vite build",
    "build": "npm run build:vite"
  }
}
```

**Fluxo de Build**:
```
npm run build:vite
  ↓
prebuild.js (validar config)
  ↓
vite build (bundling)
  ↓
dist/ (output)
```

---

## 2. Integração com Tailwind CSS

### 2.1 Tailwind Config Dinâmico

```javascript
// tailwind.config.js
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// Carregar config YAML
const configPath = path.join(__dirname, 'config/config.base.yaml');
let baseConfig;

try {
  const configContent = fs.readFileSync(configPath, 'utf8');
  baseConfig = yaml.load(configContent);
} catch (error) {
  console.error('[Tailwind] Failed to load config.yaml, using defaults');
  baseConfig = { theme: { tokens: {} } };
}

const tokens = baseConfig.theme?.tokens || {};

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  theme: {
    extend: {
      // Colors do YAML
      colors: tokens.colors || {},

      // Typography
      fontFamily: tokens.typography?.fontFamily || {},
      fontSize: tokens.typography?.fontSize || {},
      fontWeight: tokens.typography?.fontWeight || {},
      lineHeight: tokens.typography?.lineHeight || {},

      // Spacing
      spacing: tokens.spacing || {},

      // Border radius
      borderRadius: tokens.borderRadius || {},

      // Box shadow
      boxShadow: tokens.shadows || {},
    },
  },

  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

**Benefícios**:
- ✅ Single source of truth (config.yaml)
- ✅ Cores consistentes entre Tailwind e CSS vars
- ✅ Mudanças em config.yaml → rebuild gera novas classes
- ✅ Type-safe (se usar TypeScript para config)

---

### 2.2 CSS Custom Properties Generation

```typescript
// src/lib/config/buildCssVars.ts (já visto, mas completo aqui)
import { ConfigService } from './ConfigService';

export function buildCssVars(): string {
  const config = ConfigService.getInstance();
  const tokens = config.get('theme.tokens');

  let css = ':root {\n';

  // Colors
  if (tokens.colors) {
    Object.entries(tokens.colors).forEach(([name, value]) => {
      if (typeof value === 'object' && value !== null) {
        // Nested (ex: primary.50, primary.100)
        Object.entries(value).forEach(([shade, hex]) => {
          css += `  --color-${name}-${shade}: ${hex};\n`;
        });
      } else {
        // Flat (ex: accent, success)
        css += `  --color-${name}: ${value};\n`;
      }
    });
  }

  // Typography
  if (tokens.typography) {
    const { fontFamily, fontSize, fontWeight, lineHeight } = tokens.typography;

    if (fontFamily) {
      Object.entries(fontFamily).forEach(([name, fonts]) => {
        css += `  --font-${name}: ${(fonts as string[]).join(', ')};\n`;
      });
    }

    if (fontSize) {
      Object.entries(fontSize).forEach(([name, size]) => {
        css += `  --text-${name}: ${size};\n`;
      });
    }

    if (fontWeight) {
      Object.entries(fontWeight).forEach(([name, weight]) => {
        css += `  --weight-${name}: ${weight};\n`;
      });
    }

    if (lineHeight) {
      Object.entries(lineHeight).forEach(([name, height]) => {
        css += `  --leading-${name}: ${height};\n`;
      });
    }
  }

  // Spacing
  if (tokens.spacing) {
    Object.entries(tokens.spacing).forEach(([name, value]) => {
      css += `  --spacing-${name}: ${value};\n`;
    });
  }

  // Border radius
  if (tokens.borderRadius) {
    Object.entries(tokens.borderRadius).forEach(([name, value]) => {
      css += `  --radius-${name}: ${value};\n`;
    });
  }

  // Shadows
  if (tokens.shadows) {
    Object.entries(tokens.shadows).forEach(([name, value]) => {
      css += `  --shadow-${name}: ${value};\n`;
    });
  }

  css += '}\n';
  return css;
}

export function injectCssVars(): void {
  const css = buildCssVars();

  // Remover style antigo se existir
  const existingStyle = document.getElementById('config-css-vars');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Injetar novo
  const style = document.createElement('style');
  style.id = 'config-css-vars';
  style.textContent = css;
  document.head.appendChild(style);

  console.log('[Config] CSS vars injected');
}

// Uso em componentes legados
export function getCssVar(varName: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${varName}`)
    .trim();
}
```

**Output Example**:
```css
:root {
  --color-primary-50: #e6f2ff;
  --color-primary-100: #cce5ff;
  --color-primary-500: #0066cc;
  --color-accent: #10b981;
  --font-sans: Inter, system-ui, -apple-system, sans-serif;
  --text-base: 1rem;
  --spacing-4: 1rem;
  --radius-lg: 0.5rem;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

---

### 2.3 Usando CSS Vars em Componentes

**Opção 1: Direto no CSS/Tailwind**:
```jsx
// Usar classes Tailwind normalmente
<div className="bg-primary-500 text-white p-4 rounded-lg shadow-md">
  Hello
</div>

// Ou CSS vars em style prop
<div style={{ backgroundColor: 'var(--color-primary-500)' }}>
  Hello
</div>
```

**Opção 2: Hook para acessar vars**:
```typescript
// src/hooks/config/useCssVar.ts
import { useState, useEffect } from 'react';
import { getCssVar } from '@/lib/config/buildCssVars';

export function useCssVar(varName: string): string {
  const [value, setValue] = useState(() => getCssVar(varName));

  useEffect(() => {
    // Atualizar se config mudar
    const handleConfigUpdate = () => {
      setValue(getCssVar(varName));
    };

    window.addEventListener('config-update', handleConfigUpdate);
    return () => window.removeEventListener('config-update', handleConfigUpdate);
  }, [varName]);

  return value;
}
```

**Uso**:
```tsx
function CustomComponent() {
  const primaryColor = useCssVar('color-primary-500');

  return (
    <div style={{ backgroundColor: primaryColor }}>
      Dynamic color from config
    </div>
  );
}
```

---

## 3. Otimizações de Build

### 3.1 Tree Shaking de Config

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      // Separar config em chunk próprio
      output: {
        manualChunks: {
          // ... outros chunks
          'config-system': [
            './src/lib/config/ConfigService',
            './src/lib/config/PlanService',
            './src/lib/config/buildCssVars',
          ],
        },
      },

      // Tree shaking agressivo
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false,
      },
    },
  },
});
```

**Resultado**:
```
dist/
├── assets/
│   ├── index-abc123.js          (main bundle)
│   ├── react-vendor-def456.js   (React libs)
│   ├── config-system-ghi789.js  (Config apenas ~15KB)
│   └── ...
```

---

### 3.2 Compression

```javascript
// vite.config.js
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    yaml(),

    // Gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),

    // Brotli compression (melhor que gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
});
```

**Instalar**:
```bash
npm install --save-dev vite-plugin-compression
```

**Output**:
```
dist/assets/
├── index-abc123.js           (200 KB)
├── index-abc123.js.gz        (60 KB)  ← Nginx serve este
├── index-abc123.js.br        (50 KB)  ← Ainda melhor
```

---

### 3.3 Config Caching Strategy

```typescript
// src/lib/config/ConfigService.ts
private async _load(): Promise<void> {
  // Check se config já está em cache (localStorage)
  const cachedHash = localStorage.getItem('config-hash');
  const cachedConfig = localStorage.getItem('config-data');

  if (cachedHash && cachedConfig) {
    try {
      const parsed = JSON.parse(cachedConfig);
      const currentHash = this.calculateHash(JSON.stringify(parsed));

      // Se hash bate, usar cache
      if (currentHash === cachedHash) {
        console.log('[Config] Loaded from cache');
        this.config = parsed;
        this.contentHash = currentHash;
        return;
      }
    } catch {
      // Cache inválido, recarregar
    }
  }

  // Se não tem cache ou hash diferente, carregar normalmente
  // ... (código de load normal)

  // Salvar em cache após carregar
  if (this.config) {
    localStorage.setItem('config-hash', this.contentHash);
    localStorage.setItem('config-data', JSON.stringify(this.config));
  }
}
```

**Benefício**: Load time reduzido de ~80ms para ~5ms em visitas subsequentes

---

## 4. Scripts de Build Úteis

### 4.1 Pre-deploy Checklist

```bash
#!/bin/bash
# scripts/pre-deploy.sh

echo "🚀 Pre-deployment checklist"
echo "============================"

# 1. Validar config
echo "1. Validating configuration..."
npm run validate:config || {
  echo "❌ Config validation failed"
  exit 1
}

# 2. Rodar testes
echo "2. Running tests..."
npm run test:run || {
  echo "❌ Tests failed"
  exit 1
}

# 3. Build
echo "3. Building..."
npm run build:vite || {
  echo "❌ Build failed"
  exit 1
}

# 4. Verificar tamanho dos bundles
echo "4. Checking bundle sizes..."
MAX_SIZE=524288  # 500KB
for file in dist/assets/*.js; do
  SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
  if [ $SIZE -gt $MAX_SIZE ]; then
    echo "⚠️  Warning: $file is larger than 500KB ($SIZE bytes)"
  fi
done

# 5. Verificar YAMLs no output
echo "5. Verifying config files..."
if [ ! -f "dist/config/config.base.yaml" ]; then
  echo "❌ config.base.yaml not found in build output"
  exit 1
fi

echo "✅ All checks passed!"
echo "============================"
```

---

### 4.2 Build Metadata

```javascript
// scripts/generate-build-info.js
const fs = require('fs');
const { execSync } = require('child_process');

const buildInfo = {
  version: require('../package.json').version,
  buildTime: new Date().toISOString(),
  gitCommit: execSync('git rev-parse HEAD').toString().trim(),
  gitBranch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
  nodeVersion: process.version,
  environment: process.env.NODE_ENV || 'production',
};

fs.writeFileSync(
  'public/build-info.json',
  JSON.stringify(buildInfo, null, 2)
);

console.log('Build info generated:', buildInfo);
```

**Adicionar ao package.json**:
```json
{
  "scripts": {
    "prebuild": "npm run validate:config && node scripts/generate-build-info.js",
    "build:vite": "npm run prebuild && vite build"
  }
}
```

**Endpoint de health**:
```typescript
// api/src/routes/health.ts
app.get('/api/build-info', (req, res) => {
  const buildInfo = require('../../public/build-info.json');
  res.json(buildInfo);
});
```

---

## 5. Desenvolvimento Local

### 5.1 Dev Server Config

```javascript
// vite.config.js
export default defineConfig({
  server: {
    port: 3002,
    open: true,
    cors: true,

    // Proxy para API (se necessário)
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },

    // Hot reload específico para config
    watch: {
      include: ['config/**/*.yaml'],
      exclude: ['node_modules/**', 'dist/**'],
    },

    // Custom middleware para debug
    middlewares: [
      (req, res, next) => {
        if (req.url.includes('.yaml')) {
          console.log('[Dev] YAML file requested:', req.url);
        }
        next();
      },
    ],
  },
});
```

---

### 5.2 Workflow de Desenvolvimento

```
1. npm run dev:vite
   ↓
2. Browser abre em http://localhost:3002
   ↓
3. Editar config/config.base.yaml
   ↓
4. HMR detecta mudança
   ↓
5. ConfigService recarrega
   ↓
6. Componentes re-renderizam
   ↓
7. CSS vars re-injetadas
   ↓
8. UI atualiza (sem full reload)
```

---

## Resumo de Integração

| Sistema | Integração | Benefício |
|---------|------------|-----------|
| **Vite** | Plugin YAML + HMR | Hot reload automático |
| **Tailwind** | Ler tokens do YAML | Classes consistentes |
| **Build** | Prebuild validation | Erros pegados antes |
| **CSS Vars** | Geração dinâmica | Temas reativos |
| **Bundles** | Config em chunk separado | Otimização ~15KB |
| **Cache** | LocalStorage hash | Load 5ms vs 80ms |

**Próximos Passos**: Ver estratégia de testes em [06-estrategia-testes.md](./06-estrategia-testes.md)
