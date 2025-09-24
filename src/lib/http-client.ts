import { ENV } from '@/config/env';

export interface RequestConfig extends RequestInit {
    timeout?: number;
    baseURL?: string;
}

export class HttpError extends Error {
    constructor(
        message: string,
        public status: number,
        public response?: Response
    ) {
        super(message);
        this.name = 'HttpError';
    }
}

export class HttpClient {
    private baseURL: string;
    private defaultTimeout: number;
    private defaultHeaders: HeadersInit;

    constructor(baseURL: string, timeout = 10000) {
        this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
        this.defaultTimeout = timeout;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    private async request<T>(
        endpoint: string,
        config: RequestConfig = {}
    ): Promise<T> {
        const {
            timeout = this.defaultTimeout,
            baseURL = this.baseURL,
            headers = {},
            ...restConfig
        } = config;

        const url = endpoint.startsWith('http')
            ? endpoint
            : `${baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...restConfig,
                headers: {
                    ...this.defaultHeaders,
                    ...headers,
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new HttpError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    response
                );
            }

            // Verificar se a resposta tem conteúdo
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                return await response.json();
            }

            return (await response.text()) as unknown as T;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof DOMException && error.name === 'AbortError') {
                throw new HttpError('Request timeout', 408);
            }

            throw error;
        }
    }

    async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, { ...config, method: 'GET' });
    }

    async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, { ...config, method: 'DELETE' });
    }

    // Método para upload de arquivos
    async upload<T>(endpoint: string, formData: FormData, config?: RequestConfig): Promise<T> {
        const { headers, ...restConfig } = config || {};
        return this.request<T>(endpoint, {
            ...restConfig,
            method: 'POST',
            body: formData,
            headers: {
                // Não definir Content-Type para FormData (o browser define automaticamente)
                ...headers,
            },
        });
    }
}

// Instâncias pré-configuradas
export const apiClient = new HttpClient(ENV.API_BASE_URL || '');
export const wpClient = new HttpClient(ENV.WP_BASE_URL || '');

// Cliente para WordPress REST API
export const wpApiClient = new HttpClient(`${ENV.WP_BASE_URL}/wp-json/wp/v2` || '');

// Utilitário para verificar CORS
export async function checkCORS(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: 'OPTIONS' });
        return response.ok;
    } catch {
        return false;
    }
}

// Utilitário para retry com backoff exponencial
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxRetries) break;

            // Backoff exponencial: 1s, 2s, 4s...
            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}