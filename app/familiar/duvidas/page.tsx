/**
 * Familiar - FAQ Page
 * Frequently asked questions specific to families
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dúvidas Frequentes | Saraiva Vision - Família',
  description:
    'Respostas para as principais dúvidas sobre saúde ocular familiar. Tudo sobre consultas, exames, planos e cuidados preventivos.'
};

export default function DuvidasPage() {
  return (
    <div className="duvidas-page">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="hero-container">
          <h1 className="hero-title">
            Dúvidas <span className="text-primary">Frequentes</span>
          </h1>
          <p className="hero-description">
            Encontre respostas rápidas para as principais perguntas sobre saúde ocular
            e nossos serviços.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="search"
              placeholder="Buscar dúvida..."
              className="search-input"
              aria-label="Buscar nas perguntas frequentes"
            />
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="faq-categories-section">
        <div className="section-container">
          <div className="categories-nav">
            <a href="#consultas" className="category-link">Consultas</a>
            <a href="#exames" className="category-link">Exames</a>
            <a href="#criancas" className="category-link">Crianças</a>
            <a href="#planos" className="category-link">Planos</a>
            <a href="#emergencias" className="category-link">Emergências</a>
          </div>
        </div>
      </section>

      {/* Consultas */}
      <section id="consultas" className="faq-section">
        <div className="section-container">
          <h2 className="section-title">Consultas e Agendamento</h2>

          <div className="faq-list">
            <div className="faq-item">
              <h3 className="faq-question">
                <span className="faq-icon">❓</span>
                Como agendar uma consulta?
              </h3>
              <div className="faq-answer">
                <p>Você pode agendar de três formas:</p>
                <ul>
                  <li><strong>Online:</strong> Através do nosso site, disponível 24/7</li>
                  <li><strong>Telefone:</strong> Ligando para (33) 3321-3700 em horário comercial</li>
                  <li><strong>WhatsApp:</strong> Enviando mensagem para (33) 9 3321-3700</li>
                </ul>
                <p>Clientes dos planos familiares têm prioridade no agendamento.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">
                <span className="faq-icon">❓</span>
                Quanto tempo dura uma consulta?
              </h3>
              <div className="faq-answer">
                <p>
                  Uma consulta oftalmológica completa dura em média 30 a 45 minutos,
                  incluindo testes de acuidade visual, refração e exame com o oftalmologista.
                </p>
                <p>
                  Se houver necessidade de exames adicionais (como fundo de olho com dilatação),
                  pode levar até 1 hora. Reserve tempo suficiente na sua agenda.
                </p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">
                <span className="faq-icon">❓</span>
                Preciso de encaminhamento médico?
              </h3>
              <div className="faq-answer">
                <p>
                  Não, você pode agendar consulta oftalmológica diretamente, sem necessidade
                  de encaminhamento de outro médico.
                </p>
                <p>
                  Oftalmologistas são médicos especializados e podem atendê-lo como primeira
                  consulta para qualquer problema relacionado à visão.
                </p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">
                <span className="faq-icon">❓</span>
                Posso levar acompanhante?
              </h3>
              <div className="faq-answer">
                <p>Sim! Você pode levar um acompanhante, especialmente recomendado para:</p>
                <ul>
                  <li>Crianças (obrigatório para menores)</li>
                  <li>Idosos</li>
                  <li>Consultas com dilatação da pupila (não poderá dirigir após)</li>
                  <li>Primeira consulta ou consultas complexas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exames */}
      <section id="exames" className="faq-section">
        <div className="section-container">
          <h2 className="section-title">Exames Oftalmológicos</h2>

          <div className="faq-list">
            <div className="faq-item">
              <h3 className="faq-question">
                <span className="faq-icon">❓</span>
                Com que frequência devo fazer exame de vista?
              </h3>
              <div className="faq-answer">
                <p>A frequência recomendada varia por idade:</p>
                <ul>
                  <li><strong>Crianças (0-5 anos):</strong> Aos 6 meses, 3 anos e 5 anos</li>
                  <li><strong>Idade escolar (6-17 anos):</strong> Anualmente</li>
                  <li><strong>Adultos (18-39 anos):</strong> A cada 2 anos</li>
                  <li><strong>Adultos (40-59 anos):</strong> Anualmente</li>
                  <li><strong>Idosos (60+ anos):</strong> Anualmente</li>
                </ul>
                <p>
                  Pessoas com problemas visuais, diabetes ou histórico familiar de
                  doenças oculares devem fazer exames mais frequentes.
                </p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">
                <span className="faq-icon">❓</span>
                O que é o exame de fundo de olho?
              </h3>
              <div className="faq-answer">
                <p>
                  É o exame que permite visualizar a parte interna do olho, incluindo
                  a retina, o nervo óptico e os vasos sanguíneos.
                </p>
                <p>Geralmente requer dilatação da pupila com colírio, que:</p>
                <ul>
                  <li>Leva 20-30 minutos para fazer efeito</li>
                  <li>Deixa a visão embaçada por 4-6 horas</li>
                  <li>Aumenta sensibilidade à luz</li>
                  <li>Não permite dirigir logo após</li>
                </ul>
                <p>É fundamental para detectar doenças como glaucoma, descolamento de retina e diabetes.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">
                <span className="faq-icon">❓</span>
                Os exames doem?
              </h3>
              <div className="faq-answer">
                <p>
                  Não! Os exames oftalmológicos são indolores. Alguns podem causar leve
                  desconforto temporário:
                </p>
                <ul>
                  <li><strong>Tonometria (sopro):</strong> Leve susto, mas não dói</li>
                  <li><strong>Dilatação:</strong> Ardência leve por alguns segundos</li>
                  <li><strong>Lâmpada de fenda:</strong> Luz forte, mas indolor</li>
                </ul>
                <p>Nossa equipe sempre explica cada etapa para deixá-lo confortável.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crianças */}
      <section id="criancas" className="faq-section">
        <div className="section-container">
          <h2 className="section-title">Saúde Ocular Infantil</h2>

          <div className="faq-list">
            <div className="faq-item">
              <h3 className="faq-question">
                <span className="faq-icon">❓</span>
                Com que idade devo levar meu filho ao oftalmologista?
              </h3>
              <div className="faq-answer">
                <p>O calendário ideal é:</p>
                <ul>
                  <li><strong>Ao nascer:</strong> Teste do olhinho na maternidade</li>
                  <li><strong>6 meses:</strong> Primeira consulta oftalmológica</li>
                  <li><strong>3 anos:</strong> Avaliação visual completa</li>
                  <li><strong>5-6 anos:</strong> Antes da alfabetização</li>
                  <li><strong>Anualmente:</strong> Durante toda idade escolar</li>
                </ul>
                <p>
                  Mesmo sem queixas, estas consultas preventivas são essenciais para
                  detectar problemas que a criança não percebe.
                </p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">
                <span className="faq-icon">❓</span>
                Como saber se meu filho não está enxergando bem?
              </h3>
              <div className="faq-answer">
                <p>Fique atento a estes sinais:</p>
                <ul>
                  <li>Aproxima muito o rosto para ler ou assistir TV</li>
                  <li>Fecha ou cobre um olho frequentemente</li>
                  <li>Queixa-se de dor de cabeça ou cansaço visual</li>
                  <li>Dificuldade de aprendizado ou falta de interesse por leitura</li>
                  <li>Desvia um ou ambos os olhos (estrabismo)</li>
                  <li>Tropeça com frequência ou esbarra em objetos</li>
                  <li>Sensibilidade excessiva à luz</li>
                </ul>
                <p>Se notar qualquer destes sinais, agende uma consulta imediatamente.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">
                <span className="faq-icon">❓</span>
                Criança pode usar óculos?
              </h3>
              <div className="faq-answer">
                <p>
                  Sim! Não há idade mínima para usar óculos. Se houver necessidade,
                  até bebês podem usar.
                </p>
                <p>Benefícios do uso correto de óculos na infância:</p>
                <ul>
                  <li>Previne a ambliopia ("olho preguiçoso")</li>
                  <li>Melhora o desempenho escolar</li>
                  <li>Favorece o desenvolvimento visual adequado</li>
                  <li>Aumenta a autoestima e segurança da criança</li>
                </ul>
                <p>
                  Temos armações especiais para crianças, resistentes e confortáveis,
                  em diversos modelos que elas adoram!
                </p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">
                <span className="faq-icon">❓</span>
                O uso de tablets e celulares prejudica a visão das crianças?
              </h3>
              <div className="faq-answer">
                <p>
                  O uso excessivo de telas pode causar fadiga ocular e contribuir para
                  o aumento da miopia. Recomendações:
                </p>
                <ul>
                  <li><strong>0-2 anos:</strong> Evitar completamente</li>
                  <li><strong>2-5 anos:</strong> Máximo 1 hora por dia</li>
                  <li><strong>6+ anos:</strong> Máximo 2 horas por dia</li>
                </ul>
                <p>Dicas importantes:</p>
                <ul>
                  <li>Faça pausas a cada 20 minutos</li>
                  <li>Mantenha distância adequada (mínimo 30cm)</li>
                  <li>Use boa iluminação ambiente</li>
                  <li>Incentive atividades ao ar livre</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="faq-section">
        <div className="section-container">
          <h2 className="section-title">Planos Familiares</h2>

          <div className="faq-list">
            <div className="faq-item">
              <h3 className="faq-question">
                <span className="faq-icon">❓</span>
                Vale a pena contratar um plano familiar?
              </h3>
              <div className="faq-answer">
                <p>
                  Sim! Especialmente se você tem filhos em idade escolar ou idosos na família.
                  A economia pode chegar a 30% comparado a consultas avulsas.
                </p>
                <p>Exemplo: Família de 4 pessoas</p>
                <ul>
                  <li>Sem plano: 4 consultas/ano = R$ 600 + exames = ~R$ 1.200/ano</li>
                  <li>Plano Plus: R$ 149/mês = R$ 1.788/ano (inclui consultas e exames)</li>
                  <li>Economia: Além do valor, prioridade no agendamento e telemedicina</li>
                </ul>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">
                <span className="faq-icon">❓</span>
                Posso usar o plano imediatamente?
              </h3>
              <div className="faq-answer">
                <p>
                  Sim! Não há carência. Após a aprovação do cadastro e primeiro pagamento,
                  você já pode agendar consultas e usar todos os benefícios do plano.
                </p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">
                <span className="faq-icon">❓</span>
                E se eu não usar todas as consultas no ano?
              </h3>
              <div className="faq-answer">
                <p>
                  As consultas não acumulam para o próximo ano, mas você pode transferi-las
                  entre membros da família durante a vigência anual do plano.
                </p>
                <p>
                  Lembre-se: consultas preventivas regulares são essenciais para a saúde
                  ocular. Incentivamos você a usar todos os benefícios!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergências */}
      <section id="emergencias" className="faq-section">
        <div className="section-container">
          <h2 className="section-title">Emergências Oculares</h2>

          <div className="faq-list">
            <div className="faq-item">
              <h3 className="faq-question">
                <span className="faq-icon">🚨</span>
                Quando devo procurar atendimento de emergência?
              </h3>
              <div className="faq-answer">
                <p><strong>Procure atendimento IMEDIATO se tiver:</strong></p>
                <ul className="emergency-list">
                  <li>Perda súbita de visão (parcial ou total)</li>
                  <li>Dor ocular intensa</li>
                  <li>Trauma ou lesão no olho</li>
                  <li>Corpo estranho penetrante no olho</li>
                  <li>Queimadura química nos olhos</li>
                  <li>Flashes de luz repentinos com manchas escuras</li>
                  <li>Cortina ou sombra na visão</li>
                </ul>
                <p className="emergency-note">
                  <strong>Em caso de emergência:</strong> Ligue (33) 3321-3700 ou vá
                  diretamente ao pronto-socorro mais próximo.
                </p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">
                <span className="faq-icon">❓</span>
                O que fazer em caso de cisco ou corpo estranho no olho?
              </h3>
              <div className="faq-answer">
                <p><strong>O que fazer:</strong></p>
                <ul>
                  <li>Pisque várias vezes para tentar remover naturalmente</li>
                  <li>Lave com água limpa ou soro fisiológico</li>
                  <li>NÃO esfregue o olho</li>
                  <li>Se não sair, procure atendimento</li>
                </ul>
                <p><strong>NÃO tente remover se:</strong></p>
                <ul>
                  <li>Estiver encravado no olho</li>
                  <li>For metal ou vidro</li>
                  <li>Houver sangramento</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="contact-cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Não encontrou sua resposta?</h2>
          <p className="cta-description">
            Nossa equipe está pronta para ajudar com qualquer dúvida
          </p>
          <div className="cta-actions">
            <a href="tel:+553333213700" className="btn-primary btn-large">
              <span className="btn-icon">📞</span>
              Ligar: (33) 3321-3700
            </a>
            <a href="https://wa.me/5533933213700" className="btn-secondary btn-large">
              <span className="btn-icon">💬</span>
              WhatsApp
            </a>
            <a href="/contato" className="btn-secondary btn-large">
              <span className="btn-icon">✉️</span>
              Enviar Mensagem
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
