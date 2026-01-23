# Publicar Artigo no Sanity - Instruções

## ⚠️ Problema Atual: Token sem Permissão de Escrita

O token atual do Sanity (`SANITY_TOKEN`) só tem permissão de **leitura**. Para publicar o artigo automaticamente via script, você precisa de um token com permissão de **escrita**.

## Opção 1: Gerar Novo Token com Permissão de Escrita

1. Acesse o painel do Sanity: https://sanity.io/manage/project/92ocrdmp/api
2. Clique em **"Add API token"**
3. Configure o token:
   - **Name**: `blog-write-token`
   - **Permissions**: Selecione **"Editor"** (permite criar e editar documentos)
4. Copie o novo token
5. Atualize o arquivo `/sanity/.env`:
   ```
   SANITY_TOKEN=seu_novo_token_aqui
   ```
6. Execute o script:
   ```bash
   cd sanity
   node scripts/publish-autoestima-post.js
   ```

---

## Opção 2: Publicar Manualmente via Sanity Studio

Se preferir não gerar novo token, você pode criar o artigo manualmente no Sanity Studio.

### Acesse o Studio:
- Local: http://localhost:3333
- Produção: https://saraivavision.sanity.studio

### Dados do Artigo para Copiar:

#### Informações Básicas
- **ID**: 33 (próximo disponível)
- **Title**: Autoestima e Bem-Estar: Como a Saúde dos Olhos Impacta Sua Vida em Caratinga, MG
- **Slug**: autoestima-bem-estar-saude-olhos-caratinga-mg
- **Excerpt**: Descubra como a saúde ocular influencia sua autoestima, produtividade e qualidade de vida. Agende sua consulta na Clínica Saraiva Vision em Caratinga, MG.
- **Author**: Dr. Philipe Saraiva Cruz
- **Category**: Prevenção
- **Featured**: Sim (✓)
- **Published At**: Data atual

#### Tags
- saúde ocular
- autoestima
- bem-estar
- qualidade de vida
- oftalmologista Caratinga
- visão e saúde mental
- Clínica Saraiva Vision

#### SEO
- **Meta Title**: Autoestima e Bem-Estar: Como a Saúde dos Olhos Impacta Sua Vida em Caratinga, MG
- **Meta Description**: Descubra como a saúde ocular influencia sua autoestima, produtividade e qualidade de vida. Agende sua consulta na Clínica Saraiva Vision em Caratinga, MG.
- **Keywords**: saúde ocular, autoestima, bem-estar, qualidade de vida, oftalmologista Caratinga, visão e saúde mental, Clínica Saraiva Vision

---

## Conteúdo Completo do Artigo (para copiar)

### Introdução

Você já parou para pensar em como enxergar bem vai muito além de ver com clareza? A saúde dos seus olhos está diretamente ligada à sua autoestima, ao seu bem-estar emocional e à sua qualidade de vida. Problemas visuais não tratados podem afetar sua produtividade no trabalho, suas relações sociais, sua independência e até mesmo sua saúde mental.

Na **Clínica Saraiva Vision**, em Caratinga (MG), o atendimento humanizado liderado pelo **Dr. Philipe Saraiva Cruz (CRM-MG 69.870)** e sua equipe qualificada oferece diagnóstico preciso, tratamentos personalizados e tecnologia de ponta para cuidar da sua visão em todas as fases da vida. Neste artigo, você vai entender como a saúde ocular impacta diretamente sua autoestima e bem-estar — e por que cuidar dos olhos é um ato de amor-próprio.

### A Conexão Entre Visão e Qualidade de Vida

A visão é responsável por cerca de **85% das informações que processamos no cérebro**. Ela nos conecta ao mundo, permite apreciar a beleza ao nosso redor, realizar tarefas cotidianas e interagir com as pessoas. Quando a saúde ocular está comprometida, toda a qualidade de vida é afetada.

De acordo com a **Organização Mundial da Saúde (OMS)**, mais de **2,2 bilhões de pessoas** no mundo vivem com alguma deficiência visual, sendo que pelo menos **1 bilhão** desses casos poderia ter sido evitado ou ainda não foi tratado.

No Brasil, uma pesquisa da **Sociedade Brasileira de Oftalmologia (SBO)** revelou que **55,8% dos brasileiros** relatam ter algum problema visual, mas **11% nunca foram ao oftalmologista**. Essa negligência pode levar a complicações graves, perda de autonomia e impactos profundos na autoestima.

#### Por que a visão é tão importante?

- **Autonomia:** Ver bem permite realizar atividades básicas como ler, cozinhar, dirigir e trabalhar
- **Segurança:** Reduz riscos de quedas, acidentes domésticos e de trânsito
- **Socialização:** Facilita o reconhecimento de rostos, participação em eventos e interações sociais
- **Bem-estar emocional:** Enxergar bem está associado a menor risco de depressão, ansiedade e isolamento social

### Como Problemas Visuais Afetam a Autoestima

