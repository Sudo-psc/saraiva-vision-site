# /example-generator - Gerador de Exemplos de Comandos

## Propósito
Demonstrar como criar comandos automaticamente usando o /add-command, com exemplos práticos da comunidade.

## Uso
```
/example-generator [categoria] [--create] [--list] [--demo]
```

## Argumentos
- `categoria` - Categoria de exemplos (web, mobile, backend, devops, security)
- `--create` - Criar os exemplos automaticamente
- `--list` - Listar exemplos disponíveis
- `--demo` - Executar demonstração interativa

## Exemplos da Comunidade

### Web Development
```bash
/add-command lighthouse "auditar performance e SEO de todas as páginas" --template monitoring
/add-command component-gen "gerar componente React com props, testes e stories" --template component
/add-command style-guide "gerar guia de estilos a partir dos componentes existentes" --template docs
```

### DevOps & Infrastructure
```bash
/add-command ssl-renew "renovar certificados SSL automaticamente com Let's Encrypt" --template security
/add-command docker-clean "limpar containers, imagens e volumes não utilizados" --template docker
/add-command health-check "verificar saúde de todos os serviços em produção" --template monitoring
```

### Database & Backend
```bash
/add-command db-migrate "executar migrações de banco com rollback automático" --template database
/add-command api-docs "gerar documentação OpenAPI a partir das rotas" --template api
/add-command load-test "executar testes de carga nos endpoints críticos" --template benchmark
```

### Security & Quality
```bash
/add-command vuln-scan "escanear vulnerabilidades em dependências e código" --template security
/add-command code-review "revisar código com análise estática e sugestões" --template analysis
/add-command compliance "verificar conformidade LGPD/GDPR nos dados" --template audit
```

### Automation & Workflows
```bash
/add-command release "criar release completo com changelog e deploy" --template workflow
/add-command backup-db "backup automático de banco com compressão e upload" --template backup
/add-command notify-slack "enviar notificações para Slack com formatação" --template notification
```

## Execução
1. Analisar categoria solicitada
2. Carregar templates apropriados
3. Gerar comandos de exemplo
4. Criar arquivos .md automaticamente
5. Validar estrutura gerada
6. Demonstrar uso prático

## Templates Detalhados

### Template Component
- Geração de componentes React/Vue
- Props TypeScript automáticas
- Testes unitários incluídos
- Stories do Storybook
- Documentação JSDoc

### Template API
- Geração de endpoints RESTful
- Validação de schema
- Documentação OpenAPI
- Testes de integração
- Rate limiting

### Template Security
- Análise de vulnerabilidades
- Implementação de headers seguros
- Auditoria de permissões
- Compliance automático
- Relatórios de segurança

## Integração Claude Code
- Usa Write para criar arquivos de comando
- Usa Read para analisar templates existentes
- Usa Bash para executar validações
- Usa TodoWrite para rastrear progresso de criação

## Demonstração Interativa
Quando executado com --demo, o comando:
1. Mostra exemplos de descrições
2. Gera comandos em tempo real
3. Explica as decisões tomadas
4. Permite customização interativa