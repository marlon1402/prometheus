// Desenho do dinamômetro: suporte, mola, objeto pendurado e escala em newtons.
import { cor } from '../../../kit/cores';
import { brilhos, seta } from '../../../kit/desenho';
import { fmt } from '../../../kit/formato';
import type { Tela } from '../../../kit/tela';
import { peso, type Estado } from './simulacao';

/** Pixels de estiramento por newton. */
export const PX_POR_N = 22;
/** Maior valor da escala, em newtons. */
const ESCALA_MAX = 10;

type Ctx = CanvasRenderingContext2D;

/** Objetos disponíveis, pela massa em kg. */
const OBJETOS: Record<number, (ctx: Ctx) => void> = {
  // Maçã
  0.1: (ctx) => {
    ctx.fillStyle = '#e8524a';
    ctx.beginPath();
    ctx.arc(-7, 22, 15, 0, Math.PI * 2);
    ctx.arc(7, 22, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7fcf8f';
    ctx.beginPath();
    ctx.ellipse(8, 4, 8, 4, -0.5, 0, Math.PI * 2);
    ctx.fill();
  },
  // Celular
  0.2: (ctx) => {
    ctx.fillStyle = '#2f3a4a';
    ctx.beginPath();
    ctx.roundRect(-16, 6, 32, 56, 7);
    ctx.fill();
    ctx.fillStyle = '#5b9cf2';
    ctx.beginPath();
    ctx.roundRect(-12, 12, 24, 42, 4);
    ctx.fill();
  },
  // Livro
  0.5: (ctx) => {
    ctx.fillStyle = '#3d8fd6';
    ctx.beginPath();
    ctx.roundRect(-30, 6, 60, 46, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-30, 42, 60, 6);
    ctx.fillStyle = '#ffc94d';
    ctx.fillRect(-18, 16, 36, 6);
  },
  // Garrafa
  1: (ctx) => {
    ctx.fillStyle = '#9fd0f5';
    ctx.beginPath();
    ctx.roundRect(-20, 22, 40, 74, 10);
    ctx.fill();
    ctx.fillStyle = '#3d8fd6';
    ctx.beginPath();
    ctx.roundRect(-9, 4, 18, 22, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    ctx.fillRect(-12, 34, 6, 44);
    ctx.globalAlpha = 1;
  },
};

export function desenhar({ ctx, w, h }: Tela, s: Estado) {
  ctx.clearRect(0, 0, w, h);
  if (w < 4) return;
  ctx.fillStyle = cor('--ceu');
  ctx.fillRect(0, 0, w, h);
  brilhos(ctx, w, h, cor('--fis-ink'));

  const cx = w / 2 - 30;
  const topo = 40;

  // Suporte de madeira
  ctx.fillStyle = cor('--caixa');
  ctx.beginPath();
  ctx.roundRect(cx - 120, topo - 22, 240, 20, 6);
  ctx.fill();
  ctx.fillStyle = cor('--caixa-esc');
  ctx.fillRect(cx - 120, topo - 6, 240, 4);

  // Mola em zigue-zague, do gancho até o ponto de carga
  const L0 = 70;
  const fim = topo + L0 + s.x * PX_POR_N;
  const voltas = 12;
  ctx.strokeStyle = cor('--ink');
  ctx.lineWidth = 3;
  ctx.lineJoin = ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, topo - 2);
  ctx.lineTo(cx, topo + 10);
  for (let i = 0; i <= voltas; i++) {
    const y = topo + 10 + ((fim - 10 - (topo + 10)) * i) / voltas;
    ctx.lineTo(cx + (i === 0 || i === voltas ? 0 : i % 2 ? -14 : 14), y);
  }
  ctx.lineTo(cx, fim);
  ctx.stroke();

  // Gancho e objeto
  ctx.beginPath();
  ctx.arc(cx, fim + 6, 6, -Math.PI / 2, Math.PI * 0.9);
  ctx.stroke();
  ctx.save();
  ctx.translate(cx, fim + 10);
  OBJETOS[s.m]?.(ctx);
  ctx.restore();

  // Escala em newtons, com ponteiro no fim da mola
  const rx = cx + 70;
  const y0 = topo + L0;
  ctx.fillStyle = cor('--bg');
  ctx.beginPath();
  ctx.roundRect(rx - 6, y0 - 16, 64, ESCALA_MAX * PX_POR_N + 32, 10);
  ctx.fill();
  ctx.font = `600 11px ${cor('--sans')}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let n = 0; n <= ESCALA_MAX; n++) {
    const y = y0 + n * PX_POR_N;
    ctx.strokeStyle = cor('--muted');
    ctx.lineWidth = n % 5 === 0 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(rx, y);
    ctx.lineTo(rx + (n % 5 === 0 ? 16 : 10), y);
    ctx.stroke();
    if (n % 2 === 0) {
      ctx.fillStyle = cor('--muted');
      ctx.fillText(`${n} N`, rx + 22, y);
    }
  }
  ctx.strokeStyle = cor('--vel');
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.moveTo(cx + 8, fim);
  ctx.lineTo(rx - 2, fim);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = cor('--vel');
  ctx.beginPath();
  ctx.moveTo(rx - 2, fim);
  ctx.lineTo(rx - 12, fim - 6);
  ctx.lineTo(rx - 12, fim + 6);
  ctx.closePath();
  ctx.fill();

  // Peso puxando a mola para baixo
  const P = peso(s.m);
  seta(ctx, cx - 60, fim + 14, cx - 60, fim + 14 + 18 + P * 6, cor('--grav'), `F = ${fmt(P)} N`);
}
