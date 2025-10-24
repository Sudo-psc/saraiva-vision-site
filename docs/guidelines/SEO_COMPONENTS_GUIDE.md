# Guia de Componentes SEO - Saraiva Vision

**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-24
**Status**: Implementado ✅

## Visão Geral

Este guia define quando usar **SafeHelmet** vs **SEOHead** para meta tags e SEO no projeto Saraiva Vision.

## Componentes Disponíveis

### 1. SafeHelmet (`@/components/SafeHelmet`)

**Propósito**: Componente leve com validação de strings para páginas simples.

**Quando usar**:
- Páginas administrativas
- Páginas de formulário (agendamento, assinatura)
- Páginas de erro ou utilitárias
- Páginas sem necessidade de structured data complexo

**Características**:
- ✅ Validação automática de strings (previne null/undefined)
- ✅ Fallback para valores padrão da clínica
- ✅ Open Graph e Twitter Cards básicos
- ✅ Bundle pequeno (~3KB)
- ❌ Sem i18n integration
- ❌ Sem hreflang automático
- ❌ Sem geo tags médicos

**Exemplo de uso**:
```jsx
import { SafeHelmet } from '@/components/SafeHelmet';

function AgendamentoPage() {
  return (
    <>
      <SafeHelmet
        title="Agendamento Online - Saraiva Vision"
        description="Agende sua consulta online com o Dr. Philipe Saraiva."
        keywords="agendamento, consulta, oftalmologia"
        url="https://saraivavision.com.br/agendamento"
      >
        <link rel="canonical" href="https://saraivavision.com.br/agendamento" />
      </SafeHelmet>

      {/* Conteúdo da página */}
    </>
  );
}
```

**Props**:
```typescript
interface SafeHelmetProps {
  title?: string | null;          // Título da página
  description?: string | null;    // Meta description
  keywords?: string | null;       // Meta keywords
  image?: string | null;          // Open Graph image
  url?: string | null;            // Canonical URL
  type?: string;                  // Open Graph type (default: 'website')
  children?: React.ReactNode;     // Meta tags adicionais
}
```

### 2. SEOHead (`@/components/SEOHead`)

**Propósito**: Componente completo com recursos médicos e internacionalização.

**Quando usar**:
- Páginas médicas (serviços, artigos, FAQs)
- Páginas principais (Home, Sobre, Serviços)
- Páginas com conteúdo multilíngue
- Páginas que precisam de structured data

**Características**:
- ✅ Integração com i18n (português/inglês)
- ✅ Hreflang tags automáticos
- ✅ Geo tags para clínica médica
- ✅ Meta tags de negócio (endereço, telefone)
- ✅ Validação de tamanho (60 chars título, 155 chars descrição)
- ✅ Preload de recursos críticos
- ✅ Schema.org structured data

**Exemplo de uso**:
```jsx
import SEOHead from '@/components/SEOHead';

function ServicesPage() {
  const seoData = {
    title: 'Serviços Oftalmológicos - Saraiva Vision',
    description: 'Consultas, exames e cirurgias oftalmológicas em Caratinga, MG.',
    keywords: 'oftalmologia, catarata, glaucoma, Caratinga',
    image: '/images/servicos-og.jpg',
    canonicalPath: '/servicos',
    structuredData: {
      '@type': 'MedicalBusiness',
      name: 'Saraiva Vision',
      // ... outros dados
    }
  };

  return (
    <>
      <SEOHead {...seoData} />

      {/* Conteúdo da página */}
    </>
  );
}
```

**Props**:
```typescript
interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  keywords?: string;
  ogType?: string;
  noindex?: boolean;
  canonicalPath?: string | null;
  structuredData?: object | null;
}
```

## Matriz de Decisão

| Critério | SafeHelmet | SEOHead |
|----------|-----------|---------|
| Complexidade da página | Simples | Média/Alta |
| Necessita i18n | ❌ | ✅ |
| Conteúdo médico | ❌ | ✅ |
| Structured data | ❌ | ✅ |
| Geo targeting | ❌ | ✅ |
| Bundle size | ~3KB | ~14KB |
| Validação de strings | ✅ | ✅ |
| Performance | Excelente | Boa |

## Páginas do Projeto por Componente

### Usando SafeHelmet ✅
- `/admin` - Área administrativa
- `/agendamento` - Formulário de agendamento
- `/assinatura` - Formulário de assinatura
- `/podcast` - Página de podcast (lista e episódios)
- Páginas de erro (404, 500)

### Usando SEOHead ✅
- `/` - Home page
- `/sobre` - Sobre a clínica
- `/servicos` - Lista de serviços
- `/servicos/:id` - Detalhes de serviço
- `/lentes` - Página de lentes
- `/faq` - Perguntas frequentes
- `/blog` - Blog médico
- `/blog/:slug` - Artigos do blog
- `/planos` - Planos de assinatura
- `/planosflex` - Planos sem fidelidade
- `/planosonline` - Planos online

