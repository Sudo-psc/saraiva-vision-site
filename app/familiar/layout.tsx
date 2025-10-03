/**
 * Familiar Profile Layout
 * Family-focused design with trust and prevention themes
 */

import type { Metadata } from 'next';
import FamiliarNav from '@/components/navigation/FamiliarNav';
import '@/styles/familiar.css';

export const metadata: Metadata = {
  title: 'Saraiva Vision - Cuidado com a Visão da Sua Família',
  description:
    'Clínica oftalmológica especializada em cuidados preventivos e tratamentos para toda a família. Exames completos, consultas e cirurgias em Caratinga, MG.',
  keywords: [
    'oftalmologia familiar',
    'exames de vista',
    'consulta oftalmológica',
    'cuidado preventivo',
    'saúde ocular infantil',
    'Caratinga MG'
  ],
  openGraph: {
    title: 'Saraiva Vision - Cuidado Familiar com a Visão',
    description: 'Sua família merece o melhor cuidado oftalmológico. Prevenção, exames e tratamentos completos.',
    type: 'website',
    locale: 'pt_BR'
  }
};

export default function FamiliarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="familiar-layout" data-profile="familiar">
      <FamiliarNav />

      <main id="main-content" className="familiar-main">
        {children}
      </main>

      <footer className="familiar-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-heading">Saraiva Vision</h3>
              <p className="footer-text">Cuidando da visão da sua família com excelência e dedicação.</p>
            </div>

            <div className="footer-section">
              <h4 className="footer-subheading">Links Rápidos</h4>
              <ul className="footer-links">
                <li>
                  <a href="/familiar/prevencao">Prevenção</a>
                </li>
                <li>
                  <a href="/familiar/exames">Exames</a>
                </li>
                <li>
                  <a href="/familiar/planos">Planos Familiares</a>
                </li>
                <li>
                  <a href="/familiar/duvidas">Dúvidas Frequentes</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-subheading">Contato</h4>
              <ul className="footer-contact">
                <li>
                  <span className="contact-icon">📍</span> Caratinga, MG
                </li>
                <li>
                  <span className="contact-icon">📞</span> (33) 3321-3700
                </li>
                <li>
                  <span className="contact-icon">✉️</span> contato@saraivavision.com.br
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">&copy; {new Date().getFullYear()} Saraiva Vision. Todos os direitos reservados.</p>
            <p className="footer-compliance">
              Informações de caráter informativo. Consulte sempre um médico oftalmologista. CRM/MG 12345
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
