# Frontend Integration Guide - Sanity CMS

Este guia documenta como integrar o Sanity CMS no frontend da Saraiva Vision para consumir os posts do blog.

## 📋 Visão Geral

**Status**: ✅ **Sanity CMS Configurado e Pronto para Integração**

- **25/25 posts** migrados com sucesso
- **25/25 imagens** enviadas para Sanity
- **25/25 posts** com conteúdo estruturado (Block Content)
- **4 categorias** criadas automaticamente
- **1 autor** configurado (Dr. Philipe Saraiva Cruz)

## 🔧 Configuração Inicial

### 1. Instalar Dependências

```bash
cd /home/saraiva-vision-site
npm install --save @sanity/client @sanity/image-url
```

### 2. Criar Cliente Sanity

Crie `src/lib/sanityClient.js`:

```javascript
import {createClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: '92ocrdmp',
  dataset: 'production',
  apiVersion: '2025-10-25',
  useCdn: true, // `false` se precisar de dados em tempo real
})

// Helper para construir URLs de imagens
const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}
```

## 📝 Queries GROQ - Exemplos Práticos

### Listar Todos os Posts

```javascript
const query = `*[_type == "blogPost"] | order(publishedAt desc) {
  _id,
  id,
  title,
  slug,
  excerpt,
  "author": author->name,
  "category": category->title,
  publishedAt,
  coverImage,
  tags
}`

const posts = await client.fetch(query)
```

### Buscar Post Por Slug

```javascript
const query = `*[_type == "blogPost" && slug.current == $slug][0] {
  _id,
  id,
  title,
  slug,
  excerpt,
  content,
  "author": author->{
    name,
    credentials,
    image
  },
  "category": category->{
    title,
    slug
  },
  coverImage,
  tags,
  publishedAt,
  seo
}`

const post = await client.fetch(query, { slug: 'seu-slug-aqui' })
```

### Buscar Posts por Categoria

```javascript
const query = `*[_type == "blogPost" && category->title == $category] | order(publishedAt desc) {
  _id,
  id,
  title,
  slug,
  excerpt,
  "category": category->title,
  coverImage,
  publishedAt
}`

const posts = await client.fetch(query, { category: 'Tratamento' })
```

### Buscar Posts Relacionados

```javascript
const query = `*[_type == "blogPost" && _id != $currentId && category._ref == $categoryRef][0...3] {
  _id,
  title,
  slug,
  excerpt,
  coverImage
}`

const relatedPosts = await client.fetch(query, {
  currentId: postId,
  categoryRef: categoryId
})
```

## 🖼️ Renderizar Imagens

### Imagem de Capa Otimizada

```javascript
import {urlFor} from '@/lib/sanityClient'

function BlogPostCard({post}) {
  const imageUrl = post.coverImage
    ? urlFor(post.coverImage)
        .width(800)
        .height(450)
        .format('webp')
        .quality(85)
        .url()
    : '/Blog/placeholder.webp'

  return (
    <img
      src={imageUrl}
      alt={post.title}
      loading="lazy"
      width={800}
      height={450}
    />
  )
}
```

### Responsive Images com srcSet

```javascript
function ResponsiveImage({image, alt}) {
  const imageSizes = [480, 768, 1024, 1200]

  const srcSet = imageSizes
    .map(width =>
      `${urlFor(image).width(width).format('webp').url()} ${width}w`
    )
    .join(', ')

  return (
    <img
      srcSet={srcSet}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
      src={urlFor(image).width(800).format('webp').url()}
      alt={alt}
      loading="lazy"
    />
  )
}
```

## 📄 Renderizar Block Content (Portable Text)

### Instalar Dependência

```bash
npm install --save @portabletext/react
```

### Componente de Renderização

Crie `src/components/PortableTextRenderer.jsx`:

```javascript
import {PortableText} from '@portabletext/react'

const components = {
  block: {
    h1: ({children}) => <h1 className="text-4xl font-bold my-6">{children}</h1>,
    h2: ({children}) => <h2 className="text-3xl font-bold my-5">{children}</h2>,
    h3: ({children}) => <h3 className="text-2xl font-semibold my-4">{children}</h3>,
    h4: ({children}) => <h4 className="text-xl font-semibold my-3">{children}</h4>,
    normal: ({children}) => <p className="my-4 leading-relaxed">{children}</p>,
    blockquote: ({children}) => (
      <blockquote className="border-l-4 border-primary pl-4 my-4 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({children}) => <ul className="list-disc ml-6 my-4">{children}</ul>,
    number: ({children}) => <ol className="list-decimal ml-6 my-4">{children}</ol>,
  },
  listItem: {
    bullet: ({children}) => <li className="my-2">{children}</li>,
    number: ({children}) => <li className="my-2">{children}</li>,
  },
  marks: {
    strong: ({children}) => <strong className="font-bold">{children}</strong>,
    em: ({children}) => <em className="italic">{children}</em>,
    link: ({value, children}) => (
      <a
        href={value.href}
        target={value.href.startsWith('http') ? '_blank' : undefined}
        rel={value.href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="text-primary underline hover:text-primary-dark"
      >
        {children}
      </a>
    ),
  },
}

export default function PortableTextRenderer({content}) {
  return <PortableText value={content} components={components} />
}
```

