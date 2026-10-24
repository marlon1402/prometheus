// Interação do <Mapa>: escolher uma região pelo mapa ou pelas abas.

const movimentoReduzido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function iniciarMapa(raiz: HTMLElement) {
  const caixa = raiz.querySelector<HTMLElement>('.mc-caixa')!;
  const dica = raiz.querySelector<HTMLElement>('.mc-dica')!;
  const lista = raiz.querySelector<HTMLElement>('.mc-abas')!;
  const abas = [...lista.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const regioes = [...raiz.querySelectorAll<SVGGElement>('.mc-regiao')];
  const blocos = [...raiz.querySelectorAll<HTMLElement>('.mc-bloco')];
  let escolhida: string | null = null;

  const mostrar = (id: string) => {
    for (const bloco of blocos) bloco.classList.toggle('ativa', bloco.dataset.regiao === id);
  };

  function escolher(id: string) {
    if (id === escolhida) return;
    const primeira = escolhida === null;
    escolhida = id;
    raiz.classList.add('tem-escolha');
    for (const g of regioes) g.classList.toggle('escolhida', g.dataset.id === id);
    for (const aba of abas) {
      const sim = aba.dataset.id === id;
      aba.setAttribute('aria-selected', String(sim));
      aba.tabIndex = sim ? 0 : -1;
      // Rola só a faixa de abas (nunca a página) para mostrar a aba escolhida.
      if (sim && lista.scrollWidth > lista.clientWidth) {
        lista.scrollLeft = aba.offsetLeft - (lista.clientWidth - aba.offsetWidth) / 2;
      }
    }
    if (primeira || movimentoReduzido()) return mostrar(id);
    raiz.classList.add('trocando');
    setTimeout(() => {
      mostrar(id);
      raiz.classList.remove('trocando');
    }, 180);
  }

  for (const g of regioes) {
    const nome = g.getAttribute('aria-label') ?? '';
    g.addEventListener('click', () => escolher(g.dataset.id!));
    g.addEventListener('pointermove', (e) => {
      const r = caixa.getBoundingClientRect();
      dica.textContent = nome;
      dica.style.left = `${e.clientX - r.left}px`;
      dica.style.top = `${e.clientY - r.top}px`;
      dica.classList.add('visivel');
    });
    g.addEventListener('pointerleave', () => dica.classList.remove('visivel'));
  }

  // Abas: clique, setas, Home e End (padrão de abas acessíveis).
  for (const aba of abas) aba.addEventListener('click', () => escolher(aba.dataset.id!));
  lista.addEventListener('keydown', (e) => {
    const teclas = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!teclas.includes(e.key)) return;
    e.preventDefault();
    const n = abas.length;
    const atual = Math.max(0, abas.findIndex((a) => a.dataset.id === escolhida));
    const j = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (atual + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
    escolher(abas[j].dataset.id!);
    abas[j].focus();
  });
}
