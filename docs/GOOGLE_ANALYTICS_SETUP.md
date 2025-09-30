# Google Analytics & Tag Manager - Setup Review

## 📊 Status Atual

### ❌ Analytics NÃO Configurado
**Problema**: Google Analytics e Meta Pixel não estão inicializados no projeto.

**Evidências**:
- ✅ Código de tracking implementado em `src/utils/analytics.js`
- ✅ Consent mode configurado em `src/utils/consentMode.js`
- ❌ Variáveis de ambiente não configuradas
- ❌ `initializeAnalytics()` não é chamado em nenhum lugar
- ❌ Nenhum script de tracking no `index.html` ou build

### 🔍 Arquivos de Análise

**Arquivos Existentes**:
- `src/utils/analytics.js` - Funções de tracking completas
- `src/utils/consentMode.js` - Gerenciamento de consentimento LGPD
- `src/lib/analytics.js` - No-op analytics (console.log apenas)

**Status**:
- Sistema de tracking robusto implementado
- LGPD compliance com consent mode
- Aguardando apenas configuração e inicialização

## 🛠 Implementação Necessária

### 1. Configurar Variáveis de Ambiente

**Adicionar ao `.env.production`**:
```bash
# Google Analytics 4
VITE_GA_ID=G-XXXXXXXXXX

# Meta Pixel (opcional)
VITE_META_PIXEL_ID=XXXXXXXXXXXXXXX
```

### 2. Inicializar Analytics no App

**Opção 1: Em `src/main.jsx`** (Recomendado)
```jsx
import { initializeAnalytics } from './utils/analytics.js';

// Após createRoot, antes de render
if (import.meta.env.PROD) {
  initializeAnalytics();
}
```

**Opção 2: Em `src/App.jsx`**
```jsx
import { initializeAnalytics } from './utils/analytics.js';

function App() {
  useEffect(() => {
    // Initialize analytics
    if (import.meta.env.PROD) {
      initializeAnalytics();
    }
  }, []);

  // resto do código...
}
```

### 3. Tracking de Eventos do Blog

**Adicionar em `src/pages/BlogPage.jsx`**:

```jsx
import { trackBlogInteraction, trackPageView } from '../utils/analytics';

// No componente BlogPage
useEffect(() => {
  // Track page view
  if (currentPost) {
    trackPageView(`/blog/${currentPost.slug}`);
    trackBlogInteraction('view_post', currentPost.slug, {
      post_title: currentPost.title,
      post_category: currentPost.category
    });
  } else {
    trackPageView('/blog');
  }
}, [currentPost]);

// No search handler
const handleSearch = (e) => {
  e.preventDefault();
  trackBlogInteraction('search', null, {
    query: searchTerm,
    results_count: filteredPosts.length
  });
};

// No category filter
const handleCategoryChange = (category) => {
  setSelectedCategory(category);
  trackBlogInteraction('filter_category', null, {
    category: category,
    results_count: filteredPosts.length
  });
};
```

### 4. Web Vitals Tracking

**Adicionar em `src/main.jsx`**:
```jsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import { trackWebVitals } from './utils/analytics';

function sendToAnalytics(metric) {
  trackWebVitals(metric);
}

// Initialize web vitals tracking
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## 📋 Funcionalidades Disponíveis

### Tracking Functions (`src/utils/analytics.js`)

**Eventos de Página**:
- `trackPageView(pagePath)` - Page views
- `trackBlogInteraction(action, postSlug, metadata)` - Blog events

**Eventos de Conversão**:
- `trackConversion(eventName, value, currency)` - Conversões
- `trackEnhancedConversion(parameters)` - Conversões com dados do usuário

**Eventos de Interação**:
- `trackUserInteraction(type, element, metadata)` - Interações gerais
- `trackContactFormInteraction(action, metadata)` - Formulários
- `trackServiceInteraction(serviceName, action, metadata)` - Serviços
- `trackSearchInteraction(query, resultsCount, metadata)` - Buscas

**Performance**:
- `trackWebVitals(metric)` - Core Web Vitals
- `trackPerformanceMetric(name, value, metadata)` - Métricas customizadas

**Erros**:
- `trackError(errorType, errorMessage, metadata)` - Tracking de erros

**Funil**:
- `trackFunnelEvent(eventName, metadata)` - Eventos do funil
- `trackAppointmentMetrics(action, metadata)` - Agendamentos

### Consent Management

**LGPD Compliance** (`src/utils/consentMode.js`):
- Consent banner automático
- Storage de preferências
- Update em tempo real do GA/Meta
- 4 níveis de consent:
  - `analytics_storage` - Google Analytics
  - `ad_storage` - Anúncios e remarketing
  - `ad_user_data` - Dados do usuário para anúncios
  - `ad_personalization` - Personalização de anúncios

## 🎯 Eventos Recomendados para Blog

### Pageviews
```javascript
// Post individual
trackPageView('/blog/nome-do-post');
trackBlogInteraction('view_post', 'nome-do-post', {
  post_title: 'Título do Post',
  post_category: 'Saúde Ocular'
});

// Listagem
trackPageView('/blog');
```

### Interações
```javascript
// Busca
trackBlogInteraction('search', null, {
  query: 'catarata',
  results_count: 5
});

