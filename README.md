# Saraiva Vision - Clínica Oftalmológica

![Saraiva Vision Logo](https://raw.githubusercontent.com/sudo-psc/saraiva-vision-site/kiro-branch/public/favicon-32x32.png)

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

### 🚀 Arquitetura Native VPS (Sem Docker)

O projeto utiliza uma arquitetura nativa VPS modular e escalável:
- **Frontend**: React 18 com Vite servido pelo Nginx nativo
- **Backend**: Node.js + Express.js rodando como serviços systemd nativos
- **Database**: MySQL nativo para todos os dados da aplicação
- **Cache**: Redis nativo para otimização de performance
- **CMS**: WordPress headless com PHP-FPM 8.1+ nativo
- **Proxy**: Nginx nativo como reverse proxy e servidor web
- **Deployment**: Sem containerização - serviços nativos do Ubuntu/Debian

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

### Integração WordPress (API Externa)
- **WordPress REST API**: Integração completa com WordPress REST API em `cms.saraivavision.com.br`
- **JWT Authentication**: Sistema de autenticação JWT para WordPress API externa
- **Content Caching**: Cache inteligente de posts e categorias (LRU, 24h TTL)
- **Blog Management**: Sistema completo de gerenciamento de blog via API externa
- **Dual Subdomain Architecture**: `blog` (HTML) e `cms` (JSON API) - [Ver Documentação](./docs/WORDPRESS_CMS_URL_ARCHITECTURE.md)
- **Circuit Breaker**: Proteção contra falhas de API com recovery automático
- **Fallback System**: Conteúdo degradado quando API indisponível

### Ferramentas de Desenvolvimento
- **Vitest** - Framework de testes
- **Testing Library** - Testes de componentes React
- **Playwright** - Testes E2E
- **ESLint** - Linting de código
- **PostCSS** - Processamento de CSS
- **Autoprefixer** - Prefixos CSS automáticos

## 🔧 SSL Certificate Troubleshooting Guide

This section provides comprehensive guidance for diagnosing and fixing SSL certificate issues with the WordPress GraphQL endpoint.

### 🚨 Common SSL Issues

#### "The certificate for this server is invalid" Error

This error typically indicates one or more of the following issues:

1. **Expired Certificate**: SSL certificate has passed its expiration date
2. **Incomplete Certificate Chain**: Missing intermediate certificates
3. **Domain Mismatch**: Certificate issued for different domain
4. **Self-Signed Certificate**: Not trusted by browser CAs
5. **Weak SSL Configuration**: Outdated protocols or cipher suites

### 🔍 Diagnostic Commands

#### 1. Check DNS Resolution
```bash
nslookup cms.saraivavision.com.br
```

#### 2. Test SSL Certificate
```bash
openssl s_client -connect cms.saraivavision.com.br:443 -servername cms.saraivavision.com.br -showcerts
```

#### 3. Verify Certificate Chain
```bash
openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt /path/to/certificate.pem
```

#### 4. Test with SSL Labs
Visit: https://www.ssllabs.com/ssltest/analyze.html?d=cms.saraivavision.com.br

### 🛠️ Server-Side Fixes

#### Nginx Configuration (SSL Optimization)
```nginx
server {
    listen 443 ssl http2;
    server_name cms.saraivavision.com.br;

    # SSL Certificate (ensure full chain)
    ssl_certificate /etc/letsencrypt/live/cms.saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cms.saraivavision.com.br/privkey.pem;

    # SSL Protocol Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    # GraphQL Endpoint
    location /graphql {
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "https://saraivavision.com.br" always;
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
            add_header Access-Control-Allow-Credentials "true" always;
            return 204;
        }

        proxy_pass http://localhost:8080; # WordPress backend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Renew Certificate with Certbot
```bash
# Renew existing certificate
sudo certbot renew --nginx

# Force new certificate for specific domain
sudo certbot --nginx -d cms.saraivavision.com.br --force-renewal

# Test renewal process
sudo certbot renew --dry-run
```

#### Verify Certificate Chain
```bash
# Check certificate chain completeness
openssl s_client -connect cms.saraivavision.com.br:443 -showcerts </dev/null 2>/dev/null | openssl x509 -text | grep -A 10 "Subject Alternative Name"

# Verify all certificates in chain
openssl s_client -connect cms.saraivavision.com.br:443 -showcerts </dev/null 2>/dev/null | awk '/BEGIN CERTIFICATE/,/END CERTIFICATE/{print $0}' > fullchain.pem
openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt fullchain.pem
```

### 🌐 CORS Configuration

Ensure CORS headers are properly configured for cross-origin requests:

```nginx
# In your GraphQL location block
add_header Access-Control-Allow-Origin "https://saraivavision.com.br" always;
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
add_header Access-Control-Allow-Credentials "true" always;
```

### 📱 Frontend Error Handling

The enhanced GraphQL client automatically handles SSL/CORS errors:

```javascript
// Example of SSL error handling
import { gqlQuery, GraphQLError, GraphQLErrorType } from './lib/graphqlClient';

try {
  const result = await gqlQuery('{ posts { nodes { id title } } }');
} catch (error) {
  if (error.isSSLError()) {
    // Display user-friendly SSL error message
    console.log('SSL Certificate Error:', error.getUserMessage());
  } else if (error.isCORSError()) {
    // Handle CORS issues
    console.log('CORS Error:', error.getUserMessage());
  }
}
```

### 🔧 Environment Configuration

Ensure your `.env.production` file has the correct configuration:

```bash
# WordPress GraphQL Configuration
VITE_WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql
VITE_WORDPRESS_SITE_URL=https://cms.saraivavision.com.br

# GraphQL Client Configuration
VITE_GRAPHQL_TIMEOUT=15000
VITE_GRAPHQL_MAX_RETRIES=3
VITE_GRAPHQL_RETRY_DELAY=1000
```

### 🧪 Testing and Validation

#### Test GraphQL Endpoint
```bash
curl -i https://cms.saraivavision.com.br/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

#### Browser Testing
1. Open Chrome DevTools → Network tab
2. Look for GraphQL requests
3. Check for SSL/CORS errors in console
4. Test in Safari (stricter SSL validation)

### 📊 Monitoring and Maintenance

#### Automated SSL Renewal
```bash
# Setup automated renewal (systemd timer)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Check renewal status
sudo systemctl status certbot.timer
sudo certbot certificates
```

#### Health Checks
```bash
# Check SSL certificate status
sudo certbot certificates --check-expiry

# Monitor Nginx SSL handshake errors
sudo tail -f /var/log/nginx/error.log | grep SSL

# Check WordPress GraphQL endpoint
curl -s https://cms.saraivavision.com.br/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' | jq .
```

### 🆘 Emergency Recovery

If SSL issues persist:

1. **Temporary HTTP Fallback**: Use local proxy endpoint
2. **Certificate Re-issuance**: Force new certificate with different CA
3. **CDN Proxy**: Use Cloudflare or similar for SSL termination
4. **Debug Mode**: Enable detailed SSL logging in Nginx

### 🔍 Troubleshooting Checklist

- [ ] DNS resolves to correct IP
- [ ] Certificate not expired
- [ ] Certificate chain complete
- [ ] Domain matches certificate
- [ ] CORS headers configured
- [ ] Nginx SSL settings optimized
- [ ] Firewall allows port 443
- [ ] SSL Labs grade A- or better
- [ ] Browser console clear of errors
- [ ] GraphQL requests successful

### 📞 Support Resources

- **SSL Labs**: https://www.ssllabs.com/ssltest/
- **Let's Encrypt Community**: https://community.letsencrypt.org/
- **Nginx SSL Docs**: https://nginx.org/en/docs/http/configuring_https_servers.html
- **Mozilla SSL Config Generator**: https://ssl-config.mozilla.org/

### 🎯 Success Criteria

The SSL issue is resolved when:
- ✅ No SSL errors in browser console
- ✅ GraphQL requests return 200 OK
- ✅ SSL Labs grade A- or better
- ✅ Works in all major browsers
- ✅ No mixed content warnings
- ✅ HTTPS padlock displayed
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
├── setup-vps-native.sh   # Setup inicial do VPS nativo
├── deploy-vps-native.sh  # Deploy nativo sem Docker
└── docs/                 # Scripts WordPress e configs Nginx
```

git clone https://github.com/Sudo-psc/saraivavision-site-v2.git
docker-compose -f docker-compose.dev.yml up --build
git clone https://github.com/Sudo-psc/saraivavision-site-v2.git

## 🛠️ Setup e Deploy Native VPS (Sem Docker)

### Pré-requisitos
- Servidor Ubuntu/Debian VPS (31.97.129.78)
- Acesso root via SSH
- Domínio apontando para o servidor
- Node.js 18+, MySQL, Redis, PHP-FPM 8.1+, Nginx (todos nativos)

### Setup Inicial do VPS

1. **Executar setup automático do VPS**
```bash
# No servidor VPS (como root)
wget https://raw.githubusercontent.com/Sudo-psc/saraiva-vision-site/main/setup-vps-native.sh
chmod +x setup-vps-native.sh
sudo ./setup-vps-native.sh
```

Este script instala e configura automaticamente:
- ✅ Node.js 18+ nativo
- ✅ Nginx com configuração otimizada
- ✅ MySQL server nativo
- ✅ Redis server nativo
- ✅ PHP-FPM 8.1+ nativo
- ✅ Certificados SSL (Certbot)
- ✅ Firewall (UFW)
- ✅ Serviços systemd para API

### Deploy da Aplicação

1. **Clone o repositório (desenvolvimento)**
```bash
git clone https://github.com/Sudo-psc/saraivavision-site-v2.git
cd saraivavision-site-v2
```

2. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.production
# Edite .env.production com configurações do VPS
```

3. **Deploy automático para VPS**
```bash
# Build local e deploy para VPS
./deploy-vps-native.sh
```

O script de deploy realiza automaticamente:
- ✅ Build da aplicação React
- ✅ Backup do deployment anterior
- ✅ Upload e extração no VPS
- ✅ Restart dos serviços nativos
- ✅ Verificação de saúde

### Comandos de Deploy

```bash
# Deploy completo
npm run deploy              # Build + deploy automático

# Comandos VPS individuais
npm run deploy:production   # Mostrar comandos manuais
npm run deploy:vps          # Verificar status dos serviços
npm run deploy:health       # Health check

# No servidor VPS (manual se necessário):
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx
sudo systemctl restart saraiva-api
```


## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento local |
| `npm run build` | Gera build de produção |
| `npm run preview` | Visualiza build de produção |
| `npm run test` | Executa testes em modo watch |
| `npm run test:run` | Executa todos os testes |
| `npm run test:coverage` | Gera relatório de cobertura |
| `npm run deploy` | Build + deploy automático para VPS |
| `npm run deploy:production` | Mostrar comandos de deploy manual |
| `npm run deploy:vps` | Verificar status dos serviços VPS |
| `npm run deploy:health` | Health check do servidor |
| `./setup-vps-native.sh` | Setup inicial completo do VPS |
| `./deploy-vps-native.sh` | Deploy automatizado para VPS |

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

### Deploy para Servidor
```bash
npm run deploy:production
# ou
npm run deploy:preview
```

### Configuração Native VPS
O Nginx nativo é configurado para:
- **Servir arquivos estáticos** do React SPA em `/var/www/html/`
- **Proxy reverso** para API Node.js (porta 3001)
- **Proxy WordPress** headless (porta 8080)
- **Headers de segurança** e cache otimizado
- **SSL/HTTPS** com Let's Encrypt automático

Todos os serviços rodão nativamente via systemd (sem Docker).

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
- **Security Headers**: Proteção contra XSS e CSRF (configurado no Nginx)
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

### Deploy Inteligente
- Deploy resiliente com verificação de saúde automática
- Suporte a múltiplos ambientes (produção/staging)
- Rollback automático em caso de falhas

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
- **[✅ Guia de Deploy](./DEPLOYMENT_GUIDE.md)** - Estratégias, troubleshooting e comandos
- **[📄 Status do Deploy](./DEPLOY_STATUS.md)** - Status e histórico de deploys
- **[🔒 Playbook de Segurança](./SECURITY_ROTATION_PLAYBOOK.md)** - Rotação de credenciais

### 📈 SEO e Conteúdo
- **[📈 Plano de SEO](./docs/SEO_DESIGN_PLAN.md)** - Estratégia de otimização
- **[🏥 Estratégia Médica](./docs/MEDICAL_CONTENT_STRATEGY.md)** - Guidelines de conteúdo médico
- **[⚡ Performance](./README_PERF.md)** - Otimizações e métricas

### 🔧 Manutenção e Suporte
- **[🛠️ Correções Console](./CONSOLE_FIXES.md)** - Fixes para problemas comuns
- **[🌐 Nginx Updates](./NGINX_UPDATE_NOTES.md)** - Configuração do servidor
- **[🔍 Nginx Review 2025-09-29](./docs/NGINX_REVIEW_2025-09-29.md)** - Revisão completa Nginx com correções WordPress
- **[🔍 Auditoria URLs](./URL_AUDIT_REPORT.md)** - Relatório de links e SEO

---

**Site desenvolvido com foco em experiência do usuário, performance e resultados para a Clínica Saraiva Vision** 🎯
