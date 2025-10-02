# Configuração de Imagem Open Graph

## Visão Geral
Este documento descreve a configuração das meta tags Open Graph para preview de links em redes sociais.

## Imagem Configurada
- **Arquivo**: `og-image-1200x630-optimized.jpg`
- **Dimensões**: 1200x630px (padrão Open Graph)
- **Tamanho**: 73KB
- **URL**: https://saraivavision.com.br/og-image-1200x630-optimized.jpg

## Arquivos de Configuração

### 1. index.html (Template Raiz)
```html
<meta property="og:image" content="https://saraivavision.com.br/og-image-1200x630-optimized.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/jpeg" />
<meta name="twitter:image" content="https://saraivavision.com.br/og-image-1200x630-optimized.jpg" />
```

### 2. src/components/SEOHead.jsx
O componente `SEOHead` gera automaticamente as meta tags Open Graph:
- **Linha 56**: `getOptimizedOgImage()` - Função que retorna a imagem OG
- **Linha 148-152**: Meta tags og:image com dimensões e tipo
- **Linha 168**: Meta tag twitter:image

### 3. src/hooks/useSEO.js
O hook `useHomeSEO` especifica a imagem para a home page:
- **Linha 206**: `image: ${baseUrl}/og-image-1200x630-optimized.jpg`

## Como Funciona

1. O arquivo `index.html` serve como template inicial e contém meta tags estáticas
2. Quando o React carrega, o componente `SEOHead` (via React Helmet) injeta meta tags dinâmicas
3. O `useHomeSEO` hook fornece dados de SEO específicos para a home page, incluindo a imagem OG

## Plataformas Suportadas
- ✅ WhatsApp
- ✅ Facebook
- ✅ Instagram
- ✅ Twitter/X
- ✅ LinkedIn
- ✅ Telegram
- ✅ Google Business

## Validação e Testes

### Testar Preview
1. **Open Graph Debugger**: https://www.opengraph.xyz/
2. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
3. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
4. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

### Limpar Cache
Se a imagem não aparecer após atualização:
- **Facebook**: Use o Facebook Sharing Debugger e clique em "Scrape Again"
- **LinkedIn**: Use o Post Inspector e clique em "Inspect"
- **Twitter**: A cache expira automaticamente após 7 dias

## Manutenção

### Atualizar Imagem OG
1. Substitua o arquivo `/public/og-image-1200x630-optimized.jpg`
2. Mantenha as dimensões 1200x630px
3. Otimize para < 100KB
4. Execute `npm run build`
5. Limpe cache das plataformas sociais

### Verificar Configuração
```bash
# Build do projeto
npm run build

# Verificar meta tags no HTML gerado
grep "og:image" dist/index.html

# Verificar arquivo de imagem
ls -lh public/og-image-1200x630-optimized.jpg
```

## Referências
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/webmasters/)

---

**Última atualização**: 02/10/2025
**Responsável**: Equipe de Desenvolvimento Saraiva Vision
