/**
 * Lazy i18n initialization for improved LCP
 * Loads translations after initial render
 *
 * @author Dr. Philipe Saraiva Cruz
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Minimal inline translations for critical above-the-fold content
const criticalTranslations = {
    pt: {
        translation: {
            // Hero section
            "hero.title": "Clínica Especializada em Olho Seco",
            "hero.subtitle": "Tratamento com IRPL E-Eye aprovado pela ANVISA",
            "hero.cta": "Clínica encerrada",
            "hero.whatsapp": "Sem agenda",
            // Navigation
            "nav.home": "Início",
            "nav.services": "Serviços",
            "nav.about": "Sobre",
            "nav.contact": "Contato",
            "nav.blog": "Blog",
            "nav.schedule": "Clínica encerrada",
            "navbar.home": "Início",
            "navbar.services": "Serviços",
            "navbar.dry_eye": "Olho Seco",
            "navbar.irpl": "Luz Pulsada",
            "navbar.lenses": "Lentes",
            "navbar.lens_wiki": "Wiki de Lentes",
            "navbar.blog": "Blog",
            "navbar.podcast": "Podcast",
            "navbar.reviews": "Avaliações",
            "navbar.about": "Sobre Nós",
            "navbar.plans": "Planos",
            "navbar.faq": "FAQ",
            "navbar.contact": "Contato",
            "navbar.schedule": "Clínica encerrada",
            "navbar.home_link_label": "Ir para a página inicial",
            // Services section (above-the-fold critical)
            "services.title": "Nossos Serviços",
            "services.subtitle": "Do diagnóstico ao tratamento avançado — com destaque para o olho seco e a tecnologia IRPL — para você enxergar com conforto.",
            "services.badge": "Nossos Serviços",
            "services.learn_more": "Saiba Mais",
            "services.view_all": "Ver todos os serviços",
            "services.items.irplEEye.title": "IRPL com E-Eye (Olho Seco)",
            "services.items.irplEEye.description": "Luz pulsada regulada específica para DGM e estabilização da camada lipídica da lágrima.",
            "services.items.dryEye.title": "Tratamento de Olho Seco",
            "services.items.dryEye.description": "Diagnóstico completo e plano de tratamento personalizado para síndrome do olho seco.",
            "services.items.consultations.title": "Consultas Oftalmológicas Completas",
            "services.items.consultations.description": "Exame oftalmológico abrangente com tecnologia de ponta e plano de acompanhamento personalizado.",
            "services.items.refraction.title": "Exames de Refração e Adaptação de Lentes",
            "services.items.refraction.description": "Determinação precisa do grau para óculos e adaptação especializada de lentes de contato.",
            "services.items.specialized.title": "Tratamentos Especializados",
            "services.items.specialized.description": "Tratamentos avançados para glaucoma, catarata, degeneração macular e outras condições oculares.",
            "services.items.surgeries.title": "Cirurgias Oftalmológicas",
            "services.items.surgeries.description": "Cirurgias oftalmológicas de alta precisão, incluindo catarata, correção de grau e pterígio.",
            "services.items.pediatric.title": "Oftalmologia Pediátrica",
            "services.items.pediatric.description": "Cuidado especializado da saúde ocular infantil desde o nascimento até a adolescência.",
            "services.items.reports.title": "Laudos Especializados",
            "services.items.reports.description": "Emissão de laudos técnicos detalhados para CNH, concursos públicos e pareceres médicos.",
            "services.items.gonioscopy.title": "Gonioscopia",
            "services.items.gonioscopy.description": "Exame que avalia o ângulo da câmara anterior do olho, essencial no diagnóstico do glaucoma.",
            "services.items.retinaMapping.title": "Mapeamento de Retina",
            "services.items.retinaMapping.description": "Avaliação ampla da retina periférica e central para detectar lesões e degenerações.",
            "services.items.cornealTopography.title": "Topografia Corneana",
            "services.items.cornealTopography.description": "Mapeamento computadorizado da curvatura corneana para diagnóstico de ceratocone.",
            "services.items.pachymetry.title": "Paquimetria",
            "services.items.pachymetry.description": "Medição precisa da espessura corneana central.",
            "services.items.retinography.title": "Retinografia",
            "services.items.retinography.description": "Fotografia digital de alta resolução da retina para documentação.",
            "services.items.visualField.title": "Campo Visual Computadorizado",
            "services.items.visualField.description": "Exame que avalia a sensibilidade visual periférica e central.",
            // Common
            "common.loading": "Carregando...",
            "common.error": "Erro",
            "common.retry": "Tentar novamente"
        },
        common: {}
    }
};

let initialized = false;
let fullTranslationsLoaded = false;

/**
 * Initialize i18n with minimal critical translations
 * Full translations are loaded asynchronously
 */
export const initCriticalI18n = () => {
    if (initialized) return Promise.resolve(i18n);

    initialized = true;

    return i18n
        .use(initReactI18next)
        .init({
            lng: "pt",
            fallbackLng: "pt",
            resources: criticalTranslations,
            ns: ["translation", "common"],
            defaultNS: "translation",
            interpolation: { escapeValue: false },
            returnEmptyString: false,
            react: {
                useSuspense: false // Don't block render
            }
        });
};

/**
 * Load full translations after initial render
 * Call this in useEffect or requestIdleCallback
 */
export const loadFullTranslations = async () => {
    if (fullTranslationsLoaded) return;

    try {
        const [pt, common] = await Promise.all([
            import("@/locales/pt/translation.json"),
            import("@/locales/pt/common.json")
        ]);

        // Add full translations to existing i18n instance
        i18n.addResourceBundle("pt", "translation", pt.default, true, true);
        i18n.addResourceBundle("pt", "common", common.default, true, true);

        fullTranslationsLoaded = true;
    } catch (error) {
        console.warn("Failed to load full translations:", error);
    }
};

export default i18n;
