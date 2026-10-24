// Desenho do cabo de guerra: gramado, marcas no chão, os dois times inclinados
// para trás, a corda com a fita no meio, a força de cada time e a resultante.
import { cor } from '../../../kit/cores';
import { seta } from '../../../kit/desenho';
import { fmt } from '../../../kit/formato';
import { desenharPaisagem } from '../../../kit/paisagem';
import type { Tela } from '../../../kit/tela';
import { LIMITE, resultante, vencedor, type Estado } from './simulacao';

type Ctx = CanvasRenderingContext2D;

/** Força máxima de cada time nos controles, para a escala das setas. */
const F_MAX = 1500;

/** Pessoa puxando a corda, inclinada para longe do centro (`lado` −1 à esquerda, +1 à direita). */
function puxador(ctx: Ctx, pe: number, chao: number, alturaCorda: number, lado: number, corTime: string) {
  const quadril = { x: pe + lado * 9, y: chao - 30 };
  const ombro = { x: pe + lado * 21, y: chao - 54 };
  ctx.strokeStyle = corTime;
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(pe - lado * 6, chao);
  ctx.lineTo(quadril.x, quadril.y);
  ctx.lineTo(pe + lado * 4, chao);
  ctx.moveTo(quadril.x, quadril.y);
  ctx.lineTo(ombro.x, ombro.y);
  ctx.lineTo(ombro.x - lado * 18, alturaCorda);
  ctx.stroke();
  ctx.fillStyle = corTime;
  ctx.beginPath();
  ctx.arc(ombro.x + lado * 5, ombro.y - 11, 8.5, 0, Math.PI * 2);
  ctx.fill();
}

const newtons = (f: number) => `${fmt(Math.abs(f), 0)} N`;

export function desenhar({ ctx, w, h }: Tela, s: Estado) {
  ctx.clearRect(0, 0, w, h);
  if (w < 4) return;

  const chao = h - 58;
  const pxPorM = Math.min(w / 11, 70);
  const centro = w / 2;
  const fita = centro + s.x * pxPorM;
  const alturaCorda = chao - 44;
  const pxPorN = (w * 0.2) / F_MAX;

  desenharPaisagem(ctx, w, h, chao, 0);
  // Gramado por cima do lago da paisagem
  ctx.fillStyle = cor('--land');
  ctx.fillRect(0, chao, w, h - chao);
  ctx.fillStyle = cor('--arvore');
  ctx.fillRect(0, chao, w, 4);

  // Marcas no chão: centro e a linha de vitória de cada lado
  ctx.fillStyle = cor('--ink');
  ctx.fillRect(centro - 1.5, chao + 6, 3, 18);
  ctx.globalAlpha = 0.45;
  for (const lado of [-1, 1]) ctx.fillRect(centro + lado * LIMITE * pxPorM - 1, chao + 8, 2, 14);
  ctx.globalAlpha = 1;

  // Corda
  const pontaEsq = fita - 4.4 * pxPorM;
  const pontaDir = fita + 4.4 * pxPorM;
  ctx.strokeStyle = cor('--tronco');
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(pontaEsq, alturaCorda);
  ctx.lineTo(pontaDir, alturaCorda);
  ctx.stroke();

  const [corEsq, corDir] = [cor('--vel'), cor('--grav')];
  for (const d of [2, 2.9, 3.8]) {
    puxador(ctx, fita - d * pxPorM, chao, alturaCorda, -1, corEsq);
    puxador(ctx, fita + d * pxPorM, chao, alturaCorda, 1, corDir);
  }

  // Fita no meio da corda
  ctx.fillStyle = cor('--fogo');
  ctx.beginPath();
  ctx.moveTo(fita - 6, alturaCorda);
  ctx.lineTo(fita + 6, alturaCorda);
  ctx.lineTo(fita, alturaCorda + 22);
  ctx.closePath();
  ctx.fill();

  // Força de cada time, acima dele
  const yTimes = chao - 104;
  const meioEsq = fita - 2.9 * pxPorM;
  const meioDir = fita + 2.9 * pxPorM;
  if (s.esq > 0) seta(ctx, meioEsq + (s.esq * pxPorN) / 2, yTimes, meioEsq - (s.esq * pxPorN) / 2, yTimes, corEsq, newtons(s.esq));
  if (s.dir > 0) seta(ctx, meioDir - (s.dir * pxPorN) / 2, yTimes, meioDir + (s.dir * pxPorN) / 2, yTimes, corDir, newtons(s.dir));

  // Resultante, no centro da corda
  const fr = resultante(s);
  const yRes = alturaCorda - 72;
  if (Math.abs(fr) > 0) {
    seta(ctx, fita, yRes, fita + fr * pxPorN * 1.6, yRes, cor('--ink'), `Fr = ${newtons(fr)}`, 6);
  } else {
    ctx.font = `600 13px ${cor('--sans')}`;
    ctx.fillStyle = cor('--ink');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Fr = 0', fita, yRes);
  }

  const venceu = vencedor(s);
  if (venceu) {
    const texto = venceu === 'esq' ? 'O time da esquerda venceu' : 'O time da direita venceu';
    ctx.font = `600 15px ${cor('--sans')}`;
    const tw = ctx.measureText(texto).width + 28;
    ctx.fillStyle = cor('--faixa');
    ctx.beginPath();
    ctx.roundRect(w / 2 - tw / 2, 16, tw, 34, 17);
    ctx.fill();
    ctx.fillStyle = cor('--faixa-txt');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto, w / 2, 33.5);
  }
}
