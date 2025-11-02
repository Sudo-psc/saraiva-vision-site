# Relatório de Auditoria: Consistência de Dados NAP

**Data:** 2025-11-02
**Auditor:** Claude Code (Automated Analysis)
**Escopo:** Termos de Serviço, FAQ e Congruência de Dados NAP em todas as subpáginas

---

## 📋 Sumário Executivo

Foi realizada uma auditoria completa dos dados NAP (Name, Address, Phone) em todo o site da Saraiva Vision, incluindo revisão de FAQ, Política de Privacidade e Termos de Serviço.

### 🔴 Problemas Críticos Encontrados

1. **CEP Inconsistente**: Duas versões diferentes em uso (35300-299 vs 35300-000)
2. **Coordenadas Geográficas Divergentes**: Três conjuntos diferentes de coordenadas
3. **Post de Blog com Dados Completamente Errados**: Endereço e telefone incorretos em post sobre retinoblastoma
4. **Falta de Termos de Serviço**: Não existe página dedicada de Termos de Serviço

---

## 🔍 Detalhamento das Inconsistências

### 1. CEP (Código Postal)

#### ✅ **Correto** (NAP Canonical - Fonte da Verdade)
```
CEP: 35300-299
```
**Localização:** `src/lib/napCanonical.js`

#### ❌ **Incorreto** (Encontrado em 6 arquivos)
```
CEP: 35300-000
```

**Arquivos com CEP Errado:**
1. `src/data/faqData.js:24`
2. `src/lib/blogSchemaMarkup.js:36`
3. `src/lib/blogSchemaMarkup.js:200`
4. `src/lib/podcastSchemaMarkup.js:29`
5. `src/lib/podcastSchemaMarkup.js:270`
6. `src/components/__tests__/SEOHead.test.jsx:10`

---

### 2. Coordenadas Geográficas

#### 🔵 **Versão 1** (clinicInfo.js)
```javascript
latitude: -19.7890206
longitude: -42.1347583
```

#### 🔵 **Versão 2** (napCanonical.js)
```javascript
latitude: -19.789444
longitude: -42.137778
```

#### 🔵 **Versão 3** (faqData.js - Link do Google Maps)
```
https://maps.google.com/?q=-19.7896,-42.1397
```

**Análise:** As coordenadas estão muito próximas, mas essa inconsistência pode afetar:
- Marcadores de mapa
- Links de navegação
- SEO local
- Integrações com APIs de geolocalização

**Recomendação:** Validar coordenadas corretas no Google Maps e padronizar em todos os arquivos.

---

### 3. ⚠️ **CRÍTICO:** Post de Blog com Dados Errados

**Post:** "Teste do Olhinho e Retinoblastoma"
**Arquivos:**
- `src/data/blogPosts.js`
- `src/data/blogPosts.sanity.js`
- `src/data/blogPosts.static-backup.js`
- `src/content/blog/posts/post-22.js`

#### Dados Incorretos no Post:
```html
<p><strong>Endereço:</strong> Rua Coronel Antônio Pinto, 88 - Sala 2 - Centro, Caratinga - MG, 35300-033</p>
<p><strong>Telefone/WhatsApp:</strong> (33) 3321-7070</p>
```

#### ✅ Dados Corretos (Deveriam Ser):
```
Endereço: Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga/MG - CEP 35300-299
Telefone/WhatsApp: (33) 99860-1427
```

**Impacto:**
- 🚨 **ALTO**: Clientes podem tentar contatar número errado ou ir ao endereço errado
- 🚨 **SEO Negativo**: NAP inconsistente prejudica ranqueamento local
- 🚨 **Compliance CFM**: Informações médicas com dados de contato errados

**Ação Urgente:** Corrigir imediatamente este post em todas as versões.

---

### 4. Links do Google Maps Inconsistentes

#### 📍 **faqData.js** (Linha 26)
```
https://maps.google.com/?q=-19.7896,-42.1397
```

