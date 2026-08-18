import { query, queryOne } from '../lib/db.js';
import { mapRow, mapRows, shapeServico } from '../lib/mappers.js';
import { registrarAuditoria } from '../services/auditoriaService.js';
import { gerarReferenciaMatriz } from '../services/matrizService.js';
import { apenasDigitos } from '../utils/sanitize.js';

function parseDate(value) {
  if (!value) return undefined;
  return String(value).slice(0, 10);
}

async function getClienteComCategorias(id) {
  const cliente = mapRow(await queryOne('SELECT * FROM clientes WHERE id = ?', [id]));
  if (!cliente) return null;

  const categorias = await query(
    `SELECT cmc.*, m.id AS matriz_id, m.nome AS matriz_nome, m.qtd_pontos
     FROM cliente_matriz_categoria cmc
     JOIN matrizes m ON m.id = cmc.matriz_id
     WHERE cmc.cliente_id = ?`,
    [id],
  );

  cliente.categoriasMatriz = categorias.map((c) => {
    const row = mapRow(c);
    return {
      ...row,
      matriz: { id: row.matrizId, nome: row.matrizNome, qtdPontos: row.qtdPontos },
    };
  });

  return cliente;
}

const SERVICO_SELECT = `
  SELECT s.*,
         c.nome AS cliente_nome,
         m.nome AS matriz_nome, m.qtd_pontos AS matriz_qtd_pontos,
         pp.nome AS parte_peca_nome,
         u.nome AS usuario_nome,
         ua.nome AS atualizado_por_nome,
         f.status AS fechamento_status
  FROM servicos s
  JOIN clientes c ON c.id = s.cliente_id
  JOIN matrizes m ON m.id = s.matriz_id
  JOIN partes_peca pp ON pp.id = s.parte_peca_id
  JOIN usuarios u ON u.id = s.usuario_id
  LEFT JOIN usuarios ua ON ua.id = s.atualizado_por
  LEFT JOIN fechamentos f ON f.id = s.fechamento_id
`;

export async function listClientes(req, res, next) {
  try {
    const { ativo, q, limit } = req.query;
    const busca = typeof q === 'string' ? q.trim() : '';

    let sql = 'SELECT * FROM clientes WHERE 1=1';
    const params = [];

    if (ativo !== undefined) {
      sql += ' AND ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    if (busca) {
      const digits = busca.replace(/\D/g, '');
      sql += ' AND (nome LIKE ? OR razao_social LIKE ? OR cidade LIKE ?';
      const like = `%${busca}%`;
      params.push(like, like, like);
      if (digits) {
        sql += ' OR documento LIKE ?';
        params.push(`%${digits}%`);
      }
      sql += ')';
    }

    sql += ' ORDER BY nome ASC';

    if (busca) {
      const lim = Math.min(Math.max(Number(limit) || 20, 1), 50);
      sql += ` LIMIT ${lim}`;
    }

    const clientes = mapRows(await query(sql, params));

    if (!busca) {
      for (const c of clientes) {
        const cats = await query(
          `SELECT cmc.*, m.nome AS matriz_nome
           FROM cliente_matriz_categoria cmc
           JOIN matrizes m ON m.id = cmc.matriz_id
           WHERE cmc.cliente_id = ?`,
          [c.id],
        );
        c.categoriasMatriz = cats.map((cat) => {
          const row = mapRow(cat);
          return { ...row, matriz: { id: row.matrizId, nome: row.matrizNome } };
        });
      }
    }

    res.json(clientes);
  } catch (err) {
    next(err);
  }
}

export async function getCliente(req, res, next) {
  try {
    const cliente = await getClienteComCategorias(Number(req.params.id));
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
}

function parseOptional(value) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s === '' ? null : s;
}

