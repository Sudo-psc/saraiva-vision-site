# 🚀 PostHog - Quick Start Guide

## ✅ Implementação Completa

PostHog foi configurado com sucesso no Saraiva Vision! Todos os arquivos foram criados e integrados.

## 📋 Checklist de Implementação

- [x] PostHog SDK instalado (`posthog-js ^1.200.0`)
- [x] PostHogProvider React criado (`src/providers/PostHogProvider.jsx`)
- [x] Hook customizado criado (`src/hooks/useHealthcareAnalytics.js`)
- [x] Integrado no `main.jsx`
- [x] Exemplos de uso criados (`src/examples/PostHogIntegrationExample.jsx`)
- [x] Documentação completa (`docs/POSTHOG_SETUP.md`)
- [x] Script de teste criado (`scripts/test-posthog.cjs`)
- [x] Build testado com sucesso ✅

## 🔑 Próximos Passos

### 1. Criar Conta PostHog

```bash
# Acesse: https://posthog.com/signup
# Crie uma conta e um novo projeto
```

### 2. Obter API Keys

No PostHog Dashboard:
1. Vá em **Project Settings** → **Project API Key**
2. Copie o **Project API Key** (começa com `phc_...`)
3. Copie o **Project ID**
4. Em **Personal API Keys** → Crie uma nova key

### 3. Configurar .env.production

Edite `/home/saraiva-vision-site/.env.production`:

```bash
# PostHog Analytics Configuration
VITE_POSTHOG_KEY=phc_seu_project_api_key_aqui
VITE_POSTHOG_HOST=https://app.posthog.com
POSTHOG_API_KEY=seu_personal_api_key_aqui
POSTHOG_PROJECT_ID=12345
```

**Substitua os placeholders pelos valores reais do PostHog Dashboard**

### 4. Build e Deploy

```bash
# Build com Vite
npm run build:vite

# Deploy
sudo npm run deploy:quick

# Verificar
curl -I https://saraivavision.com.br
```

### 5. Testar Configuração

```bash
# Rodar script de teste
node scripts/test-posthog.cjs

# Deve mostrar:
# ✅ All checks passed
```

### 6. Verificar no Browser

1. Acesse: `https://saraivavision.com.br`
2. Abra DevTools → Console
3. Deve ver: `[PostHog] Initialized successfully`
4. No PostHog Dashboard → Activity → Live Events
5. Eventos devem aparecer em tempo real

## 🎯 Como Usar

### Tracking Básico

```jsx
import useHealthcareAnalytics from '../hooks/useHealthcareAnalytics';

function MyComponent() {
  const { trackAppointmentBooking } = useHealthcareAnalytics();

  const handleClick = () => {
    trackAppointmentBooking('hero_button', {
      specialty: 'ophthalmology'
    });

    window.location.href = '/agendamento';
  };

  return <button onClick={handleClick}>Agendar</button>;
}
```

### Feature Flags

```jsx
import { usePostHog } from '../providers/PostHogProvider';

function ExperimentalFeature() {
  const { isFeatureEnabled } = usePostHog();

  if (!isFeatureEnabled('new_feature', false)) {
    return <OldFeature />;
  }

  return <NewFeature />;
}
```

### Page View Tracking

```jsx
import { useEffect } from 'react';
import useHealthcareAnalytics from '../hooks/useHealthcareAnalytics';

function BlogPost({ postId, postTitle }) {
  const { trackBlogView } = useHealthcareAnalytics();

  useEffect(() => {
    trackBlogView(postId, postTitle);
  }, [postId]);

  return <article>{/* content */}</article>;
}
```

## 📊 Eventos Disponíveis

### Conversão
- `trackAppointmentBooking()` - Agendamento
- `trackPhoneCall()` - Clique em telefone
- `trackWhatsAppClick()` - Clique WhatsApp
- `trackContactSubmit()` - Formulário de contato

### Engajamento
- `trackPageView()` - Visualização de página
- `trackBlogView()` - Post do blog
- `trackServiceView()` - Serviço médico
- `trackSocialClick()` - Redes sociais

### Performance
- `trackPerformance()` - Métricas de performance
- `trackError()` - Erros da aplicação

**📚 Veja mais em:** `docs/POSTHOG_SETUP.md` (12 exemplos completos)

