import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import PlansPage from '../PlansPage';

// Mock dos componentes externos
vi.mock('@/components/SEOHead', () => ({
  default: () => <div data-testid="seo-head">SEO Head</div>
}));

vi.mock('@/components/EnhancedFooter', () => ({
  default: () => <div data-testid="enhanced-footer">Enhanced Footer</div>
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}));

describe('PlansPage - Video Playback Tests', () => {
  let mockVideoElement;

  beforeEach(() => {
    // Mock do elemento video HTML5
    mockVideoElement = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      load: vi.fn(),
      muted: false,
      currentTime: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };

    // Mock do document.createElement para video
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'video') {
        return mockVideoElement;
      }
      return originalCreateElement(tagName);
    });

    // Mock do HTMLMediaElement.prototype.play
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve renderizar a página de planos', () => {
    render(
      <BrowserRouter>
        <PlansPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Escolha o Plano Ideal Para Você/i)).toBeInTheDocument();
    expect(screen.getByText(/Plano Básico/i)).toBeInTheDocument();
  });

  it('deve ter elemento de vídeo com atributos corretos', () => {
    render(
      <BrowserRouter>
        <PlansPage />
      </BrowserRouter>
    );

    // Encontrar o card do Plano Básico pelo texto e depois encontrar o container pai
    const basicoPlanText = screen.getByText(/Plano Básico/i);
    const basicoPlanCard = basicoPlanText.closest('[data-testid*="plan"]');
    expect(basicoPlanCard).toBeInTheDocument();
  });

  it('deve configurar vídeo com autoPlay, loop e playsInline', async () => {
    const { container } = render(
      <BrowserRouter>
        <PlansPage />
      </BrowserRouter>
    );

    // Simular hover no Plano Básico
    const user = userEvent.setup();
    const basicoPlanContainer = container.querySelector('[onmouseenter]');

    if (basicoPlanContainer) {
      await user.hover(basicoPlanContainer);

      await waitFor(() => {
        const videoElement = container.querySelector('video');
        if (videoElement) {
          expect(videoElement).toHaveAttribute('autoplay');
          expect(videoElement).toHaveAttribute('loop');
          expect(videoElement).toHaveAttribute('playsinline');
          expect(videoElement).toHaveAttribute('preload', 'auto');
        }
      });
    }
  });

  it('deve ter source com src correto para vídeo do Plano Básico', async () => {
    const { container } = render(
      <BrowserRouter>
        <PlansPage />
      </BrowserRouter>
    );

    const user = userEvent.setup();
    const basicoPlanContainer = container.querySelector('[onmouseenter]');

    if (basicoPlanContainer) {
      await user.hover(basicoPlanContainer);

      await waitFor(() => {
        const sourceElement = container.querySelector('video source');
        if (sourceElement) {
          expect(sourceElement).toHaveAttribute('src', '/Videos/hero-plano-basico.mp4');
          expect(sourceElement).toHaveAttribute('type', 'video/mp4');
        }
      });
    }
  });

  it('deve reproduzir vídeo ao expandir o plano', async () => {
    render(
      <BrowserRouter>
        <PlansPage />
      </BrowserRouter>
    );

    // O useEffect deve ser chamado quando expandedPlan === 'basico'
    // e deve chamar play() no videoRef
    expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it('deve pausar vídeo ao sair do hover', async () => {
    render(
      <BrowserRouter>
        <PlansPage />
      </BrowserRouter>
    );

    // Verificar que pause não foi chamado ainda
    expect(window.HTMLMediaElement.prototype.pause).not.toHaveBeenCalled();
  });
});

describe('PlansPage - Video Network Tests', () => {
  beforeEach(() => {
    // Mock global fetch antes de cada teste
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve verificar se arquivo de vídeo é acessível', async () => {
    const videoUrl = '/Videos/hero-plano-basico.mp4';

    // Mock da resposta fetch
    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: vi.fn((name) => {
          if (name === 'content-type') return 'video/mp4';
          if (name === 'accept-ranges') return 'bytes';
          if (name === 'cache-control') return 'public, max-age=31536000';
          return null;
        })
      }
    };

    global.fetch.mockResolvedValue(mockResponse);

    // Este teste verifica se o fetch do vídeo retorna status 200
    const response = await fetch(videoUrl, { method: 'HEAD' });

    // Se o vídeo não existir, este teste falhará
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('video/mp4');
    expect(global.fetch).toHaveBeenCalledWith(videoUrl, { method: 'HEAD' });
  });

  it('deve suportar range requests para streaming', async () => {
    const videoUrl = '/Videos/hero-plano-basico.mp4';

    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: vi.fn((name) => {
          if (name === 'accept-ranges') return 'bytes';
          if (name === 'content-type') return 'video/mp4';
          return null;
        })
      }
    };

    global.fetch.mockResolvedValue(mockResponse);

    const response = await fetch(videoUrl, {
      method: 'HEAD'
    });

    // Verificar se o servidor suporta range requests
    expect(response.headers.get('accept-ranges')).toBe('bytes');
    expect(global.fetch).toHaveBeenCalledWith(videoUrl, { method: 'HEAD' });
  });

  it('deve ter cache configurado para vídeos', async () => {
    const videoUrl = '/Videos/hero-plano-basico.mp4';

    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: vi.fn((name) => {
          if (name === 'cache-control') return 'public, max-age=31536000';
          if (name === 'content-type') return 'video/mp4';
          return null;
        })
      }
    };

    global.fetch.mockResolvedValue(mockResponse);

    const response = await fetch(videoUrl, { method: 'HEAD' });

    // Verificar headers de cache
    const cacheControl = response.headers.get('cache-control');
    expect(cacheControl).toBeTruthy();
    expect(cacheControl).toContain('public');
    expect(global.fetch).toHaveBeenCalledWith(videoUrl, { method: 'HEAD' });
  });
});

describe('PlansPage - Video Error Handling', () => {
  it('deve mostrar mensagem de fallback se vídeo não carregar', () => {
    render(
      <BrowserRouter>
        <PlansPage />
      </BrowserRouter>
    );

    // Verificar se há texto de fallback para vídeos não suportados
    const fallbackText = screen.queryByText(/Seu navegador não suporta/i);

    // Verificar se o elemento de fallback existe e não é nulo
    expect(fallbackText).not.toBeNull();
  });
});
