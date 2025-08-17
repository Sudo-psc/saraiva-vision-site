import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, ArrowRight, BookOpen, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BlogSection = () => {
  const { t } = useTranslation();

  const blogPosts = [
    {
      id: 1,
      title: t('blog.posts.dryEyes.title'),
      excerpt: t('blog.posts.dryEyes.excerpt'),
      category: t('blog.categories.prevention'),
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=400&fit=crop&q=80',
      date: '2024-12-01',
      readTime: '5 min',
      author: 'Dr. Saraiva',
      views: 1250,
      likes: 89
    },
    {
      id: 2,
      title: t('blog.posts.cataract.title'),
      excerpt: t('blog.posts.cataract.excerpt'),
      category: t('blog.categories.treatments'),
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80',
      date: '2024-11-28',
      readTime: '7 min',
      author: 'Dr. Saraiva',
      views: 980,
      likes: 76
    },
    {
      id: 3,
      title: t('blog.posts.childEyes.title'),
      excerpt: t('blog.posts.childEyes.excerpt'),
      category: t('blog.categories.pediatric'),
      image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&h=400&fit=crop&q=80',
      date: '2024-11-25',
      readTime: '6 min',
      author: 'Dr. Saraiva',
      views: 1500,
      likes: 124
    },
    {
      id: 4,
      title: t('blog.posts.technology.title'),
      excerpt: t('blog.posts.technology.excerpt'),
      category: t('blog.categories.technology'),
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop&q=80',
      date: '2024-11-22',
      readTime: '8 min',
      author: 'Dr. Saraiva',
      views: 2100,
      likes: 156
    }
  ];

  const categories = [
    { name: t('blog.categories.all'), slug: 'all', count: blogPosts.length },
    { name: t('blog.categories.prevention'), slug: 'prevention', count: 1 },
    { name: t('blog.categories.treatments'), slug: 'treatments', count: 1 },
    { name: t('blog.categories.pediatric'), slug: 'pediatric', count: 1 },
    { name: t('blog.categories.technology'), slug: 'technology', count: 1 }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      [t('blog.categories.prevention')]: 'bg-green-100 text-green-700',
      [t('blog.categories.treatments')]: 'bg-blue-100 text-blue-700',
      [t('blog.categories.pediatric')]: 'bg-purple-100 text-purple-700',
      [t('blog.categories.technology')]: 'bg-orange-100 text-orange-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section id="blog" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
            <BookOpen size={16} className="mr-2" />
            {t('blog.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('blog.title')}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {t('blog.subtitle')}
          </p>
        </motion.div>

        {/* Categories Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category, index) => (
            <button
              key={category.slug}
              className="px-6 py-3 rounded-full bg-white shadow-soft-light hover:shadow-soft-medium transition-all duration-300 border border-slate-200 hover:border-blue-300 group"
            >
              <span className="font-medium text-slate-700 group-hover:text-blue-600">
                {category.name}
              </span>
              <span className="ml-2 text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {category.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Featured Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-white rounded-3xl shadow-soft-medium overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="aspect-video lg:aspect-auto">
                <img
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  className="w-full h-full object-cover"
                  loading="lazy" decoding="async"
                />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(blogPosts[0].category)}`}>
                    {blogPosts[0].category}
                  </span>
                  <span className="text-sm text-slate-500">
                    {t('blog.featured')}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900">
                  {blogPosts[0].title}
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      {formatDate(blogPosts[0].date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      {blogPosts[0].readTime}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      {blogPosts[0].views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart size={16} />
                      {blogPosts[0].likes}
                    </div>
                  </div>
                </div>
                <Button className="w-fit gap-2">
                  {t('blog.readMore')}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogPosts.slice(1).map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-soft-light hover:shadow-soft-medium transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy" decoding="async"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Eye size={12} />
                    {post.views}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} />
                    {formatDate(post.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={12} />
                    {post.readTime}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl p-8 shadow-soft-light max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-slate-900">
              {t('blog.newsletter.title')}
            </h3>
            <p className="text-slate-600 mb-6">
              {t('blog.newsletter.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t('blog.newsletter.emailPlaceholder')}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button className="px-6">
                {t('blog.newsletter.subscribe')}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              {t('blog.newsletter.privacy')}
            </p>
          </div>
        </motion.div>

        {/* Visit Blog CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            onClick={() => window.open('https://blog.saraivavision.com.br', '_blank')}
            className="gap-2"
          >
            {t('blog.visitBlog')}
            <ArrowRight size={20} />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSection;
