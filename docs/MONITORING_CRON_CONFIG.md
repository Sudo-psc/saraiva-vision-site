# ✅ CONFIGURAÇÃO DE AGENDAMENTO - SISTEMA DE MONITORAMENTO

**Data**: 2025-10-05  
**Status**: ✅ Totalmente Configurado e Operacional

---

## 📅 MÉTODOS DE AGENDAMENTO CONFIGURADOS

O sistema possui **DOIS métodos** configurados para redundância:

### 1️⃣ Systemd Timer (PRINCIPAL) ✅

**Arquivo**: `/etc/systemd/system/saraiva-monitor.timer`

```ini
[Unit]
Description=Saraiva Vision VPS Monitoring Timer
Requires=saraiva-monitor.service

[Timer]
OnCalendar=daily
OnCalendar=*-*-* 06:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

**Status**:
- ✅ Enabled (inicia no boot)
- ✅ Active (atualmente ativo)
- ✅ Próxima execução: **Segunda-feira 06/10/2025 às 00:00 UTC** (primeiro trigger)
- ✅ Execução diária às **06:00 UTC** (03:00 BRT)

**Comandos**:
```bash
# Ver status
sudo systemctl status saraiva-monitor.timer

# Ver próximas execuções
systemctl list-timers saraiva-monitor.timer

# Parar timer
sudo systemctl stop saraiva-monitor.timer

# Iniciar timer
sudo systemctl start saraiva-monitor.timer

# Desabilitar no boot
sudo systemctl disable saraiva-monitor.timer

# Habilitar no boot
sudo systemctl enable saraiva-monitor.timer
```

---

### 2️⃣ Cron Job (BACKUP) ✅

**Arquivo**: Root crontab (`sudo crontab -e`)

```cron
0 6 * * * /home/saraiva-vision-site/scripts/monitoring/vps-monitor.sh >> /var/log/saraiva-monitoring/cron.log 2>&1
```

**Configuração**:
- ✅ Instalado na crontab do root
- ✅ Executa diariamente às **06:00 UTC** (03:00 BRT)
- ✅ Logs salvos em `/var/log/saraiva-monitoring/cron.log`
- ✅ Mantém outras cron jobs existentes:
  - `0 2 * * *` → Rotação de logs do chatbot
  - `*/5 * * *` → Monitor do chatbot (a cada 5 minutos)

**Comandos**:
```bash
# Editar crontab
sudo crontab -e

# Listar crontab
sudo crontab -l

# Ver logs do cron
sudo tail -f /var/log/saraiva-monitoring/cron.log
```

---

## ⚙️ POR QUE DOIS MÉTODOS?

| Característica | Systemd Timer | Cron Job |
|---------------|---------------|----------|
| **Prioridade** | Principal | Backup |
| **Vantagens** | Logs no journalctl, integração systemd, recuperação automática | Simples, tradicional, confiável |
| **Desvantagens** | Requer systemd | Menos controle de estado |
| **Logs** | `journalctl -u saraiva-monitor.service` | `/var/log/saraiva-monitoring/cron.log` |
| **Boot** | Inicia automaticamente | Depende do cron daemon |

**Recomendação**: Use **systemd timer** como principal. O cron job serve como backup caso o timer falhe.

---

## 🕐 HORÁRIOS DE EXECUÇÃO

### Configuração Atual
- **Horário UTC**: 06:00
- **Horário BRT** (Brasil): 03:00
- **Frequência**: Diária

### Alterar Horário

**Systemd Timer**:
```bash
sudo systemctl edit saraiva-monitor.timer --full
```

Edite a linha:
```ini
OnCalendar=*-*-* 18:00:00  # Exemplo: 18:00 UTC (15:00 BRT)
```

Depois:
```bash
sudo systemctl daemon-reload
sudo systemctl restart saraiva-monitor.timer
```

**Cron Job**:
```bash
sudo crontab -e
```

Edite a linha (formato: minuto hora dia mês dia-da-semana):
```cron
0 18 * * * /home/saraiva-vision-site/scripts/monitoring/vps-monitor.sh >> /var/log/saraiva-monitoring/cron.log 2>&1
```

---

## 📊 EXEMPLOS DE FREQUÊNCIAS ALTERNATIVAS

### Cron Job

```cron
# A cada 6 horas (00:00, 06:00, 12:00, 18:00)
0 */6 * * * /home/saraiva-vision-site/scripts/monitoring/vps-monitor.sh >> /var/log/saraiva-monitoring/cron.log 2>&1

# A cada 12 horas (00:00, 12:00)
0 */12 * * * /home/saraiva-vision-site/scripts/monitoring/vps-monitor.sh >> /var/log/saraiva-monitoring/cron.log 2>&1

