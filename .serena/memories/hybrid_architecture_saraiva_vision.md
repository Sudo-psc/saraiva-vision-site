# Saraiva Vision - Arquitetura Híbrida Completa

## Visão Geral da Arquitetura
O projeto Saraiva Vision utiliza uma **arquitetura híbrida moderna**, separando o frontend do backend para otimizar performance, segurança e escalabilidade.

## Frontend (Site Principal)
- **Tecnologia**: Aplicação de página única (SPA) desenvolvida em React/Vite
- **Framework**: React 18.2.0 com Vite 7.1.3
- **Hospedagem**: Deploy na plataforma Vercel
- **Processo de Deploy**: A Vercel compila (build), implanta e distribui o frontend globalmente através de sua CDN
- **Benefícios**: Alta performance e disponibilidade global
- **Integração**: Código-fonte puxado diretamente do repositório Git

### Stack Técnico do Frontend
- **Routing**: React Router DOM 6.16.0
- **UI Components**: Radix UI + Tailwind CSS
- **Animações**: Framer Motion
- **Internacionalização**: i18next
- **PWA**: Service Worker com Workbox
- **TypeScript**: Suporte completo
- **Deployment**: Vercel com runtime moderno (@vercel/node)

## Backend (Serviços de Apoio)
- **Hospedagem**: VPS Linux (IP: 31.97.129.78)
- **Containerização**: Docker com Docker Compose para orquestração
- **Arquitetura**: Microserviços containerizados

### Serviços Containerizados

#### 1. API Principal
- **Tecnologia**: Node.js customizado
- **Função**: Cérebro da aplicação, fornece dados para o frontend
- **Responsabilidades**: Lógica de negócio, integração com serviços

#### 2. CMS (Sistema de Gerenciamento de Conteúdo)
- **Tecnologia**: WordPress com PHP-FPM
- **Função**: Gerenciamento de conteúdo dinâmico
- **Integração**: WordPress REST API proxy

#### 3. Banco de Dados
- **Tecnologia**: MySQL
- **Função**: Armazenamento de dados relacionais
- **Uso**: WordPress e API principal

#### 4. Cache
- **Tecnologia**: Redis
- **Função**: Caching e otimização de performance
- **Benefícios**: Redução de latência, otimização de consultas

#### 5. Proxy Reverso
- **Tecnologia**: Nginx
- **Função**: Ponto de entrada para todos os serviços backend
- **Responsabilidades**: 
  - Gerenciamento de tráfego
  - Aplicação de regras de segurança
  - Roteamento de requisições (API vs WordPress)

## Fluxo de Comunicação

### 1. Acesso do Usuário
- Usuário acessa o site
- Entrega rápida pela Vercel CDN

### 2. Requisições Frontend
- Frontend React executa no navegador
- Faz chamadas de API para backend (ex: https://api.sualoja.com.br)

### 3. Processamento Backend
- Requisições chegam ao Nginx no VPS
- Nginx roteia para serviço apropriado:
  - API Node.js para lógica de negócio
  - WordPress para conteúdo CMS

### 4. Resposta ao Frontend
- Serviços backend processam requisição
- Interação com MySQL/Redis conforme necessário
- Retorno da resposta para o frontend

## Benefícios da Arquitetura Híbrida

### Performance
- Frontend otimizado pela Vercel CDN
- Cache Redis para backend
- Separação de responsabilidades

### Escalabilidade
- Frontend escala automaticamente (Vercel)
- Backend containerizado permite escalabilidade horizontal
- Microserviços independentes

### Segurança
- Nginx como proxy reverso com regras de segurança
- Separação entre frontend e backend
- Containerização isola serviços

### Manutenibilidade
- Tecnologias especializadas para cada função
- Deploy independente de frontend e backend
- Monitoramento granular por serviço

## Endpoints e Integrações
- **WordPress REST API**: Integração para conteúdo dinâmico
- **Supabase**: Integração adicional de dados
- **Resend**: Integração para envio de emails
- **Google Maps**: Integração para localização
- **WhatsApp API**: Widget de comunicação

## Configurações de Deploy
- **Vercel**: Configurado com runtime moderno
- **Environment Variables**: Prefixo VITE_ para variáveis frontend
- **Build Scripts**: Scripts de deploy abrangentes configurados