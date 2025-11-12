export const wikiCategories = [
  {
    id: 'tipos-de-lentes',
    name: 'Tipos de Lentes',
    description: 'Comparativos de materiais, desenhos e aplicações clínicas.'
  },
  {
    id: 'saude-ocular',
    name: 'Saúde Ocular',
    description: 'Monitoramento, sinais de alerta e protocolos de segurança.'
  },
  {
    id: 'cuidados-higiene',
    name: 'Cuidados e Higiene',
    description: 'Passo a passo de limpeza, descarte e manutenção.'
  },
  {
    id: 'adaptacao-prescricao',
    name: 'Adaptação e Prescrição',
    description: 'Fluxos clínicos, exames e estratégias de fitting.'
  },
  {
    id: 'complicacoes-solucoes',
    name: 'Complicações e Soluções',
    description: 'Gestão de riscos, troubleshooting e condutas urgentes.'
  },
  {
    id: 'estetica-cores',
    name: 'Estética e Cores',
    description: 'Lentes cosméticas, critérios de segurança e tendências.'
  },
  {
    id: 'esporte-desempenho',
    name: 'Esporte e Desempenho',
    description: 'Protocolos para atletas, clima e atividades ao ar livre.'
  },
  {
    id: 'trabalho-digital',
    name: 'Trabalho e Digital',
    description: 'Ergonomia visual para telas e ambientes corporativos.'
  },
  {
    id: 'custos-sustentabilidade',
    name: 'Custos e Sustentabilidade',
    description: 'Planejamento financeiro, descarte e reciclagem.'
  },
  {
    id: 'acessibilidade-inclusao',
    name: 'Acessibilidade e Inclusão',
    description: 'Recursos multiformato, linguagem simples e suporte ampliado.'
  }
];

export const wikiTags = [
  { id: 'miopia', label: 'Miopia', type: 'condicao' },
  { id: 'hipermetropia', label: 'Hipermetropia', type: 'condicao' },
  { id: 'astigmatismo', label: 'Astigmatismo', type: 'condicao' },
  { id: 'presbiopia', label: 'Presbiopia', type: 'condicao' },
  { id: 'olho-seco', label: 'Olho Seco', type: 'condicao' },
  { id: 'ceratocone', label: 'Ceratocone', type: 'condicao' },
  { id: 'uv', label: 'Proteção UV', type: 'tecnologia' },
  { id: 'multifocal', label: 'Multifocal', type: 'desenho' },
  { id: 'torica', label: 'Tórica', type: 'desenho' },
  { id: 'diaria', label: 'Descarte diário', type: 'rotina' },
  { id: 'quinzenal', label: 'Descarte quinzenal', type: 'rotina' },
  { id: 'mensal', label: 'Descarte mensal', type: 'rotina' },
  { id: 'rgp', label: 'RGP', type: 'material' },
  { id: 'escleral', label: 'Escleral', type: 'material' },
  { id: 'silicone-hidrogel', label: 'Silicone-Hidrogel', type: 'material' },
  { id: 'colorida', label: 'Colorida', type: 'material' },
  { id: 'higiene', label: 'Higiene', type: 'rotina' },
  { id: 'digital', label: 'Ambiente digital', type: 'estilo' },
  { id: 'custo', label: 'Custos e planejamento', type: 'financeiro' },
  { id: 'acessibilidade', label: 'Acessibilidade', type: 'inclusao' },
  { id: 'alergias', label: 'Alergias', type: 'seguranca' },
  { id: 'sensibilidade', label: 'Sensibilidade', type: 'seguranca' },
  { id: 'seguranca', label: 'Segurança ocular', type: 'seguranca' },
  { id: 'iniciantes', label: 'Iniciantes', type: 'nivel' },
  { id: 'avancado', label: 'Avançado', type: 'nivel' }
];

export const wikiFilters = {
  lensTypes: ['Gelatinosa', 'RGP', 'Híbrida', 'Escleral', 'Colorida', 'Terapêutica'],
  conditions: ['Miopia', 'Hipermetropia', 'Astigmatismo', 'Presbiopia', 'Olho seco', 'Ceratocone'],
  brands: ['Acuvue', 'CooperVision', 'Alcon', 'Bausch + Lomb', 'Menicon', 'Johnson & Johnson'],
  routines: ['Diária', 'Quinzenal', 'Mensal', 'Uso prolongado', 'Sob demanda'],
  experienceLevels: ['Iniciantes', 'Intermediário', 'Avançado']
};

