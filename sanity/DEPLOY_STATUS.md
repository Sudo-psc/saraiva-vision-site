# Sanity Studio - Deploy Status Report

**Data**: 2025-10-28 19:45 BRT
**Status**: ⚠️ DEPLOY EXECUTADO - Problema de Hostname
**Ação Necessária**: Deploy manual via browser

---

## 📊 Status Atual

### ✅ O que foi feito

1. **Criado sanity.cli.ts** com configuração correta
2. **Deploy executado 4 vezes** com sucesso (confirmado pelo CLI)
3. **Build gerado** (7.2MB em `/dist/`)
4. **Schemas deployados** (1/1 schemas confirmados)
5. **3 App IDs gerados**:
   - `ngblxman3ukym2lida97y3q7`
   - `d1a4wd1vm772zmc8o37bmibq`
   - (mais um não capturado)

### ❌ Problema Identificado

**Hostname Duplication Bug**

Todos os deploys resultaram em URLs com duplicação de `.sanity.studio`:

```
Deploy 1: https://saraivavision.sanity.studio.sanity.studio  ❌
Deploy 2: https://saraivavision.com.br.sanity.studio         ❌
Deploy 3: https://saraivavision.sanity.studio.sanity.studio  ❌
Deploy 4: https://saraivavision.sanity.studio.sanity.studio  ❌
```

**URL esperada**: `https://saraivavision.sanity.studio` ✅

**Resultado**: Todas as URLs retornam **HTTP 404**

---

## 🔍 Análise do Problema

### Causa Raiz

O Sanity CLI está lendo o hostname de forma incorreta:

```typescript
// sanity.cli.ts (configurado)
deployment: {
  hostname: 'saraivavision'  // ✅ Correto
}

// Mas o CLI processa como:
'saraivavision.sanity.studio'  // Adiciona .sanity.studio

// E depois ao deployar, duplica:
'saraivavision.sanity.studio.sanity.studio'  // ❌ Erro
```

### Hostnames Existentes no Projeto

O projeto já tem 2 hostnames configurados:

1. `https://saraivavision.com.br`
2. `https://saraivavision.sanity.studio`

**Mas nenhum está ativo/deployado corretamente.**

---

## ✅ Solução: Deploy Manual

### Opção 1: Via Sanity CLI (Interativo)

Este método requer interação via browser:

```bash
cd /home/saraiva-vision-site/sanity

# 1. Login (se ainda não logado)
npx sanity login

# 2. Deploy interativo
npx sanity deploy

# 3. Quando aparecer a lista de hostnames:
# - Use setas ↓ para selecionar "Create new studio hostname"
# - Digite APENAS: saraivavision
# - Não digite .sanity.studio (será adicionado automaticamente)

# 4. Confirme o deploy
```

### Opção 2: Via Sanity Dashboard (Browser)

1. **Acesse**: https://www.sanity.io/manage/project/92ocrdmp
2. **Login** com sua conta (Google/GitHub/Email)
3. **Menu lateral** → **API** → **Studio**
4. **Deploy Studio**:
   - Click em "Deploy Studio"
   - Escolha hostname: `saraivavision`
   - Confirme

### Opção 3: Deletar Hostnames Incorretos

Se os hostnames duplicados estão causando problema:

```bash
# Listar deployments
npx sanity deployment list

# Deletar deployment específico
npx sanity deployment undeploy <appId>

# Exemplo:
npx sanity deployment undeploy ngblxman3ukym2lida97y3q7

# Depois fazer deploy limpo
npx sanity deploy
```

---

## 🎯 Verificação Pós-Deploy

Após deploy bem-sucedido, execute:

```bash
# Verificar que retorna HTTP 200
curl -I https://saraivavision.sanity.studio

# Deve retornar:
# HTTP/2 200
# content-type: text/html
```

Ou acesse no browser:
```
https://saraivavision.sanity.studio
```

**Deve mostrar**: Tela de login do Sanity Studio

---

## 📝 Logs dos Deploys Executados

### Deploy 1 (19:10)
```
Success! Studio deployed to https://saraivavision.sanity.studio.sanity.studio/
appId: ngblxman3ukym2lida97y3q7
```

### Deploy 2 (19:20)
```
Success! Studio deployed to https://saraivavision.com.br.sanity.studio/
appId: d1a4wd1vm772zmc8o37bmibq
```

### Deploy 3 & 4 (19:40)
```
Success! Studio deployed to https://saraivavision.sanity.studio.sanity.studio/
appId: ngblxman3ukym2lida97y3q7
```

---

## 🐛 Bug Report

**Possível bug no Sanity CLI v4.11.0**:

- Quando `hostname` é configurado em `sanity.cli.ts`, o CLI não processa corretamente
- Duplicação de sufixo `.sanity.studio`
- Problema persiste mesmo com `--yes` flag

**Workaround**: Deploy manual interativo

---

## 📚 Arquivos de Referência

Documentação criada no diretório `/home/saraiva-vision-site/sanity/`:

- ✅ `QUICK_DEPLOY.md` - Guia rápido
- ✅ `TROUBLESHOOTING.md` - Troubleshooting detalhado
- ✅ `diagnose.sh` - Script de diagnóstico
- ✅ `DEPLOY_STATUS.md` - Este arquivo
- ✅ `sanity.cli.ts` - Configuração CLI

---

## 🎯 Próximos Passos

### Para Você (Manual - 5 minutos)

1. ✅ Acesse: https://www.sanity.io/manage/project/92ocrdmp
2. ✅ Login com sua conta
3. ✅ Vá em **Deploy → Studio**
4. ✅ Configure hostname: `saraivavision` (sem sufixo)
5. ✅ Confirme deploy
6. ✅ Aguarde ~2 minutos para propagação
7. ✅ Acesse: https://saraivavision.sanity.studio
8. ✅ Faça login e comece a criar posts!

### Validação

```bash
# Execute após deploy manual
cd /home/saraiva-vision-site/sanity
./diagnose.sh

# Deve mostrar:
# ✅ Studio deployado com sucesso!
```

---

## 💡 Por que Deploy Manual?

**Tentativas automáticas**:
- ❌ 4 deploys executados
- ❌ Todos com problema de hostname duplicado
- ❌ Prompts interativos travados no terminal

**Deploy manual via browser**:
- ✅ Interface visual clara
- ✅ Validação de hostname em tempo real
- ✅ Confirmação visual do deploy
- ✅ Sem problemas de duplicação

---

## 📞 Suporte

### Se após deploy manual ainda houver 404:

1. **Aguarde 5 minutos** (propagação DNS)
2. **Limpe cache do browser** (Ctrl+Shift+R)
3. **Tente em modo anônimo**
4. **Execute diagnóstico**: `./diagnose.sh`
5. **Verifique logs**: `npx sanity deployment list`

### Links Úteis

- **Project Dashboard**: https://www.sanity.io/manage/project/92ocrdmp
- **Deploy Guide**: https://www.sanity.io/docs/deployment
- **Support**: https://slack.sanity.io

---

**Autor**: Dr. Philipe Saraiva Cruz
**Última atualização**: 2025-10-28 19:45 BRT
**Status**: Aguardando deploy manual via browser
