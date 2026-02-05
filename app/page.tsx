export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/img/hero_dry_eye_relief_2.png')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-2xl">
            {/* Glass Morphism Content Box */}
            <div className="relative backdrop-blur-md bg-white/10 rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
              {/* Decorative Corner Accents */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-cyan-400 rounded-tl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-cyan-400 rounded-br-3xl"></div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-cyan-300 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                Especialistas em Saúde Ocular
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                  Saraiva
                </span>{" "}
                Vision
              </h1>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                Clínica Oftalmológica completa em Caratinga, MG.
                Tecnologia avançada e cuidado humanizado para a saúde dos seus olhos.
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-white/10">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">15+</div>
                  <div className="text-sm text-gray-300">Anos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">10k+</div>
                  <div className="text-sm text-gray-300">Pacientes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">98%</div>
                  <div className="text-sm text-gray-300">Satisfação</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Agendar Consulta
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 hover:border-white/50 transition-all duration-300 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Conheça a Clínica
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10"></div>
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
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