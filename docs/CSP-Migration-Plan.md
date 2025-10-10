# Plano de Migração CSP (Content Security Policy)

## Resumo da Análise

### Problemas Identificados
1. **JSX MIME Type Error**: Arquivos `.jsx` servidos como `application/octet-stream`
2. **CSP Reports 404**: Endpoint `/api/csp-reports` não existia
3. **API 503 Errors**: Backend com falhas de roteamento
4. **CSP Violations**: Múltiplas violações de políticas devido a domínios não autorizados

### Domínios Mapeados por Categoria

#### Google Analytics & Tag Manager
- `www.google-analytics.com`
- `ssl.google-analytics.com`
- `analytics.google.com`
- `www.googletagmanager.com`
- `tagmanager.google.com`
- `www.google.com`
- `www.gstatic.com`
- `ssl.gstatic.com`
- `google-analytics.com`
- `region1.google-analytics.com`

#### Google Ads & Marketing
- `googleads.g.doubleclick.net`
- `www.googletagservices.com`
- `tpc.googlesyndication.com`
- `bid.g.doubleclick.net`
- `stats.g.doubleclick.net`

#### Serviços de Chat e Third-Party
- `cdn.pulse.is`
- `app.posthog.com`
- `*.supabase.co`
- `wss://*.supabase.co`

#### Google Maps
- `maps.googleapis.com`
- `places.googleapis.com`

#### Integrações Ninsaude
- `apolo.ninsaude.com`
- `*.ninsaude.com`

## Políticas CSP

### Política Atual (Report-Only)
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://tagmanager.google.com https://www.google-analytics.com https://ssl.google-analytics.com https://maps.googleapis.com https://cdn.pulse.is https://app.posthog.com https://www.googletagservices.com https://googleads.g.doubleclick.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://tagmanager.google.com;
font-src 'self' https://fonts.gstatic.com data: https://fonts.googleapis.com;
img-src 'self' data: https: blob: https://www.google.com https://www.google-analytics.com https://www.googletagmanager.com https://ssl.gstatic.com https://www.gstatic.com https://www.googletagservices.com https://googleads.g.doubleclick.net https://stats.g.doubleclick.net;
connect-src 'self' https://analytics.saraivavision.com.br https://maps.googleapis.com https://places.googleapis.com https://saraivavision.com.br https://www.saraivavision.com.br https://*.supabase.co wss://*.supabase.co https://apolo.ninsaude.com https://*.ninsaude.com https://www.google-analytics.com https://ssl.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://app.posthog.com https://region1.google-analytics.com https://google-analytics.com;
frame-src 'self' https://www.google.com https://www.googletagmanager.com https://www.spotify.com https://*.ninsaude.com https://www.google.com https://tpc.googlesyndication.com https://bid.g.doubleclick.net;
media-src 'self' https: blob:;
worker-src 'self' blob:;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
manifest-src 'self';
block-all-mixed-content;
report-uri /api/csp-reports;
report-to csp-endpoint;
```

### Política de Produção (Enforce) - Para implementação futura
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://tagmanager.google.com https://www.google-analytics.com https://ssl.google-analytics.com https://maps.googleapis.com https://cdn.pulse.is https://app.posthog.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: https: blob: https://www.google.com https://www.google-analytics.com https://www.googletagmanager.com https://ssl.gstatic.com https://www.gstatic.com;
connect-src 'self' https://analytics.saraivavision.com.br https://maps.googleapis.com https://places.googleapis.com https://saraivavision.com.br https://www.saraivavision.com.br https://*.supabase.co wss://*.supabase.co https://apolo.ninsaude.com https://*.ninsaude.com https://www.google-analytics.com https://ssl.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://app.posthog.com;
frame-src 'self' https://www.google.com https://www.googletagmanager.com https://www.spotify.com https://*.ninsaude.com;
media-src 'self' https: blob:;
worker-src 'self' blob:;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
manifest-src 'self';
block-all-mixed-content;
```

## Plano de Migração

### Fase 1: Monitoramento (48-72 horas)
- ✅ Política CSP-Only ativa
- ✅ Endpoint de relatórios funcional
- ✅ Domínios necessários mapeados
- 📊 Coletar violações para análise

### Fase 2: Análise de Violações
- Analisar logs do endpoint `/api/csp-reports`
- Identificar padrões de violações
- Determinar domínios legítimos vs suspeitos

### Fase 3: Refinamento
- Remover domínios desnecessários
- Adicionar domínios legítimos faltantes
- Testar funcionalidades críticas

### Fase 4: Migração Gradual
- Implementar política enforce em modo de teste
- Monitorar comportamento do usuário
- Rollback planejado se necessário

## Cabeçalhos de Segurança Implementados

### Básicos
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

### Avançados
- `Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()`
- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`

## Recomendações Adicionais

### Subresource Integrity (SRI)
Implementar SRI para scripts críticos:
```html
<script integrity="sha384-..." src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### Monitoramento Contínuo
- Dashboard para visualização de violações CSP
- Alertas para picos anormais de violações
- Análise semanal de padrões de ataque

### Testes de Validação
- Testes automatizados de funcionalidades
- Verificação de integrações de terceiros
- Testes de usabilidade em diferentes browsers

## Comandos Úteis

### Verificar logs CSP
```bash
curl -X POST https://saraivavision.com.br/api/csp-reports \
  -H "Content-Type: application/json" \
  -d '{"csp-report": {"document-uri": "test", "violated-directive": "test"}}'
```

### Verificar headers CSP
```bash
curl -I https://saraivavision.com.br | grep -i "content-security-policy"
```

### Reload Nginx após mudanças
```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Status Atual

- ✅ JSX MIME Type corrigido
- ✅ CSP Reports endpoint funcional
- ✅ API endpoints (/api/ga, /api/gtm) criados
- ✅ Cabeçalhos de segurança configurados
- ✅ Política CSP Report-Only ativa
- 📊 Monitoramento em andamento

## Próximos Passos

1. **Aguardar 48 horas** para coleta de violações
2. **Analisar logs** do endpoint CSP
3. **Refinar política** com base nos dados
4. **Testar enforce mode** em ambiente de staging
5. **Implementar produção** após validação

---
*Atualizado: 2025-10-08*
*Responsável: Claude Security Analysis*