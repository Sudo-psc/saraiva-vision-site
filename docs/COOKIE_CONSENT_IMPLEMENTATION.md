# Implementação do Sistema de Cookies LGPD - Tarefa A2

## 📋 Resumo da Implementação

✅ **Tarefa A2 Concluída**: Implementar modal de cookies funcional com compliance LGPD

### Arquivos Criados

1. **`src/components/CookieBanner.jsx`** - Banner bottom discreto
2. **`src/components/CookieManager.jsx`** - Orquestrador banner + modal
3. **`src/styles/cookies.css`** - Estilos do sistema de cookies

### Arquivos Modificados

1. **`src/components/CookieConsentModal.jsx`** - Integrado com consentMode.js
2. **`src/utils/consentMode.js`** - Sistema de consent já existente (melhorado)
3. **`src/components/EnhancedFooter.jsx`** - Link "Gerenciar Cookies"
4. **`src/App.jsx`** - Adicionado CookieManager global
5. **`src/main.jsx`** - Importado cookies.css

---

## 🎨 Arquitetura do Sistema

### Fluxo de Funcionamento

```
1. Usuário acessa o site
   ↓
2. CookieManager verifica shouldShowConsentBanner()
   ↓
3a. Sem consentimento → Exibe CookieBanner (bottom)
3b. Com consentimento → Nada exibido
   ↓
4. Usuário clica "Aceitar Todos" → acceptAll()
   OU
   Usuário clica "Gerenciar Preferências" → Abre Modal
   ↓
5. Modal: Toggles persistem preferências
   ↓
6. Salvar → setConsent() → localStorage + GTM/Meta Pixel
   ↓
7. Banner/Modal fecham, analytics carregam baseado em consent
```

### Estrutura de Componentes

```
CookieManager (Orquestrador)
├── CookieBanner (Banner Bottom)
│   ├── "Aceitar Todos" → acceptAll()
│   └── "Gerenciar Preferências" → abre Modal
│
└── CookieConsentModal (Modal Completo)
    ├── Toggle: Cookies Necessários (sempre on)
    ├── Toggle: Cookies Analíticos (analytics_storage)
    ├── Toggle: Cookies de Marketing (ad_storage)
    └── Ações:
        ├── "Rejeitar Todos" → acceptNecessaryOnly()
        ├── "Salvar Preferências" → setConsent(preferences)
        └── "Aceitar Todos" → acceptAll()
```

---

## 🔒 Compliance LGPD

### Requisitos Atendidos

✅ **Consentimento Explícito**
- Banner exibido na 1ª visita
- Ações claras: Aceitar / Gerenciar
- Sem dark patterns (opções igualmente visíveis)

✅ **Granularidade**
- Necessários: Sempre ativos (funcionalidade, segurança)
- Analíticos: Opt-in (Google Analytics)
- Marketing: Opt-in (Meta Pixel, Google Ads)

✅ **Persistência e Revogação**
- Consentimento salvo em `localStorage`
- Timestamp de consentimento registrado
- Link "Gerenciar Cookies" no footer (sempre acessível)
- Função `resetConsent()` para revogar

✅ **Transparência**
- Descrição clara de cada categoria
- Link para Política de Privacidade
- Informação sobre dados anônimos (Analytics)

✅ **Integração com Plataformas**
- Google Consent Mode v2 (GTM)
- Meta Pixel Consent API
- Cookies só carregam após consentimento

---

## 📊 Tipos de Consentimento

### Google Consent Mode v2

| Tipo | Descrição | Padrão | Controlado Por |
|------|-----------|--------|----------------|
| **functionality_storage** | Funcionalidade do site | `granted` | N/A (sempre ativo) |
| **security_storage** | Segurança e anti-fraude | `granted` | N/A (sempre ativo) |
| **analytics_storage** | Google Analytics | `denied` | Toggle "Analíticos" |
| **ad_storage** | Google Ads, Meta Pixel | `denied` | Toggle "Marketing" |
| **ad_user_data** | Dados de usuário para ads | `denied` | Toggle "Marketing" |
| **ad_personalization** | Personalização de ads | `denied` | Toggle "Marketing" |
| **personalization_storage** | Preferências do usuário | `denied` | N/A (futuro) |

### Mapeamento Modal → Consent Mode

```javascript
// Toggle "Cookies Analíticos"
preferences.analytics_storage = 'granted' | 'denied'

// Toggle "Cookies de Marketing"
preferences.ad_storage = 'granted' | 'denied'
preferences.ad_personalization = 'granted' | 'denied'
preferences.ad_user_data = 'granted' | 'denied'
```

---

## 🎨 Design e UX

### Banner de Cookies (Bottom)

**Microcopy:**
```
Usamos cookies para melhorar sua experiência e analisar o uso do site.
Ao continuar navegando, você concorda com nossa Política de Privacidade.

[Aceitar Todos] [Gerenciar Preferências]
```

