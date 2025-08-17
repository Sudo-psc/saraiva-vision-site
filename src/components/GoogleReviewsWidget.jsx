import React, { useEffect, useState } from 'react';
import { Star, RefreshCw } from 'lucide-react';
import { googleReviewUrl } from '@/lib/clinicInfo';

// NOTE: Real-time Google Business reviews require Places API (Place Details) or a third-party service.
// This component sets up a placeholder with progressive enhancement.

const mockReviews = [
  { id: 1, author: 'Paciente A', rating: 5, text: 'Atendimento excelente e rápido!' },
  { id: 2, author: 'Paciente B', rating: 5, text: 'Equipe muito atenciosa e estrutura moderna.' },
  { id: 3, author: 'Paciente C', rating: 4, text: 'Ótima experiência, recomendo.' }
];

const GoogleReviewsWidget = () => {
  const [reviews, setReviews] = useState(mockReviews);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = () => {
    setLoading(true);
    setError(null);
    fetch('/api/reviews')
      .then(r => r.json())
      .then(json => {
        if (json.reviews && json.reviews.length) {
          setReviews(json.reviews);
        } else if (json.error) {
          setError(json.error + ' (mock exibido)');
        } else {
          setError('Sem dados de reviews (mock exibido)');
        }
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-soft-light p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-800">Avaliações Google</h3>
        <div className="flex items-center gap-3">
          <button onClick={fetchReviews} disabled={loading} className="text-slate-500 hover:text-blue-600 transition disabled:opacity-40" title="Recarregar">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm font-medium hover:underline">Avaliar</a>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 p-2 rounded">{error}</p>}
      {loading && <p className="text-xs text-slate-500">Carregando avaliações...</p>}
  <ul className="space-y-4" aria-live="polite">
        {reviews.map(r => (
          <li key={r.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              {[...Array(r.rating)].map((_,i)=>(<Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />))}
              <span className="text-xs text-slate-500">{r.author}</span>
            </div>
            <p className="text-sm text-slate-700">“{r.text}”</p>
          </li>
        ))}
      </ul>
    <div className="text-center">
        <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition">
          Avalie-nos no Google
        </a>
      </div>
  <p className="text-[10px] text-slate-400 text-center mt-2 leading-snug px-2">{error ? 'Mock exibido.' : 'Avaliações públicas anonimizadas (LGPD / CFM): nomes parcializados e remoção de termos clínicos sensíveis.'}</p>
    </div>
  );
};

export default GoogleReviewsWidget;
