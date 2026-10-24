// Caixa num lago congelado, sem atrito: F = m · a.
// Opcionalmente, a caixa desliza sobre outra superfície, com atrito de
// coeficiente μ: em movimento, o atrito vale μ · m · g contra a velocidade;
// parada, ele segura a caixa enquanto a força aplicada não passar desse valor.
// (O modelo usa um único μ para os dois casos.)
// Só números, sem desenho, para poder ser testada.

export const G = 9.8;

/** Coeficientes de atrito de cada superfície da simulação. */
export const SUPERFICIES = {
  gelo: { nome: 'Gelo', mu: 0 },
  madeira: { nome: 'Madeira', mu: 0.2 },
  borracha: { nome: 'Borracha', mu: 0.5 },
} as const;

export type Superficie = keyof typeof SUPERFICIES;

export interface Estado {
  /** Força aplicada, em newtons. */
  F: number;
  /** Massa, em kg. */
  m: number;
  /** Coeficiente de atrito com o chão (0 no gelo). */
  mu: number;
  /** Posição (m), velocidade (m/s) e tempo (s). */
  x: number;
  v: number;
  t: number;
  /** Tempo restante de um empurrão curto, em segundos; quando zera, a força some. */
  empurrao: number;
  /** Amostras [tempo, velocidade] para o gráfico. */
  historico: [number, number][];
  proximaAmostra: number;
}

/** Intervalo entre amostras do gráfico, em segundos. */
export const AMOSTRA = 0.05;
const MAX_AMOSTRAS = 400;

export function criar(F: number, m: number, mu = 0): Estado {
  return { F, m, mu, x: 0, v: 0, t: 0, empurrao: 0, historico: [], proximaAmostra: 0 };
}

/**
 * Força de atrito sobre a caixa, em N (negativa: aponta para trás).
 * Em movimento, vale μ · m · g. Parada, só o necessário para segurar a caixa,
 * até esse mesmo máximo. Nesta simulação, força e velocidade nunca são negativas.
 */
export function atrito(s: Estado) {
  const maximo = s.mu * s.m * G;
  if (s.v > 0) return -maximo;
  return -Math.min(s.F, maximo);
}

export const aceleracao = (s: Estado) => (s.F + atrito(s)) / s.m;

/** Aplica `forca` por `duracao` segundos; depois, nenhuma força age na caixa. */
export function empurrar(s: Estado, forca = 30, duracao = 0.5) {
  s.F = forca;
  s.empurrao = duracao;
}

/** Avança `dt` segundos (Euler semi-implícito: estável e simples). */
export function passo(s: Estado, dt: number) {
  // O atrito freia até parar a caixa, nunca a empurra para trás.
  s.v = Math.max(0, s.v + aceleracao(s) * dt);
  s.x += s.v * dt;
  s.t += dt;
  if (s.empurrao > 0) {
    s.empurrao -= dt;
    if (s.empurrao <= 1e-9) {
      s.empurrao = 0;
      s.F = 0;
    }
  }
  if (s.t >= s.proximaAmostra) {
    s.historico.push([s.t, s.v]);
    if (s.historico.length > MAX_AMOSTRAS) s.historico.shift();
    s.proximaAmostra += AMOSTRA;
  }
}
