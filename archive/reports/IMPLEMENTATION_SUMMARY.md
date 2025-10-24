# 🔧 Correção de Erros de Produção - Resumo da Implementação

**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-12
**Status**: ✅ Fase 1 e 2 Completas | ⏳ Fase 3 Pendente

---

## ✅ Componentes Criados (Fase 1 & 2)

### 1. SafeHelmet Component
**Arquivo**: `src/components/SafeHelmet.tsx`
**Soluciona**: `Helmet expects a string as a child of <title>`

**O que faz:**
- Valida que title/description sejam sempre strings válidas
- Fornece fallbacks para valores undefined/null/empty
- Garante SEO correto em todas as páginas

**Uso:**
```tsx
import { SafeHelmet } from '@/components/SafeHelmet';

<SafeHelmet
  title={post?.seo?.metaTitle || post?.title}
  description={post?.seo?.metaDescription}
  image={`https://saraivavision.com.br${post?.image}`}
/>
```

---

### 2. SafeImage Component
**Arquivo**: `src/components/SafeImage.tsx`
**Soluciona**: React Error #231 (onLoad deve ser função, não string)

**O que faz:**
- Type-safe onLoad/onError handlers
- Fallback automático para imagens quebradas
- Previne passar strings onde funções são esperadas

**Uso:**
```tsx
<SafeImage
  src="/Blog/image.avif"
  alt="Descrição"
  fallbackSrc="/Blog/image.webp"
  onLoad={() => console.log('loaded')}
/>
```

---

### 3. ResponsiveImage Component
**Arquivo**: `src/components/ResponsiveImage.tsx`
**Soluciona**: 404 em imagens AVIF

**O que faz:**
- Picture element com fallback AVIF → WebP → JPEG
- Srcset automático para 480w, 768w, 1200w
- Content negotiation baseado no navegador

**Uso:**
```tsx
<ResponsiveImage
  basePath="/Blog/capa-lentes-premium-catarata-optimized"
  alt="Lentes Premium"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

---

### 4. ErrorBoundary Component
**Arquivo**: `src/components/ErrorBoundary.tsx`
**Soluciona**: Loops de erro e propagação de erros do Helmet

**O que faz:**
- Captura erros sem quebrar a aplicação
- Previne loops (max 3 erros)
- Não reporta erros do Helmet para /errors (previne 500)
- Retry com backoff exponencial

**Uso:**
```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

---

### 5. SafeSuspense Component
**Arquivo**: `src/components/SafeSuspense.tsx`
**Soluciona**: Helmet errors durante lazy loading

**O que faz:**
- Combina Suspense + ErrorBoundary
- SafeHelmet durante loading
- Fallback visual com spinner

**Uso:**
```tsx
<SafeSuspense title="Carregando artigo...">
  <LazyComponent />
