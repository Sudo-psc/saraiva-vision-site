# A. Arquitetura Atual - Estado do Sistema

**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-18

---

## Stack Tecnológico Real

⚠️ **CORREÇÃO CRÍTICA**: O prompt original mencionou "Next.js 14", mas após auditoria completa:

```
Stack Real:
✅ React 18.2.0
✅ Vite 4.4.5 (NÃO Next.js)
✅ React Router v6
✅ Tailwind CSS 3.3.3
✅ TypeScript 5.0.2
```

Esta arquitetura foi desenhada especificamente para **Vite + React**, não Next.js.

---

## Mapeamento Completo de Arquivos

### 1. Configurações de Build
```
/vite.config.js                 [205 linhas]
├── Manual code splitting (healthcare-optimized)
├── Rollup options com tree-shaking agressivo
├── React plugin + Fast Refresh
└── ❌ Precisa: @rollup/plugin-yaml

/tailwind.config.js             [150 linhas]
├── Theme tokens hard-coded
├── Custom colors, spacing, typography
└── ❌ Duplicação: cores também em CSS

/tsconfig.json                  [50 linhas]
├── Path aliases: @/ → src/
└── Strict mode habilitado
```

### 2. Configurações de Negócio (NAP - Name, Address, Phone)

#### 🔴 DUPLICAÇÃO CRÍTICA DETECTADA

**Arquivo 1**: `/src/lib/clinicInfo.js` (111 linhas)
```javascript
export const clinicInfo = {
  name: "Clínica Saraiva Vision",
  address: "Rua Barão do Rio Branco, 233 - Centro",
  city: "Caratinga",
  state: "MG",
  phone: "+55 33 3321-2071",
  whatsapp: "+55 33 99909-6030",
  // ... + métodos de formatação
};
```

**Arquivo 2**: `/src/lib/napCanonical.js` (167 linhas)
```javascript
export const napCanonical = {
  name: "Clínica Saraiva Vision",
  address: {
    street: "Rua Barão do Rio Branco",
    number: "233",
    // ... mesmos dados, estrutura diferente
  },
  phone: {
    main: "+55 33 3321-2071",
    // ... + funções utilitárias
  }
};
```

**Impacto**:
- ❌ Mesma informação em 2 locais
- ❌ Estruturas diferentes (clinicInfo usa strings, napCanonical usa objetos)
- ❌ Risco de dessincronização
- ❌ Manutenção duplicada

**Solução**: Consolidar em `config.yaml → business` seção

---

### 3. Conteúdo Estático

**Arquivo**: `/src/data/blogPosts.js` (3.200+ linhas)
```javascript
export const blogPosts = [
  {
    id: 1,
    slug: "como-ia-transforma-exames-oftalmologicos",
    title: "Como a IA Transforma Exames...",
    content: `<div>...</div>`, // HTML completo inline
    // ... 27 posts com conteúdo massivo
  }
];
```

**Análise**:
- ✅ Sistema 100% estático (sem CMS, sem DB)
- ✅ Bundled no build para performance
- ❌ 3.200 linhas em 1 arquivo
- ❌ HTML misturado com dados estruturados
- ⚠️ **Recomendação**: NÃO mover para config.yaml (muito grande), mas estruturar metadata separada do conteúdo

**Arquivo**: `/src/data/serviceConfig.js` (250 linhas)
```javascript
export const createServiceConfig = (t) => [
  {
    id: "consulta-geral",
    titleKey: "services.consultaGeral.title",
    icon: Eye,
    // Usa i18next para traduções
  }
];
```

**Análise**:
- ✅ Factory pattern com i18n
- ❌ Estrutura poderia estar em config.yaml
- ⚠️ Descrições longas ficam melhores em i18n, mas metadata move para config

---

### 4. Internacionalização (i18n)

**Estrutura Atual**:
```
/public/locales/
├── pt-BR/
│   ├── common.json          [800 linhas]
│   ├── services.json        [600 linhas]
│   ├── blog.json           [300 linhas]
│   └── seo.json            [200 linhas]
└── en-US/
    └── (mesma estrutura)
```

**Uso**: `react-i18next` com `useTranslation()`

**Problemas**:
- ❌ 4+ arquivos JSON por idioma
- ❌ Chaves duplicadas entre arquivos
- ❌ Sem validação de schema
- ❌ Traduções incompletas (en-US ~60% do pt-BR)

