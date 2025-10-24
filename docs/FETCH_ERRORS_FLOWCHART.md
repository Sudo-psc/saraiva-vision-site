# 🔄 Fluxograma de Diagnóstico e Solução de Erros

## Diagrama de Fluxo Principal

```
┌─────────────────────────────────────────────────────────────┐
│  Usuário acessa https://www.saraivavision.com.br/planos     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│           Service Worker Intercepta Requisições             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
            ┌─────────────┴─────────────┐
            │  É requisição HTTP/HTTPS? │
            └─────────────┬─────────────┘
                          │
         ┌────────────────┴────────────────┐
         │ SIM                             │ NÃO
         ▼                                 ▼
┌────────────────────┐          ┌──────────────────────┐
│  Verifica padrões  │          │  Ignora (extensões,  │
│  de analytics      │          │  chrome://, etc.)    │
└─────────┬──────────┘          └──────────────────────┘
          │
          ▼
    ┌─────────────────────────────────┐
    │ Contém pattern de analytics?    │
    │ (gtm, analytics, ccm, facebook) │
    └─────────┬───────────────────────┘
              │
   ┌──────────┴──────────┐
   │ SIM                 │ NÃO
   ▼                     ▼
┌──────────────┐   ┌────────────────────────┐
│  Log "Skip"  │   │  Processa normalmente  │
│  Retorna     │   │  (cache/network)       │
└──────────────┘   └────────────────────────┘
```

---

## Fluxo de fetchJSON com Guards

```
┌──────────────────────────────────────────────┐
│  fetchJSON(url, options, config)             │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  Guard 1: Circuit Breaker Check              │
│  - Endpoint está em OPEN state?              │
└────────────────┬─────────────────────────────┘
                 │
        ┌────────┴────────┐
        │ OPEN            │ CLOSED/HALF_OPEN
        ▼                 ▼
┌──────────────┐    ┌─────────────────────────┐
│  Throw erro  │    │  Continua processamento │
│  "Circuit    │    └────────────┬────────────┘
│  breaker     │                 │
│  is OPEN"    │                 ▼
└──────────────┘    ┌─────────────────────────┐
                    │  Retry Loop (0-3 vezes) │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  fetchWithTimeout()     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Guard 2: HTTP Status   │
                    │  - response.ok?         │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴─────────────┐
                    │ !ok                      │ ok
                    ▼                          ▼
        ┌──────────────────────┐    ┌──────────────────────────┐
        │  Throw HTTP error    │    │  Guard 3: Content-Length │
        │  (retry se 500+)     │    │  - É "0"?                │
        └──────────────────────┘    └─────────┬────────────────┘
                                              │
                                 ┌────────────┴────────────┐
                                 │ É "0"                   │ !é "0"
                                 ▼                         ▼
                    ┌──────────────────────┐    ┌──────────────────────────┐
                    │  Return null         │    │  Guard 4: Status 204?    │
                    └──────────────────────┘    └─────────┬────────────────┘
                                                          │
                                             ┌────────────┴────────────┐
                                             │ 204                     │ !204
                                             ▼                         ▼
                                ┌──────────────────────┐    ┌──────────────────────────┐
                                │  Return null         │    │  Guard 5: Content-Type   │
                                └──────────────────────┘    │  - É application/json?   │
                                                            └─────────┬────────────────┘
                                                                      │
                                                                      ▼
                                                            ┌──────────────────────────┐
                                                            │  Guard 6: Read Body      │
                                                            │  - const text = await    │
                                                            │    response.text()       │
                                                            └─────────┬────────────────┘
                                                                      │
                                                                      ▼
                                                            ┌──────────────────────────┐
                                                            │  Guard 7: Empty Body?    │
                                                            │  - !text || length === 0 │
                                                            └─────────┬────────────────┘
                                                                      │
                                                         ┌────────────┴────────────┐
                                                         │ Empty                   │ !Empty
                                                         ▼                         ▼
                                            ┌──────────────────────┐    ┌──────────────────────────┐
                                            │  Return null/[]      │    │  Guard 8: Is JSON?       │
                                            └──────────────────────┘    │  - Starts with { or [    │
                                                                        └─────────┬────────────────┘
                                                                                  │
                                                                     ┌────────────┴────────────┐
                                                                     │ !JSON                   │ JSON
                                                                     ▼                         ▼
                                                        ┌──────────────────────┐    ┌──────────────────────────┐
                                                        │  Throw "Not JSON"    │    │  Guard 9: Parse JSON     │
                                                        └──────────────────────┘    │  - JSON.parse(text)      │
                                                                                    └─────────┬────────────────┘
                                                                                              │
                                                                                 ┌────────────┴────────────┐
                                                                                 │ Parse Error             │ Success
                                                                                 ▼                         ▼
                                                                    ┌──────────────────────┐    ┌──────────────────────────┐
                                                                    │  Throw detailed      │    │  Return data             │
                                                                    │  parse error         │    │  Record success in CB    │
                                                                    └──────────────────────┘    └──────────────────────────┘
```

