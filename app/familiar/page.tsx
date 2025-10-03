/**
 * Familiar Profile Home Page
 * Family-focused landing page with prevention and care themes
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saraiva Vision - Família | Cuidado Preventivo com a Visão',
  description:
    'Proteja a visão de toda sua família com consultas preventivas, exames completos e tratamentos especializados. Planos familiares disponíveis em Caratinga, MG.'
};

export default function FamiliarHomePage() {
  return (
    <div className="familiar-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Cuidado com a <span className="text-primary">Visão</span> de Toda a Família
            </h1>
            <p className="hero-description">
              Prevenção, exames completos e tratamentos especializados para garantir a saúde ocular de quem você ama.
            </p>
            <div className="hero-actions">
              <a href="/familiar/agendar" className="btn-primary btn-large">
                <span className="btn-icon">📅</span>
                Agendar Consulta
              </a>
              <a href="/familiar/planos" className="btn-secondary btn-large">
                <span className="btn-icon">👨‍👩‍👧‍👦</span>
                Planos Familiares
              </a>
            </div>
          </div>
          <div className="hero-image">
            <img src="/images/familia-feliz.jpg" alt="Família feliz cuidando da visão" width={600} height={400} loading="eager" />
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="services-section">
        <div className="section-container">
          <h2 className="section-title">Nossos Serviços</h2>
          <p className="section-subtitle">Cuidado completo para todas as idades</p>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🛡️</div>
              <h3 className="service-title">Prevenção</h3>
              <p className="service-description">Consultas preventivas e orientações para manter a saúde ocular em dia.</p>
              <a href="/familiar/prevencao" className="service-link">
                Saiba mais →
              </a>
            </div>

            <div className="service-card">
              <div className="service-icon">🔬</div>
              <h3 className="service-title">Exames Completos</h3>
              <p className="service-description">Diagnóstico preciso com equipamentos modernos e tecnologia de ponta.</p>
              <a href="/familiar/exames" className="service-link">
                Ver exames →
              </a>
            </div>

            <div className="service-card">
              <div className="service-icon">👶</div>
              <h3 className="service-title">Oftalmopediatria</h3>
              <p className="service-description">Atendimento especializado para crianças com ambiente acolhedor.</p>
              <a href="/familiar/infantil" className="service-link">
                Saiba mais →
              </a>
            </div>

            <div className="service-card">
              <div className="service-icon">👴</div>
              <h3 className="service-title">Terceira Idade</h3>
              <p className="service-description">Cuidados especializados para idosos, incluindo catarata e glaucoma.</p>
              <a href="/familiar/terceira-idade" className="service-link">
                Saiba mais →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="section-container">
          <div className="trust-content">
            <h2 className="section-title">Por que escolher a Saraiva Vision?</h2>
            <div className="trust-features">
              <div className="trust-feature">
                <span className="trust-icon">✅</span>
                <div className="trust-text">
                  <h4>Experiência Comprovada</h4>
                  <p>Mais de 15 anos cuidando da visão das famílias de Caratinga e região</p>
                </div>
              </div>
              <div className="trust-feature">
                <span className="trust-icon">💙</span>
                <div className="trust-text">
                  <h4>Atendimento Humanizado</h4>
                  <p>Equipe dedicada e acolhedora, pronta para atender toda a família</p>
                </div>
              </div>
              <div className="trust-feature">
                <span className="trust-icon">🏥</span>
                <div className="trust-text">
                  <h4>Estrutura Completa</h4>
                  <p>Consultórios modernos e equipamentos de última geração</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Agende sua consulta hoje</h2>
          <p className="cta-description">Cuide da visão de toda a sua família com os melhores profissionais</p>
          <a href="/familiar/agendar" className="btn-primary btn-large">
            <span className="btn-icon">📅</span>
            Agendar Agora
          </a>
        </div>
      </section>
    </div>
  );
}
