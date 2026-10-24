import { describe, expect, it } from 'vitest';
import { criar, G, passo, pendurar, peso } from './simulacao';

const assentar = (s: ReturnType<typeof criar>, segundos = 6, dt = 1 / 240) => {
  for (let i = 0; i < segundos / dt; i++) passo(s, dt);
};

describe('dinamômetro', () => {
  it('o peso é m · g', () => {
    expect(peso(0.1)).toBeCloseTo(0.98, 9);
    expect(peso(1)).toBe(G);
  });

  it('começa em equilíbrio e fica parado', () => {
    const s = criar(0.5);
    assentar(s, 1);
    expect(s.x).toBeCloseTo(peso(0.5), 9);
  });

  it('ao trocar o objeto, a mola assenta no novo peso', () => {
    const s = criar(0.1);
    pendurar(s, 1);
    assentar(s);
    expect(s.x).toBeCloseTo(peso(1), 3);
  });

  it('dez vezes mais massa estica dez vezes mais (lei de Hooke)', () => {
    const maca = criar(0.1);
    const garrafa = criar(1);
    assentar(maca);
    assentar(garrafa);
    expect(garrafa.x / maca.x).toBeCloseTo(10, 3);
  });
});
