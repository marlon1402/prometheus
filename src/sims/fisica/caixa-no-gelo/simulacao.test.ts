import { describe, expect, it } from 'vitest';
import { avancar } from '../../../kit/passo';
import { aceleracao, criar, empurrar, passo } from './simulacao';

const PASSO = 1 / 120;
const rodar = (s: ReturnType<typeof criar>, segundos: number) => {
  for (let i = 0; i < Math.round(segundos / PASSO); i++) passo(s, PASSO);
};

describe('caixa no gelo', () => {
  it('a aceleração é F / m', () => {
    expect(aceleracao(criar(20, 5))).toBe(4);
    expect(aceleracao(criar(20, 10))).toBe(2);
  });

  it('com força constante, a velocidade cresce linearmente: v = a · t', () => {
    const s = criar(20, 5);
    rodar(s, 2);
    expect(s.t).toBeCloseTo(2, 9);
    expect(s.v).toBeCloseTo(8, 9);
  });

  it('a posição segue x = a · t² / 2 (erro menor que 1%)', () => {
    const s = criar(20, 5);
    rodar(s, 3);
    expect(Math.abs(s.x - 18) / 18).toBeLessThan(0.01);
  });

  it('sem força, a caixa parada continua parada', () => {
    const s = criar(0, 5);
    rodar(s, 5);
    expect(s.x).toBe(0);
    expect(s.v).toBe(0);
  });

  it('depois de um empurrão, a velocidade fica constante (inércia)', () => {
    const s = criar(0, 5);
    empurrar(s, 30, 0.5);
    rodar(s, 0.5);
    expect(s.F).toBe(0);
    expect(s.v).toBeCloseTo((30 / 5) * 0.5, 9);
    const v = s.v;
    rodar(s, 4);
    expect(s.v).toBe(v);
  });

  it('o resultado não depende da taxa de quadros da tela', () => {
    const lento = criar(20, 5);
    const rapido = criar(20, 5);
    let sobraLento = 0;
    let sobraRapido = 0;
    for (let i = 0; i < 60; i++) sobraLento = avancar(sobraLento, 1 / 30, PASSO, (dt) => passo(lento, dt));
    for (let i = 0; i < 288; i++) sobraRapido = avancar(sobraRapido, 1 / 144, PASSO, (dt) => passo(rapido, dt));
    expect(rapido.t).toBeCloseTo(lento.t, 9);
    expect(rapido.x).toBeCloseTo(lento.x, 9);
  });

  it('o gráfico guarda uma amostra a cada 0,05 s', () => {
    const s = criar(10, 1);
    rodar(s, 1);
    expect(s.historico.length).toBeGreaterThanOrEqual(20);
    expect(s.historico.length).toBeLessThanOrEqual(21);
  });
});