export const wikiTopics = [
  {
    id: 'primeiros-passos',
    title: 'Primeiros passos com lentes de contato',
    categoryId: 'tipos-de-lentes',
    level: 'Iniciantes',
    lensTypes: ['Gelatinosa'],
    conditions: ['Miopia', 'Hipermetropia'],
    brands: ['Acuvue', 'CooperVision', 'Alcon'],
    routines: ['Diária', 'Mensal'],
    tags: ['iniciantes', 'diaria', 'mensal'],
    summary: 'Definições, benefícios, limitações e exames essenciais antes da primeira adaptação.',
    contentSections: [
      {
        kind: 'paragraph',
        title: 'O que são e quando considerar',
        content:
          'Lentes de contato são dispositivos médicos que repousam sobre o filme lacrimal para corrigir ametropias ou oferecer benefícios terapêuticos e estéticos. Elas complementam óculos ao ampliar campo visual, favorecer prática esportiva e permitir correção diferenciada. Limitações incluem necessidade de higiene rigorosa, risco aumentado de infecções em caso de mau uso e investimento recorrente em descartáveis e soluções.'
      },
      {
        kind: 'list',
        title: 'Avaliação clínica obrigatória',
        items: [
          'Consulta com oftalmologista ou contatólogo, incluindo anamnese, refração e avaliação biomicroscópica.',
          'Ceratometria e topografia corneana para mapear curvaturas e assimetrias que orientam curvatura base e diâmetro.',
          'Teste diagnóstico com lentes de prova para observar centragem, movimentação e conforto inicial.',
          'Orientação documentada sobre higiene, rotina de descarte e sinais de alerta que exigem pausa imediata.'
        ]
      },
      {
        kind: 'grid',
        title: 'Período de habituação',
        items: [
          {
            heading: 'Semana 1',
            description: 'Uso progressivo de 2 para até 6 horas, com reforço na técnica de colocação e remoção em consultório ou por vídeos tutoriais.'
          },
          {
            heading: 'Semana 2',
            description: 'Ampliação gradual até 10-12 horas quando aprovado pelo especialista, sempre respeitando intervalo mínimo de 12h sem lentes a cada 24h.'
          },
          {
            heading: 'Semana 3',
            description: 'Avaliação de conforto, acuidade e integridade corneana; ajustes de curva base ou material conforme necessidade.'
          }
        ]
      },
      {
        kind: 'list',
        title: 'Mitos e verdades',
        items: [
          'Dormir com lentes gelatinosas comuns aumenta em até 6 vezes o risco de ceratite microbiana mesmo quando o produto promete uso prolongado sem supervisão adequada.',
          'Banho, piscina e mar expõem as lentes a amebas e bactérias resistentes; é obrigatório removê-las antes do contato com água.',
          'Compartilhar lentes ou soluções entre amigos é proibido, pois favorece contaminação cruzada e transmissões virais.',
          'Soluções têm validade após abertas (geralmente 90 dias); usar produtos vencidos compromete a eficácia da desinfecção.'
        ]
      }
    ],
    relatedIds: ['higiene-manutencao', 'adaptacao-clinica']
  },
  {
    id: 'tipos-materiais',
    title: 'Tipos de lentes e materiais modernos',
    categoryId: 'tipos-de-lentes',
    level: 'Intermediário',
    lensTypes: ['Gelatinosa', 'RGP', 'Híbrida', 'Escleral', 'Colorida', 'Terapêutica'],
    conditions: ['Miopia', 'Astigmatismo', 'Olho seco', 'Ceratocone'],
    brands: ['Acuvue', 'CooperVision', 'Alcon', 'Bausch + Lomb', 'Menicon'],
    routines: ['Diária', 'Quinzenal', 'Mensal', 'Uso prolongado'],
    tags: ['silicone-hidrogel', 'rgp', 'escleral', 'torica', 'multifocal'],
    summary: 'Guia de materiais, transmissibilidade ao oxigênio (Dk/t), geometrias asféricas, tóricas e multifocais.',
    contentSections: [
      {
        kind: 'table',
        title: 'Comparativo de materiais',
        headers: ['Categoria', 'Dk/t médio', 'Características-chave', 'Indicações clínicas'],
        rows: [
          ['Hidrogel', '20-30', 'Alto teor de água, conforto imediato, menor oxigenação', 'Uso diário ocasional, pacientes com lacrimejamento abundante'],
          ['Silicone-hidrogel', '80-180', 'Maior permeabilidade, bordas finas, versões com filtro UV', 'Uso prolongado sob supervisão, ambientes secos, usuários digitais'],
          ['RGP', '100-150', 'Estabilidade óptica, alta durabilidade, superfície resistente a depósitos', 'Astigmatismo elevado, miopias altas, pós-cirurgias refrativas'],
          ['Híbrida', 'Centro RGP, periferia gel', 'Compromisso entre nitidez e conforto, estabilidade rotacional', 'Astigmatismo irregular, intolerância a RGP puras'],
          ['Escleral', '>120', 'Reservatório de lágrima, apoio extraescleral, customização total', 'Ceratocone avançado, olho seco severo, pós-transplante'],
          ['Terapêutica', 'Variável', 'Bandagem corneana, liberação de fármacos ou amparo pós-operatório', 'Erosões, pós-crosslinking, úlceras epiteliais sob supervisão contínua']
        ]
      },
      {
        kind: 'paragraph',
        title: 'Geometrias e desenhos',
        content:
          'Desenhos asféricos reduzem aberrações esféricas e melhoram contraste em altas ametropias. Lentes tóricas utilizam mecanismos de estabilização como prism ballast, truncamento inferior ou thin zones; a avaliação precisa do eixo e do cilindro exige sobre-refração e marcação externa. Modelos multifocais combinam zonas concêntricas ou tecnologia de imagem simultânea para equilibrar visão de perto e longe, podendo ser associados a estratégias de monovisão modificada.'
      },
      {
        kind: 'list',
        title: 'Tecnologias recentes',
        items: [
          'Superfícies com tratamento plasma ou HydraGlyde para retenção de umidade em silicone-hidrogéis.',
          'Materiais com gradiente de água (ex.: Alcon Water Gradient) que minimizam atrito palpebral.',
          'Filtros fotocromáticos (Acuvue Oasys with Transitions) que modulam a entrada de luz azul e UV.',
          'Microcanalizações em lentes esclerais para oxigenação adicional e menor estagnação lacrimal.'
        ]
      }
    ],
    relatedIds: ['correcao-visual', 'seguranca-riscos']
  },
  {
    id: 'correcao-visual',
    title: 'Desenhos ópticos e correção visual',
    categoryId: 'adaptacao-prescricao',
    level: 'Intermediário',
    lensTypes: ['Gelatinosa', 'RGP', 'Híbrida', 'Escleral'],
    conditions: ['Miopia', 'Hipermetropia', 'Astigmatismo', 'Presbiopia'],
    brands: ['CooperVision', 'Bausch + Lomb', 'Alcon'],
    routines: ['Diária', 'Mensal'],
    tags: ['torica', 'multifocal', 'astigmatismo', 'presbiopia'],
    summary: 'Algoritmos de adaptação para lentes esféricas, tóricas e multifocais, incluindo monovisão e ajustes finos.',
    contentSections: [
      {
        kind: 'paragraph',
        title: 'Esféricas e miopia/hipermetropia',
        content:
          'Lentes esféricas corrigem miopia e hipermetropia, devendo respeitar sobras (movement) entre 0,2 e 0,4 mm e cobertura completa da córnea. Ajustes de curvatura base são orientados pela diferença entre ceratometria média e curvas disponíveis do fabricante.'
      },
      {
        kind: 'list',
        title: 'Protocolos para lentes tóricas',
        items: [
          'Escolha inicial baseada em cilindro externo ≥ -0,75 D e leitura topográfica para identificar assimetrias.',
          'Verificar estabilização após 10-15 minutos; rotação até 10° pode ser compensada ajustando o eixo na prescrição final.',
          'Preferir materiais de alto Dk/t em astigmatismos altos para evitar hipoxia em meridianos comprimidos.',
          'Repetir sobre-refração em iluminação natural e com alvo próximo para detectar flutuações.'
        ]
      },
      {
        kind: 'list',
        title: 'Multifocais e presbiopia',
        items: [
          'Iniciar com dominância ocular determinada por teste de Miles ou blur test.',
          'Aplicar estratégia centrada para perto em olho dominante quando tarefas de leitura são prioridade.',
          'Utilizar monovisão modificada em profissionais com alta demanda em distância, garantindo sobre-refração de contraste.',
          'Programar revisão em 1 semana e 1 mês para ajustes finos e reforço das técnicas de iluminação em leitura.'
        ]
      }
    ],
    relatedIds: ['faq', 'glossario']
  },
  {
    id: 'higiene-manutencao',
    title: 'Higiene, manutenção e logística',
    categoryId: 'cuidados-higiene',
    level: 'Iniciantes',
    lensTypes: ['Gelatinosa', 'RGP', 'Híbrida', 'Escleral'],
    conditions: ['Olho seco', 'Alergias'],
    brands: ['Bausch + Lomb', 'Alcon', 'Menicon'],
    routines: ['Diária', 'Quinzenal', 'Mensal'],
    tags: ['higiene', 'alergias', 'sensibilidade'],
    summary: 'Rotinas de limpeza com fricção, desinfecção química, cuidados com estojo e cronogramas de descarte.',
    contentSections: [
      {
        kind: 'list',
        title: 'Passo a passo diário',
        items: [
          'Lavar as mãos com sabonete neutro e secar com papel sem fiapos antes de manipular as lentes.',
          'Friccionar cada lente com solução multiuso por 10-15 segundos em movimentos unidirecionais para remover biofilme.',
          'Enxaguar com solução fresca e armazenar em estojo limpo, preenchido até a borda.',
          'Trocar a solução do estojo diariamente e deixá-lo secando aberto sobre papel limpo, longe de vapor do banheiro.'
        ]
      },
      {
        kind: 'table',
        title: 'Sistemas de desinfecção',
        headers: ['Sistema', 'Tempo mínimo', 'Indicações', 'Observações'],
        rows: [
          ['Multiuso (MPS)', '4-6 h', 'Usuários iniciantes, rotina prática', 'Necessita fricção manual e substituição de solução diária'],
          ['Peróxido de hidrogênio 3%', '6 h', 'Intolerância a conservantes, depósitos recorrentes', 'Obrigatório uso de catalisador; nunca reutilizar sem neutralizar'],
          ['Soluções enzimáticas', 'Semanal', 'RGP e híbridas com depósitos proteicos', 'Complemento ao MPS; enxágue obrigatório'],
          ['Soro fisiológico estéril', '-', 'Enxágue final em lentes RGP e esclerais', 'Nunca substituir desinfecção']
        ]
      },
      {
        kind: 'callout',
        tone: 'warning',
        content:
          'Jamais utilize água da torneira, saliva ou soluções caseiras para limpar ou armazenar lentes. A exposição à Acanthamoeba e outras amebas de vida livre representa risco severo de perda visual.'
      },
      {
        kind: 'list',
        title: 'Calendários e logística',
        items: [
          'Respeitar descarte diário, quinzenal ou mensal mesmo com aparência limpa; materiais degradados aumentam hipoxia e depósitos.',
          'Substituir estojos a cada três meses ou após episódios de contaminação.',
          'Organizar lembretes digitais para reposição de soluções e agendamentos de revisão.',
          'Viajar com kit de backup: estojo extra, solução de 60 ml aprovada para voo e óculos com grau atualizado.'
        ]
      }
    ],
    relatedIds: ['checklist-seguranca', 'faq']
  },
  {
    id: 'conforto-ergonomia',
    title: 'Conforto e ergonomia visual',
    categoryId: 'trabalho-digital',
    level: 'Intermediário',
    lensTypes: ['Silicone-Hidrogel', 'RGP', 'Escleral'],
    conditions: ['Olho seco'],
    brands: ['Alcon', 'Bausch + Lomb'],
    routines: ['Diária', 'Uso prolongado'],
    tags: ['olho-seco', 'digital'],
    summary: 'Estratégias para ambientes digitais, baixa umidade e atividades esportivas.',
    contentSections: [
      {
        kind: 'paragraph',
        title: 'Ergonomia digital',
        content:
          'Adote a regra 20-20-20 (a cada 20 minutos, olhar 20 pés à frente por 20 segundos) associada a lembretes de piscar consciente. Utilize lubrificantes sem conservantes compatíveis com lentes, especialmente em jornadas acima de 8 horas frente a telas.'
      },
      {
        kind: 'list',
        title: 'Clima e atividades',
        items: [
          'Em ambientes com ar-condicionado ou baixa umidade, priorize materiais de alto Dk/t e lentes com tecnologias de retenção hídrica.',
          'Para esportes ao ar livre, combine proteção UV das lentes com óculos envolventes e boné para bloquear vento e partículas.',
          'Em treinos intensos, considere descarte diário para evitar acúmulo de suor e poeira.'
        ]
      },
      {
        kind: 'list',
        title: 'Olho seco e sensibilidade',
        items: [
          'Solicitar avaliação do filme lacrimal (BUT, osmolaridade) antes de ajustar material.',
          'Preferir bordas afinadas e desenhos com zonas de transição suave em pacientes com margens palpebrais sensíveis.',
          'Esclerais mini proporcionam reservatório estável para olho seco severo; monitorar pressão intraocular e clearance corneano.'
        ]
      }
    ],
    relatedIds: ['tipos-materiais', 'seguranca-riscos']
  },
  {
    id: 'seguranca-riscos',
    title: 'Segurança e gestão de riscos',
    categoryId: 'complicacoes-solucoes',
    level: 'Intermediário',
    lensTypes: ['Gelatinosa', 'RGP', 'Escleral'],
    conditions: ['Olho seco', 'Ceratocone', 'Alergias'],
    brands: ['Acuvue', 'Alcon', 'Bausch + Lomb'],
    routines: ['Diária', 'Uso prolongado'],
    tags: ['alergias', 'sensibilidade', 'seguranca'],
    summary: 'Reconhecimento precoce de complicações, condutas imediatas e educação do paciente.',
    contentSections: [
      {
        kind: 'list',
        title: 'Sinais de alerta',
        items: [
          'Dor aguda ou sensação de corpo estranho persistente.',
          'Vermelhidão difusa ou localizada, especialmente com halo periquerático.',
          'Fotofobia intensa, lacrimejamento ou visão turva repentina.',
          'Secreção purulenta, edema palpebral ou linhas vasculares na córnea.'
        ]
      },
      {
        kind: 'list',
        title: 'Complicações frequentes',
        items: [
          'Hipoxia corneana levando a neovascularização periférica; revisar tempo de uso e Dk/t.',
          'Infiltrados estéreis associados a depósitos; otimizar limpeza e avaliar alergia a conservantes.',
          'Ceratite microbiana: interrupção imediata, cultivo e antibioticoterapia de amplo espectro sob supervisão médica.',
          'Depósitos lipídicos em silicone-hidrogéis; considerar surfactantes específicos e descarte mais frequente.'
        ]
      },
      {
        kind: 'paragraph',
        title: 'Sono e uso prolongado',
        content:
          'Dormir com lentes aumenta significativamente o risco de complicações infecciosas; somente lentes aprovadas para uso contínuo, sob acompanhamento trimestral, devem ser consideradas. Recomenda-se pausa semanal mesmo em regime estendido.'
      },
      {
        kind: 'paragraph',
        title: 'Farmacovigilância',
        content:
          'Evite colírios vasoconstritores que mascaram hiperemia e reduzem oxigenação. Prefira lágrimas artificiais preservative-free e registre qualquer medicação ocular no prontuário para análise de interações.'
      }
    ],
    relatedIds: ['higiene-manutencao', 'checklist-seguranca']
  },
  {
    id: 'adaptacao-clinica',
    title: 'Adaptação clínica e acompanhamento',
    categoryId: 'adaptacao-prescricao',
    level: 'Avançado',
    lensTypes: ['Gelatinosa', 'RGP', 'Híbrida', 'Escleral'],
    conditions: ['Ceratocone', 'Olho seco', 'Astigmatismo'],
    brands: ['Menicon', 'Bausch + Lomb'],
    routines: ['Mensal', 'Uso prolongado'],
    tags: ['avancado', 'ceratocone', 'rgp'],
    summary: 'Protocolo clínico completo: exames pré-adaptação, fitting, follow-up e documentação.',
    contentSections: [
      {
        kind: 'list',
        title: 'Exames pré-adaptação',
        items: [
          'Refração objetiva e subjetiva com e sem cicloplegia quando indicado.',
          'Ceratometria computadorizada e topografia/tomografia para mapear toricidade e elevação.',
          'Avaliação do filme lacrimal (BUT não invasivo, meibografia) e análise palpebral.',
          'Biomicroscopia com fluoresceína para descartar microlesões ou degenerações.'
        ]
      },
      {
        kind: 'list',
        title: 'Fitting sistematizado',
        items: [
          'Observar centragem, movimentação e cobertura; realizar push-up test em lentes gelatinosas e avaliação do reservoir em esclerais.',
          'Registrar curva base, diâmetro, material, lote e tempo de repouso em prontuário eletrônico ou ficha padronizada.',
          'Executar sobre-refração com lentes de prova estabilizadas para ajustar potência final.',
          'Educar paciente com demonstração supervisionada de colocação e remoção.'
        ]
      },
      {
        kind: 'grid',
        title: 'Cronograma de follow-up',
        items: [
          {
            heading: '24-72 horas',
            description: 'Revisão inicial para avaliar adaptação, conforto e integridade epitelial; reforçar higiene.'
          },
          {
            heading: '7-14 dias',
            description: 'Ajustar parâmetros conforme necessidade, avaliar depósitos e compliance.'
          },
          {
            heading: '30 dias',
            description: 'Revisão completa com topografia comparativa, inclusão em programa de lembretes automatizados.'
          }
        ]
      }
    ],
    relatedIds: ['tipos-materiais', 'plano-editorial']
  },
  {
    id: 'estilo-vida',
    title: 'Estilo de vida, estética e custo',
    categoryId: 'estetica-cores',
    level: 'Intermediário',
    lensTypes: ['Colorida', 'Gelatinosa'],
    conditions: ['Miopia', 'Astigmatismo'],
    brands: ['Johnson & Johnson', 'Alcon'],
    routines: ['Diária', 'Mensal'],
    tags: ['colorida', 'custo'],
    summary: 'Comparação financeira entre descartáveis, critérios para lentes coloridas seguras e recomendações sustentáveis.',
    contentSections: [
      {
        kind: 'table',
        title: 'Comparativo de custo anual',
        headers: ['Modalidade', 'Uso médio', 'Custo de lentes', 'Soluções/acessórios', 'Total estimado'],
        rows: [
          ['Lentes diárias premium', '5 dias/semana', 'R$ 3.600', 'N/A', 'R$ 3.600'],
          ['Lentes mensais silicone-hidrogel', 'Tempo integral', 'R$ 1.200', 'R$ 800', 'R$ 2.000'],
          ['RGP personalizada', 'Tempo integral', 'R$ 2.500', 'R$ 400', 'R$ 2.900'],
          ['Escleral personalizada', 'Tempo integral', 'R$ 4.500', 'R$ 600', 'R$ 5.100']
        ]
      },
      {
        kind: 'list',
        title: 'Lentes coloridas seguras',
        items: [
          'Verificar registro na Anvisa e certificações internacionais (FDA, CE).',
          'Priorizar materiais com permeabilidade adequada e bordas polidas para reduzir atrito.',
          'Evitar sobreposição de maquiagem pesada diretamente sobre a lente; aplicar cosméticos após inserção.'
        ]
      },
      {
        kind: 'list',
        title: 'Sustentabilidade',
        items: [
          'Descarte lentes e blisters em programas de reciclagem específicos quando disponíveis.',
          'Prefira embalagens concentradas (refis) de soluções com logística reversa.',
          'Estimule o uso de estojo reutilizável em material reciclável certificado.'
        ]
      }
    ],
    relatedIds: ['conforto-ergonomia', 'plano-editorial']
  },
  {
    id: 'acessibilidade-inclusiva',
    title: 'Acessibilidade e inclusão',
    categoryId: 'acessibilidade-inclusao',
    level: 'Iniciantes',
    lensTypes: ['Gelatinosa', 'Terapêutica'],
    conditions: ['Baixa visão', 'Olho seco'],
    brands: ['Johnson & Johnson'],
    routines: ['Sob demanda'],
    tags: ['acessibilidade'],
    summary: 'Guias em linguagem simples, versões em áudio e recursos de alto contraste para usuários diversos.',
    contentSections: [
      {
        kind: 'list',
        title: 'Recursos recomendados',
        items: [
          'Versões em áudio dos tutoriais de inserção e remoção com descrição auditiva das etapas.',
          'Infográficos com contraste elevado (WCAG 2.1 AA) e ícones descritivos.',
          'Vídeos curtos com legendas e Libras quando possível.',
          'Materiais impressos em fonte mínima de 14 pt e linguagem não técnica.'
        ]
      },
      {
        kind: 'paragraph',
        title: 'Educação contínua',
        content:
          'Ofereça sessões periódicas com equipe multiprofissional (enfermagem, pedagogia em saúde) para reforço das técnicas, além de suporte remoto por chatbot acessível e canal telefônico.'
      }
    ],
    relatedIds: ['primeiros-passos', 'higiene-manutencao']
  }
];

