// Animação da abertura do site: o canhão dispara sozinho, cada vez mais
// rápido, até a bala entrar em órbita; depois as trajetórias somem e recomeça.
import { cor } from '../../../kit/cores';
import { iniciarLoop, movimentoReduzido } from '../../../kit/loop';
import { buscar } from '../../../kit/montar';
import { criarTela } from '../../../kit/tela';
import { bala, clarao, desenharCena, tracar } from './render';
import { trajetoria } from './simulacao';

const VELOCIDADES = [5600, 6600, 7200, 7550, 7820];

export function iniciarAbertura(raiz: HTMLElement) {
  // Com movimento reduzido, fica a ilustração estática que já está na página.
  if (movimentoReduzido()) return;

  const canvas = buscar<HTMLCanvasElement>(raiz, 'canvas');
  const tela = criarTela(canvas, { proporcao: 1 });
  const caminhos = VELOCIDADES.map((v) => trajetoria(v));

  let i = 0; // disparo atual
  let progresso = 0; // pontos já percorridos no disparo atual
  let pausa = 0;
  let opacidade = 1;

  const atualizar = (dt: number) => {
    if (pausa > 0) {
      pausa -= dt;
      if (pausa <= 0 && i === caminhos.length) {
        i = 0;
        progresso = 0;
        opacidade = 1;
      }
      return;
    }
    const atual = caminhos[i];
    progresso += dt * (i === caminhos.length - 1 ? 26 : 34);
    if (progresso >= atual.length - 1) {
      if (i < caminhos.length - 1) {
        i++;
        progresso = 0;
        pausa = 0.5;
      } else if (progresso >= atual.length * 2.2) {
        i = caminhos.length;
        pausa = 1.2;
      }
    }
    if (i === caminhos.length) opacidade = Math.max(0, opacidade - dt * 1.4);
  };

  const desenhar = () => {
    const { ctx, w, h } = tela;
    ctx.clearRect(0, 0, w, h);
    if (w < 4) return;
    const { boca, P } = desenharCena(tela, { zoom: 1.45, fundo: 1.24, centroY: 0.54 });
    ctx.lineJoin = ctx.lineCap = 'round';

    // Disparos anteriores, tracejados
    ctx.strokeStyle = cor('--ink');
    ctx.lineWidth = 1.6;
    ctx.setLineDash([2, 6]);
    ctx.globalAlpha = 0.35 * opacidade;
    for (let k = 0; k < Math.min(i, caminhos.length); k++) tracar(ctx, P, caminhos[k]);
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    if (i < caminhos.length && pausa <= 0) clarao(ctx, boca, Math.max(0, 1 - progresso / 8));

    if (i < caminhos.length) {
      const pts = caminhos[i];
      const n = Math.floor(Math.min(progresso, pts.length * 2.2));
      ctx.strokeStyle = cor('--ink');
      ctx.lineWidth = 2.4;
      // Na órbita, a bala continua dando voltas por cima do traço completo.
      if (n >= pts.length) {
        ctx.globalAlpha = 0.9;
        tracar(ctx, P, pts);
        ctx.globalAlpha = 1;
      } else {
        tracar(ctx, P, pts, n);
      }
      const [x, y] = P(pts[n % pts.length]);
      bala(ctx, x, y, 5);
    }
  };

  iniciarLoop(raiz, { atualizar, desenhar });
  // A ilustração estática sai de cena só depois de o canvas ter desenhado.
  raiz.classList.add('animada');
}
