# 🔒 Guia de Segurança - Saraiva Vision

## ⚠️ IMPORTANTE: Chaves de API Removidas

Por motivos de segurança, todas as chaves de API reais foram removidas do repositório e substituídas por placeholders.

### 🔑 Chaves Removidas:

1. **Google Maps API Keys**
   - `VITE_GOOGLE_MAPS_API_KEY`
   - `VITE_GOOGLE_PLACES_API_KEY`
   - `GOOGLE_MAPS_API_KEY`

2. **Resend Email API**
   - `RESEND_API_KEY`

3. **Google Business API**
   - `GOOGLE_BUSINESS_CLIENT_SECRET`
   - `GOOGLE_BUSINESS_REFRESH_TOKEN`
   - `GOOGLE_BUSINESS_ACCESS_TOKEN`
   - `GOOGLE_BUSINESS_ENCRYPTION_KEY`

### 🛡️ Como Configurar as Chaves:

#### Para Desenvolvimento Local:
1. Copie `.env.example` para `.env.local`
2. Substitua os placeholders pelas chaves reais
3. **NUNCA** commite arquivos `.env*` com chaves reais

#### Para Produção:
1. Configure as variáveis de ambiente no servidor/plataforma
2. Use gerenciadores de secrets (AWS Secrets Manager, etc.)
3. Configure no painel do Vercel/Netlify se usando essas plataformas

### 🚨 Regras de Segurança:

- ✅ **SEMPRE** use variáveis de ambiente para chaves sensíveis
- ✅ **SEMPRE** adicione arquivos `.env*` ao `.gitignore`
- ❌ **NUNCA** commite chaves reais no código
- ❌ **NUNCA** exponha chaves em logs ou comentários
- ❌ **NUNCA** compartilhe chaves em canais inseguros

### 📋 Checklist de Segurança:

- [x] Chaves removidas dos arquivos de ambiente
- [x] Placeholders seguros implementados
- [x] .gitignore atualizado para arquivos de backup
- [x] Arquivos de memória limpos
- [x] Documentação de segurança criada

### 🔧 Para Desenvolvedores:

Se você precisar das chaves reais para desenvolvimento:
1. Entre em contato com o administrador do projeto
2. Configure as chaves localmente em `.env.local`
3. Teste a funcionalidade antes de fazer deploy

---
**⚠️ LEMBRE-SE: A segurança é responsabilidade de todos!**