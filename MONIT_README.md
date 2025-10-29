# 📚 MONIT - Guia Completo de Monitoramento
## Saraiva Vision VPS - Sistema de Monitoramento Profissional

---

## 📊 VISÃO GERAL

O Monit está configurado para monitorar automaticamente **13 serviços críticos** do servidor, com auto-restart inteligente, alertas proativos e dashboard web em tempo real.

### ✅ Status da Instalação
- **Versão**: Monit 5.33.0
- **Instalado em**: 2025-10-29
- **Servidor**: srv846611 (Ubuntu 24.04.3 LTS)
- **Memória usada**: ~5 MB (extremamente leve)
- **Interval de verificação**: 60 segundos
- **Interface web**: http://31.97.129.78:2812

---

## 🎯 SERVIÇOS MONITORADOS

| # | Serviço | Tipo | Porta | Auto-Restart | Criticidade |
|---|---------|------|-------|--------------|-------------|
| 1 | **srv846611** | Sistema | - | Alertas | 🔴 Crítico |
| 2 | **rootfs** | Filesystem / | - | Alertas | 🔴 Crítico |
| 3 | **boot** | Filesystem | - | Alertas | 🟡 Alto |
| 4 | **bootefi** | Filesystem | - | Alertas | 🟡 Alto |
| 5 | **nginx** | Web Server | 80, 443 | ✅ Sim | 🔴 Crítico |
| 6 | **saraiva-api** | Node.js API | 3001 | ✅ Sim | 🔴 Crítico |
| 7 | **redis-server** | Cache NoSQL | 6379 | ✅ Sim | 🟡 Alto |
| 8 | **webhook-receiver** | Deploy Hook | 9000 | ✅ Sim | 🟢 Médio |
| 9 | **sshd** | SSH Access | 22 | ✅ Sim | 🔴 Crítico |
| 10 | **cron** | Scheduler | - | ✅ Sim | 🟢 Médio |
| 11 | **rsyslog** | Logging | - | ✅ Sim | 🟢 Médio |
| 12 | **fail2ban** | Security | - | ✅ Sim | 🟡 Alto |
| 13 | **fail2ban_log** | File Monitor | - | Alertas | 🟢 Médio |

---

## 🌐 ACESSO À INTERFACE WEB

### Credenciais de Acesso

**🔒 SECURE ACCESS - Credentials Not Stored in Version Control**

Access credentials are stored securely in:
```
/home/saraiva-vision-site/monit-credentials.txt
```

**To view credentials securely**:
```bash
sudo cat /home/saraiva-vision-site/monit-credentials.txt
```

**Security Requirements**:
- File permissions must be `600` (root:root)
- File must be in `.gitignore` (never commit credentials)
- **IMPORTANT**: The exposed password in this file's history must be rotated immediately
- Use SSH tunnel for remote access: `ssh -L 2812:localhost:2812 user@server`

**SSH Tunnel Example**:
```bash
# On your local machine:
ssh -L 2812:localhost:2812 user@31.97.129.78

# Then access: http://localhost:2812
```

### Funcionalidades do Dashboard
- ✅ Status em tempo real de todos os serviços
- ✅ Gráficos de uso de CPU, RAM, Disco
- ✅ Histórico de eventos e alertas
- ✅ Restart manual de serviços via interface
- ✅ Visualização de logs em tempo real
- ✅ Informações detalhadas de cada processo (PID, uptime, threads, etc)

---

## 🔧 COMANDOS ÚTEIS DO DIA-A-DIA

### Status e Monitoramento
```bash
# Ver resumo de todos os serviços
monit summary

# Ver status detalhado de todos os serviços
monit status

# Ver status de um serviço específico
monit status nginx
monit status saraiva-api

# Script de health check completo
/home/saraiva-vision-site/monit-health-check.sh
```

### Controle de Serviços
```bash
# Reiniciar um serviço manualmente via Monit
monit restart nginx
monit restart saraiva-api

# Parar monitoramento temporário
monit stop nginx

# Retomar monitoramento
monit start nginx

# Parar/iniciar todos os serviços
monit stop all
monit start all
```

### Configuração e Reload
```bash
# Testar sintaxe da configuração (SEMPRE FAZER ANTES DE RELOAD!)
monit -t

# Recarregar configurações sem parar serviços
monit reload

# Reiniciar o daemon do Monit
systemctl restart monit

# Ver status do serviço Monit
systemctl status monit
```

