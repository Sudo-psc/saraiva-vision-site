# ✅ SANITY STUDIO - SETUP COMPLETO

**Data**: 2025-10-29 12:15 UTC  
**Status**: ⚠️ Configurado e funcionando localmente - Aguardando DNS

---

## ✅ O QUE FOI FEITO

### 1. Configuração Corrigida
- ✅ `sanity.config.js` atualizado com `basePath: '/'`
- ✅ Build limpo e regenerado (6.8MB)
- ✅ Schemas configurados corretamente

### 2. Nginx Virtual Host Criado
- ✅ Arquivo: `/etc/nginx/sites-available/sanity-studio`
- ✅ Habilitado em: `/etc/nginx/sites-enabled/`
- ✅ Nginx testado e recarregado
- ✅ HTML do Sanity Studio sendo servido

### 3. Estrutura de Arquivos
```
/home/saraiva-vision-site/sanity/
├── dist/                     ← Build pronto (6.8MB)
├── sanity.config.js          ← Configuração corrigida
├── SOLUTION.md               ← Guia de soluções
├── SANITY_DEBUG_REPORT.md    ← Debug report
└── SETUP_COMPLETE.md         ← Este arquivo
```

---

## 📋 STATUS ATUAL

### ✅ Funcionando
- **Build**: OK (6.8MB)
- **Nginx**: Configurado e servindo arquivos
- **Teste local**: OK (HTML do studio carregando)

### ⚠️ Aguardando
- **DNS**: Precisa configurar `studio.saraivavision.com.br` → `31.97.129.78`
- **SSL**: Será instalado após DNS propagar

---

## 🌐 PRÓXIMO PASSO: CONFIGURAR DNS

### No seu provedor de DNS (Cloudflare, etc):

**Adicionar registro A:**
```
Tipo: A
Nome: studio
Conteúdo/Valor: 31.97.129.78
TTL: Auto (ou 1 hora)
Proxy: Desligado (DNS only)
```

**Após salvar:**
- Aguarde 5-30 minutos (propagação)
- Verifique: `nslookup studio.saraivavision.com.br`

---

## 🔐 INSTALAR SSL (APÓS DNS PROPAGAR)

```bash
# 1. Verificar que DNS propagou
nslookup studio.saraivavision.com.br

# 2. Instalar certificado
sudo certbot --nginx -d studio.saraivavision.com.br

# 3. Certbot vai:
#    - Detectar o virtual host
#    - Gerar certificado Let's Encrypt
#    - Configurar HTTPS automaticamente
#    - Configurar redirect HTTP → HTTPS

# 4. Testar
curl -I https://studio.saraivavision.com.br
```

---

## 🎯 ACESSAR O STUDIO

### Após DNS + SSL:

**URL**: `https://studio.saraivavision.com.br`

**Login**: Usar sua conta Sanity (Google/GitHub/Email)

**Pronto para:**
- ✅ Criar posts
- ✅ Upload de imagens
- ✅ Gerenciar conteúdo

---

## 🔧 COMANDOS ÚTEIS

### Rebuild Studio
```bash
cd /home/saraiva-vision-site/sanity
npm run build
# Nginx serve automaticamente de /dist
```

### Ver Logs
```bash
# Nginx access log
tail -f /var/log/nginx/sanity-studio-access.log

# Nginx error log
tail -f /var/log/nginx/sanity-studio-error.log
```

### Testar Localmente (sem DNS)
```bash
curl -H "Host: studio.saraivavision.com.br" http://localhost
```

### Verificar Nginx
```bash
nginx -t
systemctl status nginx
systemctl reload nginx
```

---

## 📊 COMPARAÇÃO: Sanity Hosting vs Self-Hosting

### Sanity Hosting (saraivavision.sanity.studio)
- ❌ Deploy com bug de hostname duplicado
- ❌ HTTP 404 persistente
- ❌ Requer terminal interativo
- ✅ Grátis
- ✅ Gerenciado pelo Sanity

### Self-Hosting (studio.saraivavision.com.br)
- ✅ Funciona imediatamente
- ✅ Controle total
- ✅ Melhor performance (servidor próprio)
- ✅ Customizável
- ⚠️ Você gerencia updates
- ⚠️ Requer DNS configurado

**Escolhido**: Self-Hosting (mais confiável e sem bugs)

---

## 🔍 TROUBLESHOOTING

### Studio não carrega após DNS propagar

**Verificar:**
```bash
# 1. DNS resolveu?
nslookup studio.saraivavision.com.br

# 2. Nginx está servindo?
curl -I http://studio.saraivavision.com.br

# 3. Arquivos existem?
ls -lh /home/saraiva-vision-site/sanity/dist/

# 4. Permissões OK?
sudo chmod -R 755 /home/saraiva-vision-site/sanity/dist
```

### Erro CORS ao usar o studio

**Solução**: Adicionar origins no Sanity Dashboard

```
https://www.sanity.io/manage/project/92ocrdmp/api/cors
```

**Adicionar:**
- `https://studio.saraivavision.com.br`
- `https://saraivavision.com.br`
- `https://www.saraivavision.com.br`

---

## 📞 RESUMO

**Status Atual**: ✅ Configurado e testado localmente

**Aguardando**: Você configurar DNS para `studio.saraivavision.com.br`

**Após DNS**: Instalar SSL com `certbot --nginx -d studio.saraivavision.com.br`

**Tempo total**: 10-15 minutos + propagação DNS

---

## 🎉 PRÓXIMOS PASSOS

1. ✅ Configure DNS (registro A: studio → 31.97.129.78)
2. ⏳ Aguarde propagação (5-30 minutos)
3. ✅ Instale SSL (certbot)
4. ✅ Acesse https://studio.saraivavision.com.br
5. ✅ Faça login e comece a criar posts!

