import { query, queryOne, withTransaction, txQuery, txQueryOne } from '../lib/db.js';
import { mapRow, mapRows } from '../lib/mappers.js';
import { HttpError } from '../lib/httpError.js';
import { arredondarMoeda, arredondarValorPorMil, MINIMO_UNITARIO_PECA } from '../utils/money.js';

export { MINIMO_UNITARIO_PECA };

export function calcularValorServico(qtdPontos, quantidade, valorPorMil) {
  return arredondarMoeda((qtdPontos / 1000) * quantidade * Number(valorPorMil));
}

/** Preço de uma peça: (pontos da matriz / 1000) × R$/mil da tabela. */
export function calcularUnitarioPeca(qtdPontos, valorPorMil) {
  return arredondarMoeda((qtdPontos / 1000) * Number(valorPorMil));
}

export function unitarioParaValorPorMil(qtdPontos, unitarioPeca) {
  const milheiros = qtdPontos / 1000;
  if (milheiros <= 0) return Number(unitarioPeca);
  return arredondarValorPorMil(Number(unitarioPeca) / milheiros);
}

/** Garante mínimo de R$ 2/peça, salvo override manual do financeiro. */
export function aplicarMinimoUnitario(qtdPontos, valorPorMil, { permitirAbaixo = false } = {}) {
  const vpM = arredondarValorPorMil(valorPorMil);
  const unitario = calcularUnitarioPeca(qtdPontos, vpM);

  if (!permitirAbaixo && unitario < MINIMO_UNITARIO_PECA) {
    return {
      valorPorMil: arredondarValorPorMil(unitarioParaValorPorMil(qtdPontos, MINIMO_UNITARIO_PECA)),
      valorUnitario: MINIMO_UNITARIO_PECA,
      minimoAplicado: true,
    };
  }

  return { valorPorMil: vpM, valorUnitario: unitario, minimoAplicado: false };
}

export function definirCategoriaAutomatica(totalPecas, limiteProducao) {
  return totalPecas >= limiteProducao ? 'producao' : 'nao_producao';
}

/** Categoria no fechamento: período selecionado, salvo override manual do admin. */
export function resolverCategoriaFechamento(totalPecasPeriodo, limiteProducao, categoriaSalva, alteradoManualmente) {
  if (alteradoManualmente && categoriaSalva) {
    return { categoria: categoriaSalva, automatica: false };
  }
  return {
    categoria: definirCategoriaAutomatica(totalPecasPeriodo, limiteProducao),
    automatica: true,
  };
}

export async function buscarValorPorMil(tipoPeca, categoria, dataReferencia) {
  const dataStr = dataReferencia instanceof Date
    ? dataReferencia.toISOString().slice(0, 10)
    : String(dataReferencia).slice(0, 10);

  const preco = await queryOne(
    `SELECT * FROM tabela_precos
     WHERE tipo_peca = ? AND categoria = ? AND vigente_desde <= ?
     ORDER BY vigente_desde DESC LIMIT 1`,
    [tipoPeca, categoria, dataStr],
  );

  if (!preco) {
    throw new HttpError(`Preço não encontrado para ${tipoPeca}/${categoria}`, 400);
  }

  return mapRow(preco);
}

async function buscarConfigsClienteMatriz(clienteId, matrizIds) {
  if (matrizIds.length === 0) return new Map();
  const placeholders = matrizIds.map(() => '?').join(',');
  const rows = await query(
    `SELECT * FROM cliente_matriz_categoria
     WHERE cliente_id = ? AND matriz_id IN (${placeholders})`,
    [clienteId, ...matrizIds],
  );
  const map = new Map();
  for (const row of rows) {
    const r = mapRow(row);
    map.set(r.matrizId, r);
  }
  return map;
}

async function buscarMatrizesJaFechadas(clienteId, matrizIds) {
  if (matrizIds.length === 0) return new Set();
  const placeholders = matrizIds.map(() => '?').join(',');
  const rows = await query(
    `SELECT DISTINCT fi.matriz_id
     FROM fechamento_itens fi
     INNER JOIN fechamentos f ON f.id = fi.fechamento_id
     WHERE f.cliente_id = ? AND fi.matriz_id IN (${placeholders})`,
    [clienteId, ...matrizIds],
  );
  return new Set(rows.map((r) => r.matriz_id));
}

