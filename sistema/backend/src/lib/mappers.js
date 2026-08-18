const BOOL_KEYS = new Set([
  'ativo',
  'fechado',
  'alterado_manualmente',
  'categoria_automatica',
]);

function toCamel(key) {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function mapRow(row) {
  if (!row) return row;
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    const camel = toCamel(key);
    if (BOOL_KEYS.has(key)) {
      out[camel] = Boolean(value);
    } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      out[camel] = mapRow(value);
    } else {
      out[camel] = value;
    }
  }
  return out;
}

export function mapRows(rows) {
  return rows.map(mapRow);
}

export function shapeServico(row) {
  const s = mapRow(row);
  return {
    id: s.id,
    clienteId: s.clienteId,
    matrizId: s.matrizId,
    partePecaId: s.partePecaId,
    usuarioId: s.usuarioId,
    atualizadoPor: s.atualizadoPor,
    tipoPeca: s.tipoPeca,
    quantidade: s.quantidade,
    dataServico: s.dataServico,
    fechado: s.fechado,
    fechamentoId: s.fechamentoId,
    valorPorMilAplicado: s.valorPorMilAplicado != null ? Number(s.valorPorMilAplicado) : null,
    valorCalculadoHistorico: s.valorCalculadoHistorico != null ? Number(s.valorCalculadoHistorico) : null,
    criadoEm: s.criadoEm,
    cliente: s.clienteNome ? { id: s.clienteId, nome: s.clienteNome } : undefined,
    matriz: s.matrizNome
      ? { id: s.matrizId, nome: s.matrizNome, qtdPontos: s.matrizQtdPontos ?? s.qtdPontos }
      : undefined,
    partePeca: s.partePecaNome ? { id: s.partePecaId, nome: s.partePecaNome } : undefined,
    usuario: s.usuarioNome ? { id: s.usuarioId, nome: s.usuarioNome } : undefined,
    atualizadoPorUsuario: s.atualizadoPorNome
      ? { id: s.atualizadoPor, nome: s.atualizadoPorNome }
      : undefined,
    fechamento: s.fechamentoStatus
      ? { id: s.fechamentoId, status: s.fechamentoStatus }
      : s.fechamentoId
        ? { id: s.fechamentoId }
        : undefined,
  };
}

export function shapeFechamento(row, extras = {}) {
  const f = mapRow(row);
  return {
    ...f,
    valorTotal: Number(f.valorTotal),
    ...extras,
  };
}
