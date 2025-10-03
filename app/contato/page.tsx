import type { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import ContactForm from '@/components/forms/ContactForm';
import { clinicInfo } from '@/lib/clinicInfo';

export const metadata: Metadata = {
  title: 'Contato - Saraiva Vision | Agende sua Consulta',
  description:
    'Entre em contato com a Saraiva Vision. Agende sua consulta oftalmológica em Caratinga-MG. Atendimento humanizado e tecnologia de ponta.',
  openGraph: {
    title: 'Contato - Saraiva Vision',
    description: 'Entre em contato e agende sua consulta oftalmológica',
    type: 'website',
  },
};

export default function ContactPage() {
  const clinicAddress = `${clinicInfo.streetAddress}, ${clinicInfo.neighborhood}`;
  const fullAddress = `${clinicAddress}, ${clinicInfo.city} - ${clinicInfo.state}, ${clinicInfo.postalCode}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('/images/pattern-dots.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Entre em Contato</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Estamos prontos para cuidar da sua visão. Agende sua consulta ou tire suas dúvidas.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Envie sua Mensagem</h2>
              <p className="text-slate-600">
                Preencha o formulário abaixo e nossa equipe entrará em contato em até 24h úteis.
              </p>
            </div>

            <ContactForm />
          </div>

          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Informações de Contato</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Telefone / WhatsApp</h3>
                    <a
                      href={`tel:${clinicInfo.phone}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {clinicInfo.phoneDisplay}
                    </a>
                    <p className="text-sm text-slate-600 mt-1">
                      Atendimento de segunda a sexta, 8h às 18h
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">E-mail</h3>
                    <a
                      href={`mailto:${clinicInfo.email}`}
                      className="text-blue-600 hover:text-blue-700 font-medium break-all"
                    >
                      {clinicInfo.email}
                    </a>
                    <p className="text-sm text-slate-600 mt-1">
                      Respondemos em até 24h úteis
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Endereço</h3>
                    <p className="text-slate-700">
                      {clinicAddress}
                      <br />
                      {clinicInfo.city} - {clinicInfo.state}
                      <br />
                      CEP: {clinicInfo.postalCode}
                    </p>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
                    >
                      Ver no mapa
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Horário de Atendimento</h3>
                    <div className="text-slate-700 space-y-1">
                      <p>Segunda a Sexta: 8h às 18h</p>
                      <p>Sábado: 8h às 12h</p>
                      <p className="text-sm text-slate-600 mt-2">
                        Atendimento mediante agendamento prévio
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-blue-900 mb-3">Responsável Técnico</h3>
              <p className="text-blue-800 font-medium">{clinicInfo.responsiblePhysician}</p>
              <p className="text-sm text-blue-700">{clinicInfo.responsiblePhysicianCRM}</p>
            </div>

            <div className="mt-8">
              <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-md">
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3748.5!2d${clinicInfo.longitude}!3d${clinicInfo.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDQ3JzIwLjUiUyA0MsKwMDgnMDUuMSJX!5e0!3m2!1spt-BR!2sbr!4v1234567890`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização da Saraiva Vision"
                  aria-label="Mapa mostrando a localização da clínica Saraiva Vision"
                />
              </div>
              <p className="text-sm text-slate-600 mt-2 text-center">
                Estacionamento disponível no local
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Preferência de Contato Direto?
            </h2>
            <p className="text-slate-600 mb-8">
              Você pode entrar em contato conosco através de nossos canais de atendimento rápido
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={clinicInfo.whatsapp24h}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <a
                href={`tel:${clinicInfo.phone}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
              >
                <Phone className="w-5 h-5" />
                Ligar Agora
              </a>
              <a
                href={clinicInfo.onlineSchedulingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Agendar Online
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
