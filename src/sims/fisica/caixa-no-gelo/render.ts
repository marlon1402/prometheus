// Desenho da caixa no gelo: paisagem com paralaxe, régua, caixa e vetores.
import { cor } from '../../../kit/cores';
import { seta } from '../../../kit/desenho';
import { fmt } from '../../../kit/formato';
import { desenharCaixa, desenharPaisagem, desenharRegua } from '../../../kit/paisagem';
import type { Tela } from '../../../kit/tela';
import type { Estado } from './simulacao';

/** Pixels por metro na cena. */
const ESCALA = 46;

export function desenhar({ ctx, w, h }: Tela, s: Estado) {
  ctx.clearRect(0, 0, w, h);
  if (w < 4) return;

  const chao = h - 66;
  const bx = w * 0.34;
  const camera = s.x * ESCALA;
  desenharPaisagem(ctx, w, h, chao, camera);
  desenharRegua(ctx, w, h, chao, camera, bx, ESCALA);

  // O tamanho da caixa acompanha a massa.
  const lado = 42 + Math.sqrt(s.m) * 11;

  // Linhas de velocidade atrás da caixa
  if (s.v > 1) {
    ctx.strokeStyle = cor('--muted');
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 2.5;
    const L = Math.min(s.v * 3, 42);
    [0.3, 0.55, 0.8].forEach((f, i) => {
      const y = chao - lado * f;
      const x = bx - lado / 2 - 8 - i * 4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - L, y);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  desenharCaixa(ctx, bx, chao, lado, `${s.m} kg`);

  if (s.F > 0) {
    const y = chao - lado / 2;
    seta(ctx, bx + lado / 2 + 2, y, bx + lado / 2 + 14 + s.F * 3, y, cor('--grav'), `F = ${s.F} N`);
  }
  if (s.v > 0.05) {
    const y = chao - lado - 18;
    seta(ctx, bx - lado / 2, y, bx - lado / 2 + 12 + Math.min(s.v * 7, w * 0.45), y, cor('--vel'), `v = ${fmt(s.v)} m/s`);
  }
}
