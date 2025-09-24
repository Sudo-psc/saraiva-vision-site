import { ENV } from '@/config/env';

interface RecaptchaLoaderOptions {
    size?: 'compact' | 'normal';
    theme?: 'light' | 'dark';
    language?: string;
}

class RecaptchaLoader {
    private static instance: RecaptchaLoader;
    private loadPromise: Promise<void> | null = null;
    private isLoaded = false;

    static getInstance(): RecaptchaLoader {
        if (!RecaptchaLoader.instance) {
            RecaptchaLoader.instance = new RecaptchaLoader();
        }
        return RecaptchaLoader.instance;
    }

    async load(options: RecaptchaLoaderOptions = {}): Promise<void> {
        // Se já está carregado, retornar imediatamente
        if (this.isLoaded && (window as any).grecaptcha) {
            return Promise.resolve();
        }

        // Se já está carregando, retornar a promise existente
        if (this.loadPromise) {
            return this.loadPromise;
        }

        // Verificar se a site key está disponível
        if (!ENV.RECAPTCHA_SITE_KEY) {
            throw new Error('reCAPTCHA site key não configurada (VITE_RECAPTCHA_SITE_KEY)');
        }

        this.loadPromise = this.loadScript(options);
        return this.loadPromise;
    }

    private loadScript(options: RecaptchaLoaderOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            const scriptId = 'recaptcha-api';

            // Verificar se o script já existe
            if (document.getElementById(scriptId)) {
                if ((window as any).grecaptcha) {
                    this.isLoaded = true;
                    resolve();
                } else {
                    reject(new Error('reCAPTCHA script carregado mas API não disponível'));
                }
                return;
            }

            const script = document.createElement('script');
            script.id = scriptId;
            script.async = true;
            script.defer = true;

            // Construir URL com parâmetros
            const params = new URLSearchParams({
                onload: 'onRecaptchaLoad',
                render: 'explicit',
            });

            if (options.language) {
                params.set('hl', options.language);
            }

            script.src = `https://www.google.com/recaptcha/api.js?${params.toString()}`;

            // Callback global para o reCAPTCHA
            (window as any).onRecaptchaLoad = () => {
                this.isLoaded = true;
                delete (window as any).onRecaptchaLoad;
                resolve();
            };

            script.onerror = () => {
                document.head.removeChild(script);
                delete (window as any).onRecaptchaLoad;
                reject(new Error('Falha ao carregar reCAPTCHA API'));
            };

            document.head.appendChild(script);
        });
    }

    isRecaptchaLoaded(): boolean {
        return this.isLoaded && Boolean((window as any).grecaptcha);
    }

    // Método para renderizar reCAPTCHA
    render(container: string | HTMLElement, options: RecaptchaLoaderOptions & {
        callback?: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
    } = {}): Promise<number> {
        return new Promise((resolve, reject) => {
            if (!this.isRecaptchaLoaded()) {
                reject(new Error('reCAPTCHA não está carregado'));
                return;
            }

            try {
                const widgetId = (window as any).grecaptcha.render(container, {
                    sitekey: ENV.RECAPTCHA_SITE_KEY,
                    size: options.size || 'normal',
                    theme: options.theme || 'light',
                    callback: options.callback,
                    'expired-callback': options['expired-callback'],
                    'error-callback': options['error-callback'],
                });
                resolve(widgetId);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Método para obter resposta do reCAPTCHA
    getResponse(widgetId?: number): string {
        if (!this.isRecaptchaLoaded()) {
            throw new Error('reCAPTCHA não está carregado');
        }
        return (window as any).grecaptcha.getResponse(widgetId);
    }

    // Método para resetar reCAPTCHA
    reset(widgetId?: number): void {
        if (!this.isRecaptchaLoaded()) {
            throw new Error('reCAPTCHA não está carregado');
        }
        (window as any).grecaptcha.reset(widgetId);
    }

    // Método para cleanup (útil em testes)
    cleanup(): void {
        this.loadPromise = null;
        this.isLoaded = false;
        const script = document.getElementById('recaptcha-api');
        if (script) {
            document.head.removeChild(script);
        }
        delete (window as any).grecaptcha;
        delete (window as any).onRecaptchaLoad;
    }
}

// Hook para usar o reCAPTCHA
export function useRecaptcha(options?: RecaptchaLoaderOptions) {
    const loader = RecaptchaLoader.getInstance();

    return {
        load: () => loader.load(options),
        isLoaded: () => loader.isRecaptchaLoaded(),
        render: (container: string | HTMLElement, renderOptions?: RecaptchaLoaderOptions & {
            callback?: (token: string) => void;
            'expired-callback'?: () => void;
            'error-callback'?: () => void;
        }) => loader.render(container, renderOptions),
        getResponse: (widgetId?: number) => loader.getResponse(widgetId),
        reset: (widgetId?: number) => loader.reset(widgetId),
        cleanup: () => loader.cleanup(),
    };
}

// Exportar instância singleton
export const recaptchaLoader = RecaptchaLoader.getInstance();