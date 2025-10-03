/**
 * Familiar - Exams Page
 * Complete guide to routine eye exams and diagnostics
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exames Oftalmológicos | Saraiva Vision - Família',
  description:
    'Conheça os exames oftalmológicos disponíveis para toda a família. Diagnóstico preciso com equipamentos modernos em Caratinga, MG.'
};

export default function ExamesPage() {
  return (
    <div className="exames-page">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="hero-container">
          <h1 className="hero-title">
            Exames <span className="text-primary">Oftalmológicos</span> Completos
          </h1>
          <p className="hero-description">
            Diagnóstico preciso e confiável com tecnologia de ponta para cuidar da
            visão de toda a sua família.
          </p>
        </div>
      </section>

      {/* Basic Exams */}
      <section className="basic-exams-section">
        <div className="section-container">
          <h2 className="section-title">Exames de Rotina</h2>
          <p className="section-subtitle">Avaliações essenciais para toda a família</p>

          <div className="exams-grid">
            <div className="exam-card">
              <div className="exam-icon">👁️</div>
              <h3 className="exam-title">Acuidade Visual</h3>
              <p className="exam-description">
                Teste fundamental que mede a capacidade de enxergar nitidamente
                a diferentes distâncias.
              </p>
              <div className="exam-details">
                <h4 className="details-heading">O que detecta:</h4>
                <ul className="details-list">
                  <li>Miopia (dificuldade para ver de longe)</li>
                  <li>Hipermetropia (dificuldade para ver de perto)</li>
                  <li>Astigmatismo (visão distorcida)</li>
                </ul>
              </div>
              <div className="exam-meta">
                <span className="exam-duration">⏱️ 10-15 min</span>
                <span className="exam-frequency">📅 Anual</span>
              </div>
            </div>

            <div className="exam-card">
              <div className="exam-icon">🔍</div>
              <h3 className="exam-title">Refração</h3>
              <p className="exam-description">
                Determina o grau exato de óculos ou lentes de contato necessário
                para correção visual.
              </p>
              <div className="exam-details">
                <h4 className="details-heading">O que detecta:</h4>
                <ul className="details-list">
                  <li>Grau preciso de miopia</li>
                  <li>Grau preciso de hipermetropia</li>
                  <li>Eixo e grau de astigmatismo</li>
                </ul>
              </div>
              <div className="exam-meta">
                <span className="exam-duration">⏱️ 15-20 min</span>
                <span className="exam-frequency">📅 Anual</span>
              </div>
            </div>

            <div className="exam-card">
              <div className="exam-icon">💧</div>
              <h3 className="exam-title">Tonometria</h3>
              <p className="exam-description">
                Mede a pressão intraocular para detectar e monitorar o glaucoma,
                doença silenciosa que pode causar cegueira.
              </p>
              <div className="exam-details">
                <h4 className="details-heading">O que detecta:</h4>
                <ul className="details-list">
                  <li>Pressão ocular elevada</li>
                  <li>Risco de glaucoma</li>
                  <li>Eficácia do tratamento</li>
                </ul>
              </div>
              <div className="exam-meta">
                <span className="exam-duration">⏱️ 5-10 min</span>
                <span className="exam-frequency">📅 Anual 40+</span>
              </div>
            </div>

            <div className="exam-card">
              <div className="exam-icon">🌟</div>
              <h3 className="exam-title">Biomicroscopia</h3>
              <p className="exam-description">
                Exame com lâmpada de fenda que permite visualizar estruturas
                do olho em detalhes ampliados.
              </p>
              <div className="exam-details">
                <h4 className="details-heading">O que detecta:</h4>
                <ul className="details-list">
                  <li>Inflamações oculares</li>
                  <li>Catarata em formação</li>
                  <li>Alterações na córnea</li>
                </ul>
              </div>
              <div className="exam-meta">
                <span className="exam-duration">⏱️ 10-15 min</span>
                <span className="exam-frequency">📅 Anual</span>
              </div>
            </div>

            <div className="exam-card">
              <div className="exam-icon">🔴</div>
              <h3 className="exam-title">Fundo de Olho</h3>
              <p className="exam-description">
                Avaliação da retina, nervo óptico e vasos sanguíneos do olho
                através da dilatação da pupila.
              </p>
              <div className="exam-details">
                <h4 className="details-heading">O que detecta:</h4>
                <ul className="details-list">
                  <li>Problemas de retina</li>
                  <li>Alterações do nervo óptico</li>
                  <li>Retinopatia diabética</li>
                </ul>
              </div>
              <div className="exam-meta">
                <span className="exam-duration">⏱️ 15-20 min</span>
                <span className="exam-frequency">📅 Anual</span>
              </div>
            </div>

            <div className="exam-card">
              <div className="exam-icon">🎨</div>
              <h3 className="exam-title">Teste de Visão de Cores</h3>
              <p className="exam-description">
                Identifica daltonismo e outras alterações na percepção de cores,
                importante para crianças e profissões específicas.
              </p>
              <div className="exam-details">
                <h4 className="details-heading">O que detecta:</h4>
                <ul className="details-list">
                  <li>Daltonismo (tipos variados)</li>
                  <li>Dificuldade em cores específicas</li>
                  <li>Alterações adquiridas</li>
                </ul>
              </div>
              <div className="exam-meta">
                <span className="exam-duration">⏱️ 10 min</span>
                <span className="exam-frequency">📅 Infantil</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Age-Specific Exams */}
      <section className="age-exams-section">
        <div className="section-container">
          <h2 className="section-title">Exames por Faixa Etária</h2>

          <div className="age-tabs">
            {/* Babies & Toddlers */}
            <div className="age-tab-content">
              <h3 className="age-heading">👶 Bebês e Crianças Pequenas (0-5 anos)</h3>
              <div className="age-exams">
                <div className="age-exam">
                  <h4 className="age-exam-title">Teste do Olhinho</h4>
                  <p className="age-exam-description">
                    Exame obrigatório realizado na maternidade para detectar
                    catarata congênita, retinoblastoma e outras doenças graves.
                  </p>
                  <span className="age-exam-when">Quando: Ao nascer</span>
                </div>

                <div className="age-exam">
                  <h4 className="age-exam-title">Avaliação do Olhar</h4>
                  <p className="age-exam-description">
                    Verifica se o bebê fixa e segue objetos, detectando
                    problemas de desenvolvimento visual precocemente.
                  </p>
                  <span className="age-exam-when">Quando: 3-6 meses</span>
                </div>

                <div className="age-exam">
                  <h4 className="age-exam-title">Teste de Estrabismo</h4>
                  <p className="age-exam-description">
                    Avalia o alinhamento dos olhos e detecta desvios que podem
                    causar ambliopia ("olho preguiçoso").
                  </p>
                  <span className="age-exam-when">Quando: 1-3 anos</span>
                </div>
              </div>
            </div>

            {/* School Age */}
            <div className="age-tab-content">
              <h3 className="age-heading">🎒 Idade Escolar (6-17 anos)</h3>
              <div className="age-exams">
                <div className="age-exam">
                  <h4 className="age-exam-title">Exame Pré-Escolar</h4>
                  <p className="age-exam-description">
                    Avaliação completa antes do início da alfabetização,
                    fundamental para prevenir dificuldades de aprendizagem.
                  </p>
                  <span className="age-exam-when">Quando: 5-6 anos</span>
                </div>

                <div className="age-exam">
                  <h4 className="age-exam-title">Controle de Miopia</h4>
                  <p className="age-exam-description">
                    Monitoramento da progressão da miopia com tratamentos
                    modernos para desacelerar o aumento do grau.
                  </p>
                  <span className="age-exam-when">Quando: Anualmente</span>
                </div>
              </div>
            </div>

            {/* Adults */}
            <div className="age-tab-content">
              <h3 className="age-heading">👔 Adultos (18-59 anos)</h3>
              <div className="age-exams">
                <div className="age-exam">
                  <h4 className="age-exam-title">Check-up Oftalmológico</h4>
                  <p className="age-exam-description">
                    Avaliação completa incluindo pressão ocular, refração
                    e fundo de olho para detectar problemas precocemente.
                  </p>
                  <span className="age-exam-when">Quando: A cada 2 anos</span>
                </div>

                <div className="age-exam">
                  <h4 className="age-exam-title">Avaliação de Presbiopia</h4>
                  <p className="age-exam-description">
                    A partir dos 40 anos, avaliação da "vista cansada"
                    (dificuldade para perto) que afeta todos naturalmente.
                  </p>
                  <span className="age-exam-when">Quando: 40+ anos</span>
                </div>
              </div>
            </div>

            {/* Seniors */}
            <div className="age-tab-content">
              <h3 className="age-heading">👴 Melhor Idade (60+ anos)</h3>
              <div className="age-exams">
                <div className="age-exam">
                  <h4 className="age-exam-title">Rastreio de Glaucoma</h4>
                  <p className="age-exam-description">
                    Exames específicos incluindo campo visual e OCT para
                    detectar glaucoma em estágio inicial.
                  </p>
                  <span className="age-exam-when">Quando: Anualmente</span>
                </div>

                <div className="age-exam">
                  <h4 className="age-exam-title">Avaliação de Catarata</h4>
                  <p className="age-exam-description">
                    Monitoramento da opacificação do cristalino e indicação
                    cirúrgica no momento adequado.
                  </p>
                  <span className="age-exam-when">Quando: Anualmente</span>
                </div>

                <div className="age-exam">
                  <h4 className="age-exam-title">Retina e Mácula</h4>
                  <p className="age-exam-description">
                    Avaliação da degeneração macular relacionada à idade (DMRI)
                    e outras doenças da retina.
                  </p>
                  <span className="age-exam-when">Quando: Anualmente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="technology-section">
        <div className="section-container">
          <h2 className="section-title">Tecnologia de Ponta</h2>
          <p className="section-subtitle">Equipamentos modernos para diagnóstico preciso</p>

          <div className="technology-grid">
            <div className="tech-item">
              <div className="tech-icon">🔬</div>
              <h3 className="tech-name">OCT (Tomografia de Coerência Óptica)</h3>
              <p className="tech-description">
                Exame de imagem de alta resolução que permite visualizar as camadas
                da retina e nervo óptico em detalhes microscópicos.
              </p>
            </div>

            <div className="tech-item">
              <div className="tech-icon">📊</div>
              <h3 className="tech-name">Campo Visual Computadorizado</h3>
              <p className="tech-description">
                Mapeia a visão periférica e central para diagnóstico e monitoramento
                de glaucoma e doenças neurológicas.
              </p>
            </div>

            <div className="tech-item">
              <div className="tech-icon">📸</div>
              <h3 className="tech-name">Retinografia Digital</h3>
              <p className="tech-description">
                Fotografia de alta definição do fundo do olho para documentar
                e acompanhar alterações ao longo do tempo.
              </p>
            </div>

            <div className="tech-item">
              <div className="tech-icon">🗺️</div>
              <h3 className="tech-name">Topografia de Córnea</h3>
              <p className="tech-description">
                Mapeamento tridimensional da córnea essencial para adaptação
                de lentes e cirurgias refrativas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Preparation */}
      <section className="preparation-section">
        <div className="section-container">
          <h2 className="section-title">Preparação para Exames</h2>

          <div className="preparation-grid">
            <div className="prep-card">
              <h3 className="prep-title">✅ Antes do Exame</h3>
              <ul className="prep-list">
                <li>Leve seus óculos e lentes de contato</li>
                <li>Liste medicamentos em uso</li>
                <li>Informe alergias</li>
                <li>Venha sem maquiagem nos olhos</li>
                <li>Traga óculos de sol (dilatação)</li>
              </ul>
            </div>

            <div className="prep-card">
              <h3 className="prep-title">⏱️ Durante o Exame</h3>
              <ul className="prep-list">
                <li>Será rápido e indolor</li>
                <li>Siga as orientações do médico</li>
                <li>Tire todas as dúvidas</li>
                <li>Relaxe e pisque normalmente</li>
                <li>Duração média: 30-45 minutos</li>
              </ul>
            </div>

            <div className="prep-card">
              <h3 className="prep-title">🚗 Depois do Exame</h3>
              <ul className="prep-list">
                <li>Se houver dilatação, visão pode ficar embaçada por 4-6h</li>
                <li>Não dirija após dilatação</li>
                <li>Evite exposição solar direta</li>
                <li>Use óculos de sol fornecidos</li>
                <li>Retome atividades no dia seguinte</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Agende seus Exames</h2>
          <p className="cta-description">
            Diagnóstico preciso e rápido para cuidar da visão de toda a família
          </p>
          <div className="cta-actions">
            <a href="/familiar/agendar" className="btn-primary btn-large">
              <span className="btn-icon">📅</span>
              Agendar Exames
            </a>
            <a href="/familiar/planos" className="btn-secondary btn-large">
              <span className="btn-icon">💰</span>
              Ver Planos com Desconto
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
