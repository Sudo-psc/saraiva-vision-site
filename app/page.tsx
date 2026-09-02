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

              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-amber-300/40 bg-amber-50/95 px-6 py-4 text-slate-900">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Clínica encerrada</p>
                  <p className="text-lg font-semibold">Clínica encerrada / em reforma — sem agenda</p>
                  <p className="mt-2 text-sm text-slate-700">Não há consultas presenciais, online ou por WhatsApp neste momento.</p>
                  <a
                    href="https://drphilipesaraiva.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-slate-800 underline underline-offset-2"
                  >
                    Livros e textos do Dr. Philipe Saraiva
                  </a>
                </div>
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

      <section className="py-20 bg-slate-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Clínica encerrada / em reforma
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Sem agenda no momento. Não há consultas por telefone ou WhatsApp.
          </p>
          <a
            href="https://drphilipesaraiva.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-white text-slate-800 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
          >
            Livros e textos do Dr. Philipe Saraiva
          </a>
        </div>
      </section>
    </div>
  )
}