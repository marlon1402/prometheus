// A Terra em estilo ilustração vetorial: formas chapadas, sem gradiente.
// As cores são as mesmas nos dois temas, como na abertura do site.
import { blob, nuvem } from './desenho';

const TERRA = {
  mar: '#5b9cf2',
  terra: '#7fcf8f',
  terraSombra: '#69b97a',
  nuvem: '#ffffff',
  montanha: '#a39486',
  neve: '#ffffff',
  canhao: '#3b3f46',
  continentes: [
    [[-0.86, -0.02], [-0.74, -0.22], [-0.58, -0.2], [-0.5, -0.04], [-0.36, 0.02], [-0.3, 0.2], [-0.4, 0.3], [-0.34, 0.48], [-0.46, 0.66], [-0.6, 0.6], [-0.64, 0.4], [-0.78, 0.3], [-0.8, 0.12]],
    [[0.1, -0.42], [0.24, -0.58], [0.46, -0.6], [0.56, -0.46], [0.72, -0.4], [0.76, -0.18], [0.62, -0.06], [0.6, 0.1], [0.46, 0.06], [0.4, -0.1], [0.24, -0.12], [0.16, -0.26]],
    [[0.04, 0.4], [0.2, 0.3], [0.34, 0.38], [0.48, 0.36], [0.52, 0.52], [0.4, 0.64], [0.22, 0.72], [0.08, 0.62]],
    [[-0.46, -0.66], [-0.3, -0.78], [-0.1, -0.74], [-0.02, -0.62], [-0.16, -0.52], [-0.32, -0.54]],
    [[0.7, 0.26], [0.8, 0.22], [0.84, 0.34], [0.74, 0.4]],
    [[-0.14, 0.22], [-0.04, 0.18], [0.0, 0.28], [-0.1, 0.32]],
  ],
  nuvens: [
    [-0.3, -0.3, 0.16],
    [0.48, 0.3, 0.13],
    [-0.62, 0.72, 0.1],
  ],
} as const;

interface Opcoes {
  /** Altura da montanha com o canhão no topo, em pixels. Sem ela, não há montanha. */
  montanha?: number;
}

/**
 * Desenha a Terra com centro (cx, cy) e raio r.
 * Devolve a altura (y) do topo da montanha, ou o topo da Terra se não houver montanha.
 */
export function desenharTerra(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, { montanha }: Opcoes = {}): number {
  // Oceano
  ctx.fillStyle = TERRA.mar;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  // Continentes, com uma faixa de sombra chapada
  for (const c of TERRA.continentes) {
    ctx.fillStyle = TERRA.terraSombra;
    blob(ctx, c, cx + r * 0.03, cy + r * 0.03, r);
    ctx.fill();
    ctx.fillStyle = TERRA.terra;
    blob(ctx, c, cx, cy, r);
    ctx.fill();
  }
  // Sombra em crescente, do lado oposto à luz
  ctx.fillStyle = 'rgba(20, 50, 110, 0.16)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.arc(cx - r * 0.16, cy - r * 0.14, r * 1.02, 0, Math.PI * 2, true);
  ctx.fill('evenodd');
  // Nuvens
  ctx.fillStyle = TERRA.nuvem;
  ctx.globalAlpha = 0.92;
  for (const [x, y, s] of TERRA.nuvens) nuvem(ctx, cx + x * r, cy + y * r, s * r);
  ctx.globalAlpha = 1;
  ctx.restore();

  // Brilho no canto superior esquerdo
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = Math.max(2, r * 0.025);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.86, Math.PI * 1.08, Math.PI * 1.32);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.86, Math.PI * 1.38, Math.PI * 1.43);
  ctx.stroke();

  if (montanha === undefined) return cy - r;

  // Montanha com pico nevado e o canhão no alto
  const base = cy - r + 4;
  const topo = cy - r - montanha;
  const lg = Math.max(22, r * 0.14);
  ctx.fillStyle = TERRA.montanha;
  ctx.beginPath();
  ctx.moveTo(cx - lg, base + 6);
  ctx.lineTo(cx - 3, topo);
  ctx.lineTo(cx + 3, topo);
  ctx.lineTo(cx + lg, base + 6);
  ctx.closePath();
  ctx.fill();

  const f = 0.38;
  const altura = base + 6 - topo;
  ctx.fillStyle = TERRA.neve;
  ctx.beginPath();
  ctx.moveTo(cx - 3, topo);
  ctx.lineTo(cx + 3, topo);
  ctx.lineTo(cx + 3 + (lg - 3) * f, topo + altura * f);
  ctx.lineTo(cx + 4, topo + altura * f * 0.7);
  ctx.lineTo(cx - 4, topo + altura * f * 0.95);
  ctx.lineTo(cx - 3 - (lg - 3) * f, topo + altura * f);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = TERRA.canhao;
  ctx.beginPath();
  ctx.roundRect(cx - 3, topo - 6, 14, 6, 3);
  ctx.fill();
  return topo;
}
