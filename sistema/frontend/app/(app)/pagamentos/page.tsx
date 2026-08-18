'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Fechamento } from '@/types';
import { PageHeader, LoadingState, ErrorMessage } from '@/components/Layout';
import { formatCurrency, formatDate, statusLabel } from '@/utils/format';

export default function PagamentosPage() {
  const [fechamentos, setFechamentos] = useState<Fechamento[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({ valorPago: '', dataPagamento: new Date().toISOString().slice(0, 10), formaPagamento: 'PIX', observacao: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await api<Fechamento[]>('/fechamentos?status=confirmado');
      setFechamentos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function registrar(e: FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    try {
      await api(`/fechamentos/${selectedId}/pagamentos`, {
        method: 'POST',
        body: JSON.stringify({ ...form, valorPago: Number(form.valorPago) }),
      });
      setSelectedId(null);
      setForm({ valorPago: '', dataPagamento: new Date().toISOString().slice(0, 10), formaPagamento: 'PIX', observacao: '' });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro');
    }
  }

  const selected = fechamentos.find((f) => f.id === selectedId);

  return (
    <div className="page-shell">
      <PageHeader title="Pagamentos" subtitle="Baixa financeira de fechamentos confirmados" />
      {error && <ErrorMessage message={error} />}

      {loading ? <LoadingState /> : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="table-wrap overflow-x-auto">
            <h2 className="border-b border-gray-100 px-5 py-4 font-semibold text-stelus-primary">Aguardando pagamento</h2>
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Saldo</th>
                  <th className="text-right w-24">Ações</th>
                </tr>
              </thead>
              <tbody>
                {fechamentos.length === 0 ? (
                  <tr><td colSpan={4} className="table-empty">Nenhum fechamento pendente</td></tr>
                ) : fechamentos.map((f) => (
                  <tr key={f.id}>
                    <td>{f.cliente?.nome}</td>
                    <td className="text-right tabular-nums">{formatCurrency(Number(f.valorTotal))}</td>
                    <td className="text-right font-medium tabular-nums">{formatCurrency(f.saldo ?? Number(f.valorTotal))}</td>
                    <td className="text-right">
                      <button type="button" className="btn-link text-xs" onClick={() => {
                        setSelectedId(f.id);
                        setForm((prev) => ({ ...prev, valorPago: String(f.saldo ?? f.valorTotal) }));
                      }}>
                        Baixar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <form onSubmit={registrar} className="card-section">
              <h2 className="font-semibold text-stelus-primary mb-4">
                Registrar pagamento — {selected.cliente?.nome}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Fechamento #{selected.id} · {formatDate(selected.periodoInicio)} a {formatDate(selected.periodoFim)}
              </p>
              <div className="space-y-4">
                <div><label className="label">Valor pago</label><input type="number" step="0.01" className="input" value={form.valorPago} onChange={(e) => setForm({ ...form, valorPago: e.target.value })} required /></div>
                <div><label className="label">Data</label><input type="date" className="input" value={form.dataPagamento} onChange={(e) => setForm({ ...form, dataPagamento: e.target.value })} required /></div>
                <div><label className="label">Forma</label><input className="input" value={form.formaPagamento} onChange={(e) => setForm({ ...form, formaPagamento: e.target.value })} /></div>
                <div><label className="label">Observação</label><input className="input" value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} /></div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">Confirmar baixa</button>
                  <button type="button" className="btn-secondary" onClick={() => setSelectedId(null)}>Cancelar</button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
