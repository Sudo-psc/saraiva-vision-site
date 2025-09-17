# /add-command - Gerador Inteligente de Comandos

## Propósito
Gerar novos comandos personalizados automaticamente a partir de descrições curtas, usando templates da comunidade e padrões inteligentes.

## Uso
```
/add-command [nome] "descrição" [--template] [--category] [--interactive]
```

## Argumentos
- `nome` - Nome do comando a ser criado
- `descrição` - Descrição curta do que o comando deve fazer
- `--template` - Template base a usar (basic, git, build, test, analysis, automation, ui, api, docs, security)
- `--category` - Categoria do comando (dev, ops, quality, analysis, automation)
- `--interactive` - Modo interativo com perguntas detalhadas

## Templates da Comunidade

### Desenvolvimento
- **component** - Criação e gerenciamento de componentes
- **api** - Operações de API e backend
- **database** - Operações de banco de dados
- **migration** - Migrações e versionamento

### DevOps & Deploy
- **docker** - Containerização e Docker
- **k8s** - Kubernetes e orquestração
- **monitoring** - Monitoramento e alertas
- **backup** - Backup e recuperação

### Qualidade & Testes
- **lint** - Linting e formatação de código
- **security** - Análise de segurança
- **audit** - Auditoria de dependências
- **benchmark** - Testes de performance

### Automação
- **workflow** - Fluxos de trabalho automatizados
- **scheduler** - Agendamento de tarefas
- **integration** - Integrações externas
- **notification** - Notificações e alertas

## Execução
1. Analisar descrição fornecida para identificar padrões
2. Detectar categoria e template mais adequado
3. Extrair argumentos, flags e funcionalidades necessárias
4. Gerar estrutura de comando completa
5. Sugerir integrações com ferramentas existentes
6. Criar arquivo .md no diretório .claude/commands/
7. Validar sintaxe e estrutura gerada

## Análise Inteligente
- **Palavras-chave**: Detecta verbos e substantivos técnicos
- **Contexto**: Identifica tecnologias mencionadas (React, Node, Docker, etc.)
- **Operações**: Reconhece operações comuns (criar, testar, deployar, analisar)
- **Ferramentas**: Sugere integrações baseadas no contexto

## Exemplos de Uso

### Comando Simples
```bash
/add-command backup "fazer backup automático dos arquivos importantes"
```

### Comando com Template
```bash
/add-command ssl-check "verificar certificados SSL de todos os domínios" --template monitoring
```

### Modo Interativo
```bash
/add-command api-test --interactive
```

## Estrutura de Template Gerada

```markdown
# /[nome] - [Título Gerado]

## Propósito
[Descrição expandida baseada na entrada]

## Uso
```
/[nome] [argumentos-detectados] [--flags-sugeridas]
```

## Argumentos
[Lista de argumentos baseados na análise]

## Execução
[Passos lógicos inferidos da descrição]

## Integração Claude Code
[Ferramentas sugeridas baseadas no contexto]

## Exemplos
[Exemplos de uso gerados automaticamente]
```

## Padrões de Detecção

### Verbos → Ações
- "criar/gerar" → Operações de criação
- "testar/verificar" → Operações de validação  
- "deployar/publicar" → Operações de deploy
- "analisar/auditar" → Operações de análise
- "backup/salvar" → Operações de backup
- "monitorar/watch" → Operações de monitoramento

### Substantivos → Recursos
- "componente/component" → UI/React operations
- "API/endpoint" → Backend operations
- "banco/database" → Database operations
- "servidor/server" → Infrastructure operations
- "certificado/SSL" → Security operations

### Tecnologias → Integrações
- React/Vue/Angular → Frontend tools
- Node/Express/FastAPI → Backend tools
- Docker/K8s → Container tools
- PostgreSQL/MongoDB → Database tools
- Nginx/Apache → Web server tools

## Validação Automática
- Verificar se nome do comando já existe
- Validar sintaxe markdown gerada
- Checar referências de ferramentas
- Sugerir melhorias de estrutura

## Pós-Geração
- Adicionar ao índice de comandos
- Gerar documentação de uso
- Sugerir comandos relacionados
- Criar exemplos de teste