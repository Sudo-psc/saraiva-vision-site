# /refactor - Refatoração Inteligente

## Propósito
Executar refatoração automatizada com análise de impacto, preservação de funcionalidade e otimização de código.

## Uso
```
/refactor [escopo] [--type] [--safe-mode] [--preview] [--auto-test]
```

## Argumentos
- `escopo` - Escopo da refatoração (component, hook, service, global)
- `--type` - Tipo de refatoração (extract, rename, modernize, optimize)
- `--safe-mode` - Modo seguro com validações extras
- `--preview` - Visualizar mudanças antes de aplicar
- `--auto-test` - Executar testes após cada mudança

## Tipos de Refatoração
- **Extract**: Extrair componentes, hooks ou funções
- **Rename**: Renomear variáveis, funções, componentes
- **Modernize**: Atualizar padrões para versões modernas
- **Optimize**: Otimizar performance e bundle size

## Execução
1. Analisar código e dependências
2. Identificar oportunidades de refatoração
3. Gerar plano de mudanças
4. Aplicar mudanças incrementalmente
5. Validar funcionalidade preservada
6. Otimizar imports e exports
7. Gerar relatório de melhorias

## Segurança
- Backup automático antes das mudanças
- Validação de sintaxe em tempo real
- Testes automatizados após cada etapa
- Rollback em caso de falhas