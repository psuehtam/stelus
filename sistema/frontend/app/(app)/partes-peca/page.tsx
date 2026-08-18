'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { PartePeca } from '@/types';
import { PageHeader, LoadingState, ErrorMessage } from '@/components/Layout';
import { cn } from '@/utils/format';

export default function PartesPecaPage() {
  const [partes, setPartes] = useState<PartePeca[]>([]);
  const [nome, setNome] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setPartes(await api<PartePeca[]>('/partes-peca'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function cancelar() {
    setEditId(null);
    setNome('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await api(`/partes-peca/${editId}`, { method: 'PUT', body: JSON.stringify({ nome, ativo: true }) });
      } else {
        await api('/partes-peca', { method: 'POST', body: JSON.stringify({ nome }) });
      }
      cancelar();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  }

  function editar(p: PartePeca) {
    setEditId(p.id);
    setNome(p.nome);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function excluir(p: PartePeca) {
    if (!confirm(`Excluir a parte "${p.nome}"? Ela deixa de aparecer nos lançamentos.`)) return;
    setError('');
    try {
      await api(`/partes-peca/${p.id}`, { method: 'DELETE' });
      if (editId === p.id) cancelar();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Partes da peça"
        subtitle="Onde o bordado é aplicado — Peito, Manga, Gola, etc. (usado nos lançamentos)"
      />
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="card-section flex flex-wrap items-end gap-4">
        <div className="min-w-[200px] flex-1">
          <label className="label" htmlFor="parte-nome">Nome da parte</label>
          <input
            id="parte-nome"
            className="input"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Peito, Manga, Gola..."
            required
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-primary">{editId ? 'Atualizar' : 'Cadastrar'}</button>
          {editId && <button type="button" className="btn-secondary" onClick={cancelar}>Cancelar</button>}
        </div>
      </form>

      {loading ? <LoadingState /> : (
        <div className="table-wrap overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th className="text-right w-36">Ações</th>
              </tr>
            </thead>
            <tbody>
              {partes.length === 0 ? (
                <tr>
                  <td colSpan={2} className="table-empty">
                    Nenhuma parte cadastrada. Cadastre Peito, Manga, Gola, etc.
                  </td>
                </tr>
              ) : partes.map((p) => (
                <tr key={p.id} className={cn(editId === p.id && 'bg-stelus-cream/40')}>
                  <td className="font-medium">{p.nome}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" className="btn-link text-xs" onClick={() => editar(p)}>Editar</button>
                      <button type="button" className="btn-danger" onClick={() => excluir(p)}>Excluir</button>
                    </div>
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