## 🔒 LGPD Compliance

✅ **Configurações de Privacidade:**

- `respect_dnt: true` - Respeita Do Not Track
- `autocapture: false` - Apenas tracking manual
- `maskAllInputs: true` - Mascara inputs
- Input masking: emails, telefones, senhas
- Data sanitization: Remove CPF, RG, dados médicos

**❌ NUNCA rastreie:**
- CPF, RG, dados de saúde
- Emails/telefones sem mascarar
- Nomes de pacientes
- Prontuários médicos

## 🧪 Testes

### Teste Local (Dev)

```bash
# Habilitar PostHog em dev
echo "VITE_POSTHOG_ENABLE_DEV=true" >> .env.local

# Rodar dev
npm run dev:vite

# Abrir: http://localhost:5173
# Console deve mostrar: [PostHog] Initialized successfully
```

### Teste Produção

```bash
# Build e deploy
npm run build:vite
sudo npm run deploy:quick

# Verificar
curl -s https://saraivavision.com.br | grep -i posthog

# Acessar site e verificar console
```

### Verificar Dashboard

1. PostHog Dashboard: https://app.posthog.com
2. Activity → Live Events
3. Clicar em botões no site
4. Eventos devem aparecer em segundos

## 📁 Arquivos Criados

```
src/
├── providers/
│   └── PostHogProvider.jsx          # Provider principal
├── hooks/
│   └── useHealthcareAnalytics.js    # Hook customizado
├── examples/
│   └── PostHogIntegrationExample.jsx # 12 exemplos
└── main.jsx                          # ✅ Integrado

docs/
└── POSTHOG_SETUP.md                  # Doc completa

scripts/
└── test-posthog.cjs                  # Script de teste
```

## 🐛 Troubleshooting

### PostHog não inicializa

**Console mostra:** `PostHog key not found`

**Solução:**
1. Verificar `.env.production` tem `VITE_POSTHOG_KEY`
2. Rebuild: `npm run build:vite`
3. Verificar: `grep VITE_POSTHOG_KEY .env.production`

### Eventos não aparecem no dashboard

**Problema:** Eventos enviados mas não aparecem

**Solução:**
1. Verificar console: `posthog.debug(true)` em dev
2. Aguardar até 60 segundos
3. Verificar project ID está correto
4. Verificar erros de CORS no console

### Session recording não funciona

**Problema:** Gravação não ativa

**Solução:**
1. Ativar no PostHog: Project Settings → Recordings
2. Verificar plano permite session recording
3. Verificar `disable_session_recording: false`

## 📈 Dashboards Recomendados

### 1. Dashboard de Conversão
- Total de agendamentos (`appointment_booking`)
- Taxa de conversão
- Funil: Page View → Service View → Appointment

### 2. Dashboard de Engajamento
- Posts mais lidos (`blog_post_viewed`)
- Tempo médio de leitura
- Serviços mais visualizados

### 3. Dashboard de Performance
- Web Vitals (LCP, INP, CLS, FCP, TTFB)
- Erros da aplicação
- Long tasks

## 🔄 Feature Flags - Como Criar

1. PostHog Dashboard → Feature Flags
2. Criar nova flag: `new_appointment_flow`
3. Configurar rollout (ex: 10% dos usuários)
4. No código:

```jsx
const { isFeatureEnabled } = usePostHog();

if (isFeatureEnabled('new_appointment_flow')) {
  return <NewFlow />;
}

return <OldFlow />;
```

## 📞 Suporte

- **Documentação Completa:** `docs/POSTHOG_SETUP.md`
- **Exemplos:** `src/examples/PostHogIntegrationExample.jsx`
- **PostHog Docs:** https://posthog.com/docs
- **PostHog Support:** https://posthog.com/support

---

## ✨ Resumo

**Status:** ✅ Implementação completa
**Compliance:** ✅ LGPD | ✅ CFM
**Build:** ✅ Testado com sucesso

**Ação Necessária:**
1. Criar conta PostHog
2. Configurar API keys no `.env.production`
3. Build e deploy
4. Testar no browser
5. Criar dashboards no PostHog

**Tempo estimado:** 15-20 minutos

---

**Atualizado:** 2025-10-07
**Versão:** 1.0.0
