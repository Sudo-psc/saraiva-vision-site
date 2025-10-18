# B. Schema de Configuração YAML

**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-18

---

## Estrutura Geral

```yaml
# config/config.base.yaml
version: "1.0.0"
environment: production

# Seções principais
site:           # Metadados do site
business:       # Dados da clínica (NAP)
i18n:           # Traduções pt-BR + en-US
theme:          # Design tokens
seo:            # Defaults + per-page
menus:          # Header, footer, mobile
plans:          # Pricing + features
tracking:       # GTM, GA4, PostHog
featureFlags:   # Rollout gradual
compliance:     # LGPD + CFM
```

---

## Schema Completo Comentado

### 1. Site Metadata

```yaml
site:
  name: "Saraiva Vision"
  domain: "saraivavision.com.br"
  baseUrl: "https://saraivavision.com.br"

  # Build info
  buildVersion: "3.3.0"
  buildDate: "2025-10-18"

  # Redes sociais
  social:
    facebook: "https://facebook.com/saraivavision"
    instagram: "https://instagram.com/saraivavision"
    youtube: "https://youtube.com/@saraivavision"
    linkedin: "https://linkedin.com/company/saraivavision"
    whatsapp: "+5533999096030"

  # APIs externas
  apis:
    googleMaps:
      apiKey: "${VITE_GOOGLE_MAPS_API_KEY}"
      placeId: "ChIJVUKww7WRugARF7u2lAe7BeE"
    supabase:
      url: "${VITE_SUPABASE_URL}"
      anonKey: "${VITE_SUPABASE_ANON_KEY}"
```

**Notas**:
- `${VAR}` = interpolação de env vars
- `placeId` = Google Business Profile ID
- Secrets sempre via env vars, nunca commitados

---

### 2. Business Data (NAP Canônico)

```yaml
business:
  # Nome (Name)
  name: "Clínica Saraiva Vision"
  legalName: "Philipe Saraiva Cruz - ME"
  tradingName: "Saraiva Vision"

  # Endereço (Address)
  address:
    street: "Rua Barão do Rio Branco"
    number: "233"
    complement: "Centro"
    neighborhood: "Centro"
    city: "Caratinga"
    state: "MG"
    zipCode: "35300-036"
    country: "Brasil"

    # Coordenadas
    geo:
      lat: -19.7892
      lng: -42.1375

    # Formatações pré-computadas
    formatted:
      singleLine: "Rua Barão do Rio Branco, 233 - Centro, Caratinga - MG, 35300-036"
      multiLine: |
        Rua Barão do Rio Branco, 233
        Centro - Caratinga/MG
        CEP: 35300-036
      schemaOrg: "Rua Barão do Rio Branco, 233, Centro, Caratinga, MG 35300-036, Brasil"

  # Telefone (Phone)
  phone:
    main: "+5533332120071"      # E.164 format
    whatsapp: "+5533999096030"
    formatted:
      main: "(33) 3321-2071"
      whatsapp: "(33) 99909-6030"
      international: "+55 33 3321-2071"

  # Email
  email:
    contact: "contato@saraivavision.com.br"
    doctor: "philipe_cruz@outlook.com"
    support: "suporte@saraivavision.com.br"
    noreply: "noreply@saraivavision.com.br"

  # Horário de funcionamento
  hours:
    weekdays:
      monday:    { open: "08:00", close: "18:00", enabled: true }
      tuesday:   { open: "08:00", close: "18:00", enabled: true }
      wednesday: { open: "08:00", close: "18:00", enabled: true }
      thursday:  { open: "08:00", close: "18:00", enabled: true }
      friday:    { open: "08:00", close: "18:00", enabled: true }
      saturday:  { open: "08:00", close: "12:00", enabled: true }
      sunday:    { open: null, close: null, enabled: false }

    timezone: "America/Sao_Paulo"
    lunchBreak: { start: "12:00", end: "13:00" }

  # Médico responsável
  doctor:
    name: "Dr. Philipe Saraiva Cruz"
    crm: "CRM-MG 12345"  # Substituir pelo real
    specialty: "Oftalmologia"
    rqe: "RQE 67890"     # Substituir pelo real
    title: "Médico Oftalmologista"
```

**Validação Zod**:
```typescript
const PhoneSchema = z.string().regex(/^\+\d{12,15}$/, "E.164 format");
const EmailSchema = z.string().email();
const GeoSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});
```

---

