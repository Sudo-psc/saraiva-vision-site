/**
 * Jovem Profile Home Page
 * Modern, tech-focused landing page with subscription emphasis
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saraiva Vision - Jovem | Visão do Futuro',
  description:
    'Planos de assinatura flexíveis, cirurgia refrativa a laser e lentes de última geração. Sua visão perfeita começa aqui.'
};

export default function JovemHomePage() {
  return (
    <div className="jovem-home">
      {/* Hero Section with Gradient */}
      <section className="hero-section gradient-bg">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Visão <span className="gradient-text">Perfeita</span> para o Futuro
            </h1>
            <p className="hero-description">
              Tecnologia de ponta, planos flexíveis e resultados garantidos. Sua visão nunca foi tão clara.
            </p>
            <div className="hero-actions">
              <a href="/jovem/assinar" className="btn-gradient btn-large">
                <span className="btn-shimmer" />
                <span className="btn-content">
                  <span className="btn-icon">✨</span>
                  Assinar Premium
                </span>
              </a>
              <a href="/jovem/tecnologia" className="btn-outline btn-large">
                <span className="btn-icon">🚀</span>
                Ver Tecnologias
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="plans-section">
        <div className="section-container">
          <h2 className="section-title gradient-text">Planos de Assinatura</h2>
          <p className="section-subtitle">Escolha o plano perfeito para você</p>

          <div className="plans-grid">
            <div className="plan-card">
              <div className="plan-badge">Básico</div>
              <h3 className="plan-title">Visão Basic</h3>
              <div className="plan-price">
                <span className="currency">R$</span>
                <span className="amount">49</span>
                <span className="period">/mês</span>
              </div>
              <ul className="plan-features">
                <li>✓ Consulta anual</li>
                <li>✓ Desconto em óculos</li>
                <li>✓ App de saúde ocular</li>
              </ul>
              <a href="/jovem/assinar/basic" className="plan-cta">Começar</a>
            </div>

            <div className="plan-card featured">
              <div className="plan-badge gradient">Premium</div>
              <h3 className="plan-title">Visão Plus</h3>
              <div className="plan-price">
                <span className="currency">R$</span>
                <span className="amount">99</span>
                <span className="period">/mês</span>
              </div>
              <ul className="plan-features">
                <li>✓ Consultas ilimitadas</li>
                <li>✓ Lentes de contato premium</li>
                <li>✓ Exames avançados</li>
                <li>✓ Telemedicina 24/7</li>
              </ul>
              <a href="/jovem/assinar/plus" className="plan-cta gradient">Assinar Agora</a>
            </div>

            <div className="plan-card">
              <div className="plan-badge">Pro</div>
              <h3 className="plan-title">Visão Premium</h3>
              <div className="plan-price">
                <span className="currency">R$</span>
                <span className="amount">149</span>
                <span className="period">/mês</span>
              </div>
              <ul className="plan-features">
                <li>✓ Tudo do Plus</li>
                <li>✓ Cirurgia a laser inclusa</li>
                <li>✓ Lentes ICL</li>
                <li>✓ Acompanhamento VIP</li>
              </ul>
              <a href="/jovem/assinar/premium" className="plan-cta">Saiba Mais</a>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Showcase */}
      <section className="tech-section">
        <div className="section-container">
          <h2 className="section-title">Tecnologia de Ponta</h2>
          <div className="tech-grid">
            <div className="tech-card">
              <div className="tech-icon">⚡</div>
              <h3 className="tech-title">Laser Femtosegundo</h3>
              <p className="tech-description">Cirurgia refrativa de alta precisão em minutos</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">🔬</div>
              <h3 className="tech-title">Topografia 3D</h3>
              <p className="tech-description">Mapeamento completo da córnea em tempo real</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">📱</div>
              <h3 className="tech-title">App Integrado</h3>
              <p className="tech-description">Acompanhe sua saúde ocular no smartphone</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section gradient-bg">
        <div className="cta-container">
          <h2 className="cta-title gradient-text">Pronto para ver melhor?</h2>
          <p className="cta-description">Comece sua jornada para a visão perfeita hoje</p>
          <a href="/jovem/assinar" className="btn-gradient btn-large">
            <span className="btn-shimmer" />
            <span className="btn-content">
              <span className="btn-icon">✨</span>
              Assinar Agora
            </span>
          </a>
        </div>
      </section>
    </div>
  );
}
