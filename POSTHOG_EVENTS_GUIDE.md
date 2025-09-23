# Guia Prático - Enviando Eventos com PostHog

## 🎯 Visão Geral

Este guia mostra como implementar e enviar eventos personalizados usando o PostHog na aplicação Saraiva Vision. Inclui exemplos práticos e componentes de teste.

## 🚀 Componentes de Teste Criados

### 1. **PostHogEventTesting.jsx**
Interface completa para testar todos os tipos de eventos:
- ✅ Eventos personalizados com propriedades JSON
- ✅ Eventos diretos do PostHog
- ✅ Eventos específicos da Saraiva Vision
- ✅ Ações do usuário
- ✅ Eventos de negócio
- ✅ Conversões
- ✅ Log em tempo real dos eventos enviados

### 2. **AutoEventExamples.jsx**
Demonstração de eventos automáticos:
- ✅ Rastreamento de visibilidade (Intersection Observer)
- ✅ Rastreamento de cliques automático
- ✅ Rastreamento de formulários
- ✅ Métricas de performance
- ✅ Comportamento do usuário (mouse, teclado, idle)

## 📝 Como Enviar Eventos

### 1. **Evento Simples**
```javascript
import { usePostHog } from '@/hooks/usePostHog';

const { trackEvent } = usePostHog();

// Evento básico
trackEvent('meu_evento', {
  propriedade: 'valor',
  numero: 123,
  timestamp: new Date().toISOString()
});
```

### 2. **Evento Direto PostHog**
```javascript
import { usePostHog } from 'posthog-js/react';

const posthog = usePostHog();

// Chamada direta
posthog?.capture('meu_evento', { 
  propriedade: 'valor' 
});
```

### 3. **Eventos Específicos da Saraiva Vision**
```javascript
import { useSaraivaTracking } from '@/hooks/usePostHog';

const {
  trackAppointmentRequest,
  trackServiceView,
  trackContactInteraction,
  trackBlogEngagement,
  trackInstagramInteraction,
  trackAccessibilityUsage,
  trackSearchQuery,
  trackNewsletterSignup
} = useSaraivaTracking();

// Exemplos de uso
trackAppointmentRequest('consulta', 'whatsapp');
trackServiceView('catarata', 'Cirurgia de Catarata');
trackContactInteraction('whatsapp', 'widget');
trackBlogEngagement('post-slug', 'view');
trackInstagramInteraction('click', 'post-123');
trackAccessibilityUsage('font_size', true);
trackSearchQuery('oftalmologista', 5);
trackNewsletterSignup('user@email.com', 'footer');
```

## 🎛️ Tipos de Eventos Implementados

### **Eventos Automáticos** (Capturados automaticamente)
- ✅ **Pageviews** - Visualizações de página
- ✅ **Clicks** - Cliques em elementos
- ✅ **Form Submissions** - Envios de formulário
- ✅ **Session Recording** - Gravação de sessão

### **Eventos de Negócio**
```javascript
// Agendamento de consulta
trackAppointmentRequest('catarata', 'form');

// Visualização de serviço
trackServiceView('lasik', 'Cirurgia LASIK');

// Interação de contato
trackContactInteraction('phone', 'header_button');

// Verificação de convênio
trackBusinessEvent('insurance_checked', {
  provider: 'unimed',
  covered: true
});
```

### **Eventos de Conversão**
```javascript
// Solicitação de agendamento
trackConversion('appointment_request', 1);

// Ligação telefônica
trackConversion('phone_call', 1);

// Download de material
trackConversion('brochure_download', 1);

// Consulta realizada (com valor)
trackConversion('consultation_completed', 350);
```

### **Ações do Usuário**
```javascript
// Clique em botão
trackUserAction('button_click', {
  button_id: 'cta_main',
  button_text: 'Agendar Consulta'
});

// Scroll na página
trackUserAction('scroll_depth', { depth: '75%' });

// Reprodução de vídeo
trackUserAction('video_play', { video_id: 'intro_video' });

// Compartilhamento
trackUserAction('share', { platform: 'whatsapp' });
```

## 🔧 Implementação em Componentes Existentes

### **1. Botão com Tracking**
```jsx
import { useSaraivaTracking } from '@/hooks/usePostHog';

const AppointmentButton = () => {
  const { trackAppointmentRequest } = useSaraivaTracking();

  const handleClick = () => {
    trackAppointmentRequest('consulta_geral', 'cta_button');
    // ... lógica do agendamento
  };

  return (
    <Button onClick={handleClick}>
      Agendar Consulta
    </Button>
  );
};
```

### **2. Formulário com Tracking**
```jsx
import { usePostHog } from '@/hooks/usePostHog';

const ContactForm = () => {
  const { trackEvent } = usePostHog();

  const handleSubmit = (formData) => {
    trackEvent('contact_form_submit', {
      form_fields: Object.keys(formData),
      completion_rate: calculateCompletionRate(formData),
      source: 'contact_page'
    });
    
    // ... enviar formulário
  };

  const handleFieldChange = (field, value) => {
    trackEvent('form_field_interaction', {
      field_name: field,
      field_value_length: value.length,
      form_id: 'contact_form'
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* campos do formulário */}
    </form>
  );
};
```

### **3. Componente com Visibilidade**
```jsx
import { useEffect, useRef } from 'react';
import { usePostHog } from '@/hooks/usePostHog';

const ServiceCard = ({ service }) => {
  const { trackServiceView } = useSaraivaTracking();
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackServiceView(service.id, service.name);
        }
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [service, trackServiceView]);

  return (
    <div ref={cardRef} className="service-card">
      {/* conteúdo do card */}
    </div>
  );
};
```

