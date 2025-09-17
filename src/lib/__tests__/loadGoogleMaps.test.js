import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadGoogleMaps, resetGoogleMapsLoader } from '../loadGoogleMaps';

describe('loadGoogleMaps', () => {
  beforeEach(() => {
    resetGoogleMapsLoader();
    global.window = {};
    global.document = {
      querySelector: vi.fn(),
      head: { appendChild: vi.fn() }
    };
    global.navigator = { onLine: true };
  });

  it('rejects when offline', async () => {
    navigator.onLine = false;
    await expect(loadGoogleMaps('key')).rejects.toThrow('Sem conexão com a internet');
  });
});
