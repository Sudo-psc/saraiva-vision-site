# Auditoria, Plano de Implementação e TODOs — saraivavision.com.br

Este documento consolida a auditoria técnica do site, o plano de implantação por prioridades, critérios de aceite, checklist de TODOs e pistas de validação. Foi escrito com base no código atual (React 18 + Vite, Tailwind, i18n, Vitest) e nas correções já aplicadas na infraestrutura (Nginx) e UI (scroll lock).

## 1) Sumário Executivo
- Base técnica sólida, com SEO e A11y bem encaminhados (Schema dinâmico, Consent Mode, CTAs, reviews e seção local já presentes).
- Oportunidades de alto impacto: (P1) consolidar/expandir Schema e reforçar contexto local; (P1) mapa interativo na página de Contato; (P1) padronizar CTAs WhatsApp com UTM e mensagem contextual; (P2) revisar meta descriptions; (P2) reforçar social proof nas páginas-chaves.
- Infra corrigida: erro de “nosniff/404” em assets WordPress sanado com regras de proxy no Nginx.

## 2) Pontos Fortes (Confirmados)
- Confiança/credibilidade: CRM-MG 69.870, NAP completo, fotos profissionais.
- LGPD: política + consentimento com Consent Mode v2.
- SEO local: títulos com “Caratinga/MG” já presentes em páginas-chave.
- UX/Conteúdo: CTAs claros, responsivo, FAQ e descrições detalhadas.
- Schema dinâmico: Helmet injeta JSON-LD consolidado (Organization, Website, MedicalClinic, WebPage/FAQ/Breadcrumb/etc.).
  - Referências: `src/components/SchemaMarkup.jsx`, `src/hooks/useSEO.js`, `src/lib/schemaMarkup.js`.

## 3) Lacunas Prioritárias
- P0 (Infra): servir corretamente assets do WordPress (corrigido).
- P1: 
  1) Consolidar/expandir Schema (evitar duplicidades com index.html; adicionar Physician quando aplicável; revisar @id e sameAs) 
  2) Inserir mapa interativo na página de Contato (fallback seguro)
  3) Padronizar CTAs WhatsApp com UTM + mensagens contextuais (ex.: por serviço)
- P2: 
  4) Revisar meta descriptions e títulos com termos locais
  5) Reforçar social proof em Services/Contact (reviews compactos)
  6) Pequenos ganhos de performance (lazy/img + formatos modernos)
- P3: 
  7) Blog educativo (conteúdo local) 
  8) Analytics avançado (funis por serviço, coortes por canal)

## 4) Correções já Aplicadas (Changelog técnico)
- Nginx (production + local): priorização de proxy para `/wp-includes/`, `/wp-content/`, `/wp-admin/` e `/wp-login.php`; MIME correto p/ manifest; cache de JSON/manifest; gzip estendido.
  - Arquivos: `nginx.conf`, `nginx-production-full.conf`
- Deploy: `deploy.sh` agora aceita `--prune N` e instala devDependencies (prebuild com `sharp`).
- UI/Scroll: lock de scroll com refcount (evita “rolagem dupla” com menus/modais) e baseline CSS clean.
  - Arquivos: `src/hooks/useBodyScrollLock.js`, `src/styles/scroll-fix-clean.css`

## 5) Plano de Implementação Detalhado

### P0 (Infra) — OK
- [Feito] Assets WP corretos (evita 404 + nosniff) e ajustes de cache/MIME/gzip.

### P1 (1–2 semanas)
1) Consolidar/Expandir Schema
- Ações:
  - Centralizar Schema via `SchemaMarkup` (Helmet) e reduzir sobreposição do JSON-LD estático do `index.html`.
  - Confirmar @graph com: `Organization`, `WebSite`, `MedicalClinic`, `WebPage`, `BreadcrumbList`, `FAQPage` (quando aplicável) e `Physician` (quando pertinente ao conteúdo).
  - Revisar `@id`, `publisher`, `sameAs` e URLs canônicas.
