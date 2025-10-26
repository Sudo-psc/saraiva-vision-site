# 🔧 Correção CORS - Sanity.io

## ⚠️ Problema Identificado

```
Access to fetch at 'https://92ocrdmp.api.sanity.io/v2025-10-25/...' 
from origin 'https://www.saraivavision.com.br' has been blocked by CORS policy
```

**Causas:**
1. ❌ API version `v2025-10-25` **não existe** (data futura)
2. ❌ CORS não configurado no Sanity para `www.saraivavision.com.br`
3. ❌ Request feito do browser (deve ser server-side)

---

## ✅ Solução Implementada

### 1. Configurar CORS no Sanity (OBRIGATÓRIO)

**Passos:**

1. Acessar: https://www.sanity.io/manage
2. Projeto **92ocrdmp** > **Settings** > **API**
3. Seção **CORS Origins** > **Add CORS origin**
4. Adicionar:
   ```
   https://www.saraivavision.com.br
   https://saraivavision.com.br
   http://localhost:3000
   http://localhost:8080
   ```
5. ✅ **Allow credentials**: OFF (dataset público)
6. Salvar

**Screenshot mental:** Deve aparecer lista verde com 4 origens.

---

### 2. Route Handler Next.js (Implementado)

**Arquivo:** `app/api/blog/recent/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '92ocrdmp',
  dataset: 'production',
  apiVersion: '2024-05-16', // ✅ Data válida fixa
  useCdn: true,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3');

    const query = `*[_type == "blogPost"] | order(publishedAt desc) [0...${limit}] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      "author": author->name,
      publishedAt
    }`;

    const posts = await client.fetch(query);

    return NextResponse.json({
      success: true,
      data: posts,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch posts',
    }, { status: 500 });
  }
}

export const runtime = 'edge';
```

---

### 3. Variáveis de Ambiente

**Arquivo:** `.env.local`

```bash
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=92ocrdmp
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_VERSION=2024-05-16
# SANITY_READ_TOKEN=sk_... # Apenas se dataset privado
```

---

### 4. Cliente Sanity Reutilizável

**Arquivo:** `src/lib/sanity.ts`

```typescript
import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: '92ocrdmp',
  dataset: 'production',
  apiVersion: '2024-05-16',
  useCdn: true,
  token: process.env.SANITY_READ_TOKEN,
});
```

---

## 🧪 Testes de Validação

### 1. Teste Backend (Prova que API funciona)

```bash
curl "https://92ocrdmp.api.sanity.io/v2024-05-16/data/query/production?query=*%5B_type%3D%3D%22blogPost%22%5D%5B0%5D%7Btitle%7D"

# ✅ Esperado:
# {"query":"...","result":{"title":"..."},"ms":10}
```

### 2. Teste CORS (Origem Real)

```bash
curl -H "Origin: https://www.saraivavision.com.br" \
     "https://92ocrdmp.api.sanity.io/v2024-05-16/data/query/production?query=*%5B_type%3D%3D%22blogPost%22%5D%5B0%5D%7Btitle%7D" \
     -v 2>&1 | grep "access-control"

# ✅ Esperado (após configurar CORS):
# < access-control-allow-origin: https://www.saraivavision.com.br
```

### 3. Teste Route Handler

```bash
# Local
curl http://localhost:3000/api/blog/recent

# Produção
curl https://www.saraivavision.com.br/api/blog/recent
```

### 4. Teste Browser (HTML Interativo)

Abra: `http://localhost:8080/test-sanity-cors.html`

Clique em **"Teste 1: API Direta"**

✅ **Sucesso:** Posts aparecem sem erro CORS  
❌ **Falha:** Mensagem de erro CORS

---

## 📊 Diagnóstico de Erros

### Erro: `HTTP 403`
**Causa:** CORS não configurado  
**Solução:** Adicionar domínio no Sanity (passo 1)

### Erro: `HTTP 404 - Version not found`
**Causa:** API version inválida (ex: v2025-10-25)  
**Solução:** Usar `v2024-05-16` ou anterior

