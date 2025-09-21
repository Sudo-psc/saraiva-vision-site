# Vercel Environment Checklist

Use esta lista para configurar todas as variáveis do projeto no painel do Vercel (`Project Settings → Environment Variables`). Marque cada item após definir o valor em **Production**, **Preview** e **Development** quando aplicável.

| Variável | Ambiente | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `VITE_SITE_URL` | Production/Preview | ✅ | URL pública do site utilizada para metadados e geração de links canônicos. |
| `VITE_API_URL` | Todos | ✅ | Base URL para chamadas ao `/api` hospedado no Vercel. Use `https://<project>.vercel.app/api`. |
| `VITE_WORDPRESS_URL` | Todos | ✅ | URL do WordPress headless utilizado para conteúdo. |
| `VITE_WORDPRESS_API_URL` | Todos | ✅ | Endpoint REST do WordPress (`/wp-json/wp/v2`). |
| `VITE_RECAPTCHA_SITE_KEY` | Todos | ✅ | Site key do Google reCAPTCHA v3 usada no frontend. |
| `RECAPTCHA_SECRET` | Todos | ✅ | Secret key do reCAPTCHA consumida na função `/api/contact`. |
| `RESEND_API_KEY` | Todos | ✅ | Token da API Resend para envio de e-mails de contato. |
| `CONTACT_EMAIL_TO` | Todos | ✅ | Destinatários (separados por vírgula) das mensagens de contato. |
| `CONTACT_EMAIL_FROM` | Todos | ✅ | Endereço remetente exibido no Resend (ex.: `noreply@saraivavision.com.br`). |
| `VITE_SUPABASE_URL` | Todos | ✅ | URL do projeto Supabase para features que consomem dados. |
| `VITE_SUPABASE_ANON_KEY` | Todos | ✅ | Chave anônima do Supabase utilizada no navegador. |
| `SUPABASE_SERVICE_KEY` | Opcional | ⚠️ | Necessário apenas se alguma função serverless precisar de permissões elevadas. |
| `VITE_GOOGLE_MAPS_API_KEY` | Todos | ✅ | Chave do Google Maps usada nos mapas e rotas. |
| `VITE_GOOGLE_PLACE_ID` | Todos | ✅ | Place ID da clínica para reviews e rich snippets. |
| `VITE_GTM_ID` | Todos | ✅ | ID do Google Tag Manager habilitado após consentimento. |
| `VITE_GA_MEASUREMENT_ID` | Todos | ✅ | ID do Google Analytics 4. |
| `CONTACT_ALLOW_INSECURE_RECAPTCHA` | Development | Opcional | Ajuste para `true` apenas em ambientes locais quando quiser pular a validação do reCAPTCHA. |
| `VERCEL_ENV` | Automático | ✅ | Variável gerenciada pelo Vercel. Apenas confirme que aparece em *Runtime Logs*. |

## Passos de Configuração

1. Execute `npm run vercel:pull` para sincronizar secrets locais antes do deploy, se necessário.
2. No painel do Vercel, crie cada variável da tabela acima e defina valores por ambiente (Production, Preview, Development).
3. Clique em **Encrypt** para todas as variáveis sensíveis (`RESEND_API_KEY`, `RECAPTCHA_SECRET`, chaves Supabase etc.).
4. Após salvar, utilize o botão **Redeploy** para aplicar as variáveis no ambiente desejado.
5. Valide o endpoint `/api/contact` em produção utilizando `curl` ou o formulário do site. O payload deve retornar `200` com `ok: true`.
6. Revise os logs do Vercel (aba *Functions*) para garantir que as funções estejam usando `nodejs22.x` e que não existam erros de permissão.

> **Dica:** mantenha um documento interno com os valores originais criptografados (ex.: 1Password/Bitwarden) e limite o acesso somente à equipe autorizada conforme a LGPD.
