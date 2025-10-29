# Configuração de Alertas por Email no Monit

## Status Atual
- ✅ Alertas configurados para: **sudo311008@gmail.com**
- ⚠️ Servidor SMTP não configurado (localhost:25 não disponível)
- ✅ Alertas estão na fila em: `/var/lib/monit/events/`

## Opção 1: Usar Gmail SMTP (Recomendado)

### 1.1 Instalar Postfix como relay
```bash
apt install postfix mailutils libsasl2-modules -y
```

Durante instalação, escolher: **"Satellite system"**

### 1.2 Configurar Postfix para Gmail
Editar `/etc/postfix/main.cf`:
```
relayhost = [smtp.gmail.com]:587
smtp_use_tls = yes
smtp_sasl_auth_enable = yes
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
smtp_sasl_security_options = noanonymous
smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt
```

### 1.3 Criar arquivo de credenciais
```bash
echo "[smtp.gmail.com]:587 seu-email@gmail.com:sua-senha-de-app" > /etc/postfix/sasl_passwd
chmod 600 /etc/postfix/sasl_passwd
postmap /etc/postfix/sasl_passwd
```

**IMPORTANTE**: Use uma "Senha de App" do Google, não sua senha normal!
Criar em: https://myaccount.google.com/apppasswords

### 1.4 Reiniciar Postfix
```bash
systemctl restart postfix
```

### 1.5 Testar envio
```bash
echo "Teste de email do Monit" | mail -s "Teste Monit" sudo311008@gmail.com
```

---

## Opção 2: Usar SMTP Externo (SendGrid, Mailgun, etc)

Editar `/etc/monit/monitrc` linha do mailserver:
```
set mailserver smtp.sendgrid.net port 587
    username "apikey"
    password "SUA_API_KEY_AQUI"
    using tls
```

Depois: `monit reload`

---

## Opção 3: Desabilitar Alertas por Email (usar só Dashboard)

Comentar linha de email em `/etc/monit/monitrc`:
```
# set alert sudo311008@gmail.com NOT ON { instance, action }
```

Depois: `monit reload`

---

## Verificar Fila de Alertas Pendentes

```bash
ls -lh /var/lib/monit/events/
cat /var/lib/monit/events/*
```

## Limpar Fila de Alertas

```bash
rm -f /var/lib/monit/events/*
```

