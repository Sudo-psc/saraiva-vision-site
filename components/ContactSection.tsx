'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Globe,
  Bot,
  ExternalLink,
} from 'lucide-react';
import EnhancedContactForm from '@/components/forms/EnhancedContactForm';
import { clinicInfo, googleMapsProfileUrl } from '@/lib/clinicInfo';
import { CONTACT } from '@/lib/constants';

interface ContactSectionProps {
  showMap?: boolean;
  compactForm?: boolean;
  className?: string;
}

/**
 * ContactSection Component
 *
 * Full-featured contact section with:
 * - Enhanced contact form
 * - Clinic information cards
 * - Google Maps integration
 * - Quick action buttons (WhatsApp, Phone, Schedule)
 * - Chatbot link
 * - Accessibility features (WCAG AAA)
 * - Mobile-first responsive design
 */
export default function ContactSection({
  showMap = false,
  compactForm = false,
  className = '',
}: ContactSectionProps) {
  const contactDetails = [
    {
      icon: <MapPin className="h-6 w-6 text-blue-600" aria-hidden="true" />,
      title: 'Endereço',
      details: (
        <a
          href={googleMapsProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-700 hover:underline transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          aria-label="Ver localização no Google Maps (abre em nova aba)"
        >
          <span>
            {typeof clinicInfo.address === 'string'
              ? clinicInfo.address
              : typeof CONTACT.ADDRESS === 'string'
              ? CONTACT.ADDRESS
              : `${CONTACT.ADDRESS.street}, ${CONTACT.ADDRESS.city} - ${CONTACT.ADDRESS.state}`
            }
          </span>
        </a>
      ),
      subDetails: (
        <a
          href={googleMapsProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
        >
          <MapPin className="w-4 h-4" aria-hidden="true" />
          Ver no Google Maps
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      ),
    },
    {
      icon: <Phone className="h-6 w-6 text-blue-600" aria-hidden="true" />,
      title: 'Telefone',
      details: (
        <div className="flex flex-col gap-1">
          <a
            href={CONTACT.PHONE.HREF}
            className="hover:underline font-medium text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label="Ligar para a clínica"
          >
            {CONTACT.PHONE.DISPLAY}
          </a>
        </div>
      ),
      subDetails: (
        <div className="flex flex-col gap-2">
          <a
            href={CONTACT.PHONE.WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:underline flex items-center gap-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
          >
            <MessageCircle size={14} aria-hidden="true" />
            WhatsApp Atendimento
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
          <a
            href="https://wa.me/message/EHTAAAAYH7SHJ1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            <MessageCircle size={14} aria-hidden="true" />
            Auto Atendimento WhatsApp
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
          <a
            href="https://api.whatsapp.com/send/?phone=5533984207437&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:underline flex items-center gap-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
          >
            <MessageCircle size={14} aria-hidden="true" />
            Urgência - Enfermeira Ana
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      ),
    },
    {
      icon: <Mail className="h-6 w-6 text-blue-600" aria-hidden="true" />,
      title: 'E-mail',
      details: (
        <a
          href={`mailto:${CONTACT.EMAIL}`}
          className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          aria-label="Enviar e-mail para a clínica"
        >
          {CONTACT.EMAIL}
        </a>
      ),
      subDetails: 'Resposta em até 24h úteis',
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" aria-hidden="true" />,
      title: 'Horário de Atendimento',
      details: CONTACT.SCHEDULE.WEEKDAYS,
      subDetails: (
        <div className="flex flex-col gap-0.5 text-sm">
          <span>{CONTACT.SCHEDULE.SATURDAY}</span>
          <span className="text-red-600">{CONTACT.SCHEDULE.SUNDAY}</span>
        </div>
      ),
    },
  ];

  const chatbotLink =
    'https://chatgpt.com/g/g-quepJB90J-saraiva-vision-clinica-oftalmologica?model=gpt-4o';

  return (
    <section
      id="contact"
      className={`py-16 md:py-20 bg-gradient-to-br from-slate-50 to-blue-50 scroll-block-internal ${className}`}
      aria-labelledby="contact-heading"
      role="region"
    >
      {/* Skip link for keyboard navigation */}
      <a
        href="#contact-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:no-underline"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('name')?.focus();
        }}
      >
        Pular para o formulário de contato
      </a>

      <div className="container mx-auto px-[7%]">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            id="contact-heading"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4"
          >
            Entre em Contato
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Estamos prontos para atender você. Escolha a forma de contato mais conveniente.
          </motion.p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left column: Contact form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-200">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2" id="contact-form">
                Formulário de Contato
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Preencha o formulário abaixo e retornaremos em breve.
              </p>
              <EnhancedContactForm compact={compactForm} showFallbackContacts={true} />
            </div>
          </motion.div>

          {/* Right column: Contact information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-6"
            role="complementary"
            aria-labelledby="contact-options-heading"
          >
            <h3 id="contact-options-heading" className="sr-only">
              Opções de contato e agendamento
            </h3>

            {/* Online Scheduling CTA */}
            <a
              href={clinicInfo.onlineSchedulingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-6 group hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-describedby="online-scheduling-desc"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm" aria-hidden="true">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1 group-hover:text-blue-50 transition-colors">
                    Agendamento Online
                  </h4>
                  <p className="text-sm text-blue-50 mb-2" id="online-scheduling-desc">
                    Agende sua consulta de forma rápida e prática, 24 horas por dia.
                  </p>
                  <div className="text-sm font-semibold text-white flex items-center gap-1">
                    Agendar agora
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </a>

            {/* Chatbot CTA */}
            <a
              href={chatbotLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-6 group hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-describedby="chatbot-desc"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm" aria-hidden="true">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1 group-hover:text-green-50 transition-colors">
                    Assistente Virtual 24/7
                  </h4>
                  <p className="text-sm text-green-50 mb-2" id="chatbot-desc">
                    Tire suas dúvidas a qualquer hora com nosso chatbot inteligente.
                  </p>
                  <div className="text-sm font-semibold text-white flex items-center gap-1">
                    Conversar agora
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </a>

            {/* Contact information cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label="Informações de contato">
              {contactDetails.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-5 shadow-md border border-slate-200 hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                  role="listitem"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5" aria-hidden="true">
                      {info.icon}
                    </div>
                    <div className="min-w-0 flex-1 break-words leading-relaxed">
                      <h4 className="font-bold text-sm text-slate-900 mb-1">{info.title}</h4>
                      <div className="text-sm text-slate-700 mb-1">{info.details}</div>
                      <div className="text-slate-500 text-xs">{info.subDetails}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Optional Google Maps embed */}
            {showMap && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl p-4 shadow-md border border-slate-200 overflow-hidden"
              >
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  Nossa Localização
                </h4>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3756.123456789!2d-42.1388900!3d-19.7936110!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDQ3JzM3LjAiUyA0MsKwMDgnMjAuMCJX!5e0!3m2!1spt-BR!2sbr!4v1234567890123`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização da Saraiva Vision no Google Maps"
                    aria-label="Mapa mostrando a localização da clínica"
                  />
                </div>
                <a
                  href={googleMapsProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  Abrir no Google Maps
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
