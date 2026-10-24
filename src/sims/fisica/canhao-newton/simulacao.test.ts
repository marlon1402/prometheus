import { describe, expect, it } from 'vitest';
import { disparar, energia, passo, R, R0, trajetoria } from './simulacao';

const voar = (v: number, segundos = 20000) => {
  const b = disparar(v);
  while (!b.fim && b.orbita === null && b.t < segundos) passo(b, 15);
  return b;
};

describe('canhão de Newton', () => {
  it('devagar, a bala cai perto do canhão', () => {
    const b = voar(1000);
    expect(b.fim?.tipo).toBe('chao');
    if (b.fim?.tipo === 'chao') expect(b.fim.distancia).toBeLessThan(500e3);
  });

  it('mais rápido, a bala cai mais longe', () => {
    const distancia = (v: number) => {
      const b = voar(v);
      return b.fim?.tipo === 'chao' ? b.fim.distancia : Infinity;
    };
    expect(distancia(6600)).toBeGreaterThan(distancia(5600));
    expect(distancia(7200)).toBeGreaterThan(distancia(6600));
  });

  it('perto de 7,8 km/s, a bala entra em órbita (completa uma volta sem cair)', () => {
    const b = voar(7820);
    expect(b.fim).toBeNull();
    expect(b.orbita).not.toBeNull();
    // Período de uma órbita baixa: cerca de 1 h 28 min.
    expect(b.orbita! / 60).toBeGreaterThan(80);
    expect(b.orbita! / 60).toBeLessThan(100);
  });

  it('acima da velocidade de escape (~11 km/s a 150 km), a bala vai embora', () => {
    const b = voar(11500, 400000);
    expect(b.fim?.tipo).toBe('escapou');
  });

  it('a energia mecânica se conserva ao longo de uma órbita (erro < 0,1%)', () => {
    const b = disparar(7820);
    const e0 = energia(b);
    passo(b, 5400);
    expect(Math.abs((energia(b) - e0) / e0)).toBeLessThan(0.001);
  });

  it('em órbita, a distância ao centro da Terra fica entre o chão e um pouco acima do canhão', () => {
    const b = disparar(7820);
    let rMin = Infinity;
    let rMax = 0;
    while (b.orbita === null && !b.fim) {
      passo(b, 15);
      const r = Math.hypot(b.x, b.y);
      rMin = Math.min(rMin, r);
      rMax = Math.max(rMax, r);
    }
    expect(rMin).toBeGreaterThan(R);
    expect(rMax).toBeLessThan(R0 * 1.05);
  });

  it('a trajetória pré-calculada começa no canhão e termina no chão para disparos lentos', () => {
    const pts = trajetoria(5600);
    expect(pts[0]).toEqual([0, R0]);
    const [x, y] = pts[pts.length - 1];
    expect(Math.hypot(x, y)).toBeLessThanOrEqual(R);
  });
});
