# 📊 Saraiva Vision VPS Monitoring System

Sistema de monitoramento automatizado com 4 agentes paralelos que executam verificações diárias no VPS.

## 🎯 Funcionalidades

- **Execução Paralela**: 4 agentes rodando simultaneamente com timeout de 60s
- **Monitoramento Nginx**: Status, CPU, memória, conexões ativas
- **Análise de Logs**: Erros críticos, warnings, logs Nginx das últimas 24h
- **Status Node.js**: Processos, recursos, health checks
- **Tracking Git**: Commits recentes, mudanças, sincronização com remote
- **Relatórios Markdown**: Gerados diariamente em `/var/log/saraiva-monitoring/`
- **Rotação Automática**: Mantém últimos 30 dias de histórico

## 📦 Instalação

```bash
# 1. Instalar dependências e configurar timer
sudo ./scripts/monitoring/install-monitor.sh

# 2. Verificar instalação
sudo systemctl status saraiva-monitor.timer

# 3. Executar teste manual
sudo ./scripts/monitoring/vps-monitor.sh
```

## ⚙️ Configuração

### Alterar Horário de Execução

Edite `/etc/systemd/system/saraiva-monitor.timer`:

```ini
[Timer]
OnCalendar=*-*-* 18:00:00  # Executar às 18:00
```

Depois recarregue:
```bash
sudo systemctl daemon-reload
sudo systemctl restart saraiva-monitor.timer
```

### Ajustar Timeout dos Agentes

Edite `vps-monitor.sh` e altere:
```bash
readonly TIMEOUT=120  # 120 segundos
```

### Mudar Caminho do Repositório Git

Edite `vps-monitor.sh`:
```bash
readonly GIT_REPO_PATH="/seu/novo/caminho"
```

## 📋 Visualizar Relatórios

```bash
# Listar relatórios
ls -lh /var/log/saraiva-monitoring/

# Ver relatório mais recente
cat /var/log/saraiva-monitoring/report_*.md | tail -n 100

# Abrir último relatório com formatação
less /var/log/saraiva-monitoring/$(ls -t /var/log/saraiva-monitoring/ | head -1)
```

## 🔍 Troubleshooting

### Verificar se timer está ativo
```bash
sudo systemctl status saraiva-monitor.timer
sudo systemctl list-timers saraiva-monitor.timer
```

### Ver logs de execução
```bash
sudo journalctl -u saraiva-monitor.service -n 50 --no-pager
```

### Executar manualmente com debug
```bash
sudo bash -x /home/saraiva-vision-site/scripts/monitoring/vps-monitor.sh
```

### Timer não executa
```bash
# Reiniciar timer
sudo systemctl restart saraiva-monitor.timer

# Verificar sintaxe do timer
systemd-analyze verify /etc/systemd/system/saraiva-monitor.timer
```

### Agente específico falha (timeout)
```bash
# Aumentar timeout no vps-monitor.sh
readonly TIMEOUT=180

# Ou executar agente isoladamente para debug
source /home/saraiva-vision-site/scripts/monitoring/vps-monitor.sh
agent_nginx  # Substituir pelo agente com problema
```

### Permissões negadas
```bash
# Verificar permissões do diretório
sudo chown -R root:root /var/log/saraiva-monitoring
sudo chmod 755 /var/log/saraiva-monitoring

# Verificar se script é executável
sudo chmod +x /home/saraiva-vision-site/scripts/monitoring/vps-monitor.sh
```

## 📊 Exemplo de Relatório

```markdown
# 📊 SARAIVA VISION - VPS MONITORING REPORT

**Generated**: 2025-10-05 06:00:15 UTC
**Hostname**: saraiva-vps-prod
**Uptime**: up 15 days, 3 hours, 42 minutes

---

## 🌐 NGINX STATUS

✅ **Status**: Running
📊 **Memory Usage**: 45.23 MB
⚡ **CPU Usage**: 2.50%
🔗 **Active Connections**: 18
⏱️  **Response Time**: 0.045s

## 📋 SYSTEM LOGS (Last 24h)

### Error Summary
- 🔴 **Critical**: 0
- 🟠 **Errors**: 3
- 🟡 **Warnings**: 12

### Nginx Errors
- **Total Errors**: 2
- **Recent Errors** (last 5):
```
2025/10/05 05:23:11 [error] 1234#1234: connection timed out
```

## 🟢 NODE.JS STATUS

✅ **PM2 Status**: Running
📊 **Memory Usage**: 128.45 MB
⚡ **CPU Usage**: 5.20%
⏰ **Uptime**: 15-03:42:18
✅ **Health Check**: PASS

## 🔄 GIT REPOSITORY STATUS

🌿 **Current Branch**: main
✅ **Remote Sync**: Success

### Recent Commits (Last 24h)
- a1b2c3d | João Silva | 2 hours ago | Fix: Corrige validação de formulário
- d4e5f6g | Maria Santos | 5 hours ago | Feature: Adiciona filtro de busca

### Repository Status
✅ **Working Tree**: Clean

---

## 🎯 OVERALL STATUS: ✅ OK

_Report saved to: /var/log/saraiva-monitoring/report_20251005_060015.md_
```

## 🔐 Segurança

- Script executa com permissões root (necessário para acessar logs do sistema)
- Não armazena credenciais
- Não modifica arquivos do sistema (somente leitura)
- Relatórios têm permissão 644 (legível por todos, editável apenas por root)

## 🚀 Próximos Passos (Opcional)

### Adicionar Notificações por Email
```bash
# Instalar mailutils
sudo apt-get install -y mailutils

# Adicionar ao final do main() em vps-monitor.sh
if grep -q "CRITICAL" "${REPORT_FILE}"; then
    mail -s "🚨 CRITICAL: VPS Monitor Alert" admin@saraivavision.com < "${REPORT_FILE}"
fi
```

### Integração com Discord/Slack
```bash
# Adicionar webhook ao vps-monitor.sh
WEBHOOK_URL="https://discord.com/api/webhooks/YOUR_WEBHOOK"

send_alert() {
    curl -H "Content-Type: application/json" \
         -d "{\"content\":\"⚠️ VPS Alert: $1\"}" \
         "$WEBHOOK_URL"
}
```

### Dashboard Web
Use ferramentas como Grafana + Prometheus ou simplesmente sirva os relatórios Markdown via Nginx:
```nginx
location /monitoring {
    alias /var/log/saraiva-monitoring;
    autoindex on;
    auth_basic "Monitoring Reports";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

## 📚 Referências

- [GNU Parallel Documentation](https://www.gnu.org/software/parallel/)
- [Systemd Timers](https://www.freedesktop.org/software/systemd/man/systemd.timer.html)
- [Nginx Monitoring Best Practices](https://nginx.org/en/docs/)
