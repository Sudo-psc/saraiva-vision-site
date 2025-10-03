'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.error('Critical application error:', error);
      
      if (process.env.NODE_ENV === 'production') {
        console.error('Error digest:', error.digest);
      }
    }
  }, [error]);

  const handleReset = () => {
    try {
      reset();
    } catch (err) {
      console.error('Reset failed, forcing reload:', err);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-16">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6 animate-pulse">
                  <AlertTriangle className="w-10 h-10 text-red-500" strokeWidth={2} />
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Erro Crítico
                </h1>
                
                <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed mb-4">
                  Desculpe, encontramos um problema grave na aplicação.
                </p>
                
                {process.env.NODE_ENV === 'development' && error.message && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                    <p className="text-sm font-mono text-red-800 break-all">
                      {error.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <RefreshCw className="w-5 h-5" />
                  Tentar Novamente
                </button>
                
                <button
                  onClick={handleReload}
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-medium px-6 py-3 rounded-lg border border-slate-200 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Recarregar Página
                </button>
              </div>

              <div className="pt-8 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">
                  Informações de Suporte
                </h3>
                
                <div className="space-y-3 text-slate-600 text-sm">
                  <p className="text-center">
                    Se o problema persistir, entre em contato:
                  </p>
                  <div className="text-center space-y-2">
                    <p>
                      <strong className="text-slate-900">Telefone:</strong>{' '}
                      <a href="tel:+553332291000" className="text-blue-600 hover:text-blue-700">
                        (33) 3229-1000
                      </a>
                    </p>
                    <p className="text-xs text-slate-500">
                      {error.digest && `Código do erro: ${error.digest}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200 text-center">
                <p className="text-sm text-slate-500">
                  Saraiva Vision - Clínica Oftalmológica | Caratinga, MG
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
