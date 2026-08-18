'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Matriz, PaginatedResult } from '@/types';
import { PageHeader, LoadingState, ErrorMessage } from '@/components/Layout';
import { Pagination } from '@/components/Pagination';

const PAGE_SIZE = 25;

export default function MatrizesPage() {
  const [matrizes, setMatrizes] = useState<Matriz[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [busca, setBusca] = useState('');
  const [buscaInput, setBuscaInput] = useState('');
  const [nome, setNome] = useState('');
  const [qtdPontos, setQtdPontos] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editReferencia, setEditReferencia] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchMatrizes() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
        });
        if (busca) params.set('q', busca);

        const data = await api<PaginatedResult<Matriz>>(`/matrizes?${params}`);
        if (cancelled) return;
        setMatrizes(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setError('');
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erro');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMatrizes();
    return () => { cancelled = true; };
  }, [page, busca, refresh]);

  useEffect(() => {
    const t = setTimeout(() => {
      setBusca(buscaInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [buscaInput]);

  function cancelar() {
    setEditId(null);
    setEditReferencia(null);
    setNome('');
    setQtdPontos('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const data = { nome, qtdPontos: Number(qtdPontos) };
    try {
      if (editId) {
        await api(`/matrizes/${editId}`, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        await api('/matrizes', { method: 'POST', body: JSON.stringify(data) });
        setPage(1);
      }
      cancelar();
      setRefresh((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  }

  function editar(m: Matriz) {
    setEditId(m.id);
    setEditReferencia(m.referencia ?? null);
    setNome(m.nome);
    setQtdPontos(String(m.qtdPontos));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function excluir(m: Matriz) {
    if (!confirm(`Excluir a matriz "${m.nome}"? Ela deixa de aparecer nos lançamentos, mas o histórico já fechado é mantido.`)) return;
    setError('');
    try {
      await api(`/matrizes/${m.id}`, { method: 'DELETE' });
      if (editId === m.id) cancelar();
      setRefresh((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  return (
    <div className="page-shell">
      <PageHeader title="Matrizes" subtitle="Cadastro de matrizes — o código de referência é gerado automaticamente" />
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="card-section flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[180px]">
          <label className="label">Nome</label>
          <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        {editId && (
          <div className="w-44">
            <label className="label">Código</label>
            <input
              className="input bg-stelus-cream/30 font-mono text-xs"
              value={editReferencia ?? 'Será gerado ao salvar'}
              readOnly
            />
          </div>
        )}
        {!editId && (
          <div className="w-44">
            <label className="label">Código</label>
            <p className="input bg-stelus-cream/20 text-xs text-stelus-primary/60 flex items-center">
              Gerado ao salvar
            </p>
          </div>
        )}
        <div className="w-32">
          <label className="label">Pontos</label>
          <input type="number" className="input" value={qtdPontos} onChange={(e) => setQtdPontos(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary">{editId ? 'Atualizar' : 'Cadastrar'}</button>
        {editId && <button type="button" className="btn-secondary" onClick={cancelar}>Cancelar</button>}
      </form>

      <div className="card-section flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[220px]">
          <label className="label">Pesquisar</label>
          <input
            className="input"
            placeholder="Nome ou código da matriz..."
            value={buscaInput}
            onChange={(e) => setBuscaInput(e.target.value)}
          />
        </div>
        {busca && (
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => { setBuscaInput(''); setBusca(''); setPage(1); }}
          >
            Limpar
          </button>
        )}
      </div>

      {loading ? <LoadingState /> : (
        <div className="table-wrap overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th className="text-right">Pontos</th>
                <th className="text-right w-32">Ações</th>
              </tr>
            </thead>
            <tbody>
              {matrizes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="table-empty">
                    {busca ? 'Nenhuma matriz encontrada para esta busca.' : 'Nenhuma matriz cadastrada.'}
                  </td>
                </tr>
              ) : matrizes.map((m) => (
                <tr key={m.id}>
                  <td className="font-mono text-xs">{m.referencia ?? '—'}</td>
                  <td>{m.nome}</td>
                  <td className="text-right tabular-nums">{m.qtdPontos.toLocaleString('pt-BR')}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" className="btn-link text-xs" onClick={() => editar(m)}>Editar</button>
                      <button type="button" className="btn-danger" onClick={() => excluir(m)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
