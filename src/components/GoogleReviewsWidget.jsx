import React, { useEffect, useState } from 'react';
import { Star, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { googleReviewUrl } from '@/lib/clinicInfo';

// Real reviews data obtained from Google Places API
const realGoogleReviews = [
  { id: 0, author: 'Lorrayne V.', rating: 4, text: '', relativeTime: 'há uma semana' },
  { id: 1, author: 'Junia B.', rating: 5, text: '', relativeTime: 'há uma semana' },
  { id: 2, author: 'Lais S.', rating: 5, text: 'Ótimo atendimento, excelente espaço. Obrigada', relativeTime: 'há uma semana' },
  { id: 3, author: 'Elis R.', rating: 5, text: 'Que atendimento maravilhoso! Tem pessoa que realmente nasce para exalar gentileza... Minha avó foi extremamente bem atendida, da chegada a saída da clínica. Muito obrigada, Ana e Samara, por nos tratar com tanta humanidade! 🥰', relativeTime: 'há uma semana' },
  { id: 4, author: 'Alessandra G.', rating: 5, text: '', relativeTime: 'há uma semana' }
];

const realSummary = { rating: 4.9, total: 102 };

const mockReviews = [
  { id: 1, author: 'Paciente A', rating: 5, text: 'Atendimento excelente e rápido!' },
  { id: 2, author: 'Paciente B', rating: 5, text: 'Equipe muito atenciosa e estrutura moderna.' },
  { id: 3, author: 'Paciente C', rating: 4, text: 'Ótima experiência, recomendo.' }
];

const GoogleReviewsWidget = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [summary, setSummary] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);

  const locale = (typeof navigator !== 'undefined' ? navigator.language : 'pt').slice(0, 2);
  const CACHE_KEY = 'gv_reviews_cache_v2';
  const CACHE_TTL_MS = 1000 * 60 * 10; // 10 min

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);

    // Try cache first
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.reviews)) {
          setReviews(parsed.reviews);
          setSummary(parsed.summary || null);
          setInfo('Dados em cache (clique para atualizar).');
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Cache read failed', e);
    }

    // For now, use real Google data we fetched earlier
    // TODO: Replace with live API call in production
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const payload = {
        reviews: realGoogleReviews,
        summary: realSummary,
        timestamp: Date.now(),
        lang: locale,
        source: 'google-snapshot'
      };

      try { localStorage.setItem(CACHE_KEY, JSON.stringify(payload)); } catch { }
      setReviews(payload.reviews);
      setSummary(payload.summary);
      setInfo('Avaliações reais do Google Business (snapshot atual).');

    } catch (err) {
      console.error('Error loading reviews:', err);
      setInfo('Usando dados simulados temporariamente.');
      setReviews(mockReviews);
      setSummary({ rating: 4.7, total: mockReviews.length });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const displayed = reviews.slice(0, visibleCount);
  const hasMore = reviews.length > visibleCount;

  const avg = summary?.rating || (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);

  const Skeleton = ({ i }) => (
    <li className="animate-pulse border border-slate-100 dark:border-slate-700 rounded-xl p-4 bg-slate-50/60 dark:bg-slate-800/30">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1">
          {[...Array(5)].map((_, k) => (<span key={k} className="w-3 h-3 bg-slate-200 dark:bg-slate-600 rounded"></span>))}
        </div>
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-600 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-600 rounded" />
        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-600 rounded" />
      </div>
    </li>
  );

  return (
    <div className="bg-white dark:bg-slate-900/70 backdrop-blur rounded-2xl shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60 p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          Avaliações Google 
          {avg && (
            <span className="text-sm font-normal text-slate-500">
              ({avg}★ • {summary?.total || reviews.length} avaliações)
            </span>
          )}
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={fetchReviews} disabled={loading} className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition disabled:opacity-40" title="Recarregar">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">Avaliar</a>
        </div>
      </div>

      {error && <p className="text-xs flex items-start gap-1 text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 p-2 rounded"><AlertTriangle size={12} /> {error}</p>}
      {!error && info && <p className="text-xs flex items-start gap-1 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-2 rounded"><Info size={12} /> {info}</p>}

      {/* Summary section */}
      {!loading && summary && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star size={20} className="text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {summary.rating}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Classificação média</p>
            </div>
            <div className="w-px h-12 bg-slate-200 dark:bg-slate-700"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                {summary.total}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total de avaliações</p>
            </div>
          </div>
        </div>
      )}

      {loading && <p className="text-xs text-slate-500">Carregando avaliações...</p>}

      <ul className="space-y-4" aria-live="polite">
        {loading ? (
          [...Array(5)].map((_, i) => (<Skeleton key={i} i={i} />))
        ) : (
          displayed.map(r => (
            <li key={r.id} className="border border-slate-100 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2 mb-2">
                {[...Array(r.rating)].map((_, i) => (<Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />))}
                <span className="text-xs text-slate-500 dark:text-slate-400">{r.author}</span>
                {r.relativeTime && <span className="text-xs text-slate-400 dark:text-slate-500">• {r.relativeTime}</span>}
              </div>
              {r.text ? (
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug">"{r.text}"</p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">Avaliação sem comentário</p>
              )}
            </li>
          ))
        )}
      </ul>

      {!loading && reviews.length > 5 && (
        <div className="flex justify-center">
          {hasMore ? (
            <button onClick={() => setVisibleCount(c => c + 3)} className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Ver mais avaliações
            </button>
          ) : (
            <button onClick={() => setVisibleCount(5)} className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Mostrar menos
            </button>
          )}
        </div>
      )}

      <div className="text-center">
        <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-5 py-2 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-sm font-semibold hover:bg-blue-700 dark:hover:bg-blue-400 transition">
          Avalie-nos no Google
        </a>
      </div>

      <p className="text-[10px] text-slate-400 dark:text-slave-500 text-center mt-2 leading-snug px-2">
        Avaliações públicas anonimizadas (LGPD / CFM).
      </p>
    </div>
  );
};

export default GoogleReviewsWidget;
