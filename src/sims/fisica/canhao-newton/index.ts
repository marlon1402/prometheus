// Simulação interativa do canhão de Newton: escolher a velocidade e disparar.
import { ligarSliders } from '../../../kit/controles';
import { cor } from '../../../kit/cores';
import { seta } from '../../../kit/desenho';
import { fmt } from '../../../kit/formato';
import { iniciarLoop } from '../../../kit/loop';
import { buscar } from '../../../kit/montar';
import { criarTela } from '../../../kit/tela';
import { bala, clarao, desenharCena, tracar, type Projetor } from './render';
import { disparar, passo, R, R0, type Bala } from './simulacao';

/** Segundos simulados por segundo real (o tempo está acelerado). */
const ACELERACAO = 650;
/** Quantos disparos anteriores continuam desenhados. */
const MAX_ANTIGOS = 5;
const km = (m: number) => Math.round(m / 1000).toLocaleString('pt-BR');

function resultado(b: Bala | null): string {
  if (!b) return 'Escolha uma velocidade e dispare.';
  if (b.fim?.tipo === 'chao') return `Caiu a ${km(b.fim.distancia)} km do canhão. Mais rápido, e ela iria mais longe.`;
  if (b.fim?.tipo === 'escapou') return 'Escapou da gravidade da Terra e foi para o espaço. Acima de cerca de 11 km/s, ela não volta mais.';
  if (b.orbita !== null) return `Órbita! Deu uma volta completa em ${Math.round(b.orbita / 60)} minutos e continua caindo sem nunca tocar o chão.`;
  if (Math.hypot(b.x, b.y) > R * 1.9) return 'Saiu do quadro, mas a gravidade ainda vai trazê-la de volta…';
  return 'Em voo…';
}

function impacto(ctx: CanvasRenderingContext2D, P: Projetor, b: Bala, opacidade: number) {
  if (b.fim?.tipo !== 'chao') return;
  const [x, y] = P([b.x, b.y]);
  ctx.globalAlpha = opacidade;
  ctx.fillStyle = '#c8b9a6';
  for (const [dx, dy, r] of [[-7, -2, 5], [0, -6, 6], [7, -2, 5], [0, 1, 4]]) {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function iniciar(raiz: HTMLElement) {
  const entrada = buscar<HTMLInputElement>(raiz, '[data-entrada="v"]');
  const saida = buscar(raiz, '[data-saida="v"]');
  const textoResultado = buscar(raiz, '[data-resultado]');
  const [leituraV, leituraH, leituraT] = ['v', 'h', 't'].map((n) => buscar(raiz, `[data-leitura="${n}"]`));
  const tela = criarTela(buscar(raiz, '[data-palco]'), { proporcao: 0.72 });

  let velocidade = Number(entrada.value);
  let atual: Bala | null = null;
  let antigos: Bala[] = [];
  let brilhoDisparo = 0;
  let ultimoResultado = '';

  ligarSliders(raiz);
  entrada.addEventListener('input', () => {
    velocidade = Number(entrada.value);
    saida.textContent = `${fmt(velocidade)} km/s`;
  });

  buscar(raiz, '[data-acao="disparar"]').addEventListener('click', () => {
    if (atual) antigos = [...antigos, atual].slice(-MAX_ANTIGOS);
    atual = disparar(velocidade * 1000);
    brilhoDisparo = 1;
  });

  buscar(raiz, '[data-acao="limpar"]').addEventListener('click', () => {
    antigos = [];
    atual = null;
    for (const l of [leituraV, leituraH, leituraT]) l.textContent = '–';
  });

  const atualizar = (dt: number) => {
    brilhoDisparo = Math.max(0, brilhoDisparo - dt * 2.5);
    if (!atual || atual.fim) return;
    // Longe da Terra o movimento é mais lento na tela, então o tempo corre mais rápido.
    const r = Math.hypot(atual.x, atual.y);
    passo(atual, dt * ACELERACAO * Math.min(6, Math.pow(r / R0, 1.5)));
    leituraV.textContent = `${fmt(Math.hypot(atual.vx, atual.vy) / 1000, 2)} km/s`;
    leituraH.textContent = `${km(Math.max(0, Math.hypot(atual.x, atual.y) - R))} km`;
    leituraT.textContent = `${Math.floor(atual.t / 60)} min`;
  };

  const desenhar = () => {
    const { ctx, w, h } = tela;
    ctx.clearRect(0, 0, w, h);
    if (w < 4) return;
    const { boca, P } = desenharCena(tela, { zoom: 1.75, fundo: 1.62, centroY: 0.53 });
    ctx.lineJoin = ctx.lineCap = 'round';

    // Disparos anteriores, tracejados
    ctx.strokeStyle = cor('--ink');
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.5;
    ctx.setLineDash([2, 6]);
    for (const b of antigos) tracar(ctx, P, b.rastro);
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    for (const b of antigos) impacto(ctx, P, b, 0.5);

    clarao(ctx, boca, brilhoDisparo);

    if (atual) {
      ctx.strokeStyle = cor('--ink');
      ctx.lineWidth = 2.6;
      tracar(ctx, P, atual.fim ? atual.rastro : [...atual.rastro, [atual.x, atual.y]]);
      impacto(ctx, P, atual, 1);
      if (!atual.fim) {
        const [x, y] = P([atual.x, atual.y]);
        const v = Math.hypot(atual.vx, atual.vy);
        const r = Math.hypot(atual.x, atual.y);
        const lv = 26 + v / 200;
        seta(ctx, x, y, x + (atual.vx / v) * lv, y - (atual.vy / v) * lv, cor('--vel'), 'v');
        seta(ctx, x, y, x - (atual.x / r) * 38, y + (atual.y / r) * 38, cor('--grav'), 'g');
        bala(ctx, x, y);
      }
    }

    // O texto do resultado só muda quando necessário, para o leitor de tela não repetir.
    const texto = resultado(atual);
    if (texto !== ultimoResultado) textoResultado.textContent = ultimoResultado = texto;
  };

  iniciarLoop(raiz, { atualizar, desenhar });
}
