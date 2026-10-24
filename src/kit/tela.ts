// Canvas nítido em qualquer tela, com devicePixelRatio limitado a 2
// (acima disso o ganho visual é pequeno e o custo de desenho cresce muito).

export interface Tela {
  ctx: CanvasRenderingContext2D;
  /** Largura e altura em pixels CSS. */
  w: number;
  h: number;
}

interface Opcoes {
  /** Altura fixa em pixels. */
  altura?: number;
  /** Altura proporcional à largura (altura = largura × proporção). */
  proporcao?: number;
  /** Teto da altura quando ela é proporcional. */
  alturaMax?: number;
}

export function criarTela(canvas: HTMLCanvasElement, { altura, proporcao = 1, alturaMax = 620 }: Opcoes = {}): Tela {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D indisponível.');
  const tela: Tela = { ctx, w: 0, h: 0 };

  const ajustar = () => {
    const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 0;
    const h = altura ?? Math.min(w * proporcao, alturaMax);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tela.w = w;
    tela.h = h;
  };

  new ResizeObserver(ajustar).observe(canvas.parentElement ?? canvas);
  ajustar();
  return tela;
}