### 3. Internacionalização (i18n)

```yaml
i18n:
  defaultLocale: "pt-BR"
  supportedLocales: ["pt-BR", "en-US"]
  fallbackLocale: "pt-BR"

  # Traduções em estrutura flat (dot notation)
  translations:
    pt-BR:
      # Navegação
      "nav.home": "Início"
      "nav.services": "Serviços"
      "nav.about": "Sobre"
      "nav.blog": "Blog"
      "nav.contact": "Contato"

      # Hero section
      "hero.title": "Cuidado Completo para sua Visão"
      "hero.subtitle": "Tecnologia de ponta e atendimento humanizado"
      "hero.cta.primary": "Agende sua Consulta"
      "hero.cta.secondary": "Conheça nossos Serviços"

      # Serviços
      "services.consultaGeral.title": "Consulta Oftalmológica Geral"
      "services.consultaGeral.description": "Exame completo da saúde ocular com tecnologia avançada"
      "services.catarata.title": "Cirurgia de Catarata"
      "services.catarata.description": "Procedimento seguro com lentes intraoculares premium"

      # Footer
      "footer.rights": "Todos os direitos reservados"
      "footer.privacy": "Política de Privacidade"
      "footer.terms": "Termos de Uso"

      # Formulários
      "forms.name.label": "Nome completo"
      "forms.name.placeholder": "Digite seu nome"
      "forms.email.label": "E-mail"
      "forms.phone.label": "Telefone"
      "forms.submit": "Enviar"

      # Mensagens
      "messages.success": "Mensagem enviada com sucesso!"
      "messages.error": "Erro ao enviar. Tente novamente."

    en-US:
      "nav.home": "Home"
      "nav.services": "Services"
      "nav.about": "About"
      "nav.blog": "Blog"
      "nav.contact": "Contact"

      "hero.title": "Complete Eye Care"
      "hero.subtitle": "Advanced technology and personalized service"
      "hero.cta.primary": "Schedule Appointment"
      "hero.cta.secondary": "Our Services"

      # ... traduções completas para en-US
```

**Uso no código**:
```typescript
const t = config.t('pt-BR', 'hero.title');
// → "Cuidado Completo para sua Visão"

const tFallback = config.t('en-US', 'missing.key', 'Fallback text');
// → "Fallback text" (key não existe)
```

---

### 4. Theme Tokens (Design System)

```yaml
theme:
  tokens:
    colors:
      # Primárias
      primary:
        50: "#e6f2ff"
        100: "#cce5ff"
        200: "#99cbff"
        300: "#66b0ff"
        400: "#3396ff"
        500: "#0066cc"   # Base
        600: "#0052a3"
        700: "#003d7a"
        800: "#002952"
        900: "#001429"

      # Secundárias
      accent:
        light: "#34d399"
        DEFAULT: "#10b981"
        dark: "#059669"

      # Sistema
      success: "#10b981"
      warning: "#f59e0b"
      error: "#ef4444"
      info: "#3b82f6"

      # Neutros
      gray:
        50: "#f9fafb"
        100: "#f3f4f6"
        200: "#e5e7eb"
        300: "#d1d5db"
        400: "#9ca3af"
        500: "#6b7280"
        600: "#4b5563"
        700: "#374151"
        800: "#1f2937"
        900: "#111827"

    typography:
      fontFamily:
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"]
        serif: ["Merriweather", "Georgia", "serif"]
        mono: ["JetBrains Mono", "Courier New", "monospace"]

      fontSize:
        xs: "0.75rem"      # 12px
        sm: "0.875rem"     # 14px
        base: "1rem"       # 16px
        lg: "1.125rem"     # 18px
        xl: "1.25rem"      # 20px
        "2xl": "1.5rem"    # 24px
        "3xl": "1.875rem"  # 30px
        "4xl": "2.25rem"   # 36px
        "5xl": "3rem"      # 48px

      fontWeight:
        light: 300
        normal: 400
        medium: 500
        semibold: 600
        bold: 700
        extrabold: 800

      lineHeight:
        none: 1
        tight: 1.25
        snug: 1.375
        normal: 1.5
        relaxed: 1.625
        loose: 2

    spacing:
      px: "1px"
      0: "0"
      0.5: "0.125rem"   # 2px
      1: "0.25rem"      # 4px
      2: "0.5rem"       # 8px
      3: "0.75rem"      # 12px
      4: "1rem"         # 16px
      5: "1.25rem"      # 20px
      6: "1.5rem"       # 24px
      8: "2rem"         # 32px
      10: "2.5rem"      # 40px
      12: "3rem"        # 48px
      16: "4rem"        # 64px
      20: "5rem"        # 80px
      24: "6rem"        # 96px

    borderRadius:
      none: "0"
      sm: "0.125rem"    # 2px
      DEFAULT: "0.25rem"  # 4px
      md: "0.375rem"    # 6px
      lg: "0.5rem"      # 8px
      xl: "0.75rem"     # 12px
      "2xl": "1rem"     # 16px
      "3xl": "1.5rem"   # 24px
      full: "9999px"

    shadows:
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
      DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      none: "none"
```

