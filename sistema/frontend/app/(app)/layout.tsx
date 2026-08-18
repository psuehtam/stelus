'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppShell, LoadingState } from '@/components/Layout';
import { AdminRouteGuard } from '@/components/AdminRouteGuard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading) return <LoadingState fullScreen />;
  if (!user) return null;

  return (
    <AdminRouteGuard>
      <AppShell>{children}</AppShell>
    </AdminRouteGuard>
  );
}
