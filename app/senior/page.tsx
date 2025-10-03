/**
 * Sênior Profile Home Page
 * Accessibility-focused landing with WCAG AAA compliance
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saraiva Vision - Sênior | Cuidado Especializado para Idosos',
  description:
    'Tratamento completo de catarata, glaucoma e doenças da retina com atendimento humanizado e acessível. Especialistas em oftalmologia geriátrica.'
};

export default function SeniorHomePage() {
  return (
    <div className="senior-home">
      {/* Hero Section - High Contrast */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Cuidado <span className="text-primary">Especializado</span> para a Melhor Idade
            </h1>
            <p className="hero-description">
              Mais de 15 anos de experiência em tratamentos oftalmológicos para idosos.
              Atendimento humanizado, acessível e de qualidade.
            </p>
            <div className="hero-actions">
              <a href="/senior/agendar" className="btn-primary btn-extra-large">
                <span className="btn-icon" aria-hidden="true">☎</span>
                <span className="btn-text">Ligar Agora: (33) 3321-3700</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="services-section">
        <div className="section-container">
          <h2 className="section-title">Nossos Principais Tratamentos</h2>
          <p className="section-subtitle">Especialistas em oftalmologia geriátrica</p>

          <div className="services-grid">
            <div className="service-card highlight">
              <div className="service-number" aria-hidden="true">1</div>
              <h3 className="service-title">Cirurgia de Catarata</h3>
              <p className="service-description">
                Procedimento moderno e seguro com lentes premium.
                Recuperação rápida e resultados excelentes.
              </p>
              <ul className="service-benefits">
                <li>✓ Tecnologia de ponta</li>
                <li>✓ Sem internação</li>
                <li>✓ Recuperação em dias</li>
                <li>✓ Acompanhamento completo</li>
              </ul>
              <a href="/senior/catarata" className="service-link">
                Saiba Mais Sobre Catarata
              </a>
            </div>

            <div className="service-card">
              <div className="service-number" aria-hidden="true">2</div>
              <h3 className="service-title">Tratamento de Glaucoma</h3>
              <p className="service-description">
                Diagnóstico precoce e tratamento eficaz para preservar sua visão.
              </p>
              <ul className="service-benefits">
                <li>✓ Exames especializados</li>
                <li>✓ Tratamento com colírios</li>
                <li>✓ Cirurgia quando necessário</li>
                <li>✓ Acompanhamento regular</li>
              </ul>
              <a href="/senior/glaucoma" className="service-link">
                Saiba Mais Sobre Glaucoma
              </a>
            </div>

            <div className="service-card">
              <div className="service-number" aria-hidden="true">3</div>
              <h3 className="service-title">Doenças da Retina</h3>
              <p className="service-description">
                Tratamento especializado para degeneração macular,
                retinopatia diabética e outras condições.
              </p>
              <ul className="service-benefits">
                <li>✓ Diagnóstico preciso</li>
                <li>✓ Tratamentos modernos</li>
                <li>✓ Aplicações intraoculares</li>
                <li>✓ Cirurgias de retina</li>
              </ul>
              <a href="/senior/retina" className="service-link">
                Saiba Mais Sobre Retina
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="section-container">
          <h2 className="section-title">Por Que Confiar na Saraiva Vision?</h2>

          <div className="trust-features">
            <div className="trust-feature">
              <div className="trust-icon" aria-hidden="true">✓</div>
              <div className="trust-content">
                <h3 className="trust-heading">Experiência Comprovada</h3>
                <p className="trust-text">
                  Mais de 15 anos cuidando da visão de idosos em Caratinga e região.
                  Milhares de cirurgias de catarata realizadas com sucesso.
                </p>
              </div>
            </div>

            <div className="trust-feature">
              <div className="trust-icon" aria-hidden="true">✓</div>
              <div className="trust-content">
                <h3 className="trust-heading">Atendimento Humanizado</h3>
                <p className="trust-text">
                  Equipe treinada para atender idosos com paciência, respeito e dedicação.
                  Ambiente acolhedor e acessível.
                </p>
              </div>
            </div>

            <div className="trust-feature">
              <div className="trust-icon" aria-hidden="true">✓</div>
              <div className="trust-content">
                <h3 className="trust-heading">Acessibilidade Total</h3>
                <p className="trust-text">
                  Clínica totalmente adaptada para mobilidade reduzida.
                  Estacionamento, elevadores e banheiros acessíveis.
                </p>
              </div>
            </div>

            <div className="trust-feature">
              <div className="trust-icon" aria-hidden="true">✓</div>
              <div className="trust-content">
                <h3 className="trust-heading">Tecnologia Moderna</h3>
                <p className="trust-text">
                  Equipamentos de última geração para diagnóstico preciso e
                  cirurgias seguras com recuperação rápida.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="contact-section">
        <div className="contact-container">
          <h2 className="contact-title">Entre em Contato</h2>
          <p className="contact-description">
            Nossa equipe está pronta para atender você e sua família
          </p>

          <div className="contact-options">
            <a href="tel:+553333213700" className="contact-button phone">
              <span className="contact-button-icon" aria-hidden="true">☎</span>
              <div className="contact-button-content">
                <span className="contact-button-label">Ligar Agora</span>
                <span className="contact-button-value">(33) 3321-3700</span>
              </div>
            </a>

            <a href="/senior/agendar" className="contact-button schedule">
              <span className="contact-button-icon" aria-hidden="true">📅</span>
              <div className="contact-button-content">
                <span className="contact-button-label">Agendar Consulta</span>
                <span className="contact-button-value">Online ou por Telefone</span>
              </div>
            </a>

            <a href="https://wa.me/5533933213700" className="contact-button whatsapp">
              <span className="contact-button-icon" aria-hidden="true">💬</span>
              <div className="contact-button-content">
                <span className="contact-button-label">WhatsApp</span>
                <span className="contact-button-value">Mensagem Direta</span>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
