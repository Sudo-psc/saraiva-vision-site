# Saraiva Vision - Sistema de Inicialização Automática

Este documento explica como funciona o sistema de automação para inicialização automática do site Saraiva Vision após reinicialização do servidor.

## Arquivos Criados

### 1. `scripts/startup.sh`
Script principal de inicialização automática que:
- Verifica se o Docker está rodando
- Inicia todos os serviços Docker Compose
- Aguarda os health checks de cada serviço
- Executa verificações finais
- Registra logs detalhados em `/var/log/saraiva-vision-startup.log`

### 2. `scripts/startup-test.sh`
Script de teste simplificado para validação rápida do sistema.

## Configuração do Cron Job

Um cron job foi configurado para executar automaticamente o script de inicialização após cada reinicialização do servidor:

```bash
@reboot /home/saraiva-vision-site/scripts/startup.sh >> /var/log/saraiva-vision-startup.log 2>&1
```

Para verificar o cron job configurado:
```bash
crontab -l
```

## Como Funciona

1. **Após reinicialização**: O cron job `@reboot` é executado automaticamente
2. **Verificação do Docker**: O script verifica se o Docker está instalado e rodando
3. **Inicialização dos serviços**: Executa `docker-compose up -d` para iniciar todos os serviços
4. **Health checks**: Aguarda cada serviço ficar saudável antes de prosseguir
5. **Verificações finais**: Testa endpoints principais para confirmar funcionamento
6. **Logs**: Todo o processo é registrado em log para monitoramento

## Serviços Monitorados

O script monitora os seguintes serviços:
- **Redis** (porta 6379)
- **MySQL** (porta 3307)
- **API Backend** (porta 3003/api/health)
- **Frontend** (porta 3000/health)
- **WordPress** (porta 8080/wp-json/wp/v2/)
- **Nginx** (porta 80/health)

## Logs e Monitoramento

### Arquivo de Log Principal
```
/var/log/saraiva-vision-startup.log
```

### Verificar Status dos Serviços
```bash
cd /home/saraiva-vision-site
docker-compose ps
```

### Verificar Logs de um Serviço Específico
```bash
cd /home/saraiva-vision-site
docker-compose logs <nome-do-serviço>
```

### Verificar Logs do Script de Inicialização
```bash
tail -f /var/log/saraiva-vision-startup.log
```

## Teste Manual

Para testar o sistema manualmente:

```bash
cd /home/saraiva-vision-site
./scripts/startup-test.sh
```

## Solução de Problemas

### Script não executa após reinicialização
1. Verificar se o cron job está configurado: `crontab -l`
2. Verificar permissões do script: `ls -la scripts/startup.sh`
3. Verificar logs do cron: `grep CRON /var/log/syslog`

### Serviços não iniciam
1. Verificar variáveis de ambiente no `.env` ou docker-compose.yml
2. Verificar logs dos serviços: `docker-compose logs`
3. Verificar se há portas conflitantes: `netstat -tlnp`

### Docker não inicia
1. Verificar status do Docker: `systemctl status docker`
2. Reiniciar Docker: `sudo systemctl restart docker`

## Configuração de Notificações (Opcional)

O script pode ser configurado para enviar notificações quando a inicialização falha ou é bem-sucedida. Para isso, adicione código no final do script `startup.sh` para:

- Enviar email
- Enviar webhook para serviço de monitoramento
- Integrar com ferramentas como Slack, Discord, etc.

## Manutenção

### Atualizar o Script
```bash
cd /home/saraiva-vision-site
# Editar scripts/startup.sh
# Testar as mudanças
./scripts/startup-test.sh
```

### Backup dos Logs
Considere configurar rotação de logs para o arquivo `/var/log/saraiva-vision-startup.log` para evitar que ele cresça indefinidamente.

## Segurança

- O script é executado com as permissões do usuário que configurou o cron job
- Certifique-se de que o diretório do projeto tenha permissões adequadas
- Não armazene senhas no script - use variáveis de ambiente
- Monitore os logs regularmente para detectar tentativas de acesso não autorizado