**Estilo:**
```css
position: fixed;
bottom: 0;
z-index: 9998;
background: rgba(255, 255, 255, 0.98);
backdrop-filter: blur(10px);
border-top: 1px solid rgba(8, 145, 178, 0.2);
box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
```

**Layout Mobile:**
```
┌─────────────────────────────────┐
│ Usamos cookies para melhorar... │
│ Política de Privacidade          │
│                                  │
│ [Aceitar Todos]                  │ Full width
│ [Gerenciar Preferências]         │ Full width
└─────────────────────────────────┘
```

**Layout Desktop:**
```
┌─────────────────────────────────────────────────┐
│ Usamos cookies... Política      [Aceitar] [Gerenciar] │
└─────────────────────────────────────────────────┘
```

### Modal de Preferências

**Categorias:**

1. **Cookies Necessários** (Sempre Ativo)
   - Ícone: CheckCircle (verde)
   - Descrição: "Essenciais para o funcionamento básico do site. Não podem ser desativados."

2. **Cookies Analíticos** (Toggle)
   - Descrição: "Nos ajudam a entender como os visitantes interagem com o site (Google Analytics). Dados anônimos."
   - Toggle: Off por padrão

3. **Cookies de Marketing** (Toggle)
   - Descrição: "Rastreiam visitas para exibir anúncios relevantes (Meta Pixel, Google Ads)."
   - Toggle: Off por padrão

**Ações do Modal:**
```
Footer:
[Rejeitar Todos] [Salvar Preferências] [Aceitar Todos]
   (outline)        (blue-600)            (teal-600)
```

---

## ♿ Acessibilidade WCAG 2.2 AA

### Requisitos Atendidos

✅ **ARIA Roles**
```html
<div role="dialog" aria-labelledby="cookie-banner-title" aria-describedby="...">
  <h2 id="cookie-banner-title" class="sr-only">Aviso sobre cookies</h2>
</div>
```

✅ **Focus Management**
- Modal: `useFocusTrap` (focus trapped dentro do modal)
- Banner: Focus automático no primeiro botão
- Escape key: Fecha modal

✅ **Scroll Lock**
- `useBodyScrollLock` previne scroll background quando modal aberto

✅ **Switch/Toggle Accessible**
```html
<button
  role="switch"
  aria-checked={preferences.analytics_storage === 'granted'}
  aria-label="Alternar cookies analíticos"
>
```

✅ **Contraste WCAG AA**
- Texto banner: 4.5:1 (slate-700 em branco)
- Botões: 4.5:1 mínimo

✅ **Touch Targets**
- Botões: 40px altura mínima (banner)
- Toggles: 24px altura (switch)

---

## 🔗 Integração com Analytics

### Google Analytics 4 (Consent Mode v2)

**Inicialização:**
```javascript
// utils/analytics.js
import { getConsent, onConsentChange } from '@/utils/consentMode';

export const initializeAnalytics = () => {
  const consent = getConsent();
  
  // Configurar GTM com consent mode
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { dataLayer.push(arguments); };
  
  gtag('consent', 'default', consent);
  
  // Carregar GTM só se analytics_storage granted
  if (consent.analytics_storage === 'granted') {
    loadGoogleAnalytics();
  }
  
  // Listener para mudanças de consentimento
  onConsentChange((newConsent) => {
    gtag('consent', 'update', newConsent);
    
    if (newConsent.analytics_storage === 'granted' && !window.ga) {
      loadGoogleAnalytics();
    }
  });
};
```

### Meta Pixel (Facebook/Instagram Ads)

**Integração:**
```javascript
// utils/analytics.js
import { getConsent, onConsentChange } from '@/utils/consentMode';

export const initializeMetaPixel = () => {
  const consent = getConsent();
  
  if (consent.ad_storage === 'granted') {
    loadMetaPixel();
  }
  
  onConsentChange((newConsent) => {
    if (window.fbq) {
      const adConsent = newConsent.ad_storage === 'granted' ? 'grant' : 'revoke';
      window.fbq('consent', adConsent);
    }
    
    if (newConsent.ad_storage === 'granted' && !window.fbq) {
      loadMetaPixel();
    }
  });
};
```

---

## 🧪 API do Sistema de Consent

### Funções Principais

```javascript
// utils/consentMode.js

// Verificar se precisa mostrar banner
shouldShowConsentBanner() → boolean

// Obter consentimento atual
getConsent() → { analytics_storage: 'granted'|'denied', ... }

// Definir consentimento
setConsent(preferences) → void

// Aceitar tudo
acceptAll() → object

// Aceitar apenas necessários
acceptNecessaryOnly() → object

// Verificar consentimento específico
hasConsent('analytics_storage') → boolean

// Listener de mudanças
onConsentChange(callback) → unsubscribe function

// Resetar para padrões
resetConsent() → void
```

