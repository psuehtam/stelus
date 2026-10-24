'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import type { Usuario } from '@/types';

interface AuthContextValue {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Usuario>('/auth/me', { skipAuthRedirect: true })
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, senha: string) {
    const data = await api<{ usuario: Usuario }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
      skipAuthRedirect: true,
    });
    setUser(data.usuario);
    return data.usuario;
  }

  function logout() {
    void api('/auth/logout', { method: 'POST', skipAuthRedirect: true }).finally(() => {
      setUser(null);
      window.location.href = '/login';
    });
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.perfil === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