#### 📍 **clinicInfo.js**
```javascript
googleMapsProfileUrl = `https://www.google.com/maps/place/?q=place_id:${CLINIC_PLACE_ID}`
// Place ID: ChIJVUKww7WRugARF7u2lAe7BeE
```

**Recomendação:** Usar sempre o Place ID para garantir precisão e estabilidade dos links.

---

## 📝 FAQ e Conteúdo - Análise

### ✅ Pontos Positivos

1. **FAQ Bem Estruturado:**
   - 8 perguntas gerais cobrindo principais dúvidas
   - FAQs específicas por serviço (catarata, glaucoma, presbiopia)
   - Conteúdo em HTML com boa formatação
   - Links internos para outras páginas

2. **Informações Médicas Precisas:**
   - Calendário de consultas oftalmológicas por idade
   - Sintomas e tratamentos bem documentados
   - Referências a legislação (Lei nº 12.069/2009)
   - Informações sobre convênios e atendimento

3. **Horário de Funcionamento Claro:**
   ```
   Segunda a Sexta: 08:00 às 18:00
   Sábados e Domingos: Fechado
   ```

### ⚠️ Pontos de Atenção no FAQ

1. **CEP Errado (já mencionado):**
   ```javascript
   // Linha 24 de faqData.js
   <p><strong>Endereço:</strong> Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga/MG - CEP 35300-000</p>
   ```
   ❌ Deveria ser: CEP 35300-299

2. **Link do Google Maps com Coordenadas Não Padronizadas:**
   ```html
   <a href="https://maps.google.com/?q=-19.7896,-42.1397">Ver no Google Maps</a>
   ```
   ⚠️ Recomendação: Usar Place ID

---

## 🔒 Política de Privacidade - Análise

**Arquivo:** `src/views/PrivacyPolicyPage.jsx`

### ✅ Pontos Positivos

1. **Estrutura LGPD Completa:**
   - Dados coletados
   - Finalidades
   - Direitos do titular
   - Consentimento
   - DPO (Data Protection Officer)
   - Segurança
   - Retenção de dados
   - Terceiros
   - Atualizações

2. **DPO Configurado:**
   ```javascript
   clinicInfo.dpoEmail // dpo@saraivavision.com.br
   ```

### ⚠️ Pontos de Melhoria

1. **Conteúdo em i18n (Internacionalização):**
   - Depende de traduções em arquivos externos
   - Não foi possível validar o texto completo sem ler os arquivos de tradução
   - Recomendação: Verificar se todas as traduções estão completas

2. **Data de Última Atualização Dinâmica:**
   ```javascript
   { date: new Date().toISOString().slice(0,10) }
   ```
   - ⚠️ Mostra data atual, não data da última modificação real
   - Recomendação: Usar data fixa ou sistema de versionamento

---

## ❌ Termos de Serviço - NÃO ENCONTRADO

### Status: **AUSENTE**

Não foi encontrada uma página dedicada de Termos de Serviço (Terms of Service / TOS).

### Impacto:
- **Compliance Legal:** Plataformas de saúde devem ter TOS claros
- **LGPD:** Termos de uso são complementares à política de privacidade
- **CFM:** Responsabilidade médica requer termos claros
- **Comercial:** Planos e assinaturas devem ter termos contratuais

### Recomendação: **CRIAR URGENTEMENTE**

Sugestão de seções para o TOS:
1. Aceitação dos Termos
2. Serviços Oferecidos
3. Agendamento e Cancelamento
4. Responsabilidades do Paciente
5. Responsabilidades da Clínica
6. Confidencialidade Médica
7. Pagamentos e Reembolsos
8. Modificações dos Termos
9. Lei Aplicável e Foro
10. Contato

---

## 📊 Resumo Quantitativo de Inconsistências

| Tipo de Inconsistência | Quantidade | Severidade | Ação |
|------------------------|------------|------------|------|
| CEP Errado (35300-000) | 6 arquivos | 🔴 Alta | Corrigir |
| Coordenadas Divergentes | 3 versões | 🟡 Média | Padronizar |
| Post com Dados Errados | 4 arquivos | 🔴 Crítica | Corrigir URGENTE |
| Links Google Maps Não Padronizados | 1 arquivo | 🟡 Média | Padronizar |
| Termos de Serviço Ausente | N/A | 🔴 Alta | Criar |

---

## ✅ Fonte da Verdade (NAP Canonical)

Todos os dados devem seguir o padrão definido em:

**Arquivo:** `src/lib/napCanonical.js`

### Dados Oficiais:

```javascript
business: {
  legalName: 'Clínica Saraiva Vision',
  displayName: 'Saraiva Vision',
}

