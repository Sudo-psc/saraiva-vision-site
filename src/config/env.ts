import { z } from 'zod';

// Schema de validação para variáveis de ambiente do cliente
const envSchema = z.object({
    // Vercel específicas
    VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
    VERCEL_URL: z.string().optional(),
    VERCEL_BRANCH_URL: z.string().optional(),

    // APIs e serviços
    API_BASE_URL: z.string().url('API_BASE_URL deve ser uma URL válida'),
    WP_BASE_URL: z.string().url('WP_BASE_URL deve ser uma URL válida'),

    // Supabase
    SUPABASE_URL: z.string().url('SUPABASE_URL deve ser uma URL válida'),
    SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY é obrigatória'),

    // Resend (apenas chave pública se necessário)
    RESEND_PUBLIC_KEY: z.string().optional(),

    // reCAPTCHA
    RECAPTCHA_SITE_KEY: z.string().min(1, 'RECAPTCHA_SITE_KEY é obrigatória'),

    // PostHog
    POSTHOG_KEY: z.string().min(1, 'POSTHOG_KEY é obrigatória'),
    POSTHOG_HOST: z.string().url().optional(),

    // Google Maps
    GOOGLE_MAPS_API_KEY: z.string().min(1, 'GOOGLE_MAPS_API_KEY é obrigatória'),

    // Google Places/Reviews
    GOOGLE_PLACE_ID: z.string().optional(),

    // Instagram
    INSTAGRAM_ACCESS_TOKEN: z.string().optional(),
    INSTAGRAM_USER_ID: z.string().optional(),
});

type EnvConfig = z.infer<typeof envSchema>;

// Função para extrair e validar variáveis de ambiente
function getEnvConfig(): EnvConfig {
    const rawEnv = {
        VERCEL_ENV: import.meta.env.VITE_VERCEL_ENV,
        VERCEL_URL: import.meta.env.VITE_VERCEL_URL,
        VERCEL_BRANCH_URL: import.meta.env.VITE_VERCEL_BRANCH_URL,
        API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        WP_BASE_URL: import.meta.env.VITE_WP_BASE_URL,
        SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
        RESEND_PUBLIC_KEY: import.meta.env.VITE_RESEND_PUBLIC_KEY,
        RECAPTCHA_SITE_KEY: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
        POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY,
        POSTHOG_HOST: import.meta.env.VITE_POSTHOG_HOST,
        GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        GOOGLE_PLACE_ID: import.meta.env.VITE_GOOGLE_PLACE_ID,
        INSTAGRAM_ACCESS_TOKEN: import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN,
        INSTAGRAM_USER_ID: import.meta.env.VITE_INSTAGRAM_USER_ID,
    };

    try {
        return envSchema.parse(rawEnv);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors.map(err => `VITE_${err.path.join('_')}: ${err.message}`);

            if (import.meta.env.DEV) {
                // Em desenvolvimento, falhar com mensagem clara
                throw new Error(`❌ Variáveis de ambiente faltando ou inválidas:\n${missingVars.join('\n')}`);
            } else {
                // Em produção, logar erro e continuar com valores padrão
                console.error('⚠️ Variáveis de ambiente faltando:', missingVars);
                return rawEnv as EnvConfig;
            }
        }
        throw error;
    }
}

// Configuração global exportada
export const ENV = getEnvConfig();

// Utilitários para verificar ambiente
export const isProduction = ENV.VERCEL_ENV === 'production';
export const isPreview = ENV.VERCEL_ENV === 'preview';
export const isDevelopment = ENV.VERCEL_ENV === 'development' || import.meta.env.DEV;

// Função para construir URLs absolutas
export function getAbsoluteUrl(path: string = ''): string {
    if (ENV.VERCEL_URL) {
        const protocol = ENV.VERCEL_URL.includes('localhost') ? 'http' : 'https';
        return `${protocol}://${ENV.VERCEL_URL}${path}`;
    }
    return path;
}

// Função para verificar se uma feature está disponível
export function isFeatureAvailable(feature: keyof EnvConfig): boolean {
    return Boolean(ENV[feature]);
}

// Log de configuração (apenas em desenvolvimento)
if (isDevelopment) {
    console.log('🔧 Configuração de ambiente:', {
        environment: ENV.VERCEL_ENV || 'development',
        hasApiUrl: Boolean(ENV.API_BASE_URL),
        hasWpUrl: Boolean(ENV.WP_BASE_URL),
        hasSupabase: Boolean(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY),
        hasRecaptcha: Boolean(ENV.RECAPTCHA_SITE_KEY),
        hasPostHog: Boolean(ENV.POSTHOG_KEY),
        hasGoogleMaps: Boolean(ENV.GOOGLE_MAPS_API_KEY),
        hasInstagram: Boolean(ENV.INSTAGRAM_ACCESS_TOKEN),
    });
}