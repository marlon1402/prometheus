// Gráfico em tempo real de uma grandeza contra o tempo, com janela deslizante.
import { cor } from './cores';
import type { Tela } from './tela';

interface Opcoes {
  /** Quantos segundos aparecem de uma vez. */
  janela?: number;
  /** Valor mínimo do topo do eixo vertical, para o gráfico não “pular” no começo. */
  minimoY?: number;
}

/** Desenha `pontos` ([tempo, valor]) na tela, com a escala vertical se ajustando ao maior valor. */
export function graficoTempo({ ctx, w, h }: Tela, pontos: readonly (readonly [number, number])[], tempo: number, { janela = 10, minimoY = 5 }: Opcoes = {}) {
  ctx.clearRect(0, 0, w, h);
  if (w < 4) return;

  const esq = 30;
  const topo = 6;
  const H = h - 26;
  const W = w - esq - 8;
  const t1 = Math.max(janela, tempo);
  const t0 = t1 - janela;
  const yMax = Math.max(minimoY, ...pontos.map((p) => p[1])) * 1.15;

  // Grade e rótulos
  ctx.strokeStyle = cor('--line');
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);
  for (const f of [0, 0.5, 1]) {
    ctx.beginPath();
    ctx.moveTo(esq, topo + H * f);
    ctx.lineTo(esq + W, topo + H * f);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.fillStyle = cor('--muted');
  ctx.font = `11px ${cor('--sans')}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  ctx.fillText(String(Math.round(yMax)), esq - 6, topo);
  ctx.fillText(String(Math.round(yMax / 2)), esq - 6, topo + H / 2);
  ctx.fillText('0', esq - 6, topo + H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`${Math.round(t0)} s`, esq + 8, h - 2);
  ctx.fillText(`${Math.round(t1)} s`, esq + W - 10, h - 2);

  const pts = pontos
    .filter(([t]) => t >= t0)
    .map(([t, v]) => [esq + ((t - t0) / janela) * W, topo + H - (v / yMax) * H] as const);
  if (pts.length < 2) return;

  // Área sob a curva, curva e ponto atual
  ctx.fillStyle = cor('--fis');
  ctx.beginPath();
  ctx.moveTo(pts[0][0], topo + H);
  for (const [x, y] of pts) ctx.lineTo(x, y);
  ctx.lineTo(pts[pts.length - 1][0], topo + H);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = cor('--vel');
  ctx.lineWidth = 2.6;
  ctx.lineJoin = ctx.lineCap = 'round';
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();

  const [lx, ly] = pts[pts.length - 1];
  ctx.fillStyle = cor('--vel');
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fill();
}
