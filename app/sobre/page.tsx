import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre - Saraiva Vision',
  description: 'Conheça a história e a missão da Clínica Saraiva Vision, especializada em oftalmologia.',
};

export const dynamic = 'force-static';

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">
          Sobre a Saraiva Vision
        </h1>

        <div className="max-w-4xl mx-auto space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">
              Nossa História
            </h2>
            <p className="text-gray-600 leading-relaxed">
              A Clínica Saraiva Vision foi fundada com o compromisso de oferecer
              cuidados oftalmológicos de excelência, combinando tecnologia de
              ponta com atendimento humanizado. Nossa missão é preservar e
              melhorar a saúde visual de nossos pacientes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">
              Nossa Missão
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Proporcionar cuidados oftalmológicos de alta qualidade, utilizando
              tecnologia avançada e uma abordagem personalizada para cada paciente,
              sempre com foco na prevenção, diagnóstico preciso e tratamento eficaz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">
              Nossos Valores
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li>• <strong>Excelência:</strong> Busca constante pela qualidade nos serviços</li>
              <li>• <strong>Humanização:</strong> Atendimento acolhedor e personalizado</li>
              <li>• <strong>Tecnologia:</strong> Equipamentos modernos e técnicas avançadas</li>
              <li>• <strong>Ética:</strong> Transparência e responsabilidade em todos os procedimentos</li>
              <li>• <strong>Cuidado:</strong> Dedicação integral ao bem-estar do paciente</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">
              Equipe Médica
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Nossa equipe é formada por oftalmologistas especializados,
              com formação nas melhores instituições e experiência em
              diversas subespecialidades da oftalmologia.
            </p>
          </section>

          <div className="text-center mt-12">
            <a
              href="/contato"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Entre em Contato
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}