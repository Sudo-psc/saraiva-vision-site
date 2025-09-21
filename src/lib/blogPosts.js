import { clinicInfo } from './clinicInfo';

/**
 * @typedef {object} Translation
 * @property {string} title - The translated title of the blog post.
 * @property {string} excerpt - A short, translated summary of the blog post.
 * @property {string} content - The full, translated HTML content of the blog post.
 */

/**
 * @typedef {object} BlogPost
 * @property {number} id - The unique identifier for the blog post.
 * @property {string} slug - The URL-friendly slug for the blog post.
 * @property {string} date - The publication date in YYYY-MM-DD format.
 * @property {string} image - The URL for the blog post's feature image.
 * @property {string} author - The name of the author.
 * @property {{pt: Translation, en: Translation}} translations - An object containing the Portuguese and English translations.
 */

/**
 * An array of static blog post data for the website.
 * @type {BlogPost[]}
 */
const blogPosts = [
  {
    id: 1,
    slug: 'exame-de-visao-em-caratinga',
    date: '2024-06-01',
    image: 'https://images.unsplash.com/photo-1583484378394-23e2f5905a75?auto=format&fit=crop&w=600&q=80',
    author: 'Dr. Philipe Saraiva',
    translations: {
      pt: {
        title: 'Exame de Visão em Caratinga: Onde Fazer e Quando Agendar',
        excerpt: 'Descubra onde realizar exame de vista em Caratinga e quando é o momento ideal para agendar sua consulta.',
          content: `<p>Manter a saúde ocular em dia é essencial para quem vive em Caratinga. Na <strong>${clinicInfo.name}</strong>, utilizamos equipamentos modernos para garantir diagnósticos precisos.</p>
<img src="https://images.unsplash.com/photo-1551886754-55a4801b4f32?auto=format&fit=crop&w=800&q=80" alt="Paciente realizando exame de visão" class="rounded-lg my-6" />
<p>Recomenda-se que adultos façam um exame de visão a cada dois anos, ou anualmente se já usam lentes ou possuem histórico familiar de doenças oculares. Crianças devem ser avaliadas ao entrar na escola e sempre que apresentarem sinais de dificuldade.</p>
<h2>Quando procurar um oftalmologista</h2>
<p>Visão embaçada, dores de cabeça frequentes, sensibilidade à luz e dificuldade para focar de perto ou de longe são sinais de que está na hora de consultar um especialista. Mesmo sem sintomas, avaliações regulares ajudam a identificar problemas antes que se agravem.</p>
<h2>Onde realizar seu exame</h2>
<p>A <strong>${clinicInfo.name}</strong> está localizada em Caratinga e conta com profissionais especializados e tecnologia de ponta. Nossa equipe orienta cada paciente de forma personalizada, garantindo conforto e segurança durante todo o processo.</p>
<h2>Dicas de prevenção</h2>
<p>Utilize óculos de sol com proteção UV e faça pausas regulares durante o uso de telas para reduzir o cansaço visual. Pequenas mudanças de hábito preservam sua visão a longo prazo.</p>
<p>Agende seu exame de vista pelo WhatsApp ou telefone e cuide melhor da sua visão.</p>`
      },
      en: {
        title: 'Eye Exam in Caratinga: Where to Go and When to Schedule',
        excerpt: 'Find out where to get an eye exam in Caratinga and the best time to schedule your appointment.',
          content: `<p>Keeping your eyes healthy is essential, especially in Caratinga. At <strong>${clinicInfo.name}</strong>, we use modern equipment to ensure precise diagnoses.</p>
<img src="https://images.unsplash.com/photo-1551886754-55a4801b4f32?auto=format&fit=crop&w=800&q=80" alt="Patient undergoing eye examination" class="rounded-lg my-6" />
<p>Adults should schedule an eye exam every two years, or annually if they already wear lenses or have a family history of eye disease. Children need an evaluation when starting school and whenever they show signs of difficulty.</p>
<h2>When to see an ophthalmologist</h2>
<p>Blurred vision, frequent headaches, light sensitivity and trouble focusing up close or at a distance signal it's time for a checkup. Even without symptoms, regular exams help detect issues before they worsen.</p>
<h2>Where to get your exam</h2>
<p><strong>${clinicInfo.name}</strong> is located in Caratinga and offers specialized professionals and state-of-the-art technology. Our team provides personalized guidance to ensure comfort and safety throughout the process.</p>
<h2>Prevention tips</h2>
<p>Wear UV-protective sunglasses and take regular breaks from screens to reduce eye strain. Small habits make a big difference over time.</p>
<p>Book your eye exam via WhatsApp or phone and take better care of your vision.</p>`
      }
    }
  },
  {
    id: 2,
    slug: 'lentes-de-contato-caratinga',
    date: '2024-06-10',
    image: 'https://images.unsplash.com/photo-1589561084283-930aa7b1c1f0?auto=format&fit=crop&w=600&q=80',
    author: 'Equipe Saraiva Vision',
    translations: {
      pt: {
        title: 'Lentes de Contato em Caratinga: Guia Completo para Iniciantes',
        excerpt: 'Veja como escolher e cuidar das lentes de contato em Caratinga com dicas dos nossos especialistas.',
          content: `<p>As lentes de contato são uma alternativa prática aos óculos para os moradores de Caratinga. Elas proporcionam liberdade para praticar esportes e garantem um campo de visão mais amplo.</p>
<img src="https://images.unsplash.com/photo-1606312619284-c26c6a61dcd5?auto=format&fit=crop&w=800&q=80" alt="Estojo com lentes de contato" class="rounded-lg my-6" />
<p>Existem lentes diárias, mensais e rígidas, cada uma indicada para necessidades diferentes. Nossos especialistas avaliam qual modelo se adapta melhor ao seu estilo de vida.</p>
<h2>Cuidados essenciais</h2>
<p>Lavar as mãos antes de manusear as lentes, usar solução adequada e respeitar o tempo de uso são passos fundamentais para evitar infecções. Nunca durma com as lentes sem orientação médica.</p>
<h2>Higiene e armazenamento</h2>
<p>Sempre utilize estojo limpo e solução nova para guardar suas lentes. Evite contato com água da torneira e substitua o estojo a cada três meses.</p>
<h2>Acompanhamento profissional</h2>
<p>Na <strong>${clinicInfo.name}</strong>, acompanhamos o período de adaptação e realizamos revisões periódicas para garantir saúde e conforto ocular. Em caso de desconforto ou vermelhidão, procure atendimento imediatamente.</p>
<p>Entre em contato e descubra se as lentes de contato são a melhor opção para você.</p>`
      },
      en: {
        title: 'Contact Lenses in Caratinga: A Beginner\'s Guide',
        excerpt: 'Learn how to choose and care for contact lenses in Caratinga with tips from our specialists.',
          content: `<p>Contact lenses are a practical alternative to glasses for residents of Caratinga. They offer freedom for sports and provide a wider field of view.</p>
<img src="https://images.unsplash.com/photo-1606312619284-c26c6a61dcd5?auto=format&fit=crop&w=800&q=80" alt="Contact lens case" class="rounded-lg my-6" />
<p>There are daily, monthly and rigid lenses, each recommended for different needs. Our specialists evaluate which model best fits your lifestyle.</p>
<h2>Essential care</h2>
<p>Wash your hands before handling lenses, use the proper solution and respect the recommended wearing time to avoid infections. Never sleep with lenses without medical guidance.</p>
<h2>Hygiene and storage</h2>
<p>Always use a clean case and fresh solution to store your lenses. Avoid tap water contact and replace the case every three months.</p>
<h2>Professional follow-up</h2>
<p>At <strong>${clinicInfo.name}</strong>, we monitor the adaptation period and schedule regular checkups to ensure eye health and comfort. If you experience discomfort or redness, seek care immediately.</p>
<p>Contact us and find out if contact lenses are the best option for you.</p>`
      }
    }
  }
];

export default blogPosts;
