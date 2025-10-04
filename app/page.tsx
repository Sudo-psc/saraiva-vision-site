export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Saraiva Vision
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Clínica Oftalmológica Completa em Caratinga, MG
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Agendar Consulta
            </button>
            <button className="px-8 py-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              Conheça a Clínica
            </button>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Nossos Serviços
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Cirurgia de Catarata</h3>
              <p className="text-gray-600">Cirurgia avançada com tecnologia de ponta para recuperação visual completa.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Tratamento de Glaucoma</h3>
              <p className="text-gray-600">Diagnóstico precoce e tratamento moderno para prevenção da perda visual.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Cirurgias de Retina</h3>
              <p className="text-gray-600">Tratamentos cirúrgicos para doenças da retina com resultados excelentes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Sobre a Saraiva Vision
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Com mais de 15 anos de experiência, a Saraiva Vision é referência em oftalmologia
              no Vale do Aço. Nossa missão é proporcionar saúde ocular com tecnologia avançada
              e atendimento humanizado.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
                <div className="text-gray-600">Anos de Experiência</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">10.000+</div>
                <div className="text-gray-600">Pacientes Atendidos</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
                <div className="text-gray-600">Satisfação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Agende Sua Consulta Hoje
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Cuide da sua visão com quem entende do assunto
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+33332211555"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              (33) 3322-1555
            </a>
            <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
              WhatsApp
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}