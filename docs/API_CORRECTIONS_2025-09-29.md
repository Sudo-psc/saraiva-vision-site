# WordPress API Endpoint Corrections - 2025-09-29

## 📋 Resumo das Correções

Todas as referências de API do WordPress foram corrigidas para usar o subdomínio correto:
- ❌ **Antes**: `blog.saraivavision.com.br` (retorna HTML com tema WordPress)
- ✅ **Depois**: `cms.saraivavision.com.br` (retorna JSON via REST API)

## 🎯 Arquitetura dos Subdomínios

### blog.saraivavision.com.br
- **Propósito**: Renderização HTML com tema WordPress
- **Uso**: Interface pública de visualização do blog
- **Acesso**: Usuários finais navegando pelo site
- **Exceção**: `/wp-admin` redirect mantido para acesso administrativo

### cms.saraivavision.com.br
- **Propósito**: API REST JSON para headless CMS
- **Uso**: Integração React SPA via WordPressBlogService
- **Acesso**: Aplicação React fazendo chamadas API
- **Endpoints**: `/wp-json/wp/v2/*`, `/graphql` (se configurado)

## 📁 Arquivos Corrigidos

### Variáveis de Ambiente
1. **`.env`**
   - `VITE_WORDPRESS_API_URL=https://cms.saraivavision.com.br`

2. **`.env.local`**
   - `WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql`
   - `WORDPRESS_DOMAIN=https://cms.saraivavision.com.br`
   - `VITE_WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql`

3. **`.env.production.template`**
   - Todos os URLs do WordPress corrigidos
   - Comentários explicativos adicionados sobre blog vs cms

### Código Frontend
4. **`src/lib/graphqlClient.ts`**
   - Fallback URL do REST API: `https://cms.saraivavision.com.br`

5. **`src/lib/wordpress-compat.js`**
   - `blogService` baseURL: `https://cms.saraivavision.com.br`
   - `cmsBaseURL`: `https://cms.saraivavision.com.br`

6. **`src/services/WordPressBlogService.js`**
   - Default baseURL constructor: `https://cms.saraivavision.com.br`

### Código Backend
7. **`api/src/routes/services/status.js`**
   - WordPress health check URL: `https://cms.saraivavision.com.br/wp-json/wp/v2/posts?per_page=1`

8. **`api/health-check.js`**
   - WEBSITES array: removido `blog.saraivavision.com.br`, mantido apenas `cms.saraivavision.com.br`
   - APIS array: `https://cms.saraivavision.com.br/wp-json/wp/v2/posts?per_page=1`

### Testes
9. **`api/__tests__/wordpress-jwt-api.test.js`**
   - Mock environment URL: `https://cms.saraivavision.com.br`

10. **`api/test-wordpress-jwt-flow.js`**
    - Test baseURL: `https://cms.saraivavision.com.br`

## ✅ Verificação de Integridade

```bash
# Nenhuma referência incorreta encontrada nos arquivos de código:
grep -r "blog\.saraivavision\.com\.br" . \
  --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
  | grep -v "wp-admin" | grep -v "\.md"
# Resultado: Apenas comentários e documentação (OK)
```

## 🔄 Próximos Passos

1. **Rebuild da Aplicação**
   ```bash
   npm run build
   ```

2. **Deploy no VPS**
   ```bash
   # Executar script de deploy ou comandos manuais
   bash scripts/deploy-nginx-wordpress-fix.sh
   ```

3. **Validação Pós-Deploy**
   - Testar WordPress API: `curl https://cms.saraivavision.com.br/wp-json/wp/v2/posts?per_page=1`
   - Verificar blog page carrega corretamente
   - Monitorar logs Nginx: `sudo tail -f /var/log/nginx/error.log`

## 📊 Impacto das Correções

- **Funcionalidade**: Blog page agora recebe JSON correto via REST API
- **Performance**: Sem necessidade de parsing HTML, resposta direta JSON
- **Arquitetura**: Alinhamento correto entre frontend React e backend WordPress headless
- **Manutenibilidade**: Separação clara entre blog (HTML) e cms (API)

## 🔐 Configuração Nginx

O arquivo `nginx-optimized.conf` já está configurado corretamente:
- Proxy WordPress REST API via `/api/wordpress/*` → `cms.saraivavision.com.br`
- Redirect `/wp-admin` mantido para `blog.saraivavision.com.br` (acesso admin)
- Headers CORS configurados adequadamente

## 📝 Notas Importantes

1. **Não confundir subdomínios**:
   - `blog` = interface HTML pública
   - `cms` = API REST JSON

2. **Testes locais**: Sempre usar `cms.saraivavision.com.br` para desenvolvimento

3. **Monitoramento**: Verificar logs após deploy para garantir que não há erros 404

4. **Health checks**: Ambos os scripts de health check agora testam endpoint correto

---

**Status**: ✅ Todas as correções aplicadas e verificadas
**Data**: 2025-09-29
**Próximo**: Rebuild e deploy