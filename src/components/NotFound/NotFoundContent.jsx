import React from 'react';
import { motion } from 'framer-motion';
import { Search, AlertCircle } from 'lucide-react';

const NotFoundContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-6"
    >
      {/* 404 Icon */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative mx-auto w-32 h-32 md:w-40 md:h-40"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-green-400 rounded-full opacity-20 blur-xl"></div>
        <div className="relative bg-white rounded-full shadow-lg p-6 md:p-8 border-2 border-blue-100">
          <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            404
          </div>
        </div>
      </motion.div>

      {/* Main Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Ops! Página não encontrada
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Parece que a página que você está procurando não existe ou foi movida.
          Mas não se preocupe, estamos aqui para ajudar você a encontrar o que precisa!
        </p>
      </motion.div>

      {/* Additional Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-blue-50 rounded-lg p-4 max-w-lg mx-auto border border-blue-100"
      >
        <div className="flex items-center justify-center gap-2 text-blue-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">
            Apenas esta página está indisponível. Todo o resto do site está funcionando normalmente!
          </span>
        </div>
      </motion.div>

      {/* Illustrative Icons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex justify-center gap-4 text-gray-400"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Search className="w-6 h-6" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, -5, 0, 5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <AlertCircle className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default NotFoundContent;