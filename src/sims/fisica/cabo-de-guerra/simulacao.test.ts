import { describe, expect, it } from 'vitest';
import { aceleracao, criar, descrever, LIMITE, MASSA, passo, resultante, vencedor } from './simulacao';

const correr = (s: ReturnType<typeof criar>, segundos: number, dt = 1 / 120) => {
  for (let i = 0; i < segundos / dt; i++) passo(s, dt);
};

describe('cabo de guerra', () => {
  it('a resultante é a diferença e aponta para o time mais forte', () => {
    expect(resultante(criar(1200, 1000))).toBe(-200);
    expect(resultante(criar(800, 1100))).toBe(300);
  });

  it('descreve a resultante em palavras', () => {
    expect(descrever(-200)).toBe('200 N para a esquerda');
    expect(descrever(1500)).toBe('1.500 N para a direita');
    expect(descrever(0)).toBe('zero');
  });

  it('forças iguais: resultante zero e a corda não sai do lugar', () => {
    const s = criar(1000, 1000);
    correr(s, 10);
    expect(s.x).toBe(0);
    expect(vencedor(s)).toBeNull();
  });

  it('a aceleração é Fr / m', () => {
    expect(aceleracao(criar(1200, 1000))).toBeCloseTo(-200 / MASSA, 12);
  });

  it('o time mais forte vence, e a corda para na marca', () => {
    const s = criar(1200, 1000);
    correr(s, 20);
    expect(vencedor(s)).toBe('esq');
    expect(s.x).toBe(-LIMITE);
    expect(s.v).toBe(0);
  });

  it('com resultante constante, a posição segue x = a · t² / 2', () => {
    const s = criar(1000, 1100);
    correr(s, 2, 1 / 1000);
    expect(s.x).toBeCloseTo((aceleracao(s) * 2 ** 2) / 2, 3);
  });
});
