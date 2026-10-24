'use client';

import Image from 'next/image';
import { FormEvent, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { Servico } from '@/types';
import { PageHeader, LoadingState, ErrorMessage } from '@/components/Layout';
import { formatDate, formatDateLong, tipoPecaLabel, toIsoDate } from '@/utils/format';

function periodoPadrao() {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  return { inicio: toIsoDate(inicio), fim: toIsoDate(hoje) };
}

function agruparPorDia(servicos: Servico[]) {
  const map = new Map<string, Servico[]>();
  for (const s of servicos) {
    const dia = String(s.dataServico).slice(0, 10);
    if (!map.has(dia)) map.set(dia, []);
    map.get(dia)!.push(s);
  }
  return Array.from(map.entries()).map(([data, itens]) => ({ data, itens }));
}

export default function RelatoriosPage() {
  const padrao = periodoPadrao();
  const [dataInicio, setDataInicio] = useState(padrao.inicio);
  const [dataFim, setDataFim] = useState(padrao.fim);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [gerado, setGerado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [baixandoPdf, setBaixandoPdf] = useState(false);
  const [error, setError] = useState('');

  const dias = useMemo(() => agruparPorDia(servicos), [servicos]);

  const resumo = useMemo(() => {
    const totalPecas = servicos.reduce((s, i) => s + Number(i.quantidade), 0);
    return { totalPecas, totalLancamentos: servicos.length, totalDias: dias.length };
  }, [servicos, dias]);

  async function gerar(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.set('dataInicio', dataInicio);
      if (dataFim) params.set('dataFim', dataFim);
      setServicos(await api<Servico[]>(`/relatorio-operacional?${params}`));
      setGerado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }

  async function baixarPdf() {
    setBaixandoPdf(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.set('dataInicio', dataInicio);
      if (dataFim) params.set('dataFim', dataFim);
      const res = await fetch(`/api/relatorio-operacional/pdf?${params}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Erro ao gerar PDF');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-operacional-${dataInicio}-${dataFim}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao baixar PDF');
    } finally {
      setBaixandoPdf(false);
    }
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Relatórios"
        subtitle="Relatório operacional de lançamentos por período — um bloco por dia, como no caderno manual"
      />
      {error && <ErrorMessage message={error} />}

      <form onSubmit={gerar} className="no-print card-section flex flex-wrap items-end gap-4">
        <div><label className="label">Data início</label><input type="date" className="input" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required /></div>
        <div><label className="label">Data fim</label><input type="date" className="input" value={dataFim} onChange={(e) => setDataFim(e.target.value)} required /></div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Gerando...' : 'Gerar relatório'}
        </button>
        {gerado && servicos.length > 0 && (
          <>
            <button type="button" className="btn-secondary" onClick={() => window.print()}>
              Imprimir
            </button>
            <button type="button" className="btn-secondary" onClick={baixarPdf} disabled={baixandoPdf}>
              {baixandoPdf ? 'Baixando...' : 'Baixar PDF'}
            </button>
          </>
        )}
      </form>

      {loading ? <LoadingState /> : gerado && (
        <div className="print-document card max-w-4xl mx-auto p-8 md:p-10">
          <header className="flex items-start justify-between gap-6 border-b border-stelus-secondary/40 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <Image src="/logo-stelus-icon-dark.png" alt="Stelus" width={48} height={48} className="h-12 w-12" />
              <div>
                <h2 className="text-lg font-semibold text-stelus-primary tracking-wide">STELU&apos;S</h2>
                <p className="text-xs text-stelus-primary/70 uppercase tracking-widest">Bordados Computadorizados</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-stelus-primary">Relatório operacional</p>
              <p className="text-stelus-primary/70 mt-1">
                Período: {formatDate(dataInicio)} a {formatDate(dataFim)}
              </p>
              <p className="text-xs text-stelus-primary/50 mt-1">
                Emitido em {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </header>

          {servicos.length === 0 ? (
            <p className="text-stelus-primary/60 text-center py-12">Nenhum lançamento no período selecionado.</p>
          ) : (
            <div className="space-y-8">
              {dias.map(({ data, itens }) => {
                const qtdDia = itens.reduce((s, i) => s + Number(i.quantidade), 0);
                return (
                  <section key={data} className="print-day-block">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-px flex-1 bg-stelus-secondary/40" />
                      <h3 className="text-sm font-semibold text-stelus-primary whitespace-nowrap px-2">
                        {formatDateLong(data)}
                      </h3>
                      <div className="h-px flex-1 bg-stelus-secondary/40" />
                    </div>

                    <div className="overflow-x-auto border border-stelus-secondary/30 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-stelus-cream/60 text-stelus-primary">
                          <tr>
                            <th className="text-left p-3 font-medium">Cliente</th>
                            <th className="text-left p-3 font-medium">Matriz</th>
                            <th className="text-left p-3 font-medium">Parte</th>
                            <th className="text-left p-3 font-medium">Tipo</th>
                            <th className="text-right p-3 font-medium">Qtd</th>
                            <th className="text-left p-3 font-medium">Funcionário</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itens.map((s) => (
                            <tr key={s.id} className="border-t border-stelus-secondary/20">
                              <td className="p-3">{s.cliente?.nome}</td>
                              <td className="p-3">{s.matriz?.nome}</td>
                              <td className="p-3">{s.partePeca?.nome}</td>
                              <td className="p-3">{tipoPecaLabel(s.tipoPeca)}</td>
                              <td className="p-3 text-right tabular-nums">{s.quantidade}</td>
                              <td className="p-3">{s.usuario?.nome}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-stelus-cream/30 border-t border-stelus-secondary/30">
                            <td colSpan={4} className="p-3 text-xs font-medium text-stelus-primary/70">
                              Total do dia
                            </td>
                            <td className="p-3 text-right font-semibold text-stelus-primary tabular-nums">{qtdDia}</td>
                            <td className="p-3 text-xs text-stelus-primary/60">
                              {itens.length} lançamento{itens.length !== 1 ? 's' : ''}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </section>
                );
              })}

              <footer className="border-t border-stelus-secondary/40 pt-5 mt-10">
                <p className="text-sm font-semibold text-stelus-primary">
                  Resumo do período: {resumo.totalLancamentos} lançamento{resumo.totalLancamentos !== 1 ? 's' : ''}
                  {' · '}{resumo.totalPecas.toLocaleString('pt-BR')} peça{resumo.totalPecas !== 1 ? 's' : ''}
                  {' · '}{resumo.totalDias} dia{resumo.totalDias !== 1 ? 's' : ''}
                </p>
              </footer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