export async function obterCategoriaClienteMatriz(
  clienteId,
  matrizId,
  totalPecasPeriodo,
  limiteProducao,
  { persistir = true, configExistente = null } = {},
) {
  const existente = configExistente ?? mapRow(await queryOne(
    'SELECT * FROM cliente_matriz_categoria WHERE cliente_id = ? AND matriz_id = ?',
    [clienteId, matrizId],
  ));

  if (existente) {
    const resolved = resolverCategoriaFechamento(
      totalPecasPeriodo,
      limiteProducao,
      existente.categoria,
      existente.alteradoManualmente,
    );
    if (!existente.alteradoManualmente && persistir) {
      await query(
        `INSERT INTO cliente_matriz_categoria (cliente_id, matriz_id, categoria, alterado_manualmente)
         VALUES (?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE categoria = VALUES(categoria), alterado_manualmente = 0`,
        [clienteId, matrizId, resolved.categoria],
      );
    }
    return { ...resolved, nova: false };
  }

  const categoria = definirCategoriaAutomatica(totalPecasPeriodo, limiteProducao);

  if (persistir) {
    await query(
      `INSERT INTO cliente_matriz_categoria (cliente_id, matriz_id, categoria, alterado_manualmente)
       VALUES (?, ?, ?, 0)`,
      [clienteId, matrizId, categoria],
    );
  }

  return { categoria, automatica: true, nova: true };
}

function resolverValorPorMilLinha({
  valorPorMilTabela,
  valorPorMilSalvo,
  ajusteManual,
}) {
  if (ajusteManual !== undefined && ajusteManual !== null) {
    return { valorPorMil: Number(ajusteManual), precoManual: true, precoSalvo: false, origem: 'manual' };
  }
  if (valorPorMilSalvo != null) {
    return {
      valorPorMil: Number(valorPorMilSalvo),
      precoManual: false,
      precoSalvo: true,
      origem: 'salvo',
    };
  }
  return {
    valorPorMil: Number(valorPorMilTabela),
    precoManual: false,
    precoSalvo: false,
    origem: 'tabela',
  };
}