### Logs e Troubleshooting
```bash
# Ver log em tempo real
tail -f /var/log/monit.log

# Ver últimos 50 eventos
tail -50 /var/log/monit.log

# Buscar por serviço específico
grep "nginx" /var/log/monit.log

# Buscar por eventos de restart
grep "restart" /var/log/monit.log

# Ver fila de alertas pendentes
ls -lh /var/lib/monit/events/
```

---

## 📁 ESTRUTURA DE ARQUIVOS

```
/etc/monit/
├── monitrc                          # Configuração principal
├── conf-enabled/                    # Configurações ativas
│   ├── monit-system.conf           # Monitoramento de recursos
│   ├── monit-nginx.conf            # Nginx
│   ├── monit-saraiva-api.conf      # API principal
│   ├── monit-redis.conf            # Redis
│   ├── monit-webhook.conf          # Webhook receiver
│   ├── monit-ssh.conf              # SSH
│   ├── monit-cron.conf             # Cron
│   └── monit-rsyslog.conf          # Rsyslog
├── monitrc.d/
│   └── fail2ban                     # Fail2ban (pré-existente)
└── templates/                       # Templates de permissões

/var/log/
└── monit.log                        # Log principal

/var/lib/monit/
├── id                               # ID único do servidor
├── state                            # Estado persistente
└── events/                          # Fila de alertas por email

/home/saraiva-vision-site/
├── monit-credentials.txt            # Credenciais de acesso
├── monitrc.backup.original          # Backup da config original
├── monit-health-check.sh            # Script de health check
├── MONIT_README.md                  # Este arquivo
└── MONIT_EMAIL_SETUP.md             # Guia de configuração de email
```

---

## 🎨 THRESHOLDS E LIMITES CONFIGURADOS

### Sistema (srv846611)
- **Load Average**: 
  - Warning: > 4 (1min), > 3 (5min), > 2 (15min)
- **CPU**: Alert se > 95% por 5 ciclos
- **RAM**: Alert se > 90% por 3 ciclos, crítico > 95%
- **Swap**: Alert se > 50% por 5 ciclos, crítico > 75%

### Disco
- **Partição /**: Alert 85%, Crítico 95%
- **/boot**: Alert 80%
- **/boot/efi**: Alert 70%
- **Inodes**: Alert 90%

### Nginx
- **CPU**: Alert 80%, Restart 95%
- **RAM**: Alert 500MB, Restart 800MB
- **Workers**: Alert se < 1 ou > 10
- **Portas**: 80 e 443 (TCP check)

### Saraiva API
- **CPU**: Alert 85%, Restart 95%
- **RAM**: Alert 1GB, Restart 1.5GB
- **Healthcheck**: GET /health na porta 3001
- **Memory Leak Detection**: Alert se uso crescer continuamente

### Redis
- **CPU**: Alert 70%, Restart 90%
- **RAM**: Alert 500MB, Alert 1GB
- **Porta**: 6379 (Redis protocol check)

### SSH (CRÍTICO!)
- **CPU**: Alert 50%, Alert 80%
- **RAM**: Alert 300MB, Alert 500MB
- **Conexões**: Alert > 50, Alert > 100
- **Porta**: 22 (SSH protocol check)

---

## 🔄 ESTRATÉGIA DE AUTO-RESTART

### Quando o Restart Acontece?
1. Processo morreu/travou (2 ciclos sem resposta)
2. Porta não responde (2-3 ciclos)
3. CPU/RAM excede limites críticos (5-10 ciclos)
4. Healthcheck falhou (HTTP/TCP/Protocol)

### Proteção Contra Loop de Restart
- Se um serviço reiniciar **3 vezes em 5 ciclos** → **TIMEOUT** (para de tentar)
- Se reiniciar **5 vezes em 10-15 ciclos** → **UNMONITOR** (para completamente)

### Dependências
- **Saraiva API** depende do **Nginx** (não reinicia se nginx estiver down)

---

## ➕ ADICIONAR NOVOS MONITORAMENTOS

### Exemplo: Monitorar PostgreSQL

1. Criar arquivo de configuração:
```bash
sudo nano /etc/monit/conf-enabled/monit-postgresql.conf
```

2. Adicionar conteúdo:
```
check process postgresql with pidfile /var/run/postgresql/14-main.pid
    group database
    start program = "/usr/bin/systemctl start postgresql"
    stop program = "/usr/bin/systemctl stop postgresql"
    
    if not exist for 2 cycles then restart
    if failed host localhost port 5432 protocol pgsql for 2 cycles then restart
    if cpu > 80% for 5 cycles then alert
    if totalmem > 1 GB for 5 cycles then alert
    
    if 3 restarts within 5 cycles then timeout
```

