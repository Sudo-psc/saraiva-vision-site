/**
 * Blog Post Premium: Lentes de Contato para Presbiopia
 * Design premium com efeitos de vidro líquido 3D e paleta moderna
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    Eye,
    Clock,
    User,
    Calendar,
    Phone,
    MapPin,
    CheckCircle,
    AlertTriangle,
    BookOpen,
    Star,
    ExternalLink,
    Sparkles,
    Heart,
    Shield,
    Zap,
    Award,
    Target,
    Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import '../../styles/premiumLiquidGlass.css';

const BlogPostPresbiopiaPremium = () => {
    const blogData = {
        title: "Lentes de Contato para Presbiopia: Soluções Modernas e Confortáveis em Caratinga, MG",
        author: "Dr. Philipe Saraiva Cruz",
        credentials: "CRM-MG 69.870",
        publishedAt: "25 de Dezembro, 2024",
        readingTime: "8 min",
        category: "Lentes de Contato",
        tags: ["presbiopia", "lentes de contato", "vista cansada", "oftalmologia", "Caratinga"]
    };

    const symptoms = [
        {
            icon: <Eye className="w-5 h-5" />,
            text: "Dificuldade para ler textos pequenos ou focar em objetos próximos",
            color: "from-blue-500 to-purple-600"
        },
        {
            icon: <Lightbulb className="w-5 h-5" />,
            text: "Necessidade de mais luz para tarefas como costura ou uso de telas",
            color: "from-yellow-500 to-orange-600"
        },
        {
            icon: <AlertTriangle className="w-5 h-5" />,
            text: "Fadiga ocular, dores de cabeça ou visão embaçada após atividades prolongadas",
            color: "from-red-500 to-pink-600"
        },
        {
            icon: <Target className="w-5 h-5" />,
            text: "Tendência a esticar os braços para 'alongar' a visão",
            color: "from-green-500 to-teal-600"
        }
    ];

    const lensTypes = [
        {
            type: "Lentes Multifocais",
            description: "Ideais para correção simultânea, com zonas de foco progressivo. Ótimas para quem usa telas o dia todo.",
            icon: <Zap className="w-8 h-8" />,
            gradient: "from-blue-500 to-cyan-500",
            features: ["Correção simultânea", "Zonas progressivas", "Ideal para telas"]
        },
        {
            type: "Lentes Bifocais",
            description: "Divididas em seções para perto e longe, semelhantes a óculos bifocais, mas mais confortáveis para atividades dinâmicas.",
            icon: <Shield className="w-8 h-8" />,
            gradient: "from-purple-500 to-pink-500",
            features: ["Seções divididas", "Conforto dinâmico", "Adaptação rápida"]
        },
        {
            type: "Lentes Monovisão",
            description: "Uma lente corrige a visão de longe e a outra de perto, permitindo que o cérebro se adapte.",
            icon: <Award className="w-8 h-8" />,
            gradient: "from-green-500 to-emerald-500",
            features: ["Adaptação cerebral", "Visão natural", "Flexibilidade"]
        }
    ];

    const advantages = [
        { text: "Maior campo de visão periférica", icon: <Eye className="w-4 h-4" /> },
        { text: "Ausência de embaçamento em dias chuvosos", icon: <Shield className="w-4 h-4" /> },
        { text: "Compatibilidade com esportes ou óculos de sol", icon: <Zap className="w-4 h-4" /> },
        { text: "Correção natural sem alterar a aparência", icon: <Heart className="w-4 h-4" /> },
        { text: "Melhoria na qualidade de vida", icon: <Star className="w-4 h-4" /> }
    ];

    const alertSigns = [
        "Visão embaçada persistente para perto, mesmo com correção",
        "Fadiga ocular constante ou dores de cabeça após leitura",
        "Dificuldade em tarefas cotidianas, como ler rótulos ou usar o celular",
        "Mudanças súbitas na visão, como flashes de luz ou manchas",
        "Queda brusca de acuidade visual em um ou ambos os olhos"
    ];

    return (
        <div className="min-h-screen" style={{ background: 'var(--premium-bg-warm)' }}>
            <article className="premium-container py-20">
                {/* Header Premium */}
                <motion.header
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                    className="premium-header mb-20"
                >
                    <div className="premium-badge mb-8">
                        <Sparkles className="w-5 h-5" />
                        {blogData.category}
                    </div>

                    <h1 className="premium-title mb-8">
                        {blogData.title}
                    </h1>

                    <p className="premium-subtitle mb-12">
                        Descubra as soluções mais modernas em lentes de contato para presbiopia,
                        com atendimento especializado e humanizado em Caratinga, MG
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
                        <div className="premium-badge premium-hover-glow">
                            <User className="w-5 h-5" />
                            <span>{blogData.author}</span>
                            <Badge variant="outline" className="text-xs bg-white/20 border-white/30">
                                {blogData.credentials}
                            </Badge>
                        </div>

                        <div className="premium-badge premium-hover-glow">
                            <Calendar className="w-5 h-5" />
                            <span>{blogData.publishedAt}</span>
                        </div>

                        <div className="premium-badge premium-hover-glow">
                            <Clock className="w-5 h-5" />
                            <span>{blogData.readingTime} de leitura</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {blogData.tags.map((tag, index) => (
                            <motion.span
                                key={index}
                                className="premium-badge text-sm premium-hover-lift"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * index, duration: 0.5 }}
                            >
                                #{tag}
                            </motion.span>
                        ))}
                    </div>
                </motion.header>

                {/* Introdução Premium */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="premium-section mb-20"
                >
                    <div className="premium-glass-card premium-hover-lift">
                        <div className="premium-card-content">
                            <div className="flex items-start gap-8">
                                <div
                                    className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-white"
                                    style={{ background: 'var(--premium-primary)' }}
                                >
                                    <Heart className="w-10 h-10" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--premium-text-primary)' }}>
                                        Bem-vindo ao Blog da Clínica Saraiva Vision
                                    </h2>
                                    <p className="text-xl leading-relaxed" style={{ color: 'var(--premium-text-secondary)' }}>
                                        Aqui, em Caratinga, MG, estamos comprometidos em oferecer um atendimento
                                        humanizado e de excelência para cuidar da sua visão. Liderada pelo
                                        <strong> Dr. Philipe Saraiva Cruz (CRM-MG 69.870)</strong> e uma equipe
                                        qualificada, nossa clínica utiliza tecnologia diagnóstica avançada para
                                        proporcionar soluções personalizadas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* O que é Presbiopia */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="premium-section mb-20"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--premium-text-primary)' }}>
                            <BookOpen className="inline w-10 h-10 mr-4" />
                            O Que é Presbiopia?
                        </h2>
                        <div className="w-24 h-1 mx-auto rounded-full" style={{ background: 'var(--premium-primary)' }}></div>
                    </div>

                    <div className="premium-glass-card premium-hover-lift mb-12">
                        <div className="premium-card-content">
                            <p className="text-xl leading-relaxed mb-8" style={{ color: 'var(--premium-text-secondary)' }}>
                                A <strong>presbiopia</strong>, também conhecida como "vista cansada", é uma
                                condição natural que ocorre com o envelhecimento, geralmente a partir dos 40 anos.
                                Ela acontece quando o cristalino do olho perde flexibilidade, dificultando o
                                foco em objetos próximos.
                            </p>
                        </div>
                    </div>

                    <div className="premium-glass-card premium-hover-lift">
                        <div className="premium-card-content">
                            <h3 className="text-2xl font-bold mb-8" style={{ color: 'var(--premium-text-primary)' }}>
                                Características da Presbiopia
                            </h3>
                            <div className="premium-grid premium-grid-2">
                                {[
                                    "Diferente de outros erros refrativos como miopia ou astigmatismo",
                                    "Afeta principalmente a visão de perto",
                                    "Pode coexistir com outras condições oculares",
                                    "Processo fisiológico inevitável"
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-center gap-4"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * index, duration: 0.5 }}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                                            style={{ background: 'var(--premium-accent)' }}
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <span className="text-lg" style={{ color: 'var(--premium-text-secondary)' }}>
                                            {item}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Sintomas Premium */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="premium-section mb-20"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--premium-text-primary)' }}>
                            <AlertTriangle className="inline w-10 h-10 mr-4" />
                            Sintomas e Causas da Presbiopia
                        </h2>
                        <div className="w-24 h-1 mx-auto rounded-full" style={{ background: 'var(--premium-secondary)' }}></div>
                    </div>

                    <div className="premium-grid premium-grid-2">
                        <div className="premium-glass-card premium-hover-lift">
                            <div className="premium-card-content">
                                <h3 className="text-2xl font-bold mb-8" style={{ color: 'var(--premium-text-primary)' }}>
                                    Sintomas Comuns
                                </h3>
                                <div className="space-y-6">
                                    {symptoms.map((symptom, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-start gap-4"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * index, duration: 0.5 }}
                                        >
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 bg-gradient-to-r ${symptom.color}`}
                                            >
                                                {symptom.icon}
                                            </div>
                                            <span className="text-lg leading-relaxed" style={{ color: 'var(--premium-text-secondary)' }}>
                                                {symptom.text}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="premium-glass-card premium-hover-lift">
                            <div className="premium-card-content">
                                <h3 className="text-2xl font-bold mb-8" style={{ color: 'var(--premium-text-primary)' }}>
                                    Principais Causas
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        "Envelhecimento natural do olho",
                                        "Exposição excessiva a telas digitais",
                                        "Predisposição genética",
                                        "Fatores como diabetes"
                                    ].map((cause, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-center gap-4"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * index, duration: 0.5 }}
                                        >
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0"
                                                style={{ background: 'var(--premium-cool)' }}
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </div>
                                            <span className="text-lg" style={{ color: 'var(--premium-text-secondary)' }}>
                                                {cause}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Tipos de Lentes Premium */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="premium-section mb-20"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--premium-text-primary)' }}>
                            Tipos de Lentes de Contato para Presbiopia
                        </h2>
                        <div className="w-24 h-1 mx-auto rounded-full" style={{ background: 'var(--premium-accent)' }}></div>
                    </div>

                    <div className="premium-grid premium-grid-3">
                        {lensTypes.map((lens, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 * index, duration: 0.8 }}
                            >
                                <div className="premium-glass-card premium-hover-lift h-full">
                                    <div className="premium-card-content text-center">
                                        <div
                                            className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-white bg-gradient-to-r ${lens.gradient}`}
                                        >
                                            {lens.icon}
                                        </div>
                                        <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--premium-text-primary)' }}>
                                            {lens.type}
                                        </h3>
                                        <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--premium-text-secondary)' }}>
                                            {lens.description}
                                        </p>
                                        <div className="space-y-2">
                                            {lens.features.map((feature, idx) => (
                                                <div key={idx} className="premium-badge text-sm">
                                                    <Star className="w-3 h-3" />
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Vantagens Premium */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="premium-section mb-20"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--premium-text-primary)' }}>
                            Vantagens das Lentes de Contato
                        </h2>
                        <div className="w-24 h-1 mx-auto rounded-full" style={{ background: 'var(--premium-warm)' }}></div>
                    </div>

                    <div className="premium-glass-card premium-hover-lift">
                        <div className="premium-card-content">
                            <div className="premium-grid premium-grid-2">
                                {advantages.map((advantage, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-center gap-4 p-4 rounded-2xl premium-hover-glow"
                                        style={{ background: 'var(--premium-glass)' }}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.1 * index, duration: 0.5 }}
                                    >
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
                                            style={{ background: 'var(--premium-warm)' }}
                                        >
                                            {advantage.icon}
                                        </div>
                                        <span className="text-lg font-medium" style={{ color: 'var(--premium-text-primary)' }}>
                                            {advantage.text}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Call to Action Premium */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="premium-section mb-20"
                >
                    <div className="premium-cta">
                        <div className="relative z-10">
                            <h2 className="premium-cta-title">
                                📞 Agende Sua Consulta Hoje Mesmo!
                            </h2>

                            <p className="premium-cta-text">
                                Pronto para dar o próximo passo? Agende sua consulta na Clínica Saraiva Vision
                            </p>

                            <div className="premium-grid premium-grid-3 mb-8">
                                <div className="flex items-center justify-center gap-3 premium-badge bg-white/20">
                                    <Phone className="w-5 h-5" />
                                    <span className="font-semibold">(33) 99860-1427</span>
                                </div>
                                <div className="flex items-center justify-center gap-3 premium-badge bg-white/20">
                                    <User className="w-5 h-5" />
                                    <span className="font-semibold">Dr. Philipe Saraiva Cruz</span>
                                </div>
                                <div className="flex items-center justify-center gap-3 premium-badge bg-white/20">
                                    <MapPin className="w-5 h-5" />
                                    <span className="font-semibold">Caratinga, MG</span>
                                </div>
                            </div>

                            <button className="premium-button text-lg px-8 py-4">
                                Agendar Consulta
                                <ExternalLink className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.section>

                {/* Footer Premium */}
                <motion.footer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="text-center"
                >
                    <div className="premium-glass-card">
                        <div className="premium-card-content">
                            <p className="text-lg" style={{ color: 'var(--premium-text-muted)' }}>
                                <em>
                                    Este artigo foi elaborado pelo Dr. Philipe Saraiva Cruz (CRM-MG 69.870) e equipe
                                    da Clínica Saraiva Vision, com base em evidências científicas e experiência clínica.
                                    Para informações personalizadas sobre seu caso, agende uma consulta.
                                </em>
                            </p>
                        </div>
                    </div>
                </motion.footer>
            </article>
        </div>
    );
};

export default BlogPostPresbiopiaPremium;