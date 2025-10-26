import { useEffect, useState } from 'react';
import { fetchRecentPosts } from '@/services/sanityBlog';
import { Link } from 'react-router-dom';

export default function BlogRecentPosts({ limit = 3 }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentPosts(limit)
      .then(setPosts)
      .catch(err => {
        console.error('Error loading recent posts:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800">Erro ao carregar posts: {error}</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">Nenhum post disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <article
          key={post._id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          {post.mainImage?.asset?.url && (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={post.mainImage.asset.url}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          )}
          
          <div className="p-6">
            {post.category && (
              <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full mb-3">
                {post.category}
              </span>
            )}
            
            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
              {post.title}
            </h3>
            
            {post.excerpt && (
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              {post.author && <span>{post.author}</span>}
              {post.publishedAt && (
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              )}
            </div>
            
            <Link
              to={`/blog/${post.slug}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              Ler mais
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
