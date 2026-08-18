'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { Cliente, Fechamento } from '@/types';
import { PageHeader, LoadingState, ErrorMessage } from '@/components/Layout';
import { categoriaLabel, formatCurrency, formatDate, arredondarMoeda, arredondarValorPorMil, statusLabel, tipoPecaLabel } from '@/utils/format';

interface PreviaLinha {
  servicoId: number;
  matrizId: number;
  matrizNome: string;
  qtdPontos: number;
  quantidade: number;
  categoria: string;
  categoriaAutomatica: boolean;
  valorPorMil: number;
  valorPorMilOriginal?: number;
  valorPorMilSalvo?: number | null;
  valorUnitario?: number;
  valorUnitarioOriginal?: number;
  precoManual?: boolean;
  precoSalvo?: boolean;
  origemPreco?: string;
  minimoAplicado?: boolean;
  primeiraVezMatriz?: boolean;
  valorCalculado: number;
  dataServico: string;
  tipoPeca: string;
  partePecaNome: string;
}

interface Previa {
  servicos: PreviaLinha[];
  totaisPorMatriz: { matrizId?: number; matrizNome: string; quantidadeTotal: number; valorTotal: number; categoria: string }[];
  valorTotal: number;
  quantidadeServicos: number;
}

function unitarioParaValorPorMil(qtdPontos: number, unitario: number) {
  const mil = qtdPontos / 1000;
  return mil > 0 ? arredondarValorPorMil(unitario / mil) : arredondarValorPorMil(unitario);
}

function parseUnitarioInput(raw: string) {
  const n = parseFloat(raw.replace(',', '.').trim());
  return Number.isFinite(n) && n >= 0 ? arredondarMoeda(n) : null;
}

