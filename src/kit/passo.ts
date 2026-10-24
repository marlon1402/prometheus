// Passo de tempo fixo: a física avança sempre em fatias iguais, então dá o
// mesmo resultado em qualquer tela, com 30 ou 144 quadros por segundo.

/** Maior intervalo aceito entre dois quadros, em segundos. Evita “teleportes” depois de travadas. */
export const DT_MAX = 0.05;

/** Limita o intervalo entre quadros a [0, DT_MAX]. */
export const limitarDt = (dt: number) => Math.min(Math.max(0, dt), DT_MAX);

/**
 * Avança `atualizar` em passos de tamanho `passo` cobrindo `dt` mais o que sobrou
 * do quadro anterior. Devolve a sobra, que deve ser passada no próximo quadro.
 */
export function avancar(sobra: number, dt: number, passo: number, atualizar: (passo: number) => void): number {
  let acumulado = sobra + dt;
  // A tolerância evita perder um passo por erro de arredondamento (por exemplo, somando 1/144).
  while (acumulado >= passo - 1e-9) {
    atualizar(passo);
    acumulado -= passo;
  }
  return acumulado;
}
