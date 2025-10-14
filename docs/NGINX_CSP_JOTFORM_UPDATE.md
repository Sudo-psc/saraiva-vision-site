# Atualização do CSP para Jotform - Nginx

**Data**: 2025-10-13
**Autor**: Dr. Philipe Saraiva Cruz
**Status**: Pendente de Implementação

## Resumo

O widget de chatbot Jotform foi integrado em todas as páginas de lentes e planos do site. Quando o Content Security Policy (CSP) for reativado na configuração do Nginx, será necessário adicionar os domínios do Jotform à whitelist.

## Status Atual

O CSP está temporariamente **desabilitado** para testes desde 2025-10-09:
- **Arquivo**: `/etc/nginx/sites-enabled/saraivavision`
- **Linha**: 340 (comentada)

## Domínios Jotform que Precisam ser Adicionados

### Script Source (`script-src`)
```
https://cdn.jotfor.ms
https://*.jotfor.ms
```

### Connect Source (`connect-src`)
```
https://*.jotfor.ms
https://cdn.jotfor.ms
wss://*.jotfor.ms
```

### Frame Source (`frame-src`)
```
https://*.jotfor.ms
https://cdn.jotfor.ms
```

## CSP Atualizado Recomendado

Quando reativar o CSP na linha 340 de `/etc/nginx/sites-enabled/saraivavision`, use:

```nginx
add_header Content-Security-Policy-Report-Only "
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval'
        https://www.google.com
        https://www.gstatic.com
        https://cdn.pulse.is
        https://cdn.jotfor.ms
        https://*.jotfor.ms;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    font-src 'self' data:;
    connect-src 'self'
        https://saraivavision.com.br
        https://*.supabase.co
        wss://*.supabase.co
        https://lc.pulse.is
        https://maps.googleapis.com
        https://apolo.ninsaude.com
        https://*.ninsaude.com
        https://*.jotfor.ms
        https://cdn.jotfor.ms
        wss://*.jotfor.ms;
    frame-src 'self'
        https://www.google.com
        https://open.spotify.com
        https://*.spotify.com
        https://apolo.ninsaude.com
        https://*.ninsaude.com
        https://*.jotfor.ms
        https://cdn.jotfor.ms;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
" always;
```

## Páginas com Jotform Chatbot

### Páginas de Lentes
- `/lentes` (LensesPage.jsx)
- `/lentes-simple` (LensesPageSimple.jsx)

### Páginas de Planos
- `/planos` (PlansPage.jsx)
- `/planosonline` (PlanosOnlinePage.jsx)
- `/planobasico` (PlanBasicoPage.jsx)
- `/planopadrao` (PlanPadraoPage.jsx)
- `/planopremium` (PlanPremiumPage.jsx)

## Componente Implementado

**Arquivo**: `src/components/JotformChatbot.jsx`

```jsx
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const JotformChatbot = () => {
  useEffect(() => {
    return () => {
      const existingScript = document.querySelector('script[src*="jotfor.ms/agent/embedjs"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <Helmet>
      <script
        src="https://cdn.jotfor.ms/agent/embedjs/0199cb5550dc71e79d950163cd7d0d45fee0/embed.js"
        async
      />
    </Helmet>
  );
};

export default JotformChatbot;
```

## Script de URL Jotform
```
https://cdn.jotfor.ms/agent/embedjs/0199cb5550dc71e79d950163cd7d0d45fee0/embed.js
```

## Passos para Ativar o CSP com Jotform

1. Editar o arquivo de configuração do Nginx:
   ```bash
   sudo nano /etc/nginx/sites-enabled/saraivavision
   ```

2. Localizar a linha 340 (CSP desabilitado)

3. Remover o comentário `#` e atualizar com o CSP acima

4. Testar a configuração:
   ```bash
   sudo nginx -t
   ```

5. Recarregar o Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

6. Testar em produção:
   - Verificar console do navegador para erros CSP
   - Confirmar que o chatbot Jotform carrega corretamente
   - Verificar relatórios CSP no console

## Testes Recomendados

### Browser Console
```javascript
// Verificar se o script Jotform foi carregado
console.log([...document.scripts].filter(s => s.src.includes('jotfor.ms')));

// Verificar violações CSP
window.addEventListener('securitypolicyviolation', (e) => {
  console.log('CSP Violation:', e);
});
```

### Curl Test
```bash
curl -I https://saraivavision.com.br/planos | grep -i "content-security"
```

## Observações

- O CSP está em modo **Report-Only** (`Content-Security-Policy-Report-Only`)
- Isso significa que violações são registradas mas não bloqueadas
- Monitorar logs do navegador antes de ativar modo enforcement
- Considerar adicionar `report-uri` ou `report-to` para monitoramento centralizado

## Referências

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Jotform Developer Docs](https://www.jotform.com/developers/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

## Changelog

- **2025-10-13**: Documentação criada após integração do Jotform chatbot
- **2025-10-09**: CSP desabilitado temporariamente para testes

---

**IMPORTANTE**: Sempre testar CSP em ambiente de desenvolvimento antes de aplicar em produção!
