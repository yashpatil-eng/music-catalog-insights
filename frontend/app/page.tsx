'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(isAuthenticated ? '/search' : '/login');
  }, [isLoading, isAuthenticated, router]);

  return <div className="py-20 text-center text-slate-400">Loading...</div>;
}
