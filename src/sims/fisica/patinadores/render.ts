// Desenho dos patinadores: lago congelado, os dois patinadores (a altura
// acompanha a massa), as forças durante o empurrão e as velocidades depois.
// O patinador observado tem as forças sobre ele em destaque; a outra fica apagada.
import { cor } from '../../../kit/cores';
import { seta } from '../../../kit/desenho';
import { fmt } from '../../../kit/formato';
import { desenharPaisagem } from '../../../kit/paisagem';
import type { Tela } from '../../../kit/tela';
import { empurrando, FORCA, type Estado } from './simulacao';

type Ctx = CanvasRenderingContext2D;

export type Observado = 'a' | 'b' | 'ambos';

/** Pixels por metro. */
export const ESCALA = 60;
/** Comprimento máximo do braço estendido, em pixels. */
const BRACO = 0.6 * ESCALA;

/** Patinador de pé, virado para o centro (`lado` −1 à esquerda, +1 à direita). */
function patinador(ctx: Ctx, x: number, chao: number, massa: number, lado: number, contato: number | null, corP: string) {
  const altura = 62 + massa * 0.9;
  const quadril = chao - altura * 0.45;
  const ombro = chao - altura * 0.8;
  const cabeca = chao - altura + 10;
  ctx.strokeStyle = corP;
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.lineWidth = 4 + massa / 25;
  ctx.beginPath();
  // Pernas
  ctx.moveTo(x - 8, chao - 6);
  ctx.lineTo(x, quadril);
  ctx.lineTo(x + 8, chao - 6);
  // Tronco
  ctx.moveTo(x, quadril);
  ctx.lineTo(x, ombro);
  // Braços: estendidos até o ponto de contato durante o empurrão (até o comprimento do braço), abertos depois
  if (contato !== null) {
    ctx.moveTo(x, ombro + 4);
    ctx.lineTo(x - lado * Math.min(Math.abs(x - contato), BRACO), ombro + 10);
  } else {
    ctx.moveTo(x - 14, ombro + 26);
    ctx.lineTo(x, ombro + 4);
    ctx.lineTo(x + 14, ombro + 26);
  }
  ctx.stroke();
  ctx.fillStyle = corP;
  ctx.beginPath();
  ctx.arc(x, cabeca, 8 + massa / 20, 0, Math.PI * 2);
  ctx.fill();
  // Patins
  ctx.strokeStyle = cor('--ink');
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 16, chao - 2);
  ctx.lineTo(x - 2, chao - 2);
  ctx.moveTo(x + 2, chao - 2);
  ctx.lineTo(x + 16, chao - 2);
  ctx.stroke();
}

export function desenhar({ ctx, w, h }: Tela, s: Estado, observado: Observado) {
  ctx.clearRect(0, 0, w, h);
  if (w < 4) return;

  const chao = h - 60;
  const cx = w / 2;
  desenharPaisagem(ctx, w, h, chao, 0);

  const xa = cx + s.xa * ESCALA;
  const xb = cx + s.xb * ESCALA;
  const juntos = !s.empurrou || empurrando(s);
  const [corA, corB] = [cor('--vel'), cor('--grav')];
  const contato = juntos ? cx : null;
  patinador(ctx, xa, chao, s.ma, -1, contato, corA);
  patinador(ctx, xb, chao, s.mb, 1, contato, corB);

  const alturaDe = (m: number) => 62 + m * 0.9;
  const etiqueta = (x: number, m: number) => {
    ctx.font = `600 12px ${cor('--sans')}`;
    ctx.fillStyle = cor('--ink');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`${m} kg`, x, chao - alturaDe(m) - 14);
  };
  etiqueta(xa, s.ma);
  etiqueta(xb, s.mb);

  // Forças durante o empurrão: mesma intensidade, sentidos opostos, cada uma num patinador.
  if (empurrando(s)) {
    const comp = FORCA * 0.7;
    const y = chao - 40;
    const forca = (x: number, sentido: number, quem: 'a' | 'b', rotulo: string) => {
      ctx.save();
      ctx.globalAlpha = observado === 'ambos' || observado === quem ? 1 : 0.22;
      seta(ctx, x, y, x + sentido * comp, y, cor('--fogo'), rotulo);
      ctx.restore();
    };
    forca(xa, -1, 'a', `${FORCA} N`);
    forca(xb, 1, 'b', `${FORCA} N`);
  }

  // Velocidades depois do empurrão
  if (s.empurrou && !empurrando(s)) {
    const y = chao - Math.max(alturaDe(s.ma), alturaDe(s.mb)) - 40;
    const vel = (x: number, v: number) => {
      if (Math.abs(v) < 0.01) return;
      seta(ctx, x, y, x + v * 40 + Math.sign(v) * 10, y, cor('--vel'), `${fmt(Math.abs(v), 2)} m/s`);
    };
    vel(xa, s.va);
    vel(xb, s.vb);
  }
}