**Geração de CSS Vars**:
```css
/* Auto-gerado a partir do YAML */
:root {
  --color-primary-50: #e6f2ff;
  --color-primary-500: #0066cc;
  --font-sans: Inter, system-ui, sans-serif;
  --spacing-4: 1rem;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  /* ... todas as outras */
}
```

---

### 5. SEO Configuration

```yaml
seo:
  # Defaults aplicados em todas as páginas
  defaults:
    title: "Clínica Saraiva Vision - Oftalmologia em Caratinga MG"
    titleTemplate: "%s | Saraiva Vision"  # %s substituído pelo title da página
    description: "Especialistas em saúde ocular com mais de 15 anos de experiência. Consultas, exames, cirurgias e tratamentos oftalmológicos em Caratinga/MG."
    keywords:
      - "oftalmologia Caratinga"
      - "oftalmologista Caratinga MG"
      - "clínica olhos Caratinga"
      - "cirurgia catarata"
      - "exame vista"

    # Open Graph
    og:
      type: "website"
      locale: "pt_BR"
      siteName: "Saraiva Vision"
      image: "/og-image.jpg"
      imageWidth: 1200
      imageHeight: 630

    # Twitter Card
    twitter:
      card: "summary_large_image"
      site: "@saraivavision"
      creator: "@philipesaraiva"

    # Canonical
    canonicalBase: "https://saraivavision.com.br"

  # Overrides por página (rota)
  pages:
    "/":
      title: "Início"
      description: "Cuidado completo para sua visão com tecnologia de ponta"
      keywords: ["oftalmologia", "exame vista", "Caratinga"]

    "/servicos":
      title: "Nossos Serviços"
      description: "Consultas, exames e cirurgias oftalmológicas com equipamentos modernos"
      keywords: ["serviços oftalmologia", "exames olhos", "cirurgia"]

    "/servicos/catarata":
      title: "Cirurgia de Catarata"
      description: "Procedimento seguro e rápido com lentes intraoculares de última geração"
      keywords: ["catarata", "cirurgia catarata", "lente intraocular"]
      og:
        image: "/services/catarata-og.jpg"

    "/blog/:slug":  # Pattern matching
      titleTemplate: "%s | Blog Saraiva Vision"
      og:
        type: "article"
```

**Uso no componente**:
```tsx
import { useSEO } from '@/hooks/useSEO';

function ServicoCatarata() {
  const seo = useSEO('/servicos/catarata');

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {/* ... resto auto-aplicado */}
    </Helmet>
  );
}
```

---

### 6. Menus e Navegação

```yaml
menus:
  header:
    pt-BR:
      - label: "Início"
        href: "/"
        icon: "home"
        order: 1

      - label: "Serviços"
        href: "/servicos"
        icon: "activity"
        order: 2
        children:
          - label: "Consulta Geral"
            href: "/servicos/consulta-geral"
          - label: "Cirurgia de Catarata"
            href: "/servicos/catarata"
          - label: "Cirurgia Refrativa"
            href: "/servicos/refrativa"

      - label: "Sobre"
        href: "/sobre"
        icon: "users"
        order: 3

      - label: "Blog"
        href: "/blog"
        icon: "book-open"
        order: 4

      - label: "Contato"
        href: "/contato"
        icon: "mail"
        order: 5
        highlight: true  # CTA destacado

    en-US:
      - label: "Home"
        href: "/"
        icon: "home"
        order: 1
      # ... mesma estrutura

  footer:
    pt-BR:
      sections:
        - title: "Clínica"
          links:
            - label: "Sobre Nós"
              href: "/sobre"
            - label: "Equipe Médica"
              href: "/equipe"
            - label: "Estrutura"
              href: "/estrutura"

        - title: "Serviços"
          links:
            - label: "Consultas"
              href: "/servicos"
            - label: "Exames"
              href: "/exames"
            - label: "Cirurgias"
              href: "/cirurgias"

        - title: "Conteúdo"
          links:
            - label: "Blog"
              href: "/blog"
            - label: "Podcast"
              href: "/podcast"
            - label: "FAQ"
              href: "/faq"

        - title: "Legal"
          links:
            - label: "Política de Privacidade"
              href: "/privacidade"
            - label: "Termos de Uso"
              href: "/termos"
            - label: "LGPD"
              href: "/lgpd"

  mobile:
    # Versão simplificada para mobile
    pt-BR:
      - label: "Início"
        href: "/"
        icon: "home"
      - label: "Serviços"
        href: "/servicos"
        icon: "activity"
      - label: "Agendar"
        href: "/agendamento"
        icon: "calendar"
        highlight: true
```