---

## Fluxo de Circuit Breaker

```
┌────────────────────────────────────────┐
│  Circuit Breaker State Machine         │
└────────────────┬───────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │  CLOSED       │ ◀───────────────────┐
         │  (Normal)     │                     │
         └───────┬───────┘                     │
                 │                             │
                 │ failures >= threshold       │ successes >= threshold
                 │                             │
                 ▼                             │
         ┌───────────────┐                     │
         │  OPEN         │                     │
         │  (Blocked)    │                     │
         └───────┬───────┘                     │
                 │                             │
                 │ timeout expired             │
                 │                             │
                 ▼                             │
         ┌───────────────┐                     │
         │  HALF_OPEN    │ ────────────────────┘
         │  (Testing)    │
         └───────────────┘
                 │
                 │ any failure
                 │
                 └─────────▶ OPEN
```

**Estados**:
- **CLOSED**: Requisições passam normalmente
- **OPEN**: Requisições bloqueadas (endpoint problemático)
- **HALF_OPEN**: Testando se endpoint voltou (1-2 tentativas)

**Transições**:
- `CLOSED → OPEN`: Após 5 falhas consecutivas
- `OPEN → HALF_OPEN`: Após 60 segundos
- `HALF_OPEN → CLOSED`: Após 2 sucessos
- `HALF_OPEN → OPEN`: Após 1 falha

---

## Fluxo de Retry com Exponential Backoff

```
Attempt 0: ──┐
             │ Falha
             ├─────▶ Wait 1000ms (base delay)
             │
Attempt 1: ──┤
             │ Falha
             ├─────▶ Wait 2000ms (2^1 * base)
             │
Attempt 2: ──┤
             │ Falha
             ├─────▶ Wait 4000ms (2^2 * base)
             │
Attempt 3: ──┤
             │ Falha
             └─────▶ Throw final error

Cálculo do delay:
delay = min(baseDelay * 2^attempt, maxDelay) ± jitter(25%)

Exemplo:
Attempt 0: 1000ms ± 250ms = 750-1250ms
Attempt 1: 2000ms ± 500ms = 1500-2500ms
Attempt 2: 4000ms ± 1000ms = 3000-5000ms
Attempt 3: 8000ms ± 2000ms = 6000-10000ms
```

---

## Decisão: Quando Usar Cada Estratégia

```
┌─────────────────────────────────────┐
│  Tipo de Recurso                    │
└────────────┬────────────────────────┘
             │
             ▼
        ┌────────────────────┐
        │  É documento HTML? │
        └─────────┬──────────┘
                  │
      ┌───────────┴──────────┐
      │ SIM                  │ NÃO
      ▼                      ▼
┌──────────────────┐   ┌──────────────────────┐
│  Network-First   │   │  É script/style/img? │
│                  │   └─────────┬────────────┘
│  1. Fetch rede   │             │
│  2. Cache resp.  │   ┌─────────┴──────────┐
│  3. Se falha →   │   │ SIM                │ NÃO
│     cache        │   ▼                    ▼
│                  │  ┌──────────────────┐ ┌──────────────────┐
│  Garante:        │  │  Cache-First     │ │  Network-First   │
│  - HTML fresco   │  │                  │ │                  │
│  - Fallback OK   │  │  1. Cache        │ │  (mesmo que HTML)│
└──────────────────┘  │  2. Se miss →    │ └──────────────────┘
                      │     fetch        │
                      │  3. Cache resp.  │
                      │  4. BG update    │
                      │                  │
                      │  Garante:        │
                      │  - Load rápido   │
                      │  - Offline OK    │
                      └──────────────────┘
```

