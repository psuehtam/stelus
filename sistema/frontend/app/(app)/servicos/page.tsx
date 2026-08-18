'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Cliente, Matriz, PartePeca, Servico } from '@/types';
import { PageHeader, LoadingState, ErrorMessage } from '@/components/Layout';
import { MatrizSearchField } from '@/components/MatrizSearchField';
import { ClienteSearchField } from '@/components/ClienteSearchField';
import { DayNavigator } from '@/components/DayNavigator';
import { formatDate, tipoPecaLabel, toIsoDate } from '@/utils/format';

const emptyForm = () => ({
  clienteId: '',
  matrizId: '',
  partePecaId: '',
  tipoPeca: 'aberta',
  quantidade: '',
  dataServico: toIsoDate(new Date()),
});

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [partes, setPartes] = useState<PartePeca[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Pick<Cliente, 'id' | 'nome' | 'cidade' | 'estado'> | null>(null);
  const [matrizSelecionada, setMatrizSelecionada] = useState<Pick<Matriz, 'id' | 'nome' | 'referencia' | 'qtdPontos'> | null>(null);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroClienteSelecionado, setFiltroClienteSelecionado] = useState<Pick<Cliente, 'id' | 'nome' | 'cidade' | 'estado'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [diaFiltro, setDiaFiltro] = useState(() => toIsoDate(new Date()));
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());

  async function load(dia = diaFiltro) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroCliente) params.set('clienteId', filtroCliente);
      params.set('dataInicio', dia);
      params.set('dataFim', dia);

      const [s, p] = await Promise.all([
        api<Servico[]>(`/servicos?${params}`),
        api<PartePeca[]>('/partes-peca'),
      ]);
      setServicos(s);
      setPartes(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filtroCliente, diaFiltro]);

  function cancelarEdicao() {
    setEditId(null);
    setForm(emptyForm());
    setMatrizSelecionada(null);
    setClienteSelecionado(null);
  }

  function editar(s: Servico) {
    setEditId(s.id);
    setForm({
      clienteId: String(s.clienteId),
      matrizId: String(s.matrizId),
      partePecaId: String(s.partePecaId),
      tipoPeca: s.tipoPeca,
      quantidade: String(s.quantidade),
      dataServico: String(s.dataServico).slice(0, 10),
    });
    setClienteSelecionado(
      s.cliente
        ? { id: s.cliente.id, nome: s.cliente.nome }
        : null,
    );
    setMatrizSelecionada(
      s.matriz
        ? { id: s.matriz.id, nome: s.matriz.nome, qtdPontos: s.matriz.qtdPontos }
        : null,
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const payload = {
      clienteId: Number(form.clienteId),
      matrizId: Number(form.matrizId),
      partePecaId: Number(form.partePecaId),
      tipoPeca: form.tipoPeca,
      quantidade: Number(form.quantidade),
      dataServico: form.dataServico,
    };
    try {
      if (editId) {
        await api(`/servicos/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
        cancelarEdicao();
      } else {
        await api('/servicos', { method: 'POST', body: JSON.stringify(payload) });
        setForm((f) => ({ ...f, quantidade: '', matrizId: '' }));
        setMatrizSelecionada(null);
      }
      if (form.dataServico !== diaFiltro) {
        setDiaFiltro(form.dataServico);
      } else {
        load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este lançamento?')) return;
    setError('');
    try {
      await api(`/servicos/${id}`, { method: 'DELETE' });
      if (editId === id) cancelarEdicao();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Lançamentos"
        subtitle="Registro diário de serviços — edite ou exclua apenas itens ainda não fechados"
      />

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className={`card-section grid grid-cols-1 items-end gap-4 md:grid-cols-3 lg:grid-cols-6 ${editId ? 'ring-2 ring-stelus-primary/25' : ''}`}>
        {editId && (
          <div className="md:col-span-3 lg:col-span-6 text-sm font-medium text-stelus-primary">
            Editando lançamento #{editId}
          </div>
        )}
        <div>
          <label className="label">Cliente</label>
          <ClienteSearchField
            value={form.clienteId}
            selected={clienteSelecionado}
            onChange={(clienteId, cliente) => {
              setForm({ ...form, clienteId });
              setClienteSelecionado(cliente);
            }}
            required
          />
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          <label className="label">Matriz</label>
          <MatrizSearchField
            value={form.matrizId}
            selected={matrizSelecionada}
            onChange={(matrizId, matriz) => {
              setForm({ ...form, matrizId });
              setMatrizSelecionada(matriz);
            }}
            required
          />
        </div>
        <div>
          <label className="label">Parte da peça</label>
          <select className="input" value={form.partePecaId} onChange={(e) => setForm({ ...form, partePecaId: e.target.value })} required>
            <option value="">Selecione</option>
            {partes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Tipo</label>
          <select className="input" value={form.tipoPeca} onChange={(e) => setForm({ ...form, tipoPeca: e.target.value })}>
            <option value="aberta">Aberta</option>
            <option value="fechada">Fechada</option>
          </select>
        </div>
        <div>
          <label className="label">Quantidade</label>
          <input type="number" min="1" className="input" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} required />
        </div>
        <div>
          <label className="label">Data</label>
          <input type="date" className="input" value={form.dataServico} onChange={(e) => setForm({ ...form, dataServico: e.target.value })} required />
        </div>
        <div className="md:col-span-3 lg:col-span-6 flex flex-wrap gap-2">
          <button type="submit" className="btn-primary">
            {editId ? 'Salvar alterações' : 'Registrar lançamento'}
          </button>
          {editId && (
            <button type="button" className="btn-secondary" onClick={cancelarEdicao}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="card-section flex flex-wrap items-end gap-4">
        <div className="min-w-[220px] flex-1 max-w-sm">
          <label className="label">Filtrar por cliente</label>
          <ClienteSearchField
            value={filtroCliente}
            selected={filtroClienteSelecionado}
            onChange={(clienteId, cliente) => {
              setFiltroCliente(clienteId);
              setFiltroClienteSelecionado(cliente);
            }}
            placeholder="Buscar cliente ou deixe vazio para todos..."
          />
        </div>
        <DayNavigator value={diaFiltro} onChange={setDiaFiltro} label="Consultar dia" className="flex-1 min-w-[280px] max-w-md" />
      </div>

      {loading ? <LoadingState /> : (
        <div className="table-wrap overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Matriz</th>
                <th>Parte</th>
                <th>Tipo</th>
                <th className="text-right">Qtd</th>
                <th>Funcionário</th>
                <th>Status</th>
                <th className="text-right w-28">Ações</th>
              </tr>
            </thead>
            <tbody>
              {servicos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="table-empty">Nenhum lançamento neste dia</td>
                </tr>
              ) : servicos.map((s) => (
                <tr key={s.id} className={editId === s.id ? 'bg-stelus-cream/40' : undefined}>
                  <td>{formatDate(s.dataServico)}</td>
                  <td>{s.cliente?.nome}</td>
                  <td>{s.matriz?.nome}</td>
                  <td>{s.partePeca?.nome}</td>
                  <td>{tipoPecaLabel(s.tipoPeca)}</td>
                  <td className="text-right tabular-nums">{s.quantidade}</td>
                  <td>
                    <div>{s.usuario?.nome}</div>
                    {s.atualizadoPorUsuario && s.atualizadoPorUsuario.id !== s.usuario?.id && (
                      <div className="text-xs text-gray-400">Editado por {s.atualizadoPorUsuario.nome}</div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${s.fechado ? 'badge-fechado' : 'badge-aberto'}`}>
                      {s.fechado ? 'Fechado' : 'Aberto'}
                    </span>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    {!s.fechado && (
                      <div className="flex justify-end gap-2">
                        <button type="button" className="btn-link text-xs" onClick={() => editar(s)}>Editar</button>
                        <button type="button" className="btn-danger" onClick={() => excluir(s.id)}>Excluir</button>
                      </div>
                    )}
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
