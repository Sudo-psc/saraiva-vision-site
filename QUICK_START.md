# ⚡ Quick Start - Deploy Sanity

## 1️⃣ Deploy (1 comando)

```bash
sudo cp -r dist/* /var/www/html/ && sudo systemctl restart nginx
```

## 2️⃣ Testar (browser)

```
https://www.saraivavision.com.br/test-sanity-fetch.html
```

Clicar: **"Buscar Posts Recentes"**

✅ **Sucesso:** 3 posts aparecem  
❌ **Erro:** Ver `docs/CORS_SANITY_FIX.md`

## 3️⃣ Usar no Código

```jsx
import BlogRecentPosts from '@/components/BlogRecentPosts';

<BlogRecentPosts limit={3} />
```

---

**Docs completo:** `DEPLOY_SANITY.md`
