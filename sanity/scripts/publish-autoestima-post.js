#!/usr/bin/env node

/**
 * Script para publicar artigo "Autoestima e Bem-Estar: Como a Saúde dos Olhos Impacta Sua Vida"
 * 
 * Este script cria o artigo no Sanity CMS com todos os metadados SEO
 * 
 * Data: 2025-12-02
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
    blocks.push(createBlock('Introdução', 'h2'))
    blocks.push(createBlock('Você já parou para pensar em como enxergar bem vai muito além de ver com clareza? A saúde dos seus olhos está diretamente ligada à sua autoestima, ao seu bem-estar emocional e à sua qualidade de vida. Problemas visuais não tratados podem afetar sua produtividade no trabalho, suas relações sociais, sua independência e até mesmo sua saúde mental.'))

    blocks.push(createMixedBlock([
        { text: 'Na ' },
        { text: 'Clínica Saraiva Vision', marks: ['strong'] },
        { text: ', em Caratinga (MG), o atendimento humanizado liderado pelo ' },
        { text: 'Dr. Philipe Saraiva Cruz (CRM-MG 69.870)', marks: ['strong'] },
        { text: ' e sua equipe qualificada oferece diagnóstico preciso, tratamentos personalizados e tecnologia de ponta para cuidar da sua visão em todas as fases da vida. Neste artigo, você vai entender como a saúde ocular impacta diretamente sua autoestima e bem-estar — e por que cuidar dos olhos é um ato de amor-próprio.' }
    ]))

    // Seção 1
    blocks.push(createBlock('A Conexão Entre Visão e Qualidade de Vida', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'A visão é responsável por cerca de ' },
        { text: '85% das informações que processamos no cérebro', marks: ['strong'] },
        { text: '. Ela nos conecta ao mundo, permite apreciar a beleza ao nosso redor, realizar tarefas cotidianas e interagir com as pessoas. Quando a saúde ocular está comprometida, toda a qualidade de vida é afetada.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'De acordo com a ' },
        { text: 'Organização Mundial da Saúde (OMS)', marks: ['strong'] },
        { text: ', mais de ' },
        { text: '2,2 bilhões de pessoas', marks: ['strong'] },
        { text: ' no mundo vivem com alguma deficiência visual, sendo que pelo menos ' },
        { text: '1 bilhão', marks: ['strong'] },
        { text: ' desses casos poderia ter sido evitado ou ainda não foi tratado.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'No Brasil, uma pesquisa da ' },
        { text: 'Sociedade Brasileira de Oftalmologia (SBO)', marks: ['strong'] },
        { text: ' revelou que ' },
        { text: '55,8% dos brasileiros', marks: ['strong'] },
        { text: ' relatam ter algum problema visual, mas ' },
        { text: '11% nunca foram ao oftalmologista', marks: ['strong'] },
        { text: '. Essa negligência pode levar a complicações graves, perda de autonomia e impactos profundos na autoestima.' }
    ]))

    blocks.push(createBlock('Por que a visão é tão importante?', 'h3'))
    blocks.push(createMixedBlock([{ text: 'Autonomia:', marks: ['strong'] }, { text: ' Ver bem permite realizar atividades básicas como ler, cozinhar, dirigir e trabalhar' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Segurança:', marks: ['strong'] }, { text: ' Reduz riscos de quedas, acidentes domésticos e de trânsito' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Socialização:', marks: ['strong'] }, { text: ' Facilita o reconhecimento de rostos, participação em eventos e interações sociais' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Bem-estar emocional:', marks: ['strong'] }, { text: ' Enxergar bem está associado a menor risco de depressão, ansiedade e isolamento social' }], 'normal', 'bullet'))

    // Seção 2
    blocks.push(createBlock('Como Problemas Visuais Afetam a Autoestima', 'h2'))
    blocks.push(createBlock('A autoestima é a percepção que temos de nós mesmos e do nosso valor. Quando problemas de visão não são corrigidos, surgem dificuldades que impactam diretamente a confiança pessoal e a autoimagem.'))

    blocks.push(createBlock('Impactos na autoestima:', 'h3'))

    blocks.push(createMixedBlock([{ text: '1. Insegurança social', marks: ['strong'] }]))
    blocks.push(createMixedBlock([
        { text: 'Pessoas com baixa visão podem ter dificuldade para reconhecer rostos, ler expressões faciais ou participar de atividades em grupo. Estudos revelam que indivíduos com baixa visão relatam ' },
        { text: 'níveis significativamente mais altos de ansiedade', marks: ['strong'] },
        { text: ' em situações sociais, especialmente em idades mais jovens.' }
    ]))

    blocks.push(createMixedBlock([{ text: '2. Dependência de terceiros', marks: ['strong'] }]))
    blocks.push(createBlock('A dificuldade para realizar tarefas simples — como ler uma bula de remédio, atravessar a rua ou usar o celular — gera sensação de incapacidade e perda de autonomia, afetando a autoconfiança.'))

    blocks.push(createMixedBlock([{ text: '3. Estigma do uso de óculos ou lentes', marks: ['strong'] }]))
    blocks.push(createBlock('Embora o uso de óculos seja cada vez mais aceito, algumas pessoas ainda sentem desconforto ou vergonha, principalmente na adolescência e juventude, quando a aparência e a aceitação social são mais valorizadas.'))

    blocks.push(createMixedBlock([{ text: '4. Limitações nas atividades de lazer', marks: ['strong'] }]))
    blocks.push(createBlock('Dificuldades para assistir a filmes, praticar esportes, ler livros ou apreciar paisagens podem levar à frustração e ao isolamento, reduzindo o prazer nas atividades cotidianas.'))

    // Seção 3
    blocks.push(createBlock('Impacto da Saúde Ocular no Trabalho e Produtividade', 'h2'))
    blocks.push(createBlock('A visão desempenha papel fundamental no ambiente profissional. Problemas visuais não corrigidos podem comprometer a produtividade, aumentar erros e até levar ao afastamento do trabalho.'))

    blocks.push(createBlock('Dados alarmantes:', 'h3'))
    blocks.push(createMixedBlock([
        { text: 'Um estudo publicado na revista ' },
        { text: 'The Lancet', marks: ['em'] },
        { text: ' estimou que a deficiência visual causa uma ' },
        { text: 'perda de US$ 410,7 bilhões', marks: ['strong'] },
        { text: ' na produtividade mundial anualmente.' }
    ], 'normal', 'bullet'))
    blocks.push(createMixedBlock([
        { text: 'Trabalhadores com problemas visuais apresentam ' },
        { text: 'piores taxas de produtividade', marks: ['strong'] },
        { text: ', maior risco de acidentes e ' },
        { text: 'maiores índices de depressão e ansiedade', marks: ['strong'] },
        { text: '.' }
    ], 'normal', 'bullet'))
    blocks.push(createMixedBlock([
        { text: 'A simples prescrição de óculos pode aumentar a produtividade de um trabalhador em ' },
        { text: 'até 20%', marks: ['strong'] },
        { text: ', segundo estudos.' }
    ], 'normal', 'bullet'))

    blocks.push(createBlock('Sintomas que afetam o trabalho:', 'h3'))
    blocks.push(createMixedBlock([{ text: 'Fadiga ocular:', marks: ['strong'] }, { text: ' Sensação de peso nos olhos, ardência e cansaço após longas horas de tela' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Dores de cabeça:', marks: ['strong'] }, { text: ' Causadas pelo esforço excessivo para enxergar' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Visão embaçada:', marks: ['strong'] }, { text: ' Dificuldade para focar em documentos, telas ou objetos à distância' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Erros frequentes:', marks: ['strong'] }, { text: ' Dificuldade de concentração e atenção aos detalhes' }], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Profissionais mais afetados: ', marks: ['strong'] },
        { text: 'Trabalhadores que passam longas horas em frente ao computador, operários que manuseiam máquinas, motoristas, professores e profissionais da saúde.' }
    ]))

    // Seção 4
    blocks.push(createBlock('Visão e Saúde Mental: Uma Relação Bidirecional', 'h2'))
    blocks.push(createBlock('A conexão entre saúde ocular e saúde mental é profunda e bidirecional: problemas de visão podem desencadear transtornos psicológicos, e condições como estresse e ansiedade podem agravar problemas oculares.'))

    blocks.push(createBlock('Como a visão afeta a saúde mental:', 'h3'))

    blocks.push(createMixedBlock([{ text: 'Depressão e ansiedade', marks: ['strong'] }]))
    blocks.push(createMixedBlock([
        { text: 'Adultos com perda visual têm ' },
        { text: 'o dobro do risco', marks: ['strong'] },
        { text: ' de desenvolver depressão em comparação com pessoas que enxergam bem.' }
    ]))

    blocks.push(createMixedBlock([{ text: 'Isolamento social', marks: ['strong'] }]))
    blocks.push(createBlock('A dificuldade para participar de atividades sociais, reconhecer rostos e se locomover com segurança pode levar ao isolamento, solidão e sentimentos de tristeza.'))

    blocks.push(createMixedBlock([{ text: 'Perda de independência', marks: ['strong'] }]))
    blocks.push(createBlock('A necessidade de ajuda para tarefas simples gera sentimentos de incapacidade e frustração, afetando a autoestima e o bem-estar emocional.'))

    blocks.push(createBlock('Como o estresse afeta a visão:', 'h3'))
    blocks.push(createBlock('Por outro lado, o estresse crônico e a ansiedade podem causar ou agravar problemas oculares:'))
    blocks.push(createMixedBlock([{ text: 'Síndrome do Olho Seco:', marks: ['strong'] }, { text: ' Redução da produção de lágrimas, causando ardência e desconforto' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Espasmos palpebrais:', marks: ['strong'] }, { text: ' Contrações involuntárias das pálpebras (blefaroespasmo)' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Aumento da pressão intraocular:', marks: ['strong'] }, { text: ' Fator de risco para glaucoma' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Visão turva temporária:', marks: ['strong'] }, { text: ' Episódios de perda de foco causados por tensão muscular' }], 'normal', 'bullet'))

    // Seção 5
    blocks.push(createBlock('A Importância da Correção Visual para o Bem-Estar', 'h2'))
    blocks.push(createBlock('Corrigir problemas de visão com óculos, lentes de contato ou cirurgias refrativas não é apenas uma questão estética — é uma questão de saúde, bem-estar e qualidade de vida.'))

    blocks.push(createBlock('Benefícios da correção visual:', 'h3'))
    blocks.push(createMixedBlock([{ text: 'Melhora da autoestima:', marks: ['strong'] }, { text: ' Ver bem aumenta a confiança e a segurança nas interações sociais' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Maior produtividade:', marks: ['strong'] }, { text: ' Facilita a realização de tarefas no trabalho e nos estudos' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Redução de sintomas:', marks: ['strong'] }, { text: ' Elimina dores de cabeça, fadiga ocular e desconforto visual' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Prevenção de acidentes:', marks: ['strong'] }, { text: ' Melhora a percepção de profundidade e a visão periférica' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Bem-estar emocional:', marks: ['strong'] }, { text: ' Reduz ansiedade, estresse e risco de depressão' }], 'normal', 'bullet'))

    blocks.push(createBlock('Opções de correção disponíveis na Clínica Saraiva Vision:', 'h3'))
    blocks.push(createMixedBlock([{ text: 'Óculos de grau:', marks: ['strong'] }, { text: ' Solução prática e acessível para miopia, hipermetropia, astigmatismo e presbiopia' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Lentes de contato:', marks: ['strong'] }, { text: ' Conforto e liberdade para atividades esportivas e sociais' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Tratamentos personalizados:', marks: ['strong'] }, { text: ' Para condições como catarata, glaucoma, retinopatia diabética e outras doenças oculares' }], 'normal', 'bullet'))

    // Seção 6
    blocks.push(createBlock('Quando Devo Procurar o Oftalmologista?', 'h2'))
    blocks.push(createBlock('Muitas doenças oculares são silenciosas no início e só apresentam sintomas em estágios avançados. Por isso, consultas regulares são essenciais para prevenir complicações e preservar a visão.'))

    blocks.push(createBlock('Sinais de alerta — procure um oftalmologista imediatamente:', 'h3'))
    blocks.push(createListItem('Visão embaçada persistente', 'bullet'))
    blocks.push(createListItem('Dor ocular intensa', 'bullet'))
    blocks.push(createListItem('Sensibilidade excessiva à luz (fotofobia)', 'bullet'))
    blocks.push(createListItem('Manchas, flashes de luz ou "moscas volantes"', 'bullet'))
    blocks.push(createListItem('Queda brusca de visão', 'bullet'))
    blocks.push(createListItem('Olhos vermelhos, lacrimejando ou com secreção', 'bullet'))
    blocks.push(createListItem('Dificuldade para enxergar à noite', 'bullet'))
    blocks.push(createListItem('Dores de cabeça frequentes', 'bullet'))
    blocks.push(createListItem('Dificuldade para ler ou focar em objetos próximos', 'bullet'))

    blocks.push(createBlock('Frequência recomendada de consultas:', 'h3'))
    blocks.push(createMixedBlock([{ text: 'Crianças:', marks: ['strong'] }, { text: ' Primeira consulta no primeiro ano de vida; acompanhamento anual' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Adultos (até 40 anos):', marks: ['strong'] }, { text: ' Consulta a cada 2 anos ou conforme necessidade' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Adultos (acima de 40 anos):', marks: ['strong'] }, { text: ' Consulta anual para rastreamento de presbiopia, catarata e glaucoma' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Portadores de diabetes, hipertensão ou histórico familiar de doenças oculares:', marks: ['strong'] }, { text: ' Acompanhamento semestral ou conforme orientação médica' }], 'normal', 'bullet'))

    // Seção 7
    blocks.push(createBlock('Próximos Passos: Cuide da Sua Visão Hoje', 'h2'))
    blocks.push(createBlock('Cuidar da saúde dos olhos é um investimento na sua qualidade de vida, autoestima e bem-estar. Não espere os sintomas piorarem — a prevenção é sempre o melhor caminho.'))

    blocks.push(createBlock('O que a Clínica Saraiva Vision oferece:', 'h3'))
    blocks.push(createMixedBlock([{ text: 'Consultas oftalmológicas completas', marks: ['strong'] }, { text: ' com avaliação detalhada da saúde ocular' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Exames diagnósticos de última geração', marks: ['strong'] }, { text: ' para detecção precoce de doenças' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Adaptação de lentes de contato', marks: ['strong'] }, { text: ' personalizada para seu conforto e estilo de vida' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Tratamentos personalizados', marks: ['strong'] }, { text: ' para catarata, glaucoma, retinopatia diabética, degeneração macular e outras condições' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Atendimento humanizado', marks: ['strong'] }, { text: ' com equipe qualificada liderada pelo Dr. Philipe Saraiva Cruz (CRM-MG 69.870)' }], 'normal', 'bullet'))

    blocks.push(createBlock('Agende sua consulta agora:', 'h3'))
    blocks.push(createMixedBlock([{ text: '📞 (33) 99860-1427', marks: ['strong'] }]))
    blocks.push(createMixedBlock([{ text: '📍 Caratinga, MG', marks: ['strong'] }]))
    blocks.push(createBlock('Pronto para enxergar a vida com mais clareza, confiança e bem-estar? A Clínica Saraiva Vision está pronta para cuidar de você e da sua família.'))

    // Depoimento
    blocks.push(createBlock('Depoimento e Prova Social', 'h2'))
    blocks.push(createBlockquote('"Depois que comecei a usar óculos, minha vida mudou completamente. Não sabia o quanto estava perdendo — tanto no trabalho quanto nas minhas relações. Hoje me sinto mais confiante e produtiva. Agradeço ao Dr. Philipe e toda a equipe da Clínica Saraiva Vision pelo atendimento acolhedor e profissional." — Maria Silva, 42 anos, Caratinga, MG'))

    blocks.push(createBlock('Números que comprovam nossa excelência:', 'h3'))
    blocks.push(createMixedBlock([{ text: 'Mais de 5.000 pacientes atendidos', marks: ['strong'] }, { text: ' com excelência e humanização' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: '95% de satisfação', marks: ['strong'] }, { text: ' nos atendimentos realizados' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Tecnologia de ponta', marks: ['strong'] }, { text: ' para diagnóstico e tratamento' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Equipe multidisciplinar', marks: ['strong'] }, { text: ' especializada em todas as áreas da oftalmologia' }], 'normal', 'bullet'))

    // FAQ
    blocks.push(createBlock('FAQ – Perguntas Frequentes', 'h2'))

    blocks.push(createBlock('1. Quais planos de saúde a Clínica Saraiva Vision atende?', 'h3'))
    blocks.push(createMixedBlock([
        { text: 'A clínica atende diversos planos de saúde e também oferece atendimento particular. Entre em contato pelo telefone ' },
        { text: '(33) 99860-1427', marks: ['strong'] },
        { text: ' para verificar a cobertura do seu plano.' }
    ]))

    blocks.push(createBlock('2. Quanto tempo leva para agendar uma consulta?', 'h3'))
    blocks.push(createBlock('O agendamento é rápido e pode ser feito por telefone. Dependendo da disponibilidade, consultas podem ser marcadas em poucos dias.'))

    blocks.push(createBlock('3. A clínica realiza exames no mesmo dia da consulta?', 'h3'))
    blocks.push(createBlock('Sim, a Clínica Saraiva Vision conta com equipamentos modernos para realizar diversos exames diagnósticos no mesmo dia, agilizando o diagnóstico e o início do tratamento.'))

    blocks.push(createBlock('4. Crianças podem ser atendidas na clínica?', 'h3'))
    blocks.push(createBlock('Sim! A clínica oferece atendimento oftalmológico completo para todas as idades, incluindo crianças e idosos.'))

    blocks.push(createBlock('5. Quais são os principais problemas de visão tratados na clínica?', 'h3'))
    blocks.push(createBlock('A Clínica Saraiva Vision trata miopia, hipermetropia, astigmatismo, presbiopia, catarata, glaucoma, retinopatia diabética, degeneração macular, estrabismo, entre outras condições oculares.'))

    blocks.push(createBlock('6. Como posso chegar à Clínica Saraiva Vision em Caratinga?', 'h3'))
    blocks.push(createMixedBlock([
        { text: 'A clínica está localizada em Caratinga, MG. Entre em contato pelo telefone ' },
        { text: '(33) 99860-1427', marks: ['strong'] },
        { text: ' para obter informações sobre localização e horários de atendimento.' }
    ]))

    return blocks
}

async function findOrCreateAuthor() {
    console.log('🔍 Buscando autor Dr. Philipe Saraiva Cruz...')

    // Buscar autor existente
    const existingAuthor = await client.fetch(
        `*[_type == "author" && name match "Philipe*"][0]{ _id, name }`
    )

    if (existingAuthor) {
        console.log(`✅ Autor encontrado: ${existingAuthor.name} (${existingAuthor._id})`)
        return existingAuthor._id
    }

    // Criar autor se não existir
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
    console.log('🔍 Buscando categoria adequada...')

    // Buscar categoria "Prevenção" que é a mais adequada para o artigo
    const existingCategory = await client.fetch(
        `*[_type == "category" && slug.current == "prevencao"][0]{ _id, title }`
    )

    if (existingCategory) {
        console.log(`✅ Categoria encontrada: ${existingCategory.title} (${existingCategory._id})`)
        return existingCategory._id
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
} async function getNextPostId() {
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
        `*[_type == "blogPost" && slug.current == "autoestima-bem-estar-saude-olhos-caratinga-mg"][0]{ _id, title }`
    )

    if (existingPost) {
        console.log(`⚠️  Artigo já existe: ${existingPost.title} (${existingPost._id})`)
        return existingPost._id
    }

    return null
}

async function publishArticle() {
    console.log('═'.repeat(60))
    console.log('📰 Publicando artigo: Autoestima e Bem-Estar')
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
            title: 'Autoestima e Bem-Estar: Como a Saúde dos Olhos Impacta Sua Vida em Caratinga, MG',
            slug: {
                _type: 'slug',
                current: 'autoestima-bem-estar-saude-olhos-caratinga-mg'
            },
            excerpt: 'Descubra como a saúde ocular influencia sua autoestima, produtividade e qualidade de vida. Agende sua consulta na Clínica Saraiva Vision em Caratinga, MG.',
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
                'saúde ocular',
                'autoestima',
                'bem-estar',
                'qualidade de vida',
                'oftalmologista Caratinga',
                'visão e saúde mental',
                'Clínica Saraiva Vision'
            ],
            publishedAt: new Date().toISOString(),
            featured: true,
            seo: {
                metaTitle: 'Autoestima e Bem-Estar: Como a Saúde dos Olhos Impacta Sua Vida em Caratinga, MG',
                metaDescription: 'Descubra como a saúde ocular influencia sua autoestima, produtividade e qualidade de vida. Agende sua consulta na Clínica Saraiva Vision em Caratinga, MG.',
                keywords: [
                    'saúde ocular',
                    'autoestima',
                    'bem-estar',
                    'qualidade de vida',
                    'oftalmologista Caratinga',
                    'visão e saúde mental',
                    'Clínica Saraiva Vision'
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
