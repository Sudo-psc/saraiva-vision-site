# Estratégia de Conteúdo Médico — Saraiva Vision

Diretrizes para produção, revisão e publicação de conteúdo médico com foco em educação do paciente, SEO local e conformidade ética.

## Objetivos
- Educar pacientes sobre condições oculares, exames e procedimentos.
- Reforçar autoridade clínica (E‑E‑A‑T) e confiança.
- Aumentar descoberta orgânica em Caratinga/MG e região.
- Conduzir a conversões qualificadas (agendamentos/contato).

## Pilares de Conteúdo
- Condições: miopia, hipermetropia, astigmatismo, presbiopia, glaucoma, catarata, retinopatia diabética, DMRI, olho seco, estrabismo.
- Procedimentos: cirurgia de catarata, refrativa, adaptação de lentes de contato, tratamentos para glaucoma, exames (OCT, campimetria etc.).
- Guias prático‑paciente: pré e pós‑operatório, sinais de alerta, quando procurar atendimento, prevenção e hábitos saudáveis.
- FAQs e mitos/verdades.
- Conteúdos sazonais (exa.: volta às aulas, campanhas de saúde ocular).

## Estrutura Recomendada de Artigos
1. Título H1 claro (até ~60–70 caracteres).
2. Resumo/lead de 1–2 frases com valor para o paciente.
3. Seções H2/H3:
   - O que é / visão geral
   - Sintomas e sinais
   - Causas e fatores de risco
   - Diagnóstico e exames
   - Tratamentos e opções terapêuticas
   - Riscos/efeitos adversos e prognóstico
   - Prevenção e autocuidado
   - Quando procurar atendimento
   - Perguntas frequentes (FAQ)
4. Chamada para ação (CTA) objetiva: “Agende uma consulta”, “Fale com um especialista”.
5. Aviso legal (disclaimer) e data da última revisão clínica.

Componentização (React + Tailwind):
```jsx
<article className="prose max-w-prose-wide">
  <h1 className="text-display-sm md:text-display-md">Catarata: sintomas, diagnóstico e tratamento</h1>
  <p className="text-body-lg text-soft-gray-700">Resumo introdutório…</p>
  <h2 className="text-heading-xl">O que é</h2>
  <p>…</p>
  <h2 className="text-heading-xl">Sintomas</h2>
  <ul className="list-disc pl-6">…</ul>
  {/* … Demais seções */}
  <div className="mt-8">
    <a href="/contato" className="inline-flex px-5 py-3 rounded-md bg-brand-blue-600 hover:bg-brand-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue-500">Agendar consulta</a>
  </div>
  <p className="mt-6 text-caption text-soft-gray-600">Este conteúdo tem caráter informativo e não substitui consulta médica. Última revisão: 2025‑01‑15.</p>
</article>
```

## SEO Médico e Local (YMYL)
- E‑E‑A‑T: incluir autor/revisor médico (nome, CRM), data de revisão e fontes.
- Palavras‑chave locais: “oftalmologista em Caratinga”, “cirurgia de catarata Caratinga”, “clínica oftalmológica Vale do Rio Doce”.
- Meta e URL: rotas em `kebab-case` (ex.: `/servicos/cirurgia-de-catarata`).
- Interligação interna: artigos ↔ serviços ↔ contato/FAQ ↔ mapa.
- Dados estruturados (JSON‑LD):
  - `MedicalWebPage` para artigos;
  - `FAQPage` quando houver bloco de perguntas;
  - `BreadcrumbList` para navegação;
  - `LocalBusiness/MedicalClinic` já presente na home.

Exemplo (trecho JSON‑LD):
```json
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "about": {"@type":"MedicalCondition","name":"Catarata"},
  "lastReviewed": "2025-01-15",
  "reviewedBy": {"@type":"Physician","name":"Dr. Philipe Saraiva Cruz","identifier":"CRM-MG 69.870"}
}
```

## Processo Editorial e Compliance
- Fluxo: Redação → Revisão clínica (Dr. Philipe) → Ajustes → Publicação.
- Disclaimers: “Conteúdo informativo, não substitui consulta médica.”
- Ética e privacidade: sem diagnósticos individuais; anonimizar casos; consentimento explícito para imagens.
- Fontes recomendadas: CBO, AAO, OMS, Ministério da Saúde, artigos revisados por pares.
- Atualização: revisar ao menos 1x/ano ou quando diretrizes mudarem.

## Diretrizes de Estilo
- Linguagem: Português‑BR, clara, empática e precisa.
- Leiturabilidade: parágrafos curtos, listas quando útil, `max-w-prose`.
- Medidas: usar unidades do SI e termos leigos antes de termos técnicos.
- Inclusão: linguagem acolhedora; evitar vieses.

## Calendário Editorial (exemplo 12 semanas)
1. Miopia em adolescentes: sinais e prevenção
2. Lentes de contato: cuidados e higiene
3. Olho seco: causas e tratamento
4. Glaucoma: importância do diagnóstico precoce
5. Cirurgia de catarata: o que esperar
6. Retinopatia diabética: rastreio e controle
7. Presbiopia: opções de correção
8. Exames oftalmológicos mais comuns (OCT, campimetria)
9. Segurança digital e fadiga ocular (telas)
10. Mitos e verdades sobre visão
11. Saúde ocular infantil: volta às aulas
12. Proteção UV e verão

## Multilíngue e Acessibilidade
- i18n: adicionar chaves em `src/locales/{pt,en}/translation.json`.
- Acessibilidade: alts descritivos, contraste adequado, tabelas com cabeçalhos, transcrições para vídeos.

## Mensuração e Consentimento
- Eventos: leitura de artigo, clique em CTA, contato.
- Respeito à privacidade: rastreamento somente após consentimento (já implementado no site via Consent Mode e GTM gated).
- Web Vitals: manter monitoramento de experiência.

## Governança
- Responsável clínico: validação de exatidão médica e atualizações.
- Responsável editorial: calendário, coerência de tom e SEO.
- Responsável técnico: performance, acessibilidade, dados estruturados.