address: {
  full: 'Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga - MG, 35300-299',
  street: 'Rua Catarina Maria Passos',
  number: '97',
  neighborhood: 'Santa Zita',
  city: 'Caratinga',
  state: 'MG',
  postalCode: '35300-299', // ✅ CORRETO
}

phone: {
  primary: {
    e164: '+5533998601427',
    display: '+55 33 99860-1427',
    displayShort: '(33) 99860-1427',
  }
}

hours: {
  formatted: {
    long: 'Segunda a Sexta: 08:00 às 18:00 | Sábado e Domingo: Fechado',
  }
}

doctor: {
  name: 'Dr. Philipe Saraiva Cruz',
  crm: 'CRM-MG 69.870',
}
```

---

## 🎯 Plano de Ação Recomendado

### **Prioridade 1 - Urgente (Hoje)**

1. ✅ Corrigir post de blog "Teste do Olhinho" com endereço/telefone errados
2. ✅ Atualizar CEP de 35300-000 para 35300-299 nos 6 arquivos

### **Prioridade 2 - Alta (Esta Semana)**

3. ✅ Criar página de Termos de Serviço
4. ✅ Padronizar coordenadas geográficas
5. ✅ Substituir links do Google Maps por Place ID
6. ✅ Revisar e validar todos os textos da Política de Privacidade

### **Prioridade 3 - Média (Próximas 2 Semanas)**

7. ✅ Auditar todas as páginas de serviços para validar NAP
8. ✅ Implementar testes automatizados para validar NAP consistency
9. ✅ Documentar processo de atualização de dados NAP

---

## 📁 Arquivos que Precisam de Correção

### CEP Errado (35300-000 → 35300-299)

1. `src/data/faqData.js` - Linha 24
2. `src/lib/blogSchemaMarkup.js` - Linhas 36, 200
3. `src/lib/podcastSchemaMarkup.js` - Linhas 29, 270
4. `src/components/__tests__/SEOHead.test.jsx` - Linha 10

### Dados Completamente Errados (Endereço + Telefone)

1. `src/data/blogPosts.js` - Post retinoblastoma
2. `src/data/blogPosts.sanity.js` - Post retinoblastoma
3. `src/data/blogPosts.static-backup.js` - Post retinoblastoma
4. `src/content/blog/posts/post-22.js` - Post retinoblastoma

### Coordenadas para Validar

1. `src/lib/clinicInfo.js` - Verificar latitude/longitude
2. `src/lib/napCanonical.js` - Verificar latitude/longitude
3. `src/data/faqData.js` - Link do Google Maps

---

## 🔐 Compliance e Regulamentações

### LGPD (Lei Geral de Proteção de Dados)
✅ Política de Privacidade implementada
✅ DPO configurado (dpo@saraivavision.com.br)
⚠️ Falta TOS para complementar compliance

### CFM (Conselho Federal de Medicina)
✅ Médico responsável identificado (Dr. Philipe Saraiva Cruz - CRM-MG 69.870)
✅ Informações médicas precisas no FAQ
🔴 **CRÍTICO:** Post com dados de contato errados viola boas práticas

### SEO Local (Google My Business)
⚠️ NAP inconsistente prejudica ranqueamento
⚠️ Coordenadas divergentes afetam precisão
✅ Place ID configurado corretamente

---

## 📞 Contato para Questões sobre Este Relatório

**Arquivo de Referência:** `AUDIT_NAP_CONSISTENCY_2025-11-02.md`
**Localização:** `/home/saraiva-vision-site/claudedocs/`

---

**Fim do Relatório**
