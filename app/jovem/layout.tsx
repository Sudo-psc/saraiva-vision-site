/**
 * Jovem Profile Layout
 * Modern, tech-savvy design with subscription model focus
 */

import type { Metadata } from 'next';
import JovemNav from '@/components/navigation/JovemNav';
import '@/styles/jovem.css';

export const metadata: Metadata = {
  title: 'Saraiva Vision - Tecnologia e Inovação para Sua Visão',
  description:
    'Planos de assinatura, cirurgia a laser, lentes premium e tecnologia de ponta para jovens. Cuide da sua visão com inovação em Caratinga, MG.',
  keywords: [
    'cirurgia laser',
    'lentes premium',
    'assinatura oftalmológica',
    'tecnologia visão',
    'ICL lentes',
    'oftalmologia moderna'
  ],
  openGraph: {
    title: 'Saraiva Vision - Visão do Futuro',
    description: 'Tecnologia de ponta e planos flexíveis para sua visão perfeita.',
    type: 'website',
    locale: 'pt_BR'
  }
};

export default function JovemLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="jovem-layout" data-profile="jovem">
      <JovemNav />

      <main id="main-content" className="jovem-main">
        {children}
      </main>

      <footer className="jovem-footer">
        <div className="footer-glass">
          <div className="footer-container">
            <div className="footer-content">
              <div className="footer-section">
                <h3 className="footer-heading gradient-text">Saraiva Vision</h3>
                <p className="footer-text">Tecnologia e inovação para a sua visão perfeita.</p>
              </div>

              <div className="footer-section">
                <h4 className="footer-subheading">Links</h4>
                <ul className="footer-links">
                  <li><a href="/jovem/assinatura">Planos</a></li>
                  <li><a href="/jovem/tecnologia">Tecnologia</a></li>
                  <li><a href="/jovem/lentes">Lentes</a></li>
                  <li><a href="/jovem/app">App</a></li>
                </ul>
              </div>

              <div className="footer-section">
                <h4 className="footer-subheading">Conecte-se</h4>
                <div className="social-links">
                  <a href="https://instagram.com/saraivavision" className="social-link" aria-label="Instagram">📱</a>
                  <a href="https://tiktok.com/@saraivavision" className="social-link" aria-label="TikTok">🎵</a>
                  <a href="https://youtube.com/@saraivavision" className="social-link" aria-label="YouTube">📺</a>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <p className="footer-copyright">&copy; {new Date().getFullYear()} Saraiva Vision. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
