/**
 * FAQ Data for Saraiva Vision
 * Structured questions and answers with HTML support
 * Used for FAQ page and schema markup
 */

// General FAQs for main FAQ page
export const generalFAQs = [
  {
    question: 'Como agendar uma consulta na Clínica Saraiva Vision?',
    answer: `
      <p>Você pode agendar sua consulta de 3 formas:</p>
      <ul>
        <li><strong>WhatsApp:</strong> (33) 99860-1427 - Atendimento rápido e direto</li>
        <li><strong>Telefone:</strong> (33) 99860-1427 - Horário comercial</li>
        <li><strong>Online:</strong> Através do nosso <a href="/agendamento" class="text-primary-600 hover:underline">formulário de agendamento</a></li>
      </ul>
      <p>Nossa equipe responde rapidamente e oferece horários flexíveis para sua conveniência.</p>
    `,
  },
  {
    question: 'Onde fica a Clínica Saraiva Vision em Caratinga?',
    answer: `
      <p><strong>Endereço:</strong> Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga/MG - CEP 35300-000</p>
      <p>Estamos localizados em uma região de fácil acesso, com estacionamento próximo e transporte público.</p>
      <p><a href="https://maps.google.com/?q=-19.7896,-42.1397" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline">Ver no Google Maps</a></p>
    `,
  },
  {
    question: 'Quais convênios a Clínica Saraiva Vision aceita?',
    answer: `
      <p>Trabalhamos com diversos convênios médicos. Para consultar se seu plano é aceito, entre em contato conosco:</p>
      <ul>
        <li>WhatsApp: (33) 99860-1427</li>
        <li>Telefone: (33) 99860-1427</li>
      </ul>
      <p>Também atendemos <strong>particular</strong> com valores acessíveis e <strong>planos de saúde próprios</strong> para consultas e exames regulares.</p>
    `,
  },
  {
    question: 'Qual é o horário de funcionamento da clínica?',
    answer: `
      <p><strong>Horário de Atendimento:</strong></p>
      <ul>
        <li>Segunda a Sexta: 08:00 às 18:00</li>
        <li>Sábados e Domingos: Fechado</li>
      </ul>
      <p>Para emergências oftalmológicas, entre em contato pelo WhatsApp (33) 99860-1427.</p>
    `,
  },
  {
    question: 'Preciso de encaminhamento médico para consultar?',
    answer: `
      <p><strong>Não é necessário encaminhamento!</strong> Você pode agendar sua consulta oftalmológica diretamente conosco.</p>
      <p>No entanto, se você possui um encaminhamento ou pedido médico, traga-o na consulta para facilitar o atendimento.</p>
    `,
  },
  {
    question: 'Quanto tempo dura uma consulta oftalmológica?',
    answer: `
      <p>Uma consulta oftalmológica completa geralmente dura entre <strong>30 a 60 minutos</strong>, dependendo do tipo de avaliação:</p>
      <ul>
        <li><strong>Consulta de rotina:</strong> 30-40 minutos</li>
        <li><strong>Primeira consulta:</strong> 40-60 minutos (inclui anamnese detalhada)</li>
        <li><strong>Consulta com exames:</strong> 60-90 minutos (mapeamento de retina, campo visual, etc.)</li>
      </ul>
      <p>Recomendamos chegar com 10 minutos de antecedência para o cadastro.</p>
    `,
  },
  {
    question: 'A Clínica Saraiva Vision realiza cirurgias?',
    answer: `
      <p>Sim! Realizamos diversos tipos de <a href="/servicos/cirurgias-oftalmologicas" class="text-primary-600 hover:underline">cirurgias oftalmológicas</a>, incluindo:</p>
      <ul>
        <li>Cirurgia de catarata</li>
        <li>Pterígio</li>
        <li>Cirurgias refrativas (indicação e encaminhamento)</li>
        <li>Procedimentos a laser</li>
      </ul>
      <p>As cirurgias são realizadas em ambiente hospitalar equipado, com toda segurança e tecnologia necessária.</p>
    `,
  },
  {
    question: 'Com que frequência devo fazer exames oftalmológicos?',
    answer: `
      <p>A frequência recomendada varia de acordo com a idade e condições de saúde:</p>
      <ul>
        <li><strong>Crianças (0-5 anos):</strong> Teste do olhinho ao nascer + consultas anuais</li>
        <li><strong>Crianças e adolescentes (6-18 anos):</strong> Anualmente ou conforme necessidade escolar</li>
        <li><strong>Adultos (19-40 anos):</strong> A cada 2 anos (sem problemas de visão)</li>
        <li><strong>Adultos (40-60 anos):</strong> Anualmente (risco de presbiopia e glaucoma)</li>
        <li><strong>Idosos (60+ anos):</strong> Anualmente ou semestralmente (risco de catarata e DMRI)</li>
      </ul>
      <p>Diabéticos e pessoas com histórico familiar de doenças oculares devem consultar anualmente, independentemente da idade.</p>
    `,
  },
];

