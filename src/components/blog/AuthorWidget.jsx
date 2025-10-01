import React from 'react';
import { motion } from 'framer-motion';
import { User, Award, Calendar } from 'lucide-react';

const AuthorWidget = ({ author = 'Dr. Saraiva', date, category }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="sticky top-[900px] bg-gradient-to-br from-white/90 via-primary-50/30 to-slate-50/50 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-full flex items-center justify-center shadow-md">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">{author}</h4>
          <p className="text-xs text-slate-500">Oftalmologista</p>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed mb-4">
        Especialista em saúde ocular com anos de experiência em tratamentos oftalmológicos avançados.
      </p>

      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <div className="p-1.5 bg-primary-50 rounded">
            <Calendar className="w-3.5 h-3.5 text-primary-600" />
          </div>
          <span>
            {date ? new Date(date).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) : 'Data não disponível'}
          </span>
        </div>

        {category && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="p-1.5 bg-primary-50 rounded">
              <Award className="w-3.5 h-3.5 text-primary-600" />
            </div>
            <span>{category}</span>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-200">
        <a
          href="/sobre"
          className="block text-center text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors py-2 px-4 bg-primary-50 hover:bg-primary-100 rounded-lg"
        >
          Conheça o Dr. Saraiva
        </a>
      </div>
    </motion.div>
  );
};

export default AuthorWidget;
