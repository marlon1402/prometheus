// Números no formato brasileiro (vírgula decimal).

const formatos = new Map<number, Intl.NumberFormat>();

/** Formata `n` com `casas` casas decimais: fmt(4) → "4,0". */
export function fmt(n: number, casas = 1): string {
  let f = formatos.get(casas);
  if (!f) {
    f = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
    formatos.set(casas, f);
  }
  return f.format(n);
}
