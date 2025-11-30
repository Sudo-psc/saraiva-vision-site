import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import SEOHead from '@/components/SEOHead';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Clock, CheckCircle, Star, Calendar, Eye, Droplets, AlertCircle, ExternalLink, Phone, MessageSquare, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { clinicInfo } from '@/lib/clinicInfo';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

const MeibografiaPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const seo = {
        title: 'Meibografia - Exame Avançado para Diagnóstico de Olho Seco | Saraiva Vision',
        description: 'Meibografia é um exame não invasivo que visualiza as glândulas de Meibômio em alta definição, permitindo diagnóstico preciso de olho seco evaporativo e disfunção das glândulas de Meibômio em Caratinga-MG.',
        keywords: 'meibografia, olho seco, glândulas de Meibômio, DGM, diagnóstico olho seco, exame oftalmológico, Caratinga MG, oftalmologia avançada',
    };

    const benefits = [
        'Diagnóstico preciso da disfunção das glândulas de Meibômio (DGM)',
        'Exame não invasivo, rápido e indolor',
        'Visualização em alta definição das glândulas',
        'Identificação precoce de alterações glandulares',
        'Planejamento de tratamento personalizado para olho seco',
        'Monitoramento da evolução e resposta ao tratamento',
        'Diferenciação entre olho seco aquoso e evaporativo'
    ];

    const included = [
        'Avaliação clínica das pálpebras',
        'Captura de imagens por infravermelho',
        'Análise das glândulas de Meibômio superior e inferior',
        'Classificação do grau de atrofia glandular',
        'Documentação fotográfica digital',
        'Relatório técnico detalhado',
        'Orientações sobre tratamento indicado'
    ];

    const faqs = [
        {
            question: "O que é meibografia e para que serve?",
            answer: "Meibografia é um exame oftalmológico de imagem que utiliza luz infravermelha para visualizar as glândulas de Meibômio localizadas nas pálpebras. Estas glândulas produzem a camada lipídica da lágrima, essencial para prevenir evaporação. O exame permite diagnosticar a Disfunção das Glândulas de Meibômio (DGM), principal causa de olho seco evaporativo (70% dos casos)."
        },
        {
            question: "Como é realizado o exame de meibografia?",
            answer: "O exame é extremamente simples e confortável. O paciente posiciona o rosto em um aparelho semelhante ao usado para medir o grau dos óculos. Uma câmera especializada captura imagens por infravermelho das pálpebras superior e inferior, revelando a estrutura interna das glândulas. Não há necessidade de anestesia, dilatação pupilar ou contato direto com os olhos. O procedimento leva aproximadamente 10-15 minutos."
        },
        {
            question: "Quem deve fazer meibografia?",
            answer: "O exame é indicado para pacientes com sintomas de olho seco (ardência, sensação de areia, vermelhidão, lacrimejamento paradoxal), usuários de lentes de contato com desconforto, pessoas que passam muito tempo em telas, portadores de blefarite crônica, candidatos à cirurgia refrativa ou de catarata, e para monitoramento de tratamentos para olho seco."
        },
        {
            question: "O que o exame detecta?",
            answer: "A meibografia permite visualizar: número de glândulas funcionantes, presença de obstruções nos ductos glandulares, atrofia ou perda de glândulas (dropout), distorções na estrutura glandular, encurtamento das glândulas, e o grau de comprometimento percentual. Estas informações são cruciais para planejar o tratamento mais adequado."
        },
        {
            question: "O exame de meibografia dói ou tem riscos?",
            answer: "Não, a meibografia é completamente indolor e não oferece riscos. É um exame de imagem não invasivo, sem contato direto com os olhos. Não utiliza radiação ionizante (raio-X), apenas luz infravermelha segura. Pode ser repetido quantas vezes necessário para acompanhamento sem qualquer prejuízo à saúde ocular."
        },
        {
            question: "Preciso de algum preparo para fazer meibografia?",
            answer: "Não é necessário jejum ou preparação especial. Recomenda-se apenas: suspender uso de lentes de contato no dia do exame, não aplicar maquiagem nos olhos, evitar usar colírios nas 2 horas antes do exame (exceto se orientado diferentemente), e trazer exames oftalmológicos anteriores se disponíveis."
        },
        {
            question: "Qual a diferença entre meibografia e outros exames de olho seco?",
            answer: "A meibografia visualiza diretamente a estrutura das glândulas de Meibômio, algo impossível no exame clínico convencional. Outros testes (Schirmer, BUT, colorações) avaliam consequências da DGM, enquanto a meibografia mostra a causa estrutural. É como comparar medir a febre (sintoma) com fazer um raio-X para ver a infecção (causa). A meibografia é o padrão-ouro para diagnóstico de DGM."
        },
        {
            question: "Quanto custa o exame de meibografia?",
            answer: "Os valores variam conforme convênio ou particular. Entre em contato conosco para informações atualizadas sobre valores, convênios aceitos e possíveis promoções. Investir no diagnóstico preciso pode economizar em tratamentos desnecessários e evitar progressão da doença."
        },
        {
            question: "Como é o tratamento após o diagnóstico?",
            answer: "O tratamento é personalizado conforme o resultado: casos leves podem responder a compressas quentes, higiene palpebral e lubrificação; casos moderados podem necessitar de ômega-3, colírios anti-inflamatórios ou doxiciclina oral; casos graves podem requerer terapias como LipiFlow, luz pulsada intensa (IPL) ou procedimentos específicos para desobstrução glandular."
        }
    ];

    const relatedServices = [
        { id: 'consultas-oftalmologicas', title: 'Consultas Oftalmológicas Completas' },
        { id: 'tratamentos-especializados', title: 'Tratamento de Olho Seco' },
        { id: 'retinografia', title: 'Retinografia Digital' }
    ];

    const references = [
        "Arita R, et al. Noncontact infrared meibography to document age-related changes of the meibomian glands in a normal population. Ophthalmology. 2008;115(5):911-915.",
        "Tear Film & Ocular Surface Society (TFOS). International Workshop on Meibomian Gland Dysfunction Report. Investigative Ophthalmology & Visual Science. 2011;52(4):1922-1929.",
        "Pult H, Riede-Pult BH, Nichols JJ. Relation between upper and lower lids' meibomian gland morphology, tear film, and dry eye. Optometry and Vision Science. 2012;89(3):E310-E315.",
        "Tomlinson A, et al. The international workshop on meibomian gland dysfunction: report of the diagnosis subcommittee. Investigative Ophthalmology & Visual Science. 2011;52(4):2006-2049.",
        "Sociedade Brasileira de Oftalmologia. Consenso Brasileiro sobre Olho Seco e Disfunção das Glândulas de Meibômio, 2023.",
        "Nichols KK, et al. The International Workshop on Meibomian Gland Dysfunction: Executive Summary. Investigative Ophthalmology & Visual Science. 2011;52(4):1922-1929."
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <SEOHead {...seo} />
            <Navbar />

            <main className="flex-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32 scroll-block-internal mx-[5%] lg:mx-[10%]">
                <div className="container mx-auto px-4 md:px-6 py-12">
                    {/* Breadcrumb e voltar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <button
                            onClick={() => navigate('/servicos')}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4 font-medium group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                            Voltar para Serviços
                        </button>

                        <nav className="text-sm text-slate-500">
                            <span>Serviços</span> / <span>Exames Especializados</span> / <span className="text-slate-900">Meibografia</span>
                        </nav>
                    </motion.div>

                    {/* Header da página */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-12"
                    >
                        <div className="flex items-start gap-6 mb-6">
                            <div className="flex-shrink-0">
                                <ImageWithFallback
                                    src="/img/meibografia icon.png"
                                    alt="Meibografia"
                                    className="w-20 h-20 object-contain"
                                    width="80"
                                    height="80"
                                />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 drop-shadow-sm">
                                    Meibografia
                                </h1>
                                <p className="text-xl text-slate-600 leading-relaxed">
                                    Exame de imagem avançado que visualiza as glândulas de Meibômio em alta definição, permitindo diagnóstico preciso da principal causa de olho seco evaporativo
                                </p>
                            </div>
                        </div>

                        {/* Banner informativo */}
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                            <div className="flex items-start gap-4">
                                <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Por que fazer meibografia?</h3>
                                    <p className="text-slate-700 leading-relaxed">
                                        A <strong>Disfunção das Glândulas de Meibômio (DGM)</strong> é responsável por aproximadamente <strong>70% dos casos de olho seco evaporativo</strong>. Sem a meibografia, essa condição pode passar despercebida no exame clínico convencional, levando a tratamentos inadequados e progressão da doença. A meibografia permite visualizar diretamente a estrutura interna das glândulas, identificando alterações precoces invisíveis a olho nu.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Conteúdo principal */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* O que é a Meibografia */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
                            >
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                                    <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
                                    O que é Meibografia?
                                </h2>
                                <div className="space-y-4 text-slate-700 leading-relaxed">
                                    <p>
                                        A <strong>meibografia</strong> é um exame oftalmológico de imagem não invasivo que utiliza tecnologia de luz infravermelha para visualizar detalhadamente as <strong>glândulas de Meibômio</strong>, estruturas localizadas nas pálpebras superiores e inferiores responsáveis pela produção da camada lipídica (oleosa) da lágrima.
                                    </p>
                                    <p>
                                        Estas glândulas secretam meibum, uma substância oleosa essencial que forma uma barreira protetora sobre a camada aquosa da lágrima, prevenindo sua evaporação rápida. Quando as glândulas de Meibômio estão obstruídas, atrofiadas ou disfuncionais, ocorre a <strong>Disfunção das Glândulas de Meibômio (DGM)</strong>, levando ao olho seco evaporativo.
                                    </p>
                                    <p>
                                        Durante o exame, imagens de alta resolução revelam a morfologia, densidade e integridade das glândulas, permitindo ao oftalmologista identificar:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Dropout glandular</strong> (perda/atrofia de glândulas)</li>
                                        <li><strong>Encurtamento das glândulas</strong> (redução do comprimento funcional)</li>
                                        <li><strong>Distorções estruturais</strong> (dilatações, tortuosidades anormais)</li>
                                        <li><strong>Obstruções dos ductos glandulares</strong></li>
                                        <li><strong>Percentual de área glandular preservada vs. perdida</strong></li>
                                    </ul>
                                </div>
                            </motion.section>

                            {/* Como funciona o exame */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
                            >
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                                    Como Funciona o Exame?
                                </h2>
                                <div className="space-y-4 text-slate-700 leading-relaxed">
                                    <p>
                                        O procedimento de meibografia é extremamente simples, rápido e totalmente indolor:
                                    </p>
                                    <ol className="list-decimal pl-6 space-y-3">
                                        <li>
                                            <strong>Posicionamento:</strong> O paciente é posicionado confortavelmente em frente ao equipamento especializado de imagem, semelhante a um aparelho de auto-refração.
                                        </li>
                                        <li>
                                            <strong>Eversão delicada das pálpebras:</strong> O profissional gentilmente everte (vira) a pálpebra para expor sua face interna onde as glândulas estão localizadas.
                                        </li>
                                        <li>
                                            <strong>Captura de imagens:</strong> Uma câmera com tecnologia de luz infravermelha captura imagens de alta resolução das glândulas, que aparecem como estruturas claras contra um fundo escuro.
                                        </li>
                                        <li>
                                            <strong>Análise bilateral:</strong> O processo é repetido para pálpebras superiores e inferiores de ambos os olhos, fornecendo avaliação completa.
                                        </li>
                                        <li>
                                            <strong>Documentação e interpretação:</strong> As imagens são salvas digitalmente para análise detalhada, comparação futura e documentação da progressão ou melhora.
                                        </li>
                                    </ol>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-blue-900 text-sm">
                                                <strong>Importante:</strong> Não há necessidade de anestesia, dilatação pupilar, ou contato direto com a superfície ocular. O exame não utiliza radiação ionizante (raio-X), apenas luz infravermelha segura.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Benefícios */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
                            >
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                                    <Star className="w-6 h-6 mr-3 text-yellow-500" />
                                    Benefícios da Meibografia
                                </h2>
                                <ul className="space-y-3">
                                    {benefits.map((benefit, index) => (
                                        <li key={index} className="flex items-start">
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                            <span className="text-slate-700">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.section>

                            {/* O que está incluído */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
                            >
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                                    O que está incluído no exame
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {included.map((item, index) => (
                                        <div key={index} className="flex items-start">
                                            <CheckCircle className="w-4 h-4 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                                            <span className="text-slate-700 text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>

                            {/* Indicações clínicas */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
                            >
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                                    <Droplets className="w-6 h-6 mr-3 text-cyan-600" />
                                    Quando a Meibografia é Indicada?
                                </h2>
                                <div className="space-y-3">
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-slate-900 mb-2">Sintomas de Olho Seco</h3>
                                        <p className="text-slate-700 text-sm">
                                            Sensação de areia ou corpo estranho, ardência, queimação, vermelhidão ocular, lacrimejamento paradoxal (olhos que lacrimejam muito), visão embaçada flutuante, cansaço visual, fotofobia (sensibilidade à luz).
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-slate-900 mb-2">Usuários de Lentes de Contato</h3>
                                        <p className="text-slate-700 text-sm">
                                            Desconforto progressivo com lentes de contato, redução do tempo de uso tolerado, sensação de secura ao final do dia, necessidade frequente de reumidificação.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-slate-900 mb-2">Pré-operatório de Cirurgias Oculares</h3>
                                        <p className="text-slate-700 text-sm">
                                            Avaliação antes de cirurgia refrativa (LASIK, PRK), cirurgia de catarata, ou qualquer procedimento onde a superfície ocular precisa estar otimizada para melhor recuperação e resultado.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-slate-900 mb-2">Blefarite Crônica</h3>
                                        <p className="text-slate-700 text-sm">
                                            Inflamação recorrente das pálpebras, crostas matinais, pálpebras vermelhas e inchadas, terçol de repetição (hordéolo/calázio).
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-slate-900 mb-2">Monitoramento de Tratamento</h3>
                                        <p className="text-slate-700 text-sm">
                                            Acompanhamento da resposta ao tratamento para DGM, avaliação da progressão ou estabilização da doença ao longo do tempo.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-slate-900 mb-2">Fatores de Risco</h3>
                                        <p className="text-slate-700 text-sm">
                                            Uso prolongado de telas (computador, celular), ambientes com ar-condicionado, idade acima de 40 anos, sexo feminino (especialmente na menopausa), uso de medicamentos específicos (isotretinoína, anti-histamínicos, antidepressivos).
                                        </p>
                                    </div>
                                </div>
                            </motion.section>

                            {/* FAQs */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 }}
                                className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
                            >
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                                    Perguntas Frequentes
                                </h2>
                                <div className="space-y-4">
                                    {faqs.map((faq, index) => (
                                        <details key={index} className="group bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors">
                                            <summary className="font-semibold text-slate-900 cursor-pointer flex items-start">
                                                <span className="text-blue-600 mr-2 flex-shrink-0">Q:</span>
                                                <span className="flex-1">{faq.question}</span>
                                            </summary>
                                            <div className="mt-3 pl-6 text-slate-700 leading-relaxed">
                                                <span className="text-green-600 font-semibold mr-2">R:</span>
                                                {faq.answer}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </motion.section>

                            {/* Serviços relacionados */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
                            >
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                                    Serviços Relacionados
                                </h2>
                                <div className="space-y-3">
                                    {relatedServices.map((service) => (
                                        <button
                                            key={service.id}
                                            onClick={() => navigate(`/servicos/${service.id}`)}
                                            className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-slate-200 transition-all group"
                                        >
                                            <span className="text-slate-900 font-medium group-hover:text-blue-700">
                                                {service.title}
                                            </span>
                                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                                        </button>
                                    ))}
                                </div>
                            </motion.section>

                            {/* Referências científicas */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.55 }}
                                className="bg-slate-50 rounded-2xl p-6 border border-slate-200"
                            >
                                <h2 className="text-xl font-bold text-slate-900 mb-4">
                                    Referências Científicas
                                </h2>
                                <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-600">
                                    {references.map((ref, index) => (
                                        <li key={index} className="leading-relaxed">{ref}</li>
                                    ))}
                                </ol>
                            </motion.section>
                        </div>

                        {/* Sidebar com informações */}
                        <div className="space-y-6">
                            {/* Duração */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 shadow-sm"
                            >
                                <div className="flex items-center mb-3">
                                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                                    <h3 className="font-semibold text-slate-900">Duração</h3>
                                </div>
                                <p className="text-slate-700">10-15 minutos</p>
                            </motion.div>

                            {/* Preparação */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 shadow-sm"
                            >
                                <h3 className="font-semibold text-slate-900 mb-3">Como se preparar</h3>
                                <ul className="text-slate-700 space-y-2 text-sm">
                                    <li className="flex items-start">
                                        <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>Não usar lentes de contato no dia do exame</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>Evitar maquiagem nos olhos</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>Não aplicar colírios 2h antes</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>Trazer exames anteriores</span>
                                    </li>
                                </ul>
                            </motion.div>

                            {/* CTA para agendamento */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white sticky top-24"
                            >
                                <h3 className="font-bold text-lg mb-3">Agende seu exame</h3>
                                <p className="text-blue-100 mb-4 text-sm">
                                    Faça sua meibografia e obtenha diagnóstico preciso para tratamento efetivo do olho seco.
                                </p>
                                <button
                                    onClick={() => window.open('https://www.saraivavision.com.br/agendamento', '_blank')}
                                    className="w-full bg-white text-blue-600 font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-blue-100 mb-3"
                                >
                                    <span className="flex items-center justify-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Agendar Agora
                                    </span>
                                </button>

                                <div className="border-t border-blue-400 pt-4 mt-4 space-y-3">
                                    <a
                                        href={`https://wa.me/${clinicInfo.phone.whatsapp}?text=Olá! Gostaria de agendar uma meibografia.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-white hover:text-blue-100 text-sm transition-colors"
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        WhatsApp: {clinicInfo.phone.display}
                                    </a>
                                    <a
                                        href={`tel:${clinicInfo.phone.tel}`}
                                        className="flex items-center text-white hover:text-blue-100 text-sm transition-colors"
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        Telefone: {clinicInfo.phone.display}
                                    </a>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            <EnhancedFooter />
        </div>
    );
};

export default MeibografiaPage;