export async function calcularPreviaFechamento({
  clienteId,
  periodoInicio,
  periodoFim,
  overrides = {},
  ajustesPreco = {},
  persistirCategorias = true,
}) {
  const inicio = periodoInicio instanceof Date ? periodoInicio.toISOString().slice(0, 10) : periodoInicio;
  const fim = periodoFim instanceof Date ? periodoFim.toISOString().slice(0, 10) : periodoFim;

  const clienteRow = await queryOne('SELECT * FROM clientes WHERE id = ?', [clienteId]);
  if (!clienteRow) throw new HttpError('Cliente não encontrado', 404);
  const cliente = mapRow(clienteRow);

  const servicosRows = await query(
    `SELECT s.*, m.nome AS matriz_nome, m.qtd_pontos, m.referencia AS matriz_referencia,
            pp.nome AS parte_peca_nome, u.nome AS usuario_nome
     FROM servicos s
     JOIN matrizes m ON m.id = s.matriz_id
     JOIN partes_peca pp ON pp.id = s.parte_peca_id
     JOIN usuarios u ON u.id = s.usuario_id
     WHERE s.cliente_id = ? AND s.fechado = 0
       AND s.data_servico >= ? AND s.data_servico <= ?
     ORDER BY s.data_servico ASC, s.id ASC`,
    [clienteId, inicio, fim],
  );

  const servicos = mapRows(servicosRows);
  const porMatriz = new Map();
  for (const s of servicos) {
    const atual = porMatriz.get(s.matrizId) ?? { total: 0, servicos: [] };
    atual.total += s.quantidade;
    atual.servicos.push(s);
    porMatriz.set(s.matrizId, atual);
  }

  const matrizIds = [...porMatriz.keys()];
  const configsPorMatriz = await buscarConfigsClienteMatriz(clienteId, matrizIds);
  const matrizesFechadas = await buscarMatrizesJaFechadas(clienteId, matrizIds);

  const categoriasPorMatriz = {};
  for (const [matrizId, grupo] of porMatriz) {
    const override = overrides[matrizId] ?? overrides[String(matrizId)];
    if (override) {
      categoriasPorMatriz[matrizId] = { categoria: override, automatica: false };
    } else {
      categoriasPorMatriz[matrizId] = await obterCategoriaClienteMatriz(
        clienteId,
        matrizId,
        grupo.total,
        cliente.limiteProducao,
        { persistir: persistirCategorias, configExistente: configsPorMatriz.get(matrizId) ?? null },
      );
    }
  }

  const linhas = [];
  let valorTotal = 0;

  for (const servico of servicos) {
    const catInfo = categoriasPorMatriz[servico.matrizId];
    const configMatriz = configsPorMatriz.get(servico.matrizId);
    const preco = await buscarValorPorMil(servico.tipoPeca, catInfo.categoria, servico.dataServico);
    const valorPorMilTabela = Number(preco.valorPorMil);
    const ajusteManual = ajustesPreco[servico.id] ?? ajustesPreco[String(servico.id)];

    const resolvido = resolverValorPorMilLinha({
      valorPorMilTabela,
      valorPorMilSalvo: configMatriz?.valorPorMil,
      ajusteManual,
    });

    const { valorPorMil, valorUnitario, minimoAplicado } = aplicarMinimoUnitario(
      servico.qtdPontos,
      resolvido.valorPorMil,
      { permitirAbaixo: resolvido.precoManual || resolvido.precoSalvo },
    );

    const valorCalculado = resolvido.precoManual
      ? arredondarMoeda(valorUnitario * servico.quantidade)
      : calcularValorServico(servico.qtdPontos, servico.quantidade, valorPorMil);
    valorTotal += valorCalculado;

    const primeiraVezMatriz = !matrizesFechadas.has(servico.matrizId);

    linhas.push({
      servicoId: servico.id,
      matrizId: servico.matrizId,
      matrizReferencia: servico.matrizReferencia ?? null,
      matrizNome: servico.matrizNome,
      qtdPontos: servico.qtdPontos,
      partePecaNome: servico.partePecaNome,
      tipoPeca: servico.tipoPeca,
      quantidade: servico.quantidade,
      categoria: catInfo.categoria,
      categoriaAutomatica: catInfo.automatica && !overrides[servico.matrizId] && !overrides[String(servico.matrizId)],
      valorPorMil,
      valorPorMilOriginal: valorPorMilTabela,
      valorPorMilSalvo: configMatriz?.valorPorMil ?? null,
      valorUnitario,
      valorUnitarioOriginal: calcularUnitarioPeca(servico.qtdPontos, valorPorMilTabela),
      precoManual: resolvido.precoManual,
      precoSalvo: resolvido.precoSalvo,
      origemPreco: resolvido.origem,
      minimoAplicado,
      primeiraVezMatriz,
      valorCalculado,
      dataServico: servico.dataServico,
      usuarioNome: servico.usuarioNome,
    });
  }

  const totaisPorMatriz = {};
  for (const linha of linhas) {
    if (!totaisPorMatriz[linha.matrizId]) {
      totaisPorMatriz[linha.matrizId] = {
        matrizId: linha.matrizId,
        matrizNome: linha.matrizNome,
        quantidadeTotal: 0,
        valorTotal: 0,
        categoria: linha.categoria,
        primeiraVezMatriz: linha.primeiraVezMatriz,
      };
    }
    totaisPorMatriz[linha.matrizId].quantidadeTotal += linha.quantidade;
    totaisPorMatriz[linha.matrizId].valorTotal += linha.valorCalculado;
  }

  return {
    cliente,
    servicos: linhas,
    totaisPorMatriz: Object.values(totaisPorMatriz),
    valorTotal,
    quantidadeServicos: servicos.length,
  };
}

