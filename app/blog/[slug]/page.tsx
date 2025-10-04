import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, ArrowLeft, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import blogPosts from '@/src/content/blog/posts.json';
import type { BlogPost } from '@/types/blog';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return blogPosts.map((post: BlogPost) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = blogPosts.find((p: BlogPost) => p.slug === params.slug);

  if (!post) {
    return {
      title: 'Post não encontrado',
    };
  }

  const metaDescription = typeof post.seo.keywords === 'string' 
    ? post.seo.metaDescription 
    : post.seo.metaDescription || post.excerpt;

  const keywords = Array.isArray(post.seo.keywords) 
    ? post.seo.keywords 
    : [post.seo.keywords];

  return {
    title: `${post.title} | Saraiva Vision`,
    description: metaDescription,
    keywords: keywords.join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.seo.ogImage || post.image],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.seo.ogImage || post.image],
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = blogPosts.find((p: BlogPost) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  const readingTime = ('readingTime' in post ? post.readingTime : undefined) || Math.ceil((post.content?.length || 1000) / 1000);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <main className="py-24 md:py-32">
        <div className="container mx-auto px-4 max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link href="/blog" className="hover:text-blue-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-semibold truncate max-w-xs" title={post.title}>
                {post.title}
              </li>
            </ol>
          </nav>

          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md border-2 border-white/50 hover:bg-white/80 shadow-lg hover:shadow-xl transition-all rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o blog
            </Link>
          </div>

          <article className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {post.image && (
              <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
                <Image
                  src={post.image}
                  alt={`${post.title} - Saraiva Vision`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
                  <div className="max-w-4xl">
                    <div className="mb-4">
                      <span className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        {post.category}
                      </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-6 leading-tight">
                      {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-white">
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
                        <User className="w-4 h-4" />
                        <span className="font-semibold text-sm">{post.author}</span>
                      </div>

                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={post.date} className="font-medium text-sm">
                          {formatDate(post.date)}
                        </time>
                      </div>

                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium text-sm">{String(readingTime)} min de leitura</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-8 md:p-12 lg:p-16 max-w-4xl mx-auto">
              <div
                className="prose prose-lg lg:prose-xl max-w-none
                         prose-headings:font-bold prose-headings:text-gray-900
                         prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                         prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                         prose-p:text-lg prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                         prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                         prose-strong:text-gray-900
                         prose-ul:my-6 prose-ul:space-y-3
                         prose-ol:my-6 prose-ol:space-y-3
                         prose-li:text-gray-700
                         prose-img:rounded-lg prose-img:shadow-lg
                         prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6"
                dangerouslySetInnerHTML={{ __html: post.content as string }}
              />

              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tags Relacionadas</h3>
                  <div className="flex flex-wrap gap-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-200 hover:border-blue-400 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-12 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Gostou? Compartilhe este artigo!
                </h3>
              </div>
            </div>
          </article>

          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Ver todos os posts
            </Link>
          </div>
        </div>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            headline: post.title,
            description: post.excerpt,
            image: post.image,
            datePublished: post.date,
            dateModified: ('updatedAt' in post ? post.updatedAt : undefined) || post.date,
            author: {
              '@type': 'Person',
              name: post.author,
              jobTitle: 'Oftalmologista',
            },
            publisher: {
              '@type': 'MedicalOrganization',
              name: 'Saraiva Vision',
              logo: {
                '@type': 'ImageObject',
                url: 'https://saraivavision.com.br/logo.png',
              },
            },
          }),
        }}
      />
    </div>
  );
}
