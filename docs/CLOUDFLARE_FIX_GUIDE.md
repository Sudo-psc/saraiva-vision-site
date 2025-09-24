# Guia de Correção - Cloudflare Redirect Loop

## 🚨 Problema Identificado
Loop de redirecionamento infinito em `www.saraivavision.com.br`

## 🔧 Solução no Cloudflare

### Passo 1: Acessar Dashboard
1. Faça login no [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Selecione o domínio `saraivavision.com.br`

### Passo 2: Verificar Page Rules
1. Vá em **Rules** → **Page Rules**
2. Procure por regras que afetam `www.saraivavision.com.br`
3. **DELETE** qualquer regra que cause loop

### Passo 3: Criar Regra Correta
Crie uma nova Page Rule:

```
URL Pattern: www.saraivavision.com.br/*
Settings:
  - Forwarding URL: 301 - Permanent Redirect
  - Destination URL: https://saraivavision.com.br/$1
```

### Passo 4: Verificar Redirect Rules (Novo Sistema)
1. Vá em **Rules** → **Redirect Rules**
2. Procure regras para `www.saraivavision.com.br`
3. Configure:
   - **When incoming requests match**: Custom filter expression
   - **Field**: Hostname
   - **Operator**: equals
   - **Value**: `www.saraivavision.com.br`
   - **Then**: Dynamic redirect
   - **Expression**: `concat("https://saraivavision.com.br", http.request.uri.path)`
   - **Status code**: 301

### Passo 5: Limpar Cache
1. Vá em **Caching** → **Configuration**
2. Clique em **Purge Everything**
3. Confirme a limpeza

### Passo 6: Verificar SSL/TLS
1. Vá em **SSL/TLS** → **Overview**
2. Configure para **Full (strict)**
3. Em **Edge Certificates**, ative **Always Use HTTPS**

## 🧪 Teste Após Configuração

Execute no terminal:
```bash
curl -I https://www.saraivavision.com.br
```

Resultado esperado:
```
HTTP/2 301
location: https://saraivavision.com.br/
```

## ⚡ Solução Alternativa (Se não tiver acesso ao Cloudflare)

### Remover Cloudflare Temporariamente
1. No seu provedor de DNS, altere os nameservers
2. Aponte diretamente para o Vercel:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Ou Configurar DNS Bypass
1. Mantenha Cloudflare apenas para o domínio principal
2. Configure `www` para apontar diretamente ao Vercel
3. No Cloudflare, desative o proxy (nuvem cinza) para `www`

## 📞 Contato para Suporte
Se precisar de ajuda com a configuração do Cloudflare, entre em contato com o suporte técnico do provedor de hospedagem ou DNS.