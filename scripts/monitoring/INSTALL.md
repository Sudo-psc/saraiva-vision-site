# Saraiva Vision - Health Check Monitor - Installation Guide

## 📋 Pré-requisitos

### Dependências Obrigatórias
```bash
# Verificar dependências
command -v nginx || echo "⚠️ Nginx não instalado"
command -v git || echo "⚠️ Git não instalado"
command -v systemctl || echo "⚠️ Systemd não disponível"
command -v curl || echo "⚠️ curl não instalado"
```

### Ferramentas Opcionais (Recomendadas)
```bash
sudo apt install -y netstat-nat  # Para contagem de conexões
```

---

## 🚀 Instalação

### Passo 1: Tornar o script executável
```bash
chmod +x /home/saraiva-vision-site/scripts/monitoring/daily-health-check.sh
```

### Passo 2: Criar diretórios necessários
```bash
sudo mkdir -p /var/log/saraiva-monitoring/{reports,temp}
sudo chown -R root:root /var/log/saraiva-monitoring
```

### Passo 3: Copiar arquivos do systemd
```bash
sudo cp /home/saraiva-vision-site/scripts/monitoring/saraiva-health-check.service \
        /etc/systemd/system/

sudo cp /home/saraiva-vision-site/scripts/monitoring/saraiva-health-check.timer \
        /etc/systemd/system/
```

### Passo 4: Habilitar e iniciar o timer
```bash
# Recarregar systemd
sudo systemctl daemon-reload

# Habilitar timer para iniciar no boot
sudo systemctl enable saraiva-health-check.timer

# Iniciar timer imediatamente
sudo systemctl start saraiva-health-check.timer

# Verificar status
sudo systemctl status saraiva-health-check.timer
```

---

## ✅ Verificação da Instalação

### Verificar se o timer está ativo
```bash
sudo systemctl list-timers | grep saraiva
```

**Output esperado:**
```
NEXT                        LEFT          LAST PASSED UNIT                       ACTIVATES
Wed 2025-10-06 06:00:00 UTC 8h left       -    -      saraiva-health-check.timer saraiva-health-check.service
```

### Testar execução manual
```bash
# Executar manualmente
sudo /home/saraiva-vision-site/scripts/monitoring/daily-health-check.sh

# Verificar relatório gerado
ls -lh /var/log/saraiva-monitoring/reports/
```

### Ver logs de execução
```bash
# Logs do último run
sudo journalctl -u saraiva-health-check.service -n 50

# Logs em tempo real
sudo journalctl -u saraiva-health-check.service -f
```

---

## 📊 Localização dos Relatórios

```bash
# Diretório de relatórios
cd /var/log/saraiva-monitoring/reports/

# Ver último relatório
cat $(ls -t /var/log/saraiva-monitoring/reports/ | head -1)
```

**Formato do arquivo:** `health-check-YYYYMMDD_HHMMSS.md`

---

## 🔧 Configuração Alternativa (Cron)

Se preferir usar cron ao invés de systemd timer:

```bash
# Editar crontab do root
sudo crontab -e

# Adicionar linha (executa às 06:00 diariamente)
0 6 * * * /home/saraiva-vision-site/scripts/monitoring/daily-health-check.sh >> /var/log/saraiva-monitoring/cron.log 2>&1
```

---

## 🛠 Troubleshooting

### Timer não está executando
```bash
# Verificar se timer está habilitado
sudo systemctl is-enabled saraiva-health-check.timer

# Ver próxima execução agendada
sudo systemctl status saraiva-health-check.timer

# Forçar execução imediata
sudo systemctl start saraiva-health-check.service
```

### Permissões negadas
```bash
# Garantir permissões corretas
sudo chown root:root /home/saraiva-vision-site/scripts/monitoring/daily-health-check.sh
sudo chmod 755 /home/saraiva-vision-site/scripts/monitoring/daily-health-check.sh

# Verificar acesso aos logs
sudo ls -la /var/log/nginx/
sudo ls -la /var/log/saraiva-monitoring/
```

### Agentes travando (timeout)
```bash
# Aumentar timeout no script
# Editar linha: readonly AGENT_TIMEOUT=60
# Alterar para: readonly AGENT_TIMEOUT=120
```

### Relatórios ocupando muito espaço
```bash
# Ajustar retenção de dias
# Editar linha: readonly RETENTION_DAYS=30
# Alterar para: readonly RETENTION_DAYS=7

# Limpar manualmente
sudo find /var/log/saraiva-monitoring/reports/ -type f -mtime +7 -delete
```

---

## 📧 Notificações por Email (Opcional)

Para receber emails em caso de falhas:

### 1. Instalar mailutils
```bash
sudo apt install -y mailutils
```

### 2. Configurar notificação no systemd
Criar arquivo `/etc/systemd/system/saraiva-health-check-notify@.service`:

```ini
[Unit]
Description=Saraiva Health Check Failure Notification

[Service]
Type=oneshot
ExecStart=/bin/bash -c 'echo "Health check failed. Check logs: journalctl -u saraiva-health-check.service" | mail -s "Saraiva Vision Health Check Failed" admin@saraivavision.com.br'
```

### 3. Modificar service principal
Adicionar ao `saraiva-health-check.service`:
```ini
[Unit]
OnFailure=saraiva-health-check-notify@%n.service
```

---

## 🔍 Monitoramento de Performance

### Ver uso de recursos do script
```bash
# Durante execução
ps aux | grep daily-health-check

# Tempo de execução histórico
sudo journalctl -u saraiva-health-check.service | grep "concluído"
```

### Verificar tamanho dos logs
```bash
du -sh /var/log/saraiva-monitoring/
```

---

## 🆘 Desinstalação

```bash
# Parar e desabilitar timer
sudo systemctl stop saraiva-health-check.timer
sudo systemctl disable saraiva-health-check.timer

# Remover arquivos do systemd
sudo rm /etc/systemd/system/saraiva-health-check.{service,timer}
sudo systemctl daemon-reload

# Remover logs (CUIDADO!)
sudo rm -rf /var/log/saraiva-monitoring/

# Remover script
rm /home/saraiva-vision-site/scripts/monitoring/daily-health-check.sh
```

---

## 📝 Customização

### Alterar horário de execução
Editar `/etc/systemd/system/saraiva-health-check.timer`:
```ini
# Executar às 02:00
OnCalendar=*-*-* 02:00:00

# Executar a cada 6 horas
OnCalendar=*-*-* 00,06,12,18:00:00
```

Depois:
```bash
sudo systemctl daemon-reload
sudo systemctl restart saraiva-health-check.timer
```

### Adicionar mais agentes
Editar `/home/saraiva-vision-site/scripts/monitoring/daily-health-check.sh`:

```bash
# Nova função agente
agent_custom_monitor() {
    local output_file="${TEMP_DIR}/custom_${TIMESTAMP}.txt"
    # Seu código aqui
}

# Adicionar à execução paralela
run_with_timeout ${AGENT_TIMEOUT} agent_custom_monitor &
local pid5=$!

# Adicionar ao wait
wait ${pid5} || { log_error "Agente Custom falhou"; ((failed++)); }
```

---

**Suporte**: Para problemas, verificar logs em `/var/log/saraiva-monitoring/` e `journalctl`
