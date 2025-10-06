# Especificação: Página 404 Personalizada

## 1. Visão Geral

**Projeto:** Saraiva Vision - Clínica Oftalmológica
**Versão:** 1.0.0
**Status:** Em Desenvolvimento
**Prioridade:** Alta

### 1.1. Contexto do Problema
Atualmente, o site não possui uma página de erro 404 personalizada, resultando em:
- Má experiência do usuário
- Aparência não profissional
- Possível perda de visitantes
- Falta de feedback claro sobre o erro

### 1.2. Objetivos
- Comunicar claramente que apenas uma página específica está indisponível
- Manter o usuário engajado no site
- Facilitar a navegação para conteúdo relevante
- Implementar rastreamento para identificar links quebrados
- Manter consistência visual com o design do site

## 2. Requisitos Funcionais

### 2.1. Conteúdo Principal
- **Mensagem de erro clara**: "Ops! Página não encontrada"
- **Texto explicativo**: Informar que apenas a página específica está indisponível
- **Busca interna**: Campo para pesquisar conteúdo no site
- **Links úteis**: Navegação para páginas principais
- **Contato rápido**: Opções de contato imediato

### 2.2. Navegação
- **Menu principal**: Integrado com Navbar existente
- **Links rápidos**: Serviços, Blog, Sobre, FAQ
- **Breadcrumbs**: Indicar onde o usuário tentou acessar
- **Botão voltar**: Navegação para página anterior

### 2.3. Funcionalidades
- **Report de bug**: Formulário para reportar links quebrados
- **Rastreamento automático**: Log de erros 404 com analytics
- **Sugestões de conteúdo**: Baseado na URL tentada
- **Pesquisa inteligente**: Autocomplete e sugestões

## 3. Requisitos Técnicos

### 3.1. Arquitetura
- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6
- **Estilos**: Tailwind CSS + Design System existente
- **Componentes**: Reutilizar componentes existentes
- **Performance**: Lazy loading, otimização SEO

### 3.2. Componentes React
```
src/pages/NotFoundPage.jsx
├── NotFoundContent.jsx
├── SearchBar.jsx
├── QuickLinks.jsx
├── BugReportForm.jsx
└── ErrorTracking.jsx
```

### 3.3. Estado e Dados
- **URL tentada**: Capturar do React Router
- **Referrer**: Página de origem
- **Timestamp**: Data/hora do erro
- **User Agent**: Informações do navegador
- **Analytics**: Integração com sistema existente

### 3.4. Responsividade
- **Mobile-first**: Design adaptativo
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Touch-friendly**: Botões e interações otimizadas
- **Performance**: < 2s de carregamento

## 4. Design e UX

### 4.1. Identidade Visual
- **Cores**: Paleta existente do Saraiva Vision
- **Tipografia**: Fontes consistentes com o site
- **Ícones**: Lucide React (mesmo sistema atual)
- **Imagens**: Ilustrações médicas/oftalmológicas

### 4.2. Layout
```
┌─────────────────────────────────────┐
│           Navbar                    │
├─────────────────────────────────────┤
│                                     │
│     [Ícone 404]                     │
│     Ops! Página não encontrada     │
│     Mensagem explicativa            │
│                                     │
│     [Campo de busca]                │
│                                     │
│     [Links rápidos]                 │
│     Serviços | Blog | Sobre | FAQ  │
│                                     │
│     [Reportar problema]             │
│                                     │
│     [Voltar] [Página inicial]       │
│                                     │
└─────────────────────────────────────┘
```

### 4.3. Microinterações
- **Animações**: Fade-in suave dos elementos
- **Hover states**: Feedback visual claro
- **Loading states**: Indicadores de carregamento
- **Transições**: Mudanças de estado fluidas

### 4.4. Acessibilidade (WCAG 2.1 AA)
- **Semântica HTML5**: Estrutura correta
- **ARIA labels**: Screen readers
- **Keyboard navigation**: Tab order lógico
- **Contraste**: Mínimo 4.5:1 para texto
- **Focus indicators**: Visíveis e claros

## 5. Rastreamento e Analytics

### 5.1. Dados Coletados
```typescript
interface Error404Data {
  timestamp: string;
  attemptedUrl: string;
  referrer: string;
  userAgent: string;
  sessionId: string;
  userId?: string;
  location?: {
    country: string;
    city: string;
  };
}
```

### 5.2. Eventos Rastreados
- **404_error**: Ocorrencia de erro 404
- **404_search_attempt**: Tentativa de busca
- **404_link_click**: Clique em link útil
- **404_bug_report**: Envio de report
- **404_page_exit**: Saída da página

### 5.3. Integrações
- **Google Analytics 4**: Eventos personalizados
- **Sistema interno**: Logs em Redis
- **Error tracking**: Integração com errorTracking.js
- **Slack notifications**: Alertas para equipe

## 6. Formulário de Report de Bug

### 6.1. Campos
- **Email (opcional)**: Para retorno
- **URL tentada**: Auto-preenchido
- **Descrição**: Texto livre para usuário
- **Tipo de problema**: Select dropdown
- **Anexo**: Screenshot opcional

