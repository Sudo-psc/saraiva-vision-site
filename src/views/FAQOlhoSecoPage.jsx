import React from 'react';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import Breadcrumbs from '@/components/Breadcrumbs';
import { ArrowRight, Droplets, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQOlhoSecoPage = () => {
  const faqs = [
    {
      question: "O que é olho seco?",
      answer: "Olho seco é uma alteração da película de lágrimas que recobre a superfície ocular. Pode causar ardência, sensação de areia, visão embaçada e cansaço visual. As causas são múltiplas e incluem envelhecimento, uso de telas, ambientes secos, lentes de contato, alguns colírios e doenças sistêmicas."
    },
    {
      question: "Quais são os tratamentos para olho seco?",
      answer: "O tratamento é individualizado e varia conforme o tipo e a gravidade do olho seco. Em casos mais leves, são usados colírios lubrificantes, fórmulas que ajudam a reter a umidade e produtos que melhoram a qualidade da lágrima. Quando apenas o colírio não é suficiente, podem ser indicados procedimentos para reduzir a drenagem da lágrima e manter a superfície ocular protegida."
    },
    {
      question: "Existe procedimento para “segurar” mais lágrima no olho?",
      answer: "Sim. Em alguns casos, pode ser indicada a oclusão dos pontos lacrimais com pequenos plugs, diminuindo o escoamento da lágrima e aumentando o tempo de permanência na superfície ocular. A indicação é feita caso a caso, geralmente em quadros moderados a graves."
    },
    {
      question: "Uso computador o dia inteiro. O que posso fazer para ajudar meus olhos?",
      answer: "Algumas medidas simples ajudam bastante: piscar com mais frequência, fazer pausas regulares para descanso visual, manter a tela um pouco abaixo da linha dos olhos, evitar ar-condicionado ou ventilador direto no rosto e usar umidificador em ambientes muito secos. Se os sintomas persistirem, procure avaliação com oftalmologista."
    },
    {
      question: "Tenho olho seco. Posso usar lente de contato? Qual é melhor?",
      answer: "O uso de lentes em quem tem olho seco deve ser avaliado por oftalmologista. Material, formato e adaptação influenciam muito no conforto. Existem lentes com maior retenção de umidade, mas a indicação depende de exame e acompanhamento."
    },
    {
      question: "Lente de contato aumenta o risco de olho seco?",
      answer: "O uso de lentes pode estar relacionado a sintomas de ressecamento ocular. Quando a qualidade ou quantidade da lágrima não é adequada, a superfície ocular fica mais vulnerável, aumentando desconforto e, em alguns casos, o risco de infecções."
    },
    {
      question: "Olho seco tem cura?",
      answer: "Na maioria dos casos, é uma condição crônica e multifatorial, que exige controle contínuo em vez de “cura definitiva”. Com diagnóstico adequado e tratamento bem conduzido, é possível reduzir sintomas e melhorar a qualidade de vida."
    },
    {
      question: "O que pode acontecer se eu não tratar o olho seco?",
      answer: "Os sintomas podem se intensificar, com mais ardência, vermelhidão, sensação de corpo estranho e visão flutuante. Em casos avançados, podem surgir lesões na superfície ocular, aumentando o risco de infecções, especialmente em usuários de lentes de contato."
    },
    {
      question: "Envelhecer aumenta o risco de olho seco?",
      answer: "Com o passar da idade, a produção de lágrimas tende a diminuir, o que aumenta o risco de olho seco. Ainda assim, envelhecer não significa obrigatoriamente ter a condição, mas o risco cresce com o tempo."
    },
    {
      question: "Posso usar colírio comprado na farmácia por conta própria?",
      answer: "O uso contínuo de colírios sem orientação pode não aliviar e, em alguns casos, piorar o quadro. Alguns componentes podem irritar a superfície ocular em quem já tem pouca lágrima, e o excesso de instilações pode reduzir a proteção natural do olho."
    },
    {
      question: "Se um teste indicar risco alto, isso significa que eu tenho olho seco?",
      answer: "Questionários e testes de triagem sinalizam maior chance de olho seco, mas não substituem o exame completo. Outros problemas oculares podem causar sintomas parecidos, então o diagnóstico definitivo depende de avaliação em consultório."
    },
    {
      question: "Existe tratamento para melhorar a qualidade da lágrima?",
      answer: "Sim. Em muitos casos, além de lubrificantes, usamos estratégias para melhorar a qualidade do filme lacrimal e a função das glândulas de Meibômio. A escolha depende do tipo de olho seco e da avaliação clínica."
    }
  ];

  const breadcrumbItems = [
    { label: 'FAQ', href: '/faq' },
    { label: 'Olho Seco', href: '/faq/olho-seco' }
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
    title: "FAQ Olho Seco: Respostas para suas Dúvidas | Saraiva Vision",
    description: "Tire suas dúvidas sobre Síndrome do Olho Seco: sintomas, causas (DGM), diagnóstico com meibografia e tratamentos modernos em Caratinga.",
    canonical: "https://saraivavision.com.br/faq/olho-seco",
    schema: JSON.stringify(schema)
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead {...seoData} />
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-cyan-50 to-sky-50 pt-32 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <Breadcrumbs items={breadcrumbItems} className="mb-8" />

            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium mb-6">
                <Droplets size={16} className="mr-2" />
                Dúvidas Frequentes
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">
                Tudo sobre <span className="text-cyan-600">Olho Seco</span>
              </h1>
              <div className="text-lg text-slate-600 max-w-2xl leading-relaxed space-y-4">
                <p>
                  Reunimos respostas claras e atualizadas para dúvidas comuns sobre olho seco, com linguagem acessível e rigor técnico.
                </p>
                <p>As informações abaixo ajudam a entender sintomas, riscos e caminhos de cuidado, sempre com indicação individualizada.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ List */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((item, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <details className="group">
                    <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                      <h3 className="font-semibold text-slate-900 text-lg pr-4">{item.question}</h3>
                      <span className="text-cyan-600 transition-transform group-open:rotate-180">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                      {item.answer}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Cuidados simples no dia a dia</h3>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• Pisque com mais frequência ao usar telas.</li>
                  <li>• Faça pausas regulares ao longo do dia.</li>
                  <li>• Mantenha a tela ligeiramente abaixo da linha dos olhos.</li>
                  <li>• Evite ar direto no rosto e ambientes muito secos.</li>
                  <li>• Use umidificador quando necessário.</li>
                </ul>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Quando procurar avaliação?</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Se ardência, sensação de areia, vermelhidão, visão oscilante ou cansaço visual persistirem,
                  é importante avaliação com oftalmologista. O diagnóstico depende de exame clínico e pode
                  incluir testes específicos da superfície ocular.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Quer saber mais?</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/olho-seco"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition-colors shadow-lg hover:shadow-cyan-200/50"
              >
                Página Completa sobre Olho Seco
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link 
                to="/olho-seco/teste-rapido"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-white border border-cyan-200 text-cyan-700 font-semibold hover:bg-cyan-50 transition-colors"
              >
                <Activity className="mr-2 w-4 h-4" />
                Fazer Teste Online
              </Link>
            </div>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </div>
  );
};

export default FAQOlhoSecoPage;
