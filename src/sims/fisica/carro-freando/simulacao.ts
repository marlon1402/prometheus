// Carro freando ou batendo, com um boneco no banco.
// Com cinto, o boneco para junto com o carro. Sem cinto, nenhuma força age
// sobre ele (o modelo ignora o atrito com o banco): pela inércia, ele segue
// com a velocidade que tinha até bater no painel, e a batida acontece com a
// diferença entre a velocidade dele e a do carro naquele instante.
// Posições em metros, velocidades em m/s.

/** Desaceleração de uma freada forte, em m/s². */
export const FREIO = 7;
/** Quanto a frente do carro amassa numa batida, em m. A desaceleração é uniforme. */
export const DEFORMACAO = 0.5;
/** Distância entre o boneco e o painel, em m. */
export const FOLGA = 0.6;
/** Distância entre a frente do carro e o muro quando se aperta "Bater", em m. */
export const DISTANCIA_MURO = 20;

export type Fase = 'andando' | 'freando' | 'batendo';

export interface Estado {
  /** Velocidade inicial, em m/s. */
  v0: number;
  cinto: boolean;
  fase: Fase;
  /** Posição da frente do carro e velocidade do carro. */
  x: number;
  v: number;
  /** Posição do muro (só na batida). */
  muro: number | null;
  /** Deslocamento do boneco para a frente, em relação ao banco, e velocidade dele. */
  rel: number;
  vBoneco: number;
  /** Velocidade relativa com que o boneco bateu no painel (sem cinto), ou null. */
  impacto: number | null;
}

export const kmh = (ms: number) => ms * 3.6;
export const ms = (kmh: number) => kmh / 3.6;

export function criar(v0: number, cinto: boolean): Estado {
  return { v0, cinto, fase: 'andando', x: 0, v: v0, muro: null, rel: 0, vBoneco: v0, impacto: null };
}

export function frear(s: Estado) {
  if (s.fase === 'andando') s.fase = 'freando';
}

export function bater(s: Estado) {
  if (s.fase !== 'andando') return;
  s.fase = 'batendo';
  s.muro = s.x + DISTANCIA_MURO;
}

/** O carro já encostou no muro e está amassando. */
export const emContato = (s: Estado) => s.muro !== null && s.x >= s.muro && s.v > 0;

/** Desaceleração atual do carro, em m/s² (positiva quando freia). */
export function desaceleracao(s: Estado) {
  if (s.v <= 0) return 0;
  if (s.fase === 'freando') return FREIO;
  if (emContato(s)) return (s.v0 * s.v0) / (2 * DEFORMACAO);
  return 0;
}

/** Tudo parado: o carro e o boneco. */
export const acabou = (s: Estado) => s.v === 0 && s.vBoneco === 0;

/** O boneco anda junto com o carro: com cinto, ou depois de bater no painel. */
const preso = (s: Estado) => s.cinto || s.impacto !== null;

export function passo(s: Estado, dt: number) {
  // Na batida, o carro anda até o muro e só então começa a amassar.
  s.v = Math.max(0, s.v - desaceleracao(s) * dt);
  s.x += s.v * dt;
  if (s.muro !== null) s.x = Math.min(s.x, s.muro + DEFORMACAO);

  if (preso(s)) {
    s.vBoneco = s.v;
    return;
  }
  // Sem cinto: nenhuma força no boneco, a velocidade dele não muda.
  s.rel += (s.vBoneco - s.v) * dt;
  if (s.rel >= FOLGA) {
    s.rel = FOLGA;
    s.impacto = s.vBoneco - s.v;
    s.vBoneco = s.v;
  }
}