// Service-specific FAQs
export const serviceFAQs = {
  catarata: [
    {
      question: 'O que é catarata e quais são os sintomas?',
      answer: `
        <p>A catarata é a opacificação do cristalino (lente natural do olho), causando visão embaçada progressiva.</p>
        <p><strong>Sintomas principais:</strong></p>
        <ul>
          <li>Visão embaçada ou nublada</li>
          <li>Sensibilidade à luz (fotofobia)</li>
          <li>Dificuldade para dirigir à noite</li>
          <li>Halos ao redor de luzes</li>
          <li>Necessidade frequente de trocar óculos</li>
        </ul>
      `,
    },
    {
      question: 'A cirurgia de catarata é dolorosa?',
      answer: `
        <p><strong>Não, a cirurgia de catarata não dói!</strong></p>
        <p>O procedimento é realizado com <strong>anestesia local</strong> (colírio anestésico), e você permanece acordado mas sem sentir dor.</p>
        <p>Após a cirurgia, é normal sentir leve desconforto ou sensação de corpo estranho por 24-48 horas, facilmente controlado com medicação.</p>
      `,
    },
    {
      question: 'Quanto tempo dura a recuperação da cirurgia de catarata?',
      answer: `
        <p>A recuperação é rápida:</p>
        <ul>
          <li><strong>1-2 dias:</strong> Melhora significativa da visão</li>
          <li><strong>1 semana:</strong> Retorno a atividades leves</li>
          <li><strong>2-4 semanas:</strong> Recuperação completa</li>
        </ul>
        <p>Durante o período de recuperação, evite:</p>
        <ul>
          <li>Esforços físicos intensos</li>
          <li>Nadar ou entrar em piscinas</li>
          <li>Coçar ou pressionar os olhos</li>
        </ul>
      `,
    },
  ],

  glaucoma: [
    {
      question: 'O que é glaucoma e como é detectado?',
      answer: `
        <p>Glaucoma é uma doença que danifica o nervo óptico, geralmente causada por pressão intraocular elevada.</p>
        <p><strong>Detecção:</strong></p>
        <ul>
          <li>Medição da pressão intraocular (tonometria)</li>
          <li>Exame de fundo de olho</li>
          <li>Campo visual computadorizado</li>
          <li>OCT de nervo óptico</li>
        </ul>
        <p>O glaucoma é <strong>silencioso</strong> nos estágios iniciais, por isso exames regulares são essenciais.</p>
      `,
    },
    {
      question: 'Glaucoma tem cura?',
      answer: `
        <p>Glaucoma <strong>não tem cura</strong>, mas pode ser <strong>controlado</strong> para preservar a visão.</p>
        <p><strong>Tratamentos disponíveis:</strong></p>
        <ul>
          <li><strong>Colírios:</strong> Reduzem a pressão intraocular</li>
          <li><strong>Laser:</strong> Trabeculoplastia ou iridotomia</li>
          <li><strong>Cirurgia:</strong> Trabeculectomia em casos avançados</li>
        </ul>
        <p>Com tratamento adequado e acompanhamento regular, é possível manter a visão estável.</p>
      `,
    },
  ],

  presbiopia: [
    {
      question: 'O que é presbiopia (vista cansada)?',
      answer: `
        <p>Presbiopia, conhecida como "vista cansada", é a <strong>perda natural da capacidade de focar objetos próximos</strong> após os 40 anos.</p>
        <p>Ocorre porque o cristalino perde elasticidade, dificultando a acomodação para perto.</p>
        <p><strong>Sintomas:</strong></p>
        <ul>
          <li>Dificuldade para ler textos pequenos</li>
          <li>Necessidade de afastar livros ou celular</li>
          <li>Fadiga visual ao ler</li>
        </ul>
      `,
    },
    {
      question: 'Qual a diferença entre monovisão e lentes multifocais?',
      answer: `
        <p><strong>Monovisão:</strong></p>
        <ul>
          <li>Um olho corrigido para longe, outro para perto</li>
          <li>Mais econômica</li>
          <li>Adaptação mais rápida (2-4 semanas)</li>
          <li>Pode reduzir percepção de profundidade</li>
        </ul>
        <p><strong>Lentes Multifocais:</strong></p>
        <ul>
          <li>Visão clara em todas as distâncias</li>
          <li>Preserva visão binocular</li>
          <li>Custo mais elevado</li>
          <li>Adaptação mais longa (3-6 meses)</li>
        </ul>
        <p><a href="/blog/monovisao-lentes-multifocais-presbiopia-caratinga-mg" class="text-primary-600 hover:underline">Leia nosso guia completo</a></p>
      `,
    },
  ],
};

// Blog post FAQs (can be added to specific blog posts)
export const blogFAQs = {
  'monovisao-lentes-multifocais': [
    {
      question: 'Qual é mais barata: monovisão ou lentes multifocais?',
      answer: 'A monovisão é significativamente mais econômica, custando de 50% a 70% menos que lentes multifocais.',
    },
    {
      question: 'Posso dirigir com monovisão?',
      answer: 'Sim, mas pode haver redução da percepção de profundidade. A maioria dos pacientes se adapta bem, mas recomenda-se cautela inicial.',
    },
    {
      question: 'Quanto tempo leva para se adaptar a lentes multifocais?',
      answer: 'A adaptação completa geralmente leva de 3 a 6 meses. Nos primeiros dias, é comum perceber halos noturnos e necessidade de ajuste cerebral.',
    },
  ],
};

export default generalFAQs;
