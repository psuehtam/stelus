import { query, queryOne } from '../lib/db.js';
import { mapRow, mapRows, shapeFechamento } from '../lib/mappers.js';
import { calcularPreviaFechamento, confirmarFechamento } from '../services/precificacaoService.js';
import { gerarPdfFechamento } from '../utils/pdfGenerator.js';
import { registrarAuditoria } from '../services/auditoriaService.js';

function parseDate(value) {
  return String(value).slice(0, 10);
}

export async function previaFechamento(req, res, next) {
  try {
    const { clienteId, periodoInicio, periodoFim, overrides, ajustesPreco } = req.body;
    const previa = await calcularPreviaFechamento({
      clienteId: Number(clienteId),
      periodoInicio: parseDate(periodoInicio),
      periodoFim: parseDate(periodoFim),
      overrides: overrides ?? {},
      ajustesPreco: ajustesPreco ?? {},
      persistirCategorias: false,
    });
    res.json(previa);
  } catch (err) {
    next(err);
  }
}

export async function confirmar(req, res, next) {
  try {
    const { clienteId, periodoInicio, periodoFim, overrides, ajustesPreco } = req.body;
    const { fechamento, previa } = await confirmarFechamento({
      clienteId: Number(clienteId),
      periodoInicio: parseDate(periodoInicio),
      periodoFim: parseDate(periodoFim),
      overrides: overrides ?? {},
      ajustesPreco: ajustesPreco ?? {},
      criadoPor: req.user.id,
    });

    const config = mapRow(await queryOne('SELECT * FROM config_empresa WHERE id = 1'));
    const cliente = mapRow(await queryOne('SELECT * FROM clientes WHERE id = ?', [Number(clienteId)]));
    const itens = mapRows(await query('SELECT * FROM fechamento_itens WHERE fechamento_id = ?', [fechamento.id]));

    const vendedor = mapRow(await queryOne('SELECT nome FROM usuarios WHERE id = ?', [req.user.id]));
    const pagamentos = mapRows(await query('SELECT * FROM pagamentos WHERE fechamento_id = ?', [fechamento.id]));

    const pdf = await gerarPdfFechamento(fechamento, cliente, config, itens, {
      vendedor: vendedor?.nome,
      pagamentos,
    });
    await query('UPDATE fechamentos SET documento_pdf = ? WHERE id = ?', [pdf.filepath, fechamento.id]);

    await registrarAuditoria(req.user.id, 'fechamento', fechamento.id, 'fechar', {
      clienteId: Number(clienteId),
      valorTotal: previa.valorTotal,
      servicos: previa.quantidadeServicos,
    });

    res.status(201).json({
      fechamento: { ...fechamento, documentoPdf: pdf.filepath },
      previa,
    });
  } catch (err) {
    next(err);
  }
}

export async function listFechamentos(req, res, next) {
  try {
    const { status, clienteId } = req.query;
    let sql = `
      SELECT f.*, c.id AS cliente_id_ref, c.nome AS cliente_nome
      FROM fechamentos f
      JOIN clientes c ON c.id = f.cliente_id
      WHERE 1=1
    `;
    const params = [];

    if (status) { sql += ' AND f.status = ?'; params.push(status); }
    if (clienteId) { sql += ' AND f.cliente_id = ?'; params.push(Number(clienteId)); }

    sql += ' ORDER BY f.criado_em DESC';
    const rows = await query(sql, params);

    const result = await Promise.all(rows.map(async (row) => {
      const pagamentos = mapRows(await query('SELECT * FROM pagamentos WHERE fechamento_id = ?', [row.id]));
      const totalPago = pagamentos.reduce((s, p) => s + Number(p.valorPago), 0);
      const f = shapeFechamento(row, {
        cliente: { id: row.cliente_id, nome: row.cliente_nome },
        pagamentos,
        totalPago,
        saldo: Number(row.valor_total) - totalPago,
      });
      return f;
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getFechamento(req, res, next) {
  try {
    const id = Number(req.params.id);
    const row = await queryOne(
      `SELECT f.*, c.*
       FROM fechamentos f
       JOIN clientes c ON c.id = f.cliente_id
       WHERE f.id = ?`,
      [id],
    );
    if (!row) return res.status(404).json({ error: 'Fechamento não encontrado' });

    const fechamento = shapeFechamento(row);
    fechamento.cliente = mapRow(await queryOne('SELECT * FROM clientes WHERE id = ?', [row.cliente_id]));
    fechamento.itens = mapRows(await query(
      'SELECT * FROM fechamento_itens WHERE fechamento_id = ? ORDER BY data_servico ASC, id ASC',
      [id],
    ));

    const pagamentos = await query(
      `SELECT p.*, u.nome AS usuario_nome
       FROM pagamentos p
       JOIN usuarios u ON u.id = p.usuario_id
       WHERE p.fechamento_id = ?`,
      [id],
    );
    fechamento.pagamentos = pagamentos.map((p) => ({
      ...mapRow(p),
      usuario: { nome: p.usuario_nome },
    }));

    res.json(fechamento);
  } catch (err) {
    next(err);
  }
}

export async function updateFechamento(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { valorTotal, status } = req.body;
    await query('UPDATE fechamentos SET valor_total = ?, status = ? WHERE id = ?', [valorTotal, status, id]);
    res.json(mapRow(await queryOne('SELECT * FROM fechamentos WHERE id = ?', [id])));
  } catch (err) {
    next(err);
  }
}

export async function registrarPagamento(req, res, next) {
  try {
    const fechamentoId = Number(req.params.id);
    const { valorPago, dataPagamento, formaPagamento, observacao } = req.body;

    const fechamento = mapRow(await queryOne('SELECT * FROM fechamentos WHERE id = ?', [fechamentoId]));
    if (!fechamento) return res.status(404).json({ error: 'Fechamento não encontrado' });
    if (fechamento.status === 'previa') {
      return res.status(400).json({ error: 'Fechamento precisa estar confirmado' });
    }

    await query(
      `INSERT INTO pagamentos (fechamento_id, valor_pago, data_pagamento, forma_pagamento, usuario_id, observacao)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fechamentoId, valorPago, parseDate(dataPagamento), formaPagamento ?? null, req.user.id, observacao ?? null],
    );

    const pagamentos = mapRows(await query('SELECT * FROM pagamentos WHERE fechamento_id = ?', [fechamentoId]));
    const totalPago = pagamentos.reduce((s, p) => s + Number(p.valorPago), 0);

    if (totalPago >= Number(fechamento.valorTotal)) {
      await query("UPDATE fechamentos SET status = 'pago' WHERE id = ?", [fechamentoId]);
    }

    const atualizado = shapeFechamento(
      await queryOne('SELECT * FROM fechamentos WHERE id = ?', [fechamentoId]),
      {
        pagamentos,
        cliente: mapRow(await queryOne('SELECT * FROM clientes WHERE id = ?', [fechamento.clienteId])),
      },
    );
    res.json(atualizado);
  } catch (err) {
    next(err);
  }
}