---

## Fluxo de Erro: De Onde Vêm os Problemas

```
┌──────────────────────────────────────────────┐
│  1. FAILED TO FETCH (Service Worker)         │
└────────────────┬─────────────────────────────┘
                 │
    ┌────────────┴─────────────────────────────┐
    │                                          │
    ▼                                          ▼
┌────────────────────────┐      ┌──────────────────────────┐
│  Analytics bloqueados  │      │  Extensões do navegador  │
│  por Permissions       │      │  fazem requests          │
│  Policy/CSP            │      │  (chrome-extension://)   │
└────────────────────────┘      └──────────────────────────┘
    │                                          │
    └──────────────┬───────────────────────────┘
                   │
                   ▼
      ┌────────────────────────────┐
      │  SW tenta interceptar      │
      │  e cachear TUDO            │
      └────────────┬───────────────┘
                   │
                   ▼
      ┌────────────────────────────┐
      │  fetch() falha             │
      │  (cross-origin blocked)    │
      └────────────┬───────────────┘
                   │
                   ▼
      ┌────────────────────────────┐
      │  ❌ "Failed to fetch"       │
      │  aparece no console        │
      └────────────────────────────┘

┌──────────────────────────────────────────────┐
│  2. JSON PARSE ERROR (fetch-with-retry)      │
└────────────────┬─────────────────────────────┘
                 │
    ┌────────────┴─────────────────────────────┐
    │                                          │
    ▼                                          ▼
┌────────────────────────┐      ┌──────────────────────────┐
│  API retorna 204       │      │  Response body vazio     │
│  (No Content)          │      │  mas status 200          │
└────────────────────────┘      └──────────────────────────┘
    │                                          │
    └──────────────┬───────────────────────────┘
                   │
                   ▼
      ┌────────────────────────────┐
      │  response.text() retorna   │
      │  string vazia ""           │
      └────────────┬───────────────┘
                   │
                   ▼
      ┌────────────────────────────┐
      │  JSON.parse("")            │
      └────────────┬───────────────┘
                   │
                   ▼
      ┌────────────────────────────┐
      │  ❌ SyntaxError:            │
      │  "Unexpected end of        │
      │   JSON input"              │
      └────────────────────────────┘

┌──────────────────────────────────────────────┐
│  3. GOOGLE CCM ERR_FAILED                    │
└────────────────┬─────────────────────────────┘
                 │
    ┌────────────┴─────────────────────────────┐
    │                                          │
    ▼                                          ▼
┌────────────────────────┐      ┌──────────────────────────┐
│  Permissions Policy:   │      │  Ad blockers             │
│  geolocation=()        │      │  (uBlock, Privacy Badge) │
│  microphone=()         │      │  bloqueiam GTM/GA        │
│  camera=()             │      └──────────────────────────┘
└────────────────────────┘                     │
    │                                          │
    └──────────────┬───────────────────────────┘
                   │
                   ▼
      ┌────────────────────────────┐
      │  googletagmanager.com/ccm/ │
      │  request é bloqueada       │
      └────────────┬───────────────┘
                   │
                   ▼
      ┌────────────────────────────┐
      │  ❌ net::ERR_FAILED         │
      └────────────────────────────┘

┌──────────────────────────────────────────────┐
│  4. PERMISSIONS POLICY VIOLATIONS            │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  Nginx header:                               │
│  Permissions-Policy:                         │
│    "geolocation=(),                          │
│     microphone=(),                           │
│     camera=()"                               │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  Browser interpreta como BLOQUEIO TOTAL      │
│  (nenhuma origem pode usar essas features)   │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  ⚠️ Console warning:                         │
│  "Permissions policy violation:              │
│   geolocation is not allowed"                │
└──────────────────────────────────────────────┘
```

---

## Árvore de Decisão: Devo Corrigir Este Erro?

