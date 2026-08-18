import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Arredonda valor monetário para 2 casas decimais. */
export function arredondarMoeda(valor: number) {
  return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
}

/** R$/mil com 4 casas — evita unitário “pulando” ao editar (ex.: 1,25 → 1,01). */
export function arredondarValorPorMil(valor: number) {
  return Math.round(Number(valor) * 10000) / 10000;
}

export function formatDate(value: string | Date) {
  const d = typeof value === 'string' && !value.includes('T')
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  return d.toLocaleDateString('pt-BR');
}

export function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

export function isToday(isoDate: string) {
  return isoDate === toIsoDate(new Date());
}

export function isFutureDay(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  const hoje = new Date();
  hoje.setHours(12, 0, 0, 0);
  return d > hoje;
}

export function formatDateLong(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  const raw = d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function categoriaLabel(cat: string) {
  return cat === 'producao' ? 'Produção' : 'Não produção';
}

export function tipoPecaLabel(tipo: string) {
  return tipo === 'aberta' ? 'Aberta' : 'Fechada';
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    confirmado: 'Aguardando pagamento',
    pago: 'Pago',
    previa: 'Prévia',
  };
  return map[status] ?? status;
}
