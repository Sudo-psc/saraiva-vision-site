# Arquitetura Atual

A aplicação cliente é baseada em React 18 com Vite, usando React Router e carregamento preguiçoso para páginas. O arquivo `App.jsx` centraliza todo o cadastro de rotas, mistura páginas de negócio e páginas de teste e mantém a lógica condicional para subdomínios, além de empilhar widgets globais no mesmo componente. Isso deixa o componente principal muito extenso e com responsabilidades cruzadas entre layout, roteamento e regras específicas de domínio.【F:src/App.jsx†L7-L128】

O bootstrap em `main.jsx` acumula inicialização de rastreamento de erros, configuração de web vitals, registro de service worker, exposição de singletons no `window` e renderização. Essa concentração dificulta isolar responsabilidades de observabilidade e torna mais complexo aplicar testes ou versões alternativas de inicialização.【F:src/main.jsx†L1-L185】

No diretório de serviços existe uma mescla de integrações de analytics e Instagram com várias funções utilitárias que acessam diretamente APIs globais do navegador. Há sobreposição entre serviços de analytics, scripts legados e rastreadores, além de acoplamento forte a objetos globais como `window`.【F:src/services/analytics-service.js†L8-L138】【F:src/services/instagramService.js†L8-L158】【F:scripts/error-tracker.js†L6-L142】

# Pontos Fortes

- Uso consistente de code splitting e suspense para páginas, reduzindo o tempo de interação inicial.【F:src/App.jsx†L7-L127】
- Instrumentação rica de métricas e rastreamento de erros já disponível no bootstrap, garantindo visibilidade operacional.【F:src/main.jsx†L73-L144】【F:scripts/error-tracker.js†L6-L142】
- Serviços de rede com políticas de retry e fallback, como o serviço de analytics, já estruturam resiliência em casos de falha de terceiros.【F:src/services/analytics-service.js†L8-L138】

# Riscos e Gargalos

- O roteamento monolítico no componente principal dificulta a evolução do domínio e impede carregamento seletivo de contextos ou layouts especializados.【F:src/App.jsx†L7-L128】
- O arquivo de bootstrap atua como ponto único de falha: qualquer exceção na configuração de analytics ou service worker impacta a renderização inicial. Não há separação clara entre inicializadores síncronos e assíncronos.【F:src/main.jsx†L1-L185】
- A camada de serviços mistura responsabilidades de infraestrutura (ex.: configuração de tokens) com regras de domínio e lógica de UI (ex.: interação via WebSocket) sem módulos claros, aumentando o acoplamento e a dificuldade de testes unitários isolados.【F:src/services/instagramService.js†L8-L158】
- Existe duplicidade entre rastreamento de erros no bootstrap e o `ErrorTracker` dedicado, além de múltiplas formas de reportar eventos analíticos. Essa redundância aumenta a chance de divergência na coleta de dados.【F:src/main.jsx†L73-L173】【F:scripts/error-tracker.js†L6-L142】【F:src/services/analytics-service.js†L8-L138】

# Recomendações Prioritárias

1. **Modularizar o roteamento por domínio**: mover o mapeamento de rotas para módulos temáticos (ex.: `routes/public.ts`, `routes/payments.ts`) e criar um registrador que componha os arrays dinamicamente. Isso facilitará split por layout, permitirá aplicar middlewares de rota e abrirá espaço para lazy providers específicos de cada área.【F:src/App.jsx†L7-L128】
2. **Separar inicializadores em camadas**: extrair a configuração de observabilidade (analytics, web vitals, service worker) para um módulo `src/bootstrap/observability.ts` e deixar `main.jsx` responsável apenas por montar o React tree. Injetar singletons via contexto em vez de expor no `window` reduz acoplamento global.【F:src/main.jsx†L73-L185】
3. **Estruturar serviços por domínio**: reorganizar `src/services` em subdiretórios (`analytics`, `instagram`, `googleBusiness`) com facades claros, interfaces e adapters. Introduzir interfaces para acesso a `window` e dependências externas, permitindo testar lógica de retry sem ambiente browser.【F:src/services/analytics-service.js†L8-L138】【F:src/services/instagramService.js†L8-L158】

# Próximos Passos Estratégicos

- **Criar camada de configuração** centralizada que carregue variáveis de ambiente e padrões, expondo-as via hook (`useConfig`) para remover hardcodes como IDs de analytics em `main.jsx`.【F:src/main.jsx†L73-L185】
- **Adicionar inicialização progressiva**: carregar widgets opcionais (CTA, acessibilidade, toasts) via portal controlado por feature flags, permitindo remover componentes globais do fluxo crítico e só montá-los após a renderização da rota.【F:src/App.jsx†L59-L124】
- **Implementar testes de contrato para serviços externos** com Vitest, usando mocks do fetch e WebSocket, garantindo que mudanças em APIs do Instagram ou Google não quebrem integrações sem aviso.【F:src/services/instagramService.js†L8-L158】【F:src/services/analytics-service.js†L8-L138】
- **Adotar padrão de módulos verticalizados** (ex.: `src/modules/blog`, `src/modules/payments`) agrupando componentes, hooks, serviços e testes de cada domínio para reduzir espalhamento e facilitar deploys independentes no futuro.【F:src/App.jsx†L7-L128】【F:src/services/analytics-service.js†L8-L138】

# Resultado Esperado

Com essas mudanças a aplicação passa a ter pontos de extensão claros, inicialização resiliente e camadas de serviço com contratos explícitos, reduzindo o risco de regressões em integrações críticas e simplificando a evolução de novos fluxos comerciais.
