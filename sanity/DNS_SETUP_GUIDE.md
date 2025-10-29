# 🌐 GUIA: CONFIGURAR DNS PARA SANITY STUDIO

## ❌ Status Atual

O subdomínio `studio.saraivavision.com.br` **NÃO** está configurado no DNS.

**Verificação:**
```bash
$ dig +short studio.saraivavision.com.br
(vazio - não retorna IP)
```

**Domínios já configurados:**
- ✅ `saraivavision.com.br` → `31.97.129.78`
- ✅ `www.saraivavision.com.br` → `31.97.129.78`
- ❌ `studio.saraivavision.com.br` → Não configurado

---

## 📋 PASSO A PASSO: CONFIGURAR DNS

### Opção 1: Se usa Cloudflare

1. **Acesse**: https://dash.cloudflare.com
2. **Selecione**: `saraivavision.com.br`
3. **Menu**: DNS → Records
4. **Clique**: "Add record"
5. **Preencha**:
   ```
   Type: A
   Name: studio
   IPv4 address: 31.97.129.78
   Proxy status: DNS only (nuvem CINZA)
   TTL: Auto
   ```
6. **Salve**

**⚠️ IMPORTANTE**: Deixe Proxy DESLIGADO (nuvem cinza) senão SSL não funciona!

---

### Opção 2: Se usa Registro.br

1. **Acesse**: https://registro.br
2. **Login** com sua conta
3. **Meus Domínios** → `saraivavision.com.br`
4. **DNS** → Editar Zona
5. **Adicionar Registro**:
   ```
   Tipo: A
   Nome: studio
   Dados: 31.97.129.78
   TTL: 3600 (1 hora)
   ```
6. **Salvar**

---

### Opção 3: Outro Provedor DNS

**Conceito geral** (funciona em qualquer provedor):

```
Adicionar registro tipo A:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Campo          | Valor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tipo           | A
Host/Nome      | studio
Aponta para    | 31.97.129.78
TTL            | 3600 ou Auto
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ⏱️ TEMPO DE PROPAGAÇÃO

**Após salvar:**
- Mínimo: 5 minutos
- Típico: 10-30 minutos  
- Máximo: 24 horas (raro)

**Depende:**
- TTL configurado
- Cache do DNS
- Provedor de internet

---

## 🔍 VERIFICAR SE DNS PROPAGOU

### Método 1: Via Comando (Linux/Mac)
```bash
dig +short studio.saraivavision.com.br

# Deve retornar:
# 31.97.129.78
```

### Método 2: Via nslookup
```bash
nslookup studio.saraivavision.com.br

# Deve retornar:
# Name: studio.saraivavision.com.br
# Address: 31.97.129.78
```

### Método 3: Via Browser (Online)
- https://dnschecker.org
- Digite: `studio.saraivavision.com.br`
- Tipo: A
- Clique: "Search"
- Veja propagação global

### Método 4: Via Google DNS
```bash
dig +short studio.saraivavision.com.br @8.8.8.8

# Deve retornar:
# 31.97.129.78
```

---

## ✅ APÓS DNS PROPAGAR

### 1. Verificar que DNS funciona
```bash
# Método rápido
curl -I http://studio.saraivavision.com.br

# Deve retornar HTML do Sanity Studio (não 404)
```

### 2. Instalar SSL
```bash
sudo certbot --nginx -d studio.saraivavision.com.br
```

**Certbot vai:**
1. ✅ Detectar virtual host do nginx
2. ✅ Validar domínio (via HTTP)
3. ✅ Gerar certificado Let's Encrypt
4. ✅ Configurar HTTPS
5. ✅ Configurar redirect HTTP → HTTPS
6. ✅ Renovação automática

### 3. Acessar Studio
```
https://studio.saraivavision.com.br
```

**Faça login** com sua conta Sanity e comece a usar!

---

## 🐛 TROUBLESHOOTING

### DNS não propaga

**Verificar:**
```bash
# Ver TTL atual
dig studio.saraivavision.com.br

# Limpar cache DNS local (Linux)
sudo systemd-resolve --flush-caches

# Limpar cache DNS local (Mac)
sudo dscacheutil -flushcache
```

**Aguardar mais tempo** (até 24h)

---

### Certbot falha com "DNS not found"

**Causa**: DNS ainda não propagou

**Solução**: Aguarde mais 10-20 minutos e tente novamente

---

### Certbot falha com "Connection refused"

**Causa**: Nginx não está acessível na porta 80

**Verificar:**
```bash
# Nginx rodando?
systemctl status nginx

# Porta 80 aberta?
ss -tlnp | grep :80

# Firewall liberado?
sudo ufw status | grep 80
```

---

## 📞 CHECKLIST COMPLETO

```
CONFIGURAÇÃO DNS:
[ ] 1. Acessar painel DNS
[ ] 2. Adicionar registro A (studio → 31.97.129.78)
[ ] 3. Salvar configuração
[ ] 4. Aguardar 5-30 minutos

VERIFICAÇÃO:
[ ] 5. Testar: dig +short studio.saraivavision.com.br
[ ] 6. Confirmar retorno: 31.97.129.78
[ ] 7. Testar HTTP: curl -I http://studio.saraivavision.com.br

INSTALAÇÃO SSL:
[ ] 8. Executar: sudo certbot --nginx -d studio.saraivavision.com.br
[ ] 9. Confirmar sucesso
[ ] 10. Testar HTTPS: curl -I https://studio.saraivavision.com.br

ACESSO:
[ ] 11. Abrir browser: https://studio.saraivavision.com.br
[ ] 12. Fazer login
[ ] 13. Criar seu primeiro post!
```

---

## 🎯 RESUMO

**Você precisa fazer:**
1. ✅ Adicionar registro DNS (A: studio → 31.97.129.78)
2. ⏳ Aguardar propagação (5-30 min)
3. ✅ Me avisar quando DNS propagar

**Eu posso fazer depois que DNS propagar:**
1. ✅ Instalar SSL via certbot
2. ✅ Verificar HTTPS funcionando
3. ✅ Confirmar studio acessível

---

**Tempo total**: 10 minutos de trabalho + 5-30 min de propagação DNS