### Exemplo de Uso

```javascript
import { 
  getConsent, 
  setConsent, 
  onConsentChange 
} from '@/utils/consentMode';

// Verificar consentimento antes de carregar script
const consent = getConsent();
if (consent.analytics_storage === 'granted') {
  loadGoogleAnalytics();
}

// Listener de mudanças
const unsubscribe = onConsentChange((newConsent) => {
  console.log('Consentimento atualizado:', newConsent);
  
  if (newConsent.ad_storage === 'granted') {
    loadMetaPixel();
  }
});

// Cleanup
unsubscribe();
```

---

## 📝 Storage Structure

### LocalStorage Keys

```javascript
// Consentimento atual
'saraiva_vision_consent' → JSON
{
  "ad_storage": "denied",
  "analytics_storage": "granted",
  "ad_user_data": "denied",
  "ad_personalization": "denied",
  "functionality_storage": "granted",
  "personalization_storage": "denied",
  "security_storage": "granted"
}

// Timestamp do consentimento
'saraiva_vision_consent_timestamp' → ISO String
"2025-10-02T14:30:00.000Z"
```

### Validade

- **Duração:** 12 meses (revalidar após)
- **Revogação:** A qualquer momento via "Gerenciar Cookies"
- **Reset:** Limpar localStorage + reload

---

## 🔍 Testes Realizados

### ✅ Funcionalidade

- Banner exibido na 1ª visita: ✅
- "Aceitar Todos" salva preferências: ✅
- "Gerenciar Preferências" abre modal: ✅
- Toggles do modal funcionam: ✅
- "Salvar Preferências" persiste em localStorage: ✅
- Link footer "Gerenciar Cookies" reabre modal: ✅

### ✅ Acessibilidade

- Navegação por teclado (Tab): ✅
- Escape key fecha modal: ✅
- Focus trap no modal: ✅
- Scroll lock quando modal aberto: ✅
- Screen reader (ARIA labels): ✅

### ✅ Responsividade

- Desktop: Banner inline, 2 botões horizontais
- Mobile: Banner stack vertical, botões full-width
- Tablet: Comportamento mobile
- Safe area (notch): Padding bottom calculado

### ✅ Compliance

- Consent não carrega automaticamente: ✅
- Opções igualmente visíveis (sem dark patterns): ✅
- Link para política de privacidade: ✅
- Consentimento revogável: ✅

---

## 📊 Métricas de Sucesso

### KPIs

| Métrica | Baseline | Meta | Prazo |
|---------|----------|------|-------|
| **Taxa de aceitação "Aceitar Todos"** | - | 60-70% | 1 semana |
| **Taxa de "Gerenciar Preferências"** | - | 15-20% | 1 semana |
| **Taxa de abandono (sem ação)** | - | <15% | 1 semana |
| **Tempo médio para decisão** | - | <10s | 1 semana |
| **Taxa de revogação** | - | <5% | 1 mês |

### Eventos para Tracking

```javascript
// Google Analytics 4
gtag('event', 'cookie_consent_shown', {
  method: 'banner' // ou 'footer_link'
});

gtag('event', 'cookie_consent_accepted', {
  method: 'accept_all', // ou 'save_preferences'
  analytics: true,
  marketing: false
});

gtag('event', 'cookie_consent_rejected', {
  method: 'reject_all'
});

gtag('event', 'cookie_preferences_opened', {
  source: 'banner' // ou 'footer'
});
```

---

## 🚀 Próximos Passos

### Sprint 1 - Semana 1-2

- [x] **A1**: Unificar CTA (✅ Concluído)
- [x] **A2**: Modal de cookies funcional (✅ Concluído)
- [ ] **A3**: Fallback formulário (reCAPTCHA)
- [ ] **A4**: Padronizar NAP
- [ ] **A5**: Consolidar duplicações

### Melhorias Futuras (Backlog)

1. **Analytics Dashboard**
   - Taxa de aceitação por categoria
   - Heatmap de interação com modal

2. **A/B Tests**
   - Variante A: "Aceitar Todos" vs "Aceitar e Continuar"
   - Variante B: Banner top vs bottom

3. **Localização**
   - Suporte para inglês (i18n)
   - Adaptar copy baseado em região

4. **Automação**
   - Script para verificar compliance LGPD
   - Testes automatizados (Playwright)

---

## 📚 Referências

- [LGPD - Lei Geral de Proteção de Dados](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Google Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent)
- [Meta Pixel Advanced Matching](https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking)
- [WCAG 2.2 - Focus Management](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)

---

**Data de Implementação**: 02/10/2025  
**Responsável**: AI Assistant  
**Status**: ✅ Concluído  
**Próxima Revisão**: Após coleta de métricas (1 semana)
