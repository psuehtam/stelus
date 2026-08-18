'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { DashboardData } from '@/types';
import { PageHeader, LoadingState, ErrorMessage } from '@/components/Layout';
import { formatCurrency } from '@/utils/format';

interface KpiCard {
  label: string;
  value: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<DashboardData>('/dashboard')
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;

  const kpis: KpiCard[] = [
    { label: 'Faturamento total', value: formatCurrency(data.faturamentoTotal) },
    { label: 'Faturamento do mês', value: formatCurrency(data.faturamentoMes) },
    { label: 'Valor em aberto', value: formatCurrency(data.valorEmAberto) },
    { label: 'Fechamentos pendentes', value: String(data.fechamentosPendentes) },
  ];

  return (
    <div className="page-shell">
      <PageHeader title="Dashboard" subtitle="Indicadores gerenciais da Stelus" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card) => (
          <div key={card.label} className="card-section card-hover">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{card.label}</div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-stelus-primary">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-section">
          <h2 className="mb-4 font-semibold text-stelus-primary">Ranking por faturamento</h2>
          <ul className="divide-y divide-gray-100">
            {data.rankingClientes.map((c, i) => (
              <li key={c.nome} className="flex justify-between gap-4 py-2.5 text-sm">
                <span className="truncate">{i + 1}. {c.nome}</span>
                <span className="shrink-0 font-medium tabular-nums">{formatCurrency(c.valor)}</span>
              </li>
            ))}
            {data.rankingClientes.length === 0 && (
              <li className="py-6 text-center text-sm text-gray-400">Sem dados</li>
            )}
          </ul>
        </div>

        <div className="card-section">
          <h2 className="mb-4 font-semibold text-stelus-primary">Maior volume de peças</h2>
          <ul className="divide-y divide-gray-100">
            {data.rankingVolume.map((c, i) => (
              <li key={c.nome} className="flex justify-between gap-4 py-2.5 text-sm">
                <span className="truncate">{i + 1}. {c.nome}</span>
                <span className="shrink-0 font-medium tabular-nums">{c.quantidade} peças</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-section">
          <h2 className="mb-4 font-semibold text-stelus-primary">Produção vs. Não produção</h2>
          <div className="flex flex-wrap gap-6 text-sm">
            <div><span className="badge badge-producao mr-2">Produção</span>{data.producaoVsNaoProducao.producao}</div>
            <div><span className="badge badge-nao-producao mr-2">Não produção</span>{data.producaoVsNaoProducao.naoProducao}</div>
          </div>
        </div>

        <div className="card-section">
          <h2 className="mb-4 font-semibold text-stelus-primary">Evolução mensal</h2>
          <ul className="divide-y divide-gray-100">
            {data.evolucaoMensal.map((m) => (
              <li key={m.mes} className="flex justify-between gap-4 py-2.5 text-sm">
                <span>{m.mes}</span>
                <span className="font-medium tabular-nums">{formatCurrency(m.valor)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
