'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader, LoadingState, ErrorMessage } from '@/components/Layout';

interface Config {
  nomeEmpresa: string;
  razaoSocial?: string;
  cnpj?: string;
  inscricaoEstadual?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  pix?: string;
  favorecido?: string;
  mensagemCobranca?: string;
  prazoPagamento?: string;
  rodapeDocumento?: string;
}

function formatCep(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<Config>({ nomeEmpresa: 'Stelus Bordados' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<Config>('/config')
      .then((c) => setConfig({
        ...c,
        cep: c.cep ? formatCep(c.cep) : '',
      }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      await api('/config', { method: 'PUT', body: JSON.stringify(config) });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro');
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="page-shell">
      <PageHeader title="Configurações" subtitle="Dados da empresa para documentos de cobrança" />
      {error && <ErrorMessage message={error} />}
      {saved && <div className="alert-success">Configurações salvas!</div>}

      <form onSubmit={handleSubmit} className="card-section max-w-4xl space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-stelus-primary mb-3">Dados da empresa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label">Nome da empresa</label><input className="input" value={config.nomeEmpresa} onChange={(e) => setConfig({ ...config, nomeEmpresa: e.target.value })} required /></div>
            <div><label className="label">Razão social</label><input className="input" value={config.razaoSocial ?? ''} onChange={(e) => setConfig({ ...config, razaoSocial: e.target.value })} /></div>
            <div><label className="label">CNPJ</label><input className="input" value={config.cnpj ?? ''} onChange={(e) => setConfig({ ...config, cnpj: e.target.value })} /></div>
            <div><label className="label">Inscrição estadual</label><input className="input" value={config.inscricaoEstadual ?? ''} onChange={(e) => setConfig({ ...config, inscricaoEstadual: e.target.value })} /></div>
            <div><label className="label">Telefone</label><input className="input" value={config.telefone ?? ''} onChange={(e) => setConfig({ ...config, telefone: e.target.value })} /></div>
            <div><label className="label">E-mail</label><input className="input" value={config.email ?? ''} onChange={(e) => setConfig({ ...config, email: e.target.value })} /></div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-stelus-primary mb-1">Endereço da empresa</h3>
          <p className="text-xs text-stelus-primary/60 mb-3">Aparece no cabeçalho do PDF (CEP, cidade e UF).</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Logradouro</label>
              <input className="input" value={config.endereco ?? ''} onChange={(e) => setConfig({ ...config, endereco: e.target.value })} />
            </div>
            <div>
              <label className="label">Número</label>
              <input className="input" value={config.numero ?? ''} onChange={(e) => setConfig({ ...config, numero: e.target.value })} />
            </div>
            <div>
              <label className="label">Bairro</label>
              <input className="input" value={config.bairro ?? ''} onChange={(e) => setConfig({ ...config, bairro: e.target.value })} />
            </div>
            <div>
              <label className="label">Cidade</label>
              <input className="input" value={config.cidade ?? ''} onChange={(e) => setConfig({ ...config, cidade: e.target.value })} />
            </div>
            <div>
              <label className="label">UF</label>
              <input className="input" maxLength={2} value={config.estado ?? ''} onChange={(e) => setConfig({ ...config, estado: e.target.value.toUpperCase() })} />
            </div>
            <div>
              <label className="label">CEP</label>
              <input
                className="input"
                value={config.cep ?? ''}
                onChange={(e) => setConfig({ ...config, cep: formatCep(e.target.value) })}
                placeholder="00000-000"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-stelus-primary mb-3">Dados bancários</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label">Banco</label><input className="input" value={config.banco ?? ''} onChange={(e) => setConfig({ ...config, banco: e.target.value })} /></div>
            <div><label className="label">Agência</label><input className="input" value={config.agencia ?? ''} onChange={(e) => setConfig({ ...config, agencia: e.target.value })} /></div>
            <div><label className="label">Conta</label><input className="input" value={config.conta ?? ''} onChange={(e) => setConfig({ ...config, conta: e.target.value })} /></div>
            <div><label className="label">PIX</label><input className="input" value={config.pix ?? ''} onChange={(e) => setConfig({ ...config, pix: e.target.value })} /></div>
            <div className="md:col-span-2"><label className="label">Favorecido</label><input className="input" value={config.favorecido ?? ''} onChange={(e) => setConfig({ ...config, favorecido: e.target.value })} /></div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-stelus-primary mb-3">Documentos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="label">Mensagem de cobrança</label><textarea className="input" rows={2} value={config.mensagemCobranca ?? ''} onChange={(e) => setConfig({ ...config, mensagemCobranca: e.target.value })} /></div>
            <div><label className="label">Prazo de pagamento</label><input className="input" value={config.prazoPagamento ?? ''} onChange={(e) => setConfig({ ...config, prazoPagamento: e.target.value })} /></div>
            <div><label className="label">Rodapé</label><input className="input" value={config.rodapeDocumento ?? ''} onChange={(e) => setConfig({ ...config, rodapeDocumento: e.target.value })} placeholder="Pontos, Fios & Amor." /></div>
          </div>
        </div>

        <button type="submit" className="btn-primary">Salvar configurações</button>
      </form>
    </div>
  );
}
