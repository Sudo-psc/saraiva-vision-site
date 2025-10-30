# Sistema de Relatórios Diários por E-mail

## 📧 Visão Geral

Sistema automatizado que executa checkups completos do sistema Saraiva Vision e envia relatórios diários por e-mail utilizando a API do Resend.

## 🎯 Funcionalidades

### Checkup do Sistema
- Validação da API
- Linting do código
- Testes unitários
- Testes de integração
- Testes de API
- Testes de frontend
- Build do projeto

### Relatório por E-mail
- **HTML Responsivo**: E-mail formatado com design profissional
- **Resumo Executivo**: Estatísticas rápidas de sucesso/falha
- **Detalhes Completos**: Lista de todos os testes executados
- **Status Visual**: Ícones e cores indicando sucesso/falha
- **Taxa de Sucesso**: Percentual de testes aprovados
- **Prioridade Automática**: E-mails de falha têm prioridade alta

## 🚀 Como Usar

### Instalação do Cron Job

```bash
# Instala o cron job para execução diária às 8h
npm run install:checkup-cron

# Ou com agendamento personalizado
CRON_SCHEDULE="0 8 * * *" npm run install:checkup-cron
```

### Execução Manual

```bash
# Executar checkup e enviar e-mail
npm run check:and-email

# Apenas enviar relatório (usa o último gerado)
npm run send:daily-report

# Enviar relatório específico
node scripts/send-daily-report.js /path/to/report.json

# Apenas checkup (sem enviar e-mail)
npm run check:system
```

## ⚙️ Configuração

### Variáveis de Ambiente Necessárias

Adicione ao arquivo `.env.production` ou `.env`:

```bash
# API do Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# E-mail do destinatário
DOCTOR_EMAIL=doctor@saraivavision.com.br
```

### Verificar Configuração

```bash
# O script valida automaticamente as variáveis de ambiente
node scripts/send-daily-report.js
```

## 📊 Estrutura do Relatório

### Conteúdo do E-mail

1. **Cabeçalho**
   - Logo Saraiva Vision
   - Título: "Relatório Diário do Sistema"
   - Data e hora da execução

2. **Status Geral**
   - Ícone e cor (✓ verde para sucesso, ✗ vermelho para falha)
   - Duração total
   - Taxa de sucesso

3. **Resumo Executivo**
   - Total de testes
   - Testes aprovados
   - Testes com falha

4. **Resultados Detalhados**
   - Tabela com cada teste executado
   - Status individual
   - Duração de cada teste

5. **Observações** (opcional)
   - Mensagens adicionais sobre falhas

6. **Rodapé**
   - Informações sobre o sistema de monitoramento
   - Instruções para acessar logs detalhados

## 📁 Arquivos Criados

### Scripts
- `scripts/send-daily-report.js` - Envia e-mail com relatório
- `scripts/run-checkup-and-email.sh` - Executa checkup e envia e-mail
- `scripts/system-checkup-suite.sh` - Script de checkup do sistema (existente)

### Serviços
- `api/src/routes/reports/reportEmailService.js` - Serviço de e-mail para relatórios

### Testes
- `api/__tests__/report-email-service.test.js` - Testes unitários do serviço

### Relatórios
- `reports/system-checkup/*.json` - Relatórios gerados
- `reports/system-checkup/*.log` - Logs detalhados
- `reports/system-checkup/cron.log` - Log do cron job

## 🔧 Comandos NPM

```json
{
  "check:system": "bash scripts/system-checkup-suite.sh",
  "send:daily-report": "node scripts/send-daily-report.js",
  "check:and-email": "bash scripts/run-checkup-and-email.sh",
  "install:checkup-cron": "bash scripts/install-system-checkup-cron.sh"
}
```

## 🎨 Personalização

### Alterar Horário do Cron

```bash
# Executar às 6h da manhã
CRON_SCHEDULE="0 6 * * *" npm run install:checkup-cron

# Executar duas vezes por dia (8h e 20h)
# Edite manualmente: crontab -e
# Adicione: 0 8,20 * * * /path/to/run-checkup-and-email.sh
```

### Alterar Destinatário

Edite o arquivo `.env.production`:

```bash
# Enviar para múltiplos destinatários (não suportado nativamente)
# Ou edite reportEmailService.js para adicionar mais destinatários
DOCTOR_EMAIL=admin@saraivavision.com.br
```

## 🔒 Segurança

- **Sanitização**: Todo conteúdo do relatório é sanitizado antes de ser incluído no e-mail
- **Retry Logic**: Sistema tenta reenviar automaticamente em caso de falha temporária
- **Validação**: Verifica configuração antes de tentar enviar e-mail
- **Headers Customizados**: X-Mailer e X-Report-Status para rastreamento
- **Prioridade**: E-mails de falha têm prioridade alta (X-Priority: 1)

## 📈 Monitoramento

### Verificar Status do Cron

```bash
# Listar cron jobs ativos
crontab -l

# Ver logs recentes
tail -f reports/system-checkup/cron.log

# Verificar último relatório gerado
ls -lt reports/system-checkup/*.json | head -1
```

### Logs

- **Cron Log**: `reports/system-checkup/cron.log`
- **Relatório JSON**: `reports/system-checkup/system-checkup-YYYYMMDD-HHMMSS.json`
- **Log Detalhado**: `reports/system-checkup/system-checkup-YYYYMMDD-HHMMSS.log`

## 🐛 Troubleshooting

### E-mail não é enviado

1. Verificar configuração:
```bash
# Deve mostrar as variáveis corretas
env | grep -E "RESEND_API_KEY|DOCTOR_EMAIL"
```

2. Testar envio manual:
```bash
npm run send:daily-report
```

3. Verificar logs do cron:
```bash
tail -50 reports/system-checkup/cron.log
```

### Checkup falha

1. Executar checkup manualmente para ver erros:
```bash
npm run check:system
```

2. Verificar dependências:
```bash
npm install
```

3. Verificar testes individualmente:
```bash
npm run test:api
npm run lint
```

### Cron não executa

1. Verificar se cron está ativo:
```bash
systemctl status cron  # ou crond
```

2. Verificar cron jobs:
```bash
crontab -l
```

3. Verificar permissões dos scripts:
```bash
ls -la scripts/*.sh
# Devem ter permissão de execução (x)
```

## 📞 Suporte

Para problemas relacionados ao sistema de relatórios:
1. Verificar logs em `reports/system-checkup/`
2. Executar scripts manualmente para diagnóstico
3. Verificar configuração das variáveis de ambiente
4. Consultar equipe técnica se problema persistir

## 🔄 Atualizações Futuras

Possíveis melhorias planejadas:
- [ ] Suporte para múltiplos destinatários
- [ ] Notificações via webhook
- [ ] Dashboard web para visualizar histórico
- [ ] Alertas específicos por tipo de falha
- [ ] Integração com Slack/Teams
- [ ] Relatórios semanais consolidados

---

**Última Atualização**: 2025-10-30
**Sistema**: Saraiva Vision Medical Platform
**Versão**: 2.0.1
