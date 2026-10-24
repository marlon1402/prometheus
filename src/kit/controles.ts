// Controles das simulações. O visual dos sliders fica em src/styles/sim.css.

/** Faz o trilho dos sliders acompanhar o valor (a parte preenchida usa a variável --p). */
export function ligarSliders(raiz: ParentNode) {
  const pintar = (el: HTMLInputElement) => {
    const min = Number(el.min || 0);
    const max = Number(el.max || 100);
    el.style.setProperty('--p', `${((Number(el.value) - min) / (max - min)) * 100}%`);
  };
  for (const el of raiz.querySelectorAll<HTMLInputElement>('input[type="range"]')) {
    pintar(el);
    el.addEventListener('input', () => pintar(el));
  }
}