export const wikiFaq = [
  {
    question: 'Posso dormir com lentes de contato?',
    answer:
      'Somente se o produto for aprovado para uso estendido e com autorização explícita do oftalmologista. Mesmo assim, recomenda-se remover ao menos uma vez por semana para limpeza profunda e avaliação corneana.'
  },
  {
    question: 'Quais lentes corrigem astigmatismo alto?',
    answer:
      'Lentes RGP personalizadas, tóricas de silicone-hidrogel com alto cilindro e esclerais sob medida são opções. A escolha depende do mapa corneano e da estabilidade desejada.'
  },
  {
    question: 'Como viajar de avião usando lentes?',
    answer:
      'Leve solução em frascos de até 100 ml na bagagem de mão, use lubrificantes sem conservantes e considere descarte diário em voos longos devido à baixa umidade da cabine.'
  },
  {
    question: 'O que fazer se a lente "sumir" no olho?',
    answer:
      'Mantenha a calma, lave as mãos e massageie gentilmente a pálpebra superior em direção ao canto nasal. Se não visualizar a lente, consulte o especialista para remoção segura.'
  },
  {
    question: 'Por que sinto ardor ao colocar a lente?',
    answer:
      'O ardor pode estar relacionado a resíduos de sabonete nas mãos, solução vencida, depósitos ou sensibilidade a conservantes. Reavalie a higiene e consulte o profissional para ajustar produtos.'
  }
];

