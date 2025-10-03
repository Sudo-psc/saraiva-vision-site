import type { Metadata } from 'next';
import { Heart, Award, Users, Shield } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import TeamGrid from '@/components/TeamGrid';
import { teamMembers } from '@/lib/team-data';

export const metadata: Metadata = {
  title: 'Nossa Equipe | Saraiva Vision - Oftalmologistas em Caratinga, MG',
  description:
    'Conheça a equipe de oftalmologistas e profissionais da Saraiva Vision. Médicos especialistas em catarata, glaucoma, retina e oftalmopediatria em Caratinga, MG.',
  keywords: [
    'oftalmologista caratinga',
    'médico oftalmologista',
    'equipe médica',
    'especialista em olhos',
    'cirurgião oftalmologista',
    'CRM oftalmologia'
  ],
  openGraph: {
    title: 'Nossa Equipe | Saraiva Vision',
    description: 'Equipe de oftalmologistas especializados em Caratinga, MG',
    type: 'website'
  }
};

export default function EquipePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-[#1E4D4C]/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1000ms' }} />
        </div>

        <div className="container mx-auto px-6 lg:px-[7%] relative z-10">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Nossa Equipe', current: true }
            ]}
          />

          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-[#1E4D4C] to-[#2a6866] text-white mb-6 shadow-lg">
              <Users className="w-5 h-5" />
              <span className="font-bold text-sm tracking-wide uppercase">Conheça Nossa Equipe</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-slate-900 mb-6">
              Profissionais{' '}
              <span className="bg-gradient-to-r from-[#1E4D4C] to-[#2a6866] bg-clip-text text-transparent">
                Dedicados
              </span>
              {' '}à Sua Visão
            </h1>

            <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
              Nossa equipe é composta por oftalmologistas experientes, optometristas e técnicos especializados,
              todos comprometidos em oferecer o melhor atendimento para você e sua família.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E4D4C] to-[#2a6866] flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Experiência Comprovada</h3>
              <p className="text-sm text-slate-600">
                Mais de 15 anos cuidando da visão de famílias em Caratinga e região
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E4D4C] to-[#2a6866] flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Atendimento Humanizado</h3>
              <p className="text-sm text-slate-600">
                Cuidado personalizado e acolhedor para todas as idades
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E4D4C] to-[#2a6866] flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Regulamentação CFM</h3>
              <p className="text-sm text-slate-600">
                Todos os nossos médicos são registrados no Conselho Federal de Medicina
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E4D4C] to-[#2a6866] flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Equipe Multidisciplinar</h3>
              <p className="text-sm text-slate-600">
                Profissionais especializados em diversas áreas da oftalmologia
              </p>
            </div>
          </div>

          <TeamGrid 
            members={teamMembers}
            showFilters={true}
            showSearch={true}
            columns={3}
          />

          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-[#1E4D4C] to-[#2a6866] rounded-3xl p-8 md:p-12 text-white shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Agende sua Consulta com Nossos Especialistas
              </h2>
              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Nossa equipe está pronta para cuidar da saúde dos seus olhos com excelência e dedicação
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/agendamento"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1E4D4C] rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-lg"
                >
                  Agendar Consulta
                </a>
                <a
                  href="/contato"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
                >
                  Entrar em Contato
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
