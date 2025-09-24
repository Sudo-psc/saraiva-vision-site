import { ENV, isPreview, isDevelopment } from '@/config/env';
import { apiClient, wpApiClient, checkCORS } from '@/lib/http-client';
import { isPostHogAvailable } from '@/lib/posthog-init';
import { isSupabaseAvailable } from '@/utils/supabaseConfig';

interface SmokeTestResult {
    name: string;
    status: 'pass' | 'fail' | 'skip';
    message: string;
    duration?: number;
}

interface SmokeTestSuite {
    results: SmokeTestResult[];
    passed: number;
    failed: number;
    skipped: number;
    totalDuration: number;
}

/**
 * Executar um teste individual com timeout
 */
async function runTest(
    name: string,
    testFn: () => Promise<void>,
    timeout = 5000
): Promise<SmokeTestResult> {
    const startTime = Date.now();

    try {
        await Promise.race([
            testFn(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), timeout)
            )
        ]);

        return {
            name,
            status: 'pass',
            message: 'OK',
            duration: Date.now() - startTime
        };
    } catch (error) {
        return {
            name,
            status: 'fail',
            message: error instanceof Error ? error.message : 'Unknown error',
            duration: Date.now() - startTime
        };
    }
}

/**
 * Teste de conectividade com WordPress
 */
async function testWordPressConnection(): Promise<void> {
    if (!ENV.WP_BASE_URL) {
        throw new Error('WordPress URL não configurada');
    }

    // Testar CORS primeiro
    const corsOk = await checkCORS(`${ENV.WP_BASE_URL}/wp-json/wp/v2/posts`);
    if (!corsOk) {
        throw new Error('CORS não configurado corretamente');
    }

    // Testar endpoint de posts
    const posts = await wpApiClient.get('/posts?per_page=1');
    if (!Array.isArray(posts)) {
        throw new Error('Resposta inválida do WordPress');
    }
}

/**
 * Teste de conectividade com API backend
 */
async function testBackendConnection(): Promise<void> {
    if (!ENV.API_BASE_URL) {
        throw new Error('API URL não configurada');
    }

    // Testar endpoint de health
    const health = await apiClient.get('/health');
    if (!health || health.status !== 'ok') {
        throw new Error('Backend não está saudável');
    }
}

/**
 * Teste de inicialização do PostHog
 */
async function testPostHogInitialization(): Promise<void> {
    if (!ENV.POSTHOG_KEY) {
        throw new Error('PostHog não configurado');
    }

    // Aguardar um pouco para inicialização
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!isPostHogAvailable()) {
        throw new Error('PostHog não inicializou corretamente');
    }
}

/**
 * Teste de configuração do Supabase
 */
async function testSupabaseConfiguration(): Promise<void> {
    if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
        throw new Error('Supabase não configurado');
    }

    if (!isSupabaseAvailable()) {
        throw new Error('Cliente Supabase não disponível');
    }
}

/**
 * Teste de carregamento do Google Maps
 */
async function testGoogleMapsLoading(): Promise<void> {
    if (!ENV.GOOGLE_MAPS_API_KEY) {
        throw new Error('Google Maps API key não configurada');
    }

    // Testar se a URL da API está acessível
    const testUrl = `https://maps.googleapis.com/maps/api/js?key=${ENV.GOOGLE_MAPS_API_KEY}&libraries=places`;
    const response = await fetch(testUrl, { method: 'HEAD' });

    if (!response.ok) {
        throw new Error(`Google Maps API não acessível: ${response.status}`);
    }
}

/**
 * Teste de formulário de contato (sandbox)
 */
async function testContactForm(): Promise<void> {
    if (!ENV.API_BASE_URL) {
        throw new Error('API URL não configurada para teste de contato');
    }

    const testData = {
        name: 'Teste Smoke',
        email: 'teste@example.com',
        message: 'Teste automatizado',
        test: true // Flag para indicar que é um teste
    };

    const response = await apiClient.post('/contact', testData);
    if (!response || response.error) {
        throw new Error('Formulário de contato não está funcionando');
    }
}

/**
 * Executar todos os smoke tests
 */
export async function runSmokeTests(): Promise<SmokeTestSuite> {
    const startTime = Date.now();
    const results: SmokeTestResult[] = [];

    // Só executar em preview ou desenvolvimento
    if (!isPreview && !isDevelopment) {
        return {
            results: [{
                name: 'Smoke Tests',
                status: 'skip',
                message: 'Smoke tests só executam em preview/development'
            }],
            passed: 0,
            failed: 0,
            skipped: 1,
            totalDuration: 0
        };
    }

    console.log('🧪 Executando smoke tests...');

    // Lista de testes
    const tests = [
        { name: 'WordPress Connection', fn: testWordPressConnection },
        { name: 'Backend Connection', fn: testBackendConnection },
        { name: 'PostHog Initialization', fn: testPostHogInitialization },
        { name: 'Supabase Configuration', fn: testSupabaseConfiguration },
        { name: 'Google Maps Loading', fn: testGoogleMapsLoading },
        { name: 'Contact Form', fn: testContactForm },
    ];

    // Executar testes em paralelo (com limite)
    const testPromises = tests.map(test => runTest(test.name, test.fn));
    const testResults = await Promise.all(testPromises);

    results.push(...testResults);

    // Calcular estatísticas
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const skipped = results.filter(r => r.status === 'skip').length;
    const totalDuration = Date.now() - startTime;

    // Log dos resultados
    console.group('🧪 Resultados dos Smoke Tests');
    results.forEach(result => {
        const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
        console.log(`${icon} ${result.name}: ${result.message} (${result.duration}ms)`);
    });
    console.log(`\n📊 Resumo: ${passed} passou, ${failed} falhou, ${skipped} pulado (${totalDuration}ms)`);
    console.groupEnd();

    return {
        results,
        passed,
        failed,
        skipped,
        totalDuration
    };
}

/**
 * Executar smoke tests automaticamente em preview
 */
if (isPreview && typeof window !== 'undefined') {
    // Aguardar o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => runSmokeTests(), 2000);
        });
    } else {
        setTimeout(() => runSmokeTests(), 2000);
    }
}