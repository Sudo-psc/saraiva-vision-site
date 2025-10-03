# Custom Error Pages - Saraiva Vision

## Visão Geral

Este documento descreve as páginas de erro personalizadas implementadas no Next.js App Router para a Saraiva Vision.

## Arquivos Implementados

### 1. `app/not-found.tsx`
**Propósito:** Página 404 para recursos não encontrados

**Características:**
- Design profissional matching do tema do site (cores primárias azul petróleo)
- Mensagem amigável e clara em português
- Links rápidos para páginas principais (Home, Contato, Blog)
- Lista de serviços populares com links
- Informações de contato (telefone: (33) 3229-1000)
- Metadata SEO com `noindex, nofollow`
- Design totalmente responsivo
- Acessibilidade WCAG 2.1 AA

**Uso:**
```tsx
// Automaticamente renderizado quando página não existe
// Também pode ser invocado manualmente:
import { notFound } from 'next/navigation';

export default async function Page({ params }) {
  const data = await fetchData(params.id);
  if (!data) notFound();
  return <div>{data.title}</div>;
}
```

### 2. `app/error.tsx`
**Propósito:** Boundary de erro global para runtime errors

**Características:**
- Interface de usuário amigável com ícone de alerta
- Botão "Tentar Novamente" (reset)
- Botão "Voltar ao Início"
- Instruções passo-a-passo para usuários
- Logging automático de erros no console
- Mostra detalhes do erro em desenvolvimento
- Informações de contato de suporte
- Preserva navegação do site

**Uso:**
```tsx
// Automaticamente captura erros em componentes client/server
// Erros em componentes são automaticamente tratados
throw new Error('Algo deu errado');
```

### 3. `app/loading.tsx`
**Propósito:** Loading UI durante Suspense boundaries

**Características:**
- Skeleton UI consistente com design system
- Ícone Eye (marca da clínica) animado
- Múltiplas animações (ping, pulse, bounce, shimmer)
- Barra de progresso com gradiente
- Mensagem de carregamento em português
- Design minimalista e clean

**Uso:**
```tsx
// Automaticamente mostrado durante loading de async components
// Também para streaming SSR do Next.js
export default async function Page() {
  const data = await fetchData(); // Loading.tsx shown
  return <div>{data}</div>;
}
```

### 4. `app/global-error.tsx`
**Propósito:** Captura erros no root layout (mais críticos)

**Características:**
- Último recurso para erros críticos
- HTML completo (precisa incluir `<html>` e `<body>`)
- Botões de reset e reload
- Informações de suporte com código de erro
- Funciona mesmo quando root layout falha
- Logging de erros críticos

**Uso:**
```tsx
// Automaticamente ativo para erros no root layout
// Raramente necessário invocar manualmente
```

### 5. `lib/error-utils.ts`
**Propósito:** Utilitários e classes de erro customizadas

**Classes de Erro:**
- `AppError` - Erro base da aplicação
- `NotFoundError` - Recursos não encontrados (404)
- `ValidationError` - Erros de validação (400)
- `UnauthorizedError` - Não autorizado (401)
- `ForbiddenError` - Acesso proibido (403)

**Funções Utilitárias:**
- `getErrorMessage(error)` - Extrai mensagem de qualquer erro
- `getErrorCode(error)` - Extrai código do erro
- `isClientError(statusCode)` - Verifica se é erro 4xx
- `isServerError(statusCode)` - Verifica se é erro 5xx
- `logError(error, context)` - Log estruturado de erros
- `handleApiError(error)` - Processa erros de API

**Exemplo de Uso:**
```typescript
import { NotFoundError, ValidationError, logError } from '@/lib/error-utils';

// Lançar erros tipados
if (!post) {
  throw new NotFoundError('Post', { id: params.id });
}

if (!email.includes('@')) {
  throw new ValidationError('Email inválido', { email });
}

// Logging de erros
try {
  await processData();
} catch (error) {
  logError(error, { userId, action: 'processData' });
  throw error;
}

// Em API Routes
export async function GET(request: Request) {
  try {
    const data = await fetchData();
    return Response.json(data);
  } catch (error) {
    const { message, statusCode, code } = handleApiError(error);
    return Response.json(
      { error: message, code },
      { status: statusCode }
    );
  }
}
```

## Design System

