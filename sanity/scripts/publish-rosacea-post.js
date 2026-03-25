#!/usr/bin/env node

/**
 * Script para publicar artigo "Olho Seco e Rosácea Ocular"
 * 
 * Este script cria o artigo no Sanity CMS com todos os metadados SEO
 * 
 * Data: 2026-02-16
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Configurar dotenv para ler do arquivo .env na raiz do projeto ou na pasta sanity
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// Se não encontrar na raiz, tenta na pasta sanity (caso esteja rodando de lá)
if (!process.env.SANITY_TOKEN) {
    dotenv.config()
}

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
    blocks.push(createBlock('Olho Seco e Rosácea Ocular: Como o Tratamento com IRPL E-Eye Pode Transformar Sua Qualidade de Vida em Caratinga, MG', 'h1'))
    
    blocks.push(createBlock('Você já sentiu seus olhos ardendo, com sensação de areia ou vermelhidão constante? Esses sintomas podem parecer simples, mas indicam um problema muito comum: a síndrome do olho seco. Em Caratinga e região, assim como em todo o Brasil, essa condição afeta milhares de pessoas e pode estar relacionada à rosácea ocular, uma inflamação crônica das pálpebras que compromete a qualidade das lágrimas.'))

    blocks.push(createMixedBlock([
        { text: 'Na ' },
        { text: 'Clínica Saraiva Vision', marks: ['strong'] },
        { text: ', sob a liderança do ' },
        { text: 'Dr. Philipe Saraiva Cruz (CRM-MG 69.870)', marks: ['strong'] },
        { text: ' e sua equipe qualificada, você encontra um atendimento humanizado e acesso a tecnologias modernas, como o ' },
        { text: 'IRPL E-Eye', marks: ['strong'] },
        { text: ', aprovado pela ANVISA para tratar o olho seco causado pela disfunção das glândulas de Meibômio.' }
    ]))

    blocks.push(createBlock('Neste artigo, você vai entender o que é olho seco, como a rosácea ocular agrava esse problema e como o tratamento inovador com IRPL pode aliviar seus sintomas e devolver o conforto aos seus olhos. Continue lendo para descobrir sinais de alerta, opções de diagnóstico e os próximos passos para cuidar da sua visão.'))

    // Seção 1
    blocks.push(createBlock('O que é a Síndrome do Olho Seco?', 'h2'))
    
    blocks.push(createBlock('A síndrome do olho seco é uma condição em que a produção de lágrimas é insuficiente ou a qualidade da lágrima está comprometida, levando à instabilidade da película lacrimal que protege e lubrifica a superfície dos olhos.'))

    blocks.push(createMixedBlock([
        { text: 'Estudos brasileiros mostram que essa condição afeta aproximadamente ' },
        { text: '24,4% da população adulta', marks: ['strong'] },
        { text: ', com maior prevalência em mulheres (26,86%) do que em homens (18,18%). No Brasil, estima-se que cerca de ' },
        { text: '34% dos adultos acima de 18 anos', marks: ['strong'] },
        { text: ' apresentem sintomas relacionados ao olho seco.' }
    ]))

    blocks.push(createBlock('Tipos de Olho Seco', 'h3'))
    
    blocks.push(createMixedBlock([
        { text: 'Olho seco evaporativo: ', marks: ['strong'] },
        { text: 'O tipo mais comum, causado pela disfunção das glândulas de Meibômio (DGM), que produzem a camada oleosa da lágrima. Quando essas glândulas estão obstruídas ou inflamadas, a lágrima evapora rapidamente, deixando os olhos secos e irritados.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Olho seco aquoso: ', marks: ['strong'] },
        { text: 'Menos comum, ocorre quando há baixa produção da camada aquosa (líquida) da lágrima, geralmente associado a condições autoimunes como a síndrome de Sjögren.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'A maioria dos casos de olho seco evaporativo está relacionada à ' },
        { text: 'disfunção das glândulas de Meibômio (DGM)', marks: ['strong'] },
        { text: ', que pode ser agravada pela rosácea ocular.' }
    ]))

    // Seção 2
    blocks.push(createBlock('Rosácea Ocular: Como Ela Piora o Olho Seco?', 'h2'))
    blocks.push(createBlock('A rosácea ocular é uma manifestação inflamatória crônica que afeta as pálpebras e a superfície ocular. Ela está frequentemente associada à rosácea cutânea (vermelhidão facial), mas pode ocorrer de forma independente.'))

    blocks.push(createBlock('Como a Rosácea Afeta os Olhos?', 'h3'))
    blocks.push(createBlock('A inflamação causada pela rosácea engrossa e obstrui as glândulas de Meibômio, reduzindo a produção da camada oleosa da lágrima. Sem essa proteção, a lágrima evapora rapidamente, causando irritação e secura crônica.'))

    blocks.push(createBlock('Fatores Agravantes', 'h3'))
    blocks.push(createMixedBlock([
        { text: 'Inflamação crônica: ', marks: ['strong'] },
        { text: 'Libera citocinas pró-inflamatórias que danificam a superfície ocular.' }
    ], 'normal', 'bullet'))
    
    blocks.push(createMixedBlock([
        { text: 'Infestação por ácaros Demodex: ', marks: ['strong'] },
        { text: 'Comum em pacientes com rosácea, esses ácaros bloqueiam as glândulas de Meibômio e podem causar terçóis e calázios recorrentes.' }
    ], 'normal', 'bullet'))

    blocks.push(createBlock('Sintomas Comuns da Rosácea Ocular', 'h3'))
    blocks.push(createListItem('Sensação de areia ou corpo estranho nos olhos', 'bullet'))
    blocks.push(createListItem('Ardência e queimação', 'bullet'))
    blocks.push(createListItem('Vermelhidão ocular e palpebral', 'bullet'))
    blocks.push(createListItem('Lacrimejamento paradoxal (olhos lacrimejam em resposta à secura)', 'bullet'))
    blocks.push(createListItem('Fotofobia (sensibilidade à luz)', 'bullet'))
    blocks.push(createListItem('Visão embaçada, especialmente após uso de telas ou exposição ao vento', 'bullet'))
    blocks.push(createListItem('Terçóis ou calázios de repetição', 'bullet'))

    blocks.push(createBlock('Se não tratada adequadamente, a rosácea ocular pode comprometer a visão devido à irritação persistente e problemas corneanos.'))

    // Seção 3
    blocks.push(createBlock('Fatores de Risco: Quem Está Mais Sujeito ao Olho Seco?', 'h2'))
    blocks.push(createBlock('Diversos fatores podem aumentar o risco de desenvolver a síndrome do olho seco:'))

    blocks.push(createBlock('Idade e Sexo', 'h3'))
    blocks.push(createMixedBlock([
        { text: 'Idade acima de 50 anos: ', marks: ['strong'] },
        { text: 'A produção de lágrimas diminui naturalmente com o envelhecimento. Estudos mostram maior risco em idosos, especialmente em áreas urbanas.' }
    ], 'normal', 'bullet'))
    
    blocks.push(createMixedBlock([
        { text: 'Mulheres: ', marks: ['strong'] },
        { text: 'Alterações hormonais (menopausa, gravidez, uso de anticoncepcionais) aumentam significativamente o risco. Estudos indicam que mulheres entre 55-75 anos têm ' },
        { text: '3,11 vezes mais chances', marks: ['strong'] },
        { text: ' de desenvolver sintomas graves.' }
    ], 'normal', 'bullet'))

    blocks.push(createBlock('Estilo de Vida', 'h3'))
    blocks.push(createMixedBlock([
        { text: 'Uso prolongado de telas: ', marks: ['strong'] },
        { text: 'Passar mais de 6 horas por dia em frente a computadores, celulares ou tablets reduz a frequência de piscadas, levando ao ressecamento ocular.' }
    ], 'normal', 'bullet'))
    blocks.push(createMixedBlock([
        { text: 'Lentes de contato: ', marks: ['strong'] },
        { text: 'Uso prolongado pode agravar o olho seco.' }
    ], 'normal', 'bullet'))

    blocks.push(createBlock('Condições de Saúde', 'h3'))
    blocks.push(createMixedBlock([
        { text: 'Doenças autoimunes: ', marks: ['strong'] },
        { text: 'Artrite reumatoide, síndrome de Sjögren, lúpus e doenças da tireoide aumentam o risco.' }
    ], 'normal', 'bullet'))
    blocks.push(createMixedBlock([
        { text: 'Hipertensão: ', marks: ['strong'] },
        { text: 'Especialmente em mulheres, com 3,54 vezes mais chances de diagnóstico de olho seco.' }
    ], 'normal', 'bullet'))
    blocks.push(createListItem('Diabetes e deficiência de vitamina A.', 'bullet'))

    blocks.push(createBlock('Fatores Ambientais', 'h3'))
    blocks.push(createListItem('Ambientes secos, com ar-condicionado ou poluição', 'bullet'))
    blocks.push(createListItem('Exposição ao vento', 'bullet'))
    blocks.push(createListItem('Tabagismo', 'bullet'))

    blocks.push(createBlock('Medicamentos', 'h3'))
    blocks.push(createListItem('Antidepressivos, antialérgicos, diuréticos e outros medicamentos que reduzem a produção de lágrimas.', 'bullet'))

    // Seção 4
    blocks.push(createBlock('Como é Feito o Diagnóstico de Olho Seco?', 'h2'))
    blocks.push(createMixedBlock([
        { text: 'O diagnóstico preciso é fundamental para um tratamento eficaz. Na ' },
        { text: 'Clínica Saraiva Vision', marks: ['strong'] },
        { text: ', utilizamos tecnologias modernas e exames específicos para avaliar a saúde ocular:' }
    ]))

    blocks.push(createBlock('Avaliação Clínica', 'h3'))
    blocks.push(createBlock('O Dr. Philipe Saraiva Cruz e sua equipe realizam um exame oftalmológico completo, investigando:'))
    blocks.push(createListItem('Histórico médico e sintomas', 'bullet'))
    blocks.push(createListItem('Exame das pálpebras e superfície ocular', 'bullet'))
    blocks.push(createListItem('Questionário OSDI (Ocular Surface Disease Index) para quantificar sintomas', 'bullet'))

    blocks.push(createBlock('Exames Complementares', 'h3'))
    blocks.push(createMixedBlock([
        { text: 'Teste de Schirmer: ', marks: ['strong'] },
        { text: 'Mede a produção de lágrimas.' }
    ], 'normal', 'bullet'))
    blocks.push(createMixedBlock([
        { text: 'Teste de Ruptura do Filme Lacrimal (TBUT): ', marks: ['strong'] },
        { text: 'Avalia a estabilidade da lágrima.' }
    ], 'normal', 'bullet'))
    blocks.push(createMixedBlock([
        { text: 'Teste com Fluoresceína: ', marks: ['strong'] },
        { text: 'Identifica danos na córnea.' }
    ], 'normal', 'bullet'))
    blocks.push(createMixedBlock([
        { text: 'Meibografia: ', marks: ['strong'] },
        { text: 'Exame de imagem infravermelha não invasivo que visualiza as glândulas de Meibômio, permitindo diagnosticar obstruções, atrofia ou dilatação dessas glândulas. O exame dura menos de 5 minutos, é indolor e não requer contato direto com o olho ou dilatação pupilar.' }
    ], 'normal', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'A ' },
        { text: 'meibografia', marks: ['strong'] },
        { text: ' é especialmente importante porque diferencia o olho seco evaporativo (causado por deficiência lipídica) do olho seco aquoso, permitindo um tratamento personalizado e mais eficaz.' }
    ]))

    // Seção 5
    blocks.push(createBlock('O que é o Tratamento com IRPL E-Eye?', 'h2'))
    blocks.push(createMixedBlock([
        { text: 'O ' },
        { text: 'IRPL (Intense Regulated Pulsed Light)', marks: ['strong'] },
        { text: ' é uma tecnologia inovadora que utiliza luz pulsada intensa regulada para tratar o olho seco causado pela disfunção das glândulas de Meibômio. O dispositivo ' },
        { text: 'E-Eye', marks: ['strong'] },
        { text: ' é o primeiro aprovado pela ANVISA no Brasil para esse fim.' }
    ]))

    blocks.push(createBlock('Como Funciona o IRPL?', 'h3'))
    blocks.push(createBlock('O tratamento aplica pulsos de luz policromática "fria" (515-1200nm) na região periorbital (ao redor dos olhos), estimulando as glândulas de Meibômio obstruídas. O mecanismo inclui:'))
    blocks.push(createMixedBlock([{ text: 'Liquefação da secreção oleosa acumulada (meibum)', marks: ['strong'] }, { text: ' dentro das glândulas' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Redução da inflamação vascular', marks: ['strong'] }, { text: ' nas pálpebras' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Normalização da camada lipídica da lágrima', marks: ['strong'] }, { text: ', prevenindo evaporação excessiva' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Estímulo à contração das glândulas', marks: ['strong'] }, { text: ', melhorando sua função' }], 'normal', 'bullet'))

    blocks.push(createBlock('Protocolo de Tratamento', 'h3'))
    blocks.push(createMixedBlock([{ text: 'Sessões iniciais: ', marks: ['strong'] }, { text: 'Geralmente 3 sessões, com possibilidade de uma 4ª sessão em casos mais resistentes' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Duração: ', marks: ['strong'] }, { text: 'Cada sessão dura de 3 a 5 minutos' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Procedimento: ', marks: ['strong'] }, { text: 'Indolor e não invasivo, com proteção ocular adequada' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Manutenção: ', marks: ['strong'] }, { text: '1 a 2 sessões anuais para resultados duradouros' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Melhora cumulativa: ', marks: ['strong'] }, { text: 'Os benefícios são progressivos, com duração de aproximadamente 1 semana após a 1ª sessão, 2-3 semanas após a 2ª, e mais prolongada após o protocolo completo' }], 'normal', 'bullet'))

    blocks.push(createBlock('Eficácia Comprovada', 'h3'))
    blocks.push(createBlock('Estudos clínicos demonstram melhora significativa em:'))
    blocks.push(createListItem('Sintomas (ardência, irritação, vermelhidão)', 'bullet'))
    blocks.push(createListItem('Qualidade da lágrima', 'bullet'))
    blocks.push(createListItem('Tempo de ruptura do filme lacrimal (TBUT)', 'bullet'))
    blocks.push(createListItem('Índice OSDI', 'bullet'))
    blocks.push(createListItem('Osmolaridade lacrimal', 'bullet'))

    blocks.push(createBlock('Segurança', 'h3'))
    blocks.push(createBlock('O IRPL E-Eye é certificado e regulamentado pela ANVISA. O tratamento é seguro, sem efeitos colaterais significativos reportados, sem risco de queimaduras ou despigmentação cutânea (diferente de IPLs estéticos).'))

    blocks.push(createBlock('Melhores Resultados', 'h3'))
    blocks.push(createBlock('O IRPL é mais eficaz para casos de olho seco evaporativo causado por disfunção das glândulas de Meibômio. O tratamento funciona melhor quando combinado com:'))
    blocks.push(createListItem('Compressas quentes', 'bullet'))
    blocks.push(createListItem('Higiene palpebral', 'bullet'))
    blocks.push(createListItem('Suplementação de ômega-3', 'bullet'))
    blocks.push(createListItem('Colírios lubrificantes sem conservantes', 'bullet'))

    // Seção 6
    blocks.push(createBlock('Quando Devo Procurar um Oftalmologista?', 'h2'))
    
    blocks.push(createBlock('Sinais de Alerta', 'h3'))
    blocks.push(createBlock('Procure atendimento oftalmológico se você apresentar:'))
    blocks.push(createListItem('Sensação persistente de areia ou corpo estranho nos olhos', 'bullet'))
    blocks.push(createListItem('Ardência ou queimação constante', 'bullet'))
    blocks.push(createListItem('Vermelhidão ocular frequente', 'bullet'))
    blocks.push(createListItem('Lacrimejamento excessivo (lacrimejamento paradoxal)', 'bullet'))
    blocks.push(createListItem('Visão embaçada que melhora ao piscar', 'bullet'))
    blocks.push(createListItem('Fotofobia (sensibilidade à luz)', 'bullet'))
    blocks.push(createListItem('Fadiga visual, especialmente após uso de telas', 'bullet'))
    blocks.push(createListItem('Terçóis ou calázios recorrentes', 'bullet'))

    blocks.push(createMixedBlock([
        { text: 'Se os sintomas persistirem por mais de 2 semanas ou interferirem na sua visão e qualidade de vida, não espere', marks: ['strong'] },
        { text: ' — agende uma consulta com o Dr. Philipe Saraiva Cruz na Clínica Saraiva Vision.' }
    ]))

    // Seção 7
    blocks.push(createBlock('Prevenção do Olho Seco: Dicas Práticas', 'h2'))
    blocks.push(createBlock('Pequenas mudanças no dia a dia podem fazer grande diferença na saúde dos seus olhos:'))

    blocks.push(createBlock('No Trabalho e Estudos', 'h3'))
    blocks.push(createMixedBlock([{ text: 'Regra 20-20-20: ', marks: ['strong'] }, { text: 'A cada 20 minutos de tela, olhe para um objeto a 20 pés de distância (cerca de 6 metros) por 20 segundos.' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Piscar conscientemente: ', marks: ['strong'] }, { text: 'Ao usar telas, lembramos menos de piscar, o que resseca os olhos. Faça pausas para piscar várias vezes.' }], 'normal', 'bullet'))

    blocks.push(createBlock('No Ambiente', 'h3'))
    blocks.push(createMixedBlock([{ text: 'Use umidificadores', marks: ['strong'] }, { text: ' em ambientes com ar-condicionado ou aquecedores.' }], 'normal', 'bullet'))
    blocks.push(createListItem('Evite exposição direta a ventiladores ou ar-condicionado.', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Use óculos de proteção', marks: ['strong'] }, { text: ' em ambientes secos, poluídos ou com vento.' }], 'normal', 'bullet'))

    blocks.push(createBlock('Hidratação e Alimentação', 'h3'))
    blocks.push(createListItem('Beba bastante água ao longo do dia.', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Inclua alimentos ricos em ômega-3', marks: ['strong'] }, { text: ' (peixes, linhaça, chia) e vitamina A (cenoura, abóbora, vegetais verdes) na dieta.' }], 'normal', 'bullet'))

    blocks.push(createBlock('Cuidados Gerais', 'h3'))
    blocks.push(createMixedBlock([{ text: 'Use colírios lubrificantes sem conservantes', marks: ['strong'] }, { text: ', especialmente se usar telas por longos períodos.' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Limite o uso de lentes de contato', marks: ['strong'] }, { text: ' e siga rigorosamente as orientações de higiene.' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Não fume', marks: ['strong'] }, { text: ' e evite ambientes com fumaça.' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Faça exames oftalmológicos regulares', marks: ['strong'] }, { text: ', especialmente se tiver mais de 60 anos.' }], 'normal', 'bullet'))

    // Seção 8
    blocks.push(createBlock('Próximos Passos: Como a Clínica Saraiva Vision Pode Ajudar Você', 'h2'))
    blocks.push(createMixedBlock([
        { text: 'Na ' },
        { text: 'Clínica Saraiva Vision', marks: ['strong'] },
        { text: ', em Caratinga (MG), você encontra um atendimento humanizado e tecnologia de ponta para cuidar da saúde dos seus olhos. O ' },
        { text: 'Dr. Philipe Saraiva Cruz (CRM-MG 69.870)', marks: ['strong'] },
        { text: ' e sua equipe oferecem:' }
    ]))

    blocks.push(createMixedBlock([{ text: 'Consultas oftalmológicas completas', marks: ['strong'] }, { text: ' com avaliação personalizada' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Exames diagnósticos modernos', marks: ['strong'] }, { text: ', incluindo meibografia, teste de Schirmer, TBUT e outros' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Tratamento com IRPL E-Eye', marks: ['strong'] }, { text: ' para olho seco evaporativo e rosácea ocular' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Adaptação de lentes de contato', marks: ['strong'] }, { text: ' com orientação especializada' }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Tratamentos personalizados', marks: ['strong'] }, { text: ' para blefarite, disfunção das glândulas de Meibômio e outras condições oculares' }], 'normal', 'bullet'))

    // Depoimento
    blocks.push(createBlock('Box de Prova Social', 'h2'))
    blocks.push(createBlockquote('"Depois do tratamento com IRPL, minha vida mudou. Não sinto mais aquela ardência constante nos olhos e posso trabalhar no computador sem desconforto. Recomendo a Clínica Saraiva Vision!" — Paciente da Clínica Saraiva Vision, Caratinga, MG'))

    blocks.push(createBlock('Métricas Institucionais:', 'h3'))
    blocks.push(createMixedBlock([{ text: 'Mais de [X] pacientes atendidos anualmente em Caratinga e região', marks: [] }], 'normal', 'bullet'))
    blocks.push(createListItem('Tecnologia IRPL E-Eye aprovada pela ANVISA', 'bullet'))
    blocks.push(createListItem('Equipe liderada pelo Dr. Philipe Saraiva Cruz (CRM-MG 69.870), com atendimento humanizado e foco em resultados', 'bullet'))

    // FAQ
    blocks.push(createBlock('FAQ: Perguntas Frequentes sobre Olho Seco e IRPL', 'h2'))

    blocks.push(createBlock('1. Quanto tempo dura o tratamento com IRPL?', 'h3'))
    blocks.push(createBlock('O protocolo padrão inclui 3 a 4 sessões iniciais, cada uma durando de 3 a 5 minutos. As sessões são espaçadas de acordo com a avaliação do oftalmologista. Após o protocolo inicial, são recomendadas 1 a 2 sessões de manutenção anuais.'))

    blocks.push(createBlock('2. O tratamento com IRPL E-Eye dói?', 'h3'))
    blocks.push(createBlock('Não, o tratamento é indolor e não invasivo. Você pode sentir uma leve sensação de calor durante a aplicação dos pulsos de luz, mas o procedimento é bem tolerado.'))

    blocks.push(createBlock('3. A Clínica Saraiva Vision atende planos de saúde?', 'h3'))
    blocks.push(createMixedBlock([
        { text: 'Para informações sobre convênios e planos de saúde atendidos, entre em contato diretamente com a clínica pelo telefone ' },
        { text: '(33) 99860-1427', marks: ['strong'] },
        { text: ' ou pelo WhatsApp.' }
    ]))

    blocks.push(createBlock('4. Quanto tempo leva para sentir melhora após o tratamento?', 'h3'))
    blocks.push(createBlock('Os resultados são cumulativos. Muitos pacientes relatam melhora após a primeira sessão, com benefícios mais duradouros conforme o protocolo avança. A melhora pode durar de 6 meses a 3 anos, dependendo do caso.'))

    blocks.push(createBlock('5. Como é feito o agendamento de consultas na Clínica Saraiva Vision?', 'h3'))
    blocks.push(createMixedBlock([
        { text: 'Você pode agendar sua consulta diretamente pelo telefone ' },
        { text: '(33) 99860-1427', marks: ['strong'] },
        { text: ' ou através do site saraivavision.com.br. A clínica está localizada em Caratinga, MG, e atende a região com horários flexíveis.' }
    ]))

    blocks.push(createBlock('6. Quais exames são feitos para diagnosticar olho seco?', 'h3'))
    blocks.push(createBlock('Na Clínica Saraiva Vision, realizamos uma avaliação completa que pode incluir o questionário OSDI, teste de Schirmer, teste de ruptura do filme lacrimal (TBUT), teste com fluoresceína e meibografia. O Dr. Philipe Saraiva Cruz define os exames necessários de acordo com cada caso.'))

    // Conclusão
    blocks.push(createBlock('Conclusão', 'h2'))
    blocks.push(createMixedBlock([
        { text: 'A síndrome do olho seco e a rosácea ocular são condições que afetam milhões de brasileiros e podem comprometer significativamente sua qualidade de vida. Felizmente, tratamentos modernos como o ' },
        { text: 'IRPL E-Eye', marks: ['strong'] },
        { text: ' oferecem alívio eficaz e duradouro, especialmente para casos relacionados à disfunção das glândulas de Meibômio.' }
    ]))

    blocks.push(createMixedBlock([
        { text: 'Na ' },
        { text: 'Clínica Saraiva Vision', marks: ['strong'] },
        { text: ', você encontra atendimento humanizado, diagnóstico preciso e acesso a tecnologias aprovadas pela ANVISA para cuidar da saúde dos seus olhos. Não deixe que o desconforto ocular atrapalhe sua rotina — ' },
        { text: 'agende sua consulta hoje mesmo', marks: ['strong'] },
        { text: ' com o ' },
        { text: 'Dr. Philipe Saraiva Cruz (CRM-MG 69.870)', marks: ['strong'] },
        { text: ' e descubra como recuperar o conforto e a saúde dos seus olhos.' }
    ]))

    blocks.push(createBlock('Agende sua consulta:', 'h3'))
    blocks.push(createMixedBlock([{ text: 'Telefone/WhatsApp: (33) 99860-1427', marks: ['strong'] }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Site: saraivavision.com.br', marks: ['strong'] }], 'normal', 'bullet'))
    blocks.push(createMixedBlock([{ text: 'Endereço: Rua Catarina Maria Passos, 97 – Santa Zita, Caratinga/MG (dentro da Clínica Amor e Saúde)', marks: ['strong'] }], 'normal', 'bullet'))

    blocks.push(createBlock('Cuide dos seus olhos. Cuide da sua qualidade de vida. 👁️✨'))

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

    // Buscar categoria "Olho Seco" ou "Tratamentos"
    const existingCategory = await client.fetch(
        `*[_type == "category" && (slug.current == "olho-seco" || slug.current == "tratamentos" || title match "Olho Seco")][0]{ _id, title }`
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
        `*[_type == "blogPost" && slug.current == "olho-seco-rosacea-ocular-tratamento-irpl-e-eye-caratinga-mg"][0]{ _id, title }`
    )

    if (existingPost) {
        console.log(`⚠️  Artigo já existe: ${existingPost.title} (${existingPost._id})`)
        return existingPost._id
    }

    return null
}

async function publishArticle() {
    console.log('═'.repeat(60))
    console.log('📰 Publicando artigo: Olho Seco e Rosácea Ocular')
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
            title: 'Olho Seco e Rosácea Ocular: Tratamento com IRPL E-Eye em Caratinga, MG | Clínica Saraiva Vision',
            slug: {
                _type: 'slug',
                current: 'olho-seco-rosacea-ocular-tratamento-irpl-e-eye-caratinga-mg'
            },
            excerpt: 'Descubra como o tratamento com IRPL E-Eye pode ajudar no olho seco e rosácea ocular. Tecnologia avançada aprovada pela ANVISA em Caratinga, MG. Agende sua consulta.',
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
                'olho seco',
                'rosácea ocular',
                'IRPL E-Eye',
                'tratamento olho seco Caratinga',
                'disfunção glândulas Meibômio',
                'oftalmologista Caratinga MG',
                'meibografia',
                'síndrome olho seco'
            ],
            publishedAt: new Date().toISOString(),
            featured: false,
            seo: {
                metaTitle: 'Olho Seco e Rosácea Ocular: Tratamento com IRPL E-Eye em Caratinga, MG | Clínica Saraiva Vision',
                metaDescription: 'Descubra como o tratamento com IRPL E-Eye pode ajudar no olho seco e rosácea ocular. Tecnologia avançada aprovada pela ANVISA em Caratinga, MG. Agende sua consulta.',
                keywords: [
                    'olho seco',
                    'rosácea ocular',
                    'IRPL E-Eye',
                    'tratamento olho seco Caratinga',
                    'disfunção glândulas Meibômio',
                    'oftalmologista Caratinga MG',
                    'meibografia',
                    'síndrome olho seco'
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
        console.log('   Para adicionar a imagem, use o prompt sugerido no markdown original.')

    } catch (error) {
        console.error('\n❌ Erro ao publicar artigo:', error.message)
        if (error.details) {
            console.error('Detalhes:', JSON.stringify(error.details, null, 2))
        }
        process.exit(1)
    }
}

publishArticle()
