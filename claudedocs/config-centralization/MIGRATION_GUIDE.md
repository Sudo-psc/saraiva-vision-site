# Guia de Migração - Sistema de Configuração Centralizada

**Data**: 2025-10-18
**Versão**: 1.0.0
**Autor**: Dr. Philipe Saraiva Cruz

---

## 🎯 Objetivo

Este guia fornece instruções passo a passo para migrar componentes e serviços do sistema antigo (clinicInfo.js, NAP_CANONICAL) para o novo sistema de configuração centralizada.

---

## 📋 Visão Geral da Migração

### Sistema Antigo vs Sistema Novo

| Aspecto | Sistema Antigo | Sistema Novo |
|---------|----------------|--------------|
| **Localização** | `src/lib/clinicInfo.js` | `src/config/config.base.js` |
| **Acesso** | Import direto | Hook `useConfig()` |
| **Validação** | Manual | Automática |
| **Cache** | Não | Sim (ConfigService) |
| **Tipos** | Não | Sim (PropTypes) |

---

## 🔄 Padrões de Migração

### 1. Dados da Clínica (NAP)

#### **Antes:**
```javascript
import { clinicInfo } from '../lib/clinicInfo';

function Component() {
  const name = clinicInfo.name;
  const phone = clinicInfo.phone;
  const address = clinicInfo.address.street;
}
```

#### **Depois:**
```javascript
import { useConfig } from '@/config';

function Component() {
  const { business } = useConfig();

  const name = business.name;
  const phone = business.phone.primary.display;
  const address = business.address.street;
}
```

---

### 2. Endereços Formatados

#### **Antes:**
```javascript
import { clinicInfo } from '../lib/clinicInfo';

function Component() {
  const address = `${clinicInfo.streetAddress}, ${clinicInfo.city}`;
}
```

#### **Depois:**
```javascript
import { useConfig } from '@/config';

function Component() {
  const { getFormattedAddress } = useConfig();

  const address = getFormattedAddress('medium'); // ou 'short', 'long', 'full'
}
```

---

### 3. Telefone e WhatsApp

#### **Antes:**
```javascript
import { clinicInfo } from '../lib/clinicInfo';

function Component() {
  const phone = clinicInfo.phoneDisplay;
  const whatsapp = clinicInfo.whatsapp24h;
}
```

#### **Depois:**
```javascript
import { useConfig } from '@/config';

function Component() {
  const { getFormattedPhone, getWhatsAppUrl } = useConfig();

  const phoneDisplay = getFormattedPhone('display');
  const phoneE164 = getFormattedPhone('e164');
  const whatsappUrl = getWhatsAppUrl('Mensagem customizada');
}
```

---

### 4. Feature Flags

#### **Antes:**
```javascript
const FEATURE_ENABLED = true; // hardcoded
```

#### **Depois:**
```javascript
import { useConfig } from '@/config';

function Component() {
  const { isFeatureEnabled } = useConfig();

  const showWidget = isFeatureEnabled('accessibilityWidget');
  const enableSearch = isFeatureEnabled('blogSearch');
}
```

---

### 5. APIs Externas

#### **Antes:**
```javascript
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
```

#### **Depois:**
```javascript
import { useConfig } from '@/config';

function Component() {
  const { getApiConfig } = useConfig();

  const googleMaps = getApiConfig('googleMaps');
  const supabase = getApiConfig('supabase');

  const apiKey = googleMaps.apiKey;
  const placeId = googleMaps.placeId;
}
```

---

### 6. Analytics e Tracking

#### **Antes:**
```javascript
const GA_ID = import.meta.env.VITE_GA_ID || 'G-LXWRK8ELS6';
const GTM_ID = import.meta.env.VITE_GTM_ID || 'GTM-KF2NP85D';
```

#### **Depois:**
```javascript
import { useConfig } from '@/config';

function Component() {
  const { tracking } = useConfig();

  const gaId = tracking.googleAnalytics.measurementId;
  const gtmId = tracking.googleTagManager.containerId;
  const posthogKey = tracking.postHog.apiKey;
}
```

---

### 7. Tema e Estilo

#### **Antes:**
```javascript
const PRIMARY_COLOR = '#0066CC'; // hardcoded
```

#### **Depois:**
```javascript
import { useConfig } from '@/config';

function Component() {
  const { theme } = useConfig();

  const primaryColor = theme.colors.primary;
  const fonts = theme.fonts;
  const breakpoints = theme.breakpoints;
}
```

---

### 8. SEO Metadata

#### **Antes:**
```javascript
function PageComponent() {
  return (
    <Helmet>
      <title>Página | Saraiva Vision</title>
      <meta name="description" content="Descrição..." />
    </Helmet>
  );
}
```

#### **Depois:**
```javascript
import { useConfig } from '@/config';

function PageComponent() {
  const { getSeoConfig } = useConfig();
  const seo = getSeoConfig('home'); // ou null para defaults

  return (
    <Helmet>
      <title>{seo.defaultTitle}</title>
      <meta name="description" content={seo.defaultDescription} />
      <meta property="og:image" content={seo.openGraph.images[0].url} />
    </Helmet>
  );
}
```

