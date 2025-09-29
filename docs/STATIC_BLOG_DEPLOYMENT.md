# Static Blog Deployment Guide

## 📋 Overview

Este documento descreve o processo de deploy do blog estático simplificado da Saraiva Vision, sem dependências externas de WordPress ou Supabase.

## 🏗️ Arquitetura Simplificada

### Componentes
- **Frontend SPA**: React 18 + Vite servindo blog estático
- **Blog Data**: Arquivo JavaScript estático (`src/data/blogPosts.js`)
- **API**: Node.js/Express para serviços essenciais (Google Reviews, contato)
- **Web Server**: Nginx servindo arquivos estáticos e proxy para API

### Fluxo de Dados
```
Usuário → Nginx → Static Files (HTML/JS/CSS)
         ↓
         └→ API Proxy → Node.js Express
```

## 📝 Estrutura de Dados do Blog

### Localização
- `src/data/blogPosts.js` - Arquivo único com todos os posts

### Formato dos Posts
```javascript
{
  id: 1,
  slug: 'nome-do-post',
  title: 'Título do Post',
  excerpt: 'Resumo breve',
  content: 'Conteúdo HTML completo',
  author: 'Dr. Nome',
  date: '2025-09-15',
  category: 'Categoria',
  tags: ['tag1', 'tag2'],
  image: '/images/blog/imagem.jpg',
  featured: true/false
}
```

### Adicionar Novo Post
1. Editar `src/data/blogPosts.js`
2. Adicionar novo objeto ao array `blogPosts`
3. Seguir formato existente
4. Rebuild e deploy

## 🚀 Processo de Deploy

### Pré-requisitos
- Node.js 22+
- Acesso SSH ao VPS
- Nginx configurado
- Variáveis de ambiente configuradas

### 1. Build Local
```bash
# No diretório do projeto
npm install
npm run build
```

### 2. Validação Local
```bash
# Testar build localmente
npm run preview

# Verificar que arquivos foram gerados em dist/
ls -la dist/
```

### 3. Deploy para VPS
```bash
# Copiar arquivos estáticos para Nginx
sudo cp -r dist/* /var/www/html/

# Verificar permissões
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

### 4. Restart Serviços
```bash
# Reload Nginx
sudo systemctl reload nginx

# Restart API (se necessário)
sudo systemctl restart saraiva-api

# Verificar status
sudo systemctl status nginx
sudo systemctl status saraiva-api
```

### 5. Validação Pós-Deploy
```bash
# Testar site
curl -I https://saraivavision.com.br

# Testar API health
curl https://saraivavision.com.br/api/health

# Verificar logs
sudo journalctl -u nginx -n 50
sudo journalctl -u saraiva-api -n 50
```

## 🔧 Configuração Nginx

### Localização
- `/etc/nginx/sites-available/saraivavision`
- `/etc/nginx/sites-enabled/saraivavision`

### Configuração Básica
```nginx
server {
    listen 80;
    server_name saraivavision.com.br www.saraivavision.com.br;

    root /var/www/html;
    index index.html;

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 📦 Conteúdo do Build

### Estrutura `dist/`
```
dist/
├── index.html              # SPA entry point
├── assets/
│   ├── index-[hash].js    # Main JS bundle
│   ├── index-[hash].css   # Main CSS bundle
│   └── [other-chunks].js  # Code-split chunks
├── images/                 # Static images
└── favicon.ico
```

### Verificação do Build
```bash
# Verificar tamanho dos arquivos
du -sh dist/*

# Verificar conteúdo do bundle
grep -r "wordpress\|supabase" dist/ # Não deve retornar nada
```

## 🔐 Variáveis de Ambiente

### Arquivo `.env` (VPS)
```bash
# Google APIs
VITE_GOOGLE_MAPS_API_KEY=your_key_here
VITE_GOOGLE_PLACES_API_KEY=your_key_here
VITE_GOOGLE_PLACE_ID=your_place_id_here

# Email
RESEND_API_KEY=your_resend_key_here

# Node.js
NODE_ENV=production
PORT=3001
```

### Localização VPS
- `/etc/environment` ou
- `/home/user/.env` ou
- Systemd service file

## 🐛 Troubleshooting

### Build Falha
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Limpar build anterior
rm -rf dist/
npm run build
```

### Site Não Carrega
```bash
# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx

# Verificar permissões
ls -la /var/www/html/

# Verificar logs
sudo tail -f /var/log/nginx/error.log
```

### API Não Responde
```bash
# Verificar serviço Node.js
sudo systemctl status saraiva-api

# Ver logs da API
sudo journalctl -u saraiva-api -f

# Testar API diretamente
curl http://localhost:3001/api/health
```

### Blog Posts Não Aparecem
```bash
# Verificar se arquivo foi incluído no build
grep -r "blogPosts" dist/assets/*.js

# Verificar console do navegador
# Deve mostrar erros se houver problema com imports
```

## 📊 Performance

### Otimizações Implementadas
- Code splitting automático
- Lazy loading de rotas
- Tree shaking
- Asset minification
- Gzip/Brotli compression (Nginx)

### Métricas Esperadas
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.0s
- Total Bundle Size: < 500KB (gzipped)

## 🔄 Workflow de Atualização

### Atualizar Conteúdo do Blog
1. Editar `src/data/blogPosts.js`
2. `npm run build`
3. Deploy para VPS
4. Reload Nginx

### Atualizar Código da Aplicação
1. Fazer alterações no código
2. Testar localmente: `npm run dev`
3. Build: `npm run build`
4. Deploy para VPS
5. Restart serviços

## 🎯 Checklist de Deploy

- [ ] Código commitado no branch `blog-spa`
- [ ] Build executado com sucesso
- [ ] Variáveis de ambiente configuradas no VPS
- [ ] Arquivos copiados para `/var/www/html/`
- [ ] Permissões corretas (www-data:www-data)
- [ ] Nginx recarregado
- [ ] API funcionando (teste /api/health)
- [ ] Site acessível via browser
- [ ] Blog posts carregando corretamente
- [ ] Categorias e busca funcionando
- [ ] Links internos funcionando
- [ ] SSL ativo e válido

## 📞 Suporte

### Logs Importantes
```bash
# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# API
sudo journalctl -u saraiva-api -f

# Sistema
sudo journalctl -xe
```

### Comandos Úteis
```bash
# Verificar status de todos os serviços
sudo systemctl status nginx saraiva-api redis

# Restart completo
sudo systemctl restart nginx saraiva-api

# Verificar uso de disco
df -h

# Verificar processos
ps aux | grep node
```

---

**Última Atualização**: 2025-09-29
**Versão**: blog-spa branch
**Autor**: Saraiva Vision Development Team