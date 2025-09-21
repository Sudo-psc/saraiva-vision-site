import { useTranslation } from 'react-i18next';

// Safe wrapper for useTranslation that handles context errors
export const useSafeTranslation = () => {
    try {
        const translation = useTranslation();
        return translation;
    } catch (error) {
        console.warn('Translation context not available, using fallback:', error);
        // Return a fallback translation object
        return {
            t: (key, defaultValue) => {
                if (typeof defaultValue === 'string') return defaultValue;
                if (typeof key === 'string') return key;
                return 'Translation not available';
            },
            i18n: {
                language: 'pt',
                changeLanguage: () => Promise.resolve(),
            }
        };
    }
};

export default useSafeTranslation;