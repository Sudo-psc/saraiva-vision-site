import React, { useState, useEffect } from 'react';
import { getScrollMetrics } from '@/utils/scrollTelemetry';

const ScrollDiagnostics = () => {
  const [metrics, setMetrics] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Só mostra em desenvolvimento
    if (import.meta.env?.DEV) {
      const interval = setInterval(() => {
        setMetrics(getScrollMetrics());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  if (!import.meta.env?.DEV || !metrics) return null;

  const hasIssues = metrics.preventDefaultCalls > 0;

  return (
    <div 
      className={`fixed bottom-4 left-4 z-[9999] transition-all duration-300 ${
        isVisible ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`p-2 rounded-full text-white font-mono text-xs ${
          hasIssues ? 'bg-red-500 animate-pulse' : 'bg-green-500'
        }`}
        title="Scroll Diagnostics"
      >
        {hasIssues ? '⚠️' : '✅'}
      </button>
      
      {isVisible && (
        <div className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg shadow-lg font-mono text-xs min-w-[250px]">
          <div className="text-white font-bold mb-2">Scroll Telemetry</div>
          
          <div className="space-y-1">
            <div>Total preventDefault: {metrics.preventDefaultCalls}</div>
            <div>Wheel blocked: {metrics.wheelBlocked}</div>
            <div>Touch blocked: {metrics.touchBlocked}</div>
            <div>Scroll blocked: {metrics.scrollBlocked}</div>
            <div>Avg/min: {metrics.avgPreventDefaultPerMinute}</div>
            <div>Uptime: {Math.round(metrics.uptimeMs / 1000)}s</div>
          </div>
          
          {hasIssues && (
            <div className="mt-2 p-2 bg-red-900 text-red-200 rounded text-xs">
              ⚠️ Scroll being blocked! Check console for details.
            </div>
          )}
          
          {metrics.preventDefaultCalls === 0 && (
            <div className="mt-2 p-2 bg-green-900 text-green-200 rounded text-xs">
              ✅ No scroll blocking detected
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScrollDiagnostics;