'use client';

import { useEffect, useState } from 'react';
import HomePageLayout from '@/pages/HomePageLayout.jsx';
import CheckPage from '@/pages/CheckPage.jsx';

export default function Page() {
  const [isCheck, setIsCheck] = useState(false);

  useEffect(() => {
    const host = window.location.hostname?.toLowerCase() ?? '';
    setIsCheck(host.startsWith('check.'));
  }, []);

  if (isCheck) {
    return <CheckPage />;
  }

  return <HomePageLayout />;
}