---

### 9. Compliance (LGPD/CFM)

#### **Antes:**
```javascript
import { clinicInfo } from '../lib/clinicInfo';

const dpoEmail = clinicInfo.dpoEmail;
const doctor = clinicInfo.responsiblePhysician;
```

#### **Depois:**
```javascript
import { useConfig } from '@/config';

function Component() {
  const { compliance, business } = useConfig();

  const dpoEmail = compliance.lgpd.dpoEmail;
  const doctor = business.doctor.displayName;
  const crm = business.doctor.crm;
}
```

---

## 🔧 Migração de Serviços (Não-React)

Para código que não usa React (utilitários, API routes, etc):

#### **Antes:**
```javascript
import { clinicInfo } from '../lib/clinicInfo';

const name = clinicInfo.name;
```

#### **Depois:**
```javascript
import configService from '@/config/services/ConfigService';

await configService.initialize(); // uma vez

const name = configService.get('business.name');
const phone = configService.getFormattedPhone('display');
```

---

## 📝 Checklist de Migração por Componente

Para cada componente a ser migrado:

- [ ] Identificar imports de `clinicInfo`, `NAP_CANONICAL`, ou env vars diretas
- [ ] Adicionar `import { useConfig } from '@/config';`
- [ ] Substituir acesso direto por calls ao hook
- [ ] Verificar formatações (endereço, telefone, etc)
- [ ] Testar o componente localmente
- [ ] Executar testes automatizados
- [ ] Verificar em produção (se aplicável)

---

## ⚙️ Configuração do App

### main.jsx ou App.jsx

Envolver a aplicação com ConfigProvider:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from '@/config';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
```

---

## 🧪 Testes

### Testar Componente Migrado

```javascript
import { render } from '@testing-library/react';
import { ConfigProvider } from '@/config';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('deve renderizar com configurações', () => {
    render(
      <ConfigProvider>
        <MyComponent />
      </ConfigProvider>
    );

    // assertions...
  });

  it('deve usar configurações customizadas', () => {
    render(
      <ConfigProvider overrides={{ 'business.name': 'Test Clinic' }}>
        <MyComponent />
      </ConfigProvider>
    );

    // assertions...
  });
});
```

---

## 🚨 Possíveis Problemas e Soluções

### Problema 1: "useConfig must be used within ConfigProvider"

**Solução**: Garantir que o componente está dentro de `<ConfigProvider>`

```javascript
// ❌ Errado
<MyComponent />

// ✅ Correto
<ConfigProvider>
  <MyComponent />
</ConfigProvider>
```

---

### Problema 2: Valor de configuração não atualiza

**Solução**: Limpar cache do ConfigService

```javascript
import configService from '@/config/services/ConfigService';

configService.clearCache();
```

---

### Problema 3: Feature flag não funciona

**Solução**: Verificar nome correto no config.base.js

```javascript
const { isFeatureEnabled } = useConfig();

// ❌ Errado
const enabled = isFeatureEnabled('myFeature');

// ✅ Correto (verificar config.base.js)
const enabled = isFeatureEnabled('accessibilityWidget');
```

---

## 📚 Referências

- [config.base.js](../src/config/config.base.js) - Configuração base completa
- [ConfigService.js](../src/config/services/ConfigService.js) - Serviço de configuração
- [ConfigProvider.jsx](../src/config/ConfigProvider.jsx) - Provider React
- [Testes](../src/config/__tests__/) - Exemplos de uso em testes

---

## 🎯 Próximos Passos

1. Migrar componentes principais (Footer, Header, Contact)
2. Migrar páginas (Home, About, Services)
3. Migrar hooks customizados
4. Migrar utilitários
5. Remover imports antigos (`clinicInfo`, `NAP_CANONICAL`)
6. Executar testes completos
7. Deploy e verificação em produção

---

## ✅ Verificação Pós-Migração

Após migrar todos os componentes:

```bash
# Verificar se não há imports antigos
grep -r "from '../lib/clinicInfo'" src/
grep -r "from './lib/clinicInfo'" src/
grep -r "from '@/lib/clinicInfo'" src/

# Deve retornar vazio ou apenas arquivos de compatibilidade
```

---

## 💡 Dicas

1. **Migre gradualmente**: Um componente por vez
2. **Teste cada migração**: Não acumule mudanças
3. **Use TypeScript**: Para type safety adicional
4. **Documente edge cases**: Se encontrar casos especiais
5. **Mantenha compatibilidade**: Pelo menos temporariamente

---

## 📞 Suporte

Em caso de dúvidas ou problemas na migração:

1. Consultar este guia
2. Verificar testes existentes em `src/config/__tests__/`
3. Revisar exemplos em `claudedocs/config-centralization/08-exemplos-codigo.md`
4. Documentar problemas encontrados para futuras referências

---

**Última atualização**: 2025-10-18
**Versão do Guia**: 1.0.0
