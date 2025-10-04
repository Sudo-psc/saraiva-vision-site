import { useEffect, useMemo } from 'react';
import { SafeWS } from '../utils/SafeWS';
import { env } from '../config/env';

/**
 * Hook for managing Pulse.live chat WebSocket connection
 * Provides safe WebSocket connection with automatic retry and state management
 */
export function usePulseChat() {
  const client = useMemo(() => {
    if (!env.VITE_PULSE_WS_URL) {
      console.warn('Pulse chat disabled: VITE_PULSE_WS_URL not configured');
      return null;
    }

    return new SafeWS(env.VITE_PULSE_WS_URL, {
      maxRetries: 3,
      baseDelay: 2000,
      maxDelay: 10000,
      onOpen: () => {
        console.log('Pulse.live WebSocket connected');
      },
      onClose: () => {
        console.log('Pulse.live WebSocket disconnected');
      },
      onError: (event) => {
        console.error('Pulse.live WebSocket error:', event);
      },
      onMessage: (data) => {
        console.log('Pulse.live message received:', data);
        // Handle incoming messages as needed
      }
    });
  }, []);

  useEffect(() => {
    if (!client) return;

    // Connect when component mounts
    client.connect();

    // Send periodic ping to keep connection alive
    const pingInterval = setInterval(() => {
      client.sendSafe(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
    }, 30000); // Ping every 30 seconds

    return () => {
      clearInterval(pingInterval);
      client.close();
    };
  }, [client]);

  return {
    isReady: client?.isReady() ?? false,
    state: client?.getState() ?? 'disconnected',
    sendMessage: (message: string) => client?.sendSafe(message) ?? false,
  };
}