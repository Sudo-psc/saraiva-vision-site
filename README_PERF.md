# Performance & Quality Verification

Este documento descreve o sistema de verificação de performance e qualidade implementado no projeto Saraiva Vision.

## Scripts Disponíveis

### `npm run verify`
Executa o conjunto completo de verificações:
1. **Build**: Constrói o projeto para produção
2. **Link Check**: Valida todos os links internos e externos
3. **HTML Validation**: Valida a marcação HTML gerada
4. **Lighthouse Audit**: Executa auditoria de performance, acessibilidade, SEO e boas práticas

### Scripts Individuais

- `npm run verify:links` - Apenas validação de links
- `npm run verify:html` - Apenas validação HTML
- `npm run verify:lighthouse` - Apenas auditoria Lighthouse

## Budgets de Performance

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: ≤ 2.5s
- **CLS (Cumulative Layout Shift)**: ≤ 0.1
- **FID/INP**: ≤ 100ms

### Tamanhos de Assets
- **Bundle JavaScript total**: ≤ 1.6MB
- **JavaScript por rota**: ≤ 180kB
- **Imagem hero**: ≤ 120kB
- **Fontes**: ≤ 100kB

### Scores Lighthouse
- **Performance**: ≥ 80
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 90
- **SEO**: ≥ 90

## Configuração

### linkinator.config.json
Configuração para verificação de links:
- Ignora links externos para serviços Google (fonts, analytics)
- Timeout de 5s por link
- 2 tentativas por link falho
- Concorrência de 100 links simultâneos

### lighthouserc.json
Configuração Lighthouse CI:
- Execução mobile-first
- Coleta dados do servidor local na porta 3000
- Audita performance, acessibilidade, SEO e boas práticas
- Assertions configuradas para budgets definidos

### .htmlvalidate.json
Configuração HTML Validate:
- Extends recomendações HTML5
- Permite inline styles (necessário para CSS crítico)
- Desabilita SRI check (não aplicável ao projeto)

## CI/CD Integration

### GitHub Actions
O workflow `.github/workflows/performance-check.yml` executa automaticamente em:
- Pull Requests para `main` e `develop`
- Execução manual via `workflow_dispatch`

### Funcionalidades do CI:
1. **Build e teste**: Instala dependências e executa verificações
2. **Artifacts**: Salva relatórios Lighthouse para análise
3. **PR Comments**: Comenta resultados diretamente no Pull Request
4. **Timeout**: 15 minutos máximo de execução

## Como Usar

### Desenvolvimento Local
```bash
# Execução completa
npm run verify

# Verificações individuais
npm run verify:links
npm run verify:html
npm run verify:lighthouse
```

### Interpretando Resultados

#### Exit Codes
- `0`: Todas as verificações passaram
- `1`: Uma ou mais verificações falharam

#### Logs
- **Links**: Mostra URLs quebrados ou com timeout
- **HTML**: Lista erros de marcação HTML
- **Lighthouse**: Exibe scores e métricas que falharam nos budgets

## Troubleshooting

### Erros Comuns

1. **Links externos quebrados**: Adicionar ao array `skip` no `linkinator.config.json`
2. **HTML validation falsos positivos**: Ajustar regras no `.htmlvalidate.json`
3. **Lighthouse timeout**: Aumentar timeout no `lighthouserc.json`
4. **Performance budget**: Analisar bundle analyzer para otimizações

### Debugging

```bash
# Lighthouse com interface visual
npx lhci autorun --config lighthouserc.json --view

# HTML validation verbose
npx html-validate dist/**/*.html --verbose

# Link check detalhado
npx linkinator dist --verbose
```

## Roadmap

### Próximas Implementações
1. **Bundle analyzer**: Visualização de chunks e dependências
2. **Image optimization check**: Verificação de tamanhos e formatos
3. **A11y testing**: Testes automatizados com axe-core
4. **Security audit**: Verificação de vulnerabilidades
5. **Performance regression**: Comparação histórica de métricas

### Integrações Futuras
- Slack/Discord notifications para falhas
- Dashboard de performance histórica
- Integração com ferramentas de APM (Application Performance Monitoring)
