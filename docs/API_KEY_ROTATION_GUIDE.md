# API Key Rotation Guide - Saraiva Vision

**Status**: 🔴 URGENTE - Chaves expostas no build de produção
**Data**: 2025-09-29
**Prioridade**: CRÍTICA

---

## 🚨 Chaves Expostas Detectadas

O script `./scripts/clean-build.sh` detectou as seguintes chaves expostas em builds anteriores:

### Google Maps API
```
Chave: YOUR_GOOGLE_MAPS_API_KEY_HERE
Arquivos: dist/assets/GoogleMapSimple-*.js, dist/assets/MapTestPage-*.js
Risco: Média (API key com restrições)
```

### Supabase Keys
```
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (parcial)
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (parcial)
Arquivos: dist/assets/supabaseClient-*.js, dist/assets/index-*.js
Risco: ALTO (acesso não autorizado ao banco)
```

---

## ✅ Correções Implementadas

### 1. Runtime Environment Loading
Implementado carregamento runtime de configuração para prevenir inlining:

**Arquivos Criados**:
- `src/config/runtime-env.js` - Loader de configuração runtime
- `api/config.js` - Endpoint seguro para servir configuração

**Arquivos Modificados**:
- `src/lib/supabase.ts` - Atualizado para usar `getEnvConfig()`

### 2. Como Funciona

**Development Mode**:
```javascript
// Usa variáveis de ambiente Vite diretamente
const config = await getEnvConfig();
// config.googleMapsApiKey vem de import.meta.env.VITE_GOOGLE_MAPS_API_KEY
```

**Production Mode**:
```javascript
// Faz fetch de endpoint seguro
const response = await fetch('/api/config');
const config = await response.json();
// config.googleMapsApiKey vem do servidor (process.env)
```

---

## 🔄 Procedimento de Rotação

### Passo 1: Rotacionar Google Maps API Key

#### 1.1 Acessar Google Cloud Console
```
https://console.cloud.google.com/apis/credentials
```

#### 1.2 Criar Nova Chave
1. Navegar para "Credentials" → "Create Credentials" → "API key"
2. Copiar nova chave gerada
3. Configurar restrições:
   - **Application restrictions**: HTTP referrers
   - **Website restrictions**:
     - `https://www.saraivavision.com.br/*`
     - `https://saraivavision.com.br/*`
   - **API restrictions**:
     - Maps JavaScript API
     - Places API
     - Maps Embed API

#### 1.3 Atualizar Variáveis de Ambiente
```bash
# No servidor VPS
sudo nano /var/www/saraiva-vision/.env.production

# Atualizar linha:
GOOGLE_MAPS_API_KEY=nova_chave_aqui  # SEM prefixo VITE_
GOOGLE_PLACES_API_KEY=nova_chave_aqui  # SEM prefixo VITE_
```

#### 1.4 Deletar Chave Antiga
1. Google Cloud Console → Credentials
2. Localizar chave antiga: `YOUR_GOOGLE_MAPS_API_KEY_HERE`
3. Clicar "Delete"
4. Confirmar deleção

**⏰ Timing**: Aguardar 5-10 minutos após deploy do novo build antes de deletar a chave antiga.

---

### Passo 2: Rotacionar Supabase Keys

#### 2.1 Acessar Supabase Dashboard
```
https://app.supabase.com/project/yluhrvsqdohxcnwwrekz/settings/api
```

#### 2.2 Regenerar Anon Key
1. Settings → API → Project API keys
2. "Anon key" section
3. Clicar "Regenerate" (ícone de rotação)
4. Copiar nova chave
5. Confirmar regeneração

#### 2.3 Regenerar Service Role Key (Se Exposta)
1. Settings → API → Project API keys
2. "Service role key" section
3. Clicar "Regenerate"
4. Copiar nova chave
5. Confirmar regeneração

**⚠️ ATENÇÃO**: Service role key dá acesso admin total ao banco. Apenas regenerar se confirmada exposição.

#### 2.4 Atualizar Variáveis de Ambiente
```bash
# No servidor VPS
sudo nano /var/www/saraiva-vision/.env.production

# Atualizar linhas:
SUPABASE_ANON_KEY=nova_chave_anon_aqui  # SEM prefixo VITE_
SUPABASE_SERVICE_ROLE_KEY=nova_service_key_aqui  # SEM prefixo VITE_
```

#### 2.5 Reiniciar Serviços API
```bash
sudo systemctl restart saraiva-api
sudo systemctl status saraiva-api
```

---

## 📋 Checklist de Rotação

### Pré-Deploy
- [ ] Implementar runtime environment loading (✅ Concluído)
- [ ] Criar endpoint `/api/config` (✅ Concluído)
- [ ] Atualizar `src/lib/supabase.ts` (✅ Concluído)
- [ ] Remover prefixos `VITE_` das variáveis sensíveis em `.env.production`

