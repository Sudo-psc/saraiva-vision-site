import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Serviços - Saraiva Vision',
  description: 'Conheça os serviços oftalmológicos oferecidos pela Clínica Saraiva Vision.',
};

export const dynamic = 'force-static';

export default function ServicosPage() {
  const servicos = [
    {
      titulo: 'Consulta Oftalmológica',
      descricao: 'Exame completo da visão e saúde ocular',
      icone: '👁️'
    },
    {
      titulo: 'Cirurgia de Catarata',
      descricao: 'Procedimento moderno para tratamento da catarata',
      icone: '🔬'
    },
    {
      titulo: 'Tratamento de Glaucoma',
      descricao: 'Diagnóstico e tratamento especializado',
      icone: '💊'
    },
    {
      titulo: 'Cirurgia Refrativa',
      descricao: 'Correção de miopia, hipermetropia e astigmatismo',
      icone: '✨'
    },
    {
      titulo: 'Oftalmologia Pediátrica',
      descricao: 'Cuidados especializados para crianças',
      icone: '👶'
    },
    {
      titulo: 'Retina e Vítreo',
      descricao: 'Tratamento de doenças da retina',
      icone: '🎯'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">
          Nossos Serviços
        </h1>

        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Oferecemos uma ampla gama de serviços oftalmológicos com tecnologia
          de ponta e atendimento personalizado para cuidar da sua visão.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {servicos.map((servico, index) => (
            <div
              key={index}
              className="bg-blue-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4 text-center">{servico.icone}</div>
              <h3 className="text-xl font-semibold text-blue-800 mb-3 text-center">
                {servico.titulo}
              </h3>
              <p className="text-gray-600 text-center">
                {servico.descricao}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            Exames Disponíveis
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              'Acuidade Visual',
              'Tonometria',
              'Fundoscopia',
              'Biomicroscopia',
              'Campimetria',
              'Retinografia',
              'OCT',
              'Paquimetria'
            ].map((exame, index) => (
              <div key={index} className="bg-blue-100 p-3 rounded text-blue-700 font-medium">
                {exame}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <a
            href="https://saraivavision.com.br/agendamento"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg"
          >
            Agendar Consulta
          </a>
        </div>
      </div>
    </div>
  );
}