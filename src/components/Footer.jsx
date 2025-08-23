import React from 'react';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Linkedin, ArrowUp, MessageCircle, Bot } from 'lucide-react';
import Logo from '@/components/Logo';
import { clinicInfo } from '@/lib/clinicInfo';

const Footer = () => {
  const { t } = useTranslation();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const phoneNumber = "5533998601427";
  const whatsappLink = `https://wa.me/${phoneNumber}`;
  const chatbotUrl = "https://chatgpt.com/g/g-quepJB90J-saraiva-vision-clinica-oftalmologica?model=gpt-4o";
  const amorSaudeLogo = "https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/66c6d707b457395f0aaf159d826531ef.png";

  const navLinks = [
    { name: t('navbar.home'), href: '#home' },
    { name: t('navbar.services'), href: '#services' },
    { name: t('navbar.about'), href: '#about' },
    { name: t('navbar.testimonials'), href: '#testimonials' },
    { name: t('navbar.contact'), href: '#contact' },
  ];

  const serviceLinks = t('footer.service_links', { returnObjects: true });

  const socialLinks = [
    { href: "https://web.facebook.com/profile.php?id=61559488419531", icon: <Facebook size={20} /> },
    { href: "https://www.instagram.com/saraiva_vision/", icon: <Instagram size={20} /> },
    { href: "https://www.linkedin.com/in/dr-philipe-saraiva", icon: <Linkedin size={20} /> },
  ];

  return (
    <footer className="bg-slate-800 text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Logo isWhite />
            <p className="mt-4 mb-6 text-slate-400">
              {t('footer.slogan')}
            </p>
            <p className="text-slate-400 mb-2 text-sm">{t('footer.partner_of')}</p>
            <a href="https://www.amorsaude.com.br/clinica/caratinga-mg/" target="_blank" rel="noopener noreferrer">
              <img src={amorSaudeLogo} alt={t('footer.amor_saude_alt')} className="h-16 w-auto mb-6" />
            </a>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">{t('footer.quick_links')}</h3>
            <ul className="space-y-3">
              {navLinks.map(link => (
                <li key={link.name}>
                  <a href={link.href} className="hover:text-white transition-colors">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">{t('footer.services')}</h3>
            <ul className="space-y-3">
              {Object.values(serviceLinks).map((serviceName, index) => (
                <li key={index}>
                  <a href="#services" className="hover:text-white transition-colors">{serviceName}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li>{t('footer.address_line1')}</li>
              <li>{t('footer.address_line2')}</li>
              <li>
                <a href="mailto:saraivavision@gmail.com" className="hover:text-white transition-colors">saraivavision@gmail.com</a>
              </li>
              <li>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                  <MessageCircle size={16} /> +55 33 99860-1427
                </a>
              </li>
              <li>
                <a href={chatbotUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                  <Bot size={16} /> {t('contact.chatbot_title')}
                </a>
              </li>
              <li>{t('footer.hours')}</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1 space-y-2">
            <p className="text-slate-400 text-xs leading-snug">
              <span className="block font-medium text-slate-300">{clinicInfo.responsiblePhysician} • {clinicInfo.responsiblePhysicianCRM}</span>
              <span className="block">{clinicInfo.responsibleNurse} • {clinicInfo.responsibleNursePhone}</span>
              <span className="block">CNPJ: {clinicInfo.taxId}</span>
              <span className="block">DPO: <a href={`mailto:${clinicInfo.dpoEmail}`} className="underline hover:text-white">{clinicInfo.dpoEmail}</a></span>
              <span className="block">
                <a href="/privacy" className="underline hover:text-white mr-3">{t('privacy.link_label')}</a>
                <button onClick={() => window.dispatchEvent(new Event('open-privacy-settings'))} className="underline hover:text-white">
                  {t('privacy.manage_cookies')}
                </button>
              </span>
            </p>
            <p className="text-slate-500 text-xs">{t('privacy.disclaimer')}</p>
            <p className="text-slate-500 text-xs">{t('cfm.disclaimer')}</p>
            <p className="text-slate-400 text-xs mt-2">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          </div>
          <div className="flex items-center space-x-4 self-end md:self-auto">
            {socialLinks.map((link, index) => (
              <a key={index} href={link.href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                {link.icon}
              </a>
            ))}
            <button 
              onClick={scrollToTop}
              className="p-2.5 bg-slate-700 rounded-full text-white hover:bg-blue-600 transition-colors"
              aria-label={t('footer.back_to_top')}
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;