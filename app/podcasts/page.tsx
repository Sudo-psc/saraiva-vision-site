import { Metadata } from 'next';
import PodcastPlayer from '@/components/PodcastPlayer';
import { Badge } from '@/components/ui/Badge';
import { podcastEpisodes, getPodcastCategories } from '@/src/data/podcastEpisodes';
import type { PodcastEpisode, PodcastPlayerEpisode } from '@/types/podcast';
import { Grid, List, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Podcasts | Saraiva Vision - Saúde Ocular e Oftalmologia',
  description:
    'Ouça os podcasts do Dr. Philipe Saraiva sobre saúde ocular, cirurgias, doenças dos olhos e prevenção. Conteúdo educativo e confiável sobre oftalmologia em Caratinga, MG.',
  keywords:
    'podcast oftalmologia, podcast saúde ocular, Dr. Philipe Saraiva, podcast médico, catarata, glaucoma, cirurgia refrativa, Caratinga MG',
};

function convertToPodcastPlayerEpisode(episode: PodcastEpisode): PodcastPlayerEpisode {
  return {
    title: episode.title,
    description: episode.description,
    formattedDuration: episode.duration,
    publishedAt: episode.date,
    embedUrl: `https://open.spotify.com/embed/episode/${episode.spotifyEpisodeId}`,
    spotifyUrl: episode.spotifyUrl,
    imageUrl: episode.cover
  };
}

export default function PodcastsPage() {
  const sortedEpisodes = [...podcastEpisodes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const featuredEpisodes = sortedEpisodes.filter(ep => ep.featured);
  const categories = getPodcastCategories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <main className="py-24 md:py-32">
        <div className="container mx-auto px-[7%]">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Podcasts Saraiva Vision
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium">
              Conteúdo educativo sobre saúde ocular, cirurgias, doenças dos olhos e
              prevenção. Apresentado pelo Dr. Philipe Saraiva.
            </p>
          </header>

          <div className="mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors">
                Todos
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 bg-white text-gray-700 rounded-full border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors font-medium"
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="Visualizar em grade"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                className="p-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                aria-label="Visualizar em lista"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar episódios..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Buscar episódios de podcast"
              />
            </div>
          </div>

          {featuredEpisodes.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-8 bg-blue-600 rounded-full" />
                Episódios em Destaque
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featuredEpisodes.map((episode) => (
                  <div key={episode.id}>
                    <PodcastPlayer
                      episode={convertToPodcastPlayerEpisode(episode)}
                      showPlayer={true}
                      compact={false}
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {episode.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-blue-600 rounded-full" />
              Todos os Episódios
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedEpisodes.map((episode) => (
                <div key={episode.id}>
                  <PodcastPlayer
                    episode={convertToPodcastPlayerEpisode(episode)}
                    showPlayer={true}
                    compact={false}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {episode.category}
                    </Badge>
                    {episode.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {sortedEpisodes.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500">
                Nenhum episódio encontrado. Novos episódios em breve!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