```
                  ┌──────────────────┐
                  │  Erro no console │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  Afeta UX?       │
                  └────────┬─────────┘
                           │
              ┌────────────┴────────────┐
              │ SIM                     │ NÃO
              ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  CORRIGIR AGORA  │      │  Afeta SEO?      │
    │  (P0 - Crítico)  │      └────────┬─────────┘
    └──────────────────┘               │
                           ┌───────────┴──────────┐
                           │ SIM                  │ NÃO
                           ▼                      ▼
                  ┌──────────────────┐   ┌──────────────────┐
                  │  CORRIGIR HOJE   │   │  Afeta analytics?│
                  │  (P1 - Alta)     │   └────────┬─────────┘
                  └──────────────────┘            │
                                      ┌───────────┴──────────┐
                                      │ SIM                  │ NÃO
                                      ▼                      ▼
                             ┌──────────────────┐   ┌──────────────────┐
                             │  CORRIGIR        │   │  É ruído no      │
                             │  ESTA SEMANA     │   │  console?        │
                             │  (P2 - Média)    │   └────────┬─────────┘
                             └──────────────────┘            │
                                                 ┌───────────┴──────────┐
                                                 │ SIM                  │ NÃO
                                                 ▼                      ▼
                                        ┌──────────────────┐   ┌──────────────────┐
                                        │  CORRIGIR        │   │  IGNORAR         │
                                        │  QUANDO POSSÍVEL │   │  (não é erro)    │
                                        │  (P3 - Baixa)    │   └──────────────────┘
                                        └──────────────────┘
```

**Classificação dos 4 erros**:

| Erro | Afeta UX? | Afeta SEO? | Afeta Analytics? | Prioridade | Ação |
|------|-----------|------------|------------------|------------|------|
| Failed to fetch | ❌ Não | ❌ Não | ⚠️ Parcial | P3 | Corrigir |
| JSON parse error | ❌ Não | ❌ Não | ❌ Não | P3 | Corrigir |
| Google CCM | ❌ Não | ❌ Não | ⚠️ Parcial | P4 | Entender |
| Permissions Policy | ❌ Não | ❌ Não | ❌ Não | P5 | Ignorar |

**Conclusão**: Todos são **P3-P5** (baixa prioridade), mas vale corrigir para:
- ✅ Console limpo (profissionalismo)
- ✅ Debugging mais fácil
- ✅ Best practices

---

## Timeline de Implementação

```
Hoje (Dia 0)
  │
  ├─ 09:00 ──▶ Ler documentação (FETCH_ERRORS_EXECUTIVE_SUMMARY.md)
  │             Tempo: 10 min
  │
  ├─ 09:10 ──▶ Decidir estratégia (script vs manual)
  │             Tempo: 5 min
  │
  ├─ 09:15 ──▶ Executar correções
  │             │
  │             ├─ Opção A: Script automatizado (15 min)
  │             │   └─ sudo bash scripts/fix-fetch-errors.sh
  │             │
  │             └─ Opção B: Manual (30 min)
  │                 ├─ Editar public/sw.js (15 min)
  │                 └─ Editar src/utils/fetch-with-retry.js (15 min)
  │
  ├─ 09:30 ──▶ Build e deploy
  │             └─ npm run build:vite && sudo npm run deploy:quick
  │             Tempo: 5 min
  │
  ├─ 09:35 ──▶ Testes no navegador
  │             └─ Abrir /planos, verificar console
  │             Tempo: 10 min
  │
  └─ 09:45 ──▶ ✅ DONE
               Total: 45 minutos

Semana 1 (Opcional)
  │
  ├─ Dia 1-2 ──▶ Implementar analytics fallback
  │               (Opção 1 do item #3)
  │               Tempo: 2 horas
  │
  ├─ Dia 3-4 ──▶ Criar endpoint /api/analytics/track
  │               Tempo: 1 hora
  │
  └─ Dia 5 ────▶ Testes e validação
                  Tempo: 1 hora

Mês 1 (Avançado)
  │
  └─ Analytics server-side completo
     ├─ Google Analytics Measurement Protocol
     ├─ PostHog/Plausible integration
     └─ Dashboard interno de métricas
     Tempo: 1-2 semanas
```

---

**Status**: ✅ Documentação completa  
**Próximo passo**: Executar script ou implementação manual  
**Tempo estimado**: 30-45 minutos
