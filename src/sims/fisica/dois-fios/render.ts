// Desenho do objeto pendurado: teto, os dois pontos de fixação (arrastáveis),
// os fios até o nó, o quadro pendurado e as setas das trações e do peso.
// Quando um ângulo pequeno não cabe na largura, a cena fica mais baixa
// (o nó sobe), para os pontos de fixação continuarem visíveis.
import { cor } from '../../../kit/cores';
import { seta } from '../../../kit/desenho';
import type { Tela } from '../../../kit/tela';
import { arrebentados, PESO, tracoes, type Estado } from './simulacao';

const TETO = 34;
const ALTURA_MAX = 130;
const MARGEM = 26;

const tan = (graus: number) => Math.tan((graus * Math.PI) / 180);

/** Posições na tela: o nó, a altura dos fios e o espaço livre de cada lado. */
export function geometria({ w }: Tela, s: Estado) {
  const livre = w / 2 - MARGEM;
  const altura = Math.min(ALTURA_MAX, livre * tan(s.a1), livre * tan(s.a2));
  return { cx: w / 2, teto: TETO, no: TETO + altura, altura, livre };
}

export function desenhar(tela: Tela, s: Estado) {
  const { ctx, w, h } = tela;
  ctx.clearRect(0, 0, w, h);
  if (w < 4) return;

  const { cx, teto, no, altura } = geometria(tela, s);
  const xa = cx - altura / tan(s.a1);
  const xb = cx + altura / tan(s.a2);
  const quebrados = arrebentados(s);
  const { t1, t2 } = tracoes(s);

  // Parede de fundo e teto
  ctx.fillStyle = cor('--bg');
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = cor('--surface');
  ctx.fillRect(0, 0, w, teto);
  ctx.fillStyle = cor('--line');
  ctx.fillRect(0, teto - 3, w, 3);

  // Fios
  ctx.lineCap = 'round';
  const fio = (x: number, n: 1 | 2) => {
    const quebrou = quebrados.includes(n);
    ctx.strokeStyle = quebrou ? cor('--fogo') : cor('--tronco');
    ctx.lineWidth = quebrou ? 3 : 2.5;
    ctx.setLineDash(quebrou ? [6, 5] : []);
    ctx.beginPath();
    ctx.moveTo(x, teto);
    ctx.lineTo(cx, no);
    ctx.stroke();
    ctx.setLineDash([]);
  };
  fio(xa, 1);
  fio(xb, 2);

  // Quadro pendurado logo abaixo do nó
  const qw = 96;
  const qh = 66;
  const qy = no + 22;
  ctx.strokeStyle = cor('--tronco');
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, no);
  ctx.lineTo(cx, qy);
  ctx.stroke();
  ctx.fillStyle = cor('--caixa-esc');
  ctx.beginPath();
  ctx.roundRect(cx - qw / 2, qy, qw, qh, 4);
  ctx.fill();
  ctx.fillStyle = cor('--ceu');
  ctx.fillRect(cx - qw / 2 + 7, qy + 7, qw - 14, qh - 14);
  ctx.fillStyle = cor('--colina1');
  ctx.beginPath();
  ctx.ellipse(cx - 8, qy + qh - 7, 34, 18, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = cor('--fogo-claro');
  ctx.beginPath();
  ctx.arc(cx + 24, qy + 20, 6, 0, Math.PI * 2);
  ctx.fill();

  // Setas: tração de cada fio (a partir do nó, ao longo do fio) e o peso
  const pxPorN = 1.4;
  const ao = (x: number, t: number) => {
    const dx = x - cx;
    const dy = teto - no;
    const len = Math.hypot(dx, dy);
    // Trações muito grandes não cabem no fio: a seta para em 70% dele e a etiqueta mostra o valor.
    const L = Math.min(t * pxPorN, len * 0.7);
    return [cx + (dx / len) * L, no + (dy / len) * L] as const;
  };
  seta(ctx, cx, no, ...ao(xa, t1), cor('--vel'), `T1 = ${Math.round(t1)} N`);
  seta(ctx, cx, no, ...ao(xb, t2), cor('--vel'), `T2 = ${Math.round(t2)} N`);
  const centroQ = qy + qh / 2;
  seta(ctx, cx, centroQ, cx, Math.min(h - 26, centroQ + PESO * pxPorN), cor('--grav'), `P = ${PESO} N`);

  // Nó e pontos de fixação (alças para arrastar)
  ctx.fillStyle = cor('--ink');
  ctx.beginPath();
  ctx.arc(cx, no, 4, 0, Math.PI * 2);
  ctx.fill();
  for (const x of [xa, xb]) {
    ctx.fillStyle = cor('--bg');
    ctx.strokeStyle = cor('--ink');
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, teto, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}
