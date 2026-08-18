'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader, LoadingState, ErrorMessage } from '@/components/Layout';
import { categoriaLabel, formatCurrency, formatDate, tipoPecaLabel } from '@/utils/format';

interface Preco {
  id: number;
  tipoPeca: string;
  categoria: string;
  valorPorMil: number;
  vigenteDesde: string;
}

const emptyForm = {
  tipoPeca: 'aberta',
  categoria: 'producao',
  valorPorMil: '',
  vigenteDesde: new Date().toISOString().slice(0, 10),
};

export default function PrecosPage() {
  const [precos, setPrecos] = useState<Preco[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setPrecos(await api<Preco[]>('/precos'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const payload = { ...form, valorPorMil: Number(form.valorPorMil) };
    try {
      if (editId) {
        await api(`/precos/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/precos', { method: 'POST', body: JSON.stringify(payload) });
      }
      setForm(emptyForm);
      setEditId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  }

  function editar(p: Preco) {
    setEditId(p.id);
    setForm({
      tipoPeca: p.tipoPeca,
      categoria: p.categoria,
      valorPorMil: String(p.valorPorMil),
      vigenteDesde: String(p.vigenteDesde).slice(0, 10),
    });
  }

  function cancelar() {
    setEditId(null);
    setForm(emptyForm);
  }

  return (
    <div className="page-shell">
      <PageHeader title="Tabela de Preços" subtitle="Valores por mil pontos por tipo de peça e categoria" />
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="card-section grid grid-cols-1 items-end gap-4 md:grid-cols-5">
        <div>
          <label className="label">Tipo peça</label>
          <select className="input" value={form.tipoPeca} onChange={(e) => setForm({ ...form, tipoPeca: e.target.value })}>
            <option value="aberta">Aberta</option>
            <option value="fechada">Fechada</option>
          </select>
        </div>
        <div>
          <label className="label">Categoria</label>
          <select className="input" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
            <option value="producao">Produção</option>
            <option value="nao_producao">Não produção</option>
          </select>
        </div>
        <div>
          <label className="label">Valor / mil (R$)</label>
          <input type="number" step="0.01" min="0.01" className="input" value={form.valorPorMil} onChange={(e) => setForm({ ...form, valorPorMil: e.target.value })} required />
        </div>
        <div>
          <label className="label">Vigente desde</label>
          <input type="date" className="input" value={form.vigenteDesde} onChange={(e) => setForm({ ...form, vigenteDesde: e.target.value })} required />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">{editId ? 'Atualizar' : 'Adicionar'}</button>
          {editId && <button type="button" className="btn-secondary" onClick={cancelar}>Cancelar</button>}
        </div>
      </form>

      {loading ? <LoadingState /> : (
        <div className="table-wrap overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Categoria</th>
                <th className="text-right">R$/mil</th>
                <th>Vigente desde</th>
                <th className="text-right w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {precos.length === 0 ? (
                <tr><td colSpan={5} className="table-empty">Nenhum preço cadastrado.</td></tr>
              ) : precos.map((p) => (
                <tr key={p.id} className={editId === p.id ? 'bg-stelus-cream/40' : undefined}>
                  <td>{tipoPecaLabel(p.tipoPeca)}</td>
                  <td>{categoriaLabel(p.categoria)}</td>
                  <td className="text-right tabular-nums">{formatCurrency(Number(p.valorPorMil))}</td>
                  <td>{formatDate(p.vigenteDesde)}</td>
                  <td className="text-right">
                    <button type="button" className="btn-link text-xs" onClick={() => editar(p)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
