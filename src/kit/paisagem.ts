// Cenário ao ar livre (céu, sol, nuvens, colinas, árvores e lago congelado)
// e a caixa de madeira. As camadas rolam em velocidades diferentes (paralaxe)
// para dar sensação de movimento.
import { cor } from './cores';
import { nuvem } from './desenho';

type Ctx = CanvasRenderingContext2D;

/** Repete `desenhar` ao longo da largura, deslocado por `camera × fator`. */
function faixa(camera: number, fator: number, periodo: number, w: number, desenhar: (x: number) => void) {
  const deslocamento = (((camera * fator) % periodo) + periodo) % periodo;
  for (let x = -deslocamento - periodo; x < w + periodo; x += periodo) desenhar(x);
}

/**
 * Desenha a paisagem com o chão (gelo) na altura `chao`.
 * `camera` é o deslocamento horizontal em pixels: aumenta conforme o objeto anda.
 */
export function desenharPaisagem(ctx: Ctx, w: number, h: number, chao: number, camera: number) {
  ctx.fillStyle = cor('--ceu');
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = cor('--fogo-claro');
  ctx.beginPath();
  ctx.arc(w - 64, 50, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = cor('--nuvem');
  faixa(camera, 0.12, 300, w, (x) => {
    nuvem(ctx, x + 60, 52, 34);
    nuvem(ctx, x + 210, 86, 24);
  });

  ctx.fillStyle = cor('--colina1');
  faixa(camera, 0.22, 240, w, (x) => {
    ctx.beginPath();
    ctx.ellipse(x + 120, chao + 30, 170, 78, 0, Math.PI, 0);
    ctx.fill();
  });
  ctx.fillStyle = cor('--colina2');
  faixa(camera, 0.42, 190, w, (x) => {
    ctx.beginPath();
    ctx.ellipse(x + 40, chao + 18, 120, 50, 0, Math.PI, 0);
    ctx.fill();
  });

  faixa(camera, 0.7, 160, w, (x) => {
    ctx.fillStyle = cor('--tronco');
    ctx.fillRect(x + 78, chao - 26, 6, 26);
    ctx.fillStyle = cor('--arvore');
    ctx.beginPath();
    ctx.arc(x + 81, chao - 36, 17, 0, Math.PI * 2);
    ctx.arc(x + 70, chao - 26, 11, 0, Math.PI * 2);
    ctx.arc(x + 93, chao - 27, 12, 0, Math.PI * 2);
    ctx.fill();
  });

  // Lago congelado, com riscos que rolam junto com o chão
  ctx.fillStyle = cor('--gelo');
  ctx.fillRect(0, chao, w, h - chao);
  ctx.fillStyle = cor('--gelo-linha');
  ctx.fillRect(0, chao, w, 4);
  ctx.strokeStyle = cor('--gelo-linha');
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  faixa(camera, 1, 130, w, (x) => {
    ctx.beginPath();
    ctx.moveTo(x + 10, chao + 22);
    ctx.lineTo(x + 44, chao + 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 76, chao + 40);
    ctx.lineTo(x + 96, chao + 40);
    ctx.stroke();
  });
}

/** Régua em metros no chão. `x0` é onde fica o zero quando a câmera está em 0. */
export function desenharRegua(ctx: Ctx, w: number, h: number, chao: number, camera: number, x0: number, pxPorMetro: number) {
  ctx.font = `600 11px ${cor('--sans')}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const m0 = Math.floor((camera - x0) / pxPorMetro) - 1;
  const m1 = Math.ceil((camera + w - x0) / pxPorMetro) + 1;
  for (let m = m0; m <= m1; m++) {
    const px = x0 + m * pxPorMetro - camera;
    ctx.strokeStyle = cor('--gelo-linha');
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, chao + 4);
    ctx.lineTo(px, chao + (m % 5 === 0 ? 14 : 9));
    ctx.stroke();
    if (m % 5 === 0) {
      ctx.fillStyle = cor('--muted');
      ctx.fillText(`${m} m`, px, h - 10);
    }
  }
}

/** Caixa de madeira com a base em (x, base), lado em pixels e uma etiqueta (por exemplo, "5 kg"). */
export function desenharCaixa(ctx: Ctx, x: number, base: number, lado: number, etiqueta: string) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.beginPath();
  ctx.ellipse(x, base + 3, lado * 0.58, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const x0 = x - lado / 2;
  const y0 = base - lado;
  ctx.fillStyle = cor('--caixa');
  ctx.beginPath();
  ctx.roundRect(x0, y0, lado, lado, 5);
  ctx.fill();
  ctx.strokeStyle = cor('--caixa-esc');
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.roundRect(x0 + 5, y0 + 5, lado - 10, lado - 10, 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x0 + 7, base - 7);
  ctx.lineTo(x0 + lado - 7, y0 + 7);
  ctx.stroke();

  ctx.font = `700 12px ${cor('--sans')}`;
  const tw = ctx.measureText(etiqueta).width + 12;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(x - tw / 2, y0 + lado / 2 - 10, tw, 20, 6);
  ctx.fill();
  ctx.fillStyle = '#22252a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(etiqueta, x, y0 + lado / 2 + 0.5);
}
