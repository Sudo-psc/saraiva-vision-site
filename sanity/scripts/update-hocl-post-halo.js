#!/usr/bin/env node

/**
 * Script para ATUALIZAR artigo "Ácido hipocloroso (HOCl) na oftalmologia" com efeito HALO
 *
 * Este script atualiza o artigo existente no Sanity CMS com:
 * - Frase de autoridade no início
 * - Subtítulo contextualizado
 * - HALO de clínica avançada em pontos estratégicos
 * - Caso clínico mais "cinematográfico"
 * - CTA mais forte com prova social
 * - Subtítulos mais conversacionais
 * - Link interno para outros conteúdos
 *
 * Data: 2026-01-26
 * Autor: Dr. Philipe Saraiva Cruz
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
    projectId: '92ocrdmp',
    dataset: 'production',
    apiVersion: '2025-01-01',
    token: process.env.SANITY_TOKEN,
    useCdn: false
})

// Gerar key única
function generateKey() {
    return Math.random().toString(36).substring(2, 15)
}

// Criar bloco de texto com estilo
function createBlock(text, style = 'normal', marks = []) {
    return {
        _type: 'block',
        _key: generateKey(),
        style: style,
        children: [
            {
                _type: 'span',
                _key: generateKey(),
                text: text,
                marks: marks
            }
        ]
    }
}

// Criar bloco com múltiplos spans (para texto com formatação mista)
function createMixedBlock(children, style = 'normal', listItem = null) {
    const block = {
        _type: 'block',
        _key: generateKey(),
        style: style,
        children: children.map(child => ({
            _type: 'span',
            _key: generateKey(),
            text: child.text,
            marks: child.marks || []
        }))
    }
    if (listItem) {
        block.listItem = listItem
    }
    return block
}

// Criar item de lista
function createListItem(text, listType = 'bullet', marks = []) {
    return {
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        listItem: listType,
        children: [
            {
                _type: 'span',
                _key: generateKey(),
                text: text,
                marks: marks
            }
        ]
    }
}

// Criar bloco de citação
function createBlockquote(text) {
    return {
        _type: 'block',
        _key: generateKey(),
        style: 'blockquote',
        children: [
            {
                _type: 'span',
                _key: generateKey(),
                text: text,
                marks: []
            }
        ]
    }
}

// Conteúdo do artigo ATUALIZADO com efeito HALO em formato Portable Text
function createArticleContent() {
    const blocks = []

    // ==================== INTRODUÇÃO COM HALO ====================
    blocks.push(createMixedBlock([
        { text: 'O ácido hipocloroso (HOCl) vem ganhando espaço na oftalmologia como um aliado na saúde da superfície ocular — especialmente em rotinas de ' },
        { text: 'higiene palpebral', marks: ['strong'] },
        { text: ' para blefarite, disfunção das glândulas de Meibômio e sintomas associados ao olho seco.' }
    ]))

    // HALO: Frase de autoridade logo após o primeiro parágrafo
    blocks.push(createMixedBlock([
        { text: 'A Clínica Saraiva Vision é referência regional em olho seco e blefarite, com foco em diagnóstico detalhado e protocolos atualizados de tratamento.', marks: ['strong'] }
    ]))

    // HALO: Subtítulo contextualizado
    blocks.push(createMixedBlock([
        { text: 'Como o ácido hipocloroso entrou na rotina moderna de cuidado com as pálpebras em uma clínica especializada em olho seco em Caratinga‑MG.', marks: ['em'] }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Na ' },
        { text: 'Clínica Saraiva Vision', marks: ['strong'] },
        { text: ', em Caratinga-MG, o Dr. ' },
        { text: 'Philipe Saraiva Cruz (CRM-MG 69.870)', marks: ['strong'] },
        { text: ' orienta o uso dessas estratégias dentro de um plano individualizado, considerando sinais, sintomas, exames e hábitos do dia a dia do paciente (como trabalho em tela, poeira, vento e exposição solar).' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Um dado que ajuda a entender por que esse tema importa: ' },
        { text: 'doença do olho seco', marks: ['strong'] },
        { text: ' é comum no mundo — estimativas globais apontam prevalência em torno de ' },
        { text: '11,59%', marks: ['strong'] },
        { text: ', variando conforme critérios diagnósticos e população estudada.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'E quando falamos de blefarite, ela é uma das queixas mais frequentes no consultório: há trabalhos citando que pode afetar ' },
        { text: 'até 47%', marks: ['strong'] },
        { text: ' dos pacientes atendidos na prática clínica, o que reforça a relevância de medidas simples e consistentes de cuidado com as pálpebras.' }
    ]))

    blocks.push(createBlockquote('"O que você faz todos os dias pesa mais do que o que você faz de vez em quando." — uma boa forma de lembrar que higiene palpebral é rotina, não "tratamento-relâmpago".'))

    // ==================== SEÇÃO: O QUE É HOCL ====================
    blocks.push(createBlock('O que é HOCl (ácido hipocloroso) e por que ele entrou na oftalmologia?', 'h2'))

    blocks.push(createBlock('O que é ácido hipocloroso (HOCl)?', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'O HOCl é um agente com ação antimicrobiana usado em formulações específicas para a região ocular (por exemplo, soluções para higiene palpebral, sprays/atomização e, em alguns estudos, colírios adjuvantes), com concentrações frequentemente estudadas em torno de ' },
        { text: '0,01%', marks: ['strong'] },
        { text: '.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Na prática, ele não "substitui" o diagnóstico nem resolve sozinho todas as causas de desconforto ocular, mas pode compor uma estratégia de controle de ' },
        { text: 'carga microbiana', marks: ['strong'] },
        { text: ', cuidado da borda palpebral e manutenção de rotina em quadros crônicos.' }
    ]))

    blocks.push(createBlock('Por que é importante conhecer?', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'Porque muita gente trata "olho seco" apenas com colírio lubrificante e, ainda assim, continua com ardor, sensação de areia, vermelhidão e visão flutuante — quando a origem do problema pode estar na ' },
        { text: 'pálpebra', marks: ['strong'] },
        { text: ' (blefarite/DGM), onde a higiene é parte central do controle.' }
    ]))

    blocks.push(createBlock('Além disso, antissépticos têm sido discutidos na oftalmologia pelo potencial de ampla ação e por não dependerem do mesmo mecanismo de antibióticos tradicionais, em um cenário em que resistência antimicrobiana preocupa diferentes áreas da medicina.'))

    blocks.push(createBlock('Dados epidemiológicos relevantes', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'Olho seco:', marks: ['strong'] },
        { text: ' estimativas globais em torno de 11,59%, variando conforme definição/critério (sinais, sintomas, critérios TFOS etc.).' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Blefarite no consultório:', marks: ['strong'] },
        { text: ' pode afetar até 47% dos pacientes vistos em prática clínica, reforçando o valor de orientação e rotina de cuidado.' }
    ], 'normal', 'bullet'))

    // HALO: Observação da prática da clínica
    blocks.push(createBlock('Na prática da Saraiva Vision, esse cenário se reflete no grande número de pacientes com queixa de ardor, sensação de areia e blefarite crônica, o que reforça a importância de protocolos estruturados de higiene palpebral.'))

    // ==================== SEÇÃO: CAUSAS E FATORES DE RISCO ====================
    blocks.push(createBlock('Causas e fatores de risco: por que blefarite, DGM e Demodex aparecem tanto?', 'h2'))

    blocks.push(createBlock('Causas principais (as mais comuns no dia a dia)', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'Acúmulo de oleosidade e detritos na borda palpebral', marks: ['strong'] },
        { text: ', favorecendo inflamação e desequilíbrio local.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Disfunção das glândulas de Meibômio (DGM)', marks: ['strong'] },
        { text: ', alterando a camada lipídica da lágrima e aumentando evaporação.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Proliferação de microrganismos da própria pele', marks: ['strong'] },
        { text: ' (bactérias) e, em alguns casos, ' },
        { text: 'ácaros Demodex', marks: ['strong'] },
        { text: ', associados a blefarite e irritação crônica.' }
    ], 'normal', 'bullet'))

    blocks.push(createBlock('Fatores de risco (quem tem mais chance de sofrer com isso)', 'h3'))

    blocks.push(createBlock('Quem convive com blefarite/olho seco geralmente tem uma combinação de fatores: idade, pele oleosa/dermatite seborreica, rosácea, alergias, uso de maquiagem (principalmente se dormir maquiada), além de ambientes com ar condicionado, vento, poeira e redução do piscar (telas).'))

    blocks.push(createBlock('Doenças e hábitos podem se somar: blefarite pode coexistir com olho seco e piorar a estabilidade do filme lacrimal, exigindo abordagem combinada (rotina + lubrificação + controle de inflamação quando indicado).'))

    blocks.push(createBlock('Grupos mais afetados', 'h3'))

    blocks.push(createBlock('Em termos práticos, adultos e idosos aparecem com frequência no consultório, mas jovens também podem sofrer, especialmente com uso intenso de telas e cosméticos, além de quadros associados à dermatite seborreica/rosácea.'))

    // ==================== SEÇÃO: SINTOMAS E DIAGNÓSTICO ====================
    blocks.push(createBlock('Sintomas e diagnóstico: quando suspeitar e como confirmar', 'h2'))

    blocks.push(createBlock('Sinais de alerta', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'Procure avaliação oftalmológica com prioridade se houver:', marks: ['strong'] }
    ]))

    blocks.push(createListItem('Dor ocular moderada a intensa, fotofobia importante ou piora rápida da visão', 'bullet'))
    blocks.push(createListItem('Sensação de "arranhão" persistente, secreção significativa, ou suspeita de lesão corneana', 'bullet'))
    blocks.push(createListItem('Terçol/calázio de repetição, crostas nos cílios e irritação recorrente apesar de colírios comuns', 'bullet'))

    blocks.push(createBlock('Quando procurar ajuda (e não esperar "passar sozinho")', 'h3'))

    blocks.push(createBlock('Se os sintomas duram semanas, vão e voltam, ou pioram em períodos específicos (frio/vento, poeira, ar condicionado, alergias), vale investigar blefarite/DGM e não apenas "olho seco".'))

    blocks.push(createBlock('Blefarite é frequentemente crônica: melhora com rotina, mas tende a recidivar quando o cuidado é interrompido — por isso a orientação e o acompanhamento fazem diferença.'))

    blocks.push(createBlock('Exames diagnósticos (o que a Clínica Saraiva Vision pode avaliar)', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'O diagnóstico é clínico, com exame em ' },
        { text: 'lâmpada de fenda', marks: ['strong'] },
        { text: ' e avaliação da borda palpebral, qualidade do meibum e sinais de superfície ocular; conforme a necessidade, podem ser usados recursos de imagem e testes do filme lacrimal (por exemplo, análise de estabilidade da lágrima, meibografia e coloração da superfície).' }
    ]))

    // HALO: Parque tecnológico da clínica de forma sutil
    blocks.push(createMixedBlock([
        { text: 'Na Saraiva Vision, exames como ' },
        { text: 'meibografia', marks: ['strong'] },
        { text: ', ' },
        { text: 'análise da estabilidade do filme lacrimal', marks: ['strong'] },
        { text: ' e avaliação em ' },
        { text: 'lâmpada de fenda de alta resolução', marks: ['strong'] },
        { text: ' permitem individualizar o uso de HOCl dentro de um plano global de tratamento do olho seco.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Em estudos clínicos, instrumentos como ' },
        { text: 'Keratograph', marks: ['strong'] },
        { text: ' (para medidas como NIK-BUT, meibografia e hiperemia) aparecem como ferramentas úteis de acompanhamento; na prática, essa linha de avaliação ajuda a direcionar tratamento e monitorar evolução.' }
    ]))

    // ==================== SEÇÃO: TRATAMENTO E PREVENÇÃO ====================
    blocks.push(createBlock('Tratamento e prevenção: onde o HOCl entra (e onde ele não entra)', 'h2'))

    blocks.push(createBlock('Opções terapêuticas (visão geral)', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'O tratamento costuma combinar: ' },
        { text: 'higiene palpebral', marks: ['strong'] },
        { text: ', ' },
        { text: 'compressas mornas', marks: ['strong'] },
        { text: ', massagem/expressão palpebral quando indicada, lubrificantes e, em casos selecionados, medicamentos (antibióticos tópicos/orais, anti-inflamatórios) — sempre com avaliação médica para evitar uso inadequado.' }
    ]))

    blocks.push(createBlock('O HOCl aparece como uma alternativa/adição dentro do pilar "higiene palpebral", com estudos mostrando benefícios em parâmetros clínicos e redução de carga bacteriana na borda palpebral.'))

    // HALO: Subtítulo mais conversacional
    blocks.push(createBlock('Evidências do HOCl em blefarite: por que ele pode deixar a pálpebra "mais limpa" e confortável', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'Um estudo randomizado com blefarite associada a olho seco leve a moderado comparou ' },
        { text: 'solução de HOCl 0,01%', marks: ['strong'] },
        { text: ' aplicada com compressas/lenços versus lenços de ácido hialurônico por 4 semanas, observando melhora de estabilidade do filme lacrimal e redução de sintomas, além de ' },
        { text: 'redução mais pronunciada da carga bacteriana', marks: ['strong'] },
        { text: ' no grupo HOCl.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Outro ensaio clínico randomizado avaliou ' },
        { text: 'HOCl 0,01% por atomização ultrassônica', marks: ['strong'] },
        { text: ' versus limpeza palpebral convencional por 2 semanas em blefarite, com melhora significativa de sintomas (OSDI) e sinais palpebrais no grupo HOCl, sem eventos adversos relatados no estudo.' }
    ]))

    blocks.push(createBlock('Evidências do HOCl como adjuvante em ceratite fúngica (uso mais "especializado")', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'Em um ensaio clínico randomizado com ' },
        { text: '96 pacientes', marks: ['strong'] },
        { text: ' com ceratite fúngica, a adição de colírio de ' },
        { text: 'HOCl 0,01%', marks: ['strong'] },
        { text: ' ao tratamento convencional esteve associada a ' },
        { text: 'cicatrização mais rápida', marks: ['strong'] },
        { text: ', sem aumento de complicações relevantes, sugerindo possível papel adjuvante sob supervisão oftalmológica.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Importante:', marks: ['strong'] },
        { text: ' isso ' },
        { text: 'não', marks: ['strong'] },
        { text: ' significa automedicação para "infecção na córnea". Ceratite é urgência e exige acompanhamento de perto, com terapia específica e monitoramento.' }
    ]))

    blocks.push(createBlock('Tecnologias e abordagem na Clínica Saraiva Vision', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'O diferencial costuma estar em unir ' },
        { text: 'orientação prática', marks: ['strong'] },
        { text: ', revisão de hábitos, exame detalhado de pálpebras/superfície ocular e acompanhamento com métricas (por exemplo, estabilidade do filme lacrimal e avaliação de glândulas), para escolher o que faz sentido: higiene com HOCl, ajustes de rotina, lubrificação, controle inflamatório e tratamento de comorbidades.' }
    ]))

    blocks.push(createBlock('Quando necessário, também é possível discutir estratégias complementares e investigar fatores associados (rosácea, alergias, uso de maquiagem, telas), porque tratar só "o olho" sem tratar "a pálpebra e o contexto" costuma frustrar.'))

    // HALO: Gatilho de sofisticação
    blocks.push(createBlock('Esse tipo de abordagem integrada é o que diferencia centros especializados em olho seco, e é o modelo que aplicamos na Saraiva Vision em Caratinga‑MG.'))

    // HALO: Subtítulos mais conversacionais nas medidas preventivas
    blocks.push(createBlock('Medidas preventivas (passo a passo em casa)', 'h3'))

    blocks.push(createMixedBlock([
        { text: '1. Compressa morna: 5–10 minutos para "destravar" as glândulas', marks: ['strong'] },
        { text: ' (conforme orientação), para ajudar a fluidificar secreções das glândulas.' }
    ], 'normal', 'number'))

    blocks.push(createMixedBlock([
        { text: '2. Higiene palpebral diária: limpando a borda dos cílios sem machucar', marks: ['strong'] },
        { text: ' com produto adequado (orientado pelo oftalmologista), evitando esfregar com força.' }
    ], 'normal', 'number'))

    blocks.push(createMixedBlock([
        { text: '3. Remover maquiagem completamente', marks: ['strong'] },
        { text: ' antes de dormir e evitar produtos vencidos/irritantes na linha d\'água.' }
    ], 'normal', 'number'))

    blocks.push(createMixedBlock([
        { text: '4. Pausas em telas', marks: ['strong'] },
        { text: ' e atenção ao piscar (muita gente reduz o piscar sem perceber).' }
    ], 'normal', 'number'))

    blocks.push(createMixedBlock([
        { text: '5. Lubrificante ocular', marks: ['strong'] },
        { text: ' quando indicado, preferindo opções sem conservantes em usos frequentes.' }
    ], 'normal', 'number'))

    // ==================== SEÇÃO: VIDA PRÁTICA EM CARATINGA ====================
    // HALO: Subtítulo mais conversacional
    blocks.push(createBlock('Vida prática em Caratinga: como adaptar a rotina em meio a vento, poeira e ar condicionado', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'Em Caratinga e região, é comum o paciente relatar piora em dias de ' },
        { text: 'vento e poeira', marks: ['strong'] },
        { text: ', deslocamentos frequentes e, para quem trabalha no comércio/atendimento, longos períodos de ' },
        { text: 'ar condicionado', marks: ['strong'] },
        { text: ' e ' },
        { text: 'tela', marks: ['strong'] },
        { text: ' (celular/PC) — combinação clássica para instabilidade do filme lacrimal e sintomas de superfície ocular.' }
    ]))

    // HALO: SEO local
    blocks.push(createBlock('Na prática clínica diária em Caratinga‑MG, vemos muitos casos em que "meu olho arde mais no fim do dia, mas de manhã acordo com cílios grudados e casquinhas". Esse padrão pode apontar para blefarite/DGM associada, em que a higiene palpebral estruturada (com ou sem HOCl) costuma ser parte do controle.'))

    blocks.push(createMixedBlock([
        { text: 'Recursos disponíveis na região:', marks: ['strong'] },
        { text: ' o mais valioso é ter um plano simples, viável e acompanhado — com reavaliações para ajustar frequência de higiene, tipo de produto e necessidade de terapias adicionais, evitando tanto excesso quanto falta de tratamento.' }
    ]))

    // ==================== SEÇÃO: CASO EXEMPLO ====================
    blocks.push(createBlock('Caso exemplo (sem identificação): quando "colírio para olho seco" não era suficiente', 'h2'))

    blocks.push(createBlock('Uma paciente adulta, com rotina intensa de celular e maquiagem diária, buscou atendimento por ardor, vermelhidão e visão flutuante. Já usava lubrificante "quando lembrava", mas sentia piora constante e terçóis recorrentes.'))

    blocks.push(createBlock('Na avaliação, havia sinais de blefarite e disfunção meibomiana, com recomendação de rotina: compressa morna, higiene palpebral diária (com opção de solução com HOCl), ajustes de hábitos (remoção rigorosa da maquiagem, pausas em tela) e acompanhamento para calibrar frequência e resposta.'))

    // HALO: Plano estruturado em etapas
    blocks.push(createBlock('O plano foi estruturado em etapas claras: primeiro controle da inflamação de borda palpebral, depois ajuste fino da rotina de higiene (incluindo HOCl), e, por fim, acompanhamento com reavaliação em consultório.'))

    blocks.push(createMixedBlock([
        { text: 'Em semanas, o objetivo foi reduzir recaídas e melhorar conforto — sem prometer "cura", porque blefarite é crônica e o foco é ' },
        { text: 'controle sustentado', marks: ['strong'] },
        { text: ' e prevenção de crises.' }
    ]))

    // ==================== SEÇÃO: CURIOSIDADE MÉDICA ====================
    blocks.push(createBlock('Curiosidade médica: por que o HOCl costuma ser bem tolerado?', 'h2'))

    blocks.push(createBlock('Uma curiosidade interessante é que o HOCl é discutido como agente antimicrobiano de amplo espectro e tem sido formulado para uso em área periocular/ocular em baixas concentrações (como 0,01%), com estudos clínicos relatando boa tolerabilidade em protocolos de higiene e atomização.'))

    blocks.push(createBlock('Na prática, tolerabilidade não é "igual para todo mundo": ardor, sensibilidade e associação com outras medicações variam, por isso a orientação individual é importante.'))

    // ==================== CONCLUSÃO ====================
    blocks.push(createBlock('Conclusão', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'O ácido hipocloroso (HOCl) não é "moda": ele entra como ferramenta de ' },
        { text: 'higiene palpebral', marks: ['strong'] },
        { text: ' e, em cenários específicos, como adjuvante sob supervisão, com evidências clínicas apontando melhora de sintomas e redução de carga microbiana em blefarite, além de estudos em outras condições selecionadas.' }
    ]))

    // HALO: Link interno estratégico antes do CTA
    blocks.push(createBlock('Se você já recebeu diagnóstico de olho seco ou blefarite e quer entender outras opções de tratamento, como luz pulsada (IRPL) ou máscaras térmicas, veja também nossos conteúdos sobre olho seco e luz pulsada na Saraiva Vision.'))

    // HALO: CTA mais forte com prova social
    blocks.push(createMixedBlock([
        { text: 'Se você é de Caratinga‑MG ou região e convive com ardor, sensação de areia, cílios com "casquinhas" ou terçol de repetição, na ' },
        { text: 'Saraiva Vision', marks: ['strong'] },
        { text: ' nós avaliamos não só o "olho seco", mas todo o contexto da borda palpebral, hábitos e ambiente. Para avaliação com o ' },
        { text: 'Dr. Philipe Saraiva Cruz (CRM‑MG 69.870)', marks: ['strong'] },
        { text: ', entre em contato pelo WhatsApp ' },
        { text: '(33) 99860‑1427', marks: ['strong'] },
        { text: ' e converse com uma clínica focada em olho seco e blefarite.' }
    ]))

    // ==================== REFERÊNCIAS ====================
    blocks.push(createBlock('Referências (fontes confiáveis)', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'BMJ Open Ophthalmology. ' },
        { text: 'Hypochlorous acid hygiene solution in patients affected by blepharitis: a prospective randomised study.', marks: ['strong'] },
        { text: ' 2023.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'J Clin Med. ' },
        { text: 'Effect of Hypochlorous Acid on Blepharitis through Ultrasonic Atomization: A Randomized Clinical Trial.', marks: ['strong'] },
        { text: ' 2023.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Current Eye Research. ' },
        { text: 'Evaluation of 0.01% Hypochlorous Acid Eye Drops Combined with Conventional Treatment in Fungal Corneal Ulcers: RCT.', marks: ['strong'] },
        { text: ' 2023.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Tear Film & Ocular Surface Society / Ophthalmic Physiol Opt. ' },
        { text: 'The global prevalence of dry eye disease: A Bayesian view.', marks: ['strong'] },
        { text: ' 2021.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'SBOP (Sociedade Brasileira de Oftalmologia Pediátrica). ' },
        { text: 'Blefarite – Área do Paciente.', marks: ['strong'] },
        { text: ' 2024.' }
    ], 'normal', 'bullet'))

    return blocks
}

async function findExistingPost() {
    console.log('🔍 Buscando post existente sobre HOCl...')

    const existingPost = await client.fetch(
        `*[_type == "blogPost" && slug.current == "acido-hipocloroso-oftalmologia-caratinga"][0]{ _id, title, _rev }`
    )

    if (existingPost) {
        console.log(`✅ Post encontrado: ${existingPost.title}`)
        console.log(`   ID: ${existingPost._id}`)
        return existingPost
    }

    return null
}

async function updateArticle() {
    console.log('═'.repeat(60))
    console.log('📰 Atualizando artigo: Ácido hipocloroso (HOCl) - EFEITO HALO')
    console.log('═'.repeat(60))
    console.log('')

    try {
        const existingPost = await findExistingPost()

        if (!existingPost) {
            console.log('\n❌ Post não encontrado. Execute primeiro o script de publicação original.')
            return
        }

        console.log('\n📝 Aplicando atualizações HALO...')

        const result = await client
            .patch(existingPost._id)
            .set({
                content: createArticleContent(),
                // Atualizar o excerpt para refletir o HALO
                excerpt: 'Entenda o HOCl (ácido hipocloroso) na higiene palpebral, blefarite, olho seco e Demodex. A Clínica Saraiva Vision é referência regional em olho seco em Caratinga-MG.'
            })
            .commit()

        console.log('')
        console.log('═'.repeat(60))
        console.log('✅ ARTIGO ATUALIZADO COM SUCESSO!')
        console.log('═'.repeat(60))
        console.log('')
        console.log('📋 Mudanças aplicadas (EFEITO HALO):')
        console.log('   ✓ Frase de autoridade após primeiro parágrafo')
        console.log('   ✓ Subtítulo contextualizado com clínica especializada')
        console.log('   ✓ Observação da prática da Saraiva Vision nos dados epidemiológicos')
        console.log('   ✓ Parque tecnológico da clínica nos exames diagnósticos')
        console.log('   ✓ Subtítulo de evidências mais conversacional')
        console.log('   ✓ Gatilho de sofisticação na seção de tecnologias')
        console.log('   ✓ Medidas preventivas com linguagem mais conversacional')
        console.log('   ✓ Subtítulo "Vida prática em Caratinga" mais descritivo')
        console.log('   ✓ Caso clínico com plano estruturado em etapas')
        console.log('   ✓ Link interno para outros conteúdos (olho seco, luz pulsada)')
        console.log('   ✓ CTA final mais forte com prova social')
        console.log('')
        console.log('🔗 Links:')
        console.log(`   Sanity Studio: https://saraivavision.sanity.studio/desk/blogPost;${existingPost._id}`)
        console.log(`   Blog: https://saraivavision.com.br/blog/acido-hipocloroso-oftalmologia-caratinga`)
        console.log('')
        console.log('📸 Lembre-se de adicionar as imagens sugeridas:')
        console.log('   • Capa: Ilustração médica limpa de olho com névoa de HOCl')
        console.log('   • Interna 1: Antes/depois blefarite (side-by-side)')
        console.log('   • Interna 2: Uso prático do HOCl em ambiente doméstico')
        console.log('   • Interna 3: Cena de exame de superfície ocular')
        console.log('')

    } catch (error) {
        console.error('\n❌ Erro ao atualizar artigo:', error.message)
        if (error.details) {
            console.error('Detalhes:', JSON.stringify(error.details, null, 2))
        }
        process.exit(1)
    }
}

updateArticle()
