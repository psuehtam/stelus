'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, clearAuth, getStoredUser, setAuth } from '@/lib/api';
import type { Usuario } from '@/types';

interface AuthContextValue {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser<Usuario>();
    if (!stored) {
      setLoading(false);
      return;
    }
    api<Usuario>('/auth/me')
      .then(setUser)
      .catch(() => clearAuth())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, senha: string) {
    const data = await api<{ token: string; usuario: Usuario }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    setAuth(data.token, data.usuario);
    setUser(data.usuario);
  }

  function logout() {
    clearAuth();
    setUser(null);
    window.location.href = '/login';
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
