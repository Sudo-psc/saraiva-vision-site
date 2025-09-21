import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Service {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
  category?: string;
}

interface ServicesCardProps {
  service: Service;
}

const ServicesCard: React.FC<ServicesCardProps> = ({ service }) => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={service.imageUrl || '/images/drphilipe_perfil.webp'}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/drphilipe_perfil.webp';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Badge */}
        {service.category && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {service.category}
          </div>
        )}

        {/* Arrow Icon */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowRight className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
          {service.title}
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {service.description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            asChild
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link to={`/servicos/${service.slug}`}>
              Saiba Mais
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Link to="/contato">
              <MessageCircle className="w-4 h-4 mr-2" />
              Fale Conosco
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ServicesCard;