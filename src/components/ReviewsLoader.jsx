import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ReviewsLoader = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In development, use mock data
        if (import.meta.env.DEV) {
          const mockReviews = {
            source: 'mock',
            total: 127,
            rating: 4.8,
            reviews: [
              {
                id: 1,
                author: 'Maria S.',
                rating: 5,
                text: 'Atendimento excepcional! Dr. Philipe é muito cuidadoso.',
                relativeTime: '2 semanas atrás'
              },
              {
                id: 2,
                author: 'João P.',
                rating: 5,
                text: 'Clínica moderna com equipamentos de última geração.',
                relativeTime: '1 mês atrás'
              }
            ],
            disclaimer: 'Avaliações simuladas para desenvolvimento',
            timestamp: new Date().toISOString()
          };
          
          setTimeout(() => {
            setReviews(mockReviews);
            setLoading(false);
          }, 1000);
          return;
        }

        // Production: fetch from API
        const response = await fetch('/api/reviews', {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'max-age=300'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">
          Erro ao carregar avaliações
        </div>
        <div className="text-red-600 text-sm mt-1">
          {error}
        </div>
        <div className="text-red-500 text-xs mt-2">
          Em caso de erro persistente, entre em contato conosco.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Avaliações ({reviews.total || reviews.reviews?.length || 0})
        </h3>
        {reviews.rating && (
          <div className="flex items-center space-x-1">
            <span className="font-medium">{reviews.rating}</span>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {reviews.reviews?.map((review) => (
          <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {review.author[0]}
                  </span>
                </div>
                <span className="font-medium text-gray-900">
                  {review.author}
                </span>
              </div>
              <div className="flex items-center space-x-1" aria-label={`Nota ${review.rating}`} />
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed mb-2">
              {review.text}
            </p>
            
            <div className="text-xs text-gray-700">
              {review.relativeTime}
            </div>
          </div>
        ))}
      </div>

      {reviews.disclaimer && (
        <div className="text-xs text-gray-700 text-center">
          {reviews.disclaimer}
        </div>
      )}
    </div>
  );
};

export default ReviewsLoader;
