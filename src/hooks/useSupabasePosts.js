import { useState, useEffect, useCallback } from 'react';

const useSupabasePosts = (slug = null) => {
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = slug ? `/api/blog-posts?slug=${slug}` : '/api/blog-posts';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (slug) {
        setPost(data);
      } else {
        setPosts(data);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    post,
    loading,
    error,
    refetch: fetchPosts, // Provide a refetch function
  };
};

export default useSupabasePosts;
