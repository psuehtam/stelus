'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { Matriz, PaginatedResult } from '@/types';
import { cn } from '@/utils/format';

export interface MatrizResumo {
  id: number;
  nome: string;
  referencia?: string;
  qtdPontos: number;
}

export interface MatrizSearchFieldProps {
  value: string;
  selected?: MatrizResumo | null;
  onChange: (matrizId: string, matriz: Matriz | null) => void;
  required?: boolean;
  className?: string;
}

function labelMatriz(m: Pick<Matriz, 'nome' | 'referencia' | 'qtdPontos'>) {
  const cod = m.referencia ? `${m.referencia} · ` : '';
  return `${cod}${m.nome} (${m.qtdPontos.toLocaleString('pt-BR')} pts)`;
}

export function MatrizSearchField({
  value,
  selected,
  onChange,
  required,
  className,
}: MatrizSearchFieldProps) {
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<Matriz[]>([]);
  const [loading, setLoading] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [destaque, setDestaque] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const matrizAtual = selected ?? resultados.find((m) => String(m.id) === value) ?? null;

  useEffect(() => {
    if (!busca.trim()) {
      setResultados([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: '1', limit: '20', q: busca.trim() });
        const data = await api<PaginatedResult<Matriz>>(`/matrizes?${params}`);
        if (!cancelled) {
          setResultados(data.items);
          setDestaque(0);
          setAberto(true);
        }
      } catch {
        if (!cancelled) setResultados([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [busca]);

  useEffect(() => {
    function fora(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', fora);
    return () => document.removeEventListener('mousedown', fora);
  }, []);

  function selecionar(m: Matriz) {
    onChange(String(m.id), m);
    setBusca('');
    setResultados([]);
    setAberto(false);
  }

  function limpar() {
    onChange('', null);
    setBusca('');
    setResultados([]);
    setAberto(false);
  }

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      {matrizAtual && !aberto ? (
        <div className="input flex min-h-[42px] items-center justify-between gap-3 py-2">
          <span className="truncate text-sm" title={labelMatriz(matrizAtual)}>
            {labelMatriz(matrizAtual)}
          </span>
          <button type="button" className="btn-link shrink-0 text-xs" onClick={limpar}>
            Trocar
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            className="input pr-10"
            placeholder="Nome, código ou pontos..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              if (!e.target.value) onChange('', null);
            }}
            onFocus={() => { if (resultados.length) setAberto(true); }}
            onKeyDown={(e) => {
              if (!aberto || resultados.length === 0) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setDestaque((i) => Math.min(i + 1, resultados.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setDestaque((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                selecionar(resultados[destaque]);
              } else if (e.key === 'Escape') {
                setAberto(false);
              }
            }}
            required={required && !value}
          />
          {loading && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-stelus-secondary/30 border-t-stelus-primary" />
            </span>
          )}
        </div>
      )}

      {aberto && busca.trim() && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-stelus-secondary/30 bg-white shadow-md">
          <div className="max-h-60 overflow-y-auto">
            {resultados.length === 0 && !loading && (
              <p className="px-4 py-3 text-sm text-gray-500">Nenhuma matriz encontrada</p>
            )}
            {resultados.map((m, i) => (
              <button
                key={m.id}
                type="button"
                className={cn(
                  'w-full border-b border-gray-50 px-4 py-3 text-left text-sm transition last:border-b-0 hover:bg-stelus-cream/25',
                  i === destaque && 'bg-stelus-cream/40',
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selecionar(m)}
              >
                <div className="truncate font-medium text-gray-900">{m.nome}</div>
                <div className="mt-0.5 text-xs text-gray-500">
                  {m.referencia && <span className="mr-2 font-mono">{m.referencia}</span>}
                  {m.qtdPontos.toLocaleString('pt-BR')} pts
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <input type="hidden" value={value} required={required} readOnly />
    </div>
  );
}
