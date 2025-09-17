# Deploy Instructions - Saraiva Vision V2

## 📋 Informações do Repositório V2

- **Repositório**: https://github.com/Sudo-psc/saraivavision-site-v2
- **Branch Principal**: `main`
- **Versão**: 2.0.0
- **Diretório Local**: `/home/saraivavision-site-v2`

## 🚀 Métodos de Deploy

### 1. Deploy Local (Manual)

```bash
# Navegar para o diretório V2
cd /home/saraivavision-site-v2

# Script otimizado V2 (recomendado)
./deploy-v2.sh

# Script tradicional (compatibilidade)
./deploy-full.sh
```

### 2. Deploy via GitHub Actions

O deploy automático é acionado por:
- **Push para `main`**: Deploy automático
- **Workflow manual**: Via GitHub Actions UI

Para deploy manual:
1. Acesse: https://github.com/Sudo-psc/saraivavision-site-v2/actions
2. Selecione "Deploy"
3. Clique "Run workflow"
4. Insira URL (padrão: https://saraivavision.com.br)
5. Clique "Run workflow"

### 3. Deploy de Emergência

```bash
# Build simples e copy
cd /home/saraivavision-site-v2
npm run build
sudo cp -r dist/* /var/www/saraivavision/current/
sudo systemctl reload nginx
```

## 🔧 Verificações Pré-Deploy

### Ambiente
```bash
# Verificar se está no repositório correto
git remote -v
# Deve mostrar: saraivavision-site-v2.git

# Verificar branch
git branch --show-current
# Deve mostrar: main

# Verificar status
git status
# Deve estar limpo ou apenas arquivos não versionados
```

### Dependências
```bash
# Verificar Node.js
node --version  # Deve ser >= 18

# Verificar npm
npm --version

# Instalar dependências se necessário
npm ci
```

## � Melhorias V2 Incluídas

### ♿ Acessibilidade
- ✅ Alt-text em todas as imagens
- ✅ Suporte WCAG 2.1
- ✅ Traduções PT/EN

### 🖼️ Performance
- ✅ Imagens otimizadas (95% redução)
- ✅ Lazy loading
- ✅ Cache otimizado

### 🎵 UX
- ✅ Players únicos (sem duplicatas)
- ✅ Interface limpa
- ✅ Carregamento rápido

## 🧪 Verificações Pós-Deploy

Após o deploy, verificar:

```bash
# Status HTTP
curl -I https://saraivavision.com.br/

# Service Worker
curl -I https://saraivavision.com.br/sw.js

# Imagens otimizadas
curl -I https://saraivavision.com.br/Podcasts/Covers/glaucoma.jpg
```

### URLs de Teste
- **Homepage**: https://saraivavision.com.br/
- **Podcasts**: https://saraivavision.com.br/podcasts
- **Lentes**: https://saraivavision.com.br/lentes
- **Contato**: https://saraivavision.com.br/contato

## 🐛 Troubleshooting

### Problema: Build falha
```bash
# Limpar cache
rm -rf node_modules dist
npm ci
npm run build
```

### Problema: Imagens não carregam
```bash
# Verificar permissões
sudo chown -R www-data:www-data /var/www/saraivavision/
sudo chmod -R 755 /var/www/saraivavision/
```

### Problema: Nginx não recarrega
```bash
# Testar configuração
sudo nginx -t

# Restart manual
sudo systemctl restart nginx
```

## 📞 Suporte

- **Repositório**: https://github.com/Sudo-psc/saraivavision-site-v2/issues
- **Documentação**: Ver arquivos `*.md` no repositório
- **Logs**: `/var/log/nginx/` e `/var/www/saraivavision/`

---

#**Última Atualiza
o**: 5 de setembro de 2025  
**Versão do Documento**: 1.0
