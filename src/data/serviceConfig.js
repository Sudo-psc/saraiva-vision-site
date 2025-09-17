// Service configuration data - separated for better maintainability and performance
export const createServiceConfig = (t) => ({
  'consultas-oftalmologicas': {
    id: 'consultas-oftalmologicas',
    title: t('services.items.consultations.title'),
    description: t('services.items.consultations.description'),
    fullDescription: t('services.items.consultations.fullDescription'),
    benefits: [
      t('services.benefits.comprehensiveExam', 'Exame completo da saúde ocular'),
      t('services.benefits.earlyDiagnosis', 'Diagnóstico precoce de doenças'),
      t('services.benefits.personalizedCare', 'Acompanhamento personalizado'),
      t('services.benefits.modernEquipment', 'Equipamentos de última geração'),
      t('services.benefits.preventiveGuidance', 'Orientação preventiva detalhada')
    ],
    duration: t('services.duration.consultation', '45-60 minutos'),
    preparation: t('services.preparation.consultation', 'Traga seus óculos atuais e exames anteriores'),
    included: [
      t('services.included.anamnesis', 'Anamnese detalhada'),
      t('services.included.acuityTest', 'Teste de acuidade visual'),
      t('services.included.biomicroscopy', 'Biomicroscopia'),
      t('services.included.tonometry', 'Tonometria (pressão ocular)'),
      t('services.included.retinaMapping', 'Mapeamento de retina'),
      t('services.included.orientations', 'Orientações e prescrições')
    ]
  },
  'exames-de-refracao': {
    id: 'exames-de-refracao',
    title: t('services.items.refraction.title'),
    description: t('services.items.refraction.description'),
    fullDescription: t('services.items.refraction.fullDescription'),
    benefits: [
      t('services.benefits.preciseGrade', 'Determinação precisa do grau'),
      t('services.benefits.contactAdaptation', 'Adaptação completa de lentes de contato'),
      t('services.benefits.lensTypes', 'Teste de diferentes tipos de lentes'),
      t('services.benefits.specializedFollowup', 'Acompanhamento especializado'),
      t('services.benefits.careGuidance', 'Orientação sobre uso e cuidados')
    ],
    duration: t('services.duration.refraction', '30-45 minutos'),
    preparation: t('services.preparation.refraction', 'Evite usar lentes de contato 24h antes do exame'),
    included: [
      t('services.included.computerizedRefraction', 'Refração computadorizada'),
      t('services.included.subjectiveRefraction', 'Refração subjetiva'),
      t('services.included.contactTest', 'Teste de lentes de contato'),
      t('services.included.personalizedAdaptation', 'Adaptação personalizada'),
      t('services.included.usageTraining', 'Treinamento de uso'),
      t('services.included.cleaningKit', 'Kit inicial de limpeza')
    ]
  },
  'tratamentos-especializados': {
    id: 'tratamentos-especializados',
    title: t('services.items.specialized.title'),
    description: t('services.items.specialized.description'),
    fullDescription: t('services.items.specialized.fullDescription'),
    benefits: [
      t('services.benefits.glaucomaTreatment', 'Tratamento de glaucoma avançado'),
      t('services.benefits.diabetesControl', 'Controle de diabetes ocular'),
      t('services.benefits.dryEyeTherapy', 'Terapia para olho seco'),
      t('services.benefits.macularDegeneration', 'Acompanhamento de degeneração macular'),
      t('services.benefits.individualProtocol', 'Protocolo individualizado')
    ],
    duration: t('services.duration.specialized', '60-90 minutos'),
    preparation: t('services.preparation.specialized', 'Traga todos os exames e medicamentos em uso'),
    included: [
      t('services.included.specializedEvaluation', 'Avaliação especializada'),
      t('services.included.complementaryExams', 'Exames complementares'),
      t('services.included.therapeuticPlan', 'Plano terapêutico'),
      t('services.included.medicationPrescription', 'Prescrição medicamentosa'),
      t('services.included.followupScheduling', 'Agendamento de retornos'),
      t('services.included.familyOrientation', 'Orientação familiar')
    ]
  },
  'cirurgias-oftalmologicas': {
    id: 'cirurgias-oftalmologicas',
    title: t('services.items.surgeries.title'),
    description: t('services.items.surgeries.description'),
    fullDescription: t('services.items.surgeries.fullDescription'),
    benefits: [
      t('services.benefits.microinvasiveTechniques', 'Técnicas microinvasivas'),
      t('services.benefits.quickRecovery', 'Recuperação rápida'),
      t('services.benefits.equippedCenter', 'Centro cirúrgico equipado'),
      t('services.benefits.safeAnesthesia', 'Anestesia local segura'),
      t('services.benefits.postOpFollowup', 'Acompanhamento pós-operatório')
    ],
    duration: t('services.duration.surgeries', '45-90 minutos'),
    preparation: t('services.preparation.surgeries', 'Jejum de 8 horas e acompanhante obrigatório'),
    included: [
      t('services.included.preOpConsultation', 'Consulta pré-operatória'),
      t('services.included.preOpExams', 'Exames pré-cirúrgicos'),
      t('services.included.surgicalProcedure', 'Procedimento cirúrgico'),
      t('services.included.postOpMedication', 'Medicação pós-operatória'),
      t('services.included.includedReturns', 'Retornos inclusos'),
      t('services.included.emergencySupport', 'Suporte 24h emergencial')
    ]
  },
  'acompanhamento-pediatrico': {
    id: 'acompanhamento-pediatrico',
    title: t('services.items.pediatric.title'),
    description: t('services.items.pediatric.description'),
    fullDescription: t('services.items.pediatric.fullDescription'),
    benefits: [
      t('services.benefits.friendlyEnvironment', 'Ambiente lúdico e acolhedor'),
      t('services.benefits.earlyDetection', 'Detecção precoce de problemas'),
      t('services.benefits.adaptedTechniques', 'Técnicas adaptadas para crianças'),
      t('services.benefits.parentGuidance', 'Orientação aos pais'),
      t('services.benefits.developmentFollowup', 'Acompanhamento do desenvolvimento')
    ],
    duration: t('services.duration.pediatric', '30-45 minutos'),
    preparation: t('services.preparation.pediatric', 'Criança descansada e alimentada'),
    included: [
      t('services.included.redReflexTest', 'Teste do olhinho'),
      t('services.included.visualDevelopment', 'Avaliação do desenvolvimento visual'),
      t('services.included.strabismusTest', 'Teste de estrabismo'),
      t('services.included.infantRefraction', 'Refração infantil'),
      t('services.included.familyGuidance', 'Orientação familiar'),
      t('services.included.returnSchedule', 'Cronograma de retornos')
    ]
  },
  'laudos-especializados': {
    id: 'laudos-especializados',
    title: t('services.items.reports.title'),
    description: t('services.items.reports.description'),
    fullDescription: t('services.items.reports.fullDescription'),
    benefits: [
      t('services.benefits.licenseReports', 'Laudos para CNH todas as categorias'),
      t('services.benefits.publicContests', 'Concursos públicos e militares'),
      t('services.benefits.occupationalEvals', 'Avaliações ocupacionais'),
      t('services.benefits.digitalSignature', 'Assinatura digital'),
      t('services.benefits.fastDelivery', 'Entrega rápida e segura')
    ],
    duration: t('services.duration.reports', '20-30 minutos'),
    preparation: t('services.preparation.reports', 'Traga documento de identidade e requisição'),
    included: [
      t('services.included.completeExam', 'Exame oftalmológico completo'),
      t('services.included.specificEvaluation', 'Avaliação específica solicitada'),
      t('services.included.technicalReport', 'Laudo técnico detalhado'),
      t('services.included.digitalSig', 'Assinatura digital'),
      t('services.included.emailDelivery', 'Envio por e-mail'),
      t('services.included.printedCopy', 'Via impressa quando necessário')
    ]
  },
  // Specialized exams
  'gonioscopia': {
    id: 'gonioscopia',
    title: t('services.items.gonioscopy.title'),
    description: t('services.items.gonioscopy.description'),
    fullDescription: t('services.items.gonioscopy.fullDescription'),
    benefits: [
      t('services.benefits.preciseDiagnosis', 'Diagnóstico preciso do glaucoma'),
      t('services.benefits.glaucomaClassification', 'Classificação do tipo de glaucoma'),
      t('services.benefits.angleEvaluation', 'Avaliação do ângulo iridocorneano'),
      t('services.benefits.directedGuidance', 'Orientação terapêutica direcionada'),
      t('services.benefits.precisionEquipment', 'Equipamento de alta precisão')
    ],
    duration: t('services.duration.gonioscopy', '15-20 minutos'),
    preparation: t('services.preparation.gonioscopy', 'Evite usar lentes de contato no dia do exame'),
    included: [
      t('services.included.topicalAnesthesia', 'Anestesia tópica'),
      t('services.included.bilateralExam', 'Exame gonioscópico bilateral'),
      t('services.included.angleClassification', 'Classificação detalhada do ângulo'),
      t('services.included.specializedReport', 'Relatório técnico especializado'),
      t('services.included.diagnosisGuidance', 'Orientações sobre o diagnóstico'),
      t('services.included.referralWhenNeeded', 'Encaminhamento quando necessário')
    ]
  },
  'mapeamento-de-retina': {
    id: 'mapeamento-de-retina',
    title: t('services.items.retinaMapping.title'),
    description: t('services.items.retinaMapping.description'),
    fullDescription: t('services.items.retinaMapping.fullDescription'),
    benefits: [
      t('services.benefits.earlyLesionDetection', 'Detecção precoce de lesões retinianas'),
      t('services.benefits.peripheralEvaluation', 'Avaliação da retina periférica'),
      t('services.benefits.detachmentDiagnosis', 'Diagnóstico de descolamento de retina'),
      t('services.benefits.diabeticMonitoring', 'Monitoramento de retinopatia diabética'),
      t('services.benefits.painlessExam', 'Exame indolor e seguro')
    ],
    duration: t('services.duration.retinaMapping', '20-30 minutos'),
    preparation: t('services.preparation.retinaMapping', 'Dilatação pupilar necessária - evite dirigir após o exame'),
    included: [
      t('services.included.pupilDilation', 'Dilatação pupilar com colírios'),
      t('services.included.binocularOphthalmoscopy', 'Oftalmoscopia indireta binocular'),
      t('services.included.peripheralMapping', 'Mapeamento da retina periférica'),
      t('services.included.photographicDocumentation', 'Documentação fotográfica quando indicado'),
      t('services.included.detailedReport', 'Relatório detalhado'),
      t('services.included.postExamGuidance', 'Orientações pós-exame')
    ]
  },
  'topografia-corneana': {
    id: 'topografia-corneana',
    title: t('services.items.cornealTopography.title'),
    description: t('services.items.cornealTopography.description'),
    fullDescription: t('services.items.cornealTopography.fullDescription'),
    benefits: [
      t('services.benefits.keratoconeDiagnosis', 'Diagnóstico precoce de ceratocone'),
      t('services.benefits.refractivePlanning', 'Planejamento de cirurgia refrativa'),
      t('services.benefits.specialLensAdaptation', 'Adaptação de lentes especiais'),
      t('services.benefits.ectasiaFollowup', 'Acompanhamento de ectasias'),
      t('services.benefits.coloredMaps', 'Mapas coloridos detalhados')
    ],
    duration: t('services.duration.cornealTopography', '10-15 minutos'),
    preparation: t('services.preparation.cornealTopography', 'Suspender uso de lentes de contato conforme orientação médica'),
    included: [
      t('services.included.computerizedTopography', 'Topografia computadorizada'),
      t('services.included.elevationMaps', 'Mapas de elevação e curvatura'),
      t('services.included.aberrationAnalysis', 'Análise de aberrações corneanas'),
      t('services.included.completeReport', 'Relatório técnico completo'),
      t('services.included.coloredImages', 'Imagens coloridas impressas'),
      t('services.included.resultGuidance', 'Orientação sobre resultados')
    ]
  },
  'paquimetria': {
    id: 'paquimetria',
    title: t('services.items.pachymetry.title'),
    description: t('services.items.pachymetry.description'),
    fullDescription: t('services.items.pachymetry.fullDescription'),
    benefits: [
      t('services.benefits.preciseThickness', 'Medição precisa da espessura corneana'),
      t('services.benefits.glaucomaAid', 'Auxílio no diagnóstico de glaucoma'),
      t('services.benefits.refractiveSurgeryEval', 'Avaliação para cirurgia refrativa'),
      t('services.benefits.keratoconeMonitoring', 'Monitoramento de ceratocone'),
      t('services.benefits.quickPainless', 'Exame rápido e indolor')
    ],
    duration: t('services.duration.pachymetry', '5-10 minutos'),
    preparation: t('services.preparation.pachymetry', 'Suspender lentes de contato 24h antes do exame'),
    included: [
      t('services.included.ultrasonicPachymetry', 'Paquimetria ultrassônica bilateral'),
      t('services.included.multiplePoints', 'Medidas em múltiplos pontos'),
      t('services.included.normalValues', 'Valores de referência normais'),
      t('services.included.clinicalInterpretation', 'Interpretação clínica'),
      t('services.included.techReport', 'Relatório técnico'),
      t('services.included.resultOrientation', 'Orientações sobre resultados')
    ]
  },
  'retinografia': {
    id: 'retinografia',
    title: t('services.items.retinography.title'),
    description: t('services.items.retinography.description'),
    fullDescription: t('services.items.retinography.fullDescription'),
    benefits: [
      t('services.benefits.photographicDocumentation', 'Documentação fotográfica da retina'),
      t('services.benefits.diseaseFollowup', 'Acompanhamento de doenças oculares'),
      t('services.benefits.diabeticRetinaMonitoring', 'Monitoramento de retinopatia diabética'),
      t('services.benefits.maculatLesionDetection', 'Detecção de lesões maculares'),
      t('services.benefits.temporalComparison', 'Comparação da evolução temporal')
    ],
    duration: t('services.duration.retinography', '10-15 minutos'),
    preparation: t('services.preparation.retinography', 'Pode ser necessária dilatação pupilar'),
    included: [
      t('services.included.highResPhotos', 'Fotografias digitais de alta resolução'),
      t('services.included.posteriorPole', 'Imagens do pólo posterior'),
      t('services.included.colorDocumentation', 'Documentação colorida'),
      t('services.included.digitalArchive', 'Arquivo digital permanente'),
      t('services.included.previousComparison', 'Comparação com exames anteriores'),
      t('services.included.photoReport', 'Relatório fotográfico')
    ]
  },
  'campo-visual': {
    id: 'campo-visual',
    title: t('services.items.visualField.title'),
    description: t('services.items.visualField.description'),
    fullDescription: t('services.items.visualField.fullDescription'),
    benefits: [
      t('services.benefits.earlyGlaucomaDiagnosis', 'Diagnóstico precoce de glaucoma'),
      t('services.benefits.opticNeuropathyEval', 'Avaliação de neuropatias ópticas'),
      t('services.benefits.progressionMonitoring', 'Monitoramento da progressão'),
      t('services.benefits.scotomaDetection', 'Detecção de escotomas'),
      t('services.benefits.reliableProtocol', 'Protocolo automatizado confiável')
    ],
    duration: t('services.duration.visualField', '20-30 minutos por olho'),
    preparation: t('services.preparation.visualField', 'Use seus óculos habituais e evite cansaço visual antes do exame'),
    included: [
      t('services.included.computerizedField', 'Campo visual computadorizado bilateral'),
      t('services.included.sitaProtocol', 'Protocolo SITA Standard ou Fast'),
      t('services.included.progressionAnalysis', 'Análise de progressão quando disponível'),
      t('services.included.reliabilityIndexes', 'Índices de confiabilidade'),
      t('services.included.specializedInterpretation', 'Interpretação especializada'),
      t('services.included.resultGuidance', 'Orientações sobre resultados')
    ]
  }
});

// Animation configuration constants
export const ANIMATION_CONFIG = {
  FADE_IN: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  FADE_IN_DELAYED: (delay = 0.2) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay }
  }),
  SLIDE_IN_RIGHT: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5 }
  },
  SLIDE_IN_RIGHT_DELAYED: (delay = 0.3) => ({
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, delay }
  })
};

// CSS class constants for better maintainability
export const STYLES = {
  CONTAINER: "container mx-auto px-4 sm:px-6",
  MAX_WIDTH: "max-w-4xl mx-auto",
  CARD: "bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-soft-light",
  CARD_SIDEBAR: "bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft-light",
  HEADING_XL: "text-xl sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-4",
  HEADING_LG: "text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4",
  BUTTON_PRIMARY: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm sm:text-base",
  GRID_RESPONSIVE: "grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8",
  SPACE_Y_RESPONSIVE: "space-y-4 sm:space-y-6 lg:space-y-8",
  SPACE_Y_SIDEBAR: "space-y-4 sm:space-y-6"
};