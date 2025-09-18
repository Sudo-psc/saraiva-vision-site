# /commands - Gerenciador de Comandos Personalizados

## Propósito
Gerenciar, listar, criar e editar comandos personalizados do Claude Code.

## Uso
```
/commands [ação] [nome] [--template] [--edit] [--validate]
```

## Ações
- `list` - Listar todos os comandos disponíveis
- `create` - Criar novo comando
- `edit` - Editar comando existente
- `delete` - Remover comando
- `validate` - Validar sintaxe de comando
- `template` - Gerar template de comando

## Argumentos
- `nome` - Nome do comando
- `--template` - Usar template específico
- `--edit` - Abrir editor
- `--validate` - Validar estrutura

## Templates Disponíveis
- **basic** - Comando básico
- **git** - Operações Git avançadas
- **build** - Comandos de build/deploy
- **test** - Comandos de teste
- **analysis** - Análise de código
- **automation** - Automação de tarefas

## Execução
1. Escanear diretório .claude/commands/
2. Validar estrutura dos comandos
3. Executar ação solicitada
4. Gerar documentação automática
5. Validar sintaxe markdown

## Estrutura de Comando
```markdown
# /nome-comando - Título

## Propósito
Descrição do propósito do comando

## Uso
Sintaxe de uso com argumentos

## Execução
Passos de execução detalhados

## Integração Claude Code
Ferramentas e integrações utilizadas
```

## Exemplos
```bash
/commands list
/commands create backup --template automation
/commands validate performance
/commands edit testes
```