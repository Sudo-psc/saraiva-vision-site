import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * PaymentBasicPage - Página de redirecionamento para pagamento básico
 * Redireciona automaticamente para a URL de pagamento externa da Asaas
 *
 * @author Dr. Philipe Saraiva Cruz
 */
function PaymentBasicPage() {
  useEffect(() => {
    // Obter URL de pagamento da variável de ambiente
    const paymentUrl = import.meta.env.VITE_PAYMENT_URL;

    // Validar URL e redirecionar se válida
    if (paymentUrl && paymentUrl.trim() !== '') {
      window.location.href = paymentUrl;
    } else {
      // Fallback para URL padrão em caso de erro
      window.location.href = 'https://www.asaas.com/c/8vd304ubogq93c66';
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Redirecionando para Pagamento | Saraiva Vision</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="mb-4">
            <svg
              className="animate-spin h-12 w-12 text-blue-600 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Redirecionando para Pagamento
          </h1>
          <p className="text-gray-600">
            Você será redirecionado automaticamente para a página de pagamento seguro...
          </p>
        </div>
      </div>
    </>
  );
}

export default PaymentBasicPage;
