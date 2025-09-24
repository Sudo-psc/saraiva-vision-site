import { ENV } from '@/config/env';

interface GoogleMapsLoaderOptions {
    libraries?: string[];
    language?: string;
    region?: string;
}

class GoogleMapsLoader {
    private static instance: GoogleMapsLoader;
    private loadPromise: Promise<void> | null = null;
    private isLoaded = false;

    static getInstance(): GoogleMapsLoader {
        if (!GoogleMapsLoader.instance) {
            GoogleMapsLoader.instance = new GoogleMapsLoader();
        }
        return GoogleMapsLoader.instance;
    }

    async load(options: GoogleMapsLoaderOptions = {}): Promise<void> {
        // Se já está carregado, retornar imediatamente
        if (this.isLoaded && (window as any).google?.maps) {
            return Promise.resolve();
        }

        // Se já está carregando, retornar a promise existente
        if (this.loadPromise) {
            return this.loadPromise;
        }

        // Verificar se a API key está disponível
        if (!ENV.GOOGLE_MAPS_API_KEY) {
            throw new Error('Google Maps API key não configurada (VITE_GOOGLE_MAPS_API_KEY)');
        }

        this.loadPromise = this.loadScript(options);
        return this.loadPromise;
    }

    private loadScript(options: GoogleMapsLoaderOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            const scriptId = 'google-maps-api';

            // Verificar se o script já existe
            if (document.getElementById(scriptId)) {
                if ((window as any).google?.maps) {
                    this.isLoaded = true;
                    resolve();
                } else {
                    reject(new Error('Google Maps script carregado mas API não disponível'));
                }
                return;
            }

            const script = document.createElement('script');
            script.id = scriptId;
            script.async = true;
            script.defer = true;

            // Construir URL com parâmetros
            const params = new URLSearchParams({
                key: ENV.GOOGLE_MAPS_API_KEY,
                callback: 'initGoogleMaps',
            });

            if (options.libraries?.length) {
                params.set('libraries', options.libraries.join(','));
            }

            if (options.language) {
                params.set('language', options.language);
            }

            if (options.region) {
                params.set('region', options.region);
            }

            script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;

            // Callback global para o Google Maps
            (window as any).initGoogleMaps = () => {
                this.isLoaded = true;
                delete (window as any).initGoogleMaps;
                resolve();
            };

            script.onerror = () => {
                document.head.removeChild(script);
                delete (window as any).initGoogleMaps;
                reject(new Error('Falha ao carregar Google Maps API'));
            };

            document.head.appendChild(script);
        });
    }

    isGoogleMapsLoaded(): boolean {
        return this.isLoaded && Boolean((window as any).google?.maps);
    }

    // Método para cleanup (útil em testes)
    reset(): void {
        this.loadPromise = null;
        this.isLoaded = false;
        const script = document.getElementById('google-maps-api');
        if (script) {
            document.head.removeChild(script);
        }
        delete (window as any).google;
        delete (window as any).initGoogleMaps;
    }
}

// Hook para usar o Google Maps
export function useGoogleMaps(options?: GoogleMapsLoaderOptions) {
    const loader = GoogleMapsLoader.getInstance();

    return {
        load: () => loader.load(options),
        isLoaded: () => loader.isGoogleMapsLoaded(),
        reset: () => loader.reset(),
    };
}

// Exportar instância singleton
export const googleMapsLoader = GoogleMapsLoader.getInstance();