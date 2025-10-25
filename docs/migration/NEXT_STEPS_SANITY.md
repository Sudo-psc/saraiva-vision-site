# Próximos Passos - Migração Sanity CMS

**Data**: 2025-10-25
**Autor**: Dr. Philipe Saraiva Cruz

## 🎯 Etapas Pendentes

### 1. Autenticação no Sanity ⏳ URGENTE

**O que fazer**:
```bash
cd /home/saraiva-vision-site/sanity
npx sanity login
```

**Detalhes**:
- Escolher método de autenticação (Google, GitHub ou E-mail)
- Aguardar abertura do navegador
- Fazer login na conta do Sanity
- Aguardar confirmação no terminal

**Resultado esperado**:
```
✔ Login successful
```

### 2. Criar Token de API ⏳ URGENTE

**O que fazer**:
1. Acessar: https://sanity.io/manage/project/92ocrdmp/api
2. Clicar em "Add API token"
3. Nome: `Migration Script`
4. Permissões: **Editor** (ou Admin)
5. Copiar o token gerado

**Configurar token**:
```bash
# Criar arquivo .env no diretório sanity
cd /home/saraiva-vision-site/sanity
echo "SANITY_TOKEN=seu-token-copiado-aqui" > .env
```

**⚠️ IMPORTANTE**: Nunca commitar o `.env` com o token!

### 3. Instalar Dependências 📦

```bash
cd /home/saraiva-vision-site/sanity
npm install
```

**Pacotes que serão instalados**:
- `sanity@^4.11.0` - Sanity Studio
- `@sanity/client@^6.24.3` - Cliente para API
- `@sanity/cli@^4.11.0` - CLI tools
- `dotenv@^16.4.5` - Gerenciamento de env vars

### 4. Executar Migração de Dados 🚀

```bash
cd /home/saraiva-vision-site/sanity
npm run export
```

**O que o script faz**:
1. ✅ Lê 27 posts de `/src/data/blogPosts.js`
2. ✅ Cria categorias automaticamente (~10)
3. ✅ Cria autor automaticamente (Dr. Philipe Saraiva Cruz)
4. ✅ Cria cada post com todos os metadados
5. ✅ Evita duplicatas (verifica por ID)
6. ✅ Mostra progresso detalhado

**Saída esperada**:
```
🚀 Iniciando exportação de posts para Sanity CMS

📝 Iniciando exportação de 27 posts...

[1/27] Exportando: Monovisão ou Lentes Multifocais...
  ✅ Categoria criada: Dúvidas Frequentes
  ✅ Autor criado: Dr. Philipe Saraiva Cruz
  ✅ Post criado com sucesso

...

📊 Resultado da Exportação:
   Total de posts: 27
   ✅ Criados: 27
   ⚠️  Pulados: 0
   ❌ Erros: 0

🎉 Exportação concluída com sucesso!
```

### 5. Iniciar Sanity Studio 🎨

```bash
cd /home/saraiva-vision-site/sanity
npm run dev
```

**Resultado**:
- Studio disponível em: http://localhost:3333
- Console de queries em: http://localhost:3333/vision

**O que fazer no Studio**:
1. Explorar posts criados
2. Editar algum post de teste
3. Familiarizar-se com a interface
4. Verificar categorias e autores

### 6. Upload de Imagens 📸

**Opção 1: Upload Manual**

Para cada post no Studio:
1. Abrir post
2. Clicar em "Main Image"
3. Fazer upload da imagem de `/public/Blog/`
4. Adicionar Alt Text
5. Salvar

**Opção 2: Script Automatizado** (Recomendado para >10 imagens)

Criar script separado:
```bash
# TODO: Criar script de upload de imagens
cd /home/saraiva-vision-site/sanity/scripts
touch upload-images.js
```

### 7. Deploy do Sanity Studio 🌐

**Quando fazer**: Após validar que tudo está funcionando localmente

```bash
cd /home/saraiva-vision-site/sanity
npm run deploy
```

**Resultado**:
- Studio hospedado em: `https://92ocrdmp.sanity.studio`
- Acessível de qualquer lugar
- HTTPS automático

### 8. Integração com Frontend ⚛️

**Instalar dependências no projeto principal**:
```bash
cd /home/saraiva-vision-site
npm install @sanity/client groq
```

**Criar serviço Sanity**:
```javascript
// src/services/sanityClient.js
import {createClient} from '@sanity/client'

export const sanityClient = createClient({
  projectId: '92ocrdmp',
  dataset: 'production',
  apiVersion: '2025-10-25',
  useCdn: true, // true para produção
})
```

