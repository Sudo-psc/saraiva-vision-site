import { supabase } from './utils/supabase.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { slug } = req.query;
      let query = supabase.from('posts').select('id, title, slug, content'); // Adjust columns as per your Supabase table

      if (slug) {
        query = query.eq('slug', slug).single();
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (slug && !data) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching blog posts:', error.message);
      res.status(500).json({ error: 'Error fetching blog posts' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
