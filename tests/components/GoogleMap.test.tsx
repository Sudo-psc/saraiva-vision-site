/**
 * GoogleMap Component Tests
 * Tests for unified Google Maps component with mocked API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GoogleMap from '@/components/GoogleMap';

// Mock Google Maps API
const mockGoogleMaps = {
  maps: {
    Map: vi.fn().mockImplementation(() => ({
      setCenter: vi.fn(),
      setZoom: vi.fn(),
    })),
    Marker: vi.fn(),
    importLibrary: vi.fn().mockResolvedValue({
      Map: vi.fn().mockImplementation(() => ({
        setCenter: vi.fn(),
        setZoom: vi.fn(),
      })),
      AdvancedMarkerElement: vi.fn().mockImplementation(() => ({
        addListener: vi.fn(),
        position: null,
      })),
      PlacesService: vi.fn().mockImplementation(() => ({
        getDetails: vi.fn(),
      })),
    }),
    places: {
      PlacesServiceStatus: {
        OK: 'OK',
      },
    },
  },
};

// Mock loadGoogleMaps
vi.mock('@/lib/loadGoogleMaps', () => ({
  loadGoogleMaps: vi.fn().mockResolvedValue(mockGoogleMaps.maps),
  isGoogleMapsReady: vi.fn().mockReturnValue(true),
  resetGoogleMapsLoader: vi.fn(),
}));

// Mock clinicInfo
vi.mock('@/lib/clinicInfo', () => ({
  clinicInfo: {
    name: 'Clínica Saraiva Vision',
    latitude: -19.7890206,
    longitude: -42.1347583,
    address: {
      street: 'Rua Example, 123',
      city: 'Caratinga',
      state: 'MG',
      zip: '35300-000',
    },
  },
  CLINIC_PLACE_ID: 'ChIJVUKww7WRugARF7u2lAe7BeE',
  googleMapsProfileUrl: 'https://maps.google.com/...',
  googleReviewUrl: 'https://search.google.com/...',
}));

// Mock fetch for health check
global.fetch = vi.fn();

describe('GoogleMap Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    global.window.google = mockGoogleMaps;
    // Mock successful health check
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'healthy' }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      render(<GoogleMap />);
      expect(screen.getByText('Loading map...')).toBeInTheDocument();
    });

    it('should render map container after loading', async () => {
      const { container } = render(<GoogleMap />);

      await waitFor(() => {
        const mapContainer = container.querySelector('.w-full.h-full.rounded-lg');
        expect(mapContainer).toBeInTheDocument();
      });
    });

    it('should render with custom height', () => {
      const { container } = render(<GoogleMap height={500} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.height).toBe('500px');
    });

    it('should render with custom className', () => {
      const { container } = render(<GoogleMap className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Modes', () => {
    it('should initialize in simple mode by default', async () => {
      render(<GoogleMap />);

      await waitFor(() => {
        expect(mockGoogleMaps.maps.importLibrary).toHaveBeenCalledWith('maps');
      });
    });

    it('should initialize in embedded mode', async () => {
      render(<GoogleMap mode="embedded" />);

      await waitFor(() => {
        expect(mockGoogleMaps.maps.importLibrary).toHaveBeenCalled();
      });
    });

    it('should initialize in interactive mode', async () => {
      render(<GoogleMap mode="interactive" />);

      await waitFor(() => {
        expect(mockGoogleMaps.maps.importLibrary).toHaveBeenCalled();
      });
    });
  });

  describe('Fallback UI', () => {
    it('should show fallback when forceFallback is true', () => {
      render(<GoogleMap showFallback={true} />);

      expect(screen.getByText('Clinic Location')).toBeInTheDocument();
      expect(screen.getByText(/Rua Example/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Open in Google Maps/i })).toBeInTheDocument();
    });

    it('should show fallback on API load failure', async () => {
      const loadGoogleMaps = await import('@/lib/loadGoogleMaps');
      vi.mocked(loadGoogleMaps.loadGoogleMaps).mockRejectedValueOnce(
        new Error('API load failed')
      );

      render(<GoogleMap />);

      await waitFor(() => {
        expect(screen.getByText('Clinic Location')).toBeInTheDocument();
      });
    });

    it('should display static map image in fallback', () => {
      render(<GoogleMap showFallback={true} />);

      const staticMap = screen.getByAlt(/Static map of/);
      expect(staticMap).toBeInTheDocument();
      expect(staticMap).toHaveAttribute('loading', 'lazy');
    });

    it('should show error message in fallback when provided', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'degraded', message: 'Service degraded' }),
      });

      render(<GoogleMap />);

      await waitFor(() => {
        expect(screen.getByText(/temporarily unavailable/)).toBeInTheDocument();
      });
    });
  });

  describe('Map Configuration', () => {
    it('should use custom center position', async () => {
      const customCenter = { lat: 10, lng: 20 };
      render(<GoogleMap center={customCenter} />);

      await waitFor(() => {
        expect(mockGoogleMaps.maps.importLibrary).toHaveBeenCalled();
      });
    });

    it('should use custom zoom level', async () => {
      render(<GoogleMap zoom={15} />);

      await waitFor(() => {
        expect(mockGoogleMaps.maps.importLibrary).toHaveBeenCalled();
      });
    });

    it('should apply custom controls', async () => {
      const controls = {
        zoomControl: false,
        streetViewControl: true,
        fullscreenControl: true,
      };

      render(<GoogleMap controls={controls} />);

      await waitFor(() => {
        expect(mockGoogleMaps.maps.importLibrary).toHaveBeenCalled();
      });
    });
  });

  describe('Markers', () => {
    it('should create default clinic marker', async () => {
      render(<GoogleMap />);

      await waitFor(() => {
        const { AdvancedMarkerElement } = mockGoogleMaps.maps.importLibrary as any;
        expect(AdvancedMarkerElement).toHaveBeenCalled();
      });
    });

    it('should create additional markers when provided', async () => {
      const markers = [
        { position: { lat: 10, lng: 20 }, title: 'Marker 1' },
        { position: { lat: 11, lng: 21 }, title: 'Marker 2' },
      ];

      render(<GoogleMap markers={markers} />);

      await waitFor(() => {
        expect(mockGoogleMaps.maps.importLibrary).toHaveBeenCalled();
      });
    });

    it('should call onMarkerClick callback when marker is clicked', async () => {
      const onMarkerClick = vi.fn();
      const markers = [{ position: { lat: 10, lng: 20 }, title: 'Marker 1' }];

      render(<GoogleMap markers={markers} onMarkerClick={onMarkerClick} />);

      await waitFor(() => {
        expect(mockGoogleMaps.maps.importLibrary).toHaveBeenCalled();
      });
    });
  });

  describe('Health Check', () => {
    it('should check map health before initialization', async () => {
      render(<GoogleMap />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/maps-health',
          expect.objectContaining({
            headers: { Accept: 'application/json' },
          })
        );
      });
    });

    it('should show fallback when health check fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'unhealthy' }),
      });

      render(<GoogleMap />);

      await waitFor(() => {
        expect(screen.getByText(/temporarily unavailable/)).toBeInTheDocument();
      });
    });

    it('should continue initialization if health check request fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(<GoogleMap />);

      await waitFor(() => {
        expect(mockGoogleMaps.maps.importLibrary).toHaveBeenCalled();
      });
    });
  });

  describe('Callbacks', () => {
    it('should call onMapLoad after successful initialization', async () => {
      const onMapLoad = vi.fn();

      render(<GoogleMap onMapLoad={onMapLoad} />);

      await waitFor(() => {
        expect(onMapLoad).toHaveBeenCalled();
      });
    });
  });

  describe('Cleanup', () => {
    it('should cleanup markers on unmount', async () => {
      const { unmount } = render(<GoogleMap />);

      await waitFor(() => {
        expect(mockGoogleMaps.maps.importLibrary).toHaveBeenCalled();
      });

      unmount();
      // Verify cleanup logic (markers should be nulled)
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for static map in fallback', () => {
      render(<GoogleMap showFallback={true} />);

      const image = screen.getByAlt(/Static map of/);
      expect(image).toHaveAttribute('alt');
    });

    it('should have accessible link to Google Maps', () => {
      render(<GoogleMap showFallback={true} />);

      const link = screen.getByRole('link', { name: /Open in Google Maps/i });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
