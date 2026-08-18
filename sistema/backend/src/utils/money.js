/** Mínimo unitário por peça (R$) — regra Stelus. */
export const MINIMO_UNITARIO_PECA = 2;

/** Arredonda valor monetário para 2 casas decimais (evita 1.4400000000000002). */
export function arredondarMoeda(valor) {
  return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
}

/** R$/mil com mais casas para não distorcer o unitário ao editar manualmente. */
export function arredondarValorPorMil(valor) {
  return Math.round(Number(valor) * 10000) / 10000;
}