export const wikiGlossary = [
  {
    term: 'Dk/t',
    definition: 'Taxa de transmissibilidade ao oxigênio que considera permeabilidade do material e espessura central; valores altos reduzem hipoxia.'
  },
  {
    term: 'Curvatura base',
    definition: 'Raio da face interna da lente que deve se aproximar da curvatura corneana para garantir centragem e mobilidade adequadas.'
  },
  {
    term: 'Diâmetro total',
    definition: 'Tamanho horizontal da lente que influencia cobertura corneana e conforto palpebral.'
  },
  {
    term: 'Aberrações',
    definition: 'Imperfeições ópticas que reduzem contraste e nitidez; desenhos asféricos podem minimizá-las.'
  },
  {
    term: 'Edema corneano',
    definition: 'Inchaço da córnea devido à hipoxia; manifesta-se com halos e visão embaçada.'
  },
  {
    term: 'Estabilização tórica',
    definition: 'Técnicas geométricas que mantêm lentes tóricas alinhadas ao eixo do astigmatismo, como prism ballast e zonas de afinamento.'
  },
  {
    term: 'Desenho concêntrico',
    definition: 'Configuração de lentes multifocais com zonas alternadas para longe e perto, permitindo imagem simultânea.'
  }
];

export const safetyChecklist = [
  'Lave e seque as mãos antes de tocar nas lentes.',
  'Nunca reutilize solução ou complete o volume restante no estojo.',
  'Remova lentes antes de contato com água (piscina, mar, banho).',
  'Substitua estojos a cada três meses ou após infecções.',
  'Suspenda o uso diante de dor, vermelhidão ou secreção e procure avaliação imediata.',
  'Mantenha óculos reserva com grau atualizado.',
  'Agende revisões conforme orientação (inicial, 6 meses e anual).'
];

