# 🔧 SOLUÇÃO: Failed to Fetch Iframe URL

## ❌ Problema

```
Unable to load studio
Failed to fetch iframe URL
```

Este erro ocorre porque:
1. O Sanity Dashboard tenta carregar o studio via iframe
2. O studio NÃO está hospedado/deployado corretamente
3. A URL `https://saraivavision.sanity.studio` retorna 404

---

## ✅ SOLUÇÕES (3 Opções)

### 🎯 OPÇÃO 1: Usar Sanity Deploy (Hosting Gratuito)

**Mais simples e recomendado pelo Sanity:**

```bash
cd /home/saraiva-vision-site/sanity

# 1. Fazer build
npm run build

# 2. Deploy via CLI (requer terminal interativo)
npx sanity deploy
```

**No prompt interativo:**
- Hostname: Digite `saraivavision` (sem .sanity.studio)
- Confirme

**Verificar:**
```bash
curl -I https://saraivavision.sanity.studio
# Deve retornar HTTP/2 200
```

**Problema**: Comando requer interação (não funciona em SSH não-interativo)

---

### 🚀 OPÇÃO 2: Self-Hosting via Nginx (Recomendado para VPS)

**Hospedar o studio no próprio servidor:**

#### 2.1 Criar Virtual Host no Nginx

```bash
sudo nano /etc/nginx/sites-available/sanity-studio
```

**Conteúdo:**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name studio.saraivavision.com.br;

    root /home/saraiva-vision-site/sanity/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### 2.2 Habilitar Site

```bash
sudo ln -s /etc/nginx/sites-available/sanity-studio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 2.3 Configurar DNS

No seu provedor de DNS (Cloudflare, etc):
```
Tipo: A
Nome: studio
Valor: 31.97.129.78
TTL: Auto
```

#### 2.4 Adicionar SSL (Certbot)

```bash
sudo certbot --nginx -d studio.saraivavision.com.br
```

#### 2.5 Atualizar sanity.config.js

```javascript
export default defineConfig({
  name: 'default',
  title: 'Saraiva Vision Blog',
  projectId: '92ocrdmp',
  dataset: 'production',
  basePath: '/',
  
  // Adicionar URL do studio
  studio: {
    basePath: '/'
  },

  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
```

#### 2.6 Rebuild e Deploy

```bash
cd /home/saraiva-vision-site/sanity
npm run build
# Nginx já serve os arquivos de /dist
```

**Acesse**: `https://studio.saraivavision.com.br`

---

### 💻 OPÇÃO 3: Rodar Studio Localmente (Dev Only)

**Para desenvolvimento local:**

```bash
cd /home/saraiva-vision-site/sanity
npm run dev

# Acesse: http://localhost:3333
```

**Limitações:**
- ❌ Não acessível publicamente
- ❌ Requer servidor rodando
- ✅ Bom para desenvolvimento/testes

---

## 🎯 RECOMENDAÇÃO

**Use OPÇÃO 2 (Self-Hosting via Nginx)**

**Vantagens:**
- ✅ Controle total
- ✅ Não depende de Sanity hosting
- ✅ Já tem Nginx configurado
- ✅ SSL gratuito via Let's Encrypt
- ✅ Melhor performance (servidor próprio)

**Desvantagens:**
- ⚠️ Requer configurar DNS
- ⚠️ Você gerencia updates

---

## 📋 CHECKLIST: Self-Hosting

```
[ ] 1. Criar virtual host nginx
[ ] 2. Habilitar site
[ ] 3. Testar nginx (nginx -t)
[ ] 4. Reload nginx
[ ] 5. Configurar DNS (studio.saraivavision.com.br → 31.97.129.78)
[ ] 6. Aguardar propagação DNS (5-30 min)
[ ] 7. Instalar SSL (certbot)
[ ] 8. Atualizar sanity.config.js
[ ] 9. Rebuild (npm run build)
[ ] 10. Acessar https://studio.saraivavision.com.br
```

---

## 🔧 TROUBLESHOOTING

### Erro: CORS

**Problema:** Frontend não consegue acessar API

**Solução:** Adicionar CORS no Sanity Dashboard:
```
https://www.sanity.io/manage/project/92ocrdmp/api/cors
```

Adicionar:
- `https://saraivavision.com.br`
- `https://www.saraivavision.com.br`
- `https://studio.saraivavision.com.br`
- `http://localhost:3000` (dev)

### Erro: 404 ao acessar studio

**Verificar:**
```bash
# 1. Nginx está servindo arquivos?
curl -I http://studio.saraivavision.com.br

# 2. Arquivos existem?
ls -lh /home/saraiva-vision-site/sanity/dist/

# 3. Permissões OK?
sudo chown -R www-data:www-data /home/saraiva-vision-site/sanity/dist
```

### Erro: DNS não resolve

**Verificar:**
```bash
# 1. DNS propagou?
nslookup studio.saraivavision.com.br

# 2. Aguardar mais tempo (até 24h)

# 3. Testar com IP direto:
curl -H "Host: studio.saraivavision.com.br" http://31.97.129.78
```

---

## 📞 PRÓXIMOS PASSOS

**Recomendo executar OPÇÃO 2:**

1. ✅ Criar virtual host nginx
2. ✅ Configurar DNS
3. ✅ Instalar SSL
4. ✅ Rebuild studio
5. ✅ Acessar https://studio.saraivavision.com.br

**Tempo estimado:** 15 minutos (+ tempo de propagação DNS)

