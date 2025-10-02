import '@/index.css';
import '@/styles/glass-effects.css';
import '@/styles/cta.css';
import '@/styles/cookies.css';
import '@/styles/forms.css';
import Providers from './providers';

export const metadata = {
  title: 'Saraiva Vision - Oftalmologia em Caratinga',
  description: 'Clínica oftalmológica em Caratinga/MG com atendimento especializado em catarata, glaucoma, retina e lentes de contato.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
