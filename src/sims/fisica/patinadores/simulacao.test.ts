import { describe, expect, it } from 'vitest';
import { criar, DURACAO, empurrando, empurrar, FORCA, passo, velocidadeFinal } from './simulacao';

const DT = 1 / 240;
const rodar = (s: ReturnType<typeof criar>, segundos: number) => {
  for (let i = 0; i < Math.round(segundos / DT); i++) passo(s, DT);
};

describe('patinadores', () => {
  it('antes do empurrão, ninguém se move', () => {
    const s = criar(80, 40);
    rodar(s, 2);
    expect(s.va).toBe(0);
    expect(s.vb).toBe(0);
  });

  it('o empurrão dura meio segundo', () => {
    const s = criar(80, 40);
    empurrar(s);
    rodar(s, DURACAO - 0.1);
    expect(empurrando(s)).toBe(true);
    rodar(s, 0.2);
    expect(empurrando(s)).toBe(false);
  });

  it('os dois se afastam, e quem tem metade da massa sai com o dobro da velocidade', () => {
    const s = criar(80, 40);
    empurrar(s);
    rodar(s, 2);
    expect(s.va).toBeLessThan(0);
    expect(s.vb).toBeGreaterThan(0);
    expect(s.vb / -s.va).toBeCloseTo(2, 9);
  });

  it('a velocidade final é F · Δt / m', () => {
    const s = criar(80, 40);
    empurrar(s);
    rodar(s, 2);
    expect(s.vb).toBeCloseTo((FORCA * DURACAO) / 40, 9);
    expect(-s.va).toBeCloseTo(velocidadeFinal(80), 9);
  });

  it('massas iguais: velocidades iguais, em sentidos opostos', () => {
    const s = criar(60, 60);
    empurrar(s);
    rodar(s, 2);
    expect(s.va).toBeCloseTo(-s.vb, 12);
  });

  it('forças iguais e opostas: m · v dos dois somam zero', () => {
    const s = criar(95, 35);
    empurrar(s);
    rodar(s, 3);
    expect(s.ma * s.va + s.mb * s.vb).toBeCloseTo(0, 9);
  });

  it('só empurra uma vez', () => {
    const s = criar(80, 40);
    empurrar(s);
    rodar(s, 1);
    const v = s.vb;
    empurrar(s);
    rodar(s, 1);
    expect(s.vb).toBe(v);
  });
});
