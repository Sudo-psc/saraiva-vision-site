# /testes - Executar Testes Automatizados

## Propósito
Executar testes automatizados do projeto com diferentes configurações e gerar relatórios abrangentes.

## Uso
```
/testes [tipo] [--coverage] [--watch] [--verbose] [--fix]
```

## Argumentos
- `tipo` - Tipo de teste a executar (unit, integration, e2e, all)
- `--coverage` - Gerar relatório de cobertura
- `--watch` - Executar em modo watch
- `--verbose` - Saída detalhada
- `--fix` - Corrigir automaticamente problemas encontrados

## Exemplos
```bash
/testes unit --coverage
/testes e2e --verbose
/testes all --coverage --fix
/testes --watch
```

## Execução
1. Analisar configuração de testes do projeto
2. Validar dependências e ambiente de teste
3. Executar testes conforme especificado
4. Gerar relatórios de cobertura (se solicitado)
5. Aplicar correções automáticas (se habilitado)
6. Exibir resumo dos resultados

## Integração Claude Code
- Usa Bash para execução de comandos de teste
- Usa Read para análise de configurações
- Usa Write para gerar relatórios
- Usa TodoWrite para rastreamento de progresso
- Integra com ferramentas de CI/CD

## Configurações Suportadas
- **Vitest**: Testes unitários e de integração
- **Jest**: Framework de testes JavaScript
- **Cypress**: Testes E2E
- **Playwright**: Testes de navegador
- **Testing Library**: Testes de componentes React

## Outputs
- Relatórios de cobertura em HTML/JSON
- Logs detalhados de execução
- Métricas de performance
- Capturas de tela para testes E2E
- Relatório de correções aplicadas