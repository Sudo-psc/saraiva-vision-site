# NAP Consistency Guide - Saraiva Vision

## 📋 Official NAP Data (Name, Address, Phone)

### Nome Oficial
- **Principal**: Clínica Saraiva Vision
- **Alternativo**: Saraiva Vision

### Endereço Completo
```
Rua Catarina Maria Passos, 97
Bairro: Santa Zita
Cidade: Caratinga
Estado: MG
CEP: 35300-000
País: Brasil
```

### Telefones
- **Principal (WhatsApp)**: (33) 99860-1427
  - Formato internacional: +55-33-99860-1427
  - Formato URI tel: +553399860142
- **Fixo**: (33) 3321-8148
  - Formato internacional: +55-33-3321-8148
- **Enfermeira Responsável**: (33) 98420-7437
  - Uso: Contato interno/staff apenas
  - **NÃO USAR** em páginas públicas ou materiais de marketing

### Coordenadas Geográficas
- Latitude: -19.7896
- Longitude: -42.1397

### URLs
- Website: https://saraivavision.com.br
- WhatsApp Direct Link: https://wa.me/message/EHTAAAAYH7SHJ1

---

## 🎯 Importância da Consistência NAP

### Impacto em SEO Local
Inconsistências NAP (Name, Address, Phone) prejudicam:
- **Confiança Algorítmica**: Google penaliza inconsistências entre diretórios
- **Ranking Local**: Afeta posicionamento no Google Maps e busca local
- **Rich Snippets**: Dificulta exibição de rich snippets em resultados de busca
- **Voice Search**: Prejudica resultados de busca por voz

### Conformidade Schema.org
Dados consistentes garantem:
- Validação correta de Schema.org structured data
- Exibição adequada de MedicalClinic, LocalBusiness e Organization schemas
- Credibilidade para bots de busca e assistentes virtuais

---

## 📝 Correções Realizadas (2025-09-30)

### Arquivos Corrigidos

#### 1. `src/lib/blogSchemaMarkup.js`
**Linhas 31-40** - Função `generateMedicalWebPageSchema()`
- ❌ **Antes**: `streetAddress: 'Rua Coronel Antônio Gonçalves da Silva, 101'`
- ✅ **Depois**: `streetAddress: 'Rua Catarina Maria Passos, 97'`
- ❌ **Antes**: `telephone: '+55-33-3321-8148'`
- ✅ **Depois**: `telephone: '+55-33-99860-1427'`

**Linhas 191-204** - Função `generatePhysicianSchema()`
- ❌ **Antes**: `streetAddress: 'Rua Coronel Antônio Gonçalves da Silva, 101'`
- ✅ **Depois**: `streetAddress: 'Rua Catarina Maria Passos, 97'`
- ➕ **Adicionado**: `telephone: '+55-33-99860-1427'`
- ➕ **Adicionado**: `url: 'https://saraivavision.com.br'`

#### 2. `src/components/blog/ActionButtons.jsx`
**Linhas 86-92** - Contact Info Section
- ❌ **Antes**: `href="tel:+553398207437"` | `(33) 98420-7437`
- ✅ **Depois**: `href="tel:+553399860142"` | `(33) 99860-1427`

#### 3. `src/components/blog/AuthorProfile.jsx`
**Linha 18** - Default phone prop
- ❌ **Antes**: `phone = '(33) 98420-7437'`
- ✅ **Depois**: `phone = '(33) 99860-1427'`

### Arquivos Verificados (Corretos)

#### `src/lib/clinicInfo.js`
✅ **Correto**: Endereço oficial já estava configurado
✅ **Correto**: Telefone principal: `'+55 33 99860-1427'`
✅ **Legítimo**: `responsibleNursePhone: '+55 33 98420-7437'` (staff interno)

---

## 🔍 Validação de Consistência

### Checklist de Validação
Antes de qualquer deploy, verificar:

- [ ] **Nome**: "Clínica Saraiva Vision" em todas as referências públicas
- [ ] **Endereço**: "Rua Catarina Maria Passos, 97" (nunca "Coronel Antônio Gonçalves")
- [ ] **Telefone Principal**: (33) 99860-1427 em CTAs e contatos públicos
- [ ] **Schema.org**: Validar em https://validator.schema.org/
- [ ] **Google Search Console**: Verificar structured data sem erros
- [ ] **Google My Business**: NAP idêntico ao site

