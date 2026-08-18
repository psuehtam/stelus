import { queryOne } from '../lib/db.js';

/** Código inicial no padrão Stelus (13 dígitos, prefixo 200). */
const REFERENCIA_INICIAL = '2000000012106';

export async function gerarReferenciaMatriz() {
  const row = await queryOne(
    `SELECT referencia FROM matrizes
     WHERE referencia IS NOT NULL AND referencia REGEXP '^[0-9]+$'
     ORDER BY CAST(referencia AS UNSIGNED) DESC
     LIMIT 1`,
  );

  if (!row?.referencia) {
    return REFERENCIA_INICIAL;
  }

  return (BigInt(row.referencia) + 1n).toString();
}
