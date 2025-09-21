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

Site institucional desenvolvido para a Clínica Saraiva Vision, especializada em oftalmologia em Caratinga-MG. O projeto foi recentemente adaptado para deploy na plataforma **Vercel**, aproveitando recursos de serverless, edge functions e automação inteligente de deploy. Agora, conta com estratégias avançadas de fallback, monitoramento e múltiplos ambientes de execução, garantindo alta disponibilidade, performance e facilidade de manutenção.

### 🚀 Deploy Inteligente com Vercel

O sistema de deploy utiliza scripts inteligentes que:
- Testam múltiplas configurações de runtime (Node.js 22.x, 18.x, 20.x, Edge, Static)
- Realizam health checks automáticos antes do deploy
- Fazem backup/restauração automática das configs
- Aplicam fallback para deploy estático em caso de falha
- Permitem gerenciamento dinâmico de configurações via scripts

Veja detalhes em [`VERCEL_DEPLOYMENT_GUIDE.md`](./VERCEL_DEPLOYMENT_GUIDE.md) e status em [`DEPLOY_STATUS.md`](./DEPLOY_STATUS.md).

### 🎯 Características Principais

- **Design Responsivo**: Interface moderna que se adapta a qualquer dispositivo
- **Performance Otimizada**: Carregamento rápido e experiência fluida
- **SEO Avançado**: Otimização completa para motores de busca
- **Multilíngue**: Suporte a português e inglês com i18next
- **Acessibilidade**: Conformidade com WCAG 2.1 AA
- **PWA Ready**: Funcionalidades de aplicativo web progressivo

## 🚀 Tecnologias Utilizadas

### Frontend Stack
- **React 18** - Framework principal
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS** - Framework de estilização
- **Framer Motion** - Animações fluidas
- **React Router** - Roteamento SPA

### UI/UX
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones modernos
- **Class Variance Authority** - Gerenciamento de variantes CSS
- **Tailwind Merge** - Merge inteligente de classes CSS

### Internacionalização
- **React i18next** - Sistema de tradução
- **i18next Browser LanguageDetector** - Detecção automática de idioma

### Backend & Integrações
- **Supabase** - Backend as a Service
- **Google Maps API** - Mapas e localização
- **Google Reviews API** - Exibição de avaliações
- **WhatsApp Business API** - Integração direta

### Ferramentas de Desenvolvimento
- **Vitest** - Framework de testes
- **Testing Library** - Testes de componentes React
- **ESLint** - Linting de código
- **PostCSS** - Processamento de CSS
- **Autoprefixer** - Prefixos CSS automáticos

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
Landing principal com call-to-actions otimizados

### Navigation (Navbar)
Navegação responsiva com menu mobile

### Services
Apresentação dos serviços oftalmológicos

### Contact & Scheduling
Sistema integrado de agendamento

### Reviews Integration
Exibição dinâmica de avaliações do Google



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
