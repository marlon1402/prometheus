// Dinamômetro: um objeto pendurado numa mola. A mola oscila um pouco e
// assenta no estiramento proporcional ao peso (lei de Hooke).
// O estiramento é medido na escala do aparelho, em newtons.

export const G = 9.8;

/** Rigidez e amortecimento do movimento até o equilíbrio (só afetam a animação). */
const K = 90;
const AMORTECIMENTO = 7;

export interface Estado {
  /** Massa pendurada, em kg. */
  m: number;
  /** Estiramento atual (na escala, em N) e sua taxa de variação. */
  x: number;
  v: number;
}

export const peso = (m: number) => m * G;

/** Começa já em equilíbrio com a massa `m`. */
export function criar(m: number): Estado {
  return { m, x: peso(m), v: 0 };
}

/** Troca o objeto; a mola vai oscilar até o novo equilíbrio. */
export function pendurar(s: Estado, m: number) {
  s.m = m;
}

export function passo(s: Estado, dt: number) {
  const alvo = peso(s.m);
  s.v += (-K * (s.x - alvo) - AMORTECIMENTO * s.v) * dt;
  s.x += s.v * dt;
}
