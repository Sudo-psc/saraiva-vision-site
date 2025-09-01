import React from 'react';
import { ArrowRight, Play, Star, Calendar, Clock } from 'lucide-react';
import { 
  MedicalCard, 
  InteractiveCarousel,
  PodcastEpisodeCard 
} from '@/components/ui';

/**
 * Example implementation of unified component interfaces
 * Demonstrates various use cases and configurations
 */
const UnifiedComponentsExample = () => {
  // Example service data
  const exampleServices = [
    {
      id: 'consultation-1',
      title: 'Consulta Oftalmológica',
      description: 'Avaliação completa da saúde ocular com equipamentos modernos.',
      icon: '👁️',
      category: 'Consultas'
    },
    {
      id: 'exam-1', 
      title: 'Exames Diagnósticos',
      description: 'Exames precisos para diagnóstico precoce de doenças oculares.',
      icon: '🔍',
      category: 'Exames'
    },
    {
      id: 'surgery-1',
      title: 'Cirurgias Especializadas', 
      description: 'Procedimentos cirúrgicos com tecnologia de última geração.',
      icon: '⚕️',
      category: 'Cirurgias'
    }
  ];

  // Example podcast episodes
  const exampleEpisodes = [
    {
      id: 'episode-1',
      title: 'Glaucoma: Prevenção e Tratamento',
      description: 'Tudo que você precisa saber sobre glaucoma e como prevenir.',
      cover: '/podcast-covers/glaucoma.jpg',
      duration: '15:30',
      date: '2024-01-15',
      category: 'Doenças Oculares',
      tags: ['glaucoma', 'prevenção'],
      featured: true,
      spotifyUrl: 'https://spotify.com/episode/1'
    },
    {
      id: 'episode-2',
      title: 'Catarata: Sintomas e Cirurgia',
      description: 'Quando é a hora certa para a cirurgia de catarata?',
      cover: '/podcast-covers/catarata.jpg', 
      duration: '12:45',
      date: '2024-01-10',
      category: 'Cirurgias',
      tags: ['catarata', 'cirurgia'],
      featured: false,
      spotifyUrl: 'https://spotify.com/episode/2'
    }
  ];

  // Example testimonials
  const exampleTestimonials = [
    {
      id: 'testimonial-1',
      author: 'Maria Silva',
      role: 'Paciente',
      content: 'Excelente atendimento e profissionalismo. Recomendo!'
    },
    {
      id: 'testimonial-2', 
      author: 'João Santos',
      role: 'Paciente',
      content: 'Clínica moderna com equipamentos de última geração.'
    }
  ];

  // Render service card
  const renderServiceCard = (service, index) => (
    <MedicalCard
      key={service.id}
      variant="service"
      size="standard"
      glassMorphism
      shadow3D
      interactive
      clickable
      hoverEffects="pronounced"
      cfmCompliant
      
      media={{
        type: 'icon',
        src: service.icon,
        alt: service.title,
        aspectRatio: '1:1'
      }}
      
      header={
        <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mb-2">
          {service.category}
        </div>
      }
      
      body={
        <>
          <h3 className="text-xl font-semibold mb-3 text-slate-800">
            {service.title}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            {service.description}
          </p>
        </>
      }
      
      actions={[
        {
          label: 'Saiba Mais',
          variant: 'secondary',
          href: `/servico/${service.id}`,
          icon: <ArrowRight className="w-4 h-4" />
        }
      ]}
      
      animationDelay={index * 0.1}
      motionPreset="entrance"
      stagger
    />
  );

  // Render testimonial card
  const renderTestimonialCard = (testimonial, index) => (
    <MedicalCard
      key={testimonial.id}
      variant="testimonial"
      size="standard"
      hoverEffects="subtle"
      
      header={
        <div className="flex items-center gap-2 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-lg">
              {testimonial.author.charAt(0)}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
            <p className="text-sm text-gray-500">{testimonial.role}</p>
          </div>
        </div>
      }
      
      body={
        <blockquote className="text-gray-700 italic">
          "{testimonial.content}"
        </blockquote>
      }
      
      footer={
        <div className="flex items-center gap-1 text-yellow-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-current" />
          ))}
        </div>
      }
      
      animationDelay={index * 0.15}
      motionPreset="entrance"
    />
  );

  // Handle episode play
  const handleEpisodePlay = (episode) => {
    console.log('Playing episode:', episode.title);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-16">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Unified Component Interfaces Example
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Demonstration of the new unified component system with MedicalCard, 
          InteractiveCarousel, and specialized components.
        </p>
      </div>

      {/* Services Carousel Example */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Services Carousel
        </h2>
        
        <InteractiveCarousel
          items={exampleServices}
          renderItem={renderServiceCard}
          keyExtractor={(service) => service.id}
          
          gap={24}
          cardWidth="responsive"
          minWidth={280}
          maxWidth={350}
          
          dragToScroll
          wheelToScroll 
          showArrows
          showIndicators
          fadeEdges
          
          aria-label="Serviços médicos disponíveis"
          announceChanges
          respectReducedMotion
        />
      </section>

      {/* Featured Episode Card Example */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Featured Episode Card
        </h2>
        
        <div className="max-w-2xl mx-auto">
          <MedicalCard
            variant="episode"
            size="featured"
            glassMorphism
            gradient="medical"
            borderRadius="3xl"
            interactive
            clickable
            hoverEffects="pronounced"
            
            media={{
              type: 'image',
              src: exampleEpisodes[0].cover,
              alt: exampleEpisodes[0].title,
              aspectRatio: '16:9'
            }}
            
            header={
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {exampleEpisodes[0].category}
                </span>
                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Em Destaque
                </div>
              </div>
            }
            
            body={
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {exampleEpisodes[0].title}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {exampleEpisodes[0].description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(exampleEpisodes[0].date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{exampleEpisodes[0].duration}</span>
                  </div>
                </div>
              </>
            }
            
            actions={[
              {
                label: 'Reproduzir Agora',
                variant: 'primary',
                onClick: () => handleEpisodePlay(exampleEpisodes[0]),
                icon: <Play className="w-5 h-5" />
              },
              {
                label: 'Ouvir no Spotify',
                variant: 'outline', 
                href: exampleEpisodes[0].spotifyUrl,
                external: true,
                icon: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.54 0-.36.179-.66.479-.78 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02v-.12h.002z"/>
                  </svg>
                )
              }
            ]}
            
            motionPreset="entrance"
          />
        </div>
      </section>

      {/* Episode Grid using PodcastEpisodeCard */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Episode Cards Grid
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exampleEpisodes.map((episode, index) => (
            <PodcastEpisodeCard
              key={episode.id}
              episode={episode}
              index={index}
              onPlay={handleEpisodePlay}
              onClick={() => handleEpisodePlay(episode)}
            />
          ))}
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Testimonials Carousel
        </h2>
        
        <InteractiveCarousel
          items={exampleTestimonials}
          renderItem={renderTestimonialCard}
          keyExtractor={(testimonial) => testimonial.id}
          
          gap={32}
          cardWidth="responsive"
          minWidth={320}
          maxWidth={400}
          
          dragToScroll
          showArrows
          showIndicators={false}
          arrowPosition="overlay"
          
          aria-label="Depoimentos de pacientes"
          respectReducedMotion
        />
      </section>

      {/* Usage Notes */}
      <section className="bg-slate-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Implementation Benefits
        </h2>
        
        <ul className="space-y-3 text-slate-700">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <span><strong>Unified Interface:</strong> All cards use the same BaseCardProps interface for consistency</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
            <span><strong>Medical Compliance:</strong> Built-in CFM and LGPD compliance options</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
            <span><strong>Accessibility First:</strong> WCAG 2.1 AA compliance with screen reader support</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
            <span><strong>Performance Optimized:</strong> Lazy loading, virtual scrolling, and motion reduction</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
            <span><strong>Interactive Features:</strong> Drag scrolling, keyboard navigation, and touch gestures</span>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default UnifiedComponentsExample;