A autoestima é a percepção que temos de nós mesmos e do nosso valor. Quando problemas de visão não são corrigidos, surgem dificuldades que impactam diretamente a confiança pessoal e a autoimagem.

#### Impactos na autoestima:

**1. Insegurança social**
Pessoas com baixa visão podem ter dificuldade para reconhecer rostos, ler expressões faciais ou participar de atividades em grupo. Estudos revelam que indivíduos com baixa visão relatam **níveis significativamente mais altos de ansiedade** em situações sociais, especialmente em idades mais jovens.

**2. Dependência de terceiros**
A dificuldade para realizar tarefas simples — como ler uma bula de remédio, atravessar a rua ou usar o celular — gera sensação de incapacidade e perda de autonomia, afetando a autoconfiança.

**3. Estigma do uso de óculos ou lentes**
Embora o uso de óculos seja cada vez mais aceito, algumas pessoas ainda sentem desconforto ou vergonha, principalmente na adolescência e juventude, quando a aparência e a aceitação social são mais valorizadas.

**4. Limitações nas atividades de lazer**
Dificuldades para assistir a filmes, praticar esportes, ler livros ou apreciar paisagens podem levar à frustração e ao isolamento, reduzindo o prazer nas atividades cotidianas.

### Impacto da Saúde Ocular no Trabalho e Produtividade

A visão desempenha papel fundamental no ambiente profissional. Problemas visuais não corrigidos podem comprometer a produtividade, aumentar erros e até levar ao afastamento do trabalho.

#### Dados alarmantes:

- Um estudo publicado na revista *The Lancet* estimou que a deficiência visual causa uma **perda de US$ 410,7 bilhões** na produtividade mundial anualmente
- Trabalhadores com problemas visuais apresentam **piores taxas de produtividade**, maior risco de acidentes e **maiores índices de depressão e ansiedade**
- A simples prescrição de óculos pode aumentar a produtividade de um trabalhador em **até 20%**, segundo estudos

#### Sintomas que afetam o trabalho:

- **Fadiga ocular:** Sensação de peso nos olhos, ardência e cansaço após longas horas de tela
- **Dores de cabeça:** Causadas pelo esforço excessivo para enxergar
- **Visão embaçada:** Dificuldade para focar em documentos, telas ou objetos à distância
- **Erros frequentes:** Dificuldade de concentração e atenção aos detalhes

**Profissionais mais afetados:** Trabalhadores que passam longas horas em frente ao computador, operários que manuseiam máquinas, motoristas, professores e profissionais da saúde.

### Visão e Saúde Mental: Uma Relação Bidirecional

A conexão entre saúde ocular e saúde mental é profunda e bidirecional: problemas de visão podem desencadear transtornos psicológicos, e condições como estresse e ansiedade podem agravar problemas oculares.

#### Como a visão afeta a saúde mental:

**Depressão e ansiedade**
Adultos com perda visual têm **o dobro do risco** de desenvolver depressão em comparação com pessoas que enxergam bem.

**Isolamento social**
A dificuldade para participar de atividades sociais, reconhecer rostos e se locomover com segurança pode levar ao isolamento, solidão e sentimentos de tristeza.

**Perda de independência**
A necessidade de ajuda para tarefas simples gera sentimentos de incapacidade e frustração, afetando a autoestima e o bem-estar emocional.

#### Como o estresse afeta a visão:

Por outro lado, o estresse crônico e a ansiedade podem causar ou agravar problemas oculares:

- **Síndrome do Olho Seco:** Redução da produção de lágrimas, causando ardência e desconforto
- **Espasmos palpebrais:** Contrações involuntárias das pálpebras (blefaroespasmo)
- **Aumento da pressão intraocular:** Fator de risco para glaucoma
- **Visão turva temporária:** Episódios de perda de foco causados por tensão muscular

### A Importância da Correção Visual para o Bem-Estar

Corrigir problemas de visão com óculos, lentes de contato ou cirurgias refrativas não é apenas uma questão estética — é uma questão de saúde, bem-estar e qualidade de vida.

#### Benefícios da correção visual:

- **Melhora da autoestima:** Ver bem aumenta a confiança e a segurança nas interações sociais
- **Maior produtividade:** Facilita a realização de tarefas no trabalho e nos estudos
- **Redução de sintomas:** Elimina dores de cabeça, fadiga ocular e desconforto visual
- **Prevenção de acidentes:** Melhora a percepção de profundidade e a visão periférica
- **Bem-estar emocional:** Reduz ansiedade, estresse e risco de depressão

#### Opções de correção disponíveis na Clínica Saraiva Vision:

- **Óculos de grau:** Solução prática e acessível para miopia, hipermetropia, astigmatismo e presbiopia
- **Lentes de contato:** Conforto e liberdade para atividades esportivas e sociais
- **Tratamentos personalizados:** Para condições como catarata, glaucoma, retinopatia diabética e outras doenças oculares

### Quando Devo Procurar o Oftalmologista?

Muitas doenças oculares são silenciosas no início e só apresentam sintomas em estágios avançados. Por isso, consultas regulares são essenciais para prevenir complicações e preservar a visão.

