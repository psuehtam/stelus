'use client';

import { cn } from '@/utils/format';

export interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current]);
  for (let d = -1; d <= 1; d += 1) {
    const p = current + d;
    if (p >= 1 && p <= total) pages.add(p);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('…');
    out.push(sorted[i]);
  }
  return out;
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1 && total <= pageSize) return null;

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const nums = pageNumbers(page, totalPages);

  const navBtn = 'rounded-lg border border-stelus-secondary/35 px-3 py-1.5 text-sm font-medium text-stelus-primary shadow-sm transition hover:bg-stelus-cream/35 disabled:pointer-events-none disabled:opacity-40';

  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-t border-gray-100 bg-gray-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-xs text-gray-600 sm:text-sm">
        {total === 0
          ? 'Nenhum registro'
          : `Mostrando ${from.toLocaleString('pt-BR')}–${to.toLocaleString('pt-BR')} de ${total.toLocaleString('pt-BR')}`}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" className={navBtn} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Anterior
        </button>
        {nums.map((n, i) =>
          n === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-gray-400">…</span>
          ) : (
            <button
              key={n}
              type="button"
              className={cn(
                'min-w-[2.25rem] rounded-lg border px-2 py-1.5 text-sm font-medium transition shadow-sm',
                n === page
                  ? 'border-stelus-primary bg-stelus-primary text-white'
                  : 'border-stelus-secondary/35 text-stelus-primary hover:bg-stelus-cream/35',
              )}
              onClick={() => onPageChange(n)}
            >
              {n}
            </button>
          ),
        )}
        <button type="button" className={navBtn} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Próxima
        </button>
      </div>
    </div>
  );
}
