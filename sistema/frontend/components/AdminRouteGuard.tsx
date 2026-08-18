'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/Layout';

const ADMIN_PREFIXES = [
  '/dashboard',
  '/clientes',
  '/matrizes',
  '/partes-peca',
  '/precos',
  '/fechamentos',
  '/pagamentos',
  '/relatorios',
  '/usuarios',
  '/configuracoes',
];

function isAdminRoute(pathname: string) {
  return ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (!isAdmin && isAdminRoute(pathname)) {
      router.replace('/servicos');
    }
  }, [loading, user, isAdmin, pathname, router]);

  if (loading) return <LoadingState fullScreen />;
  if (!user) return null;
  if (!isAdmin && isAdminRoute(pathname)) return null;

  return <>{children}</>;
}
