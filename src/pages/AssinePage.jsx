import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * AssinePage - Página de redirecionamento para formulário Jotform
 * Redireciona automaticamente para: https://form.jotform.com/252817233384055
 */
const AssinePage = () => {
  useEffect(() => {
    // Redireciona imediatamente para o formulário Jotform
    window.location.href = 'https://form.jotform.com/252817233384055';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-slate-100 flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-cyan-600 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Redirecionando...
        </h1>
        <p className="text-gray-600">
          Você será redirecionado para o formulário de assinatura.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Se não for redirecionado automaticamente,{' '}
          <a
            href="https://form.jotform.com/252817233384055"
            className="text-cyan-600 hover:text-cyan-700 font-semibold underline"
          >
            clique aqui
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default AssinePage;
