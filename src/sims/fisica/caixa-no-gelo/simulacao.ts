// Caixa num lago congelado, sem atrito: F = m · a.
// Só números, sem desenho, para poder ser testada.

export interface Estado {
  /** Força aplicada, em newtons. */
  F: number;
  /** Massa, em kg. */
  m: number;
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

export function criar(F: number, m: number): Estado {
  return { F, m, x: 0, v: 0, t: 0, empurrao: 0, historico: [], proximaAmostra: 0 };
}

export const aceleracao = (s: Estado) => s.F / s.m;

/** Aplica `forca` por `duracao` segundos; depois, nenhuma força age na caixa. */
export function empurrar(s: Estado, forca = 30, duracao = 0.5) {
  s.F = forca;
  s.empurrao = duracao;
}

/** Avança `dt` segundos (Euler semi-implícito: estável e simples). */
export function passo(s: Estado, dt: number) {
  s.v += aceleracao(s) * dt;
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