- Arquivos-alvo: `src/components/SchemaMarkup.jsx`, `src/hooks/useSEO.js`, `index.html` (apenas consolidar/limpar duplicidades se necessário).
- Aceite: Rich Results Test sem avisos críticos; Search Console sem duplicidade de Schema.

2) Contato com Mapa Interativo
- Ações:
  - Reintroduzir o mapa em `Contact` usando `GoogleMapNew` com fallback estático (link “Ver no Google Maps”).
  - Garantir conformidade CSP/Consent; degradar graciosamente sem JS.
- Arquivos-alvo: `src/components/Contact.jsx`, `src/components/GoogleMapNew.jsx`.
- Aceite: mapa renderiza sem erros; fallback clicável; sem impacto relevante no LCP.

3) CTAs WhatsApp padronizados + UTM
- Ações:
  - Usar `useWhatsApp` em todos os pontos; acrescentar UTM padrão (utm_source=site, utm_medium=whatsapp, utm_campaign=agendamento) e suportar mensagem contextual (ex.: serviço/página).
  - Revisar `CONTACT.DEFAULT_MESSAGES.WHATSAPP` para texto claro e curto; manter i18n donde necessário.
- Arquivos-alvo: `src/hooks/useWhatsApp.js`, `src/lib/constants.js`, botões que chamam WhatsApp (Navbar, Hero, CTAModal, Contact, etc.).
- Aceite: todos os CTAs geram URL com mensagem e UTM; eventos `generate_lead` mapeados (GA/Meta).

### P2 (até 30 dias)
4) Meta e Títulos Locais
- Ações: reforçar “Caratinga/MG” e termos médicos em `useSEO` nas páginas-chave (Home, Serviços, Contato, Sobre, FAQ), preservando i18n.
- Arquivos-alvo: `src/hooks/useSEO.js`, páginas com `SEOHead`.
- Aceite: metas atualizadas e coerentes; verificação manual e snapshot tests.

5) Social Proof em Services/Contact
- Ações: inserir `CompactGoogleReviews` ou bloco de resumo em ServicesPage/Contact (com lazy e layout estável).
- Arquivos-alvo: `src/pages/ServicesPage.jsx`, `src/components/Contact.jsx`, `src/components/CompactGoogleReviews.jsx`.
- Aceite: bloco renderiza; sem shift de layout perceptível; sem regressões mobile.

6) Performance leve (imagens)
- Ações: checagem de lazy, largura adequada e formatos modernos; usar pipeline existente quando necessário.
- Arquivos-alvo: componentes de mídia; `tools/img-pipeline.mjs`.
- Aceite: estabilidade no LCP móvel e CLS ≈ 0 nas principais páginas.

### P3 (60+ dias)
7) Blog educativo com pauta local.
8) Analytics avançado (funis por serviço, coortes por canal, eventos de meio-funil).

## 6) Critérios de Aceite (por item)
- Schema: Rich Results Test sem avisos críticos; GSC sem erros de Schema; @id e sameAs corretos.
- Contato/Mapa: mapa carregado sem erros; fallback funcional; sem degradação de LCP > 300 ms.
- WhatsApp: CTAs com UTM e mensagem contextual; eventos de conversão “whatsapp_click” mapeados.
- Meta: titles/descriptions atualizados e adequados (PT/EN quando aplicável); verificações automatizadas passadas.
- Social proof: reviews presentes, sem CLS; boa legibilidade no mobile.

## 7) Testes e Validação (Vitest + Testing Library)
- Novos testes:
  - `src/hooks/__tests__/useWhatsApp.test.js` — URL com mensagem + UTM (+ variações contextuais)
  - `src/lib/__tests__/schemaMarkup.test.js` — @graph com MedicalClinic/WebSite/WebPage/Breadcrumb/FAQ (quando aplicável)
  - `src/pages/__tests__/ContactPage.seo.test.jsx` — meta/título e presença do bloco de mapa (mock)
  - `src/components/__tests__/Contact.map.test.jsx` — fallback de mapa; sem erros console
  - `src/components/__tests__/CTAs.analytics.test.jsx` — trackConversion em cliques
