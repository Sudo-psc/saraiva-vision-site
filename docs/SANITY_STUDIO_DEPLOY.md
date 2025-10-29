# Sanity Studio - Deploy Required

**Data**: 2025-10-28
**Status**: 🔴 PENDENTE - Requer ação manual
**Prioridade**: ALTA
**Autor**: Dr. Philipe Saraiva Cruz

---

## 📋 Situação Atual

### ✅ O que está funcionando

- **Integração frontend**: ✅ Completa (9/9 testes passando)
- **API Sanity**: ✅ Acessível (25 posts disponíveis)
- **Fallback estático**: ✅ Funcionando (100% uptime garantido)
- **Configuração**: ✅ Correta (Project ID: 92ocrdmp)
- **Autenticação**: ✅ Configurada
- **Build local**: ✅ Existente (6.8MB)

### ❌ O que precisa de ação

- **Sanity Studio**: ❌ NÃO deployado
- **URL**: https://saraivavision.sanity.studio retorna 404
- **Motivo**: Deploy requer login interativo (não automatizável)

---

## 🚀 Ação Necessária (5 minutos)

### Deploy do Sanity Studio

```bash
# 1. Navegar para o diretório
cd /home/saraiva-vision-site/sanity

# 2. Login no Sanity (INTERATIVO - uma única vez)
npx sanity login

# Escolha método de autenticação:
# - Google (recomendado)
# - GitHub
# - E-mail/Password

# 3. Deploy do Studio
npm run deploy

# 4. Confirmar quando solicitado
# Digite: Y
```

### Verificação

Após o deploy, acesse:
```
https://saraivavision.sanity.studio
```

**Deve mostrar**:
- ✅ Sanity Studio carregado
- ✅ Tela de login
- ✅ Após login: 25 posts do blog

---

## 📊 Diagnóstico Automático

Execute o script de diagnóstico para verificar o status:

```bash
cd /home/saraiva-vision-site/sanity
./diagnose.sh
```

**Output esperado ANTES do deploy**:
```
❌ Studio NÃO deployado (HTTP 404)
✅ Configuração encontrada
✅ API Sanity acessível
```

**Output esperado APÓS o deploy**:
```
✅ Studio deployado com sucesso!
✅ Configuração encontrada
✅ API Sanity acessível
```

---

## 🎯 Valor do Deploy

### Antes do Deploy
- ✅ Blog funciona com fallback estático
- ✅ API Sanity retorna posts via `blogDataService.js`
- ❌ **Não pode** criar/editar posts via interface gráfica
- ❌ **Precisa** fazer deploy do site para publicar novo post

### Depois do Deploy
- ✅ Blog funciona com Sanity + fallback
- ✅ API Sanity retorna posts
- ✅ **Pode** criar/editar posts via Studio (interface gráfica)
- ✅ **Publicação instantânea** (sem necessidade de deploy do site)
- ✅ Upload de imagens direto no Sanity
- ✅ Editor visual de conteúdo rico (Portable Text)

---

## 📚 Documentação Criada

Arquivos de referência no diretório `/home/saraiva-vision-site/sanity/`:

1. **QUICK_DEPLOY.md** - Guia rápido de deploy (1 página)
2. **TROUBLESHOOTING.md** - Troubleshooting completo (problemas comuns)
3. **diagnose.sh** - Script de diagnóstico automático
4. **README.md** - Documentação geral (já existia)

---

## 🔍 Por que X-Frame-Options NÃO é o problema?

### O erro original
```
Unable to load studio
Failed to load iframe due to X-Frame-Options: SAMEORIGIN
```

### Análise
Este erro aparece porque:

1. ✅ Sanity Dashboard (https://sanity.io/manage) tenta carregar o Studio em iframe
2. ❌ Studio **não está deployado** (404)
3. ❌ Dashboard não consegue carregar (erro genérico vira "X-Frame-Options")

### X-Frame-Options no Nginx
```nginx
# /etc/nginx/sites-enabled/saraivavision linha 547
add_header X-Frame-Options "SAMEORIGIN" always;
```

**Este header NÃO afeta o Sanity Studio porque**:

| Aspecto | Sanity Studio | Site Principal |
|---------|---------------|----------------|
| **URL** | saraivavision.sanity.studio | saraivavision.com.br |
| **Hosting** | Sanity.io (CDN global) | VPS 31.97.129.78 |
| **Servidor** | Infraestrutura Sanity | Nginx |
| **Headers** | Controlados pela Sanity | Controlados pelo Nginx |

**Conclusão**: O header X-Frame-Options do Nginx **não interfere** com o Sanity Studio.

---

## 🎯 Próximos Passos

### Imediato (Você - 5 minutos)
1. ✅ Execute: `cd /home/saraiva-vision-site/sanity`
2. ✅ Execute: `npx sanity login`
3. ✅ Execute: `npm run deploy`
4. ✅ Acesse: https://saraivavision.sanity.studio
5. ✅ Execute: `./diagnose.sh` para confirmar

### Após Deploy
1. ✅ Login no Studio
2. ✅ Criar primeiro post de teste
3. ✅ Verificar que aparece no site automaticamente
4. ✅ Testar upload de imagem
5. ✅ Migrar post "Olho Seco" (do PR #108 fechado)

---

## 💡 Dica Pro

### Criar Post de "Olho Seco" no Sanity

O conteúdo do PR #108 (fechado) pode ser usado:

```bash
# Ver conteúdo do PR fechado
gh pr view 108

# Ou acessar diretamente no Sanity Studio:
# 1. Acesse: https://saraivavision.sanity.studio
# 2. Clique em "Blog Posts" > "Create"
# 3. Copie título e conteúdo do PR #108
# 4. Faça upload da imagem
# 5. Publique (instantâneo!)
```

---

## 📞 Suporte

### Documentação
- **Quick Deploy**: `cat /home/saraiva-vision-site/sanity/QUICK_DEPLOY.md`
- **Troubleshooting**: `cat /home/saraiva-vision-site/sanity/TROUBLESHOOTING.md`
- **Diagnóstico**: `/home/saraiva-vision-site/sanity/diagnose.sh`

### Links
- **Sanity Docs**: https://www.sanity.io/docs/deployment
- **Project Dashboard**: https://sanity.io/manage/project/92ocrdmp
- **Sanity Support**: https://slack.sanity.io

---

**Última atualização**: 2025-10-28 18:35 BRT
**Responsável**: Dr. Philipe Saraiva Cruz
**Próxima ação**: Deploy manual do Sanity Studio
