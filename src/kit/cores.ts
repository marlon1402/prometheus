// Cores das simulações vêm dos tokens de tokens.css, então acompanham o tema.
// Os valores ficam em cache e o cache é limpo quando o tema muda.

const cache = new Map<string, string>();
const ouvintes = new Set<() => void>();
let observando = false;

function observar() {
  if (observando) return;
  observando = true;
  const mudou = () => {
    cache.clear();
    for (const ouvinte of ouvintes) ouvinte();
  };
  new MutationObserver(mudou).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', mudou);
}

/** Valor atual de um token de cor, por exemplo cor('--fis-ink'). */
export function cor(nome: string): string {
  observar();
  let valor = cache.get(nome);
  if (valor === undefined) {
    valor = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
    cache.set(nome, valor);
  }
  return valor;
}

/** Chama `ouvinte` sempre que o tema mudar (para redesenhar simulações paradas). */
export function aoMudarTema(ouvinte: () => void) {
  observar();
  ouvintes.add(ouvinte);
}
