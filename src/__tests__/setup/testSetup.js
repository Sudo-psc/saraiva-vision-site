// Test setup for performance monitoring tests
import { vi } from 'vitest';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn()
}));

// Mock PerformanceObserver
global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn()
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation((callback) => {
    return setTimeout(callback, 16);
});

global.cancelAnimationFrame = vi.fn().mockImplementation((id) => {
    clearTimeout(id);
});

// Mock CSS.supports
Object.defineProperty(CSS, 'supports', {
    writable: true,
    value: vi.fn().mockReturnValue(true)
});

// Mock canvas context
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    writable: true,
    value: vi.fn().mockReturnValue({
        getParameter: vi.fn().mockReturnValue('MockedRenderer'),
        getExtension: vi.fn().mockReturnValue(null)
    })
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock navigator properties
Object.defineProperty(navigator, 'hardwareConcurrency', {
    writable: true,
    value: 8
});

Object.defineProperty(navigator, 'deviceMemory', {
    writable: true,
    value: 8
});

Object.defineProperty(navigator, 'connection', {
    writable: true,
    value: {
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false
    }
});