### Deploy
- [ ] Executar `npm run build` com novas configurações
- [ ] Verificar build com `./scripts/clean-build.sh`
- [ ] Confirmar que secrets NÃO aparecem no build
- [ ] Deploy para produção: `sudo cp -r dist/* /var/www/html/`
- [ ] Reload Nginx: `sudo systemctl reload nginx`

### Rotação de Chaves
- [ ] Rotacionar Google Maps API key no Google Cloud Console
- [ ] Atualizar `.env.production` com nova Google Maps key
- [ ] Rotacionar Supabase anon key no Supabase Dashboard
- [ ] Atualizar `.env.production` com nova Supabase anon key
- [ ] **NÃO rotacionar** service role key (não deve estar no frontend)
- [ ] Reiniciar serviços API: `sudo systemctl restart saraiva-api`

### Pós-Rotação
- [ ] Testar aplicação em produção (5-10 minutos)
- [ ] Verificar logs: `journalctl -u saraiva-api -f`
- [ ] Confirmar que Google Maps carrega corretamente
- [ ] Confirmar que Supabase auth funciona
- [ ] Deletar chaves antigas do Google Cloud Console
- [ ] Deletar chaves antigas do Supabase (automático após regeneração)

### Validação Final
- [ ] Executar `./scripts/clean-build.sh` novamente
- [ ] Confirmar 0 secrets detectados
- [ ] Monitorar logs por 24h para erros inesperados
- [ ] Atualizar documentação com novas keys rotacionadas

---

## 🔐 Boas Práticas de Segurança

### Variáveis de Ambiente

**✅ CORRETO** (Production):
```bash
# Servidor VPS - /var/www/saraiva-vision/.env.production
GOOGLE_MAPS_API_KEY=actual_key_here  # SEM VITE_ prefix
SUPABASE_ANON_KEY=actual_key_here    # SEM VITE_ prefix
```

**❌ ERRADO** (Build-time inlining):
```bash
# NÃO use prefixo VITE_ para chaves sensíveis
VITE_GOOGLE_MAPS_API_KEY=key  # ❌ Será inlined no build
VITE_SUPABASE_ANON_KEY=key    # ❌ Será inlined no build
```

### Restrições de API

**Google Maps API**:
- Sempre configurar HTTP referrer restrictions
- Limitar a domínios específicos apenas
- Habilitar apenas APIs necessárias
- Monitorar uso via Google Cloud Console

**Supabase**:
- Anon key: Sempre usar Row Level Security (RLS)
- Service role key: NUNCA no frontend, apenas backend
- Configurar RLS policies rigorosas
- Monitorar auth logs no Supabase Dashboard

---

## 📊 Monitoramento Pós-Rotação

### Logs a Verificar

**Nginx Access Logs**:
```bash
sudo tail -f /var/log/nginx/access.log | grep "/api/config"
```

**API Service Logs**:
```bash
journalctl -u saraiva-api -f
```

**Supabase Logs**:
```bash
# Via Supabase Dashboard
https://app.supabase.com/project/yluhrvsqdohxcnwwrekz/logs/auth-logs
```

### Métricas de Sucesso

- **0 secrets detectados** em `./scripts/clean-build.sh`
- **200 OK** em `/api/config` endpoint
- **Google Maps carregando** em homepage
- **Supabase auth funcionando** em contact form
- **Sem erros 401/403** nos logs

---

## 🆘 Troubleshooting

### Google Maps Não Carrega

**Sintoma**: Mapa não aparece ou erro de API key

**Soluções**:
1. Verificar `/api/config` retorna chave correta
2. Verificar restrições HTTP referrer no Google Cloud
3. Checar logs do navegador para erros específicos
4. Aguardar 5-10 minutos após rotação (propagação)

### Supabase Auth Falha

**Sintoma**: Erro 401 ou "Invalid API key"

**Soluções**:
1. Confirmar nova anon key está em `.env.production`
2. Reiniciar serviço API: `sudo systemctl restart saraiva-api`
3. Verificar RLS policies não foram alteradas
4. Checar Supabase project status no dashboard

### Endpoint /api/config Retorna 500

**Sintoma**: Fetch de config falha com 500 Internal Server Error

**Soluções**:
1. Verificar `api/config.js` foi deployado corretamente
2. Confirmar `express-rate-limit` está instalado: `npm install express-rate-limit`
3. Checar logs: `journalctl -u saraiva-api -n 50`
4. Verificar permissões do arquivo

---

## 📞 Contatos de Emergência

**Google Cloud Support**: https://cloud.google.com/support
**Supabase Support**: https://supabase.com/support
**VPS Provider**: [Conforme contrato]

---

**Última Atualização**: 2025-09-29
**Responsável**: DevOps Team
**Próxima Review**: Após rotação completa