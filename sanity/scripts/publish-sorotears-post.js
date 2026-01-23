#!/usr/bin/env node

/**
 * Script para publicar artigo "Tratamento avançado do olho seco: Sorotears (colírio de soro autólogo)"
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

    // Introdução impactante
    blocks.push(createMixedBlock([
        { text: 'Quando colírios convencionais não são suficientes, o tratamento biológico pode fazer a diferença.', marks: ['strong'] }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Se você convive com ' },
        { text: 'sensação de areia', marks: ['strong'] },
        { text: ', ' },
        { text: 'ardor constante', marks: ['strong'] },
        { text: ', ' },
        { text: 'vermelhidão', marks: ['strong'] },
        { text: ', ' },
        { text: 'visão que oscila ao longo do dia', marks: ['strong'] },
        { text: ' e ' },
        { text: 'incômodo ao ler ou usar computador', marks: ['strong'] },
        { text: ', é possível que esteja diante da ' },
        { text: 'Síndrome do Olho Seco', marks: ['strong'] },
        { text: ' — uma condição comum e, em alguns casos, bastante limitante para a qualidade de vida.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Quando o tratamento convencional (colírios lubrificantes, higiene palpebral, compressas mornas) não traz o alívio esperado, pode ser hora de considerar uma abordagem mais avançada: o ' },
        { text: 'Sorotears', marks: ['strong'] },
        { text: ', um ' },
        { text: 'colírio biológico produzido a partir do soro do seu próprio sangue', marks: ['strong'] },
        { text: ' (soro autólogo).' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Na ' },
        { text: 'Clínica Saraiva Vision', marks: ['strong'] },
        { text: ', em ' },
        { text: 'Caratinga (MG)', marks: ['strong'] },
        { text: ', o ' },
        { text: 'Dr. Philipe Saraiva Cruz (CRM-MG 69.870)', marks: ['strong'] },
        { text: ' e equipe avaliam cada caso de olho seco de forma individualizada, identificando quando terapias avançadas como o soro autólogo podem ser indicadas.' }
    ]))

    // O que é o Sorotears
    blocks.push(createBlock('O que é o Sorotears?', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'O ' },
        { text: 'Sorotears', marks: ['strong'] },
        { text: ' é um ' },
        { text: 'colírio de soro autólogo', marks: ['strong'] },
        { text: ': um tratamento biológico preparado com o ' },
        { text: 'soro obtido do sangue do próprio paciente', marks: ['strong'] },
        { text: '. Por ser derivado do seu organismo, ele apresenta composição semelhante à lágrima natural, contendo:' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Fatores de crescimento', marks: ['strong'] },
        { text: ' que auxiliam na regeneração da superfície ocular' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Proteínas e nutrientes', marks: ['strong'] },
        { text: ' naturais do seu próprio corpo' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Ausência de conservantes e aditivos', marks: ['strong'] },
        { text: ' — compatível para uso prolongado' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'O produto foi ' },
        { text: 'desenvolvido em parceria com a UNIFESP (Universidade Federal de São Paulo)', marks: ['strong'] },
        { text: ', o que reforça sua base científica e qualidade de produção.' }
    ]))

    // Por que é considerado avançado
    blocks.push(createBlock('Por que é considerado um tratamento "avançado"?', 'h2'))

    blocks.push(createBlock('Em quadros de olho seco mais intenso, o problema costuma ir além de "falta de colírio". Há alterações na superfície ocular e no filme lacrimal que podem exigir terapias com efeito mais biológico e regenerativo.'))

    blocks.push(createBlock('Diferente de colírios convencionais que apenas lubrificam, o soro autólogo oferece:'))

    blocks.push(createMixedBlock([
        { text: 'Hidratação duradoura:', marks: ['strong'] },
        { text: ' lubrificação que se mantém por mais tempo na superfície ocular' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Efeito regenerativo:', marks: ['strong'] },
        { text: ' fatores de crescimento que auxiliam na recuperação de lesões corneanas' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Proteção biológica:', marks: ['strong'] },
        { text: ' ajuda a refazer o filme lacrimal, protegendo contra vento, poluição e ar-condicionado' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Fórmula personalizada:', marks: ['strong'] },
        { text: ' disponível em concentrações de ' },
        { text: '20% e 50%', marks: ['strong'] },
        { text: ', conforme a gravidade do caso e objetivo do tratamento' }
    ], 'normal', 'bullet'))

    // Para quem é indicado
    blocks.push(createBlock('Para quem o Sorotears é indicado?', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'O colírio de soro autólogo é especialmente indicado para pacientes com ' },
        { text: 'condições adversas na superfície ocular', marks: ['strong'] },
        { text: ' que não responderam adequadamente ao tratamento convencional:' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Olho seco severo', marks: ['strong'] },
        { text: ' — quando colírios lubrificantes convencionais não proporcionam alívio suficiente' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Doença do Enxerto Contra Hospedeiro (DECH)', marks: ['strong'] },
        { text: ' — complicação ocular em pacientes transplantados' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Ceratites e úlceras de córnea', marks: ['strong'] },
        { text: ' — lesões que necessitam de suporte regenerativo' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Síndrome de Stevens-Johnson (SSJ)', marks: ['strong'] },
        { text: ' — condição grave com comprometimento importante da superfície ocular' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Deficiência lacrimal pós-radioterapia', marks: ['strong'] },
        { text: ' ou outras causas de destruição das glândulas lacrimais' }
    ], 'normal', 'bullet'))

    blocks.push(createBlockquote('Importante: a indicação deve ser feita após avaliação oftalmológica completa — inclusive para diferenciar olho seco evaporativo, deficiência aquosa, inflamatório ou misto, e para montar um plano terapêutico completo.'))

    // Como funciona o tratamento
    blocks.push(createBlock('Como funciona o tratamento? (Jornada do paciente)', 'h2'))

    blocks.push(createBlock('O Sorotears segue uma jornada estruturada com foco em segurança e rastreabilidade:'))

    blocks.push(createMixedBlock([
        { text: '1. Avaliação e prescrição médica', marks: ['strong'] }
    ]))
    blocks.push(createBlock('O oftalmologista avalia seu quadro, confirma a indicação e emite a prescrição do soro autólogo na concentração adequada (20% ou 50%).'))

    blocks.push(createMixedBlock([
        { text: '2. Agendamento da coleta de sangue', marks: ['strong'] }
    ]))
    blocks.push(createBlock('Com a prescrição em mãos, você agenda a coleta em uma das unidades parceiras (atualmente em São Paulo, Rio de Janeiro e Ribeirão Preto).'))

    blocks.push(createMixedBlock([
        { text: '3. Produção especializada', marks: ['strong'] }
    ]))
    blocks.push(createBlock('O sangue é processado em laboratório com controle de qualidade rigoroso. O soro é separado e preparado na concentração prescrita.'))

    blocks.push(createMixedBlock([
        { text: '4. Recebimento do KIT de tratamento', marks: ['strong'] }
    ]))
    blocks.push(createBlock('Você recebe em casa um kit com os frascos de colírio, instruções de uso, armazenamento e validade.'))

    blocks.push(createMixedBlock([
        { text: '5. Acompanhamento', marks: ['strong'] }
    ]))
    blocks.push(createBlock('O retorno ao oftalmologista permite avaliar a resposta ao tratamento e ajustar a conduta conforme necessário.'))

    // Cuidados essenciais
    blocks.push(createBlock('Cuidados essenciais de segurança', 'h2'))

    blocks.push(createBlock('Mesmo sendo um produto autólogo (do seu próprio corpo), o colírio de soro exige cuidados rigorosos de uso e higiene:'))

    blocks.push(createMixedBlock([
        { text: 'Siga rigorosamente as orientações do KIT', marks: ['strong'] },
        { text: ' — ali estão as regras de armazenamento, validade e manuseio específicas do seu lote' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Armazenamento correto:', marks: ['strong'] },
        { text: ' geralmente requer refrigeração; frascos em uso podem ter validade curta' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Não encoste a ponta do frasco', marks: ['strong'] },
        { text: ' no olho, cílios, dedos ou qualquer superfície' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Higienize as mãos', marks: ['strong'] },
        { text: ' antes de cada aplicação' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Sinais de alerta:', marks: ['strong'] },
        { text: ' se surgir dor importante, secreção purulenta, piora acentuada da vermelhidão ou queda de visão, ' },
        { text: 'suspenda o uso e procure avaliação imediatamente', marks: ['strong'] }
    ], 'normal', 'bullet'))

    // O que esperar
    blocks.push(createBlock('O que esperar de resultados? (Expectativas realistas)', 'h2'))

    blocks.push(createBlock('O objetivo do tratamento biológico para olho seco avançado é:'))

    blocks.push(createMixedBlock([
        { text: 'Reduzir desconforto e ardor', marks: ['strong'] },
        { text: ' — melhora da sensação de "areia nos olhos"' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Melhorar tolerância às telas e leitura', marks: ['strong'] },
        { text: ' — maior conforto em atividades do dia a dia' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Estabilizar a visão', marks: ['strong'] },
        { text: ' — diminuir aquela visão que "embaça e melhora" ao piscar' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Apoiar a recuperação da superfície ocular', marks: ['strong'] },
        { text: ' — especialmente em casos de lesão corneana' }
    ], 'normal', 'bullet'))

    blocks.push(createBlockquote('Lembre-se: olho seco costuma ser crônico e multifatorial. Frequentemente é necessário combinar terapias — tratamento de pálpebras/glândulas, controle inflamatório quando indicado, ajustes ambientais e de hábitos — para obter controle sustentado.'))

    // Quando considerar o tratamento
    blocks.push(createBlock('Quando considerar o tratamento com soro autólogo?', 'h2'))

    blocks.push(createBlock('O Sorotears geralmente entra no plano terapêutico quando:'))

    blocks.push(createMixedBlock([
        { text: 'Colírios lubrificantes convencionais', marks: ['strong'] },
        { text: ' (mesmo os sem conservante) não proporcionam alívio adequado' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Higiene palpebral e compressas mornas', marks: ['strong'] },
        { text: ' já foram implementadas sem melhora satisfatória' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Há lesões na superfície ocular', marks: ['strong'] },
        { text: ' (ceratite, erosões, úlceras) que necessitam de suporte regenerativo' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Existem condições específicas', marks: ['strong'] },
        { text: ' como DECH, Stevens-Johnson ou deficiência lacrimal grave' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'O impacto na qualidade de vida', marks: ['strong'] },
        { text: ' é significativo, afetando trabalho, leitura e atividades cotidianas' }
    ], 'normal', 'bullet'))

    // Próximos passos
    blocks.push(createBlock('Próximos passos', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'Se você convive com ' },
        { text: 'olho seco severo', marks: ['strong'] },
        { text: ' ou já tentou diversos tratamentos sem melhora adequada, um caminho seguro é:' }
    ]))

    blocks.push(createMixedBlock([
        { text: '1) Agendar consulta oftalmológica', marks: ['strong'] },
        { text: ' para avaliação completa da superfície ocular' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: '2) Realizar exames diagnósticos', marks: ['strong'] },
        { text: ' (testes lacrimais, meibografia quando indicada)' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: '3) Discutir opções terapêuticas', marks: ['strong'] },
        { text: ' — incluindo se o soro autólogo seria indicado para o seu caso' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: '4) Montar um plano personalizado', marks: ['strong'] },
        { text: ' que pode combinar diferentes terapias para controle sustentado' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Na ' },
        { text: 'Clínica Saraiva Vision', marks: ['strong'] },
        { text: ', em ' },
        { text: 'Caratinga (MG)', marks: ['strong'] },
        { text: ', oferecemos avaliação especializada da superfície ocular, com exames diagnósticos e tratamento individualizado para cada tipo de olho seco.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Agende sua consulta: ', marks: ['strong'] },
        { text: '(33) 99860-1427', marks: ['strong'] }
    ]))

    // FAQ
    blocks.push(createBlock('Perguntas frequentes', 'h2'))

    blocks.push(createBlock('O Sorotears substitui todos os outros colírios?', 'h3'))
    blocks.push(createBlock('Não necessariamente. Dependendo do seu caso, pode ser usado em conjunto com outros tratamentos (lubrificantes, anti-inflamatórios, higiene palpebral). O oftalmologista definirá o esquema mais adequado.'))

    blocks.push(createBlock('Quanto tempo dura o tratamento?', 'h3'))
    blocks.push(createBlock('Varia conforme a gravidade e resposta individual. Alguns pacientes usam por períodos definidos; outros, com condições crônicas graves, podem necessitar de uso prolongado ou cíclico.'))

    blocks.push(createBlock('Posso fazer a coleta de sangue em Caratinga?', 'h3'))
    blocks.push(createMixedBlock([
        { text: 'Atualmente, os pontos de coleta do Sorotears estão em ' },
        { text: 'São Paulo, Rio de Janeiro e Ribeirão Preto', marks: ['strong'] },
        { text: '. A prescrição é feita na consulta em Caratinga, e a coleta é agendada na unidade mais conveniente para você.' }
    ]))

    blocks.push(createBlock('O soro autólogo tem contraindicações?', 'h3'))
    blocks.push(createBlock('Pacientes com determinadas condições sistêmicas ou infecções podem não ser candidatos. A avaliação médica prévia é essencial para garantir a segurança do tratamento.'))

    blocks.push(createBlock('Quanto custa o tratamento?', 'h3'))
    blocks.push(createMixedBlock([
        { text: 'Por ser um produto biológico personalizado, o Sorotears não é coberto por planos de saúde. O custo inclui a produção do colírio e o kit de tratamento. Consulte diretamente o serviço para valores atualizados: ' },
        { text: 'sorotears.com.br', marks: ['strong'] }
    ]))

    // Referências
    blocks.push(createBlock('Referências', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'Sorotears — Colírio de Soro Autólogo. Site oficial: ' },
        { text: 'sorotears.com.br', marks: ['strong'] }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Geerling G, et al. ' },
        { text: 'Autologous serum eye drops for ocular surface disorders', marks: ['em'] },
        { text: '. British Journal of Ophthalmology. 2004.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Pan Q, et al. ' },
        { text: 'Autologous serum eye drops for dry eye', marks: ['em'] },
        { text: '. Cochrane Database of Systematic Reviews. 2017.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'TFOS DEWS II Management and Therapy Report. ' },
        { text: 'The Ocular Surface', marks: ['em'] },
        { text: '. 2017;15:575–628.' }
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

    // Buscar categoria "Tratamentos"
    const treatmentsCategory = await client.fetch(
        `*[_type == "category" && slug.current == "tratamentos"][0]{ _id, title }`
    )

    if (treatmentsCategory) {
        console.log(`✅ Categoria encontrada: ${treatmentsCategory.title} (${treatmentsCategory._id})`)
        return treatmentsCategory._id
    }

    // Tentar "Prevenção" como alternativa
    const preventionCategory = await client.fetch(
        `*[_type == "category" && slug.current == "prevencao"][0]{ _id, title }`
    )

    if (preventionCategory) {
        console.log(`✅ Usando categoria: ${preventionCategory.title} (${preventionCategory._id})`)
        return preventionCategory._id
    }

    // Fallback para qualquer categoria disponível
    const anyCategory = await client.fetch(
        `*[_type == "category"][0]{ _id, title }`
    )

    if (anyCategory) {
        console.log(`✅ Usando categoria: ${anyCategory.title} (${anyCategory._id})`)
        return anyCategory._id
    }

    throw new Error('Nenhuma categoria encontrada no Sanity. Crie uma categoria primeiro.')
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
        `*[_type == "blogPost" && slug.current == "tratamento-olho-seco-avancado-sorotears-soro-autologo"][0]{ _id, title }`
    )

    if (existingPost) {
        console.log(`⚠️  Artigo já existe: ${existingPost.title} (${existingPost._id})`)
        return existingPost._id
    }

    return null
}

async function publishArticle() {
    console.log('═'.repeat(60))
    console.log('📰 Publicando artigo: Sorotears - Soro Autólogo')
    console.log('═'.repeat(60))
    console.log('')

    try {
        // Verificar se já existe
        const existingId = await checkExistingPost()
        if (existingId) {
            console.log('\n❌ Publicação cancelada: artigo já existe no Sanity.')
            console.log(`   ID: ${existingId}`)
            return
        }

        // Obter referências
        const authorId = await findOrCreateAuthor()
        const categoryId = await findOrCreateCategory()
        const postId = await getNextPostId()

        console.log('\n📝 Criando artigo no Sanity...')

        // Criar o post
        const blogPost = {
            _type: 'blogPost',
            id: postId,
            title: 'Tratamento avançado do olho seco: Sorotears (colírio de soro autólogo)',
            slug: {
                _type: 'slug',
                current: 'tratamento-olho-seco-avancado-sorotears-soro-autologo'
            },
            excerpt: 'Entenda quando o Sorotears pode ser indicado no olho seco severo, como funciona o tratamento com soro autólogo, benefícios, indicações e cuidados essenciais.',
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
                'olho seco severo',
                'tratamento olho seco avançado',
                'soro autólogo',
                'colírio biológico',
                'Sorotears',
                'síndrome do olho seco',
                'DECH',
                'Stevens-Johnson',
                'ceratite',
                'úlcera de córnea',
                'oftalmologista Caratinga MG',
                'Clínica Saraiva Vision'
            ],
            publishedAt: new Date().toISOString(),
            featured: false,
            seo: {
                metaTitle: 'Tratamento avançado do olho seco: Sorotears (colírio de soro autólogo) | Clínica Saraiva Vision',
                metaDescription: 'Entenda quando o Sorotears pode ser indicado no olho seco severo, como funciona o tratamento com soro autólogo, benefícios, indicações e cuidados essenciais.',
                keywords: [
                    'olho seco severo',
                    'tratamento olho seco avançado',
                    'soro autólogo',
                    'colírio biológico',
                    'Sorotears',
                    'síndrome do olho seco',
                    'DECH',
                    'Stevens-Johnson'
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
        console.log(`   Blog (após deploy): https://saraivavision.com.br/blog/${result.slug.current}`)
        console.log('')
        console.log('⚠️  IMPORTANTE: O artigo foi criado SEM imagem de capa.')
        console.log('   Para adicionar a imagem:')
        console.log('   1. Acesse o Sanity Studio')
        console.log('   2. Edite o post')
        console.log('   3. Faça upload da imagem em "Main Image"')
        console.log('   4. Adicione o texto alternativo (alt)')
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
