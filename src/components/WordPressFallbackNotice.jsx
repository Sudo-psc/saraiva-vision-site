import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WordPressFallbackNotice = ({ meta, onRetry }) => {
  if (!meta) return null;

  const message = meta.message || meta.fallbackMeta?.message || 'Conteúdo temporariamente indisponível.';
  const reason = meta.fallbackMeta?.reason || meta.reason;
  const generatedAt = meta.fallbackMeta?.generatedAt || meta.generatedAt;
  const retryAfterSeconds = meta.fallbackMeta?.retryAfterSeconds || meta.retryAfterSeconds;

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-xl p-5 text-sm text-amber-800 space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 mt-0.5 text-amber-500" />
        <div>
          <h3 className="font-semibold text-amber-900">Blog em modo de fallback</h3>
          <p>{message}</p>
          <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-700">
            {reason && (
              <div>
                <span className="font-semibold">Motivo:</span> {reason}
              </div>
            )}
            {generatedAt && (
              <div>
                <span className="font-semibold">Gerado em:</span> {new Date(generatedAt).toLocaleString('pt-BR')}
              </div>
            )}
            {typeof retryAfterSeconds === 'number' && (
              <div>
                <span className="font-semibold">Nova tentativa em:</span> {Math.round(retryAfterSeconds / 60)} min
              </div>
            )}
          </dl>
        </div>
      </div>

      {typeof onRetry === 'function' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRetry()}
          className="inline-flex items-center gap-2 text-amber-800 border-amber-300 hover:bg-amber-100"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente agora
        </Button>
      )}
    </div>
  );
};

export default WordPressFallbackNotice;
