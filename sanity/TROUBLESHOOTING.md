# Sanity Studio - Troubleshooting Guide

**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-28
**Versão**: 1.0.0

---

## 🚨 Problema: "Unable to load studio - X-Frame-Options: SAMEORIGIN"

### Sintomas
- Erro ao acessar `https://saraivavision.sanity.studio`
- Mensagem: "Failed to load iframe due to X-Frame-Options: SAMEORIGIN"
- Dashboard do Sanity não consegue carregar o Studio

### Causa Raiz
O Sanity Studio **não foi deployado** para o subdomínio `saraivavision.sanity.studio`.

### Verificação
```bash
curl -I https://saraivavision.sanity.studio
```

**Resultado esperado** (quando não deployado):
```
HTTP/2 404
```

**Resultado esperado** (quando deployado):
```
HTTP/2 200
```

---

## ✅ Solução: Deploy do Sanity Studio

### Pré-requisitos
1. ✅ Configuração do Sanity já existe em `/home/saraiva-vision-site/sanity/`
2. ✅ Project ID: `92ocrdmp`
3. ✅ Dataset: `production`
4. ✅ 25 posts já migrados para Sanity

### Passo a Passo

#### 1. Autenticação no Sanity CLI

```bash
cd /home/saraiva-vision-site/sanity
npx sanity login
```

**Opções de autenticação**:
- **Google** (recomendado se você usa Gmail)
- **GitHub**
- **E-mail/Password**

**Importante**:
- O login é interativo e abrirá seu navegador
- Use a mesma conta que tem acesso ao projeto `92ocrdmp`
- Após o login, o CLI armazenará o token em `~/.sanity/config.json`

#### 2. Deploy do Studio

```bash
npm run deploy
```

**O que acontece**:
1. Sanity CLI faz build do studio (`sanity build`)
2. Faz upload do build para Sanity hosting
3. Configura o subdomínio `saraivavision.sanity.studio`
4. Retorna a URL final

**Tempo estimado**: 1-2 minutos

#### 3. Verificação

```bash
# Verificar deploy bem-sucedido
curl -I https://saraivavision.sanity.studio

# Deve retornar HTTP/2 200
```

**Acesse no navegador**:
```
https://saraivavision.sanity.studio
```

---

## 🔧 Problemas Comuns

### Problema: "Error: sanity.cli.js does not contain a project identifier"

**Causa**: Incompatibilidade de configuração ES modules

**Solução**:
```bash
# O arquivo sanity.config.js já contém a configuração correta
# Ignore o arquivo sanity.cli.cjs (não é mais necessário em Sanity v4)
```

### Problema: "No authentication providers found"

**Causa**: Tentativa de login com flag `--sso` incorreta

**Solução**:
```bash
# Use login sem flags
npx sanity login

# NÃO use:
# npx sanity login --sso  ❌
```

### Problema: Login abre navegador mas falha

**Causa**: Firewall ou bloqueio de rede

**Solução**:
1. Certifique-se de que pode acessar `https://www.sanity.io`
2. Verifique se não há bloqueio de VPN/Firewall
3. Tente em um navegador diferente

### Problema: "Error: Invalid token"

**Causa**: Token expirado ou inválido em `~/.sanity/config.json`

**Solução**:
```bash
# Remover token antigo
rm -rf ~/.sanity

# Fazer login novamente
npx sanity login
```

---

## 📝 Comandos Úteis

### Verificar Status do Studio

```bash
# Verificar se Studio está deployado
curl -I https://saraivavision.sanity.studio

# Verificar logs de deploy
npx sanity deploy --verbose
```

### Testar Studio Localmente

```bash
# Iniciar Studio em desenvolvimento
npm run dev

# Acessa em: http://localhost:3333
```

### Rebuild e Redeploy

```bash
# Build local
npm run build

# Deploy do build
npm run deploy

# Ou em um comando
npm run build && npm run deploy
```

### Undeploy do Studio

```bash
# Remover deploy (use com cuidado!)
npx sanity undeploy
```

---

## 🌐 Nginx e X-Frame-Options

### Por que X-Frame-Options não afeta o Sanity Studio?

O Nginx em `/etc/nginx/sites-enabled/saraivavision` tem:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
```

**Mas isso NÃO afeta o Sanity Studio porque**:

1. ✅ Sanity Studio é hospedado em `saraivavision.sanity.studio` (pela Sanity.io)
2. ✅ Não está no VPS `31.97.129.78`
3. ✅ Não passa pelo Nginx do `saraivavision.com.br`
4. ✅ Tem seu próprio domínio e infraestrutura

**O header X-Frame-Options do Nginx** só afeta:
- Páginas servidas do `saraivavision.com.br`
- APIs em `saraivavision.com.br/api/*`
- Arquivos estáticos em `/var/www/saraivavision/current/`

**Não afeta**:
- ❌ Sanity Studio (`saraivavision.sanity.studio`)
- ❌ Sanity API (`92ocrdmp.api.sanity.io`)
- ❌ Sanity CDN (`cdn.sanity.io`)

---

## 🔍 Diagnóstico Completo

### Script de Diagnóstico

Salve e execute este script para diagnóstico completo:

```bash
#!/bin/bash
echo "=== Sanity Studio Diagnostic ==="
echo ""

echo "1. Verificando Studio deployado:"
curl -I https://saraivavision.sanity.studio 2>&1 | grep HTTP

echo ""
echo "2. Verificando autenticação local:"
ls -la ~/.sanity/config.json 2>/dev/null || echo "❌ Não autenticado"

echo ""
echo "3. Verificando configuração:"
cat /home/saraiva-vision-site/sanity/sanity.config.js | grep -E "projectId|dataset"

echo ""
echo "4. Verificando build local:"
ls -la /home/saraiva-vision-site/sanity/dist/ 2>/dev/null || echo "❌ Build não encontrado"

echo ""
echo "5. Testando acesso à API Sanity:"
curl -s "https://92ocrdmp.api.sanity.io/v2021-10-21/data/query/production?query=*%5B_type%20%3D%3D%20%22blogPost%22%5D%5B0%5D" | jq -r '.result._id' 2>/dev/null || echo "❌ API não acessível"

echo ""
echo "=== Fim do diagnóstico ==="
```

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [Sanity Deploy Guide](https://www.sanity.io/docs/deployment)
- [Sanity CLI Reference](https://www.sanity.io/docs/cli)
- [Troubleshooting Guide](https://www.sanity.io/docs/troubleshooting)

### Links Úteis
- **Sanity Management**: https://sanity.io/manage/project/92ocrdmp
- **API Dashboard**: https://sanity.io/manage/project/92ocrdmp/api
- **Deployed Studio**: https://saraivavision.sanity.studio (após deploy)
- **Local Studio**: http://localhost:3333 (com `npm run dev`)

### Suporte
- **Sanity Discord**: https://slack.sanity.io
- **Stack Overflow**: Tag `sanity`
- **GitHub Issues**: https://github.com/sanity-io/sanity

---

## 🎯 Checklist Pós-Deploy

Após fazer deploy com sucesso:

- [ ] ✅ Acessar `https://saraivavision.sanity.studio`
- [ ] ✅ Fazer login no Studio
- [ ] ✅ Verificar que os 25 posts aparecem
- [ ] ✅ Testar criar um novo post
- [ ] ✅ Testar upload de imagem
- [ ] ✅ Verificar que o frontend consome os dados via API
- [ ] ✅ Testar fallback estático (desligar Sanity temporariamente)

---

**Última atualização**: 2025-10-28
**Próxima revisão**: Após primeiro deploy bem-sucedido
