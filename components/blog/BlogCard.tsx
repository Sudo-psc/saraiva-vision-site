'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { BlogPost } from '@/types/blog';

interface BlogCardProps {
  post: BlogPost;
  priority?: boolean;
}

export default function BlogCard({ post, priority = false }: BlogCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM, yyyy', { locale: ptBR });
    } catch {
      return format(new Date(), 'dd MMMM, yyyy', { locale: ptBR });
    }
  };

  const readingTime = post.readingTime || Math.ceil((post.content?.length || 1000) / 1000);

  return (
    <article className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl min-h-[420px] flex flex-col">
      {post.image && (
        <Link href={`/blog/${post.slug}`} className="relative h-48 overflow-hidden block">
          <Image
            src={post.image}
            alt={`Imagem ilustrativa: ${post.title}`}
            fill
            className="object-cover object-center transition-transform duration-300 hover:scale-105"
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </Link>
      )}

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {post.category}
          </span>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDate(post.date)}</span>
          </div>
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold mb-3 text-slate-900 line-clamp-3 hover:text-blue-600 transition-colors">
            {post.title}
          </h3>
        </Link>

        <p className="text-slate-600 mb-4 line-clamp-5 leading-relaxed flex-grow">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>{readingTime} min de leitura</span>
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            Ler mais →
          </Link>
        </div>
      </div>
    </article>
  );
}