**Solução**: Consolidar em `config.yaml → i18n` com flat key structure

---

### 5. SEO e Metadados

**Arquivo**: `/src/components/SEOHead.jsx` (120 linhas)
```jsx
export const SEOHead = ({
  title = "Clínica Saraiva Vision - Oftalmologia Caratinga MG",
  description = "Especialistas em saúde ocular...",
  // ... defaults hard-coded
}) => (
  <Helmet>
    <title>{title}</title>
    {/* ... */}
  </Helmet>
);
```

**Problemas**:
- ❌ Defaults hard-coded no componente
- ❌ Sem estratégia de fallback centralizada
- ❌ Meta tags OpenGraph repetidas em múltiplos lugares

**Solução**: `config.get('seo.defaults')` + per-page overrides

---

### 6. Tema e Design Tokens

**Arquivo**: `/tailwind.config.js` (cores hard-coded)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2ff',
          100: '#cce5ff',
          // ... 10 tons hard-coded
        },
        accent: '#10b981',
        // ... duplicado em CSS
      }
    }
  }
};
```

**Arquivo**: `/src/index.css` (CSS vars também definidas)
```css
:root {
  --color-primary: #0066cc;
  --color-accent: #10b981;
  /* ... mesmas cores, valores diferentes! */
}
```

**PROBLEMA CRÍTICO**: Dessincronia de cores entre Tailwind e CSS vars

**Solução**: Single source of truth em `config.yaml → theme.tokens`

---

### 7. Analytics e Tracking

**Arquivo**: `/src/components/AnalyticsProxy.jsx` (80 linhas)
```jsx
const GTM_ID = import.meta.env.VITE_GTM_ID;
const GA_ID = import.meta.env.VITE_GA_ID;

export const AnalyticsProxy = () => {
  useEffect(() => {
    initGTM(GTM_ID);
    initGA4(GA_ID);
  }, []);
};
```

**Env Vars Relacionadas**:
```bash
VITE_GTM_ID=GTM-KF2NP85D
VITE_GA_ID=G-LXWRK8ELS6
VITE_POSTHOG_KEY=phc_bpyxyy0AVVh2E9...
```

**Problemas**:
- ❌ IDs espalhados entre .env e código
- ❌ Sem feature flags para desabilitar tracking
- ❌ Configuração de eventos hard-coded

**Solução**: `config.yaml → tracking` seção com feature flags

---

### 8. Navegação e Menus

**Arquivo**: `/src/components/Navbar.jsx` (150 linhas)
```jsx
const navLinks = useMemo(() => [
  { name: t('navbar.home'), href: '/', icon: Home },
  { name: t('navbar.services'), href: '/servicos', icon: Activity },
  { name: t('navbar.about'), href: '/sobre', icon: Users },
  // ... 8 links hard-coded
], [t]);
```

**Problemas**:
- ❌ Estrutura do menu hard-coded em componente
- ❌ Ordem não configurável
- ❌ Difícil adicionar/remover items sem editar código

**Solução**: `config.getMenu('pt-BR', 'header')` retorna estrutura completa

---

### 9. Planos e Pricing

**Arquivo**: `/src/data/plansData.js` (200 linhas estimadas)
```javascript
export const plans = [
  {
    id: "basic",
    nameKey: "plans.basic.name",
    price: { monthly: 299, yearly: 2990 },
    features: [
      { key: "plans.basic.features.1", included: true },
      // ... 10+ features
    ]
  }
];
```

**Problemas**:
- ❌ Preços hard-coded
- ❌ Features em i18n, estrutura em JS
- ❌ Sem validação de moeda/formato

**Solução**: `config.yaml → plans` com PlanService para lógica

---

### 10. Conformidade LGPD/CFM

**Arquivo**: `/src/utils/healthcareCompliance.js` (300 linhas)
```javascript
export const complianceConfig = {
  lgpd: {
    enabled: true,
    cookieBanner: true,
    consentRequired: ['analytics', 'marketing'],
  },
  cfm: {
    disclaimers: {
      medicalContent: "Este conteúdo...",
      // ... textos legais
    }
  }
};
```

**Problemas**:
- ❌ Configuração legal misturada com código
- ❌ Textos de disclaimer hard-coded
- ❌ Difícil auditar conformidade

**Solução**: `config.yaml → compliance` seção centralizada

---

## Inventário de Duplicações

| Dado | Localização 1 | Localização 2 | Localização 3 |
|------|---------------|---------------|---------------|
| **Cores primárias** | `tailwind.config.js` | `/src/index.css` | - |
| **Nome clínica** | `clinicInfo.js` | `napCanonical.js` | `SEOHead.jsx` |
| **Endereço** | `clinicInfo.js` | `napCanonical.js` | Schema markup |
| **Telefone** | `clinicInfo.js` | `napCanonical.js` | Footer hard-coded |
| **GTM/GA IDs** | `.env` | `AnalyticsProxy.jsx` | - |
| **Horário funcionamento** | `clinicInfo.js` | Schema markup | Footer |
| **Redes sociais** | `clinicInfo.js` | Footer | SEO |

**Total**: 7 duplicações críticas identificadas

---

## Dependências de Pacotes Relevantes

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.14.2",
    "react-i18next": "^13.0.2",           // ← Será substituído
    "react-helmet-async": "^1.3.0",       // ← Integrar com config
    "tailwindcss": "^3.3.3",              // ← Ler tokens do config

    "FALTAM ADICIONAR": [
      "js-yaml": "^4.1.0",                // Para ler YAML
      "@rollup/plugin-yaml": "^4.0.1",    // Vite YAML support
      "zod": "^3.22.4"                    // Validação schema
    ]
  }
}
```

