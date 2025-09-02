# /performance - Análise e Otimização de Performance

## Propósito
Análise abrangente de performance com otimizações automáticas e relatórios detalhados.

## Uso
```
/performance [análise] [--optimize] [--lighthouse] [--bundle-analyzer]
```

## Argumentos
- `análise` - Tipo de análise (bundle, runtime, core-vitals, accessibility)
- `--optimize` - Aplicar otimizações automáticas
- `--lighthouse` - Executar auditoria Lighthouse
- `--bundle-analyzer` - Análise detalhada do bundle

## Análises Disponíveis
- **Bundle**: Análise de tamanho e chunks
- **Runtime**: Performance em tempo de execução
- **Core Vitals**: LCP, FID, CLS, INP
- **Accessibility**: Compliance WCAG e navegação

## Otimizações Automáticas
- Code splitting inteligente
- Lazy loading de componentes
- Otimização de imagens
- Minificação e compressão
- Tree shaking avançado
- Cache strategies

## Execução
1. Executar build de produção
2. Analisar bundle e dependencies
3. Medir Core Web Vitals
4. Identificar bottlenecks
5. Aplicar otimizações (se habilitado)
6. Gerar relatório comparativo
7. Sugerir melhorias adicionais

## Métricas Monitoradas
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)
- Time to Interactive (TTI)
- Bundle size por chunk