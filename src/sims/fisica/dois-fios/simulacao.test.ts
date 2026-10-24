import { describe, expect, it } from 'vitest';
import { arrebentados, criar, LIMITE_FIO, limitarAngulo, PESO, tracoes } from './simulacao';

const rad = (g: number) => (g * Math.PI) / 180;

describe('objeto pendurado por dois fios', () => {
  it('fios verticais dividem o peso ao meio', () => {
    const { t1, t2 } = tracoes(criar(90, 90));
    expect(t1).toBeCloseTo(PESO / 2, 9);
    expect(t2).toBeCloseTo(PESO / 2, 9);
  });

  it('fios simétricos: T = P / (2 · sen α)', () => {
    for (const a of [15, 30, 60, 80]) {
      expect(tracoes(criar(a, a)).t1).toBeCloseTo(PESO / (2 * Math.sin(rad(a))), 9);
    }
  });

  it('a 30°, cada fio puxa com o peso inteiro', () => {
    expect(tracoes(criar(30, 30)).t1).toBeCloseTo(PESO, 9);
  });

  it('as trações deixam a resultante no nó igual a zero', () => {
    const s = criar(25, 70);
    const { t1, t2 } = tracoes(s);
    expect(t2 * Math.cos(rad(s.a2)) - t1 * Math.cos(rad(s.a1))).toBeCloseTo(0, 9);
    expect(t1 * Math.sin(rad(s.a1)) + t2 * Math.sin(rad(s.a2)) - PESO).toBeCloseTo(0, 9);
  });

  it('o fio mais em pé segura mais', () => {
    const { t1, t2 } = tracoes(criar(20, 70));
    expect(t2).toBeGreaterThan(t1);
  });

  it('quanto mais horizontais os fios, maiores as trações', () => {
    const abertos = tracoes(criar(10, 10)).t1;
    const fechados = tracoes(criar(60, 60)).t1;
    expect(abertos).toBeGreaterThan(4 * fechados);
  });

  it('avisa quais fios arrebentariam', () => {
    expect(arrebentados(criar(60, 60))).toEqual([]);
    expect(arrebentados(criar(8, 8))).toEqual([1, 2]);
    // 5° e 18°: o fio 2, mais em pé, passa de 100 N (≈ 102 N); o fio 1 fica em ≈ 97 N.
    const s = criar(5, 18);
    expect(tracoes(s).t1).toBeLessThan(LIMITE_FIO);
    expect(arrebentados(s)).toEqual([2]);
  });

  it('os ângulos ficam entre 5° e 85°, inteiros', () => {
    expect(limitarAngulo(2)).toBe(5);
    expect(limitarAngulo(89.6)).toBe(85);
    expect(limitarAngulo(42.4)).toBe(42);
  });
});
