import { describe, expect, it } from 'vitest';
import { apontar, componentes, criar, F_MAX } from './simulacao';

describe('força como vetor', () => {
  it('as componentes são F · cos θ e F · sen θ', () => {
    const { fx, fy } = componentes(criar(100, 60));
    expect(fx).toBeCloseTo(50, 9);
    expect(fy).toBeCloseTo(86.6025, 3);
  });

  it('força horizontal não tem componente vertical, e vice-versa', () => {
    expect(componentes(criar(40, 0))).toEqual({ fx: 40, fy: 0 });
    expect(componentes(criar(40, 90))).toEqual({ fx: 0, fy: 40 });
  });

  it('acima de 90°, a componente horizontal aponta para a esquerda', () => {
    expect(componentes(criar(20, 120)).fx).toBeCloseTo(-10, 9);
  });

  it('as componentes formam um triângulo retângulo com a força (Pitágoras)', () => {
    const s = criar(73, 37);
    const { fx, fy } = componentes(s);
    expect(Math.hypot(fx, fy)).toBeCloseTo(s.F, 9);
  });

  it('arrastar a ponta define intensidade e ângulo', () => {
    const s = criar();
    apontar(s, 60, -60, 2);
    expect(s.theta).toBe(45);
    expect(s.F).toBe(Math.round(Math.hypot(60, 60) / 2));
  });

  it('a seta não passa da intensidade máxima nem aponta para baixo', () => {
    const s = criar();
    apontar(s, 5000, 0, 2);
    expect(s.F).toBe(F_MAX);
    apontar(s, -100, 80, 2);
    expect(s.theta).toBe(180);
    expect(s.F).toBe(50);
  });

  it('com intensidade zero, o ângulo anterior é mantido', () => {
    const s = criar(30, 70);
    apontar(s, 0, 0, 2);
    expect(s.F).toBe(0);
    expect(s.theta).toBe(70);
  });
});
