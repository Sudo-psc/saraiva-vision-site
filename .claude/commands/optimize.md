# /optimize - Otimização Automática Completa

## Propósito
Otimizar automaticamente imagens, código, bundle e performance baseado na descrição "otimizar imagens e reduzir tamanho do bundle automaticamente".

## Uso
```
/optimize [target] [--images] [--bundle] [--aggressive] [--report]
```

## Argumentos
- `target` - Alvo de otimização (images, bundle, code, all)
- `--images` - Otimizar apenas imagens
- `--bundle` - Otimizar apenas bundle
- `--aggressive` - Otimização agressiva com mais compressão
- `--report` - Gerar relatório detalhado das melhorias

## Execução
1. Escanear projeto para identificar oportunidades de otimização
2. Analisar imagens e converter para formatos modernos (WebP, AVIF)
3. Comprimir imagens mantendo qualidade visual
4. Analisar bundle e identificar dependências desnecessárias
5. Aplicar tree-shaking avançado
6. Otimizar imports e lazy loading
7. Gerar relatório de economia de espaço

## Integração Claude Code
- Usa Bash para executar ferramentas de otimização
- Usa Read para analisar configurações existentes
- Usa Write para atualizar configurações otimizadas
- Usa Glob para encontrar arquivos para otimização

## Exemplos
```bash
/optimize images --aggressive
/optimize bundle --report
/optimize all --report
```