export async function createCliente(req, res, next) {
  try {
    const {
      nome, razaoSocial, tipoPessoa, documento, telefone, email,
      endereco, numero, bairro, cidade, estado, cep, limiteProducao,
    } = req.body;
    const result = await query(
      `INSERT INTO clientes (nome, razao_social, tipo_pessoa, documento, telefone, email,
       endereco, numero, bairro, cidade, estado, cep, limite_producao, criado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome,
        parseOptional(razaoSocial),
        tipoPessoa === 'fisica' ? 'fisica' : 'juridica',
        apenasDigitos(documento) || null,
        parseOptional(telefone),
        parseOptional(email),
        parseOptional(endereco),
        parseOptional(numero),
        parseOptional(bairro),
        parseOptional(cidade),
        parseOptional(estado)?.toUpperCase() ?? null,
        apenasDigitos(cep) || null,
        limiteProducao ?? 50,
        req.user.id,
      ],
    );
    const row = await queryOne('SELECT * FROM clientes WHERE id = ?', [result.insertId]);
    await registrarAuditoria(req.user.id, 'cliente', result.insertId, 'criar', { nome });
    res.status(201).json(mapRow(row));
  } catch (err) {
    next(err);
  }
}

export async function updateCliente(req, res, next) {
  try {
    const id = Number(req.params.id);
    const atual = await queryOne('SELECT ativo FROM clientes WHERE id = ?', [id]);
    if (!atual) return res.status(404).json({ error: 'Cliente não encontrado' });

    const {
      nome, razaoSocial, tipoPessoa, documento, telefone, email,
      endereco, numero, bairro, cidade, estado, cep, limiteProducao, ativo,
    } = req.body;

    await query(
      `UPDATE clientes SET nome = ?, razao_social = ?, tipo_pessoa = ?, documento = ?, telefone = ?, email = ?,
       endereco = ?, numero = ?, bairro = ?, cidade = ?, estado = ?, cep = ?,
       limite_producao = ?, ativo = ? WHERE id = ?`,
      [
        nome,
        parseOptional(razaoSocial),
        tipoPessoa === 'fisica' ? 'fisica' : 'juridica',
        apenasDigitos(documento) || null,
        parseOptional(telefone),
        parseOptional(email),
        parseOptional(endereco),
        parseOptional(numero),
        parseOptional(bairro),
        parseOptional(cidade),
        parseOptional(estado)?.toUpperCase() ?? null,
        apenasDigitos(cep) || null,
        limiteProducao ?? 50,
        ativo !== undefined ? (ativo !== false ? 1 : 0) : atual.ativo,
        id,
      ],
    );
    const row = await queryOne('SELECT * FROM clientes WHERE id = ?', [id]);
    res.json(mapRow(row));
  } catch (err) {
    next(err);
  }
}

export async function deleteCliente(req, res, next) {
  try {
    const id = Number(req.params.id);
    await query('UPDATE clientes SET ativo = 0 WHERE id = ?', [id]);
    const row = await queryOne('SELECT * FROM clientes WHERE id = ?', [id]);
    res.json(mapRow(row));
  } catch (err) {
    next(err);
  }
}

export async function updateCategoriaMatriz(req, res, next) {
  try {
    const clienteId = Number(req.params.id);
    const { matrizId, categoria } = req.body;

    await query(
      `INSERT INTO cliente_matriz_categoria (cliente_id, matriz_id, categoria, alterado_manualmente)
       VALUES (?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE categoria = VALUES(categoria), alterado_manualmente = 1`,
      [clienteId, matrizId, categoria],
    );

    const row = await queryOne(
      'SELECT * FROM cliente_matriz_categoria WHERE cliente_id = ? AND matriz_id = ?',
      [clienteId, matrizId],
    );
    res.json(mapRow(row));
  } catch (err) {
    next(err);
  }
}

export async function listMatrizes(req, res, next) {
  try {
    const ativoOnly = req.query.ativo !== 'false';
    const page = req.query.page ? Math.max(1, Number.parseInt(String(req.query.page), 10) || 1) : null;
    const limit = page
      ? Math.min(100, Math.max(1, Number.parseInt(String(req.query.limit ?? '25'), 10) || 25))
      : null;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    let where = ativoOnly ? 'WHERE ativo = 1' : 'WHERE 1=1';
    const params = [];

    if (q) {
      const like = `%${q}%`;
      const soNumeros = q.replace(/\D/g, '');
      const buscaNumerica = soNumeros.length > 0 && soNumeros === q.replace(/[.\s,]/g, '');

      if (buscaNumerica) {
        const pts = Number(soNumeros);
        where += ' AND (nome LIKE ? OR referencia LIKE ? OR qtd_pontos = ? OR CAST(qtd_pontos AS CHAR) LIKE ?)';
        params.push(like, like, pts, `%${soNumeros}%`);
      } else {
        where += ' AND (nome LIKE ? OR referencia LIKE ? OR CAST(qtd_pontos AS CHAR) LIKE ?)';
        params.push(like, like, like);
      }
    }

    if (!page) {
      const sql = `SELECT * FROM matrizes ${where} ORDER BY nome ASC`;
      return res.json(mapRows(await query(sql, params)));
    }

    const countRow = await queryOne(`SELECT COUNT(*) AS total FROM matrizes ${where}`, params);
    const total = Number(countRow.total);
    const offset = (page - 1) * limit;
    // LIMIT/OFFSET não podem ser placeholders no MySQL (erro mysqli_stmt_execute)
    const rows = await query(
      `SELECT * FROM matrizes ${where} ORDER BY nome ASC LIMIT ${limit} OFFSET ${offset}`,
      params,
    );

    res.json({
      items: mapRows(rows),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    next(err);
  }
}

export async function createMatriz(req, res, next) {
  try {
    const { nome, qtdPontos } = req.body;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const referencia = await gerarReferenciaMatriz();
        const result = await query(
          'INSERT INTO matrizes (nome, referencia, qtd_pontos, criado_por) VALUES (?, ?, ?, ?)',
          [nome, referencia, qtdPontos, req.user.id],
        );
        await registrarAuditoria(req.user.id, 'matriz', result.insertId, 'criar', { nome, referencia });
        return res.status(201).json(mapRow(await queryOne('SELECT * FROM matrizes WHERE id = ?', [result.insertId])));
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY' && attempt < 2) continue;
        throw err;
      }
    }
    return res.status(500).json({ error: 'Não foi possível gerar código da matriz' });
  } catch (err) {
    next(err);
  }
}

export async function updateMatriz(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { nome, qtdPontos, ativo } = req.body;
    const atual = await queryOne('SELECT referencia FROM matrizes WHERE id = ?', [id]);
    const referencia = atual?.referencia ?? await gerarReferenciaMatriz();

    await query(
      'UPDATE matrizes SET nome = ?, referencia = ?, qtd_pontos = ?, ativo = ? WHERE id = ?',
      [nome, referencia, qtdPontos, ativo !== false ? 1 : 0, id],
    );
    res.json(mapRow(await queryOne('SELECT * FROM matrizes WHERE id = ?', [id])));
  } catch (err) {
    next(err);
  }
}

export async function deleteMatriz(req, res, next) {
  try {
    const id = Number(req.params.id);
    await query('UPDATE matrizes SET ativo = 0 WHERE id = ?', [id]);
    res.json(mapRow(await queryOne('SELECT * FROM matrizes WHERE id = ?', [id])));
  } catch (err) {
    next(err);
  }
}

export async function listPartesPeca(req, res, next) {
  try {
    res.json(mapRows(await query('SELECT * FROM partes_peca WHERE ativo = 1 ORDER BY nome ASC')));
  } catch (err) {
    next(err);
  }
}

export async function createPartePeca(req, res, next) {
  try {
    const { nome } = req.body;
    const result = await query('INSERT INTO partes_peca (nome) VALUES (?)', [nome]);
    res.status(201).json(mapRow(await queryOne('SELECT * FROM partes_peca WHERE id = ?', [result.insertId])));
  } catch (err) {
    next(err);
  }
}

export async function updatePartePeca(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { nome, ativo } = req.body;
    await query('UPDATE partes_peca SET nome = ?, ativo = ? WHERE id = ?', [nome, ativo !== false ? 1 : 0, id]);
    res.json(mapRow(await queryOne('SELECT * FROM partes_peca WHERE id = ?', [id])));
  } catch (err) {
    next(err);
  }
}

export async function deletePartePeca(req, res, next) {
  try {
    const id = Number(req.params.id);
    await query('UPDATE partes_peca SET ativo = 0 WHERE id = ?', [id]);
    res.json(mapRow(await queryOne('SELECT * FROM partes_peca WHERE id = ?', [id])));
  } catch (err) {
    next(err);
  }
}

export async function listPrecos(req, res, next) {
  try {
    res.json(mapRows(await query(
      'SELECT * FROM tabela_precos ORDER BY tipo_peca ASC, categoria ASC, vigente_desde DESC',
    )));
  } catch (err) {
    next(err);
  }
}

export async function createPreco(req, res, next) {
  try {
    const { tipoPeca, categoria, valorPorMil, vigenteDesde } = req.body;
    const result = await query(
      'INSERT INTO tabela_precos (tipo_peca, categoria, valor_por_mil, vigente_desde) VALUES (?, ?, ?, ?)',
      [tipoPeca, categoria, valorPorMil, parseDate(vigenteDesde)],
    );
    res.status(201).json(mapRow(await queryOne('SELECT * FROM tabela_precos WHERE id = ?', [result.insertId])));
  } catch (err) {
    next(err);
  }
}

export async function updatePreco(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { tipoPeca, categoria, valorPorMil, vigenteDesde } = req.body;
    const existente = await queryOne('SELECT * FROM tabela_precos WHERE id = ?', [id]);
    if (!existente) return res.status(404).json({ error: 'Preço não encontrado' });

    await query(
      `UPDATE tabela_precos SET tipo_peca = ?, categoria = ?, valor_por_mil = ?, vigente_desde = ? WHERE id = ?`,
      [tipoPeca, categoria, valorPorMil, parseDate(vigenteDesde), id],
    );
    res.json(mapRow(await queryOne('SELECT * FROM tabela_precos WHERE id = ?', [id])));
  } catch (err) {
    next(err);
  }
}

export async function listServicos(req, res, next) {
  try {
    const { clienteId, dataInicio, dataFim, fechado } = req.query;
    let sql = `${SERVICO_SELECT} WHERE 1=1`;
    const params = [];

    if (clienteId) { sql += ' AND s.cliente_id = ?'; params.push(Number(clienteId)); }
    if (fechado !== undefined) { sql += ' AND s.fechado = ?'; params.push(fechado === 'true' ? 1 : 0); }
    if (dataInicio) { sql += ' AND s.data_servico >= ?'; params.push(parseDate(dataInicio)); }
    if (dataFim) { sql += ' AND s.data_servico <= ?'; params.push(parseDate(dataFim)); }

    sql += ' ORDER BY s.data_servico DESC, s.id DESC';
    const rows = await query(sql, params);
    res.json(rows.map(shapeServico));
  } catch (err) {
    next(err);
  }
}

export async function createServico(req, res, next) {
  try {
    const { clienteId, matrizId, partePecaId, tipoPeca, quantidade, dataServico } = req.body;
    const result = await query(
      `INSERT INTO servicos (cliente_id, matriz_id, parte_peca_id, usuario_id, tipo_peca, quantidade, data_servico)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [Number(clienteId), Number(matrizId), Number(partePecaId), req.user.id, tipoPeca, Number(quantidade), parseDate(dataServico)],
    );
    await registrarAuditoria(req.user.id, 'servico', result.insertId, 'criar', { clienteId, matrizId, quantidade });
    const row = await queryOne(`${SERVICO_SELECT} WHERE s.id = ?`, [result.insertId]);
    res.status(201).json(shapeServico(row));
  } catch (err) {
    next(err);
  }
}

export async function updateServico(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existente = mapRow(await queryOne('SELECT * FROM servicos WHERE id = ?', [id]));
    if (!existente) return res.status(404).json({ error: 'Serviço não encontrado' });
    if (existente.fechado) {
      return res.status(400).json({ error: 'Serviço fechado não pode ser editado' });
    }

    const { clienteId, matrizId, partePecaId, tipoPeca, quantidade, dataServico } = req.body;
    await query(
      `UPDATE servicos SET cliente_id = ?, matriz_id = ?, parte_peca_id = ?,
       tipo_peca = ?, quantidade = ?, data_servico = ?, atualizado_por = ? WHERE id = ?`,
      [clienteId, matrizId, partePecaId, tipoPeca, quantidade, parseDate(dataServico), req.user.id, id],
    );

    await registrarAuditoria(req.user.id, 'servico', id, 'editar', {
      editadoPor: req.user.id,
      lancadoPor: existente.usuarioId,
    });

    const row = await queryOne(`${SERVICO_SELECT} WHERE s.id = ?`, [id]);
    res.json(shapeServico(row));
  } catch (err) {
    next(err);
  }
}

export async function deleteServico(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existente = mapRow(await queryOne('SELECT * FROM servicos WHERE id = ?', [id]));
    if (!existente) return res.status(404).json({ error: 'Serviço não encontrado' });
    if (existente.fechado) {
      return res.status(400).json({ error: 'Serviço fechado não pode ser excluído' });
    }
    await query('DELETE FROM servicos WHERE id = ?', [id]);
    await registrarAuditoria(req.user.id, 'servico', id, 'excluir', { clienteId: existente.clienteId });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
