import React from 'react';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Zap, ArrowRight, Clock, ShieldCheck, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQLuzPulsadaPage = () => {
  const faqs = [
    {
      question: "O que é o E-Eye e a tecnologia IRPL®?",
      answer: "O E-Eye é o primeiro e único dispositivo médico do mundo especificamente projetado para o tratamento da Síndrome do Olho Seco ligada à Disfunção das Glândulas de Meibômio (DGM). Ele utiliza a tecnologia patenteada IRPL® (Intense Regulated Pulsed Light), que gera sequências de pulsos de luz policromática perfeitamente calibrados e sequenciados de forma homogênea. Desenvolvido na França, o sistema é aprovado pela Anvisa no Brasil."
    },
    {
      question: "Como o tratamento funciona?",
      answer: "Diferente dos tratamentos paliativos, o E-Eye atua na causa do problema através de um efeito neurológico. Os disparos de luz atingem as regiões infraorbital e zigomática, onde passa o nervo parassimpático. Isso libera neurotransmissores que estimulam as glândulas de Meibômio a retomarem sua função normal de secreção, entregando mais lipídios (óleos) à lágrima e evitando que ela evapore precocemente. Além disso, a luz gera um calor suave que ajuda a liquefazer o meibum obstruído, facilitando sua expulsão."
    },
    {
      question: "Qual a diferença entre IRPL® e a Luz Pulsada (IPL) comum?",
      answer: "A tecnologia IRPL® utiliza pulsos \"regulados\", onde a energia é uniforme do início ao fim do disparo, enquanto na IPL comum a energia decai durante o pulso. O E-Eye foi desenhado do zero para a oftalmologia e para estimular nervos específicos, enquanto a IPL tradicional nasceu na dermatologia. Estudos sugerem que a IRPL® pode ser 20-25% mais eficaz que a IPL comum logo na primeira sessão. Além disso, o E-Eye utiliza resfriamento a ar e é classificado como baixo/médio risco (Classe II), sendo mais seguro que equipamentos estéticos."
    },
    {
      question: "Para quem o tratamento é indicado?",
      answer: "O tratamento é indicado para pacientes com olho seco evaporativo causado por baixa produção de lipídios devido à DGM. É ideal para quem busca reduzir a dependência de colírios lubrificantes e para pacientes com sintomas como ardor, sensação de areia, olhos vermelhos e intolerância a lentes de contato. Pacientes com deficiência puramente aquosa (falta de água na lágrima) podem não se beneficiar tanto."
    },
    {
      question: "Como é realizada a sessão?",
      answer: "O paciente senta-se em uma cadeira reclinável, a pele é limpa e são colocados óculos de proteção de metal (eye masks). Aplica-se uma camada de hidrogel condutor na maçã do rosto e região temporal. São realizados 5 flashes em cada lado da face, partindo do canto interno em direção à têmpora. O procedimento é extremamente rápido, levando de 3 a 5 minutos para ambos os olhos."
    },
    {
      question: "O tratamento dói? É seguro?",
      answer: "O procedimento é descrito como indolor e inofensivo para os olhos. O paciente sente apenas um leve aquecimento ou uma sensação de \"picada\" momentânea na pele durante o disparo. Não há riscos conhecidos para a visão quando o protocolo é seguido corretamente."
    },
    {
      question: "Quantas sessões são necessárias e quando aparecem os resultados?",
      answer: "O protocolo padrão consiste em 3 sessões nos dias: 0, 15 e 45. Uma quarta sessão opcional pode ser feita no dia 75 em casos severos. A melhora subjetiva pode ser percebida em poucas horas. No entanto, o efeito é cumulativo: dura cerca de uma semana após a 1ª sessão, duas a três semanas após a 2ª, e se estabiliza por longo prazo após a 3ª."
    },
    {
      question: "Quanto tempo duram os benefícios?",
      answer: "Os resultados costumam durar de 6 meses a 3 anos. Para manter o conforto, recomenda-se uma sessão de manutenção anual."
    },
    {
      question: "Existem contraindicações?",
      answer: "As principais restrições incluem: gestantes, peles de fototipo VI (pele negra muito escura), uso de medicamentos que aumentem a fotossensibilidade, e lesões, tatuagens ou pintas escuras na área da aplicação (que devem ser cobertas)."
    },
    {
      question: "Quais são os possíveis efeitos colaterais?",
      answer: "São raros e geralmente transitórios, como leve vermelhidão, inchaço nas bochechas ou pequenas bolhas que desaparecem em menos de uma semana."
    }
  ];

  const breadcrumbItems = [
    { label: 'FAQ', href: '/faq' },
    { label: 'Luz Pulsada (IRPL)', href: '/faq/luz-pulsada' }
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  const seoData = {
    title: "FAQ Luz Pulsada (IRPL) E-Eye: 10 Perguntas e Respostas | Saraiva Vision",
    description: "Guia completo sobre tratamento de Olho Seco com E-Eye IRPL: como funciona, diferença para IPL, sessões, resultados e contraindicações. Aprovado pela Anvisa.",
    canonical: "https://saraivavision.com.br/faq/luz-pulsada",
    schema: JSON.stringify(schema)
  };

  const highlights = [
    { icon: ShieldCheck, label: 'Aprovado Anvisa', color: 'emerald' },
    { icon: Clock, label: '3-5 min/sessão', color: 'cyan' },
    { icon: Zap, label: '3 sessões', color: 'amber' },
    { icon: CheckCircle, label: '6m a 3 anos', color: 'sky' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead {...seoData} />
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-cyan-50 via-white to-sky-50 pt-32 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <Breadcrumbs items={breadcrumbItems} className="mb-8" />

            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-6">
                <Zap size={16} className="mr-2" />
                Tecnologia E-Eye Francesa
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">
                FAQ: <span className="text-cyan-600">Luz Pulsada IRPL®</span>
              </h1>
              <div className="text-lg text-slate-600 max-w-2xl leading-relaxed mb-8 space-y-3">
                <p>
                  Aqui está um guia completo e detalhado no formato de perguntas frequentes (FAQ) sobre o tratamento de olho seco com a tecnologia <strong>E-Eye IRPL®</strong>, elaborado com base nas fontes fornecidas.
                </p>
                <p>
                  Guia completo com 10 perguntas e respostas sobre o tratamento revolucionário para Olho Seco com a tecnologia E-Eye, aprovada pela Anvisa.
                </p>
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap gap-3">
                {highlights.map((item, index) => (
                  <div
                    key={index}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      item.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                      item.color === 'cyan' ? 'bg-cyan-100 text-cyan-700' :
                      item.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                      'bg-sky-100 text-sky-700'
                    }`}
                  >
                    <item.icon size={16} className="mr-2" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Analogy Section */}
        <section className="py-8 bg-gradient-to-r from-cyan-600 to-sky-600">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-300" />
                <span className="text-cyan-100 text-sm font-medium uppercase tracking-wide">Analogia</span>
              </div>
              <p className="text-white text-lg leading-relaxed">
                O tratamento E-Eye IRPL® funciona como <strong>"reiniciar" um sistema elétrico</strong> que estava travado.
                Imagine que as glândulas de Meibômio são lâmpadas que pararam de acender porque o interruptor (nervo parassimpático)
                está com mau contato. O E-Eye envia um sinal preciso para consertar o interruptor, fazendo com que as lâmpadas
                voltem a brilhar sozinhas por muito tempo, sem que você precise ficar trocando as baterias (pingando colírios) o dia inteiro.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ List */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
                10 Perguntas Frequentes sobre E-Eye IRPL®
              </h2>
              <div className="space-y-4">
                {faqs.map((item, index) => (
                  <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <details className="group">
                      <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                        <div className="flex items-start gap-4">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 text-sm font-bold shrink-0">
                            {index + 1}
                          </span>
                          <h3 className="font-semibold text-slate-900 text-lg pr-4">{item.question}</h3>
                        </div>
                        <span className="text-cyan-600 transition-transform group-open:rotate-180 shrink-0">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </span>
                      </summary>
                      <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-50 pt-4 ml-12">
                        {item.answer}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Warning Section */}
        <section className="py-8 bg-amber-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-amber-200">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Importante</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    O tratamento com E-Eye IRPL® deve ser realizado por oftalmologista habilitado após avaliação
                    completa do quadro clínico. Nem todos os tipos de olho seco são indicados para este tratamento.
                    Agende uma consulta para diagnóstico personalizado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-cyan-600 to-sky-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Interessado no tratamento E-Eye IRPL®?
            </h2>
            <p className="text-cyan-100 mb-8 max-w-xl mx-auto">
              Somos pioneiros no interior de Minas Gerais com essa tecnologia francesa.
              Agende sua avaliação e descubra se o tratamento é indicado para você.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/luz-pulsada-irpl"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-white text-cyan-700 font-semibold hover:bg-cyan-50 transition-colors shadow-lg"
              >
                Conheça a Tecnologia
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 rounded-xl border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors"
              >
                <Clock className="mr-2 w-4 h-4" />
                Clínica encerrada
              </Link>
            </div>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </div>
  );
};

export default FAQLuzPulsadaPage;