export const export const imageResources = [
  {
    title: 'Comparativo de tipos de lentes de contato',
    description: 'Visão geral dos principais tipos de lentes: gelatinosas, RGP, esclerais e multifocais para diferentes necessidades visuais.',
    url: '/Blog/capa-lentes-contato-tipos-optimized-1200w.jpeg',
    source: 'Saraiva Vision - Arquivo clínico',
    license: 'Uso educacional autorizado pela clínica',
    lastUpdated: '2025-11-12'
  },
  {
    title: 'Lentes de contato para ceratocone',
    description: 'Opções especializadas de lentes para correção de ceratocone: lentes RGP, esclerais e híbridas.',
    url: '/Blog/capa-lentes-de-contato-para-ceratocone-optimized-1200w.jpeg',
    source: 'Saraiva Vision - Departamento de Lentes Especiais',
    license: 'Material educativo clínico',
    lastUpdated: '2025-11-12'
  },
  {
    title: 'Lentes multifocais para presbiopia',
    description: 'Tecnologias modernas de correção da presbiopia com lentes de contato multifocais.',
    url: '/Blog/capa-lentes-presbiopia-optimized-1200w.jpeg',
    source: 'Saraiva Vision - Área de Adaptometria',
    license: 'Recurso educacional para pacientes',
    lastUpdated: '2025-11-12'
  },
  {
    title: 'Cuidados e higiene com lentes de contato',
    description: 'Protocolos completos de limpeza, desinfecção e manutenção para segurança e saúde ocular.',
    url: '/Blog/lentes-iniciantes-guia-2025.jpg',
    source: 'Saraiva Vision - Protocolo clínico',
    license: 'Guia educacional para usuários',
    lastUpdated: '2025-11-12'
  }
];;

