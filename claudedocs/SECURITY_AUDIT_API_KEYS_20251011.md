# 🔒 Auditoria de Segurança - Exposição de Chaves API
**Data**: 2025-10-11
**Auditor**: Claude Code (Automated Security Review)
**Escopo**: Repositório Saraiva Vision - Chaves API e Credenciais Expostas

---

## 📋 Sumário Executivo

**Severidade Geral**: 🔴 **CRÍTICA**

Foram identificadas **múltiplas exposições de credenciais sensíveis** no repositório, incluindo:
- ✅ Chaves Google API expostas em scripts
- ✅ Arquivo `.env.production.new` rastreado pelo Git com credenciais reais
- ✅ Supabase Service Role Key (privilégios administrativos) potencialmente exposta ao frontend
- ✅ Hardcoded fallbacks de API keys em scripts Python

**Risco de Segurança**: Alto - Credenciais expostas podem permitir:
- Acesso não autorizado a serviços Google (cobrança indevida)
- Manipulação de dados no Supabase (LGPD/GDPR violation)
- Vazamento de dados sensíveis de pacientes

---

## 🚨 Vulnerabilidades Críticas

### 1. Google Gemini API Key Hardcoded em Scripts Shell
**Severidade**: 🔴 CRÍTICA
**Impacto**: Uso indevido, cobrança não autorizada

**Arquivos Afetados**:
```bash
/home/saraiva-vision-site/generate_retinopathy.sh:3
/home/saraiva-vision-site/generate_retinopathy_curl.sh:3
```

**Chave Exposta**:
```
AIzaSyDpN-4P56jJu-PJuBufaM4tor7o1j-wjO0
```

**Código Vulnerável**:
```bash
API_KEY="AIzaSyDpN-4P56jJu-PJuBufaM4tor7o1j-wjO0"
```

**Remediação Imediata**:
1. **Revogar chave** no Google Cloud Console
2. Gerar nova chave com restrições:
   - Apenas IP do servidor VPS (31.97.129.78)
   - Apenas API Imagen habilitada
3. Armazenar em variável de ambiente:
```bash
# Em /etc/environment ou ~/.bashrc
export GOOGLE_GEMINI_API_KEY="nova_chave_aqui"
```
4. Atualizar scripts:
```bash
API_KEY="${GOOGLE_GEMINI_API_KEY}"
```
5. Adicionar ao `.gitignore`:
```
generate_retinopathy*.sh
```

---

### 2. Arquivo .env.production.new Rastreado pelo Git
**Severidade**: 🔴 CRÍTICA
**Impacto**: Exposição total de credenciais de produção

**Arquivo**: `/home/saraiva-vision-site/.env.production.new`

**Credenciais Expostas**:
- ✅ Google Maps API Key: `AIzaSyDvio5w5mQVZWZGBnPrys1uTwTQBglmFms`
- ✅ Supabase URL e Anon Key (públicas, OK)
- ✅ **Supabase Service Role Key** (CRÍTICO - privilégios admin):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsdWhydnNxZG9oeGNud3dyZWt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDI1MzI1NSwiZXhwIjoyMDU1ODI5MjU1fQ.7Grl8iQbJ-yZSUGTBwQjWxoGJTeDFg3fNHa8ZJ4VQBA
```

**Remediação Imediata**:
1. **Remover do Git**:
```bash
git rm --cached .env.production.new
git commit -m "security: Remove exposed .env.production.new from repository"
```

2. **Adicionar ao .gitignore**:
```bash
echo ".env.production.new" >> .gitignore
echo ".env*.new" >> .gitignore
```

3. **Rotacionar todas as credenciais expostas**:
   - Google Maps API: Criar nova chave no GCP Console
   - Supabase Service Role: **URGENTE** - Resetar no dashboard Supabase

4. **Limpar histórico do Git** (se necessário):
```bash
# CUIDADO: Reescreve histórico
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.production.new" \
  --prune-empty --tag-name-filter cat -- --all
