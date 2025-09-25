/**
 * Blog Post: Lentes de Contato para Presbiopia
 * Componente para exibir o artigo sobre presbiopia com design moderno
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
    Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import '../../styles/premiumLiquidGlass.css';

const BlogPostPresbiopia = () => {
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
        "Dificuldade para ler textos pequenos ou focar em objetos próximos",
        "Necessidade de mais luz para tarefas como costura ou uso de telas",
        "Fadiga ocular, dores de cabeça ou visão embaçada após atividades prolongadas",
        "Tendência a esticar os braços para 'alongar' a visão"
    ];

    const lensTypes = [
        {
            type: "Lentes Multifocais",
            description: "Ideais para correção simultânea, com zonas de foco progressivo. Ótimas para quem usa telas o dia todo.",
            icon: "🔄"
        },
        {
            type: "Lentes Bifocais",
            description: "Divididas em seções para perto e longe, semelhantes a óculos bifocais, mas mais confortáveis para atividades dinâmicas.",
            icon: "👁️"
        },
        {
            type: "Lentes Monovisão",
            description: "Uma lente corrige a visão de longe e a outra de perto, permitindo que o cérebro se adapte.",
            icon: "⚖️"
        }
    ];

    const advantages = [
        "Maior campo de visão periférica",
        "Ausência de embaçamento em dias chuvosos",
        "Compatibilidade com esportes ou óculos de sol",
        "Correção natural sem alterar a aparência",
        "Melhoria na qualidade de vida"
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
            <article className="premium-container py-16">
                {/* Header do Artigo */}
                <motion.header
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className="premium-header mb-16"
                >
                    <div className="premium-badge mb-8">
                        <Sparkles className="w-4 h-4" />
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
                        <div className="premium-badge">
                            <User className="w-4 h-4" />
                            <span>{blogData.author}</span>
                            <Badge variant="outline" className="text-xs bg-white/20 border-white/30">
                                {blogData.credentials}
                            </Badge>
                        </div>

                        <div className="premium-badge">
                            <Calendar className="w-4 h-4" />
                            <span>{blogData.publishedAt}</span>
                        </div>

                        <div className="premium-badge">
                            <Clock className="w-4 h-4" />
                            <span>{blogData.readingTime} de leitura</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                        {blogData.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            </motion.header>

            {/* Introdução */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-12"
            >
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <Eye className="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" />
                            <div>
                                <h2 className="text-xl font-semibold text-blue-900 mb-3">
                                    Bem-vindo ao Blog da Clínica Saraiva Vision
                                </h2>
                                <p className="text-blue-800 leading-relaxed">
                                    Aqui, em Caratinga, MG, estamos comprometidos em oferecer um atendimento
                                    humanizado e de excelência para cuidar da sua visão. Liderada pelo
                                    <strong> Dr. Philipe Saraiva Cruz (CRM-MG 69.870)</strong> e uma equipe
                                    qualificada, nossa clínica utiliza tecnologia diagnóstica avançada para
                                    proporcionar soluções personalizadas.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.section>

            {/* O que é Presbiopia */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-12"
            >
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    O Que é Presbiopia?
                </h2>

                <div className="prose prose-lg max-w-none mb-8">
                    <p className="text-slate-700 leading-relaxed mb-4">
                        A <strong>presbiopia</strong>, também conhecida como "vista cansada", é uma
                        condição natural que ocorre com o envelhecimento, geralmente a partir dos 40 anos.
                        Ela acontece quando o cristalino do olho perde flexibilidade, dificultando o
                        foco em objetos próximos.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Características da Presbiopia</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>Diferente de outros erros refrativos como miopia ou astigmatismo</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>Afeta principalmente a visão de perto</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>Pode coexistir com outras condições oculares</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>Processo fisiológico inevitável</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </motion.section>

            {/* Sintomas */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-12"
            >
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                    Sintomas e Causas da Presbiopia
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg text-orange-700">Sintomas Comuns</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {symptoms.map((symptom, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                                        <span className="text-sm">{symptom}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg text-blue-700">Principais Causas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                                    <span>Envelhecimento natural do olho</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                                    <span>Exposição excessiva a telas digitais</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                                    <span>Predisposição genética</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                                    <span>Fatores como diabetes</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </motion.section>

            {/* Tipos de Lentes */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-12"
            >
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Tipos de Lentes de Contato para Presbiopia
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {lensTypes.map((lens, index) => (
                        <Card key={index} className="h-full">
                            <CardHeader className="text-center">
                                <div className="text-3xl mb-2">{lens.icon}</div>
                                <CardTitle className="text-lg">{lens.type}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 text-center">
                                    {lens.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </motion.section>

            {/* Vantagens */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-12"
            >
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Vantagens das Lentes de Contato
                </h2>

                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {advantages.map((advantage, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <Star className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <span className="text-green-800">{advantage}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.section>

            {/* Sinais de Alerta */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-12"
            >
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    Quando Procurar um Especialista
                </h2>

                <Card className="bg-red-50 border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-800">⚠️ Sinais de Alerta</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {alertSigns.map((sign, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                                    <span className="text-red-800 text-sm">{sign}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </motion.section>

            {/* Call to Action */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-12"
            >
                <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">
                            📞 Agende Sua Consulta Hoje Mesmo!
                        </h2>

                        <p className="text-blue-100 mb-6 text-lg">
                            Pronto para dar o próximo passo? Agende sua consulta na Clínica Saraiva Vision
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="flex items-center justify-center gap-2">
                                <Phone className="w-5 h-5" />
                                <span>(33) 99860-1427</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <User className="w-5 h-5" />
                                <span>Dr. Philipe Saraiva Cruz</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <MapPin className="w-5 h-5" />
                                <span>Caratinga, MG</span>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3"
                        >
                            Agendar Consulta
                            <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </motion.section>

            {/* Conclusão */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-12"
            >
                <Card className="bg-slate-50">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Conclusão</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Em resumo, a <strong>presbiopia</strong> é uma condição comum do envelhecimento
                            que pode ser efetivamente gerenciada com <strong>lentes de contato multifocais</strong>,
                            proporcionando visão clara e conforto no dia a dia. O cuidado contínuo com os olhos
                            é fundamental para uma vida plena, especialmente em rotinas ativas como as de Caratinga, MG.
                        </p>
                    </CardContent>
                </Card>
            </motion.section>

            {/* Footer do Artigo */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="border-t pt-8 text-center text-sm text-slate-600"
            >
                <p>
                    <em>
                        Este artigo foi elaborado pelo Dr. Philipe Saraiva Cruz (CRM-MG 69.870) e equipe
                        da Clínica Saraiva Vision, com base em evidências científicas e experiência clínica.
                        Para informações personalizadas sobre seu caso, agende uma consulta.
                    </em>
                </p>
            </motion.footer>
        </article>
    );
};

export default BlogPostPresbiopia;