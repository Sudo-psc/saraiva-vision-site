import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import pt from "@/locales/pt/translation.json";
import common from "@/locales/pt/common.json";

const lng = process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "pt";
const ns = ["translation", "common"];
const resources = {
    pt: {
        translation: pt,
        common,
    },
};

// Export initialization promise for external use
export const i18nPromise = i18n
    .use(initReactI18next)
    .init({
        lng,
        fallbackLng: "pt",
        resources,
        ns,
        defaultNS: "translation",
        interpolation: { escapeValue: false },
        returnEmptyString: false,
        saveMissing: true,
    })
    .catch((error) => {
        console.error('Failed to initialize i18n:', error);
        // Use minimal fallback configuration
        return i18n.init({
            lng: 'pt',
            fallbackLng: 'pt',
            resources: {
                pt: {
                    translation: {},
                    common: {}
                }
            },
            interpolation: { escapeValue: false },
            returnEmptyString: false,
        });
    });

export default i18n;
