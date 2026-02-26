'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/finance');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse text-orange-500">Loading...</div>
    </div>
  );
}
