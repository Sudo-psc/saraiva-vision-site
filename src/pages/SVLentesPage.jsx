import React, { useCallback } from 'react';
import { CalendarCheck, Package, Smile, RefreshCw, CheckCircle2 } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import EnhancedFooter from '@/components/EnhancedFooter';

const steps = [
  {
    icon: CalendarCheck,
    title: 'Agende uma consulta',
    description: 'Consulta inicial com o oftalmologista para definir a melhor lente para seu estilo de vida.'
  },
  {
    icon: Package,
    title: 'Receba suas lentes',
    description: 'Entrega programada diretamente na sua casa com frete gratuito para Caratinga e região.'
  },
  {
    icon: Smile,
    title: 'Use confortavelmente',
    description: 'Orientação personalizada de uso, higiene e adaptação com acompanhamento contínuo.'
  },
  {
    icon: RefreshCw,
    title: 'Renove com facilidade',
    description: 'Reposição automática e lembretes para que você nunca fique sem suas lentes.'
  }
];

const plans = [
  {
    name: 'Básico',
    price: 'R$ 149/mês',
    description: 'Plano ideal para quem está começando com lentes de contato.',
    benefits: [
      'Consultas de adaptação inclusas',
      'Envio mensal de lentes gelatinosas',
      'Suporte por WhatsApp em horário comercial'
    ],
    highlighted: false
  },
  {
    name: 'Premium',
    price: 'R$ 199/mês',
    description: 'Acompanhamento completo com maior conforto e praticidade.',
    benefits: [
      'Consultas semestrais com topografia corneana',
      'Lentes de contato premium com alta hidratação',
      'Reposição automática e lembrete personalizado'
    ],
    highlighted: true
  },
  {
    name: 'Elite',
    price: 'R$ 249/mês',
    description: 'Experiência exclusiva para quem precisa de cuidados avançados.',
    benefits: [
      'Consultas trimestrais e exames complementares',
      'Lentes especiais (tóricas, multifocais ou rígidas)',
      'Canal de suporte prioritário e benefícios extras'
    ],
    highlighted: false
  }
];

const faqs = [
  {
    question: 'Quais são os tipos de lentes disponíveis?',
    answer: 'Trabalhamos com lentes gelatinosas, tóricas, multifocais e rígidas, sempre escolhidas após avaliação individual com o oftalmologista.'
  },
  {
    question: 'A consulta está inclusa no plano?',
    answer: 'Sim. Todos os planos incluem consulta inicial de adaptação e retornos periódicos conforme a necessidade de cada paciente.'
  },
  {
    question: 'Como funciona a entrega das lentes?',
    answer: 'As lentes são enviadas mensalmente para sua casa com frete gratuito em Caratinga e cidades próximas, seguindo a frequência do seu plano.'
  },
  {
    question: 'Posso alterar ou cancelar o plano?',
    answer: 'Você pode alterar ou cancelar o plano a qualquer momento com aviso prévio de 30 dias para ajuste da logística de entrega.'
  }
];

