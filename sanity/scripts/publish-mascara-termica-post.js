#!/usr/bin/env node

/**
 * Script para publicar artigo "Máscara térmica oftálmica para olho seco, blefarite e DGM"
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
        { text: 'Calor controlado para aliviar ardor, sensação de areia e irritação — com orientação segura do seu oftalmologista.', marks: ['strong'] }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Na rotina de quem sente os olhos "arranhando", ardem no fim do dia ou ficam lacrimejando paradoxalmente, uma dúvida é comum: ' },
        { text: 'compressa morna ajuda mesmo?', marks: ['em'] },
        { text: ' Em muitos casos, sim — especialmente quando há ' },
        { text: 'disfunção das glândulas meibomianas (DGM)', marks: ['strong'] },
        { text: ' e ' },
        { text: 'blefarite', marks: ['strong'] },
        { text: '.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Na ' },
        { text: 'Clínica Saraiva Vision', marks: ['strong'] },
        { text: ', em ' },
        { text: 'Caratinga (MG)', marks: ['strong'] },
        { text: ', o cuidado é conduzido com atendimento humanizado pelo ' },
        { text: 'Dr. Philipe Saraiva Cruz (CRM-MG 69.870)', marks: ['strong'] },
        { text: ' e equipe, com exames e plano de tratamento individualizado.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'O que você vai aprender neste artigo:', marks: ['strong'] },
        { text: ' como a máscara térmica funciona, quando ela é indicada, como usar com segurança, sinais de alerta e quais exames podem ser necessários.' }
    ]))

    // Seção 1: O que é a máscara térmica
    blocks.push(createBlock('O que é a máscara térmica oftálmica e como ela funciona', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'A ' },
        { text: 'máscara térmica oftálmica', marks: ['strong'] },
        { text: ' é um dispositivo (geralmente ' },
        { text: 'reutilizável', marks: ['strong'] },
        { text: ') feito para aplicar ' },
        { text: 'calor controlado', marks: ['strong'] },
        { text: ' na região ao redor dos olhos (periorbital). Diferente de "improvisos" com pano quente que esfria rápido, muitos modelos mantêm a temperatura por mais tempo, favorecendo um aquecimento mais estável.' }
    ]))

    blocks.push(createBlock('Em termos simples, ela pode ajudar a:'))

    blocks.push(createMixedBlock([
        { text: 'Fluidificar a oleosidade', marks: ['strong'] },
        { text: ' (meibum) das glândulas das pálpebras.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Reduzir obstruções', marks: ['strong'] },
        { text: ' nos ductos das glândulas meibomianas.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Melhorar a camada lipídica', marks: ['strong'] },
        { text: ' da lágrima (a "camada de óleo" que diminui evaporação).' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Aliviar sintomas', marks: ['strong'] },
        { text: ' como ardor, sensação de areia, cansaço visual e irritação.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'A ' },
        { text: 'American Academy of Ophthalmology (AAO)', marks: ['strong'] },
        { text: ' destaca que ' },
        { text: 'higiene palpebral e aquecimento com compressas/máscaras', marks: ['strong'] },
        { text: ' são base do manejo clínico em quadros relacionados à DGM (frequentemente associada à blefarite posterior), com rotinas conservadoras de aquecimento e limpeza palpebral.' }
    ]))

    // Seção 2: Olho seco, blefarite e DGM
    blocks.push(createBlock('Olho seco, blefarite e DGM: por que o calor ajuda?', 'h2'))

    blocks.push(createBlock('Entendendo o "triângulo" mais comum', 'h3'))

    blocks.push(createBlock('Muita gente pensa em olho seco apenas como "falta de lágrima". Mas, em grande parte dos pacientes, o problema é também qualidade da lágrima.'))

    blocks.push(createMixedBlock([
        { text: 'DGM (disfunção das glândulas meibomianas):', marks: ['strong'] },
        { text: ' as glândulas na borda das pálpebras produzem uma parte oleosa essencial para a lágrima. Quando elas entopem ou inflamam, a lágrima evapora mais rápido.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Blefarite:', marks: ['strong'] },
        { text: ' inflamação crônica da borda palpebral, podendo coexistir com DGM.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Síndrome do olho seco:', marks: ['strong'] },
        { text: ' pode ser evaporativa (muito ligada à DGM) ou por baixa produção aquosa, ou mista.' }
    ], 'normal', 'bullet'))

    blocks.push(createBlock('O calor atua como um "amolecedor" do conteúdo das glândulas, facilitando a drenagem e melhorando o filme lacrimal. Por isso, ele costuma ser recomendado junto com outros pilares do cuidado, como higiene palpebral e lubrificantes, quando indicados.'))

    // Seção 3: Calor úmido ou seco
    blocks.push(createBlock('Calor úmido ou seco: qual é melhor?', 'h2'))

    blocks.push(createBlock('Não existe uma única resposta para todos. O ideal depende do seu quadro, sensibilidade cutânea e orientação do seu oftalmologista.'))

    blocks.push(createMixedBlock([
        { text: 'Calor seco (máscaras térmicas específicas):', marks: ['strong'] }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Tende a ' },
        { text: 'manter melhor a temperatura', marks: ['strong'] },
        { text: ' por mais tempo.' }
    ], 'normal', 'bullet'))

    blocks.push(createListItem('Pode ser mais prático para rotina.', 'bullet'))

    blocks.push(createListItem('Em algumas pessoas, é mais confortável e "limpo".', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Calor úmido (compressa morna úmida):', marks: ['strong'] }
    ]))

    blocks.push(createListItem('Pode ajudar quando há muita crosta/secreção na borda palpebral.', 'bullet'))

    blocks.push(createListItem('Exige cuidado extra com higiene (pano limpo, troca frequente) para evitar contaminação.', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Em ambos os casos, o ponto-chave é: ' },
        { text: 'temperatura segura', marks: ['strong'] },
        { text: ' e ' },
        { text: 'regularidade', marks: ['strong'] },
        { text: ', sem "exageros". Se você tem rosácea ocular, dermatite, pele muito sensível ou histórico de alergias, vale individualizar o método.' }
    ]))

    // Seção 4: Como usar com segurança
    blocks.push(createBlock('Como usar a máscara térmica com segurança (passo a passo)', 'h2'))

    blocks.push(createBlock('A máscara térmica é simples, mas alguns detalhes fazem diferença para ter benefício e evitar irritação.'))

    blocks.push(createBlock('Passo a passo prático', 'h3'))

    blocks.push(createMixedBlock([
        { text: '1) Higienize as mãos', marks: ['strong'] },
        { text: ' antes de tocar no rosto e na máscara.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: '2) Aqueça conforme o fabricante', marks: ['strong'] },
        { text: ' (micro-ondas/água quente/bolsa térmica — depende do modelo).' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: '3) Teste a temperatura', marks: ['strong'] },
        { text: ' no antebraço: deve estar ' },
        { text: 'morna e confortável', marks: ['strong'] },
        { text: ', nunca "ardendo".' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: '4) Aplique com os olhos fechados', marks: ['strong'] },
        { text: ' por alguns minutos. A AAO descreve rotinas conservadoras com aquecimento e cuidados palpebrais em tempos curtos e repetidos, conforme orientação clínica.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: '5) Se orientado pelo seu oftalmologista, faça ' },
        { text: 'higiene palpebral', marks: ['strong'] },
        { text: ' após o aquecimento (limpeza suave da borda palpebral).' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: '6) Use lubrificante ocular', marks: ['strong'] },
        { text: ' se houver recomendação (principalmente em telas, ar-condicionado, viagens).' }
    ], 'normal', 'bullet'))

    blocks.push(createBlock('Erros comuns que atrapalham', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'Usar ' },
        { text: 'quente demais', marks: ['strong'] },
        { text: ' (risco de irritação cutânea e piora do desconforto).' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Usar a máscara ' },
        { text: 'suja', marks: ['strong'] },
        { text: ' ou mal armazenada.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Fazer "quando lembra" e abandonar: os melhores resultados costumam vir com ' },
        { text: 'rotina', marks: ['strong'] },
        { text: '.' }
    ], 'normal', 'bullet'))

    blocks.push(createListItem('Tratar só com calor e ignorar a causa (alergia, blefarite importante, uso de lentes, colírios com conservante, etc.).', 'bullet'))

    blocks.push(createBlockquote('Importante: este conteúdo é educativo e não substitui consulta. O tempo ideal de aplicação e a frequência devem ser ajustados ao seu caso.'))

    // Seção 5: O que piora os sintomas
    blocks.push(createBlock('O que piora os sintomas no dia a dia (e como ajustar)', 'h2'))

    blocks.push(createBlock('Alguns gatilhos são muito comuns na região e na rotina moderna — e frequentemente passam despercebidos.'))

    blocks.push(createMixedBlock([
        { text: 'Telas (celular, computador, TV):', marks: ['strong'] },
        { text: ' reduzimos a frequência do piscar; a lágrima evapora mais.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Ar-condicionado e ventilador:', marks: ['strong'] },
        { text: ' secam o ambiente e aceleram a evaporação.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Direção, moto e vento:', marks: ['strong'] },
        { text: ' vento direto nos olhos piora muito o olho seco evaporativo.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Maquiagem e demaquilante mal removidos:', marks: ['strong'] },
        { text: ' podem obstruir glândulas e piorar blefarite.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Lentes de contato:', marks: ['strong'] },
        { text: ' podem piorar sintomas se não houver adaptação correta e acompanhamento.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Sono ruim e estresse:', marks: ['strong'] },
        { text: ' aumentam queixas de ardor e cansaço ocular em muitos pacientes.' }
    ], 'normal', 'bullet'))

    blocks.push(createBlock('Ajustes simples ajudam:'))

    blocks.push(createMixedBlock([
        { text: 'Regra ' },
        { text: '20-20-20', marks: ['strong'] },
        { text: ' nas telas (a cada 20 minutos, olhar 20 segundos para longe).' }
    ], 'normal', 'bullet'))

    blocks.push(createListItem('Piscar de forma consciente em leitura e trabalho.', 'bullet'))

    blocks.push(createListItem('Evitar vento direto no rosto.', 'bullet'))

    blocks.push(createListItem('Manter a higiene palpebral regular (quando indicada).', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Reavaliar lentes de contato com ' },
        { text: 'adaptação', marks: ['strong'] },
        { text: ' e revisão na clínica.' }
    ], 'normal', 'bullet'))

    // Seção 6: Diagnóstico
    blocks.push(createBlock('Diagnóstico: quais exames o oftalmologista pode solicitar', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'Na ' },
        { text: 'Clínica Saraiva Vision (Caratinga, MG)', marks: ['strong'] },
        { text: ', a investigação pode incluir, conforme necessidade clínica:' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Consulta oftalmológica completa', marks: ['strong'] },
        { text: ' e avaliação da superfície ocular.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Testes para lágrima', marks: ['strong'] },
        { text: ', como ' },
        { text: 'Schirmer', marks: ['strong'] },
        { text: ' (quantidade) e avaliação clínica do filme lacrimal.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Meibografia', marks: ['strong'] },
        { text: ' (quando indicada): exame que avalia as glândulas meibomianas e auxilia a entender a DGM.' }
    ], 'normal', 'bullet'))

    blocks.push(createListItem('Avaliação da borda palpebral e sinais de blefarite.', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Em alguns casos, revisão do uso de colírios, maquiagem, rotina de telas e ' },
        { text: 'lentes de contato', marks: ['strong'] },
        { text: '.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Esse passo é essencial: ' },
        { text: 'a máscara térmica é uma ferramenta', marks: ['strong'] },
        { text: ', mas o melhor resultado vem quando ela entra num plano completo (hábitos + tratamento + acompanhamento).' }
    ]))

    // Seção 7: Quando procurar o oftalmo
    blocks.push(createBlock('Quando devo procurar o oftalmo?', 'h2'))

    blocks.push(createBlock('Procure avaliação com prioridade se você notar:'))

    blocks.push(createMixedBlock([
        { text: 'Visão embaçada persistente', marks: ['strong'] },
        { text: ' (especialmente se não melhora ao piscar).' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Dor ocular intensa', marks: ['strong'] },
        { text: ' ou piora progressiva.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Sensibilidade à luz', marks: ['strong'] },
        { text: ' súbita/importante.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Vermelhidão forte', marks: ['strong'] },
        { text: ' com secreção, inchaço importante ou suspeita de infecção.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Manchas, flashes de luz ou "moscas volantes"', marks: ['strong'] },
        { text: ' novos.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Queda brusca de visão', marks: ['strong'] },
        { text: '.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'E mesmo sem sinais de urgência: se você já usa compressas/máscara térmica e ' },
        { text: 'continua com ardor e desconforto', marks: ['strong'] },
        { text: ', vale consultar para investigar DGM, blefarite, alergias, uso de lentes e outras causas.' }
    ]))

    // Seção 8: Próximos passos
    blocks.push(createBlock('Próximos passos', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'Se você suspeita de ' },
        { text: 'olho seco', marks: ['strong'] },
        { text: ', ' },
        { text: 'blefarite', marks: ['strong'] },
        { text: ' ou ' },
        { text: 'DGM', marks: ['strong'] },
        { text: ', um caminho seguro costuma ser:' }
    ]))

    blocks.push(createMixedBlock([
        { text: '1) Agendar uma consulta', marks: ['strong'] },
        { text: ' para avaliação completa da superfície ocular.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: '2) Fazer exames diagnósticos', marks: ['strong'] },
        { text: ' quando indicados (ex.: testes lacrimais e meibografia).' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: '3) Ajustar a rotina', marks: ['strong'] },
        { text: ' (telas, ambiente, higiene palpebral) com orientação.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: '4) Definir um plano personalizado', marks: ['strong'] },
        { text: ', que pode incluir máscara térmica, lubrificantes, tratamento palpebral e acompanhamento.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Na ' },
        { text: 'Clínica Saraiva Vision', marks: ['strong'] },
        { text: ', em ' },
        { text: 'Caratinga (MG)', marks: ['strong'] },
        { text: ', o cuidado é liderado pelo ' },
        { text: 'Dr. Philipe Saraiva Cruz (CRM-MG 69.870)', marks: ['strong'] },
        { text: ' e equipe, com foco em atendimento humanizado e tecnologia diagnóstica.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Pronto para cuidar melhor da sua visão?', marks: ['strong'] }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Agende sua consulta na ' },
        { text: 'Clínica Saraiva Vision', marks: ['strong'] },
        { text: ': ' },
        { text: '(33) 99860-1427', marks: ['strong'] },
        { text: '.' }
    ]))

    // Box de prova social
    blocks.push(createBlock('Depoimento', 'h2'))

    blocks.push(createBlockquote('"Eu achava que era \'normal\' sentir ardor todo dia por causa do celular e do ar-condicionado. Depois da avaliação e das orientações certinhas (inclusive com aquecimento e higiene das pálpebras), meu conforto melhorou muito." — Depoimento de paciente (relato ilustrativo)'))

    blocks.push(createBlock('Métrica institucional:', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'Atendimento em ' },
        { text: 'Caratinga (MG)', marks: ['strong'] },
        { text: ' com foco em superfície ocular, blefarite e DGM, utilizando ' },
        { text: 'exames diagnósticos', marks: ['strong'] },
        { text: ' (como avaliação lacrimal e ' },
        { text: 'meibografia', marks: ['strong'] },
        { text: ', quando indicada) para guiar condutas.' }
    ], 'normal', 'bullet'))

    // FAQ
    blocks.push(createBlock('FAQ: dúvidas comuns em Caratinga, MG', 'h2'))

    blocks.push(createBlock('A máscara térmica substitui colírio lubrificante?', 'h3'))

    blocks.push(createBlock('Não necessariamente. Em DGM/blefarite, ela pode ser parte do tratamento, mas muitas pessoas também se beneficiam de lubrificantes, higiene palpebral e ajustes de rotina. O ideal é orientar caso a caso com o oftalmologista.'))

    blocks.push(createBlock('Vocês fazem adaptação de lentes de contato mesmo para quem tem olho seco?', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'Sim. A ' },
        { text: 'adaptação de lentes de contato', marks: ['strong'] },
        { text: ' pode ser feita com avaliação criteriosa, orientando tipo de lente, tempo de uso, lubrificação e acompanhamento — especialmente em quem tem sintomas de ressecamento.' }
    ]))

    blocks.push(createBlock('A Clínica Saraiva Vision atende em Caratinga, MG? Como agendar?', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'Sim, atendimento em ' },
        { text: 'Caratinga (MG)', marks: ['strong'] },
        { text: '. Para agendar consulta, entre em contato: ' },
        { text: '(33) 99860-1427', marks: ['strong'] },
        { text: '.' }
    ]))

    blocks.push(createBlock('Vocês realizam exames para investigar olho seco e DGM?', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'Sim. Além da consulta, podemos indicar exames conforme necessidade clínica, como ' },
        { text: 'testes lacrimais (ex.: Schirmer)', marks: ['strong'] },
        { text: ' e ' },
        { text: 'meibografia', marks: ['strong'] },
        { text: ', entre outros, para planejar o tratamento.' }
    ]))

    blocks.push(createBlock('Quais planos de saúde são atendidos?', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'Como a lista de convênios pode mudar, o mais seguro é confirmar no agendamento pelo telefone ' },
        { text: '(33) 99860-1427', marks: ['strong'] },
        { text: ', informando seu plano e a modalidade.' }
    ]))

    blocks.push(createBlock('Em quanto tempo consigo consulta?', 'h3'))

    blocks.push(createMixedBlock([
        { text: 'A disponibilidade varia por demanda e agenda. Recomendamos chamar no ' },
        { text: '(33) 99860-1427', marks: ['strong'] },
        { text: ' para verificar os horários mais próximos e encaixes.' }
    ]))

    // Referências
    blocks.push(createBlock('Referências', 'h2'))

    blocks.push(createMixedBlock([
        { text: 'American Academy of Ophthalmology (EyeWiki). ' },
        { text: 'Meibomian Gland Dysfunction (MGD)', marks: ['strong'] },
        { text: ' — manejo clínico inclui higiene palpebral e aquecimento com compressas/máscaras.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'American Academy of Ophthalmology (EyeWiki). ' },
        { text: 'Dry Eye Syndrome', marks: ['strong'] },
        { text: ' (visão geral e condições associadas).' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Craig JP, Nichols KK, Akpek EK, et al. ' },
        { text: 'TFOS DEWS II Management and Therapy Report', marks: ['strong'] },
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

    // Buscar categoria "Tratamentos" que é a mais adequada para o artigo
    const existingCategory = await client.fetch(
        `*[_type == "category" && slug.current == "tratamentos"][0]{ _id, title }`
    )

    if (existingCategory) {
        console.log(`✅ Categoria encontrada: ${existingCategory.title} (${existingCategory._id})`)
        return existingCategory._id
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
        `*[_type == "blogPost" && slug.current == "caratinga-mg-mascara-termica-oftalmica-olho-seco-blefarite-dgm"][0]{ _id, title }`
    )

    if (existingPost) {
        console.log(`⚠️  Artigo já existe: ${existingPost.title} (${existingPost._id})`)
        return existingPost._id
    }

    return null
}

async function publishArticle() {
    console.log('═'.repeat(60))
    console.log('📰 Publicando artigo: Máscara térmica oftálmica')
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
            title: 'Máscara térmica oftálmica para olho seco e blefarite em Caratinga, MG',
            slug: {
                _type: 'slug',
                current: 'caratinga-mg-mascara-termica-oftalmica-olho-seco-blefarite-dgm'
            },
            excerpt: 'Saiba como a máscara térmica ajuda no olho seco, blefarite e DGM. Quando usar, cuidados e quando procurar oftalmo em Caratinga, MG.',
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
                'máscara térmica oftálmica',
                'síndrome do olho seco',
                'blefarite',
                'disfunção das glândulas meibomianas',
                'DGM',
                'compressa morna para olhos',
                'higiene palpebral',
                'oftalmologista em Caratinga MG',
                'Clínica Saraiva Vision'
            ],
            publishedAt: new Date().toISOString(),
            featured: false,
            seo: {
                metaTitle: 'Máscara térmica oftálmica para olho seco e blefarite em Caratinga, MG | Clínica Saraiva Vision',
                metaDescription: 'Saiba como a máscara térmica ajuda no olho seco, blefarite e DGM. Quando usar, cuidados e quando procurar oftalmo em Caratinga, MG.',
                keywords: [
                    'máscara térmica oftálmica',
                    'síndrome do olho seco',
                    'blefarite',
                    'disfunção das glândulas meibomianas',
                    'DGM',
                    'compressa morna para olhos',
                    'higiene palpebral',
                    'oftalmologista em Caratinga MG'
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