### Usar no Post

```javascript
import PortableTextRenderer from '@/components/PortableTextRenderer'

function BlogPost({post}) {
  return (
    <article>
      <h1>{post.title}</h1>
      <PortableTextRenderer content={post.content} />
    </article>
  )
}
```

## 🎨 Componentes de Exemplo

### Card de Post

```javascript
import {urlFor} from '@/lib/sanityClient'
import {Link} from 'react-router-dom'

function BlogCard({post}) {
  return (
    <Link
      to={`/blog/${post.slug.current}`}
      className="block rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition"
    >
      {post.coverImage && (
        <img
          src={urlFor(post.coverImage).width(600).height(337).format('webp').url()}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <span className="text-sm text-primary font-semibold">{post.category}</span>
        <h3 className="text-xl font-bold mt-2">{post.title}</h3>
        <p className="text-gray-600 mt-2 line-clamp-3">{post.excerpt}</p>
        <p className="text-sm text-gray-500 mt-4">
          {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
        </p>
      </div>
    </Link>
  )
}
```

### Lista de Posts

```javascript
import {useState, useEffect} from 'react'
import {client} from '@/lib/sanityClient'
import BlogCard from './BlogCard'

function BlogList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const query = `*[_type == "blogPost"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      "category": category->title,
      coverImage,
      publishedAt
    }`

    client.fetch(query)
      .then(data => {
        setPosts(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  if (loading) return <div>Carregando...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <BlogCard key={post._id} post={post} />
      ))}
    </div>
  )
}
```

## 🔍 SEO Integration

### Metadados do Post

```javascript
import {Helmet} from 'react-helmet-async'
import {urlFor} from '@/lib/sanityClient'

function BlogPostSEO({post}) {
  const imageUrl = post.coverImage
    ? urlFor(post.coverImage).width(1200).height(630).url()
    : null

  return (
    <Helmet>
      <title>{post.seo?.metaTitle || post.title} | Saraiva Vision</title>
      <meta
        name="description"
        content={post.seo?.metaDescription || post.excerpt}
      />
      <meta name="keywords" content={post.seo?.keywords?.join(', ')} />

      {/* Open Graph */}
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      <meta property="og:type" content="article" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.excerpt} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
    </Helmet>
  )
}
```

## 🚀 Performance & Caching

### Cache com React Query

```bash
npm install --save @tanstack/react-query
```

```javascript
import {useQuery} from '@tanstack/react-query'
import {client} from '@/lib/sanityClient'

function useBlogPosts() {
  return useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => client.fetch(`*[_type == "blogPost"] | order(publishedAt desc)`),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  })
}

function BlogList() {
  const {data: posts, isLoading, error} = useBlogPosts()

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro ao carregar posts</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.map(post => (
        <BlogCard key={post._id} post={post} />
      ))}
    </div>
  )
}
```

## 🔄 Revalidação em Tempo Real (Opcional)

### Listener para Mudanças

```javascript
import {useEffect, useState} from 'react'
import {client} from '@/lib/sanityClient'

function useRealTimePosts() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const query = `*[_type == "blogPost"] | order(publishedAt desc)`

    // Buscar dados iniciais
    client.fetch(query).then(setPosts)

    // Listener para mudanças em tempo real
    const subscription = client
      .listen(query)
      .subscribe(update => {
        setPosts(currentPosts => {
          // Atualizar posts com mudanças
          return currentPosts.map(post =>
            post._id === update.documentId ? update.result : post
          )
        })
      })

    return () => subscription.unsubscribe()
  }, [])

  return posts
}
```

## 📊 Estatísticas e Analytics

### Contagem de Posts por Categoria

```javascript
const query = `{
  "categories": *[_type == "category"] {
    title,
    "count": count(*[_type == "blogPost" && references(^._id)])
  }
}`

const stats = await client.fetch(query)
```

## 🔗 Links Úteis

- **Sanity Studio (Local)**: http://localhost:3333
- **Sanity Management**: https://sanity.io/manage/project/92ocrdmp
- **GROQ Cheat Sheet**: https://www.sanity.io/docs/query-cheat-sheet
- **Portable Text Docs**: https://www.portabletext.org/
- **Image URL Builder**: https://www.sanity.io/docs/image-url

## ⚡ Próximos Passos

1. ✅ **Substituir** `src/data/blogPosts.js` por queries Sanity
2. ✅ **Atualizar** componentes de blog para consumir Sanity
3. ✅ **Adicionar** cache com React Query
4. ✅ **Configurar** variáveis de ambiente no Vercel/produção
5. ✅ **Testar** integração completa localmente
6. ✅ **Deploy** e validar em produção

## 🛠️ Troubleshooting

### Erro: CORS Blocked

Adicione domínio no Sanity Management:
https://sanity.io/manage/project/92ocrdmp/settings/api

### Imagens Não Carregam

Verifique se o domínio está permitido em:
https://sanity.io/manage/project/92ocrdmp/settings/assets

### Query Retorna Vazio

Use Vision tool para testar queries:
http://localhost:3333/vision

---

**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-25
**Versão**: 1.0.0
