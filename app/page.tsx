import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileSelector from '@/components/ProfileSelector';

export const metadata = {
  title: 'Saraiva Vision - Escolha Seu Perfil',
  description: 'Sistema oftalmológico personalizado para famílias, jovens e seniores',
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const profileCookie = cookieStore.get('profile');

  if (profileCookie?.value) {
    const validProfiles = ['familiar', 'jovem', 'senior'];
    if (validProfiles.includes(profileCookie.value)) {
      redirect(`/${profileCookie.value}`);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bem-vindo à Saraiva Vision
          </h1>
          <p className="text-xl text-gray-600">
            Escolha a experiência personalizada para você
          </p>
        </div>
        <ProfileSelector />
      </main>
    </div>
  );
}
