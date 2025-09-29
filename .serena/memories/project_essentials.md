# Saraiva Vision - Project Essentials

## 🎯 Visão Executiva
Plataforma médica oftalmológica em Caratinga, MG, Brasil. Site em produção com requisitos rigorosos de compliance CFM/LGPD.

**Status**: ✅ Produção ativa | 🏥 Healthcare | 🇧🇷 Mercado brasileiro | ⚖️ CFM/LGPD compliance

## 🛠 Tech Stack Principal
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js 22+ + Express + Nginx (VPS nativo)
- **Database**: Supabase PostgreSQL + WordPress externo
- **Auth**: Supabase Auth + WordPress JWT para admin

## 🚀 Comandos Essenciais
```bash
npm run dev              # Servidor de desenvolvimento (porta 3002)
npm run build            # Build para produção
npm run test:comprehensive  # Testes completos
bash scripts/deploy-production.sh  # Deploy VPS (no servidor)
```

## ⭐ Funcionalidades Críticas
- **Gestão de Pacientes**: Agendamentos, contato, avaliações
- **Integração WordPress**: CMS externo via REST API
- **Social**: Instagram, podcasts, Google Reviews
- **AI**: Chatbot Pulse.live integration
- **Compliance**: Disclaimers médicos, PII detection, LGPD

## 🏗 Arquitetura
```
User → Nginx (31.97.129.78) → Static Files (/var/www/html)
                            → API Proxy (/api/*) → Node.js Express
                            → WordPress Proxy (/wp-json/*) → cms.saraivavision.com.br
```

## 📋 Processo de Deploy
1. Build local: `npm run build`
2. Executar no VPS: `bash scripts/deploy-production.sh`
3. Script auto-lida com: backups, test Nginx, cópia de arquivos, permissões, reload
4. Deploy zero-downtime com rollback capability

## 🗃 Database Schema (Supabase)
- `contact_messages` - Contato de pacientes (LGPD compliant)
- `appointments` - Sistema de agendamentos com lembretes
- `message_outbox` - Fila email/SMS assíncrona
- `podcast_episodes` - Gerenciamento de conteúdo com RSS
- `profiles` - Auth com RBAC (user/admin/super_admin)

## 🔧 Variáveis de Ambiente
```bash
VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY  # Database
VITE_GOOGLE_MAPS_API_KEY                     # Maps integration
VITE_WORDPRESS_API_URL=https://cms.saraivavision.com.br  # WordPress API
RESEND_API_KEY                               # Email service
```

## 📊 Estado Atual (2025-09-29)
- ✅ VPS deployment successful (bundle: 154KB main, 11MB assets)
- ✅ WordPress REST API working (cms.saraivavision.com.br)
- ✅ Nginx optimized com CORS, security headers, rate limiting
- ✅ Build optimizations: aggressive chunking, no sourcemaps em prod
- ✅ Produção verificada: todos health checks passing

## 🔗 Links Importantes
- **Production**: https://saraivavision.com.br
- **WordPress Admin**: https://cms.saraivavision.com.br
- **Blog Público**: https://blog.saraivavision.com.br
- **VPS**: 31.97.129.78 (Ubuntu/Debian nativo)

## ⚠️ Observações Importantes
- **Sem Docker**: Deploy nativo em VPS para performance otimizada
- **WordPress Externo**: CMS gerenciado via APIs externas
- **CFM Compliance**: Validação automática de conteúdo médico
- **LGPD**: Consent management e PII protection integrados