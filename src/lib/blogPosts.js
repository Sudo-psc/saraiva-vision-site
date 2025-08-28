import { clinicInfo } from './clinicInfo';

const blogPosts = [
  {
    id: 1,
    slug: 'exame-de-visao-em-caratinga',
    date: '2024-06-01',
    image: 'https://placehold.co/600x400?text=Caratinga',
    author: 'Dr. Philipe Saraiva',
    translations: {
      pt: {
        title: 'Exame de Visão em Caratinga: Onde Fazer e Quando Agendar',
        excerpt: 'Descubra onde realizar exame de vista em Caratinga e quando é o momento ideal para agendar sua consulta.',
        content: `<p>Manter a saúde ocular em dia é essencial para quem vive em Caratinga. Na <strong>${clinicInfo.name}</strong>, utilizamos equipamentos modernos para garantir diagnósticos precisos. Agende seu exame de vista e cuide melhor dos seus olhos.</p>`
      },
      en: {
        title: 'Eye Exam in Caratinga: Where to Go and When to Schedule',
        excerpt: 'Find out where to get an eye exam in Caratinga and the best time to schedule your appointment.',
        content: `<p>Keeping your eyes healthy is essential, especially in Caratinga. At <strong>${clinicInfo.name}</strong>, we use modern equipment to ensure precise diagnoses. Book your eye exam and take better care of your vision.</p>`
      }
    }
  },
  {
    id: 2,
    slug: 'lentes-de-contato-caratinga',
    date: '2024-06-10',
    image: 'https://placehold.co/600x400?text=Lentes',
    author: 'Equipe Saraiva Vision',
    translations: {
      pt: {
        title: 'Lentes de Contato em Caratinga: Guia Completo para Iniciantes',
        excerpt: 'Veja como escolher e cuidar das lentes de contato em Caratinga com dicas dos nossos especialistas.',
        content: `<p>As lentes de contato são uma alternativa prática aos óculos para os moradores de Caratinga. Nossa equipe orienta sobre higienização, adaptação e acompanhamento para garantir conforto e segurança.</p>`
      },
      en: {
        title: 'Contact Lenses in Caratinga: A Beginner\'s Guide',
        excerpt: 'Learn how to choose and care for contact lenses in Caratinga with tips from our specialists.',
        content: `<p>Contact lenses are a practical alternative to glasses for residents of Caratinga. Our team guides you on hygiene, adaptation and follow-up to ensure comfort and safety.</p>`
      }
    }
  }
];

export default blogPosts;