**Uso**:
```typescript
const headerMenu = config.getMenu('pt-BR', 'header');
// → Array de items com label, href, icon, children
```

---

### 7. Plans e Pricing

```yaml
plans:
  currency: "BRL"
  locale: "pt-BR"
  discountAnnual: 0.17  # 17% desconto no anual

  items:
    - id: "basic"
      name:
        pt-BR: "Plano Básico"
        en-US: "Basic Plan"
      description:
        pt-BR: "Para necessidades essenciais de saúde ocular"
        en-US: "For essential eye health needs"

      pricing:
        monthly: 29900  # Centavos (R$ 299,00)
        yearly: 298800   # R$ 2.988,00 (17% desc)

      features:
        - key: "consultasAno"
          included: true
          value: 2
          label:
            pt-BR: "2 consultas por ano"
            en-US: "2 consultations per year"

        - key: "examesBasicos"
          included: true
          label:
            pt-BR: "Exames básicos inclusos"
            en-US: "Basic exams included"

        - key: "desconto"
          included: true
          value: 10
          label:
            pt-BR: "10% desconto em procedimentos"
            en-US: "10% off procedures"

        - key: "urgencia"
          included: false
          label:
            pt-BR: "Atendimento de urgência"
            en-US: "Emergency service"

      cta:
        pt-BR: "Assinar Plano Básico"
        en-US: "Subscribe Basic"
      popular: false

    - id: "premium"
      name:
        pt-BR: "Plano Premium"
        en-US: "Premium Plan"
      description:
        pt-BR: "Cobertura completa com benefícios exclusivos"
        en-US: "Complete coverage with exclusive benefits"

      pricing:
        monthly: 59900  # R$ 599,00
        yearly: 597600   # R$ 5.976,00

      features:
        - key: "consultasAno"
          included: true
          value: 6
          label:
            pt-BR: "6 consultas por ano"
            en-US: "6 consultations per year"

        - key: "examesCompletos"
          included: true
          label:
            pt-BR: "Todos os exames inclusos"
            en-US: "All exams included"

        - key: "desconto"
          included: true
          value: 25
          label:
            pt-BR: "25% desconto em cirurgias"
            en-US: "25% off surgeries"

        - key: "urgencia"
          included: true
          label:
            pt-BR: "Atendimento de urgência 24/7"
            en-US: "24/7 emergency service"

        - key: "homecare"
          included: true
          label:
            pt-BR: "Atendimento domiciliar"
            en-US: "Home care service"

      cta:
        pt-BR: "Assinar Plano Premium"
        en-US: "Subscribe Premium"
      popular: true  # Badge "Mais Popular"
      highlight: true
```

**PlanService usage**:
```typescript
const planService = new PlanService();
const plans = planService.getPlans('pt-BR', 'monthly');

console.log(plans[0].name); // "Plano Básico"
console.log(plans[0].priceFormatted); // "R$ 299,00"
console.log(plans[0].savings); // "R$ 101,00" (anual)
```

---

### 8. Tracking e Analytics

