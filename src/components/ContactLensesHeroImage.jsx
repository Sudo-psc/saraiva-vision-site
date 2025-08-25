import React from 'react';

const ContactLensesHeroImage = ({ className = "", alt = "Lentes de Contato" }) => {
    return (
        <div className={`relative ${className}`}>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl border border-slate-200 p-8 min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-6">
                        {/* Contact lens visual representation */}
                        <div className="relative mx-auto w-32 h-32 mb-4">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/60 to-indigo-300/40 rounded-full shadow-inner"></div>
                            <div className="absolute top-4 left-4 w-8 h-4 bg-white/50 rounded-full transform rotate-12"></div>
                            <div className="absolute inset-2 border-2 border-dashed border-slate-400/30 rounded-full"></div>
                        </div>

                        {/* Floating elements */}
                        <div className="relative">
                            <div className="absolute -top-4 -left-4 w-3 h-3 bg-blue-400 rounded-full opacity-60"></div>
                            <div className="absolute -top-2 -right-6 w-2 h-2 bg-indigo-400 rounded-full opacity-60"></div>
                            <div className="absolute -bottom-2 left-2 w-2.5 h-2.5 bg-purple-400 rounded-full opacity-60"></div>
                        </div>
                    </div>

                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                        Lentes de Contato Premium
                    </h3>
                    <p className="text-sm text-slate-500">
                        Conforto • Qualidade • Segurança
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ContactLensesHeroImage;
