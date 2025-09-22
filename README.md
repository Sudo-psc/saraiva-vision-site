# Saraiva Vision - Clínica Oftalmológica

![Saraiva Vision Logo](https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/ab3221659a2b4080af9238827a12d5de.png)

**Site institucional moderno da Clínica Saraiva Vision em Caratinga, MG**

## 🚀 Início Rápido

| Para desenvolvedores | Para designers | Para conteúdo |
|---------------------|----------------|---------------|
| [Setup em 5 min](./DEVELOPER_QUICK_START.md) | [Guia de Marca](./docs/BRAND_GUIDE.md) | [Estratégia Médica](./docs/MEDICAL_CONTENT_STRATEGY.md) |
| [Troubleshooting](./TROUBLESHOOTING.md) | [Design System](./docs/DESIGN_SYSTEM_INDEX.md) | [SEO Plan](./docs/SEO_DESIGN_PLAN.md) |
| [Comandos](./CLAUDE.md) | [Componentes](./docs/COMPONENT_DESIGN_SYSTEM.md) | [Guidelines](./docs/MEDICAL_CONTENT_STRATEGY.md) |

📚 **[Índice Completo de Documentação](./DOCUMENTATION_INDEX.md)** | 🏗️ **[Arquitetura do Sistema](./docs/SYSTEM_ARCHITECTURE.md)** | 🧪 **[Guia de Testes](./docs/TESTING_GUIDE.md)**

## 🏥 Sobre o Projeto

Site institucional desenvolvido para a Clínica Saraiva Vision, especializada em oftalmologia em Caratinga-MG. O projeto foi completamente modernizado com as mais recentes tecnologias web, incluindo componentes UI avançados, sistema de performance monitoring, integração com redes sociais e conformidade total com LGPD e acessibilidade.

### 🚀 Arquitetura Moderna

O projeto utiliza uma arquitetura modular e escalável:
- **Frontend**: React 18 com Vite para build otimizado
- **UI Components**: Sistema de design avançado com componentes 3D e animações
- **Performance**: Monitoramento em tempo real e otimização automática
- **Acessibilidade**: WCAG 2.1 AA compliance com hooks dedicados
- **Integrações**: Instagram, WhatsApp, Google Maps e muito mais

### 🎯 Características Principais

- **Design Responsivo**: Interface moderna que se adapta a qualquer dispositivo
- **Performance Otimizada**: Carregamento rápido e experiência fluida com monitoring
- **SEO Avançado**: Otimização completa para motores de busca
- **Multilíngue**: Suporte a português e inglês com i18next
- **Acessibilidade Total**: Conformidade com WCAG 2.1 AA e hooks de acessibilidade
- **Componentes 3D**: Ícones sociais e elementos UI com efeitos 3D avançados
- **Performance Monitoring**: Sistema completo de monitoramento em tempo real
- **LGPD Compliance**: Sistema completo de consentimento e proteção de dados
- **Integração Social**: Instagram Feed, WhatsApp Business e redes sociais
- **PWA Ready**: Funcionalidades de aplicativo web progressivo

## 🚀 Tecnologias Utilizadas

### Frontend Stack
- **React 18** - Framework principal
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS** - Framework de estilização
- **Framer Motion** - Animações fluidas
- **React Router** - Roteamento SPA

### UI/UX Avançado
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones modernos
- **Class Variance Authority** - Gerenciamento de variantes CSS
- **Tailwind Merge** - Merge inteligente de classes CSS
- **Three.js/React Three Fiber** - Componentes 3D e efeitos visuais
- **Framer Motion** - Animações avançadas e micro-interações

### Performance & Monitoramento
- **Web Vitals** - Métricas de performance do Core Web
- **PerformanceObserver API** - Monitoramento em tempo real
- **IntersectionObserver** - Lazy loading e otimizações
- **RequestAnimationFrame** - Animações otimizadas

### Acessibilidade
- **React Aria** - Hooks de acessibilidade
- **WCAG 2.1 AA** - Compliance total
- **Focus Management** - Navegação por teclado
- **Screen Reader Support** - Suporte a leitores de tela