- Filosofia: focar escopos afetados; evitar E2E pesado por ora; manter cobertura estável.

## 8) KPIs e Monitoramento
- SEO: aumento de impressões/CTR em termos locais (Search Console). 
- Conversão: +10–15% nos cliques WhatsApp/CTA; +15% leads em 90 dias. 
- Performance: LCP móvel P75 < 2.5 s nas rotas principais; CLS ≈ 0. 
- Conformidade: Consent Mode ativo; sem violações A11y críticas; sem erros nosniff/404.

## 9) Riscos e Mitigações
- Duplicidade de Schema: consolidar (preferir Helmet) e manter @id estáveis.
- Google Maps: chave/quota — manter fallback e carregar sob consent.
- UTM: evitar parâmetros excessivos; conferir encoding.

## 10) Responsáveis
- FE: Schema/Contact Map/WhatsApp/SEO/Tests.
- DevOps: Nginx verificação/reload; logs de erro.
- Conteúdo/SEO: revisão de títulos/descriptions e pauta de blog.

## 11) Timeline Sugerida
- Semana 1–2: P1 (Schema, Mapa, WhatsApp)
- Semana 3–4: P2 (meta, social proof, performance leve) + testes
- 60+ dias: P3 (blog, analytics avançado)

## 12) TODOs — Checklist de Implementação

### P0 — Infra (Feito)
- [x] Nginx: priorizar proxy `/wp-includes/`, `/wp-content/`, `/wp-admin/`, `/wp-login.php` (evitar 404+nosniff)
- [x] Manifest/JSON cache + MIME; gzip estendido
- [x] Deploy com `--prune N` e devDeps (prebuild `sharp`)

### P1 — 1–2 semanas
- [ ] Schema: consolidar via `SchemaMarkup` e reduzir sobreposição do `index.html`
  - Arquivos: `src/components/SchemaMarkup.jsx`, `src/hooks/useSEO.js`, `index.html`
  - Aceite: Rich Results OK; GSC sem avisos de duplicidade
- [ ] Contato: adicionar `GoogleMapNew` com fallback
  - Arquivos: `src/components/Contact.jsx`, `src/components/GoogleMapNew.jsx`
  - Aceite: sem erros/CSP; fallback clicável
- [ ] WhatsApp: UTM + mensagens contextuais (por serviço/página)
  - Arquivos: `src/hooks/useWhatsApp.js`, `src/lib/constants.js` (+ pontos de uso)
  - Aceite: UTM padrão; `generate_lead` mapeado

### P2 — até 30 dias
- [ ] Meta/títulos locais revisados (Home/Services/Contact/About/FAQ)
  - Arquivos: `src/hooks/useSEO.js`, páginas
- [ ] Social proof em Services/Contact (widget compacto)
  - Arquivos: `src/pages/ServicesPage.jsx`, `src/components/Contact.jsx`, `src/components/CompactGoogleReviews.jsx`
- [ ] Performance leve (lazy/img + formatos)
  - Arquivos: componentes de mídia; `tools/img-pipeline.mjs`

### P3 — 60+ dias
- [ ] Blog educativo com pauta local
- [ ] Analytics avançado (funis/coortes)

## 13) Validação Final
- Nginx: `nginx -t && systemctl reload nginx`; `curl -I /wp-includes/js/jquery/jquery.min.js` → 200 + `Content-Type: application/javascript`
- Mapas: sem erros de console; fallback ativo sem Google API
- Schema: Rich Results Test OK; GSC sem avisos
- SEO: titles/descriptions atualizados; testes meta passam
- WhatsApp: UTM presentes; eventos `generate_lead`/`Lead` registrados

---

Atualizado em: 2025-09-06
Responsável: Equipe FE/DevOps/Conteúdo Saraiva Vision