## Boas Práticas

### 1. Sempre Validar Strings
```jsx
// ✅ BOM - SafeHelmet valida automaticamente
<SafeHelmet title={articleTitle} description={articleDesc} />

// ❌ EVITAR - Helmet direto sem validação
<Helmet>
  <title>{articleTitle}</title> {/* Pode ser null/undefined */}
</Helmet>
```

### 2. Usar Valores Padrão
```jsx
// ✅ BOM
<SafeHelmet
  title={data?.title || "Saraiva Vision"}
  description={data?.description}
/>

// SafeHelmet já tem fallbacks, mas valores padrão explícitos são melhores
```

### 3. Canonical URLs
```jsx
// ✅ BOM - URL absoluta
<SafeHelmet url="https://saraivavision.com.br/servicos" />

// ✅ TAMBÉM BOM - SafeHelmet aceita path relativo
<SafeHelmet url="/servicos" />
```

### 4. Open Graph Images
```jsx
// ✅ BOM - Imagem específica
<SafeHelmet image="/images/servico-og.jpg" />

// ✅ FALLBACK - SafeHelmet usa logo_prata.jpeg por padrão
<SafeHelmet /> // Sem image prop
```

## Migration Guide

Se você está migrando de Helmet direto para SafeHelmet:

```jsx
// ANTES (Helmet direto - EVITAR)
import { Helmet } from 'react-helmet-async';

<Helmet>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />
</Helmet>

// DEPOIS (SafeHelmet - RECOMENDADO)
import { SafeHelmet } from '@/components/SafeHelmet';

<SafeHelmet
  title={title}
  description={description}
  keywords={keywords}
/>
```

## Troubleshooting

### Erro: "Helmet expects a string as a child of <title>"
**Causa**: Valor null/undefined passado para Helmet
**Solução**: Use SafeHelmet que valida automaticamente

```jsx
// ❌ Problema
<Helmet>
  <title>{undefined}</title> // Erro!
</Helmet>

// ✅ Solução
<SafeHelmet title={undefined} /> // Usa fallback automaticamente
```

### Meta tags não aparecem no build
**Causa**: Pre-rendering pode não processar meta tags dinâmicas
**Solução**: Use valores estáticos ou configure prerender-pages.js

### SEO não funciona em subpáginas
**Causa**: React Helmet Async precisa de HelmetProvider no App.jsx
**Solução**: Verificar que App.jsx tem `<HelmetProvider>`

```jsx
// app.jsx
import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      {/* Suas rotas */}
    </HelmetProvider>
  );
}
```

## Testes

### Testando SafeHelmet
```jsx
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { SafeHelmet } from '@/components/SafeHelmet';

test('SafeHelmet renders with defaults', () => {
  render(
    <HelmetProvider>
      <SafeHelmet />
    </HelmetProvider>
  );

  // Verifica que título padrão é usado
  expect(document.title).toContain('Saraiva Vision');
});

test('SafeHelmet handles null values', () => {
  render(
    <HelmetProvider>
      <SafeHelmet title={null} description={null} />
    </HelmetProvider>
  );

  // Não deve gerar erro, usa fallbacks
  expect(document.title).toBeTruthy();
});
```

### Testando SEOHead
```jsx
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { ConfigProvider } from '@/config/ConfigProvider';
import SEOHead from '@/components/SEOHead';

test('SEOHead renders with i18n', () => {
  render(
    <ConfigProvider>
      <HelmetProvider>
        <SEOHead
          title="Test Page"
          description="Test description"
        />
      </HelmetProvider>
    </ConfigProvider>
  );

  expect(document.title).toBe('Test Page');
});
```

## Performance

### Bundle Impact
- **SafeHelmet**: +3KB gzipped
- **SEOHead**: +14KB gzipped

### Recomendação
Use SafeHelmet para páginas simples e SEOHead apenas quando os recursos extras forem necessários.

## Checklist de Implementação

Ao adicionar uma nova página:

- [ ] Decidir: SafeHelmet ou SEOHead?
- [ ] Definir title único e descritivo (max 60 chars)
- [ ] Definir description relevante (max 155 chars)
- [ ] Adicionar keywords específicas (opcional)
- [ ] Configurar canonical URL
- [ ] Adicionar Open Graph image (se relevante)
- [ ] Testar em desenvolvimento
- [ ] Validar no Google Search Console após deploy

## Recursos Adicionais

- [React Helmet Async Docs](https://github.com/staylor/react-helmet-async)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Guide](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org Medical](https://schema.org/MedicalBusiness)

---

**Última atualização**: 2025-10-24
**Mantenedor**: Dr. Philipe Saraiva Cruz
**Revisão**: Anual ou quando houver mudanças significativas