const SVLentesPage = () => {
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name');
    const phone = formData.get('phone');
    const email = formData.get('email');
    const details = [`Nome: ${name || 'não informado'}`, `Telefone: ${phone || 'não informado'}`, `E-mail: ${email || 'não informado'}`]
      .join('%0A');
    const message = `Olá, gostaria de saber mais sobre os planos SV Lentes.%0A${details}`;
    const url = `https://wa.me/553398434177?text=${message}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    event.currentTarget.reset();
  }, []);

  return (
    <div className="bg-white text-slate-900">
      <SEOHead
        title="SV Lentes - Assinatura de lentes de contato em Caratinga"
        description="Economize até R$ 3.600 por ano com planos de lentes de contato da Saraiva Vision. Consultas inclusas, frete grátis e acompanhamento médico em Caratinga, MG."
        keywords="lentes de contato, assinatura de lentes, oftalmologista Caratinga, Saraiva Vision, lentes premium"
        canonicalPath="/svlentes"
      />
      <main className="pt-24 lg:pt-28">
        <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(320px,360px)] lg:px-8">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-1 text-sm font-medium text-sky-700 shadow-sm">
                <span className="inline-flex h-2 w-2 rounded-full bg-sky-500" />
                Lentes com acompanhamento médico em Caratinga
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Nunca mais fique sem lentes.
              </h1>
              <p className="max-w-xl text-lg text-slate-600">
                A SV Lentes é o serviço de assinatura da Saraiva Vision para quem busca conforto, segurança e economia. Consultas inclusas, frete grátis e reposição automática para você enxergar bem todos os dias.
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="text-xl">4,9</span>
                    <span className="text-lg">★★★★★</span>
                  </div>
                  <div className="text-sm text-slate-500">
                    Tenho uma visão clara e suave,<br />economia com o plano anual.
                    <p className="mt-1 font-medium text-slate-700">Jose Ricardo • cliente</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-500" />
                    Consultas inclusas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-500" />
                    Frete grátis para Caratinga
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-500" />
                    Economia média de R$ 3.600/ano
                  </li>
                </ul>
              </div>
            </div>
            <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-xl shadow-sky-100/60">
              <div className="flex flex-col gap-6">
                <div className="mx-auto w-28 overflow-hidden rounded-full border-4 border-white shadow-lg shadow-sky-100">
                  <picture>
                    <source
                      srcSet="/images/avatar-female-blonde-640w.avif 640w, /images/avatar-female-blonde-960w.avif 960w"
                      type="image/avif"
                    />
                    <source
                      srcSet="/images/avatar-female-blonde-640w.webp 640w, /images/avatar-female-blonde-960w.webp 960w"
                      type="image/webp"
                    />
                    <img
                      src="/images/avatar-female-blonde-640w.webp"
                      alt="Paciente sorrindo com lentes de contato"
                      className="h-full w-full object-cover"
                      loading="lazy"
                      width="112"
                      height="112"
                    />
                  </picture>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Assine agora</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">Agende sua consulta gratuita</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                      Nome
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Como podemos te chamar?"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                      E-mail
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="seuemail@exemplo.com"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
                      Telefone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="(33) 99999-9999"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-sky-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  >
                    Agendar consulta grátis
                  </button>
                </form>
                <p className="text-center text-xs text-slate-500">
                  Ao enviar seus dados você autoriza o contato da nossa equipe para confirmar a consulta.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Como funciona</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Simplificamos sua experiência com lentes</h2>
              <p className="mt-3 text-base text-slate-600">Do primeiro exame ao acompanhamento contínuo, nossa equipe cuida de cada etapa para você aproveitar visão nítida com conforto.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {steps.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
            <div className="text-center text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Planos SV Lentes</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Escolha o plano perfeito para sua visão</h2>
              <p className="mt-4 text-base text-slate-300">Planos flexíveis com consultas inclusas, monitoramento constante e economia de até R$ 3.600 ao ano.</p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {plans.map(({ name, price, description, benefits, highlighted }) => (
                <div
                  key={name}
                  className={`flex h-full flex-col gap-6 rounded-3xl border bg-white p-8 shadow-2xl transition ${
                    highlighted
                      ? 'border-sky-400 shadow-sky-500/30 lg:-mt-6 lg:pb-10'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">{name}</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">{price}</p>
                    <p className="mt-2 text-sm text-slate-600">{description}</p>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-600">
                    {benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-500" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.open('https://wa.me/553398434177?text=Quero%20assinar%20o%20plano%20SV%20Lentes', '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-200 ${
                        highlighted
                          ? 'bg-sky-600 text-white shadow-lg shadow-sky-400/40 hover:bg-sky-700'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      Falar com especialista
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Perguntas frequentes</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">Tudo o que você precisa saber</h2>
              <p className="mt-4 text-base text-slate-600">Reunimos as dúvidas mais comuns sobre o programa de assinatura SV Lentes para facilitar sua decisão.</p>
            </div>
            <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
              {faqs.map(({ question, answer }) => (
                <details key={question} className="group">
                  <summary className="cursor-pointer list-none px-6 py-5 text-left text-lg font-semibold text-slate-900 transition group-open:bg-slate-50">
                    {question}
                  </summary>
                  <div className="px-6 pb-6 text-sm text-slate-600">
                    {answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <EnhancedFooter />
    </div>
  );
};

export default SVLentesPage;
