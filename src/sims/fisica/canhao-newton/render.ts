// Desenho comum à simulação e à animação da abertura: fundo, Terra com a
// montanha, e a projeção das posições (em metros) para a tela.
import { cor } from '../../../kit/cores';
import { brilhos } from '../../../kit/desenho';
import { desenharTerra } from '../../../kit/terra';
import type { Tela } from '../../../kit/tela';
import { H0, R, R0 } from './simulacao';

export type Projetor = (p: readonly [number, number]) => [number, number];

/**
 * Converte posições do mundo para a tela. A montanha é “esticada” só no desenho,
 * para ficar visível; perto dela, as trajetórias acompanham o esticamento.
 */
function projetor(cx: number, cy: number, escala: number, topo: number): Projetor {
  const extra = Math.max(0, (cy - topo) / escala - R0);
  return ([x, y]) => {
    const r = Math.hypot(x, y);
    const f = r < R0 ? Math.max(0, (r - R) / (R0 - R)) : Math.max(0, 1 - (r - R0) / (R * 0.4));
    const k = (r + extra * f) / r;
    return [cx + x * escala * k, cy - y * escala * k];
  };
}

interface Opcoes {
  /** Quantos raios da Terra cabem na metade do menor lado da tela. */
  zoom: number;
  /** Raio do círculo pastel de fundo, em raios da Terra. */
  fundo: number;
  /** Centro vertical da Terra, como fração da altura. */
  centroY: number;
}

/** Desenha o cenário e devolve onde fica a boca do canhão e o projetor. */
export function desenharCena({ ctx, w, h }: Tela, { zoom, fundo, centroY }: Opcoes) {
  const escala = (Math.min(w, h) * 0.5) / (zoom * R);
  const cx = w / 2;
  const cy = h * centroY;
  const r = R * escala;

  ctx.fillStyle = cor('--fis');
  ctx.beginPath();
  ctx.arc(cx, cy, r * fundo, 0, Math.PI * 2);
  ctx.fill();
  brilhos(ctx, w, h, cor('--fis-ink'));

  const topo = desenharTerra(ctx, cx, cy, r, { montanha: Math.max(18, H0 * escala) });
  return { boca: [cx + 12, topo - 3] as const, P: projetor(cx, cy, escala, topo) };
}

/** Clarão laranja do disparo; `intensidade` vai de 1 (disparo) a 0. */
export function clarao(ctx: CanvasRenderingContext2D, [x, y]: readonly [number, number], intensidade: number) {
  if (intensidade <= 0) return;
  ctx.globalAlpha = intensidade;
  ctx.fillStyle = cor('--fogo');
  ctx.beginPath();
  ctx.arc(x, y, 8 * intensidade + 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = cor('--fogo-claro');
  ctx.beginPath();
  ctx.arc(x, y, 4.5 * intensidade + 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Linha passando pelos pontos projetados; `ate` limita quantos pontos desenhar. */
export function tracar(ctx: CanvasRenderingContext2D, P: Projetor, pontos: readonly (readonly [number, number])[], ate = pontos.length - 1) {
  if (pontos.length < 2) return;
  ctx.beginPath();
  for (let k = 0; k <= ate; k++) {
    const [x, y] = P(pontos[k % pontos.length]);
    if (k) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.stroke();
}

/** A bala: um ponto escuro com um pequeno brilho. */
export function bala(ctx: CanvasRenderingContext2D, x: number, y: number, raio = 6) {
  ctx.fillStyle = cor('--ink');
  ctx.beginPath();
  ctx.arc(x, y, raio, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.arc(x - raio / 3, y - raio / 3, raio / 3, 0, Math.PI * 2);
  ctx.fill();
}
