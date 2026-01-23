#!/usr/bin/env node

/**
 * Script para publicar artigo "Ácido hipocloroso (HOCl) na oftalmologia: para que serve e quando usar em Caratinga-MG?"
 *
 * Este script cria o artigo no Sanity CMS com todos os metadados SEO
 *
 * Data: 2025-12-19
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

// Conteúdo do artigo em formato Portable Text
function createArticleContent() {
    const blocks = []

    // Introdução
    blocks.push(createMixedBlock([
        { text: 'O ácido hipocloroso (HOCl) vem ganhando espaço na oftalmologia como um aliado na saúde da superfície ocular — especialmente em rotinas de ' },
        { text: 'higiene palpebral', marks: ['strong'] },
        { text: ' para blefarite, disfunção das glândulas de Meibômio e sintomas associados ao olho seco.' }
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

    // Seção: O que é HOCl
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

    // Seção: Causas e fatores de risco
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

    // Seção: Sintomas e diagnóstico
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

    blocks.push(createMixedBlock([
        { text: 'Em estudos clínicos, instrumentos como ' },
        { text: 'Keratograph', marks: ['strong'] },
        { text: ' (para medidas como NIK-BUT, meibografia e hiperemia) aparecem como ferramentas úteis de acompanhamento; na prática, essa linha de avaliação ajuda a direcionar tratamento e monitorar evolução.' }
    ]))

    // Seção: Tratamento e prevenção
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

    blocks.push(createBlock('Evidências do HOCl em blefarite e higiene palpebral', 'h3'))

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

    blocks.push(createBlock('Medidas preventivas (passo a passo em casa)', 'h3'))

    blocks.push(createMixedBlock([
        { text: '1. Compressa morna', marks: ['strong'] },
        { text: ' por 5–10 minutos (conforme orientação), para ajudar a fluidificar secreções das glândulas.' }
    ], 'normal', 'number'))

    blocks.push(createMixedBlock([
        { text: '2. Higiene palpebral diária', marks: ['strong'] },
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

    // Seção: Vida prática em Caratinga
    blocks.push(createBlock('Vida prática em Caratinga: como isso aparece no cotidiano (e como adaptar)', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'Em Caratinga e região, é comum o paciente relatar piora em dias de ' },
        { text: 'vento e poeira', marks: ['strong'] },
        { text: ', deslocamentos frequentes e, para quem trabalha no comércio/atendimento, longos períodos de ' },
        { text: 'ar condicionado', marks: ['strong'] },
        { text: ' e ' },
        { text: 'tela', marks: ['strong'] },
        { text: ' (celular/PC) — combinação clássica para instabilidade do filme lacrimal e sintomas de superfície ocular.' }
    ]))

    blocks.push(createBlock('Outro cenário típico: "meu olho arde mais no fim do dia, mas de manhã acordo com cílios grudados e casquinhas". Esse padrão pode apontar para blefarite/DGM associada, em que a higiene palpebral estruturada (com ou sem HOCl) costuma ser parte do controle.'))

    blocks.push(createMixedBlock([
        { text: 'Recursos disponíveis na região:', marks: ['strong'] },
        { text: ' o mais valioso é ter um plano simples, viável e acompanhado — com reavaliações para ajustar frequência de higiene, tipo de produto e necessidade de terapias adicionais, evitando tanto excesso quanto falta de tratamento.' }
    ]))

    // Seção: Caso exemplo
    blocks.push(createBlock('Caso exemplo (sem identificação): quando "colírio para olho seco" não era suficiente', 'h2'))

    blocks.push(createBlock('Uma paciente adulta, com rotina intensa de celular e maquiagem diária, buscou atendimento por ardor, vermelhidão e visão flutuante. Já usava lubrificante "quando lembrava", mas sentia piora constante e terçóis recorrentes.'))

    blocks.push(createBlock('Na avaliação, havia sinais de blefarite e disfunção meibomiana, com recomendação de rotina: compressa morna, higiene palpebral diária (com opção de solução com HOCl), ajustes de hábitos (remoção rigorosa da maquiagem, pausas em tela) e acompanhamento para calibrar frequência e resposta.'))

    blocks.push(createMixedBlock([
        { text: 'Em semanas, o objetivo foi reduzir recaídas e melhorar conforto — sem prometer "cura", porque blefarite é crônica e o foco é ' },
        { text: 'controle sustentado', marks: ['strong'] },
        { text: ' e prevenção de crises.' }
    ]))

    // Seção: Curiosidade médica
    blocks.push(createBlock('Curiosidade médica: por que o HOCl costuma ser bem tolerado?', 'h2'))

    blocks.push(createBlock('Uma curiosidade interessante é que o HOCl é discutido como agente antimicrobiano de amplo espectro e tem sido formulado para uso em área periocular/ocular em baixas concentrações (como 0,01%), com estudos clínicos relatando boa tolerabilidade em protocolos de higiene e atomização.'))

    blocks.push(createBlock('Na prática, tolerabilidade não é "igual para todo mundo": ardor, sensibilidade e associação com outras medicações variam, por isso a orientação individual é importante.'))

    // Conclusão
    blocks.push(createBlock('Conclusão', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'O ácido hipocloroso (HOCl) não é "moda": ele entra como ferramenta de ' },
        { text: 'higiene palpebral', marks: ['strong'] },
        { text: ' e, em cenários específicos, como adjuvante sob supervisão, com evidências clínicas apontando melhora de sintomas e redução de carga microbiana em blefarite, além de estudos em outras condições selecionadas.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Se você é de Caratinga-MG e convive com ardor, sensação de areia, cílios com "casquinhas", terçol repetido ou desconforto que vai e volta, vale investigar a borda palpebral e montar um plano realista de rotina. ' },
        { text: 'Para mais informações ou para agendar sua avaliação', marks: ['strong'] },
        { text: ' com o Dr. Philipe Saraiva Cruz (CRM-MG 69.870), procure a ' },
        { text: 'Clínica Saraiva Vision', marks: ['strong'] },
        { text: ': Telefone/WhatsApp ' },
        { text: '(33) 99860-1427', marks: ['strong'] },
        { text: '.' }
    ]))

    // Referências
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

async function findOrCreateAuthor() {
    console.log('🔍 Buscando autor Dr. Philipe Saraiva Cruz...')

    const existingAuthor = await client.fetch(
        `*[_type == "author" && name match "Philipe*"][0]{ _id, name }`
    )

    if (existingAuthor) {
        console.log(`✅ Autor encontrado: ${existingAuthor.name} (${existingAuthor._id})`)
        return existingAuthor._id
    }

    console.log('📝 Criando novo autor...')
    const author = await client.create({
        _type: 'author',
        name: 'Dr. Philipe Saraiva Cruz',
        slug: { _type: 'slug', current: 'dr-philipe-saraiva-cruz' },
        bio: 'Médico oftalmologista especializado em saúde ocular. CRM-MG 69.870. Líder da equipe da Clínica Saraiva Vision em Caratinga, MG.',
        credentials: 'CRM-MG 69.870 - Oftalmologista'
    })

    console.log(`✅ Autor criado: ${author._id}`)
    return author._id
}

async function findOrCreateCategory() {
    console.log('🔍 Buscando categoria "Olho Seco"...')

    const dryEyeCategory = await client.fetch(
        `*[_type == "category" && slug.current == "olho-seco"][0]{ _id, title }`
    )

    if (dryEyeCategory) {
        console.log(`✅ Categoria encontrada: ${dryEyeCategory.title} (${dryEyeCategory._id})`)
        return dryEyeCategory._id
    }

    const treatmentCategory = await client.fetch(
        `*[_type == "category" && slug.current == "tratamento"][0]{ _id, title }`
    )

    if (treatmentCategory) {
        console.log(`✅ Usando categoria: ${treatmentCategory.title} (${treatmentCategory._id})`)
        return treatmentCategory._id
    }

    const anyCategory = await client.fetch(
        `*[_type == "category"][0]{ _id, title }`
    )

    if (anyCategory) {
        console.log(`✅ Usando categoria: ${anyCategory.title} (${anyCategory._id})`)
        return anyCategory._id
    }

    throw new Error('Nenhuma categoria encontrada no Sanity.')
}

async function getNextPostId() {
    console.log('🔍 Buscando próximo ID disponível...')

    const lastPost = await client.fetch(
        `*[_type == "blogPost"] | order(id desc)[0]{ id }`
    )

    const nextId = lastPost ? lastPost.id + 1 : 1
    console.log(`✅ Próximo ID: ${nextId}`)
    return nextId
}

async function checkExistingPost() {
    console.log('🔍 Verificando se o artigo já existe...')

    const existingPost = await client.fetch(
        `*[_type == "blogPost" && slug.current == "acido-hipocloroso-oftalmologia-caratinga"][0]{ _id, title }`
    )

    if (existingPost) {
        console.log(`⚠️  Artigo já existe: ${existingPost.title} (${existingPost._id})`)
        return existingPost._id
    }

    return null
}

async function publishArticle() {
    console.log('═'.repeat(60))
    console.log('📰 Publicando artigo: Ácido hipocloroso (HOCl) na oftalmologia')
    console.log('═'.repeat(60))
    console.log('')

    try {
        const existingId = await checkExistingPost()
        if (existingId) {
            console.log('\n❌ Publicação cancelada: artigo já existe no Sanity.')
            console.log(`   ID: ${existingId}`)
            return
        }

        const authorId = await findOrCreateAuthor()
        const categoryId = await findOrCreateCategory()
        const postId = await getNextPostId()

        console.log('\n📝 Criando artigo no Sanity...')

        const blogPost = {
            _type: 'blogPost',
            id: postId,
            title: 'Ácido hipocloroso (HOCl) na oftalmologia: para que serve e quando usar?',
            slug: {
                _type: 'slug',
                current: 'acido-hipocloroso-oftalmologia-caratinga'
            },
            excerpt: 'Entenda o HOCl (ácido hipocloroso) na higiene palpebral, blefarite, olho seco e Demodex. Orientações seguras em Caratinga-MG.',
            content: createArticleContent(),
            author: {
                _type: 'reference',
                _ref: authorId
            },
            category: {
                _type: 'reference',
                _ref: categoryId
            },
            tags: [
                'ácido hipocloroso',
                'HOCl',
                'higiene palpebral',
                'blefarite',
                'olho seco',
                'glândulas de Meibômio',
                'Demodex',
                'antisséptico ocular',
                'oftalmologista Caratinga MG',
                'Clínica Saraiva Vision'
            ],
            publishedAt: new Date().toISOString(),
            featured: false,
            seo: {
                metaTitle: 'Ácido hipocloroso na oftalmologia em Caratinga (HOCl)',
                metaDescription: 'Entenda o HOCl (ácido hipocloroso) na higiene palpebral, blefarite, olho seco e Demodex. Orientações seguras em Caratinga-MG.',
                keywords: [
                    'ácido hipocloroso na oftalmologia Caratinga',
                    'HOCl 0,01%',
                    'higiene palpebral',
                    'blefarite',
                    'disfunção das glândulas de Meibômio',
                    'Demodex',
                    'olho seco',
                    'spray palpebral',
                    'colírio adjuvante',
                    'biofilme',
                    'antisséptico ocular',
                    'inflamação da superfície ocular'
                ]
            }
        }

        const result = await client.create(blogPost)

        console.log('')
        console.log('═'.repeat(60))
        console.log('✅ ARTIGO PUBLICADO COM SUCESSO!')
        console.log('═'.repeat(60))
        console.log('')
        console.log('📋 Detalhes:')
        console.log(`   ID Sanity: ${result._id}`)
        console.log(`   ID Post: ${postId}`)
        console.log(`   Título: ${result.title}`)
        console.log(`   Slug: ${result.slug.current}`)
        console.log(`   Data de publicação: ${new Date(result.publishedAt).toLocaleString('pt-BR')}`)
        console.log('')
        console.log('🔗 Links:')
        console.log(`   Sanity Studio: https://saraivavision.sanity.studio/desk/blogPost;${result._id}`)
        console.log(`   Blog: https://saraivavision.com.br/blog/${result.slug.current}`)
        console.log('')

    } catch (error) {
        console.error('\n❌ Erro ao publicar artigo:', error.message)
        if (error.details) {
            console.error('Detalhes:', JSON.stringify(error.details, null, 2))
        }
        process.exit(1)
    }
}

publishArticle()
