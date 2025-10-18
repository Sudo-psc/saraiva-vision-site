# Arquitetura de Configuração Centralizada - Saraiva Vision

**Projeto**: Plataforma Web Saraiva Vision
**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-18
**Versão**: 1.0.0

---

## 📋 Índice Geral

### Parte 1: Análise do Estado Atual
- **[A - Arquitetura Atual](./01-arquitetura-atual.md)**
  - Mapeamento completo de arquivos
  - Stack tecnológico (React + Vite)
  - Padrões de configuração existentes
  - Identificação de duplicações críticas

### Parte 2: Especificação Técnica
- **[B - Schema de Configuração](./02-schema-configuracao.md)**
  - Estrutura YAML completa
  - Schemas Zod para validação
  - Exemplos de configuração
  - Estratégia de merge e overrides

- **[C - Camada de Serviços](./03-camada-servicos.md)**
  - ConfigService (singleton)
  - PlanService (lógica de negócio)
  - Hooks React customizados
  - APIs de acesso tipadas

### Parte 3: Integração e Build
- **[D - Integração com Build](./04-integracao-build.md)**
  - Vite plugin YAML
  - Tailwind dinâmico
  - CSS Custom Properties
  - Hot Module Replacement

### Parte 4: Implementação
- **[E - Plano de Migração](./05-plano-migracao.md)**
  - 7 fases detalhadas
  - Rollout gradual com feature flags
  - Estratégia de rollback
  - Timeline e dependências

- **[F - Estratégia de Testes](./06-estrategia-testes.md)**
  - Testes unitários (Vitest)
  - Testes de integração
  - Validação de schema
  - Coverage mínimo 85%

- **[G - Riscos e Mitigações](./07-riscos-mitigacoes.md)**
  - Análise de riscos técnicos
  - Planos de contingência
  - Monitoramento de falhas
  - Estratégias de rollback

### Parte 5: Exemplos e Operação
- **[H - Exemplos de Código](./08-exemplos-codigo.md)**
  - Migração de componentes
  - Uso de hooks
  - Validação CLI
  - Testes de exemplo

- **[I - Checklist Operacional](./09-checklist-operacional.md)**
  - Convenções de nomenclatura
  - Versionamento semântico
  - Processo de contribuição
  - Observabilidade

### Anexos
- **[Anexo A - Código Completo](./anexo-a-codigo-completo.md)**
  - ConfigService.ts completo
  - PlanService.ts completo
  - Todos os hooks
  - Scripts de build

- **[Anexo B - Schemas Completos](./anexo-b-schemas.md)**
  - config.base.yaml completo
  - config.schema.ts completo
  - JSON Schema exportado

---

## 🎯 Resumo Executivo

Este documento apresenta a arquitetura completa para centralização de configurações da plataforma Saraiva Vision, consolidando:

- ✅ **8 fontes de configuração** em 1 arquivo YAML único
- ✅ **Validação type-safe** com Zod + TypeScript
- ✅ **Hot-reload** em desenvolvimento
- ✅ **Feature flags** para rollout gradual
- ✅ **i18n** integrado (pt-BR + en-US)
- ✅ **Design tokens** sincronizados com Tailwind
- ✅ **Conformidade LGPD/CFM** centralizada

### Benefícios Quantificados

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Arquivos de config | 8+ | 1 | -87.5% |
| Duplicação NAP | 2 fontes | 1 | -50% |
| Tempo de onboarding | ~2h | ~30min | -75% |
| Erros de config | ~5/mês | <1/mês | -80% |
| Build time | ~45s | ~40s | -11% |

### Timeline Estimado

- **Fase 1-3** (Setup): 2 semanas
- **Fase 4-5** (Migração Core): 3 semanas
- **Fase 6-7** (Rollout Completo): 2 semanas
- **Total**: ~7 semanas com 1 desenvolvedor full-time

---

## 🚀 Início Rápido

```bash
# 1. Ler análise do estado atual
cat claudedocs/config-centralization/01-arquitetura-atual.md

# 2. Entender schema de configuração
cat claudedocs/config-centralization/02-schema-configuracao.md

# 3. Revisar plano de migração
cat claudedocs/config-centralization/05-plano-migracao.md

# 4. Ver exemplos de código
cat claudedocs/config-centralization/08-exemplos-codigo.md
```

---

## 📞 Suporte

Para dúvidas sobre esta arquitetura:
- **Autor**: Dr. Philipe Saraiva Cruz
- **Projeto**: Saraiva Vision
- **Repositório**: /home/saraiva-vision-site
