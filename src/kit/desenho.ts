// Peças de desenho no estilo vetorial chapado das simulações.
import { cor } from './cores';

type Ctx = CanvasRenderingContext2D;

/** Vetor com haste grossa, ponta arredondada e rótulo numa etiqueta da mesma cor. */
export function seta(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, corSeta: string, rotulo?: string) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 2) return;
  const p = Math.min(12, len * 0.5);
  const cs = Math.cos(ang);
  const sn = Math.sin(ang);

  ctx.save();
  ctx.strokeStyle = ctx.fillStyle = corSeta;
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - cs * p * 0.7, y2 - sn * p * 0.7);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - p * Math.cos(ang - 0.5), y2 - p * Math.sin(ang - 0.5));
  ctx.lineTo(x2 - p * Math.cos(ang + 0.5), y2 - p * Math.sin(ang + 0.5));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (rotulo) {
    ctx.font = `600 12px ${cor('--sans')}`;
    const bw = ctx.measureText(rotulo).width + 14;
    const bh = 20;
    // A etiqueta fica logo depois da ponta, sem encostar nela em nenhum ângulo.
    const d = Math.abs(cs) * (bw / 2) + Math.abs(sn) * (bh / 2) + 7;
    const mx = x2 + cs * d;
    const my = y2 + sn * d;
    ctx.beginPath();
    ctx.roundRect(mx - bw / 2, my - bh / 2, bw, bh, 10);
    ctx.fill();
    ctx.fillStyle = cor('--bg');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rotulo, mx, my + 0.5);
  }
  ctx.restore();
}

/** Nuvem de três círculos com base reta; `s` é o tamanho. Usa o fillStyle atual. */
export function nuvem(ctx: Ctx, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.arc(x - s * 0.55, y + s * 0.1, s * 0.38, 0, Math.PI * 2);
  ctx.arc(x, y - s * 0.12, s * 0.52, 0, Math.PI * 2);
  ctx.arc(x + s * 0.6, y + s * 0.12, s * 0.34, 0, Math.PI * 2);
  ctx.rect(x - s * 0.55, y + s * 0.1, s * 1.15, s * 0.36);
  ctx.fill();
}

/** Forma orgânica: curva suave passando pelos pontos médios de `pts` (em unidades de `r`). */
export function blob(ctx: Ctx, pts: readonly (readonly [number, number])[], cx: number, cy: number, r: number) {
  const P = pts.map(([x, y]) => [cx + x * r, cy + y * r] as const);
  const meio = (i: number) => {
    const a = P[i % P.length];
    const b = P[(i + 1) % P.length];
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as const;
  };
  ctx.beginPath();
  ctx.moveTo(...meio(0));
  for (let i = 1; i <= P.length; i++) {
    const c = P[i % P.length];
    ctx.quadraticCurveTo(c[0], c[1], ...meio(i));
  }
  ctx.closePath();
}

/** Brilhos e pontos decorativos espalhados pela cena, como na abertura do site. */
export function brilhos(ctx: Ctx, w: number, h: number, corBrilho: string) {
  const itens = [
    [0.12, 0.18, 's', 9],
    [0.86, 0.14, 'p', 4],
    [0.92, 0.62, 's', 7],
    [0.08, 0.72, 'p', 3.5],
    [0.22, 0.92, 'p', 3],
    [0.78, 0.9, 's', 6],
    [0.5, 0.04, 'p', 3],
  ] as const;
  ctx.fillStyle = corBrilho;
  for (const [fx, fy, tipo, s] of itens) {
    const x = fx * w;
    const y = fy * h;
    ctx.beginPath();
    if (tipo === 'p') {
      ctx.arc(x, y, s, 0, Math.PI * 2);
    } else {
      ctx.moveTo(x, y - s);
      ctx.quadraticCurveTo(x, y, x + s, y);
      ctx.quadraticCurveTo(x, y, x, y + s);
      ctx.quadraticCurveTo(x, y, x - s, y);
      ctx.quadraticCurveTo(x, y, x, y - s);
    }
    ctx.fill();
  }
}
