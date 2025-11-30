import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ExternalLink, Clock, AlertCircle, BookOpen, Phone, MessageSquare } from 'lucide-react';
import { clinicInfo } from '@/lib/clinicInfo';

// Dados específicos de conteúdo para cada serviço
const serviceContentData = {
  'consultas-oftalmologicas': {
    detailedContent: `
      Uma consulta oftalmológica completa é fundamental para a manutenção da saúde ocular e detecção precoce de doenças que podem comprometer sua visão. Durante o exame, realizamos uma avaliação abrangente que inclui histórico médico detalhado, testes de acuidade visual, biomicroscopia do segmento anterior, tonometria para medição da pressão intraocular e mapeamento de retina com dilatação pupilar.

      Nossa abordagem técnica segue protocolos internacionais de oftalmologia, utilizando equipamentos de última geração para garantir diagnósticos precisos. A consulta permite identificar condições como miopia, hipermetropia, astigmatismo, presbiopia, glaucoma, catarata, retinopatia diabética e degeneração macular relacionada à idade.

      O processo diagnóstico é conduzido de forma sistemática, iniciando pela anamnese detalhada, seguida pelo exame físico ocular externo e interno. Utilizamos tecnologias como auto-refrator, lâmpada de fenda, tonômetro de aplanação e oftalmoscópio indireto para uma avaliação completa e precisa.
    `,
    faqs: [
      {
        question: "Com que frequência devo fazer consultas oftalmológicas?",
        answer: "Recomendamos consultas anuais para adultos até 40 anos, semestrais após os 40 anos devido ao aumento do risco de glaucoma e presbiopia, e conforme orientação médica para portadores de doenças oculares crônicas."
      },
      {
        question: "Preciso dilatar a pupila em todas as consultas?",
        answer: "A dilatação pupilar é necessária para exame completo da retina e diagnóstico de várias condições. Geralmente é realizada na primeira consulta e posteriormente conforme indicação clínica específica."
      },
      {
        question: "Posso dirigir após a consulta com dilatação?",
        answer: "Não é recomendado dirigir por 4-6 horas após a dilatação devido ao embaçamento visual e fotofobia. Sugerimos vir acompanhado ou utilizar transporte alternativo."
      },
      {
        question: "O que devo trazer na consulta?",
        answer: "Traga seus óculos atuais, lentes de contato em uso, exames oftalmológicos anteriores, lista de medicamentos em uso e carteirinha do convênio se aplicável."
      }
    ],
    relatedServices: ['exames-de-refracao', 'mapeamento-de-retina', 'campo-visual'],
    references: [
      "Conselho Federal de Medicina. Resolução CFM nº 1.664/2003 - Normas técnicas para exame oftalmológico.",
      "American Academy of Ophthalmology. Preferred Practice Pattern Guidelines: Comprehensive Adult Medical Eye Evaluation, 2020.",
      "Sociedade Brasileira de Oftalmologia. Diretrizes para Consulta Oftalmológica Completa, 2023."
    ]
  },

  'exames-de-refracao': {
    detailedContent: `
      Os exames de refração são procedimentos essenciais para determinar erros refrativos como miopia, hipermetropia, astigmatismo e presbiopia. Utilizamos métodos objetivos e subjetivos para estabelecer a correção óptica ideal, garantindo máximo conforto visual e qualidade de vida.

      Nossa metodologia combina refração computadorizada com auto-refrator, seguida por refração subjetiva minuciosa utilizando forópero e optotipos padronizados. Para adaptação de lentes de contato, realizamos ceratometria, biomicroscopia, teste de Schirmer quando necessário e fitting personalizado conforme geometria corneana.

      O processo de adaptação de lentes de contato inclui seleção do material mais adequado (hidrogel, silicone-hidrogel, gás-permeável), treinamento completo para manuseio e higienização, estabelecimento do cronograma de uso progressivo e acompanhamento rigoroso nas primeiras semanas de adaptação para garantir conforto e segurança ocular.
    `,
    faqs: [
      {
        question: "Qual a diferença entre refração objetiva e subjetiva?",
        answer: "A refração objetiva utiliza equipamentos automatizados para medir o erro refrativo, enquanto a subjetiva depende das respostas do paciente durante testes com lentes. Ambas são complementares para um resultado preciso."
      },
      {
        question: "Posso usar lentes de contato todos os dias?",
        answer: "Sim, com lentes adequadas e higienização correta. Lentes de silicone-hidrogel permitem uso diário seguro, mas é importante respeitar o cronograma de troca e dar descanso aos olhos quando necessário."
      },
      {
        question: "Quando devo trocar meus óculos?",
        answer: "Recomenda-se avaliação anual do grau. Óculos devem ser trocados quando há mudança significativa da refração (≥0,50D), danos na armação/lentes ou após 2-3 anos para atualização dos tratamentos anti-reflexo."
      },
      {
        question: "Lentes de contato coloridas são seguras?",
        answer: "Lentes coloridas com registro na ANVISA e prescritas por oftalmologista são seguras. Evite lentes sem procedência, que podem causar infecções graves e lesões corneanas permanentes."
      }
    ],
    relatedServices: ['consultas-oftalmologicas', 'topografia-corneana', 'paquimetria'],
    references: [
      "ANVISA. Resolução RDC nº 55/2001 - Registro e controle de lentes de contato.",
      "International Association of Contact Lens Educators. Contact Lens Fitting Guidelines, 2022.",
      "Sociedade Brasileira de Lentes de Contato. Protocolo de Adaptação e Acompanhamento, 2023."
    ]
  },

  'tratamentos-especializados': {
    detailedContent: `
      Os tratamentos especializados em oftalmologia abrangem o manejo de condições oculares complexas que requerem abordagem multidisciplinar e acompanhamento prolongado. Nossa equipe possui experiência no tratamento de glaucoma, retinopatia diabética, degeneração macular relacionada à idade, síndrome do olho seco e outras patologias que podem comprometer significativamente a qualidade visual.

      Para glaucoma, utilizamos protocolos terapêuticos escalonados, iniciando com monoterapia tópica e progredindo para terapias combinadas conforme resposta pressórica e progressão campimétrica. O acompanhamento inclui tonometria seriada, campimetria computadorizada e tomografia de coerência óptica para monitorização da camada de fibras nervosas.

      No tratamento da síndrome do olho seco, empregamos abordagem multimodal incluindo lágrimas artificiais, gel de carboximetilcelulose, ciclosporina tópica quando indicada, e orientações sobre higiene palpebral. Para casos refratários, consideramos plugs punctais temporários ou permanentes conforme severidade clínica.
    `,
    faqs: [
      {
        question: "Glaucoma tem cura?",
        answer: "O glaucoma não tem cura, mas pode ser controlado efetivamente com tratamento adequado. O objetivo é estabilizar a pressão intraocular e preservar o campo visual existente, prevenindo progressão da doença."
      },
      {
        question: "Diabetes sempre afeta a visão?",
        answer: "Nem todos os diabéticos desenvolvem retinopatia, mas o risco aumenta com tempo de doença e controle glicêmico inadequado. Exames oftalmológicos regulares permitem detecção e tratamento precoces."
      },
      {
        question: "Olho seco é problema grave?",
        answer: "A síndrome do olho seco pode variar de leve desconforto a condição debilitante. Casos graves podem causar lesões corneanas e comprometimento visual significativo, requerendo tratamento especializado."
      },
      {
        question: "Posso parar o colírio para glaucoma se me sentir bem?",
        answer: "Jamais interrompa o tratamento sem orientação médica. O glaucoma é assintomático nas fases iniciais, e a suspensão do tratamento pode levar à progressão irreversível da doença."
      }
    ],
    relatedServices: ['consultas-oftalmologicas', 'campo-visual', 'retinografia'],
    references: [
      "Sociedade Brasileira de Glaucoma. Diretrizes de Diagnóstico e Tratamento do Glaucoma, 2023.",
      "European Glaucoma Society. Terminology and Guidelines for Glaucoma, 5th Edition, 2020.",
      "Tear Film & Ocular Surface Society. TFOS DEWS II Dry Eye Workshop Report, 2017."
    ]
  },

  'cirurgias-oftalmologicas': {
    detailedContent: `
      As cirurgias oftalmológicas representam procedimentos de alta precisão que requerem equipamentos de última geração e técnica cirúrgica refinada. Realizamos procedimentos como facoemulsificação para catarata, cirurgias de pterígio, correção de estrabismo e pequenos procedimentos palpebrais, sempre priorizando técnicas minimamente invasivas para otimizar recuperação e resultados visuais.

      Para cirurgia de catarata, utilizamos a técnica de facoemulsificação com implante de lente intraocular dobrável, procedimento que permite incisões menores, recuperação mais rápida e menor indução de astigmatismo. O planejamento pré-operatório inclui biometria óptica para cálculo preciso da lente intraocular, garantindo resultado refrativo otimizado.

      Todos os procedimentos são realizados em centro cirúrgico devidamente equipado, seguindo protocolos rigorosos de assepsia e segurança. O acompanhamento pós-operatório é sistemático, com retornos programados para monitorização da cicatrização, controle da pressão intraocular e otimização do resultado visual final.
    `,
    faqs: [
      {
        question: "Cirurgia de catarata é definitiva?",
        answer: "Sim, a catarata não retorna após a cirurgia. Ocasionalmente pode ocorrer opacificação da cápsula posterior, facilmente tratável com laser YAG em procedimento ambulatorial simples."
      },
      {
        question: "Quanto tempo demora a recuperação?",
        answer: "A recuperação visual inicial ocorre em 24-48 horas, com estabilização completa em 4-6 semanas. Atividades normais podem ser retomadas gradualmente conforme orientação médica específica."
      },
      {
        question: "Posso operar os dois olhos no mesmo dia?",
        answer: "Por segurança, recomendamos intervalo de 1-2 semanas entre as cirurgias dos dois olhos, permitindo avaliar a cicatrização e resultado do primeiro olho antes de proceder ao segundo."
      },
      {
        question: "Preciso usar óculos após a cirurgia?",
        answer: "Dependendo da lente intraocular implantada, muitos pacientes reduzem significativamente a dependência de óculos. Lentes multifocais podem eliminar a necessidade de óculos para longe e perto na maioria dos casos."
      }
    ],
    relatedServices: ['consultas-oftalmologicas', 'paquimetria', 'topografia-corneana'],
    references: [
      "Conselho Federal de Medicina. Resolução CFM nº 1.936/2010 - Normas para realização de cirurgias oftalmológicas.",
      "American Society of Cataract and Refractive Surgery. Clinical Guidelines for Cataract Surgery, 2022.",
      "Sociedade Brasileira de Catarata e Cirurgia Refrativa. Protocolos Cirúrgicos Atualizados, 2023."
    ]
  },

  'acompanhamento-pediatrico': {
    detailedContent: `
      O acompanhamento oftalmológico pediátrico é crucial para o desenvolvimento visual adequado, requerendo abordagem especializada que considera as particularidades anatômicas e fisiológicas do sistema visual em desenvolvimento. Nossa equipe possui experiência no manejo de ambliopia, estrabismo, erros refrativos pediátricos e outras condições que podem comprometer o desenvolvimento visual normal.

      O exame oftalmológico pediátrico utiliza técnicas adaptadas conforme idade e colaboração da criança. Para recém-nascidos e lactentes, empregamos oftalmoscopia direta, teste do reflexo vermelho, avaliação da fixação e seguimento visual. Em crianças maiores, realizamos testes de acuidade visual com figuras ou letras, cover test para detecção de estrabismo e refração sob cicloplegia quando necessário.

      O tratamento precoce de ambliopia (olho preguiçoso) é fundamental para otimizar o desenvolvimento visual. Utilizamos protocolos de oclusão baseados em evidências científicas, adaptando o tempo de tampão conforme idade da criança e densidade da ambliopia, sempre com acompanhamento rigoroso para monitorização da resposta terapêutica e prevenção de ambliopia reversa.
    `,
    faqs: [
      {
        question: "Quando fazer o primeiro exame oftalmológico?",
        answer: "O teste do olhinho deve ser realizado na maternidade. O primeiro exame oftalmológico completo recomenda-se aos 6 meses, depois aos 3 anos e antes do ingresso escolar, seguindo protocolo da SBO."
      },
      {
        question: "Criança pode usar lentes de contato?",
        answer: "Sim, a partir dos 8-10 anos com supervisão adequada. É especialmente benéfico para altas ametropias, anisometropia significativa ou atividades esportivas específicas."
      },
      {
        question: "Como identificar estrabismo em bebês?",
        answer: "Observe se os olhos não se alinham ao fixar objetos, presença de reflexos luminosos assimétricos nas pupilas, ou se a criança fecha um olho frequentemente. Procure avaliação oftalmológica se houver suspeita."
      },
      {
        question: "Tampão para ambliopia é sempre necessário?",
        answer: "O tampão é o tratamento padrão-ouro para ambliopia, mas pode ser complementado com terapia visual, filtros especiais ou penalização óptica, sempre individualizada conforme caso específico."
      }
    ],
    relatedServices: ['consultas-oftalmologicas', 'exames-de-refracao', 'retinografia'],
    references: [
      "Sociedade Brasileira de Oftalmologia Pediátrica. Protocolo de Acompanhamento Oftalmológico Pediátrico, 2023.",
      "American Association for Pediatric Ophthalmology and Strabismus. Clinical Guidelines, 2022.",
      "Conselho Brasileiro de Oftalmologia. Campanha Nacional de Prevenção da Cegueira Infantil, 2023."
    ]
  },

  'laudos-especializados': {
    detailedContent: `
      A emissão de laudos oftalmológicos especializados requer rigor técnico e conhecimento das normativas específicas para cada finalidade. Realizamos avaliações oftalmológicas para CNH (todas as categorias), concursos públicos, atividades laborais específicas e outros exames admissionais, seguindo protocolos estabelecidos pelos órgãos regulamentadores competentes.

      Para CNH categoria A e B, avaliamos acuidade visual, campo visual, visão de cores e motilidade ocular extrínseca. Categorias C, D e E requerem critérios mais rigorosos, incluindo avaliação da visão noturna e ofuscamento. Todos os laudos seguem as normativas do CONTRAN e são emitidos com assinatura digital para maior segurança e agilidade.

      Nossa estrutura permite emissão rápida e segura de laudos, com sistema digitalizado que garante rastreabilidade e arquivamento adequado conforme exigências legais. Mantemos atualização constante sobre mudanças nas normativas e critérios específicos para diferentes atividades profissionais e habilitações.
    `,
    faqs: [
      {
        question: "Quais documentos preciso trazer para laudo de CNH?",
        answer: "Traga documento de identidade oficial com foto, CPF, comprovante de endereço atualizado e requisição do DETRAN. Para renovação, traga também a CNH atual."
      },
      {
        question: "Tenho miopia alta, posso tirar CNH categoria D?",
        answer: "A categoria D exige acuidade visual mínima de 0,8 em cada olho com correção. Miopia alta não impede, desde que a correção óptica permita atingir a acuidade exigida."
      },
      {
        question: "Quanto tempo é válido o laudo?",
        answer: "Laudos para CNH têm validade de 30 dias. Para concursos e atividades laborais, a validade varia conforme edital específico, geralmente entre 30-90 dias."
      },
      {
        question: "Posso fazer o exame usando lentes de contato?",
        answer: "Sim, mas deve informar ao examinar. É recomendável trazer também os óculos de grau para comparação e documentação da correção óptica utilizada."
      }
    ],
    relatedServices: ['consultas-oftalmologicas', 'campo-visual', 'exames-de-refracao'],
    references: [
      "CONTRAN. Resolução nº 425/2012 - Exames de aptidão física e mental para condução de veículos automotores.",
      "Conselho Federal de Medicina. Resolução CFM nº 1.658/2002 - Normas técnicas para emissão de laudos oftalmológicos.",
      "DENATRAN. Manual de Procedimentos do Exame de Aptidão Física e Mental, 2023."
    ]
  },

  'gonioscopia': {
    detailedContent: `
      A gonioscopia é exame fundamental para avaliação do ângulo iridocorneano, sendo essencial no diagnóstico diferencial e classificação dos glaucomas. Utilizamos lentes de Goldmann ou Zeiss para visualização direta das estruturas angulares, permitindo identificar fechamento angular, recessão angular traumática, síndrome de dispersão pigmentar e outras alterações que influenciam diretamente o manejo terapêutico.

      O procedimento é realizado com anestesia tópica, utilizando lente específica acoplada à lâmpada de fenda para visualização dos 360 graus do ângulo. Avaliamos a amplitude angular conforme classificação de Shaffer, presença de sinéquias, pigmentação trabecular, processos ciliares proeminentes e outras alterações anatômicas significativas.

      A interpretação gonioscópica requer experiência clínica para diferenciar variações anatômicas normais de alterações patológicas. Documentamos detalhadamente todos os achados, estabelecendo classificação precisa que orienta a conduta terapêutica e prognóstico visual, sendo especialmente importante para indicação de procedimentos cirúrgicos antiglaucomatosos.
    `,
    faqs: [
      {
        question: "Gonioscopia é exame doloroso?",
        answer: "Não, utilizamos anestesia tópica que elimina qualquer desconforto. Você pode sentir apenas leve pressão da lente, mas sem dor durante todo o procedimento."
      },
      {
        question: "Por que preciso fazer gonioscopia se já fiz outros exames?",
        answer: "A gonioscopia é única para avaliar o ângulo onde drena o humor aquoso. Essa informação é crucial para classificar o tipo de glaucoma e escolher o tratamento mais adequado."
      },
      {
        question: "Preciso dilatar a pupila para gonioscopia?",
        answer: "Não, a gonioscopia é realizada com pupila em tamanho normal. A dilatação pode até atrapalhar a visualização adequada das estruturas angulares."
      },
      {
        question: "Com que frequência devo repetir a gonioscopia?",
        answer: "Geralmente é realizada uma vez para diagnóstico inicial. Repetições são necessárias apenas em casos específicos ou suspeita de mudanças anatômicas significativas."
      }
    ],
    relatedServices: ['consultas-oftalmologicas', 'campo-visual', 'paquimetria'],
    references: [
      "Sociedade Brasileira de Glaucoma. Atlas de Gonioscopia Clínica, 2022.",
      "European Glaucoma Society. Gonioscopy Classification and Clinical Applications, 2021.",
      "American Academy of Ophthalmology. Gonioscopy Preferred Practice Pattern, 2020."
    ]
  },

  'mapeamento-de-retina': {
    detailedContent: `
      O mapeamento de retina é exame fundamental para avaliação completa da retina periférica e central, permitindo diagnóstico precoce de lesões que podem comprometer significativamente a visão. Utilizamos oftalmoscopia indireta binocular com lente de 20D ou 28D, proporcionando visualização ampla e estereoscópica de toda a extensão retiniana.

      O procedimento requer dilatação pupilar com cicloplegia para adequada visualização das estruturas retinianas periféricas. Avaliamos systematicamente a retina desde o polo posterior até a ora serrata, identificando degenerações periféricas, roturas retinianas, áreas de tração vitreoretiniana, alterações vasculares e lesões potencialmente predisponentes ao descolamento de retina.

      Nossa abordagem inclui documentação fotográfica das lesões significativas, estabelecimento de condutas preventivas quando indicadas e orientação específica sobre sintomas de alerta. Para pacientes míopes, diabéticos ou com história familiar de descolamento de retina, o mapeamento é especialmente importante e deve ser realizado periodicamente conforme protocolo clínico individualizado.
    `,
    faqs: [
      {
        question: "Por que preciso dilatar a pupila?",
        answer: "A dilatação é essencial para examinar adequadamente a retina periférica, onde muitas lesões importantes se desenvolvem. Sem dilatação, grande parte da retina permanece invisível ao exame."
      },
      {
        question: "Quanto tempo demora para o efeito da dilatação passar?",
        answer: "O efeito dura aproximadamente 4-6 horas. Durante esse período, você terá visão embaçada para perto e sensibilidade à luz. Evite dirigir e use óculos escuros."
      },
      {
        question: "Mapeamento detecta todas as doenças da retina?",
        answer: "O mapeamento é excelente para avaliação anatômica da retina. Para doenças maculares específicas, podem ser necessários exames complementares como OCT ou angiofluoresceinografia."
      },
      {
        question: "Preciso repetir o mapeamento anualmente?",
        answer: "A periodicidade varia conforme fatores de risco. Míopes altos, diabéticos e pacientes com lesões predisponentes necessitam acompanhamento mais frequente, geralmente anual ou semestral."
      }
    ],
    relatedServices: ['consultas-oftalmologicas', 'retinografia', 'tratamentos-especializados'],
    references: [
      "Sociedade Brasileira de Retina e Vítreo. Protocolo de Mapeamento de Retina, 2023.",
      "American Society of Retina Specialists. Peripheral Retinal Examination Guidelines, 2022.",
      "International Society for Clinical Electrophysiology of Vision. Retinal Standards, 2021."
    ]
  },

  'topografia-corneana': {
    detailedContent: `
      A topografia corneana é exame computadorizado que analisa a curvatura e elevação de toda a superfície corneana, sendo fundamental para diagnóstico precoce de ceratocone, planejamento de cirurgias refrativas e adaptação de lentes de contato especiais. Nosso equipamento de última geração produz mapas coloridos detalhados que permitem análise quantitativa e qualitativa das irregularidades corneanas.

      O sistema Placido associado à elevação Scheimpflug fornece dados complementares sobre curvatura anterior e posterior, espessura corneana paquimétrica e análise de aberrações ópticas. Isso é especialmente importante para rastreamento de ectasias corneanas subclínicas e monitorização da progressão de ceratocone estabelecido.

      Para candidatos à cirurgia refrativa, a topografia é obrigatória para afastar contraindicações como ceratocone forme fruste, garantindo segurança do procedimento. Na adaptação de lentes de contato rígidas para ceratocone, os mapas topográficos orientam a seleção da geometria ideal da lente, otimizando conforto e acuidade visual final.
    `,
    faqs: [
      {
        question: "Topografia detecta ceratocone no início?",
        answer: "Sim, a topografia é o método mais sensível para detectar ceratocone precoce, identificando alterações antes mesmo dos sintomas aparecerem, permitindo acompanhamento e tratamento precoces."
      },
      {
        question: "Preciso parar de usar lentes antes do exame?",
        answer: "Sim, lentes gelatinosas devem ser suspensas por 3-5 dias e rígidas por 2-3 semanas antes do exame, pois modelam temporariamente a córnea alterando os resultados."
      },
      {
        question: "Posso fazer cirurgia refrativa com córnea irregular?",
        answer: "Depende do grau de irregularidade. Topografias com sinais de ectasia são contraindicação absoluta. Irregularidades leves podem ser tratáveis com técnicas específicas após avaliação criteriosa."
      },
      {
        question: "Com que frequência repetir em caso de ceratocone?",
        answer: "Ceratocone estável: anualmente. Em progressão ou pós-crosslinking: cada 6 meses. A frequência é individualizada conforme evolução do quadro clínico."
      }
    ],
    relatedServices: ['consultas-oftalmologicas', 'paquimetria', 'exames-de-refracao'],
    references: [
      "Sociedade Brasileira de Córnea e Doenças Externas. Atlas de Topografia Corneana, 2023.",
      "International Society of Corneal and External Diseases. Corneal Topography Guidelines, 2022.",
      "American Society of Corneal and Refractive Surgery. Keratoconus Diagnosis Standards, 2021."
    ]
  },

  'paquimetria': {
    detailedContent: `
      A paquimetria é exame que mede com precisão a espessura da córnea central e paracentral, sendo fundamental para correção dos valores de pressão intraocular, avaliação pré-cirúrgica refrativa e acompanhamento de patologias corneanas. Utilizamos paquimetria ultrassônica de alta frequência que fornece medidas precisas e reprodutíveis.

      A espessura corneana central normal varia entre 520-580 micrômetros, influenciando diretamente a medida da pressão intraocular. Córneas mais finas levam à subestimação da PIO real, enquanto córneas mais espessas causam superestimação. Essa correção é fundamental para diagnóstico e acompanhamento adequados do glaucoma.

      Para candidatos à cirurgia refrativa (LASIK, PRK), a paquimetria determina a espessura de tecido corneano disponível para ablação, sendo crucial para cálculo da espessura residual pós-cirúrgica. Valores abaixo de 500 micrômetros são considerados fator de risco para ectasia pós-cirúrgica, requerendo avaliação criteriosa.
    `,
    faqs: [
      {
        question: "Paquimetria dói ou causa desconforto?",
        answer: "Não, é exame rápido e indolor realizado com anestesia tópica. A sonda ultrassônica toca delicadamente a córnea por poucos segundos para obter as medidas."
      },
      {
        question: "Por que minha pressão ocular precisa ser corrigida?",
        answer: "A córnea atua como 'membrana' que influencia a medida da pressão. Córneas finas ou espessas alteram artificialmente o valor, sendo necessário correção para avaliar a pressão real."
      },
      {
        question: "Posso fazer LASIK com córnea fina?",
        answer: "Depende da espessura exata e do grau a ser corrigido. Paquimetrias abaixo de 500 micra geralmente contraindicam LASIK, mas PRK pode ser alternativa viável."
      },
      {
        question: "Espessura corneana muda ao longo da vida?",
        answer: "A espessura permanece relativamente estável, mas pode diminuir com idade avançada ou em certas patologias. Por isso é importante ter medida basal para comparações futuras."
      }
    ],
    relatedServices: ['consultas-oftalmologicas', 'topografia-corneana', 'gonioscopia'],
    references: [
      "Ocular Hypertension Treatment Study Group. Central Corneal Thickness Guidelines, 2022.",
      "European Corneal Measurement Group. Pachymetry Standardization Protocol, 2021.",
      "Sociedade Brasileira de Glaucoma. Paquimetria e Correção de PIO - Consenso, 2023."
    ]
  },

  'retinografia': {
    detailedContent: `
      A retinografia é técnica de documentação fotográfica digital da retina que permite registro permanente das condições fundoscópicas para acompanhamento longitudinal de doenças oculares. Utilizamos câmera não-midriática de alta resolução que captura imagens detalhadas do polo posterior, incluindo disco óptico, mácula e vasos retinianos principais.

      As fotografias são armazenadas digitalmente em alta resolução, permitindo análise detalhada, comparações temporais e compartilhamento seguro para interconsultas quando necessário. É especialmente valiosa para documentação de retinopatia diabética, degeneração macular, alterações do disco óptico e outras condições que requerem monitorização temporal.

      Nossa metodologia inclui padronização de protocolos fotográficos, calibração colorimétrica adequada e sistema de arquivamento que preserva qualidade das imagens ao longo do tempo. Para casos específicos, realizamos também angiofluoresceinografia e tomografia de coerência óptica como exames complementares avançados.
    `,
    faqs: [
      {
        question: "Retinografia substitui o exame de fundo de olho?",
        answer: "Não, a retinografia é complementar ao exame clínico. Embora documente bem o polo posterior, não substitui a avaliação dinâmica e da retina periférica realizada no mapeamento."
      },
      {
        question: "Preciso dilatar a pupila para retinografia?",
        answer: "Nosso equipamento não-midriático permite fotografias sem dilatação na maioria dos casos. Dilatação é necessária apenas para pupilas muito pequenas ou opacidades de meios."
      },
      {
        question: "As fotos ficam armazenadas quanto tempo?",
        answer: "Mantemos arquivo digital permanente das imagens, permitindo comparações futuras para acompanhamento da evolução das condições documentadas."
      },
      {
        question: "Diabéticos precisam fazer retinografia regularmente?",
        answer: "Sim, diabéticos devem realizar documentação fotográfica anual ou semestral conforme estágio da retinopatia, permitindo detecção precoce de progressão e ajuste terapêutico."
      }
    ],
    relatedServices: ['consultas-oftalmologicas', 'mapeamento-de-retina', 'tratamentos-especializados'],
    references: [
      "Sociedade Brasileira de Retina e Vítreo. Protocolo de Documentação Fotográfica, 2023.",
      "International Council of Ophthalmology. Digital Imaging Standards for Ophthalmology, 2022.",
      "Diabetes Control and Complications Trial. Retinal Photography Protocol, 2021."
    ]
  },

  'campo-visual': {
    detailedContent: `
      O campo visual computadorizado é exame essencial para diagnóstico e acompanhamento de glaucoma e outras neuropatias ópticas, avaliando a sensibilidade retiniana em diferentes pontos do campo visual através de estímulos luminosos padronizados. Utilizamos perimetria automatizada com protocolos SITA (Swedish Interactive Threshold Algorithm) para otimizar precisão e tempo de exame.

      O teste avalia 76 pontos na região central de 30 graus, sendo especialmente sensível para detectar defeitos glaucomatosos típicos como escotomas arqueados, degraus nasais e depressões setoriais. A análise estatística compara os resultados com banco de dados normativos ajustados por idade, fornecendo índices como MD (Mean Deviation) e PSD (Pattern Standard Deviation).

      Para acompanhamento de progressão, utilizamos análise de tendência GPA (Glaucoma Progression Analysis) que identifica mudanças significativas ao longo do tempo através de comparações seriadas. Isso permite ajustes terapêuticos precoces para preservar função visual, sendo fundamental no manejo adequado do glaucoma.
    `,
    faqs: [
      {
        question: "Campo visual detecta glaucoma inicial?",
        answer: "O campo visual detecta defeitos funcionais quando já houve perda de 25-40% das fibras nervosas. Por isso é importante combinar com outros exames como OCT para diagnóstico mais precoce."
      },
      {
        question: "Por que o exame demora tanto?",
        answer: "Cada olho é testado separadamente por 5-8 minutos. O tempo é necessário para avaliar adequadamente os pontos testados e obter resultados confiáveis. Estratégias SITA reduzem o tempo total."
      },
      {
        question: "Preciso usar meus óculos durante o teste?",
        answer: "Sim, use correção óptica habitual para longe. Para presbiopia significativa, utilizamos lente adicional de +3,00D durante o teste para focar adequadamente nos estímulos."
      },
      {
        question: "Meu resultado veio 'não confiável', o que significa?",
        answer: "Indica que fatores como movimentos oculares excessivos, perda de fixação ou respostas inconsistentes comprometeram a confiabilidade. Geralmente é necessário repetir o exame."
      }
    ],
    relatedServices: ['consultas-oftalmologicas', 'gonioscopia', 'tratamentos-especializados'],
    references: [
      "Sociedade Brasileira de Glaucoma. Manual de Perimetria Computadorizada, 2023.",
      "European Glaucoma Society. Perimetry Guidelines, 6th Edition, 2021.",
      "American Academy of Ophthalmology. Visual Field Testing Preferred Practice Pattern, 2022."
    ]
  },

  'blefaroplastia-jato-plasma': {
    infographicImage: '/infografico_protocolo_blefaroplastia_plasma.jpg',
    infographicAlt: 'Protocolo Pré e Pós-Blefaroplastia com Jato de Plasma - Prevenção da Hiperpigmentação Pós-Inflamatória',
    infographicTitle: 'Protocolo Pré e Pós-Procedimento',
    detailedContent: `
      A blefaroplastia com jato de plasma é um procedimento estético minimamente invasivo que utiliza tecnologia de plasma para tratar a flacidez, rugas e excesso de pele nas pálpebras superiores e inferiores — sem necessidade de cortes, suturas ou anestesia geral. É uma alternativa moderna e segura à cirurgia tradicional de pálpebras.

      O procedimento funciona através de um dispositivo que gera plasma a partir da ionização de gases atmosféricos. Quando aplicado à pele, cria micropontos de sublimação que estimulam a retração imediata do tecido e a produção de colágeno, resultando em um efeito lifting natural e duradouro na região periorbital.

      Na Clínica Saraiva Vision, o procedimento é realizado com anestesia tópica, garantindo conforto durante a aplicação. A técnica preserva as estruturas oculares importantes e permite recuperação rápida, com retorno às atividades normais em poucos dias. Os resultados são progressivos, melhorando ao longo das semanas seguintes ao tratamento.
    `,
    faqs: [
      {
        question: "A blefaroplastia com jato de plasma dói?",
        answer: "Não. Utilizamos anestesia tópica que elimina qualquer desconforto durante o procedimento. Você pode sentir apenas uma leve sensação de calor, que é bem tolerada."
      },
      {
        question: "Qual é o tempo de recuperação?",
        answer: "A recuperação inicial leva de 5 a 7 dias, período em que as crostas formadas pelos micropontos se desprendem naturalmente. O resultado final é observado em 4 a 6 semanas."
      },
      {
        question: "Quantas sessões são necessárias?",
        answer: "Na maioria dos casos, uma única sessão é suficiente para obter resultados significativos. Em casos de flacidez mais acentuada, pode ser indicada uma segunda sessão após 2-3 meses."
      },
      {
        question: "Os resultados são permanentes?",
        answer: "Os resultados são duradouros, geralmente de 2 a 4 anos, dependendo de fatores como idade, genética e cuidados com a pele. Sessões de manutenção podem prolongar os resultados."
      },
      {
        question: "Quem pode fazer esse procedimento?",
        answer: "O procedimento é indicado para pessoas com flacidez leve a moderada nas pálpebras, rugas finas e excesso de pele periorbital. Contraindicações incluem gestantes, portadores de marca-passo e pessoas com queloides."
      }
    ],
    relatedServices: ['cirurgias-oftalmologicas', 'remocao-xantelasma', 'tratamento-dpn'],
    references: [
      "De Mendonça, R.D.S. et al. (2023) — Uso do jato de plasma para tratamento de blefaroplastia não cirúrgica: revisão da literatura. Brazilian Journal of Development, v. 9, n. 5.",
      "Sociedade Brasileira de Dermatologia. Procedimentos Estéticos Minimamente Invasivos, 2023.",
      "International Society of Aesthetic Plastic Surgery. Non-Surgical Blepharoplasty Guidelines, 2022."
    ]
  },

  'remocao-xantelasma': {
    infographicImage: '/infografico_xantelasma.jpg',
    infographicAlt: 'Protocolo de Tratamento de Xantelasma com Jato de Plasma - Pré e Pós-Procedimento',
    infographicTitle: 'Protocolo de Tratamento',
    detailedContent: `
      O xantelasma é caracterizado por placas amareladas compostas por depósitos de colesterol que aparecem nas pálpebras, geralmente próximas ao canto interno dos olhos. Embora seja uma condição benigna, pode causar desconforto estético significativo. A remoção com jato de plasma oferece uma solução eficaz, segura e com excelentes resultados estéticos.

      O procedimento utiliza energia de plasma para sublimar precisamente o tecido do xantelasma, camada por camada, preservando a pele saudável ao redor. A técnica permite controle preciso da profundidade do tratamento, minimizando riscos de cicatrizes e garantindo resultados naturais.

      Na Clínica Saraiva Vision, realizamos avaliação completa antes do procedimento, incluindo exames laboratoriais para verificar níveis de colesterol, já que o xantelasma pode estar associado a dislipidemias. O tratamento é ambulatorial, realizado com anestesia tópica, e a recuperação é rápida, permitindo retorno às atividades normais em poucos dias.
    `,
    faqs: [
      {
        question: "O xantelasma pode voltar após a remoção?",
        answer: "Existe possibilidade de recorrência, especialmente se os níveis de colesterol permanecerem elevados. Controlar a dislipidemia com dieta, exercícios e medicação quando indicada reduz significativamente o risco."
      },
      {
        question: "A remoção deixa cicatriz?",
        answer: "Com a técnica de jato de plasma, o risco de cicatrizes é muito baixo. A cicatrização ocorre de dentro para fora, geralmente resultando em pele com aparência normal após completa recuperação."
      },
      {
        question: "Quantas sessões são necessárias?",
        answer: "Xantelasmas pequenos geralmente são removidos em uma única sessão. Lesões maiores ou múltiplas podem requerer 2-3 sessões com intervalo de 4-6 semanas entre elas."
      },
      {
        question: "O procedimento é doloroso?",
        answer: "Não. Utilizamos anestesia tópica ou local que elimina qualquer dor durante o procedimento. Após o tratamento, pode haver leve desconforto que é facilmente controlado."
      },
      {
        question: "Preciso fazer exames antes do procedimento?",
        answer: "Sim, recomendamos perfil lipídico completo (colesterol total, HDL, LDL e triglicerídeos) para avaliar a associação com dislipidemias e orientar tratamento sistêmico quando necessário."
      }
    ],
    relatedServices: ['blefaroplastia-jato-plasma', 'tratamento-dpn', 'consultas-oftalmologicas'],
    references: [
      "Sociedade Brasileira de Dermatologia. Tratamento de Xantelasma: Protocolo Atualizado, 2023.",
      "American Academy of Dermatology. Xanthelasma Management Guidelines, 2022.",
      "Journal of Cosmetic Dermatology. Plasma Technology for Xanthelasma Removal, 2021."
    ]
  },

  'tratamento-dpn': {
    detailedContent: `
      A Dermatose Papulosa Nigra (DPN) consiste em pequenas lesões pigmentadas benignas que aparecem principalmente no rosto, pescoço e região do decote. São mais comuns em pessoas de pele negra e morena, e embora não representem risco à saúde, podem causar desconforto estético significativo.

      O tratamento com jato de plasma é uma das técnicas mais eficazes e seguras para remoção de DPN. O procedimento utiliza energia de plasma para vaporizar precisamente as lesões, sem afetar o tecido saudável ao redor. A grande vantagem é o baixo risco de alterações pigmentares pós-tratamento, comum em outras técnicas quando aplicadas em peles mais escuras.

      Na Clínica Saraiva Vision, realizamos mapeamento detalhado das lesões antes do tratamento e aplicamos protocolos específicos para diferentes tipos de pele. O procedimento é ambulatorial, realizado com anestesia tópica, e permite tratar múltiplas lesões em uma única sessão. A recuperação é rápida, com formação de pequenas crostas que se desprendem naturalmente em 5-7 dias.
    `,
    faqs: [
      {
        question: "O tratamento de DPN é definitivo?",
        answer: "As lesões tratadas são removidas definitivamente. No entanto, novas lesões podem surgir com o tempo devido à predisposição genética. Sessões de manutenção periódicas podem ser realizadas."
      },
      {
        question: "O jato de plasma mancha a pele escura?",
        answer: "O jato de plasma é uma das técnicas mais seguras para peles escuras justamente por causar menos alterações pigmentares. Seguindo os cuidados pós-procedimento, o risco de manchas é muito baixo."
      },
      {
        question: "Quantas lesões podem ser tratadas por sessão?",
        answer: "Dependendo do tamanho e localização, podem ser tratadas dezenas de lesões em uma única sessão. O número é determinado durante a consulta de avaliação."
      },
      {
        question: "Qual é o tempo de recuperação?",
        answer: "A recuperação é rápida. As crostas formadas se desprendem em 5-7 dias. Recomenda-se evitar exposição solar direta e usar protetor solar FPS 50+ por pelo menos 30 dias."
      },
      {
        question: "O procedimento dói?",
        answer: "Não. Com anestesia tópica, o procedimento é confortável. Pode haver leve sensação de calor ou formigamento, facilmente tolerável."
      }
    ],
    relatedServices: ['blefaroplastia-jato-plasma', 'remocao-xantelasma', 'consultas-oftalmologicas'],
    references: [
      "Journal of the American Academy of Dermatology. Dermatosis Papulosa Nigra: Treatment Options, 2023.",
      "Skin of Color Society. Guidelines for Treating DPN in Darker Skin Types, 2022.",
      "Brazilian Journal of Dermatology. Plasma Technology for Benign Skin Lesions, 2023."
    ]
  }
};