```

---

### 3. Supabase Service Role Key Exposta ao Frontend
**Severidade**: 🔴 CRÍTICA
**Impacto**: Bypass completo de segurança, acesso admin não autorizado

**Evidência**:
```typescript
// src/vite-env.d.ts
readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string
```

**Problema**: Variáveis com prefixo `VITE_` são **inlined no bundle JavaScript** e expostas ao navegador!

**Remediação Imediata**:
1. **Remover do vite-env.d.ts**:
```typescript
// ❌ REMOVER ESTA LINHA
readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string

// ✅ Service Role deve ser apenas backend
```

2. **Verificar se está sendo usada no frontend**:
```bash
grep -r "VITE_SUPABASE_SERVICE_ROLE_KEY" src/
```

3. **Atualizar código** para usar apenas `SUPABASE_SERVICE_ROLE_KEY` (sem `VITE_`) no backend:
```javascript
// ✅ Backend (Node.js/Express)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ❌ Frontend (NUNCA fazer isso)
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
```

---

### 4. Google Gemini API Key Hardcoded em Scripts Python
**Severidade**: 🟡 MÉDIA
**Impacto**: Uso indevido em caso de vazamento

**Arquivo**: `/home/saraiva-vision-site/scripts/generate-unique-covers.py:16`

**Código Vulnerável**:
```python
API_KEY = os.environ.get('GOOGLE_GEMINI_API_KEY', 'AIzaSyDpN-4P56jJu-PJuBufaM4tor7o1j-wjO0')
```

**Remediação**:
```python
# ✅ Sem fallback hardcoded
API_KEY = os.environ.get('GOOGLE_GEMINI_API_KEY')
if not API_KEY:
    raise ValueError("GOOGLE_GEMINI_API_KEY environment variable not set")
```

---

### 5. Múltiplas Chaves Google Maps em Documentação
**Severidade**: 🟡 MÉDIA
**Impacto**: Exposição pública se documentação for commitada

**Arquivos Afetados**:
- `docs/GOOGLE_REVIEWS_INTEGRATION.md`
- `docs/API_KEY_ROTATION_GUIDE.md`
- `GOOGLE_MAPS_FIX.md`
- `docs/Security-Fixes-Report.md`

**Chave Exposta**: `AIzaSyDvio5w5mQVZWZGBnPrys1uTwTQBglmFms`

**Remediação**:
1. Substituir por placeholders:
```markdown
# ❌ Antes
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDvio5w5mQVZWZGBnPrys1uTwTQBglmFms

# ✅ Depois
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

2. Adicionar nota de segurança:
```markdown
⚠️ **IMPORTANTE**: Nunca commitar chaves reais neste arquivo.
```

---

## 🛡️ Arquivos Corretamente Protegidos

✅ **Boas práticas identificadas**:
- `.env.production` e `.env.beta` estão no `.gitignore` (linhas 119-120)
- Arquivos de teste usam mocks (`mock-recaptcha-token`, `test-access-token`)
- Documentação contém apenas exemplos com placeholders

---

## 📝 Checklist de Remediação

### Ações Imediatas (Próximas 24h)

- [ ] **Revogar Google Gemini API Key**: `AIzaSyDpN-4P56jJu-PJuBufaM4tor7o1j-wjO0`
- [ ] **Resetar Supabase Service Role Key** no dashboard
- [ ] **Remover .env.production.new do Git**: `git rm --cached .env.production.new`
- [ ] **Rotacionar Google Maps API Key**: `AIzaSyDvio5w5mQVZWZGBnPrys1uTwTQBglmFms`
- [ ] **Remover VITE_SUPABASE_SERVICE_ROLE_KEY** de `vite-env.d.ts`
- [ ] **Atualizar scripts** para usar variáveis de ambiente sem fallbacks

### Ações de Médio Prazo (Próxima Semana)

- [ ] Implementar **secret scanning** no CI/CD (GitHub Actions)
- [ ] Adicionar **pre-commit hook** para detectar credenciais:
```bash
#!/bin/bash
# .git/hooks/pre-commit
git diff --cached --name-only | xargs grep -HnE "AIzaSy[A-Za-z0-9_\-]{33}" && exit 1
```
- [ ] Documentar procedimento de rotação de chaves em `docs/SECURITY.md`
- [ ] Configurar alertas de segurança no Google Cloud Console
- [ ] Revisar permissões de chaves API (princípio do menor privilégio)

