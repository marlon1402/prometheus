// O canhão de Newton: uma bala disparada na horizontal do alto de uma montanha,
// sob a gravidade da Terra (sem resistência do ar). Só números, para ser testada.

/** Constante gravitacional × massa da Terra (m³/s²), raio da Terra e altura do canhão (m). */
export const GM = 3.986e14;
export const R = 6.371e6;
export const H0 = 150e3;
export const R0 = R + H0;

export type Fim = { tipo: 'chao'; distancia: number } | { tipo: 'escapou' };

export interface Bala {
  /** Posição e velocidade em metros e m/s, com a Terra na origem e o canhão em (0, R0). */
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
  /** Ângulo percorrido ao redor da Terra, em radianos. */
  angulo: number;
  fim: Fim | null;
  /** Tempo da primeira volta completa, se houver. */
  orbita: number | null;
  /** Pontos já percorridos, para desenhar a trajetória. */
  rastro: [number, number][];
}

export function disparar(v: number): Bala {
  return { x: 0, y: R0, vx: v, vy: 0, t: 0, angulo: 0, fim: null, orbita: null, rastro: [[0, R0]] };
}

function aceleracao(x: number, y: number): [number, number] {
  const r = Math.hypot(x, y);
  const k = -GM / (r * r * r);
  return [k * x, k * y];
}

/** Energia mecânica por unidade de massa; negativa = presa à Terra. */
export const energia = (b: Bala) => 0.5 * (b.vx * b.vx + b.vy * b.vy) - GM / Math.hypot(b.x, b.y);

/**
 * Avança `tempo` segundos com Verlet de velocidade (conserva bem a energia em órbitas).
 * O passo é adaptativo: mais curto perto da Terra, onde a gravidade muda mais depressa.
 */
export function passo(b: Bala, tempo: number) {
  let restante = tempo;
  while (restante > 0 && !b.fim) {
    const r = Math.hypot(b.x, b.y);
    const dt = Math.min(restante, 4 * Math.pow(r / R0, 1.5));
    const [ax, ay] = aceleracao(b.x, b.y);
    const angulo0 = Math.atan2(b.x, b.y);
    b.x += b.vx * dt + 0.5 * ax * dt * dt;
    b.y += b.vy * dt + 0.5 * ay * dt * dt;
    const [bx, by] = aceleracao(b.x, b.y);
    b.vx += 0.5 * (ax + bx) * dt;
    b.vy += 0.5 * (ay + by) * dt;
    b.t += dt;
    restante -= dt;

    let d = Math.atan2(b.x, b.y) - angulo0;
    if (d < -Math.PI) d += 2 * Math.PI;
    if (d > Math.PI) d -= 2 * Math.PI;
    b.angulo += d;

    const rn = Math.hypot(b.x, b.y);
    if (rn <= R) b.fim = { tipo: 'chao', distancia: R * b.angulo };
    else if (rn > 7 * R && energia(b) >= 0) b.fim = { tipo: 'escapou' };
    else if (b.angulo >= 2 * Math.PI && b.orbita === null) b.orbita = b.t;

    // Guarda um ponto a cada ~1,2% do raio percorrido; em órbita, só as últimas voltas.
    const ultimo = b.rastro[b.rastro.length - 1];
    if (Math.hypot(b.x - ultimo[0], b.y - ultimo[1]) > R * 0.012) {
      b.rastro.push([b.x, b.y]);
      if (b.orbita !== null && b.rastro.length > 900) b.rastro.shift();
    }
  }
}

/** Trajetória completa de um disparo, até cair, escapar, dar uma volta ou chegar a `tMax` segundos. */
export function trajetoria(v: number, tMax = 5400, intervalo = 15): [number, number][] {
  const b = disparar(v);
  const pontos: [number, number][] = [[b.x, b.y]];
  while (!b.fim && b.orbita === null && b.t < tMax) {
    passo(b, intervalo);
    pontos.push([b.x, b.y]);
  }
  return pontos;
}
