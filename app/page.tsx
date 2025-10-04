import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import OriginalHomepage from '@/components/OriginalHomepage';

export const metadata = {
  title: 'Saraiva Vision - Clínica Oftalmológica em Caratinga',
  description: 'Clínica oftalmológica especializada em Caratinga, MG. Tratamentos completos com tecnologia de ponta para toda a família.',
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const profileCookie = cookieStore.get('profile');

  // If user has a profile preference, redirect to it
  if (profileCookie?.value) {
    const validProfiles = ['familiar', 'jovem', 'senior'];
    if (validProfiles.includes(profileCookie.value)) {
      redirect(`/${profileCookie.value}`);
    }
  }

  // If no profile preference, show the original homepage
  return <OriginalHomepage />;
}
