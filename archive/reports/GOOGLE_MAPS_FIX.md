# Google Maps API - Diagnóstico e Solução

**Data**: 2025-10-10
**Status**: 🔴 PROBLEMA CRÍTICO IDENTIFICADO

## 🚨 Problema Identificado

A API do Google Maps não está carregando na produção devido a **faturamento desabilitado** no Google Cloud Console.

### Evidência do Erro

```json
{
  "error_message": "You must enable Billing on the Google Cloud Project at https://console.cloud.google.com/project/_/billing/enable",
  "status": "REQUEST_DENIED"
}
```

## 📊 Diagnóstico Completo

### ✅ Configuração Correta (Sistema)

1. **Variáveis de Ambiente**: ✅ Configuradas corretamente
   - `GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE`
   - `VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE`
   - `GOOGLE_PLACE_ID=ChIJVUKww7WRugARF7u2lAe7BeE`

2. **Endpoint /api/config**: ✅ Funcionando corretamente
   ```bash
   curl https://saraivavision.com.br/api/config
   # Retorna: {"googleMapsApiKey":"YOUR_GOOGLE_MAPS_API_KEY_HERE",...}
   ```

3. **CSP Headers**: ✅ Domínios permitidos
   - `script-src`: `https://maps.googleapis.com` ✅
   - `connect-src`: `https://maps.googleapis.com` ✅
   - `img-src`: `https://maps.googleapis.com https://maps.gstatic.com` ✅

4. **Código Frontend**: ✅ Runtime loading implementado
   - `src/lib/googleMapsKey.js` - Carregamento assíncrono via `/api/config`
   - Validação de chaves com `isValidGoogleMapsKey()`
   - Fallback para development

### ❌ Problema Identificado (Google Cloud)

**Causa Raiz**: Billing desabilitado no projeto do Google Cloud

**Impacto**:
- ❌ Google Maps API não carrega
- ❌ Google Places API retorna `REQUEST_DENIED`
- ❌ Todas as funcionalidades de mapas e localização não funcionam

## 🔧 Solução Necessária

### Passo 1: Habilitar Faturamento no Google Cloud Console

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Selecione o projeto que contém a chave `YOUR_GOOGLE_MAPS_API_KEY_HERE`
3. Vá para: **Billing** → **Link a billing account**
4. Habilite o faturamento (Google oferece $200 de créditos gratuitos mensais)

### Passo 2: Habilitar APIs Necessárias

No Google Cloud Console, habilite as seguintes APIs:

- ✅ Maps JavaScript API
- ✅ Places API
- ✅ Geocoding API
- ✅ Maps Static API (opcional)

### Passo 3: Configurar Restrições de Segurança (Recomendado)

1. **Application restrictions**:
   - HTTP referrers (websites)
   - Adicione: `https://saraivavision.com.br/*`
   - Adicione: `https://www.saraivavision.com.br/*`

2. **API restrictions**:
   - Restrict key (selecione apenas as APIs necessárias)
   - Maps JavaScript API
   - Places API
   - Geocoding API

## 🧪 Testes de Validação

Após habilitar o faturamento, execute:

```bash
# 1. Testar Places API
curl "https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJVUKww7WRugARF7u2lAe7BeE&key=YOUR_GOOGLE_MAPS_API_KEY_HERE&fields=name,rating"

# 2. Testar no navegador
# Acesse: https://saraivavision.com.br
# Verifique console para erros de Google Maps

# 3. Validar endpoint de config
curl https://saraivavision.com.br/api/config | jq '.googleMapsApiKey'
```

## 📋 Checklist de Verificação

- [x] Variáveis de ambiente configuradas
- [x] Endpoint /api/config funcionando
- [x] CSP headers permitindo Google Maps
- [x] Código de carregamento assíncrono implementado
- [ ] **Billing habilitado no Google Cloud Console** ⬅️ **AÇÃO NECESSÁRIA**
- [ ] APIs habilitadas no Google Cloud
- [ ] Restrições de segurança configuradas
- [ ] Testes de validação executados

## 🔐 Segurança da Chave Atual

A chave `YOUR_GOOGLE_MAPS_API_KEY_HERE` está:

- ✅ Não exposta no bundle JavaScript (carregamento runtime)
- ✅ Servida via endpoint seguro `/api/config`
- ✅ Rate-limited (30 req/15min)
- ⚠️ **Precisa de restrições de domínio após habilitar billing**

## 💡 Recomendações Adicionais

1. **Monitoring**:
   - Configurar alertas de quota no Google Cloud Console
   - Monitorar uso diário da API
   - Configurar budget alerts

2. **Custos**:
   - Maps JavaScript API: Primeiros 28.000 carregamentos/mês gratuitos
   - Places API: Primeiros 5.000 requests/mês gratuitos
   - Total estimado para site médico: < $20/mês

3. **Alternativas**:
   - Se custos forem um problema, considerar OpenStreetMap (gratuito)
   - Implementar cache mais agressivo de dados de localização
   - Usar mapa estático quando interatividade não for necessária

## 📞 Suporte

Se precisar de ajuda adicional:
- Google Cloud Console: https://console.cloud.google.com/support
- Documentação Maps API: https://developers.google.com/maps/documentation

---

**Ação Imediata**: Acesse o Google Cloud Console e habilite o faturamento para restaurar a funcionalidade do Google Maps.
