import { describe, expect, it } from 'vitest';
import { avancar, DT_MAX, limitarDt } from './passo';

describe('passo fixo', () => {
  it('limita o intervalo entre quadros', () => {
    expect(limitarDt(-1)).toBe(0);
    expect(limitarDt(0.016)).toBe(0.016);
    expect(limitarDt(3)).toBe(DT_MAX);
  });

  it('divide o tempo em passos iguais e guarda a sobra', () => {
    const passos: number[] = [];
    const sobra = avancar(0, 0.025, 0.01, (p) => passos.push(p));
    expect(passos).toEqual([0.01, 0.01]);
    expect(sobra).toBeCloseTo(0.005, 12);
  });

  it('a sobra é usada no quadro seguinte', () => {
    let n = 0;
    let sobra = avancar(0, 0.015, 0.01, () => n++);
    sobra = avancar(sobra, 0.006, 0.01, () => n++);
    expect(n).toBe(2);
    expect(sobra).toBeCloseTo(0.001, 12);
  });
});