// Filtro de categoria
trackBlogInteraction('filter_category', null, {
  category: 'Prevenção',
  results_count: 8
});

// Click em post relacionado
trackBlogInteraction('click_related_post', 'post-slug', {
  from_post: 'post-atual',
  position: 1
});

// Scroll depth
trackBlogInteraction('scroll_depth', 'post-slug', {
  depth_percentage: 75
});

// Tempo de leitura
trackBlogInteraction('reading_time', 'post-slug', {
  time_seconds: 120
});
```

### Conversões
```javascript
// Click em CTA
trackConversion('blog_cta_click', null, 'BRL');

// Compartilhamento
trackBlogInteraction('share', 'post-slug', {
  platform: 'whatsapp'
});
```

## 🔧 Setup Completo Step-by-Step

### Passo 1: Obter IDs do Google Analytics

1. Acesse [Google Analytics](https://analytics.google.com/)
2. Crie propriedade GA4 se não existir
3. Copie o ID (formato: `G-XXXXXXXXXX`)

### Passo 2: Configurar Variáveis

```bash
# Editar .env.production
echo "VITE_GA_ID=G-XXXXXXXXXX" >> .env.production

# Opcional: Meta Pixel
echo "VITE_META_PIXEL_ID=XXXXXXXXXXXXXXX" >> .env.production
```

### Passo 3: Implementar Inicialização

```bash
# Editar src/main.jsx
# Adicionar import e inicialização conforme exemplos acima
```

### Passo 4: Adicionar Tracking ao Blog

```bash
# Editar src/pages/BlogPage.jsx
# Adicionar imports e eventos conforme exemplos acima
```

### Passo 5: Build e Deploy

```bash
npm run build
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx
```

### Passo 6: Testar

1. Abrir Chrome DevTools
2. Network tab → Filtrar por "google-analytics.com" ou "gtag"
3. Navegar pelo site e verificar requests
4. Console → Verificar `window.gtag` e `window.dataLayer`

## 📊 Eventos GA4 Padrão

**Eventos Automáticos GA4**:
- `page_view` - Pageviews
- `scroll` - 90% scroll
- `click` - Outbound links
- `file_download` - Downloads
- `video_start/complete` - Vídeos

**Eventos Customizados Implementados**:
- `blog_interaction` - Todas interações do blog
- `contact_form` - Formulários de contato
- `service_interaction` - Interações com serviços
- `search_interaction` - Buscas
- `web_vitals` - Performance metrics
- `funnel_event` - Eventos do funil
- `user_interaction` - Interações gerais
- `exception` - Erros

## 🎨 Google Tag Manager (Opcional)

Se preferir usar GTM ao invés de gtag.js direto:

### Setup GTM

1. Criar container no [Google Tag Manager](https://tagmanager.google.com/)
2. Copiar ID do container (formato: `GTM-XXXXXXX`)

### Implementar GTM

**No `index.html`** (dentro de `<head>`):
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->
```

**No `index.html`** (logo após `<body>`):
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

### Configurar Tags no GTM

1. **GA4 Configuration Tag**
   - Tipo: Google Analytics: GA4 Configuration
   - Measurement ID: G-XXXXXXXXXX
   - Trigger: All Pages

2. **Eventos Customizados**
   - Variáveis personalizadas no dataLayer
   - Triggers baseados em eventos
   - Tags GA4 Event para cada tipo

## ⚠️ Considerações LGPD

**Obrigatório**:
- ✅ Consent banner antes de tracking
- ✅ Consent mode configurado (implementado)
- ✅ Opt-out fácil disponível
- ✅ Política de privacidade atualizada

**Implementado no código**:
- Consent banner (`src/utils/consentMode.js`)
- Bloqueio de tracking sem consentimento
- Update dinâmico de consent para GA/Meta
- Storage de preferências do usuário

## 🔍 Debug e Monitoramento

### Chrome DevTools

```javascript
// Verificar se gtag está carregado
window.gtag

// Verificar dataLayer
window.dataLayer

// Status do analytics
import { getAnalyticsStatus } from './utils/analytics';
console.log(getAnalyticsStatus());
```

### Google Analytics DebugView

1. Ativar modo debug:
```javascript
window.gtag('config', 'G-XXXXXXXXXX', {
  debug_mode: true
});
```

2. Acessar: Analytics → Configure → DebugView

### Extensões Chrome Recomendadas

- **Google Analytics Debugger** - Debug de eventos GA
- **Tag Assistant** - Verificação de tags do Google
- **Facebook Pixel Helper** - Debug Meta Pixel

## 📈 Métricas Chave para Acompanhar

### Blog Performance
- Pageviews por post
- Tempo médio na página
- Taxa de engajamento
- Posts mais lidos
- Categorias mais populares

### Conversões
- CTA clicks no blog
- Formulário de contato enviado
- Agendamentos iniciados
- Calls-to-action específicos

### Performance
- Core Web Vitals (LCP, FID, CLS)
- Tempo de carregamento
- Bounce rate
- Pages per session

### Funil
- Landing page → Blog
- Blog → Serviços
- Serviços → Contato
- Contato → Conversão

---

**Última Atualização**: 2025-09-30
**Status**: ⚠️ Aguardando configuração
**Prioridade**: Alta
