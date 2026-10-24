// Simplificação de contornos SVG (só comandos M, L e Z), usada no build para
// gerar versões leves de um mapa, como a miniatura dos biomas na Home.

type Ponto = [number, number];

/** Separa um caminho "M x,y L x,y … Z" em anéis de pontos. */
export function lerCaminho(d: string): Ponto[][] {
  return d
    .split('M')
    .filter((parte) => parte.trim())
    .map((parte) =>
      parte
        .replace(/Z/gi, '')
        .split('L')
        .map((par) => par.trim().split(/[\s,]+/).map(Number) as Ponto),
    );
}

export function escreverCaminho(aneis: Ponto[][], casas = 1): string {
  const f = (n: number) => Number(n.toFixed(casas));
  return aneis.map((anel) => `M${anel.map(([x, y]) => `${f(x)},${f(y)}`).join('L')}Z`).join('');
}

/** Área de um anel (fórmula do laço), em unidades do desenho. */
export function area(anel: Ponto[]): number {
  let soma = 0;
  for (let i = 0; i < anel.length; i++) {
    const [x1, y1] = anel[i];
    const [x2, y2] = anel[(i + 1) % anel.length];
    soma += x1 * y2 - x2 * y1;
  }
  return Math.abs(soma) / 2;
}

function distanciaAoSegmento([px, py]: Ponto, [ax, ay]: Ponto, [bx, by]: Ponto): number {
  const dx = bx - ax;
  const dy = by - ay;
  const comprimento2 = dx * dx + dy * dy;
  const t = comprimento2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / comprimento2)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Douglas-Peucker: remove pontos que se afastam menos que `tolerancia` da linha simplificada. */
export function douglasPeucker(pontos: Ponto[], tolerancia: number): Ponto[] {
  if (pontos.length < 3) return pontos;
  const manter = new Uint8Array(pontos.length);
  manter[0] = manter[pontos.length - 1] = 1;
  const pilha: [number, number][] = [[0, pontos.length - 1]];
  while (pilha.length) {
    const [ini, fim] = pilha.pop()!;
    let maior = 0;
    let indice = -1;
    for (let i = ini + 1; i < fim; i++) {
      const d = distanciaAoSegmento(pontos[i], pontos[ini], pontos[fim]);
      if (d > maior) {
        maior = d;
        indice = i;
      }
    }
    if (maior > tolerancia) {
      manter[indice] = 1;
      pilha.push([ini, indice], [indice, fim]);
    }
  }
  return pontos.filter((_, i) => manter[i]);
}

/**
 * Simplifica um caminho: aplica Douglas-Peucker em cada anel e descarta anéis
 * (ilhas e buracos) menores que `areaMinima`.
 */
export function simplificar(d: string, tolerancia: number, areaMinima = 0): string {
  const aneis = lerCaminho(d)
    .filter((anel) => area(anel) >= areaMinima)
    .map((anel) => douglasPeucker(anel, tolerancia))
    .filter((anel) => anel.length >= 3);
  return escreverCaminho(aneis);
}
