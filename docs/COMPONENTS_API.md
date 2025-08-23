# Components API Documentation

Documentação completa dos componentes React do projeto Saraiva Vision.

## 📋 Índice

- [Componentes Base (UI)](#componentes-base-ui)
- [Componentes de Layout](#componentes-de-layout)
- [Componentes de Negócio](#componentes-de-negócio)
- [Hooks Customizados](#hooks-customizados)
- [Utilitários](#utilitários)

---

## Componentes Base (UI)

### Button

Componente de botão com múltiplas variantes e tamanhos.

```jsx
import { Button } from '@/components/ui/button'

<Button variant="default" size="md" onClick={handleClick}>
  Click me
</Button>
```

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `variant` | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link' \| 'cta'` | `'default'` | Variante visual do botão |
| `size` | `'default' \| 'sm' \| 'lg' \| 'xl' \| 'icon'` | `'default'` | Tamanho do botão |
| `asChild` | `boolean` | `false` | Renderiza como elemento filho usando Radix Slot |
| `className` | `string` | - | Classes CSS adicionais |
| `disabled` | `boolean` | `false` | Estado desabilitado |
| `children` | `ReactNode` | - | Conteúdo do botão |

#### Variantes

- **default**: Estilo padrão azul
- **destructive**: Estilo para ações destrutivas (vermelho)
- **outline**: Botão com contorno
- **secondary**: Estilo secundário cinza
- **ghost**: Botão transparente
- **link**: Estilo de link
- **cta**: Call-to-action com gradiente

#### Exemplo de Uso

```jsx
// Botão primário
<Button variant="cta" size="lg">
  Agendar Consulta
</Button>

// Botão secundário
<Button variant="outline" size="md">
  Saiba Mais
</Button>

// Botão com ícone
<Button variant="ghost" size="icon">
  <Search size={16} />
</Button>
```

### SafeImage

Componente de imagem com fallback automático e otimizações de performance.

```jsx
import SafeImage from '@/components/ui/SafeImage'

<SafeImage
  src="https://example.com/image.jpg"
  fallbackSrc="https://example.com/fallback.jpg"
  alt="Descrição da imagem"
  width="800"
  height="600"
  loading="lazy"
  className="rounded-lg"
/>
```

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `src` | `string` | - | URL da imagem principal |
| `fallbackSrc` | `string` | - | URL da imagem de fallback |
| `alt` | `string` | - | Texto alternativo |
| `width` | `string \| number` | - | Largura da imagem |
| `height` | `string \| number` | - | Altura da imagem |
| `loading` | `'lazy' \| 'eager'` | `'lazy'` | Estratégia de carregamento |
| `className` | `string` | - | Classes CSS adicionais |
| `placeholder` | `ReactNode` | - | Componente de placeholder durante carregamento |

#### Recursos

- **Fallback automático** em caso de erro
- **Loading states** com placeholder customizável
- **Lazy loading** por padrão
- **Otimização de performance** com memo
- **Acessibilidade** completa

---

## Componentes de Layout

### Navbar

Barra de navegação responsiva com menu mobile e integração i18n.

```jsx
import Navbar from '@/components/Navbar'

<Navbar />
```

#### Recursos

- **Navegação responsiva** desktop/mobile
- **Menu hamburger** para dispositivos móveis
- **Scroll behavior** com transparência dinâmica
- **Integração i18n** com seletor de idiomas
- **Animações suaves** com Framer Motion
- **Acessibilidade completa** com ARIA labels

#### Estrutura

```jsx
// Estrutura interna do componente
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  
  // Lógica de scroll e estados
  // Renderização condicional desktop/mobile
  // Gerenciamento de menu mobile
}
```

### Footer

Rodapé institucional com informações de contato e links importantes.

```jsx
import Footer from '@/components/Footer'

<Footer />
```

#### Recursos

- **Informações institucionais** da clínica
- **Links de navegação** organizados por seção
- **Redes sociais** com ícones interativos
- **Compliance** com LGPD e termos legais
- **Schema markup** para SEO

### Hero

Seção principal de landing com call-to-actions otimizados.

```jsx
import Hero from '@/components/Hero'

<Hero />
```

#### Recursos

- **Design responsivo** com grid adaptativo
- **Animações de entrada** com Framer Motion
- **CTAs otimizados** para conversão
- **Integração WhatsApp** para contato
- **Agendamento online** direto
- **Testimoniais integrados** para social proof

---

## Componentes de Negócio

### GoogleReviewsWidget

Widget de exibição de avaliações do Google com atualização automática.

```jsx
import GoogleReviewsWidget from '@/components/GoogleReviewsWidget'

<GoogleReviewsWidget 
  placeId="ChIJVUKww7WRugARF7u2lAe7BeE"
  maxReviews={5}
  showRating={true}
/>
```

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `placeId` | `string` | - | ID do local no Google |
| `maxReviews` | `number` | `5` | Número máximo de avaliações |
| `showRating` | `boolean` | `true` | Exibir classificação por estrelas |
| `showDate` | `boolean` | `true` | Exibir data das avaliações |
| `className` | `string` | - | Classes CSS adicionais |

#### Recursos

- **Cache inteligente** para performance
- **Loading states** com skeleton
- **Error handling** com retry automático
- **Rate limiting** respeitando APIs do Google
- **Schema markup** para rich snippets

### Contact

Formulário de contato integrado com validação e WhatsApp.

```jsx
import Contact from '@/components/Contact'

<Contact />
```

#### Recursos

- **Validação de formulário** em tempo real
- **Integração WhatsApp** para envio direto
- **Google Maps** embed com localização
- **Estados de loading** e feedback
- **Acessibilidade completa** com labels
- **Sanitização** de inputs

### Services

Seção de apresentação dos serviços oftalmológicos.

```jsx
import Services from '@/components/Services'

<Services />
```

#### Recursos

- **Grid responsivo** de serviços
- **Ícones customizados** para cada especialidade
- **Animações de hover** interativas
- **Links para páginas** de detalhamento
- **Schema markup** para serviços

---

## Hooks Customizados

### useWhatsApp

Hook para integração com WhatsApp Business.

```jsx
import { useWhatsApp } from '@/hooks/useWhatsApp'

const MyComponent = () => {
  const { generateWhatsAppUrl, openFloatingCTA } = useWhatsApp();
  
  const handleContact = () => {
    const url = generateWhatsAppUrl('Olá, gostaria de agendar uma consulta');
    window.open(url, '_blank');
  };
  
  return (
    <button onClick={openFloatingCTA}>
      Falar no WhatsApp
    </button>
  );
}
```

#### API

| Método/Propriedade | Tipo | Descrição |
|-------------------|------|-----------|
| `generateWhatsAppUrl` | `(message?: string) => string` | Gera URL do WhatsApp com mensagem |
| `openFloatingCTA` | `() => void` | Abre CTA flutuante do WhatsApp |

### useSEO

Hook para gerenciamento de SEO dinâmico.

```jsx
import { useSEO } from '@/hooks/useSEO'

const MyPage = () => {
  useSEO({
    title: 'Página Específica - Saraiva Vision',
    description: 'Descrição da página para SEO',
    keywords: ['oftalmologia', 'caratinga', 'consulta'],
    canonicalUrl: 'https://saraivavision.com.br/pagina',
    openGraph: {
      title: 'Título para redes sociais',
      image: 'https://saraivavision.com.br/og-image.jpg'
    }
  });
  
  return <div>Conteúdo da página</div>;
}
```

#### Configurações

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `title` | `string` | Título da página |
| `description` | `string` | Meta description |
| `keywords` | `string[]` | Palavras-chave |
| `canonicalUrl` | `string` | URL canônica |
| `openGraph` | `object` | Configurações Open Graph |
| `structuredData` | `object` | JSON-LD schema |

---

## Utilitários

### clinicInfo

Configuração centralizada com informações da clínica.

```jsx
import { clinicInfo } from '@/lib/clinicInfo'

// Informações disponíveis
const {
  name,           // Nome da clínica
  streetAddress,  // Endereço completo
  phone,          // Telefone formatado
  whatsapp,       // WhatsApp para integração
  email,          // Email principal
  instagram,      // URL do Instagram
  onlineSchedulingUrl // URL do agendamento online
} = clinicInfo;
```

### utils (cn)

Função utilitária para merge de classes CSS com Tailwind.

```jsx
import { cn } from '@/lib/utils'

// Merge inteligente de classes
const className = cn(
  'base-class',
  condition && 'conditional-class',
  variantClass,
  userClassName
);

// Exemplo prático
<div className={cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-200 text-gray-800',
  className
)}>
```

### Schema Markup

Utilitários para geração de dados estruturados JSON-LD.

```jsx
import { generateLocalBusinessSchema } from '@/lib/schemaMarkup'

const schema = generateLocalBusinessSchema({
  name: clinicInfo.name,
  address: clinicInfo.streetAddress,
  phone: clinicInfo.phone,
  url: 'https://saraivavision.com.br'
});
```

---

## Padrões de Desenvolvimento

### Convenções de Nomenclatura

- **Componentes**: PascalCase (`MyComponent`)
- **Hooks**: camelCase com prefixo `use` (`useMyHook`)
- **Utilitários**: camelCase (`myUtility`)
- **Constantes**: UPPER_SNAKE_CASE (`MY_CONSTANT`)

### Estrutura de Componentes

```jsx
import React from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  // Props tipadas quando using TypeScript
  variant?: 'primary' | 'secondary';
  className?: string;
  children: React.ReactNode;
}

const MyComponent = ({ variant = 'primary', className, children }) => {
  return (
    <div className={cn(
      'base-classes',
      variant === 'primary' && 'primary-classes',
      variant === 'secondary' && 'secondary-classes',
      className
    )}>
      {children}
    </div>
  );
};

export default MyComponent;
```

### Performance Best Practices

1. **React.memo** para componentes com props estáveis
2. **useMemo/useCallback** para operações custosas
3. **lazy loading** para componentes pesados
4. **Code splitting** por rotas
5. **Image optimization** com WebP/AVIF

### Acessibilidade

- **ARIA labels** obrigatórios para interações
- **Keyboard navigation** suportada
- **Screen reader** compatibility
- **Color contrast** WCAG AA compliant
- **Focus management** apropriado

---

## Integração com APIs

### Google Places API

```jsx
// Configuração no components/GoogleMap.jsx
const GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;
const PLACE_ID = 'ChIJVUKww7WRugARF7u2lAe7BeE';

// Carregamento dinâmico da API
const loadGoogleMapsAPI = async () => {
  if (window.google) return window.google;
  
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.onload = () => resolve(window.google);
    document.head.appendChild(script);
  });
};
```

### Supabase Integration

```jsx
// Configuração no lib/customSupabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

Esta documentação fornece uma visão completa dos componentes e APIs disponíveis no projeto Saraiva Vision. Para informações mais específicas sobre implementação, consulte o código fonte de cada componente.