```yaml
tracking:
  enabled: true

  googleTagManager:
    enabled: true
    id: "GTM-KF2NP85D"
    dataLayer: "dataLayer"
    events:
      - pageview
      - click
      - formSubmit
      - appointment

  googleAnalytics:
    enabled: true
    measurementId: "G-LXWRK8ELS6"
    config:
      anonymizeIp: true
      cookieExpires: 7776000  # 90 dias
      respectDoNotTrack: true

  posthog:
    enabled: true
    apiKey: "phc_bpyxyy0AVVh2E9LhjkDfZhi2vlfEsQhOBkijyjvyRSp"
    apiHost: "https://app.posthog.com"
    config:
      autocapture: true
      capturePageview: true
      disableSessionRecording: false

  # Custom events
  customEvents:
    appointmentScheduled:
      name: "appointment_scheduled"
      category: "engagement"
      gtm: true
      ga4: true
      posthog: true

    planSelected:
      name: "plan_selected"
      category: "conversion"
      gtm: true
      ga4: true
      posthog: true
```

---

### 9. Feature Flags

```yaml
featureFlags:
  # Flag de rollout percentual
  newPricingPage:
    enabled: true
    rolloutPercentage: 25  # 25% dos usuários
    targeting:
      - newUsers: true
      - locale: "pt-BR"

  enhancedSearch:
    enabled: true
    rolloutPercentage: 100

  chatbotWidget:
    enabled: false
    rolloutPercentage: 0
    expectedLaunch: "2025-11-01"

  # Feature flag booleano simples
  darkMode:
    enabled: false

  podcastPage:
    enabled: true
    rolloutPercentage: 100
```

**Uso**:
```typescript
if (config.isFeatureEnabled('newPricingPage')) {
  return <NewPricingPage />;
} else {
  return <OldPricingPage />;
}
```

---

### 10. Compliance (LGPD + CFM)

```yaml
compliance:
  lgpd:
    enabled: true

    cookieConsent:
      required: true
      categories:
        - id: "necessary"
          required: true
          label:
            pt-BR: "Cookies Necessários"
            en-US: "Necessary Cookies"

        - id: "analytics"
          required: false
          default: false
          label:
            pt-BR: "Cookies de Análise"
            en-US: "Analytics Cookies"

        - id: "marketing"
          required: false
          default: false
          label:
            pt-BR: "Cookies de Marketing"
            en-US: "Marketing Cookies"

    dataRetention:
      contactForms: 90  # dias
      appointments: 365
      analytics: 730

    dpo:  # Data Protection Officer
      name: "Dr. Philipe Saraiva Cruz"
      email: "dpo@saraivavision.com.br"
      phone: "+5533999096030"

  cfm:  # Conselho Federal de Medicina
    enabled: true

    disclaimers:
      medicalContent: |
        Este conteúdo tem caráter informativo e não substitui
        avaliação médica presencial. Consulte um oftalmologista
        para diagnóstico e tratamento adequados.

      testimonials: |
        Depoimentos refletem experiências individuais e não
        garantem resultados idênticos para todos os pacientes.

      procedures: |
        Todo procedimento médico envolve riscos. Informações
        completas sobre benefícios e complicações serão
        fornecidas em consulta médica.

    requiredPages:
      - "/politica-privacidade"
      - "/termos-uso"
      - "/lgpd"
      - "/consentimento"
```

---

## Estratégia de Environment Overrides

```yaml
# config/config.production.yaml
environment: production
site:
  baseUrl: "https://saraivavision.com.br"
tracking:
  enabled: true

# config/config.staging.yaml
environment: staging
site:
  baseUrl: "https://staging.saraivavision.com.br"
tracking:
  enabled: true
  googleAnalytics:
    measurementId: "G-STAGING-123"

# config/config.development.yaml
environment: development
site:
  baseUrl: "http://localhost:3002"
tracking:
  enabled: false  # Sem tracking em dev
featureFlags:
  chatbotWidget:
    enabled: true  # Sempre habilitado em dev para testes
```

**Deep Merge Strategy**:
```typescript
// Prioridade: development.yaml > base.yaml
const finalConfig = deepMerge(
  baseConfig,
  envConfig
);
```

---

## Validação com Zod

Ver arquivo completo em **[Anexo B](./anexo-b-schemas.md)**

```typescript
import { z } from 'zod';

const ConfigSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  environment: z.enum(['development', 'staging', 'production']),

  business: z.object({
    phone: z.object({
      main: z.string().regex(/^\+\d{12,15}$/),
      whatsapp: z.string().regex(/^\+\d{12,15}$/),
    }),
    address: z.object({
      geo: z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      }),
    }),
  }),

  // ... schemas completos
});

export type Config = z.infer<typeof ConfigSchema>;
```

---

## Próximos Passos

→ Ver [03-camada-servicos.md](./03-camada-servicos.md) para implementação do ConfigService
