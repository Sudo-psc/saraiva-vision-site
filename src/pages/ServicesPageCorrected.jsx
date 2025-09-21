import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import ServicesCard from '@/components/ServicesCard';
import { mockServicesData, getServicesData } from '@/lib/services-api';

const ServicesPageCorrected = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Simulate API call
    const fetchServices = async () => {
      try {
        setLoading(true);
        console.log('Fetching services from VPS API at 31.97.129.78:3001...');
        const data = await getServicesData();
        console.log('Services data received from VPS:', data);
        setServices(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching services from VPS:', err);
        setError(`Erro ao carregar serviços: ${err.message}`);
        // Fallback to mock data
        console.log('Using fallback mock data');
        setServices(mockServicesData);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const seo = {
    title: 'Serviços Oftalmológicos | Saraiva Vision',
    description: 'Conheça nossos serviços especializados em oftalmologia: consultas, exames diagnósticos, cirurgias e cuidados pediátricos.',
    keywords: 'oftalmologia, serviços, consultas, exames, cirurgias, oftalmologia pediátrica',
  };

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(services.map(s => s.category).filter(Boolean)))];

  // Filter services by category
  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(service => service.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <SEOHead {...seo} />
        <Navbar />
        <main className="flex-1 pt-28 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando serviços...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && services.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <SEOHead {...seo} />
        <Navbar />
        <main className="flex-1 pt-28 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
      <SEOHead {...seo} />
      <Navbar />
      <main className="flex-1 pt-28">
        {/* Header Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                Nossos Serviços
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Cuidados Oftalmológicos <span className="text-blue-600">Completos</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Oferecemos uma ampla gama de serviços oftalmológicos com tecnologia de ponta
                e atendimento personalizado para cuidar da sua saúde visual.
              </p>
            </motion.div>

            {/* Category Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3 mb-12"
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                  }`}
                >
                  {category === 'all' ? 'Todos os Serviços' : category}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="pb-20 px-4">
          <div className="container mx-auto max-w-7xl">
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                <p className="text-yellow-800">
                  ⚠️ Usando dados locais devido a erro na API: {error}
                </p>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ServicesCard service={service} />
                </motion.div>
              ))}
            </motion.div>

            {filteredServices.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">
                  Nenhum serviço encontrado nesta categoria.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto max-w-4xl text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Pronto para cuidar da sua visão?
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Agende sua consulta hoje mesmo e tenha acesso aos melhores cuidados oftalmológicos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contato"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                >
                  📞 Agendar Consulta
                </a>
                <a
                  href="/sobre"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
                >
                  💬 Fale Conosco
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPageCorrected;