// Objeto pendurado por dois fios presos ao teto. No nó onde os fios se
// encontram, a resultante é zero (equilíbrio):
//   horizontal: T1 · cos α1 = T2 · cos α2
//   vertical:   T1 · sen α1 + T2 · sen α2 = P
// Daí T1 = P · cos α2 / sen(α1 + α2) e T2 = P · cos α1 / sen(α1 + α2).
// α é o ângulo de cada fio com a horizontal, em graus.

/** Peso do quadro, em N. */
export const PESO = 40;
/** Tração acima da qual um fio arrebentaria, em N. */
export const LIMITE_FIO = 100;
/** Faixa dos ângulos dos fios, em graus. */
export const ANGULO_MIN = 5;
export const ANGULO_MAX = 85;

export interface Estado {
  /** Ângulos dos fios 1 (esquerda) e 2 (direita) com a horizontal, em graus. */
  a1: number;
  a2: number;
}

export function criar(a1 = 60, a2 = 60): Estado {
  return { a1, a2 };
}

const rad = (graus: number) => (graus * Math.PI) / 180;

/** Trações nos dois fios, em N. */
export function tracoes({ a1, a2 }: Estado, peso = PESO) {
  const s = Math.sin(rad(a1 + a2));
  return { t1: (peso * Math.cos(rad(a2))) / s, t2: (peso * Math.cos(rad(a1))) / s };
}

/** Fios que arrebentariam com as trações atuais (1, 2 ou nenhum). */
export function arrebentados(s: Estado, peso = PESO, limite = LIMITE_FIO) {
  const { t1, t2 } = tracoes(s, peso);
  return [t1 > limite && 1, t2 > limite && 2].filter((n): n is 1 | 2 => n !== false);
}

export const limitarAngulo = (graus: number) => Math.round(Math.min(ANGULO_MAX, Math.max(ANGULO_MIN, graus)));