export default function FechamentosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fechamentos, setFechamentos] = useState<Fechamento[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [periodoInicio, setPeriodoInicio] = useState('');
  const [periodoFim, setPeriodoFim] = useState('');
  const [previa, setPrevia] = useState<Previa | null>(null);
  const [categoriaOverrides, setCategoriaOverrides] = useState<Record<number, string>>({});
  const [ajustesPreco, setAjustesPreco] = useState<Record<number, number>>({});
  const [ajustesUnitario, setAjustesUnitario] = useState<Record<number, number>>({});
  const [unitarioDraft, setUnitarioDraft] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [recalculando, setRecalculando] = useState(false);
  const [error, setError] = useState('');
  const [confirmando, setConfirmando] = useState(false);

  async function loadFechamentos() {
    setFechamentos(await api<Fechamento[]>('/fechamentos'));
  }

  useEffect(() => {
    Promise.all([
      api<Cliente[]>('/clientes?ativo=true'),
      loadFechamentos(),
    ])
      .then(([c]) => setClientes(c))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function buscarPrevia(
    overrides = categoriaOverrides,
    precos = ajustesPreco,
    unitarios = ajustesUnitario,
  ) {
    const data = await api<Previa>('/fechamentos/previa', {
      method: 'POST',
      body: JSON.stringify({
        clienteId: Number(clienteId),
        periodoInicio,
        periodoFim,
        overrides,
        ajustesPreco: precos,
      }),
    });
    setPrevia(data);

    const novosPrecos: Record<number, number> = {};
    const novosUnitarios: Record<number, number> = {};
    for (const linha of data.servicos) {
      if (precos[linha.servicoId] !== undefined) {
        novosPrecos[linha.servicoId] = precos[linha.servicoId];
      }
      if (unitarios[linha.servicoId] !== undefined) {
        novosUnitarios[linha.servicoId] = unitarios[linha.servicoId];
      }
    }
    setAjustesPreco(novosPrecos);
    setAjustesUnitario(novosUnitarios);
    return data;
  }

  async function gerarPrevia(e: FormEvent) {
    e.preventDefault();
    setError('');
    setCategoriaOverrides({});
    setAjustesPreco({});
    setAjustesUnitario({});
    setUnitarioDraft({});
    setRecalculando(true);
    try {
      await buscarPrevia({}, {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro');
      setPrevia(null);
    } finally {
      setRecalculando(false);
    }
  }

  async function alterarCategoriaMatriz(matrizId: number, categoria: string) {
    const novosOverrides = { ...categoriaOverrides, [matrizId]: categoria };
    setCategoriaOverrides(novosOverrides);
    setRecalculando(true);
    setError('');
    try {
      await buscarPrevia(novosOverrides, ajustesPreco, ajustesUnitario);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao recalcular');
    } finally {
      setRecalculando(false);
    }
  }

  function alterarUnitarioLinha(servicoId: number, qtdPontos: number, unitario: number) {
    const u = arredondarMoeda(unitario);
    setAjustesUnitario((prev) => ({ ...prev, [servicoId]: u }));
    setAjustesPreco((prev) => ({ ...prev, [servicoId]: unitarioParaValorPorMil(qtdPontos, u) }));
  }

  function confirmarUnitarioLinha(servicoId: number, qtdPontos: number, raw: string) {
    const parsed = parseUnitarioInput(raw);
    if (parsed === null) return;
    alterarUnitarioLinha(servicoId, qtdPontos, parsed);
    setUnitarioDraft((prev) => {
      const next = { ...prev };
      delete next[servicoId];
      return next;
    });
  }

  function unitarioExibido(l: PreviaLinha) {
    if (unitarioDraft[l.servicoId] !== undefined) return unitarioDraft[l.servicoId];
    if (ajustesUnitario[l.servicoId] !== undefined) return String(ajustesUnitario[l.servicoId]);
    return l.valorUnitario != null ? String(l.valorUnitario) : '';
  }

  const linhasEditadas = useMemo(() => {
    if (!previa) return [];
    return previa.servicos.map((l) => {
      if (ajustesUnitario[l.servicoId] !== undefined) {
        const valorUnitario = ajustesUnitario[l.servicoId];
        const valorPorMil = ajustesPreco[l.servicoId] ?? unitarioParaValorPorMil(l.qtdPontos, valorUnitario);
        return {
          ...l,
          valorPorMil,
          valorUnitario,
          precoManual: true,
          minimoAplicado: false,
          valorCalculado: arredondarMoeda(valorUnitario * l.quantidade),
        };
      }
      return l;
    });
  }, [previa, ajustesPreco, ajustesUnitario]);

  const valorTotalEditado = useMemo(
    () => linhasEditadas.reduce((s, l) => s + l.valorCalculado, 0),
    [linhasEditadas],
  );

  const totaisPorMatrizEditados = useMemo(() => {
    const map = new Map<number, {
      matrizId: number; matrizNome: string; quantidadeTotal: number; valorTotal: number;
      categoria: string; primeiraVezMatriz?: boolean;
    }>();
    for (const l of linhasEditadas) {
      const atual = map.get(l.matrizId) ?? {
        matrizId: l.matrizId,
        matrizNome: l.matrizNome,
        quantidadeTotal: 0,
        valorTotal: 0,
        categoria: l.categoria,
        primeiraVezMatriz: l.primeiraVezMatriz,
      };
      atual.quantidadeTotal += l.quantidade;
      atual.valorTotal += l.valorCalculado;
      atual.categoria = categoriaOverrides[l.matrizId] ?? l.categoria;
      map.set(l.matrizId, atual);
    }
    return [...map.values()];
  }, [linhasEditadas, categoriaOverrides]);

  async function confirmar() {
    if (!previa || !confirm('Confirmar fechamento? Os serviços serão bloqueados.')) return;
    setConfirmando(true);
    setError('');
    try {
      await api('/fechamentos/confirmar', {
        method: 'POST',
        body: JSON.stringify({
          clienteId: Number(clienteId),
          periodoInicio,
          periodoFim,
          overrides: categoriaOverrides,
          ajustesPreco,
        }),
      });
      setPrevia(null);
      setCategoriaOverrides({});
      setAjustesPreco({});
      setAjustesUnitario({});
      setUnitarioDraft({});
      await loadFechamentos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro');
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <div className="page-shell">
      <PageHeader
        title="Fechamentos"
        subtitle="Revise a prévia, ajuste categorias e preços antes de confirmar"
      />
      {error && <ErrorMessage message={error} />}

      <form onSubmit={gerarPrevia} className="card-section flex flex-wrap items-end gap-4">
        <div className="min-w-[200px] flex-1">
          <label className="label">Cliente</label>
          <select className="input" value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
            <option value="">Selecione</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div><label className="label">Início</label><input type="date" className="input" value={periodoInicio} onChange={(e) => setPeriodoInicio(e.target.value)} required /></div>
        <div><label className="label">Fim</label><input type="date" className="input" value={periodoFim} onChange={(e) => setPeriodoFim(e.target.value)} required /></div>
        <button type="submit" className="btn-primary" disabled={recalculando}>
          {recalculando ? 'Calculando...' : 'Gerar prévia'}
        </button>
      </form>

      {previa && (
        <div className="card-section">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold text-stelus-primary">
              Prévia do fechamento — {previa.quantidadeServicos} serviço(s)
              {recalculando && <span className="ml-2 text-sm font-normal text-gray-500">Recalculando...</span>}
            </h2>
            <div className="text-xl font-bold text-stelus-primary">{formatCurrency(valorTotalEditado)}</div>
          </div>

          <p className="alert-info mb-6">
            O preço é calculado pela tabela na <strong>1ª vez</strong> de cada matriz com o cliente (mínimo <strong>R$ 2,00/peça</strong>).
            Depois do fechamento, o valor fica fixo até alteração manual. Edições manuais aparecem com *.
          </p>

          {totaisPorMatrizEditados.length > 0 && (
            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {totaisPorMatrizEditados.map((m) => (
                <div key={m.matrizId} className="rounded-xl border border-stelus-secondary/30 bg-stelus-cream/20 p-4 shadow-sm">
                  <div className="font-medium text-stelus-primary text-sm mb-2 flex items-center gap-2 flex-wrap">
                    {m.matrizNome}
                    {'primeiraVezMatriz' in m && m.primeiraVezMatriz && (
                      <span className="badge bg-blue-100 text-blue-800 text-[10px]">1ª matriz c/ cliente</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{m.quantidadeTotal} peças · {formatCurrency(m.valorTotal)}</div>
                  <label className="label text-xs">Categoria</label>
                  <select
                    className="input text-sm"
                    value={categoriaOverrides[m.matrizId] ?? m.categoria}
                    onChange={(e) => alterarCategoriaMatriz(m.matrizId, e.target.value)}
                    disabled={recalculando}
                  >
                    <option value="producao">Produção</option>
                    <option value="nao_producao">Não produção</option>
                  </select>
                  {categoriaOverrides[m.matrizId] && (
                    <span className="text-xs text-orange-600 mt-1 block">* alterado manualmente</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mb-4 overflow-x-auto rounded-xl border border-stelus-secondary/25">
            <table className="w-full text-sm">
              <thead className="bg-stelus-cream/35 text-stelus-primary">
                <tr>
                  <th>Data</th>
                  <th>Matriz</th>
                  <th>Parte</th>
                  <th>Tipo</th>
                  <th className="text-right">Qtd</th>
                  <th>Cat.</th>
                  <th className="text-right">Unitário</th>
                  <th className="text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {linhasEditadas.map((l) => (
                  <tr key={l.servicoId}>
                    <td>{formatDate(l.dataServico)}</td>
                    <td>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{l.matrizNome}</span>
                        {l.primeiraVezMatriz && (
                          <span className="badge bg-blue-100 text-blue-800 text-[10px] whitespace-nowrap">1ª vez</span>
                        )}
                      </div>
                    </td>
                    <td>{l.partePecaNome}</td>
                    <td>{tipoPecaLabel(l.tipoPeca)}</td>
                    <td className="text-right tabular-nums">{l.quantidade}</td>
                    <td>
                      <span className={`badge ${l.categoria === 'producao' ? 'badge-producao' : 'badge-nao-producao'}`}>
                        {categoriaLabel(l.categoria)}{(!l.categoriaAutomatica || categoriaOverrides[l.matrizId]) && ' *'}
                      </span>
                    </td>
                    <td className="text-right">
                      <input
                        type="text"
                        inputMode="decimal"
                        className="input w-24 text-right text-sm py-1"
                        value={unitarioExibido(l)}
                        onChange={(e) => setUnitarioDraft((prev) => ({ ...prev, [l.servicoId]: e.target.value }))}
                        onBlur={(e) => confirmarUnitarioLinha(l.servicoId, l.qtdPontos, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            confirmarUnitarioLinha(l.servicoId, l.qtdPontos, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                      />
                      <div className="text-[10px] text-gray-400">{l.qtdPontos.toLocaleString('pt-BR')} pts</div>
                      {l.minimoAplicado && !l.precoManual && (
                        <div className="text-[10px] text-amber-600">mín. R$ 2,00</div>
                      )}
                      {l.precoSalvo && !l.precoManual && (
                        <div className="text-[10px] text-gray-400">preço fixo</div>
                      )}
                      {l.precoManual && l.valorUnitarioOriginal !== undefined && l.valorUnitario !== l.valorUnitarioOriginal && (
                        <div className="text-[10px] text-gray-400">orig: {formatCurrency(l.valorUnitarioOriginal)}</div>
                      )}
                    </td>
                    <td className="text-right font-medium tabular-nums">{formatCurrency(l.valorCalculado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" className="btn-primary" onClick={confirmar} disabled={confirmando || recalculando}>
            {confirmando ? 'Confirmando...' : 'Confirmar fechamento e gerar PDF'}
          </button>
        </div>
      )}

      {loading ? <LoadingState /> : (
        <div className="table-wrap overflow-x-auto">
          <h2 className="border-b border-gray-100 px-5 py-4 font-semibold text-stelus-primary">Histórico de fechamentos</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Período</th>
                <th className="text-right">Total</th>
                <th>Status</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {fechamentos.length === 0 ? (
                <tr><td colSpan={6} className="table-empty">Nenhum fechamento registrado.</td></tr>
              ) : fechamentos.map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.cliente?.nome}</td>
                  <td>
                    {f.periodoInicio === f.periodoFim
                      ? formatDate(f.periodoInicio)
                      : `${formatDate(f.periodoInicio)} — ${formatDate(f.periodoFim)}`}
                  </td>
                  <td className="text-right tabular-nums">{formatCurrency(Number(f.valorTotal))}</td>
                  <td>{statusLabel(f.status)}</td>
                  <td>
                    {f.documentoPdf && (
                      <a href={f.documentoPdf} target="_blank" rel="noreferrer" className="btn-link text-xs">
                        Baixar
                      </a>
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
