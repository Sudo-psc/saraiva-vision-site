import React from 'react';
import EnhancedFooterResponsive from '../EnhancedFooterResponsive';
import ResponsiveSocialIcons from '../ResponsiveSocialIcons';

/**
 * Example implementation of the responsive enhanced footer
 * Demonstrates all responsive features and configurations
 */
const ResponsiveFooterExample = () => {
    // Sample social media links
    const socialLinks = [
        {
            name: 'facebook',
            href: 'https://facebook.com/drphilipesaraiva',
            image: '/icons_social/facebook_icon.png'
        },
        {
            name: 'instagram',
            href: 'https://instagram.com/drphilipesaraiva',
            image: '/icons_social/instagram_icon.png'
        },
        {
            name: 'linkedin',
            href: 'https://linkedin.com/in/drphilipesaraiva',
            image: '/icons_social/linkedln_icon.png'
        },
        {
            name: 'whatsapp',
            href: 'https://wa.me/5511999999999',
            image: '/icons_social/whatsapp_icon.png'
        },
        {
            name: 'spotify',
            href: 'https://open.spotify.com/show/drphilipesaraiva',
            image: '/icons_social/spotify_icon.png'
        }
    ];

    // Brand colors for beam background
    const beamColors = [
        '#3B82F6', // Blue
        '#8B5CF6', // Purple
        '#06B6D4', // Cyan
        '#10B981', // Emerald
        '#F59E0B'  // Amber
    ];

    return (
        <EnhancedFooterResponsive
            enableGlass={true}
            enableBeams={true}
            beamColors={beamColors}
            className="clinic-footer"
        >
            {/* Contact Information Section */}
            <div className="footer-section contact-info">
                <h3 className="footer-heading">Contato</h3>
                <div className="contact-details">
                    <p>
                        <strong>Dr. Philipe Saraiva</strong><br />
                        Oftalmologista CRM 123456
                    </p>
                    <p>
                        📍 Rua das Flores, 123<br />
                        São Paulo - SP, 01234-567
                    </p>
                    <p>
                        📞 <a href="tel:+5511999999999">(11) 99999-9999</a><br />
                        ✉️ <a href="mailto:contato@drphilipesaraiva.com.br">
                            contato@drphilipesaraiva.com.br
                        </a>
                    </p>
                </div>
            </div>

            {/* Services Section */}
            <div className="footer-section services">
                <h3 className="footer-heading">Serviços</h3>
                <ul className="services-list">
                    <li><a href="/servicos/consulta">Consulta Oftalmológica</a></li>
                    <li><a href="/servicos/cirurgia">Cirurgia de Catarata</a></li>
                    <li><a href="/servicos/lentes">Lentes de Contato</a></li>
                    <li><a href="/servicos/retina">Tratamento de Retina</a></li>
                    <li><a href="/servicos/glaucoma">Tratamento de Glaucoma</a></li>
                </ul>
            </div>

            {/* Quick Links Section */}
            <div className="footer-section quick-links">
                <h3 className="footer-heading">Links Rápidos</h3>
                <ul className="links-list">
                    <li><a href="/sobre">Sobre o Dr. Philipe</a></li>
                    <li><a href="/blog">Blog</a></li>
                    <li><a href="/podcast">Podcast</a></li>
                    <li><a href="/agendamento">Agendamento</a></li>
                    <li><a href="/contato">Contato</a></li>
                </ul>
            </div>

            {/* Social Media & Certifications Section */}
            <div className="footer-section social-certifications">
                <h3 className="footer-heading">Redes Sociais</h3>

                {/* Responsive Social Icons */}
                <ResponsiveSocialIcons
                    socialLinks={socialLinks}
                    enableGlassBubble={true}
                    className="footer-social-icons"
                />

                {/* Certifications */}
                <div className="certifications" style={{ marginTop: '1.5rem' }}>
                    <h4 className="cert-heading">Certificações</h4>
                    <div className="cert-badges">
                        <img
                            src="/img/certificate-abo.svg"
                            alt="Certificado ABO"
                            className="cert-badge"
                            style={{ height: '40px', width: 'auto' }}
                        />
                        <img
                            src="/img/iso9001-badge.svg"
                            alt="ISO 9001:2015"
                            className="cert-badge"
                            style={{ height: '40px', width: 'auto' }}
                        />
                    </div>
                </div>
            </div>

            {/* Copyright Section */}
            <div className="footer-bottom" style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                marginTop: '2rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>
                    © {new Date().getFullYear()} Dr. Philipe Saraiva - Oftalmologista.
                    Todos os direitos reservados.
                </p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', opacity: 0.6 }}>
                    <a href="/privacidade" style={{ color: 'inherit', textDecoration: 'none' }}>
                        Política de Privacidade
                    </a>
                    {' | '}
                    <a href="/termos" style={{ color: 'inherit', textDecoration: 'none' }}>
                        Termos de Uso
                    </a>
                    {' | '}
                    <a href="/lgpd" style={{ color: 'inherit', textDecoration: 'none' }}>
                        LGPD
                    </a>
                </p>
            </div>

            {/* Scroll to Top Button */}
            <button
                className="scroll-to-top"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    transition: 'all 0.3s ease',
                    zIndex: 1000
                }}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                aria-label="Voltar ao topo"
            >
                ↑
            </button>

            <style jsx>{`
        .footer-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-heading {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
          color: white;
        }

        .cert-heading {
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0 0 0.5rem 0;
          color: rgba(255, 255, 255, 0.9);
        }

        .contact-details p {
          margin: 0 0 0.75rem 0;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.9);
        }

        .contact-details a {
          color: #60A5FA;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .contact-details a:hover {
          color: #93C5FD;
        }

        .services-list,
        .links-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .services-list a,
        .links-list a {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: all 0.2s ease;
          padding: 0.25rem 0;
        }

        .services-list a:hover,
        .links-list a:hover {
          color: white;
          transform: translateX(4px);
        }

        .cert-badges {
          display: flex;
          gap: 1rem;
          align-items: center;
          justify-content: center;
        }

        .cert-badge {
          filter: brightness(0.9);
          transition: filter 0.2s ease;
        }

        .cert-badge:hover {
          filter: brightness(1.1);
        }

        /* Mobile Responsive Styles */
        @media (max-width: 767px) {
          .footer-section {
            text-align: center;
          }

          .services-list,
          .links-list {
            align-items: center;
          }

          .cert-badges {
            justify-content: center;
          }

          .scroll-to-top {
            bottom: 1rem !important;
            right: 1rem !important;
            width: 2.5rem !important;
            height: 2.5rem !important;
            font-size: 1rem !important;
          }
        }

        /* Tablet Responsive Styles */
        @media (min-width: 768px) and (max-width: 1023px) {
          .footer-section {
            text-align: left;
          }

          .cert-badges {
            justify-content: flex-start;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .footer-heading,
          .cert-heading {
            color: white;
            text-shadow: 1px 1px 2px black;
          }

          .contact-details a,
          .services-list a,
          .links-list a {
            border-bottom: 1px solid currentColor;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .services-list a:hover,
          .links-list a:hover {
            transform: none;
          }

          .scroll-to-top {
            transition: none !important;
          }
        }
      `}</style>
        </EnhancedFooterResponsive>
    );
};

export default ResponsiveFooterExample;