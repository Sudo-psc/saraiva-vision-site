# Configuração do Google Search Console

## 📋 Guia Completo de Configuração

Este guia detalha como configurar o Google Search Console para o site **saraivavision.com.br** e aproveitar ao máximo as ferramentas de monitoramento SEO.

---

## 1. Pré-requisitos

- Conta Google (Gmail)
- Acesso ao Google Analytics (já configurado: `G-LXWRK8ELS6`)
- Acesso ao DNS do domínio saraivavision.com.br (se optar por verificação DNS)

---

## 2. Acessar o Google Search Console

1. Acesse: [https://search.google.com/search-console](https://search.google.com/search-console)
2. Faça login com a conta Google da clínica
3. Clique em **"Adicionar Propriedade"** ou **"Add Property"**

---

## 3. Escolher Tipo de Propriedade

Existem dois tipos de propriedade:

### Opção 1: Prefixo de URL (Recomendado)
- **URL:** `https://saraivavision.com.br`
- **Vantagem:** Monitora apenas este domínio específico
- **Use quando:** Você controla apenas este domínio

### Opção 2: Domínio
- **Domínio:** `saraivavision.com.br`
- **Vantagem:** Monitora todas as variações (www, http, https, subdomínios)
- **Desvantagem:** Requer verificação via DNS TXT

**Recomendação:** Use **Prefixo de URL** com `https://saraivavision.com.br` (mais simples).

---

## 4. Métodos de Verificação

### Método 1: Google Analytics (RECOMENDADO - Mais Rápido)

**Vantagens:**
- ✅ Verificação automática instantânea
- ✅ Sem alterações no código ou DNS
- ✅ Já está configurado no site

**Passos:**
1. No Google Search Console, selecione o método "Google Analytics"
2. O sistema detecta automaticamente o tracking code `G-LXWRK8ELS6`
3. Clique em **"Verificar"**
4. ✅ **Pronto!** Verificação concluída

---

### Método 2: Tag HTML (Alternativo)

**Quando usar:** Se o Google Analytics não funcionar ou para verificação adicional

**Passos:**
1. Google Search Console fornece uma meta tag como:
   ```html
   <meta name="google-site-verification" content="ABC123XYZ..." />
   ```

2. Adicionar ao arquivo `index.html` (linha ~24, após Facebook Domain Verification):
   ```html
   <!-- Facebook Domain Verification -->
   <meta name="facebook-domain-verification" content="tca7o4kjixltbutycd2650bdpisp5b" />

   <!-- Google Search Console Verification -->
   <meta name="google-site-verification" content="SEU_CODIGO_AQUI" />
   ```

3. Fazer deploy da alteração:
   ```bash
   npm run build:vite
   sudo npm run deploy:quick
   ```

4. No Google Search Console, clicar em **"Verificar"**

---

### Método 3: DNS TXT Record (Mais Técnico)

**Quando usar:** Para propriedade de "Domínio" completo

**Passos:**
1. Google Search Console fornece um registro TXT como:
   ```
   google-site-verification=ABC123XYZ...
   ```

2. Adicionar ao DNS do domínio:
   - **Tipo:** TXT
   - **Nome/Host:** @ (ou root)
   - **Valor:** `google-site-verification=ABC123XYZ...`
   - **TTL:** 3600

3. Aguardar propagação DNS (pode levar até 48h, geralmente minutos)

4. No Google Search Console, clicar em **"Verificar"**

---

### Método 4: Upload de Arquivo HTML (Não Recomendado para SPA)

**Problema:** Não funciona bem com aplicações React/Vite pois o arquivo seria sobrescrito no build.

**Alternativa:** Use Google Analytics ou Tag HTML.

---

## 5. Submeter Sitemap

Após verificação bem-sucedida:

1. No Google Search Console, vá para **"Sitemaps"** (menu lateral esquerdo)
2. Clique em **"Adicionar novo sitemap"**
3. Insira: `https://saraivavision.com.br/sitemap.xml`
4. Clique em **"Enviar"**

**Status Esperado:**
- ✅ **Sucesso:** "Sitemap enviado com sucesso"
- 🔄 **Processando:** Google está processando (pode levar horas/dias)
- ❌ **Erro:** Verificar se sitemap está acessível

**Testar sitemap antes de enviar:**
```bash
curl https://saraivavision.com.br/sitemap.xml
```

---

## 6. Configurações Iniciais Importantes

### 6.1. Configurar Variações de URL

No menu **"Configurações"** → **"Rastreamento"**:

- ✅ Marcar domínio preferencial: `https://saraivavision.com.br` (sem www)
- ✅ Confirmar que versões com `www` redirecionam para sem `www`
- ✅ Confirmar que HTTP redireciona para HTTPS

### 6.2. Configurar Público-Alvo Geográfico

No menu **"Configurações"** → **"País de Destino"**:

- Selecionar: **Brasil 🇧🇷**
- Isso ajuda o Google a priorizar o site em buscas locais

### 6.3. Associar ao Google Analytics

No menu **"Configurações"** → **"Associações"**:

- Vincular com a propriedade do Google Analytics 4: `G-LXWRK8ELS6`
- Permite visualizar dados do Search Console dentro do Google Analytics

---

## 7. Relatórios Essenciais para Monitorar

### 7.1. Relatório de Desempenho

**Onde:** Menu **"Desempenho"** → **"Resultados de pesquisa"**

**Métricas-Chave:**
- **Impressões:** Quantas vezes o site apareceu no Google
- **Cliques:** Quantos usuários clicaram nos resultados
- **CTR (Taxa de Cliques):** % de cliques sobre impressões
- **Posição Média:** Ranking médio para as queries

**Análises Importantes:**
1. **Top Queries:** Quais palavras-chave trazem mais tráfego
   - Filtrar por: `oftalmologista caratinga`, `catarata caratinga`, etc.

2. **Top Pages:** Quais páginas têm melhor desempenho
   - Identificar páginas para otimizar

3. **Países:** Verificar se tráfego vem principalmente do Brasil

4. **Dispositivos:** Desktop vs Mobile vs Tablet

**Frequência de Monitoramento:** Semanal

---

### 7.2. Relatório de Cobertura (Indexação)

**Onde:** Menu **"Cobertura"** ou **"Páginas"**

**O que monitorar:**
- ✅ **Páginas Indexadas:** Total de URLs no índice do Google
  - **Meta:** 69 URLs (conforme sitemap.xml)

- ⚠️ **Erros:** Páginas com problemas de indexação
  - Corrigir imediatamente

- 🔶 **Avisos:** Páginas com avisos (ex: blocked by robots.txt)
  - Revisar se bloqueio é intencional

- ℹ️ **Excluídas:** Páginas não indexadas (ex: noindex, duplicadas)
  - Verificar se exclusão é intencional

**Ações:**
1. Se URLs importantes não estão indexadas → **"Solicitar Indexação"**
2. Se há erros 404 → Corrigir ou adicionar redirects 301

**Frequência de Monitoramento:** Quinzenal

---

### 7.3. Relatório de Enhancements (Melhorias)

**Onde:** Menu **"Enhancements"** → **"Breadcrumbs"**, **"FAQ"**, etc.

**Rich Results Esperados:**
- ✅ **Breadcrumbs:** Trilha de navegação (após implementação)
- ✅ **FAQ:** Perguntas frequentes expandidas
- ✅ **Local Business:** Dados da clínica (já implementado)
- ✅ **Review Snippets:** Avaliações (agregateRating: 4.9/5)

**Ações:**
1. Monitorar erros em rich results
2. Testar schema markup com [Google Rich Results Test](https://search.google.com/test/rich-results)

**Frequência de Monitoramento:** Mensal

---

### 7.4. Core Web Vitals

**Onde:** Menu **"Experience"** → **"Core Web Vitals"**

**Métricas Monitoradas:**
- **LCP (Largest Contentful Paint):** Tempo de carregamento do maior elemento
  - **Meta:** <2.5s (Bom), 2.5-4s (Precisa melhorar), >4s (Ruim)

- **FID (First Input Delay):** Tempo até primeira interação
  - **Meta:** <100ms (Bom), 100-300ms (Precisa melhorar), >300ms (Ruim)

- **CLS (Cumulative Layout Shift):** Estabilidade visual
  - **Meta:** <0.1 (Bom), 0.1-0.25 (Precisa melhorar), >0.25 (Ruim)

**Ações:**
- URLs com problemas devem ser otimizadas
- Priorizar mobile (Google usa mobile-first indexing)

**Frequência de Monitoramento:** Mensal

---

### 7.5. Manual Actions (Ações Manuais)

**Onde:** Menu **"Segurança e Ações Manuais"** → **"Ações Manuais"**

**O que é:**
Penalidades aplicadas manualmente pelo Google por violação de diretrizes.

**Status Esperado:**
- ✅ **"Nenhum problema detectado"**

**Se houver problemas:**
1. Ler detalhes da penalidade
2. Corrigir o problema (ex: conteúdo duplicado, links pagos não declarados)
3. Solicitar revisão

**Frequência de Monitoramento:** Mensal

---

## 8. Inspeção de URL (Ferramenta Importante)

**Onde:** Barra de pesquisa no topo do Google Search Console

**Como usar:**
1. Digite a URL completa: `https://saraivavision.com.br/blog/monovisao-lentes-multifocais-presbiopia-caratinga-mg`
2. Clique em **"Inspecionar URL"**

**Informações Fornecidas:**
- ✅ **URL está no Google:** Indexada
- 🔄 **URL não está no Google:** Não indexada (solicitar indexação)
- ⚠️ **Problemas de rastreamento:** Erros encontrados

**Botão "Solicitar Indexação":**
- Use para URLs novas ou atualizadas importantes
- Google prioriza re-rastreamento (não garante indexação imediata)
- **Limite:** ~10 solicitações por dia

**Quando usar:**
- Após publicar novo artigo de blog
- Após atualizar conteúdo importante
- Após corrigir erros de indexação

---

## 9. Links (Backlinks)

**Onde:** Menu **"Links"**

**Informações:**
- **Links Externos:** Quais sites linkam para saraivavision.com.br
- **Links Internos:** Estrutura de links dentro do próprio site
- **Principais Páginas Linkadas:** Páginas com mais backlinks

**Análise:**
1. **Qualidade dos Backlinks:**
   - Sites relevantes e confiáveis = ✅ Bom
   - Sites spam ou baixa qualidade = ⚠️ Pode prejudicar

2. **Anchor Text:**
   - Variação natural de textos âncora = ✅ Bom
   - Muitos links com mesmo texto exato = ⚠️ Pode parecer manipulação

**Ações:**
- Monitorar crescimento de backlinks
- Desautorizar links tóxicos (se necessário) usando Disavow Tool

**Frequência de Monitoramento:** Mensal

---

## 10. Mobile Usability

**Onde:** Menu **"Experience"** → **"Mobile Usability"**

**Problemas Comuns:**
- Texto muito pequeno
- Elementos clicáveis muito próximos
- Conteúdo mais largo que a tela
- Uso de plugins incompatíveis (ex: Flash)

**Status Esperado:**
- ✅ **"Nenhum problema detectado"** (site é responsivo via Tailwind CSS)

**Se houver problemas:**
1. Testar URL com [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
2. Corrigir problemas identificados
3. Re-solicitar validação

**Frequência de Monitoramento:** Trimestral

---

## 11. Tarefas de Manutenção Regular

### Semanal:
- ✅ Verificar relatório de **Desempenho**
- ✅ Identificar novas queries com alto impressões mas baixo CTR
- ✅ Monitorar posição média das keywords principais

### Quinzenal:
- ✅ Verificar relatório de **Cobertura/Indexação**
- ✅ Corrigir erros de indexação
- ✅ Solicitar indexação de novos conteúdos

### Mensal:
- ✅ Analisar **Core Web Vitals**
- ✅ Verificar **Enhancements** (rich results)
- ✅ Revisar **Backlinks** (qualidade e quantidade)
- ✅ Verificar **Ações Manuais**
- ✅ Exportar relatórios para análise histórica

### Trimestral:
- ✅ Revisar configurações gerais
- ✅ Testar **Mobile Usability**
- ✅ Comparar desempenho com trimestre anterior
- ✅ Ajustar estratégia SEO conforme dados

---

## 12. Problemas Comuns e Soluções

### Problema 1: "URL não está no Google"

**Possíveis Causas:**
- URL muito nova (ainda não rastreada)
- Bloqueada por robots.txt
- Marcada com noindex
- Problemas de servidor (404, 500)
- Conteúdo duplicado (canonical apontando para outra URL)

**Solução:**
1. Verificar robots.txt: `https://saraivavision.com.br/robots.txt`
2. Inspecionar meta tags (noindex?)
3. Verificar canonical URL
4. Solicitar indexação via Google Search Console

---

### Problema 2: "Erro ao buscar sitemap"

**Possíveis Causas:**
- Sitemap inacessível (404)
- Formato XML inválido
- Encoding incorreto
- Tamanho muito grande (>50MB)

**Solução:**
1. Testar acesso: `curl https://saraivavision.com.br/sitemap.xml`
2. Validar XML: [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
3. Verificar encoding UTF-8 (linha 1 do sitemap.xml)
4. Se muito grande, dividir em múltiplos sitemaps

---

### Problema 3: "Soft 404"

**O que é:**
Página retorna código 200 (sucesso) mas conteúdo é de "não encontrado"

**Causa:**
React Router renderiza a mesma aplicação para todas as rotas, retornando 200

**Solução:**
Configurar servidor (Nginx) para retornar código 404 correto em rotas inválidas.
Já implementado em `NotFoundPage.jsx`.

---

### Problema 4: "Conteúdo duplicado - canonical ausente"

**Possíveis Causas:**
- Múltiplas URLs servindo mesmo conteúdo (com/sem www, http/https)
- Parâmetros de URL desnecessários

**Solução:**
1. Configurar redirects 301 de variações para URL canônica
2. Garantir que React Helmet (`SEOHead.jsx`) gera canonical correta
3. Verificar que todas as páginas têm canonical definida

**Status Atual:** ✅ Canonical implementada via `SEOHead.jsx` (linha 132)

---

### Problema 5: "Structured data error"

**Possíveis Causas:**
- Schema markup JSON inválido
- Campos obrigatórios faltando
- Tipo de dados incorreto

**Solução:**
1. Testar com [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Validar JSON: [Schema.org Validator](https://validator.schema.org/)
3. Corrigir erros identificados
4. Re-solicitar validação no Google Search Console

---

## 13. Recursos Adicionais

### Ferramentas de Validação:
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Mobile-Friendly Test:** https://search.google.com/test/mobile-friendly
- **PageSpeed Insights:** https://pagespeed.web.dev/
- **Schema Markup Validator:** https://validator.schema.org/

### Documentação Oficial:
- **Google Search Console Help:** https://support.google.com/webmasters
- **Google SEO Starter Guide:** https://developers.google.com/search/docs/beginner/seo-starter-guide
- **Schema.org Documentation:** https://schema.org/docs/gs.html

### Comunidades e Suporte:
- **Google Search Central Community:** https://support.google.com/webmasters/community
- **r/SEO (Reddit):** https://reddit.com/r/SEO
- **Search Engine Journal:** https://www.searchenginejournal.com/

---

## 14. Checklist de Configuração Inicial

- [ ] Acessar Google Search Console
- [ ] Adicionar propriedade: `https://saraivavision.com.br`
- [ ] Verificar propriedade (Google Analytics ou Tag HTML)
- [ ] Submeter sitemap: `https://saraivavision.com.br/sitemap.xml`
- [ ] Configurar país de destino: Brasil
- [ ] Associar ao Google Analytics 4 (`G-LXWRK8ELS6`)
- [ ] Verificar domínio preferencial (sem www)
- [ ] Revisar relatório de Cobertura (indexação)
- [ ] Verificar Core Web Vitals
- [ ] Testar Inspeção de URL em páginas principais
- [ ] Configurar alertas de email para problemas críticos
- [ ] Adicionar colaboradores (se aplicável)

---

## 15. Contato e Suporte

**Para dúvidas sobre a configuração:**
- Email: contato@saraivavision.com.br
- WhatsApp: (33) 99860-1427

**Última atualização:** 18 de outubro de 2025
**Autor:** Dr. Philipe Saraiva Cruz - CRM-MG 69.870
**Documentação criada por:** Claude (Anthropic AI)
