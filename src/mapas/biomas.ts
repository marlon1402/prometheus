// Mapa dos biomas do Brasil: contornos (biomas.json), ícones e a miniatura da Home.
// As cores de cada bioma são os tokens --AMZ, --CER etc. em tokens.css.
import dados from './biomas.json';
import { simplificar } from './simplificar';
import type { Geometria } from './tipos';

/**
 * Ícones chapados, desenhados num quadro de 40×40 centrado em (0, 0).
 * `x` e `y` ficam num ponto bem dentro de cada bioma; `tamanho` é a largura final.
 */
const icones: Geometria['icones'] = {
  // Árvore de copa larga
  AMZ: { x: 198, y: 180, tamanho: 46, svg: '<rect class="esc" x="-2.5" y="2" width="5" height="16" rx="2"/><circle class="esc" cx="0" cy="-6" r="12"/><circle class="esc" cx="-10" cy="3" r="9"/><circle class="esc" cx="10" cy="3" r="9"/>' },
  // Árvore retorcida
  CER: { x: 360, y: 234, tamanho: 44, svg: '<path class="traco" stroke-width="4" d="M-2 18C-2 9 4 6 1 -3"/><ellipse class="esc" cx="1" cy="-7" rx="17" ry="7"/><ellipse class="esc" cx="-6" cy="-13" rx="8" ry="4.5"/>' },
  // Cacto
  CAAT: { x: 456, y: 174, tamanho: 42, svg: '<rect class="esc" x="-4.5" y="-17" width="9" height="35" rx="4.5"/><path class="traco grosso" d="M-4 5H-12V-6"/><path class="traco grosso" d="M4 0H12V-11"/>' },
  // Araucária
  MAT: { x: 300, y: 444, tamanho: 36, svg: '<rect class="esc" x="-2" y="-4" width="4" height="22" rx="2"/><path class="esc" d="M-17-2Q0-17 17-2Q0-9-17-2z"/><path class="esc" d="M-12-10Q0-22 12-10Q0-15-12-10z"/>' },
  // Capim
  PMP: { x: 276, y: 498, tamanho: 24, svg: '<path class="esc" d="M-13 14L-8-4L-4 14zM-4 14L0-12L4 14zM4 14L8-3L13 14z"/>' },
  // Ondas
  PTN: { x: 234, y: 312, tamanho: 24, svg: '<path class="traco" stroke-width="4" d="M-16-5q4-6 8 0t8 0t8 0t8 0M-16 6q4-6 8 0t8 0t8 0t8 0"/>' },
};

export const biomas: Geometria = { ...dados, icones };

/** Versão bem simplificada (~7 KB em vez de ~55 KB), para tamanhos pequenos. */
export const biomasMini: Geometria = {
  ...dados,
  regioes: Object.fromEntries(Object.entries(dados.regioes).map(([id, d]) => [id, simplificar(d, 4, 80)])),
};
