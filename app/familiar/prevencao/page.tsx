/**
 * Familiar - Prevention Page
 * Educational content about preventive eye care for families
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prevenção Ocular | Saraiva Vision - Família',
  description:
    'Guia completo de prevenção ocular para toda a família. Cuidados essenciais, calendário de exames e dicas para manter a saúde visual em dia.'
};

export default function PrevencaoPage() {
  return (
    <div className="prevencao-page">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="hero-container">
          <h1 className="hero-title">
            Prevenção: O Melhor <span className="text-primary">Cuidado</span> para a Visão
          </h1>
          <p className="hero-description">
            A prevenção é a chave para manter a saúde ocular de toda a família.
            Descubra como proteger a visão em todas as idades.
          </p>
        </div>
      </section>

      {/* Preventive Care by Age */}
      <section className="age-groups-section">
        <div className="section-container">
          <h2 className="section-title">Cuidados por Idade</h2>

          <div className="age-groups-grid">
            {/* Children */}
            <div className="age-group-card">
              <div className="age-icon">👶</div>
              <h3 className="age-title">0 a 5 anos</h3>
              <h4 className="age-subtitle">Primeiros Anos</h4>
              <ul className="age-checklist">
                <li>✓ Teste do olhinho ao nascer</li>
                <li>✓ Primeira consulta aos 6 meses</li>
                <li>✓ Avaliação visual aos 3 anos</li>
                <li>✓ Exame completo aos 5 anos</li>
              </ul>
              <div className="age-warning">
                <strong>Atenção:</strong> Estrabismo e ambliopia devem ser tratados cedo.
              </div>
            </div>

            {/* School Age */}
            <div className="age-group-card">
              <div className="age-icon">🎒</div>
              <h3 className="age-title">6 a 17 anos</h3>
              <h4 className="age-subtitle">Idade Escolar</h4>
              <ul className="age-checklist">
                <li>✓ Exame anual obrigatório</li>
                <li>✓ Avaliação antes do ano letivo</li>
                <li>✓ Controle de miopia</li>
                <li>✓ Uso adequado de telas</li>
              </ul>
              <div className="age-tip">
                <strong>Dica:</strong> Dificuldade escolar pode ser problema visual.
              </div>
            </div>

            {/* Adults */}
            <div className="age-group-card">
              <div className="age-icon">👔</div>
              <h3 className="age-title">18 a 59 anos</h3>
              <h4 className="age-subtitle">Adultos</h4>
              <ul className="age-checklist">
                <li>✓ Exame a cada 2 anos</li>
                <li>✓ Anual se usa óculos</li>
                <li>✓ Proteção UV obrigatória</li>
                <li>✓ Pausas no trabalho digital</li>
              </ul>
              <div className="age-tip">
                <strong>Prevenção:</strong> Síndrome do olho seco é comum nesta idade.
              </div>
            </div>

            {/* Seniors */}
            <div className="age-group-card">
              <div className="age-icon">👴</div>
              <h3 className="age-title">60+ anos</h3>
              <h4 className="age-subtitle">Melhor Idade</h4>
              <ul className="age-checklist">
                <li>✓ Exame anual completo</li>
                <li>✓ Rastreio de glaucoma</li>
                <li>✓ Avaliação de catarata</li>
                <li>✓ Controle de pressão ocular</li>
              </ul>
              <div className="age-warning">
                <strong>Importante:</strong> Consultas regulares previnem perda visual.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Children Eye Care */}
      <section className="children-care-section">
        <div className="section-container">
          <h2 className="section-title">Cuidados com a Visão Infantil</h2>
          <p className="section-subtitle">Como proteger os olhos das crianças desde cedo</p>

          <div className="children-grid">
            <div className="children-card">
              <h3 className="children-title">🎮 Uso de Telas</h3>
              <p className="children-description">Limite o tempo de telas e mantenha distância adequada:</p>
              <ul className="children-list">
                <li>0-2 anos: Evitar telas</li>
                <li>2-5 anos: Máximo 1h por dia</li>
                <li>6+ anos: Máximo 2h por dia</li>
                <li>Pausas de 20 em 20 minutos</li>
              </ul>
            </div>

            <div className="children-card">
              <h3 className="children-title">📚 Leitura e Estudo</h3>
              <p className="children-description">Condições ideais para atividades próximas:</p>
              <ul className="children-list">
                <li>Boa iluminação natural ou LED</li>
                <li>Postura correta ao estudar</li>
                <li>Distância de 30-40cm do livro</li>
                <li>Pausas regulares</li>
              </ul>
            </div>

            <div className="children-card">
              <h3 className="children-title">☀️ Proteção Solar</h3>
              <p className="children-description">Proteja os olhos dos raios UV:</p>
              <ul className="children-list">
                <li>Óculos de sol com proteção UV</li>
                <li>Bonés e chapéus ao ar livre</li>
                <li>Evitar exposição 10h-16h</li>
                <li>Proteção mesmo em dias nublados</li>
              </ul>
            </div>

            <div className="children-card">
              <h3 className="children-title">🏃 Atividades Físicas</h3>
              <p className="children-description">Segurança durante brincadeiras e esportes:</p>
              <ul className="children-list">
                <li>Óculos de proteção em esportes</li>
                <li>Supervisão em brincadeiras</li>
                <li>Evitar objetos pontiagudos</li>
                <li>Primeiros socorros em emergências</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Calendar */}
      <section className="calendar-section">
        <div className="section-container">
          <h2 className="section-title">Calendário de Exames</h2>
          <p className="section-subtitle">Quando fazer cada exame preventivo</p>

          <div className="calendar-timeline">
            <div className="timeline-item">
              <div className="timeline-marker">📅</div>
              <div className="timeline-content">
                <h3 className="timeline-title">Ao Nascer</h3>
                <p className="timeline-description">Teste do olhinho (Reflexo Vermelho)</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker">📅</div>
              <div className="timeline-content">
                <h3 className="timeline-title">6 Meses</h3>
                <p className="timeline-description">Primeira avaliação oftalmológica</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker">📅</div>
              <div className="timeline-content">
                <h3 className="timeline-title">3 Anos</h3>
                <p className="timeline-description">Avaliação visual e teste de cores</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker">📅</div>
              <div className="timeline-content">
                <h3 className="timeline-title">5-6 Anos</h3>
                <p className="timeline-description">Exame completo antes da alfabetização</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker">📅</div>
              <div className="timeline-content">
                <h3 className="timeline-title">Anualmente</h3>
                <p className="timeline-description">Durante toda idade escolar (6-17 anos)</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker">📅</div>
              <div className="timeline-content">
                <h3 className="timeline-title">A cada 2 anos</h3>
                <p className="timeline-description">Adultos sem problemas visuais (18-39 anos)</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker">📅</div>
              <div className="timeline-content">
                <h3 className="timeline-title">Anualmente</h3>
                <p className="timeline-description">Adultos 40+ e idosos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Health Tips */}
      <section className="tips-section">
        <div className="section-container">
          <h2 className="section-title">Dicas de Saúde Ocular</h2>

          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-number">1</div>
              <h3 className="tip-title">Alimentação Saudável</h3>
              <p className="tip-description">
                Consuma alimentos ricos em vitamina A, C, E e ômega-3. Cenoura, espinafre,
                peixes e frutas cítricas são excelentes para a visão.
              </p>
            </div>

            <div className="tip-card">
              <div className="tip-number">2</div>
              <h3 className="tip-title">Hidratação</h3>
              <p className="tip-description">
                Beba pelo menos 2 litros de água por dia. A hidratação adequada
                previne o ressecamento dos olhos e mantém a saúde ocular.
              </p>
            </div>

            <div className="tip-card">
              <div className="tip-number">3</div>
              <h3 className="tip-title">Regra 20-20-20</h3>
              <p className="tip-description">
                A cada 20 minutos de tela, olhe para algo a 20 pés (6 metros) de distância
                por pelo menos 20 segundos. Previne fadiga ocular.
              </p>
            </div>

            <div className="tip-card">
              <div className="tip-number">4</div>
              <h3 className="tip-title">Higiene Ocular</h3>
              <p className="tip-description">
                Lave as mãos antes de tocar os olhos. Nunca compartilhe maquiagem ou
                toalhas. Troque lentes de contato conforme orientação.
              </p>
            </div>

            <div className="tip-card">
              <div className="tip-number">5</div>
              <h3 className="tip-title">Proteção UV</h3>
              <p className="tip-description">
                Use óculos de sol com proteção UV400 sempre que estiver ao ar livre,
                mesmo em dias nublados. Raios UV causam danos cumulativos.
              </p>
            </div>

            <div className="tip-card">
              <div className="tip-number">6</div>
              <h3 className="tip-title">Sono Adequado</h3>
              <p className="tip-description">
                Durma de 7-8 horas por noite. O sono é essencial para a regeneração
                ocular e prevenção de olhos secos e cansados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Warning Signs */}
      <section className="warning-section">
        <div className="section-container">
          <h2 className="section-title">Sinais de Alerta</h2>
          <p className="section-subtitle">Procure um oftalmologista imediatamente se notar:</p>

          <div className="warning-grid">
            <div className="warning-card urgent">
              <div className="warning-header">
                <span className="warning-icon">🚨</span>
                <h3 className="warning-title">Emergências</h3>
              </div>
              <ul className="warning-list">
                <li>Perda súbita de visão</li>
                <li>Dor ocular intensa</li>
                <li>Trauma ou lesão no olho</li>
                <li>Flashes de luz repentinos</li>
                <li>Manchas escuras súbitas</li>
              </ul>
            </div>

            <div className="warning-card important">
              <div className="warning-header">
                <span className="warning-icon">⚠️</span>
                <h3 className="warning-title">Sintomas Importantes</h3>
              </div>
              <ul className="warning-list">
                <li>Visão embaçada persistente</li>
                <li>Dificuldade para enxergar à noite</li>
                <li>Sensibilidade excessiva à luz</li>
                <li>Olhos vermelhos frequentes</li>
                <li>Lacrimejamento constante</li>
              </ul>
            </div>

            <div className="warning-card children">
              <div className="warning-header">
                <span className="warning-icon">👶</span>
                <h3 className="warning-title">Em Crianças</h3>
              </div>
              <ul className="warning-list">
                <li>Desvio dos olhos (estrabismo)</li>
                <li>Aproximar muito para ler/assistir</li>
                <li>Fechar um olho frequentemente</li>
                <li>Queixas de dor de cabeça</li>
                <li>Dificuldade escolar súbita</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Agende sua Consulta Preventiva</h2>
          <p className="cta-description">
            Proteja a visão de toda sua família com exames regulares e orientação especializada
          </p>
          <div className="cta-actions">
            <a href="/familiar/agendar" className="btn-primary btn-large">
              <span className="btn-icon">📅</span>
              Agendar Consulta
            </a>
            <a href="/familiar/planos" className="btn-secondary btn-large">
              <span className="btn-icon">👨‍👩‍👧‍👦</span>
              Ver Planos Familiares
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