### Erro: `No 'Access-Control-Allow-Origin' header`
**Causa:** CORS não configurado OU dataset privado  
**Solução:** Configurar CORS + usar server-side

### Erro: `Unauthorized`
**Causa:** Dataset privado sem token  
**Solução:** Adicionar `SANITY_READ_TOKEN` e usar route handler

---

## 🚀 Deploy em Produção

### Checklist Pré-Deploy

```bash
# ✅ ANTES DO DEPLOY
[ ] CORS configurado no Sanity (2+ domínios)
[ ] API version corrigida para v2024-05-16
[ ] Route handler criada em app/api/blog/recent/route.ts
[ ] Variáveis em .env.local (local) e Vercel (produção)
[ ] Teste local: curl http://localhost:3000/api/blog/recent
```

### Deploy Next.js

```bash
# Build local
npm run build

# Verificar erros
npm run lint

# Deploy (se não usar Vercel)
npm run deploy
```

### Configurar Variáveis no Vercel

```bash
# Via CLI
vercel env add NEXT_PUBLIC_SANITY_PROJECT_ID
# Valor: 92ocrdmp

vercel env add NEXT_PUBLIC_SANITY_DATASET
# Valor: production

vercel env add SANITY_API_VERSION
# Valor: 2024-05-16

# Se precisar token:
vercel env add SANITY_READ_TOKEN
# Valor: sk_...
```

Ou via dashboard: https://vercel.com/projeto/settings/environment-variables

---

## 📝 Uso no Frontend

### Exemplo React Component

```jsx
import { useEffect, useState } from 'react';

export default function BlogRecentPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/blog/recent?limit=3')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setPosts(data.data);
        } else {
          throw new Error(data.error);
        }
      })
      .catch(err => {
        console.error('Erro ao buscar posts:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando posts...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>Posts Recentes</h2>
      {posts.map(post => (
        <article key={post._id}>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
          <a href={`/blog/${post.slug}`}>Ler mais</a>
        </article>
      ))}
    </div>
  );
}
```

---

## 🔄 Alternativa: Fetch Direto (Após Configurar CORS)

```javascript
// ⚠️ Apenas se CORS estiver configurado no Sanity
const query = encodeURIComponent('*[_type=="blogPost"][0...3]{title, slug}');
const url = `https://92ocrdmp.api.sanity.io/v2024-05-16/data/query/production?query=${query}`;

fetch(url)
  .then(res => res.json())
  .then(data => console.log(data.result))
  .catch(console.error);
```

**Vantagens do Route Handler:**
- ✅ Token seguro (server-side)
- ✅ Cache otimizado
- ✅ Sem configuração CORS
- ✅ Rate limiting controlado

---

## 🛡️ Segurança

### ❌ NUNCA FAZER

```javascript
// ❌ Token exposto no frontend
const client = createClient({
  token: 'sk_abc123...', // PERIGOSO!
});
```

### ✅ SEMPRE FAZER

```javascript
// ✅ Token no servidor
const client = createClient({
  token: process.env.SANITY_READ_TOKEN, // SEGURO
});
```

---

## 📚 Referências

- [Sanity CORS Setup](https://www.sanity.io/docs/front-ends/cors)
- [API Versioning](https://www.sanity.io/docs/api-versioning)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)

---

## 🆘 Suporte

**Erro persiste após configurar CORS?**

1. Limpar cache: `Ctrl+Shift+R` (hard reload)
2. Testar em aba anônima
3. Verificar console: `Network > Headers > Response Headers`
4. Conferir se domínio está EXATO no Sanity (com/sem `www`)
5. Aguardar 1-2 min para propagação

**Contato:**
- GitHub Issues: https://github.com/Sudo-psc/saraivavision-site-v2/issues
- Sanity Support: https://www.sanity.io/help

---

**Última atualização:** 2025-10-26  
**Autor:** Master Dev - CORS Specialist
