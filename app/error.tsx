'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.error('Application error:', error);
      
      if (process.env.NODE_ENV === 'production') {
        console.error('Error digest:', error.digest);
      }
    }
  }, [error]);

  const handleReset = () => {
    try {
      reset();
    } catch (err) {
      console.error('Reset failed:', err);
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-white to-bg-secondary flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-glass-lg p-8 md:p-12 border border-border-light">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-error-light rounded-full mb-6 animate-pulse">
              <AlertTriangle className="w-10 h-10 text-error-DEFAULT" strokeWidth={2} />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Ops! Algo deu errado
            </h1>
            
            <p className="text-lg text-text-secondary max-w-md mx-auto leading-relaxed mb-2">
              Desculpe pelo inconveniente. Encontramos um problema inesperado.
            </p>
            
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mt-6 p-4 bg-error-light border border-error-DEFAULT/20 rounded-lg text-left">
                <p className="text-sm font-mono text-error-dark break-all">
                  {error.message}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-soft hover:shadow-glass"
            >
              <RefreshCw className="w-5 h-5" />
              Tentar Novamente
            </button>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-primary-50 text-primary-700 font-medium px-6 py-3 rounded-lg border border-primary-200 transition-all duration-200 shadow-soft hover:shadow-glass"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </Link>
          </div>

          <div className="pt-8 border-t border-border-light">
            <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">
              O que você pode fazer?
            </h3>
            
            <ul className="space-y-3 text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 font-semibold text-sm">1</span>
                </span>
                <span>Clique em "Tentar Novamente" para recarregar a página</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 font-semibold text-sm">2</span>
                </span>
                <span>Volte à página inicial e navegue novamente</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 font-semibold text-sm">3</span>
                </span>
                <span>Se o problema persistir, entre em contato conosco</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-8 border-t border-border-light text-center">
            <p className="text-sm text-text-muted mb-4">
              Precisa de ajuda urgente?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="tel:+553332291000"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                <span className="text-base">(33) 3229-1000</span>
              </a>
              <span className="hidden sm:block text-border-medium">|</span>
              <Link
                href="/contato"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                <Mail className="w-4 h-4" />
                Formulário de Contato
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-text-muted">
          <p>
            Saraiva Vision - Clínica Oftalmológica | Caratinga, MG
          </p>
          <p className="mt-1 text-xs">
            Atendimento especializado com tecnologia de ponta
          </p>
        </div>
      </div>
    </div>
  );
}