### 6.2. Validações
- **Email**: Formato válido se preenchido
- **Descrição**: Mínimo 10 caracteres
- **Rate limiting**: 3 reports por hora por IP
- **Sanitização**: XSS protection

### 6.3. Processamento
- **API endpoint**: POST /api/bug-report
- **Armazenamento**: Redis + backup em arquivo
- **Notificações**: Email para equipe
- **Resposta**: Confirmação ao usuário

## 7. Configuração de Servidor

### 7.1. Nginx Configuration
```nginx
# Custom 404 page
error_page 404 /404.html;

# SPA routing fallback
location / {
    try_files $uri $uri/ /index.html;
}

# API routes (proxied to Node.js)
location /api/ {
    proxy_pass http://localhost:3001;
    proxy_intercept_errors on;
    error_page 404 /api/404;
}
```

### 7.2. React Router
```jsx
// Catch-all route
<Route path="*" element={<NotFoundPage />} />
```

### 7.3. Headers SEO
```html
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="Cache-Control" content="no-cache">
```

## 8. Performance e Otimização

### 8.1. Carregamento
- **Lazy loading**: Componente carregado sob demanda
- **Code splitting**: Separdo do bundle principal
- **Critical CSS**: Inline para renderização imediata
- **Images**: WebP com fallbacks

### 8.2. Métricas Alvo
- **FCP**: < 1.5s
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

### 8.3. Cache Strategy
- **Browser cache**: 1 hora para página 404
- **CDN cache**: 24 horas para assets
- **Service Worker**: Cache de navegação

## 9. Testes

### 9.1. Testes Unitários
- **Componentes**: React Testing Library
- **Formulário**: Validações e submissão
- **Navegação**: Redirecionamentos
- **Acessibilidade**: axe-core

### 9.2. Testes de Integração
- **Cypress**: Fluxo completo do usuário
- **Playwright**: Cross-browser testing
- **API**: Endpoint de bug report
- **Analytics**: Disparo de eventos

### 9.3. Testes Manuais
- **Responsividade**: Dispositivos diversos
- **Acessibilidade**: Screen readers
- **Performance**: Ferramentas de análise
- **Cross-browser**: Chrome, Firefox, Safari

## 10. Implementação

### 10.1. Fases
1. **Estrutura base**: Componente React principal
2. **Integração routing**: React Router config
3. **Estilização**: Design system implementation
4. **Formulário**: Bug report functionality
5. **Analytics**: Tracking implementation
6. **Servidor**: Nginx configuration
7. **Testes**: Validation e QA

### 10.2. Dependências
```json
{
  "react-router-dom": "^6.8.0",
  "framer-motion": "^10.0.0",
  "lucide-react": "^0.263.0",
  "react-hook-form": "^7.43.0",
  "axios": "^1.3.0"
}
```

### 10.3. Arquivos Criados/Modificados
```
src/pages/NotFoundPage.jsx (novo)
src/components/NotFound/ (novo diretório)
├── NotFoundContent.jsx
├── SearchBar.jsx
├── QuickLinks.jsx
├── BugReportForm.jsx
└── ErrorTracking.jsx

src/App.jsx (modificado - adicionar rota)
api/src/routes/bugReport.js (novo)
/etc/nginx/sites-enabled/saraivavision (modificado)
```

## 11. Manutenção

### 11.1. Monitoramento
- **Dashboard**: Visualização de erros 404
- **Alertas**: Threshold de frequência
- **Relatórios**: Semanais/mensais
- **Tendências**: Análise de padrões

### 11.2. Melhorias Contínuas
- **A/B testing**: Mensagens e layout
- **Machine learning**: Sugestões de conteúdo
- **User feedback**: Coleta de opiniões
- **Performance**: Otimizações constantes

## 12. Critérios de Sucesso

### 12.1. Métricas de Negócio
- **Redução de bounce rate**: < 70% em páginas 404
- **Engajamento**: > 30% cliques em links úteis
- **Conversão**: > 5% report de bugs úteis
- **Retenção**: < 20% abandono imediato

### 12.2. Métricas Técnicas
- **Performance**: Core Web Vitals no verde
- **Acessibilidade**: 100% WCAG 2.1 AA
- **SEO**: Meta tags corretas
- **Uptime**: 99.9% disponibilidade

### 12.3. Métricas de Experiência
- **Satisfação**: Feedback positivo de usuários
- **Utilidade**: Reports acionáveis recebidos
- **Navegação**: Usuários encontram conteúdo relevante
- **Confiança**: Imagem profissional mantida

---

## 13. Anexos

### 13.1. Mockups
*Ver arquivos de design em `/docs/design/404-mockups/`*

### 13.2. Referências
- [React Router v6 Documentation](https://reactrouter.com/)
- [Google Analytics 4 Events](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

### 13.3. Contatos
- **Product Owner**: [Nome]
- **Tech Lead**: [Nome]
- **Design**: [Nome]
- **QA**: [Nome]

---

**Aprovado por:** _________________
**Data:** ___/___/_____
**Versão:** 1.0.0