async function persistirPrecosClienteMatriz(clienteId, previa, overrides, ajustesPreco) {
  const porMatriz = new Map();
  for (const linha of previa.servicos) {
    if (porMatriz.has(linha.matrizId)) continue;
    const ajusteManual = ajustesPreco[linha.servicoId] ?? ajustesPreco[String(linha.servicoId)];
    porMatriz.set(linha.matrizId, {
      valorPorMil: linha.valorPorMil,
      precoManual: ajusteManual !== undefined && ajusteManual !== null,
      categoria: linha.categoria,
      categoriaManual: Boolean(overrides[linha.matrizId] ?? overrides[String(linha.matrizId)]),
    });
  }

  for (const [matrizId, dados] of porMatriz) {
    await query(
      `INSERT INTO cliente_matriz_categoria
         (cliente_id, matriz_id, categoria, alterado_manualmente, valor_por_mil, preco_alterado_manualmente)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         categoria = VALUES(categoria),
         alterado_manualmente = VALUES(alterado_manualmente),
         valor_por_mil = VALUES(valor_por_mil),
         preco_alterado_manualmente = VALUES(preco_alterado_manualmente)`,
      [
        clienteId,
        matrizId,
        dados.categoria,
        dados.categoriaManual ? 1 : 0,
        dados.valorPorMil,
        dados.precoManual ? 1 : 0,
      ],
    );
  }
}

export async function confirmarFechamento({
  clienteId,
  periodoInicio,
  periodoFim,
  overrides = {},
  ajustesPreco = {},
  criadoPor,
}) {
  for (const [matrizId, categoria] of Object.entries(overrides)) {
    await query(
      `INSERT INTO cliente_matriz_categoria (cliente_id, matriz_id, categoria, alterado_manualmente)
       VALUES (?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE categoria = VALUES(categoria), alterado_manualmente = 1`,
      [clienteId, Number(matrizId), categoria],
    );
  }

  const previa = await calcularPreviaFechamento({
    clienteId,
    periodoInicio,
    periodoFim,
    overrides,
    ajustesPreco,
    persistirCategorias: true,
  });

  if (previa.quantidadeServicos === 0) {
    throw new HttpError('Nenhum serviço disponível para fechamento no período', 400);
  }

  const inicio = periodoInicio instanceof Date ? periodoInicio.toISOString().slice(0, 10) : periodoInicio;
  const fim = periodoFim instanceof Date ? periodoFim.toISOString().slice(0, 10) : periodoFim;

  const fechamento = await withTransaction(async (conn) => {
    const result = await txQuery(
      conn,
      `INSERT INTO fechamentos (cliente_id, periodo_inicio, periodo_fim, valor_total, status, criado_por)
       VALUES (?, ?, ?, ?, 'confirmado', ?)`,
      [clienteId, inicio, fim, previa.valorTotal, criadoPor ?? null],
    );

    const fechamentoId = result.insertId;

    for (const linha of previa.servicos) {
      await txQuery(
        conn,
        `INSERT INTO fechamento_itens
         (fechamento_id, servico_id, matriz_id, matriz_referencia, matriz_nome, qtd_pontos, parte_peca_nome,
          tipo_peca, quantidade, categoria, valor_por_mil, valor_calculado,
          categoria_automatica, data_servico)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fechamentoId, linha.servicoId, linha.matrizId, linha.matrizReferencia, linha.matrizNome, linha.qtdPontos,
          linha.partePecaNome, linha.tipoPeca, linha.quantidade, linha.categoria,
          linha.valorPorMil, linha.valorCalculado, linha.categoriaAutomatica ? 1 : 0,
          linha.dataServico,
        ],
      );

      await txQuery(
        conn,
        `UPDATE servicos SET fechado = 1, fechamento_id = ?,
         valor_por_mil_aplicado = ?, valor_calculado_historico = ?
         WHERE id = ?`,
        [fechamentoId, linha.valorPorMil, linha.valorCalculado, linha.servicoId],
      );
    }

    return mapRow(await txQueryOne(conn, 'SELECT * FROM fechamentos WHERE id = ?', [fechamentoId]));
  });

  await persistirPrecosClienteMatriz(clienteId, previa, overrides, ajustesPreco);

  return { fechamento, previa };
}
