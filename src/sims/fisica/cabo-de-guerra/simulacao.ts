// Cabo de guerra: dois times puxam a mesma corda em sentidos opostos.
// A resultante é a diferença entre as duas forças e aponta para o lado do
// time mais forte. O conjunto (times e corda) acelera segundo a = Fr / m.
// Um time vence quando a fita do meio da corda passa da marca do lado dele.
import { fmt } from '../../../kit/formato';

/** Massa do conjunto que se move junto, os dois times e a corda, em kg. */
export const MASSA = 500;
/** Distância da marca de vitória ao centro, em m. */
export const LIMITE = 1.5;

export interface Estado {
  /** Forças dos times da esquerda e da direita, em N. */
  esq: number;
  dir: number;
  /** Posição da fita (positiva para a direita), em m, e velocidade, em m/s. */
  x: number;
  v: number;
}

export function criar(esq = 1000, dir = 1000): Estado {
  return { esq, dir, x: 0, v: 0 };
}

/** Resultante sobre a corda, positiva para a direita, em N. */
export const resultante = (s: Estado) => s.dir - s.esq;

export const aceleracao = (s: Estado) => resultante(s) / MASSA;

/** A resultante em palavras, para a leitura abaixo da simulação: “200 N para a esquerda”. */
export function descrever(fr: number) {
  if (fr === 0) return 'zero';
  return `${fmt(Math.abs(fr), 0)} N para a ${fr < 0 ? 'esquerda' : 'direita'}`;
}

export function vencedor(s: Estado): 'esq' | 'dir' | null {
  if (s.x <= -LIMITE) return 'esq';
  if (s.x >= LIMITE) return 'dir';
  return null;
}

export function passo(s: Estado, dt: number) {
  if (vencedor(s)) return;
  s.v += aceleracao(s) * dt;
  s.x = Math.max(-LIMITE, Math.min(LIMITE, s.x + s.v * dt));
  if (vencedor(s)) s.v = 0;
}
