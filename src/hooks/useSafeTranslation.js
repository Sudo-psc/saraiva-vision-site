import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { I18nextContext } from 'react-i18next';

// Safe wrapper for useTranslation that handles context errors
export const useSafeTranslation = () => {
    try {
        // First check if the context is available
        const context = useContext(I18nextContext);
        if (!context) {
            throw new Error('I18nextContext not available');
        }

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
            },
            ready: false
        };
    }
};

export default useSafeTranslation;