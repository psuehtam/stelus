import { query } from '../lib/db.js';

export async function registrarAuditoria(usuarioId, entidade, entidadeId, acao, detalhes = null) {
  await query(
    `INSERT INTO auditoria_log (usuario_id, entidade, entidade_id, acao, detalhes)
     VALUES (?, ?, ?, ?, ?)`,
    [usuarioId, entidade, entidadeId, acao, detalhes ? JSON.stringify(detalhes) : null],
  );
}
