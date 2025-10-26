# 🚀 Deploy - Integração Sanity (Opção 4 - API Direta)

## ✅ Implementação Concluída

### Arquivos Criados

1. **`src/services/sanityBlog.js`** - Service para buscar posts
   - `fetchRecentPosts(limit)` - Posts recentes
   - `fetchPostBySlug(slug)` - Post específico
   - `fetchAllPosts()` - Todos os posts
   - Cache in-memory (5 min)

2. **`src/components/BlogRecentPosts.jsx`** - Componente React
   - Loading state
   - Error handling
   - Grid responsivo (1/2/3 colunas)
   - Link para post individual

3. **`test-sanity-fetch.html`** - Página de teste standalone
   - Testa API direta sem framework
   - Validação CORS
   - Copiar para produção: `dist/test-sanity-fetch.html`

---

## 🎯 Deploy para Produção

### 1. Build já concluído ✅

```bash
npm run build:vite
# ✅ Build finalizado
```

### 2. Copiar para servidor

```bash
sudo cp -r dist/* /var/www/html/
sudo systemctl restart nginx
```

### 3. Testar em produção

```bash
# Teste da página HTML
curl https://www.saraivavision.com.br/test-sanity-fetch.html

# Ou abrir no browser:
# https://www.saraivavision.com.br/test-sanity-fetch.html
# Clicar em "Buscar Posts Recentes"
```

---

## 📝 Como Usar no Frontend

### Exemplo 1: Posts Recentes na Home

```jsx
import BlogRecentPosts from '@/components/BlogRecentPosts';

export default function HomePage() {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold mb-8">Posts Recentes</h2>
      <BlogRecentPosts limit={3} />
    </section>
  );
}
```

### Exemplo 2: Uso Direto do Service

```jsx
import { useEffect, useState } from 'react';
import { fetchRecentPosts } from '@/services/sanityBlog';

export default function CustomBlog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchRecentPosts(5)
      .then(setPosts)
      .catch(console.error);
  }, []);

  return (
    <div>
      {posts.map(post => (
        <article key={post._id}>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

### Exemplo 3: Página de Post Individual

```jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPostBySlug } from '@/services/sanityBlog';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostBySlug(slug)
      .then(setPost)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Carregando...</div>;
  if (!post) return <div>Post não encontrado</div>;

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.excerpt}</p>
      <div>{post.content}</div>
    </article>
  );
}
```

---

## 🔧 Configuração CORS (Já Feito ✅)

- ✅ CORS configurado no Sanity
- ✅ Domínios permitidos:
  - `https://www.saraivavision.com.br`
  - `https://saraivavision.com.br`
  - `http://localhost:3000`
  - `http://localhost:8080`

---

## ⚡ Performance

### Cache Implementado

- **Client-side cache:** 5 minutos (in-memory)
- **CDN Sanity:** Cache automático
- **Query optimization:** Apenas campos necessários

### Network Waterfall

```
Browser → Sanity CDN (fast) → Response cached 5min
```

**Vantagens:**
- ✅ Latência baixa (CDN global)
- ✅ Sem servidor intermediário
- ✅ Cache duplo (Sanity + client)

---

## 🧪 Testes de Validação

### 1. Teste Backend (curl)

```bash
curl -s "https://92ocrdmp.api.sanity.io/v2024-05-16/data/query/production?query=*%5B_type%3D%3D%22blogPost%22%5D%5B0%5D%7Btitle%7D" | jq .

# ✅ Esperado:
# {
#   "query": "...",
#   "result": {"title": "Título do Post"},
#   "ms": 10
# }
```

### 2. Teste CORS (com Origin header)

```bash
curl -H "Origin: https://www.saraivavision.com.br" \
  "https://92ocrdmp.api.sanity.io/v2024-05-16/data/query/production?query=*%5B0%5D%7Btitle%7D" \
  -I | grep access-control

# ✅ Esperado:
# access-control-allow-origin: https://www.saraivavision.com.br
```

### 3. Teste Browser (HTML)

```
1. Abrir: https://www.saraivavision.com.br/test-sanity-fetch.html
2. Clicar: "Buscar Posts Recentes"
3. ✅ Esperado: Lista de 3 posts sem erro CORS
```

### 4. Teste Console (DevTools)

```javascript
// Abrir console em www.saraivavision.com.br
import { fetchRecentPosts } from '/assets/index-*.js';
fetchRecentPosts(3).then(console.log);

// ✅ Esperado: Array com 3 posts
```

---

## 🔍 Troubleshooting

### Erro: CORS blocked

**Solução:**
1. Verificar se domínio está em Sanity > Settings > API > CORS Origins
2. Aguardar 1-2 min para propagação
3. Hard reload: `Ctrl+Shift+R`

### Erro: 404 Not Found (API Version)

**Solução:**
Verificar se está usando `v2024-05-16` (não `v2025-10-25`)

### Erro: Cache não atualiza

**Solução:**
```javascript
import { clearCache } from '@/services/sanityBlog';
clearCache();
```

---

## 📊 Monitoramento

### DevTools Network

```
Name: data/query/production
Status: 200 OK
Time: ~100-300ms (primeira vez)
Time: ~10ms (cache hit)
Size: ~5-10KB
Headers: access-control-allow-origin ✓
```

### Console Logs

```
[SanityBlog] Fetched 3 posts
[SanityBlog] Using cached data
```

---

## 🎯 Próximos Passos (Opcional)

### 1. Adicionar ao Menu

```jsx
// src/components/Header.jsx
<nav>
  <Link to="/">Home</Link>
  <Link to="/blog">Blog</Link> {/* Nova rota */}
</nav>
```

### 2. Criar Rota Blog

```jsx
// src/routes.jsx
{
  path: '/blog',
  element: <BlogListPage />,
},
{
  path: '/blog/:slug',
  element: <BlogPostPage />,
}
```

### 3. SEO Optimization

```jsx
import { Helmet } from 'react-helmet-async';

<Helmet>
  <title>{post.seo?.title || post.title}</title>
  <meta name="description" content={post.seo?.description || post.excerpt} />
  <meta property="og:image" content={post.mainImage?.asset?.url} />
</Helmet>
```

---

## 📚 Referências

- **Service:** `src/services/sanityBlog.js`
- **Component:** `src/components/BlogRecentPosts.jsx`
- **Teste:** `test-sanity-fetch.html`
- **Docs CORS:** `docs/CORS_SANITY_FIX.md`
- **Sanity API:** https://www.sanity.io/docs/http-query

---

## ✅ Checklist de Deploy

```bash
[✓] CORS configurado no Sanity
[✓] API version corrigida (v2024-05-16)
[✓] Service criado (sanityBlog.js)
[✓] Component criado (BlogRecentPosts.jsx)
[✓] Build concluído (npm run build:vite)
[✓] Teste HTML incluído em dist/
[ ] Copiar dist/ para /var/www/html/
[ ] Restart nginx
[ ] Testar em produção (test-sanity-fetch.html)
[ ] Adicionar componente na home (opcional)
```

---

**Status:** ✅ Pronto para deploy  
**Método:** API Direta Sanity (CORS habilitado)  
**Cache:** 5 min client + CDN Sanity  
**Performance:** ~100ms primeira requisição, ~10ms cache hit

---

**Última atualização:** 2025-10-26  
**Deploy command:** `sudo cp -r dist/* /var/www/html/`
