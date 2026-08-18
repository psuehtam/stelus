export function apenasDigitos(valor) {
  if (valor == null || valor === '') return null;
  const digits = String(valor).replace(/\D/g, '');
  return digits || null;
}
