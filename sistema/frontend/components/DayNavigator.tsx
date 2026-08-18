import { cn, formatDateLong, toIsoDate, addDays, isToday, isFutureDay } from '@/utils/format';

interface DayNavigatorProps {
  value: string;
  onChange: (isoDate: string) => void;
  label?: string;
  className?: string;
}

export function DayNavigator({ value, onChange, label = 'Dia', className }: DayNavigatorProps) {
  const podeAvancar = !isFutureDay(addDays(value, 1));

  function ir(dias: number) {
    onChange(addDays(value, dias));
  }

  return (
    <div className={cn('min-w-[240px]', className)}>
      {label && <label className="label">{label}</label>}
      <div className="flex items-center gap-2 rounded-xl border border-stelus-secondary/40 bg-white px-2 py-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => ir(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-stelus-cream/60 text-stelus-primary font-bold transition"
          aria-label="Dia anterior"
        >
          ‹
        </button>

        <div className="flex-1 text-center px-1">
          <div className="text-sm font-semibold text-stelus-primary leading-tight">
            {formatDateLong(value)}
          </div>
          {isToday(value) ? (
            <span className="text-[10px] uppercase tracking-wide text-stelus-tan font-medium">Hoje</span>
          ) : (
            <button
              type="button"
              onClick={() => onChange(toIsoDate(new Date()))}
              className="text-[10px] text-stelus-primary/70 hover:underline"
            >
              Voltar para hoje
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => ir(1)}
          disabled={!podeAvancar}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-stelus-cream/60 text-stelus-primary font-bold transition disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Próximo dia"
        >
          ›
        </button>
      </div>
    </div>
  );
}
