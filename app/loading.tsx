import { Eye } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-white to-bg-secondary flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-primary-200 rounded-full animate-ping opacity-75" style={{ animationDuration: '1.5s' }} />
          <div className="relative bg-white rounded-full p-6 shadow-glass">
            <Eye className="w-12 h-12 text-primary-600 animate-pulse" strokeWidth={1.5} />
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-text-primary mb-3">
          Carregando...
        </h2>
        
        <p className="text-text-secondary mb-8">
          Aguarde um momento, estamos preparando tudo para você
        </p>

        <div className="flex justify-center gap-2 mb-4">
          <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

        <div className="max-w-md mx-auto">
          <div className="h-2 bg-border-light rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400 animate-shimmer bg-[length:200%_100%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