export const export const editorialPlan = {
  cadence: 'Revisão clínica trimestral e auditoria editorial semestral.',
  owners: [
    {
      role: 'Responsável técnico',
      name: 'Dr. Philipe Saraiva Cruz, CRM 69.870',
      focus: 'Validação clínica, atualização de protocolos e farmacovigilância.'
    },
    {
      role: 'Editor científico',
      name: 'Dr. Philipe Saraiva Cruz, CRM 69.870',
      focus: 'Revisão bibliográfica, atualização de referências e padronização terminológica.'
    },
    {
      role: 'Designer de informação',
      name: 'Equipe Saraiva Vision',
      focus: 'Curadoria de infográficos, acessibilidade visual e atualização de imagens.'
    }
  ],
  schedule: [
    {
      milestone: 'Atualização de dados epidemiológicos e protocolos de segurança',
      due: 'Abril e Outubro',
      deliverables: 'Revisão de complicações relatadas, ajuste de checklist e alertas.'
    },
    {
      milestone: 'Revisão de tecnologias e lançamentos de lentes',
      due: 'Junho',
      deliverables: 'Inclusão de novos materiais, comparação de Dk/t e feedback de fabricantes.'
    },
    {
      milestone: 'Avaliação de acessibilidade e feedback de usuários',
      due: 'Dezembro',
      deliverables: 'Relatório de usabilidade, ajustes de linguagem simples e atualização de áudio/vídeo.'
    }
  ],
  sources: [
    'American Academy of Ophthalmology. Contact Lens Care Clinical Guidelines, 2024.',
    'British Contact Lens Association. Evidence-Based Contact Lens Management Toolkit, 2024.',
    'Johnson & Johnson Vision. Professional Fitting Guide for Silicone Hydrogel Lenses, 2025.',
    'CooperVision. Specialty Lens Portfolio Handbook, 2025.',
    'Bausch + Lomb. Safety Update on Peroxide Disinfection Systems, 2024.'
  ]
};;

