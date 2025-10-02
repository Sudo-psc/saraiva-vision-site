# Troubleshooting - Erros 404 Persistentes (Cache do Navegador)

## 🎯 Problema

Erros 404 aparecem no console do navegador mesmo após deploy bem-sucedido:
```
[Error] Failed to load resource: 404 (capa-terapias-geneticas.png)
[Error] Failed to load resource: 404 (capa-olho-seco.png)
```

## ✅ Verificação - Servidor está OK

```bash
# Todas as URLs retornam 200 OK:
✅ https://saraivavision.com.br/Blog/capa-terapias-geneticas.png - HTTP 200
✅ https://saraivavision.com.br/Blog/capa-olho-seco.png - HTTP 200
✅ https://saraivavision.com.br/Blog/capa-nutricao-visao.png - HTTP 200
✅ https://saraivavision.com.br/Blog/capa-lentes-presbiopia.png - HTTP 200
```

## 🔍 Causa Raiz

**CACHE DO NAVEGADOR** armazenou respostas 404 antigas com TTL longo.

### Por que isso acontece?

1. **Antes do fix**: Navegador tentou carregar `capa-xxx.png` → 404
2. **Navegador cached 404** por até 1 ano (devido ao header `Cache-Control: max-age=31536000`)
3. **Após o fix**: Arquivos agora existem, mas navegador ainda usa cache local
4. **Resultado**: 404 persistente até cache expirar ou ser limpo

---

## 🛠️ Soluções

### **Opção 1: Hard Refresh (Recomendado para Usuário Final)**

#### Chrome / Edge / Brave
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

#### Firefox
```
Windows: Ctrl + F5
Mac: Cmd + Shift + R
```

#### Safari
```
Mac: Cmd + Option + R
```

---

### **Opção 2: Limpar Cache Manualmente**

#### Chrome / Edge
1. `F12` (abrir DevTools)
2. **Clicar com botão direito** no ícone de reload 🔄
3. Selecionar **"Empty Cache and Hard Reload"**

#### Firefox
1. `Ctrl/Cmd + Shift + Delete`
2. Selecionar "Cache"
3. Período: "Everything"
4. Limpar

#### Safari
1. Safari → Preferences → Advanced
2. ✅ Show Develop menu
3. Develop → Empty Caches

---

### **Opção 3: Abrir em Aba Anônima/Privada**

```
Chrome/Edge: Ctrl/Cmd + Shift + N
Firefox: Ctrl/Cmd + Shift + P
Safari: Cmd + Shift + N
```

**Por quê funciona?** Modo privado não usa cache persistente.

---

### **Opção 4: DevTools - Disable Cache (Para Desenvolvedores)**

1. Abrir DevTools (`F12`)
2. **Network Tab**
3. ✅ **"Disable cache"**
4. **Manter DevTools aberto** enquanto navega

---

### **Opção 5: Teste via cURL (Confirmar Servidor)**

```bash
# Teste direto (bypass cache navegador)
curl -I https://saraivavision.com.br/Blog/capa-terapias-geneticas.png

# Espera: HTTP/2 200
```

---

## 🔬 Diagnóstico Avançado

### Verificar se é Cache do Navegador ou Servidor

#### 1. Abrir DevTools → Network
```
F12 → Network tab → Reload página
```

#### 2. Filtrar por "img"
```
Filtro: img
```

#### 3. Verificar coluna "Size"
```
✅ "200 OK" + tamanho em KB = Sucesso (novo request)
⚠️ "200 OK" + "disk cache" = Cache local (antigo)
❌ "404 Not Found" = Problema real OU cache de 404
```

#### 4. Verificar Headers
```
Click na imagem → Headers tab

Response Headers:
  ✅ Status Code: 200 OK (servidor respondeu)
  ⚠️ Status Code: 404 (from disk cache) (cache local)
```

---

## 🎯 Solução Definitiva (Para Evitar Futuramente)

### Implementar Versionamento de Assets

#### Opção A: Query String com Timestamp
```javascript
// Antes:
<img src="/Blog/capa-terapias-geneticas.png" />

// Depois:
<img src="/Blog/capa-terapias-geneticas.png?v=20251002" />
```

**Benefício**: Força reload quando versão muda.

#### Opção B: Reduzir Cache-Control para 404s

```nginx
# /etc/nginx/sites-enabled/saraivavision

location ~* \.(png|jpg|jpeg|gif|webp|avif)$ {
    try_files $uri =404;
    
    # Cache longo para 200 OK
    expires 1y;
    add_header Cache-Control "public, immutable, max-age=31536000" always;
    
    # Sobrescrever para 404s (NÃO FUNCIONA - Nginx não diferencia)
    # Solução: Usar error_page com cache curto
}
```

**Limitação**: Nginx aplica headers antes de saber se é 200 ou 404.

#### Opção C: Service Worker com Cache Invalidation
```javascript
// sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/Blog/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request)
          .then(response => response || fetch(event.request))
      })
    )
  }
})
```

---

## 📊 Verificação Pós-Limpeza

### Checklist
- [ ] Hard refresh executado (Ctrl+Shift+R)
- [ ] DevTools → Network → Todas as imagens com Status 200
- [ ] Console sem erros 404
- [ ] Imagens visíveis na página

### Teste Automatizado
```bash
# Listar todas as imagens carregadas
# DevTools → Console:
performance.getEntriesByType('resource')
  .filter(e => e.name.includes('.png') || e.name.includes('.avif'))
  .forEach(e => console.log(e.name, e.responseStatus))

# Espera: Todas com responseStatus undefined (sucesso) ou 200
```

---

## 🚨 Se Problema Persistir

### Verificações Adicionais

#### 1. Confirmar que arquivos existem no servidor
```bash
ssh user@servidor
ls -lh /var/www/html/Blog/capa-terapias-geneticas.png
# Espera: arquivo existe
```

#### 2. Testar URL direta no navegador
```
https://saraivavision.com.br/Blog/capa-terapias-geneticas.png
# Espera: Imagem carrega
```

#### 3. Verificar permissões
```bash
ls -la /var/www/html/Blog/ | grep capa-terapias
# Espera: -rw-r--r-- (leitura permitida)
```

#### 4. Verificar Nginx logs
```bash
sudo tail -f /var/log/nginx/error.log
# Recarregar página e verificar erros
```

#### 5. Testar com outro navegador
```
Se funciona em Chrome mas não em Firefox = Cache específico do Firefox
```

---

## 📞 Suporte

### Informações para Report

Se o problema persistir após hard refresh, forneça:

```
1. Navegador e versão: _______________
2. Sistema operacional: _______________
3. Hard refresh executado? ☐ Sim ☐ Não
4. Modo privado funciona? ☐ Sim ☐ Não
5. URL direta funciona? ☐ Sim ☐ Não
6. Screenshot do DevTools Network tab
7. Screenshot do Console com erros
```

---

## ✅ Confirmação de Sucesso

**Servidor está FUNCIONANDO corretamente**:
```bash
$ curl -I https://saraivavision.com.br/Blog/capa-terapias-geneticas.png
HTTP/2 200 
content-type: image/png
content-length: 1549022
```

**Problema é 100% cache do navegador do usuário.**

**Solução**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

---

**Data**: 02/10/2025  
**Status**: Servidor OK - Requer ação do usuário (hard refresh)  
**Prioridade**: Baixa (não afeta novos visitantes)
