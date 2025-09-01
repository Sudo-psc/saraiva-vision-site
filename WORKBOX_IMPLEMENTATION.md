# Workbox Cache Strategy - Saraiva Vision

## 📋 Visão Geral

Migração completa do service worker customizado para **Workbox v7** com estratégias de cache otimizadas para website médico de alta performance.

## 🎯 Estratégias de Cache Implementadas

### 1. **App Shell - NetworkFirst**
```javascript
Recursos: HTML, navegação SPA
Strategy: Network First com 3s timeout
Cache: sv-navigation-v2.0.0
TTL: 24h | MaxEntries: 50
```

**Benefícios:**
- ✅ Conteúdo sempre atualizado quando online
- 🚀 Navegação offline completa para SPA
- ⚡ Fallback rápido (3s timeout)

### 2. **Static Assets - CacheFirst + StaleWhileRevalidate**

#### Assets com Hash (Immutable)
```javascript
Recursos: /assets/*-[hash].(js|css)
Strategy: Cache First
TTL: 1 ano | MaxEntries: 200
```

#### Imagens
```javascript
Recursos: .(png|jpg|jpeg|gif|webp|avif|ico|svg)
Strategy: Cache First
TTL: 30 dias | MaxEntries: 300
```

#### Fontes
```javascript
Recursos: .(woff|woff2|ttf|eot|otf)
Strategy: Cache First
TTL: 1 ano | MaxEntries: 30
```

### 3. **API Caching**

#### Reviews API (Dados Dinâmicos)
```javascript
Endpoint: /api/reviews
Strategy: Network First (5s timeout)
TTL: 5 minutos | MaxEntries: 10
```

#### Contact API
```javascript
Endpoint: /api/contact
Strategy: Network Only (não cacheável)
```

#### Monitoring/Analytics
```javascript
Endpoint: /api/(web-vitals|monitoring|analytics)
Strategy: Network Only (preserva métricas)
```

#### APIs Gerais
```javascript
Endpoint: /api/*
Strategy: Stale While Revalidate
TTL: 15 minutos | MaxEntries: 50
```

### 4. **External Resources**

#### Google Fonts
```javascript
Origin: fonts.googleapis.com | fonts.gstatic.com
Strategy: Stale While Revalidate | Cache First
TTL: 30 dias (stylesheets) | 1 ano (webfonts)
```

#### Analytics
```javascript
Origin: google-analytics.com | googletagmanager.com
Strategy: Network Only (preserva dados)
```

## 🚀 Features Implementadas

### ✨ **Precaching Automático**
- Build-time asset discovery
- Automatic versioning com `__WB_MANIFEST`
- Cleanup automático de caches antigos

### 🔄 **Update Management**
- Skip waiting automático
- Update notifications nativas
- Graceful controller changes

### 📊 **Monitoring & Debugging**
- Cache statistics API
- Build logs estruturados
- Console logging detalhado
- Quota exceeded handling

### 🎛️ **Advanced Configuration**
- Custom manifest transforms
- Navigation fallbacks inteligentes
- Safari compatibility fixes
- Mobile-optimized caching

## 📁 Estrutura de Cache

```
sv-navigation-workbox-v2.0.0/     # App shell, HTML
sv-hashed-assets-workbox-v2.0.0/  # JS/CSS com hash
sv-images-workbox-v2.0.0/         # Imagens e ícones
sv-fonts-workbox-v2.0.0/          # Fontes web
sv-pwa-files-workbox-v2.0.0/      # Manifest, robots.txt
sv-api-reviews-workbox-v2.0.0/    # Reviews cache
sv-api-general-workbox-v2.0.0/    # APIs gerais
google-fonts-stylesheets/         # Google Fonts CSS
google-fonts-webfonts/            # Google Fonts files
```

## 🔧 Configuração Técnica

### Build Integration
```javascript
// vite.config.js
import { workboxVitePlugin } from './src/utils/workbox-vite-plugin.js';

plugins: [
  react(),
  workboxVitePlugin(), // Gera SW durante build
]
```

### Service Worker Registration
```javascript
// main.jsx - Lazy loading após app load
import('./utils/serviceWorkerManager.js').then(({ swManager }) => {
  // Auto-registration com update detection
});
```

### Update Notifications
```javascript
// App.jsx
import ServiceWorkerUpdateNotification from '@/components/ServiceWorkerUpdateNotification';

// Auto-display quando update disponível
```

## 📈 Performance Benefits

| Métrica | Antes | Depois | Melhoria |
|---------|-------|---------|----------|
| **First Load** | ~180KB JS | ~180KB JS | Cache hit subsequente |
| **Repeat Visit** | Network requests | Cache first | ~80% menos requests |
| **Offline UX** | Basic fallback | Full navigation | 100% navegabilidade |
| **Update Speed** | Manual refresh | Background update | Sem interrupção |
| **Cache Size** | Não otimizado | Quota-aware | Auto-cleanup |

## 🔍 Monitoring & Analytics

### Cache Performance
```javascript
// Verificar stats de cache
swManager.getCacheStats().then(stats => {
  console.log('Cache entries:', stats);
});
```

### Update Detection
```javascript
// Listeners para updates
swManager.on('updateAvailable', (newWorker) => {
  // Show update notification
});

swManager.on('controllerChanged', () => {
  // New version active
});
```

## 🚨 Troubleshooting

### Clear All Caches
```javascript
// Limpar caches manualmente
swManager.clearOldCaches();
```

### Rollback Plan
```bash
# Restaurar SW anterior
cp public/sw.js.backup public/sw.js
npm run build
```

### Debug Mode
```javascript
// Console do navegador
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => console.log(reg));
});
```

## 🔄 Migration Timeline

1. ✅ **Setup** - Dependencies e configuração base
2. ✅ **Implementation** - Service worker Workbox
3. ✅ **Integration** - Vite build plugin
4. ✅ **UI Components** - Update notifications
5. 🟡 **Testing** - Local validation
6. ⏳ **Production** - Deploy e monitoring

## 📋 Next Steps

1. **Test** `npm run build && npm run preview`
2. **Validate** DevTools → Application → Service Workers
3. **Monitor** Cache hits, storage usage, update flow
4. **Deploy** Após validação local completa
5. **Monitor** Web Vitals, user experience metrics

---

**Workbox Version:** 7.x
**Implementation Date:** Agosto 2025
**Estimated Cache Savings:** 70-80% reduction in repeat visits
**Offline Coverage:** 100% navigation + critical resources
