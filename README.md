# Saraiva Vision - Clínica Oftalmológica

![Saraiva Vision Logo](https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/ab3221659a2b4080af9238827a12d5de.png)

**Site institucional moderno da Clínica Saraiva Vision em Caratinga, MG**

## 🏥 Sobre o Projeto

Site institucional desenvolvido para a Clínica Saraiva Vision, especializada em oftalmologia em Caratinga-MG. O projeto combina design moderno, performance otimizada e funcionalidades avançadas para oferecer a melhor experiência aos pacientes.

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
saraiva-vision-site/
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

## 🛠️ Configuração e Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Git

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/saraiva-vision-site.git
cd saraiva-vision-site
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

O site estará disponível em `http://localhost:5173`

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Visualiza build de produção |
| `npm run test` | Executa testes em modo watch |
| `npm run test:run` | Executa todos os testes |
| `npm run test:coverage` | Gera relatório de cobertura |

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

### Accessibility Widget
Ferramenta completa de acessibilidade

## 🔧 Configuração de Produção

### Build para Produção
```bash
npm run build
```

### Deploy com Docker
```bash
docker-compose up -d
```

### Servidor Nginx
Configuração otimizada incluída em `nginx.conf`

## 📊 SEO e Performance

### Otimizações Implementadas
- **Core Web Vitals**: Métricas otimizadas
- **Meta Tags Dinâmicas**: SEO personalizado por página
- **Schema Markup**: Dados estruturados JSON-LD
- **Sitemap XML**: Geração automática
- **Robots.txt**: Configuração para crawlers
- **Image Optimization**: Lazy loading e WebP

### Resultados de Performance
- **Lighthouse Score**: 90+ em todas as métricas
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Cumulative Layout Shift**: <0.1

## 🔐 Segurança

### Medidas Implementadas
- **HTTPS Enforced**: SSL/TLS obrigatório
- **Security Headers**: Proteção contra XSS e CSRF
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

- [Guia de Implementação](./IMPLEMENTATION_GUIDE.md)
- [Manual de Deploy](./README-DEPLOY.md)
- [Relatório SEO](./SEO_AUDIT_REPORT.md)
- [Plano de Design SEO](./docs/SEO_DESIGN_PLAN.md)

---

**Site desenvolvido com foco em experiência do usuário, performance e resultados para a Clínica Saraiva Vision** 🎯