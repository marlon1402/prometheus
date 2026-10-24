// Desenho das cordas em ângulo, visto de cima: piso com grade de 1 m, as
// cordas saindo da caixa, a força de cada uma e a resultante mais grossa.
import { cor } from '../../../kit/cores';
import { seta } from '../../../kit/desenho';
import { desenharCaixa } from '../../../kit/paisagem';
import type { Tela } from '../../../kit/tela';
import { componentes, resultante, type Estado } from './simulacao';

const LADO = 46;
/** Cores das cordas 1, 2 e 3. */
export const CORES = ['--vel', '--grav', '--fogo'] as const;

/** Escala da cena e até onde a caixa pode ir antes de chegar à borda, em m. */
export function geometria({ w, h }: Tela) {
  const pxPorM = 42;
  return {
    pxPorM,
    /** Pixels por newton nas setas: 100 N ocupam um terço do lado menor. */
    pxPorN: Math.min(w, h) / 3 / 100,
    limiteX: (w / 2 - LADO / 2 - 6) / pxPorM,
    limiteY: (h / 2 - LADO / 2 - 6) / pxPorM,
  };
}

export function desenhar(tela: Tela, s: Estado) {
  const { ctx, w, h } = tela;
  ctx.clearRect(0, 0, w, h);
  if (w < 4) return;

  const { pxPorM, pxPorN } = geometria(tela);
  const cx = w / 2 + s.x * pxPorM;
  const cy = h / 2 - s.y * pxPorM;

  // Piso com grade de 1 m, centrada no ponto de partida
  ctx.fillStyle = cor('--gelo');
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = cor('--gelo-linha');
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = (w / 2) % pxPorM; x < w; x += pxPorM) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = (h / 2) % pxPorM; y < h; y += pxPorM) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  // Cordas, saindo da caixa até a borda da cena
  const alcance = Math.hypot(w, h);
  ctx.strokeStyle = cor('--tronco');
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const c of s.cordas) {
    if (c.F <= 0) continue;
    const { fx, fy } = componentes({ F: 1, theta: c.theta });
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + fx * alcance, cy - fy * alcance);
    ctx.stroke();
  }

  desenharCaixa(ctx, cx, cy + LADO / 2, LADO, '');

  s.cordas.forEach((c, i) => {
    if (c.F <= 0) return;
    const { fx, fy } = componentes(c);
    seta(ctx, cx, cy, cx + fx * pxPorN, cy - fy * pxPorN, cor(CORES[i]), `F${i + 1} = ${c.F} N`);
  });

  const r = resultante(s.cordas);
  if (r.F >= 0.5) {
    seta(ctx, cx, cy, cx + r.fx * pxPorN, cy - r.fy * pxPorN, cor('--ink'), `Fr = ${Math.round(r.F)} N`, 6.5);
  }

  // Rosa dos ventos, para dar sentido a “norte” e “leste” no texto
  ctx.font = `600 11px ${cor('--sans')}`;
  ctx.fillStyle = cor('--muted');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const rx = w - 30;
  const ry = 34;
  ctx.fillText('N', rx, ry - 18);
  ctx.fillText('L', rx + 18, ry);
  ctx.fillText('S', rx, ry + 18);
  ctx.fillText('O', rx - 18, ry);
  ctx.strokeStyle = cor('--muted');
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(rx, ry - 10);
  ctx.lineTo(rx, ry + 10);
  ctx.moveTo(rx - 10, ry);
  ctx.lineTo(rx + 10, ry);
  ctx.stroke();
}
