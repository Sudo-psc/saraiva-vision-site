import { Metadata } from 'next';
import BlogCard from '@/components/blog/BlogCard';
import blogPosts from '@/src/content/blog/posts.json';
import type { BlogPost } from '@/types/blog';

export const metadata: Metadata = {
  title: 'Blog | Saraiva Vision - Saúde Ocular e Oftalmologia',
  description:
    'Artigos e novidades sobre saúde ocular, doenças oftalmológicas, tratamentos e prevenção. Informação confiável com Dr. Philipe Saraiva em Caratinga, MG.',
  keywords:
    'blog oftalmologia, saúde ocular, doenças dos olhos, tratamentos oftalmológicos, catarata, glaucoma, retina, Caratinga MG',
};

export default function BlogPage() {
  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  ) as BlogPost[];

  const categories = Array.from(
    new Set(blogPosts.map((post: BlogPost) => post.category))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <main className="py-24 md:py-32">
        <div className="container mx-auto px-[7%]">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Blog Saraiva Vision
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium">
              Informações confiáveis sobre saúde ocular, tratamentos modernos e
              prevenção de doenças oftalmológicas.
            </p>
          </header>

          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 bg-white text-gray-700 rounded-full border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors font-medium"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedPosts.map((post, index) => (
              <BlogCard key={post.id} post={post} priority={index < 3} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
