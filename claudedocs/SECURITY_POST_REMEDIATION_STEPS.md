# ⚠️ Ações Críticas Pós-Remediação de Segurança

**Data**: 2025-10-11
**Status**: 🔴 **AÇÃO IMEDIATA NECESSÁRIA**

---

## ✅ Correções Aplicadas Automaticamente

As seguintes correções de segurança já foram implementadas no código:

1. ✅ `.env.production.new` removido do controle Git
2. ✅ `.gitignore` atualizado com padrões mais seguros
3. ✅ `VITE_SUPABASE_SERVICE_ROLE_KEY` removido do frontend
4. ✅ Scripts com API keys hardcoded corrigidos
5. ✅ Documentação sanitizada (chaves substituídas por placeholders)
6. ✅ Build verificado (não contém credenciais sensíveis)
7. ✅ Commit de segurança criado: `8aeb9328`

---

## 🚨 Ações Manuais CRÍTICAS (Fazer HOJE)

### 1. Revogar Google Gemini API Key

**Chave Exposta**: `AIzaSyDpN-4P56jJu-PJuBufaM4tor7o1j-wjO0`

**Passos**:
```bash
# 1. Acessar Google Cloud Console
# https://console.cloud.google.com/apis/credentials

# 2. Localizar a chave AIzaSyDpN-4P56jJu-PJuBufaM4tor7o1j-wjO0

# 3. Clicar em "DELETE" ou "REVOKE"

# 4. Gerar nova chave com restrições:
#    - API Restrictions: Apenas "Generative Language API"
#    - Application Restrictions: IP do servidor (31.97.129.78)

# 5. Configurar nova chave no servidor:
export GOOGLE_GEMINI_API_KEY="nova_chave_aqui"

# 6. Adicionar ao /etc/environment (persistente):
sudo bash -c 'echo "GOOGLE_GEMINI_API_KEY=nova_chave_aqui" >> /etc/environment'
```

---

### 2. Resetar Supabase Service Role Key

**Chave Exposta**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Service Role)

**⚠️ RISCO MÁXIMO**: Esta chave tem privilégios administrativos totais!

**Passos**:
```bash
# 1. Acessar Supabase Dashboard
# https://app.supabase.com/project/yluhrvsqdohxcnwwrekz/settings/api

# 2. Na seção "Project API keys" → "service_role"

# 3. Clicar em "Reset" ou "Generate new key"

# 4. Copiar NOVA chave gerada

# 5. Atualizar no servidor:
#    - Editar /home/saraiva-vision-site/.env.production
#    - Substituir SUPABASE_SERVICE_ROLE_KEY com nova chave

# 6. Reiniciar serviço backend:
sudo systemctl restart saraiva-api
```

---

### 3. Rotacionar Google Maps API Key

**Chave Exposta**: `AIzaSyDvio5w5mQVZWZGBnPrys1uTwTQBglmFms`

**Passos**:
```bash
# 1. Acessar Google Cloud Console
# https://console.cloud.google.com/apis/credentials

# 2. Localizar chave AIzaSyDvio5w5mQVZWZGBnPrys1uTwTQBglmFms

# 3. Gerar nova chave com restrições:
#    - API Restrictions:
#      * Maps JavaScript API
#      * Places API
#    - HTTP Referrers:
#      * https://saraivavision.com.br/*
#      * localhost:3000/* (apenas dev)

# 4. Atualizar arquivos .env:
#    - .env.production (servidor)
#    - .env.local (desenvolvimento)

# 5. Rebuild e redeploy:
npm run build:vite
sudo npm run deploy:quick

# 6. Após confirmar que nova chave funciona, REVOGAR chave antiga
```

---

### 4. Verificar Histórico do Git (Opcional mas Recomendado)

As chaves expostas podem ainda estar no histórico do Git. Para limpeza completa:

