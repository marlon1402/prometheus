import { describe, expect, it } from 'vitest';
import { acabou, bater, criar, DEFORMACAO, FOLGA, FREIO, frear, kmh, ms, passo } from './simulacao';

const DT = 1 / 2000;
const ate = (s: ReturnType<typeof criar>, fim: () => boolean, max = 20) => {
  for (let t = 0; t < max && !fim(); t += DT) passo(s, DT);
};

describe('carro freando, com e sem cinto', () => {
  it('converte km/h e m/s', () => {
    expect(ms(36)).toBe(10);
    expect(kmh(10)).toBe(36);
  });

  it('andando, carro e boneco seguem juntos', () => {
    const s = criar(ms(50), false);
    for (let i = 0; i < 2000; i++) passo(s, DT);
    expect(s.v).toBe(ms(50));
    expect(s.rel).toBe(0);
  });

  it('a freada para o carro na distância v² / (2a)', () => {
    const s = criar(ms(72), true);
    frear(s);
    ate(s, () => acabou(s));
    expect(s.x).toBeCloseTo(20 ** 2 / (2 * FREIO), 1);
  });

  it('com cinto, o boneco para junto com o carro e não bate', () => {
    for (const acao of [frear, bater]) {
      const s = criar(ms(50), true);
      acao(s);
      ate(s, () => acabou(s));
      expect(s.rel).toBe(0);
      expect(s.impacto).toBeNull();
    }
  });

  it('sem cinto, numa freada, o boneco continua e bate no painel', () => {
    const s = criar(ms(50), false);
    frear(s);
    ate(s, () => acabou(s));
    expect(s.rel).toBe(FOLGA);
    // O carro perde velocidade enquanto o boneco percorre a folga: impacto = √(2 · a · folga).
    expect(s.impacto).toBeCloseTo(Math.sqrt(2 * FREIO * FOLGA), 2);
  });

  it('sem cinto, numa batida, o boneco atinge o painel com a velocidade inteira', () => {
    const s = criar(ms(50), false);
    bater(s);
    ate(s, () => acabou(s));
    expect(s.impacto).toBeCloseTo(ms(50), 6);
  });

  it('na batida, a frente do carro amassa até parar', () => {
    const s = criar(ms(50), true);
    bater(s);
    ate(s, () => acabou(s));
    expect(s.x - s.muro!).toBeCloseTo(DEFORMACAO, 2);
  });

  it('só dá para frear ou bater uma vez', () => {
    const s = criar(ms(50), true);
    frear(s);
    bater(s);
    expect(s.fase).toBe('freando');
    expect(s.muro).toBeNull();
  });
});
