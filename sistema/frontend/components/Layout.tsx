'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils/format';

export interface NavItem {
  href: string;
  label: string;
  adminOnly?: boolean;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export interface ErrorMessageProps {
  message: string;
}

export interface LoadingStateProps {
  label?: string;
  fullScreen?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', adminOnly: true },
  { href: '/servicos', label: 'Lançamentos' },
  { href: '/clientes', label: 'Clientes', adminOnly: true },
  { href: '/matrizes', label: 'Matrizes', adminOnly: true },
  { href: '/partes-peca', label: 'Partes da peça', adminOnly: true },
  { href: '/precos', label: 'Preços', adminOnly: true },
  { href: '/fechamentos', label: 'Fechamentos', adminOnly: true },
  { href: '/pagamentos', label: 'Pagamentos', adminOnly: true },
  { href: '/relatorios', label: 'Relatórios', adminOnly: true },
  { href: '/usuarios', label: 'Usuários', adminOnly: true },
  { href: '/configuracoes', label: 'Configurações', adminOnly: true },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  return (
    <>
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-stelus-icon-white.png"
            alt="Stelus"
            width={40}
            height={40}
            className="shrink-0"
          />
          <div className="min-w-0">
            <div className="text-sm font-bold leading-tight tracking-tight">STELU&apos;S</div>
            <div className="text-[10px] leading-snug text-stelus-cream/90">Bordados Computadorizados</div>
          </div>
        </div>
        <p className="mt-3 text-[10px] italic text-stelus-secondary">Pontos, Fios & Amor.</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'block rounded-lg px-3 py-2.5 text-sm transition',
                  active
                    ? 'bg-white/15 font-semibold text-white shadow-sm'
                    : 'text-white/85 hover:bg-white/10 hover:text-white',
                )}
              >
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="border-t border-white/10 p-4 text-sm">
        <div className="truncate font-medium">{user?.nome}</div>
        <div className="mt-0.5 text-xs capitalize text-stelus-secondary">{user?.perfil}</div>
        <button
          type="button"
          onClick={logout}
          className="mt-3 text-xs text-stelus-cream transition hover:text-white hover:underline"
        >
          Sair
        </button>
      </div>
    </>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      {/* Desktop */}
      <aside className="no-print hidden w-64 shrink-0 flex-col bg-stelus-primary text-white shadow-lg lg:flex min-h-screen">
        <SidebarNav />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="no-print fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'no-print fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-stelus-primary text-white shadow-xl transition-transform duration-300 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarNav onNavigate={onClose} />
      </aside>
    </>
  );
}

export function MobileTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="no-print sticky top-0 z-30 flex items-center gap-3 border-b border-stelus-secondary/20 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
      <button
        type="button"
        aria-label="Abrir menu"
        onClick={onMenuClick}
        className="rounded-lg border border-stelus-secondary/30 p-2 text-stelus-primary transition hover:bg-stelus-cream/30"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <Image
        src="/logo-stelus-icon-dark.png"
        alt="Stelus"
        width={36}
        height={36}
        className="shrink-0"
      />
      <div className="min-w-0">
        <div className="truncate text-sm font-bold text-stelus-primary">STELU&apos;S</div>
        <div className="truncate text-[10px] text-gray-500">Gestão de Bordados</div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-stelus-surface">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="page-shell">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="no-print mb-2 flex flex-col gap-4 sm:mb-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-stelus-primary sm:text-3xl">{title}</h1>
        {subtitle && (
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-gray-600">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Carregando...', fullScreen = false }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-stelus-primary',
        fullScreen ? 'min-h-screen' : 'py-20',
      )}
    >
      <span className="spinner" aria-hidden />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="alert-error" role="alert">
      {message}
    </div>
  );
}