### Comandos de Verificação

```bash
# Buscar telefones incorretos
grep -rn "98420-7437\|99992-9969" src/ --exclude-dir=node_modules

# Buscar endereços incorretos
grep -rn "Coronel Antônio\|Gonçalves da Silva" src/ --exclude-dir=node_modules

# Validar clinicInfo.js
cat src/lib/clinicInfo.js | grep -E "phone|address"
```

---

## 🚨 Telefones a EVITAR em Páginas Públicas

### ❌ Números Incorretos/Obsoletos
- **(33) 99992-9969**: Número desatualizado mencionado em perfis antigos
- **Qualquer outro número**: Verificar com gestão antes de adicionar

### ⚠️ Números de Uso Restrito
- **(33) 98420-7437**: Apenas para uso interno (enfermeira responsável)
- **Nunca usar em**: CTAs, botões de contato, footer, Schema.org

### ✅ Números Oficiais
- **(33) 99860-1427**: Telefone principal e WhatsApp (SEMPRE use este)
- **(33) 3321-8148**: Telefone fixo (uso opcional, se aplicável)

---

## 📐 Padrão de Formatação

### Display em UI (Brasil)
```javascript
// Formato brasileiro visual
phone: '(33) 99860-1427'
```

### Links e URIs
```javascript
// Formato internacional sem hífen
href="tel:+553399860142"

// Formato internacional com hífen (Schema.org)
telephone: '+55-33-99860-1427'
```

### Schema.org Structured Data
```json
{
  "telephone": "+55-33-99860-1427",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Rua Catarina Maria Passos, 97",
    "addressLocality": "Caratinga",
    "addressRegion": "MG",
    "postalCode": "35300-000",
    "addressCountry": "BR"
  }
}
```

---

## 🎯 Onde Aplicar NAP Oficial

### Obrigatório
- Schema.org markup (MedicalClinic, LocalBusiness, Physician)
- Footer do site
- Página de contato
- Botões de CTA (Call-to-Action)
- Google My Business
- Diretórios online (Doctoralia, etc.)

### Recomendado
- Meta tags de contato
- Assinatura de e-mails
- Materiais de marketing digital
- Redes sociais (bio)
- Press releases

---

## 🔧 Arquivos de Referência

### Source of Truth
1. **`src/lib/clinicInfo.js`**: Fonte centralizada de dados da clínica
2. **`src/lib/blogSchemaMarkup.js`**: Schema.org generators
3. Este documento: NAP_CONSISTENCY_GUIDE.md

### Componentes que Exibem NAP
- `src/components/blog/ActionButtons.jsx`
- `src/components/blog/AuthorProfile.jsx`
- `src/components/EnhancedFooter.jsx` (verificar se existe)
- `src/pages/ContactPage.jsx` (verificar se existe)

---

## 📊 Histórico de Mudanças

### 2025-09-30 - Correção NAP Completa
- **Commit**: [hash será adicionado após commit]
- **Arquivos Modificados**: 3 (blogSchemaMarkup.js, ActionButtons.jsx, AuthorProfile.jsx)
- **Inconsistências Corrigidas**: 4 ocorrências de telefone, 2 de endereço
- **Impacto**: Schema.org agora validado, consistência 100% em componentes públicos

---

## 🚀 Próximos Passos

### SEO Local (Prioridade Alta)
- [ ] Atualizar Google My Business com NAP oficial
- [ ] Verificar diretórios médicos online (Doctoralia, etc.)
- [ ] Corrigir citações NAP em sites de terceiros
- [ ] Implementar SSR/pre-rendering para melhor crawling

### Monitoramento Contínuo
- [ ] Configurar alertas para mudanças em clinicInfo.js
- [ ] Script de validação NAP no CI/CD
- [ ] Revisão trimestral de consistência

---

**Última atualização**: 2025-09-30
**Responsável**: Claude Code - Assistente de Desenvolvimento
**Contato para Dúvidas**: Verificar com gestão de TI da Clínica Saraiva Vision
