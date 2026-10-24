import { describe, expect, it } from 'vitest';
import biomas from './biomas.json';
import { area, douglasPeucker, escreverCaminho, lerCaminho, simplificar } from './simplificar';

describe('simplificação de contornos', () => {
  it('lê e reescreve um caminho sem perder pontos', () => {
    const d = 'M0,0L10,0L10,10Z M20,20L30,20L30,30Z';
    expect(lerCaminho(d)).toEqual([
      [[0, 0], [10, 0], [10, 10]],
      [[20, 20], [30, 20], [30, 30]],
    ]);
    expect(escreverCaminho(lerCaminho(d))).toBe('M0,0L10,0L10,10ZM20,20L30,20L30,30Z');
  });

  it('calcula a área de um quadrado', () => {
    expect(area([[0, 0], [10, 0], [10, 10], [0, 10]])).toBe(100);
  });

  it('remove pontos quase alinhados e mantém os cantos', () => {
    const linha: [number, number][] = [[0, 0], [5, 0.1], [10, 0], [10, 10]];
    expect(douglasPeucker(linha, 0.5)).toEqual([[0, 0], [10, 0], [10, 10]]);
  });

  it('a miniatura dos biomas fica bem menor e mantém a forma (área quase igual)', () => {
    for (const [id, d] of Object.entries(biomas.regioes)) {
      const mini = simplificar(d, 4, 80);
      expect(mini.length, id).toBeLessThan(d.length / 3);
      const somaArea = (c: string) => lerCaminho(c).reduce((s, anel) => s + area(anel), 0);
      expect(Math.abs(somaArea(mini) - somaArea(d)) / somaArea(d), id).toBeLessThan(0.05);
    }
  });
});