**Exemplo de query**:
```javascript
// src/services/blogService.js
import {sanityClient} from './sanityClient'

export async function getAllPosts() {
  const query = `*[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    id,
    title,
    slug,
    excerpt,
    "author": author->name,
    "category": category->title,
    tags,
    publishedAt,
    "imageUrl": mainImage.asset->url
  }`

  return await sanityClient.fetch(query)
}

export async function getPostBySlug(slug) {
  const query = `*[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    id,
    title,
    slug,
    excerpt,
    content,
    "author": author->{name, bio, "imageUrl": image.asset->url},
    "category": category->{title, slug},
    tags,
    publishedAt,
    "imageUrl": mainImage.asset->url,
    seo,
    "relatedPosts": relatedPosts[]->{
      _id,
      title,
      slug,
      excerpt,
      "imageUrl": mainImage.asset->url
    }
  }`

  return await sanityClient.fetch(query, {slug})
}
```

### 9. Configurar Webhooks 🔔

**Para que servem**: Atualizar site automaticamente quando houver mudanças no CMS

**Como configurar**:

1. Criar endpoint no backend:
```javascript
// api/src/routes/sanity.js
router.post('/webhook/content-update', async (req, res) => {
  // Validar webhook secret
  const secret = req.headers['sanity-webhook-signature']

  // Revalidar cache ou rebuild
  // ... lógica de revalidação

  res.json({ success: true })
})
```

2. Configurar no Sanity:
   - Acessar: https://sanity.io/manage/project/92ocrdmp/api/webhooks
   - Criar webhook
   - URL: `https://saraivavision.com.br/api/webhook/content-update`
   - Método: POST
   - Eventos: create, update, delete
   - Filtro GROQ: `_type == "blogPost"`

### 10. Testes e Validação ✅

**Checklist de testes**:

- [ ] Todos os 27 posts aparecem no Studio
- [ ] É possível editar e salvar mudanças
- [ ] Imagens estão carregando
- [ ] Categories e Authors corretos
- [ ] Tags preservadas
- [ ] Datas corretas
- [ ] SEO metadata presente
- [ ] Frontend consome API corretamente
- [ ] Webhooks funcionando
- [ ] Performance aceitável

## 📋 Checklist Rápido

### Hoje (Essencial)
- [ ] `npx sanity login`
- [ ] Criar token de API
- [ ] `npm install` no diretório sanity
- [ ] Configurar `.env` com token
- [ ] `npm run export` para migrar dados

### Esta Semana
- [ ] Upload de imagens
- [ ] `npm run dev` e explorar Studio
- [ ] `npm run deploy` do Studio
- [ ] Integrar frontend com API

### Próximas 2 Semanas
- [ ] Configurar webhooks
- [ ] Testar fluxo completo
- [ ] Converter HTML → Block Content
- [ ] Documentar processo editorial

## 🆘 Precisa de Ajuda?

### Recursos
- [README do Sanity](/sanity/README.md)
- [Documentação da Migração](/docs/migration/SANITY_MIGRATION.md)
- [Documentação Oficial](https://www.sanity.io/docs)

### Comandos Úteis

```bash
# Ver estrutura de posts no Sanity
npx sanity documents query '*[_type == "blogPost"]'

# Deletar todos os posts (CUIDADO!)
npx sanity dataset delete production --force

# Listar datasets
npx sanity dataset list

# Verificar configuração
npx sanity debug
```

### Troubleshooting Comum

**Erro: Module not found**
```bash
cd sanity
npm install
```

**Erro: Authentication failed**
```bash
npx sanity login
```

**Erro: Token invalid**
```bash
# Verificar .env
cat .env

# Recriar token em https://sanity.io/manage
```

## 🎓 Aprendizado Recomendado

Após migração básica, explorar:

1. **GROQ Query Language**
   - Linguagem de query do Sanity
   - Similar a GraphQL mas mais simples
   - [Tutorial](https://www.sanity.io/docs/how-queries-work)

2. **Block Content**
   - Sistema de conteúdo rico
   - Serialização para HTML/React
   - Customização de tipos

3. **Plugins do Sanity**
   - Media library
   - Internationalization
   - SEO pane
   - Preview

## 💡 Dicas Importantes

1. **Backup**: Sempre manter backup do sistema atual até validar 100%
2. **Gradual**: Fazer migração gradual, não tudo de uma vez
3. **Testing**: Testar extensivamente antes de deploy
4. **Documentation**: Documentar decisões e customizações
5. **Training**: Treinar equipe antes de usar em produção

---

**Boa sorte com a migração! 🚀**

Se tiver dúvidas, consulte a [documentação completa](/docs/migration/SANITY_MIGRATION.md).