3. Testar e recarregar:
```bash
monit -t
monit reload
```

---

## 🔧 TROUBLESHOOTING COMUM

### Monit não inicia
```bash
# Verificar erros de sintaxe
monit -t

# Ver logs do systemd
journalctl -u monit -n 50

# Verificar permissões do monitrc
ls -lh /etc/monit/monitrc
# Deve ser: -rw------- (600)
```

### Serviço não é detectado
```bash
# Verificar se PID file existe
ls -la /var/run/nome-do-servico.pid

# Usar matching em vez de pidfile
check process nome matching "nome-do-processo"
```

### Auto-restart não funciona
```bash
# Verificar se comando start/stop está correto
/usr/bin/systemctl start nome-servico

# Ver se serviço está realmente monitorado
monit status nome-servico | grep monitoring

# Verificar limites de restart
grep "timeout\|unmonitor" /var/log/monit.log
```

### Interface web não acessível
```bash
# Verificar se porta 2812 está escutando
ss -tlnp | grep 2812

# Testar localmente
curl -u admin:SENHA http://localhost:2812

# Verificar firewall
ufw status | grep 2812
```

---

## 📧 ALERTAS POR EMAIL

**Status Atual**: ⚠️ Alertas configurados mas servidor SMTP não disponível

**Recipient Configuration**: Set via environment variable `ALERT_EMAIL_ADDRESS` or in `/etc/monit/monitrc`

**⚠️ Important Security Notes**:
- Never commit real email addresses to version control
- Use environment variables or secure config files (not in Git)
- If an email was previously exposed in this file, rotate/change it
- See `/home/saraiva-vision-site/MONIT_EMAIL_SETUP.md` for detailed setup instructions

**Fila de eventos**: `/var/lib/monit/events/`

---

## 🔒 SEGURANÇA

### Permissões Críticas
- `/etc/monit/monitrc`: **600** (rw-------)
- Senha web: **24 caracteres** aleatórios
- Interface web: Protegida por autenticação HTTP Basic

### Recomendações
- ✅ Mudar senha padrão periodicamente
- ✅ Restringir acesso à porta 2812 apenas para IPs confiáveis (UFW)
- ✅ Considerar usar HTTPS com certificado SSL válido
- ✅ Monitorar logs de acesso: `/var/log/monit.log`

---

## 📈 PRÓXIMOS PASSOS (OPCIONAL)

### Melhorias Recomendadas
1. **Configurar SMTP** para receber alertas por email
2. **Monitorar mais métricas**:
   - Tempo de resposta de páginas específicas
   - Uso de banda de rede
   - Temperatura de CPU (se disponível)
3. **Integrar com sistemas externos**:
   - Slack/Discord webhooks para alertas
   - Grafana para visualização avançada
   - Prometheus para métricas de longo prazo
4. **Backups automáticos** da configuração do Monit

---

## 📞 SUPORTE E RECURSOS

### Comandos de Emergência
```bash
# Parar TODOS os monitoramentos (emergência)
monit unmonitor all

# Desabilitar Monit completamente
systemctl stop monit
systemctl disable monit

# Restaurar configuração original
cp /home/saraiva-vision-site/monitrc.backup.original /etc/monit/monitrc
```

### Documentação Oficial
- Site: https://mmonit.com/monit/
- Manual: `man monit`
- Wiki: https://mmonit.com/wiki/Monit/

### Arquivos de Suporte
- Health Check: `/home/saraiva-vision-site/monit-health-check.sh`
- Credenciais: `/home/saraiva-vision-site/monit-credentials.txt`
- Email Setup: `/home/saraiva-vision-site/MONIT_EMAIL_SETUP.md`

---

## ✅ CHANGELOG

### 2025-10-29 - Instalação Inicial
- ✅ Monit 5.33.0 instalado e configurado
- ✅ 13 serviços em monitoramento ativo
- ✅ Interface web habilitada na porta 2812
- ✅ Auto-restart configurado e testado
- ✅ Thresholds otimizados para o ambiente
- ✅ Proteção contra loop de restart implementada
- ✅ Documentação completa criada

---

**🎉 Sistema de Monitoramento Totalmente Operacional!**

Para verificar o status atual, execute:
```bash
/home/saraiva-vision-site/monit-health-check.sh
```

Ou acesse o dashboard web em: http://31.97.129.78:2812