</SafeSuspense>
```

---

### 6. JotformEmbed Component
**Arquivo**: `src/components/JotformEmbed.tsx`
**Soluciona**: Same-Origin Policy warnings do Jotform

**O que faz:**
- Integração segura via postMessage API
- Sandbox apropriado
- Event tracking quando formulário enviado

**Uso:**
```tsx
<JotformEmbed formId="YOUR_FORM_ID" height="800px" />
```

---

## 🔨 Scripts Criados

### optimize-images.js
**Arquivo**: `scripts/optimize-images.js`
**Soluciona**: Falta de variantes AVIF/WebP

**O que faz:**
- Gera AVIF, WebP, JPEG em 3 resoluções (480w, 768w, 1200w)
- Processa imagens em `public/Blog/capa-*.{jpg,png}`
- Executa automaticamente no `npm run build:vite` (via prebuild:vite)

**Comandos:**
```bash
npm run optimize:images        # Manual
npm run build:vite             # Automático
```

---

## 🔧 Melhorias de Backend

### Logger Utility
**Arquivo**: `api/src/utils/logger.js`
**Melhorias:**
- Structured logging (JSON)
- Request context (requestId, IP, URL)
- Filtragem automática de dados sensíveis

---

### /errors Endpoint
**Arquivo**: `api/src/routes/errors.js`
**Soluciona**: 500 errors no endpoint /errors

**Melhorias aplicadas:**
- ✅ CORS headers explícitos
- ✅ Rate limiting mais rigoroso (10/min)
- ✅ Request ID tracking
- ✅ Structured logging
- ✅ Retry-friendly responses (200 com requestId)
- ✅ Payload size limits
- ✅ Filtragem de erros de third-party

---

## 📦 Package.json Updates

**Mudanças:**
```json
{
  "scripts": {
    "prebuild:vite": "node scripts/build-blog-posts.js && node scripts/optimize-images.js",
    "optimize:images": "node scripts/optimize-images.js"
  }
}
```

**Dependências necessárias** (já instaladas):
- ✅ sharp@0.34.4
- ✅ glob@10.4.5
- ✅ zod@3.25.76
- ✅ express-rate-limit@8.1.0

---

## ⏳ Próximos Passos (Fase 3)

### 1. Atualizar Páginas para Usar SafeHelmet

**Arquivos a modificar:**
```bash
src/pages/BlogPage.jsx          # Trocar Helmet por SafeHelmet
src/pages/HomePage.jsx          # (se usa Helmet)
src/pages/ContactPage.jsx       # (se usa Helmet)
# ... todas as páginas que usam Helmet
```

**Buscar arquivos:**
```bash
grep -r "import.*Helmet" src/pages/
```

**Template de mudança:**
```typescript
// ANTES
import { Helmet } from 'react-helmet-async';
<Helmet>
  <title>{post?.title}</title>
</Helmet>

// DEPOIS
import { SafeHelmet } from '@/components/SafeHelmet';
<SafeHelmet
  title={post?.seo?.metaTitle || post?.title}
  description={post?.seo?.metaDescription}
/>
```

---

### 2. Atualizar App.tsx/main.tsx com ErrorBoundary

**Arquivo**: `src/main.tsx` ou `src/App.tsx`

```tsx
import { ErrorBoundary } from './components/ErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';

<ErrorBoundary>
  <HelmetProvider>
    <App />
  </HelmetProvider>
