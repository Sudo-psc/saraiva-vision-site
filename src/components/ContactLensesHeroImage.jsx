import React from 'react';
import { motion } from 'framer-motion';

const ContactLensesHeroImage = ({ className = "", alt = "Lentes de Contato Premium" }) => {
    return (
        <motion.div
            className={`relative ${className}`}
            style={{ perspective: "1000px" }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
        >
            <motion.div
                whileHover={{ scale: 1.05, rotateX: 10, rotateY: -10 }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
                className="relative bg-gradient-to-br from-white via-gray-50/90 to-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 p-8 min-h-[350px] flex items-center justify-center text-center"
            >
                {/* Animated background blobs */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-300/30 to-transparent rounded-full blur-2xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-indigo-300/30 to-transparent rounded-full blur-2xl animate-pulse delay-500" />

                <div className="relative z-10" style={{ transformStyle: "preserve-3d" }}>
                    <motion.div
                        className="relative mx-auto w-48 h-48 mb-6"
                        style={{ transform: "translateZ(20px)" }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-blue-200/70 to-indigo-300/50 rounded-full shadow-inner"
                            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute top-4 left-4 w-8 h-4 bg-white/60 rounded-full transform rotate-12"
                            style={{ transform: "translateZ(30px)" }}
                        />
                        <motion.div
                            className="absolute inset-4 flex items-center justify-center"
                            style={{ transform: "translateZ(50px)" }}
                        >
                            <img
                                src="/img/icon_lentes.png"
                                alt="Ícone de lentes de contato"
                                className="w-32 h-32 object-contain shadow-lg"
                                style={{
                                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                                    maxWidth: '128px',
                                    maxHeight: '128px'
                                }}
                                onError={(e) => {
                                    console.error('Erro ao carregar ícone de lentes:', e);
                                    // Fallback para um ícone CSS se a imagem falhar
                                    e.target.style.display = 'none';
                                    const fallback = document.createElement('div');
                                    fallback.className = 'w-32 h-32 bg-blue-400 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg';
                                    fallback.innerHTML = '👁️';
                                    e.target.parentNode.appendChild(fallback);
                                }}
                            />
                        </motion.div>
                    </motion.div>

                    {/* Floating elements with parallax */}
                    <motion.div className="absolute inset-0" style={{ transform: "translateZ(10px)" }}>
                        <motion.div
                            className="absolute top-0 left-10 w-3 h-3 bg-blue-400 rounded-full opacity-70"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute top-10 right-0 w-2 h-2 bg-indigo-400 rounded-full opacity-70"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        />
                        <motion.div
                            className="absolute bottom-10 left-0 w-2.5 h-2.5 bg-purple-400 rounded-full opacity-70"
                            animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        />
                    </motion.div>

                    <motion.h3
                        className="text-2xl font-bold text-slate-800 mb-2"
                        style={{ transform: "translateZ(30px)" }}
                    >
                        {alt}
                    </motion.h3>
                    <motion.p
                        className="text-md text-slate-600"
                        style={{ transform: "translateZ(20px)" }}
                    >
                        Conforto • Qualidade • Segurança
                    </motion.p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ContactLensesHeroImage;
