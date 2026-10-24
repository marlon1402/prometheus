// Desenho do carro freando: paisagem com paralaxe, estrada, o muro (na batida),
// o carro em corte lateral e o boneco no banco, com ou sem cinto.
// A câmera acompanha o carro, que fica parado na tela enquanto o cenário rola.
import { cor } from '../../../kit/cores';
import { desenharPaisagem } from '../../../kit/paisagem';
import type { Tela } from '../../../kit/tela';
import { desaceleracao, FOLGA, type Estado } from './simulacao';

type Ctx = CanvasRenderingContext2D;

/** Pixels por metro. */
const ESCALA = 50;
/** Comprimento do carro, em m. */
const COMPRIMENTO = 4.4;

function boneco(ctx: Ctx, quadril: number, assento: number, inclinacao: number, cinto: boolean) {
  const corpo = cor('--grav');
  const tronco = 28;
  const ombroX = quadril + Math.sin(inclinacao) * tronco;
  const ombroY = assento - Math.cos(inclinacao) * tronco;
  ctx.strokeStyle = corpo;
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.lineWidth = 7;
  ctx.beginPath();
  // Pernas para a frente, até o assoalho
  ctx.moveTo(quadril, assento);
  ctx.lineTo(quadril + 24, assento);
  ctx.lineTo(quadril + 30, assento + 18);
  // Tronco e braço até o volante
  ctx.moveTo(quadril, assento);
  ctx.lineTo(ombroX, ombroY);
  ctx.lineTo(ombroX + 16, ombroY + 12);
  ctx.stroke();
  ctx.fillStyle = corpo;
  ctx.beginPath();
  ctx.arc(ombroX + Math.sin(inclinacao) * 12, ombroY - Math.cos(inclinacao) * 12, 9, 0, Math.PI * 2);
  ctx.fill();

  if (cinto) {
    ctx.strokeStyle = cor('--ink');
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ombroX - 2, ombroY + 2);
    ctx.lineTo(quadril + 8, assento - 2);
    ctx.stroke();
  }
}

export function desenhar({ ctx, w, h }: Tela, s: Estado) {
  ctx.clearRect(0, 0, w, h);
  if (w < 4) return;

  const chao = h - 56;
  const camera = s.x * ESCALA;
  desenharPaisagem(ctx, w, h, chao, camera);

  // Estrada com faixa tracejada que rola com o carro
  ctx.fillStyle = cor('--faixa');
  ctx.fillRect(0, chao, w, h - chao);
  ctx.fillStyle = cor('--faixa-txt');
  const periodo = 70;
  const desloc = ((camera % periodo) + periodo) % periodo;
  for (let x = -desloc; x < w; x += periodo) ctx.fillRect(x, chao + 24, 34, 4);

  // Frente do carro fixa na tela; o resto se posiciona em relação a ela.
  const frente = Math.min(w * 0.62, w - 90);
  const traseira = frente - COMPRIMENTO * ESCALA;

  if (s.muro !== null) {
    const xm = frente + (s.muro - s.x) * ESCALA;
    ctx.fillStyle = cor('--caixa-esc');
    ctx.fillRect(xm, chao - 120, 40, 120);
    ctx.strokeStyle = cor('--caixa');
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const y = chao - 120 + i * 20;
      ctx.beginPath();
      ctx.moveTo(xm, y);
      ctx.lineTo(xm + 40, y);
      ctx.moveTo(xm + (i % 2 ? 12 : 26), y);
      ctx.lineTo(xm + (i % 2 ? 12 : 26), y + 20);
      ctx.stroke();
    }
  }

  // Carro: carroceria, cabine aberta em corte, rodas
  const base = chao - 14;
  const corCarro = cor('--vel');
  ctx.fillStyle = corCarro;
  ctx.beginPath();
  ctx.roundRect(traseira, base - 46, frente - traseira, 46, 12);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(traseira + 34, base - 44);
  ctx.lineTo(traseira + 62, base - 92);
  ctx.lineTo(frente - 78, base - 92);
  ctx.lineTo(frente - 44, base - 44);
  ctx.closePath();
  ctx.fill();
  // Interior em corte
  ctx.fillStyle = cor('--ceu');
  ctx.beginPath();
  ctx.moveTo(traseira + 46, base - 44);
  ctx.lineTo(traseira + 68, base - 84);
  ctx.lineTo(frente - 82, base - 84);
  ctx.lineTo(frente - 58, base - 44);
  ctx.closePath();
  ctx.fill();

  // Banco, painel e volante
  const quadril = traseira + 92;
  const assento = base - 40;
  ctx.fillStyle = cor('--tronco');
  ctx.beginPath();
  ctx.roundRect(quadril - 16, assento - 40, 12, 46, 4);
  ctx.roundRect(quadril - 14, assento, 40, 8, 3);
  ctx.fill();
  // O painel fica onde o boneco sem cinto encosta depois de percorrer a folga.
  const painel = quadril + FOLGA * ESCALA + 36;
  ctx.fillStyle = cor('--ink');
  ctx.beginPath();
  ctx.roundRect(painel, base - 66, 26, 18, 5);
  ctx.fill();
  ctx.strokeStyle = cor('--ink');
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(painel, base - 58);
  ctx.lineTo(painel - 12, base - 74);
  ctx.stroke();

  // Boneco: sem cinto, desliza para a frente; com cinto, só se inclina na freada.
  const inclinacao = s.cinto ? Math.min(0.45, desaceleracao(s) * 0.02) : s.impacto !== null ? 0.5 : 0;
  boneco(ctx, quadril + s.rel * ESCALA, assento, inclinacao, s.cinto);

  for (const x of [traseira + 40, frente - 44]) {
    ctx.fillStyle = cor('--ink');
    ctx.beginPath();
    ctx.arc(x, base, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cor('--surface');
    ctx.beginPath();
    ctx.arc(x, base, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Selo de “câmera lenta”, desenhado por cima da cena. */
export function seloCameraLenta({ ctx }: Tela) {
  const texto = 'Câmera lenta';
  ctx.font = `600 13px ${cor('--sans')}`;
  const tw = ctx.measureText(texto).width + 24;
  ctx.fillStyle = cor('--faixa');
  ctx.beginPath();
  ctx.roundRect(14, 14, tw, 28, 14);
  ctx.fill();
  ctx.fillStyle = cor('--faixa-txt');
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(texto, 26, 28.5);
}
