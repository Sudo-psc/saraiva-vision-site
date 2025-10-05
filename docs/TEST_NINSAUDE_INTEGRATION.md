# 🧪 Testar Integração Ninsaúde - Guia Completo

## ⚠️ Resultado do Teste Atual

```
❌ ERRO NA AUTENTICAÇÃO
Status: 400
Error: "As suas informações não são válidas. Verifique."
```

**Motivo:** As credenciais fornecidas não estão corretas ou a conta precisa de configuração adicional.

---

## 🔑 Configurar Credenciais Corretas

### 1. Verificar Credenciais no Painel Ninsaúde

Acesse: https://app.ninsaude.com

**Verificar:**
- ✅ Nome da conta (account)
- ✅ Usuário (username)
- ✅ Senha (password)
- ✅ ID da Unidade de Atendimento (accountUnit)

### 2. Atualizar `.env.local`

```bash
cd /home/saraiva-vision-site
nano .env.local
```

**Editar as linhas:**
```env
NINSAUDE_API_URL=https://api.ninsaude.com/v1
NINSAUDE_ACCOUNT=sua_conta_correta
NINSAUDE_USERNAME=seu_usuario_correto
NINSAUDE_PASSWORD=sua_senha_correta
NINSAUDE_ACCOUNT_UNIT=id_unidade
```

---

## 🧪 Rodar Testes

### Teste 1: Autenticação OAuth2

```bash
node scripts/test-ninsaude-oauth.cjs
```

**Saída Esperada (Sucesso):**
```
✅ AUTENTICAÇÃO BEM-SUCEDIDA!

📝 Tokens recebidos:
   Access Token: eyJ0eXAiOiJKV1QiLCJhbGc...
   Refresh Token: def502004f3c8b2e...
   Token Type: Bearer
   Expires In: 900 segundos (15 minutos)

✅ LISTAGEM BEM-SUCEDIDA!

📝 Unidades encontradas:
   1. Clínica Saraiva Vision
      ID: 1
      Ativo: Sim
      Telefone: 33988776655
```

---

### Teste 2: Testes Unitários (Sistema de Agendamento)

```bash
npm run test:run -- \
  src/hooks/__tests__/usePhoneMask.test.js \
  src/hooks/__tests__/useNinsaudeScheduling.test.js \
  src/components/scheduling/__tests__/AppointmentScheduler.simple.test.jsx
```

**Resultado Esperado:**
```
Test Files: 3 passed (3)
Tests: 32 passed (32) ✅
Duration: ~4.5s
```

---

## 🔍 Troubleshooting

### Erro: "invalid_request"

**Possíveis causas:**
1. Nome da conta incorreto
2. Usuário não existe
3. Senha incorreta
4. Unidade de atendimento inválida
5. Conta não tem permissão para API

**Solução:**
- Verificar credenciais no painel Ninsaúde
- Contatar suporte: suporte@ninsaude.com
- Verificar se API está habilitada para a conta

---

### Erro: "unauthorized"

**Causa:** Usuário sem permissão para acessar API

**Solução:**
- Verificar permissões do usuário no painel
- Configurações → Usuários → Permissões → API

---

### Erro: "account_unit not found"

**Causa:** ID da unidade incorreto

**Solução:**
```bash
# Listar unidades disponíveis (após login)
curl -X GET https://api.ninsaude.com/v1/account_geral/listar \
  -H "Authorization: bearer SEU_ACCESS_TOKEN"
```

---

## 📝 Obter Credenciais Corretas

### Método 1: Painel Web

1. Acesse https://app.ninsaude.com
2. Login → Configurações
3. Usuários → Ver credenciais API
4. Copiar: account, username, accountUnit

### Método 2: Suporte Ninsaúde

Email: suporte@ninsaude.com

**Informações a solicitar:**
- Nome da conta (account)
- Como obter credenciais de API
- ID da unidade de atendimento
- Permissões necessárias para agendamento online

---

## 🔐 Teste Manual (cURL)

### 1. Login
```bash
curl -X POST https://api.ninsaude.com/v1/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "account=SUA_CONTA" \
  -d "username=SEU_USUARIO" \
  -d "password=SUA_SENHA" \
  -d "accountUnit=1"
```

### 2. Listar Unidades (com access_token)
```bash
curl -X GET "https://api.ninsaude.com/v1/account_geral/listar?limit=5" \
  -H "Authorization: bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Listar Horários Disponíveis
```bash
curl -X GET "https://api.ninsaude.com/v1/agenda/horarios-disponiveis?date=2025-10-15&ativo=1" \
  -H "Authorization: bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📊 Status Atual

```
✅ Sistema de agendamento implementado
✅ OAuth2 configurado
✅ API Routes criadas (Next.js)
✅ Testes unitários (32/32 passando)
✅ Documentação completa
❌ Credenciais Ninsaúde inválidas (aguardando correção)
```

---

## 🚀 Próximos Passos

### Após Obter Credenciais Corretas:

1. **Atualizar `.env.local`** com credenciais válidas

2. **Testar Autenticação:**
   ```bash
   node scripts/test-ninsaude-oauth.cjs
   ```

3. **Iniciar Next.js:**
   ```bash
   npm run dev
   ```

4. **Testar Interface:**
   ```
   http://localhost:3000/agendamento
   ```

5. **Verificar Fluxo Completo:**
   - Login OAuth2 ✅
   - Listar horários ✅
   - Criar agendamento ✅
   - Cancelar agendamento ✅

---

## 📞 Contatos

**Ninsaúde:**
- Suporte: suporte@ninsaude.com
- Docs: https://docs.ninsaude.com
- Painel: https://app.ninsaude.com

**Equipe Desenvolvimento:**
- Email: equipe@saraivavision.com.br
- Docs do Sistema: `docs/NINSAUDE_API_REFERENCE.md`

---

## 📚 Referências

- `scripts/test-ninsaude-oauth.cjs` - Script de teste
- `docs/NINSAUDE_API_REFERENCE.md` - API completa
- `docs/NINSAUDE_OAUTH_SETUP.md` - Setup OAuth2
- `docs/NEXTJS_SCHEDULING_GUIDE.md` - Guia Next.js

---

**Status:** ⏳ Aguardando credenciais válidas do Ninsaúde  
**Última Atualização:** Outubro 2025  
**Testes Unitários:** 32/32 ✅  
**Integração Ninsaúde:** Pendente credenciais
