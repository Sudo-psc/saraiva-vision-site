# Saraiva Vision - Knowledge Base

## Project Overview
- **Purpose**: Institutional website for Saraiva Vision clinic
- **Tech Stack**: React + Vite + Tailwind CSS + i18next
- **Language**: Bilingual (Portuguese/English) with i18next

## Deploy e Infraestrutura ✅ ATUALIZADO
- **Modo Deploy**: Local nginx + Vite (migrado do Docker)  
- **HTTPS/SSL**: ✅ Configurado com Let's Encrypt (válido até Nov 2025)
- **Domínios**: saraivavision.com.br + www (ambos com SSL)
- **Firewall**: UFW ativo com regras nginx + SSH
- **Portas**: 80 (redirect), 443 (HTTPS), 3001 (API proxy)
- **Headers Segurança**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- **Scripts**: deploy.sh (SSL), dev.sh (desenvolvimento), test-ssl.sh (verificação)
- **Performance**: HTTP/2, gzip, cache de assets, API proxy otimizado
- **Certificados**: Auto-renovação certbot, backup automático
- **Logs**: /var/log/nginx/, monitoramento SSL integrado

## Key Features
- Responsive design with Tailwind CSS
- Internationalization with i18next
- Google Maps integration
- Supabase authentication context
- Custom visual editor plugins for development
- SEO optimized with React Helmet

## Architecture
- `/src/pages/`: Main page components
- `/src/components/`: Reusable UI components
- `/src/locales/`: Translation files (pt/en)
- `/src/contexts/`: React contexts (auth)
- `/plugins/`: Custom Vite plugins for visual editing
- `/api/`: Serverless functions

## Dependencies
- UI: Radix UI components, Framer Motion animations
- State: React contexts
- Styling: Tailwind CSS with custom utilities
- Build: Vite with custom plugins

## Instagram Widget
- **Provider**: LightWidget (sem token necessário)
- **Perfil**: @saraiva_vision
- **Performance**: Lazy loading, preconnect, container com altura fixa
- **Compliance**: Verificação LGPD, aviso CFM, UTMs padronizadas
- **Fallback**: Grade estática com 6 imagens em caso de falha
- **Acessibilidade**: aria-label, alt text, navegação por teclado
- **Localização**: Integrado na HomePage após FAQ
- **Debug**: Em desenvolvimento, assume consentimento automaticamente e mostra info de debug
- **Timeout**: 5 segundos antes de mostrar fallback (otimizado)
- **Correções**: Verifica script existente, melhores timeouts, data-hover/tags=false
- **Troubleshooting**: Verifica console para logs detalhados de carregamento

## Schema Markup Médico
- **Tipo Principal**: MedicalClinic no index.html (expandido e otimizado)
- **Implementação**: Utilitários em `/src/lib/schemaMarkup.js` + componente React
- **Cobertura**: Homepage, páginas de serviços, FAQ, breadcrumbs
- **Características**: 
  - MedicalClinic com physician, contactPoint, medicalConditionTreated
  - FAQPage automático no componente FAQ
  - MedicalProcedure para páginas de serviços específicos
  - MedicalWebPage para páginas especializadas
  - BreadcrumbList para navegação
  - Suporte a português/inglês baseado no i18n
- **SEO**: Otimizado para rich snippets médicos e busca local
- **Manutenção**: Dados centralizados em `clinicInfo.js`

## FAQ Otimizado para SEO
- **Estrutura**: 13 perguntas priorizando long-tail keywords médicas
- **Conteúdo**: 6 novas perguntas SEO-focused sobre lentes, pediatria, laudos, glaucoma, convênios e sintomas
- **Keywords**: "lentes de contato Caratinga", "laudo oftalmológico", "oftalmologista infantil", "glaucoma tratamento"
- **Schema**: FAQPage automático integrado ao SchemaMarkup component
- **Localização**: Bilíngue PT/EN com foco em busca local Caratinga/MG
- **Meta Description**: Otimizada para 160 caracteres com principais keywords
- **Busca**: Funcionalidade de pesquisa em tempo real nas perguntas/respostas

## Google Reviews Widget ✅ MELHORADO
- **Localização**: Totalmente internacionalizado PT/EN com react-i18next
- **Visual**: Redesign para combinar com GoogleLocalSection (fundo dark, bordas suaves)
- **Error Handling**: Melhor tratamento de erros com fallbacks graceiros
- **API Debug**: Logs detalhados para troubleshooting da Google Places API
- **Acessibilidade**: ARIA labels, ratings semânticos, estados de loading
- **UX**: Estados visuais claros (loading, error, mock vs real data)
- **Configuração**: .env.example com instruções claras para setup da API
- **Performance**: Cache 15min, lazy loading, timeouts otimizados

## SEO Técnico Avançado (2024) ✅ IMPLEMENTADO
- **Sitemap**: Geração dinâmica `/src/utils/sitemapGenerator.js` com build hook no Vite
- **Robots.txt**: Otimizado para clínicas médicas, remove /src/, bloqueia admin + WhatsApp params
- **Meta Tags**: Component SEOHead com geo-tags, medical-specialty, Open Graph e Twitter Cards
- **Hooks SEO**: `useSEO`, `useServiceSEO`, `useLensesSEO` para gerenciamento consistente
- **Core Web Vitals**: Monitor automático LCP/CLS/INP, lazy loading, preload crítico
- **Structured Data**: Schema @graph com MedicalClinic, Physician, FAQPage, WebPage, Breadcrumbs
- **Validação Schema**: `schemaValidator.js` com validação médica específica
- **PWA**: Manifest, service worker ready, meta tags mobile otimizadas
- **Performance**: Resource hints, font-display:swap, critical CSS inline, preload otimizado
- **CTR Optimization**: Emojis 🔹 em titles/descriptions, rich snippets médicos
- **Local SEO**: Geo-coordinates, area served, NAP consistency, keywords "convênios" incluídas
- **i18n SEO**: URLs baseadas em path (/en/) ao invés de query params
- **Segurança**: Bloqueio de WhatsApp params no robots.txt