export const quickLinks = [
  {
    id: 'primeiros-passos',
    label: 'Primeiros passos',
    description: 'Tudo que o iniciante precisa para começar com segurança.'
  },
  {
    id: 'higiene-manutencao',
    label: 'Cuidados diários',
    description: 'Rotinas de limpeza, descarte e logística.'
  },
  {
    id: 'seguranca-riscos',
    label: 'Soluções de problemas',
    description: 'Alertas, complicações comuns e condutas rápidas.'
  }
];

export const updateLog = [
  {
    date: '2025-05-01',
    summary: 'Inclusão de dados de Dk/t atualizados para materiais silicone-hidrogel e esclerais.'
  },
  {
    date: '2025-04-15',
    summary: 'Adição de infográfico de higiene aprovado pela American Academy of Optometry.'
  },
  {
    date: '2025-03-10',
    summary: 'Revisão das recomendações de monovisão e multifocais com base em guideline da BCLA.'
  }
];

export const crossReferences = [
  {
    fromId: 'primeiros-passos',
    toId: 'higiene-manutencao',
    description: 'Após concluir a primeira adaptação, siga para o checklist de higiene diário.'
  },
  {
    fromId: 'tipos-materiais',
    toId: 'correcao-visual',
    description: 'Compare materiais e escolha o desenho óptico adequado ao seu perfil.'
  },
  {
    fromId: 'seguranca-riscos',
    toId: 'faq',
    description: 'Consulte as perguntas frequentes para reforçar condutas de segurança.'
  }
];