### Cores Utilizadas
- **Primary:** `primary-600` (Azul Petróleo) - #1E4D4C
- **Backgrounds:** `bg-primary`, `bg-secondary` (Off-white com tom petróleo)
- **Text:** `text-primary`, `text-secondary`, `text-muted`
- **Borders:** `border-light`, `border-medium`
- **Error:** `error-DEFAULT` (#EF4444), `error-light`, `error-dark`
- **Success:** `success-DEFAULT` (#10B981)

### Componentes Reutilizáveis
- Gradientes: `bg-gradient-to-br from-bg-primary via-white to-bg-secondary`
- Cards: `bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass-lg`
- Botões primários: `bg-primary-600 hover:bg-primary-700`
- Botões secundários: `bg-white hover:bg-primary-50 border border-primary-200`

### Animações
- **Pulse:** `animate-pulse` - Breathing effect
- **Bounce:** `animate-bounce` - Loading dots
- **Ping:** `animate-ping` - Expanding circles
- **Shimmer:** `animate-shimmer` - Progress bar sweep

## Acessibilidade (A11y)

### Conformidade WCAG 2.1 AA
- ✅ Contraste de cores adequado (mínimo 4.5:1)
- ✅ Navegação por teclado completa
- ✅ Textos alternativos em ícones
- ✅ Foco visível em elementos interativos
- ✅ Estrutura semântica HTML5
- ✅ Tamanhos de fonte legíveis
- ✅ Áreas de toque adequadas (min 44x44px)

### Features de Acessibilidade
- Ícones com labels descritivos
- Links com indicação clara de destino
- Mensagens de erro claras e acionáveis
- Suporte a screen readers
- Responsivo para diferentes tamanhos de viewport

## Conformidade Médica (CFM/LGPD)

### Disclaimer
Todas as páginas incluem:
- Nome completo da clínica: "Saraiva Vision - Clínica Oftalmológica"
- Localização: "Caratinga, MG"
- Telefone de contato: "(33) 3229-1000"
- Informações de atendimento especializado

### Privacidade
- Não coleta dados do usuário nas páginas de erro
- Não utiliza analytics em páginas de erro
- Erros são logados apenas no console (não enviados para terceiros)

## Internacionalização (i18n)

### Idioma
- **Padrão:** Português Brasileiro (pt-BR)
- Todas as mensagens em português
- Formatação de data/hora localizada
- Números e moeda no formato brasileiro

### Suporte Futuro
A estrutura permite fácil extensão para outros idiomas:
```typescript
// Exemplo de estrutura futura
const messages = {
  'pt-BR': { notFound: 'Página Não Encontrada' },
  'en-US': { notFound: 'Page Not Found' }
};
```

## Testing

### Testes Recomendados

**1. Teste de Renderização (Vitest + React Testing Library)**
```typescript
import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';

describe('NotFound Page', () => {
  it('renders 404 heading', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });
  
  it('displays contact phone', () => {
    render(<NotFound />);
    expect(screen.getByText('(33) 3229-1000')).toBeInTheDocument();
  });
});
```

**2. Teste de Navegação**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Error from '@/app/error';

describe('Error Page', () => {
  it('calls reset on button click', () => {
    const mockReset = vi.fn();
    render(<Error error={new Error('Test')} reset={mockReset} />);
    
    fireEvent.click(screen.getByText('Tentar Novamente'));
    expect(mockReset).toHaveBeenCalled();
  });
});
```

**3. Teste de Error Utils**
```typescript
import { NotFoundError, getErrorMessage, logError } from '@/lib/error-utils';

describe('Error Utils', () => {
  it('creates NotFoundError with correct status', () => {
    const error = new NotFoundError('Post');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });
  
  it('extracts error message correctly', () => {
    expect(getErrorMessage(new Error('Test'))).toBe('Test');
    expect(getErrorMessage('String error')).toBe('String error');
    expect(getErrorMessage(null)).toBe('Erro desconhecido');
  });
});
```

## Performance

### Otimizações
- Componentes estáticos (sem JavaScript desnecessário)
- Ícones tree-shaken do Lucide React
- CSS Tailwind purged (apenas classes usadas)
- Sem dependências externas pesadas
- Loading progressivo com Suspense

### Métricas Esperadas
- **FCP (First Contentful Paint):** < 1s
- **LCP (Largest Contentful Paint):** < 2.5s
- **CLS (Cumulative Layout Shift):** < 0.1
- **Bundle Size:** ~5KB (gzipped)

## Deployment

### Checklist
- [x] Páginas de erro criadas
- [x] Metadata SEO configurada
- [x] Responsividade testada
- [x] Acessibilidade verificada
- [x] Links funcionais
- [x] Informações de contato corretas
- [ ] Testes unitários implementados
- [ ] Testes E2E com Playwright
- [ ] Review de código

### Ambiente de Produção
```bash
# Build
npm run build

# Verificar páginas de erro
npm run build:norender

# Deploy
vercel --prod
```

## Manutenção

### Atualizações Futuras
1. **Analytics de Erro**
   - Adicionar tracking de páginas 404
   - Monitorar erros mais comuns
   - Dashboard de métricas de erro

2. **Melhorias UX**
   - Busca integrada na página 404
   - Sugestões de páginas similares
   - Posts de blog recentes na 404

3. **A/B Testing**
   - Testar diferentes mensagens
   - Otimizar taxa de conversão
   - Reduzir bounce rate

### Contato para Suporte
- **Desenvolvedor:** [Equipe Saraiva Vision]
- **Documentação:** `/docs/ERROR_PAGES.md`
- **Issues:** GitHub Issues

## Recursos Adicionais

### Referências Next.js
- [Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Not Found](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
- [Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

### Documentação Relacionada
- `AGENTS.md` - Build/Lint/Test commands
- `CLAUDE.md` - Project context
- `SECURITY.md` - Security guidelines
- `ACCESSIBILITY_GUIDE.md` - A11y standards

---

**Última Atualização:** Outubro 2025  
**Versão:** 1.0.0  
**Status:** ✅ Implementado e Documentado
