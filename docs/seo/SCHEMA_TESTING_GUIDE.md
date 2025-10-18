# Guia de Testes de Schema Markup

## 🧪 Como Testar Schema Markup Implementado

Este guia ensina como validar os dados estruturados (schema markup) implementados no site **saraivavision.com.br**.

---

## 1. Google Rich Results Test

### O que testa:
✅ Breadcrumbs
✅ FAQ (FAQPage)
✅ Local Business
✅ Review Snippets
✅ Article (para blog posts)

### Como usar:

**Opção 1: Testar URL ao vivo (Produção)**
1. Acesse: [https://search.google.com/test/rich-results](https://search.google.com/test/rich-results)
2. Digite a URL: `https://saraivavision.com.br/faq`
3. Clique em **"Testar URL"**
4. Aguarde análise (10-30 segundos)

**Opção 2: Testar código HTML**
1. Copie todo o HTML da página (`view-source:https://saraivavision.com.br/faq`)
2. Cole na aba **"Código"** do Rich Results Test
3. Clique em **"Testar código"**

### Resultados Esperados:

**✅ FAQ Page:**
```
Tipo detectado: FAQPage
- 8 perguntas encontradas
- Markup válido
```

**✅ Breadcrumbs:**
```
Tipo detectado: BreadcrumbList
- 2 itens na trilha (Home → FAQ)
- Markup válido
```

**✅ Local Business:**
```
Tipo detectado: MedicalBusiness
- Nome: Clínica Saraiva Vision
- Endereço: Rua Catarina Maria Passos, 97
- Avaliação: 4.9 (127 reviews)
- Markup válido
```

### Erros Comuns e Soluções:

**❌ "Propriedade obrigatória 'acceptedAnswer' ausente"**
- Causa: FAQ sem campo `answer`
- Solução: Verificar `faqData.js` - todos os FAQs devem ter `question` e `answer`

**❌ "JSON inválido"**
- Causa: Erro de sintaxe no JSON
- Solução: Usar [JSONLint](https://jsonlint.com/) para validar

**❌ "Tipo não reconhecido"**
- Causa: `@type` incorreto ou não suportado
- Solução: Verificar tipos válidos em [schema.org](https://schema.org/)

---

## 2. Schema.org Validator

### O que testa:
- Valida JSON-LD completo
- Verifica tipos de dados
- Identifica propriedades inválidas

### Como usar:

1. Acesse: [https://validator.schema.org/](https://validator.schema.org/)
2. Cole o schema JSON (extrair do HTML ou componente)

**Exemplo de Schema para testar:**

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Como agendar uma consulta?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Você pode agendar via WhatsApp (33) 99860-1427 ou pelo site."
      }
    }
  ]
}
```

3. Clique em **"Validate"**

### Resultados:

- ✅ **0 Errors, 0 Warnings:** Schema válido
- ⚠️ **Warnings:** Propriedades recomendadas ausentes (não crítico)
- ❌ **Errors:** Problemas que impedem rich snippets

---

## 3. Teste Manual no Google Search Console

### Como testar:

1. Faça deploy das alterações:
   ```bash
   npm run build:vite
   sudo npm run deploy:quick
   ```

2. No Google Search Console:
   - Vá para **"Enhancements"** → **"Breadcrumbs"** ou **"FAQ"**
   - Se não aparecer imediatamente, aguarde 24-48h para rastreamento

3. Solicite inspeção de URL:
   ```
   https://saraivavision.com.br/faq
   ```

4. Clique em **"Solicitar Indexação"**

5. Aguarde 3-7 dias e verifique se rich snippets aparecem na busca:
   ```
   site:saraivavision.com.br FAQ
   ```

---

## 4. Verificação de Breadcrumbs

### URLs para testar:

```
✅ /faq
✅ /servicos
✅ /servicos/consultas-oftalmologicas
✅ /blog
✅ /blog/monovisao-lentes-multifocais-presbiopia-caratinga-mg
✅ /sobre
```

### Teste visual:

1. Acesse cada URL
2. Verifique se breadcrumbs aparecem visualmente
3. Clique em cada link do breadcrumb (deve navegar corretamente)

### Teste de schema:

1. View source da página
2. Procure por:
   ```html
   <script type="application/ld+json">
   {"@context":"https://schema.org","@type":"BreadcrumbList"...}
   </script>
   ```

3. Copie o JSON e valide em: https://validator.schema.org/

---

## 5. Verificação de FAQ Schema

### URLs com FAQ:

```
✅ /faq (FAQ geral)
✅ /servicos/consultas-oftalmologicas (FAQ específico - quando implementado)
✅ Posts de blog com FAQ (quando implementado)
```

### Teste de funcionamento:

**1. Visual:**
- FAQs aparecem como accordion (expandir/recolher)
- Acessibilidade: navegação por teclado (Tab + Enter)

**2. Schema Markup:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [...]
}
</script>
```

**3. Google Search:**
Após indexação, buscar:
```
site:saraivavision.com.br "perguntas frequentes"
```

Resultado esperado mostrará FAQs expandidas diretamente no Google.

---

## 6. Testes de LocalBusiness Schema

### Componente:
`src/components/LocalBusinessSchema.jsx`

### Propriedades a validar:

