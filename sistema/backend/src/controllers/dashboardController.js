import { query, queryOne } from '../lib/db.js';
import { mapRow, mapRows, shapeServico } from '../lib/mappers.js';
import { gerarPdfRelatorioOperacional } from '../utils/pdfGenerator.js';
import { apenasDigitos } from '../utils/sanitize.js';

const CONFIG_FIELDS = [
  'nome_empresa', 'razao_social', 'cnpj', 'inscricao_estadual',
  'endereco', 'numero', 'bairro', 'cidade', 'estado', 'cep',
  'telefone', 'email', 'logomarca_path', 'banco', 'agencia', 'conta',
  'pix', 'favorecido', 'mensagem_cobranca', 'prazo_pagamento',
  'observacoes_padrao', 'rodape_documento',
];

const CONFIG_BODY_MAP = {
  nomeEmpresa: 'nome_empresa',
  razaoSocial: 'razao_social',
  inscricaoEstadual: 'inscricao_estadual',
  logomarcaPath: 'logomarca_path',
  mensagemCobranca: 'mensagem_cobranca',
  prazoPagamento: 'prazo_pagamento',
  observacoesPadrao: 'observacoes_padrao',
  rodapeDocumento: 'rodape_documento',
};

function bodyToConfigColumns(body) {
  const cols = {};
  for (const [key, value] of Object.entries(body)) {
    const col = CONFIG_BODY_MAP[key] ?? key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
    if (CONFIG_FIELDS.includes(col)) cols[col] = value;
  }
  return cols;
}

export async function getConfig(req, res, next) {
  try {
    let row = await queryOne('SELECT * FROM config_empresa WHERE id = 1');
    if (!row) {
      await query("INSERT INTO config_empresa (id, nome_empresa) VALUES (1, 'Stelus Bordados')");
      row = await queryOne('SELECT * FROM config_empresa WHERE id = 1');
    }
    res.json(mapRow(row));
  } catch (err) {
    next(err);
  }
}

