# CSP (Content Security Policy) - Atualização 2025-10-10

## 📋 Resumo das Alterações

**Data**: 2025-10-10
**Arquivo**: `/etc/nginx/sites-enabled/saraivavision` (linha 364-365)
**Motivo**: Remoção do formulário SendPulse do código frontend

---

## 🔴 Domínios Removidos

### SendPulse (completamente removido)
- ❌ `https://web.webformscr.com`
- ❌ `https://login.sendpulse.com`
- ❌ `https://forms.sendpulse.com`
- ❌ `https://gp.webformscr.com`

**Justificativa**: O formulário SendPulse foi removido completamente do código em `src/pages/LensesPage.jsx`, tornando essas permissões desnecessárias e representando uma superfície de ataque desnecessária.

---

## ✅ Domínios Adicionados

### Google Analytics
- ✅ `https://www.google-analytics.com`
- ✅ `https://region1.google-analytics.com`

**Justificativa**: Suporte completo ao Google Analytics 4 (GA4) para rastreamento de métricas.

### Google Maps
- ✅ `https://maps.googleapis.com` (script-src, connect-src, img-src)
- ✅ `https://maps.gstatic.com` (img-src)

**Justificativa**: Suporte completo ao Google Maps integrado no site.

### Media Sources
- ✅ `media-src 'self' blob: data:`

**Justificativa**: Suporte para vídeos (como Hero-12.mp4) e outros elementos de mídia inline.

---

## 📊 Configuração Atual do CSP

### Modo
**Report-Only**: ✅ Habilitado
O CSP está em modo de relatório, permitindo monitoramento sem bloquear recursos.

### Diretivas Configuradas

#### 1. **default-src**
```
'self'
```
Permite recursos apenas do próprio domínio por padrão.

#### 2. **script-src**
```
'self' 'unsafe-inline' 'unsafe-eval'
https://www.google.com
https://www.gstatic.com
https://ajax.googleapis.com
https://cdnjs.cloudflare.com
https://www.googletagmanager.com
https://cdn.jotfor.ms
https://www.jotform.com
https://maps.googleapis.com
```

**⚠️ Nota de Segurança**:
- `'unsafe-inline'`: Necessário para GTM e analytics inline
- `'unsafe-eval'`: Necessário para algumas bibliotecas JavaScript
- **Recomendação**: Migrar para nonces em vez de `unsafe-inline` quando possível

#### 3. **style-src**
```
'self' 'unsafe-inline'
https://cdnjs.cloudflare.com
https://fonts.googleapis.com
```

#### 4. **img-src**
```
'self' data: https: blob:
https://saraivavision.com.br
https://maps.googleapis.com
https://maps.gstatic.com
```

**Nota**: `https:` permite todas as imagens HTTPS (necessário para conteúdo dinâmico).

#### 5. **font-src**
```
'self' data:
https://fonts.gstatic.com
```

#### 6. **connect-src** (AJAX/Fetch/WebSocket)
```
'self'
https://saraivavision.com.br
https://*.supabase.co
wss://*.supabase.co
https://maps.googleapis.com
https://apolo.ninsaude.com
https://*.ninsaude.com
https://www.googletagmanager.com
https://cdn.jotfor.ms
https://www.jotform.com
https://www.google-analytics.com
https://region1.google-analytics.com
```

#### 7. **frame-src** (iframes)
```
'self'
https://www.google.com
https://www.googletagmanager.com
https://open.spotify.com
https://*.spotify.com
https://apolo.ninsaude.com
https://*.ninsaude.com
https://www.jotform.com
```

#### 8. **media-src** (vídeos/áudio)
```
'self' blob: data:
```

**Novo**: Adicionado para suporte a vídeos como Hero-12.mp4.

#### 9. **form-action**
```
'self'
https://www.jotform.com
```

#### 10. **Diretivas de Segurança**
```
object-src 'none'     # Bloqueia <object>, <embed>, <applet>
base-uri 'self'       # Restringe <base> tag
```

---

## 🔍 Verificação da Atualização

### Comando de Verificação
```bash
curl -s -I https://saraivavision.com.br/ | grep -i "content-security-policy"
```

### Status
✅ **Aplicado em produção**
- SendPulse: ❌ Removido
- Google Analytics: ✅ Adicionado
- Google Maps: ✅ Adicionado
- Media Sources: ✅ Adicionado
- Nginx: ✅ Recarregado
- Sintaxe: ✅ Validada

---

## 📈 Próximos Passos Recomendados

### 1. **Monitoramento de Violações CSP**
Configurar endpoint para receber relatórios de violação:
```nginx
add_header Content-Security-Policy-Report-Only "... report-uri /api/csp-reports;" always;
```

### 2. **Migrar para Modo Enforcing**
Após período de monitoramento (recomendado: 30 dias):
```nginx
# Trocar de:
add_header Content-Security-Policy-Report-Only "..." always;

# Para:
add_header Content-Security-Policy "..." always;
```

### 3. **Implementar Nonces**
Substituir `'unsafe-inline'` por nonces dinâmicos:
```html
<script nonce="random-value-here">
```

### 4. **Remover 'unsafe-eval'**
Revisar dependências que requerem `eval()` e buscar alternativas.

### 5. **Adicionar Subresource Integrity (SRI)**
Para scripts de terceiros:
```html
<script src="https://cdn.example.com/script.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```

---

## 📝 Histórico de Mudanças

| Data | Versão | Mudanças | Autor |
|------|--------|----------|-------|
| 2025-10-10 | 3.0 | Remoção completa do SendPulse, adição de GA4 e Google Maps | Dr. Philipe Saraiva Cruz |
| 2025-10-10 | 2.1 | Configuração inicial com SendPulse, GTM e Jotform | Dr. Philipe Saraiva Cruz |

---

## 🔒 Impacto de Segurança

### Melhorias
✅ Redução da superfície de ataque (4 domínios SendPulse removidos)
✅ Princípio do menor privilégio aplicado
✅ Política mais restritiva e focada

### Riscos Mitigados
- ❌ XSS via SendPulse desconhecido
- ❌ Data exfiltration via domínios não utilizados
- ❌ Clickjacking em formulários SendPulse

---

## 📞 Contato

**Responsável**: Dr. Philipe Saraiva Cruz
**Clínica**: Saraiva Vision - Oftalmologia
**Data**: 2025-10-10
