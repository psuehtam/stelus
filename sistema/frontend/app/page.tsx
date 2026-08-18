'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? (user.perfil === 'admin' ? '/dashboard' : '/servicos') : '/login');
  }, [user, loading, router]);

  return null;
}