### Ações de Longo Prazo (Próximo Mês)

- [ ] Migrar para **Google Secret Manager** ou **HashiCorp Vault**
- [ ] Implementar **rotation automática** de credenciais (90 dias)
- [ ] Treinar equipe sobre boas práticas de segurança
- [ ] Realizar auditoria de segurança trimestral
- [ ] Implementar **2FA** em todas as contas de serviço

---

## 🔐 Boas Práticas Recomendadas

### 1. Gestão de Secrets

```bash
# ✅ BOM: Usar variáveis de ambiente
export GOOGLE_API_KEY="sua_chave_aqui"

# ❌ RUIM: Hardcoded no código
const API_KEY = "AIzaSy..."
```

### 2. Prefixos Vite

```bash
# ✅ BOM: Backend only (NÃO exposto)
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...

# ✅ BOM: Frontend (público, OK expor)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# ❌ RUIM: Prefixo VITE_ em chave sensível
VITE_SUPABASE_SERVICE_ROLE_KEY=...
```

### 3. .gitignore

```bash
# ✅ Sempre ignorar
.env
.env.local
.env.production
.env.production.new
.env.beta
.env*.backup

# ✅ Commitar apenas templates
.env.example
.env.production.template
```

### 4. Documentação

```markdown
# ✅ BOM: Placeholder
GOOGLE_API_KEY=your_api_key_here

# ❌ RUIM: Chave real
GOOGLE_API_KEY=AIzaSyDpN...
```

---

## 📊 Resumo de Exposições

| Tipo | Severidade | Quantidade | Status |
|------|-----------|------------|--------|
| Google API Keys | 🔴 Crítica | 2 chaves | Exposta |
| Supabase Service Role | 🔴 Crítica | 1 chave | Exposta |
| Arquivos .env rastreados | 🔴 Crítica | 1 arquivo | Exposto |
| Scripts com fallbacks | 🟡 Média | 3 arquivos | Vulnerável |
| Docs com chaves reais | 🟡 Média | 4 arquivos | Exposto |

**Total de Credenciais Comprometidas**: 🔴 **4 chaves únicas**

---

## 🎯 Priorização de Ações

### P0 - Crítico (Hoje)
1. Revogar Google Gemini API Key (`AIzaSyDpN-4P56jJu-PJuBufaM4tor7o1j-wjO0`)
2. Resetar Supabase Service Role Key
3. Remover `.env.production.new` do Git

### P1 - Alto (Esta Semana)
1. Rotacionar Google Maps API Key (`AIzaSyDvio5w5mQVZWZGBnPrys1uTwTQBglmFms`)
2. Limpar chaves de documentação
3. Remover `VITE_SUPABASE_SERVICE_ROLE_KEY` do frontend

### P2 - Médio (Próximas 2 Semanas)
1. Implementar secret scanning
2. Adicionar pre-commit hooks
3. Documentar procedimentos de segurança

---

## 📞 Contatos de Emergência

**Em caso de incidente de segurança**:
- Google Cloud Console: https://console.cloud.google.com/iam-admin/serviceaccounts
- Supabase Dashboard: https://app.supabase.com/project/yluhrvsqdohxcnwwrekz/settings/api
- Resend API Keys: https://resend.com/api-keys

---

## ✅ Verificação Pós-Remediação

Após aplicar as correções, executar:

```bash
# 1. Verificar se chaves foram removidas do Git
git log --all -- .env.production.new

# 2. Buscar por chaves remanescentes
grep -r "AIzaSy" . --exclude-dir={node_modules,dist,.git}

# 3. Verificar build frontend não contém service role key
npm run build:vite && strings dist/assets/*.js | grep "service_role"

# 4. Confirmar .gitignore atualizado
git check-ignore .env.production.new
```

---

**Relatório gerado automaticamente por Claude Code**
**Próxima auditoria recomendada**: 2025-11-11 (1 mês)
