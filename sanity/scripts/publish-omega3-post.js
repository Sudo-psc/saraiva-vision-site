#!/usr/bin/env node

/**
 * Script para publicar artigo "Ômega-3 para olho seco: para que serve, como age e quando vale a pena"
 *
 * Este script cria o artigo no Sanity CMS com todos os metadados SEO
 *
 * Data: 2025-12-14
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
        { text: 'Olho seco é mais comum do que parece', marks: ['strong'] },
        { text: ' — e pode ir muito além de "ardência no fim do dia". Em alguns pacientes, a inflamação da superfície ocular e a instabilidade do filme lacrimal se tornam crônicas, afetando conforto, visão e produtividade.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Entre as medidas que costumam entrar na conversa está o ' },
        { text: 'ômega-3', marks: ['strong'] },
        { text: ': mas ele realmente ajuda? Como funciona? E quando faz sentido usar?' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Na ' },
        { text: 'Clínica Saraiva Vision', marks: ['strong'] },
        { text: ', em ' },
        { text: 'Caratinga (MG)', marks: ['strong'] },
        { text: ', o atendimento humanizado do ' },
        { text: 'Dr. Philipe Saraiva Cruz (CRM-MG 69.870)', marks: ['strong'] },
        { text: ' e equipe orienta cada paciente com base no tipo de olho seco, exames e rotina. Ao longo deste artigo, você vai entender o papel do ômega-3, seus possíveis benefícios, limites da evidência científica e os próximos passos para cuidar melhor dos seus olhos.' }
    ]))

    // Seção 1: O que é olho seco
    blocks.push(createBlock('O que é olho seco e por que ele acontece?', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'Olho seco (ou ' },
        { text: 'doença do olho seco', marks: ['strong'] },
        { text: ') é uma condição em que a lágrima ' },
        { text: 'não consegue lubrificar e proteger bem', marks: ['strong'] },
        { text: ' a superfície do olho. Isso pode acontecer por dois grandes motivos (muitas vezes juntos):' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Falta de lágrima "aquosa"', marks: ['strong'] },
        { text: ' — produção reduzida pelas glândulas lacrimais' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Evaporação aumentada', marks: ['strong'] },
        { text: ' — a lágrima até existe, mas "vai embora rápido", frequentemente ligada à ' },
        { text: 'disfunção das glândulas de Meibômio', marks: ['strong'] },
        { text: ' (glândulas na pálpebra que produzem a camada oleosa da lágrima)' }
    ], 'normal', 'bullet'))

    blocks.push(createBlock('Sintomas comuns no dia a dia', 'h3'))

    blocks.push(createListItem('Ardor, sensação de areia nos olhos, vermelhidão', 'bullet'))
    blocks.push(createListItem('Visão que embaça e "limpa" ao piscar', 'bullet'))
    blocks.push(createListItem('Lacrimejamento paradoxal (olho seco tentando "compensar")', 'bullet'))
    blocks.push(createListItem('Desconforto com vento, ar-condicionado, fumaça, poeira', 'bullet'))
    blocks.push(createListItem('Piora com telas (piscar menos) e ao dirigir à noite', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Em Caratinga e região, é comum ver piora em pessoas que ficam muitas horas no celular/computador, trabalham em ambientes com ventilador/ar-condicionado, ou usam ' },
        { text: 'lente de contato sem acompanhamento regular', marks: ['strong'] },
        { text: '.' }
    ]))

    // Seção 2: O que é ômega-3
    blocks.push(createBlock('O que é ômega-3 e por que ele entrou no tratamento do olho seco?', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'Ômega-3', marks: ['strong'] },
        { text: ' é um tipo de gordura "boa" (ácido graxo poli-insaturado). Os mais conhecidos são:' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'EPA e DHA', marks: ['strong'] },
        { text: ' — comuns em peixes de água fria e óleo de peixe' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'ALA', marks: ['strong'] },
        { text: ' — presente em fontes vegetais (linhaça, chia, nozes); parte dele pode ser convertido em EPA/DHA no corpo' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'A ideia de usar ômega-3 no olho seco surgiu porque ele participa de processos que ' },
        { text: 'modulam inflamação', marks: ['strong'] },
        { text: ' e podem influenciar a qualidade do ' },
        { text: 'filme lacrimal', marks: ['strong'] },
        { text: ' — especialmente a camada lipídica (oleosa), relevante em casos de olho seco evaporativo e disfunção de Meibômio.' }
    ]))

    // Seção 3: Mecanismo de ação
    blocks.push(createBlock('Mecanismo de ação: como o ômega-3 pode ajudar a superfície ocular', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'De forma simples: o olho seco é frequentemente uma mistura de ' },
        { text: 'instabilidade do filme lacrimal + inflamação', marks: ['strong'] },
        { text: '. O ômega-3 entra como um possível "ajuste fino" no terreno inflamatório e na qualidade das secreções.' }
    ]))

    blocks.push(createBlock('1) Modulação da inflamação', 'h3'))

    blocks.push(createBlock('Em muitos quadros de olho seco, a superfície ocular fica inflamada e isso perpetua o ciclo de desconforto, piora da lágrima e irritação. Estudos e revisões descrevem que EPA/DHA podem se relacionar com redução de mediadores inflamatórios e melhora de alguns parâmetros do filme lacrimal.'))

    blocks.push(createBlock('2) Suporte às glândulas de Meibômio', 'h3'))

    blocks.push(createBlock('Quando as glândulas de Meibômio funcionam mal, a lágrima evapora rápido. Materiais clínicos sugerem que ômega-3 pode apoiar a saúde dessas glândulas e a qualidade do óleo secretado, como parte de um plano terapêutico mais amplo.'))

    blocks.push(createBlock('3) Potencial impacto na estabilidade do filme lacrimal', 'h3'))

    blocks.push(createBlock('O objetivo final do tratamento do olho seco é estabilizar a lágrima e reduzir sintomas. Diretrizes clínicas citam que ômega-3 pode ajudar alguns pacientes, embora os resultados variem de pessoa para pessoa.'))

    blocks.push(createBlockquote('Importante: mecanismo plausível não é o mesmo que benefício garantido. Por isso, a próxima seção é decisiva para entender as expectativas reais.'))

    // Seção 4: O que a ciência mostra
    blocks.push(createBlock('O que a ciência mostra: benefícios, limites e o que esperar', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'Aqui está o ponto-chave para uma decisão madura e segura: ' },
        { text: 'a evidência científica sobre suplementação de ômega-3 para olho seco é mista', marks: ['strong'] },
        { text: '.' }
    ]))

    blocks.push(createBlock('O estudo DREAM: um marco importante', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'O estudo DREAM (Dry Eye Assessment and Management) avaliou pacientes com olho seco recebendo ' },
        { text: '3.000 mg/dia de ômega-3 de origem marinha por 12 meses', marks: ['strong'] },
        { text: '. A conclusão foi que ' },
        { text: 'não houve benefício significativamente maior', marks: ['strong'] },
        { text: ' do que placebo (óleo de oliva) para muitos desfechos avaliados.' }
    ]))

    blocks.push(createBlock('Por que ainda se fala em ômega-3?', 'h3'))

    blocks.push(createBlock('Porque, na prática clínica, olho seco é uma síndrome com subtipos e gravidades diferentes. Algumas pessoas relatam melhora; outras, nenhuma. Além disso:'))

    blocks.push(createListItem('Há fontes que relatam resultados variáveis em subgrupos como disfunção de Meibômio', 'bullet'))
    blocks.push(createMixedBlock([
        { text: 'Há profissionais que o usam como ' },
        { text: 'parte de um plano completo', marks: ['strong'] },
        { text: ' (higiene palpebral, lágrimas artificiais, controle de blefarite, ajustes ambientais)' }
    ], 'normal', 'bullet'))
    blocks.push(createListItem('Em situações de otimização pré-operatória da superfície ocular, pode ser considerado como coadjuvante', 'bullet'))

    blocks.push(createBlock('Como definir uma expectativa realista', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'Ômega-3 ' },
        { text: 'não é "colírio"', marks: ['strong'] },
        { text: ' e não costuma dar efeito imediato' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Quando indicado, normalmente é pensado como ' },
        { text: 'coadjuvante', marks: ['strong'] },
        { text: ' e pode levar semanas para avaliar resposta' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Se o seu olho seco tem forte componente de ' },
        { text: 'Meibômio/blefarite', marks: ['strong'] },
        { text: ', o tratamento local e os hábitos (piscar, compressas, higiene) muitas vezes são tão ou mais relevantes' }
    ], 'normal', 'bullet'))

    // Seção 5: Ômega-3 na prática
    blocks.push(createBlock('Ômega-3 na prática: alimentação, suplementação e segurança', 'h2'))

    blocks.push(createBlock('Comece pelo básico: alimentação', 'h3'))

    blocks.push(createBlock('Na conversa com o oftalmologista, frequentemente vale revisar a dieta e hábitos, porque eles influenciam inflamação sistêmica e conforto ocular:'))

    blocks.push(createMixedBlock([
        { text: 'Aumentar fontes de ômega-3 na dieta', marks: ['strong'] },
        { text: ' — peixes ricos em EPA/DHA (salmão, sardinha, atum) e sementes ricas em ALA (linhaça, chia)' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Hidratação adequada', marks: ['strong'] },
        { text: ' ao longo do dia' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Reduzir gatilhos:', marks: ['strong'] },
        { text: ' fumaça, poeira, ar muito seco, vento direto no rosto' }
    ], 'normal', 'bullet'))

    blocks.push(createBlock('Suplemento: quando considerar (e quando evitar)', 'h3'))

    blocks.push(createBlock('A decisão deve ser individualizada. Em geral, faz mais sentido conversar sobre suplemento quando:'))

    blocks.push(createListItem('Há olho seco persistente apesar de medidas básicas', 'bullet'))
    blocks.push(createListItem('Existe suspeita de componente inflamatório e/ou Meibômio, e você já está tratando as pálpebras', 'bullet'))
    blocks.push(createListItem('Você quer um plano completo e monitorado, sem "tentativa infinita" de produtos', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Segurança:', marks: ['strong'] },
        { text: ' ômega-3 não é isento de riscos. Ele pode ' },
        { text: 'interagir com anticoagulantes/antiagregantes', marks: ['strong'] },
        { text: ' e não é recomendado "no automático" para todo mundo. A orientação médica é essencial antes de iniciar.' }
    ]))

    // Box de prova social
    blocks.push(createBlock('Experiência de pacientes', 'h2'))

    blocks.push(createBlockquote('"Eu sentia ardência e visão embaçada no fim do dia, principalmente no computador. Na consulta, entendi que meu problema era olho seco e pálpebra inflamada. Com o plano completo, melhorei muito." — Paciente da região de Caratinga, MG (depoimento ilustrativo)'))

    blocks.push(createMixedBlock([
        { text: 'Na Clínica Saraiva Vision, o foco é conduzir o paciente com ' },
        { text: 'consulta completa + exames conforme necessidade + plano personalizado', marks: ['strong'] },
        { text: ', o que aumenta aderência e resultados no longo prazo — especialmente em doenças crônicas como olho seco.' }
    ]))

    // Seção 6: Quando procurar o oftalmo
    blocks.push(createBlock('Quando devo procurar o oftalmo?', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'Procure avaliação se você tem ' },
        { text: 'sintomas frequentes (semanas/meses)', marks: ['strong'] },
        { text: ' ou se o desconforto está atrapalhando trabalho, leitura e direção.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'E procure ' },
        { text: 'com urgência', marks: ['strong'] },
        { text: ' se houver sinais de alerta:' }
    ]))

    blocks.push(createListItem('Dor ocular intensa', 'bullet'))
    blocks.push(createListItem('Sensibilidade à luz súbita', 'bullet'))
    blocks.push(createListItem('Queda brusca de visão', 'bullet'))
    blocks.push(createListItem('Visão embaçada persistente que não melhora ao piscar', 'bullet'))
    blocks.push(createListItem('Manchas, flashes de luz ou "moscas volantes" de início recente', 'bullet'))
    blocks.push(createListItem('Vermelhidão importante com secreção, inchaço ou trauma', 'bullet'))

    blocks.push(createBlock('Na consulta, o oftalmologista pode investigar se há blefarite, disfunção de Meibômio, alergia ocular, uso de medicamentos ou alterações sistêmicas, e indicar exames como testes lacrimais e avaliação da superfície ocular.'))

    // Seção 7: Próximos passos
    blocks.push(createBlock('Próximos passos', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'Se você suspeita de olho seco, o melhor caminho é sair do "vai e volta" de colírios por conta própria e ' },
        { text: 'montar um plano claro com acompanhamento', marks: ['strong'] },
        { text: '.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Na ' },
        { text: 'Clínica Saraiva Vision (Caratinga, MG)', marks: ['strong'] },
        { text: ', você pode contar com:' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Consultas oftalmológicas', marks: ['strong'] },
        { text: ' com avaliação completa da superfície ocular' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Exames diagnósticos', marks: ['strong'] },
        { text: ' para investigar a causa do desconforto (testes lacrimais, meibografia quando indicada)' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Adaptação de lentes de contato', marks: ['strong'] },
        { text: ' com orientação de segurança (importante em quem tem olho seco)' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Tratamentos personalizados:', marks: ['strong'] },
        { text: ' medidas de higiene palpebral, ajustes ambientais, colírios/lubrificantes quando indicados e estratégias combinadas conforme o seu caso' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'O cuidado é liderado pelo ' },
        { text: 'Dr. Philipe Saraiva Cruz (CRM-MG 69.870)', marks: ['strong'] },
        { text: ' e equipe, com atendimento humanizado e tecnologia diagnóstica para decisões mais seguras.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Pronto para cuidar melhor da sua visão? Agende sua consulta: ', marks: ['strong'] },
        { text: '(33) 99860-1427', marks: ['strong'] }
    ]))

    // FAQ
    blocks.push(createBlock('FAQ: dúvidas comuns sobre ômega-3 e olho seco', 'h2'))

    blocks.push(createBlock('Ômega-3 "cura" olho seco?', 'h3'))
    blocks.push(createMixedBlock([
        { text: 'Não. Olho seco costuma ser crônico e exige acompanhamento. Ômega-3 pode ser ' },
        { text: 'coadjuvante', marks: ['strong'] },
        { text: ' em alguns casos, mas não substitui diagnóstico e tratamento direcionado.' }
    ]))

    blocks.push(createBlock('Em quanto tempo posso notar melhora?', 'h3'))
    blocks.push(createBlock('Quando há resposta, costuma ser gradual (semanas a meses). E é comum precisar combinar com higiene palpebral, ajustes de ambiente e colírios/lubrificantes.'))

    blocks.push(createBlock('Posso tomar ômega-3 por conta própria?', 'h3'))
    blocks.push(createMixedBlock([
        { text: 'O ideal é ' },
        { text: 'não iniciar sem orientação médica', marks: ['strong'] },
        { text: ', especialmente se você usa anticoagulantes/antiagregantes, tem cirurgia programada ou condições clínicas específicas.' }
    ]))

    blocks.push(createBlock('Quem usa lente de contato pode ter olho seco?', 'h3'))
    blocks.push(createMixedBlock([
        { text: 'Sim, e é muito comum. Por isso, a ' },
        { text: 'adaptação de lentes de contato com acompanhamento', marks: ['strong'] },
        { text: ' é essencial para reduzir desconforto e complicações.' }
    ]))

    blocks.push(createBlock('Qual a dose ideal de ômega-3?', 'h3'))
    blocks.push(createBlock('Não há consenso universal. A dose deve ser individualizada pelo médico, considerando seu quadro clínico, outras medicações e condições de saúde.'))

    blocks.push(createBlock('Como é a logística para consulta em Caratinga?', 'h3'))
    blocks.push(createMixedBlock([
        { text: 'Você pode agendar pelo telefone/WhatsApp ' },
        { text: '(33) 99860-1427', marks: ['strong'] },
        { text: ' e levar uma lista de colírios/suplementos/medicamentos em uso. Se já tiver exames anteriores, leve também para comparação.' }
    ]))

    // Referências
    blocks.push(createBlock('Referências', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'EyeWiki - American Academy of Ophthalmology. ' },
        { text: 'Dry Eye Syndrome', marks: ['strong'] },
        { text: ' — seção de tratamentos e menção ao estudo DREAM.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Memorial Sloan Kettering Cancer Center. ' },
        { text: 'Omega-3 Fatty Acids', marks: ['strong'] },
        { text: ' — segurança, interações medicamentosas e evidência em olho seco.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'CRSToday. ' },
        { text: 'Preoperative Ocular Surface Optimization', marks: ['strong'] },
        { text: ' — discussão clínica sobre inflamação/filme lacrimal e uso de ômega-3 como coadjuvante.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'TFOS DEWS II. ' },
        { text: 'Management and Therapy Report', marks: ['strong'] },
        { text: '. The Ocular Surface. 2017;15:575–628.' }
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
    console.log('🔍 Buscando categoria "Tratamentos"...')

    const treatmentsCategory = await client.fetch(
        `*[_type == "category" && slug.current == "tratamentos"][0]{ _id, title }`
    )

    if (treatmentsCategory) {
        console.log(`✅ Categoria encontrada: ${treatmentsCategory.title} (${treatmentsCategory._id})`)
        return treatmentsCategory._id
    }

    const preventionCategory = await client.fetch(
        `*[_type == "category" && slug.current == "prevencao"][0]{ _id, title }`
    )

    if (preventionCategory) {
        console.log(`✅ Usando categoria: ${preventionCategory.title} (${preventionCategory._id})`)
        return preventionCategory._id
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
        `*[_type == "blogPost" && slug.current == "omega-3-olho-seco-caratinga-mg"][0]{ _id, title }`
    )

    if (existingPost) {
        console.log(`⚠️  Artigo já existe: ${existingPost.title} (${existingPost._id})`)
        return existingPost._id
    }

    return null
}

async function publishArticle() {
    console.log('═'.repeat(60))
    console.log('📰 Publicando artigo: Ômega-3 para olho seco')
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
            title: 'Ômega-3 para olho seco: para que serve, como age e quando vale a pena',
            slug: {
                _type: 'slug',
                current: 'omega-3-olho-seco-caratinga-mg'
            },
            excerpt: 'Entenda como o ômega-3 pode ajudar no olho seco, seu mecanismo anti-inflamatório e quando procurar oftalmo em Caratinga, MG.',
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
                'ômega-3',
                'olho seco',
                'tratamento de olho seco',
                'glândulas de Meibômio',
                'filme lacrimal',
                'blefarite',
                'suplementação',
                'EPA DHA',
                'oftalmologista Caratinga MG',
                'Clínica Saraiva Vision'
            ],
            publishedAt: new Date().toISOString(),
            featured: false,
            seo: {
                metaTitle: 'Ômega-3 para olho seco: para que serve, como age e quando vale a pena | Caratinga MG',
                metaDescription: 'Entenda como o ômega-3 pode ajudar no olho seco, seu mecanismo anti-inflamatório e quando procurar oftalmo em Caratinga, MG.',
                keywords: [
                    'ômega-3 para olho seco',
                    'tratamento de olho seco',
                    'meibômio',
                    'filme lacrimal',
                    'Caratinga MG',
                    'suplementação olho seco'
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
