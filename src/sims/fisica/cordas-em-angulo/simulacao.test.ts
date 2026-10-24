import { describe, expect, it } from 'vitest';
import { criar, MASSA, passo, resultante } from './simulacao';

describe('cordas em ângulo', () => {
  it('forças perpendiculares: a resultante sai por Pitágoras (3, 4, 5)', () => {
    const r = resultante([
      { F: 30, theta: 0 },
      { F: 40, theta: 90 },
    ]);
    expect(r.F).toBeCloseTo(50, 9);
    expect(r.theta).toBeCloseTo(53.13, 2);
  });

  it('mesma direção e mesmo sentido: as intensidades se somam', () => {
    expect(resultante([{ F: 30, theta: 0 }, { F: 20, theta: 0 }]).F).toBeCloseTo(50, 9);
  });

  it('forças iguais e opostas: resultante zero', () => {
    const r = resultante([{ F: 40, theta: 0 }, { F: 40, theta: 180 }]);
    expect(r.F).toBe(0);
  });

  it('três forças a 120° umas das outras, todas iguais, se anulam', () => {
    const r = resultante([
      { F: 50, theta: 90 },
      { F: 50, theta: 210 },
      { F: 50, theta: 330 },
    ]);
    expect(r.F).toBe(0);
  });

  it('o ângulo da resultante fica entre 0° e 360°', () => {
    expect(resultante([{ F: 10, theta: 0 }, { F: 10, theta: 270 }]).theta).toBeCloseTo(315, 9);
  });

  it('a caixa parte na direção da resultante, com a = Fr / m', () => {
    const s = criar([
      { F: 30, theta: 0 },
      { F: 40, theta: 90 },
    ]);
    const dt = 1 / 1000;
    for (let i = 0; i < 1000; i++) passo(s, dt);
    expect(Math.hypot(s.vx, s.vy)).toBeCloseTo(50 / MASSA, 6);
    expect((Math.atan2(s.y, s.x) * 180) / Math.PI).toBeCloseTo(53.13, 2);
  });

  it('não altera as cordas recebidas', () => {
    const cordas = [{ F: 10, theta: 0 }];
    const s = criar(cordas);
    s.cordas[0].F = 99;
    expect(cordas[0].F).toBe(10);
  });
});
