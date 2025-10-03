/**
 * Familiar - Plans Page
 * Family subscription plans with pricing and benefits
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planos Familiares | Saraiva Vision',
  description:
    'Planos familiares com até 30% de desconto. Consultas, exames e tratamentos oftalmológicos para toda a família em Caratinga, MG.'
};

export default function PlanosPage() {
  return (
    <div className="planos-page">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="hero-container">
          <h1 className="hero-title">
            Planos <span className="text-primary">Familiares</span>
          </h1>
          <p className="hero-description">
            Cuide da visão de toda a família com economia e qualidade.
            Planos personalizados com descontos de até 30%.
          </p>
        </div>
      </section>

      {/* Benefits Banner */}
      <section className="benefits-banner">
        <div className="benefits-container">
          <div className="benefit-item">
            <span className="benefit-icon">💰</span>
            <span className="benefit-text">Até 30% de desconto</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">👨‍👩‍👧‍👦</span>
            <span className="benefit-text">Para toda a família</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">📅</span>
            <span className="benefit-text">Consultas prioritárias</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">✨</span>
            <span className="benefit-text">Benefícios exclusivos</span>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="plans-section">
        <div className="section-container">
          <h2 className="section-title">Escolha seu Plano</h2>
          <p className="section-subtitle">Planos flexíveis que se adaptam às necessidades da sua família</p>

          <div className="plans-grid">
            {/* Basic Plan */}
            <div className="plan-card">
              <div className="plan-header">
                <h3 className="plan-name">Família Básica</h3>
                <p className="plan-tagline">Para começar a cuidar da visão</p>
              </div>

              <div className="plan-pricing">
                <div className="price-main">
                  <span className="price-currency">R$</span>
                  <span className="price-amount">89</span>
                  <span className="price-period">/mês</span>
                </div>
                <p className="price-description">por família (até 4 pessoas)</p>
              </div>

              <div className="plan-features">
                <h4 className="features-heading">O que está incluído:</h4>
                <ul className="features-list">
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">1 consulta anual por pessoa</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">Exame de acuidade visual</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">10% desconto em óculos</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">Agendamento prioritário</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">Atendimento telefônico</span>
                  </li>
                </ul>
              </div>

              <div className="plan-action">
                <a href="/familiar/assinar?plano=basico" className="plan-button">
                  Escolher Plano
                </a>
              </div>
            </div>

            {/* Standard Plan - Featured */}
            <div className="plan-card featured">
              <div className="plan-badge">Mais Popular</div>
              <div className="plan-header">
                <h3 className="plan-name">Família Plus</h3>
                <p className="plan-tagline">Cuidado completo e economia real</p>
              </div>

              <div className="plan-pricing">
                <div className="price-main">
                  <span className="price-currency">R$</span>
                  <span className="price-amount">149</span>
                  <span className="price-period">/mês</span>
                </div>
                <p className="price-description">por família (até 4 pessoas)</p>
                <p className="price-savings">Economia de R$ 480/ano</p>
              </div>

              <div className="plan-features">
                <h4 className="features-heading">Tudo do Básico, mais:</h4>
                <ul className="features-list">
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">2 consultas anuais por pessoa</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">Exames completos inclusos</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">20% desconto em óculos e lentes</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">Telemedicina para dúvidas</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">Exame de fundo de olho</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">Tonometria (pressão ocular)</span>
                  </li>
                </ul>
              </div>

              <div className="plan-action">
                <a href="/familiar/assinar?plano=plus" className="plan-button primary">
                  Assinar Agora
                </a>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="plan-card">
              <div className="plan-header">
                <h3 className="plan-name">Família Premium</h3>
                <p className="plan-tagline">Cuidado VIP sem limites</p>
              </div>

              <div className="plan-pricing">
                <div className="price-main">
                  <span className="price-currency">R$</span>
                  <span className="price-amount">249</span>
                  <span className="price-period">/mês</span>
                </div>
                <p className="price-description">por família (até 6 pessoas)</p>
                <p className="price-savings">Economia de R$ 840/ano</p>
              </div>

              <div className="plan-features">
                <h4 className="features-heading">Tudo do Plus, mais:</h4>
                <ul className="features-list">
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">Consultas ilimitadas</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">Todos os exames inclusos</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">30% desconto em óculos e lentes</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">Telemedicina 24/7</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">OCT e exames avançados</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">Atendimento domiciliar (idosos)</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">Desconto em cirurgias</span>
                  </li>
                </ul>
              </div>

              <div className="plan-action">
                <a href="/familiar/assinar?plano=premium" className="plan-button">
                  Escolher Premium
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="comparison-section">
        <div className="section-container">
          <h2 className="section-title">Compare os Planos</h2>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="feature-column">Benefícios</th>
                  <th className="plan-column">Básica</th>
                  <th className="plan-column featured">Plus</th>
                  <th className="plan-column">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="feature-name">Pessoas incluídas</td>
                  <td className="plan-value">Até 4</td>
                  <td className="plan-value">Até 4</td>
                  <td className="plan-value">Até 6</td>
                </tr>
                <tr>
                  <td className="feature-name">Consultas anuais</td>
                  <td className="plan-value">1 por pessoa</td>
                  <td className="plan-value">2 por pessoa</td>
                  <td className="plan-value">Ilimitadas</td>
                </tr>
                <tr>
                  <td className="feature-name">Exames básicos</td>
                  <td className="plan-value">Acuidade visual</td>
                  <td className="plan-value">Completos</td>
                  <td className="plan-value">Todos inclusos</td>
                </tr>
                <tr>
                  <td className="feature-name">Exames avançados (OCT, campo visual)</td>
                  <td className="plan-value">-</td>
                  <td className="plan-value">Com desconto</td>
                  <td className="plan-value">✓ Inclusos</td>
                </tr>
                <tr>
                  <td className="feature-name">Desconto óculos/lentes</td>
                  <td className="plan-value">10%</td>
                  <td className="plan-value">20%</td>
                  <td className="plan-value">30%</td>
                </tr>
                <tr>
                  <td className="feature-name">Telemedicina</td>
                  <td className="plan-value">-</td>
                  <td className="plan-value">Horário comercial</td>
                  <td className="plan-value">✓ 24/7</td>
                </tr>
                <tr>
                  <td className="feature-name">Agendamento prioritário</td>
                  <td className="plan-value">✓</td>
                  <td className="plan-value">✓</td>
                  <td className="plan-value">✓</td>
                </tr>
                <tr>
                  <td className="feature-name">Atendimento domiciliar</td>
                  <td className="plan-value">-</td>
                  <td className="plan-value">-</td>
                  <td className="plan-value">✓ Idosos</td>
                </tr>
                <tr>
                  <td className="feature-name">Desconto em cirurgias</td>
                  <td className="plan-value">-</td>
                  <td className="plan-value">10%</td>
                  <td className="plan-value">15%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-works-section">
        <div className="section-container">
          <h2 className="section-title">Como Funciona</h2>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Escolha seu Plano</h3>
              <p className="step-description">
                Selecione o plano que melhor se adapta às necessidades da sua família.
                Você pode mudar de plano a qualquer momento.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Cadastre a Família</h3>
              <p className="step-description">
                Adicione os membros da família que serão beneficiados.
                Crianças, adultos e idosos na mesma assinatura.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Agende as Consultas</h3>
              <p className="step-description">
                Use nosso sistema online ou ligue para agendar.
                Beneficiários do plano têm prioridade no agendamento.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h3 className="step-title">Aproveite os Benefícios</h3>
              <p className="step-description">
                Utilize consultas, exames e descontos conforme incluído no plano.
                Sem burocracias ou autorizações complicadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="section-container">
          <h2 className="section-title">Perguntas Frequentes</h2>

          <div className="faq-grid">
            <div className="faq-item">
              <h3 className="faq-question">Posso cancelar a qualquer momento?</h3>
              <p className="faq-answer">
                Sim, nossos planos não têm fidelidade. Você pode cancelar a qualquer momento,
                sem multas ou taxas de cancelamento.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">Como adiciono ou removo membros da família?</h3>
              <p className="faq-answer">
                Você pode adicionar ou remover membros através do portal do cliente ou
                entrando em contato com nossa equipe. Ajustes no valor são feitos no próximo ciclo.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">Os descontos valem para toda a família?</h3>
              <p className="faq-answer">
                Sim! Todos os membros cadastrados no plano têm direito aos mesmos descontos
                em óculos, lentes e procedimentos.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">E se eu precisar de consultas extras?</h3>
              <p className="faq-answer">
                No plano Premium, as consultas são ilimitadas. Nos outros planos, consultas
                adicionais têm 20% de desconto sobre o valor avulso.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">Posso mudar de plano depois?</h3>
              <p className="faq-answer">
                Sim, você pode fazer upgrade ou downgrade do plano a qualquer momento.
                A mudança entra em vigor no próximo ciclo de cobrança.
              </p>
            </div>

            <div className="faq-item">
              <h3 className="faq-question">Como funciona a carência?</h3>
              <p className="faq-answer">
                Não há carência! Você pode usar os benefícios imediatamente após a contratação
                e primeiro pagamento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Pronto para cuidar da família?</h2>
          <p className="cta-description">
            Assine agora e garanta economia e tranquilidade para toda a família
          </p>
          <div className="cta-actions">
            <a href="/familiar/assinar" className="btn-primary btn-large">
              <span className="btn-icon">✨</span>
              Assinar Agora
            </a>
            <a href="tel:+553333213700" className="btn-secondary btn-large">
              <span className="btn-icon">📞</span>
              Tirar Dúvidas: (33) 3321-3700
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
