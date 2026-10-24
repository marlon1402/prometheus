// Força como vetor: uma força de intensidade F, inclinada de θ em relação à
// horizontal, e suas componentes Fx = F · cos θ e Fy = F · sen θ.
// A ponta da seta pode ser arrastada; o arraste vira intensidade e ângulo.

/** Intensidade máxima da força, em N. */
export const F_MAX = 100;

export interface Estado {
  /** Intensidade, em N (inteiro de 0 a F_MAX). */
  F: number;
  /** Ângulo com a horizontal, em graus (inteiro de 0 a 180). */
  theta: number;
}

export function criar(F = 50, theta = 30): Estado {
  return { F, theta };
}

/** Zera resíduos de ponto flutuante, para cos 90° dar 0 e não 6 · 10⁻¹⁷. */
const limpar = (n: number) => (Math.abs(n) < 1e-9 ? 0 : n);

/** Componentes horizontal (positiva para a direita) e vertical (positiva para cima), em N. */
export function componentes({ F, theta }: Estado) {
  const rad = (theta * Math.PI) / 180;
  return { fx: limpar(F * Math.cos(rad)), fy: limpar(F * Math.sin(rad)) };
}

/**
 * Converte a posição da ponta da seta, relativa à origem e em pixels (y para
 * baixo, como no canvas), em intensidade e ângulo. A seta não aponta para
 * baixo da horizontal, e a intensidade fica entre 0 e F_MAX.
 */
export function apontar(s: Estado, dx: number, dy: number, pxPorN: number) {
  const cima = Math.max(0, -dy);
  s.F = Math.min(F_MAX, Math.round(Math.hypot(dx, cima) / pxPorN));
  if (s.F > 0) s.theta = Math.round((Math.atan2(cima, dx) * 180) / Math.PI);
}
