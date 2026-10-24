// Desenho da força arrastável: paisagem, caixa, a força e as componentes
// tracejadas. Com o retângulo ligado, aparecem também os lados que fecham o
// retângulo, e a força fica como a diagonal dele.
import { cor } from '../../../kit/cores';
import { seta } from '../../../kit/desenho';
import { desenharCaixa, desenharPaisagem } from '../../../kit/paisagem';
import type { Tela } from '../../../kit/tela';
import { componentes, F_MAX, type Estado } from './simulacao';

const LADO = 64;

/** Origem da seta (centro da caixa) e escala, recalculadas a cada tamanho de tela. */
export function geometria({ w, h }: Tela) {
  const chao = h - 66;
  const ox = w / 2;
  const oy = chao - LADO / 2;
  const pxPorN = Math.max(0.5, Math.min((w / 2 - 74) / F_MAX, (oy - 34) / F_MAX));
  return { chao, ox, oy, pxPorN };
}

const n = (v: number) => `${Math.round(Math.abs(v))} N`;

export function desenhar(tela: Tela, s: Estado, retangulo: boolean) {
  const { ctx, w, h } = tela;
  ctx.clearRect(0, 0, w, h);
  if (w < 4) return;

  const { chao, ox, oy, pxPorN } = geometria(tela);
  desenharPaisagem(ctx, w, h, chao, 0);
  desenharCaixa(ctx, ox, chao, LADO, '');

  const { fx, fy } = componentes(s);
  const px = ox + fx * pxPorN;
  const py = oy - fy * pxPorN;
  const corComp = cor('--vel');

  if (retangulo && Math.abs(fx) > 0.5 && fy > 0.5) {
    ctx.save();
    ctx.strokeStyle = corComp;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(ox + fx * pxPorN, oy);
    ctx.lineTo(px, py);
    ctx.lineTo(ox, oy - fy * pxPorN);
    ctx.stroke();
    ctx.restore();
  }

  // Componentes tracejadas, saindo da origem
  ctx.save();
  ctx.setLineDash([7, 6]);
  if (Math.abs(fx) >= 0.5) seta(ctx, ox, oy, ox + fx * pxPorN, oy, corComp, `Fx = ${n(fx)}`);
  if (fy >= 0.5 && Math.abs(fx) >= 0.5) seta(ctx, ox, oy, ox, oy - fy * pxPorN, corComp, `Fy = ${n(fy)}`);
  ctx.restore();

  if (s.F > 0) seta(ctx, ox, oy, px, py, cor('--grav'), `F = ${s.F} N`);

  // Alça para arrastar a ponta
  ctx.fillStyle = cor('--bg');
  ctx.strokeStyle = cor('--grav');
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(px, py, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}