</ErrorBoundary>
```

---

### 3. Gerar Imagens AVIF

**Executar:**
```bash
cd /home/saraiva-vision-site
npm run optimize:images
```

**Verificar output:**
```bash
ls -lh public/Blog/*-480w.avif
ls -lh public/Blog/*-768w.avif
ls -lh public/Blog/*-1200w.avif
```

---

### 4. Testar Build Local

```bash
npm run build:vite
npm run preview
```

**Checklist do Browser:**
- [ ] Nenhum erro "Helmet expects a string"
- [ ] Nenhum erro "React #231"
- [ ] Imagens AVIF carregando (Network tab)
- [ ] Fallback para WebP se AVIF não suportar

---

### 5. Deploy para Produção

```bash
sudo npm run deploy:quick
```

**Monitorar logs:**
```bash
# Terminal 1: Nginx
sudo tail -f /var/log/nginx/error.log

# Terminal 2: API
sudo journalctl -u saraiva-api -f
```

---

## 🧪 Testes Pós-Deploy

### Verificar /errors Endpoint
```bash
curl -X POST https://saraivavision.com.br/errors \
  -H "Content-Type: application/json" \
  -d '{
    "type": "error",
    "message": "Test error",
    "stack": "Test stack",
    "timestamp": "2025-10-12T00:00:00Z"
  }' \
  -v
```

**Esperado:**
```
HTTP/2 200
{
  "success": true,
  "requestId": "req_...",
  "message": "Error logged successfully"
}
```

---

### Verificar Imagens AVIF
```bash
curl -H "Accept: image/avif" \
  -I https://saraivavision.com.br/Blog/capa-lentes-premium-catarata-optimized-480w.avif
```

**Esperado:**
```
HTTP/2 200
Content-Type: image/avif
Vary: Accept
```

---

### Verificar GTM
**Opção 1**: Remover proxy, usar CDN direto (recomendado)

**Atualizar**: `public/index.html`
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-KF2NP85D');</script>
```

**Nginx**: Retornar 404 para `/gtm`
```nginx
location /gtm {
    return 404;
}
```

---

## 📊 Melhorias Aplicadas vs Problemas Originais

| Problema Original | Solução Implementada | Status |
|---|---|---|
| Helmet title error | SafeHelmet.tsx com validação | ✅ |
| React #231 onLoad | SafeImage.tsx type-safe | ✅ |
| AVIF 404 | optimize-images.js + ResponsiveImage | ✅ |
| /errors 500 | CORS, rate limit, logging | ✅ |
| ErrorBoundary loops | Max 3 errors, não reportar Helmet | ✅ |
| GTM 500 | Usar CDN direto (pendente config) | ⏳ |
| Jotform SOP | postMessage API | ✅ |

---

## 🚨 Rollback Plan

Se algo der errado:

```bash
# 1. Restaurar versão anterior
cd /var/www/saraivavision
sudo mv current current-broken
sudo mv previous current

# 2. Recarregar Nginx
sudo systemctl reload nginx

# 3. Ou reverter Git
cd /home/saraiva-vision-site
git log --oneline -5
git checkout COMMIT_ANTERIOR
npm run build:vite
sudo npm run deploy:quick
```

---

## 📋 Checklist Final

Antes de marcar como concluído:

### Código
- [x] SafeHelmet criado
- [x] SafeImage criado
- [x] ResponsiveImage criado
- [x] ErrorBoundary criado
- [x] SafeSuspense criado
- [x] JotformEmbed criado
- [x] optimize-images.js criado
- [x] Logger melhorado
- [x] /errors endpoint corrigido
- [x] package.json atualizado
- [ ] Páginas atualizadas para usar SafeHelmet
- [ ] App.tsx com ErrorBoundary

### Build
- [ ] Imagens AVIF geradas
- [ ] Build local testado
- [ ] Preview verificado (npm run preview)

### Deploy
- [ ] Deploy para produção
- [ ] /errors endpoint testado
- [ ] Imagens AVIF servidas corretamente
- [ ] GTM carregando (direto do CDN)
- [ ] Console limpo (sem erros)

### Monitoramento
- [ ] Logs estruturados funcionando
- [ ] Error rates normais
- [ ] Performance inalterada
- [ ] SEO meta tags corretos

---

## 💡 Comandos Úteis

```bash
# Build com otimização
npm run optimize:images && npm run build:vite

# Deploy rápido
sudo npm run deploy:quick

# Verificar logs API
sudo journalctl -u saraiva-api -n 100 --no-pager

# Verificar imagens geradas
ls -lh public/Blog/*-{480,768,1200}w.{avif,webp,jpg} | wc -l

# Testar endpoint /errors
curl -X POST http://localhost:3001/errors \
  -H "Content-Type: application/json" \
  -d '{"type":"error","message":"test"}'

# Lighthouse audit
npx lighthouse https://saraivavision.com.br/blog --view
```

---

## 🎯 Resultado Esperado

**Console do navegador:**
- ✅ Sem "Helmet expects a string"
- ✅ Sem "React error #231"
- ✅ Sem 404 em AVIF
- ✅ Sem 500 em /gtm
- ✅ Sem 500 em /errors
- ⚠️  Warning SOP do Jotform (esperado, não é erro)

**Performance:**
- ✅ AVIF reduz tamanho de imagens em ~30-50%
- ✅ Lazy loading funciona sem erros
- ✅ SEO inalterado (meta tags corretos)

---

**Documentação completa**: Ver `CLAUDE.md` e análise original acima.