```json
{
  "@type": "MedicalBusiness",
  "name": "Clínica Saraiva Vision",
  "address": {
    "streetAddress": "Rua Catarina Maria Passos, 97",
    "addressLocality": "Caratinga",
    "postalCode": "35300-000"
  },
  "geo": {
    "latitude": -19.7896,
    "longitude": -42.1397
  },
  "aggregateRating": {
    "ratingValue": "4.9",
    "reviewCount": "127"
  }
}
```

### Teste no Google:

1. Buscar: `Clínica Saraiva Vision Caratinga`
2. Verificar Knowledge Panel (painel lateral direito):
   - ✅ Estrelas de avaliação
   - ✅ Endereço completo
   - ✅ Telefone clicável
   - ✅ Horário de funcionamento
   - ✅ Mapa do Google Maps

---

## 7. Comandos de Teste Rápido

### Verificar se schema está presente:

```bash
# Buscar breadcrumb schema
curl -s https://saraivavision.com.br/faq | grep -o '"@type":"BreadcrumbList"'

# Buscar FAQ schema
curl -s https://saraivavision.com.br/faq | grep -o '"@type":"FAQPage"'

# Buscar LocalBusiness schema
curl -s https://saraivavision.com.br/ | grep -o '"@type":"MedicalBusiness"'
```

### Extrair schema completo:

```bash
curl -s https://saraivavision.com.br/faq | \
  grep -oP '<script type="application/ld\+json">\K.*?(?=</script>)' | \
  jq '.' > faq-schema.json
```

---

## 8. Checklist de Testes Completo

### Antes do Deploy:

- [ ] Breadcrumbs component renderiza corretamente
- [ ] FAQSchema component renderiza corretamente
- [ ] JSON-LD está válido (sem erros de syntax)
- [ ] Todos os campos obrigatórios estão presentes
- [ ] Build local funciona sem erros: `npm run build:vite`

### Após Deploy:

- [ ] Schema aparece no HTML ao vivo (view-source)
- [ ] Google Rich Results Test: ✅ válido
- [ ] Schema.org Validator: 0 errors
- [ ] Breadcrumbs visíveis e funcionais
- [ ] FAQs expandem/recolhem corretamente

### 7-14 Dias Após Deploy:

- [ ] Google Search Console: Breadcrumbs detectados
- [ ] Google Search Console: FAQ detectados
- [ ] Rich snippets aparecem nos resultados de busca
- [ ] Knowledge Panel atualizado (se aplicável)

---

## 9. Troubleshooting

### Problema: "Rich Results Test não detecta schema"

**Possíveis Causas:**
1. Schema está dentro de componente que não renderiza no servidor
2. Schema só carrega após JavaScript executar

**Solução:**
- Verificar que `<Helmet>` está renderizando no HTML final
- Usar prerendering para páginas críticas
- Testar com "Fetch as Google" no Search Console

---

### Problema: "Schema válido mas rich snippets não aparecem"

**Possíveis Causas:**
1. Google ainda não rastreou a página atualizada
2. Página não tem tráfego suficiente (rich snippets priorizados para páginas populares)
3. Conteúdo não é relevante para a query

**Solução:**
- Aguardar 2-4 semanas após deploy
- Solicitar re-indexação no Google Search Console
- Aumentar tráfego orgânico para a página

---

### Problema: "Breadcrumbs aparecem duplicados"

**Causa:**
Breadcrumb schema sendo injetado múltiplas vezes

**Solução:**
```javascript
// Remover schema existente antes de adicionar novo
const existingSchema = document.querySelector('script[type="application/ld+json"][data-breadcrumb]');
if (existingSchema) {
  existingSchema.remove();
}
```

---

## 10. Ferramentas Úteis

### Validadores:
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema.org Validator:** https://validator.schema.org/
- **JSON-LD Playground:** https://json-ld.org/playground/
- **Structured Data Linter:** https://linter.structured-data.org/

### Testes de Performance:
- **PageSpeed Insights:** https://pagespeed.web.dev/
- **GTmetrix:** https://gtmetrix.com/
- **WebPageTest:** https://www.webpagetest.org/

### Análise de Concorrentes:
Verificar schema markup de concorrentes:
```bash
curl -s https://site-concorrente.com | grep -o '<script type="application/ld+json">.*</script>'
```

---

## 11. Exemplos de Resultados Esperados

### Breadcrumbs no Google:

```
Oftalmologista Caratinga/MG | Dr. Philipe Saraiva
Home › FAQ
https://saraivavision.com.br/faq
Encontre respostas para as principais dúvidas sobre oftalmologia...
```

### FAQ no Google:

```
Perguntas Frequentes | Saraiva Vision
https://saraivavision.com.br/faq

❓ Como agendar uma consulta na Clínica Saraiva Vision?
   Você pode agendar sua consulta de 3 formas: WhatsApp...

❓ Onde fica a Clínica Saraiva Vision em Caratinga?
   Endereço: Rua Catarina Maria Passos, 97 - Santa Zita...

[Ver mais perguntas]
```

### Local Business no Google Maps:

```
★★★★★ 4.9 (127 avaliações)

Clínica Saraiva Vision
Clínica oftalmológica

📍 Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga/MG
📞 (33) 99860-1427
🕐 Aberto agora · Fecha às 18:00

[Como chegar]  [Site]  [Ligar]
```

---

**Última atualização:** 18 de outubro de 2025
**Autor:** Dr. Philipe Saraiva Cruz - CRM-MG 69.870
**Documentação criada por:** Claude (Anthropic AI)
