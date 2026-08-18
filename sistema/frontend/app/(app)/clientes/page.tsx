'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Cliente } from '@/types';
import { PageHeader, LoadingState, ErrorMessage } from '@/components/Layout';

const empty = {
  nome: '',
  razaoSocial: '',
  tipoPessoa: 'juridica' as 'fisica' | 'juridica',
  documento: '',
  telefone: '',
  email: '',
  endereco: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  limiteProducao: 50,
};

function formatDocumento(value: string, tipo: 'fisica' | 'juridica') {
  const d = value.replace(/\D/g, '');
  if (tipo === 'fisica' || d.length <= 11) {
    return d
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return d
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const docLabel = form.tipoPessoa === 'fisica' ? 'CPF' : 'CNPJ';

  async function load() {
    setLoading(true);
    try {
      setClientes(await api<Cliente[]>('/clientes?ativo=true'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function cancelar() {
    setEditId(null);
    setForm(empty);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, ativo: true };
      if (editId) {
        await api(`/clientes/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/clientes', { method: 'POST', body: JSON.stringify(payload) });
      }
      cancelar();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  }

  function editar(c: Cliente) {
    setEditId(c.id);
    setForm({
      nome: c.nome,
      razaoSocial: c.razaoSocial ?? '',
      tipoPessoa: c.tipoPessoa ?? 'juridica',
      documento: c.documento ? formatDocumento(c.documento, c.tipoPessoa ?? 'juridica') : '',
      telefone: c.telefone ?? '',
      email: c.email ?? '',
      endereco: c.endereco ?? '',
      numero: c.numero ?? '',
      bairro: c.bairro ?? '',
      cidade: c.cidade ?? '',
      estado: c.estado ?? '',
      cep: c.cep ?? '',
      limiteProducao: c.limiteProducao,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function excluir(c: Cliente) {
    if (!confirm(`Excluir o cliente "${c.nome}"? Ele deixa de aparecer nos cadastros, mas o histórico de lançamentos e fechamentos é mantido.`)) return;
    setError('');
    try {
      await api(`/clientes/${c.id}`, { method: 'DELETE' });
      if (editId === c.id) cancelar();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Clientes"
        subtitle="Cadastro completo do cliente. Apenas o nome é obrigatório; o endereço de cobrança aparece no PDF do pedido."
      />
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="card-section space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-stelus-primary mb-3">Dados gerais</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Nome *</label>
              <input className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </div>
            <div>
              <label className="label">Razão social</label>
              <input className="input" value={form.razaoSocial} onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })} />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select
                className="input"
                value={form.tipoPessoa}
                onChange={(e) => setForm({
                  ...form,
                  tipoPessoa: e.target.value as 'fisica' | 'juridica',
                  documento: '',
                })}
              >
                <option value="juridica">Pessoa jurídica (CNPJ)</option>
                <option value="fisica">Pessoa física (CPF)</option>
              </select>
            </div>
            <div>
              <label className="label">{docLabel}</label>
              <input
                className="input"
                value={form.documento}
                onChange={(e) => setForm({ ...form, documento: formatDocumento(e.target.value, form.tipoPessoa) })}
                placeholder={form.tipoPessoa === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
              />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input className="input" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-stelus-primary mb-1">Endereço de cobrança</h3>
          <p className="text-xs text-stelus-primary/60 mb-3">Usado no PDF do pedido de venda (sem endereço de entrega).</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="label">Logradouro</label>
              <input className="input" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
            </div>
            <div>
              <label className="label">Número</label>
              <input className="input" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
            </div>
            <div>
              <label className="label">Bairro</label>
              <input className="input" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
            </div>
            <div>
              <label className="label">Cidade</label>
              <input className="input" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
            </div>
            <div>
              <label className="label">UF</label>
              <input className="input" maxLength={2} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })} />
            </div>
            <div>
              <label className="label">CEP</label>
              <input className="input" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Limite produção (peças)</label>
            <input type="number" min={1} className="input" value={form.limiteProducao} onChange={(e) => setForm({ ...form, limiteProducao: Number(e.target.value) })} />
            <p className="text-xs text-gray-500 mt-1">No fechamento: ≥ este número → preço produção; abaixo → preço não produção.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary">{editId ? 'Salvar alterações' : 'Cadastrar cliente'}</button>
          {editId && <button type="button" className="btn-secondary" onClick={cancelar}>Cancelar</button>}
        </div>
      </form>

      {loading ? <LoadingState /> : (
        <div className="table-wrap overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Razão social</th>
                <th>Doc.</th>
                <th>Telefone</th>
                <th>Cidade</th>
                <th className="text-right">Limite prod.</th>
                <th className="text-right w-32">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-empty">Nenhum cliente cadastrado.</td>
                </tr>
              ) : clientes.map((c) => (
                <tr key={c.id} className={editId === c.id ? 'bg-stelus-cream/40' : undefined}>
                  <td className="font-medium">{c.nome}</td>
                  <td>{c.razaoSocial ?? '—'}</td>
                  <td className="text-xs">
                    {c.documento
                      ? formatDocumento(c.documento, c.tipoPessoa ?? 'juridica')
                      : '—'}
                  </td>
                  <td>{c.telefone ?? '—'}</td>
                  <td>{c.cidade ? `${c.cidade}${c.estado ? `/${c.estado}` : ''}` : '—'}</td>
                  <td className="text-right">{c.limiteProducao}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" className="btn-link text-xs" onClick={() => editar(c)}>Editar</button>
                      <button type="button" className="btn-danger" onClick={() => excluir(c)}>Excluir</button>
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
