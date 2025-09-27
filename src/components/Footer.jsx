import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, ArrowUp, MessageCircle, Bot, Twitter } from 'lucide-react';
import Logo from '@/components/Logo';
import { clinicInfo } from '@/lib/clinicInfo';
import { SocialLinks } from '@/components/ui/social-links';
import { cn } from '@/lib/utils';

const Footer = () => {
  const { t } = useTranslation();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Memoize computed values
  const footerData = useMemo(() => ({
    phoneNumber: clinicInfo.phone.replace(/\D/g, ''),
    whatsappLink: `https://wa.me/${clinicInfo.phone.replace(/\D/g, '')}`,
    chatbotUrl: clinicInfo.chatbotUrl,
    amorSaudeLogo: "/api/images/proxy/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/66c6d707b457395f0aaf159d826531ef.png",
    currentYear: new Date().getFullYear()
  }), []);

  const navLinks = useMemo(() => [
    { name: t('navbar.home'), href: '/' },
    { name: t('navbar.services'), href: '/servicos' },
    { name: t('navbar.about'), href: '/sobre' },
  ], [t]);

  const serviceLinks = useMemo(() =>
    t('footer.service_links', { returnObjects: true }) || {
      "consultations": "Consultations",
      "refraction": "Refraction",
      "treatments": "Treatments",
      "surgeries": "Surgeries",
      "pediatric": "Pediatric",
      "reports": "Reports"
    }
    , [t]);

  const socialsForLinks = useMemo(() => [
    {
      name: "Facebook",
      href: clinicInfo.facebook,
      image: "/icons_social/facebook_icon.png"
    },
    {
      name: "Instagram",
      href: clinicInfo.instagram,
      image: "/icons_social/instagram_icon.png",
    },
    {
      name: "LinkedIn",
      href: clinicInfo.linkedin,
      image: "/icons_social/linkedln_icon.png",
    },
    {
      name: "X",
      href: clinicInfo.x || "https://x.com/philipe_saraiva",
      image: "/icons_social/X_icon.png",
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@saraivavision",
      image: "/icons_social/tik_tok_icon.png",
    },
  ], []);

  const FooterSection = ({ title, children, className }) => (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-lg font-semibold mb-6 text-white">{title}</h3>
      {children}
    </div>
  );

  const ContactItem = ({ children, className }) => (
    <li className={cn('text-slate-400', className)}>{children}</li>
  );

  const ContactLink = ({ href, children, external = false, icon: Icon, className }) => {
    const linkProps = {
      href,
      className: cn('hover:text-white transition-colors flex items-center gap-2', className),
      ...(external && { target: '_blank', rel: 'noopener noreferrer' })
    };

    return (
      <ContactItem>
        <a {...linkProps}>
          {Icon && <Icon size={16} />}
          {children}
        </a>
      </ContactItem>
    );
  };

  return (
    <footer className="bg-slate-800 text-slate-300 pb-8 w-full">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Logo isWhite />
            <p className="mt-4 mb-6 text-slate-400">
              {t('footer.slogan')}
            </p>
            <p className="text-slate-400 mb-2 text-sm">{t('footer.partner_of')}</p>
            <a
              href="https://www.amorsaude.com.br/clinica/caratinga-mg/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('footer.partner_link_aria', 'Abrir site do parceiro Amor e Saúde (nova aba)')}
              className="inline-block"
            >
              <img
                src={footerData.amorSaudeLogo}
                alt={t('footer.amor_saude_alt')}
                className="h-16 w-auto mb-6 hover:opacity-80 transition-opacity"
                width="160"
                height="64"
                sizes="(min-width: 768px) 160px, 128px"
                loading="lazy"
                decoding="async"
              />
            </a>
          </div>

          <FooterSection title={t('footer.quick_links')}>
            <ul className="space-y-3">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-white transition-colors inline-block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          <FooterSection title={t('footer.services')}>
            <ul className="space-y-3">
              {Object.entries(serviceLinks).map(([key, serviceName]) => (
                <li key={key}>
                  <Link to="/servicos" className="hover:text-white transition-colors inline-block">
                    {serviceName}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          <FooterSection title={t('footer.contact')}>
            <ul className="space-y-3">
              <ContactItem>{t('footer.address_line1')}</ContactItem>
              <ContactItem>{t('footer.address_line2')}</ContactItem>
              <ContactLink href={`mailto:${clinicInfo.email}`}>
                {clinicInfo.email}
              </ContactLink>
              <ContactLink
                href={footerData.whatsappLink}
                external
                icon={MessageCircle}
              >
                {clinicInfo.phoneDisplay}
              </ContactLink>
              <ContactLink
                href={footerData.chatbotUrl}
                external
                icon={Bot}
              >
                {t('contact.chatbot_title')}
              </ContactLink>
              <ContactItem>{t('footer.hours')}</ContactItem>
            </ul>
          </FooterSection>
        </div>

        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-8">
            <div className="flex-1 space-y-2">
              <p className="text-slate-400 text-xs leading-snug">
                <span className="block font-medium text-slate-300">{clinicInfo.responsiblePhysician} • {clinicInfo.responsiblePhysicianCRM} • {clinicInfo.responsiblePhysicianTitle}</span>
                <span className="block">{clinicInfo.responsibleNurse} • {clinicInfo.responsibleNurseTitle}</span>
                <span className="block">CNPJ: {clinicInfo.taxId}</span>
                <span className="block">DPO: <a href={`mailto:${clinicInfo.dpoEmail}`} className="underline hover:text-white transition-colors">{clinicInfo.dpoEmail}</a></span>
                <span className="block space-x-3">
                  <a href="/privacy" className="underline hover:text-white transition-colors">{t('privacy.link_label')}</a>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new Event('open-privacy-settings'))}
                    className="underline hover:text-white transition-colors"
                  >
                    {t('privacy.manage_cookies')}
                  </button>
                </span>
                {/* reCAPTCHA disclosure (required if badge is hidden) */}
                <span
                  className="block mt-2"
                  dangerouslySetInnerHTML={{
                    __html: t(
                      'recaptcha.disclosure_html',
                      'Este site é protegido pelo reCAPTCHA e se aplicam a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" class="underline">Política de Privacidade</a> e os <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" class="underline">Termos de Serviço</a> do Google.'
                    )
                  }}
                />
              </p>
              <p className="text-slate-500 text-xs">{t('privacy.disclaimer')}</p>
              <p className="text-slate-500 text-xs">{t('cfm.disclaimer')}</p>
              <p className="text-slate-400 text-xs mt-2">{t('footer.copyright', { year: footerData.currentYear })}</p>
            </div>

            <div className="flex flex-col items-center gap-4 lg:items-end">
              {/* Social Links */}
              <div className="flex items-center space-x-4">
                <SocialLinks socials={socialsForLinks} />
                <button
                  onClick={scrollToTop}
                  className="p-2.5 bg-slate-700 rounded-full text-white hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                  aria-label={t('footer.back_to_top')}
                  title={t('footer.back_to_top')}
                >
                  <ArrowUp size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);