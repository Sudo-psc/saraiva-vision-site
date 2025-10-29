# 🔍 SANITY STUDIO - DEBUG REPORT
**Data**: 2025-10-29 12:06 UTC
**Status**: ⚠️ Studio não está acessível (HTTP 404)

---

## 📊 DIAGNÓSTICO COMPLETO

### ✅ Componentes OK

1. **Instalação Local**
   - ✅ Diretório: `/home/saraiva-vision-site/sanity`
   - ✅ Node modules: Instalados
   - ✅ Sanity CLI: v4.11.0 (update disponível: v4.12.0)
   - ✅ Build: Funciona (36 segundos)
   - ✅ Dist: Gerado (7.2MB)

2. **Configuração**
   - ✅ Project ID: `92ocrdmp`
   - ✅ Dataset: `production`
   - ✅ Token: Configurado em `.env`
   - ✅ Auth: Token válido em `~/.config/sanity/config.json`

3. **Schemas**
   - ✅ Estrutura de schemas presente
   - ✅ Config: `/home/saraiva-vision-site/sanity/sanity.config.js`

### ❌ Problema Identificado

**Studio não está deployado/acessível:**

```bash
$ curl -I https://saraivavision.sanity.studio
HTTP/2 404
```

**Causa**: Deploy não foi completado com sucesso ou hostname incorreto

---

## 🛠️ SOLUÇÕES DISPONÍVEIS

### Opção 1: Deploy via Browser (RECOMENDADO)

**Método mais confiável e rápido (5 minutos):**

1. **Acesse o Sanity Dashboard**:
   ```
   https://www.sanity.io/manage/project/92ocrdmp
   ```

2. **Login**: Use sua conta (Google/GitHub/Email)

3. **Navegue**: Menu lateral → **API** → **CORS Origins**
   - Adicione: `https://saraivavision.com.br`
   - Adicione: `http://localhost:3333` (para desenvolvimento)

4. **Deploy Studio**:
   - Vá em **Deploy** → **Studio Hosting**
   - Click em "Deploy Studio"
   - Escolha ou crie hostname: `saraivavision`
   - Upload do build (`/dist`)
   - Aguarde ~2 minutos

5. **Verificar**:
   ```bash
   curl -I https://saraivavision.sanity.studio
   # Deve retornar: HTTP/2 200
   ```

---

### Opção 2: Deploy Manual via CLI (requer interação)

```bash
cd /home/saraiva-vision-site/sanity

# 1. Atualizar Sanity CLI (recomendado)
npm install -g @sanity/cli@latest

# 2. Fazer login
npx sanity login

# 3. Build
npm run build

# 4. Deploy
npx sanity deploy

# Quando aparecer prompt:
# - Escolha: "Create new studio hostname"
# - Digite: saraivavision (SEM .sanity.studio)
# - Confirme
```

---

### Opção 3: Rodar Studio Localmente (desenvolvimento)

Para testar e desenvolver localmente:

```bash
cd /home/saraiva-vision-site/sanity

# Iniciar servidor de desenvolvimento
npm run dev

# Studio estará disponível em:
# http://localhost:3333
```

**Nota**: Isso NÃO torna o studio público, apenas para desenvolvimento local.

---

## 🔍 VERIFICAÇÕES PÓS-DEPLOY

### 1. Verificar URL

```bash
curl -I https://saraivavision.sanity.studio
```

**Esperado**:
```
HTTP/2 200
content-type: text/html
```

### 2. Acessar no Browser

```
https://saraivavision.sanity.studio
```

**Esperado**: Tela de login do Sanity Studio

### 3. Testar API

```bash
curl -H "Authorization: Bearer $SANITY_TOKEN" \
  https://92ocrdmp.api.sanity.io/v2021-10-21/data/query/production?query=*[_type=="post"]
```

---

## 📋 COMANDOS ÚTEIS

### Desenvolvimento Local
```bash
cd /home/saraiva-vision-site/sanity

# Dev server
npm run dev

# Build
npm run build

# Deploy
npm run deploy
```

### Verificar Configuração
```bash
# Ver projeto
npx sanity projects list

# Ver dataset
npx sanity dataset list

# Verificar auth
cat ~/.config/sanity/config.json
```

### Gerenciar Dados
```bash
# Exportar dados
npm run export

# Upload de imagens
npm run upload-images

# Converter conteúdo
npm run convert-content

# Verificar importação
npm run verify
```

---

## 🐛 PROBLEMAS CONHECIDOS

### 1. Deploy CLI com Hostname Duplicado

**Problema**: Deploy via CLI resulta em URLs duplicadas:
```
https://saraivavision.sanity.studio.sanity.studio ❌
```

**Solução**: Usar deploy via browser (Opção 1)

### 2. Deploy CLI Trava em Prompt

**Problema**: `npx sanity deploy` fica esperando input interativo

**Solução**: 
- Rodar em terminal interativo (não via SSH não-interativo)
- Ou usar deploy via browser

### 3. CORS Errors

**Problema**: Frontend não consegue acessar API

**Solução**: Adicionar origins no dashboard:
```
https://www.sanity.io/manage/project/92ocrdmp/api/cors
```

Adicionar:
- `https://saraivavision.com.br`
- `https://www.saraivavision.com.br`
- `http://localhost:3000` (desenvolvimento)

---

## 📚 ARQUIVOS IMPORTANTES

```
/home/saraiva-vision-site/sanity/
├── sanity.config.js          # Configuração principal
├── .env                      # Tokens e credenciais
├── package.json              # Scripts e dependências
├── schemas/                  # Definição de schemas
├── dist/                     # Build output (7.2MB)
├── DEPLOY_STATUS.md          # Status do último deploy
├── TROUBLESHOOTING.md        # Guia de troubleshooting
└── diagnose.sh               # Script de diagnóstico
```

---

## 🎯 RECOMENDAÇÃO FINAL

**Execute a Opção 1 (Deploy via Browser)**:

✅ **Mais rápido** (5 minutos)  
✅ **Mais confiável** (interface visual)  
✅ **Sem problemas de hostname**  
✅ **Validação em tempo real**

**URL do Dashboard**:
```
https://www.sanity.io/manage/project/92ocrdmp
```

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Acesse o dashboard (link acima)
2. ✅ Faça deploy via browser
3. ✅ Aguarde 2 minutos
4. ✅ Teste: `curl -I https://saraivavision.sanity.studio`
5. ✅ Acesse no browser e faça login
6. ✅ Comece a criar posts!

---

**Status**: Aguardando deploy manual via browser  
**Tempo estimado**: 5 minutos  
**Dificuldade**: Baixa (interface visual)

