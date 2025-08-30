import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mic2, ArrowRight, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioPlayer from '@/components/AudioPlayer';

const EXTERNAL_PODCAST_URL = 'https://shorturl.at/X0S4m';

const LatestEpisodes = () => {
  const { t } = useTranslation();

  const episodes = [
    {
      id: 'glaucoma-ep1',
      src: 'https://cdn1.genspark.ai/user-upload-image/8/eaa7521e-e00b-41e0-a643-713c5f83a601.mp3',
      title: t('podcast.episodes.glaucoma.title'),
      duration: '12:30',
      cover:
        'https://cdn1.genspark.ai/user-upload-image/gpt_image_generated/17f1077e-d5c3-4c43-bda8-638546161372',
      spotifyUrl: 'https://open.spotify.com/episode/glaucoma',
      applePodcastsUrl: 'https://podcasts.apple.com/episode/glaucoma'
    },
    {
      id: 'catarata-ep1',
      src: 'https://cdn1.genspark.ai/user-upload-image/8/eaa7521e-e00b-41e0-a643-713c5f83a601.mp3',
      title: t('podcast.episodes.catarata.title'),
      duration: '09:15',
      cover:
        'https://cdn1.genspark.ai/user-upload-image/gpt_image_generated/f3c89a93-0a0f-4ec3-a04a-4f02475f1bbf',
      spotifyUrl: 'https://open.spotify.com/episode/catarata',
      applePodcastsUrl: 'https://podcasts.apple.com/episode/catarata'
    },
    {
      id: 'ptergio-ep1',
      src: 'https://cdn1.genspark.ai/user-upload-image/8/eaa7521e-e00b-41e0-a643-713c5f83a601.mp3',
      title: t('podcast.episodes.ptergio.title'),
      duration: '07:45',
      cover:
        'https://cdn1.genspark.ai/user-upload-image/gpt_image_generated/6f77913a-77a4-4ddc-a2f1-aa1a0a7f6300',
      spotifyUrl: 'https://open.spotify.com/episode/ptergio',
      applePodcastsUrl: 'https://podcasts.apple.com/episode/ptergio'
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/8 to-purple-400/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Curved Top Divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-16 transform rotate-180"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F5F9FC" stopOpacity="1" />
              <stop offset="50%" stopColor="#EBF4FF" stopOpacity="1" />
              <stop offset="100%" stopColor="#F5F9FC" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="url(#waveGradient)"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 mb-6"
          >
            <Mic2 className="w-4 h-4" />
            <span className="text-sm font-semibold">{t('podcast')}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
          >
            {t('podcast.title')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            {t('podcast.subtitle')}
          </motion.p>
        </div>

        {/* Mini playlist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {episodes.map((episode) => (
            <AudioPlayer key={episode.id} episode={episode} className="h-full" />
          ))}
        </motion.div>

        {/* CTA para mais podcasts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <a href={EXTERNAL_PODCAST_URL} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              variant="outline"
              className="bg-white/70 backdrop-blur-sm border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white gap-2 px-8 py-3"
            >
              <Headphones className="w-5 h-5" />
              {t('podcast.more_episodes')}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
        </motion.div>
      </div>

      {/* Curved Bottom Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-16"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradientBottom" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="50%" stopColor="#F8FAFC" stopOpacity="1" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="url(#waveGradientBottom)"
          />
        </svg>
      </div>
    </section>
  );
};

export default LatestEpisodes;

