'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorMessage, LoadingState } from '@/components/Layout';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@stelus.com.br');
  const [senha, setSenha] = useState('admin123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    router.replace(user.perfil === 'admin' ? '/dashboard' : '/servicos');
  }

  if (loading) return <LoadingState fullScreen label="Verificando sessão..." />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, senha);
      router.push(email.includes('admin') ? '/dashboard' : '/servicos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="hidden flex-col justify-center bg-black px-10 py-16 text-white shadow-xl lg:flex lg:w-[46%] lg:px-16 xl:px-20">
        <Image
          src="/logo-stelus-white.png"
          alt="Stelus Bordados Computadorizados"
          width={280}
          height={320}
          className="mb-8 h-auto w-full max-w-[280px]"
          priority
        />
        <p className="text-lg italic text-stelus-secondary">Pontos, Fios & Amor.</p>
        <p className="mt-8 max-w-md text-sm leading-relaxed text-white/75">
          Sistema interno de gestão de serviços de bordado, precificação, fechamentos e controle financeiro.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-stelus-cream/25 via-white to-stelus-cream/10 p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="card w-full max-w-md p-6 shadow-md sm:p-8">
          <div className="mb-6 flex justify-center lg:hidden">
            <Image src="/logo-stelus-icon-dark.png" alt="Stelus" width={56} height={56} className="h-14 w-14" priority />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-stelus-primary">Entrar</h1>
          <p className="mt-1.5 text-sm text-gray-600">Acesse com seu e-mail corporativo</p>

          {error && <div className="mt-5"><ErrorMessage message={error} /></div>}

          <div className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">E-mail</label>
              <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label className="label" htmlFor="senha">Senha</label>
              <input id="senha" type="password" className="input" value={senha} onChange={(e) => setSenha(e.target.value)} required autoComplete="current-password" />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Demo: admin@stelus.com.br / admin123
          </p>
        </form>
      </div>
    </div>
  );
}
