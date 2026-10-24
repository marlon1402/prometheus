// Dois patinadores parados no gelo se empurram. Pela terceira lei, durante o
// empurrão cada um recebe do outro uma força de mesma intensidade e sentido
// oposto. Pela segunda, cada um acelera segundo a = F / m: quem tem menos massa
// acelera mais. Depois do empurrão, sem atrito, cada um segue com velocidade
// constante, v = F · Δt / m.
// Posições em m (positivas para a direita), velocidades em m/s.

/** Força que cada patinador recebe durante o empurrão, em N. */
export const FORCA = 120;
/** Duração do empurrão, em s. */
export const DURACAO = 0.5;
/** Distância inicial de cada patinador ao centro, em m (mãos encostadas). */
export const AFASTAMENTO = 0.35;

export interface Estado {
  /** Massas do patinador da esquerda (a) e da direita (b), em kg. */
  ma: number;
  mb: number;
  xa: number;
  xb: number;
  va: number;
  vb: number;
  /** Tempo restante do empurrão, em s (0 antes de começar e depois de acabar). */
  empurrao: number;
  /** O empurrão já foi dado. */
  empurrou: boolean;
}

export function criar(ma: number, mb: number): Estado {
  return { ma, mb, xa: -AFASTAMENTO, xb: AFASTAMENTO, va: 0, vb: 0, empurrao: 0, empurrou: false };
}

export function empurrar(s: Estado) {
  if (s.empurrou) return;
  s.empurrou = true;
  s.empurrao = DURACAO;
}

export const empurrando = (s: Estado) => s.empurrao > 0;

/** Velocidade final de cada um depois do empurrão, em m/s (sem sinal). */
export const velocidadeFinal = (m: number) => (FORCA * DURACAO) / m;

export function passo(s: Estado, dt: number) {
  if (empurrando(s)) {
    const t = Math.min(dt, s.empurrao);
    // A esquerda é empurrada para a esquerda, a direita para a direita.
    s.va -= (FORCA / s.ma) * t;
    s.vb += (FORCA / s.mb) * t;
    s.empurrao -= t;
    if (s.empurrao <= 1e-12) s.empurrao = 0;
  }
  s.xa += s.va * dt;
  s.xb += s.vb * dt;
}