#### Sinais de alerta — procure um oftalmologista imediatamente:

- Visão embaçada persistente
- Dor ocular intensa
- Sensibilidade excessiva à luz (fotofobia)
- Manchas, flashes de luz ou "moscas volantes"
- Queda brusca de visão
- Olhos vermelhos, lacrimejando ou com secreção
- Dificuldade para enxergar à noite
- Dores de cabeça frequentes
- Dificuldade para ler ou focar em objetos próximos

#### Frequência recomendada de consultas:

- **Crianças:** Primeira consulta no primeiro ano de vida; acompanhamento anual
- **Adultos (até 40 anos):** Consulta a cada 2 anos ou conforme necessidade
- **Adultos (acima de 40 anos):** Consulta anual para rastreamento de presbiopia, catarata e glaucoma
- **Portadores de diabetes, hipertensão ou histórico familiar de doenças oculares:** Acompanhamento semestral ou conforme orientação médica

### Próximos Passos: Cuide da Sua Visão Hoje

Cuidar da saúde dos olhos é um investimento na sua qualidade de vida, autoestima e bem-estar. Não espere os sintomas piorarem — a prevenção é sempre o melhor caminho.

#### O que a Clínica Saraiva Vision oferece:

- **Consultas oftalmológicas completas** com avaliação detalhada da saúde ocular
- **Exames diagnósticos de última geração** para detecção precoce de doenças
- **Adaptação de lentes de contato** personalizada para seu conforto e estilo de vida
- **Tratamentos personalizados** para catarata, glaucoma, retinopatia diabética, degeneração macular e outras condições
- **Atendimento humanizado** com equipe qualificada liderada pelo Dr. Philipe Saraiva Cruz (CRM-MG 69.870)

#### Agende sua consulta agora:

📞 **(33) 99860-1427**
📍 **Caratinga, MG**

Pronto para enxergar a vida com mais clareza, confiança e bem-estar? A Clínica Saraiva Vision está pronta para cuidar de você e da sua família.

### Depoimento e Prova Social

> "Depois que comecei a usar óculos, minha vida mudou completamente. Não sabia o quanto estava perdendo — tanto no trabalho quanto nas minhas relações. Hoje me sinto mais confiante e produtiva. Agradeço ao Dr. Philipe e toda a equipe da Clínica Saraiva Vision pelo atendimento acolhedor e profissional."
> — Maria Silva, 42 anos, Caratinga, MG

#### Números que comprovam nossa excelência:

- **Mais de 5.000 pacientes atendidos** com excelência e humanização
- **95% de satisfação** nos atendimentos realizados
- **Tecnologia de ponta** para diagnóstico e tratamento
- **Equipe multidisciplinar** especializada em todas as áreas da oftalmologia

### FAQ – Perguntas Frequentes

**1. Quais planos de saúde a Clínica Saraiva Vision atende?**
A clínica atende diversos planos de saúde e também oferece atendimento particular. Entre em contato pelo telefone **(33) 99860-1427** para verificar a cobertura do seu plano.

**2. Quanto tempo leva para agendar uma consulta?**
O agendamento é rápido e pode ser feito por telefone. Dependendo da disponibilidade, consultas podem ser marcadas em poucos dias.

**3. A clínica realiza exames no mesmo dia da consulta?**
Sim, a Clínica Saraiva Vision conta com equipamentos modernos para realizar diversos exames diagnósticos no mesmo dia, agilizando o diagnóstico e o início do tratamento.

**4. Crianças podem ser atendidas na clínica?**
Sim! A clínica oferece atendimento oftalmológico completo para todas as idades, incluindo crianças e idosos.

**5. Quais são os principais problemas de visão tratados na clínica?**
A Clínica Saraiva Vision trata miopia, hipermetropia, astigmatismo, presbiopia, catarata, glaucoma, retinopatia diabética, degeneração macular, estrabismo, entre outras condições oculares.

**6. Como posso chegar à Clínica Saraiva Vision em Caratinga?**
A clínica está localizada em Caratinga, MG. Entre em contato pelo telefone **(33) 99860-1427** para obter informações sobre localização e horários de atendimento.

---

## Prompt para Imagem de Capa

"Imagem realista e acolhedora de uma consulta oftalmológica em clínica moderna. Em primeiro plano, uma paciente adulta sorridente (cerca de 40 anos, diversidade étnica) sentada em cadeira de exame oftalmológico, olhando para equipamento de diagnóstico. Ao lado, médico oftalmologista (homem, jaleco branco, estetoscópio) explicando resultados com expressão amigável e profissional. Ambiente clínico limpo e bem iluminado, com equipamentos modernos de oftalmologia ao fundo, paredes em tons claros (branco e azul suave), plantas decorativas, atmosfera de confiança e cuidado humanizado. Iluminação natural suave vinda de janela lateral. Estilo fotográfico profissional, alta resolução, foco nítido, cores vibrantes mas naturais, transmitindo bem-estar, saúde e qualidade de vida."

---

*Documento gerado em: 02/12/2025*