---

## Fluxo de Build Atual

```
1. Vite lê vite.config.js
   ├── Manual chunks: react-vendor, ui-libs, healthcare, analytics
   ├── Tree-shaking agressivo
   └── Rollup bundling

2. Tailwind processa src/**/*.{js,jsx,ts,tsx}
   ├── Gera CSS com utilities
   └── Purge unused classes

3. TypeScript compila src/ → dist/
   ├── Path aliases resolvidos
   └── Type checking

4. Build output → dist/
   ├── index.html
   ├── assets/index-[hash].js
   ├── assets/index-[hash].css
   └── public/* (copiados)

5. Deploy script → /var/www/saraivavision/current/
```

**Impacto da Migração**:
- Adicionar step 1.5: Carregar e validar config.yaml
- Adicionar step 1.6: Gerar CSS vars dinamicamente
- Build time estimado: +5s (validação schema)

---

## Pontos de Integração Críticos

### 1. Vite Dev Server (HMR)
```javascript
// vite.config.js - adicionar watcher
export default defineConfig({
  plugins: [
    yaml(), // Novo plugin
    {
      name: 'config-hmr',
      handleHotUpdate({ file, server }) {
        if (file.endsWith('config.yaml')) {
          server.ws.send({ type: 'full-reload' });
        }
      }
    }
  ]
});
```

### 2. React App Bootstrap
```jsx
// src/main.jsx - carregar config antes de render
import { ConfigService } from '@/lib/config/ConfigService';

const config = ConfigService.getInstance();
await config.load(); // Validação síncrona no boot

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConfigProvider config={config}>
    <App />
  </ConfigProvider>
);
```

### 3. Tailwind Build Time
```javascript
// tailwind.config.js - ler do YAML
const yaml = require('js-yaml');
const fs = require('fs');

const config = yaml.load(
  fs.readFileSync('./config/config.base.yaml', 'utf8')
);

module.exports = {
  theme: {
    extend: {
      colors: config.theme.tokens.colors,
      // ... resto dinâmico
    }
  }
};
```

---

## Conclusão da Auditoria

### Situação Atual
- ✅ Aplicação React moderna e bem estruturada
- ✅ Performance otimizada com code splitting
- ✅ Type safety com TypeScript
- ❌ 8+ fontes de configuração fragmentadas
- ❌ 7 duplicações críticas de dados
- ❌ Manutenção complexa (mudar telefone = 4 arquivos)

### Oportunidades de Melhoria
1. **Consolidação** → 1 arquivo YAML único
2. **Type Safety** → Zod validation
3. **DX** → Hot reload em dev
4. **Manutenção** → Single source of truth
5. **Escalabilidade** → Feature flags + gradual rollout

### Próximos Passos
→ Ver [02-schema-configuracao.md](./02-schema-configuracao.md) para especificação do YAML