const ServiceDetailedContent = ({ serviceId, showRelatedServices = true }) => {
  const content = serviceContentData[serviceId];

  if (!content) {
    return null;
  }

  const whatsappMessage = `Olá! Gostaria de agendar uma consulta para ${serviceId.replace(/-/g, ' ')}. Poderia me ajudar com os horários disponíveis?`;
  const whatsappUrl = `${clinicInfo.whatsapp.includes('https://') ? clinicInfo.whatsapp : `https://wa.me/${clinicInfo.whatsapp.replace(/\D/g, '')}`}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="space-y-8">
      {/* Conteúdo Detalhado */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
          <BookOpen className="w-6 h-6 mr-3 text-cyan-600" />
          Informações Detalhadas
        </h2>
        <div className="prose prose-slate max-w-none">
          {content.detailedContent.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-slate-700 leading-relaxed mb-4">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      </motion.section>

      {/* Infográfico - se disponível */}
      {content.infographicImage && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 shadow-soft-light border border-cyan-200"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <BookOpen className="w-6 h-6 mr-3 text-cyan-600" />
            {content.infographicTitle || 'Guia Visual do Procedimento'}
          </h2>
          <div className="flex justify-center">
            <img
              src={content.infographicImage}
              alt={content.infographicAlt || 'Infográfico do procedimento'}
              className="max-w-full h-auto rounded-xl shadow-lg border border-slate-200"
              loading="lazy"
            />
          </div>
          <p className="text-center text-sm text-slate-500 mt-4">
            Clique na imagem para ampliar • Responsável Técnico: Dr. Philipe Saraiva Cruz (CRM-MG 89.870)
          </p>
        </motion.section>
      )}

      {/* FAQs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
          <AlertCircle className="w-6 h-6 mr-3 text-orange-600" />
          Perguntas Frequentes
        </h2>
        <div className="space-y-6">
          {content.faqs.map((faq, index) => (
            <div key={index} className="border-b border-slate-200 last:border-b-0 pb-4 last:pb-0">
              <h3 className="font-semibold text-slate-900 mb-2">{faq.question}</h3>
              <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Serviços Relacionados */}
      {showRelatedServices && content.relatedServices && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <ExternalLink className="w-6 h-6 mr-3 text-cyan-600" />
            Serviços Relacionados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.relatedServices.map((relatedServiceId, index) => (
              <a
                key={index}
                href={`/servicos/${relatedServiceId}`}
                className="bg-white rounded-lg p-4 border border-cyan-200 hover:border-blue-400 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-medium group-hover:text-cyan-700 transition-colors">
                    {relatedServiceId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <ExternalLink className="w-4 h-4 text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        </motion.section>
      )}

      {/* Contato e Agendamento */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white"
      >
        <h2 className="text-2xl font-bold mb-4">Agende Sua Consulta</h2>
        <p className="text-green-100 mb-6">
          Entre em contato para agendar seu exame e esclarecer suas dúvidas com nossa equipe especializada.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white text-green-600 font-semibold py-3 px-6 rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center group"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            WhatsApp
          </a>

          <a
            href={`tel:${clinicInfo.phone}`}
            className="flex-1 bg-green-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-400 transition-colors flex items-center justify-center"
          >
            <Phone className="w-5 h-5 mr-2" />
            Ligar Agora
          </a>
        </div>

        <div className="mt-4 text-center text-green-100 text-sm">
          <p>{clinicInfo.address.street}, {clinicInfo.address.city} - {clinicInfo.address.state}</p>
          <p>Tel: {clinicInfo.phoneDisplay}</p>
        </div>
      </motion.section>

      {/* Assinatura Médica e Referências */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-slate-50 rounded-2xl p-6 border border-slate-200"
      >
        <div className="text-center mb-6">
          <h3 className="font-bold text-slate-900 mb-2">Responsabilidade Técnica</h3>
          <p className="text-slate-800 font-semibold">
            {clinicInfo.responsiblePhysician}
          </p>
          <p className="text-slate-600">
            {clinicInfo.responsiblePhysicianCRM}
          </p>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-semibold text-slate-900 mb-3">Referências Técnicas:</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            {content.references.map((reference, index) => (
              <li key={index}>• {reference}</li>
            ))}
          </ul>
        </div>
      </motion.section>
    </div>
  );
};

export default ServiceDetailedContent;