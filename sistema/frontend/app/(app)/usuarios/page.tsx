'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Perfil, Usuario } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, LoadingState, ErrorMessage } from '@/components/Layout';
import { cn } from '@/utils/format';

interface UsuarioRow extends Usuario {
  ativo: boolean;
  criadoEm?: string;
}

const emptyForm = {
  nome: '',
  email: '',
  senha: '',
  perfil: 'funcionario' as Perfil,
  ativo: true,
};

export default function UsuariosPage() {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setUsuarios(await api<UsuarioRow[]>('/auth/usuarios'));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function cancelar() {
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!editId && !form.senha.trim()) {
      setError('Informe uma senha para o novo usuário');
      return;
    }

    try {
      if (editId) {
        const payload: Record<string, unknown> = {
          nome: form.nome,
          email: form.email,
          perfil: form.perfil,
          ativo: form.ativo,
        };
        if (form.senha.trim()) payload.senha = form.senha;
        await api(`/auth/usuarios/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/auth/usuarios', {
          method: 'POST',
          body: JSON.stringify({
            nome: form.nome,
            email: form.email,
            senha: form.senha,
            perfil: form.perfil,
          }),
        });
      }
      cancelar();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  }

  function editar(u: UsuarioRow) {
    setEditId(u.id);
    setForm({
      nome: u.nome,
      email: u.email,
      senha: '',
      perfil: u.perfil,
      ativo: u.ativo,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const editandoProprio = editId === currentUser?.id;

  return (
    <div className="page-shell">
      <PageHeader
        title="Usuários"
        subtitle="Cadastro de administradores e funcionários com acesso ao sistema"
      />
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="card-section space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label" htmlFor="usuario-nome">Nome</label>
            <input
              id="usuario-nome"
              className="input"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="usuario-email">E-mail</label>
            <input
              id="usuario-email"
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="usuario-senha">
              {editId ? 'Nova senha (opcional)' : 'Senha'}
            </label>
            <input
              id="usuario-senha"
              type="password"
              className="input"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              required={!editId}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="label" htmlFor="usuario-perfil">Perfil</label>
            <select
              id="usuario-perfil"
              className="input"
              value={form.perfil}
              onChange={(e) => setForm({ ...form, perfil: e.target.value as Perfil })}
            >
              <option value="funcionario">Funcionário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        {editId && (
          <label className="flex items-center gap-2 text-sm text-stelus-primary">
            <input
              type="checkbox"
              checked={form.ativo}
              disabled={editandoProprio}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
              className="rounded border-stelus-secondary/50"
            />
            Usuário ativo
            {editandoProprio && (
              <span className="text-xs text-gray-500">(não é possível desativar a si mesmo)</span>
            )}
          </label>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-primary">
            {editId ? 'Salvar alterações' : 'Cadastrar usuário'}
          </button>
          {editId && (
            <button type="button" className="btn-secondary" onClick={cancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading ? <LoadingState /> : (
        <div className="table-wrap overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Status</th>
                <th className="text-right w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-empty">Nenhum usuário cadastrado.</td>
                </tr>
              ) : usuarios.map((u) => (
                <tr key={u.id} className={cn(editId === u.id && 'bg-stelus-cream/40')}>
                  <td className="font-medium">
                    {u.nome}
                    {u.id === currentUser?.id && (
                      <span className="ml-2 text-xs text-gray-400">(você)</span>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td className="capitalize">{u.perfil}</td>
                  <td>
                    <span className={`badge ${u.ativo ? 'badge-aberto' : 'badge-fechado'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="text-right">
                    <button type="button" className="btn-link text-xs" onClick={() => editar(u)}>
                      Editar
                    </button>
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
