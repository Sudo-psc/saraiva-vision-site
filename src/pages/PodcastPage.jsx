import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LatestEpisodes from '@/components/LatestEpisodes';

function PodcastPage() {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Podcast Saraiva Vision | Saúde ocular em áudio</title>
        <meta name="description" content="Episódios sobre cuidados com a visão, prevenção e tratamentos oftalmológicos com o Dr. Saraiva." />
      </Helmet>
      <Navbar />
      <main className="pt-28 md:pt-36">
        <LatestEpisodes />
      </main>
      <Footer />
    </div>
  );
}

export default PodcastPage;

