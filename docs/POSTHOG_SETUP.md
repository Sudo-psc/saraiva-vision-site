# PostHog Analytics - Guia de Configuração

## 📊 Visão Geral

PostHog é a plataforma de analytics e feature flags do Saraiva Vision. Esta implementação está em **conformidade com LGPD/CFM** para uso em plataformas de saúde.

## ✅ Status da Implementação

- [x] PostHog SDK instalado (`posthog-js ^1.200.0`)
- [x] PostHogProvider React criado
- [x] Integração no `main.jsx`
- [x] Custom hook `useHealthcareAnalytics` criado
- [x] Variáveis de ambiente configuradas
- [x] Exemplos de uso documentados

## 🚀 Como Configurar

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env.production`:

```bash
# PostHog Analytics Configuration
VITE_POSTHOG_KEY=phc_seu_public_key_aqui
VITE_POSTHOG_HOST=https://app.posthog.com
POSTHOG_API_KEY=seu_api_key_aqui
POSTHOG_PROJECT_ID=seu_project_id_aqui
```

**Onde encontrar:**
- `VITE_POSTHOG_KEY`: PostHog Dashboard → Project Settings → Project API Key
- `VITE_POSTHOG_HOST`: Geralmente `https://app.posthog.com` (ou self-hosted)
- `POSTHOG_API_KEY`: PostHog Dashboard → Project Settings → API Keys
- `POSTHOG_PROJECT_ID`: PostHog Dashboard → Project Settings

### 2. Configuração Optional de Desenvolvimento

Para habilitar PostHog em desenvolvimento:

```bash
# .env.local
VITE_POSTHOG_ENABLE_DEV=true
```

⚠️ **Por padrão, PostHog está desabilitado em desenvolvimento**

## 📦 Arquitetura

```
src/
├── providers/
│   └── PostHogProvider.jsx       # Provider React com contexto
├── hooks/
│   └── useHealthcareAnalytics.js # Hook customizado para healthcare
├── examples/
│   └── PostHogIntegrationExample.jsx # 12 exemplos de uso
└── main.jsx                      # Integração no app
```

## 🔒 Privacidade e LGPD

### Configurações de Privacidade

✅ **Implementado:**
- `respect_dnt: true` - Respeita Do Not Track
- `autocapture: false` - Tracking manual apenas
- `maskAllInputs: true` - Mascara todos os inputs
- `maskInputOptions` - Mascara emails, telefones, senhas
- `sanitize_properties` - Remove dados sensíveis (CPF, RG, dados médicos)

### Dados NUNCA Rastreados

❌ **Proibido rastrear:**
- CPF
- RG
- Nome do paciente
- Prontuário médico
- Dados de saúde (diagnósticos, tratamentos)
- Email não mascarado
- Telefone não mascarado

### Dados Permitidos

✅ **Pode rastrear:**
- User ID hash/anonimizado
- Tipo de usuário (paciente, visitante)
- Comportamento de navegação (páginas, cliques)
- Eventos de conversão (agendamento, contato)
- Métricas de performance
- Feature flags

## 🎯 Como Usar

### 1. Hook `useHealthcareAnalytics`

```jsx
import useHealthcareAnalytics from '../hooks/useHealthcareAnalytics';

function MyComponent() {
  const { trackAppointmentBooking } = useHealthcareAnalytics();

  const handleBooking = () => {
    trackAppointmentBooking('hero_button', {
      appointment_type: 'consultation'
    });
  };

  return <button onClick={handleBooking}>Agendar</button>;
}
```

### 2. Hook `usePostHog` (Avançado)

```jsx
import { usePostHog } from '../providers/PostHogProvider';

function MyComponent() {
  const { trackEvent, isFeatureEnabled } = usePostHog();

  const showNewFeature = isFeatureEnabled('new_feature', false);

  return showNewFeature ? <NewFeature /> : <OldFeature />;
}
```

## 📋 Eventos Disponíveis

### Conversão

- `trackAppointmentBooking()` - Agendamento de consulta
- `trackPhoneCall()` - Clique em telefone
- `trackWhatsAppClick()` - Clique no WhatsApp
- `trackContactSubmit()` - Envio de formulário

### Engajamento

- `trackPageView()` - Visualização de página
- `trackBlogView()` - Visualização de post do blog
- `trackBlogEngagement()` - Engajamento com post (tempo de leitura)
- `trackServiceView()` - Visualização de serviço
- `trackSocialClick()` - Clique em rede social
- `trackFAQClick()` - Clique em FAQ

### Performance

- `trackPerformance()` - Métricas de performance
- `trackError()` - Erros da aplicação

### Sessão

- `trackSessionStart()` - Início de sessão
- `trackSessionEnd()` - Fim de sessão

## 🧪 Exemplos de Uso

Veja 12 exemplos completos em: `src/examples/PostHogIntegrationExample.jsx`

### Exemplo 1: Botão de Agendamento

```jsx
function AppointmentButton() {
  const { trackAppointmentBooking } = useHealthcareAnalytics();

  return (
    <button onClick={() => trackAppointmentBooking('hero')}>
      Agendar Consulta
    </button>
  );
}
```

### Exemplo 2: Tracking de Page View

```jsx
function BlogPost({ postId, postTitle }) {
  const { trackBlogView } = useHealthcareAnalytics();

  useEffect(() => {
    trackBlogView(postId, postTitle, 'healthcare');
  }, [postId]);

  return <article>{/* content */}</article>;
}
```

