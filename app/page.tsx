import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileSelector from '@/components/ProfileSelector';

export default async function HomePage() {
  const cookieStore = await cookies();
  const profileCookie = cookieStore.get('profile');

  // If profile is set, redirect to the profile-specific page
  if (profileCookie?.value) {
    const validProfiles = ['familiar', 'jovem', 'senior'];
    if (validProfiles.includes(profileCookie.value)) {
      redirect(`/${profileCookie.value}`);
    }
  }

  // Otherwise, show profile selector
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-16">
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
