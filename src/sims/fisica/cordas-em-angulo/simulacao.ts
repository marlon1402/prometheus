// Caixa vista de cima, puxada por até três cordas. Cada corda tem intensidade
// e ângulo; a resultante é a soma vetorial, feita pelas componentes:
// somam-se as componentes de cada eixo e só então se juntam as duas somas.
// Solta, a caixa acelera na direção da resultante, segundo a = Fr / m.
// Ângulos em graus, medidos a partir do leste (direita), no sentido anti-horário.

/** Massa da caixa, em kg. */
export const MASSA = 20;

export interface Corda {
  /** Intensidade, em N. Uma corda com 0 N fica frouxa. */
  F: number;
  theta: number;
}

export interface Estado {
  cordas: Corda[];
  /** Posição (m) e velocidade (m/s); y positivo para o norte (cima). */
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function criar(cordas: Corda[]): Estado {
  return { cordas: cordas.map((c) => ({ ...c })), x: 0, y: 0, vx: 0, vy: 0 };
}

const limpar = (n: number) => (Math.abs(n) < 1e-9 ? 0 : n);

/** Componentes de uma força, em N. */
export function componentes({ F, theta }: Corda) {
  const rad = (theta * Math.PI) / 180;
  return { fx: limpar(F * Math.cos(rad)), fy: limpar(F * Math.sin(rad)) };
}

/** Resultante das cordas: componentes, intensidade e ângulo (0 a 360°). */
export function resultante(cordas: Corda[]) {
  let fx = 0;
  let fy = 0;
  for (const c of cordas) {
    const comp = componentes(c);
    fx += comp.fx;
    fy += comp.fy;
  }
  fx = limpar(fx);
  fy = limpar(fy);
  const theta = ((Math.atan2(fy, fx) * 180) / Math.PI + 360) % 360;
  return { fx, fy, F: Math.hypot(fx, fy), theta };
}

export function passo(s: Estado, dt: number) {
  const { fx, fy } = resultante(s.cordas);
  s.vx += (fx / MASSA) * dt;
  s.vy += (fy / MASSA) * dt;
  s.x += s.vx * dt;
  s.y += s.vy * dt;
}