### **4. Widget com Tracking**
```jsx
import { useSaraivaTracking } from '@/hooks/usePostHog';

const WhatsAppWidget = () => {
  const { trackContactInteraction } = useSaraivaTracking();

  const handleWhatsAppClick = () => {
    trackContactInteraction('whatsapp', 'widget');
    
    // Enhanced tracking
    trackEvent('whatsapp_click', {
      source: 'widget',
      business_hours: isBusinessHours(),
      widget_position: 'bottom_right',
      user_type: getUserType()
    });

    // ... abrir WhatsApp
  };

  return (
    <button onClick={handleWhatsAppClick}>
      WhatsApp
    </button>
  );
};
```

## 📊 Eventos Específicos por Seção

### **Homepage**
```javascript
// Hero section
trackEvent('hero_cta_click', { cta_text: 'Agendar Consulta' });

// Services section
trackServiceView('service_id', 'Service Name');

// Testimonials
trackEvent('testimonial_viewed', { testimonial_id: 'test_123' });

// Instagram feed
trackInstagramInteraction('view', 'post_id');
```

### **Página de Serviços**
```javascript
// Service detail view
trackServiceView('catarata', 'Cirurgia de Catarata');

// Price inquiry
trackEvent('price_inquiry', { service: 'lasik' });

// Appointment request
trackAppointmentRequest('refracao', 'service_page');
```

### **Blog**
```javascript
// Post view
trackBlogEngagement('post-slug', 'view');

// Reading time
trackEvent('reading_time', {
  post_slug: 'post-slug',
  time_spent: 120, // seconds
  scroll_depth: '80%'
});

// Share
trackBlogEngagement('post-slug', 'share');
```

### **Contato**
```javascript
// Form interaction
trackEvent('contact_form_start', { source: 'contact_page' });

// Form completion
trackEvent('contact_form_submit', {
  fields_completed: ['name', 'email', 'message'],
  completion_rate: 1.0
});

// Contact method selection
trackContactInteraction('phone', 'contact_page');
```

## 🧪 Como Testar os Eventos

### **1. Usar o Componente de Teste**
```jsx
import PostHogEventTesting from '@/components/PostHogEventTesting';

// Adicionar em uma página para testar
<PostHogEventTesting />
```

### **2. Verificar no Console (Desenvolvimento)**
```javascript
// PostHog debug está ativo em desenvolvimento
// Eventos aparecem no console do navegador
```

### **3. Verificar no Dashboard PostHog**
1. Acesse o dashboard do PostHog
2. Vá para "Events" ou "Live Events"
3. Veja os eventos chegando em tempo real

### **4. Usar o Browser DevTools**
```javascript
// No console do navegador
window.posthog.capture('test_event', { test: true });

// Verificar se PostHog está carregado
console.log(window.posthog);
```

## 📈 Melhores Práticas

### **1. Nomenclatura de Eventos**
```javascript
// ✅ Bom - descritivo e consistente
trackEvent('appointment_request_submitted', { service: 'catarata' });

// ❌ Ruim - vago e inconsistente
trackEvent('click', { thing: 'button' });
```

### **2. Propriedades Úteis**
```javascript
trackEvent('user_action', {
  // Contexto
  page: window.location.pathname,
  section: 'hero',
  
  // Timing
  timestamp: new Date().toISOString(),
  session_duration: getSessionDuration(),
  
  // User info
  user_type: 'visitor', // or 'patient', 'returning'
  device_type: 'mobile', // or 'desktop', 'tablet'
  
  // Business context
  service_interest: 'catarata',
  conversion_funnel_step: 'awareness'
});
```

### **3. Evitar Dados Sensíveis**
```javascript
// ✅ Bom - dados anonimizados
trackEvent('form_submit', {
  email_domain: email.split('@')[1],
  phone_area_code: phone.substring(0, 2)
});

// ❌ Ruim - dados pessoais
trackEvent('form_submit', {
  email: 'user@email.com',
  phone: '11999999999'
});
```

### **4. Batch Events para Performance**
```javascript
import { posthogUtils } from '@/utils/posthogConfig';

// Enviar múltiplos eventos de uma vez
posthogUtils.batchTrack([
  { event: 'page_view', properties: { page: '/services' } },
  { event: 'service_viewed', properties: { service: 'catarata' } },
  { event: 'cta_impression', properties: { cta_id: 'book_now' } }
]);
```

## 🔍 Debug e Troubleshooting

### **Verificar se PostHog está Carregado**
```javascript
import { posthogUtils } from '@/utils/posthogConfig';

if (posthogUtils.isAvailable()) {
  console.log('PostHog está funcionando!');
} else {
  console.log('PostHog não está carregado');
}
```

### **Operações Seguras**
```javascript
// Sempre use operações seguras para evitar erros
posthogUtils.safeExecute((posthog) => {
  posthog.capture('my_event', { property: 'value' });
});
```

### **Verificar Feature Flags**
```javascript
import { posthogUtils } from '@/utils/posthogConfig';

const flags = posthogUtils.getFeatureFlags();
console.log('Feature flags ativas:', flags);
```

## 🎉 Resultado Final

Com esta implementação você tem:

- ✅ **Sistema completo de eventos** - Automáticos e manuais
- ✅ **Componentes de teste** - Interface para testar todos os eventos
- ✅ **Hooks personalizados** - Fácil integração em qualquer componente
- ✅ **Eventos específicos** - Focados no negócio da Saraiva Vision
- ✅ **Tracking automático** - Visibilidade, cliques, formulários
- ✅ **Performance tracking** - Métricas de carregamento
- ✅ **Comportamento do usuário** - Mouse, teclado, navegação
- ✅ **Privacidade garantida** - Dados anonimizados e seguros

Agora você pode capturar insights detalhados sobre como os usuários interagem com a aplicação e otimizar a experiência baseada em dados reais!