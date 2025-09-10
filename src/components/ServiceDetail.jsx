
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, CheckCircle, Clock, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getServiceIcon } from '@/components/icons/ServiceIcons';

const ServiceDetail = ({ service, onScheduleClick, onBackClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header Section */}
      <section className="relative py-20 text-white bg-blue-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${service.image})`, opacity: 0.2 }}
        ></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-center mb-6">
                <div className="icon-container-large bg-white p-4 rounded-full shadow-lg">
                  {getServiceIcon(service.id, { className: "h-16 w-16 text-blue-600" })}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{service.title}</h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">{service.description}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content Column */}
              <div className="lg:col-span-2 space-y-10">
                {/* Full Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                >
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">Sobre o Serviço</h2>
                  <p className="text-slate-700 leading-relaxed text-lg">{service.fullDescription}</p>
                </motion.div>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                >
                  <h2 className="text-3xl font-bold text-slate-900 mb-8">Principais Benefícios</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {service.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-slate-700 text-lg">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* What's Included */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                >
                  <h2 className="text-3xl font-bold text-slate-900 mb-8">O que está incluído</h2>
                  <div className="space-y-4">
                    {service.included.map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-700 text-lg">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Quick Info & Preparation */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Informações Essenciais</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <Clock className="w-6 h-6 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-800 text-lg">Duração</div>
                        <div className="text-md text-slate-600">{service.duration}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <MapPin className="w-6 h-6 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-800 text-lg">Local</div>
                        <div className="text-md text-slate-600">Clínica Saraiva Vision<br />Caratinga/MG</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Preparação</h3>
                    <p className="text-slate-700 text-md">{service.preparation}</p>
                  </div>
                </motion.div>

                {/* Contact Info */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-blue-600 rounded-2xl p-8 text-white text-center shadow-xl"
                >
                  <h3 className="text-2xl font-bold mb-4">Pronto para Agendar?</h3>
                  <p className="mb-6">Nossa equipe está pronta para te atender com excelência.</p>
                  <Button
                    onClick={onScheduleClick}
                    size="lg"
                    className="w-full bg-white text-blue-600 font-bold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Agendar Agora
                  </Button>
                  <div className="mt-6 text-center">
                    <a
                      href="tel:+5533998601427"
                      className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span>+55 33 99860-1427</span>
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back Button */}
      <div className="container mx-auto px-4 md:px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={onBackClick}
            variant="outline"
            className="flex items-center gap-2 text-slate-700 hover:bg-slate-100 border-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Serviços
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
