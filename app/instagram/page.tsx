import { Metadata } from 'next';
import InstagramFeed from '@/components/InstagramFeed';

export const metadata: Metadata = {
  title: 'Instagram | Saraiva Vision',
  description: 'Acompanhe nossas novidades e dicas de saúde ocular no Instagram.',
};

export default function InstagramPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nosso Instagram
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Fique por dentro das novidades, dicas de saúde ocular e conteúdos exclusivos
            da Saraiva Vision. Siga-nos para não perder nenhuma atualização!
          </p>
        </div>

        <InstagramFeed 
          maxPosts={8} 
          layout="grid" 
          showCaption={true}
          showStats={false}
        />
      </div>
    </main>
  );
}
