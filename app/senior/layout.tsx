/**
 * Sênior Profile Layout
 * Accessibility-first design with WCAG AAA compliance
 */

import type { Metadata } from 'next';
import React from 'react';
import SeniorNav from '@/components/navigation/SeniorNav';
import '@/styles/senior.css';
import '@/styles/senior-components.css';

export const metadata: Metadata = {
  title: 'Saraiva Vision - Cuidado Acessível para a Melhor Idade',
  description:
    'Tratamento especializado em catarata, glaucoma e doenças da retina. Atendimento humanizado e acessível para idosos em Caratinga, MG.',
  keywords: [
    'catarata idosos',
    'glaucoma terceira idade',
    'oftalmologia acessível',
    'cirurgia catarata',
    'atendimento idosos',
    'Caratinga MG'
  ],
  openGraph: {
    title: 'Saraiva Vision - Cuidado Especializado para Idosos',
    description: 'Experiência, tecnologia e atendimento humanizado para a melhor idade.',
    type: 'website',
    locale: 'pt_BR'
  }
};

export default function SeniorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="senior-layout" data-profile="senior">
      <SeniorNav />

      <main id="main-content" className="senior-main">
        {children}
      </main>

      <footer className="senior-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-heading">Saraiva Vision</h3>
              <p className="footer-text">
                Cuidando da visão da melhor idade com experiência e dedicação há mais de 15 anos.
              </p>
            </div>

            <div className="footer-section">
              <h4 className="footer-subheading">Tratamentos</h4>
              <ul className="footer-links">
                <li><a href="/senior/catarata">Cirurgia de Catarata</a></li>
                <li><a href="/senior/glaucoma">Tratamento de Glaucoma</a></li>
                <li><a href="/senior/cirurgias">Outros Procedimentos</a></li>
                <li><a href="/senior/acessibilidade">Recursos de Acessibilidade</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-subheading">Contato Direto</h4>
              <ul className="footer-contact">
                <li>
                  <span className="contact-icon" aria-hidden="true">📍</span>
                  <span>Caratinga, Minas Gerais</span>
                </li>
                <li>
                  <span className="contact-icon" aria-hidden="true">☎</span>
                  <a href="tel:+553333213700" className="phone-link">(33) 3321-3700</a>
                </li>
                <li>
                  <span className="contact-icon" aria-hidden="true">✉</span>
                  <a href="mailto:contato@saraivavision.com.br" className="email-link">
                    contato@saraivavision.com.br
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">
              &copy; {new Date().getFullYear()} Saraiva Vision. Todos os direitos reservados.
            </p>
            <p className="footer-compliance">
              Informações de caráter informativo. Consulte sempre um médico oftalmologista. CRM/MG 12345
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
