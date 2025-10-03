import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Search, Phone, ArrowLeft, Eye } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Página Não Encontrada',
  description: 'A página que você procura não existe ou foi movida.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  const quickLinks = [
    { href: '/', label: 'Página Inicial', icon: Home },
    { href: '/contato', label: 'Contato', icon: Phone },
    { href: '/blog', label: 'Blog', icon: Search },
  ];

  const popularServices = [
    { name: 'Consulta Oftalmológica', href: '/#servicos' },
    { name: 'Exames Especializados', href: '/#servicos' },
    { name: 'Cirurgias', href: '/#servicos' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-white to-bg-secondary flex items-center justify-center px-4 py-16">
      <div className="max-w-3xl w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass-lg p-8 md:p-12 border border-border-light">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-50 rounded-full mb-6">
              <Eye className="w-10 h-10 text-primary-600" strokeWidth={1.5} />
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-primary-700 mb-4">404</h1>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-4">
              Página Não Encontrada
            </h2>
            
            <p className="text-lg text-text-secondary max-w-md mx-auto leading-relaxed">
              Desculpe, a página que você procura não existe ou foi movida. 
              Vamos ajudá-lo a encontrar o que precisa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-soft hover:shadow-glass"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar ao Início
            </Link>
            
            <Link
              href="/contato"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-primary-50 text-primary-700 font-medium px-6 py-3 rounded-lg border border-primary-200 transition-all duration-200 shadow-soft hover:shadow-glass"
            >
              <Phone className="w-5 h-5" />
              Fale Conosco
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-border-light">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-primary-600" />
                Navegação Rápida
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 text-text-secondary hover:text-primary-600 transition-colors group"
                    >
                      <link.icon className="w-4 h-4 text-primary-500 group-hover:text-primary-600" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary-600" />
                Serviços Populares
              </h3>
              <ul className="space-y-3">
                {popularServices.map((service) => (
                  <li key={service.name}>
                    <Link
                      href={service.href}
                      className="flex items-center gap-3 text-text-secondary hover:text-primary-600 transition-colors group"
                    >
                      <span className="w-1.5 h-1.5 bg-primary-400 rounded-full group-hover:bg-primary-600" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {service.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border-light text-center">
            <p className="text-sm text-text-muted">
              Precisa de ajuda? Entre em contato conosco pelo telefone{' '}
              <a href="tel:+553332291000" className="text-primary-600 hover:text-primary-700 font-medium">
                (33) 3229-1000
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-text-muted">
          <p>
            Saraiva Vision - Clínica Oftalmológica | Caratinga, MG
          </p>
        </div>
      </div>
    </div>
  );
}
