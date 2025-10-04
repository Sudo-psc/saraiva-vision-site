/**
 * Enhanced Footer Component - Next.js 15 Version
 * Simplified version compatible with Next.js App Router
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUp, MapPin, Phone, Mail, Clock } from 'lucide-react';
import Logo from '@/components/Logo';
import { clinicInfo } from '@/lib/clinicInfo';

const EnhancedFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const currentYear = new Date().getFullYear();

  const navLinks = [
    { name: 'Início', href: '/' },
    { name: 'Serviços', href: '/servicos' },
    { name: 'Sobre', href: '/sobre' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contato', href: '/#contato' },
  ];

  const serviceLinks = [
    { name: 'Consultas', href: '/servicos' },
    { name: 'Cirurgia de Catarata', href: '/servicos/catarata' },
    { name: 'Tratamento de Glaucoma', href: '/servicos/glaucoma' },
    { name: 'Lentes de Contato', href: '/lentes' },
    { name: 'Exames de Vista', href: '/servicos/exames' },
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      href: clinicInfo.facebook,
      icon: '📘'
    },
    {
      name: 'Instagram',
      href: clinicInfo.instagram,
      icon: '📷'
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/5533998601427',
      icon: '💬'
    },
    {
      name: 'Google Reviews',
      href: 'https://search.google.com/local/writereview?placeid=ChIJVUKww7WRugARF7u2lAe7BeE',
      icon: '⭐'
    },
  ];

  return (
    <footer className="bg-slate-800 text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Logo and About */}
          <div>
            <Logo isWhite />
            <p className="mt-4 mb-6 text-slate-400">
              Clínica oftalmológica especializada em Caratinga, MG.
              Cuidado completo para sua visão com tecnologia de ponta.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors text-2xl"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Links Rápidos</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Serviços</h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                <span className="text-slate-400">
                  {clinicInfo.streetAddress}, {clinicInfo.neighborhood}<br />
                  {clinicInfo.city}-{clinicInfo.state}, CEP {clinicInfo.postalCode}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-400 flex-shrink-0" />
                <a
                  href={`tel:${clinicInfo.phone}`}
                  className="hover:text-white transition-colors"
                >
                  {clinicInfo.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a
                  href={`mailto:${clinicInfo.email}`}
                  className="hover:text-white transition-colors"
                >
                  {clinicInfo.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-slate-400">
                  Segunda a Sexta: 8h às 18h<br />
                  Sábado: 8h às 12h
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1 space-y-2">
              <p className="text-slate-400 text-xs">
                <span className="block font-medium text-slate-300">
                  {clinicInfo.responsiblePhysician} • {clinicInfo.responsiblePhysicianCRM}
                </span>
                <span className="block">CNPJ: {clinicInfo.taxId}</span>
                <span className="block">
                  DPO: <a href={`mailto:${clinicInfo.dpoEmail}`} className="underline hover:text-white transition-colors">
                    {clinicInfo.dpoEmail}
                  </a>
                </span>
                <span className="block space-x-3">
                  <Link href="/privacy" className="underline hover:text-white transition-colors">
                    Política de Privacidade
                  </Link>
                  <button
                    type="button"
                    className="underline hover:text-white transition-colors"
                  >
                    Gerenciar Cookies
                  </button>
                </span>
              </p>
              <p className="text-slate-500 text-xs">
                Os conteúdos e informações neste site têm caráter meramente informativo e educacional.
                Não substituem consulta médica, diagnóstico ou tratamento.
              </p>
              <p className="text-slate-400 text-xs mt-2">
                © {currentYear} {clinicInfo.name}. Todos os direitos reservados.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 lg:items-end">
              <button
                onClick={scrollToTop}
                className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                aria-label="Voltar ao topo"
              >
                <ArrowUp size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;