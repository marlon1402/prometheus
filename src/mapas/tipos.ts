// Formato dos mapas usados pelo componente <Mapa>.

export interface Icone {
  x: number;
  y: number;
  tamanho: number;
  /** Desenho em SVG num quadro de 40×40 centrado em (0, 0). Classes: esc (cheio) e traco (contorno). */
  svg: string;
}

export interface Geometria {
  /** Texto de crédito exibido abaixo do mapa. */
  fonte: string;
  /** Área ocupada pelos contornos: "x y largura altura". */
  viewBox: string;
  /** Contorno de cada região, na ordem de desenho (as de cima por último). */
  regioes: Record<string, string>;
  icones?: Record<string, Icone>;
}
