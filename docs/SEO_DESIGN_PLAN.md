# Plano de SEO, Design e Funcionalidades

## Meta titles e descriptions

| Página | Title (≤60) | Meta Description (≤155) |
|-------|-------------|-------------------------|
| Home | Clínica Oftalmológica em Caratinga | Oftalmologista em Caratinga para exame de refração, lentes de contato e cirurgia de catarata. Agende sua consulta. |
| Sobre | Sobre a Clínica | Conheça a história da Saraiva Vision e do Dr. Saraiva, oftalmologista em Caratinga. Estrutura moderna e atendimento humano. |
| Tratamentos | Tratamentos Oftalmológicos | Exames de refração, lentes de contato e cuidados preventivos com oftalmologista em Caratinga. Veja todas as opções. |
| Cirurgias | Cirurgias Oculares | Cirurgia de catarata e procedimentos refrativos com oftalmologista em Caratinga. Tecnologia avançada e recuperação rápida. |
| Blog | Blog de Saúde Ocular | Dicas de saúde, lentes e cirurgias com oftalmologista em Caratinga. Conteúdo para toda a família. |
| Contato | Agendar Consulta | Marque consulta com oftalmologista em Caratinga. Atendimento por site ou WhatsApp com confirmação imediata. |

## Snippet JSON-LD
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://saraivavision.com.br/#local",
      "name": "Saraiva Vision Clínica Oftalmológica",
      "image": "https://saraivavision.com.br/logo.png",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Rua Exemplo, 123",
        "addressLocality": "Caratinga",
        "addressRegion": "MG",
        "postalCode": "35300-000",
        "addressCountry": "BR"
      },
      "telephone": "+55-33-0000-0000",
      "openingHours": "Mo-Fr 08:00-18:00",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "120"
      }
    },
    {
      "@type": "Physician",
      "@id": "https://saraivavision.com.br/#physician",
      "name": "Dr. João Saraiva",
      "medicalSpecialty": "Ophthalmology",
      "memberOf": "https://portal.cfm.org.br/",
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "CRM",
        "value": "12345-MG"
      },
      "address": {"@id": "https://saraivavision.com.br/#local"}
    },
    {
      "@type": "FAQPage",
      "@id": "https://saraivavision.com.br/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Como agendar uma consulta?",
          "acceptedAnswer": {"@type": "Answer","text": "Use o site ou WhatsApp para agendar com confirmação imediata."}
        },
        {
          "@type": "Question",
          "name": "Vocês fazem cirurgia de catarata?",
          "acceptedAnswer": {"@type": "Answer","text": "Sim, realizamos cirurgia de catarata com lente intraocular."}
        }
      ]
    }
  ]
}
</script>
```

## Guia tipográfico
- Escala base 16px com passos de 4:
  - 16, 20, 24, 28, 32, 36, 40px
- Pesos: 400 normal, 600 semibold, 700 bold
- Line-heights: 1.5 para parágrafos, 1.2 para títulos

## Paleta de cores
- Azul primário: `#0057B7`
- Azul secundário: `#0176D2`
- Amarelo destaque: `#F0A500`

## Componentes planejados
- Botão "Agendar Consulta" sticky em todas as páginas
- Grid com 3 depoimentos verificados + selo Google
- Barra de credibilidade com "+5k pacientes" abaixo do herói
- Widget de agendamento em 3 passos integrado ao Google Calendar

## Checklist de acessibilidade (WCAG 2.1 AA)
| Item | Status | Ação |
|------|--------|------|
| Contraste mínimo | Fail | Ajustar cores para contraste AA |
| Foco visível | Pass | Manter outlines padrão |
| Labels ARIA em botões | Pass | Continuar aplicando `aria-label` |
| Navegação por teclado | Fail | Garantir foco sequencial no widget de agendamento |

## GA4 e Hotjar
- Inserir scripts no `index.html`
- Eventos GA4: `cta_click`, `schedule_start`, `schedule_complete`
- Hotjar: heatmaps das páginas Home e Agendamento

## Links internos sugeridos
- Tratamentos → Cirurgias de Catarata, Lentes de Contato, Exame de Refração
- Cirurgias → Posts do blog sobre catarata e LASIK
- Blog posts → Tratamentos relacionados e página de agendamento

## Estratégia de imagens
- Converter PNG/JPEG para WebP com `cwebp -q 80`
- Alt text descritivo ex.: "exame de refração em moderno autorefrator"
- Lazy-load para imagens fora do viewport

