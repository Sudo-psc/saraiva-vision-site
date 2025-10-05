'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Agendamento error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-primary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-glass p-8 text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-primary-700">
            Erro ao Carregar
          </h2>
          <p className="text-text-secondary">
            Ocorreu um erro ao carregar o sistema de agendamento.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Tentar Novamente
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full border border-border-light hover:bg-bg-secondary py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Voltar para Home
          </button>
        </div>

        <div className="pt-4 border-t border-border-light">
          <p className="text-sm text-text-muted">
            Se o problema persistir, entre em contato:{' '}
            <a 
              href="/contato" 
              className="text-primary-600 hover:text-primary-700 underline"
            >
              Fale Conosco
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