export async function updateConfig(req, res, next) {
  try {
    const cols = bodyToConfigColumns(req.body);
    if (cols.cep !== undefined) cols.cep = apenasDigitos(cols.cep) || null;
    if (cols.estado !== undefined && cols.estado) cols.estado = String(cols.estado).toUpperCase().slice(0, 2);

    const sets = Object.keys(cols).map((k) => `${k} = ?`).join(', ');
    const values = Object.values(cols);

    if (sets.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    await query(`UPDATE config_empresa SET ${sets} WHERE id = 1`, values);
    res.json(mapRow(await queryOne('SELECT * FROM config_empresa WHERE id = 1')));
  } catch (err) {
    next(err);
  }
}

export async function dashboard(req, res, next) {
  try {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

    const fechamentosRows = await query(
      `SELECT f.*, c.nome AS cliente_nome
       FROM fechamentos f
       JOIN clientes c ON c.id = f.cliente_id
       WHERE f.status IN ('confirmado', 'pago')`,
    );

    const fechamentos = await Promise.all(fechamentosRows.map(async (row) => {
      const f = mapRow(row);
      f.cliente = { nome: row.cliente_nome };
      f.pagamentos = mapRows(await query('SELECT * FROM pagamentos WHERE fechamento_id = ?', [f.id]));
      f.itens = mapRows(await query('SELECT * FROM fechamento_itens WHERE fechamento_id = ?', [f.id]));
      return f;
    }));

    const faturamentoTotal = fechamentos.reduce((s, f) => s + Number(f.valorTotal), 0);
    const faturamentoMes = fechamentos
      .filter((f) => new Date(f.criadoEm) >= inicioMes)
      .reduce((s, f) => s + Number(f.valorTotal), 0);

    const pendentes = fechamentos
      .filter((f) => f.status === 'confirmado')
      .map((f) => {
        const pago = f.pagamentos.reduce((s, p) => s + Number(p.valorPago), 0);
        return { ...f, saldo: Number(f.valorTotal) - pago };
      });

    const valorEmAberto = pendentes.reduce((s, f) => s + f.saldo, 0);

    const rankingMap = new Map();
    for (const f of fechamentos) {
      const nome = f.cliente.nome;
      rankingMap.set(nome, (rankingMap.get(nome) ?? 0) + Number(f.valorTotal));
    }
    const rankingClientes = [...rankingMap.entries()]
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);

    const servicosRows = await query(
      `SELECT s.quantidade, c.nome AS cliente_nome
       FROM servicos s JOIN clientes c ON c.id = s.cliente_id`,
    );
    const volumeMap = new Map();
    for (const s of servicosRows) {
      volumeMap.set(s.cliente_nome, (volumeMap.get(s.cliente_nome) ?? 0) + s.quantidade);
    }
    const rankingVolume = [...volumeMap.entries()]
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);

    const itens = fechamentos.flatMap((f) => f.itens);
    const producao = itens.filter((i) => i.categoria === 'producao').length;
    const naoProducao = itens.filter((i) => i.categoria === 'nao_producao').length;

    const evolucaoMap = new Map();
    for (const f of fechamentos) {
      const key = `${new Date(f.criadoEm).getFullYear()}-${String(new Date(f.criadoEm).getMonth() + 1).padStart(2, '0')}`;
      evolucaoMap.set(key, (evolucaoMap.get(key) ?? 0) + Number(f.valorTotal));
    }
    const evolucaoMensal = [...evolucaoMap.entries()]
      .map(([mes, valor]) => ({ mes, valor }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    res.json({
      faturamentoTotal,
      faturamentoMes,
      valorEmAberto,
      fechamentosPendentes: pendentes.length,
      rankingClientes,
      rankingVolume,
      producaoVsNaoProducao: { producao, naoProducao },
      evolucaoMensal,
    });
  } catch (err) {
    next(err);
  }
}

async function buscarServicosRelatorio(dataInicio, dataFim) {
  let sql = `
    SELECT s.*,
           c.nome AS cliente_nome,
           m.nome AS matriz_nome, m.qtd_pontos AS matriz_qtd_pontos,
           pp.nome AS parte_peca_nome,
           u.nome AS usuario_nome
    FROM servicos s
    JOIN clientes c ON c.id = s.cliente_id
    JOIN matrizes m ON m.id = s.matriz_id
    JOIN partes_peca pp ON pp.id = s.parte_peca_id
    JOIN usuarios u ON u.id = s.usuario_id
    WHERE 1=1
  `;
  const params = [];

  if (dataInicio) { sql += ' AND s.data_servico >= ?'; params.push(String(dataInicio).slice(0, 10)); }
  if (dataFim) { sql += ' AND s.data_servico <= ?'; params.push(String(dataFim).slice(0, 10)); }

  sql += ' ORDER BY s.data_servico ASC, c.nome ASC, m.nome ASC';
  const rows = await query(sql, params);
  return rows.map(shapeServico);
}

export async function relatorioOperacional(req, res, next) {
  try {
    const { dataInicio, dataFim } = req.query;
    res.json(await buscarServicosRelatorio(dataInicio, dataFim));
  } catch (err) {
    next(err);
  }
}

export async function relatorioOperacionalPdf(req, res, next) {
  try {
    const { dataInicio, dataFim } = req.query;
    const servicos = await buscarServicosRelatorio(dataInicio, dataFim);

    let config = await queryOne('SELECT * FROM config_empresa WHERE id = 1');
    if (!config) {
      await query("INSERT INTO config_empresa (id, nome_empresa) VALUES (1, 'Stelus Bordados')");
      config = await queryOne('SELECT * FROM config_empresa WHERE id = 1');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="relatorio-operacional-${String(dataInicio ?? 'inicio').slice(0, 10)}-${String(dataFim ?? 'fim').slice(0, 10)}.pdf"`,
    );

    const doc = gerarPdfRelatorioOperacional(servicos, mapRow(config), {
      dataInicio: dataInicio ? String(dataInicio).slice(0, 10) : null,
      dataFim: dataFim ? String(dataFim).slice(0, 10) : null,
    });
    doc.pipe(res);
  } catch (err) {
    next(err);
  }
}