### LGPD & Privacidade
- **Consent Management** - Sistema de consentimento
- **Data Anonymization** - Anonimização de dados
- **Encryption** - Criptografia de dados sensíveis
- **Access Control** - Controle de acesso a dados

### Integrações Sociais
- **Instagram Graph API** - Feed de posts e stories
- **WhatsApp Business API** - Chat e agendamento
- **Google Maps API** - Mapas e localização
- **Google Reviews API** - Exibição de avaliações

### Backend & APIs
- **Supabase** - Backend as a Service
- **Vercel Serverless Functions** - Funções serverless
- **Edge Functions** - Processamento na edge
- **WebSockets** - Comunicação em tempo real

### Ferramentas de Desenvolvimento
- **Vitest** - Framework de testes
- **Testing Library** - Testes de componentes React
- **Playwright** - Testes E2E
- **ESLint** - Linting de código
- **PostCSS** - Processamento de CSS
- **Autoprefixer** - Prefixos CSS automáticos
- **Prettier** - Formatação de código

## 📁 Estrutura do Projeto

```
saraivavision-site-v2/
├── public/                 # Arquivos estáticos
│   ├── img/               # Imagens e assets
│   ├── robots.txt         # SEO crawler rules
│   └── sitemap.xml        # Mapa do site
├── src/
│   ├── components/        # Componentes React
│   │   ├── ui/           # Componentes base (Button, Toast, etc.)
│   │   ├── icons/        # Ícones customizados
│   │   └── __tests__/    # Testes de componentes
│   ├── pages/            # Páginas da aplicação
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilitários e configurações
│   ├── contexts/         # Context providers
│   ├── locales/          # Arquivos de tradução
│   └── utils/            # Funções utilitárias
├── api/                  # Serverless functions
├── docs/                 # Documentação do projeto
├── nginx.conf            # Configuração do servidor
├── docker-compose.yml    # Docker para desenvolvimento
└── deploy.sh            # Script de deploy
```

git clone https://github.com/Sudo-psc/saraivavision-site-v2.git
docker-compose -f docker-compose.dev.yml up --build
git clone https://github.com/Sudo-psc/saraivavision-site-v2.git

## 🛠️ Configuração e Deploy no Vercel