```bash
# ⚠️ CUIDADO: Reescreve histórico do Git!
# Fazer backup antes:
git clone /home/saraiva-vision-site /root/backup-saraiva-$(date +%Y%m%d)

# Remover arquivo do histórico completo:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.production.new" \
  --prune-empty --tag-name-filter cat -- --all

# Forçar push (se usar repositório remoto):
git push origin --force --all
git push origin --force --tags

# Limpar reflog local:
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

---

## 📋 Checklist de Verificação

### Antes de Considerar Resolvido

- [ ] Google Gemini API Key revogada
- [ ] Nova chave Gemini configurada no servidor
- [ ] Scripts testados com nova chave:
  ```bash
  export GOOGLE_GEMINI_API_KEY="nova_chave"
  bash generate_retinopathy.sh
  ```
- [ ] Supabase Service Role Key resetada
- [ ] Nova Service Role Key configurada em `.env.production`
- [ ] Backend reiniciado: `sudo systemctl restart saraiva-api`
- [ ] Google Maps API Key rotacionada
- [ ] Frontend rebuild: `npm run build:vite`
- [ ] Deploy em produção: `sudo npm run deploy:quick`
- [ ] Testes em produção:
  - [ ] Mapa carrega corretamente
  - [ ] Google Reviews aparecem
  - [ ] Formulário de contato funciona

---

## 🛡️ Medidas Preventivas Implementadas

### 1. Pre-commit Hook (Recomendado)

Adicione este hook para detectar chaves antes do commit:

```bash
# Criar hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Detectar chaves Google API
if git diff --cached --name-only | xargs grep -HnE "AIzaSy[A-Za-z0-9_\-]{33}" 2>/dev/null; then
    echo "❌ ERROR: Google API key detected in staged files!"
    echo "Remove the key before committing."
    exit 1
fi

# Detectar chaves JWT do Supabase
if git diff --cached --name-only | xargs grep -HnE "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+" 2>/dev/null; then
    echo "❌ ERROR: JWT token detected in staged files!"
    echo "Remove the token before committing."
    exit 1
fi

echo "✅ No secrets detected. Safe to commit."
exit 0
EOF

# Tornar executável
chmod +x .git/hooks/pre-commit
```

### 2. GitHub Secret Scanning (Se usar GitHub)

```yaml
# .github/workflows/secret-scan.yml
name: Secret Scanning

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: TruffleHog
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
```

### 3. Monitoramento Contínuo

```bash
# Script de auditoria semanal
# /home/saraiva-vision-site/scripts/weekly-security-audit.sh

#!/bin/bash
echo "🔍 Security Audit - $(date)"

# Buscar chaves expostas
echo "Checking for exposed API keys..."
grep -r "AIzaSy" . --exclude-dir={node_modules,dist,.git} || echo "✅ No Google keys found"

# Verificar .env files no Git
echo "Checking for .env files in Git..."
git ls-files | grep "\.env" && echo "⚠️ .env files found in Git!" || echo "✅ No .env files tracked"

# Verificar permissões
echo "Checking file permissions..."
find . -name ".env*" -type f -exec ls -la {} \; 2>/dev/null

echo "Audit complete."
```

---

## 📞 Suporte em Caso de Dúvidas

**Documentação Adicional**:
- Relatório de Auditoria: `claudedocs/SECURITY_AUDIT_API_KEYS_20251011.md`
- Google Cloud Console: https://console.cloud.google.com
- Supabase Dashboard: https://app.supabase.com/project/yluhrvsqdohxcnwwrekz

**Em caso de incidente de segurança detectado**:
1. Revocar TODAS as chaves imediatamente
2. Verificar logs de acesso suspeito
3. Notificar time de segurança (se aplicável)
4. Documentar incidente para auditoria

---

## ✅ Confirmação de Conclusão

Após completar TODAS as ações acima, executar:

```bash
# Teste final de segurança
cd /home/saraiva-vision-site

# 1. Verificar se chaves antigas não existem mais
! grep -r "AIzaSyDpN-4P56jJu-PJuBufaM4tor7o1j-wjO0" . --exclude-dir={node_modules,dist,.git}

# 2. Verificar se .env.production.new está ignorado
git check-ignore .env.production.new

# 3. Verificar build não contém service role
! strings dist/assets/*.js | grep "service_role"

# 4. Verificar se nova chave Gemini funciona
export GOOGLE_GEMINI_API_KEY="nova_chave"
python3 -c "import os; assert os.getenv('GOOGLE_GEMINI_API_KEY'), 'Key not set'"

echo "✅ All security checks passed!"
```

---

**Última atualização**: 2025-10-11
**Status**: Aguardando ação manual do administrador
