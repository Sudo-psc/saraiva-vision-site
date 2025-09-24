# Configuração de Domínio no Vercel - Saraiva Vision

## Problema Atual
Erro SSL: `net::ERR_CERT_COMMON_NAME_INVALID` em `www.saraivavision.com.br`

## Solução Passo a Passo

### 1. Adicionar Domínio no Vercel

1. Acesse o [Dashboard do Vercel](https://vercel.com/dashboard)
2. Vá para o projeto `saraiva-vision-site`
3. Clique em **Settings** > **Domains**
4. Adicione os seguintes domínios:
   - `saraivavision.com.br` (domínio principal)
   - `www.saraivavision.com.br` (subdomínio www)

### 2. Configurar DNS

No seu provedor de DNS (onde o domínio foi registrado), configure:

#### Registros A (para domínio raiz)
```
Type: A
Name: @
Value: 76.76.19.61
TTL: 3600
```

#### Registros CNAME (para www)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

#### Alternativamente, use apenas CNAME para ambos:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 3. Verificar Configuração

Após configurar o DNS, aguarde a propagação (pode levar até 48h) e verifique:

```bash
# Verificar DNS
nslookup saraivavision.com.br
nslookup www.saraivavision.com.br

# Verificar SSL
curl -I https://saraivavision.com.br
curl -I https://www.saraivavision.com.br
```

### 4. Configurar Redirecionamento

No Vercel, configure para redirecionar `www` para o domínio principal:

1. Em **Settings** > **Domains**
2. Para `www.saraivavision.com.br`, clique em **Edit**
3. Selecione **Redirect to saraivavision.com.br**

### 5. Aguardar Certificado SSL

O Vercel gerará automaticamente certificados SSL Let's Encrypt para:
- `saraivavision.com.br`
- `www.saraivavision.com.br`

Isso pode levar alguns minutos após a configuração do DNS.

## Verificação Final

Teste os seguintes URLs:
- ✅ `https://saraivavision.com.br`
- ✅ `https://www.saraivavision.com.br` (deve redirecionar)
- ✅ `http://saraivavision.com.br` (deve redirecionar para HTTPS)
- ✅ `http://www.saraivavision.com.br` (deve redirecionar para HTTPS)

## Troubleshooting

### DNS não propagou
```bash
# Verificar propagação global
dig @8.8.8.8 saraivavision.com.br
dig @1.1.1.1 www.saraivavision.com.br
```

### Certificado não gerou
1. Verifique se o DNS está correto
2. Remova e adicione o domínio novamente no Vercel
3. Aguarde até 24h para geração automática

### Erro de redirecionamento
1. Limpe cache do navegador
2. Teste em modo incógnito
3. Verifique configuração de redirecionamento no Vercel

## Configuração Recomendada

```
Domínio Principal: saraivavision.com.br
Redirecionamento: www.saraivavision.com.br → saraivavision.com.br
SSL: Automático (Let's Encrypt)
HTTPS: Forçado
```