# Apenas dias úteis às 06:00 (segunda a sexta)
0 6 * * 1-5 /home/saraiva-vision-site/scripts/monitoring/vps-monitor.sh >> /var/log/saraiva-monitoring/cron.log 2>&1

# Duas vezes ao dia (06:00 e 18:00)
0 6,18 * * * /home/saraiva-vision-site/scripts/monitoring/vps-monitor.sh >> /var/log/saraiva-monitoring/cron.log 2>&1
```

### Systemd Timer

```ini
# A cada 6 horas
[Timer]
OnCalendar=*-*-* 00,06,12,18:00:00

# A cada 12 horas
[Timer]
OnCalendar=*-*-* 00,12:00:00

# Apenas dias úteis
[Timer]
OnCalendar=Mon,Tue,Wed,Thu,Fri *-*-* 06:00:00
```

---

## 🔍 VERIFICAÇÃO E TROUBLESHOOTING

### Verificar se está agendado

```bash
# Systemd
systemctl list-timers saraiva-monitor.timer

# Cron
sudo crontab -l | grep monitoring
```

### Ver logs de execução

```bash
# Systemd (últimas 50 linhas)
sudo journalctl -u saraiva-monitor.service -n 50 --no-pager

# Systemd (seguir em tempo real)
sudo journalctl -u saraiva-monitor.service -f

# Cron
sudo tail -f /var/log/saraiva-monitoring/cron.log

# Syslog geral do cron
grep CRON /var/log/syslog | tail -20
```

### Testar manualmente

```bash
# Executar script diretamente
sudo /home/saraiva-vision-site/scripts/monitoring/vps-monitor.sh

# Triggerar systemd service
sudo systemctl start saraiva-monitor.service

# Ver resultado
ls -lht /var/log/saraiva-monitoring/report_*.md | head -3
```

### Problemas comuns

| Problema | Solução |
|----------|---------|
| Timer não executa | `sudo systemctl restart saraiva-monitor.timer` |
| Cron não executa | Verificar se crond está rodando: `systemctl status cron` |
| Permissão negada | `sudo chmod +x /home/saraiva-vision-site/scripts/monitoring/vps-monitor.sh` |
| Logs não aparecem | Verificar permissões: `sudo chown -R root:root /var/log/saraiva-monitoring` |
| Execução duplicada | Desabilitar um dos métodos (timer OU cron) |

---

## 🎯 ESTADO ATUAL DO SISTEMA

```
✅ Systemd Timer: enabled, active
   Próxima execução: Mon 2025-10-06 00:00:00 UTC

✅ Cron Job: Configurado
   Próxima execução: Mon 2025-10-06 06:00:00 UTC

✅ Script: Executável
   Última execução: 2025-10-05 16:50:39 UTC
   Resultado: SUCCESS

✅ Relatórios: 4 gerados
   Último: /var/log/saraiva-monitoring/report_20251005_165039.md
```

---

## 📝 RECOMENDAÇÕES

### 1. Escolha UM método principal

**Para produção, recomendo**: Systemd Timer
- Melhor integração com o sistema
- Logs centralizados no journalctl
- Recuperação automática em caso de falha
- Não executa se o sistema estiver desligado (Persistent=true garante execução posterior)

### 2. Desabilite o outro (opcional)

Se quiser usar APENAS systemd:
```bash
sudo crontab -e
# Comente a linha do monitoring (adicione # no início)
```

Se quiser usar APENAS cron:
```bash
sudo systemctl disable saraiva-monitor.timer
sudo systemctl stop saraiva-monitor.timer
```

### 3. Monitore os logs

Configure um alerta se o sistema não executar:
```bash
# Verificar se executou nas últimas 25 horas
find /var/log/saraiva-monitoring/ -name "report_*.md" -mtime -1 | wc -l
# Deve retornar pelo menos 1
```

---

## 📚 ARQUIVOS DE CONFIGURAÇÃO

```
/etc/systemd/system/saraiva-monitor.timer    # Timer systemd
/etc/systemd/system/saraiva-monitor.service  # Service systemd
/var/spool/cron/crontabs/root                # Crontab do root (editado com crontab -e)
/home/saraiva-vision-site/scripts/monitoring/vps-monitor.sh  # Script principal
/var/log/saraiva-monitoring/                 # Diretório de relatórios
```

---

## ✅ CONCLUSÃO

Sistema de agendamento totalmente configurado com **dupla redundância**:

1. ✅ **Systemd Timer**: Principal, mais robusto
2. ✅ **Cron Job**: Backup, tradicional e confiável

Ambos configurados para executar **diariamente às 06:00 UTC** (03:00 BRT).

**Próxima execução automática**: Segunda-feira, 06/10/2025 🚀
