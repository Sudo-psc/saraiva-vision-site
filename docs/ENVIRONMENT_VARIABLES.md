# Variáveis de Ambiente - Saraiva Vision

Este documento descreve todas as variáveis de ambiente necessárias para o projeto Saraiva Vision.

## Configuração no Vercel

Para configurar as variáveis de ambiente no Vercel:

1. Acesse o dashboard do projeto no Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione cada variável para os ambientes necessários:
   - **Production**: Para o site em produção
   - **Preview**: Para deploys de preview (branches)
   - **Development**: Para desenvolvimento local

## Variáveis Obrigatórias

### Vercel (Automáticas)
```bash
VITE_VERCEL_ENV=production|preview|development
VITE_VERCEL_URL=your-deployment-url.vercel.app
VITE_VERCEL_BRANCH_URL=your-branch-url.vercel.app
```

### APIs e Backend
```bash
# URL base da API backend (VPS)
VITE_API_BASE_URL=https://api.saraivavision.com.br

# URL base do WordPress headless
VITE_WP_BASE_URL=https://cms.saraivavision.com.br
```

### Supabase
```bash
# URL do projeto Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co

# Chave anônima (pública) do Supabase
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### PostHog Analytics
```bash
# Chave pública do PostHog
VITE_POSTHOG_KEY=phc_your_key_here

# Host do PostHog (opcional, padrão: https://us.i.posthog.com)
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

### Google Services
```bash
# Chave da API do Google Maps
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC...

# ID do local no Google Places (para reviews)
VITE_GOOGLE_PLACE_ID=ChIJN1t_tDeuEmsRUsoyG83frY4
```

### reCAPTCHA
```bash
# Site key do reCAPTCHA v2
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

## Variáveis Opcionais

### Instagram
```bash
# Token de acesso do Instagram Basic Display API
VITE_INSTAGRAM_ACCESS_TOKEN=IGQVJXeUNqc...

# ID do usuário Instagram
VITE_INSTAGRAM_USER_ID=17841405793187218
```

### Resend (se usado no cliente)
```bash
# Chave pública do Resend (apenas se necessário no cliente)
VITE_RESEND_PUBLIC_KEY=re_your_public_key
```

## Segurança

### ⚠️ IMPORTANTE: Prefixo VITE_

Todas as variáveis de ambiente que serão usadas no frontend **DEVEM** ter o prefixo `VITE_`. 

- ✅ `VITE_API_BASE_URL` - Será incluída no bundle
- ❌ `API_BASE_URL` - Será `undefined` no cliente

### 🔒 Chaves Secretas

**NUNCA** exponha chaves secretas com o prefixo `VITE_`:

- ❌ `VITE_SUPABASE_SERVICE_ROLE_KEY` - PERIGOSO!
- ❌ `VITE_RESEND_API_KEY` - PERIGOSO!
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Seguro (apenas no servidor)

## Validação

O projeto inclui validação automática das variáveis de ambiente:

- **Desenvolvimento**: Falha com erro claro se variáveis obrigatórias estiverem faltando
- **Produção**: Loga avisos e desabilita features dependentes

## Ambientes

### Development (Local)
```bash
VITE_VERCEL_ENV=development
VITE_API_BASE_URL=http://localhost:3001
VITE_WP_BASE_URL=http://localhost:8083
# ... outras variáveis
```

### Preview (Branches)
```bash
VITE_VERCEL_ENV=preview
VITE_API_BASE_URL=https://api-staging.saraivavision.com.br
VITE_WP_BASE_URL=https://cms-staging.saraivavision.com.br
# ... outras variáveis
```

### Production
```bash
VITE_VERCEL_ENV=production
VITE_API_BASE_URL=https://api.saraivavision.com.br
VITE_WP_BASE_URL=https://cms.saraivavision.com.br
# ... outras variáveis
```

## Troubleshooting

### Erro: "Missing VITE_* environment variable"
1. Verifique se a variável está definida no Vercel
2. Confirme que tem o prefixo `VITE_`
3. Redeploy o projeto após adicionar variáveis

### Erro: "API_BASE_URL is undefined"
- Certifique-se de usar `import.meta.env.VITE_API_BASE_URL`
- Não use `process.env.API_BASE_URL` no cliente

### PostHog não inicializa
1. Verifique `VITE_POSTHOG_KEY`
2. Confirme que a chave é válida no dashboard do PostHog
3. Verifique o console para erros de CORS

### Google Maps não carrega
1. Verifique `VITE_GOOGLE_MAPS_API_KEY`
2. Confirme que a API está habilitada no Google Cloud Console
3. Verifique as restrições de domínio da chave