### Pré-requisitos
- Conta no [Vercel](https://vercel.com/)
- Vercel CLI (`npm i -g vercel`)
- Node.js 22+ e npm
- Git

### Instalação e Deploy

1. **Clone o repositório**
```bash
git clone https://github.com/Sudo-psc/saraiva-vision-site.git
cd saraiva-vision-site
```

2. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. **Faça login no Vercel**
```bash
npx vercel login
```

4. **Deploy Simples (Recomendado)**
```bash
npm run deploy:simple
```

5. **Deploy Inteligente (com fallback e auto-recuperação)**
```bash
npm run deploy:intelligent
```

6. **Deploy Manual**
```bash
# Teste o build
npm run build
# Deploy manual
npx vercel --prod --yes
```

> Consulte [`VERCEL_DEPLOYMENT_GUIDE.md`](./VERCEL_DEPLOYMENT_GUIDE.md) para detalhes de estratégias, troubleshooting e comandos avançados.

O site ficará disponível em uma URL do Vercel após o deploy.


## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento local |
| `npm run build` | Gera build de produção |
| `npm run preview` | Visualiza build de produção |
| `npm run test` | Executa testes em modo watch |
| `npm run test:run` | Executa todos os testes |
| `npm run test:coverage` | Gera relatório de cobertura |
| `npm run deploy:simple` | Deploy rápido no Vercel |
| `npm run deploy:intelligent` | Deploy inteligente com fallback e auto-recuperação |
| `npm run deploy:config` | Gerenciamento de configurações do Vercel |

## 🧪 Testes

O projeto utiliza **Vitest** e **React Testing Library** para testes:

- **Testes Unitários**: Componentes individuais
- **Testes de Integração**: Interação entre componentes
- **Cobertura de Testes**: Relatórios detalhados

```bash
# Executar testes
npm run test

# Relatório de cobertura
npm run test:coverage
```

## 🌐 Internacionalização (i18n)

Suporte completo a múltiplos idiomas:

- **Português (pt)**: Idioma padrão
- **Inglês (en)**: Idioma secundário

Arquivos de tradução localizados em `src/locales/`

## 📱 Componentes Principais

### Hero Section
Landing principal com call-to-actions otimizados e animações avançadas

### Navigation (Navbar)
Navegação responsiva com menu mobile e efeitos 3D

### Services
Apresentação dos serviços oftalmológicos com cards interativos

### Contact & Scheduling
Sistema integrado de agendamento com validação em tempo real

### Reviews Integration
Exibição dinâmica de avaliações do Google com filtragem

### 🆕 Componentes Avançados

#### Enhanced Footer
- Footer avançado com múltiplas colunas e links sociais
- Animações suaves e efeitos hover
- Totalmente responsivo e acessível
- [Documentação](./src/components/ui/enhanced-footer.md)

#### SocialIcon3D
- Ícones sociais 3D com efeitos de profundidade
- Animações interativas e hover effects
- Suporte a múltiplas redes sociais
- [Exemplo](./src/components/SocialIcon3D.demo.jsx)

#### FooterBeamBackground
- Background animado com feixes de luz
- Efeitos visuais impressionantes
- Performance otimizada com GPU acceleration
- [Exemplo](./src/components/examples/FooterBeamExample.jsx)

#### PerformanceMonitor
- Monitoramento de performance em tempo real
- Métricas Core Web Vitals
- Alertas e otimizações automáticas
- [Exemplo](./src/components/examples/PerformanceMonitoringExample.jsx)

#### InstagramFeed
- Integração completa com Instagram Graph API
- Exibição de posts e stories
- Carregamento lazy e cache otimizado
- [Setup](./docs/INSTAGRAM_SETUP.md)

#### Accessibility Components
- EnhancedFooter com suporte completo a screen readers
- ScrollToTopEnhanced com navegação por teclado
- useAccessibility hook para gestão de preferências
- [Guia](./src/components/ui/ACCESSIBILITY_GUIDE.md)

#### Error Boundaries
- AnimationErrorBoundary para tratamento de erros em animações
- PerformanceAwareWrapper para otimização de performance
- Recuperação automática e fallbacks inteligentes



## 🔧 Configuração de Produção

### Build para Produção
```bash
npm run build
```

### Deploy no Vercel
```bash
npm run deploy:simple
# ou
npm run deploy:intelligent
```

### Configuração Avançada
O arquivo [`vercel.json`](./vercel.json) define rotas, headers de segurança, regiões e limites de funções serverless. Veja exemplos e opções no guia de deploy.

## 📊 SEO e Performance


### Otimizações Implementadas
- **Core Web Vitals**: Métricas otimizadas
- **Meta Tags Dinâmicas**: SEO personalizado por página
- **Schema Markup**: Dados estruturados JSON-LD
- **Sitemap XML**: Geração automática
- **Robots.txt**: Configuração para crawlers
- **Image Optimization**: Lazy loading e WebP
- **Deploy Serverless/Edge**: Aproveitamento de edge functions e serverless para máxima performance

### Resultados de Performance
- **Lighthouse Score**: 90+ em todas as métricas
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Cumulative Layout Shift**: <0.1

## 🔐 Segurança


### Medidas Implementadas
- **HTTPS Enforced**: SSL/TLS obrigatório
- **Security Headers**: Proteção contra XSS e CSRF (configurado em `vercel.json`)
- **Content Security Policy**: Política de segurança rigorosa
- **Input Sanitization**: Validação de dados
- **LGPD Compliance**: Conformidade com proteção de dados

## 🚀 Funcionalidades Avançadas


### WhatsApp Integration
- Chat direto com a clínica
- Agendamento via WhatsApp
- Templates de mensagem

### Google Maps Integration
- Localização interativa
- Direções para a clínica
- Informações de contato

### Exit Intent Popup
- Captura de leads inteligente
- Ofertas personalizadas
- Analytics integrado

### Performance Monitoring
- Métricas em tempo real
- Alertas de performance
- Otimização automática

### Vercel Intelligent Deploy
- Deploy resiliente, com fallback automático e monitoramento de saúde
- Suporte a múltiplos ambientes e estratégias de runtime

## 👥 Equipe de Desenvolvimento

Desenvolvido com ❤️ pela equipe da Saraiva Vision

## 📞 Informações da Clínica

**Clínica Saraiva Vision**
- **Endereço**: Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga-MG
- **CEP**: 35300-299
- **Telefone**: +55 33 99860-1427
- **Email**: saraivavision@gmail.com
- **Instagram**: [@saraiva_vision](https://www.instagram.com/saraiva_vision/)

## 📄 Licença

Este projeto é propriedade da Clínica Saraiva Vision. Todos os direitos reservados.

## 🤝 Contribuição

Para contribuir com o projeto, siga as diretrizes de desenvolvimento e abra um Pull Request.

## 📚 Documentação Adicional

### 📖 Guias Essenciais
- **[📚 Índice de Documentação](./DOCUMENTATION_INDEX.md)** - Navegação completa por toda documentação
- **[🚀 Guia de Início Rápido](./DEVELOPER_QUICK_START.md)** - Setup em 5 minutos para novos desenvolvedores
- **[🔧 Troubleshooting](./TROUBLESHOOTING.md)** - Soluções para problemas comuns
- **[🤖 Guia Claude](./CLAUDE.md)** - Comandos e patterns de desenvolvimento

### 🏗️ Arquitetura e Sistema
- **[📐 Arquitetura do Sistema](./docs/SYSTEM_ARCHITECTURE.md)** - Overview técnico completo
- **[🔧 Especificação de APIs](./docs/API_DESIGN_SPECIFICATION.md)** - Design e documentação das APIs
- **[📋 Guia de Implementação](./docs/IMPLEMENTATION_GUIDE.md)** - Padrões de desenvolvimento

### 🎨 Design e Interface
- **[🎨 Guia de Marca](./docs/BRAND_GUIDE.md)** - Identidade visual e guidelines
- **[🧩 Sistema de Design](./docs/DESIGN_SYSTEM_INDEX.md)** - Componentes e tokens
- **[📱 Design de Componentes](./docs/COMPONENT_DESIGN_SYSTEM.md)** - Padrões de UI/UX

### 🧪 Qualidade e Testes
- **[🧪 Guia de Testes](./docs/TESTING_GUIDE.md)** - Estratégias e práticas de teste
- **[📊 Testes GTM](./docs/GTM_TESTING.md)** - Validação de analytics


### 🚀 Deploy e Produção
- **[✅ Guia de Deploy Vercel](./VERCEL_DEPLOYMENT_GUIDE.md)** - Estratégias, troubleshooting e comandos
- **[📄 Status do Deploy](./DEPLOY_STATUS.md)** - Status e histórico de deploys
- **[🔒 Playbook de Segurança](./SECURITY_ROTATION_PLAYBOOK.md)** - Rotação de credenciais

### 📈 SEO e Conteúdo
- **[📈 Plano de SEO](./docs/SEO_DESIGN_PLAN.md)** - Estratégia de otimização
- **[🏥 Estratégia Médica](./docs/MEDICAL_CONTENT_STRATEGY.md)** - Guidelines de conteúdo médico
- **[⚡ Performance](./README_PERF.md)** - Otimizações e métricas

### 🔧 Manutenção e Suporte
- **[🛠️ Correções Console](./CONSOLE_FIXES.md)** - Fixes para problemas comuns
- **[🌐 Nginx Updates](./NGINX_UPDATE_NOTES.md)** - Configuração do servidor
- **[🔍 Auditoria URLs](./URL_AUDIT_REPORT.md)** - Relatório de links e SEO

---

**Site desenvolvido com foco em experiência do usuário, performance e resultados para a Clínica Saraiva Vision** 🎯
