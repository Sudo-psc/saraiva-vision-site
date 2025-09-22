import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contato - Saraiva Vision',
  description: 'Entre em contato com a Clínica Saraiva Vision para agendar sua consulta oftalmológica.',
};

export const dynamic = 'force-static';

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">
          Entre em Contato
        </h1>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">
              Informações de Contato
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-blue-700">Telefone</h3>
                <p className="text-gray-600">(85) 3264-5555</p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-700">WhatsApp</h3>
                <p className="text-gray-600">(85) 99999-9999</p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-700">Email</h3>
                <p className="text-gray-600">contato@saraivavision.com.br</p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-700">Endereço</h3>
                <p className="text-gray-600">
                  Rua Example, 123<br />
                  Bairro Centro<br />
                  Fortaleza - CE, 60000-000
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">
              Horário de Funcionamento
            </h2>

            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium">Segunda a Sexta:</span> 8h às 18h</p>
              <p><span className="font-medium">Sábado:</span> 8h às 12h</p>
              <p><span className="font-medium">Domingo:</span> Fechado</p>
            </div>

            <div className="mt-8">
              <a
                href="https://saraivavision.com.br/agendamento"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Agendar Consulta
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}