### Exemplo 3: Feature Flags

```jsx
function ExperimentalFeature() {
  const { isFeatureEnabled } = usePostHog();

  if (!isFeatureEnabled('new_appointment_flow')) {
    return <OldFlow />;
  }

  return <NewFlow />;
}
```

### Exemplo 4: LGPD Opt-Out

```jsx
function PrivacySettings() {
  const { optOutTracking, isOptedOut } = usePostHog();

  return (
    <button onClick={optOutTracking}>
      {isOptedOut ? 'Tracking Desabilitado' : 'Desabilitar Tracking'}
    </button>
  );
}
```

## 🔧 Funcionalidades

### Analytics

- ✅ Event tracking manual (LGPD compliant)
- ✅ Page view tracking
- ✅ Custom properties
- ✅ User identification (hash only)
- ✅ Session recording (inputs mascarados)
- ✅ Performance monitoring integration

### Feature Flags

- ✅ Boolean flags
- ✅ Multivariate flags
- ✅ Conditional flags
- ✅ Rollout gradual
- ✅ A/B testing

### Privacy

- ✅ Respect DNT
- ✅ Opt-out capability
- ✅ Data sanitization
- ✅ Input masking
- ✅ LGPD compliant

## 📊 Dashboard PostHog

### Eventos Recomendados para Monitorar

**Conversão:**
- `appointment_booking` - Taxa de conversão de agendamentos
- `contact_form_submitted` - Formulários enviados
- `phone_call_intent` - Intenção de ligação
- `whatsapp_click` - Cliques no WhatsApp

**Engajamento:**
- `page_view` - Páginas mais visitadas
- `blog_post_viewed` - Posts mais lidos
- `service_viewed` - Serviços mais procurados
- `blog_post_engagement` - Tempo de leitura

**Performance:**
- `performance_metric` - LCP, INP, CLS, FCP, TTFB
- `error_occurred` - Erros da aplicação

### Funnels Sugeridos

1. **Funil de Agendamento:**
   - Page View → Service View → Appointment Intent → Appointment Booking

2. **Funil de Contato:**
   - Page View → Contact Form Start → Contact Form Submit

3. **Funil de Blog:**
   - Page View → Blog List → Blog Post View → Blog Engagement

## 🧪 Testes

### Teste Manual

1. Acesse o site com DevTools aberto
2. Console deve mostrar: `[PostHog] Initialized successfully`
3. Interaja com o site (clique em botões, navegue)
4. Verifique eventos no PostHog Dashboard (Activity → Live Events)

### Teste de Opt-Out

```jsx
import { usePostHog } from './providers/PostHogProvider';

const { optOutTracking, isOptedOut } = usePostHog();

// Desabilitar tracking
optOutTracking();
console.log(isOptedOut); // true

// Eventos não serão enviados
```

## 🚨 Troubleshooting

### PostHog não inicializa

**Problema:** Console mostra `PostHog key not found`

**Solução:**
1. Verifique se `VITE_POSTHOG_KEY` está no `.env.production`
2. Rebuild o projeto: `npm run build:vite`
3. Verifique se a variável está disponível: `console.log(import.meta.env.VITE_POSTHOG_KEY)`

### Eventos não aparecem no dashboard

**Problema:** Eventos são enviados mas não aparecem

**Solução:**
1. Verifique se está em modo debug: `posthog.debug(true)`
2. Verifique no console se há erros de CORS
3. Verifique se o project ID está correto
4. Aguarde até 60 segundos para eventos aparecerem

### Session recording não funciona

**Problema:** Gravação de sessão não ativa

**Solução:**
1. Verifique se `disable_session_recording: false`
2. Ative no PostHog Dashboard: Project Settings → Recordings
3. Verifique se o plano permite session recording

## 📚 Recursos

- [PostHog Docs](https://posthog.com/docs)
- [PostHog React SDK](https://posthog.com/docs/libraries/react)
- [PostHog Feature Flags](https://posthog.com/docs/feature-flags)
- [LGPD Guidelines](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

## 🔄 Próximos Passos

1. **Configurar Projeto PostHog:**
   - Criar conta em [posthog.com](https://posthog.com)
   - Criar novo projeto
   - Obter API keys

2. **Configurar Ambiente:**
   - Adicionar keys no `.env.production`
   - Deploy com `npm run deploy:quick`

3. **Criar Dashboards:**
   - Dashboard de Conversão (agendamentos)
   - Dashboard de Engajamento (blog, serviços)
   - Dashboard de Performance (Web Vitals)

4. **Configurar Feature Flags:**
   - Criar flags no PostHog Dashboard
   - Testar rollout gradual de features

5. **Monitorar Compliance:**
   - Revisar eventos capturados
   - Garantir que nenhum PII/PHI seja rastreado
   - Documentar processos de opt-out

## ⚠️ Importante

- **NUNCA** rastreie dados de saúde, CPF, RG, ou PII
- **SEMPRE** use user IDs hash/anonimizados
- **SEMPRE** respeite opt-out do usuário
- **SEMPRE** mascare inputs sensíveis
- **SEMPRE** sanitize properties antes de enviar

---

**Atualizado:** 2025-10-07
**Versão:** 1.0.0
**Compliance:** LGPD ✅ | CFM ✅
